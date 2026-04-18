# Minamp HD Skin Format Specification

**Format Version:** 1
**File Extension:** `.msz`

## Overview

Minamp HD skins use the `.msz` format — a ZIP archive containing high-resolution PNG sprite sheets and a JSON manifest. The layout mirrors the classic Winamp `.wsz` skin format but at 2x or 3x resolution, with PNG transparency instead of magenta masking.

## Archive Structure

```
MySkin.msz (ZIP archive)
├── skin.json          ← Required manifest
├── MAIN.PNG           ← Main window background
├── TITLEBAR.PNG       ← Title bar and shade mode sprites
├── CBUTTONS.PNG       ← Transport control buttons
├── VOLUME.PNG         ← Volume slider backgrounds + thumb
├── BALANCE.PNG        ← Balance slider (optional — falls back to VOLUME.PNG)
├── POSBAR.PNG         ← Seek/position bar
├── SHUFREP.PNG        ← Shuffle, repeat, EQ, PL toggle buttons
├── MONOSTER.PNG       ← Mono/stereo indicators
├── NUMBERS.PNG        ← Time display digits
├── TEXT.PNG           ← Bitmap font for marquee/text display
├── PLAYPAUS.PNG       ← Play/pause/stop status indicators
├── EQMAIN.PNG         ← Equalizer window background and controls
├── EQ_EX.PNG          ← EQ shade mode sprites
├── PLEDIT.PNG         ← Playlist window sprites
├── VISCOLOR.TXT       ← 24-line visualizer color palette
├── PLEDIT.TXT         ← Playlist colors and font (INI format)
└── REGION.TXT         ← Non-rectangular window regions (optional)
```

> Files may be in subdirectories within the archive — only the filename matters. Filenames are matched **case-insensitively** (they are uppercased before lookup).

## skin.json Manifest

Every `.msz` archive **must** contain a `skin.json` file:

```json
{
  "formatVersion": 1,
  "assetScale": 2
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `formatVersion` | integer | Yes | Must be `1` |
| `assetScale` | integer | Yes | Must be `2` or `3` |

The `assetScale` tells Minamp how to interpret the pixel coordinates. All sprite regions in this spec are defined in **1x skin pixels** (matching classic Winamp's 275×116 main window). Your PNG files should contain those regions multiplied by your chosen `assetScale`:

- **2x**: every 1x coordinate and dimension × 2
- **3x**: every 1x coordinate and dimension × 3

For example, the main window background at 1x is 275×116. At 2x, your `MAIN.PNG` should be at least **550×232** pixels.

## Transparency

Classic `.wsz` skins use magenta (`#FF00FF`) as a transparency mask on BMP files. HD `.msz` skins use **native PNG alpha channels** instead. Any pixel with alpha < 255 will be transparent.

## Archive Limits

| Limit | Value |
|---|---|
| Maximum archive size | 10 MB |
| Maximum ZIP entries | 100 |
| Maximum decompressed total | 50 MB |

---

## Sprite Sheet Reference

All coordinates below are in **1x skin pixels**. Multiply every value by your `assetScale` for the actual pixel positions in your PNG files.

### Coordinate Convention

All rectangles are specified as `(x, y, width, height)` where `(x, y)` is the **top-left corner** of the region.

---

### MAIN.PNG

**1x dimensions:** 275 × 116
**2x dimensions:** 550 × 232

The full main window background. This is the base layer onto which all other elements (buttons, displays, sliders) are composited.

| Region | x | y | w | h | Description |
|---|---|---|---|---|---|
| Background | 0 | 0 | 275 | 116 | Full main window background |

---

### TITLEBAR.PNG

**1x minimum dimensions:** 302 × 56

Contains the main window title bar (active and inactive states), window control buttons, and shade mode sprites.

#### Title Bar

| Region | x | y | w | h | Description |
|---|---|---|---|---|---|
| Active title bar | 27 | 0 | 275 | 14 | Title bar when window is focused |
| Inactive title bar | 27 | 15 | 275 | 14 | Title bar when window is unfocused |

#### Window Control Buttons (top-left corner area)

| Region | x | y | w | h | Description |
|---|---|---|---|---|---|
| Shade button | 0 | 0 | 9 | 9 | Normal state |
| Shade button pressed | 0 | 9 | 9 | 9 | Pressed state |
| Minimize button | 9 | 0 | 9 | 9 | Normal state |
| Minimize button pressed | 9 | 9 | 9 | 9 | Pressed state |
| Close button | 18 | 0 | 9 | 9 | Normal state |
| Close button pressed | 18 | 9 | 9 | 9 | Pressed state |

#### Shade Mode (14px collapsed view)

| Region | x | y | w | h | Description |
|---|---|---|---|---|---|
| Shade background (focused) | 27 | 29 | 275 | 14 | Shade bar when selected/focused |
| Shade background (unfocused) | 27 | 42 | 275 | 14 | Shade bar when not selected |
| Shade toggle button | 0 | 18 | 9 | 9 | Normal state |
| Shade toggle pressed | 9 | 18 | 9 | 9 | Pressed state |
| Shade position bg | 0 | 36 | 17 | 7 | Seek bar background in shade mode |
| Shade position thumb | 20 | 36 | 3 | 7 | Seek bar thumb in shade mode |

---

### CBUTTONS.PNG

**1x dimensions:** 136 × 36

Transport control buttons, each with normal and pressed states stacked vertically.

| Region | x | y | w | h | Description |
|---|---|---|---|---|---|
| Previous | 0 | 0 | 23 | 18 | Normal |
| Previous pressed | 0 | 18 | 23 | 18 | Pressed |
| Play | 23 | 0 | 23 | 18 | Normal |
| Play pressed | 23 | 18 | 23 | 18 | Pressed |
| Pause | 46 | 0 | 23 | 18 | Normal |
| Pause pressed | 46 | 18 | 23 | 18 | Pressed |
| Stop | 69 | 0 | 23 | 18 | Normal |
| Stop pressed | 69 | 18 | 23 | 18 | Pressed |
| Next | 92 | 0 | 22 | 18 | Normal |
| Next pressed | 92 | 18 | 22 | 18 | Pressed |
| Eject | 114 | 0 | 22 | 16 | Normal |
| Eject pressed | 114 | 16 | 22 | 16 | Pressed |

---

### VOLUME.PNG

**1x dimensions:** 68 × 433

Contains 28 volume slider background frames (showing fill level) stacked vertically, plus the slider thumb.

#### Background Frames

28 frames, each 68×15 pixels, stacked from y=0 to y=419. Frame 0 (y=0) is empty/minimum volume; frame 27 (y=405) is full volume.

| Region | x | y | w | h | Description |
|---|---|---|---|---|---|
| Frame *i* (0–27) | 0 | *i* × 15 | 68 | 15 | Volume level frame |

#### Thumb

| Region | x | y | w | h | Description |
|---|---|---|---|---|---|
| Thumb pressed | 0 | 422 | 14 | 11 | Pressed/active thumb |
| Thumb normal | 15 | 422 | 14 | 11 | Normal thumb |

---

### BALANCE.PNG (Optional)

Same layout as VOLUME.PNG. If omitted, the volume sprite sheet is reused for the balance slider.

---

### POSBAR.PNG

**1x dimensions:** 307 × 10

The seek/position slider with background and two thumb states side by side.

| Region | x | y | w | h | Description |
|---|---|---|---|---|---|
| Background | 0 | 0 | 248 | 10 | Seek bar track |
| Thumb normal | 248 | 0 | 29 | 10 | Normal thumb |
| Thumb pressed | 278 | 0 | 29 | 10 | Pressed thumb |

---

### SHUFREP.PNG

**1x dimensions:** 92 × 85

Toggle buttons for shuffle, repeat, EQ window, and playlist window.

#### Shuffle Button (47×15, 4 states)

| Region | x | y | w | h | Description |
|---|---|---|---|---|---|
| Off | 28 | 0 | 47 | 15 | Inactive, normal |
| Off pressed | 28 | 15 | 47 | 15 | Inactive, pressed |
| On | 28 | 30 | 47 | 15 | Active, normal |
| On pressed | 28 | 45 | 47 | 15 | Active, pressed |

#### Repeat Button (28×15, 4 states)

| Region | x | y | w | h | Description |
|---|---|---|---|---|---|
| Off | 0 | 0 | 28 | 15 | Inactive, normal |
| Off pressed | 0 | 15 | 28 | 15 | Inactive, pressed |
| On | 0 | 30 | 28 | 15 | Active, normal |
| On pressed | 0 | 45 | 28 | 15 | Active, pressed |

#### EQ & PL Window Toggle Buttons (23×12, 2 states each)

| Region | x | y | w | h | Description |
|---|---|---|---|---|---|
| EQ off | 0 | 61 | 23 | 12 | EQ window closed |
| EQ on | 0 | 73 | 23 | 12 | EQ window open |
| PL off | 23 | 61 | 23 | 12 | Playlist window closed |
| PL on | 23 | 73 | 23 | 12 | Playlist window open |

---

### PLAYPAUS.PNG

**1x dimensions:** 42 × 9 (minimum; only first 27×9 used)

Playback status indicator lights.

| Region | x | y | w | h | Description |
|---|---|---|---|---|---|
| Playing | 0 | 0 | 9 | 9 | Play indicator |
| Paused | 9 | 0 | 9 | 9 | Pause indicator |
| Stopped | 18 | 0 | 9 | 9 | Stop indicator |

---

### MONOSTER.PNG

**1x dimensions:** 56 × 24

Mono/stereo channel indicators with on/off states.

| Region | x | y | w | h | Description |
|---|---|---|---|---|---|
| Stereo on | 0 | 0 | 29 | 12 | Stereo indicator lit |
| Stereo off | 0 | 12 | 29 | 12 | Stereo indicator dim |
| Mono on | 29 | 0 | 27 | 12 | Mono indicator lit |
| Mono off | 29 | 12 | 27 | 12 | Mono indicator dim |

---

### NUMBERS.PNG

**1x dimensions:** 99 × 13

Time display digit sprites arranged horizontally.

| Region | x | y | w | h | Description |
|---|---|---|---|---|---|
| Digit 0 | 0 | 0 | 9 | 13 | |
| Digit 1 | 9 | 0 | 9 | 13 | |
| Digit 2 | 18 | 0 | 9 | 13 | |
| Digit 3 | 27 | 0 | 9 | 13 | |
| Digit 4 | 36 | 0 | 9 | 13 | |
| Digit 5 | 45 | 0 | 9 | 13 | |
| Digit 6 | 54 | 0 | 9 | 13 | |
| Digit 7 | 63 | 0 | 9 | 13 | |
| Digit 8 | 72 | 0 | 9 | 13 | |
| Digit 9 | 81 | 0 | 9 | 13 | |
| Minus (−) | 90 | 0 | 9 | 13 | |

---

### TEXT.PNG

**1x dimensions:** 155 × 18

Bitmap font for the scrolling marquee and text displays. Characters are **5×6 pixels** each, arranged in a **31-column × 3-row** grid.

#### Row 0 (y = 0): Letters and Symbols

| Columns | Characters |
|---|---|
| 0–25 | `A B C D E F G H I J K L M N O P Q R S T U V W X Y Z` |
| 26 | `"` (double quote) |
| 27 | `@` |
| 28–29 | (unused) |
| 30 | ` ` (space) |

#### Row 1 (y = 6): Numbers and Punctuation

| Columns | Characters |
|---|---|
| 0–9 | `0 1 2 3 4 5 6 7 8 9` |
| 10 | `…` (ellipsis) |
| 11 | `.` (period) |
| 12 | `:` (colon) |
| 13 | `(` |
| 14 | `)` |
| 15 | `-` (dash) |
| 16 | `'` (apostrophe) |
| 17 | `!` |
| 18 | `_` (underscore) |
| 19 | `+` |
| 20 | `\` |
| 21 | `/` |
| 22 | `[` |
| 23 | `]` |
| 24 | `^` |
| 25 | `&` |
| 26 | `%` |

#### Row 2 (y = 12): Additional Punctuation

| Columns | Characters |
|---|---|
| 0 | `,` (comma) |
| 1 | `=` |
| 2 | `$` |
| 3 | `#` |
| 4–30 | (unused) |

> The font is case-insensitive — lowercase letters use the same glyphs as uppercase.

---

### EQMAIN.PNG

**1x minimum dimensions:** 275 × 315

The equalizer window background, title bar, control buttons, slider thumb, and graph display.

#### Background and Title Bar

| Region | x | y | w | h | Description |
|---|---|---|---|---|---|
| Background | 0 | 0 | 275 | 116 | EQ window background |
| Title bar active | 0 | 134 | 275 | 14 | Title bar when focused |
| Title bar inactive | 0 | 149 | 275 | 14 | Title bar when unfocused |

#### Window Buttons

| Region | x | y | w | h | Description |
|---|---|---|---|---|---|
| Close button | 0 | 116 | 9 | 9 | Normal |
| Close button pressed | 0 | 125 | 9 | 9 | Pressed |
| Shade button | 254 | 152 | 9 | 9 | Normal |

#### Control Buttons

| Region | x | y | w | h | Description |
|---|---|---|---|---|---|
| ON off | 10 | 119 | 26 | 12 | EQ disabled, normal |
| ON off pressed | 128 | 119 | 26 | 12 | EQ disabled, pressed |
| ON on | 69 | 119 | 26 | 12 | EQ enabled, normal |
| ON on pressed | 187 | 119 | 26 | 12 | EQ enabled, pressed |
| AUTO off | 36 | 119 | 32 | 12 | Auto-EQ disabled, normal |
| AUTO off pressed | 154 | 119 | 32 | 12 | Auto-EQ disabled, pressed |
| AUTO on | 95 | 119 | 32 | 12 | Auto-EQ enabled, normal |
| AUTO on pressed | 213 | 119 | 32 | 12 | Auto-EQ enabled, pressed |
| PRESETS | 224 | 164 | 44 | 12 | Normal |
| PRESETS pressed | 224 | 176 | 44 | 12 | Pressed |

#### Slider Thumb

| Region | x | y | w | h | Description |
|---|---|---|---|---|---|
| Thumb normal | 0 | 164 | 11 | 11 | EQ band slider thumb |
| Thumb pressed | 0 | 176 | 11 | 11 | Pressed state |

#### EQ Slider Background Frames

28 background frames for the vertical EQ sliders, arranged in a **14-column × 2-row** grid starting at position (13, 164). Each frame is **15×65** pixels.

| Frame | Column | Row | x | y | w | h |
|---|---|---|---|---|---|---|
| 0 | 0 | 0 | 13 | 164 | 15 | 65 |
| 1 | 1 | 0 | 28 | 164 | 15 | 65 |
| ... | ... | ... | 13 + col×15 | 164 + row×65 | 15 | 65 |
| 13 | 13 | 0 | 208 | 164 | 15 | 65 |
| 14 | 0 | 1 | 13 | 229 | 15 | 65 |
| ... | ... | ... | ... | ... | ... | ... |
| 27 | 13 | 1 | 208 | 229 | 15 | 65 |

#### Graph Display

| Region | x | y | w | h | Description |
|---|---|---|---|---|---|
| Graph background | 0 | 294 | 113 | 19 | EQ curve display background |
| Graph line colors | 115 | 294 | 1 | 19 | 19-pixel color strip for curve |
| Preamp line | 0 | 314 | 113 | 1 | Horizontal preamp reference line |

---

### EQ_EX.PNG

**1x minimum dimensions:** 275 × 56

EQ shade mode (collapsed 14px view) sprites.

#### Shade Backgrounds

| Region | x | y | w | h | Description |
|---|---|---|---|---|---|
| Active | 0 | 0 | 275 | 14 | Shade bar when focused |
| Inactive | 0 | 15 | 275 | 14 | Shade bar when unfocused |

#### Shade Slider Thumbs (3×7 each)

| Region | x | y | w | h | Description |
|---|---|---|---|---|---|
| Volume thumb left | 1 | 30 | 3 | 7 | Left portion |
| Volume thumb center | 4 | 30 | 3 | 7 | Center portion |
| Volume thumb right | 7 | 30 | 3 | 7 | Right portion |
| Balance thumb left | 11 | 30 | 3 | 7 | Left portion |
| Balance thumb center | 14 | 30 | 3 | 7 | Center portion |
| Balance thumb right | 17 | 30 | 3 | 7 | Right portion |

#### Shade Buttons

| Region | x | y | w | h | Description |
|---|---|---|---|---|---|
| Shade button pressed | 1 | 38 | 9 | 9 | Maximize pressed |
| Shade button pressed (in shade) | 1 | 47 | 9 | 9 | Shade toggle pressed |
| Close button | 11 | 38 | 9 | 9 | Normal |
| Close button pressed | 11 | 47 | 9 | 9 | Pressed |

---

### PLEDIT.PNG

**1x minimum dimensions:** 276 × 110

Playlist window sprites — title bar segments, borders, scrollbar, and bottom sections.

#### Title Bar — Active (Focused)

| Region | x | y | w | h | Description |
|---|---|---|---|---|---|
| Left corner | 0 | 0 | 25 | 20 | Left edge with close button |
| Title text | 26 | 0 | 100 | 20 | Center title area |
| Fill tile | 127 | 0 | 25 | 20 | Repeating fill between title and right |
| Right corner | 153 | 0 | 25 | 20 | Right edge with shade button |

#### Title Bar — Inactive (Unfocused)

| Region | x | y | w | h | Description |
|---|---|---|---|---|---|
| Left corner | 0 | 21 | 25 | 20 | Left edge |
| Title text | 26 | 21 | 100 | 20 | Center title area |
| Fill tile | 127 | 21 | 25 | 20 | Repeating fill |
| Right corner | 153 | 21 | 25 | 20 | Right edge |

#### Side Borders (tiled vertically)

| Region | x | y | w | h | Description |
|---|---|---|---|---|---|
| Left border | 0 | 42 | 12 | 29 | Tiled down left edge |
| Right border | 31 | 42 | 20 | 29 | Tiled down right edge (includes scrollbar track) |

#### Scrollbar

| Region | x | y | w | h | Description |
|---|---|---|---|---|---|
| Handle normal | 52 | 53 | 8 | 18 | Scrollbar thumb |
| Handle active | 61 | 53 | 8 | 18 | Scrollbar thumb when dragging |

#### Title Bar Buttons (pressed states only — normal states are part of corner sprites)

| Region | x | y | w | h | Description |
|---|---|---|---|---|---|
| Close pressed | 52 | 42 | 9 | 9 | Close button pressed overlay |
| Shade pressed | 62 | 42 | 9 | 9 | Shade button pressed overlay |

#### Bottom Section

| Region | x | y | w | h | Description |
|---|---|---|---|---|---|
| Fill tile | 179 | 0 | 25 | 38 | Repeating fill for bottom bar |
| Left corner | 0 | 72 | 125 | 38 | Bottom-left with action buttons |
| Right corner | 126 | 72 | 150 | 38 | Bottom-right with resize handle |

#### Shade Mode (14px collapsed view)

| Region | x | y | w | h | Description |
|---|---|---|---|---|---|
| Left active | 72 | 42 | 25 | 14 | Left edge when focused |
| Left inactive | 72 | 57 | 25 | 14 | Left edge when unfocused |
| Right active | 99 | 42 | 50 | 14 | Right edge when focused |
| Right inactive | 99 | 57 | 50 | 14 | Right edge when unfocused |

---

## Configuration Files

### VISCOLOR.TXT

A 24-line text file defining the visualizer color palette. Each line contains an RGB triplet:

```
0,0,0
24,33,41
...
```

Lines 1–16 define the spectrum analyzer bar colors (bottom to top). Lines 17–24 define oscilloscope and peak colors. See classic Winamp documentation for the full color table.

### PLEDIT.TXT

An INI-format file defining playlist window colors and font:

```ini
[Text]
Normal=#00FF00
Current=#FFFFFF
NormalBG=#000000
SelectedBG=#0000FF
Font=Arial
```

| Key | Description |
|---|---|
| `Normal` | Default track text color |
| `Current` | Currently playing track text color |
| `NormalBG` | Playlist background color |
| `SelectedBG` | Selected track highlight color |
| `Font` | Font name for playlist text |

### REGION.TXT

Defines non-rectangular window shapes using point lists. Optional — if omitted, windows use standard rectangular shapes.

---

## Main Window Element Placement

These positions define where sprites are composited onto the 275×116 main window (in 1x skin pixels):

| Element | x | y | Notes |
|---|---|---|---|
| Title bar | 0 | 0 | 275×14 |
| Play status light | 24 | 28 | 9×9 |
| Time minus sign | 36 | 26 | 9×13 |
| Minute tens digit | 48 | 26 | 9×13 |
| Minute ones digit | 60 | 26 | 9×13 |
| Second tens digit | 78 | 26 | 9×13 |
| Second ones digit | 90 | 26 | 9×13 |
| Marquee text | 111 | 27 | 154×6 |
| kbps text | 111 | 43 | Bitmap font |
| khz text | 156 | 43 | Bitmap font |
| Mono indicator | 212 | 41 | 27×12 |
| Stereo indicator | 239 | 41 | 29×12 |
| Visualizer | 24 | 43 | 76×16 |
| Volume slider | 107 | 57 | 68×14 |
| Balance slider | 177 | 57 | 38×14 |
| EQ toggle | 219 | 58 | 23×12 |
| PL toggle | 242 | 58 | 23×12 |
| Seek bar | 16 | 72 | 248×10 |
| Previous | 16 | 88 | 23×18 |
| Play | 39 | 88 | 23×18 |
| Pause | 62 | 88 | 23×18 |
| Stop | 85 | 88 | 23×18 |
| Next | 108 | 88 | 22×18 |
| Eject | 136 | 89 | 22×16 |
| Shuffle | 164 | 89 | 47×15 |
| Repeat | 210 | 89 | 28×15 |
| Close button | 264 | 3 | 9×9 |
| Minimize button | 244 | 3 | 9×9 |
| Shade button | 254 | 3 | 9×9 |

## EQ Window Element Placement

| Element | x | y | Notes |
|---|---|---|---|
| Background | 0 | 0 | 275×116 |
| Title bar | 0 | 0 | 275×14 |
| Close button | 264 | 3 | 9×9 |
| Shade toggle | 254 | 3 | 9×9 |
| ON button | 14 | 18 | 26×12 |
| AUTO button | 40 | 18 | 32×12 |
| PRESETS button | 217 | 18 | 44×12 |
| Graph display | 86 | 17 | 113×19 |
| Preamp slider | 21 | 38 | 15×63 |
| Band sliders | 78, 96, 114, 132, 150, 168, 186, 204, 222, 240 | 38 | 15×63 each |

## Tips for Skin Authors

1. **Start with the templates.** The PNG files included in this package show every region with labeled outlines. Use them as a base layer in your image editor.

2. **Work at 2x scale.** This is the recommended default. 3x is supported but produces much larger files with diminishing returns on most displays.

3. **Use PNG alpha for transparency.** No need for the old magenta masking trick.

4. **Test incrementally.** You can load partially complete skins — missing files fall back to defaults gracefully.

5. **Keep file sizes reasonable.** The total decompressed size must stay under 50 MB. At 2x, typical skins are well under 1 MB total.

6. **Match the layout exactly.** The sprite sheet layout is not configurable — every region must be in the exact position specified above. The template PNGs show these positions precisely.
