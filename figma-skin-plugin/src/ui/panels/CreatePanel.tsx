import React, { useRef } from "react";
import { SUPPORTED_SCALES, type AssetScale } from "../../shared/constants";

interface CreatePanelProps {
  assetScale: AssetScale;
  onAssetScaleChange: (scale: AssetScale) => void;
  onGenerateTemplate: (scale: number) => void;
  /** Destructive — wipes every known component / section / preview and rebuilds. */
  onGenerateComponentTemplate: (scale: number) => void;
  onImportSkin: (file: File) => void;
}

export function CreatePanel({
  assetScale,
  onAssetScaleChange,
  onGenerateTemplate,
  onGenerateComponentTemplate,
  onImportSkin,
}: CreatePanelProps): React.ReactElement {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportSkin(file);
      e.target.value = "";
    }
  };

  const handleGenerate = () => {
    const confirmed = window.confirm(
      "Generate Template will delete every existing component, section " +
      "frame, and preview frame on this page (with the names the plugin " +
      "owns) and rebuild them as empty placeholders.\n\n" +
      "Any artwork you've drawn into those components will be lost.\n\n" +
      "Continue?"
    );
    if (confirmed) onGenerateComponentTemplate(assetScale);
  };

  return (
    <div style={styles.container}>
      {/* Scale selector */}
      <div style={styles.fieldGroup}>
        <label style={styles.fieldLabel}>Asset Scale</label>
        <div style={styles.scaleSelector}>
          {SUPPORTED_SCALES.map((scale) => (
            <button
              key={scale}
              style={{
                ...styles.scaleOption,
                ...(assetScale === scale ? styles.scaleOptionActive : {}),
              }}
              onClick={() => onAssetScaleChange(scale)}
            >
              {scale}x
            </button>
          ))}
        </div>
        <p style={styles.helperText}>
          Asset resolution multiplier. 2x doubles every sprite to give 2x
          DPI assets; 3x triples them.
        </p>
      </div>

      {/* Template generation */}
      <div style={styles.fieldGroup}>
        <label style={styles.fieldLabel}>Generate Template</label>
        <div style={styles.buttonRow}>
          <button style={styles.componentButton} onClick={handleGenerate}>
            Generate Components
          </button>
          <button
            style={styles.secondaryButton}
            onClick={() => onGenerateTemplate(assetScale)}
          >
            Sprite Sheets
          </button>
        </div>
        <p style={styles.helperText}>
          <strong>Generate Components</strong> creates editable
          Figma components (Play Button, Volume Slider, etc.) and live
          preview frames. <strong>Destructive</strong> — wipes any existing
          components / previews on this page first. Use this once when
          setting up a skin (or to pick up changes to{" "}
          <code>componentDefs.ts</code>).
          <br />
          <strong>Sprite Sheets</strong> generates raw sprite-sheet frames
          with guides for the legacy authoring mode.
        </p>
      </div>

      {/* Import skin */}
      <div style={styles.fieldGroup}>
        <label style={styles.fieldLabel}>Import Existing Skin</label>
        <button
          style={styles.importButton}
          onClick={() => fileInputRef.current?.click()}
        >
          Choose .wsz / .msz file
        </button>
        <p style={styles.helperText}>
          Imports a Winamp (.wsz) or Minamp HD (.msz) skin into editable
          sprite-sheet frames at the selected scale.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".wsz,.msz,.zip"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}

// -- Styles -------------------------------------------------------------------

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    padding: "12px",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  fieldLabel: {
    fontSize: "11px",
    fontWeight: 600,
    color: "var(--figma-color-text-secondary, #999)",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  helperText: {
    fontSize: "11px",
    lineHeight: "16px",
    color: "var(--figma-color-text-secondary, #999)",
    margin: "2px 0 0 0",
  },
  scaleSelector: {
    display: "flex",
    border: "1px solid var(--figma-color-border, #e5e5e5)",
    borderRadius: "6px",
    overflow: "hidden",
    alignSelf: "flex-start",
  },
  scaleOption: {
    padding: "6px 16px",
    border: "none",
    background: "var(--figma-color-bg, #fff)",
    color: "var(--figma-color-text-secondary, #999)",
    fontSize: "12px",
    fontWeight: 500,
    cursor: "pointer",
  },
  scaleOptionActive: {
    background: "var(--figma-color-bg-brand, #0D99FF)",
    color: "#fff",
  },
  buttonRow: {
    display: "flex",
    gap: "8px",
  },
  secondaryButton: {
    flex: 1,
    padding: "8px 12px",
    border: "1px solid var(--figma-color-border, #e5e5e5)",
    borderRadius: "6px",
    background: "var(--figma-color-bg, #fff)",
    color: "var(--figma-color-text, #333)",
    fontSize: "12px",
    fontWeight: 500,
    cursor: "pointer",
  },
  componentButton: {
    flex: 1,
    padding: "8px 12px",
    border: "none",
    borderRadius: "6px",
    background: "var(--figma-color-bg-brand, #0D99FF)",
    color: "#fff",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
  },
  importButton: {
    padding: "8px 12px",
    border: "1px dashed var(--figma-color-border, #e5e5e5)",
    borderRadius: "6px",
    background: "var(--figma-color-bg-secondary, #f5f5f5)",
    color: "var(--figma-color-text, #333)",
    fontSize: "12px",
    fontWeight: 500,
    cursor: "pointer",
    textAlign: "center",
  },
};
