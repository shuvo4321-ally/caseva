import FeatureBanner from "./FeatureBanner";
import ProductRow from "./ProductRow";
import { allProductsSorted } from "../data/products";

// Home collection: a full-bleed feature banner leading into /shop, then the
// bestselling product carousel.
export default function CollectionShowcase() {
  return (
    <section className="collection-wrap" id="collection">
      <FeatureBanner />

      <ProductRow
        id="all-products"
        title="Bestselling Prints"
        viewAllHref="/shop"
        products={allProductsSorted()}
      />
    </section>
  );
}
