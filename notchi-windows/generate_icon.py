#!/usr/bin/env python3
"""Generate a .ico file for the Notchi Windows executable."""

from notchi.sprites import generate_sprite_frame
from PIL import Image


def main():
    # Generate the base sprite at various sizes for ICO
    base = generate_sprite_frame("idle", "neutral", 0)

    sizes = [16, 32, 48, 64, 128, 256]
    icons = []
    for size in sizes:
        resized = base.resize((size, size), Image.NEAREST)
        icons.append(resized)

    # Save as ICO (Pillow supports multi-size ICO)
    icons[0].save(
        "notchi_icon.ico",
        format="ICO",
        sizes=[(s, s) for s in sizes],
        append_images=icons[1:],
    )
    print(f"Generated notchi_icon.ico ({len(sizes)} sizes: {sizes})")


if __name__ == "__main__":
    main()
