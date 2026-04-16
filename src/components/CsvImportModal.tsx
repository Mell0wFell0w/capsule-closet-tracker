import { useRef, useState } from "react";
import { X, Upload, AlertTriangle, CheckCircle2, FileText } from "lucide-react";
import type { ClothingItem } from "../types";
import { buildImportPreview, type ImportPreview } from "../utils/csvImport";
import { CATEGORY_LABELS } from "../types";

interface CsvImportModalProps {
  onImport: (items: ClothingItem[]) => void;
  onClose: () => void;
}

type Step = "pick" | "preview" | "done";

const FIELD_LABELS: Record<string, string> = {
  name: "Name",
  category: "Category",
  brand: "Brand",
  color: "Color",
  size: "Size",
  purchasePrice: "Purchase Price",
  purchaseDate: "Purchase Date",
  imageUrl: "Image URL",
  notes: "Notes",
};

export default function CsvImportModal({ onImport, onClose }: CsvImportModalProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>("pick");
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [fileName, setFileName] = useState("");
  const [importedCount, setImportedCount] = useState(0);
  const [error, setError] = useState("");

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setError("");

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      try {
        const result = buildImportPreview(text);
        if (result.rows.length === 0 && result.skippedRows.length === 0) {
          setError("No data rows found. Make sure the file has a header row and at least one data row.");
          return;
        }
        setPreview(result);
        setStep("preview");
      } catch {
        setError("Could not parse the file. Make sure it is a valid CSV.");
      }
    };
    reader.readAsText(file);
  }

  function handleImport() {
    if (!preview) return;
    const items = preview.rows.map((r) => r.item);
    onImport(items);
    setImportedCount(items.length);
    setStep("done");
  }

  const totalWarnings = preview?.rows.reduce((n, r) => n + r.warnings.length, 0) ?? 0;
  const rowsWithWarnings = preview?.rows.filter((r) => r.warnings.length > 0) ?? [];

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-lg">
        <div className="modal-header">
          <span className="modal-title">Import from CSV</span>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* ── Step 1: File picker ── */}
        {step === "pick" && (
          <>
            <div className="modal-body">
              <input
                ref={fileRef}
                type="file"
                accept=".csv,text/csv"
                style={{ display: "none" }}
                onChange={handleFile}
              />

              <div
                style={{
                  border: "1px dashed var(--border-strong)",
                  borderRadius: "var(--radius-md)",
                  padding: "32px 24px",
                  textAlign: "center",
                  cursor: "pointer",
                }}
                onClick={() => fileRef.current?.click()}
              >
                <Upload size={24} style={{ margin: "0 auto 8px", color: "var(--text-subtle)" }} />
                <div style={{ fontSize: 14, color: "var(--text-muted)" }}>
                  Click to select a CSV file
                </div>
                {fileName && (
                  <div style={{ fontSize: 13, color: "var(--text)", marginTop: 6, display: "flex", alignItems: "center", gap: 4, justifyContent: "center" }}>
                    <FileText size={13} /> {fileName}
                  </div>
                )}
              </div>

              {error && (
                <div style={{ display: "flex", gap: 6, color: "var(--danger)", fontSize: 13 }}>
                  <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                  {error}
                </div>
              )}

              <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>
                <div style={{ fontWeight: 500, marginBottom: 4 }}>Recognized column names</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 12px" }}>
                  {[
                    "name / item",
                    "category / type",
                    "brand / manufacturer",
                    "color / colour",
                    "size",
                    "price / cost / purchase price",
                    "date / purchase date",
                    "image / image url",
                    "notes / description",
                  ].map((h) => (
                    <span key={h} style={{ fontSize: 12, color: "var(--text-subtle)" }}>{h}</span>
                  ))}
                </div>
                <div style={{ marginTop: 8, color: "var(--text-subtle)", fontSize: 12 }}>
                  Missing fields will be filled with defaults. Rows without a name are skipped.
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            </div>
          </>
        )}

        {/* ── Step 2: Preview ── */}
        {step === "preview" && preview && (
          <>
            <div className="modal-body">
              {/* Summary row */}
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <div className="stat-card" style={{ flex: 1, minWidth: 120 }}>
                  <div className="stat-label">Items to import</div>
                  <div className="stat-value" style={{ fontSize: 18 }}>{preview.rows.length}</div>
                </div>
                {preview.skippedRows.length > 0 && (
                  <div className="stat-card" style={{ flex: 1, minWidth: 120 }}>
                    <div className="stat-label">Rows skipped</div>
                    <div className="stat-value" style={{ fontSize: 18, color: "var(--warning)" }}>
                      {preview.skippedRows.length}
                    </div>
                    <div className="stat-sub">no name found</div>
                  </div>
                )}
                {totalWarnings > 0 && (
                  <div className="stat-card" style={{ flex: 1, minWidth: 120 }}>
                    <div className="stat-label">Defaults applied</div>
                    <div className="stat-value" style={{ fontSize: 18, color: "var(--warning)" }}>
                      {rowsWithWarnings.length}
                    </div>
                    <div className="stat-sub">rows with missing fields</div>
                  </div>
                )}
              </div>

              {/* Column mapping */}
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-muted)", marginBottom: 8 }}>
                  Column mapping
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px" }}>
                  {Object.entries(preview.columnMap).map(([field, header]) => (
                    <div key={field} style={{ fontSize: 13, display: "flex", gap: 4, alignItems: "center" }}>
                      <span style={{ color: "var(--text-subtle)" }}>{header}</span>
                      <span style={{ color: "var(--text-subtle)" }}>→</span>
                      <span style={{ color: "var(--text)", fontWeight: 500 }}>{FIELD_LABELS[field] ?? field}</span>
                    </div>
                  ))}
                  {preview.unmappedHeaders.map((h) => (
                    <div key={h} style={{ fontSize: 13, display: "flex", gap: 4, alignItems: "center" }}>
                      <span style={{ color: "var(--text-subtle)" }}>{h}</span>
                      <span style={{ color: "var(--text-subtle)" }}>→</span>
                      <span style={{ color: "var(--text-subtle)", fontStyle: "italic" }}>ignored</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Per-row warnings */}
              {rowsWithWarnings.length > 0 && (
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-muted)", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                    <AlertTriangle size={13} style={{ color: "var(--warning)" }} />
                    Rows with defaults applied
                  </div>
                  <div
                    style={{
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius)",
                      maxHeight: 180,
                      overflowY: "auto",
                    }}
                  >
                    {rowsWithWarnings.map((r) => (
                      <div
                        key={r.rowNumber}
                        style={{
                          padding: "8px 12px",
                          borderBottom: "1px solid var(--border)",
                          fontSize: 13,
                        }}
                      >
                        <div style={{ fontWeight: 500, marginBottom: 2 }}>
                          Row {r.rowNumber} — {r.item.name}
                        </div>
                        {r.warnings.map((w, i) => (
                          <div key={i} style={{ color: "var(--text-muted)" }}>{w}</div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sample of first 5 items */}
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-muted)", marginBottom: 8 }}>
                  Preview (first {Math.min(5, preview.rows.length)} items)
                </div>
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Brand</th>
                        <th>Size</th>
                        <th>Price</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.rows.slice(0, 5).map((r) => (
                        <tr key={r.item.id} onClick={undefined} style={{ cursor: "default" }}>
                          <td style={{ fontWeight: 500 }}>{r.item.name}</td>
                          <td>{CATEGORY_LABELS[r.item.category]}</td>
                          <td>{r.item.brand || <span style={{ color: "var(--text-subtle)" }}>—</span>}</td>
                          <td>{r.item.size || <span style={{ color: "var(--text-subtle)" }}>—</span>}</td>
                          <td>${r.item.purchasePrice.toFixed(2)}</td>
                          <td>{r.item.purchaseDate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {preview.rows.length > 5 && (
                  <div style={{ fontSize: 12, color: "var(--text-subtle)", marginTop: 6 }}>
                    + {preview.rows.length - 5} more
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost btn-sm" onClick={() => { setStep("pick"); setPreview(null); }}>
                Back
              </button>
              <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button className="btn btn-primary" onClick={handleImport} disabled={preview.rows.length === 0}>
                Import {preview.rows.length} item{preview.rows.length !== 1 ? "s" : ""}
              </button>
            </div>
          </>
        )}

        {/* ── Step 3: Done ── */}
        {step === "done" && (
          <>
            <div className="modal-body" style={{ alignItems: "center", textAlign: "center", padding: "32px 24px" }}>
              <CheckCircle2 size={32} style={{ color: "var(--success)", margin: "0 auto 12px" }} />
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>
                {importedCount} item{importedCount !== 1 ? "s" : ""} imported
              </div>
              <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                They've been added to your closet.
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={onClose}>Done</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
