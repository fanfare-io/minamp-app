// ---------------------------------------------------------------------------
// Generates template Figma frames with guide overlays for every sprite sheet.
//
// Each frame is created at the target asset scale (e.g. 2x means MAIN is
// 550x232 instead of 275x116). Export then uses SCALE:1 since frames are
// already at the desired resolution.
//
//   - A dark background fill
//   - A locked "Guides" group containing labeled region rectangles
//   - An unlocked "Artwork" group (empty, ready for the designer to draw into)
//   - Frames arranged in a grid layout on the page
// ---------------------------------------------------------------------------

import { SPRITE_SHEETS, type SpriteRegion } from "../shared/spriteSheetDefs";
import { GUIDES_GROUP_NAME, ARTWORK_GROUP_NAME, SCALE_PLUGIN_DATA_KEY } from "../shared/constants";
import {
  COMPONENT_DEFS,
  PREVIEW_FRAMES,
  OVERLAY_GUIDES,
  OVERLAY_GUIDES_GROUP_NAME,
  type ComponentDef,
  type OverlayGuide,
  type PreviewPlacement,
  type VariantAxis,
} from "../shared/componentDefs";

// ---------------------------------------------------------------------------
// Color palette for guide rectangles — distinct, semi-transparent fills.
// Cycles through these so adjacent regions are visually distinguishable.
// ---------------------------------------------------------------------------

const GUIDE_COLORS: RGB[] = [
  { r: 0.35, g: 0.65, b: 1.0 },   // Blue
  { r: 1.0, g: 0.45, b: 0.45 },   // Red
  { r: 0.45, g: 0.85, b: 0.55 },   // Green
  { r: 1.0, g: 0.75, b: 0.3 },    // Orange
  { r: 0.7, g: 0.5, b: 1.0 },     // Purple
  { r: 0.2, g: 0.85, b: 0.85 },   // Cyan
  { r: 1.0, g: 0.55, b: 0.75 },   // Pink
  { r: 0.85, g: 0.85, b: 0.35 },  // Yellow
];

/** Background fill color for template frames (#1a1a2e). */
const BG_COLOR: RGB = { r: 0.102, g: 0.102, b: 0.180 };

/** Opacity for guide region fills. */
const GUIDE_FILL_OPACITY = 0.15;

/** Opacity for guide region strokes. */
const GUIDE_STROKE_OPACITY = 0.6;

/**
 * Base font size for region labels (in 1x pixels). Kept deliberately small
 * because many overlay regions are 9×9 buttons or 12-tall indicators —
 * a full-size font would crowd the art. Designers zoom in when they need
 * to read a specific label, and Figma renders sub-pixel fonts cleanly.
 */
const LABEL_FONT_SIZE = 3;

/** Base minimum region dimension to show a label inside (in 1x pixels). */
const MIN_LABEL_DIMENSION = 4;

/** Spacing between frames in the grid layout. */
const GRID_SPACING = 60;

/** Maximum columns in the grid. */
const GRID_COLUMNS = 4;

// ---------------------------------------------------------------------------
// Template Generation
// ---------------------------------------------------------------------------

/**
 * Generates template frames on the current page for all sprite sheets.
 *
 * Frames are created at the target asset scale (e.g., 2x means a 275x116
 * sprite sheet becomes a 550x232 frame). This means export can use SCALE:1
 * since the frames are already at the desired resolution.
 *
 * - Clears any existing frames with matching names first
 * - Creates one frame per sprite sheet at scaled dimensions
 * - Adds guide rectangles and labels for each region (also scaled)
 * - Lays frames out in a grid
 * - Stores the scale on the page as plugin data
 */
export async function generateTemplate(assetScale: number): Promise<void> {
  const page = figma.currentPage;

  // Load the font we need for labels
  await figma.loadFontAsync({ family: "Inter", style: "Medium" });

  // Store the scale on the page so validator/exporter can read it
  page.setPluginData(SCALE_PLUGIN_DATA_KEY, String(assetScale));

  // Remove existing template frames with the same names (avoid duplicates)
  const existingNames = new Set(SPRITE_SHEETS.map((s) => s.frameName.toUpperCase()));
  const toRemove: SceneNode[] = [];
  for (const child of page.children) {
    if (child.type === "FRAME" && existingNames.has(child.name.toUpperCase())) {
      toRemove.push(child);
    }
  }
  for (const node of toRemove) {
    node.remove();
  }

  // Track created frames for grid layout
  const createdFrames: FrameNode[] = [];

  for (const sheet of SPRITE_SHEETS) {
    const scaledWidth = sheet.width * assetScale;
    const scaledHeight = sheet.height * assetScale;

    const frame = createSpriteSheetFrame(sheet.frameName, scaledWidth, scaledHeight);

    // Create guide rectangles and labels for each region (scaled)
    const guideNodes = createGuideNodes(sheet.regions, assetScale);

    // Guides group (locked so designers don't accidentally edit).
    // figma.group() requires at least one node, so append nodes to frame
    // first, then group them.
    for (const node of guideNodes) {
      frame.appendChild(node);
    }
    let guidesGroup: GroupNode | null = null;
    if (guideNodes.length > 0) {
      guidesGroup = figma.group(guideNodes, frame);
      guidesGroup.name = GUIDES_GROUP_NAME;
      guidesGroup.locked = true;
    }

    // Artwork group (unlocked, above guides — this is where designers draw).
    // Create a placeholder rectangle so the group isn't empty
    // (Figma removes empty groups).
    const placeholder = figma.createRectangle();
    placeholder.name = "placeholder (delete me)";
    placeholder.x = 0;
    placeholder.y = 0;
    placeholder.resize(scaledWidth, scaledHeight);
    placeholder.fills = [];
    placeholder.opacity = 0;
    frame.appendChild(placeholder);
    const artworkGroup = figma.group([placeholder], frame);
    artworkGroup.name = ARTWORK_GROUP_NAME;
    artworkGroup.locked = false;

    page.appendChild(frame);
    createdFrames.push(frame);
  }

  // Arrange in a grid
  layoutGrid(createdFrames);

  // Zoom to fit all created frames
  figma.viewport.scrollAndZoomIntoView(createdFrames);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createSpriteSheetFrame(
  name: string,
  width: number,
  height: number,
): FrameNode {
  const frame = figma.createFrame();
  frame.name = name;
  frame.resize(width, height);
  frame.fills = [{ type: "SOLID", color: BG_COLOR }];
  frame.clipsContent = true;
  return frame;
}

/**
 * Shared helper that builds labeled, semi-transparent rectangles for a list
 * of (label, x, y, width, height) regions. Reused by both the sprite-sheet
 * template (regions = spriteSheetDefs) and the component template overlay
 * guides (regions = OVERLAY_GUIDES entries). Mutates the scene graph only
 * via figma.createRectangle / createText; returns the nodes so the caller
 * can group them.
 */
function createLabeledRegionNodes(
  regions: Array<{ name: string; x: number; y: number; width: number; height: number }>,
  scale: number,
): SceneNode[] {
  const nodes: SceneNode[] = [];
  const scaledMinLabel = MIN_LABEL_DIMENSION * scale;

  for (let i = 0; i < regions.length; i++) {
    const region = regions[i];
    const color = GUIDE_COLORS[i % GUIDE_COLORS.length];

    const sx = region.x * scale;
    const sy = region.y * scale;
    const sw = region.width * scale;
    const sh = region.height * scale;

    const rect = figma.createRectangle();
    rect.name = region.name;
    rect.x = sx;
    rect.y = sy;
    rect.resize(Math.max(1, sw), Math.max(1, sh));
    rect.fills = [{ type: "SOLID", color, opacity: GUIDE_FILL_OPACITY }];
    rect.strokes = [{ type: "SOLID", color, opacity: GUIDE_STROKE_OPACITY }];
    rect.strokeWeight = 0.5;
    rect.strokeAlign = "INSIDE";
    nodes.push(rect);

    if (sw >= scaledMinLabel && sh >= scaledMinLabel) {
      const label = figma.createText();
      label.fontName = { family: "Inter", style: "Medium" };
      label.fontSize = Math.min(LABEL_FONT_SIZE * scale, sh - 2);
      label.characters = region.name;
      label.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 }, opacity: 0.85 }];
      label.x = sx + 1;
      label.y = sy + 1;
      if (label.width > sw - 2) {
        label.resize(sw - 2, label.height);
        label.textAutoResize = "TRUNCATE";
      }
      nodes.push(label);
    }
  }

  return nodes;
}

/**
 * Creates rectangle + text label nodes for each region in a sprite sheet.
 * All coordinates and dimensions are multiplied by `scale`.
 * Returns flat array of nodes to be appended to the Guides group.
 */
function createGuideNodes(regions: SpriteRegion[], scale: number): SceneNode[] {
  const nodes: SceneNode[] = [];
  const scaledMinLabel = MIN_LABEL_DIMENSION * scale;

  for (let i = 0; i < regions.length; i++) {
    const region = regions[i];
    const color = GUIDE_COLORS[i % GUIDE_COLORS.length];

    const sx = region.x * scale;
    const sy = region.y * scale;
    const sw = region.width * scale;
    const sh = region.height * scale;

    // Region outline rectangle
    const rect = figma.createRectangle();
    rect.name = region.name;
    rect.x = sx;
    rect.y = sy;
    rect.resize(sw, sh);
    rect.fills = [
      {
        type: "SOLID",
        color,
        opacity: GUIDE_FILL_OPACITY,
      },
    ];
    rect.strokes = [
      {
        type: "SOLID",
        color,
        opacity: GUIDE_STROKE_OPACITY,
      },
    ];
    rect.strokeWeight = 0.5;
    rect.strokeAlign = "INSIDE";
    nodes.push(rect);

    // Text label (only if region is large enough to show it)
    if (sw >= scaledMinLabel && sh >= scaledMinLabel) {
      const label = figma.createText();
      label.fontName = { family: "Inter", style: "Medium" };
      label.fontSize = Math.min(LABEL_FONT_SIZE * scale, sh - 2);
      label.characters = region.name;
      label.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 }, opacity: 0.85 }];
      label.x = sx + 1;
      label.y = sy + 1;
      // Clamp text width to region width to prevent overflow
      if (label.width > sw - 2) {
        label.resize(sw - 2, label.height);
        label.textAutoResize = "TRUNCATE";
      }
      nodes.push(label);
    }
  }

  return nodes;
}

/**
 * Arranges frames in a grid on the page.
 */
function layoutGrid(frames: FrameNode[]): void {
  let col = 0;
  let row = 0;
  let rowMaxHeight = 0;
  let currentX = 0;
  let currentY = 0;

  for (const frame of frames) {
    frame.x = currentX;
    frame.y = currentY;

    rowMaxHeight = Math.max(rowMaxHeight, frame.height);
    col++;

    if (col >= GRID_COLUMNS) {
      // Move to next row
      col = 0;
      currentX = 0;
      currentY += rowMaxHeight + GRID_SPACING;
      rowMaxHeight = 0;
    } else {
      currentX += frame.width + GRID_SPACING;
    }
  }
}

/**
 * Stamps a locked "Overlay Guides" group of labeled, semi-transparent
 * rectangles into the given component. Called for any background component
 * that has an entry in OVERLAY_GUIDES. The guides are purely informational —
 * the exporter must hide this group before exportAsync so it does not leak
 * into the skin archive.
 */
function stampOverlayGuides(
  component: ComponentNode,
  guides: OverlayGuide[],
  scale: number,
): void {
  const nodes = createLabeledRegionNodes(
    guides.map((g) => ({ name: g.label, x: g.x, y: g.y, width: g.width, height: g.height })),
    scale,
  );
  if (nodes.length === 0) return;

  for (const node of nodes) component.appendChild(node);
  const group = figma.group(nodes, component);
  group.name = OVERLAY_GUIDES_GROUP_NAME;
  group.locked = true;
}

// ---------------------------------------------------------------------------
// Component-Based Template Generation
// ---------------------------------------------------------------------------

/** Section title font size (in 1x pixels). */
const SECTION_TITLE_FONT_SIZE = 16;

/**
 * Generates the cartesian product of all variant axis values.
 *
 * For example, given axes [{name:"Active", values:["Off","On"]}, {name:"State", values:["Normal","Pressed"]}],
 * returns:
 *   [{Active:"Off", State:"Normal"}, {Active:"Off", State:"Pressed"},
 *    {Active:"On", State:"Normal"}, {Active:"On", State:"Pressed"}]
 */
function generateVariantCombinations(axes: VariantAxis[]): Record<string, string>[] {
  if (axes.length === 0) return [{}];

  let result: Record<string, string>[] = [{}];
  for (const axis of axes) {
    const expanded: Record<string, string>[] = [];
    for (const existing of result) {
      for (const value of axis.values) {
        const combo = Object.assign({}, existing);
        combo[axis.name] = value;
        expanded.push(combo);
      }
    }
    result = expanded;
  }
  return result;
}

/**
 * Builds a Figma variant name string from a values record.
 * E.g. {State:"Normal"} => "State=Normal"
 *      {Active:"Off", State:"Normal"} => "Active=Off, State=Normal"
 */
function variantName(values: Record<string, string>): string {
  return Object.entries(values).map(function(entry) {
    return entry[0] + "=" + entry[1];
  }).join(", ");
}

/**
 * Finds a component variant within a ComponentSet by matching variant values.
 */
function findVariantInSet(set: ComponentSetNode, values: Record<string, string>): ComponentNode | null {
  const targetName = variantName(values);
  for (const child of set.children) {
    if (child.type === "COMPONENT" && child.name === targetName) {
      return child;
    }
  }
  return null;
}

/**
 * Generates component-based template on the current page.
 *
 * DESTRUCTIVE: clears every known component / section frame / preview frame
 * on the page, then rebuilds them all as empty placeholders. This is the
 * only mode — there is no patch/preserve. Re-running after editing
 * componentDefs.ts is fine; you'll lose any artwork you've drawn into
 * components, but that's acceptable since this is meant to be a one-shot
 * template setup, not a thing you re-run during normal design work.
 */
export async function generateComponentTemplate(
  assetScale: number,
): Promise<{ componentsCreated: number }> {
  const page = figma.currentPage;
  const scale = assetScale;

  // -------------------------------------------------------------------------
  // Step 1: Clean up and load font
  // -------------------------------------------------------------------------

  await figma.loadFontAsync({ family: "Inter", style: "Medium" });

  // Remove existing component sets, components, and frames to avoid duplicates.
  const componentNames = new Set(COMPONENT_DEFS.map((d) => d.name));
  const previewNames = new Set(PREVIEW_FRAMES.map((p) => p.name + " Preview"));
  const sectionNames = new Set(COMPONENT_DEFS.map((d) => d.section));

  const toRemove: SceneNode[] = [];
  for (const child of page.children) {
    if (child.type === "COMPONENT_SET" && componentNames.has(child.name)) {
      toRemove.push(child);
    } else if (child.type === "COMPONENT" && componentNames.has(child.name)) {
      toRemove.push(child);
    } else if (
      child.type === "FRAME" &&
      (previewNames.has(child.name) ||
        sectionNames.has(child.name) ||
        child.name === "Previews" ||
        child.name === "Components")
    ) {
      toRemove.push(child);
    }
  }
  for (const node of toRemove) node.remove();

  // Store scale and mode
  page.setPluginData(SCALE_PLUGIN_DATA_KEY, String(assetScale));
  page.setPluginData("templateMode", "component");

  // -------------------------------------------------------------------------
  // Step 2: Create ComponentSets for each component
  // -------------------------------------------------------------------------

  const createdComponents = new Map<string, ComponentSetNode | ComponentNode>();

  for (const def of COMPONENT_DEFS) {
    const pluginData = JSON.stringify({ section: def.section, target: def.target });

    const overlayGuides = OVERLAY_GUIDES[def.name];

    if (def.sliderMode === "auto") {
      const bg = figma.createComponent();
      bg.name = "Part=BG";
      bg.resize(def.width * scale, def.height * scale);
      bg.fills = [{ type: "SOLID", color: BG_COLOR }];

      const fill = figma.createComponent();
      fill.name = "Part=Fill";
      fill.resize(def.width * scale, def.height * scale);
      fill.fills = [{ type: "SOLID", color: BG_COLOR }];

      page.appendChild(bg);
      page.appendChild(fill);

      const set = figma.combineAsVariants([bg, fill], page);
      set.name = def.name;
      set.setPluginData("componentDef", JSON.stringify({
        section: def.section,
        target: def.target,
        sliderMode: "auto",
      }));
      createdComponents.set(def.name, set);
    } else if (def.variants.length === 0) {
      const c = figma.createComponent();
      c.name = def.name;
      c.resize(def.width * scale, def.height * scale);
      c.fills = [{ type: "SOLID", color: BG_COLOR }];
      c.setPluginData("componentDef", pluginData);
      page.appendChild(c);
      if (overlayGuides) stampOverlayGuides(c, overlayGuides, scale);
      createdComponents.set(def.name, c);
    } else {
      const combos = generateVariantCombinations(def.variants);
      const components: ComponentNode[] = [];
      for (const combo of combos) {
        const c = figma.createComponent();
        c.name = variantName(combo);
        c.resize(def.width * scale, def.height * scale);
        c.fills = [{ type: "SOLID", color: BG_COLOR }];
        page.appendChild(c);
        if (overlayGuides) stampOverlayGuides(c, overlayGuides, scale);
        components.push(c);
      }
      const set = figma.combineAsVariants(components, page);
      set.name = def.name;
      set.setPluginData("componentDef", pluginData);
      createdComponents.set(def.name, set);
    }
  }

  // -------------------------------------------------------------------------
  // Step 3: Organize into sections using Auto Layout frames
  // -------------------------------------------------------------------------

  const sectionMap = new Map<string, Array<ComponentSetNode | ComponentNode>>();
  for (const def of COMPONENT_DEFS) {
    const node = createdComponents.get(def.name);
    if (!node) continue;
    let list = sectionMap.get(def.section);
    if (!list) {
      list = [];
      sectionMap.set(def.section, list);
    }
    list.push(node);
  }

  const sectionFrames: FrameNode[] = [];
  for (const [sectionName, components] of sectionMap) {
    const section = figma.createFrame();
    section.name = sectionName;
    section.layoutMode = "HORIZONTAL";
    section.layoutWrap = "WRAP";
    section.itemSpacing = 20;
    section.counterAxisSpacing = 20;
    section.paddingTop = 40;
    section.paddingLeft = 20;
    section.paddingRight = 20;
    section.paddingBottom = 20;
    section.primaryAxisSizingMode = "AUTO";
    section.counterAxisSizingMode = "AUTO";
    section.fills = [{ type: "SOLID", color: { r: 0.08, g: 0.08, b: 0.12 } }];

    const title = figma.createText();
    title.fontName = { family: "Inter", style: "Medium" };
    title.fontSize = SECTION_TITLE_FONT_SIZE;
    title.characters = sectionName;
    title.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 }, opacity: 0.9 }];

    for (const comp of components) section.appendChild(comp);

    section.appendChild(title);
    title.layoutPositioning = "ABSOLUTE";
    title.x = 20;
    title.y = 12;

    page.appendChild(section);
    sectionFrames.push(section);
  }

  // -------------------------------------------------------------------------
  // Step 4: Build live preview frames
  // -------------------------------------------------------------------------

  const previewFrames: FrameNode[] = [];

  for (const preview of PREVIEW_FRAMES) {
    const previewFrame = figma.createFrame();
    previewFrame.name = preview.name + " Preview";
    previewFrame.resize(preview.width * scale, preview.height * scale);
    previewFrame.clipsContent = true;
    previewFrame.fills = [{ type: "SOLID", color: BG_COLOR }];

    for (const placement of preview.placements) {
      const componentOrSet = createdComponents.get(placement.componentName);
      if (!componentOrSet) continue;

      let targetComponent: ComponentNode | null = null;
      if (componentOrSet.type === "COMPONENT_SET") {
        const hasVariantValues = Object.keys(placement.variantValues).length > 0;
        if (!hasVariantValues) {
          targetComponent = findVariantInSet(componentOrSet, { "Part": "BG" });
          if (!targetComponent) {
            const firstChild = componentOrSet.children[0];
            if (firstChild && firstChild.type === "COMPONENT") {
              targetComponent = firstChild;
            }
          }
        } else {
          targetComponent = findVariantInSet(componentOrSet, placement.variantValues);
        }
      } else if (componentOrSet.type === "COMPONENT") {
        targetComponent = componentOrSet;
      }

      if (targetComponent) {
        const instance = targetComponent.createInstance();
        if (placement.crop) {
          // Wrap in a clipping frame and offset the instance so only the
          // requested source sub-rect shows through. Used for sprite-strip
          // components like Time Digits where dropping the whole strip
          // into the preview would occupy the full 99×13 and bleed over
          // neighbouring overlays.
          const clip = figma.createFrame();
          clip.name = `${placement.componentName} crop`;
          clip.resize(placement.crop.width * scale, placement.crop.height * scale);
          clip.x = placement.x * scale;
          clip.y = placement.y * scale;
          clip.fills = [];
          clip.clipsContent = true;
          previewFrame.appendChild(clip);
          clip.appendChild(instance);
          instance.x = -placement.crop.sourceX * scale;
          instance.y = -placement.crop.sourceY * scale;
        } else {
          instance.x = placement.x * scale;
          instance.y = placement.y * scale;
          previewFrame.appendChild(instance);
        }
      }
    }

    page.appendChild(previewFrame);
    previewFrames.push(previewFrame);
  }

  // -------------------------------------------------------------------------
  // Step 5: Arrange everything on the page
  // -------------------------------------------------------------------------

  let previewX = 0;
  for (const pf of previewFrames) {
    pf.x = previewX;
    pf.y = 0;
    previewX += pf.width + GRID_SPACING;
  }

  const previewBottomY = previewFrames.reduce(
    (max, pf) => Math.max(max, pf.height),
    0,
  );
  const sectionsStartY = previewBottomY + GRID_SPACING * 2;

  let sectionY = sectionsStartY;
  for (const sf of sectionFrames) {
    sf.x = 0;
    sf.y = sectionY;
    sectionY += sf.height + GRID_SPACING;
  }

  const allNodes: SceneNode[] = (previewFrames as SceneNode[]).concat(
    sectionFrames as SceneNode[],
  );
  if (allNodes.length > 0) figma.viewport.scrollAndZoomIntoView(allNodes);

  return { componentsCreated: createdComponents.size };
}
