"""Services for Notchi Windows - socket server, hook installer, state machine, session store."""

import json
import os
import socket
import sys
import threading
import time
import logging
from pathlib import Path
from typing import Callable, Optional

from .models import (
    HookEvent, NotchiTask, SessionData, EmotionState, NotchiEmotion
)

logger = logging.getLogger("notchi")

# ─── Constants ────────────────────────────────────────────────────────────────

SOCKET_HOST = "127.0.0.1"
SOCKET_PORT = 19019
PIPE_NAME = r"\\.\pipe\notchi"


# ─── SocketServer (TCP on localhost) ──────────────────────────────────────────

class SocketServer:
    """Listens for hook events via TCP on localhost."""

    def __init__(self, on_event: Callable[[HookEvent], None]):
        self.on_event = on_event
        self._server_socket: Optional[socket.socket] = None
        self._running = False
        self._thread: Optional[threading.Thread] = None

    def start(self):
        self._running = True
        self._thread = threading.Thread(target=self._run, daemon=True)
        self._thread.start()
        logger.info(f"Socket server started on {SOCKET_HOST}:{SOCKET_PORT}")

    def stop(self):
        self._running = False
        if self._server_socket:
            try:
                self._server_socket.close()
            except OSError:
                pass

    def _run(self):
        self._server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self._server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        try:
            self._server_socket.bind((SOCKET_HOST, SOCKET_PORT))
        except OSError as e:
            logger.error(f"Failed to bind socket: {e}")
            return

        self._server_socket.listen(10)
        self._server_socket.settimeout(1.0)

        while self._running:
            try:
                client, addr = self._server_socket.accept()
                threading.Thread(
                    target=self._handle_client, args=(client,), daemon=True
                ).start()
            except socket.timeout:
                continue
            except OSError:
                break

    def _handle_client(self, client_socket: socket.socket):
        try:
            data = b""
            while True:
                chunk = client_socket.recv(4096)
                if not chunk:
                    break
                data += chunk

            if not data:
                return

            event_data = json.loads(data.decode("utf-8"))
            event = HookEvent.from_json(event_data)
            self._log_event(event)
            self.on_event(event)

        except (json.JSONDecodeError, UnicodeDecodeError) as e:
            logger.warning(f"Failed to parse event: {e}")
        except Exception as e:
            logger.error(f"Error handling client: {e}")
        finally:
            client_socket.close()

    def _log_event(self, event: HookEvent):
        match event.event:
            case "SessionStart":
                logger.info(f"[{event.session_id[:8]}] Session started")
            case "SessionEnd":
                logger.info(f"[{event.session_id[:8]}] Session ended")
            case "PreToolUse":
                logger.info(f"[{event.session_id[:8]}] Tool: {event.tool or 'unknown'}")
            case "PostToolUse":
                ok = "OK" if event.status != "error" else "ERR"
                logger.info(f"[{event.session_id[:8]}] Result: {ok} {event.tool or 'unknown'}")
            case "Stop" | "SubagentStop":
                logger.info(f"[{event.session_id[:8]}] Done")


# ─── SessionStore ─────────────────────────────────────────────────────────────

class SessionStore:
    """Manages active Claude Code sessions."""

    LOCAL_SLASH_COMMANDS = {
        "/clear", "/help", "/cost", "/status",
        "/vim", "/fast", "/model", "/login", "/logout",
    }

    def __init__(self):
        self.sessions: dict[str, SessionData] = {}
        self.selected_session_id: Optional[str] = None
        self._next_number_by_project: dict[str, int] = {}

    @property
    def active_count(self) -> int:
        return len(self.sessions)

    @property
    def effective_session(self) -> Optional[SessionData]:
        if self.selected_session_id and self.selected_session_id in self.sessions:
            return self.sessions[self.selected_session_id]
        if len(self.sessions) == 1:
            return next(iter(self.sessions.values()))
        if self.sessions:
            return max(self.sessions.values(), key=lambda s: s.last_activity)
        return None

    @property
    def sorted_sessions(self) -> list[SessionData]:
        return sorted(
            self.sessions.values(),
            key=lambda s: (not s.is_processing, -s.last_activity),
        )

    def process(self, event: HookEvent) -> SessionData:
        is_interactive = event.interactive if event.interactive is not None else True
        session = self._get_or_create(event.session_id, event.cwd, is_interactive)
        is_processing = event.status != "waiting_for_input"
        session.update_processing_state(is_processing)

        if event.permission_mode:
            session.update_permission_mode(event.permission_mode)

        match event.event:
            case "UserPromptSubmit":
                if event.user_prompt:
                    session.record_user_prompt(event.user_prompt)
                if self._is_local_slash(event.user_prompt):
                    session.update_task(NotchiTask.IDLE)
                else:
                    session.update_task(NotchiTask.WORKING)

            case "PreCompact":
                session.update_task(NotchiTask.COMPACTING)

            case "SessionStart":
                if is_processing:
                    session.update_task(NotchiTask.WORKING)

            case "PreToolUse":
                if event.tool == "AskUserQuestion":
                    session.update_task(NotchiTask.WAITING)
                else:
                    session.update_task(NotchiTask.WORKING)

            case "PermissionRequest":
                session.update_task(NotchiTask.WAITING)

            case "PostToolUse":
                session.update_task(NotchiTask.WORKING)

            case "Stop" | "SubagentStop":
                session.update_task(NotchiTask.IDLE)

            case "SessionEnd":
                session.end_session()
                self._remove_session(event.session_id)

            case _:
                if not is_processing and session.task != NotchiTask.IDLE:
                    session.update_task(NotchiTask.IDLE)

        return session

    def _get_or_create(self, session_id: str, cwd: str, is_interactive: bool) -> SessionData:
        if session_id in self.sessions:
            return self.sessions[session_id]

        project_name = os.path.basename(cwd) if cwd else "unknown"
        num = self._next_number_by_project.get(project_name, 0) + 1
        self._next_number_by_project[project_name] = num

        existing_x = [s.sprite_x_position for s in self.sessions.values()]
        session = SessionData(session_id, cwd, num, is_interactive, existing_x)
        self.sessions[session_id] = session
        logger.info(f"Created session #{num}: {session_id[:8]} at {cwd}")

        if self.active_count == 1:
            self.selected_session_id = session_id
        else:
            self.selected_session_id = None

        return session

    def _remove_session(self, session_id: str):
        self.sessions.pop(session_id, None)
        if self.selected_session_id == session_id:
            self.selected_session_id = None
        if self.active_count == 1:
            self.selected_session_id = next(iter(self.sessions.keys()), None)

    def dismiss_session(self, session_id: str):
        if session_id in self.sessions:
            self.sessions[session_id].end_session()
            self._remove_session(session_id)

    @classmethod
    def _is_local_slash(cls, prompt: Optional[str]) -> bool:
        if not prompt or not prompt.startswith("/"):
            return False
        command = prompt.split()[0] if prompt.split() else prompt
        return command in cls.LOCAL_SLASH_COMMANDS


# ─── StateMachine ─────────────────────────────────────────────────────────────

class NotchiStateMachine:
    """Processes hook events and updates session states."""

    SLEEP_DELAY = 300  # seconds

    def __init__(self, session_store: SessionStore, on_state_change: Optional[Callable] = None):
        self.session_store = session_store
        self.on_state_change = on_state_change
        self._sleep_timers: dict[str, threading.Timer] = {}
        self._emotion_decay_thread: Optional[threading.Thread] = None
        self._running = True
        self._start_emotion_decay()

    def handle_event(self, event: HookEvent):
        session = self.session_store.process(event)

        if event.event == "SessionEnd":
            self._cancel_sleep_timer(event.session_id)
            if self.on_state_change:
                self.on_state_change()
            return

        # Reset sleep timer
        self._reset_sleep_timer(event.session_id)

        if self.on_state_change:
            self.on_state_change()

    def stop(self):
        self._running = False
        for timer in self._sleep_timers.values():
            timer.cancel()
        self._sleep_timers.clear()

    def _reset_sleep_timer(self, session_id: str):
        self._cancel_sleep_timer(session_id)
        timer = threading.Timer(self.SLEEP_DELAY, self._on_sleep, args=[session_id])
        timer.daemon = True
        timer.start()
        self._sleep_timers[session_id] = timer

    def _cancel_sleep_timer(self, session_id: str):
        timer = self._sleep_timers.pop(session_id, None)
        if timer:
            timer.cancel()

    def _on_sleep(self, session_id: str):
        if session_id in self.session_store.sessions:
            self.session_store.sessions[session_id].update_task(NotchiTask.SLEEPING)
            if self.on_state_change:
                self.on_state_change()

    def _start_emotion_decay(self):
        def decay_loop():
            while self._running:
                time.sleep(EmotionState.DECAY_INTERVAL)
                if not self._running:
                    break
                for session in self.session_store.sessions.values():
                    session.emotion_state.decay_all()
                if self.on_state_change:
                    self.on_state_change()

        self._emotion_decay_thread = threading.Thread(target=decay_loop, daemon=True)
        self._emotion_decay_thread.start()


# ─── EmotionAnalyzer ──────────────────────────────────────────────────────────

class EmotionAnalyzer:
    """Analyzes prompt sentiment using the Anthropic API."""

    API_URL = "https://api.anthropic.com/v1/messages"
    MODEL = "claude-haiku-4-5-20251001"
    SYSTEM_PROMPT = (
        "Classify the emotional tone of the user's message into exactly one emotion and an intensity score.\n"
        "Emotions: happy, sad, neutral.\n"
        "Happy: explicit praise, gratitude, celebration, positive profanity.\n"
        "Sad: frustration, anger, insults, complaints, feeling stuck, disappointment.\n"
        "Neutral: instructions, requests, task descriptions, questions, factual statements.\n"
        "Default to neutral when unsure. Most coding instructions are neutral.\n"
        "Intensity: 0.0 (barely noticeable) to 1.0 (very strong).\n"
        'Reply with ONLY valid JSON: {"emotion": "...", "intensity": ...}'
    )

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key

    def analyze(self, prompt: str) -> tuple[str, float]:
        if not self.api_key:
            return ("neutral", 0.0)

        try:
            import requests
            resp = requests.post(
                self.API_URL,
                headers={
                    "x-api-key": self.api_key,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json",
                },
                json={
                    "model": self.MODEL,
                    "max_tokens": 50,
                    "system": self.SYSTEM_PROMPT,
                    "messages": [{"role": "user", "content": prompt}],
                },
                timeout=10,
            )

            if resp.status_code != 200:
                logger.warning(f"Emotion API returned {resp.status_code}")
                return ("neutral", 0.0)

            data = resp.json()
            text = data.get("content", [{}])[0].get("text", "")

            # Extract JSON from response
            import re
            match = re.search(r"\{[^}]+\}", text)
            if match:
                result = json.loads(match.group())
                emotion = result.get("emotion", "neutral")
                if emotion not in ("happy", "sad", "neutral"):
                    emotion = "neutral"
                intensity = max(0.0, min(1.0, float(result.get("intensity", 0.0))))
                return (emotion, intensity)

        except Exception as e:
            logger.error(f"Emotion analysis failed: {e}")

        return ("neutral", 0.0)


# ─── HookInstaller ────────────────────────────────────────────────────────────

class HookInstaller:
    """Installs Claude Code hooks for Windows."""

    @staticmethod
    def get_claude_dir() -> Path:
        return Path.home() / ".claude"

    @staticmethod
    def get_hooks_dir() -> Path:
        return HookInstaller.get_claude_dir() / "hooks"

    @staticmethod
    def get_hook_script_path() -> Path:
        return HookInstaller.get_hooks_dir() / "notchi-hook.ps1"

    @staticmethod
    def get_settings_path() -> Path:
        return HookInstaller.get_claude_dir() / "settings.json"

    @staticmethod
    def install() -> bool:
        claude_dir = HookInstaller.get_claude_dir()
        if not claude_dir.exists():
            logger.warning("Claude Code not installed (~/.claude not found)")
            return False

        hooks_dir = HookInstaller.get_hooks_dir()
        hooks_dir.mkdir(parents=True, exist_ok=True)

        # Write the PowerShell hook script
        hook_script = HookInstaller.get_hook_script_path()
        hook_content = _generate_hook_script()
        hook_script.write_text(hook_content, encoding="utf-8")
        logger.info(f"Installed hook script to {hook_script}")

        # Also write a .cmd wrapper for compatibility
        cmd_wrapper = hooks_dir / "notchi-hook.cmd"
        cmd_content = (
            '@echo off\n'
            f'powershell.exe -NoProfile -ExecutionPolicy Bypass -File "{hook_script}" < CON\n'
        )
        # Actually for piped stdin we need a different approach
        cmd_content = (
            '@echo off\n'
            f'powershell.exe -NoProfile -ExecutionPolicy Bypass -File "{hook_script}"\n'
        )
        cmd_wrapper.write_text(cmd_content, encoding="utf-8")

        # Update settings.json
        return HookInstaller._update_settings()

    @staticmethod
    def _update_settings() -> bool:
        settings_path = HookInstaller.get_settings_path()

        settings: dict = {}
        if settings_path.exists():
            try:
                settings = json.loads(settings_path.read_text(encoding="utf-8"))
            except (json.JSONDecodeError, OSError):
                pass

        hook_script = str(HookInstaller.get_hook_script_path()).replace("\\", "/")
        command = f"powershell.exe -NoProfile -ExecutionPolicy Bypass -File \"{hook_script}\""

        hook_entry = [{"type": "command", "command": command}]
        with_matcher = [{"matcher": "*", "hooks": hook_entry}]
        without_matcher = [{"hooks": hook_entry}]
        pre_compact_config = [
            {"matcher": "auto", "hooks": hook_entry},
            {"matcher": "manual", "hooks": hook_entry},
        ]

        hooks = settings.get("hooks", {})

        hook_events = [
            ("UserPromptSubmit", without_matcher),
            ("SessionStart", without_matcher),
            ("PreToolUse", with_matcher),
            ("PostToolUse", with_matcher),
            ("PermissionRequest", with_matcher),
            ("PreCompact", pre_compact_config),
            ("Stop", without_matcher),
            ("SubagentStop", without_matcher),
            ("SessionEnd", without_matcher),
        ]

        for event_name, config in hook_events:
            if event_name in hooks:
                existing = hooks[event_name]
                has_our_hook = any(
                    any(
                        "notchi-hook" in (h.get("command", ""))
                        for h in entry.get("hooks", [])
                    )
                    for entry in existing
                )
                if not has_our_hook:
                    existing.extend(config)
            else:
                hooks[event_name] = config

        settings["hooks"] = hooks

        try:
            settings_path.write_text(
                json.dumps(settings, indent=2, sort_keys=True),
                encoding="utf-8",
            )
            logger.info("Updated settings.json with Notchi hooks")
            return True
        except OSError as e:
            logger.error(f"Failed to write settings.json: {e}")
            return False

    @staticmethod
    def is_installed() -> bool:
        settings_path = HookInstaller.get_settings_path()
        if not settings_path.exists():
            return False
        try:
            settings = json.loads(settings_path.read_text(encoding="utf-8"))
            hooks = settings.get("hooks", {})
            for entries in hooks.values():
                if isinstance(entries, list):
                    for entry in entries:
                        for h in entry.get("hooks", []):
                            if "notchi-hook" in h.get("command", ""):
                                return True
        except (json.JSONDecodeError, OSError):
            pass
        return False

    @staticmethod
    def uninstall():
        # Remove hook script
        hook_script = HookInstaller.get_hook_script_path()
        if hook_script.exists():
            hook_script.unlink()

        cmd_wrapper = HookInstaller.get_hooks_dir() / "notchi-hook.cmd"
        if cmd_wrapper.exists():
            cmd_wrapper.unlink()

        # Clean settings.json
        settings_path = HookInstaller.get_settings_path()
        if not settings_path.exists():
            return

        try:
            settings = json.loads(settings_path.read_text(encoding="utf-8"))
            hooks = settings.get("hooks", {})

            for event_name in list(hooks.keys()):
                entries = hooks[event_name]
                if isinstance(entries, list):
                    entries = [
                        e for e in entries
                        if not any(
                            "notchi-hook" in h.get("command", "")
                            for h in e.get("hooks", [])
                        )
                    ]
                    if entries:
                        hooks[event_name] = entries
                    else:
                        del hooks[event_name]

            if hooks:
                settings["hooks"] = hooks
            else:
                settings.pop("hooks", None)

            settings_path.write_text(
                json.dumps(settings, indent=2, sort_keys=True),
                encoding="utf-8",
            )
            logger.info("Uninstalled Notchi hooks")
        except (json.JSONDecodeError, OSError) as e:
            logger.error(f"Failed to clean settings: {e}")


def _generate_hook_script() -> str:
    """Generate the PowerShell hook script content."""
    return r'''# Notchi Hook - forwards Claude Code events to Notchi app via TCP socket
# Auto-generated by Notchi for Windows

$ErrorActionPreference = "SilentlyContinue"

$NOTCHI_HOST = "127.0.0.1"
$NOTCHI_PORT = 19019

# Read stdin
$inputText = [Console]::In.ReadToEnd()
if (-not $inputText) { exit 0 }

try {
    $inputData = $inputText | ConvertFrom-Json
} catch {
    exit 0
}

$hookEvent = $inputData.hook_event_name
if (-not $hookEvent) { $hookEvent = "" }

$statusMap = @{
    "UserPromptSubmit"  = "processing"
    "PreCompact"        = "compacting"
    "SessionStart"      = "waiting_for_input"
    "SessionEnd"        = "ended"
    "PreToolUse"        = "running_tool"
    "PostToolUse"       = "processing"
    "PermissionRequest" = "waiting_for_input"
    "Stop"              = "waiting_for_input"
    "SubagentStop"      = "waiting_for_input"
}

$status = if ($inputData.status) { $inputData.status } else { $statusMap[$hookEvent] }
if (-not $status) { $status = "unknown" }

$output = @{
    session_id      = if ($inputData.session_id) { $inputData.session_id } else { "" }
    cwd             = if ($inputData.cwd) { $inputData.cwd } else { "" }
    event           = $hookEvent
    status          = $status
    pid             = $null
    tty             = $null
    interactive     = $true
    permission_mode = if ($inputData.permission_mode) { $inputData.permission_mode } else { "default" }
}

# Pass user prompt for UserPromptSubmit
if ($hookEvent -eq "UserPromptSubmit" -and $inputData.prompt) {
    $output["user_prompt"] = $inputData.prompt
}

# Pass tool info
if ($inputData.tool_name) {
    $output["tool"] = $inputData.tool_name
}
if ($inputData.tool_use_id) {
    $output["tool_use_id"] = $inputData.tool_use_id
}
if ($inputData.tool_input) {
    $output["tool_input"] = $inputData.tool_input
}

# Detect non-interactive sessions
$parentProcess = Get-Process -Id $PID -ErrorAction SilentlyContinue
if ($parentProcess) {
    $cmdLine = (Get-CimInstance Win32_Process -Filter "ProcessId=$PID" -ErrorAction SilentlyContinue).CommandLine
    if ($cmdLine -match '(\s|^)(-p|--print)(\s|$)') {
        $output["interactive"] = $false
    }
}

try {
    $jsonOutput = $output | ConvertTo-Json -Depth 10 -Compress
    $client = New-Object System.Net.Sockets.TcpClient
    $client.Connect($NOTCHI_HOST, $NOTCHI_PORT)
    $stream = $client.GetStream()
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($jsonOutput)
    $stream.Write($bytes, 0, $bytes.Length)
    $stream.Flush()
    $client.Close()
} catch {
    # Silently fail if Notchi is not running
}
'''
