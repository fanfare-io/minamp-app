import React, { useState, useEffect, useCallback } from "react";
import type { AssetEntry } from "../../shared/messages";

interface AssetsPanelProps {
  assets: AssetEntry[];
  onImport: (name: string, url: string, bytes: Uint8Array) => void;
  onDelete: (name: string) => void;
  onRefresh: () => void;
}

export function AssetsPanel({
  assets,
  onImport,
  onDelete,
  onRefresh,
}: AssetsPanelProps): React.ReactElement {
  const [url, setUrl] = useState("http://localhost:5173/api/image/");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-load existing assets when panel mounts
  useEffect(() => {
    onRefresh();
  }, [onRefresh]);

  const handleImport = useCallback(async () => {
    const trimmedUrl = url.trim();
    const trimmedName = name.trim();
    if (!trimmedUrl || !trimmedName) {
      setError("URL and name are both required.");
      return;
    }
    if (!/^[a-z0-9_-]+$/i.test(trimmedName)) {
      setError("Name must contain only letters, digits, underscores, dashes.");
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const response = await fetch(trimmedUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      onImport(trimmedName, trimmedUrl, bytes);
      setName("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown fetch error";
      setError(msg);
    } finally {
      setBusy(false);
    }
  }, [url, name, onImport]);

  const handleRefetch = useCallback(
    async (asset: AssetEntry) => {
      setBusy(true);
      setError(null);
      try {
        const response = await fetch(asset.url);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status} ${response.statusText}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        onImport(asset.name, asset.url, new Uint8Array(arrayBuffer));
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Unknown fetch error";
        setError(msg);
      } finally {
        setBusy(false);
      }
    },
    [onImport],
  );

  return (
    <div style={styles.container}>
      <div style={styles.fieldGroup}>
        <label style={styles.label}>Import Asset</label>
        <input
          style={styles.input}
          type="text"
          placeholder="URL (e.g. http://localhost:5173/api/image/...)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={busy}
        />
        <input
          style={styles.input}
          type="text"
          placeholder="Asset name (e.g. mission-patch, brushed-metal)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={busy}
        />
        <button
          style={{ ...styles.primaryButton, opacity: busy ? 0.6 : 1 }}
          onClick={handleImport}
          disabled={busy}
        >
          {busy ? "Importing…" : "Import"}
        </button>
        <p style={styles.helper}>
          Fetches the URL, creates a Figma image, stores its hash on the page
          under <code>asset:&lt;name&gt;</code>, and adds a thumbnail to the
          {" "}<strong>Imported Assets</strong> frame on this page (positioned
          off-canvas at x=-2400). Re-importing the same name replaces the hash.
        </p>
      </div>

      {error && <div style={styles.errorBanner}>{error}</div>}

      <div style={styles.divider} />

      <div style={styles.fieldGroup}>
        <div style={styles.listHeader}>
          <label style={styles.label}>
            Imported ({assets.length})
          </label>
          <button style={styles.linkButton} onClick={onRefresh} disabled={busy}>
            Refresh
          </button>
        </div>
        {assets.length === 0 && (
          <p style={styles.empty}>No assets imported yet.</p>
        )}
        {assets.map((asset) => (
          <div key={asset.name} style={styles.assetRow}>
            <div style={styles.assetInfo}>
              <div style={styles.assetName}>{asset.name}</div>
              <div style={styles.assetMeta}>
                {asset.width}×{asset.height} · hash {asset.hash.slice(0, 10)}…
              </div>
              <div style={styles.assetUrl}>{asset.url}</div>
            </div>
            <div style={styles.assetActions}>
              <button
                style={styles.smallButton}
                onClick={() => handleRefetch(asset)}
                disabled={busy}
                title="Re-fetch from URL"
              >
                ↻
              </button>
              <button
                style={styles.smallDangerButton}
                onClick={() => {
                  if (window.confirm(`Delete asset "${asset.name}"?`)) {
                    onDelete(asset.name);
                  }
                }}
                disabled={busy}
                title="Delete from manifest"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// -- Styles ----------------------------------------------------------------

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    padding: "12px",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "11px",
    fontWeight: 600,
    color: "var(--figma-color-text-secondary, #999)",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  input: {
    padding: "8px 10px",
    border: "1px solid var(--figma-color-border, #e5e5e5)",
    borderRadius: "6px",
    background: "var(--figma-color-bg, #fff)",
    color: "var(--figma-color-text, #333)",
    fontSize: "12px",
    outline: "none",
    fontFamily: "monospace",
  },
  primaryButton: {
    padding: "8px 12px",
    border: "none",
    borderRadius: "6px",
    background: "var(--figma-color-bg-brand, #0D99FF)",
    color: "#fff",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
  },
  helper: {
    fontSize: "11px",
    lineHeight: "16px",
    color: "var(--figma-color-text-secondary, #999)",
    margin: "2px 0 0 0",
  },
  divider: {
    height: "1px",
    background: "var(--figma-color-border, #e5e5e5)",
    margin: "4px 0",
  },
  listHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  linkButton: {
    background: "none",
    border: "none",
    color: "var(--figma-color-text-secondary, #999)",
    fontSize: "11px",
    cursor: "pointer",
    textDecoration: "underline",
  },
  empty: {
    fontSize: "12px",
    color: "var(--figma-color-text-secondary, #999)",
    fontStyle: "italic",
    margin: "8px 0",
  },
  assetRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
    padding: "8px",
    borderRadius: "6px",
    background: "var(--figma-color-bg-secondary, #f5f5f5)",
  },
  assetInfo: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    minWidth: 0,
  },
  assetName: {
    fontSize: "12px",
    fontWeight: 600,
    color: "var(--figma-color-text, #333)",
    fontFamily: "monospace",
  },
  assetMeta: {
    fontSize: "11px",
    color: "var(--figma-color-text-secondary, #999)",
  },
  assetUrl: {
    fontSize: "10px",
    color: "var(--figma-color-text-secondary, #999)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  assetActions: {
    display: "flex",
    gap: "4px",
  },
  smallButton: {
    width: "24px",
    height: "24px",
    padding: 0,
    border: "1px solid var(--figma-color-border, #e5e5e5)",
    borderRadius: "4px",
    background: "var(--figma-color-bg, #fff)",
    color: "var(--figma-color-text, #333)",
    fontSize: "14px",
    cursor: "pointer",
  },
  smallDangerButton: {
    width: "24px",
    height: "24px",
    padding: 0,
    border: "1px solid var(--figma-color-border-danger, #F24822)",
    borderRadius: "4px",
    background: "var(--figma-color-bg, #fff)",
    color: "var(--figma-color-text-danger, #F24822)",
    fontSize: "14px",
    cursor: "pointer",
  },
  errorBanner: {
    padding: "8px 12px",
    borderRadius: "6px",
    background: "var(--figma-color-bg-danger, #FFF0EE)",
    color: "var(--figma-color-text-danger, #F24822)",
    fontSize: "12px",
  },
};
