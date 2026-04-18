// ---------------------------------------------------------------------------
// Sprite sheet assembler.
//
// Takes individually exported component variant PNGs and composites them
// into complete sprite sheet PNGs using Canvas 2D in the UI iframe.
//
// For each target sprite sheet:
//   1. Create an offscreen canvas at the sheet's dimensions (scaled)
//   2. For each variant that targets this sheet, draw it at its position
//   3. Export the canvas as PNG bytes
// ---------------------------------------------------------------------------

import type { SpriteSheetTarget } from "../../shared/componentDefs";

export interface ExportedVariant {
  componentName: string;
  variantValues: Record<string, string>;
  bytes: Uint8Array;
  target: SpriteSheetTarget;
}

export interface SliderFrameSet {
  componentName: string;
  target: SpriteSheetTarget;
  frames: Uint8Array[];
}

export interface AssembledSheet {
  fileName: string;
  bytes: Uint8Array;
}

/**
 * Assembles exported component variants and slider frames into sprite sheet PNGs.
 *
 * @param variants - All exported component variants with their target placement info
 * @param sliderFrameSets - Generated slider frame sets, keyed by component name
 * @param scale - The asset scale factor (e.g. 2 for 2x)
 * @returns Array of assembled sprite sheet PNGs
 */
export async function assembleSheets(
  variants: ExportedVariant[],
  sliderFrameSets: SliderFrameSet[],
  scale: number,
): Promise<AssembledSheet[]> {
  // Collect all unique target sheet file names and their dimensions.
  // Multiple components can target the same sheet.
  const sheetMeta = new Map<string, { width: number; height: number }>();

  for (const v of variants) {
    if (!sheetMeta.has(v.target.fileName)) {
      sheetMeta.set(v.target.fileName, {
        width: v.target.sheetWidth,
        height: v.target.sheetHeight,
      });
    }
  }

  for (const sf of sliderFrameSets) {
    if (!sheetMeta.has(sf.target.fileName)) {
      sheetMeta.set(sf.target.fileName, {
        width: sf.target.sheetWidth,
        height: sf.target.sheetHeight,
      });
    }
  }

  // Group variants by target file name
  const variantsBySheet = new Map<string, ExportedVariant[]>();
  for (const v of variants) {
    const existing = variantsBySheet.get(v.target.fileName) || [];
    existing.push(v);
    variantsBySheet.set(v.target.fileName, existing);
  }

  // Group slider frame sets by target file name
  const slidersBySheet = new Map<string, SliderFrameSet[]>();
  for (const sf of sliderFrameSets) {
    const existing = slidersBySheet.get(sf.target.fileName) || [];
    existing.push(sf);
    slidersBySheet.set(sf.target.fileName, existing);
  }

  const results: AssembledSheet[] = [];

  for (const [fileName, meta] of sheetMeta) {
    const canvasWidth = meta.width * scale;
    const canvasHeight = meta.height * scale;

    const canvas = document.createElement("canvas");
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext("2d")!;

    // Draw all regular variants for this sheet
    const sheetVariants = variantsBySheet.get(fileName) || [];
    for (const v of sheetVariants) {
      const placement = findPlacement(v.target, v.variantValues);
      if (!placement) continue;

      const img = await loadImage(v.bytes);
      // Placement coordinates are in 1x skin pixels; the exported PNG is
      // already at the scaled resolution, so multiply position by scale.
      ctx.drawImage(img, placement.x * scale, placement.y * scale);
    }

    // Draw slider frames for this sheet
    const sheetSliders = slidersBySheet.get(fileName) || [];
    for (const sf of sheetSliders) {
      for (let i = 0; i < sf.frames.length && i < sf.target.placements.length; i++) {
        const placement = sf.target.placements[i];
        const img = await loadImage(sf.frames[i]);
        ctx.drawImage(img, placement.x * scale, placement.y * scale);
      }
    }

    // Export canvas as PNG
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => b ? resolve(b) : reject(new Error(`Failed to export sheet ${fileName}`)),
        "image/png",
      );
    });
    const buffer = await blob.arrayBuffer();
    results.push({
      fileName,
      bytes: new Uint8Array(buffer),
    });
  }

  return results;
}

/**
 * Find the placement coordinates for a variant within a SpriteSheetTarget.
 * Matches variant values against the placements defined in the target.
 */
function findPlacement(
  target: SpriteSheetTarget,
  variantValues: Record<string, string>,
): { x: number; y: number } | null {
  for (const p of target.placements) {
    const keys = Object.keys(p.variantValues);
    const matches = keys.every((k) => variantValues[k] === p.variantValues[k]);
    // For components with no variant axes, placements have empty variantValues
    if (keys.length === 0 && Object.keys(variantValues).length === 0) {
      return { x: p.x, y: p.y };
    }
    if (matches && keys.length > 0) {
      return { x: p.x, y: p.y };
    }
  }
  return null;
}

function loadImage(bytes: Uint8Array): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const blob = new Blob([new Uint8Array(bytes)], { type: "image/png" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Failed to load image")); };
    img.src = url;
  });
}
