import React, { useState, useCallback, useRef } from "react";
import { createMSZArchive, SkinConfig } from "../export/archiver";
import type { PleditConfig } from "../export/configFiles";
import type { FrameValidation, ValidationStatus } from "../../shared/messages";

interface ExportPanelProps {
  /** Current progress label (e.g. "Exporting MAIN.PNG... 3/17") */
  progressLabel: string | null;
  /** Progress 0-1 */
  progressFraction: number;
  /** Accumulated exported frames from the sandbox */
  exportedFrames: Map<string, Uint8Array>;
  /** Whether all frames have been received from the sandbox */
  exportComplete: boolean;
  /** File size reported by sandbox (bytes) */
  reportedFileSize: number | null;
  /** Current asset scale (2x or 3x) */
  assetScale: number;
  /** Current config values for viscolors and pledit */
  viscolors: string[];
  pledit: PleditConfig;
  /** Validation state */
  validationResults: FrameValidation[];
  validationOverallStatus: ValidationStatus | null;
  onValidate: () => void;
  /** Callback to start export in the sandbox. Pass debugDump=true to also emit `<skin>.debug.zip` with raw per-variant PNGs, slider frames, and assembled sheets. */
  onExport: (skinName: string, debugDump?: boolean) => void;
}

const STATUS_ICONS: Record<ValidationStatus, string> = {
  pass: "\u2705",
  warn: "\u26A0\uFE0F",
  fail: "\u274C",
};

const STATUS_COLORS: Record<ValidationStatus, string> = {
  pass: "var(--figma-color-text-success, #1BC47D)",
  warn: "var(--figma-color-text-warning, #F5A623)",
  fail: "var(--figma-color-text-danger, #F24822)",
};

export function ExportPanel({
  progressLabel,
  progressFraction,
  exportedFrames,
  exportComplete,
  reportedFileSize,
  assetScale,
  viscolors,
  pledit,
  validationResults,
  validationOverallStatus,
  onValidate,
  onExport,
}: ExportPanelProps): React.ReactElement {
  const [skinName, setSkinName] = useState("MySkin");
  const [isExporting, setIsExporting] = useState(false);
  const [downloadSize, setDownloadSize] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAllResults, setShowAllResults] = useState(false);
  const [debugDump, setDebugDump] = useState(false);
  const hasAssembledRef = useRef(false);

  const handleExport = useCallback(() => {
    if (!skinName.trim()) return;
    setIsExporting(true);
    setDownloadSize(null);
    setError(null);
    hasAssembledRef.current = false;
    onExport(skinName.trim(), debugDump);
  }, [skinName, onExport, debugDump]);

  // When export completes from sandbox, assemble ZIP and trigger download
  React.useEffect(() => {
    if (!exportComplete || hasAssembledRef.current) return;
    if (exportedFrames.size === 0) return;

    hasAssembledRef.current = true;

    const config: SkinConfig = {
      skinName,
      assetScale,
      viscolors,
      pledit,
    };

    createMSZArchive(exportedFrames, config)
      .then((size) => {
        setDownloadSize(size);
        setIsExporting(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setIsExporting(false);
      });
  }, [exportComplete, exportedFrames, skinName, assetScale, viscolors, pledit]);

  // Filter results: by default show only fails + warns (problems)
  const problemResults = validationResults.filter(
    (r) => r.status === "fail" || r.status === "warn",
  );
  const visibleResults = showAllResults ? validationResults : problemResults;
  const passCount = validationResults.filter((r) => r.status === "pass").length;
  const failCount = validationResults.filter((r) => r.status === "fail").length;
  const warnCount = validationResults.filter((r) => r.status === "warn").length;

  return (
    <div style={styles.container}>
      {/* -- Validation section ------------------------------------------- */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <label style={styles.label}>Validate</label>
          <button style={styles.validateButton} onClick={onValidate}>
            Validate
          </button>
        </div>

        {validationOverallStatus !== null && (
          <div
            style={{
              ...styles.overallBanner,
              borderColor: STATUS_COLORS[validationOverallStatus],
            }}
          >
            <span style={styles.overallIcon}>
              {STATUS_ICONS[validationOverallStatus]}
            </span>
            <span style={styles.overallText}>
              {validationOverallStatus === "pass" &&
                `All ${passCount} components valid`}
              {validationOverallStatus === "warn" &&
                `${passCount} pass, ${warnCount} warn`}
              {validationOverallStatus === "fail" &&
                `${failCount} fail, ${warnCount} warn, ${passCount} pass`}
            </span>
          </div>
        )}

        {validationResults.length > 0 && (
          <>
            <div style={styles.resultsList}>
              {visibleResults.map((item) => (
                <div key={item.frameName} style={styles.resultRow}>
                  <span style={styles.statusIcon}>
                    {STATUS_ICONS[item.status]}
                  </span>
                  <div style={styles.resultContent}>
                    <span style={styles.frameName}>{item.frameName}</span>
                    <span
                      style={{
                        ...styles.message,
                        color: STATUS_COLORS[item.status],
                      }}
                    >
                      {item.message}
                    </span>
                  </div>
                </div>
              ))}
              {visibleResults.length === 0 && (
                <div style={styles.allGoodLine}>
                  No problems found.
                </div>
              )}
            </div>

            {problemResults.length > 0 && passCount > 0 && (
              <button
                style={styles.toggleButton}
                onClick={() => setShowAllResults(!showAllResults)}
              >
                {showAllResults
                  ? `Hide ${passCount} passing`
                  : `Show all (${validationResults.length} items)`}
              </button>
            )}
          </>
        )}
      </div>

      {/* Divider */}
      <div style={styles.divider} />

      {/* -- Export section ----------------------------------------------- */}
      <div style={styles.section}>
        <label style={styles.label}>Export</label>

        {/* Skin name input */}
        <div style={styles.fieldGroup}>
          <label style={styles.subLabel}>Skin Name</label>
          <input
            style={styles.input}
            type="text"
            value={skinName}
            onChange={(e) => setSkinName(e.target.value)}
            placeholder="MySkin"
            disabled={isExporting}
          />
        </div>

        <div style={styles.scaleInfo}>
          Asset scale: {assetScale}x
        </div>

        <label style={styles.checkboxRow}>
          <input
            type="checkbox"
            checked={debugDump}
            onChange={(e) => setDebugDump(e.target.checked)}
            disabled={isExporting}
          />
          <span>
            Dump debug PNGs alongside the .msz (<code>{skinName}.debug.zip</code>)
          </span>
        </label>

        <button
          style={{
            ...styles.exportButton,
            opacity: isExporting ? 0.6 : 1,
          }}
          onClick={handleExport}
          disabled={isExporting || !skinName.trim()}
        >
          {isExporting ? "Exporting..." : "Export .msz"}
        </button>

        {isExporting && progressLabel && (
          <div style={styles.progressSection}>
            <div style={styles.progressLabel}>{progressLabel}</div>
            <div style={styles.progressTrack}>
              <div
                style={{
                  ...styles.progressFill,
                  width: `${Math.round(progressFraction * 100)}%`,
                }}
              />
            </div>
          </div>
        )}

        {error && (
          <div style={styles.errorBanner}>
            Export failed: {error}
          </div>
        )}

        {downloadSize !== null && (
          <div style={styles.successBanner}>
            Saved {skinName}.msz ({formatBytes(downloadSize)})
          </div>
        )}
      </div>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// -- Styles -------------------------------------------------------------------

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    padding: "12px",
  },
  section: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "8px",
  },
  divider: {
    height: "1px",
    background: "var(--figma-color-border, #e5e5e5)",
    margin: "4px 0",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  label: {
    fontSize: "11px",
    fontWeight: 600,
    color: "var(--figma-color-text-secondary, #999)",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  subLabel: {
    fontSize: "11px",
    fontWeight: 500,
    color: "var(--figma-color-text-secondary, #999)",
  },
  input: {
    padding: "8px 10px",
    border: "1px solid var(--figma-color-border, #e5e5e5)",
    borderRadius: "6px",
    background: "var(--figma-color-bg, #fff)",
    color: "var(--figma-color-text, #333)",
    fontSize: "12px",
    outline: "none",
  },
  scaleInfo: {
    fontSize: "11px",
    color: "var(--figma-color-text-secondary, #999)",
    padding: "2px 0",
  },
  checkboxRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "11px",
    color: "var(--figma-color-text, #333)",
    cursor: "pointer",
  },
  validateButton: {
    padding: "6px 12px",
    border: "1px solid var(--figma-color-border, #e5e5e5)",
    borderRadius: "6px",
    background: "var(--figma-color-bg, #fff)",
    color: "var(--figma-color-text, #333)",
    fontSize: "12px",
    fontWeight: 500,
    cursor: "pointer",
  },
  exportButton: {
    padding: "10px 16px",
    border: "none",
    borderRadius: "6px",
    background: "var(--figma-color-bg-brand, #0D99FF)",
    color: "#fff",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
  },
  toggleButton: {
    padding: "4px 0",
    border: "none",
    background: "none",
    color: "var(--figma-color-text-secondary, #999)",
    fontSize: "11px",
    fontWeight: 500,
    cursor: "pointer",
    textAlign: "left",
    alignSelf: "flex-start",
    textDecoration: "underline",
  },
  overallBanner: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 12px",
    borderRadius: "6px",
    border: "1px solid",
    background: "var(--figma-color-bg-secondary, #f5f5f5)",
  },
  overallIcon: {
    fontSize: "14px",
  },
  overallText: {
    fontSize: "12px",
    fontWeight: 600,
    color: "var(--figma-color-text, #333)",
  },
  resultsList: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    maxHeight: "240px",
    overflowY: "auto",
    paddingRight: "4px",
  },
  allGoodLine: {
    fontSize: "11px",
    color: "var(--figma-color-text-secondary, #999)",
    padding: "8px 0",
  },
  resultRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
    padding: "6px 8px",
    borderRadius: "4px",
    background: "var(--figma-color-bg-secondary, #f5f5f5)",
  },
  statusIcon: {
    fontSize: "12px",
    lineHeight: "16px",
    flexShrink: 0,
  },
  resultContent: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    minWidth: 0,
  },
  frameName: {
    fontSize: "12px",
    fontWeight: 600,
    color: "var(--figma-color-text, #333)",
  },
  message: {
    fontSize: "11px",
  },
  progressSection: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  progressLabel: {
    fontSize: "11px",
    color: "var(--figma-color-text-secondary, #999)",
  },
  progressTrack: {
    height: "4px",
    borderRadius: "2px",
    background: "var(--figma-color-bg-secondary, #e5e5e5)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: "2px",
    background: "var(--figma-color-bg-brand, #0D99FF)",
    transition: "width 0.2s ease",
  },
  errorBanner: {
    padding: "8px 12px",
    borderRadius: "6px",
    background: "var(--figma-color-bg-danger, #FFF0EE)",
    color: "var(--figma-color-text-danger, #F24822)",
    fontSize: "12px",
  },
  successBanner: {
    padding: "8px 12px",
    borderRadius: "6px",
    background: "var(--figma-color-bg-success, #E6F9EF)",
    color: "var(--figma-color-text-success, #1BC47D)",
    fontSize: "12px",
    fontWeight: 600,
  },
};
