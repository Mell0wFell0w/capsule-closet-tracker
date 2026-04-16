import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import ClosetView from "./components/ClosetView";
import ReplacementsView from "./components/ReplacementsView";
import StatsView from "./components/StatsView";
import { useLocalStorage } from "./hooks/useLocalStorage";
import type { ClothingItem, Replacement } from "./types";

export default function App() {
  const [items, setItems] = useLocalStorage<ClothingItem[]>("capsule_closet_items", []);
  const [replacements, setReplacements] = useLocalStorage<Replacement[]>(
    "capsule_closet_replacements",
    []
  );

  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const stored = localStorage.getItem("capsule_closet_theme");
    if (stored === "dark" || stored === "light") return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("capsule_closet_theme", theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((t) => (t === "light" ? "dark" : "light"));
  }

  // Items CRUD
  function addItem(item: ClothingItem) {
    setItems((prev) => [...prev, item]);
  }

  function updateItem(updated: ClothingItem) {
    setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
  }

  function deleteItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
    setReplacements((prev) => prev.filter((r) => r.clothingItemId !== id));
  }

  // Replacements CRUD
  function addReplacement(r: Replacement) {
    setReplacements((prev) => [...prev, r]);
  }

  function updateReplacement(updated: Replacement) {
    setReplacements((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  }

  function deleteReplacement(id: string) {
    setReplacements((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <BrowserRouter>
      <div className="app-layout">
        <NavBar theme={theme} onToggleTheme={toggleTheme} />
        <main className="main-content">
          <Routes>
            <Route
              path="/"
              element={
                <ClosetView
                  items={items}
                  replacements={replacements}
                  onAddItem={addItem}
                  onUpdateItem={updateItem}
                  onDeleteItem={deleteItem}
                  onAddReplacement={addReplacement}
                />
              }
            />
            <Route
              path="/replacements"
              element={
                <ReplacementsView
                  items={items}
                  replacements={replacements}
                  onAddReplacement={addReplacement}
                  onUpdateReplacement={updateReplacement}
                  onDeleteReplacement={deleteReplacement}
                />
              }
            />
            <Route
              path="/stats"
              element={<StatsView items={items} replacements={replacements} />}
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
