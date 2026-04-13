#!/usr/bin/env python3
"""
Generate a PNG screenshot of the Craftgent LoginScreen UI using PIL/Pillow.
"""

import sys
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print("❌ Error: PIL/Pillow not installed")
    print("Install with: pip install Pillow")
    sys.exit(1)

# Configuration
WIDTH = 1280
HEIGHT = 720
OUTPUT_PATH = Path(__file__).parent / "landing-page-screenshot.png"

# Colors (from tailwind config)
COLOR_SKY_LIGHT = (135, 206, 235)      # #87ceeb
COLOR_SKY_DARK = (198, 233, 255)       # #c6e9ff
COLOR_GRASS = (144, 238, 144)           # #90ee90
COLOR_BLACK = (0, 0, 0)
COLOR_WHITE = (255, 255, 255)
COLOR_GRASS_BLOCK = (93, 158, 50)      # #5d9e32
COLOR_GRASS_LIGHT = (106, 191, 56)     # #6abf38
COLOR_GRASS_DARK = (42, 90, 8)         # #2a5a08
COLOR_YELLOW = (255, 255, 85)           # #ffff55
COLOR_STONE = (139, 139, 139)           # #8b8b8b
COLOR_DARK_GRAY = (51, 51, 51)          # #333
COLOR_MID_GRAY = (85, 85, 85)           # #555
COLOR_LIGHT_GRAY = (221, 221, 221)      # #ddd

def create_gradient_background(draw):
    """Create a sky gradient background"""
    for y in range(HEIGHT):
        # Gradient from light blue to dark blue (sky), then to green (grass)
        if y < HEIGHT * 0.6:  # Sky portion
            ratio = y / (HEIGHT * 0.6)
            r = int(135 + (198 - 135) * ratio)
            g = int(206 + (233 - 206) * ratio)
            b = int(235 + (255 - 235) * ratio)
        else:  # Grass portion
            r, g, b = COLOR_GRASS

        draw.line([(0, y), (WIDTH, y)], fill=(r, g, b))

def add_scanlines(img):
    """Add scanline effect overlay"""
    for y in range(0, HEIGHT, 2):
        for x in range(WIDTH):
            img.putpixel((x, y), (0, 0, 0, 38))  # ~15% opacity black

def draw_button_border(draw, x, y, w, h, top_left=(170, 240, 96), bottom_right=(42, 90, 8), is_inactive=False):
    """Draw Minecraft-style beveled button border"""
    if is_inactive:
        top_left = (85, 85, 85)
        bottom_right = (170, 170, 170)

    # Top and left borders (light)
    draw.line([(x, y + h), (x, y), (x + w, y)], fill=top_left, width=2)
    # Bottom and right borders (dark)
    draw.line([(x, y + h), (x + w, y + h), (x + w, y)], fill=bottom_right, width=2)

def main():
    print("📷 Generating Craftgent LoginScreen screenshot...")

    # Create base image with sky/grass background
    img = Image.new('RGB', (WIDTH, HEIGHT))
    draw = ImageDraw.Draw(img, 'RGBA')

    # Draw gradient background
    create_gradient_background(draw)

    # Panel dimensions
    panel_width = 400
    panel_height = 400
    panel_x = (WIDTH - panel_width) // 2
    panel_y = (HEIGHT - panel_height) // 2

    # Draw panel background with border
    draw.rectangle(
        [(panel_x, panel_y), (panel_x + panel_width, panel_y + panel_height)],
        fill=(0, 0, 0, 210),  # Dark semi-transparent
        outline=None
    )

    # Panel border - light top-left, dark bottom-right
    draw.line([(panel_x + 3, panel_y + panel_height - 3), (panel_x + 3, panel_y + 3),
               (panel_x + panel_width - 3, panel_y + 3)],
              fill=(255, 255, 255, 50), width=3)
    draw.line([(panel_x + 3, panel_y + panel_height - 3),
               (panel_x + panel_width - 3, panel_y + panel_height - 3),
               (panel_x + panel_width - 3, panel_y + 3)],
              fill=(0, 0, 0, 50), width=3)

    # Panel shadow
    draw.rectangle(
        [(panel_x + 4, panel_y + panel_height + 4),
         (panel_x + panel_width + 4, panel_y + panel_height + 4)],
        fill=(0, 0, 0, 153)  # ~60% opacity black
    )

    # Text content (using basic sizes since we can't load fonts easily)
    content_x = panel_x + 32
    current_y = panel_y + 28
    line_height = 16

    # Title
    draw.text((content_x + 20, current_y), "⛏ CRAFTGENT", fill=COLOR_WHITE)
    current_y += line_height * 1.5
    draw.text((content_x + 40, current_y), "AI Command Center", fill=COLOR_GRASS_LIGHT)
    current_y += line_height * 1.5

    # Tabs
    tab_width = (panel_width - 64) // 2 - 2
    tab_x = content_x
    tab_y = current_y

    # Login tab (active)
    draw.rectangle(
        [(tab_x, tab_y), (tab_x + tab_width, tab_y + 20)],
        fill=COLOR_GRASS_BLOCK
    )
    draw.line([(tab_x + 1, tab_y + 1), (tab_x + 1, tab_y + 19), (tab_x + tab_width - 1, tab_y + 19)],
              fill=(174, 240, 96), width=2)
    draw.line([(tab_x + 1, tab_y + 1), (tab_x + tab_width - 1, tab_y + 1)],
              fill=(174, 240, 96), width=2)
    draw.text((tab_x + 10, tab_y + 4), "▶ LOGIN", fill=COLOR_WHITE)

    # Register tab (inactive)
    tab_x2 = tab_x + tab_width + 4
    draw.rectangle(
        [(tab_x2, tab_y), (tab_x2 + tab_width, tab_y + 20)],
        fill=COLOR_DARK_GRAY
    )
    draw.line([(tab_x2 + 1, tab_y + 1), (tab_x2 + 1, tab_y + 19), (tab_x2 + tab_width - 1, tab_y + 19)],
              fill=COLOR_MID_GRAY, width=2)
    draw.text((tab_x2 + 5, tab_y + 4), "✦ REGISTER", fill=(255, 255, 255, 128))

    current_y += 32

    # Input fields
    field_x = content_x
    field_width = panel_width - 64

    # Username field
    draw.text((field_x, current_y), "USERNAME", fill=COLOR_YELLOW)
    current_y += 12
    draw.rectangle(
        [(field_x, current_y), (field_x + field_width, current_y + 24)],
        fill=(0, 0, 0, 170)
    )
    draw.line([(field_x, current_y), (field_x, current_y + 24), (field_x + field_width, current_y + 24)],
              fill=COLOR_MID_GRAY, width=3)
    draw.line([(field_x, current_y), (field_x + field_width, current_y)],
              fill=COLOR_MID_GRAY, width=3)
    draw.line([(field_x + field_width, current_y), (field_x + field_width, current_y + 24)],
              fill=COLOR_LIGHT_GRAY, width=3)
    draw.line([(field_x, current_y + 24), (field_x + field_width, current_y + 24)],
              fill=COLOR_LIGHT_GRAY, width=3)
    draw.text((field_x + 4, current_y + 4), "_", fill=(85, 255, 255))
    current_y += 32

    # Password field
    draw.text((field_x, current_y), "PASSWORD", fill=COLOR_YELLOW)
    current_y += 12
    draw.rectangle(
        [(field_x, current_y), (field_x + field_width, current_y + 24)],
        fill=(0, 0, 0, 170)
    )
    draw.line([(field_x, current_y), (field_x, current_y + 24), (field_x + field_width, current_y + 24)],
              fill=COLOR_MID_GRAY, width=3)
    draw.line([(field_x, current_y), (field_x + field_width, current_y)],
              fill=COLOR_MID_GRAY, width=3)
    draw.line([(field_x + field_width, current_y), (field_x + field_width, current_y + 24)],
              fill=COLOR_LIGHT_GRAY, width=3)
    draw.line([(field_x, current_y + 24), (field_x + field_width, current_y + 24)],
              fill=COLOR_LIGHT_GRAY, width=3)
    draw.text((field_x + 4, current_y + 4), "••••••••", fill=(200, 200, 200))
    current_y += 32

    # Submit button
    button_height = 24
    draw.rectangle(
        [(field_x, current_y), (field_x + field_width, current_y + button_height)],
        fill=COLOR_GRASS_BLOCK
    )
    draw.line([(field_x + 1, current_y + 1), (field_x + 1, current_y + button_height - 1),
               (field_x + field_width - 1, current_y + button_height - 1)],
              fill=(174, 240, 96), width=3)
    draw.line([(field_x + 1, current_y + 1), (field_x + field_width - 1, current_y + 1)],
              fill=(174, 240, 96), width=3)
    draw.line([(field_x + field_width - 1, current_y + 1), (field_x + field_width - 1, current_y + button_height - 1)],
              fill=(42, 90, 8), width=3)
    draw.line([(field_x, current_y + button_height - 1), (field_x + field_width, current_y + button_height - 1)],
              fill=(42, 90, 8), width=3)
    draw.text((field_x + 30, current_y + 4), "▶ ENTER WORLD", fill=COLOR_WHITE)
    current_y += button_height + 16

    # Footer text
    draw.text((field_x + 20, current_y), "No account? Click REGISTER above.", fill=(255, 255, 255, 76))

    # Add scanline effect
    add_scanlines(img)

    # Save
    img.save(OUTPUT_PATH)
    print(f"✅ Screenshot saved successfully!")
    print(f"📍 Location: {OUTPUT_PATH}")

if __name__ == '__main__':
    main()
