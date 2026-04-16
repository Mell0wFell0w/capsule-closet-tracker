import { useState } from "react";
import { X, Edit2, Archive, ArchiveRestore, Trash2, Check } from "lucide-react";
import type { ClothingItem, Category, Replacement } from "../types";
import { CATEGORIES, CATEGORY_LABELS } from "../types";
import AddReplacementForm from "./AddReplacementForm";

interface ItemDetailModalProps {
  item: ClothingItem;
  replacement: Replacement | undefined;
  onUpdate: (item: ClothingItem) => void;
  onDelete: (id: string) => void;
  onAddReplacement: (r: Replacement) => void;
  onClose: () => void;
}

function fmt(price: number) {
  return `$${price.toFixed(2)}`;
}

function fmtDate(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString();
}

export default function ItemDetailModal({
  item,
  replacement,
  onUpdate,
  onDelete,
  onAddReplacement,
  onClose,
}: ItemDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ClothingItem>({ ...item });
  const [priceInput, setPriceInput] = useState(String(item.purchasePrice));
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showAddReplacement, setShowAddReplacement] = useState(false);

  function setField<K extends keyof ClothingItem>(key: K, value: ClothingItem[K]) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    onUpdate({
      ...formData,
      purchasePrice: parseFloat(priceInput) || 0,
      lastModified: new Date().toISOString(),
    });
    setIsEditing(false);
  }

  function handleCancelEdit() {
    setFormData({ ...item });
    setPriceInput(String(item.purchasePrice));
    setIsEditing(false);
  }

  function handleArchive() {
    onUpdate({
      ...item,
      isArchived: true,
      archivedDate: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    });
    onClose();
  }

  function handleUnarchive() {
    onUpdate({
      ...item,
      isArchived: false,
      archivedDate: undefined,
      lastModified: new Date().toISOString(),
    });
    onClose();
  }

  function handleDelete() {
    onDelete(item.id);
    onClose();
  }

  if (showAddReplacement) {
    return (
      <AddReplacementForm
        items={[item]}
        existingReplacementItemIds={replacement ? [item.id] : []}
        defaultItemId={item.id}
        onAdd={(r) => {
          onAddReplacement(r);
          setShowAddReplacement(false);
        }}
        onClose={() => setShowAddReplacement(false)}
      />
    );
  }

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-lg">
        <div className="modal-header">
          <span className="modal-title">
            {isEditing ? "Edit Item" : item.name}
          </span>
          <div style={{ display: "flex", gap: 4 }}>
            {!isEditing && (
              <button className="btn btn-ghost btn-icon" onClick={() => setIsEditing(true)} title="Edit">
                <Edit2 size={15} />
              </button>
            )}
            <button className="btn btn-ghost btn-icon" onClick={onClose}>
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="modal-body">
          {isEditing ? (
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Name</label>
                <input className="form-input" value={formData.name} onChange={(e) => setField("name", e.target.value)} />
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-select" value={formData.category} onChange={(e) => setField("category", e.target.value as Category)}>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Brand</label>
                  <input className="form-input" value={formData.brand} onChange={(e) => setField("brand", e.target.value)} />
                </div>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Color</label>
                  <input className="form-input" value={formData.color} onChange={(e) => setField("color", e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Size</label>
                  <input className="form-input" value={formData.size} onChange={(e) => setField("size", e.target.value)} />
                </div>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Purchase Price ($)</label>
                  <input className="form-input" type="number" min={0} step={0.01}
                    value={priceInput}
                    onChange={(e) => setPriceInput(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Purchase Date</label>
                  <input className="form-input" type="date" value={formData.purchaseDate}
                    onChange={(e) => setField("purchaseDate", e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Image URL (optional)</label>
                <input className="form-input" value={formData.imageUrl ?? ""}
                  onChange={(e) => setField("imageUrl", e.target.value || undefined)} />
              </div>
              <div className="form-group">
                <label className="form-label">Notes (optional)</label>
                <textarea className="form-textarea" value={formData.notes ?? ""}
                  onChange={(e) => setField("notes", e.target.value || undefined)} />
              </div>
            </div>
          ) : (
            <>
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  style={{ width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                />
              )}
              <div className="detail-grid">
                <div className="detail-field">
                  <span className="detail-label">Category</span>
                  <span className="detail-value">{CATEGORY_LABELS[item.category]}</span>
                </div>
                <div className="detail-field">
                  <span className="detail-label">Brand</span>
                  <span className="detail-value">{item.brand}</span>
                </div>
                <div className="detail-field">
                  <span className="detail-label">Color</span>
                  <span className="detail-value">{item.color}</span>
                </div>
                <div className="detail-field">
                  <span className="detail-label">Size</span>
                  <span className="detail-value">{item.size}</span>
                </div>
                <div className="detail-field">
                  <span className="detail-label">Purchase Price</span>
                  <span className="detail-value">{fmt(item.purchasePrice)}</span>
                </div>
                <div className="detail-field">
                  <span className="detail-label">Purchase Date</span>
                  <span className="detail-value">{fmtDate(item.purchaseDate)}</span>
                </div>
                {item.isArchived && (
                  <div className="detail-field">
                    <span className="detail-label">Archived</span>
                    <span className="detail-value">{item.archivedDate ? fmtDate(item.archivedDate) : "Yes"}</span>
                  </div>
                )}
                <div className="detail-field">
                  <span className="detail-label">Last Modified</span>
                  <span className="detail-value">{fmtDate(item.lastModified)}</span>
                </div>
              </div>
              {item.notes && (
                <div className="detail-field">
                  <span className="detail-label">Notes</span>
                  <span className="detail-value" style={{ whiteSpace: "pre-wrap" }}>{item.notes}</span>
                </div>
              )}
              {replacement ? (
                <div className="card" style={{ background: "var(--surface-2)" }}>
                  <div className="detail-label" style={{ marginBottom: 6 }}>Replacement</div>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{replacement.name}</div>
                  <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{replacement.brand}</div>
                  {(replacement.fetchedPrice != null || replacement.estimatedPrice != null) && (
                    <div style={{ fontSize: 13, marginTop: 4 }}>
                      {replacement.fetchedPrice != null
                        ? <span style={{ color: "var(--success)", fontWeight: 600 }}>{fmt(replacement.fetchedPrice)} (fetched)</span>
                        : <span style={{ color: "var(--text-muted)" }}>{fmt(replacement.estimatedPrice!)} (est.)</span>}
                    </div>
                  )}
                </div>
              ) : (
                <button className="btn btn-secondary btn-sm" onClick={() => setShowAddReplacement(true)}>
                  Add Replacement
                </button>
              )}
            </>
          )}

          {confirmDelete && (
            <div className="card" style={{ border: "1px solid var(--danger)" }}>
              <p className="confirm-text">
                Delete <strong>{item.name}</strong>? This will also remove any linked replacement. This cannot be undone.
              </p>
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <button className="btn btn-danger btn-sm" onClick={handleDelete}>
                  <Check size={14} /> Confirm Delete
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => setConfirmDelete(false)}>Cancel</button>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          {!isEditing && (
            <>
              {!confirmDelete && (
                <button className="btn btn-ghost btn-sm" style={{ color: "var(--danger)", marginRight: "auto" }}
                  onClick={() => setConfirmDelete(true)}>
                  <Trash2 size={14} /> Delete
                </button>
              )}
              {item.isArchived ? (
                <button className="btn btn-secondary btn-sm" onClick={handleUnarchive}>
                  <ArchiveRestore size={14} /> Unarchive
                </button>
              ) : (
                <button className="btn btn-secondary btn-sm" onClick={handleArchive}>
                  <Archive size={14} /> Archive
                </button>
              )}
              <button className="btn btn-secondary btn-sm" onClick={onClose}>Close</button>
            </>
          )}
          {isEditing && (
            <>
              <button className="btn btn-secondary btn-sm" onClick={handleCancelEdit}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={handleSave}>Save</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
