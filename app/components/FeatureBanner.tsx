"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

// Feature stage: lifestyle photography that SNAPS to the next shot on a timer
// — no cross-fade — carrying no text; the copy sits underneath on the page.
//
// No case is composited on top: these photographs already contain a case, so
// overlaying another produced two overlapping phones. Compositing only makes
// sense over case-free lifestyle collages.
const SCENES = ["/feature-banner.jpg", "/feature-banner-2.jpg", "/feature-banner-3.jpg"];

const INTERVAL = 650;

export default function FeatureBanner() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (SCENES.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % SCENES.length), INTERVAL);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="feature-banner" aria-label="Featured collection">
      <div className="feature-stage">
        {SCENES.map((src, i) => (
          <Image
            key={src}
            className={`feature-img ${i === idx ? "is-active" : ""}`}
            src={src}
            alt=""
            fill
            sizes="100vw"
            priority={i === 0}
            // on a timer, so every scene must be ready before its turn
            loading={i === 0 ? undefined : "eager"}
          />
        ))}
      </div>

      <div className="feature-copy">
        <h2 className="feature-title">Ready to stand out?</h2>
        <p className="feature-desc">
          Elevate your everyday — turn your phone case into a true reflection of
          your style, with prints that stay vibrant for years.
        </p>
        <Link className="feature-cta" href="/shop">Shop now</Link>
      </div>
    </section>
  );
}
