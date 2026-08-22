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
  /* Gallery. images[0] is the primary/card image and must stay the real
     packshot. The rest are PLACEHOLDERS — other renders standing in for
     alternate angles, plus one lifestyle shot — so the swipe gallery can be
     built and judged before the real photography exists. Swap them out; the
     gallery reads whatever length this is.
     Extensions matter: .png renders as a packshot (contained, with a contact
     shadow) and .jpg as a lifestyle photo (filling the frame). */
  images: string[];
  alt: string;
  description: string;
  isNew?: boolean;
  featured?: boolean;
  caseType: CaseType;
  // Models this design is made for. OMIT to mean "fits every model" — that
  // keeps the shop honest while compatibility data is still being filled in.
  fitsModels?: string[];
  collections: string[]; // free-form merchandising tags
};

// Case constructions the shop filters by. Placeholder assignments below —
// set each product's real construction.
export const CASE_TYPES = [
  "Impact Case",
  "Clear Case",
  "MagSafe Case",
  "Bounce Case",
] as const;
export type CaseType = (typeof CASE_TYPES)[number];

// Single place to switch display currency later (bKash settles in BDT "৳").
export const CURRENCY = "$";
export const formatPrice = (n: number) => `${CURRENCY}${n}`;

export const PRODUCTS: Product[] = [
  {
    slug: "rose-whisper",
    name: "Rose Whisper",
    price: 32,
    salePrice: 27,
    images: ["/white-rose-hero.png", "/rose-case-v2.png", "/cream-floral-case-v2.png", "/feature-banner.jpg"],
    alt: "White rose floral case",
    description:
      "Soft ivory scattered with hand-drawn roses. A quiet, romantic everyday case with full drop protection and raised camera guards.",
    featured: true,
    caseType: "Impact Case",
    collections: ["sale", "featured", "bestsellers", "florals", "magsafe"],
  },
  {
    slug: "blue-blossom",
    name: "Blue Blossom",
    price: 34,
    images: ["/blue-case-hero.png", "/cream-floral-case-v2.png", "/rose-case-v2.png", "/feature-banner-2.jpg"],
    alt: "Blue blossom floral case",
    description:
      "A cool-toned porcelain-blue case scattered with delicate silver blossoms. Impact-tested corners, MagSafe-ready, and slim enough to disappear in your pocket.",
    isNew: true,
    featured: true,
    caseType: "Clear Case",
    collections: ["new-arrivals", "featured", "florals", "magsafe"],
  },
  {
    slug: "pink-bloom",
    name: "Pink Bloom",
    price: 32,
    images: ["/pink-case-hero.png", "/pink-floral-case-v2.png", "/rose-case-v2.png", "/feature-banner-3.jpg"],
    alt: "Pink blossom floral case",
    description:
      "Blush pink strewn with tiny blooms — our most-loved signature print. Grippy matte edges, MagSafe-ready, 100% recycled shell.",
    featured: true,
    caseType: "Impact Case",
    collections: ["featured", "bestsellers", "florals", "magsafe"],
  },
  {
    slug: "pink-bow",
    name: "Pink Bow",
    price: 34,
    images: ["/pink-bow-hero.png", "/pink-floral-case-v2.png", "/cream-floral-case-v2.png", "/feature-banner.jpg"],
    alt: "Pink bow-knot case",
    description:
      "Coquette-core bow-knots on a glossy pink base. A little playful, a lot protective — impact-tested to 3 m.",
    isNew: true,
    featured: true,
    caseType: "MagSafe Case",
    collections: ["new-arrivals", "featured", "magsafe"],
  },
  {
    slug: "tulip-garden",
    name: "Tulip Garden",
    price: 32,
    images: ["/tulip-hero.png", "/tulip-case-v2.png", "/cream-floral-case-v2.png", "/feature-banner-2.jpg"],
    alt: "Tulip pattern case",
    description:
      "A cream case with a scattered watercolour tulip garden. Warm, vintage and slim, with raised bezels that keep your screen off the table.",
    featured: true,
    caseType: "Bounce Case",
    collections: ["featured", "bestsellers"],
  },
];

// ----- Device compatibility (shared by hero + PDP model selectors) -----
// Grouped by brand: the selector shows brands first, then the chosen brand's
// models. Add a brand or model by editing this list only.
export type PhoneBrand = { brand: string; models: string[] };
export const PHONE_BRANDS: PhoneBrand[] = [
  {
    brand: "iPhone",
    models: [
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
    ],
  },
  {
    brand: "Pixel",
    models: [
      "Pixel 9 Pro XL",
      "Pixel 9 Pro",
      "Pixel 9",
      "Pixel 8 Pro",
      "Pixel 8",
      "Pixel 8a",
      "Pixel 7 Pro",
      "Pixel 7",
      "Pixel 7a",
    ],
  },
];

// Flat list of every supported model — used to validate a saved selection.
export const PHONE_MODELS: string[] = PHONE_BRANDS.flatMap((b) => b.models);

// The brand a model belongs to (falls back to the first brand).
export const brandOfModel = (model: string): string =>
  PHONE_BRANDS.find((b) => b.models.includes(model))?.brand ?? PHONE_BRANDS[0].brand;

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

// ----- Shop filters (phone brand / model / case type / collection / price) -----
// The price actually charged — sale price when there is one.
export const priceOf = (p: Product): number => p.salePrice ?? p.price;

// Slider bounds, derived from the catalog so they widen as you add products.
export const PRICE_MIN = Math.floor(Math.min(...PRODUCTS.map(priceOf)));
export const PRICE_MAX = Math.ceil(Math.max(...PRODUCTS.map(priceOf)));

export type ShopFilters = {
  brand: string;      // "all" | a PHONE_BRANDS brand
  model: string;      // "all" | a model name
  caseType: string;   // "all" | a CASE_TYPES value
  collection: FilterTag;
  minPrice: number;
  maxPrice: number;
};

// A product with no `fitsModels` is treated as universal, so it survives every
// brand/model filter until real compatibility is authored.
const fitsBrand = (p: Product, brand: string): boolean =>
  brand === "all" || !p.fitsModels?.length ||
  p.fitsModels.some((m) => brandOfModel(m) === brand);

const fitsModel = (p: Product, model: string): boolean =>
  model === "all" || !p.fitsModels?.length || p.fitsModels.includes(model);

export const filterProducts = (f: ShopFilters): Product[] =>
  productsByFilter(f.collection).filter(
    (p) =>
      fitsBrand(p, f.brand) &&
      fitsModel(p, f.model) &&
      (f.caseType === "all" || p.caseType === f.caseType) &&
      priceOf(p) >= f.minPrice &&
      priceOf(p) <= f.maxPrice
  );

// Count for one facet value, honouring the other active filters — so the
// numbers on the pills reflect what you'd actually get by tapping them.
export const facetCount = (base: ShopFilters, patch: Partial<ShopFilters>): number =>
  filterProducts({ ...base, ...patch }).length;

// ----- Search -----
// Matches name, description, case type and collection tags. Ranked so a name
// hit outranks a description hit, and a prefix beats a mid-word match.
const norm = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "");

/** Split into searchable words: "MagSafe Case" -> ["magsafe","case"],
 *  "new-arrivals" -> ["new","arrivals"]. */
const words = (s: string): string[] => norm(s).split(/[^a-z0-9]+/).filter(Boolean);

/** True when any WORD begins with the token — "blo" hits "Blossom" and
 *  "Bloom", but "s" no longer hits "Case" just because it contains an s. */
const hasWordStarting = (haystack: string[], token: string) =>
  haystack.some((w) => w.startsWith(token));

/**
 * Search is word-PREFIX based, not substring based, and every token has to
 * match something (AND, not OR).
 *
 * The previous version scored with plain `includes()` across name, caseType,
 * collections and description, which made short queries match everything:
 * "s" hit all five products at once — through "Clear Case", the "sale" and
 * "bestsellers" collections, and the prose — even though no product is named
 * with an s. Substring matching on a letter is meaningless.
 *
 * How far a token is allowed to reach is tied to how specific it is. One
 * letter searches names only; two letters may reach the case type and
 * collections; three or more may reach the description, where a common word
 * would otherwise drag in the whole catalogue.
 */
export const searchProducts = (raw: string): Product[] => {
  const query = norm(raw).trim();
  if (!query) return [];
  const tokens = query.split(/[^a-z0-9]+/).filter(Boolean);
  if (!tokens.length) return [];

  const scored = PRODUCTS.map((p) => {
    const nameWords = words(p.name);
    const typeWords = words(p.caseType);
    const collWords = p.collections.flatMap(words);
    const descWords = words(p.description);
    const name = norm(p.name);

    let total = 0;
    for (const t of tokens) {
      let best = 0;
      if (name === t) best = 100;
      else if (name.startsWith(t)) best = 80;
      else if (hasWordStarting(nameWords, t)) best = 60;
      else if (t.length >= 2 && hasWordStarting(typeWords, t)) best = 35;
      else if (t.length >= 2 && hasWordStarting(collWords, t)) best = 25;
      else if (t.length >= 3 && hasWordStarting(descWords, t)) best = 12;
      // one token matching nothing disqualifies the product: searching
      // "pink tulip" should find neither, not both
      if (best === 0) return { p, score: 0 };
      total += best;
    }
    return { p, score: total };
  }).filter((x) => x.score > 0);

  scored.sort((a, b) => b.score - a.score || a.p.name.localeCompare(b.p.name));
  return scored.map((x) => x.p);
};
