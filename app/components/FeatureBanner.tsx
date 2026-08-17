import Image from "next/image";
import Link from "next/link";

// Full-bleed feature banner: one photo filling the band with the copy overlaid.
// To swap the photo, replace /public/feature-banner.jpg (it's cover-cropped —
// tall frame on mobile, wide on desktop — so keep the subject centred and the
// lower-left calm, since the copy sits there).
export default function FeatureBanner() {
  return (
    <section className="feature-banner" aria-label="Featured collection">
      <Image
        className="feature-img"
        src="/feature-banner.jpg"
        alt=""
        fill
        sizes="100vw"
        priority
      />
      <div className="feature-copy">
        <span className="feature-eyebrow">Introducing</span>
        <h2 className="feature-title">Glossy Printed Cases</h2>
        <p className="feature-desc">
          Prints that stay vibrant for years — a glossy finish with rich, true
          colour that catches the light.
        </p>
        <Link className="feature-cta" href="/shop">Shop now</Link>
      </div>
    </section>
  );
}
