// ---------------------------------------------------------------------------
// Component definitions for the component-based skin authoring mode.
// Maps ~64 Figma ComponentSets (with their variant axes) to the positions
// they must occupy in the output sprite sheet PNGs.
//
// All coordinates are in 1x skin pixels — multiply by assetScale for PNGs.
// Sourced from spriteSheetDefs.ts and SKIN_FORMAT.md.
// ---------------------------------------------------------------------------

// -- Types ------------------------------------------------------------------

export interface VariantAxis {
  name: string;
  values: string[];
}

export interface VariantPlacement {
  variantValues: Record<string, string>;
  x: number;
  y: number;
}

export interface SpriteSheetTarget {
  fileName: string;
  sheetWidth: number;
  sheetHeight: number;
  placements: VariantPlacement[];
}

export type SliderMode = "auto" | "manual";

export interface ComponentDef {
  name: string;
  section: string;
  width: number;
  height: number;
  required: boolean;
  variants: VariantAxis[];
  target: SpriteSheetTarget;
  sliderMode?: SliderMode;
  sliderOrientation?: "horizontal" | "vertical";
  sliderFrameCount?: number;
}

// -- Preview placement types ------------------------------------------------

export interface PreviewPlacement {
  componentName: string;
  variantValues: Record<string, string>;
  x: number;
  y: number;
  /**
   * If set, wraps the placed instance in a clipping frame at (x, y) of
   * `crop.width × crop.height`, with the instance offset inside so that
   * only the given source sub-rect of the component is visible. Use this
   * for sprite strips where only a fragment is drawn at runtime — e.g.
   * picking individual digit cells from the 99×13 NUMBERS strip to show
   * a realistic "12 34" time display in the preview instead of dumping
   * all 11 digits side-by-side.
   */
  crop?: {
    sourceX: number;
    sourceY: number;
    width: number;
    height: number;
  };
}

export interface PreviewFrameDef {
  name: string;
  width: number;
  height: number;
  placements: PreviewPlacement[];
}

// -- Overlay guide types ----------------------------------------------------

/**
 * A labeled region drawn on top of a background component to show the
 * designer where another sprite will be composited by the renderer at
 * runtime. Coordinates are relative to the background's own top-left, in
 * 1× skin pixels.
 */
export interface OverlayGuide {
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

// -- Helpers ----------------------------------------------------------------

function buildVolumeSliderPlacements(): VariantPlacement[] {
  const placements: VariantPlacement[] = [];
  for (let i = 0; i < 28; i++) {
    placements.push({
      variantValues: { "Frame": String(i) },
      x: 0,
      y: i * 15,
    });
  }
  return placements;
}

function buildEQSliderFramePlacements(): VariantPlacement[] {
  const placements: VariantPlacement[] = [];
  for (let i = 0; i < 28; i++) {
    const col = i % 14;
    const row = Math.floor(i / 14);
    placements.push({
      variantValues: { "Frame": String(i) },
      x: 13 + col * 15,
      y: 164 + row * 65,
    });
  }
  return placements;
}

// ---------------------------------------------------------------------------
// COMPONENT_DEFS — all ~64 components
// ---------------------------------------------------------------------------

export const COMPONENT_DEFS: ComponentDef[] = [
  // ==========================================================================
  // Main Window
  // ==========================================================================

  {
    name: "Main Background",
    section: "Main Window",
    width: 275,
    height: 116,
    required: true,
    variants: [],
    target: {
      fileName: "MAIN.PNG",
      sheetWidth: 275,
      sheetHeight: 116,
      placements: [
        { variantValues: {}, x: 0, y: 0 },
      ],
    },
  },

  {
    name: "Title Bar",
    section: "Main Window",
    width: 275,
    height: 14,
    required: true,
    variants: [
      { name: "State", values: ["Active", "Inactive"] },
    ],
    target: {
      fileName: "TITLEBAR.PNG",
      sheetWidth: 302,
      sheetHeight: 56,
      placements: [
        { variantValues: { "State": "Active" }, x: 27, y: 0 },
        { variantValues: { "State": "Inactive" }, x: 27, y: 15 },
      ],
    },
  },

  {
    name: "Close Button",
    section: "Main Window",
    width: 9,
    height: 9,
    required: true,
    variants: [
      { name: "State", values: ["Normal", "Pressed"] },
    ],
    target: {
      fileName: "TITLEBAR.PNG",
      sheetWidth: 302,
      sheetHeight: 56,
      placements: [
        { variantValues: { "State": "Normal" }, x: 18, y: 0 },
        { variantValues: { "State": "Pressed" }, x: 18, y: 9 },
      ],
    },
  },

  {
    name: "Minimize Button",
    section: "Main Window",
    width: 9,
    height: 9,
    required: true,
    variants: [
      { name: "State", values: ["Normal", "Pressed"] },
    ],
    target: {
      fileName: "TITLEBAR.PNG",
      sheetWidth: 302,
      sheetHeight: 56,
      placements: [
        { variantValues: { "State": "Normal" }, x: 9, y: 0 },
        { variantValues: { "State": "Pressed" }, x: 9, y: 9 },
      ],
    },
  },

  {
    name: "Shade Button",
    section: "Main Window",
    width: 9,
    height: 9,
    required: true,
    variants: [
      { name: "State", values: ["Normal", "Pressed"] },
    ],
    target: {
      fileName: "TITLEBAR.PNG",
      sheetWidth: 302,
      sheetHeight: 56,
      placements: [
        { variantValues: { "State": "Normal" }, x: 0, y: 0 },
        { variantValues: { "State": "Pressed" }, x: 0, y: 9 },
      ],
    },
  },

  {
    name: "Previous Button",
    section: "Main Window",
    width: 23,
    height: 18,
    required: true,
    variants: [
      { name: "State", values: ["Normal", "Pressed"] },
    ],
    target: {
      fileName: "CBUTTONS.PNG",
      sheetWidth: 136,
      sheetHeight: 36,
      placements: [
        { variantValues: { "State": "Normal" }, x: 0, y: 0 },
        { variantValues: { "State": "Pressed" }, x: 0, y: 18 },
      ],
    },
  },

  {
    name: "Play Button",
    section: "Main Window",
    width: 23,
    height: 18,
    required: true,
    variants: [
      { name: "State", values: ["Normal", "Pressed"] },
    ],
    target: {
      fileName: "CBUTTONS.PNG",
      sheetWidth: 136,
      sheetHeight: 36,
      placements: [
        { variantValues: { "State": "Normal" }, x: 23, y: 0 },
        { variantValues: { "State": "Pressed" }, x: 23, y: 18 },
      ],
    },
  },

  {
    name: "Pause Button",
    section: "Main Window",
    width: 23,
    height: 18,
    required: true,
    variants: [
      { name: "State", values: ["Normal", "Pressed"] },
    ],
    target: {
      fileName: "CBUTTONS.PNG",
      sheetWidth: 136,
      sheetHeight: 36,
      placements: [
        { variantValues: { "State": "Normal" }, x: 46, y: 0 },
        { variantValues: { "State": "Pressed" }, x: 46, y: 18 },
      ],
    },
  },

  {
    name: "Stop Button",
    section: "Main Window",
    width: 23,
    height: 18,
    required: true,
    variants: [
      { name: "State", values: ["Normal", "Pressed"] },
    ],
    target: {
      fileName: "CBUTTONS.PNG",
      sheetWidth: 136,
      sheetHeight: 36,
      placements: [
        { variantValues: { "State": "Normal" }, x: 69, y: 0 },
        { variantValues: { "State": "Pressed" }, x: 69, y: 18 },
      ],
    },
  },

  {
    name: "Next Button",
    section: "Main Window",
    width: 22,
    height: 18,
    required: true,
    variants: [
      { name: "State", values: ["Normal", "Pressed"] },
    ],
    target: {
      fileName: "CBUTTONS.PNG",
      sheetWidth: 136,
      sheetHeight: 36,
      placements: [
        { variantValues: { "State": "Normal" }, x: 92, y: 0 },
        { variantValues: { "State": "Pressed" }, x: 92, y: 18 },
      ],
    },
  },

  {
    name: "Eject Button",
    section: "Main Window",
    width: 22,
    height: 16,
    required: true,
    variants: [
      { name: "State", values: ["Normal", "Pressed"] },
    ],
    target: {
      fileName: "CBUTTONS.PNG",
      sheetWidth: 136,
      sheetHeight: 36,
      placements: [
        { variantValues: { "State": "Normal" }, x: 114, y: 0 },
        { variantValues: { "State": "Pressed" }, x: 114, y: 16 },
      ],
    },
  },

  {
    name: "Shuffle Toggle",
    section: "Main Window",
    width: 47,
    height: 15,
    required: true,
    variants: [
      { name: "Active", values: ["Off", "On"] },
      { name: "State", values: ["Normal", "Pressed"] },
    ],
    target: {
      fileName: "SHUFREP.PNG",
      sheetWidth: 92,
      sheetHeight: 85,
      placements: [
        { variantValues: { "Active": "Off", "State": "Normal" }, x: 28, y: 0 },
        { variantValues: { "Active": "Off", "State": "Pressed" }, x: 28, y: 15 },
        { variantValues: { "Active": "On", "State": "Normal" }, x: 28, y: 30 },
        { variantValues: { "Active": "On", "State": "Pressed" }, x: 28, y: 45 },
      ],
    },
  },

  {
    name: "Repeat Toggle",
    section: "Main Window",
    width: 28,
    height: 15,
    required: true,
    variants: [
      { name: "Active", values: ["Off", "On"] },
      { name: "State", values: ["Normal", "Pressed"] },
    ],
    target: {
      fileName: "SHUFREP.PNG",
      sheetWidth: 92,
      sheetHeight: 85,
      placements: [
        { variantValues: { "Active": "Off", "State": "Normal" }, x: 0, y: 0 },
        { variantValues: { "Active": "Off", "State": "Pressed" }, x: 0, y: 15 },
        { variantValues: { "Active": "On", "State": "Normal" }, x: 0, y: 30 },
        { variantValues: { "Active": "On", "State": "Pressed" }, x: 0, y: 45 },
      ],
    },
  },

  {
    name: "EQ Toggle",
    section: "Main Window",
    width: 23,
    height: 12,
    required: true,
    variants: [
      { name: "Active", values: ["Off", "On"] },
    ],
    target: {
      fileName: "SHUFREP.PNG",
      sheetWidth: 92,
      sheetHeight: 85,
      placements: [
        { variantValues: { "Active": "Off" }, x: 0, y: 61 },
        { variantValues: { "Active": "On" }, x: 0, y: 73 },
      ],
    },
  },

  {
    name: "PL Toggle",
    section: "Main Window",
    width: 23,
    height: 12,
    required: true,
    variants: [
      { name: "Active", values: ["Off", "On"] },
    ],
    target: {
      fileName: "SHUFREP.PNG",
      sheetWidth: 92,
      sheetHeight: 85,
      placements: [
        { variantValues: { "Active": "Off" }, x: 23, y: 61 },
        { variantValues: { "Active": "On" }, x: 23, y: 73 },
      ],
    },
  },

  {
    name: "Play Status",
    section: "Main Window",
    width: 9,
    height: 9,
    required: true,
    variants: [
      { name: "State", values: ["Playing", "Paused", "Stopped"] },
    ],
    target: {
      fileName: "PLAYPAUS.PNG",
      sheetWidth: 42,
      sheetHeight: 9,
      placements: [
        { variantValues: { "State": "Playing" }, x: 0, y: 0 },
        { variantValues: { "State": "Paused" }, x: 9, y: 0 },
        { variantValues: { "State": "Stopped" }, x: 18, y: 0 },
      ],
    },
  },

  {
    name: "Stereo Indicator",
    section: "Main Window",
    width: 29,
    height: 12,
    required: true,
    variants: [
      { name: "State", values: ["On", "Off"] },
    ],
    target: {
      fileName: "MONOSTER.PNG",
      sheetWidth: 56,
      sheetHeight: 24,
      placements: [
        { variantValues: { "State": "On" }, x: 0, y: 0 },
        { variantValues: { "State": "Off" }, x: 0, y: 12 },
      ],
    },
  },

  {
    name: "Mono Indicator",
    section: "Main Window",
    width: 27,
    height: 12,
    required: true,
    variants: [
      { name: "State", values: ["On", "Off"] },
    ],
    target: {
      fileName: "MONOSTER.PNG",
      sheetWidth: 56,
      sheetHeight: 24,
      placements: [
        { variantValues: { "State": "On" }, x: 29, y: 0 },
        { variantValues: { "State": "Off" }, x: 29, y: 12 },
      ],
    },
  },

  {
    name: "Time Digits",
    section: "Main Window",
    width: 99,
    height: 13,
    required: true,
    variants: [],
    target: {
      fileName: "NUMBERS.PNG",
      sheetWidth: 99,
      sheetHeight: 13,
      placements: [
        { variantValues: {}, x: 0, y: 0 },
      ],
    },
  },

  {
    name: "Seek Bar Track",
    section: "Main Window",
    width: 248,
    height: 10,
    required: true,
    variants: [],
    target: {
      fileName: "POSBAR.PNG",
      sheetWidth: 307,
      sheetHeight: 10,
      placements: [
        { variantValues: {}, x: 0, y: 0 },
      ],
    },
  },

  {
    name: "Seek Bar Thumb",
    section: "Main Window",
    width: 29,
    height: 10,
    required: true,
    variants: [
      { name: "State", values: ["Normal", "Pressed"] },
    ],
    target: {
      fileName: "POSBAR.PNG",
      sheetWidth: 307,
      sheetHeight: 10,
      placements: [
        { variantValues: { "State": "Normal" }, x: 248, y: 0 },
        { variantValues: { "State": "Pressed" }, x: 278, y: 0 },
      ],
    },
  },

  // Slider tracks are authored as a ComponentSet with two variants:
  // Part=BG (empty track) and Part=Fill (fully-lit track). sliderGenerator.ts
  // interpolates 28 intermediate frames between them at export time. One
  // def per logical slider — no separate BG/Fill defs.
  {
    name: "Volume Track",
    section: "Main Window",
    width: 68,
    height: 15,
    required: true,
    variants: [],
    sliderMode: "auto",
    sliderOrientation: "horizontal",
    sliderFrameCount: 28,
    target: {
      fileName: "VOLUME.PNG",
      sheetWidth: 68,
      sheetHeight: 433,
      placements: buildVolumeSliderPlacements(),
    },
  },

  {
    name: "Volume Thumb",
    section: "Main Window",
    width: 14,
    height: 11,
    required: true,
    variants: [
      { name: "State", values: ["Normal", "Pressed"] },
    ],
    target: {
      fileName: "VOLUME.PNG",
      sheetWidth: 68,
      sheetHeight: 433,
      placements: [
        { variantValues: { "State": "Normal" }, x: 15, y: 422 },
        { variantValues: { "State": "Pressed" }, x: 0, y: 422 },
      ],
    },
  },

  {
    name: "Balance Track",
    section: "Main Window",
    width: 38,
    height: 15,
    required: false,
    variants: [],
    sliderMode: "auto",
    sliderOrientation: "horizontal",
    sliderFrameCount: 28,
    target: {
      fileName: "BALANCE.PNG",
      sheetWidth: 38,
      sheetHeight: 433,
      placements: buildVolumeSliderPlacements(),
    },
  },

  {
    name: "Balance Thumb",
    section: "Main Window",
    width: 14,
    height: 11,
    required: false,
    variants: [
      { name: "State", values: ["Normal", "Pressed"] },
    ],
    target: {
      fileName: "BALANCE.PNG",
      sheetWidth: 38,
      sheetHeight: 433,
      placements: [
        { variantValues: { "State": "Normal" }, x: 15, y: 422 },
        { variantValues: { "State": "Pressed" }, x: 0, y: 422 },
      ],
    },
  },

  {
    name: "Bitmap Font",
    section: "Main Window",
    width: 155,
    height: 18,
    required: true,
    variants: [],
    target: {
      fileName: "TEXT.PNG",
      sheetWidth: 155,
      sheetHeight: 18,
      placements: [
        { variantValues: {}, x: 0, y: 0 },
      ],
    },
  },

  // ==========================================================================
  // Shade Mode
  // ==========================================================================

  {
    name: "Shade Background",
    section: "Shade Mode",
    width: 275,
    height: 14,
    required: true,
    variants: [
      { name: "State", values: ["Focused", "Unfocused"] },
    ],
    target: {
      fileName: "TITLEBAR.PNG",
      sheetWidth: 302,
      sheetHeight: 56,
      placements: [
        { variantValues: { "State": "Focused" }, x: 27, y: 29 },
        { variantValues: { "State": "Unfocused" }, x: 27, y: 42 },
      ],
    },
  },

  {
    name: "Shade Toggle",
    section: "Shade Mode",
    width: 9,
    height: 9,
    required: true,
    variants: [
      { name: "State", values: ["Normal", "Pressed"] },
    ],
    target: {
      fileName: "TITLEBAR.PNG",
      sheetWidth: 302,
      sheetHeight: 56,
      placements: [
        { variantValues: { "State": "Normal" }, x: 0, y: 18 },
        { variantValues: { "State": "Pressed" }, x: 9, y: 18 },
      ],
    },
  },

  {
    name: "Shade Position BG",
    section: "Shade Mode",
    width: 17,
    height: 7,
    required: true,
    variants: [],
    target: {
      fileName: "TITLEBAR.PNG",
      sheetWidth: 302,
      sheetHeight: 56,
      placements: [
        { variantValues: {}, x: 0, y: 36 },
      ],
    },
  },

  {
    name: "Shade Position Thumb",
    section: "Shade Mode",
    width: 3,
    height: 7,
    required: true,
    variants: [],
    target: {
      fileName: "TITLEBAR.PNG",
      sheetWidth: 302,
      sheetHeight: 56,
      placements: [
        { variantValues: {}, x: 20, y: 36 },
      ],
    },
  },

  // ==========================================================================
  // EQ Window
  // ==========================================================================

  {
    name: "EQ Background",
    section: "EQ Window",
    width: 275,
    height: 116,
    required: true,
    variants: [],
    target: {
      fileName: "EQMAIN.PNG",
      sheetWidth: 275,
      sheetHeight: 315,
      placements: [
        { variantValues: {}, x: 0, y: 0 },
      ],
    },
  },

  {
    name: "EQ Title Bar",
    section: "EQ Window",
    width: 275,
    height: 14,
    required: true,
    variants: [
      { name: "State", values: ["Active", "Inactive"] },
    ],
    target: {
      fileName: "EQMAIN.PNG",
      sheetWidth: 275,
      sheetHeight: 315,
      placements: [
        { variantValues: { "State": "Active" }, x: 0, y: 134 },
        { variantValues: { "State": "Inactive" }, x: 0, y: 149 },
      ],
    },
  },

  {
    name: "EQ Close Button",
    section: "EQ Window",
    width: 9,
    height: 9,
    required: true,
    variants: [
      { name: "State", values: ["Normal", "Pressed"] },
    ],
    target: {
      fileName: "EQMAIN.PNG",
      sheetWidth: 275,
      sheetHeight: 315,
      placements: [
        { variantValues: { "State": "Normal" }, x: 0, y: 116 },
        { variantValues: { "State": "Pressed" }, x: 0, y: 125 },
      ],
    },
  },

  {
    name: "EQ Shade Button",
    section: "EQ Window",
    width: 9,
    height: 9,
    required: true,
    variants: [],
    target: {
      fileName: "EQMAIN.PNG",
      sheetWidth: 275,
      sheetHeight: 315,
      placements: [
        { variantValues: {}, x: 254, y: 152 },
      ],
    },
  },

  {
    name: "EQ ON Toggle",
    section: "EQ Window",
    width: 26,
    height: 12,
    required: true,
    variants: [
      { name: "Active", values: ["Off", "On"] },
      { name: "State", values: ["Normal", "Pressed"] },
    ],
    target: {
      fileName: "EQMAIN.PNG",
      sheetWidth: 275,
      sheetHeight: 315,
      placements: [
        { variantValues: { "Active": "Off", "State": "Normal" }, x: 10, y: 119 },
        { variantValues: { "Active": "Off", "State": "Pressed" }, x: 128, y: 119 },
        { variantValues: { "Active": "On", "State": "Normal" }, x: 69, y: 119 },
        { variantValues: { "Active": "On", "State": "Pressed" }, x: 187, y: 119 },
      ],
    },
  },

  {
    name: "EQ AUTO Toggle",
    section: "EQ Window",
    width: 32,
    height: 12,
    required: true,
    variants: [
      { name: "Active", values: ["Off", "On"] },
      { name: "State", values: ["Normal", "Pressed"] },
    ],
    target: {
      fileName: "EQMAIN.PNG",
      sheetWidth: 275,
      sheetHeight: 315,
      placements: [
        { variantValues: { "Active": "Off", "State": "Normal" }, x: 36, y: 119 },
        { variantValues: { "Active": "Off", "State": "Pressed" }, x: 154, y: 119 },
        { variantValues: { "Active": "On", "State": "Normal" }, x: 95, y: 119 },
        { variantValues: { "Active": "On", "State": "Pressed" }, x: 213, y: 119 },
      ],
    },
  },

  {
    name: "EQ PRESETS Button",
    section: "EQ Window",
    width: 44,
    height: 12,
    required: true,
    variants: [
      { name: "State", values: ["Normal", "Pressed"] },
    ],
    target: {
      fileName: "EQMAIN.PNG",
      sheetWidth: 275,
      sheetHeight: 315,
      placements: [
        { variantValues: { "State": "Normal" }, x: 224, y: 164 },
        { variantValues: { "State": "Pressed" }, x: 224, y: 176 },
      ],
    },
  },

  {
    name: "EQ Slider Track",
    section: "EQ Window",
    width: 15,
    height: 65,
    required: true,
    variants: [],
    sliderMode: "auto",
    sliderOrientation: "vertical",
    sliderFrameCount: 28,
    target: {
      fileName: "EQMAIN.PNG",
      sheetWidth: 275,
      sheetHeight: 315,
      placements: buildEQSliderFramePlacements(),
    },
  },

  {
    name: "EQ Slider Thumb",
    section: "EQ Window",
    width: 11,
    height: 11,
    required: true,
    variants: [
      { name: "State", values: ["Normal", "Pressed"] },
    ],
    target: {
      fileName: "EQMAIN.PNG",
      sheetWidth: 275,
      sheetHeight: 315,
      placements: [
        { variantValues: { "State": "Normal" }, x: 0, y: 164 },
        { variantValues: { "State": "Pressed" }, x: 0, y: 176 },
      ],
    },
  },

  {
    name: "EQ Graph BG",
    section: "EQ Window",
    width: 113,
    height: 19,
    required: true,
    variants: [],
    target: {
      fileName: "EQMAIN.PNG",
      sheetWidth: 275,
      sheetHeight: 315,
      placements: [
        { variantValues: {}, x: 0, y: 294 },
      ],
    },
  },

  {
    name: "EQ Graph Colors",
    section: "EQ Window",
    width: 1,
    height: 19,
    required: true,
    variants: [],
    target: {
      fileName: "EQMAIN.PNG",
      sheetWidth: 275,
      sheetHeight: 315,
      placements: [
        { variantValues: {}, x: 115, y: 294 },
      ],
    },
  },

  {
    name: "EQ Preamp Line",
    section: "EQ Window",
    width: 113,
    height: 1,
    required: true,
    variants: [],
    target: {
      fileName: "EQMAIN.PNG",
      sheetWidth: 275,
      sheetHeight: 315,
      placements: [
        { variantValues: {}, x: 0, y: 314 },
      ],
    },
  },

  // ==========================================================================
  // EQ Shade
  // ==========================================================================

  {
    name: "EQ Shade BG",
    section: "EQ Shade",
    width: 275,
    height: 14,
    required: false,
    variants: [
      { name: "State", values: ["Active", "Inactive"] },
    ],
    target: {
      fileName: "EQ_EX.PNG",
      sheetWidth: 275,
      sheetHeight: 56,
      placements: [
        { variantValues: { "State": "Active" }, x: 0, y: 0 },
        { variantValues: { "State": "Inactive" }, x: 0, y: 15 },
      ],
    },
  },

  {
    name: "EQ Shade Vol Thumb",
    section: "EQ Shade",
    width: 9,
    height: 7,
    required: false,
    variants: [],
    target: {
      fileName: "EQ_EX.PNG",
      sheetWidth: 275,
      sheetHeight: 56,
      placements: [
        { variantValues: {}, x: 1, y: 30 },
      ],
    },
  },

  {
    name: "EQ Shade Bal Thumb",
    section: "EQ Shade",
    width: 9,
    height: 7,
    required: false,
    variants: [],
    target: {
      fileName: "EQ_EX.PNG",
      sheetWidth: 275,
      sheetHeight: 56,
      placements: [
        { variantValues: {}, x: 11, y: 30 },
      ],
    },
  },

  // The EQ window has *two* shade buttons with different sprite contracts:
  //
  //  - Full-mode EQ shade button (on the maximized EQ window): normal sprite
  //    comes from EQMAIN.PNG at (254, 152). Its pressed sprite lives on
  //    EQ_EX.PNG at (1, 38) — that's this component.
  //
  //  - Shade-mode EQ shade button (on the collapsed EQ bar): renderer uses
  //    `normalImage: nil` and expects its normal visual to be painted into
  //    `EQ Shade BG`. Its pressed sprite lives at EQ_EX.PNG (1, 47).
  //
  // Neither rect ever represents a "normal" state, so both components have
  // `variants: []`. Semantics match SpriteExtractor.extractEQShadeSprites.
  {
    name: "EQ Full Shade Pressed",
    section: "EQ Shade",
    width: 9,
    height: 9,
    required: false,
    variants: [],
    target: {
      fileName: "EQ_EX.PNG",
      sheetWidth: 275,
      sheetHeight: 56,
      placements: [
        { variantValues: {}, x: 1, y: 38 },
      ],
    },
  },

  {
    name: "EQ Shade Mode Shade Pressed",
    section: "EQ Shade",
    width: 9,
    height: 9,
    required: false,
    variants: [],
    target: {
      fileName: "EQ_EX.PNG",
      sheetWidth: 275,
      sheetHeight: 56,
      placements: [
        { variantValues: {}, x: 1, y: 47 },
      ],
    },
  },

  {
    name: "EQ Shade Close",
    section: "EQ Shade",
    width: 9,
    height: 9,
    required: false,
    variants: [
      { name: "State", values: ["Normal", "Pressed"] },
    ],
    target: {
      fileName: "EQ_EX.PNG",
      sheetWidth: 275,
      sheetHeight: 56,
      placements: [
        { variantValues: { "State": "Normal" }, x: 11, y: 38 },
        { variantValues: { "State": "Pressed" }, x: 11, y: 47 },
      ],
    },
  },

  // ==========================================================================
  // Playlist
  // ==========================================================================

  {
    name: "PL Title Left Corner",
    section: "Playlist",
    width: 25,
    height: 20,
    required: true,
    variants: [
      { name: "State", values: ["Active", "Inactive"] },
    ],
    target: {
      fileName: "PLEDIT.PNG",
      sheetWidth: 276,
      sheetHeight: 110,
      placements: [
        { variantValues: { "State": "Active" }, x: 0, y: 0 },
        { variantValues: { "State": "Inactive" }, x: 0, y: 21 },
      ],
    },
  },

  {
    name: "PL Title Text",
    section: "Playlist",
    width: 100,
    height: 20,
    required: true,
    variants: [
      { name: "State", values: ["Active", "Inactive"] },
    ],
    target: {
      fileName: "PLEDIT.PNG",
      sheetWidth: 276,
      sheetHeight: 110,
      placements: [
        { variantValues: { "State": "Active" }, x: 26, y: 0 },
        { variantValues: { "State": "Inactive" }, x: 26, y: 21 },
      ],
    },
  },

  {
    name: "PL Title Fill",
    section: "Playlist",
    width: 25,
    height: 20,
    required: true,
    variants: [
      { name: "State", values: ["Active", "Inactive"] },
    ],
    target: {
      fileName: "PLEDIT.PNG",
      sheetWidth: 276,
      sheetHeight: 110,
      placements: [
        { variantValues: { "State": "Active" }, x: 127, y: 0 },
        { variantValues: { "State": "Inactive" }, x: 127, y: 21 },
      ],
    },
  },

  {
    name: "PL Title Right Corner",
    section: "Playlist",
    width: 25,
    height: 20,
    required: true,
    variants: [
      { name: "State", values: ["Active", "Inactive"] },
    ],
    target: {
      fileName: "PLEDIT.PNG",
      sheetWidth: 276,
      sheetHeight: 110,
      placements: [
        { variantValues: { "State": "Active" }, x: 153, y: 0 },
        { variantValues: { "State": "Inactive" }, x: 153, y: 21 },
      ],
    },
  },

  {
    name: "PL Close Pressed",
    section: "Playlist",
    width: 9,
    height: 9,
    required: true,
    variants: [],
    target: {
      fileName: "PLEDIT.PNG",
      sheetWidth: 276,
      sheetHeight: 110,
      placements: [
        { variantValues: {}, x: 52, y: 42 },
      ],
    },
  },

  {
    name: "PL Shade Pressed",
    section: "Playlist",
    width: 9,
    height: 9,
    required: true,
    variants: [],
    target: {
      fileName: "PLEDIT.PNG",
      sheetWidth: 276,
      sheetHeight: 110,
      placements: [
        { variantValues: {}, x: 62, y: 42 },
      ],
    },
  },

  {
    name: "PL Left Border",
    section: "Playlist",
    width: 12,
    height: 29,
    required: true,
    variants: [],
    target: {
      fileName: "PLEDIT.PNG",
      sheetWidth: 276,
      sheetHeight: 110,
      placements: [
        { variantValues: {}, x: 0, y: 42 },
      ],
    },
  },

  {
    name: "PL Right Border",
    section: "Playlist",
    width: 20,
    height: 29,
    required: true,
    variants: [],
    target: {
      fileName: "PLEDIT.PNG",
      sheetWidth: 276,
      sheetHeight: 110,
      placements: [
        { variantValues: {}, x: 31, y: 42 },
      ],
    },
  },

  {
    name: "PL Scroll Handle",
    section: "Playlist",
    width: 8,
    height: 18,
    required: true,
    variants: [
      { name: "State", values: ["Normal", "Active"] },
    ],
    target: {
      fileName: "PLEDIT.PNG",
      sheetWidth: 276,
      sheetHeight: 110,
      placements: [
        { variantValues: { "State": "Normal" }, x: 52, y: 53 },
        { variantValues: { "State": "Active" }, x: 61, y: 53 },
      ],
    },
  },

  {
    name: "PL Bottom Left",
    section: "Playlist",
    width: 125,
    height: 38,
    required: true,
    variants: [],
    target: {
      fileName: "PLEDIT.PNG",
      sheetWidth: 276,
      sheetHeight: 110,
      placements: [
        { variantValues: {}, x: 0, y: 72 },
      ],
    },
  },

  {
    name: "PL Bottom Right",
    section: "Playlist",
    width: 150,
    height: 38,
    required: true,
    variants: [],
    target: {
      fileName: "PLEDIT.PNG",
      sheetWidth: 276,
      sheetHeight: 110,
      placements: [
        { variantValues: {}, x: 126, y: 72 },
      ],
    },
  },

  {
    name: "PL Bottom Fill",
    section: "Playlist",
    width: 25,
    height: 38,
    required: true,
    variants: [],
    target: {
      fileName: "PLEDIT.PNG",
      sheetWidth: 276,
      sheetHeight: 110,
      placements: [
        { variantValues: {}, x: 179, y: 0 },
      ],
    },
  },

  {
    name: "PL Shade Left",
    section: "Playlist",
    width: 25,
    height: 14,
    required: true,
    variants: [
      { name: "State", values: ["Active", "Inactive"] },
    ],
    target: {
      fileName: "PLEDIT.PNG",
      sheetWidth: 276,
      sheetHeight: 110,
      placements: [
        { variantValues: { "State": "Active" }, x: 72, y: 42 },
        { variantValues: { "State": "Inactive" }, x: 72, y: 57 },
      ],
    },
  },

  {
    name: "PL Shade Right",
    section: "Playlist",
    width: 50,
    height: 14,
    required: true,
    variants: [
      { name: "State", values: ["Active", "Inactive"] },
    ],
    target: {
      fileName: "PLEDIT.PNG",
      sheetWidth: 276,
      sheetHeight: 110,
      placements: [
        { variantValues: { "State": "Active" }, x: 99, y: 42 },
        { variantValues: { "State": "Inactive" }, x: 99, y: 57 },
      ],
    },
  },
];

// ---------------------------------------------------------------------------
// Preview Frame Definitions
// ---------------------------------------------------------------------------

/**
 * Main window preview — 275x116 with all elements at their rendering positions.
 * Positions sourced from SKIN_FORMAT.md "Main Window Element Placement" table.
 */
export const MAIN_WINDOW_PREVIEW: PreviewFrameDef = {
  name: "Main Window",
  width: 275,
  height: 116,
  placements: [
    // Background
    { componentName: "Main Background", variantValues: {}, x: 0, y: 0 },
    // Title bar
    { componentName: "Title Bar", variantValues: { "State": "Active" }, x: 0, y: 0 },
    // Window buttons
    { componentName: "Close Button", variantValues: { "State": "Normal" }, x: 264, y: 3 },
    { componentName: "Minimize Button", variantValues: { "State": "Normal" }, x: 244, y: 3 },
    { componentName: "Shade Button", variantValues: { "State": "Normal" }, x: 254, y: 3 },
    // Play status
    { componentName: "Play Status", variantValues: { "State": "Playing" }, x: 24, y: 28 },
    // Time digits — the full component is a 99×13 strip of all 11 cells
    // (-, 0..9). Dropping it in whole would show every digit at once and
    // overflow the surrounding overlays. At runtime the renderer pulls
    // four 9×13 cells at positions mirrored below (see
    // MainWindowView.buildTimeDisplay) and paints the colon as part of
    // the Main Background at x=69..78. Preview renders "12:34" by
    // clipping four instances to the appropriate digit cells.
    { componentName: "Time Digits", variantValues: {}, x: 48, y: 26, crop: { sourceX: 9, sourceY: 0, width: 9, height: 13 } },   // "1"
    { componentName: "Time Digits", variantValues: {}, x: 60, y: 26, crop: { sourceX: 18, sourceY: 0, width: 9, height: 13 } },  // "2"
    { componentName: "Time Digits", variantValues: {}, x: 78, y: 26, crop: { sourceX: 27, sourceY: 0, width: 9, height: 13 } },  // "3"
    { componentName: "Time Digits", variantValues: {}, x: 90, y: 26, crop: { sourceX: 36, sourceY: 0, width: 9, height: 13 } },  // "4"
    // Channel indicators
    { componentName: "Mono Indicator", variantValues: { "State": "Off" }, x: 212, y: 41 },
    { componentName: "Stereo Indicator", variantValues: { "State": "On" }, x: 239, y: 41 },
    // Seek bar
    { componentName: "Seek Bar Track", variantValues: {}, x: 16, y: 72 },
    { componentName: "Seek Bar Thumb", variantValues: { "State": "Normal" }, x: 16, y: 72 },
    // Volume — Track is a ComponentSet with Part=BG/Part=Fill; the BG variant
    // is what the designer sees in the static preview. The exporter
    // interpolates 28 intermediate frames at runtime. Thumb renders on top.
    { componentName: "Volume Track", variantValues: { "Part": "BG" }, x: 107, y: 57 },
    { componentName: "Volume Thumb", variantValues: { "State": "Normal" }, x: 107, y: 57 },
    // Balance — same stack at the balance slider position (x=177).
    // Balance trough is 38px wide (rendered area), Thumb 14px — center thumb at x=189.
    { componentName: "Balance Track", variantValues: { "Part": "BG" }, x: 177, y: 57 },
    { componentName: "Balance Thumb", variantValues: { "State": "Normal" }, x: 189, y: 57 },
    // Toggles
    { componentName: "EQ Toggle", variantValues: { "Active": "Off" }, x: 219, y: 58 },
    { componentName: "PL Toggle", variantValues: { "Active": "Off" }, x: 242, y: 58 },
    // Transport buttons
    { componentName: "Previous Button", variantValues: { "State": "Normal" }, x: 16, y: 88 },
    { componentName: "Play Button", variantValues: { "State": "Normal" }, x: 39, y: 88 },
    { componentName: "Pause Button", variantValues: { "State": "Normal" }, x: 62, y: 88 },
    { componentName: "Stop Button", variantValues: { "State": "Normal" }, x: 85, y: 88 },
    { componentName: "Next Button", variantValues: { "State": "Normal" }, x: 108, y: 88 },
    { componentName: "Eject Button", variantValues: { "State": "Normal" }, x: 136, y: 89 },
    // Shuffle and repeat
    { componentName: "Shuffle Toggle", variantValues: { "Active": "Off", "State": "Normal" }, x: 164, y: 89 },
    { componentName: "Repeat Toggle", variantValues: { "Active": "Off", "State": "Normal" }, x: 210, y: 89 },
  ],
};

/**
 * EQ window preview — 275x116 with all elements at their rendering positions.
 * Positions sourced from SKIN_FORMAT.md "EQ Window Element Placement" table.
 */
export const EQ_WINDOW_PREVIEW: PreviewFrameDef = {
  name: "EQ Window",
  width: 275,
  height: 116,
  // Placement order = render order (later placements render ON TOP).
  // Match the Swift renderer's z-stack: background → tracks → buttons →
  // graph → thumbs → title chrome. Buttons and graph would be hidden
  // behind the slider tracks if listed before them.
  placements: [
    // Background
    { componentName: "EQ Background", variantValues: {}, x: 0, y: 0 },
    // Slider tracks first — they extend up into the button row at y=18 and
    // would obscure the buttons if rendered later.
    // Track and thumb share the same x per the Swift renderer.
    // Preamp at x=21; bands follow at 18 px spacing starting at x=78.
    // See docs/skin-format/LAYOUT_SPEC.md.
    // Preview uses Part=BG so the static preview shows the empty track; the
    // exporter interpolates 28 frames from BG→Fill at runtime.
    { componentName: "EQ Slider Track", variantValues: { "Part": "BG" }, x: 21, y: 38 },
    { componentName: "EQ Slider Track", variantValues: { "Part": "BG" }, x: 78, y: 38 },
    { componentName: "EQ Slider Track", variantValues: { "Part": "BG" }, x: 96, y: 38 },
    { componentName: "EQ Slider Track", variantValues: { "Part": "BG" }, x: 114, y: 38 },
    { componentName: "EQ Slider Track", variantValues: { "Part": "BG" }, x: 132, y: 38 },
    { componentName: "EQ Slider Track", variantValues: { "Part": "BG" }, x: 150, y: 38 },
    { componentName: "EQ Slider Track", variantValues: { "Part": "BG" }, x: 168, y: 38 },
    { componentName: "EQ Slider Track", variantValues: { "Part": "BG" }, x: 186, y: 38 },
    { componentName: "EQ Slider Track", variantValues: { "Part": "BG" }, x: 204, y: 38 },
    { componentName: "EQ Slider Track", variantValues: { "Part": "BG" }, x: 222, y: 38 },
    { componentName: "EQ Slider Track", variantValues: { "Part": "BG" }, x: 240, y: 38 },
    // Buttons + graph — placed AFTER tracks so they render on top of the
    // overlapping y=18 portion of the tracks (matches the Swift renderer).
    { componentName: "EQ ON Toggle", variantValues: { "Active": "Off", "State": "Normal" }, x: 14, y: 18 },
    { componentName: "EQ AUTO Toggle", variantValues: { "Active": "Off", "State": "Normal" }, x: 40, y: 18 },
    { componentName: "EQ PRESETS Button", variantValues: { "State": "Normal" }, x: 217, y: 18 },
    { componentName: "EQ Graph BG", variantValues: {}, x: 86, y: 17 },
    // Slider thumbs render above tracks. Thumb default y=64 is the 0 dB
    // resting position (range y=38..90, 52 px travel). Thumb x is
    // track x + 2 — the 11-wide thumb is centered in the 15-wide
    // track: (15 - 11) / 2 = 2. See SkinVerticalSlider.swift line 69.
    { componentName: "EQ Slider Thumb", variantValues: { "State": "Normal" }, x: 23, y: 64 },
    { componentName: "EQ Slider Thumb", variantValues: { "State": "Normal" }, x: 80, y: 64 },
    { componentName: "EQ Slider Thumb", variantValues: { "State": "Normal" }, x: 98, y: 64 },
    { componentName: "EQ Slider Thumb", variantValues: { "State": "Normal" }, x: 116, y: 64 },
    { componentName: "EQ Slider Thumb", variantValues: { "State": "Normal" }, x: 134, y: 64 },
    { componentName: "EQ Slider Thumb", variantValues: { "State": "Normal" }, x: 152, y: 64 },
    { componentName: "EQ Slider Thumb", variantValues: { "State": "Normal" }, x: 170, y: 64 },
    { componentName: "EQ Slider Thumb", variantValues: { "State": "Normal" }, x: 188, y: 64 },
    { componentName: "EQ Slider Thumb", variantValues: { "State": "Normal" }, x: 206, y: 64 },
    { componentName: "EQ Slider Thumb", variantValues: { "State": "Normal" }, x: 224, y: 64 },
    { componentName: "EQ Slider Thumb", variantValues: { "State": "Normal" }, x: 242, y: 64 },
    // Title chrome — last so it always renders on top
    { componentName: "EQ Title Bar", variantValues: { "State": "Active" }, x: 0, y: 0 },
    { componentName: "EQ Shade Button", variantValues: {}, x: 254, y: 3 },
    { componentName: "EQ Close Button", variantValues: { "State": "Normal" }, x: 264, y: 3 },
  ],
};

/**
 * Playlist window preview — 275x232 (default size).
 * Title bar: 20px, body: 174px (6 x 29px border tiles), bottom bar: 38px.
 * Positions sourced from PlaylistWindowView.swift constants.
 */
export const PLAYLIST_PREVIEW: PreviewFrameDef = {
  name: "Playlist",
  width: 275,
  height: 232,
  placements: [
    // Title bar
    { componentName: "PL Title Left Corner", variantValues: { "State": "Active" }, x: 0, y: 0 },
    { componentName: "PL Title Text", variantValues: { "State": "Active" }, x: 26, y: 0 },
    // Fill tiles from x=127 to x=249 in 25px steps (tiles at 127, 152, 177, 202, 227)
    { componentName: "PL Title Fill", variantValues: { "State": "Active" }, x: 127, y: 0 },
    { componentName: "PL Title Fill", variantValues: { "State": "Active" }, x: 152, y: 0 },
    { componentName: "PL Title Fill", variantValues: { "State": "Active" }, x: 177, y: 0 },
    { componentName: "PL Title Fill", variantValues: { "State": "Active" }, x: 202, y: 0 },
    { componentName: "PL Title Fill", variantValues: { "State": "Active" }, x: 227, y: 0 },
    { componentName: "PL Title Right Corner", variantValues: { "State": "Active" }, x: 250, y: 0 },
    // Left border tiles (tiled from y=20 downward, each 29px tall, body height = 174px = 6 tiles)
    { componentName: "PL Left Border", variantValues: {}, x: 0, y: 20 },
    { componentName: "PL Left Border", variantValues: {}, x: 0, y: 49 },
    { componentName: "PL Left Border", variantValues: {}, x: 0, y: 78 },
    { componentName: "PL Left Border", variantValues: {}, x: 0, y: 107 },
    { componentName: "PL Left Border", variantValues: {}, x: 0, y: 136 },
    { componentName: "PL Left Border", variantValues: {}, x: 0, y: 165 },
    // Right border tiles (tiled from y=20 downward, same pattern)
    { componentName: "PL Right Border", variantValues: {}, x: 255, y: 20 },
    { componentName: "PL Right Border", variantValues: {}, x: 255, y: 49 },
    { componentName: "PL Right Border", variantValues: {}, x: 255, y: 78 },
    { componentName: "PL Right Border", variantValues: {}, x: 255, y: 107 },
    { componentName: "PL Right Border", variantValues: {}, x: 255, y: 136 },
    { componentName: "PL Right Border", variantValues: {}, x: 255, y: 165 },
    // Scroll handle within right border area
    // Scroll handle: x = w - rightBorderWidth + 6 = 275 - 20 + 6 = 261
    // y = titleBarHeight + 2 = 20 + 2 = 22 (default position when scrolled to top)
    { componentName: "PL Scroll Handle", variantValues: { "State": "Normal" }, x: 261, y: 22 },
    // Bottom bar (y = 232 - 38 = 194)
    { componentName: "PL Bottom Left", variantValues: {}, x: 0, y: 194 },
    { componentName: "PL Bottom Fill", variantValues: {}, x: 125, y: 194 },
    { componentName: "PL Bottom Right", variantValues: {}, x: 125, y: 194 },
  ],
};

export const PREVIEW_FRAMES: PreviewFrameDef[] = [
  MAIN_WINDOW_PREVIEW,
  EQ_WINDOW_PREVIEW,
  PLAYLIST_PREVIEW,
];

// ---------------------------------------------------------------------------
// Overlay guides
//
// Backgrounds appear as blank rectangles in Figma by default, leaving the
// designer to guess where transport buttons, indicators, text zones, and
// other sprites will land at runtime. OVERLAY_GUIDES maps each background
// component's name to the list of regions that will be composited on top of
// it. The template generator stamps a locked "Overlay Guides" group inside
// each background; the exporter hides the group before exportAsync so it
// does not leak into the skin archive.
//
// Coordinates are in 1× skin pixels, relative to the background's own
// origin. Sourced from docs/skin-format/LAYOUT_SPEC.md.
// ---------------------------------------------------------------------------

export const OVERLAY_GUIDES: Record<string, OverlayGuide[]> = {
  // Rule: each background shows its DIRECT overlays only. Don't re-stamp
  // children that live inside another overlay (e.g. the three window
  // buttons inside Title Bar — they're guided on the Title Bar
  // component itself). Keeps the rectangles non-nested.
  "Main Background": [
    { label: "Title Bar", x: 0, y: 0, width: 275, height: 14 },
    { label: "Play Status", x: 24, y: 28, width: 9, height: 9 },
    // Time display — four 9×13 digit cells at (48, 60, 78, 90) with a
    // 9-px colon gap at x=69..78 that the designer paints into the
    // background. An extra cell at x=36 is only used in remaining-time
    // mode ("-MM:SS"). One guide per cell so the colon gap stays
    // visually reserved. Matches MainWindowView.buildTimeDisplay.
    { label: "−", x: 36, y: 26, width: 9, height: 13 },
    { label: "M", x: 48, y: 26, width: 9, height: 13 },
    { label: "M", x: 60, y: 26, width: 9, height: 13 },
    { label: "S", x: 78, y: 26, width: 9, height: 13 },
    { label: "S", x: 90, y: 26, width: 9, height: 13 },
    // Marquee's x-range (111..265) enters the Time Digits sprite area
    // (36..135) because classic Winamp reserves 99px of digit padding
    // even though only ~60px of characters render. Both regions are
    // real: the digit sprite paints in the left, the marquee in the
    // right. Overlap here reflects runtime truth, not a bug.
    { label: "Marquee", x: 111, y: 27, width: 154, height: 6 },
    { label: "Visualizer", x: 24, y: 43, width: 76, height: 16 },
    { label: "Kbps", x: 111, y: 43, width: 15, height: 6 },
    { label: "Khz", x: 156, y: 43, width: 10, height: 6 },
    { label: "Mono", x: 212, y: 41, width: 27, height: 12 },
    { label: "Stereo", x: 239, y: 41, width: 29, height: 12 },
    { label: "Volume", x: 107, y: 57, width: 68, height: 15 },
    { label: "Balance", x: 177, y: 57, width: 38, height: 15 },
    { label: "EQ Toggle", x: 219, y: 58, width: 23, height: 12 },
    { label: "PL Toggle", x: 242, y: 58, width: 23, height: 12 },
    { label: "Seek Bar", x: 16, y: 72, width: 248, height: 10 },
    { label: "Prev", x: 16, y: 88, width: 23, height: 18 },
    { label: "Play", x: 39, y: 88, width: 23, height: 18 },
    { label: "Pause", x: 62, y: 88, width: 23, height: 18 },
    { label: "Stop", x: 85, y: 88, width: 23, height: 18 },
    { label: "Next", x: 108, y: 88, width: 22, height: 18 },
    { label: "Eject", x: 136, y: 89, width: 22, height: 16 },
    { label: "Shuffle", x: 164, y: 89, width: 47, height: 15 },
    { label: "Repeat", x: 210, y: 89, width: 28, height: 15 },
  ],
  "Shade Background": [
    // Mini Vis width is shrunk to 51 so the guide ends where Mini Time
    // starts (x=130). The Swift renderer currently draws this layer 76
    // wide (MainWindowView.swift buildShadeLayers), which overlaps the
    // mini time text; that's a latent renderer bug and mismatches
    // classic Winamp (~51 wide). Designers should paint for the
    // non-overlapping layout; the renderer can be corrected separately.
    { label: "Mini Vis", x: 79, y: 5, width: 51, height: 5 },
    // Mini Time: 5 bitmap-font chars × 5 px = 25 wide, 6 tall. Earlier
    // "~30 × 8" estimate in LAYOUT_SPEC was approximate.
    { label: "Mini Time", x: 130, y: 4, width: 25, height: 6 },
    { label: "Prev hit", x: 169, y: 2, width: 7, height: 10 },
    { label: "Play hit", x: 176, y: 2, width: 10, height: 10 },
    { label: "Pause hit", x: 186, y: 2, width: 9, height: 10 },
    { label: "Stop hit", x: 195, y: 2, width: 9, height: 10 },
    { label: "Next hit", x: 204, y: 2, width: 10, height: 10 },
    { label: "Eject hit", x: 215, y: 2, width: 10, height: 10 },
    { label: "Mini Pos", x: 226, y: 4, width: 17, height: 7 },
    { label: "Shade Toggle", x: 254, y: 3, width: 9, height: 9 },
    { label: "Close", x: 264, y: 3, width: 9, height: 9 },
  ],
  "EQ Background": [
    { label: "EQ Title Bar", x: 0, y: 0, width: 275, height: 14 },
    { label: "ON", x: 14, y: 18, width: 26, height: 12 },
    { label: "AUTO", x: 40, y: 18, width: 32, height: 12 },
    { label: "Graph", x: 86, y: 17, width: 113, height: 19 },
    { label: "PRESETS", x: 217, y: 18, width: 44, height: 12 },
    // 11 slider tracks (preamp + 10 bands), shared x with thumbs.
    { label: "Preamp", x: 21, y: 38, width: 15, height: 63 },
    { label: "60", x: 78, y: 38, width: 15, height: 63 },
    { label: "170", x: 96, y: 38, width: 15, height: 63 },
    { label: "310", x: 114, y: 38, width: 15, height: 63 },
    { label: "600", x: 132, y: 38, width: 15, height: 63 },
    { label: "1k", x: 150, y: 38, width: 15, height: 63 },
    { label: "3k", x: 168, y: 38, width: 15, height: 63 },
    { label: "6k", x: 186, y: 38, width: 15, height: 63 },
    { label: "12k", x: 204, y: 38, width: 15, height: 63 },
    { label: "14k", x: 222, y: 38, width: 15, height: 63 },
    { label: "16k", x: 240, y: 38, width: 15, height: 63 },
  ],
  "EQ Shade BG": [
    { label: "Vol track (paint channel)", x: 61, y: 4, width: 97, height: 6 },
    { label: "Bal track (paint channel)", x: 164, y: 4, width: 43, height: 6 },
    { label: "Shade (paint well)", x: 254, y: 3, width: 9, height: 9 },
    { label: "Close", x: 264, y: 3, width: 9, height: 9 },
  ],
  "Title Bar": [
    { label: "Minimize", x: 244, y: 3, width: 9, height: 9 },
    { label: "Shade", x: 254, y: 3, width: 9, height: 9 },
    { label: "Close", x: 264, y: 3, width: 9, height: 9 },
  ],
  "EQ Title Bar": [
    { label: "Shade", x: 254, y: 3, width: 9, height: 9 },
    { label: "Close", x: 264, y: 3, width: 9, height: 9 },
  ],
  // Playlist Title Right Corner hosts Close + Shade hit-rects at the
  // window-level positions (264, 3) and (254, 3). Translate into corner-
  // local coordinates: corner starts at x = windowWidth - 25, so
  // close = 264 - (275 - 25) = 14, shade = 254 - (275 - 25) = 4.
  "PL Title Right Corner": [
    { label: "Shade (paint well)", x: 4, y: 3, width: 9, height: 9 },
    { label: "Close (paint well)", x: 14, y: 3, width: 9, height: 9 },
  ],
  // PL Shade Right is 50×14 anchored at x=w-50. The Close/Shade hit-rects
  // at (264, 3) and (254, 3) land at corner-local x = 264 - (275 - 50) = 39
  // and x = 254 - 225 = 29.
  "PL Shade Right": [
    { label: "Shade (paint well)", x: 29, y: 3, width: 9, height: 9 },
    { label: "Close (paint well)", x: 39, y: 3, width: 9, height: 9 },
  ],
  "PL Bottom Right": [
    { label: "Running time", x: 7, y: 10, width: 33, height: 6 },
    { label: "Total time", x: 66, y: 23, width: 33, height: 6 },
  ],
};

/** Sentinel name for the locked guides group stamped into backgrounds. */
export const OVERLAY_GUIDES_GROUP_NAME = "Overlay Guides";
