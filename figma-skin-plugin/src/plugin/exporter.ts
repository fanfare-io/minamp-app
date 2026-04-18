// ---------------------------------------------------------------------------
// Exports all sprite sheet frames as PNG at native resolution (SCALE:1).
// Frames are already at the target scale (e.g. 2x), so no upscaling needed.
// Hides guide layers before export and restores them afterward.
// ---------------------------------------------------------------------------

import { SPRITE_SHEETS } from "../shared/spriteSheetDefs";
import { DEFAULT_ASSET_SCALE, GUIDES_GROUP_NAME, SCALE_PLUGIN_DATA_KEY } from "../shared/constants";

/**
 * Find a direct child group named "Guides" inside a frame, if one exists.
 */
function findGuidesGroup(frame: FrameNode): GroupNode | null {
  for (const child of frame.children) {
    if (child.type === "GROUP" && child.name === GUIDES_GROUP_NAME) {
      return child;
    }
  }
  return null;
}

/**
 * Export every expected sprite sheet frame on the current page as a PNG.
 *
 * Since frames are already at the target scale (e.g. 2x = 550x232 for MAIN),
 * we export at SCALE:1 to get the native resolution.
 *
 * For each frame:
 *   1. Find the frame by name on the current page
 *   2. Hide its "Guides" child group (if present) so guides don't appear in output
 *   3. Export at SCALE:1 using exportAsync
 *   4. Restore guide visibility
 *   5. Post the exported bytes to the UI thread
 *
 * Missing optional frames are skipped with a warning.
 * Missing required frames cause an error message.
 *
 * After all frames are exported, sends an EXPORT_COMPLETE message.
 */
export async function exportAllFrames(): Promise<void> {
  const page = figma.currentPage;

  // Read the configured scale from page plugin data
  const scaleStr = page.getPluginData(SCALE_PLUGIN_DATA_KEY);
  const scale = scaleStr ? parseInt(scaleStr, 10) : DEFAULT_ASSET_SCALE;

  // Build a lookup of top-level frames by name (case-insensitive)
  const framesByName = new Map<string, FrameNode>();
  for (const child of page.children) {
    if (child.type === "FRAME") {
      framesByName.set(child.name.toUpperCase(), child);
    }
  }

  let exportedCount = 0;
  const total = SPRITE_SHEETS.length;

  for (let i = 0; i < SPRITE_SHEETS.length; i++) {
    const sheet = SPRITE_SHEETS[i];
    const frame = framesByName.get(sheet.frameName.toUpperCase());

    if (!frame) {
      if (sheet.required) {
        figma.ui.postMessage({
          type: "ERROR",
          message: `Required frame "${sheet.frameName}" not found on this page. Run validation first.`,
        });
        return;
      }
      // Optional frame missing — skip silently
      continue;
    }

    // Hide guides for clean export
    const guidesGroup = findGuidesGroup(frame);
    const guidesWasVisible = guidesGroup?.visible ?? false;
    if (guidesGroup) {
      guidesGroup.visible = false;
    }

    try {
      // Export at SCALE:1 — frames are already at target resolution
      const bytes = await frame.exportAsync({
        format: "PNG",
        constraint: { type: "SCALE", value: 1 },
      });

      figma.ui.postMessage({
        type: "FRAME_EXPORTED",
        frameName: sheet.frameName,
        index: exportedCount,
        total,
      });

      // Send the raw bytes as a separate message so the UI can accumulate them
      figma.ui.postMessage(
        {
          type: "FRAME_BYTES",
          frameName: sheet.fileName,
          bytes,
        },
        { origin: "*" },
      );

      exportedCount++;
    } finally {
      // Restore guides visibility
      if (guidesGroup) {
        guidesGroup.visible = guidesWasVisible;
      }
    }
  }

  figma.ui.postMessage({
    type: "EXPORT_COMPLETE",
    skinName: page.name,
    fileSize: 0, // The UI will compute the real .msz size after zipping
  });
}
