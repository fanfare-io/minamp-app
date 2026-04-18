// ---------------------------------------------------------------------------
// Figma plugin sandbox entry point.
//
// This code runs in Figma's sandbox thread — it has access to the Figma
// document API but NOT browser APIs (no DOM, no fetch, no localStorage).
//
// Responsibilities:
//   - Show the plugin UI
//   - Route menu commands to the UI
//   - Handle messages from the UI and dispatch to sandbox handlers
// ---------------------------------------------------------------------------

import { validateSkin, overallStatus } from "./validator";
import { exportAllFrames } from "./exporter";
import { generateTemplate, generateComponentTemplate } from "./templateGenerator";
import { exportAllComponents } from "./componentExporter";
import { SPRITE_SHEETS } from "../shared/spriteSheetDefs";
import { DEFAULT_ASSET_SCALE, ARTWORK_GROUP_NAME, SCALE_PLUGIN_DATA_KEY } from "../shared/constants";
import type { UIToSandboxMessage } from "../shared/messages";

// ---------------------------------------------------------------------------
// Show the plugin UI
// ---------------------------------------------------------------------------

figma.showUI(__html__, {
  width: 420,
  height: 600,
  title: "Minamp Skin Designer",
  themeColors: true,
});

// ---------------------------------------------------------------------------
// Handle menu commands (from manifest.json "menu" entries)
// ---------------------------------------------------------------------------

switch (figma.command) {
  case "generate-template":
    // Tell the UI to switch to the template generation view
    figma.ui.postMessage({ type: "SWITCH_VIEW", view: "generate-template" });
    break;

  case "validate":
    // Tell the UI to switch to the validation view
    figma.ui.postMessage({ type: "SWITCH_VIEW", view: "validate" });
    break;

  case "export":
    // Tell the UI to switch to the export view
    figma.ui.postMessage({ type: "SWITCH_VIEW", view: "export" });
    break;

  case "open":
  default:
    // Default: just open the UI (it shows the home/overview screen)
    break;
}

// ---------------------------------------------------------------------------
// Handle messages from the UI iframe
// ---------------------------------------------------------------------------

figma.ui.onmessage = async (msg: UIToSandboxMessage) => {
  try {
    switch (msg.type) {
      case "VALIDATE": {
        const results = validateSkin();
        figma.ui.postMessage({
          type: "VALIDATION_RESULT",
          frames: results,
          overallStatus: overallStatus(results),
        });
        break;
      }

      case "EXPORT": {
        // Branch on templateMode just like the validator does: component-mode
        // pages have ComponentSets, not top-level sprite-sheet frames, so the
        // sprite-sheet exporter would fail with "Required frame ... not found".
        const mode = figma.currentPage.getPluginData("templateMode");
        if (mode === "component") {
          await exportAllComponents();
        } else {
          await exportAllFrames();
        }
        break;
      }

      case "GENERATE_TEMPLATE": {
        const scale = msg.assetScale;
        await generateTemplate(scale);
        figma.ui.postMessage({
          type: "TEMPLATE_GENERATED",
          frameCount: SPRITE_SHEETS.length,
          assetScale: scale,
        });
        figma.notify(`Template frames created at ${scale}x! Start designing in the Artwork groups.`);
        break;
      }

      case "IMPORT_SKIN": {
        const { files, targetScale } = msg;

        // Generate empty template at the target scale (this also cleans up
        // any existing frames and stores the scale on the page)
        await generateTemplate(targetScale);

        const page = figma.currentPage;

        // Build a lookup of the newly created frames by name (case-insensitive)
        const framesByName = new Map<string, FrameNode>();
        for (const child of page.children) {
          if (child.type === "FRAME") {
            framesByName.set(child.name.toUpperCase(), child);
          }
        }

        // Place each imported image into its matching frame
        let placedCount = 0;
        for (const file of files) {
          // Strip extension to get the frame name (e.g. "MAIN.PNG" -> "MAIN")
          const frameName = file.name.replace(/\.[^.]+$/, "").toUpperCase();
          const frame = framesByName.get(frameName);

          if (!frame) {
            // No matching frame — skip silently
            continue;
          }

          // Find the Artwork group inside this frame
          let artworkGroup: GroupNode | null = null;
          for (const child of frame.children) {
            if (child.type === "GROUP" && child.name === ARTWORK_GROUP_NAME) {
              artworkGroup = child;
              break;
            }
          }

          if (!artworkGroup) {
            continue;
          }

          // Create an image fill from the imported bytes
          const image = figma.createImage(file.bytes);
          const rect = figma.createRectangle();
          rect.name = "Imported Skin";
          rect.resize(frame.width, frame.height);
          rect.fills = [{ type: "IMAGE", imageHash: image.hash, scaleMode: "FILL" }];
          artworkGroup.appendChild(rect);

          // Remove the placeholder rectangle if it exists
          const placeholder = artworkGroup.findOne(
            (node) => node.name === "placeholder (delete me)",
          );
          if (placeholder) {
            placeholder.remove();
          }

          placedCount++;
        }

        figma.ui.postMessage({
          type: "IMPORT_COMPLETE",
          frameCount: placedCount,
          scale: targetScale,
        });
        figma.notify(`Imported ${placedCount} skin images at ${targetScale}x.`);
        break;
      }

      case "GENERATE_COMPONENT_TEMPLATE": {
        const componentScale = msg.assetScale;
        const result = await generateComponentTemplate(componentScale);
        figma.ui.postMessage({
          type: "TEMPLATE_GENERATED",
          frameCount: 0, // Component mode doesn't create sprite sheet frames
          assetScale: componentScale,
        });
        figma.notify(
          `Template created at ${componentScale}x: ${result.componentsCreated} components.`,
        );
        break;
      }

      case "EXPORT_COMPONENTS": {
        await exportAllComponents();
        break;
      }

      case "IMPORT_ASSET": {
        const { name, url, bytes } = msg;
        const image = figma.createImage(bytes);
        const dims = await image.getSizeAsync();
        const entry = {
          name,
          url,
          hash: image.hash,
          width: dims.width,
          height: dims.height,
          importedAt: new Date().toISOString(),
        };

        const page = figma.currentPage;

        // Update manifest (replace existing entry with same name, else append)
        const manifestRaw = page.getPluginData("assetManifest");
        const manifest = manifestRaw ? JSON.parse(manifestRaw) : [];
        const existingIndex = manifest.findIndex(
          (a: { name: string }) => a.name === name,
        );
        if (existingIndex >= 0) manifest[existingIndex] = entry;
        else manifest.push(entry);
        page.setPluginData("assetManifest", JSON.stringify(manifest));

        // Also store hash under "asset:<name>" so external callers (e.g. the
        // Figma MCP) can fetch a single hash by name without parsing JSON.
        page.setPluginData("asset:" + name, image.hash);

        // Render / refresh thumbnail in the "Imported Assets" frame so the
        // user (and the MCP) can see what got imported.
        let frame: FrameNode | null = null;
        for (const child of page.children) {
          if (child.type === "FRAME" && child.name === "Imported Assets") {
            frame = child;
            break;
          }
        }
        if (!frame) {
          frame = figma.createFrame();
          frame.name = "Imported Assets";
          frame.layoutMode = "HORIZONTAL";
          frame.layoutWrap = "WRAP";
          frame.itemSpacing = 12;
          frame.counterAxisSpacing = 12;
          frame.paddingTop = 32;
          frame.paddingLeft = 16;
          frame.paddingRight = 16;
          frame.paddingBottom = 16;
          frame.primaryAxisSizingMode = "AUTO";
          frame.counterAxisSizingMode = "AUTO";
          frame.fills = [{ type: "SOLID", color: { r: 0.08, g: 0.08, b: 0.12 } }];
          page.appendChild(frame);
          frame.x = -2400;
          frame.y = 0;

          await figma.loadFontAsync({ family: "Inter", style: "Medium" });
          const title = figma.createText();
          title.fontName = { family: "Inter", style: "Medium" };
          title.fontSize = 16;
          title.characters = "Imported Assets";
          title.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 }, opacity: 0.9 }];
          frame.appendChild(title);
          title.layoutPositioning = "ABSOLUTE";
          title.x = 16;
          title.y = 10;
        }

        // Remove existing thumbnail with same name
        for (const child of frame.children.slice()) {
          if (child.type === "RECTANGLE" && child.name === name) {
            child.remove();
          }
        }

        // Create new thumbnail (max 200px on the longer side)
        const maxDim = 200;
        const ratio = dims.width / dims.height;
        const thumbW = ratio > 1 ? maxDim : Math.round(maxDim * ratio);
        const thumbH = ratio > 1 ? Math.round(maxDim / ratio) : maxDim;
        const thumb = figma.createRectangle();
        thumb.name = name;
        thumb.resize(thumbW, thumbH);
        thumb.fills = [{ type: "IMAGE", imageHash: image.hash, scaleMode: "FIT" }];
        frame.appendChild(thumb);

        figma.ui.postMessage({ type: "ASSET_IMPORTED", asset: entry });
        figma.notify(`Imported asset "${name}" (${dims.width}\u00D7${dims.height}).`);
        break;
      }

      case "LIST_ASSETS": {
        const page = figma.currentPage;
        const raw = page.getPluginData("assetManifest");
        const assets = raw ? JSON.parse(raw) : [];
        figma.ui.postMessage({ type: "ASSETS_LIST", assets });
        break;
      }

      case "DELETE_ASSET": {
        const page = figma.currentPage;
        const raw = page.getPluginData("assetManifest");
        const manifest = raw ? JSON.parse(raw) : [];
        const filtered = manifest.filter(
          (a: { name: string }) => a.name !== msg.name,
        );
        page.setPluginData("assetManifest", JSON.stringify(filtered));
        page.setPluginData("asset:" + msg.name, "");

        for (const child of page.children) {
          if (child.type === "FRAME" && child.name === "Imported Assets") {
            for (const grandchild of child.children.slice()) {
              if (grandchild.type === "RECTANGLE" && grandchild.name === msg.name) {
                grandchild.remove();
              }
            }
            break;
          }
        }

        figma.ui.postMessage({ type: "ASSET_DELETED", name: msg.name });
        break;
      }

      case "PREVIEW": {
        const page = figma.currentPage;

        // Read the configured scale from page plugin data
        const scaleStr = page.getPluginData(SCALE_PLUGIN_DATA_KEY);
        const scale = scaleStr ? parseInt(scaleStr, 10) : DEFAULT_ASSET_SCALE;

        const frame = page.children.find(
          (child): child is FrameNode =>
            child.type === "FRAME" &&
            child.name.toUpperCase() === msg.frameName.toUpperCase(),
        );

        if (!frame) {
          figma.ui.postMessage({
            type: "ERROR",
            message: `Frame "${msg.frameName}" not found on this page.`,
          });
          break;
        }

        // Export at SCALE:1 since frames are already at target resolution
        const imageData = await frame.exportAsync({
          format: "PNG",
          constraint: { type: "SCALE", value: 1 },
        });

        figma.ui.postMessage({
          type: "PREVIEW_DATA",
          frameName: msg.frameName,
          imageData,
          width: frame.width,
          height: frame.height,
        });
        break;
      }

      default: {
        // Unknown message type — log for debugging
        const exhaustiveCheck: never = msg;
        console.warn("Unknown message type:", exhaustiveCheck);
        break;
      }
    }
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    figma.ui.postMessage({ type: "ERROR", message });
  }
};
