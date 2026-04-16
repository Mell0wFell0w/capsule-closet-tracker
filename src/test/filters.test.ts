import { describe, it, expect } from "vitest";
import { filterItems } from "../utils/filters";
import type { ClothingItem } from "../types";

const make = (overrides: Partial<ClothingItem>): ClothingItem => ({
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
  make({ name: "White Tee", category: "shirts", brand: "Nike" }),
  make({ name: "Blue Jeans", category: "pants", brand: "Levi's" }),
  make({ name: "Running Shoes", category: "shoes", brand: "Nike" }),
  make({ name: "Winter Coat", category: "coats", brand: "Patagonia" }),
];

describe("filterItems", () => {
  it("returns all items when category is 'all' and search is empty", () => {
    expect(filterItems(items, "all", "")).toHaveLength(4);
  });

  it("filters by category", () => {
    const result = filterItems(items, "shirts", "");
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("White Tee");
  });

  it("filters by search term (name, case-insensitive)", () => {
    const result = filterItems(items, "all", "coat");
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Winter Coat");
  });

  it("filters by search term (brand)", () => {
    const result = filterItems(items, "all", "nike");
    expect(result).toHaveLength(2);
  });

  it("combines category and search filters", () => {
    const result = filterItems(items, "shoes", "nike");
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Running Shoes");
  });

  it("returns empty array when nothing matches", () => {
    expect(filterItems(items, "watches", "")).toHaveLength(0);
  });
});
