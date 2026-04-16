import type { ClothingItem, Category } from "../types";

export function filterItems(
  items: ClothingItem[],
  category: Category | "all",
  searchTerm: string
): ClothingItem[] {
  let result = items;

  if (category !== "all") {
    result = result.filter((item) => item.category === category);
  }

  if (searchTerm.trim()) {
    const lower = searchTerm.toLowerCase();
    result = result.filter(
      (item) =>
        item.name.toLowerCase().includes(lower) ||
        item.brand.toLowerCase().includes(lower)
    );
  }

  return result;
}
