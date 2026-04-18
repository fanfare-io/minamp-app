// ---------------------------------------------------------------------------
// Reads and parses .wsz / .msz skin archives in the browser.
// WSZ = classic Winamp skin (BMP images at 1x).
// MSZ = Minamp skin (PNG images at configurable scale).
// ---------------------------------------------------------------------------

import JSZip from "jszip";

export interface ImportedSkin {
  /** Map of uppercase filename to PNG bytes */
  files: Array<{ name: string; bytes: Uint8Array }>;
  /** VISCOLOR.TXT content if present */
  viscolorTxt: string | null;
  /** PLEDIT.TXT content if present */
  pleditTxt: string | null;
  /** Detected scale (1 for .wsz, from skin.json for .msz) */
  detectedScale: number;
  /** Format: "wsz" or "msz" */
  format: "wsz" | "msz";
}

export async function importSkinFile(file: File): Promise<ImportedSkin> {
  const buffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(buffer);

  // Detect format from extension
  const ext = file.name.toLowerCase().split(".").pop();
  const isMSZ = ext === "msz";

  // Read skin.json for .msz files
  let detectedScale = 1;
  if (isMSZ) {
    const manifestEntry = zip.file(/skin\.json/i);
    if (manifestEntry.length > 0) {
      const text = await manifestEntry[0].async("text");
      const manifest = JSON.parse(text) as { assetScale?: number };
      detectedScale = manifest.assetScale || 2;
    }
  }

  // Extract all image files
  const files: Array<{ name: string; bytes: Uint8Array }> = [];
  const imageExtensions = isMSZ ? [".png"] : [".bmp", ".png"];

  for (const [path, entry] of Object.entries(zip.files)) {
    if (entry.dir) continue;
    const filename = path.split("/").pop()?.toUpperCase() || "";

    const isImage = imageExtensions.some((e) =>
      filename.toLowerCase().endsWith(e)
    );
    if (isImage) {
      const bytes = await entry.async("uint8array");

      // For .wsz BMP files, convert to PNG using Canvas
      if (filename.endsWith(".BMP")) {
        const pngBytes = await convertBmpToPng(bytes);
        // Store with .PNG extension
        const pngName = filename.replace(/\.BMP$/i, ".PNG");
        files.push({ name: pngName, bytes: pngBytes });
      } else {
        files.push({ name: filename, bytes });
      }
    }
  }

  // Read config files
  let viscolorTxt: string | null = null;
  let pleditTxt: string | null = null;

  for (const [path, entry] of Object.entries(zip.files)) {
    const filename = path.split("/").pop()?.toUpperCase() || "";
    if (filename === "VISCOLOR.TXT") {
      viscolorTxt = await entry.async("text");
    } else if (filename === "PLEDIT.TXT") {
      pleditTxt = await entry.async("text");
    }
  }

  return {
    files,
    viscolorTxt,
    pleditTxt,
    detectedScale,
    format: isMSZ ? "msz" : "wsz",
  };
}

/** Convert BMP bytes to PNG bytes using Canvas 2D */
async function convertBmpToPng(bmpBytes: Uint8Array): Promise<Uint8Array> {
  // Copy into a fresh ArrayBuffer to satisfy BlobPart typing
  const copy = new ArrayBuffer(bmpBytes.byteLength);
  new Uint8Array(copy).set(bmpBytes);
  const blob = new Blob([copy], { type: "image/bmp" });
  const url = URL.createObjectURL(blob);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not get 2D context for BMP conversion"));
        return;
      }
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((pngBlob) => {
        if (!pngBlob) {
          reject(new Error("Failed to convert BMP to PNG"));
          return;
        }
        pngBlob.arrayBuffer().then((buf) => {
          resolve(new Uint8Array(buf));
        });
      }, "image/png");
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load BMP image"));
    };
    img.src = url;
  });
}
