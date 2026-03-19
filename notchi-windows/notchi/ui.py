"""UI module for Notchi Windows - overlay window with animated sprites and system tray."""

import math
import time
import threading
import logging
import sys
import tkinter as tk
from typing import Optional, Callable

from PIL import Image, ImageTk

from .models import NotchiTask, NotchiEmotion, NotchiState, SessionData
from .sprites import generate_sprite_frame, generate_grass_tile, generate_tray_icon, SPRITE_SIZE
from .services import SessionStore

logger = logging.getLogger("notchi")

# ─── Constants ────────────────────────────────────────────────────────────────

OVERLAY_HEIGHT = 100
SPRITE_DISPLAY_SIZE = 48
GRASS_HEIGHT = 40
ANIMATION_INTERVAL_MS = 150
STATUS_BAR_HEIGHT = 28
BG_COLOR = "#1A1A2E"
STATUS_BG = "#0F0F1F"
TEXT_COLOR = "#E0E0E0"
ACCENT_COLOR = "#5B8DEF"
DIM_COLOR = "#888888"

# Task icons (ASCII-safe, no emoji - Consolas doesn't support them)
TASK_ICONS = {
    NotchiTask.IDLE: "[~]",
    NotchiTask.WORKING: "[*]",
    NotchiTask.SLEEPING: "[z]",
    NotchiTask.COMPACTING: "[>]",
    NotchiTask.WAITING: "[?]",
}


def _enable_dpi_awareness():
    """Enable high-DPI awareness on Windows."""
    try:
        import ctypes
        ctypes.windll.shcore.SetProcessDpiAwareness(1)
    except Exception:
        try:
            import ctypes
            ctypes.windll.user32.SetProcessDPIAware()
        except Exception:
            pass


class NotchiOverlay:
    """Floating overlay window showing Notchi sprites and session status."""

    def __init__(self, session_store: SessionStore, on_quit: Optional[Callable] = None):
        self.session_store = session_store
        self.on_quit = on_quit
        self._frame_counter = 0
        self._sprite_cache: dict[str, list[ImageTk.PhotoImage]] = {}
        self._grass_photo: Optional[ImageTk.PhotoImage] = None
        self._drag_data = {"x": 0, "y": 0}
        self._expanded = False
        self._running = True

        # Enable DPI awareness before creating any windows
        _enable_dpi_awareness()

        # Create root window
        self.root = tk.Tk()
        self.root.title("Notchi")
        self.root.configure(bg=BG_COLOR)

        # Set window properties step by step
        self.root.overrideredirect(True)
        self.root.attributes("-topmost", True)

        # Alpha transparency (skip if not supported)
        try:
            self.root.attributes("-alpha", 0.95)
        except tk.TclError:
            pass

        # Calculate dimensions
        screen_w = self.root.winfo_screenwidth()
        screen_h = self.root.winfo_screenheight()
        self._overlay_width = max(300, min(420, screen_w // 3))
        self._collapsed_height = OVERLAY_HEIGHT + STATUS_BAR_HEIGHT
        self._expanded_height = self._collapsed_height + 160

        # Position at top-center
        x = (screen_w - self._overlay_width) // 2
        y = 5  # Small offset from top edge
        self.root.geometry(f"{self._overlay_width}x{self._collapsed_height}+{x}+{y}")

        # Force window to update so it's visible
        self.root.update_idletasks()

        logger.info(f"Window: {self._overlay_width}x{self._collapsed_height} at +{x}+{y} (screen: {screen_w}x{screen_h})")

        self._build_ui()
        self._bind_events()

        # Start animation after a short delay to let window initialize
        self.root.after(200, self._start_animation)

    def _build_ui(self):
        """Build the overlay UI."""
        # Main canvas for sprites
        canvas_height = OVERLAY_HEIGHT
        self.canvas = tk.Canvas(
            self.root,
            width=self._overlay_width,
            height=canvas_height,
            bg=BG_COLOR,
            highlightthickness=0,
            bd=0,
        )
        self.canvas.pack(fill=tk.X, expand=False)

        # Pre-generate grass background
        try:
            grass = generate_grass_tile(self._overlay_width, GRASS_HEIGHT)
            self._grass_photo = ImageTk.PhotoImage(grass.resize(
                (self._overlay_width, GRASS_HEIGHT), Image.NEAREST
            ))
            logger.info("Grass tile generated OK")
        except Exception as e:
            logger.error(f"Failed to generate grass: {e}")
            self._grass_photo = None

        # Pre-generate idle sprite so something shows immediately
        try:
            self._ensure_sprite_cached("idle", "neutral", 6)
            logger.info("Initial sprite cached OK")
        except Exception as e:
            logger.error(f"Failed to cache initial sprite: {e}")

        # Status bar at bottom
        self.status_frame = tk.Frame(self.root, bg=STATUS_BG, height=STATUS_BAR_HEIGHT)
        self.status_frame.pack(fill=tk.X, side=tk.BOTTOM)
        self.status_frame.pack_propagate(False)

        self.status_label = tk.Label(
            self.status_frame,
            text="Notchi - Aktif oturum yok",
            bg=STATUS_BG,
            fg=DIM_COLOR,
            font=("Consolas", 9),
            anchor="w",
            padx=8,
        )
        self.status_label.pack(side=tk.LEFT, fill=tk.X, expand=True)

        # Buttons in status bar
        btn_frame = tk.Frame(self.status_frame, bg=STATUS_BG)
        btn_frame.pack(side=tk.RIGHT, padx=4)

        self.expand_btn = tk.Label(
            btn_frame, text="v", bg=STATUS_BG, fg=DIM_COLOR,
            font=("Consolas", 9, "bold"), cursor="hand2",
        )
        self.expand_btn.pack(side=tk.LEFT, padx=4)
        self.expand_btn.bind("<Button-1>", self._toggle_expand)

        self.close_btn = tk.Label(
            btn_frame, text="X", bg=STATUS_BG, fg="#FF6B6B",
            font=("Consolas", 9, "bold"), cursor="hand2",
        )
        self.close_btn.pack(side=tk.LEFT, padx=4)
        self.close_btn.bind("<Button-1>", self._on_close)

        # Expanded panel (initially hidden)
        self.detail_frame = tk.Frame(self.root, bg=BG_COLOR)
        self.detail_text = tk.Text(
            self.detail_frame,
            bg=BG_COLOR,
            fg=TEXT_COLOR,
            font=("Consolas", 9),
            wrap=tk.WORD,
            height=8,
            bd=0,
            padx=10,
            pady=5,
            state=tk.DISABLED,
            cursor="arrow",
        )
        self.detail_text.pack(fill=tk.BOTH, expand=True)

        # Draw initial frame immediately
        self.root.update_idletasks()

    def _ensure_sprite_cached(self, task_name: str, emotion_name: str, frame_count: int):
        """Pre-generate and cache sprite frames."""
        cache_key = f"{task_name}_{emotion_name}"
        if cache_key in self._sprite_cache:
            return
        frames = []
        for i in range(frame_count):
            img = generate_sprite_frame(task_name, emotion_name, i)
            img = img.resize((SPRITE_DISPLAY_SIZE, SPRITE_DISPLAY_SIZE), Image.NEAREST)
            frames.append(ImageTk.PhotoImage(img))
        self._sprite_cache[cache_key] = frames

    def _bind_events(self):
        """Bind drag and interaction events."""
        self.canvas.bind("<ButtonPress-1>", self._on_drag_start)
        self.canvas.bind("<B1-Motion>", self._on_drag_motion)
        self.canvas.bind("<Double-Button-1>", lambda e: self._toggle_expand(e))

        # Right-click context menu
        self.context_menu = tk.Menu(self.root, tearoff=0)
        self.context_menu.add_command(label="Detaylari Goster/Gizle", command=lambda: self._toggle_expand(None))
        self.context_menu.add_separator()
        self.context_menu.add_command(label="Tray'e Kucult", command=self._minimize_to_tray)
        self.context_menu.add_command(label="Kapat", command=self._on_close)
        self.canvas.bind("<Button-3>", self._show_context_menu)

    def _on_drag_start(self, event):
        self._drag_data["x"] = event.x
        self._drag_data["y"] = event.y

    def _on_drag_motion(self, event):
        x = self.root.winfo_x() + (event.x - self._drag_data["x"])
        y = self.root.winfo_y() + (event.y - self._drag_data["y"])
        self.root.geometry(f"+{x}+{y}")

    def _show_context_menu(self, event):
        try:
            self.context_menu.tk_popup(event.x_root, event.y_root)
        except tk.TclError:
            pass

    def _toggle_expand(self, event):
        self._expanded = not self._expanded
        if self._expanded:
            self.detail_frame.pack(fill=tk.BOTH, expand=True, before=self.status_frame)
            h = self._expanded_height
            self.expand_btn.config(text="^")
        else:
            self.detail_frame.pack_forget()
            h = self._collapsed_height
            self.expand_btn.config(text="v")

        x = self.root.winfo_x()
        y = self.root.winfo_y()
        self.root.geometry(f"{self._overlay_width}x{h}+{x}+{y}")

    def _minimize_to_tray(self):
        self.root.withdraw()

    def show(self):
        """Show the overlay window."""
        self.root.deiconify()
        self.root.lift()

    def _on_close(self, event=None):
        self._running = False
        try:
            self.root.destroy()
        except tk.TclError:
            pass
        if self.on_quit:
            self.on_quit()

    # ─── Animation ────────────────────────────────────────────────────────

    def _start_animation(self):
        """Start the animation update loop."""
        logger.info("Starting animation loop")
        self._update_frame()

    def _update_frame(self):
        if not self._running:
            return

        try:
            self._render_canvas()
            self._update_status()
            if self._expanded:
                self._update_details()
            self._frame_counter += 1
        except tk.TclError:
            # Window was destroyed
            return
        except Exception as e:
            logger.error(f"Animation error: {e}", exc_info=True)

        try:
            self.root.after(ANIMATION_INTERVAL_MS, self._update_frame)
        except tk.TclError:
            pass

    def _render_canvas(self):
        """Render sprites and grass on the canvas."""
        self.canvas.delete("all")

        # Draw background
        self.canvas.create_rectangle(
            0, 0, self._overlay_width, OVERLAY_HEIGHT,
            fill=BG_COLOR, outline="",
        )

        # Draw grass at bottom
        grass_y = OVERLAY_HEIGHT - GRASS_HEIGHT
        if self._grass_photo:
            self.canvas.create_image(
                self._overlay_width // 2, grass_y,
                image=self._grass_photo, anchor="n",
            )

        sessions = list(self.session_store.sessions.values())

        if not sessions:
            # Draw idle sprite in center
            self._draw_sprite(
                NotchiState(NotchiTask.IDLE, NotchiEmotion.NEUTRAL),
                self._overlay_width // 2,
                grass_y - 2,
            )
        else:
            for session in sessions:
                x = int(session.sprite_x_position * self._overlay_width)
                x = max(SPRITE_DISPLAY_SIZE // 2, min(x, self._overlay_width - SPRITE_DISPLAY_SIZE // 2))
                y = grass_y + int(session.sprite_y_offset / 3) - 2
                self._draw_sprite(session.state, x, y)

    def _draw_sprite(self, state: NotchiState, x: int, y: int):
        """Draw an animated sprite at the given position."""
        task_name = state.task.value
        emotion_name = state.emotion.value
        cache_key = f"{task_name}_{emotion_name}"

        # Generate frames if not cached
        if cache_key not in self._sprite_cache:
            try:
                self._ensure_sprite_cached(task_name, emotion_name, state.frame_count)
            except Exception as e:
                logger.error(f"Failed to generate sprite {cache_key}: {e}")
                return

        frames = self._sprite_cache.get(cache_key, [])
        if not frames:
            return

        # Select frame
        frame_idx = self._frame_counter % len(frames)
        photo = frames[frame_idx]

        # Apply bob offset
        bob_y = 0
        if state.bob_amplitude > 0:
            t = time.time()
            period = max(state.bob_duration, 0.1)
            phase = (t % period) / period
            bob_y = int(state.bob_amplitude * math.sin(phase * 2 * math.pi))

        self.canvas.create_image(x, y + bob_y, image=photo, anchor="s")

    def _update_status(self):
        """Update the status bar text."""
        sessions = self.session_store.sorted_sessions
        if not sessions:
            self.status_label.config(text="Notchi - Aktif oturum yok", fg=DIM_COLOR)
            return

        effective = self.session_store.effective_session
        if effective:
            icon = TASK_ICONS.get(effective.task, "")
            text = f"{icon} {effective.display_title} [{effective.formatted_duration}]"
            if len(sessions) > 1:
                text += f"  ({len(sessions)} oturum)"
            self.status_label.config(text=text, fg=TEXT_COLOR)

    def _update_details(self):
        """Update the expanded detail panel."""
        self.detail_text.config(state=tk.NORMAL)
        self.detail_text.delete("1.0", tk.END)

        sessions = self.session_store.sorted_sessions
        if not sessions:
            self.detail_text.insert(tk.END, "Aktif oturum yok.\n\n")
            self.detail_text.insert(tk.END, "Claude Code baslattiginizda aktivite burada gorunur.\n")
        else:
            for session in sessions:
                status = ">" if session.is_processing else "-"
                self.detail_text.insert(
                    tk.END,
                    f" {status} {session.display_title}\n"
                    f"   Durum: {session.state.display_name} | "
                    f"Sure: {session.formatted_duration} | "
                    f"Mod: {session.permission_mode}\n\n"
                )

        self.detail_text.config(state=tk.DISABLED)

    def run(self):
        """Start the tkinter main loop."""
        logger.info("Entering main loop")
        self.root.mainloop()


# ─── System Tray (optional, requires pystray) ────────────────────────────────

class TrayIcon:
    """System tray icon for Notchi."""

    def __init__(self, on_show: Callable, on_quit: Callable):
        self.on_show = on_show
        self.on_quit = on_quit
        self._icon = None

    def start(self):
        """Start the tray icon in a background thread."""
        try:
            import pystray
            from pystray import MenuItem as Item

            icon_image = generate_tray_icon("idle", 64)

            self._icon = pystray.Icon(
                "notchi",
                icon_image,
                "Notchi - Claude Code Companion",
                menu=pystray.Menu(
                    Item("Notchi'yi Goster", lambda: self.on_show()),
                    Item("Kapat", lambda: self._quit()),
                ),
            )

            thread = threading.Thread(target=self._icon.run, daemon=True)
            thread.start()
            logger.info("Tray icon started")
        except ImportError:
            logger.warning("pystray not available, skipping tray icon")
        except Exception as e:
            logger.warning(f"Tray icon failed: {e}")

    def _quit(self):
        if self._icon:
            self._icon.stop()
        self.on_quit()

    def stop(self):
        if self._icon:
            try:
                self._icon.stop()
            except Exception:
                pass

    def update_icon(self, task: str):
        """Update tray icon based on current task."""
        if self._icon:
            try:
                self._icon.icon = generate_tray_icon(task, 64)
            except Exception:
                pass
