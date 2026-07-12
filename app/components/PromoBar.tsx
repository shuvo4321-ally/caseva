// Static announcement bar shared across all routes.
export default function PromoBar() {
  return (
    <div className="promo-bar" role="region" aria-label="Promotion">
      <span aria-hidden="true">✦</span>
      <span>Free shipping on orders $30+ · Buy 2, get 1 free</span>
      <span aria-hidden="true">✦</span>
    </div>
  );
}
