import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ClosetView from "../components/ClosetView";
import type { ClothingItem, Replacement } from "../types";

const makeItem = (overrides: Partial<ClothingItem>): ClothingItem => ({
  id: crypto.randomUUID(),
  name: "Test Shirt",
  category: "shirts",
  brand: "Acme",
  color: "Blue",
  size: "M",
  purchasePrice: 30,
  purchaseDate: "2024-01-01",
  isArchived: false,
  lastModified: new Date().toISOString(),
  ...overrides,
});

const items: ClothingItem[] = [
  makeItem({ id: "1", name: "White Tee", category: "shirts", brand: "Nike" }),
  makeItem({ id: "2", name: "Blue Jeans", category: "pants", brand: "Levi's" }),
  makeItem({ id: "3", name: "Running Shoes", category: "shoes", brand: "Nike" }),
];

const noop = () => {};
const replacements: Replacement[] = [];

function renderCloset(props?: Partial<Parameters<typeof ClosetView>[0]>) {
  return render(
    <MemoryRouter>
      <ClosetView
        items={items}
        replacements={replacements}
        onAddItem={noop}
        onUpdateItem={noop}
        onDeleteItem={noop}
        onAddReplacement={noop}
        {...props}
      />
    </MemoryRouter>
  );
}

describe("ClosetView", () => {
  it("renders all active items", () => {
    renderCloset();
    expect(screen.getByText("White Tee")).toBeInTheDocument();
    expect(screen.getByText("Blue Jeans")).toBeInTheDocument();
    expect(screen.getByText("Running Shoes")).toBeInTheDocument();
  });

  it("filters by category dropdown", () => {
    renderCloset();
    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "shoes" } });
    expect(screen.getByText("Running Shoes")).toBeInTheDocument();
    expect(screen.queryByText("White Tee")).not.toBeInTheDocument();
  });

  it("filters by search term", () => {
    renderCloset();
    const search = screen.getByPlaceholderText(/search/i);
    fireEvent.change(search, { target: { value: "jeans" } });
    expect(screen.getByText("Blue Jeans")).toBeInTheDocument();
    expect(screen.queryByText("White Tee")).not.toBeInTheDocument();
  });

  it("shows empty state when no items", () => {
    renderCloset({ items: [] });
    expect(screen.getByText(/no items yet/i)).toBeInTheDocument();
  });

  it("hides archived items by default", () => {
    const withArchived = [
      ...items,
      makeItem({ id: "4", name: "Old Jacket", category: "jackets", isArchived: true }),
    ];
    renderCloset({ items: withArchived });
    expect(screen.queryByText("Old Jacket")).not.toBeInTheDocument();
  });

  it("shows archived items when toggle is checked", () => {
    const withArchived = [
      ...items,
      makeItem({ id: "4", name: "Old Jacket", category: "jackets", isArchived: true }),
    ];
    renderCloset({ items: withArchived });
    const toggle = screen.getByRole("checkbox", { name: /show archived/i });
    fireEvent.click(toggle);
    expect(screen.getByText("Old Jacket")).toBeInTheDocument();
  });
});
