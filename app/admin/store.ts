"use client";

// ===== ADMIN DATA SEAM =====
// This is the ONLY file to change when the backend exists.
//
// Every function is async and returns the shape an API would return, so the
// screens never learn where data comes from. Swapping a body for `fetch()`
// changes nothing above it.
//
// Until then everything is held in localStorage under one versioned key,
// seeded from the real catalog in app/data/products.ts. That means the admin
// opens with the actual store contents rather than dummy rows.
//
// IMPORTANT: edits here do NOT reach the live storefront. The shop reads
// app/data/products.ts directly at build time (generateStaticParams bakes the
// product slugs, and PRICE_MIN/PRICE_MAX are module constants). Use Export to
// paste changes back, or connect the backend.

import {
  PRODUCTS,
  PHONE_BRANDS,
  SHOWCASE_TILES,
  type Product,
  type PhoneBrand,
  type ShowcaseTile,
} from "../data/products";

// Bump when the stored shape changes; a mismatch re-seeds rather than trying
// to migrate half-written data from an older build.
const KEY = "caseva-admin-v1";

export type Merchandising = {
  promoText: string;
  bannerScenes: string[];
  tiles: ShowcaseTile[];
};

export type OrderLine = { name: string; model: string; qty: number; price: number };
export type Order = {
  id: string;
  placedAt: string;
  customer: string;
  email: string;
  status: "paid" | "pending" | "shipped" | "refunded";
  lines: OrderLine[];
};

export type AdminData = {
  products: Product[];
  phoneBrands: PhoneBrand[];
  merchandising: Merchandising;
  orders: Order[];
};

// Mirrors what PromoBar.tsx and FeatureBanner.tsx currently hardcode, so the
// admin opens showing what the site actually says today.
const SEED_MERCH: Merchandising = {
  promoText: "Free shipping on orders $30+ · Buy 2, get 1 free",
  bannerScenes: ["/feature-banner.jpg", "/feature-banner-2.jpg", "/feature-banner-3.jpg"],
  tiles: SHOWCASE_TILES,
};

// Nothing creates orders yet — checkout is entirely client-side and makes no
// network calls — so these exist to give the screen (and your API) a shape.
const SEED_ORDERS: Order[] = [
  {
    id: "CSV-1042", placedAt: "2026-08-21T14:12:00Z", customer: "Nusrat Jahan",
    email: "nusrat@example.com", status: "paid",
    lines: [{ name: "Pink Bow", model: "iPhone 16 Pro", qty: 1, price: 34 }],
  },
  {
    id: "CSV-1041", placedAt: "2026-08-20T09:40:00Z", customer: "Tanvir Ahmed",
    email: "tanvir@example.com", status: "shipped",
    lines: [
      { name: "Blue Blossom", model: "iPhone 15", qty: 2, price: 34 },
      { name: "Rose Whisper", model: "Pixel 9", qty: 1, price: 27 },
    ],
  },
  {
    id: "CSV-1040", placedAt: "2026-08-19T18:03:00Z", customer: "Farhana Rahman",
    email: "farhana@example.com", status: "pending",
    lines: [{ name: "Tulip Garden", model: "Pixel 8 Pro", qty: 1, price: 32 }],
  },
];

const seed = (): AdminData => ({
  // structuredClone so editing the admin copy can never mutate the imported
  // module objects, which the storefront also holds a reference to in dev
  products: structuredClone(PRODUCTS),
  phoneBrands: structuredClone(PHONE_BRANDS),
  merchandising: structuredClone(SEED_MERCH),
  orders: structuredClone(SEED_ORDERS),
});

const read = (): AdminData => {
  if (typeof window === "undefined") return seed();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return seed();
    const parsed = JSON.parse(raw) as Partial<AdminData>;
    // Fill any missing top-level slice rather than throwing: a half-written
    // record should degrade to the seed for that slice, not blank the admin.
    return {
      products: parsed.products ?? seed().products,
      phoneBrands: parsed.phoneBrands ?? seed().phoneBrands,
      merchandising: parsed.merchandising ?? seed().merchandising,
      orders: parsed.orders ?? seed().orders,
    };
  } catch {
    return seed();
  }
};

const write = (data: AdminData) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* quota or private mode — the screen keeps its in-memory state */
  }
};

// ---------- products ----------
export const listProducts = async (): Promise<Product[]> => read().products;

export const getProduct = async (slug: string): Promise<Product | undefined> =>
  read().products.find((p) => p.slug === slug);

/** Upsert. `originalSlug` is passed when editing so renaming a slug replaces
 *  the row instead of creating a second one. */
export const saveProduct = async (product: Product, originalSlug?: string): Promise<Product> => {
  const data = read();
  const key = originalSlug ?? product.slug;
  const i = data.products.findIndex((p) => p.slug === key);
  if (i === -1) data.products.push(product);
  else data.products[i] = product;
  write(data);
  return product;
};

export const deleteProduct = async (slug: string): Promise<void> => {
  const data = read();
  data.products = data.products.filter((p) => p.slug !== slug);
  write(data);
};

// ---------- phone brands ----------
export const listPhoneBrands = async (): Promise<PhoneBrand[]> => read().phoneBrands;

export const savePhoneBrands = async (brands: PhoneBrand[]): Promise<PhoneBrand[]> => {
  const data = read();
  data.phoneBrands = brands;
  write(data);
  return brands;
};

// ---------- merchandising ----------
export const getMerchandising = async (): Promise<Merchandising> => read().merchandising;

export const saveMerchandising = async (m: Merchandising): Promise<Merchandising> => {
  const data = read();
  data.merchandising = m;
  write(data);
  return m;
};

// ---------- orders (read-only) ----------
export const listOrders = async (): Promise<Order[]> => read().orders;

// ---------- whole-store ----------
export const getAll = async (): Promise<AdminData> => read();

export const resetToSeed = async (): Promise<AdminData> => {
  const fresh = seed();
  write(fresh);
  return fresh;
};

export const exportAll = async (): Promise<string> => JSON.stringify(read(), null, 2);

/**
 * Emits the `PRODUCTS` array exactly as app/data/products.ts declares it, ready
 * to paste over the existing one. Keys are written in the Product type's order
 * and optional fields are omitted when unset, so the output reads like the
 * handwritten file rather than a JSON dump with `undefined` everywhere.
 */
export const exportProductsTs = async (): Promise<string> => {
  const q = (s: string) => JSON.stringify(s);
  const arr = (xs: string[]) => `[${xs.map(q).join(", ")}]`;
  const body = read()
    .products.map((p) => {
      const lines = [
        `    slug: ${q(p.slug)},`,
        `    name: ${q(p.name)},`,
        `    price: ${p.price},`,
        p.salePrice !== undefined ? `    salePrice: ${p.salePrice},` : null,
        `    images: ${arr(p.images)},`,
        `    alt: ${q(p.alt)},`,
        `    description:\n      ${q(p.description)},`,
        p.isNew ? `    isNew: true,` : null,
        p.featured ? `    featured: true,` : null,
        `    caseType: ${q(p.caseType)},`,
        p.fitsModels ? `    fitsModels: ${arr(p.fitsModels)},` : null,
        `    collections: ${arr(p.collections)},`,
      ].filter(Boolean);
      return `  {\n${lines.join("\n")}\n  },`;
    })
    .join("\n");
  return `export const PRODUCTS: Product[] = [\n${body}\n];\n`;
};
