"""Main application entry point for Notchi Windows."""

import logging
import sys
import threading

from .models import HookEvent
from .services import (
    SocketServer,
    SessionStore,
    NotchiStateMachine,
    EmotionAnalyzer,
    HookInstaller,
)
logger = logging.getLogger("notchi")

# Lazy imports for UI (requires tkinter + display)
NotchiOverlay = None
TrayIcon = None


def _import_ui():
    global NotchiOverlay, TrayIcon
    if NotchiOverlay is None:
        from .ui import NotchiOverlay as _Overlay, TrayIcon as _Tray
        NotchiOverlay = _Overlay
        TrayIcon = _Tray


class NotchiApp:
    """Main Notchi Windows application."""

    def __init__(self, api_key: str = None, headless: bool = False):
        self.session_store = SessionStore()
        self.emotion_analyzer = EmotionAnalyzer(api_key=api_key)
        self.headless = headless

        # State machine with UI update callback
        self.state_machine = NotchiStateMachine(
            self.session_store,
            on_state_change=self._on_state_change,
        )

        # Socket server
        self.socket_server = SocketServer(on_event=self._handle_event)

        # UI components (created later in main thread)
        self.overlay = None
        self.tray = None

    def run(self):
        """Start the application."""
        logger.info("Starting Notchi for Windows...")

        # Install hooks
        if not HookInstaller.is_installed():
            logger.info("Installing Claude Code hooks...")
            HookInstaller.install()
        else:
            logger.info("Hooks already installed")

        # Start socket server
        self.socket_server.start()

        if self.headless:
            logger.info("Running in headless mode (no GUI). Listening for events...")
            try:
                import signal
                signal.pause()
            except (AttributeError, KeyboardInterrupt):
                # signal.pause() not available on Windows; use event loop
                import time
                try:
                    while True:
                        time.sleep(1)
                except KeyboardInterrupt:
                    pass
            self._shutdown()
            return

        # Create UI (must be in main thread)
        _import_ui()
        self.overlay = NotchiOverlay(
            self.session_store,
            on_quit=self._shutdown,
        )

        # Start tray icon
        self.tray = TrayIcon(
            on_show=self._show_overlay,
            on_quit=self._shutdown,
        )
        self.tray.start()

        logger.info("Notchi is running. Waiting for Claude Code events...")

        # Run tkinter main loop (blocks)
        self.overlay.run()

    def _handle_event(self, event: HookEvent):
        """Handle incoming hook events (called from socket thread)."""
        # Run emotion analysis for user prompts
        if event.event == "UserPromptSubmit" and event.user_prompt:
            session = self.session_store.sessions.get(event.session_id)
            is_interactive = event.interactive if event.interactive is not None else True
            if is_interactive:
                threading.Thread(
                    target=self._analyze_emotion,
                    args=(event.session_id, event.user_prompt),
                    daemon=True,
                ).start()

        # Process through state machine
        self.state_machine.handle_event(event)

    def _analyze_emotion(self, session_id: str, prompt: str):
        """Analyze emotion in background thread."""
        emotion, intensity = self.emotion_analyzer.analyze(prompt)
        session = self.session_store.sessions.get(session_id)
        if session:
            session.emotion_state.record_emotion(emotion, intensity, prompt)
            self._on_state_change()

    def _on_state_change(self):
        """Called when state changes - schedule UI update."""
        if self.overlay and self.overlay.root:
            try:
                self.overlay.root.event_generate("<<StateChange>>", when="tail")
            except Exception:
                pass

        # Update tray icon
        if self.tray:
            effective = self.session_store.effective_session
            task = effective.task.value if effective else "idle"
            self.tray.update_icon(task)

    def _show_overlay(self):
        """Show the overlay window."""
        if self.overlay:
            try:
                self.overlay.root.after(0, self.overlay.show)
            except Exception:
                pass

    def _shutdown(self):
        """Clean shutdown."""
        logger.info("Shutting down Notchi...")
        self.socket_server.stop()
        self.state_machine.stop()
        if self.tray:
            self.tray.stop()
        sys.exit(0)
