import type { ClothingItem, Replacement, Category } from "../types";
import { CATEGORIES } from "../types";

export interface CategoryStat {
  category: Category;
  itemCount: number;
  totalValue: number;
  replacementCost: number;
}

export interface WardrobeStats {
  totalValue: number;
  totalReplacementCost: number;
  totalActiveItems: number;
  totalArchivedItems: number;
  byCategory: CategoryStat[];
}

function getReplacementPrice(r: Replacement): number {
  if (r.fetchedPrice != null) return r.fetchedPrice;
  if (r.estimatedPrice != null) return r.estimatedPrice;
  return 0;
}

export function computeStats(
  items: ClothingItem[],
  replacements: Replacement[]
): WardrobeStats {
  const activeItems = items.filter((i) => !i.isArchived);
  const archivedItems = items.filter((i) => i.isArchived);

  const totalValue = activeItems.reduce((sum, i) => sum + (i.purchasePrice || 0), 0);

  // Build a lookup: clothingItemId -> category (for linked replacements)
  const itemCategoryById: Record<string, Category> = {};
  for (const item of items) {
    itemCategoryById[item.id] = item.category;
  }

  const totalReplacementCost = replacements.reduce(
    (sum, r) => sum + getReplacementPrice(r),
    0
  );

  const byCategory: CategoryStat[] = CATEGORIES.map((cat) => {
    const catItems = activeItems.filter((i) => i.category === cat);
    const itemCount = catItems.length;
    const totalValueCat = catItems.reduce((sum, i) => sum + (i.purchasePrice || 0), 0);

    // Linked replacements: use parent item's category
    // Wishlist replacements: use replacement's own category
    const replacementCost = replacements
      .filter((r) => {
        if (r.clothingItemId) {
          return itemCategoryById[r.clothingItemId] === cat;
        }
        return r.category === cat;
      })
      .reduce((sum, r) => sum + getReplacementPrice(r), 0);

    return {
      category: cat,
      itemCount,
      totalValue: totalValueCat,
      replacementCost,
    };
  }).filter((s) => s.itemCount > 0 || s.replacementCost > 0);

  return {
    totalValue,
    totalReplacementCost,
    totalActiveItems: activeItems.length,
    totalArchivedItems: archivedItems.length,
    byCategory,
  };
}
