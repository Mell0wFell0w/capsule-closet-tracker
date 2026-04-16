import { useState } from "react";
import { Plus, RefreshCw, Trash2, ExternalLink, Link } from "lucide-react";
import type { Replacement, ClothingItem } from "../types";
import { CATEGORY_LABELS } from "../types";
import AddReplacementForm from "./AddReplacementForm";

interface ReplacementsViewProps {
  items: ClothingItem[];
  replacements: Replacement[];
  onAddReplacement: (r: Replacement) => void;
  onUpdateReplacement: (r: Replacement) => void;
  onDeleteReplacement: (id: string) => void;
}

function fmt(price: number) {
  return `$${price.toFixed(2)}`;
}

function fmtTimestamp(iso: string) {
  return new Date(iso).toLocaleString();
}

interface FetchError {
  id: string;
  message: string;
}

interface LinkState {
  replacementId: string;
  selectedItemId: string;
}

export default function ReplacementsView({
  items,
  replacements,
  onAddReplacement,
  onUpdateReplacement,
  onDeleteReplacement,
}: ReplacementsViewProps) {
  const [activeTab, setActiveTab] = useState<"linked" | "wishlist">("linked");
  const [fetchingId, setFetchingId] = useState<string | null>(null);
  const [fetchErrors, setFetchErrors] = useState<FetchError[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Replacement>>({});
  const [linkState, setLinkState] = useState<LinkState | null>(null);

  const itemMap = new Map(items.map((i) => [i.id, i]));
  const linkedReplacementItemIds = new Set(
    replacements.filter((r) => r.clothingItemId).map((r) => r.clothingItemId!)
  );

  const linked = replacements.filter((r) => r.clothingItemId);
  const wishlist = replacements.filter((r) => !r.clothingItemId);
  const displayed = activeTab === "linked" ? linked : wishlist;

  function getFetchError(id: string) {
    return fetchErrors.find((e) => e.id === id)?.message;
  }

  function clearFetchError(id: string) {
    setFetchErrors((prev) => prev.filter((e) => e.id !== id));
  }

  async function handleFetchPrice(r: Replacement) {
    setFetchingId(r.id);
    clearFetchError(r.id);
    try {
      const res = await fetch(`/api/fetch-price?query=${encodeURIComponent(r.searchQuery)}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
      }
      const results = await res.json() as Array<{ price?: number; extracted_price?: number; title?: string }>;
      const prices = results
        .map((item) => item.price ?? item.extracted_price)
        .filter((p): p is number => typeof p === "number" && p > 0);

      if (prices.length === 0) {
        throw new Error("No prices found for this query.");
      }

      const lowest = Math.min(...prices);
      onUpdateReplacement({
        ...r,
        fetchedPrice: lowest,
        lastPriceFetch: new Date().toISOString(),
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setFetchErrors((prev) => [...prev.filter((e) => e.id !== r.id), { id: r.id, message: msg }]);
    } finally {
      setFetchingId(null);
    }
  }

  function startEdit(r: Replacement) {
    setEditingId(r.id);
    setEditForm({
      name: r.name,
      brand: r.brand,
      estimatedPrice: r.estimatedPrice,
      searchQuery: r.searchQuery,
      productUrl: r.productUrl,
    });
  }

  function saveEdit(r: Replacement) {
    onUpdateReplacement({ ...r, ...editForm });
    setEditingId(null);
    setEditForm({});
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm({});
  }

  function handleLinkToItem(r: Replacement) {
    setLinkState({ replacementId: r.id, selectedItemId: "" });
  }

  function confirmLink() {
    if (!linkState || !linkState.selectedItemId) return;
    const r = replacements.find((x) => x.id === linkState.replacementId);
    if (!r) return;
    const parentItem = itemMap.get(linkState.selectedItemId);
    onUpdateReplacement({
      ...r,
      clothingItemId: linkState.selectedItemId,
      category: parentItem ? parentItem.category : r.category,
    });
    setLinkState(null);
  }

  // Items that don't already have a linked replacement (for Link picker)
  const unlinkableItems = items.filter(
    (i) => !i.isArchived && !linkedReplacementItemIds.has(i.id)
  );

  const existingReplacementItemIds = Array.from(linkedReplacementItemIds);

  return (
    <>
      <div className="page-toolbar">
        <span className="page-title">Replacements</span>
        <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>
          <Plus size={15} /> Quick Add
        </button>
      </div>

      <div className="tabs">
        <button
          className={`tab-btn${activeTab === "linked" ? " active" : ""}`}
          onClick={() => setActiveTab("linked")}
        >
          Linked ({linked.length})
        </button>
        <button
          className={`tab-btn${activeTab === "wishlist" ? " active" : ""}`}
          onClick={() => setActiveTab("wishlist")}
        >
          Wishlist ({wishlist.length})
        </button>
      </div>

      {displayed.length === 0 ? (
        <div className="empty-state">
          <RefreshCw size={32} className="empty-state-icon" />
          <p className="empty-state-text">
            {activeTab === "linked"
              ? "No linked replacements yet. Add a replacement tied to an item in your closet."
              : "No wishlist items yet. Add standalone replacements for things you want to buy."}
          </p>
          <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>
            <Plus size={15} /> Add Replacement
          </button>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Brand</th>
                <th>Category</th>
                {activeTab === "linked" && <th>Replacing</th>}
                <th>Price</th>
                <th>Search Query</th>
                <th style={{ width: 120 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map((r) => {
                const parentItem = r.clothingItemId ? itemMap.get(r.clothingItemId) : undefined;
                const isEditing = editingId === r.id;
                const isFetching = fetchingId === r.id;
                const fetchError = getFetchError(r.id);

                return (
                  <tr key={r.id} onClick={() => !isEditing && startEdit(r)}>
                    <td>
                      {isEditing ? (
                        <input
                          className="form-input"
                          value={editForm.name ?? ""}
                          onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <span style={{ fontWeight: 500 }}>{r.name}</span>
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <input
                          className="form-input"
                          value={editForm.brand ?? ""}
                          onChange={(e) => setEditForm((p) => ({ ...p, brand: e.target.value }))}
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : r.brand}
                    </td>
                    <td>
                      <span className="badge badge-default">{CATEGORY_LABELS[r.category]}</span>
                    </td>
                    {activeTab === "linked" && (
                      <td style={{ fontSize: 13, color: "var(--text-muted)" }}>
                        {parentItem ? parentItem.name : <span style={{ color: "var(--text-subtle)" }}>—</span>}
                      </td>
                    )}
                    <td onClick={(e) => e.stopPropagation()}>
                      {isEditing ? (
                        <input
                          className="form-input"
                          type="number"
                          min={0}
                          step={0.01}
                          value={editForm.estimatedPrice ?? ""}
                          onChange={(e) => setEditForm((p) => ({ ...p, estimatedPrice: parseFloat(e.target.value) || undefined }))}
                          placeholder="Estimated…"
                        />
                      ) : (
                        <div className="price-cell">
                          {r.fetchedPrice != null ? (
                            <span className="price-fetched">{fmt(r.fetchedPrice)}</span>
                          ) : r.estimatedPrice != null ? (
                            <span className="price-estimated">{fmt(r.estimatedPrice)} est.</span>
                          ) : (
                            <span style={{ color: "var(--text-subtle)" }}>—</span>
                          )}
                          {r.lastPriceFetch && (
                            <span className="price-timestamp">Fetched {fmtTimestamp(r.lastPriceFetch)}</span>
                          )}
                          {fetchError && (
                            <span className="fetch-error">{fetchError}</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <input
                          className="form-input"
                          value={editForm.searchQuery ?? ""}
                          onChange={(e) => setEditForm((p) => ({ ...p, searchQuery: e.target.value }))}
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{r.searchQuery}</span>
                      )}
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="row-actions" style={{ opacity: 1 }}>
                        {isEditing ? (
                          <>
                            <button className="btn btn-primary btn-sm" onClick={() => saveEdit(r)}>Save</button>
                            <button className="btn btn-ghost btn-sm" onClick={cancelEdit}>Cancel</button>
                          </>
                        ) : (
                          <>
                            <button
                              className="btn btn-secondary btn-sm"
                              disabled={isFetching}
                              onClick={() => handleFetchPrice(r)}
                              title="Fetch price from Google Shopping"
                            >
                              {isFetching ? <span className="spinner" /> : <RefreshCw size={13} />}
                            </button>
                            {r.productUrl && (
                              <a
                                href={r.productUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="btn btn-ghost btn-sm btn-icon"
                                title="View product"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ExternalLink size={13} />
                              </a>
                            )}
                            {activeTab === "wishlist" && (
                              <button
                                className="btn btn-ghost btn-sm btn-icon"
                                title="Link to item"
                                onClick={() => handleLinkToItem(r)}
                              >
                                <Link size={13} />
                              </button>
                            )}
                            <button
                              className="btn btn-ghost btn-sm btn-icon"
                              style={{ color: "var(--danger)" }}
                              title="Delete replacement"
                              onClick={() => onDeleteReplacement(r.id)}
                            >
                              <Trash2 size={13} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {linkState && (
        <div className="modal-backdrop" onClick={() => setLinkState(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Link to Item</span>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Select item to link</label>
                {unlinkableItems.length === 0 ? (
                  <p style={{ fontSize: 14, color: "var(--text-muted)" }}>
                    All items already have a linked replacement.
                  </p>
                ) : (
                  <select
                    className="form-select"
                    value={linkState.selectedItemId}
                    onChange={(e) => setLinkState((s) => s ? { ...s, selectedItemId: e.target.value } : null)}
                  >
                    <option value="">Select an item…</option>
                    {unlinkableItems.map((i) => (
                      <option key={i.id} value={i.id}>{i.name} — {i.brand}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setLinkState(null)}>Cancel</button>
              <button
                className="btn btn-primary"
                disabled={!linkState.selectedItemId}
                onClick={confirmLink}
              >
                Link
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddForm && (
        <AddReplacementForm
          items={items}
          existingReplacementItemIds={existingReplacementItemIds}
          onAdd={onAddReplacement}
          onClose={() => setShowAddForm(false)}
        />
      )}
    </>
  );
}
