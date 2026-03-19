"""Data models for Notchi Windows."""

import time
import hashlib
from dataclasses import dataclass, field
from enum import Enum
from typing import Optional


# ─── NotchiTask ───────────────────────────────────────────────────────────────

class NotchiTask(Enum):
    IDLE = "idle"
    WORKING = "working"
    SLEEPING = "sleeping"
    COMPACTING = "compacting"
    WAITING = "waiting"

    @property
    def animation_fps(self) -> float:
        return {
            NotchiTask.COMPACTING: 6.0,
            NotchiTask.SLEEPING: 2.0,
            NotchiTask.IDLE: 3.0,
            NotchiTask.WAITING: 3.0,
            NotchiTask.WORKING: 4.0,
        }[self]

    @property
    def bob_duration(self) -> float:
        return {
            NotchiTask.SLEEPING: 4.0,
            NotchiTask.IDLE: 1.5,
            NotchiTask.WAITING: 1.5,
            NotchiTask.WORKING: 0.4,
            NotchiTask.COMPACTING: 0.5,
        }[self]

    @property
    def bob_amplitude(self) -> float:
        return {
            NotchiTask.SLEEPING: 0,
            NotchiTask.COMPACTING: 0,
            NotchiTask.IDLE: 1.5,
            NotchiTask.WAITING: 0.5,
            NotchiTask.WORKING: 0.5,
        }[self]

    @property
    def can_walk(self) -> bool:
        return self in (NotchiTask.IDLE, NotchiTask.WORKING)

    @property
    def display_name(self) -> str:
        return {
            NotchiTask.IDLE: "Idle",
            NotchiTask.WORKING: "Working...",
            NotchiTask.SLEEPING: "Sleeping",
            NotchiTask.COMPACTING: "Compacting...",
            NotchiTask.WAITING: "Waiting...",
        }[self]

    @property
    def frame_count(self) -> int:
        return 5 if self == NotchiTask.COMPACTING else 6


# ─── NotchiEmotion ────────────────────────────────────────────────────────────

class NotchiEmotion(Enum):
    NEUTRAL = "neutral"
    HAPPY = "happy"
    SAD = "sad"
    SOB = "sob"

    @property
    def sway_amplitude(self) -> float:
        return {
            NotchiEmotion.NEUTRAL: 0.5,
            NotchiEmotion.HAPPY: 1.0,
            NotchiEmotion.SAD: 0.25,
            NotchiEmotion.SOB: 0.15,
        }[self]


# ─── NotchiState ──────────────────────────────────────────────────────────────

@dataclass
class NotchiState:
    task: NotchiTask = NotchiTask.IDLE
    emotion: NotchiEmotion = NotchiEmotion.NEUTRAL

    @property
    def animation_fps(self) -> float:
        return self.task.animation_fps

    @property
    def bob_duration(self) -> float:
        return self.task.bob_duration

    @property
    def bob_amplitude(self) -> float:
        if self.emotion == NotchiEmotion.SOB:
            return 0
        if self.emotion == NotchiEmotion.SAD:
            return self.task.bob_amplitude * 0.5
        return self.task.bob_amplitude

    @property
    def sway_amplitude(self) -> float:
        return self.emotion.sway_amplitude

    @property
    def can_walk(self) -> bool:
        if self.emotion == NotchiEmotion.SOB:
            return False
        return self.task.can_walk

    @property
    def display_name(self) -> str:
        return self.task.display_name

    @property
    def frame_count(self) -> int:
        return self.task.frame_count


# ─── HookEvent ────────────────────────────────────────────────────────────────

@dataclass
class HookEvent:
    session_id: str
    cwd: str
    event: str
    status: str
    pid: Optional[int] = None
    tty: Optional[str] = None
    tool: Optional[str] = None
    tool_input: Optional[dict] = None
    tool_use_id: Optional[str] = None
    user_prompt: Optional[str] = None
    permission_mode: Optional[str] = None
    interactive: Optional[bool] = True

    @classmethod
    def from_json(cls, data: dict) -> "HookEvent":
        return cls(
            session_id=data.get("session_id", ""),
            cwd=data.get("cwd", ""),
            event=data.get("event", ""),
            status=data.get("status", ""),
            pid=data.get("pid"),
            tty=data.get("tty"),
            tool=data.get("tool"),
            tool_input=data.get("tool_input"),
            tool_use_id=data.get("tool_use_id"),
            user_prompt=data.get("user_prompt"),
            permission_mode=data.get("permission_mode"),
            interactive=data.get("interactive", True),
        )


# ─── EmotionState ─────────────────────────────────────────────────────────────

class EmotionState:
    SAD_THRESHOLD = 0.45
    HAPPY_THRESHOLD = 0.6
    SOB_ESCALATION_THRESHOLD = 0.9
    INTENSITY_DAMPEN = 0.5
    DECAY_RATE = 0.92
    INTER_EMOTION_DECAY = 0.9
    NEUTRAL_COUNTER_DECAY = 0.85
    DECAY_INTERVAL = 60  # seconds

    def __init__(self):
        self.current_emotion = NotchiEmotion.NEUTRAL
        self.scores: dict[NotchiEmotion, float] = {
            NotchiEmotion.HAPPY: 0.0,
            NotchiEmotion.SAD: 0.0,
        }

    def record_emotion(self, raw_emotion: str, intensity: float, prompt: str):
        try:
            emotion = NotchiEmotion(raw_emotion)
        except ValueError:
            emotion = None

        if emotion and emotion != NotchiEmotion.NEUTRAL:
            dampened = intensity * self.INTENSITY_DAMPEN
            self.scores[emotion] = min(self.scores.get(emotion, 0.0) + dampened, 1.0)
            for key in self.scores:
                if key != emotion:
                    self.scores[key] *= self.INTER_EMOTION_DECAY
        else:
            for key in self.scores:
                self.scores[key] *= self.NEUTRAL_COUNTER_DECAY

        self._update_current_emotion()

    def decay_all(self):
        changed = False
        for key in list(self.scores.keys()):
            old = self.scores[key]
            new = old * self.DECAY_RATE
            self.scores[key] = 0.0 if new < 0.01 else new
            if self.scores[key] != old:
                changed = True
        if changed:
            self._update_current_emotion()

    def _update_current_emotion(self):
        if not self.scores:
            self.current_emotion = NotchiEmotion.NEUTRAL
            return

        best_emotion = max(self.scores, key=lambda k: self.scores[k])
        best_value = self.scores[best_emotion]

        threshold = self.SAD_THRESHOLD if best_emotion == NotchiEmotion.SAD else self.HAPPY_THRESHOLD

        if best_value >= threshold:
            if best_emotion == NotchiEmotion.SAD and best_value >= self.SOB_ESCALATION_THRESHOLD:
                self.current_emotion = NotchiEmotion.SOB
            else:
                self.current_emotion = best_emotion
        else:
            self.current_emotion = NotchiEmotion.NEUTRAL


# ─── SessionData ──────────────────────────────────────────────────────────────

class SessionData:
    MAX_EVENTS = 20

    def __init__(self, session_id: str, cwd: str, session_number: int,
                 is_interactive: bool = True, existing_x_positions: list[float] = None):
        self.id = session_id
        self.cwd = cwd
        self.session_number = session_number
        self.is_interactive = is_interactive
        self.session_start_time = time.time()
        self.last_activity = time.time()

        self.task = NotchiTask.IDLE
        self.emotion_state = EmotionState()
        self.is_processing = False
        self.recent_events: list[dict] = []
        self.last_user_prompt: Optional[str] = None
        self.permission_mode = "default"
        self.alive = True

        # Sprite positioning
        h = int(hashlib.md5(session_id.encode()).hexdigest()[:8], 16)
        self.sprite_x_position = self._resolve_x(h, existing_x_positions or [])
        self.sprite_y_offset = -5.0 - (((h >> 8) & 0xFF) % 51)

    @property
    def state(self) -> NotchiState:
        return NotchiState(task=self.task, emotion=self.emotion_state.current_emotion)

    @property
    def project_name(self) -> str:
        import os
        return os.path.basename(self.cwd) if self.cwd else "unknown"

    @property
    def display_title(self) -> str:
        title = f"{self.project_name} #{self.session_number}"
        if self.last_user_prompt:
            return f"{title} - {self.last_user_prompt[:50]}"
        return title

    @property
    def formatted_duration(self) -> str:
        total = int(time.time() - self.session_start_time)
        minutes = total // 60
        seconds = total % 60
        return f"{minutes}m {seconds:02d}s"

    def update_task(self, new_task: NotchiTask):
        self.task = new_task
        self.last_activity = time.time()

    def update_processing_state(self, is_processing: bool):
        self.is_processing = is_processing
        self.last_activity = time.time()

    def record_user_prompt(self, prompt: str):
        self.last_user_prompt = prompt[:100] if prompt else None
        self.last_activity = time.time()

    def update_permission_mode(self, mode: str):
        self.permission_mode = mode

    def end_session(self):
        self.alive = False
        self.is_processing = False

    @staticmethod
    def _resolve_x(hash_val: int, existing: list[float]) -> float:
        candidate = 0.05 + (hash_val % 900) / 1000.0
        for _ in range(10):
            too_close = any(abs(x - candidate) < 0.15 for x in existing)
            if not too_close:
                break
            candidate = ((candidate + 0.23) % 0.90) + 0.05
        return candidate
