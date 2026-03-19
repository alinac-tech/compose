"""Pixel art sprite generation for Notchi Windows.

Generates animated sprite frames for each state and emotion combination.
Each sprite is a small pixel character rendered with Pillow.
"""

from PIL import Image, ImageDraw

# Color palettes for each emotion
PALETTES = {
    "neutral": {
        "body": "#5B8DEF",
        "face": "#FFFFFF",
        "eye": "#2D2D2D",
        "cheek": "#FFB3BA",
        "accent": "#4A7ADE",
        "highlight": "#7EAAFF",
    },
    "happy": {
        "body": "#FFD93D",
        "face": "#FFFFFF",
        "eye": "#2D2D2D",
        "cheek": "#FF9999",
        "accent": "#FFC107",
        "highlight": "#FFE57F",
    },
    "sad": {
        "body": "#7B8CDE",
        "face": "#E8E8F0",
        "eye": "#2D2D2D",
        "cheek": "#B0B0C8",
        "accent": "#5A6BC0",
        "highlight": "#9EADFF",
    },
    "sob": {
        "body": "#6674B8",
        "face": "#D8D8E8",
        "eye": "#2D2D2D",
        "cheek": "#8888AA",
        "accent": "#4A5698",
        "highlight": "#8898DD",
    },
}

SPRITE_SIZE = 32  # pixels


def _draw_base_character(draw: ImageDraw.Draw, palette: dict, y_offset: int = 0):
    """Draw the base character shape."""
    body = palette["body"]
    face = palette["face"]
    accent = palette["accent"]
    highlight = palette["highlight"]

    # Body (rounded blob shape)
    # Main body
    draw.rectangle([10, 12 + y_offset, 22, 26 + y_offset], fill=body)
    # Top rounded
    draw.rectangle([11, 10 + y_offset, 21, 12 + y_offset], fill=body)
    draw.rectangle([12, 9 + y_offset, 20, 10 + y_offset], fill=body)
    # Bottom rounded
    draw.rectangle([11, 26 + y_offset, 21, 27 + y_offset], fill=body)
    # Feet
    draw.rectangle([10, 27 + y_offset, 14, 29 + y_offset], fill=accent)
    draw.rectangle([18, 27 + y_offset, 22, 29 + y_offset], fill=accent)
    # Highlight on top
    draw.rectangle([13, 10 + y_offset, 17, 11 + y_offset], fill=highlight)

    # Face area
    draw.rectangle([12, 14 + y_offset, 20, 22 + y_offset], fill=face)


def _draw_eyes_neutral(draw: ImageDraw.Draw, palette: dict, y_offset: int = 0, frame: int = 0):
    """Draw neutral eyes, with occasional blink."""
    eye = palette["eye"]
    if frame % 20 == 0:  # Blink frame
        draw.line([13, 17 + y_offset, 15, 17 + y_offset], fill=eye)
        draw.line([17, 17 + y_offset, 19, 17 + y_offset], fill=eye)
    else:
        draw.rectangle([13, 16 + y_offset, 15, 18 + y_offset], fill=eye)
        draw.rectangle([17, 16 + y_offset, 19, 18 + y_offset], fill=eye)


def _draw_eyes_happy(draw: ImageDraw.Draw, palette: dict, y_offset: int = 0):
    """Draw happy squint eyes (^ ^)."""
    eye = palette["eye"]
    # Left eye ^
    draw.point((13, 17 + y_offset), fill=eye)
    draw.point((14, 16 + y_offset), fill=eye)
    draw.point((15, 17 + y_offset), fill=eye)
    # Right eye ^
    draw.point((17, 17 + y_offset), fill=eye)
    draw.point((18, 16 + y_offset), fill=eye)
    draw.point((19, 17 + y_offset), fill=eye)


def _draw_eyes_sad(draw: ImageDraw.Draw, palette: dict, y_offset: int = 0):
    """Draw sad droopy eyes."""
    eye = palette["eye"]
    draw.rectangle([13, 16 + y_offset, 15, 18 + y_offset], fill=eye)
    draw.rectangle([17, 16 + y_offset, 19, 18 + y_offset], fill=eye)
    # Eyebrows slanting down
    draw.point((12, 15 + y_offset), fill=eye)
    draw.point((13, 14 + y_offset), fill=eye)
    draw.point((20, 15 + y_offset), fill=eye)
    draw.point((19, 14 + y_offset), fill=eye)


def _draw_eyes_sob(draw: ImageDraw.Draw, palette: dict, y_offset: int = 0, frame: int = 0):
    """Draw crying eyes with tear drops."""
    eye = palette["eye"]
    _draw_eyes_sad(draw, palette, y_offset)
    # Tears
    tear_color = "#88BBFF"
    tear_y = 19 + y_offset + (frame % 3)
    draw.point((13, tear_y), fill=tear_color)
    draw.point((19, tear_y), fill=tear_color)
    if frame % 2 == 0:
        draw.point((14, tear_y + 1), fill=tear_color)
        draw.point((18, tear_y + 1), fill=tear_color)


def _draw_mouth_neutral(draw: ImageDraw.Draw, palette: dict, y_offset: int = 0):
    """Small neutral mouth."""
    draw.line([15, 21 + y_offset, 17, 21 + y_offset], fill=palette["eye"])


def _draw_mouth_happy(draw: ImageDraw.Draw, palette: dict, y_offset: int = 0):
    """Happy smile."""
    eye = palette["eye"]
    draw.line([14, 20 + y_offset, 18, 20 + y_offset], fill=eye)
    draw.point((13, 19 + y_offset), fill=eye)
    draw.point((19, 19 + y_offset), fill=eye)
    # Cheeks
    draw.point((12, 19 + y_offset), fill=palette["cheek"])
    draw.point((20, 19 + y_offset), fill=palette["cheek"])


def _draw_mouth_sad(draw: ImageDraw.Draw, palette: dict, y_offset: int = 0):
    """Sad frown."""
    eye = palette["eye"]
    draw.line([14, 21 + y_offset, 18, 21 + y_offset], fill=eye)
    draw.point((13, 22 + y_offset), fill=eye)
    draw.point((19, 22 + y_offset), fill=eye)


def _draw_mouth_sob(draw: ImageDraw.Draw, palette: dict, y_offset: int = 0):
    """Open mouth crying."""
    eye = palette["eye"]
    draw.rectangle([14, 20 + y_offset, 18, 22 + y_offset], fill=eye)
    draw.rectangle([15, 21 + y_offset, 17, 21 + y_offset], fill="#CC4444")


# ─── State-specific decorations ──────────────────────────────────────────────

def _draw_working_particles(draw: ImageDraw.Draw, frame: int):
    """Draw sparkle/work particles around the character."""
    colors = ["#FFD700", "#FF6B6B", "#4ECDC4"]
    positions = [
        (7 + (frame * 3) % 5, 8 + (frame * 2) % 4),
        (23 + (frame * 2) % 4, 10 + (frame * 3) % 5),
        (9 + (frame * 4) % 6, 24 + (frame) % 3),
    ]
    for i, (x, y) in enumerate(positions):
        if x < SPRITE_SIZE and y < SPRITE_SIZE:
            draw.point((x, y), fill=colors[i % len(colors)])


def _draw_sleeping_zzz(draw: ImageDraw.Draw, frame: int):
    """Draw Z's floating up."""
    zzz_color = "#AABBDD"
    base_y = 8 - (frame % 4)
    if base_y >= 2:
        draw.text((22, base_y), "z", fill=zzz_color)
    if base_y - 3 >= 0:
        draw.text((24, base_y - 3), "Z", fill=zzz_color)


def _draw_compacting_swirl(draw: ImageDraw.Draw, frame: int):
    """Draw swirl/compress effect."""
    swirl_color = "#AA88FF"
    offsets = [(frame % 3) - 1, -(frame % 3) + 1]
    for i, off in enumerate(offsets):
        x = 16 + off * 4
        y = 8 + i * 2
        if 0 <= x < SPRITE_SIZE and 0 <= y < SPRITE_SIZE:
            draw.point((x, y), fill=swirl_color)


def _draw_waiting_dots(draw: ImageDraw.Draw, frame: int):
    """Draw waiting dots (...)."""
    dot_color = "#888888"
    active = frame % 4
    for i in range(3):
        if i <= active:
            draw.rectangle([22 + i * 3, 10, 23 + i * 3, 11], fill=dot_color)


# ─── Main sprite generation ──────────────────────────────────────────────────

def generate_sprite_frame(task: str, emotion: str, frame: int) -> Image.Image:
    """Generate a single sprite frame for the given state.

    Args:
        task: One of 'idle', 'working', 'sleeping', 'compacting', 'waiting'
        emotion: One of 'neutral', 'happy', 'sad', 'sob'
        frame: Frame index for animation

    Returns:
        32x32 RGBA PIL Image
    """
    img = Image.new("RGBA", (SPRITE_SIZE, SPRITE_SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    palette = PALETTES.get(emotion, PALETTES["neutral"])

    # Vertical bob offset based on task
    y_off = 0
    if task == "working":
        y_off = int(1.5 * ((frame % 4) < 2) - 0.75)
    elif task == "idle":
        y_off = int(1.0 * ((frame % 6) < 3) - 0.5)

    # Draw base character
    _draw_base_character(draw, palette, y_off)

    # Draw eyes based on emotion
    match emotion:
        case "happy":
            _draw_eyes_happy(draw, palette, y_off)
        case "sad":
            _draw_eyes_sad(draw, palette, y_off)
        case "sob":
            _draw_eyes_sob(draw, palette, y_off, frame)
        case _:
            _draw_eyes_neutral(draw, palette, y_off, frame)

    # Draw mouth based on emotion
    match emotion:
        case "happy":
            _draw_mouth_happy(draw, palette, y_off)
        case "sad":
            _draw_mouth_sad(draw, palette, y_off)
        case "sob":
            _draw_mouth_sob(draw, palette, y_off)
        case _:
            _draw_mouth_neutral(draw, palette, y_off)

    # Draw state-specific effects
    match task:
        case "working":
            _draw_working_particles(draw, frame)
        case "sleeping":
            _draw_sleeping_zzz(draw, frame)
        case "compacting":
            _draw_compacting_swirl(draw, frame)
        case "waiting":
            _draw_waiting_dots(draw, frame)

    return img


def generate_all_frames(task: str, emotion: str, count: int = 6) -> list[Image.Image]:
    """Generate all animation frames for a state."""
    return [generate_sprite_frame(task, emotion, i) for i in range(count)]


def generate_grass_tile(width: int = 80, height: int = 40) -> Image.Image:
    """Generate a grass tile for the island background."""
    img = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Ground
    draw.rectangle([0, height // 2, width, height], fill="#4A8C3F")
    # Dirt edge
    draw.rectangle([0, height // 2, width, height // 2 + 3], fill="#6AAF5C")
    # Grass blades
    grass_color = "#5CB84D"
    grass_dark = "#3D7A33"
    for x in range(0, width, 4):
        h = 3 + (x * 7 % 5)
        draw.line(
            [x, height // 2 - h, x, height // 2],
            fill=grass_color if x % 8 < 4 else grass_dark,
        )
        draw.line(
            [x + 1, height // 2 - h + 1, x + 2, height // 2],
            fill=grass_dark if x % 8 < 4 else grass_color,
        )

    return img


def generate_tray_icon(task: str = "idle", size: int = 64) -> Image.Image:
    """Generate an icon for the system tray."""
    frame = generate_sprite_frame(task, "neutral", 0)
    return frame.resize((size, size), Image.NEAREST)
