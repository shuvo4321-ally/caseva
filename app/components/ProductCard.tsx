import Image from "next/image";
import Link from "next/link";
import { type Product, formatPrice } from "../data/products";

// Compact carousel card: image, name, price. No description or quick-add —
// the whole card taps through to the product page, where the shopper picks
// their model before adding.
export default function ProductCard({ product, className = "" }: { product: Product; className?: string }) {
  return (
    <div className={`casetify-style ${className}`.trim()}>
      <Link className="collection-card-link" href={`/product/${product.slug}`}>
        <div className="casetify-img-bg">
          {product.isNew && <span className="card-badge">NEW</span>}
          {product.salePrice && <span className="card-badge card-badge-sale">SALE</span>}
          <Image src={product.images[0]} alt={product.alt} width={360} height={540} />
        </div>
        <div className="casetify-card-body">
          <h3 className="casetify-title">{product.name}</h3>
          <span className="casetify-subtitle">
            {product.salePrice ? (
              <>
                <span className="price-now">{formatPrice(product.salePrice)}</span>
                <span className="price-was">{formatPrice(product.price)}</span>
              </>
            ) : (
              formatPrice(product.price)
            )}
          </span>
        </div>
      </Link>
    </div>
  );
}
