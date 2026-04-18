// ---------------------------------------------------------------------------
// Generates VISCOLOR.TXT and PLEDIT.TXT content strings from config state.
// ---------------------------------------------------------------------------

export interface PleditConfig {
  normal: string;
  current: string;
  normalBG: string;
  selectedBG: string;
  font: string;
}

/**
 * Convert an array of 24 hex color strings (e.g. "#FF0000") to
 * VISCOLOR.TXT format: one "R,G,B" line per color.
 */
export function generateViscolor(colors: string[]): string {
  const lines: string[] = [];

  for (let i = 0; i < 24; i++) {
    const hex = i < colors.length ? colors[i] : "#000000";
    const { r, g, b } = hexToRGB(hex);
    lines.push(`${r},${g},${b}`);
  }

  return lines.join("\n") + "\n";
}

/**
 * Generate PLEDIT.TXT content in INI format with a [Text] section.
 */
export function generatePledit(config: PleditConfig): string {
  const lines = [
    "[Text]",
    `Normal=${stripHash(config.normal)}`,
    `Current=${stripHash(config.current)}`,
    `NormalBG=${stripHash(config.normalBG)}`,
    `SelectedBG=${stripHash(config.selectedBG)}`,
    `Font=${config.font}`,
    "",
  ];
  return lines.join("\n");
}

// -- Helpers ------------------------------------------------------------------

function hexToRGB(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16) || 0;
  const g = parseInt(clean.substring(2, 4), 16) || 0;
  const b = parseInt(clean.substring(4, 6), 16) || 0;
  return { r, g, b };
}

/**
 * Strip the leading "#" from a hex color, returning uppercase 6-digit hex.
 * PLEDIT.TXT stores colors without the hash prefix.
 */
function stripHash(hex: string): string {
  return hex.replace("#", "").toUpperCase().padStart(6, "0");
}
