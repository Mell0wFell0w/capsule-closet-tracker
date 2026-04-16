import type { ClothingItem, Category } from "../types";
import { CATEGORIES } from "../types";

// ---------------------------------------------------------------------------
// CSV parser — handles quoted fields and both CRLF/LF line endings
// ---------------------------------------------------------------------------
function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let i = 0;

  while (i <= line.length) {
    if (i === line.length) {
      // trailing empty field after a comma
      fields.push("");
      break;
    }

    if (line[i] === '"') {
      i++;
      let field = "";
      while (i < line.length) {
        if (line[i] === '"' && line[i + 1] === '"') {
          field += '"';
          i += 2;
        } else if (line[i] === '"') {
          i++;
          break;
        } else {
          field += line[i++];
        }
      }
      fields.push(field.trim());
      if (line[i] === ",") i++;
    } else {
      const end = line.indexOf(",", i);
      if (end === -1) {
        fields.push(line.slice(i).trim());
        break;
      } else {
        fields.push(line.slice(i, end).trim());
        i = end + 1;
      }
    }
  }

  return fields;
}

export function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  for (const line of lines) {
    if (!line.trim()) continue;
    rows.push(parseCSVLine(line));
  }
  return rows;
}

// ---------------------------------------------------------------------------
// Column name → ClothingItem field mapping
// ---------------------------------------------------------------------------
type FieldKey = keyof Pick<
  ClothingItem,
  "name" | "category" | "brand" | "color" | "size" | "purchasePrice" | "purchaseDate" | "imageUrl" | "notes"
>;

const COLUMN_ALIASES: Record<string, FieldKey> = {
  // name
  name: "name",
  "item name": "name",
  item: "name",
  label: "name",
  // category
  category: "category",
  cat: "category",
  type: "category",
  "item type": "category",
  // brand
  brand: "brand",
  manufacturer: "brand",
  make: "brand",
  // color
  color: "color",
  colour: "color",
  // size
  size: "size",
  // purchasePrice
  price: "purchasePrice",
  "purchase price": "purchasePrice",
  purchaseprice: "purchasePrice",
  cost: "purchasePrice",
  paid: "purchasePrice",
  "amount paid": "purchasePrice",
  // purchaseDate
  date: "purchaseDate",
  "purchase date": "purchaseDate",
  purchasedate: "purchaseDate",
  "date purchased": "purchaseDate",
  "bought date": "purchaseDate",
  bought: "purchaseDate",
  // imageUrl
  image: "imageUrl",
  "image url": "imageUrl",
  imageurl: "imageUrl",
  photo: "imageUrl",
  "photo url": "imageUrl",
  picture: "imageUrl",
  // notes
  notes: "notes",
  note: "notes",
  description: "notes",
  comments: "notes",
  comment: "notes",
};

export function detectColumn(header: string): FieldKey | null {
  return COLUMN_ALIASES[header.toLowerCase().trim()] ?? null;
}

// ---------------------------------------------------------------------------
// Category fuzzy matching
// ---------------------------------------------------------------------------
const CATEGORY_ALIASES: Record<string, Category> = {
  // shoes
  shoe: "shoes",
  shoes: "shoes",
  sneaker: "shoes",
  sneakers: "shoes",
  footwear: "shoes",
  boot: "shoes",
  boots: "shoes",
  // socks
  sock: "socks",
  socks: "socks",
  // belts
  belt: "belts",
  belts: "belts",
  // pants
  pant: "pants",
  pants: "pants",
  trouser: "pants",
  trousers: "pants",
  jeans: "pants",
  jean: "pants",
  chino: "pants",
  chinos: "pants",
  // shorts
  short: "shorts",
  shorts: "shorts",
  // loungewear
  loungewear: "loungewear",
  lounge: "loungewear",
  athletic: "loungewear",
  sweatpant: "loungewear",
  sweatpants: "loungewear",
  jogger: "loungewear",
  joggers: "loungewear",
  legging: "loungewear",
  leggings: "loungewear",
  // hoodies
  hoodie: "hoodies",
  hoodies: "hoodies",
  sweatshirt: "hoodies",
  // jackets
  jacket: "jackets",
  jackets: "jackets",
  // flannels
  flannel: "flannels",
  flannels: "flannels",
  // shirts
  shirt: "shirts",
  shirts: "shirts",
  tee: "shirts",
  "t-shirt": "shirts",
  tshirt: "shirts",
  top: "shirts",
  // sweaters
  sweater: "sweaters",
  sweaters: "sweaters",
  pullover: "sweaters",
  knit: "sweaters",
  // coats
  coat: "coats",
  coats: "coats",
  overcoat: "coats",
  parka: "coats",
  // formal
  formal: "formal",
  suit: "formal",
  blazer: "formal",
  "dress shirt": "formal",
  "dress pants": "formal",
  business: "formal",
  // ties
  tie: "ties",
  ties: "ties",
  necktie: "ties",
  // watches
  watch: "watches",
  watches: "watches",
  timepiece: "watches",
  // other
  other: "other",
  misc: "other",
  miscellaneous: "other",
  accessory: "other",
  accessories: "other",
};

function parseCategory(raw: string): { category: Category; warn: boolean } {
  const key = raw.toLowerCase().trim();
  if (!key) return { category: "other", warn: false };
  if (CATEGORY_ALIASES[key]) return { category: CATEGORY_ALIASES[key], warn: false };
  // Exact match against canonical values as fallback
  if ((CATEGORIES as readonly string[]).includes(key)) return { category: key as Category, warn: false };
  return { category: "other", warn: true };
}

// ---------------------------------------------------------------------------
// Parse a price string like "$12.99", "12,99", "12.99"
// ---------------------------------------------------------------------------
function parsePrice(raw: string): number {
  const cleaned = raw.replace(/[^0-9.]/g, "");
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

// ---------------------------------------------------------------------------
// Parse a date string into YYYY-MM-DD
// ---------------------------------------------------------------------------
function parseDate(raw: string): string {
  if (!raw.trim()) return new Date().toISOString().slice(0, 10);
  // Already ISO
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);
  // Try native parsing
  const d = new Date(raw);
  if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  return new Date().toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// Public types and main export
// ---------------------------------------------------------------------------
export interface ImportRow {
  item: ClothingItem;
  rowNumber: number;
  warnings: string[];
}

export interface ImportPreview {
  rows: ImportRow[];
  skippedRows: number[];
  columnMap: Partial<Record<FieldKey, string>>; // field → detected csv header
  unmappedHeaders: string[];
}

export function buildImportPreview(text: string): ImportPreview {
  const raw = parseCSV(text);
  if (raw.length < 2) {
    return { rows: [], skippedRows: [], columnMap: {}, unmappedHeaders: [] };
  }

  const headers = raw[0];
  const columnMap: Partial<Record<FieldKey, string>> = {};
  const unmappedHeaders: string[] = [];

  for (const h of headers) {
    const field = detectColumn(h);
    if (field && !columnMap[field]) {
      columnMap[field] = h;
    } else if (!field) {
      unmappedHeaders.push(h);
    }
  }

  const rows: ImportRow[] = [];
  const skippedRows: number[] = [];
  const now = new Date().toISOString();

  for (let i = 1; i < raw.length; i++) {
    const cells = raw[i];
    const warnings: string[] = [];

    // Build a map of field → cell value
    const fieldValues: Partial<Record<FieldKey, string>> = {};
    for (let j = 0; j < headers.length; j++) {
      const field = detectColumn(headers[j]);
      if (field) fieldValues[field] = cells[j] ?? "";
    }

    const rawName = fieldValues.name?.trim() ?? "";
    if (!rawName) {
      skippedRows.push(i + 1);
      continue;
    }

    // Category
    let category: Category = "other";
    if (fieldValues.category !== undefined) {
      const { category: cat, warn } = parseCategory(fieldValues.category);
      category = cat;
      if (warn && fieldValues.category.trim()) {
        warnings.push(`Unknown category "${fieldValues.category}" — defaulted to "other"`);
      }
    } else {
      warnings.push('No category column — defaulted to "other"');
    }

    // Price
    const purchasePrice = fieldValues.purchasePrice !== undefined
      ? parsePrice(fieldValues.purchasePrice)
      : 0;
    if (fieldValues.purchasePrice === undefined) {
      warnings.push("No price column — defaulted to $0");
    }

    // Date
    const purchaseDate = parseDate(fieldValues.purchaseDate ?? "");

    const item: ClothingItem = {
      id: crypto.randomUUID(),
      name: rawName,
      category,
      brand: fieldValues.brand?.trim() || "",
      color: fieldValues.color?.trim() || "",
      size: fieldValues.size?.trim() || "",
      purchasePrice,
      purchaseDate,
      imageUrl: fieldValues.imageUrl?.trim() || undefined,
      notes: fieldValues.notes?.trim() || undefined,
      isArchived: false,
      lastModified: now,
    };

    rows.push({ item, rowNumber: i + 1, warnings });
  }

  return { rows, skippedRows, columnMap, unmappedHeaders };
}
