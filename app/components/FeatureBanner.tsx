"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

// Feature stage: a lifestyle backdrop with a case standing in the middle of it.
// The whole scene (backdrop + case) SNAPS to the next one on a timer — no
// cross-fade — and carries no text; the copy sits underneath on the page.
//
// TO EDIT: pair a backdrop with the case that should stand on it. Backdrops
// live in /public as feature-banner*.jpg.
const SCENES = [
  { backdrop: "/feature-banner.jpg", case: "/pink-bow-hero.png" },
  { backdrop: "/feature-banner-2.jpg", case: "/blue-case-hero.png" },
  { backdrop: "/feature-banner-3.jpg", case: "/tulip-hero.png" },
];

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
        {SCENES.map((s, i) => (
          <Image
            key={s.backdrop}
            className={`feature-img ${i === idx ? "is-active" : ""}`}
            src={s.backdrop}
            alt=""
            fill
            sizes="100vw"
            priority={i === 0}
            // on a timer, so every scene must be ready before its turn
            loading={i === 0 ? undefined : "eager"}
          />
        ))}

        {SCENES.map((s, i) => (
          <Image
            key={s.case}
            className={`feature-case ${i === idx ? "is-active" : ""}`}
            src={s.case}
            alt=""
            width={420}
            height={630}
            priority={i === 0}
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
