import { describe, it, expect } from "vitest";
import { computeStats } from "../utils/stats";
import type { ClothingItem, Replacement } from "../types";

const makeItem = (overrides: Partial<ClothingItem>): ClothingItem => ({
  id: "item-1",
  name: "Test Item",
  category: "shirts",
  brand: "Acme",
  color: "Blue",
  size: "M",
  purchasePrice: 50,
  purchaseDate: "2024-01-01",
  isArchived: false,
  lastModified: new Date().toISOString(),
  ...overrides,
});

const makeReplacement = (overrides: Partial<Replacement>): Replacement => ({
  id: "rep-1",
  name: "Replacement",
  brand: "Brand",
  category: "shirts",
  searchQuery: "test query",
  ...overrides,
});

describe("computeStats", () => {
  it("returns zeros for empty arrays", () => {
    const stats = computeStats([], []);
    expect(stats.totalValue).toBe(0);
    expect(stats.totalReplacementCost).toBe(0);
    expect(stats.totalActiveItems).toBe(0);
    expect(stats.byCategory).toHaveLength(0);
  });

  it("sums purchase prices of active items only", () => {
    const items = [
      makeItem({ id: "a", purchasePrice: 40, isArchived: false }),
      makeItem({ id: "b", purchasePrice: 60, isArchived: false }),
      makeItem({ id: "c", purchasePrice: 100, isArchived: true }),
    ];
    const stats = computeStats(items, []);
    expect(stats.totalValue).toBe(100);
    expect(stats.totalActiveItems).toBe(2);
    expect(stats.totalArchivedItems).toBe(1);
  });

  it("uses fetchedPrice over estimatedPrice for replacement cost", () => {
    const items = [makeItem({ id: "item-1", purchasePrice: 50 })];
    const replacements = [
      makeReplacement({
        clothingItemId: "item-1",
        estimatedPrice: 80,
        fetchedPrice: 65,
      }),
    ];
    const stats = computeStats(items, replacements);
    expect(stats.totalReplacementCost).toBe(65);
  });

  it("falls back to estimatedPrice when no fetchedPrice", () => {
    const items = [makeItem({ id: "item-1", purchasePrice: 50 })];
    const replacements = [
      makeReplacement({
        clothingItemId: "item-1",
        estimatedPrice: 80,
      }),
    ];
    const stats = computeStats(items, replacements);
    expect(stats.totalReplacementCost).toBe(80);
  });

  it("assigns wishlist replacement cost to replacement's own category", () => {
    const items = [makeItem({ id: "item-1", category: "shirts", purchasePrice: 50 })];
    const wishlistReplacement = makeReplacement({
      id: "rep-w",
      clothingItemId: undefined,
      category: "shoes",
      estimatedPrice: 120,
    });
    const stats = computeStats(items, [wishlistReplacement]);
    const shoesStat = stats.byCategory.find((s) => s.category === "shoes");
    const shirtsStat = stats.byCategory.find((s) => s.category === "shirts");
    expect(shoesStat?.replacementCost).toBe(120);
    expect(shirtsStat?.replacementCost).toBe(0);
  });

  it("computes per-category breakdown correctly", () => {
    const items = [
      makeItem({ id: "a", category: "shoes", purchasePrice: 100 }),
      makeItem({ id: "b", category: "shoes", purchasePrice: 80 }),
      makeItem({ id: "c", category: "shirts", purchasePrice: 30 }),
    ];
    const stats = computeStats(items, []);
    const shoes = stats.byCategory.find((s) => s.category === "shoes");
    const shirts = stats.byCategory.find((s) => s.category === "shirts");
    expect(shoes?.itemCount).toBe(2);
    expect(shoes?.totalValue).toBe(180);
    expect(shirts?.itemCount).toBe(1);
    expect(shirts?.totalValue).toBe(30);
  });
});
