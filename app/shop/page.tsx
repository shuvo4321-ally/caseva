import type { Metadata } from "next";
import ShopCatalog from "../components/ShopCatalog";
import { type FilterTag } from "../data/products";

export const metadata: Metadata = {
  title: "Shop All Cases — CASEVA",
  description:
    "Browse every CASEVA case — new arrivals, sale, and best sellers. Impact-tested, 100% recycled, MagSafe-ready.",
};

// `?filter=new-arrivals|sale|bestsellers|all` deep-links from the home tiles
// and footer. Keyed on the filter so a fresh link always lands on that tab.
export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter } = await searchParams;
  return <ShopCatalog key={filter ?? "all"} initialFilter={filter as FilterTag | undefined} />;
}
