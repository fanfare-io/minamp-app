// ---------------------------------------------------------------------------
// Sprite sheet definitions for all Winamp skin sprite sheets.
// Coordinates are in 1x skin pixels — multiply by assetScale for actual PNGs.
// Sourced from SpriteExtractor.swift and SKIN_FORMAT.md.
// ---------------------------------------------------------------------------

export interface SpriteRegion {
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SpriteSheetDef {
  fileName: string;
  frameName: string;
  width: number;
  height: number;
  required: boolean;
  regions: SpriteRegion[];
}

// -- Placement types for the preview compositor -----------------------------

export interface ElementPlacement {
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

// ---------------------------------------------------------------------------
// MAIN.PNG — Full main window background
// ---------------------------------------------------------------------------

const MAIN: SpriteSheetDef = {
  fileName: "MAIN.PNG",
  frameName: "MAIN",
  width: 275,
  height: 116,
  required: true,
  regions: [
    { name: "Background", x: 0, y: 0, width: 275, height: 116 },
  ],
};

// ---------------------------------------------------------------------------
// TITLEBAR.PNG — Title bar, window buttons, and shade mode
// ---------------------------------------------------------------------------

const TITLEBAR: SpriteSheetDef = {
  fileName: "TITLEBAR.PNG",
  frameName: "TITLEBAR",
  width: 302,
  height: 56,
  required: true,
  regions: [
    // Window control buttons (top-left area)
    { name: "Shade button", x: 0, y: 0, width: 9, height: 9 },
    { name: "Shade button pressed", x: 0, y: 9, width: 9, height: 9 },
    { name: "Minimize button", x: 9, y: 0, width: 9, height: 9 },
    { name: "Minimize button pressed", x: 9, y: 9, width: 9, height: 9 },
    { name: "Close button", x: 18, y: 0, width: 9, height: 9 },
    { name: "Close button pressed", x: 18, y: 9, width: 9, height: 9 },
    // Title bars
    { name: "Active title bar", x: 27, y: 0, width: 275, height: 14 },
    { name: "Inactive title bar", x: 27, y: 15, width: 275, height: 14 },
    // Shade mode
    { name: "Shade toggle button", x: 0, y: 18, width: 9, height: 9 },
    { name: "Shade toggle pressed", x: 9, y: 18, width: 9, height: 9 },
    { name: "Shade background focused", x: 27, y: 29, width: 275, height: 14 },
    { name: "Shade position bg", x: 0, y: 36, width: 17, height: 7 },
    { name: "Shade position thumb", x: 20, y: 36, width: 3, height: 7 },
    { name: "Shade background unfocused", x: 27, y: 42, width: 275, height: 14 },
  ],
};

// ---------------------------------------------------------------------------
// CBUTTONS.PNG — Transport control buttons
// ---------------------------------------------------------------------------

const CBUTTONS: SpriteSheetDef = {
  fileName: "CBUTTONS.PNG",
  frameName: "CBUTTONS",
  width: 136,
  height: 36,
  required: true,
  regions: [
    { name: "Previous", x: 0, y: 0, width: 23, height: 18 },
    { name: "Previous pressed", x: 0, y: 18, width: 23, height: 18 },
    { name: "Play", x: 23, y: 0, width: 23, height: 18 },
    { name: "Play pressed", x: 23, y: 18, width: 23, height: 18 },
    { name: "Pause", x: 46, y: 0, width: 23, height: 18 },
    { name: "Pause pressed", x: 46, y: 18, width: 23, height: 18 },
    { name: "Stop", x: 69, y: 0, width: 23, height: 18 },
    { name: "Stop pressed", x: 69, y: 18, width: 23, height: 18 },
    { name: "Next", x: 92, y: 0, width: 22, height: 18 },
    { name: "Next pressed", x: 92, y: 18, width: 22, height: 18 },
    { name: "Eject", x: 114, y: 0, width: 22, height: 16 },
    { name: "Eject pressed", x: 114, y: 16, width: 22, height: 16 },
  ],
};

// ---------------------------------------------------------------------------
// VOLUME.PNG — Volume slider backgrounds + thumb
// ---------------------------------------------------------------------------

function buildVolumeRegions(): SpriteRegion[] {
  const regions: SpriteRegion[] = [];
  for (let i = 0; i < 28; i++) {
    regions.push({
      name: `Volume frame ${i}`,
      x: 0,
      y: i * 15,
      width: 68,
      height: 15,
    });
  }
  regions.push(
    { name: "Thumb pressed", x: 0, y: 422, width: 14, height: 11 },
    { name: "Thumb normal", x: 15, y: 422, width: 14, height: 11 },
  );
  return regions;
}

const VOLUME: SpriteSheetDef = {
  fileName: "VOLUME.PNG",
  frameName: "VOLUME",
  width: 68,
  height: 433,
  required: true,
  regions: buildVolumeRegions(),
};

// ---------------------------------------------------------------------------
// BALANCE.PNG — Balance slider (optional, same layout as VOLUME)
// ---------------------------------------------------------------------------

const BALANCE: SpriteSheetDef = {
  fileName: "BALANCE.PNG",
  frameName: "BALANCE",
  width: 68,
  height: 433,
  required: false,
  regions: buildVolumeRegions(),
};

// ---------------------------------------------------------------------------
// POSBAR.PNG — Seek/position bar
// ---------------------------------------------------------------------------

const POSBAR: SpriteSheetDef = {
  fileName: "POSBAR.PNG",
  frameName: "POSBAR",
  width: 307,
  height: 10,
  required: true,
  regions: [
    { name: "Background", x: 0, y: 0, width: 248, height: 10 },
    { name: "Thumb normal", x: 248, y: 0, width: 29, height: 10 },
    { name: "Thumb pressed", x: 278, y: 0, width: 29, height: 10 },
  ],
};

// ---------------------------------------------------------------------------
// SHUFREP.PNG — Shuffle, repeat, EQ, PL toggle buttons
// ---------------------------------------------------------------------------

const SHUFREP: SpriteSheetDef = {
  fileName: "SHUFREP.PNG",
  frameName: "SHUFREP",
  width: 92,
  height: 85,
  required: true,
  regions: [
    // Repeat button (28x15, left column)
    { name: "Repeat off", x: 0, y: 0, width: 28, height: 15 },
    { name: "Repeat off pressed", x: 0, y: 15, width: 28, height: 15 },
    { name: "Repeat on", x: 0, y: 30, width: 28, height: 15 },
    { name: "Repeat on pressed", x: 0, y: 45, width: 28, height: 15 },
    // Shuffle button (47x15, right column)
    { name: "Shuffle off", x: 28, y: 0, width: 47, height: 15 },
    { name: "Shuffle off pressed", x: 28, y: 15, width: 47, height: 15 },
    { name: "Shuffle on", x: 28, y: 30, width: 47, height: 15 },
    { name: "Shuffle on pressed", x: 28, y: 45, width: 47, height: 15 },
    // EQ and PL toggles (23x12)
    { name: "EQ off", x: 0, y: 61, width: 23, height: 12 },
    { name: "EQ on", x: 0, y: 73, width: 23, height: 12 },
    { name: "PL off", x: 23, y: 61, width: 23, height: 12 },
    { name: "PL on", x: 23, y: 73, width: 23, height: 12 },
  ],
};

// ---------------------------------------------------------------------------
// PLAYPAUS.PNG — Playback status indicators
// ---------------------------------------------------------------------------

const PLAYPAUS: SpriteSheetDef = {
  fileName: "PLAYPAUS.PNG",
  frameName: "PLAYPAUS",
  width: 42,
  height: 9,
  required: true,
  regions: [
    { name: "Playing", x: 0, y: 0, width: 9, height: 9 },
    { name: "Paused", x: 9, y: 0, width: 9, height: 9 },
    { name: "Stopped", x: 18, y: 0, width: 9, height: 9 },
  ],
};

// ---------------------------------------------------------------------------
// MONOSTER.PNG — Mono/stereo channel indicators
// ---------------------------------------------------------------------------

const MONOSTER: SpriteSheetDef = {
  fileName: "MONOSTER.PNG",
  frameName: "MONOSTER",
  width: 56,
  height: 24,
  required: true,
  regions: [
    { name: "Stereo on", x: 0, y: 0, width: 29, height: 12 },
    { name: "Stereo off", x: 0, y: 12, width: 29, height: 12 },
    { name: "Mono on", x: 29, y: 0, width: 27, height: 12 },
    { name: "Mono off", x: 29, y: 12, width: 27, height: 12 },
  ],
};

// ---------------------------------------------------------------------------
// NUMBERS.PNG — Time display digits
// ---------------------------------------------------------------------------

const NUMBERS: SpriteSheetDef = {
  fileName: "NUMBERS.PNG",
  frameName: "NUMBERS",
  width: 99,
  height: 13,
  required: true,
  regions: [
    { name: "Digit 0", x: 0, y: 0, width: 9, height: 13 },
    { name: "Digit 1", x: 9, y: 0, width: 9, height: 13 },
    { name: "Digit 2", x: 18, y: 0, width: 9, height: 13 },
    { name: "Digit 3", x: 27, y: 0, width: 9, height: 13 },
    { name: "Digit 4", x: 36, y: 0, width: 9, height: 13 },
    { name: "Digit 5", x: 45, y: 0, width: 9, height: 13 },
    { name: "Digit 6", x: 54, y: 0, width: 9, height: 13 },
    { name: "Digit 7", x: 63, y: 0, width: 9, height: 13 },
    { name: "Digit 8", x: 72, y: 0, width: 9, height: 13 },
    { name: "Digit 9", x: 81, y: 0, width: 9, height: 13 },
    { name: "Minus", x: 90, y: 0, width: 9, height: 13 },
  ],
};

// ---------------------------------------------------------------------------
// NUMS_EX.PNG — Extended time display digits (optional)
// ---------------------------------------------------------------------------

const NUMS_EX: SpriteSheetDef = {
  fileName: "NUMS_EX.PNG",
  frameName: "NUMS_EX",
  width: 99,
  height: 13,
  required: false,
  regions: [
    { name: "Digit 0", x: 0, y: 0, width: 9, height: 13 },
    { name: "Digit 1", x: 9, y: 0, width: 9, height: 13 },
    { name: "Digit 2", x: 18, y: 0, width: 9, height: 13 },
    { name: "Digit 3", x: 27, y: 0, width: 9, height: 13 },
    { name: "Digit 4", x: 36, y: 0, width: 9, height: 13 },
    { name: "Digit 5", x: 45, y: 0, width: 9, height: 13 },
    { name: "Digit 6", x: 54, y: 0, width: 9, height: 13 },
    { name: "Digit 7", x: 63, y: 0, width: 9, height: 13 },
    { name: "Digit 8", x: 72, y: 0, width: 9, height: 13 },
    { name: "Digit 9", x: 81, y: 0, width: 9, height: 13 },
    { name: "Minus", x: 90, y: 0, width: 9, height: 13 },
  ],
};

// ---------------------------------------------------------------------------
// TEXT.PNG — Bitmap font (5x6 chars in 31-col x 3-row grid)
// ---------------------------------------------------------------------------

const TEXT: SpriteSheetDef = {
  fileName: "TEXT.PNG",
  frameName: "TEXT",
  width: 155,
  height: 18,
  required: true,
  regions: [
    // Row 0: A-Z, quote, @, (2 unused), space
    { name: "Row 0: A-Z, quote, @, space", x: 0, y: 0, width: 155, height: 6 },
    // Row 1: 0-9, punctuation
    { name: "Row 1: 0-9, punctuation", x: 0, y: 6, width: 155, height: 6 },
    // Row 2: comma, =, $, #, unused
    { name: "Row 2: comma, =, $, #", x: 0, y: 12, width: 155, height: 6 },
  ],
};

// ---------------------------------------------------------------------------
// EQMAIN.PNG — Equalizer window
// ---------------------------------------------------------------------------

function buildEQSliderFrameRegions(): SpriteRegion[] {
  const regions: SpriteRegion[] = [];
  for (let i = 0; i < 28; i++) {
    const col = i % 14;
    const row = Math.floor(i / 14);
    regions.push({
      name: `EQ slider frame ${i}`,
      x: 13 + col * 15,
      y: 164 + row * 65,
      width: 15,
      height: 65,
    });
  }
  return regions;
}

const EQMAIN: SpriteSheetDef = {
  fileName: "EQMAIN.PNG",
  frameName: "EQMAIN",
  width: 275,
  height: 315,
  required: true,
  regions: [
    // Background and title bar
    { name: "Background", x: 0, y: 0, width: 275, height: 116 },
    // Window buttons
    { name: "Close button", x: 0, y: 116, width: 9, height: 9 },
    // ON button (4 states)
    { name: "ON off", x: 10, y: 119, width: 26, height: 12 },
    { name: "ON off pressed", x: 128, y: 119, width: 26, height: 12 },
    { name: "Close button pressed", x: 0, y: 125, width: 9, height: 9 },
    // Title bars
    { name: "Title bar active", x: 0, y: 134, width: 275, height: 14 },
    { name: "Title bar inactive", x: 0, y: 149, width: 275, height: 14 },
    // Shade button (from title bar inactive row)
    { name: "Shade button", x: 254, y: 152, width: 9, height: 9 },
    // ON button continued
    { name: "ON on", x: 69, y: 119, width: 26, height: 12 },
    { name: "ON on pressed", x: 187, y: 119, width: 26, height: 12 },
    // AUTO button (4 states)
    { name: "AUTO off", x: 36, y: 119, width: 32, height: 12 },
    { name: "AUTO on", x: 95, y: 119, width: 32, height: 12 },
    { name: "AUTO off pressed", x: 154, y: 119, width: 32, height: 12 },
    { name: "AUTO on pressed", x: 213, y: 119, width: 32, height: 12 },
    // Slider thumb
    { name: "Slider thumb normal", x: 0, y: 164, width: 11, height: 11 },
    { name: "Slider thumb pressed", x: 0, y: 176, width: 11, height: 11 },
    // PRESETS button
    { name: "PRESETS", x: 224, y: 164, width: 44, height: 12 },
    { name: "PRESETS pressed", x: 224, y: 176, width: 44, height: 12 },
    // EQ slider background frames (28 frames in 14x2 grid)
    ...buildEQSliderFrameRegions(),
    // Graph
    { name: "Graph background", x: 0, y: 294, width: 113, height: 19 },
    { name: "Graph line colors", x: 115, y: 294, width: 1, height: 19 },
    { name: "Preamp line", x: 0, y: 314, width: 113, height: 1 },
  ],
};

// ---------------------------------------------------------------------------
// EQ_EX.PNG — EQ shade mode sprites
// ---------------------------------------------------------------------------

const EQ_EX: SpriteSheetDef = {
  fileName: "EQ_EX.PNG",
  frameName: "EQ_EX",
  width: 275,
  height: 56,
  required: false,
  regions: [
    // Shade backgrounds
    { name: "Shade background active", x: 0, y: 0, width: 275, height: 14 },
    { name: "Shade background inactive", x: 0, y: 15, width: 275, height: 14 },
    // Shade slider thumbs (3x7 segments)
    { name: "Volume thumb left", x: 1, y: 30, width: 3, height: 7 },
    { name: "Volume thumb center", x: 4, y: 30, width: 3, height: 7 },
    { name: "Volume thumb right", x: 7, y: 30, width: 3, height: 7 },
    { name: "Balance thumb left", x: 11, y: 30, width: 3, height: 7 },
    { name: "Balance thumb center", x: 14, y: 30, width: 3, height: 7 },
    { name: "Balance thumb right", x: 17, y: 30, width: 3, height: 7 },
    // Shade buttons
    { name: "Shade button pressed", x: 1, y: 38, width: 9, height: 9 },
    { name: "Shade button pressed (in shade)", x: 1, y: 47, width: 9, height: 9 },
    { name: "Close button", x: 11, y: 38, width: 9, height: 9 },
    { name: "Close button pressed", x: 11, y: 47, width: 9, height: 9 },
  ],
};

// ---------------------------------------------------------------------------
// PLEDIT.PNG — Playlist window sprites
// ---------------------------------------------------------------------------

const PLEDIT: SpriteSheetDef = {
  fileName: "PLEDIT.PNG",
  frameName: "PLEDIT",
  width: 276,
  height: 110,
  required: true,
  regions: [
    // Title bar — active
    { name: "Title bar left corner active", x: 0, y: 0, width: 25, height: 20 },
    { name: "Title bar title active", x: 26, y: 0, width: 100, height: 20 },
    { name: "Title bar fill active", x: 127, y: 0, width: 25, height: 20 },
    { name: "Title bar right corner active", x: 153, y: 0, width: 25, height: 20 },
    // Bottom fill tile (shares y=0 row but at x=179)
    { name: "Bottom fill tile", x: 179, y: 0, width: 25, height: 38 },
    // Title bar — inactive
    { name: "Title bar left corner inactive", x: 0, y: 21, width: 25, height: 20 },
    { name: "Title bar title inactive", x: 26, y: 21, width: 100, height: 20 },
    { name: "Title bar fill inactive", x: 127, y: 21, width: 25, height: 20 },
    { name: "Title bar right corner inactive", x: 153, y: 21, width: 25, height: 20 },
    // Side borders
    { name: "Left border tile", x: 0, y: 42, width: 12, height: 29 },
    { name: "Right border tile", x: 31, y: 42, width: 20, height: 29 },
    // Title bar buttons (pressed states)
    { name: "Close button pressed", x: 52, y: 42, width: 9, height: 9 },
    { name: "Shade button pressed", x: 62, y: 42, width: 9, height: 9 },
    // Shade mode
    { name: "Shade left active", x: 72, y: 42, width: 25, height: 14 },
    { name: "Shade right active", x: 99, y: 42, width: 50, height: 14 },
    // Scrollbar
    { name: "Scroll handle normal", x: 52, y: 53, width: 8, height: 18 },
    { name: "Scroll handle active", x: 61, y: 53, width: 8, height: 18 },
    // Shade mode inactive
    { name: "Shade left inactive", x: 72, y: 57, width: 25, height: 14 },
    { name: "Shade right inactive", x: 99, y: 57, width: 50, height: 14 },
    // Bottom section
    { name: "Bottom left corner", x: 0, y: 72, width: 125, height: 38 },
    { name: "Bottom right corner", x: 126, y: 72, width: 150, height: 38 },
  ],
};

// ---------------------------------------------------------------------------
// GEN.PNG — Generic/fallback window background (optional)
// ---------------------------------------------------------------------------

const GEN: SpriteSheetDef = {
  fileName: "GEN.PNG",
  frameName: "GEN",
  width: 275,
  height: 116,
  required: false,
  regions: [
    { name: "Background", x: 0, y: 0, width: 275, height: 116 },
  ],
};

// ---------------------------------------------------------------------------
// GENEX.PNG — Extended generic window background (optional)
// ---------------------------------------------------------------------------

const GENEX: SpriteSheetDef = {
  fileName: "GENEX.PNG",
  frameName: "GENEX",
  width: 275,
  height: 116,
  required: false,
  regions: [
    { name: "Background", x: 0, y: 0, width: 275, height: 116 },
  ],
};

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export const SPRITE_SHEETS: SpriteSheetDef[] = [
  MAIN,
  TITLEBAR,
  CBUTTONS,
  VOLUME,
  BALANCE,
  POSBAR,
  SHUFREP,
  PLAYPAUS,
  MONOSTER,
  NUMBERS,
  NUMS_EX,
  TEXT,
  EQMAIN,
  EQ_EX,
  PLEDIT,
  GEN,
  GENEX,
];

// ---------------------------------------------------------------------------
// Main window element placement map (1x skin pixels)
// Sourced from SKIN_FORMAT.md "Main Window Element Placement" table.
// ---------------------------------------------------------------------------

export const MAIN_WINDOW_PLACEMENT: ElementPlacement[] = [
  { name: "Title bar", x: 0, y: 0, width: 275, height: 14 },
  { name: "Play status light", x: 24, y: 28, width: 9, height: 9 },
  { name: "Time minus sign", x: 36, y: 26, width: 9, height: 13 },
  { name: "Minute tens digit", x: 48, y: 26, width: 9, height: 13 },
  { name: "Minute ones digit", x: 60, y: 26, width: 9, height: 13 },
  { name: "Second tens digit", x: 78, y: 26, width: 9, height: 13 },
  { name: "Second ones digit", x: 90, y: 26, width: 9, height: 13 },
  { name: "Marquee text", x: 111, y: 27, width: 154, height: 6 },
  { name: "kbps text", x: 111, y: 43, width: 15, height: 6 },
  { name: "khz text", x: 156, y: 43, width: 15, height: 6 },
  { name: "Mono indicator", x: 212, y: 41, width: 27, height: 12 },
  { name: "Stereo indicator", x: 239, y: 41, width: 29, height: 12 },
  { name: "Visualizer", x: 24, y: 43, width: 76, height: 16 },
  { name: "Volume slider", x: 107, y: 57, width: 68, height: 14 },
  { name: "Balance slider", x: 177, y: 57, width: 38, height: 14 },
  { name: "EQ toggle", x: 219, y: 58, width: 23, height: 12 },
  { name: "PL toggle", x: 242, y: 58, width: 23, height: 12 },
  { name: "Seek bar", x: 16, y: 72, width: 248, height: 10 },
  { name: "Previous", x: 16, y: 88, width: 23, height: 18 },
  { name: "Play", x: 39, y: 88, width: 23, height: 18 },
  { name: "Pause", x: 62, y: 88, width: 23, height: 18 },
  { name: "Stop", x: 85, y: 88, width: 23, height: 18 },
  { name: "Next", x: 108, y: 88, width: 22, height: 18 },
  { name: "Eject", x: 136, y: 89, width: 22, height: 16 },
  { name: "Shuffle", x: 164, y: 89, width: 47, height: 15 },
  { name: "Repeat", x: 210, y: 89, width: 28, height: 15 },
  { name: "Close button", x: 264, y: 3, width: 9, height: 9 },
  { name: "Minimize button", x: 244, y: 3, width: 9, height: 9 },
  { name: "Shade button", x: 254, y: 3, width: 9, height: 9 },
];
