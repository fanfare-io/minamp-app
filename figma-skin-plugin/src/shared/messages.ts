// ---------------------------------------------------------------------------
// Type-safe message protocol between the Figma plugin sandbox and UI iframe.
// ---------------------------------------------------------------------------

// -- Shared data types ------------------------------------------------------

export interface ExportConfig {
  skinName: string;
  assetScale: number;
}

export type ValidationStatus = "pass" | "warn" | "fail";

export interface FrameValidation {
  frameName: string;
  status: ValidationStatus;
  message: string;
  expectedWidth: number;
  expectedHeight: number;
  actualWidth: number | null;
  actualHeight: number | null;
}

// -- Sandbox -> UI messages -------------------------------------------------

export interface ValidationResultMessage {
  type: "VALIDATION_RESULT";
  frames: FrameValidation[];
  overallStatus: ValidationStatus;
}

export interface FrameExportedMessage {
  type: "FRAME_EXPORTED";
  frameName: string;
  index: number;
  total: number;
}

export interface ExportCompleteMessage {
  type: "EXPORT_COMPLETE";
  skinName: string;
  fileSize: number;
}

export interface PreviewDataMessage {
  type: "PREVIEW_DATA";
  frameName: string;
  imageData: Uint8Array;
  width: number;
  height: number;
}

export interface SwitchViewMessage {
  type: "SWITCH_VIEW";
  view: "generate-template" | "validate" | "export";
}

export interface TemplateGeneratedMessage {
  type: "TEMPLATE_GENERATED";
  frameCount: number;
  assetScale: number;
}

export interface FrameBytesMessage {
  type: "FRAME_BYTES";
  frameName: string;
  bytes: Uint8Array;
}

export interface ImportCompleteMessage {
  type: "IMPORT_COMPLETE";
  frameCount: number;
  scale: number;
}

export interface ComponentExportedMessage {
  type: "COMPONENT_EXPORTED";
  componentName: string;
  variantName: string;
  variantValues: Record<string, string>;
  bytes: Uint8Array;
  target: import("./componentDefs").SpriteSheetTarget;
}

export interface SliderPartExportedMessage {
  type: "SLIDER_PART_EXPORTED";
  componentName: string;
  partName: string;
  bytes: Uint8Array;
  target: import("./componentDefs").SpriteSheetTarget;
  orientation: "horizontal" | "vertical";
  frameCount: number;
}

export interface ComponentExportProgressMessage {
  type: "COMPONENT_EXPORT_PROGRESS";
  componentName: string;
  index: number;
  total: number;
}

export interface ComponentExportCompleteMessage {
  type: "COMPONENT_EXPORT_COMPLETE";
  scale: number;
}

export interface ErrorMessage {
  type: "ERROR";
  message: string;
}

// -- Asset Bridge -----------------------------------------------------------

/** A user-imported asset (image fetched from a URL into a Figma image hash). */
export interface AssetEntry {
  /** Stable name the user chose, used as plugin-data key suffix. */
  name: string;
  /** Source URL the asset was fetched from. */
  url: string;
  /** Figma image hash. Use in fills as { type: "IMAGE", imageHash: hash, ... }. */
  hash: string;
  width: number;
  height: number;
  /** ISO timestamp of last fetch. */
  importedAt: string;
}

export interface AssetImportedMessage {
  type: "ASSET_IMPORTED";
  asset: AssetEntry;
}

export interface AssetsListMessage {
  type: "ASSETS_LIST";
  assets: AssetEntry[];
}

export interface AssetDeletedMessage {
  type: "ASSET_DELETED";
  name: string;
}

export type SandboxToUIMessage =
  | ValidationResultMessage
  | FrameExportedMessage
  | ExportCompleteMessage
  | PreviewDataMessage
  | SwitchViewMessage
  | TemplateGeneratedMessage
  | FrameBytesMessage
  | ImportCompleteMessage
  | ComponentExportedMessage
  | SliderPartExportedMessage
  | ComponentExportProgressMessage
  | ComponentExportCompleteMessage
  | AssetImportedMessage
  | AssetsListMessage
  | AssetDeletedMessage
  | ErrorMessage;

// -- UI -> Sandbox messages -------------------------------------------------

export interface ValidateMessage {
  type: "VALIDATE";
}

export interface ExportMessage {
  type: "EXPORT";
  config: ExportConfig;
}

export interface PreviewMessage {
  type: "PREVIEW";
  frameName: string;
}

export interface GenerateTemplateMessage {
  type: "GENERATE_TEMPLATE";
  assetScale: number;
}

export interface ImportSkinMessage {
  type: "IMPORT_SKIN";
  /** Map of uppercase filename (e.g. "MAIN.PNG") to PNG image bytes */
  files: Array<{ name: string; bytes: Uint8Array }>;
  /** Config files */
  viscolorTxt: string | null;
  pleditTxt: string | null;
  /** Detected asset scale (from skin.json for .msz, or 1 for .wsz) */
  detectedScale: number;
  /** Target scale for the Figma template */
  targetScale: number;
}

export interface ExportComponentsMessage {
  type: "EXPORT_COMPONENTS";
  config: ExportConfig;
}

export interface GenerateComponentTemplateMessage {
  type: "GENERATE_COMPONENT_TEMPLATE";
  assetScale: number;
}

export interface ImportAssetMessage {
  type: "IMPORT_ASSET";
  name: string;
  url: string;
  bytes: Uint8Array;
}

export interface ListAssetsMessage {
  type: "LIST_ASSETS";
}

export interface DeleteAssetMessage {
  type: "DELETE_ASSET";
  name: string;
}

export type UIToSandboxMessage =
  | ValidateMessage
  | ExportMessage
  | PreviewMessage
  | GenerateTemplateMessage
  | ImportSkinMessage
  | ExportComponentsMessage
  | GenerateComponentTemplateMessage
  | ImportAssetMessage
  | ListAssetsMessage
  | DeleteAssetMessage;

// -- Discriminated union helper ---------------------------------------------

export type PluginMessage = SandboxToUIMessage | UIToSandboxMessage;
