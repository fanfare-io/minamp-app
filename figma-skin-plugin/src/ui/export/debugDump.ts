// ---------------------------------------------------------------------------
// Debug dump — packages per-variant PNGs, interpolated slider frames, and
// assembled sheet PNGs into a sibling `<skin>.debug.zip` so the sheet
// contract can be inspected without trying to load a broken .msz into the
// app. Triggered from the Export panel's "Dump debug PNGs" checkbox.
// ---------------------------------------------------------------------------

import JSZip from "jszip";
import type { ExportedVariant, SliderFrameSet } from "./sheetAssembler";

export interface DebugDumpInput {
  skinName: string;
  assetScale: number;
  variants: ExportedVariant[];
  sliderFrameSets: SliderFrameSet[];
  sheets: Map<string, Uint8Array>;
}

export async function createDebugDumpArchive(
  input: DebugDumpInput,
): Promise<number> {
  const { skinName, assetScale, variants, sliderFrameSets, sheets } = input;
  const zip = new JSZip();

  // Assembled sheets — what the app will actually read.
  const sheetsDir = zip.folder("sheets")!;
  for (const [name, bytes] of sheets) {
    sheetsDir.file(name, bytes);
  }

  // Raw per-variant PNGs as emitted by Figma before any compositing.
  const variantsDir = zip.folder("per_variant")!;
  const nameCounts = new Map<string, number>();
  for (const v of variants) {
    const variantLabel = Object.entries(v.variantValues)
      .map(([k, val]) => `${k}=${val}`)
      .join(",") || "_";
    const base = `${sanitize(v.componentName)}__${sanitize(variantLabel)}.png`;
    const seen = nameCounts.get(base) ?? 0;
    nameCounts.set(base, seen + 1);
    const fileName = seen === 0 ? base : `${base}.${seen + 1}`;
    variantsDir.file(fileName, v.bytes);
  }

  // Interpolated slider frames (28 per slider) so we can eyeball whether
  // the fill grows in the expected direction.
  const slidersDir = zip.folder("slider_frames")!;
  for (const sf of sliderFrameSets) {
    const dir = slidersDir.folder(sanitize(sf.componentName))!;
    for (let i = 0; i < sf.frames.length; i++) {
      const idx = String(i).padStart(2, "0");
      dir.file(`frame_${idx}.png`, sf.frames[i]);
    }
  }

  // Minimal manifest to make the dump self-describing.
  const manifest = {
    skinName,
    assetScale,
    variantCount: variants.length,
    sliderSetCount: sliderFrameSets.length,
    sheetCount: sheets.size,
    generatedAt: new Date().toISOString(),
  };
  zip.file("manifest.json", JSON.stringify(manifest, null, 2));

  const blob = await zip.generateAsync({ type: "blob" });
  downloadBlob(blob, `${skinName}.debug.zip`);
  return blob.size;
}

function sanitize(s: string): string {
  return s.replace(/[^A-Za-z0-9._=,-]+/g, "_");
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
