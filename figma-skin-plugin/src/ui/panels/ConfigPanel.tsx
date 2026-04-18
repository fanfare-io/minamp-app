import React, { useState, useCallback, useEffect } from "react";
import type { PleditConfig } from "../export/configFiles";

interface ConfigPanelProps {
  viscolors: string[];
  pledit: PleditConfig;
  onViscolorsChange: (colors: string[]) => void;
  onPleditChange: (config: PleditConfig) => void;
}

// Default VISCOLOR values from ConfigParsers.swift (as hex)
const DEFAULT_VISCOLORS: string[] = [
  "#000000", "#182129", "#EF3110", "#CE2910",
  "#D65A00", "#D66600", "#D67300", "#C67B08",
  "#DEA518", "#D6B521", "#BDDE29", "#94DE21",
  "#29CE10", "#32BE10", "#39B510", "#39A521",
  "#429431", "#429431", "#429431", "#429431",
  "#429431", "#429431", "#429431", "#429431",
];

const DEFAULT_PLEDIT: PleditConfig = {
  normal: "#00FF00",
  current: "#FFFFFF",
  normalBG: "#000000",
  selectedBG: "#000066",
  font: "Arial",
};

const VISCOLOR_LABELS: string[] = [
  "Background",
  "Oscilloscope BG",
  "Osc. line 1 (peak)",
  "Osc. line 2",
  "Osc. line 3",
  "Osc. line 4",
  "Osc. line 5",
  "Osc. line 6",
  "Osc. line 7",
  "Osc. line 8",
  "Osc. line 9",
  "Osc. line 10",
  "Osc. line 11",
  "Osc. line 12",
  "Osc. line 13",
  "Osc. line 14",
  "Osc. line 15",
  "Osc. line 16",
  "Analyzer bar 1",
  "Analyzer bar 2",
  "Analyzer bar 3",
  "Analyzer bar 4",
  "Analyzer bar 5",
  "Analyzer peak",
];

export function ConfigPanel({
  viscolors,
  pledit,
  onViscolorsChange,
  onPleditChange,
}: ConfigPanelProps): React.ReactElement {
  const [activeSection, setActiveSection] = useState<"viscolor" | "pledit">(
    "viscolor"
  );

  const handleViscolorChange = useCallback(
    (index: number, value: string) => {
      const updated = [...viscolors];
      updated[index] = value;
      onViscolorsChange(updated);
    },
    [viscolors, onViscolorsChange]
  );

  const handlePleditField = useCallback(
    (field: keyof PleditConfig, value: string) => {
      onPleditChange({ ...pledit, [field]: value });
    },
    [pledit, onPleditChange]
  );

  const handleResetViscolors = useCallback(() => {
    onViscolorsChange([...DEFAULT_VISCOLORS]);
  }, [onViscolorsChange]);

  const handleResetPledit = useCallback(() => {
    onPleditChange({ ...DEFAULT_PLEDIT });
  }, [onPleditChange]);

  // Persist to figma.clientStorage on changes
  useEffect(() => {
    parent.postMessage(
      {
        pluginMessage: {
          type: "SAVE_CONFIG",
          viscolors,
          pledit,
        },
      },
      "*"
    );
  }, [viscolors, pledit]);

  return (
    <div style={styles.container}>
      {/* Section tabs */}
      <div style={styles.sectionTabs}>
        <button
          style={{
            ...styles.sectionTab,
            ...(activeSection === "viscolor" ? styles.sectionTabActive : {}),
          }}
          onClick={() => setActiveSection("viscolor")}
        >
          VISCOLOR
        </button>
        <button
          style={{
            ...styles.sectionTab,
            ...(activeSection === "pledit" ? styles.sectionTabActive : {}),
          }}
          onClick={() => setActiveSection("pledit")}
        >
          PLEDIT
        </button>
      </div>

      {/* VISCOLOR section */}
      {activeSection === "viscolor" && (
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionTitle}>Visualizer Colors</span>
            <button style={styles.resetButton} onClick={handleResetViscolors}>
              Reset
            </button>
          </div>
          <div style={styles.colorGrid}>
            {viscolors.map((color, i) => (
              <div key={i} style={styles.colorRow}>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => handleViscolorChange(i, e.target.value)}
                  style={styles.colorInput}
                />
                <div style={styles.colorInfo}>
                  <span style={styles.colorIndex}>{i}</span>
                  <span style={styles.colorLabel}>
                    {i < VISCOLOR_LABELS.length
                      ? VISCOLOR_LABELS[i]
                      : `Color ${i}`}
                  </span>
                </div>
                <span style={styles.colorHex}>{color.toUpperCase()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PLEDIT section */}
      {activeSection === "pledit" && (
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionTitle}>Playlist Colors</span>
            <button style={styles.resetButton} onClick={handleResetPledit}>
              Reset
            </button>
          </div>

          {/* Color pickers */}
          <div style={styles.pleditColors}>
            <ColorField
              label="Normal Text"
              value={pledit.normal}
              onChange={(v) => handlePleditField("normal", v)}
            />
            <ColorField
              label="Current Track"
              value={pledit.current}
              onChange={(v) => handlePleditField("current", v)}
            />
            <ColorField
              label="Normal Background"
              value={pledit.normalBG}
              onChange={(v) => handlePleditField("normalBG", v)}
            />
            <ColorField
              label="Selected Background"
              value={pledit.selectedBG}
              onChange={(v) => handlePleditField("selectedBG", v)}
            />
          </div>

          {/* Preview swatch */}
          <div style={styles.previewSection}>
            <span style={styles.previewLabel}>Preview</span>
            <div
              style={{
                ...styles.previewBox,
                background: pledit.normalBG,
              }}
            >
              <div style={{ color: pledit.normal, fontSize: "11px" }}>
                01. Normal track
              </div>
              <div
                style={{
                  color: pledit.current,
                  fontSize: "11px",
                  fontWeight: 600,
                }}
              >
                02. Current track
              </div>
              <div
                style={{
                  color: pledit.normal,
                  fontSize: "11px",
                  background: pledit.selectedBG,
                  padding: "1px 4px",
                  borderRadius: "2px",
                }}
              >
                03. Selected track
              </div>
            </div>
          </div>

          {/* Font name */}
          <div style={styles.fieldGroup}>
            <label style={styles.fieldLabel}>Font</label>
            <input
              type="text"
              value={pledit.font}
              onChange={(e) => handlePleditField("font", e.target.value)}
              style={styles.textInput}
              placeholder="Arial"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// -- Inline sub-component -----------------------------------------------------

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}): React.ReactElement {
  return (
    <div style={styles.colorFieldRow}>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={styles.colorInput}
      />
      <span style={styles.colorFieldLabel}>{label}</span>
      <span style={styles.colorHex}>{value.toUpperCase()}</span>
    </div>
  );
}

// Re-export defaults for use in App.tsx
export { DEFAULT_VISCOLORS, DEFAULT_PLEDIT };

// -- Styles -------------------------------------------------------------------

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    padding: "12px",
  },
  sectionTabs: {
    display: "flex",
    border: "1px solid var(--figma-color-border, #e5e5e5)",
    borderRadius: "6px",
    overflow: "hidden",
  },
  sectionTab: {
    flex: 1,
    padding: "6px 12px",
    border: "none",
    background: "var(--figma-color-bg, #fff)",
    color: "var(--figma-color-text-secondary, #999)",
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "0.5px",
    cursor: "pointer",
  },
  sectionTabActive: {
    background: "var(--figma-color-bg-brand, #0D99FF)",
    color: "#fff",
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
  },
  sectionTitle: {
    fontSize: "12px",
    fontWeight: 600,
    color: "var(--figma-color-text, #333)",
  },
  resetButton: {
    padding: "4px 8px",
    border: "1px solid var(--figma-color-border, #e5e5e5)",
    borderRadius: "4px",
    background: "var(--figma-color-bg, #fff)",
    color: "var(--figma-color-text-secondary, #999)",
    fontSize: "10px",
    cursor: "pointer",
  },
  colorGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    maxHeight: "300px",
    overflowY: "auto",
  },
  colorRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "3px 4px",
    borderRadius: "4px",
  },
  colorInput: {
    width: "24px",
    height: "24px",
    border: "1px solid var(--figma-color-border, #e5e5e5)",
    borderRadius: "4px",
    cursor: "pointer",
    padding: 0,
    background: "none",
  },
  colorInfo: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    minWidth: 0,
  },
  colorIndex: {
    fontSize: "9px",
    color: "var(--figma-color-text-tertiary, #bbb)",
    fontWeight: 600,
  },
  colorLabel: {
    fontSize: "11px",
    color: "var(--figma-color-text, #333)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  colorHex: {
    fontSize: "10px",
    fontFamily: "monospace",
    color: "var(--figma-color-text-secondary, #999)",
    flexShrink: 0,
  },
  pleditColors: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  colorFieldRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  colorFieldLabel: {
    flex: 1,
    fontSize: "12px",
    color: "var(--figma-color-text, #333)",
  },
  previewSection: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    marginTop: "4px",
  },
  previewLabel: {
    fontSize: "11px",
    fontWeight: 600,
    color: "var(--figma-color-text-secondary, #999)",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  previewBox: {
    padding: "8px",
    borderRadius: "4px",
    border: "1px solid var(--figma-color-border, #e5e5e5)",
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    fontFamily: "monospace",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    marginTop: "4px",
  },
  fieldLabel: {
    fontSize: "11px",
    fontWeight: 600,
    color: "var(--figma-color-text-secondary, #999)",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  textInput: {
    padding: "6px 10px",
    border: "1px solid var(--figma-color-border, #e5e5e5)",
    borderRadius: "6px",
    background: "var(--figma-color-bg, #fff)",
    color: "var(--figma-color-text, #333)",
    fontSize: "12px",
    outline: "none",
  },
};
