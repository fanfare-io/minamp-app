// ---------------------------------------------------------------------------
// Validates the current Figma page against either:
//   - sprite-sheet mode: top-level FRAMES named like "MAIN", "TITLEBAR", ...
//   - component mode:    ComponentSets/Components named per COMPONENT_DEFS
//
// The mode is read from the page's "templateMode" plugin data, written by
// the template generator. Falls back to sprite-sheet mode for legacy pages.
// ---------------------------------------------------------------------------

import { SPRITE_SHEETS } from "../shared/spriteSheetDefs";
import {
  COMPONENT_DEFS,
  OVERLAY_GUIDES,
  OVERLAY_GUIDES_GROUP_NAME,
  type ComponentDef,
  type VariantAxis,
} from "../shared/componentDefs";
import { DEFAULT_ASSET_SCALE, SCALE_PLUGIN_DATA_KEY } from "../shared/constants";
import type { FrameValidation, ValidationStatus } from "../shared/messages";

/** Tolerance in scaled pixels for dimension checks. */
const DIMENSION_TOLERANCE = 1;

/**
 * Walks the current page and validates expected sprite-sheet frames OR
 * component sets, depending on the templateMode plugin data on the page.
 */
export function validateSkin(): FrameValidation[] {
  const page = figma.currentPage;
  const mode = page.getPluginData("templateMode");
  if (mode === "component") {
    return validateComponentMode(page);
  }
  return validateSpriteSheetMode(page);
}

// ---------------------------------------------------------------------------
// Sprite sheet mode (v1)
// ---------------------------------------------------------------------------

function validateSpriteSheetMode(page: PageNode): FrameValidation[] {
  const scaleStr = page.getPluginData(SCALE_PLUGIN_DATA_KEY);
  const scale = scaleStr ? parseInt(scaleStr, 10) : DEFAULT_ASSET_SCALE;

  const results: FrameValidation[] = [];

  const framesByName = new Map<string, FrameNode>();
  for (const child of page.children) {
    if (child.type === "FRAME") {
      framesByName.set(child.name.toUpperCase(), child);
    }
  }

  for (const sheet of SPRITE_SHEETS) {
    const expectedWidth = sheet.width * scale;
    const expectedHeight = sheet.height * scale;
    const frame = framesByName.get(sheet.frameName.toUpperCase());

    if (!frame) {
      const status: ValidationStatus = sheet.required ? "fail" : "warn";
      const message = sheet.required
        ? `Required frame "${sheet.frameName}" is missing`
        : `Optional frame "${sheet.frameName}" is missing (will use fallback)`;
      results.push({
        frameName: sheet.frameName,
        status,
        message,
        expectedWidth,
        expectedHeight,
        actualWidth: null,
        actualHeight: null,
      });
      continue;
    }

    const widthDiff = Math.abs(frame.width - expectedWidth);
    const heightDiff = Math.abs(frame.height - expectedHeight);

    if (widthDiff > DIMENSION_TOLERANCE || heightDiff > DIMENSION_TOLERANCE) {
      results.push({
        frameName: sheet.frameName,
        status: "fail",
        message:
          `Frame "${sheet.frameName}" has wrong dimensions at ${scale}x: ` +
          `expected ${expectedWidth}x${expectedHeight}, ` +
          `got ${frame.width}x${frame.height}`,
        expectedWidth,
        expectedHeight,
        actualWidth: frame.width,
        actualHeight: frame.height,
      });
    } else {
      results.push({
        frameName: sheet.frameName,
        status: "pass",
        message: `Frame "${sheet.frameName}" is valid at ${scale}x (${frame.width}x${frame.height})`,
        expectedWidth,
        expectedHeight,
        actualWidth: frame.width,
        actualHeight: frame.height,
      });
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// Component mode (v2)
// ---------------------------------------------------------------------------

/**
 * Recursively walks every node on the page and indexes ComponentSets +
 * Components by name. Walking nested frames is necessary because the
 * generator wraps components inside auto-layout "section" frames.
 */
function indexComponents(page: PageNode): {
  sets: Map<string, ComponentSetNode>;
  loose: Map<string, ComponentNode>;
} {
  const sets = new Map<string, ComponentSetNode>();
  const loose = new Map<string, ComponentNode>();

  function walk(node: BaseNode): void {
    if (node.type === "COMPONENT_SET") {
      sets.set(node.name, node);
      return; // children are variants, not separate components to index
    }
    if (node.type === "COMPONENT") {
      // Only index a COMPONENT if its parent is NOT a COMPONENT_SET
      // (i.e. it's a standalone component, not a variant inside a set).
      const parent = node.parent;
      if (!parent || parent.type !== "COMPONENT_SET") {
        loose.set(node.name, node);
      }
      return;
    }
    if ("children" in node) {
      for (const child of node.children) {
        walk(child);
      }
    }
  }

  for (const child of page.children) {
    walk(child);
  }

  return { sets, loose };
}

/**
 * For a ComponentSet, derive the actual variant axes by parsing variant
 * names. Each variant child is named like "State=Normal, Active=Off".
 * Returns a map of axis name -> set of values found.
 */
function readVariantAxes(set: ComponentSetNode): Map<string, Set<string>> {
  const axes = new Map<string, Set<string>>();

  for (const child of set.children) {
    if (child.type !== "COMPONENT") continue;
    const parts = child.name.split(",");
    for (const part of parts) {
      const trimmed = part.trim();
      const eq = trimmed.indexOf("=");
      if (eq < 0) continue;
      const axisName = trimmed.substring(0, eq).trim();
      const axisValue = trimmed.substring(eq + 1).trim();
      let values = axes.get(axisName);
      if (!values) {
        values = new Set<string>();
        axes.set(axisName, values);
      }
      values.add(axisValue);
    }
  }
  return axes;
}

/**
 * Compares expected variant axes from the def against actual axes from the
 * ComponentSet. Returns a description of the first mismatch, or null if OK.
 */
function diffVariantAxes(
  expected: VariantAxis[],
  actual: Map<string, Set<string>>,
): string | null {
  for (const axis of expected) {
    const actualValues = actual.get(axis.name);
    if (!actualValues) {
      return `missing variant axis "${axis.name}"`;
    }
    for (const value of axis.values) {
      if (!actualValues.has(value)) {
        return `variant "${axis.name}=${value}" not found`;
      }
    }
  }
  return null;
}

function validateOneComponent(
  def: ComponentDef,
  scale: number,
  sets: Map<string, ComponentSetNode>,
  loose: Map<string, ComponentNode>,
): FrameValidation {
  const expectedWidth = def.width * scale;
  const expectedHeight = def.height * scale;

  const isVariantBased = def.variants.length > 0 || def.sliderMode === "auto";

  if (isVariantBased) {
    const set = sets.get(def.name);
    if (!set) {
      const status: ValidationStatus = def.required ? "fail" : "warn";
      const noun = def.required ? "Required" : "Optional";
      return {
        frameName: def.name,
        status,
        message: `${noun} component "${def.name}" is missing`,
        expectedWidth,
        expectedHeight,
        actualWidth: null,
        actualHeight: null,
      };
    }

    // Variant axis check — only enforce for non-slider components, since
    // sliders use a synthetic Part=BG/Fill axis the def doesn't list.
    if (def.sliderMode !== "auto") {
      const actualAxes = readVariantAxes(set);
      const diff = diffVariantAxes(def.variants, actualAxes);
      if (diff) {
        return {
          frameName: def.name,
          status: "fail",
          message: `Component "${def.name}": ${diff}`,
          expectedWidth,
          expectedHeight,
          actualWidth: null,
          actualHeight: null,
        };
      }
    }

    // Dimension check — sample the first variant child
    const firstVariant = set.children.find((c) => c.type === "COMPONENT") as
      | ComponentNode
      | undefined;
    if (!firstVariant) {
      return {
        frameName: def.name,
        status: "fail",
        message: `Component "${def.name}" has no variants`,
        expectedWidth,
        expectedHeight,
        actualWidth: null,
        actualHeight: null,
      };
    }
    return checkDimensions(def, firstVariant.width, firstVariant.height, scale);
  }

  // Variantless component
  const comp = loose.get(def.name);
  if (!comp) {
    const status: ValidationStatus = def.required ? "fail" : "warn";
    const noun = def.required ? "Required" : "Optional";
    return {
      frameName: def.name,
      status,
      message: `${noun} component "${def.name}" is missing`,
      expectedWidth,
      expectedHeight,
      actualWidth: null,
      actualHeight: null,
    };
  }
  return checkDimensions(def, comp.width, comp.height, scale);
}

function checkDimensions(
  def: ComponentDef,
  actualW: number,
  actualH: number,
  scale: number,
): FrameValidation {
  const expectedWidth = def.width * scale;
  const expectedHeight = def.height * scale;
  const widthDiff = Math.abs(actualW - expectedWidth);
  const heightDiff = Math.abs(actualH - expectedHeight);

  if (widthDiff > DIMENSION_TOLERANCE || heightDiff > DIMENSION_TOLERANCE) {
    return {
      frameName: def.name,
      status: "fail",
      message:
        `Component "${def.name}" has wrong dimensions at ${scale}x: ` +
        `expected ${expectedWidth}x${expectedHeight}, got ${actualW}x${actualH}`,
      expectedWidth,
      expectedHeight,
      actualWidth: actualW,
      actualHeight: actualH,
    };
  }

  return {
    frameName: def.name,
    status: "pass",
    message: `Component "${def.name}" is valid at ${scale}x (${actualW}x${actualH})`,
    expectedWidth,
    expectedHeight,
    actualWidth: actualW,
    actualHeight: actualH,
  };
}

/**
 * Checks that the named component (or every variant, if a set) contains a
 * top-level "Overlay Guides" group. Backgrounds listed in OVERLAY_GUIDES
 * are expected to have this group stamped by the template generator; if
 * it's missing the template was generated before OVERLAY_GUIDES existed
 * (or the designer deleted it) and the designer is painting blind.
 */
function hasOverlayGuides(node: ComponentSetNode | ComponentNode): boolean {
  const check = (component: ComponentNode): boolean =>
    component.children.some(
      (child) => child.type === "GROUP" && child.name === OVERLAY_GUIDES_GROUP_NAME,
    );

  if (node.type === "COMPONENT") return check(node);
  for (const child of node.children) {
    if (child.type === "COMPONENT" && !check(child)) return false;
  }
  return true;
}

function validateComponentMode(page: PageNode): FrameValidation[] {
  const scaleStr = page.getPluginData(SCALE_PLUGIN_DATA_KEY);
  const scale = scaleStr ? parseInt(scaleStr, 10) : DEFAULT_ASSET_SCALE;

  const { sets, loose } = indexComponents(page);
  const results: FrameValidation[] = [];

  for (const def of COMPONENT_DEFS) {
    results.push(validateOneComponent(def, scale, sets, loose));
  }

  // Warn on any background in OVERLAY_GUIDES that's missing its guides
  // group — indicates the template needs regenerating.
  for (const name of Object.keys(OVERLAY_GUIDES)) {
    const node = sets.get(name) ?? loose.get(name);
    if (!node) continue; // already reported by validateOneComponent
    if (hasOverlayGuides(node)) continue;
    results.push({
      frameName: name,
      status: "warn",
      message:
        `Component "${name}" is missing its Overlay Guides group. ` +
        "Re-run Generate Component Template to restore guide rectangles.",
      expectedWidth: 0,
      expectedHeight: 0,
      actualWidth: null,
      actualHeight: null,
    });
  }

  return results;
}

// ---------------------------------------------------------------------------
// Overall status
// ---------------------------------------------------------------------------

/**
 * Derives an overall validation status from individual frame results.
 * Any "fail" -> overall "fail"; else any "warn" -> overall "warn"; else "pass".
 */
export function overallStatus(results: FrameValidation[]): ValidationStatus {
  if (results.some((r) => r.status === "fail")) return "fail";
  if (results.some((r) => r.status === "warn")) return "warn";
  return "pass";
}
