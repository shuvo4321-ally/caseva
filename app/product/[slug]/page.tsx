import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetail from "../../components/ProductDetail";
import { PRODUCTS, getProduct } from "../../data/products";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return { title: "Product not found — CASEVA" };
  return {
    title: `${product.name} — CASEVA`,
    description: product.description,
    openGraph: { title: `${product.name} — CASEVA`, description: product.description, images: [product.images[0]] },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  // "You may also like": other products, new-first, capped.
  const related = PRODUCTS.filter((p) => p.slug !== product.slug).slice(0, 4);

  return <ProductDetail product={product} related={related} />;
}
