import { useState } from "react";
import { X } from "lucide-react";
import type { ClothingItem, Category } from "../types";
import { CATEGORIES, CATEGORY_LABELS } from "../types";

interface AddItemFormProps {
  onAdd: (item: ClothingItem) => void;
  onClose: () => void;
}

const EMPTY: Omit<ClothingItem, "id" | "isArchived" | "lastModified"> = {
  name: "",
  category: "shirts",
  brand: "",
  color: "",
  size: "",
  purchasePrice: 0,
  purchaseDate: new Date().toISOString().slice(0, 10),
  imageUrl: "",
  notes: "",
};

export default function AddItemForm({ onAdd, onClose }: AddItemFormProps) {
  const [form, setForm] = useState(EMPTY);
  const [priceInput, setPriceInput] = useState("0");
  const [errors, setErrors] = useState<Partial<Record<keyof typeof EMPTY, string>>>({});

  function set<K extends keyof typeof EMPTY>(key: K, value: typeof EMPTY[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate() {
    const e: Partial<Record<keyof typeof EMPTY, string>> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.brand.trim()) e.brand = "Brand is required";
    if (!form.color.trim()) e.color = "Color is required";
    if (!form.size.trim()) e.size = "Size is required";
    const parsedPrice = parseFloat(priceInput);
    if (isNaN(parsedPrice) || parsedPrice < 0) e.purchasePrice = "Price must be 0 or more";
    if (!form.purchaseDate) e.purchaseDate = "Date is required";
    return e;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    const now = new Date().toISOString();
    const item: ClothingItem = {
      ...form,
      purchasePrice: parseFloat(priceInput) || 0,
      id: crypto.randomUUID(),
      isArchived: false,
      lastModified: now,
      imageUrl: form.imageUrl?.trim() || undefined,
      notes: form.notes?.trim() || undefined,
    };
    onAdd(item);
    onClose();
  }

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">Add Item</span>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  className="form-input"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="e.g. White Nike Air Max"
                />
                {errors.name && <span className="form-error">{errors.name}</span>}
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={form.category}
                    onChange={(e) => set("category", e.target.value as Category)}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Brand</label>
                  <input
                    className="form-input"
                    value={form.brand}
                    onChange={(e) => set("brand", e.target.value)}
                    placeholder="e.g. Nike"
                  />
                  {errors.brand && <span className="form-error">{errors.brand}</span>}
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Color</label>
                  <input
                    className="form-input"
                    value={form.color}
                    onChange={(e) => set("color", e.target.value)}
                    placeholder="e.g. White"
                  />
                  {errors.color && <span className="form-error">{errors.color}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Size</label>
                  <input
                    className="form-input"
                    value={form.size}
                    onChange={(e) => set("size", e.target.value)}
                    placeholder="e.g. 10, M, 32x30"
                  />
                  {errors.size && <span className="form-error">{errors.size}</span>}
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Purchase Price ($)</label>
                  <input
                    className="form-input"
                    type="number"
                    min={0}
                    step={0.01}
                    value={priceInput}
                    onChange={(e) => {
                      setPriceInput(e.target.value);
                      setErrors((prev) => ({ ...prev, purchasePrice: undefined }));
                    }}
                  />
                  {errors.purchasePrice && <span className="form-error">{errors.purchasePrice}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Purchase Date</label>
                  <input
                    className="form-input"
                    type="date"
                    value={form.purchaseDate}
                    onChange={(e) => set("purchaseDate", e.target.value)}
                  />
                  {errors.purchaseDate && <span className="form-error">{errors.purchaseDate}</span>}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Image URL (optional)</label>
                <input
                  className="form-input"
                  value={form.imageUrl ?? ""}
                  onChange={(e) => set("imageUrl", e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Notes (optional)</label>
                <textarea
                  className="form-textarea"
                  value={form.notes ?? ""}
                  onChange={(e) => set("notes", e.target.value)}
                  placeholder="Any notes..."
                />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Add Item</button>
          </div>
        </form>
      </div>
    </div>
  );
}
