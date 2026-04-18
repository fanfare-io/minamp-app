// ---------------------------------------------------------------------------
// Slider frame generator.
//
// Generates N intermediate slider frames by compositing a track background
// with a track fill using progressive clip masking.
//
// Contract for BOTH orientations: frame 0 = empty (BG only), frame 27 = full
// (BG fully overdrawn by Fill). The renderer maps its value range linearly
// onto frames 0..27. Horizontal fills grow left-to-right; vertical fills grow
// bottom-to-top. Designers paint `Part=BG` as the empty track and
// `Part=Fill` as the fully-lit state; intermediate frames are generated here.
// ---------------------------------------------------------------------------

/**
 * Generate intermediate slider frames by compositing trackBG with trackFill.
 *
 * @param trackBgBytes - PNG bytes of the empty track background
 * @param trackFillBytes - PNG bytes of the fully filled track
 * @param orientation - "horizontal" or "vertical"
 * @param frameCount - Number of frames to generate (default 28)
 * @returns Array of frameCount PNG byte arrays
 */
export async function generateSliderFrames(
  trackBgBytes: Uint8Array,
  trackFillBytes: Uint8Array,
  orientation: "horizontal" | "vertical",
  frameCount: number = 28,
): Promise<Uint8Array[]> {
  const bgImg = await loadImage(trackBgBytes);
  const fillImg = await loadImage(trackFillBytes);

  const width = bgImg.width;
  const height = bgImg.height;

  const frames: Uint8Array[] = [];

  for (let i = 0; i < frameCount; i++) {
    // Same contract for both orientations: fraction grows linearly with
    // frame index, so frame 0 = empty (only BG visible) and frame 27 =
    // full (Fill fully overdrawn).
    const fraction = i / (frameCount - 1); // 0.0 to 1.0

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d")!;

    // Draw background
    ctx.drawImage(bgImg, 0, 0);

    // Draw fill with progressive clip
    ctx.save();
    if (orientation === "horizontal") {
      // Clip left-to-right
      const clipWidth = Math.round(width * fraction);
      ctx.beginPath();
      ctx.rect(0, 0, clipWidth, height);
      ctx.clip();
    } else {
      // Vertical: clip bottom-to-top. fraction=0 → no fill, fraction=1 → full fill.
      const clipHeight = Math.round(height * fraction);
      const clipY = height - clipHeight;
      ctx.beginPath();
      ctx.rect(0, clipY, width, clipHeight);
      ctx.clip();
    }
    ctx.drawImage(fillImg, 0, 0);
    ctx.restore();

    // Export as PNG
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => b ? resolve(b) : reject(new Error("Failed to export frame")),
        "image/png",
      );
    });
    const buffer = await blob.arrayBuffer();
    frames.push(new Uint8Array(buffer));
  }

  return frames;
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
