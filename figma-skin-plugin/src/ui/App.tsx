import React, { useState, useCallback, useEffect, useRef } from "react";
import { CreatePanel } from "./panels/CreatePanel";
import { ExportPanel } from "./panels/ExportPanel";
import { ConfigPanel, DEFAULT_VISCOLORS, DEFAULT_PLEDIT } from "./panels/ConfigPanel";
import { AssetsPanel } from "./panels/AssetsPanel";
import { importSkinFile } from "./import/importer";
import {
  assembleSheets,
  type ExportedVariant,
  type SliderFrameSet,
} from "./export/sheetAssembler";
import { generateSliderFrames } from "./export/sliderGenerator";
import { createDebugDumpArchive } from "./export/debugDump";
import type { PleditConfig } from "./export/configFiles";
import type {
  AssetEntry,
  FrameValidation,
  ValidationStatus,
  SandboxToUIMessage,
} from "../shared/messages";
import type { SpriteSheetTarget } from "../shared/componentDefs";
import { DEFAULT_ASSET_SCALE, type AssetScale } from "../shared/constants";

type TabId = "create" | "assets" | "export" | "config";

const TABS: { id: TabId; label: string }[] = [
  { id: "create", label: "Create" },
  { id: "assets", label: "Assets" },
  { id: "export", label: "Export" },
  { id: "config", label: "Config" },
];

export function App(): React.ReactElement {
  // -- Tab state --------------------------------------------------------------
  const [activeTab, setActiveTab] = useState<TabId>("create");

  // -- Validation state -------------------------------------------------------
  const [validationResults, setValidationResults] = useState<FrameValidation[]>(
    []
  );
  const [overallStatus, setOverallStatus] = useState<ValidationStatus | null>(
    null
  );

  // -- Export state ------------------------------------------------------------
  const [exportProgressLabel, setExportProgressLabel] = useState<string | null>(
    null
  );
  const [exportProgressFraction, setExportProgressFraction] = useState(0);
  const [exportedFrames, setExportedFrames] = useState<
    Map<string, Uint8Array>
  >(new Map());
  const [exportComplete, setExportComplete] = useState(false);
  const [exportFileSize, setExportFileSize] = useState<number | null>(null);
  const exportedFramesRef = useRef<Map<string, Uint8Array>>(new Map());

  // -- Component-mode export accumulators ------------------------------------
  // We collect per-variant PNGs and slider parts as the sandbox sends them,
  // then assemble + ZIP everything when COMPONENT_EXPORT_COMPLETE arrives.
  interface SliderPartSet {
    bg: Uint8Array | null;
    fill: Uint8Array | null;
    target: SpriteSheetTarget;
    orientation: "horizontal" | "vertical";
    frameCount: number;
  }
  const variantsRef = useRef<ExportedVariant[]>([]);
  const sliderPartsRef = useRef<Map<string, SliderPartSet>>(new Map());
  const debugDumpRef = useRef(false);
  const skinNameRef = useRef("");

  // -- Config state -----------------------------------------------------------
  const [viscolors, setViscolors] = useState<string[]>([...DEFAULT_VISCOLORS]);
  const [pledit, setPledit] = useState<PleditConfig>({ ...DEFAULT_PLEDIT });

  // -- Scale state -------------------------------------------------------------
  const [assetScale, setAssetScale] = useState<AssetScale>(DEFAULT_ASSET_SCALE);

  // -- Asset Bridge state -----------------------------------------------------
  const [assets, setAssets] = useState<AssetEntry[]>([]);

  // -- Error state ------------------------------------------------------------
  const [error, setError] = useState<string | null>(null);

  // -- Message handler --------------------------------------------------------
  useEffect(() => {
    function handleMessage(event: MessageEvent): void {
      const msg = event.data?.pluginMessage as SandboxToUIMessage | undefined;
      if (!msg) return;

      switch (msg.type) {
        case "VALIDATION_RESULT":
          setValidationResults(msg.frames);
          setOverallStatus(msg.overallStatus);
          break;

        case "FRAME_EXPORTED": {
          setExportProgressLabel(
            `Exporting ${msg.frameName}... ${msg.index + 1}/${msg.total}`
          );
          setExportProgressFraction((msg.index + 1) / msg.total);

          // The sandbox sends image data via PREVIEW_DATA for export frames too.
          // The actual bytes arrive separately -- handled in PREVIEW_DATA below.
          break;
        }

        case "FRAME_BYTES": {
          // Accumulate exported PNG bytes for ZIP assembly
          const updated = new Map(exportedFramesRef.current);
          updated.set(msg.frameName, msg.bytes);
          exportedFramesRef.current = updated;
          setExportedFrames(updated);
          break;
        }

        case "EXPORT_COMPLETE":
          setExportComplete(true);
          setExportFileSize(msg.fileSize);
          break;

        case "PREVIEW_DATA": {
          // The Preview tab has been removed in favour of the live canvas
          // preview frames in component mode. PREVIEW_DATA only still arrives
          // for export-bytes routing (legacy sprite-sheet exporter path).
          const updated = new Map(exportedFramesRef.current);
          updated.set(msg.frameName, msg.imageData);
          exportedFramesRef.current = updated;
          setExportedFrames(updated);
          break;
        }

        case "COMPONENT_EXPORTED": {
          variantsRef.current.push({
            componentName: msg.componentName,
            variantValues: msg.variantValues,
            bytes: msg.bytes,
            target: msg.target,
          });
          break;
        }

        case "SLIDER_PART_EXPORTED": {
          let entry = sliderPartsRef.current.get(msg.componentName);
          if (!entry) {
            entry = {
              bg: null,
              fill: null,
              target: msg.target,
              orientation: msg.orientation,
              frameCount: msg.frameCount,
            };
            sliderPartsRef.current.set(msg.componentName, entry);
          }
          if (msg.partName === "BG") entry.bg = msg.bytes;
          else if (msg.partName === "Fill") entry.fill = msg.bytes;
          break;
        }

        case "COMPONENT_EXPORT_PROGRESS": {
          setExportProgressLabel(
            `Exporting ${msg.componentName}... ${msg.index}/${msg.total}`,
          );
          setExportProgressFraction(msg.index / msg.total);
          break;
        }

        case "COMPONENT_EXPORT_COMPLETE": {
          // All variants and slider parts are in. Generate the 28-frame
          // slider sprites, composite all the sprite sheets via canvas, and
          // hand the result to the existing exportedFrames map so the
          // ExportPanel useEffect picks it up and ZIPs the .msz.
          (async () => {
            try {
              setExportProgressLabel("Generating slider frames…");
              setExportProgressFraction(0.85);
              const sliderFrameSets: SliderFrameSet[] = [];
              for (const [name, parts] of sliderPartsRef.current) {
                if (!parts.bg || !parts.fill) continue;
                const frames = await generateSliderFrames(
                  parts.bg,
                  parts.fill,
                  parts.orientation,
                  parts.frameCount,
                );
                sliderFrameSets.push({
                  componentName: name,
                  target: parts.target,
                  frames,
                });
              }

              setExportProgressLabel("Compositing sprite sheets…");
              setExportProgressFraction(0.95);
              const sheets = await assembleSheets(
                variantsRef.current,
                sliderFrameSets,
                msg.scale,
              );

              const framesMap = new Map<string, Uint8Array>();
              for (const sheet of sheets) framesMap.set(sheet.fileName, sheet.bytes);
              exportedFramesRef.current = framesMap;
              setExportedFrames(framesMap);
              setExportComplete(true);
              setExportProgressLabel(
                `Composed ${sheets.length} sprite sheets, building .msz…`,
              );
              setExportProgressFraction(1);

              if (debugDumpRef.current) {
                try {
                  await createDebugDumpArchive({
                    skinName: skinNameRef.current || "skin",
                    assetScale: msg.scale,
                    variants: variantsRef.current,
                    sliderFrameSets,
                    sheets: framesMap,
                  });
                } catch (dumpErr: unknown) {
                  setError(
                    "Debug dump failed: " +
                      (dumpErr instanceof Error ? dumpErr.message : String(dumpErr)),
                  );
                }
              }
            } catch (err: unknown) {
              setError(
                "Component export assembly failed: " +
                  (err instanceof Error ? err.message : String(err)),
              );
            }
          })();
          break;
        }

        case "TEMPLATE_GENERATED":
          setAssetScale(msg.assetScale as AssetScale);
          break;

        case "IMPORT_COMPLETE":
          setAssetScale(msg.scale as AssetScale);
          break;

        case "ASSET_IMPORTED": {
          // Either replace existing entry by name or append.
          setAssets((prev) => {
            const idx = prev.findIndex((a) => a.name === msg.asset.name);
            if (idx >= 0) {
              const next = prev.slice();
              next[idx] = msg.asset;
              return next;
            }
            return [...prev, msg.asset];
          });
          break;
        }

        case "ASSETS_LIST":
          setAssets(msg.assets);
          break;

        case "ASSET_DELETED":
          setAssets((prev) => prev.filter((a) => a.name !== msg.name));
          break;

        case "ERROR":
          setError(msg.message);
          break;
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // -- Actions ----------------------------------------------------------------

  const postToSandbox = useCallback((msg: Record<string, unknown>) => {
    parent.postMessage({ pluginMessage: msg }, "*");
  }, []);

  const handleValidate = useCallback(() => {
    setValidationResults([]);
    setOverallStatus(null);
    setError(null);
    postToSandbox({ type: "VALIDATE" });
  }, [postToSandbox]);

  const handleGenerateTemplate = useCallback(
    (scale: number) => {
      setError(null);
      postToSandbox({ type: "GENERATE_TEMPLATE", assetScale: scale });
    },
    [postToSandbox]
  );

  const handleGenerateComponentTemplate = useCallback(
    (scale: number) => {
      setError(null);
      postToSandbox({ type: "GENERATE_COMPONENT_TEMPLATE", assetScale: scale });
    },
    [postToSandbox]
  );

  const handleExport = useCallback(
    (skinName: string, debugDump = false) => {
      setExportProgressLabel(null);
      setExportProgressFraction(0);
      exportedFramesRef.current = new Map();
      setExportedFrames(new Map());
      setExportComplete(false);
      setExportFileSize(null);
      // Reset component-mode accumulators too
      variantsRef.current = [];
      sliderPartsRef.current = new Map();
      debugDumpRef.current = debugDump;
      skinNameRef.current = skinName;
      setError(null);
      postToSandbox({
        type: "EXPORT",
        config: { skinName, assetScale },
      });
    },
    [postToSandbox, assetScale]
  );

  const handleAssetImport = useCallback(
    (name: string, url: string, bytes: Uint8Array) => {
      setError(null);
      postToSandbox({ type: "IMPORT_ASSET", name, url, bytes });
    },
    [postToSandbox],
  );

  const handleAssetDelete = useCallback(
    (name: string) => {
      setError(null);
      postToSandbox({ type: "DELETE_ASSET", name });
    },
    [postToSandbox],
  );

  const handleAssetsRefresh = useCallback(() => {
    postToSandbox({ type: "LIST_ASSETS" });
  }, [postToSandbox]);

  const handleImportSkin = useCallback(
    async (file: File) => {
      setError(null);
      try {
        const skin = await importSkinFile(file);
        postToSandbox({
          type: "IMPORT_SKIN",
          files: skin.files,
          viscolorTxt: skin.viscolorTxt,
          pleditTxt: skin.pleditTxt,
          detectedScale: skin.detectedScale,
          targetScale: assetScale,
        });
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to import skin";
        setError(message);
      }
    },
    [postToSandbox, assetScale]
  );

  // -- Render -----------------------------------------------------------------

  return (
    <div style={styles.root}>
      {/* Tab bar */}
      <div style={styles.tabBar}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            style={{
              ...styles.tab,
              ...(activeTab === tab.id ? styles.tabActive : {}),
            }}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Error banner */}
      {error && (
        <div style={styles.errorBanner}>
          <span>{error}</span>
          <button
            style={styles.errorDismiss}
            onClick={() => setError(null)}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Panel content */}
      <div style={styles.panelContainer}>
        {activeTab === "create" && (
          <CreatePanel
            assetScale={assetScale}
            onAssetScaleChange={setAssetScale}
            onGenerateTemplate={handleGenerateTemplate}
            onGenerateComponentTemplate={handleGenerateComponentTemplate}
            onImportSkin={handleImportSkin}
          />
        )}

        {activeTab === "export" && (
          <ExportPanel
            progressLabel={exportProgressLabel}
            progressFraction={exportProgressFraction}
            exportedFrames={exportedFrames}
            exportComplete={exportComplete}
            reportedFileSize={exportFileSize}
            assetScale={assetScale}
            viscolors={viscolors}
            pledit={pledit}
            validationResults={validationResults}
            validationOverallStatus={overallStatus}
            onValidate={handleValidate}
            onExport={handleExport}
          />
        )}

        {activeTab === "assets" && (
          <AssetsPanel
            assets={assets}
            onImport={handleAssetImport}
            onDelete={handleAssetDelete}
            onRefresh={handleAssetsRefresh}
          />
        )}

        {activeTab === "config" && (
          <ConfigPanel
            viscolors={viscolors}
            pledit={pledit}
            onViscolorsChange={setViscolors}
            onPleditChange={setPledit}
          />
        )}
      </div>
    </div>
  );
}

// -- Styles -------------------------------------------------------------------

const styles: Record<string, React.CSSProperties> = {
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    overflow: "hidden",
  },
  tabBar: {
    display: "flex",
    borderBottom: "1px solid var(--figma-color-border, #e5e5e5)",
    background: "var(--figma-color-bg, #fff)",
    flexShrink: 0,
  },
  tab: {
    flex: 1,
    padding: "8px 4px",
    border: "none",
    borderBottom: "2px solid transparent",
    background: "none",
    color: "var(--figma-color-text-secondary, #999)",
    fontSize: "11px",
    fontWeight: 600,
    cursor: "pointer",
    textAlign: "center",
    transition: "color 0.15s, border-color 0.15s",
  },
  tabActive: {
    color: "var(--figma-color-text, #333)",
    borderBottomColor: "var(--figma-color-bg-brand, #0D99FF)",
  },
  errorBanner: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "8px",
    padding: "8px 12px",
    background: "var(--figma-color-bg-danger, #FFF0EE)",
    color: "var(--figma-color-text-danger, #F24822)",
    fontSize: "12px",
    flexShrink: 0,
  },
  errorDismiss: {
    padding: "2px 8px",
    border: "none",
    borderRadius: "4px",
    background: "rgba(242, 72, 34, 0.15)",
    color: "var(--figma-color-text-danger, #F24822)",
    fontSize: "10px",
    fontWeight: 600,
    cursor: "pointer",
    flexShrink: 0,
  },
  panelContainer: {
    flex: 1,
    overflowY: "auto",
  },
};
