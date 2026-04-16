import { useState } from "react";
import { Plus, Shirt, Upload } from "lucide-react";
import type { ClothingItem, Category, Replacement } from "../types";
import { CATEGORIES, CATEGORY_LABELS } from "../types";
import { filterItems } from "../utils/filters";
import AddItemForm from "./AddItemForm";
import ItemDetailModal from "./ItemDetailModal";
import CsvImportModal from "./CsvImportModal";

interface ClosetViewProps {
  items: ClothingItem[];
  replacements: Replacement[];
  onAddItem: (item: ClothingItem) => void;
  onUpdateItem: (item: ClothingItem) => void;
  onDeleteItem: (id: string) => void;
  onAddReplacement: (r: Replacement) => void;
}

function fmt(price: number) {
  return `$${price.toFixed(2)}`;
}

function fmtDate(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString();
}

export default function ClosetView({
  items,
  replacements,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onAddReplacement,
}: ClosetViewProps) {
  const [activeFilter, setActiveFilter] = useState<Category | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCsvImport, setShowCsvImport] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ClothingItem | null>(null);

  const visible = items.filter((i) => showArchived || !i.isArchived);
  const filtered = filterItems(visible, activeFilter, searchTerm);

  const replacementMap = new Map(replacements.map((r) => [r.clothingItemId, r]));

  return (
    <>
      <div className="page-toolbar">
        <span className="page-title">Closet</span>
        <div className="filter-bar">
          <input
            className="form-input search-input"
            placeholder="Search name or brand…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="form-select"
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value as Category | "all")}
            style={{ width: "auto" }}
          >
            <option value="all">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
            ))}
          </select>
          <label className="archive-toggle-row">
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
            />
            Show archived
          </label>
        </div>
        <button className="btn btn-secondary" onClick={() => setShowCsvImport(true)}>
          <Upload size={15} /> Import CSV
        </button>
        <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>
          <Plus size={15} /> Add Item
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <Shirt size={32} className="empty-state-icon" />
          <p className="empty-state-text">
            {items.length === 0
              ? "No items yet. Add your first item to get started."
              : "No items match your filters."}
          </p>
          {items.length === 0 && (
            <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>
              <Plus size={15} /> Add Item
            </button>
          )}
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th style={{ width: 36 }}></th>
                <th>Name</th>
                <th>Category</th>
                <th>Brand</th>
                <th>Size</th>
                <th>Color</th>
                <th>Price</th>
                <th>Purchased</th>
                <th>Replacement</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const repl = replacementMap.get(item.id);
                return (
                  <tr
                    key={item.id}
                    className={item.isArchived ? "archived-row" : ""}
                    onClick={() => setSelectedItem(item)}
                  >
                    <td onClick={(e) => e.stopPropagation()}>
                      {item.imageUrl ? (
                        <img
                          className="item-thumb"
                          src={item.imageUrl}
                          alt={item.name}
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="item-thumb-placeholder">
                          <Shirt size={14} />
                        </div>
                      )}
                    </td>
                    <td style={{ fontWeight: 500 }}>{item.name}</td>
                    <td>{CATEGORY_LABELS[item.category]}</td>
                    <td>{item.brand}</td>
                    <td>{item.size}</td>
                    <td>{item.color}</td>
                    <td style={{ fontVariantNumeric: "tabular-nums" }}>{fmt(item.purchasePrice)}</td>
                    <td>{fmtDate(item.purchaseDate)}</td>
                    <td>
                      {repl ? (
                        <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{repl.name}</span>
                      ) : (
                        <span style={{ fontSize: 13, color: "var(--text-subtle)" }}>—</span>
                      )}
                    </td>
                    <td>
                      {item.isArchived ? (
                        <span className="badge badge-archived">Archived</span>
                      ) : (
                        <span className="badge badge-success">Active</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showAddForm && (
        <AddItemForm onAdd={onAddItem} onClose={() => setShowAddForm(false)} />
      )}

      {showCsvImport && (
        <CsvImportModal
          onImport={(newItems) => {
            for (const item of newItems) onAddItem(item);
          }}
          onClose={() => setShowCsvImport(false)}
        />
      )}

      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          replacement={replacementMap.get(selectedItem.id)}
          onUpdate={(updated) => {
            onUpdateItem(updated);
            setSelectedItem(updated);
          }}
          onDelete={(id) => {
            onDeleteItem(id);
            setSelectedItem(null);
          }}
          onAddReplacement={onAddReplacement}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </>
  );
}
