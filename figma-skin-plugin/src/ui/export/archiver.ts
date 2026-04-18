// ---------------------------------------------------------------------------
// Creates an .msz ZIP archive and triggers a browser download.
// ---------------------------------------------------------------------------

import JSZip from "jszip";
import { PleditConfig, generatePledit, generateViscolor } from "./configFiles";
import { FORMAT_VERSION } from "../../shared/constants";

export interface SkinConfig {
  skinName: string;
  assetScale: number;
  viscolors: string[];
  pledit: PleditConfig;
}

/**
 * Build the .msz archive from exported PNG frames and config, then
 * trigger a browser download. Returns the total file size in bytes.
 */
export async function createMSZArchive(
  frames: Map<string, Uint8Array>,
  config: SkinConfig
): Promise<number> {
  const zip = new JSZip();

  // Add all PNG frames
  for (const [name, bytes] of frames) {
    zip.file(name, bytes);
  }

  // Add skin.json manifest
  const manifest = {
    formatVersion: FORMAT_VERSION,
    assetScale: config.assetScale,
  };
  zip.file("skin.json", JSON.stringify(manifest, null, 2));

  // Add config files
  zip.file("VISCOLOR.TXT", generateViscolor(config.viscolors));
  zip.file("PLEDIT.TXT", generatePledit(config.pledit));

  // Generate and download
  const blob = await zip.generateAsync({ type: "blob" });
  downloadBlob(blob, `${config.skinName}.msz`);

  return blob.size;
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
