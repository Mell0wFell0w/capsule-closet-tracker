import { useState } from "react";
import { X } from "lucide-react";
import type { Replacement, Category, ClothingItem } from "../types";
import { CATEGORIES, CATEGORY_LABELS } from "../types";

interface AddReplacementFormProps {
  items: ClothingItem[];
  existingReplacementItemIds: string[];
  defaultItemId?: string;
  onAdd: (r: Replacement) => void;
  onClose: () => void;
}

export default function AddReplacementForm({
  items,
  existingReplacementItemIds,
  defaultItemId,
  onAdd,
  onClose,
}: AddReplacementFormProps) {
  const [mode, setMode] = useState<"linked" | "wishlist">(defaultItemId ? "linked" : "linked");
  const [selectedItemId, setSelectedItemId] = useState(defaultItemId ?? "");
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState<Category>("shirts");
  const [estimatedPrice, setEstimatedPrice] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const availableItems = items.filter(
    (i) => !i.isArchived && !existingReplacementItemIds.includes(i.id)
  );

  // If defaultItemId provided, force linked mode
  const forcedLinked = Boolean(defaultItemId);

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Name is required";
    if (!brand.trim()) e.brand = "Brand is required";
    if (!searchQuery.trim()) e.searchQuery = "Search query is required";
    if (mode === "linked" && !selectedItemId) e.selectedItemId = "Select an item";
    return e;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    let resolvedCategory: Category = category;
    if (mode === "linked" && selectedItemId) {
      const parent = items.find((i) => i.id === selectedItemId);
      if (parent) resolvedCategory = parent.category;
    }

    const r: Replacement = {
      id: crypto.randomUUID(),
      clothingItemId: mode === "linked" ? selectedItemId || undefined : undefined,
      name: name.trim(),
      brand: brand.trim(),
      category: resolvedCategory,
      estimatedPrice: estimatedPrice ? parseFloat(estimatedPrice) : undefined,
      searchQuery: searchQuery.trim(),
    };
    onAdd(r);
    onClose();
  }

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">Add Replacement</span>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {!forcedLinked && (
              <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                <button
                  type="button"
                  className={`btn btn-sm ${mode === "linked" ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => setMode("linked")}
                >
                  Replace an item
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${mode === "wishlist" ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => setMode("wishlist")}
                >
                  Add to wishlist
                </button>
              </div>
            )}

            <div className="form-row">
              {mode === "linked" ? (
                <div className="form-group">
                  <label className="form-label">Item to Replace</label>
                  {forcedLinked ? (
                    <input
                      className="form-input"
                      value={items.find((i) => i.id === defaultItemId)?.name ?? ""}
                      disabled
                    />
                  ) : (
                    <select
                      className="form-select"
                      value={selectedItemId}
                      onChange={(e) => {
                        setSelectedItemId(e.target.value);
                        setErrors((prev) => ({ ...prev, selectedItemId: "" }));
                      }}
                    >
                      <option value="">Select an item…</option>
                      {availableItems.map((i) => (
                        <option key={i.id} value={i.id}>{i.name} — {i.brand}</option>
                      ))}
                    </select>
                  )}
                  {errors.selectedItemId && <span className="form-error">{errors.selectedItemId}</span>}
                </div>
              ) : (
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  className="form-input"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: "" })); }}
                  placeholder="e.g. New Balance 990v5"
                />
                {errors.name && <span className="form-error">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Brand</label>
                <input
                  className="form-input"
                  value={brand}
                  onChange={(e) => { setBrand(e.target.value); setErrors((p) => ({ ...p, brand: "" })); }}
                  placeholder="e.g. New Balance"
                />
                {errors.brand && <span className="form-error">{errors.brand}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Estimated Price ($, optional)</label>
                <input
                  className="form-input"
                  type="number"
                  min={0}
                  step={0.01}
                  value={estimatedPrice}
                  onChange={(e) => setEstimatedPrice(e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Search Query</label>
                <input
                  className="form-input"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setErrors((p) => ({ ...p, searchQuery: "" })); }}
                  placeholder="e.g. New Balance 990v5 men's"
                />
                {errors.searchQuery && <span className="form-error">{errors.searchQuery}</span>}
                <span style={{ fontSize: 12, color: "var(--text-subtle)" }}>Used to fetch live prices from Google Shopping.</span>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Add Replacement</button>
          </div>
        </form>
      </div>
    </div>
  );
}
