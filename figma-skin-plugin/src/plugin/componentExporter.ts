// ---------------------------------------------------------------------------
// Component-mode exporter.
//
// Iterates through COMPONENT_DEFS, finds matching ComponentSet or Component
// nodes on the current Figma page, and exports each variant as a PNG.
// Results are posted to the UI iframe for assembly into sprite sheet PNGs.
// ---------------------------------------------------------------------------

import { COMPONENT_DEFS, OVERLAY_GUIDES_GROUP_NAME, type ComponentDef } from "../shared/componentDefs";
import { SCALE_PLUGIN_DATA_KEY, DEFAULT_ASSET_SCALE } from "../shared/constants";

/**
 * Runs `fn` with every descendant group named `Overlay Guides` temporarily
 * hidden, so the labeled guide rectangles we stamp into background
 * components don't leak into exported PNGs. Restores prior visibility
 * afterwards (even on throw).
 */
async function withOverlayGuidesHidden<T>(
  node: ComponentNode | ComponentSetNode,
  fn: () => Promise<T>,
): Promise<T> {
  const hidden: GroupNode[] = [];
  const walk = (n: SceneNode) => {
    if (n.type === "GROUP" && n.name === OVERLAY_GUIDES_GROUP_NAME) {
      if (n.visible) {
        hidden.push(n);
        n.visible = false;
      }
      return;
    }
    if ("children" in n) {
      for (const child of n.children) walk(child);
    }
  };
  walk(node);
  try {
    return await fn();
  } finally {
    for (const g of hidden) g.visible = true;
  }
}

export async function exportAllComponents(): Promise<void> {
  const page = figma.currentPage;
  const scaleStr = page.getPluginData(SCALE_PLUGIN_DATA_KEY);
  const scale = scaleStr ? parseInt(scaleStr, 10) : DEFAULT_ASSET_SCALE;

  // Find all ComponentSets and standalone Components by name.
  // Searches top-level children and one level deep inside section frames.
  const componentsByName = new Map<string, ComponentSetNode | ComponentNode>();
  for (const child of page.children) {
    if (child.type === "COMPONENT_SET" || child.type === "COMPONENT") {
      componentsByName.set(child.name, child);
    }
    // Also search inside section frames (auto layout groups)
    if (child.type === "FRAME") {
      for (const grandchild of child.children) {
        if (grandchild.type === "COMPONENT_SET" || grandchild.type === "COMPONENT") {
          componentsByName.set(grandchild.name, grandchild);
        }
      }
    }
  }

  let exportedCount = 0;
  const total = COMPONENT_DEFS.length;

  for (const def of COMPONENT_DEFS) {
    const node = componentsByName.get(def.name);

    if (!node) {
      if (def.required) {
        figma.ui.postMessage({
          type: "ERROR",
          message: `Required component "${def.name}" not found.`,
        });
        return;
      }
      continue; // Skip optional
    }

    // For slider auto-gen components (Track BG/Fill), export the parts
    if (def.sliderMode === "auto") {
      await exportSliderParts(node, def);
    } else if (node.type === "COMPONENT_SET") {
      // Export each variant
      for (const child of node.children) {
        if (child.type === "COMPONENT") {
          const bytes = await withOverlayGuidesHidden(child, () =>
            child.exportAsync({
              format: "PNG",
              constraint: { type: "SCALE", value: 1 },
            }),
          );

          figma.ui.postMessage({
            type: "COMPONENT_EXPORTED",
            componentName: def.name,
            variantName: child.name,
            variantValues: child.variantProperties || {},
            bytes,
            target: def.target,
          });
        }
      }
    } else if (node.type === "COMPONENT") {
      // Single component, no variants
      const bytes = await withOverlayGuidesHidden(node, () =>
        node.exportAsync({
          format: "PNG",
          constraint: { type: "SCALE", value: 1 },
        }),
      );

      figma.ui.postMessage({
        type: "COMPONENT_EXPORTED",
        componentName: def.name,
        variantName: node.name,
        variantValues: {},
        bytes,
        target: def.target,
      });
    }

    exportedCount++;
    figma.ui.postMessage({
      type: "COMPONENT_EXPORT_PROGRESS",
      componentName: def.name,
      index: exportedCount,
      total,
    });
  }

  figma.ui.postMessage({
    type: "COMPONENT_EXPORT_COMPLETE",
    scale,
  });
}

async function exportSliderParts(
  node: ComponentSetNode | ComponentNode,
  def: ComponentDef,
): Promise<void> {
  // For auto sliders, look for Part=BG and Part=Fill variants
  if (node.type === "COMPONENT_SET") {
    for (const child of node.children) {
      if (child.type === "COMPONENT") {
        const bytes = await withOverlayGuidesHidden(child, () =>
          child.exportAsync({
            format: "PNG",
            constraint: { type: "SCALE", value: 1 },
          }),
        );

        const partName = child.variantProperties?.["Part"] || child.name;
        figma.ui.postMessage({
          type: "SLIDER_PART_EXPORTED",
          componentName: def.name,
          partName,
          bytes,
          target: def.target,
          orientation: def.sliderOrientation || "horizontal",
          frameCount: def.sliderFrameCount || 28,
        });
      }
    }
  }
}
