export type Category =
  | "shoes"
  | "socks"
  | "belts"
  | "pants"
  | "shorts"
  | "loungewear"
  | "hoodies"
  | "jackets"
  | "flannels"
  | "shirts"
  | "sweaters"
  | "coats"
  | "formal"
  | "ties"
  | "watches"
  | "other";

export const CATEGORIES: Category[] = [
  "shoes",
  "socks",
  "belts",
  "pants",
  "shorts",
  "loungewear",
  "hoodies",
  "jackets",
  "flannels",
  "shirts",
  "sweaters",
  "coats",
  "formal",
  "ties",
  "watches",
  "other",
];

export const CATEGORY_LABELS: Record<Category, string> = {
  shoes: "Shoes",
  socks: "Socks",
  belts: "Belts",
  pants: "Pants",
  shorts: "Shorts",
  loungewear: "Loungewear",
  hoodies: "Hoodies",
  jackets: "Jackets",
  flannels: "Flannels",
  shirts: "Shirts",
  sweaters: "Sweaters",
  coats: "Coats",
  formal: "Formal",
  ties: "Ties",
  watches: "Watches",
  other: "Other",
};

export interface ClothingItem {
  id: string;
  name: string;
  category: Category;
  brand: string;
  color: string;
  size: string;
  purchasePrice: number;
  purchaseDate: string;
  imageUrl?: string;
  isArchived: boolean;
  archivedDate?: string;
  notes?: string;
  lastModified: string;
}

export interface Replacement {
  id: string;
  clothingItemId?: string;
  name: string;
  brand: string;
  category: Category;
  estimatedPrice?: number;
  fetchedPrice?: number;
  lastPriceFetch?: string;
  productUrl?: string;
  searchQuery: string;
}

export interface PriceFetchResult {
  title: string;
  price: number;
  source: string;
  link: string;
  thumbnail?: string;
}
