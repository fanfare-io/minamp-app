#!/usr/bin/env python3
"""
Generate SVG template files for Minamp HD skins, then render to PNG at 2x scale.

Each SVG shows labeled regions matching the sprite sheet layout defined in
SpriteExtractor.swift. Regions are drawn at 2x scale (assetScale=2).

Usage: python3 generate_templates.py
Requires: rsvg-convert (brew install librsvg)
"""

import subprocess
import os

SCALE = 2
OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))

# Color palette for regions
COLORS = [
    "#4A90D9", "#D94A4A", "#4AD94A", "#D9D94A",
    "#D94AD9", "#4AD9D9", "#D9904A", "#904AD9",
    "#4A6DD9", "#D96A4A", "#6AD94A", "#D9D96A",
    "#6A4AD9", "#4AD96A", "#D94A6A", "#4A90D9",
    "#D9904A", "#904AD9", "#4AD9D9", "#D94AD9",
    "#6AD94A", "#D96A4A", "#4A6DD9", "#D9D96A",
    "#D94A6A", "#6A4AD9", "#4AD96A", "#D94AD9",
    "#4AD9D9",
]


def color(i):
    return COLORS[i % len(COLORS)]


def rect_svg(x, y, w, h, label, col, font_size=None):
    """Generate SVG rect with label for a region. All values already at target scale."""
    if font_size is None:
        font_size = max(7, min(11, int(min(w, h) * 0.35)))
    c = col
    # Truncate label to fit
    max_chars = max(3, int(w / (font_size * 0.55)))
    display_label = label[:max_chars].replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")
    text_x = x + w / 2
    text_y = y + h / 2 + font_size * 0.35
    return f"""  <rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{c}" fill-opacity="0.25" stroke="{c}" stroke-width="1"/>
  <text x="{text_x}" y="{text_y}" text-anchor="middle" fill="{c}" font-family="monospace" font-size="{font_size}" font-weight="bold">{display_label}</text>
"""


def svg_wrap(width, height, body):
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">
  <rect width="{width}" height="{height}" fill="#1a1a2e"/>
{body}</svg>
"""


def s(val):
    """Scale a 1x value to target scale."""
    return val * SCALE


def generate_main():
    """MAIN.PNG - 275x116 @ 2x = 550x232"""
    w, h = s(275), s(116)
    body = rect_svg(0, 0, w, h, "MAIN BACKGROUND", color(0), 20)
    return "MAIN", w, h, svg_wrap(w, h, body)


def generate_titlebar():
    """TITLEBAR.PNG"""
    w, h = s(302), s(56)
    regions = [
        # Title bars
        (27, 0, 275, 14, "Active Title Bar"),
        (27, 15, 275, 14, "Inactive Title Bar"),
        # Window buttons
        (0, 0, 9, 9, "Shade"),
        (0, 9, 9, 9, "Shade P"),
        (9, 0, 9, 9, "Min"),
        (9, 9, 9, 9, "Min P"),
        (18, 0, 9, 9, "Close"),
        (18, 9, 9, 9, "Close P"),
        # Shade mode
        (27, 29, 275, 14, "Shade BG (focused)"),
        (27, 42, 275, 14, "Shade BG (unfocused)"),
        (0, 18, 9, 9, "ShTog"),
        (9, 18, 9, 9, "ShTog P"),
        (0, 36, 17, 7, "Sh Pos BG"),
        (20, 36, 3, 7, "Th"),
    ]
    body = ""
    for i, (x, y, rw, rh, label) in enumerate(regions):
        body += rect_svg(s(x), s(y), s(rw), s(rh), label, color(i))
    return "TITLEBAR", w, h, svg_wrap(w, h, body)


def generate_cbuttons():
    """CBUTTONS.PNG - 136x36"""
    w, h = s(136), s(36)
    buttons = [
        (0, 0, 23, 18, "Prev"),
        (0, 18, 23, 18, "Prev P"),
        (23, 0, 23, 18, "Play"),
        (23, 18, 23, 18, "Play P"),
        (46, 0, 23, 18, "Pause"),
        (46, 18, 23, 18, "Pause P"),
        (69, 0, 23, 18, "Stop"),
        (69, 18, 23, 18, "Stop P"),
        (92, 0, 22, 18, "Next"),
        (92, 18, 22, 18, "Next P"),
        (114, 0, 22, 16, "Eject"),
        (114, 16, 22, 16, "Eject P"),
    ]
    body = ""
    for i, (x, y, rw, rh, label) in enumerate(buttons):
        body += rect_svg(s(x), s(y), s(rw), s(rh), label, color(i))
    return "CBUTTONS", w, h, svg_wrap(w, h, body)


def generate_volume():
    """VOLUME.PNG - 68x433"""
    w, h = s(68), s(433)
    body = ""
    # 28 background frames
    for i in range(28):
        body += rect_svg(s(0), s(i * 15), s(68), s(15), f"Vol {i}", color(i % 7), 8)
    # Thumb
    body += rect_svg(s(0), s(422), s(14), s(11), "Th P", color(7))
    body += rect_svg(s(15), s(422), s(14), s(11), "Thumb", color(8))
    return "VOLUME", w, h, svg_wrap(w, h, body)


def generate_balance():
    """BALANCE.PNG - same layout as VOLUME"""
    _, w, h, svg = generate_volume()
    # Replace VOLUME label references with BALANCE
    svg = svg.replace("Vol ", "Bal ")
    return "BALANCE", w, h, svg


def generate_posbar():
    """POSBAR.PNG - 307x10"""
    w, h = s(307), s(10)
    regions = [
        (0, 0, 248, 10, "Seek Bar Background"),
        (248, 0, 29, 10, "Thumb"),
        (278, 0, 29, 10, "Thumb P"),
    ]
    body = ""
    for i, (x, y, rw, rh, label) in enumerate(regions):
        body += rect_svg(s(x), s(y), s(rw), s(rh), label, color(i))
    return "POSBAR", w, h, svg_wrap(w, h, body)


def generate_shufrep():
    """SHUFREP.PNG - 92x85"""
    w, h = s(92), s(85)
    regions = [
        # Repeat (left column, 28px wide)
        (0, 0, 28, 15, "Rep Off"),
        (0, 15, 28, 15, "Rep Off P"),
        (0, 30, 28, 15, "Rep On"),
        (0, 45, 28, 15, "Rep On P"),
        # Shuffle (right of repeat, 47px wide)
        (28, 0, 47, 15, "Shuffle Off"),
        (28, 15, 47, 15, "Shuffle Off P"),
        (28, 30, 47, 15, "Shuffle On"),
        (28, 45, 47, 15, "Shuffle On P"),
        # EQ/PL buttons
        (0, 61, 23, 12, "EQ Off"),
        (0, 73, 23, 12, "EQ On"),
        (23, 61, 23, 12, "PL Off"),
        (23, 73, 23, 12, "PL On"),
    ]
    body = ""
    for i, (x, y, rw, rh, label) in enumerate(regions):
        body += rect_svg(s(x), s(y), s(rw), s(rh), label, color(i))
    return "SHUFREP", w, h, svg_wrap(w, h, body)


def generate_playpaus():
    """PLAYPAUS.PNG - 42x9 (27x9 used)"""
    w, h = s(42), s(9)
    regions = [
        (0, 0, 9, 9, "Play"),
        (9, 0, 9, 9, "Pause"),
        (18, 0, 9, 9, "Stop"),
    ]
    body = ""
    for i, (x, y, rw, rh, label) in enumerate(regions):
        body += rect_svg(s(x), s(y), s(rw), s(rh), label, color(i))
    return "PLAYPAUS", w, h, svg_wrap(w, h, body)


def generate_monoster():
    """MONOSTER.PNG - 56x24"""
    w, h = s(56), s(24)
    regions = [
        (0, 0, 29, 12, "Stereo On"),
        (0, 12, 29, 12, "Stereo Off"),
        (29, 0, 27, 12, "Mono On"),
        (29, 12, 27, 12, "Mono Off"),
    ]
    body = ""
    for i, (x, y, rw, rh, label) in enumerate(regions):
        body += rect_svg(s(x), s(y), s(rw), s(rh), label, color(i))
    return "MONOSTER", w, h, svg_wrap(w, h, body)


def generate_numbers():
    """NUMBERS.PNG - 99x13"""
    w, h = s(99), s(13)
    body = ""
    for i in range(10):
        body += rect_svg(s(i * 9), s(0), s(9), s(13), str(i), color(i))
    body += rect_svg(s(90), s(0), s(9), s(13), "-", color(10))
    return "NUMBERS", w, h, svg_wrap(w, h, body)


def generate_text():
    """TEXT.PNG - 155x18 (31 cols x 3 rows, each char 5x6)"""
    w, h = s(155), s(18)
    row0 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ\"@ _"  # 30 visible chars
    row1 = "0123456789...:()-'!_+\\/[]^&%"
    row2 = ",=$#"

    body = ""
    ci = 0
    for col, ch in enumerate(row0):
        if ch == "_":  # unused slot
            continue
        body += rect_svg(s(col * 5), s(0), s(5), s(6), ch if ch != " " else "SP", color(ci), 7)
        ci += 1
    for col, ch in enumerate(row1):
        body += rect_svg(s(col * 5), s(6), s(5), s(6), ch, color(ci), 7)
        ci += 1
    for col, ch in enumerate(row2):
        body += rect_svg(s(col * 5), s(12), s(5), s(6), ch, color(ci), 7)
        ci += 1
    return "TEXT", w, h, svg_wrap(w, h, body)


def generate_eqmain():
    """EQMAIN.PNG - 275x315"""
    w, h = s(275), s(315)
    regions = [
        # Background and title
        (0, 0, 275, 116, "EQ Background"),
        (0, 134, 275, 14, "Title Bar Active"),
        (0, 149, 275, 14, "Title Bar Inactive"),
        # Window buttons
        (0, 116, 9, 9, "Close"),
        (0, 125, 9, 9, "Close P"),
        (254, 152, 9, 9, "Shade"),
        # ON button states
        (10, 119, 26, 12, "ON off"),
        (128, 119, 26, 12, "ON off P"),
        (69, 119, 26, 12, "ON on"),
        (187, 119, 26, 12, "ON on P"),
        # AUTO button states
        (36, 119, 32, 12, "AUTO off"),
        (154, 119, 32, 12, "AUTO off P"),
        (95, 119, 32, 12, "AUTO on"),
        (213, 119, 32, 12, "AUTO on P"),
        # PRESETS
        (224, 164, 44, 12, "PRESETS"),
        (224, 176, 44, 12, "PRESETS P"),
        # Slider thumb
        (0, 164, 11, 11, "Thumb"),
        (0, 176, 11, 11, "Thumb P"),
        # Graph
        (0, 294, 113, 19, "Graph BG"),
        (115, 294, 1, 19, "Colors"),
        (0, 314, 113, 1, "Preamp Line"),
    ]
    body = ""
    for i, (x, y, rw, rh, label) in enumerate(regions):
        body += rect_svg(s(x), s(y), s(rw), s(rh), label, color(i))

    # EQ slider frames (28 frames in 14x2 grid at (13, 164))
    for frame in range(28):
        col = frame % 14
        row = frame // 14
        fx = 13 + col * 15
        fy = 164 + row * 65
        body += rect_svg(s(fx), s(fy), s(15), s(65), f"S{frame}", color(frame % 7), 8)

    return "EQMAIN", w, h, svg_wrap(w, h, body)


def generate_eq_ex():
    """EQ_EX.PNG - 275x56"""
    w, h = s(275), s(56)
    regions = [
        (0, 0, 275, 14, "Shade BG Active"),
        (0, 15, 275, 14, "Shade BG Inactive"),
        # Volume thumb segments
        (1, 30, 3, 7, "VL"),
        (4, 30, 3, 7, "VC"),
        (7, 30, 3, 7, "VR"),
        # Balance thumb segments
        (11, 30, 3, 7, "BL"),
        (14, 30, 3, 7, "BC"),
        (17, 30, 3, 7, "BR"),
        # Buttons
        (1, 38, 9, 9, "Sh P"),
        (1, 47, 9, 9, "ShSh P"),
        (11, 38, 9, 9, "Close"),
        (11, 47, 9, 9, "Close P"),
    ]
    body = ""
    for i, (x, y, rw, rh, label) in enumerate(regions):
        body += rect_svg(s(x), s(y), s(rw), s(rh), label, color(i))
    return "EQ_EX", w, h, svg_wrap(w, h, body)


def generate_pledit():
    """PLEDIT.PNG - 276x110"""
    w, h = s(276), s(110)
    regions = [
        # Title bar active
        (0, 0, 25, 20, "TL Act"),
        (26, 0, 100, 20, "Title Active"),
        (127, 0, 25, 20, "Fill Act"),
        (153, 0, 25, 20, "TR Act"),
        # Title bar inactive
        (0, 21, 25, 20, "TL Inact"),
        (26, 21, 100, 20, "Title Inactive"),
        (127, 21, 25, 20, "Fill Inact"),
        (153, 21, 25, 20, "TR Inact"),
        # Side borders
        (0, 42, 12, 29, "L Border"),
        (31, 42, 20, 29, "R Border"),
        # Scrollbar
        (52, 53, 8, 18, "Scroll"),
        (61, 53, 8, 18, "Scroll A"),
        # Buttons
        (52, 42, 9, 9, "Close P"),
        (62, 42, 9, 9, "Shade P"),
        # Bottom
        (179, 0, 25, 38, "Bot Fill"),
        (0, 72, 125, 38, "Bot Left"),
        (126, 72, 150, 38, "Bot Right"),
        # Shade
        (72, 42, 25, 14, "ShL Act"),
        (72, 57, 25, 14, "ShL Inact"),
        (99, 42, 50, 14, "ShR Act"),
        (99, 57, 50, 14, "ShR Inact"),
    ]
    body = ""
    for i, (x, y, rw, rh, label) in enumerate(regions):
        body += rect_svg(s(x), s(y), s(rw), s(rh), label, color(i))
    return "PLEDIT", w, h, svg_wrap(w, h, body)


def generate_gen():
    """GEN.PNG - placeholder (not currently used for rendering)"""
    w, h = s(275), s(116)
    body = rect_svg(0, 0, w, h, "GEN (reserved)", color(0), 16)
    return "GEN", w, h, svg_wrap(w, h, body)


def generate_genex():
    """GENEX.PNG - placeholder (not currently used for rendering)"""
    w, h = s(275), s(116)
    body = rect_svg(0, 0, w, h, "GENEX (reserved)", color(1), 16)
    return "GENEX", w, h, svg_wrap(w, h, body)


def generate_nums_ex():
    """NUMS_EX.PNG - extended digits, same layout as NUMBERS"""
    _, w, h, svg = generate_numbers()
    svg = svg.replace(">0<", ">0x<").replace(">1<", ">1x<")
    return "NUMS_EX", w, h, svg


def main():
    generators = [
        generate_main,
        generate_titlebar,
        generate_cbuttons,
        generate_volume,
        generate_balance,
        generate_posbar,
        generate_shufrep,
        generate_playpaus,
        generate_monoster,
        generate_numbers,
        generate_nums_ex,
        generate_text,
        generate_eqmain,
        generate_eq_ex,
        generate_pledit,
        generate_gen,
        generate_genex,
    ]

    svg_dir = os.path.join(OUTPUT_DIR, "svg")
    png_dir = OUTPUT_DIR
    os.makedirs(svg_dir, exist_ok=True)

    for gen in generators:
        name, w, h, svg_content = gen()
        svg_path = os.path.join(svg_dir, f"{name}.svg")
        png_path = os.path.join(png_dir, f"{name}.PNG")

        # Write SVG
        with open(svg_path, "w") as f:
            f.write(svg_content)
        print(f"  SVG: {svg_path} ({w}x{h})")

        # Render to PNG using rsvg-convert
        try:
            subprocess.run(
                ["rsvg-convert", "-w", str(w), "-h", str(h), "-o", png_path, svg_path],
                check=True,
                capture_output=True,
            )
            print(f"  PNG: {png_path}")
        except subprocess.CalledProcessError as e:
            print(f"  ERROR rendering {name}: {e.stderr.decode()}")
        except FileNotFoundError:
            print("  ERROR: rsvg-convert not found. Install with: brew install librsvg")
            return

    # Generate skin.json
    manifest_path = os.path.join(png_dir, "skin.json")
    with open(manifest_path, "w") as f:
        f.write('{\n  "formatVersion": 1,\n  "assetScale": 2\n}\n')
    print(f"\n  Manifest: {manifest_path}")

    # Generate example config files
    viscolor_path = os.path.join(png_dir, "VISCOLOR.TXT")
    with open(viscolor_path, "w") as f:
        viscolors = [
            "0,0,0",
            "24,33,41",
            "239,49,16",
            "206,41,16",
            "214,90,0",
            "214,102,0",
            "214,115,0",
            "198,123,0",
            "222,165,24",
            "214,181,33",
            "189,222,41",
            "148,222,33",
            "41,206,16",
            "50,190,16",
            "57,181,16",
            "49,156,8",
            "41,148,0",
            "24,132,8",
            "255,255,255",
            "214,214,222",
            "181,189,189",
            "160,170,175",
            "148,156,165",
            "150,150,150",
        ]
        f.write("\n".join(viscolors) + "\n")
    print(f"  Config: {viscolor_path}")

    pledit_txt_path = os.path.join(png_dir, "PLEDIT.TXT")
    with open(pledit_txt_path, "w") as f:
        f.write("""[Text]
Normal=#00FF00
Current=#FFFFFF
NormalBG=#000000
SelectedBG=#0000FF
Font=Arial
""")
    print(f"  Config: {pledit_txt_path}")

    print(f"\nDone! Template skin files are in: {png_dir}")
    print("To create a .msz skin, ZIP all PNG files + skin.json + config TXT files.")


if __name__ == "__main__":
    main()
