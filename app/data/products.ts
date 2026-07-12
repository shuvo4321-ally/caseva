// ===== PRODUCT CATALOG — single source of truth for the whole store =====
// Home page (hero fan + curated rows + grid), product detail pages, cart and
// checkout all read from here. To stock a case: drop its PNG(s) in /public and
// add ONE entry below. Tag it via `collections` to place it in merchandising
// rows ("new-arrivals", "sale", "featured", or any tag you invent), set
// `salePrice` to put it On Sale, `isNew` for the NEW badge, `featured` to make
// it eligible for the hero fan.

export type Product = {
  slug: string;
  name: string;
  price: number; // display currency below; bKash (Phase 3) will convert to BDT
  salePrice?: number;
  images: string[]; // gallery — first image is the primary/card image
  alt: string;
  description: string;
  isNew?: boolean;
  featured?: boolean;
  collections: string[]; // free-form merchandising tags
};

// Single place to switch display currency later (bKash settles in BDT "৳").
export const CURRENCY = "$";
export const formatPrice = (n: number) => `${CURRENCY}${n}`;

export const PRODUCTS: Product[] = [
  {
    slug: "rose-whisper",
    name: "Rose Whisper",
    price: 32,
    salePrice: 27,
    images: ["/white-rose-hero.png"],
    alt: "White rose floral case",
    description:
      "Soft ivory scattered with hand-drawn roses. A quiet, romantic everyday case with full drop protection and raised camera guards.",
    featured: true,
    collections: ["sale", "featured", "bestsellers", "florals", "magsafe"],
  },
  {
    slug: "blue-blossom",
    name: "Blue Blossom",
    price: 34,
    images: ["/blue-case-hero.png"],
    alt: "Blue blossom floral case",
    description:
      "A cool-toned porcelain-blue case scattered with delicate silver blossoms. Impact-tested corners, MagSafe-ready, and slim enough to disappear in your pocket.",
    isNew: true,
    featured: true,
    collections: ["new-arrivals", "featured", "florals", "magsafe"],
  },
  {
    slug: "pink-bloom",
    name: "Pink Bloom",
    price: 32,
    images: ["/pink-case-hero.png"],
    alt: "Pink blossom floral case",
    description:
      "Blush pink strewn with tiny blooms — our most-loved signature print. Grippy matte edges, MagSafe-ready, 100% recycled shell.",
    featured: true,
    collections: ["featured", "bestsellers", "florals", "magsafe"],
  },
  {
    slug: "pink-bow",
    name: "Pink Bow",
    price: 34,
    images: ["/pink-bow-hero.png"],
    alt: "Pink bow-knot case",
    description:
      "Coquette-core bow-knots on a glossy pink base. A little playful, a lot protective — impact-tested to 3 m.",
    isNew: true,
    featured: true,
    collections: ["new-arrivals", "featured", "magsafe"],
  },
  {
    slug: "tulip-garden",
    name: "Tulip Garden",
    price: 32,
    images: ["/tulip-hero.png"],
    alt: "Tulip pattern case",
    description:
      "A cream case with a scattered watercolour tulip garden. Warm, vintage and slim, with raised bezels that keep your screen off the table.",
    featured: true,
    collections: ["featured", "bestsellers"],
  },
];

// ----- Device compatibility (shared by hero + PDP model selectors) -----
export const PHONE_MODELS = [
  "iPhone 16 Pro Max",
  "iPhone 16 Pro",
  "iPhone 16 Plus",
  "iPhone 16",
  "iPhone 15 Pro Max",
  "iPhone 15 Pro",
  "iPhone 15 Plus",
  "iPhone 15",
  "iPhone 14 Pro Max",
  "iPhone 14 Pro",
  "iPhone 14",
  "iPhone 13 Pro",
  "iPhone 13",
];
export const DEFAULT_MODEL = "iPhone 16 Pro";
export const MODEL_STORAGE_KEY = "caseva-iphone-model";

// ----- Lookups -----
export const getProduct = (slug: string): Product | undefined =>
  PRODUCTS.find((p) => p.slug === slug);

export const byCollection = (tag: string): Product[] =>
  PRODUCTS.filter((p) => p.collections.includes(tag));

// "Shop All" order: new arrivals first, then authored order.
export const allProductsSorted = (): Product[] => [
  ...PRODUCTS.filter((p) => p.isNew),
  ...PRODUCTS.filter((p) => !p.isNew),
];

// ----- Merchandising showcase (bento tiles) -----
export type FilterTag =
  | "all"
  | "new-arrivals"
  | "sale"
  | "bestsellers";

// Config for the bento tiles. `accent` selects the pastel tile background
// (keys map to gradients in globals.css .showcase-tile--*). `image` is a
// representative product PNG shown on the tile.
export type ShowcaseTile = {
  tag: FilterTag;
  label: string;
  blurb: string;
  accent: "blue" | "pink" | "cream" | "lavender" | "mint" | "peach";
  image: string;
};

export const SHOWCASE_TILES: ShowcaseTile[] = [
  { tag: "new-arrivals", label: "New In", blurb: "Fresh drops", accent: "blue", image: "/pink-bow-hero.png" },
  { tag: "sale", label: "On Sale", blurb: "Limited-time prices", accent: "pink", image: "/white-rose-hero.png" },
  { tag: "bestsellers", label: "Best Sellers", blurb: "Most loved", accent: "cream", image: "/pink-case-hero.png" },
  { tag: "all", label: "Shop All", blurb: "The full range", accent: "lavender", image: "/blue-case-hero.png" },
];

// Products for a given filter (grid).
export const productsByFilter = (tag: FilterTag): Product[] =>
  tag === "all" ? allProductsSorted() : byCollection(tag);

// How many products a tile represents (shown as a count on the tile).
export const filterCount = (tag: FilterTag): number => productsByFilter(tag).length;
