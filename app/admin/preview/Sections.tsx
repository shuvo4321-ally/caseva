"use client";

import Link from "next/link";
import Editable from "./Editable";
import ProductCard from "../../components/ProductCard";
import type { Merchandising, PageSection, SiteCopy } from "../store";
import { productsByFilter, type FilterTag, type Product } from "../../data/products";

// Every section below renders the STOREFRONT's own class names. globals.css is
// imported by the root layout, which /admin sits under, so this is not a
// lookalike — it is the same CSS painting the same markup.

type Ctx = {
  copy: SiteCopy;
  merch: Merchandising;
  products: Product[];
  editing: boolean;
  setCopy: (patch: Partial<SiteCopy>) => void;
  setMerch: (patch: Partial<Merchandising>) => void;
  setProps: (patch: NonNullable<PageSection["props"]>) => void;
};

/** The value-prop line highlights phrases marked {{like this}}. Editing the raw
 *  string keeps the markers visible so they can be moved; the read-only view
 *  renders them as the real pink spans. */
const renderHighlighted = (text: string) =>
  text.split(/(\{\{[^}]*\}\})/g).map((part, i) =>
    part.startsWith("{{") && part.endsWith("}}") ? (
      <span key={i} className="vp-highlight">{part.slice(2, -2)}</span>
    ) : (
      <span key={i}>{part}</span>
    )
  );

function Hero({ copy, editing, setCopy }: Ctx) {
  return (
    <section className="hero" aria-label="Hero">
      <div className="hero-content">
        <Editable as="h1" className="headline left-align" editing={editing} label="Headline"
          value={copy.heroHeadline} onChange={(v) => setCopy({ heroHeadline: v })} />
        <div className="model-select" style={{ pointerEvents: editing ? "none" : undefined }}>
          <div className="ms-trigger">
            <Editable className="ms-value" editing={editing} label="Model selector label"
              value={copy.heroSelectorLabel} onChange={(v) => setCopy({ heroSelectorLabel: v })} />
          </div>
        </div>
        <div className="cta-wrap left-align">
          <span className="cta">
            <Editable editing={editing} label="Hero button"
              value={copy.heroCta} onChange={(v) => setCopy({ heroCta: v })} />
          </span>
        </div>
      </div>
    </section>
  );
}

function ValueProp({ copy, editing, setCopy }: Ctx) {
  return (
    <section className="value-prop">
      <div className="container vp-inner">
        {editing ? (
          <Editable as="p" className="vp-text" editing multiline label="Value proposition"
            value={copy.valueProp} onChange={(v) => setCopy({ valueProp: v })} />
        ) : (
          <p className="vp-text">{renderHighlighted(copy.valueProp)}</p>
        )}
      </div>
      {editing && (
        <p className="ed-hint">Wrap a phrase in {"{{double braces}}"} to highlight it in pink.</p>
      )}
    </section>
  );
}

function Cheers({ merch, editing, setMerch }: Ctx) {
  return (
    <section className="cheers">
      <div className="cheers-stage">
        <div className="cheers-case left">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={merch.cheersLeft} alt="" />
        </div>
        <div className="cheers-case right">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={merch.cheersRight} alt="" />
        </div>
      </div>
      {editing && (
        <div className="ed-fields">
          <label>Left hand
            <input type="text" value={merch.cheersLeft}
              onChange={(e) => setMerch({ cheersLeft: e.target.value })} />
          </label>
          <label>Right hand
            <input type="text" value={merch.cheersRight}
              onChange={(e) => setMerch({ cheersRight: e.target.value })} />
          </label>
        </div>
      )}
    </section>
  );
}

function FeatureBanner({ copy, merch, editing, setCopy, setMerch }: Ctx) {
  const move = (i: number, dir: -1 | 1) => {
    const next = [...merch.bannerScenes];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    setMerch({ bannerScenes: next });
  };
  return (
    <section className="feature-banner">
      <div className="feature-stage">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="feature-img is-active" src={merch.bannerScenes[0]} alt=""
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <div className="feature-copy">
        <Editable as="h2" className="feature-title" editing={editing} label="Banner title"
          value={copy.featureTitle} onChange={(v) => setCopy({ featureTitle: v })} />
        <Editable as="p" className="feature-desc" editing={editing} multiline label="Banner description"
          value={copy.featureDesc} onChange={(v) => setCopy({ featureDesc: v })} />
        <span className="feature-cta">
          <Editable editing={editing} label="Banner button"
            value={copy.featureCta} onChange={(v) => setCopy({ featureCta: v })} />
        </span>
      </div>
      {editing && (
        <div className="ed-fields">
          <p className="ed-hint" style={{ marginTop: 0 }}>
            Scenes, in the order the stage snaps through them. Scene 1 is on screen at load.
            Shoot 4:5 at 1600×2000+, subject in the central 50% vertically.
          </p>
          {merch.bannerScenes.map((src, i) => (
            <div className="ed-imgrow" key={i}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src || undefined} alt="" />
              <input type="text" value={src} aria-label={`Scene ${i + 1}`}
                onChange={(e) => setMerch({
                  bannerScenes: merch.bannerScenes.map((s, n) => (n === i ? e.target.value : s)),
                })} />
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move scene earlier">↑</button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === merch.bannerScenes.length - 1} aria-label="Move scene later">↓</button>
              <button type="button" onClick={() => setMerch({
                bannerScenes: merch.bannerScenes.filter((_, n) => n !== i),
              })} disabled={merch.bannerScenes.length === 1} aria-label="Remove scene">✕</button>
            </div>
          ))}
          <button type="button" className="ed-add"
            onClick={() => setMerch({ bannerScenes: [...merch.bannerScenes, ""] })}>+ Add scene</button>
        </div>
      )}
    </section>
  );
}

function ProductRowSection({ copy, products, editing, setCopy, setProps, section }: Ctx & { section: PageSection }) {
  const tag = section.props?.tag ?? "all";
  const title = section.props?.title ?? copy.rowTitle;
  const viewAll = section.props?.viewAll ?? copy.rowViewAll;
  // Reuse the real selector so the preview shows the same products the page would.
  const list = tag === "all" ? products : productsByFilter(tag as FilterTag);

  return (
    <section className="product-row">
      <div className="container">
        <div className="product-row-head">
          <Editable as="h2" className="product-row-title" editing={editing} label="Row title"
            value={title}
            onChange={(v) => (section.props ? setProps({ title: v }) : setCopy({ rowTitle: v }))} />
          <span className="product-row-viewall">
            <Editable editing={editing} label="View all label" value={viewAll}
              onChange={(v) => (section.props ? setProps({ viewAll: v }) : setCopy({ rowViewAll: v }))} />
          </span>
        </div>
        <div className="product-track">
          {list.slice(0, 4).map((p) => <ProductCard key={p.slug} product={p} />)}
        </div>
      </div>
      {editing && (
        <div className="ed-fields">
          <label>Show products from
            <select value={tag} onChange={(e) => setProps({ tag: e.target.value as FilterTag })}>
              {(["all", "new-arrivals", "sale", "bestsellers"] as FilterTag[]).map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </label>
          <p className="ed-hint">
            Card order follows the Products tab. Add a second row and point it at another
            collection to merchandise twice on one page.
          </p>
        </div>
      )}
    </section>
  );
}

function Press({ copy, editing, setCopy }: Ctx) {
  const setReview = (i: number, patch: Partial<{ quote: string; author: string }>) =>
    setCopy({ reviews: copy.reviews.map((r, n) => (n === i ? { ...r, ...patch } : r)) });
  return (
    <section className="press">
      <div className="container">
        <Editable className="press-kicker" editing={editing} label="Press kicker"
          value={copy.pressKicker} onChange={(v) => setCopy({ pressKicker: v })} />
        <div className="press-stage" style={{ position: "static", minHeight: 0 }}>
          {copy.reviews.map((r, i) => (
            <div className="review" key={i}
              style={editing ? { position: "static", opacity: 1, marginBottom: 18 } : { opacity: i === 0 ? 1 : 0 }}>
              <p className="review-quote">
                &ldquo;<Editable editing={editing} multiline label={`Quote ${i + 1}`}
                  value={r.quote} onChange={(v) => setReview(i, { quote: v })} />&rdquo;
              </p>
              <div className="review-author">
                — <Editable editing={editing} label={`Attribution ${i + 1}`}
                  value={r.author} onChange={(v) => setReview(i, { author: v })} />
              </div>
              {editing && (
                <button type="button" className="ed-add" style={{ marginTop: 6 }}
                  onClick={() => setCopy({ reviews: copy.reviews.filter((_, n) => n !== i) })}
                  disabled={copy.reviews.length === 1}>Remove quote</button>
              )}
            </div>
          ))}
        </div>
        {editing && (
          <button type="button" className="ed-add"
            onClick={() => setCopy({ reviews: [...copy.reviews, { quote: "New quote", author: "Publication" }] })}>
            + Add quote
          </button>
        )}
      </div>
    </section>
  );
}

export function renderSection(section: PageSection, ctx: Ctx) {
  switch (section.type) {
    case "hero": return <Hero {...ctx} />;
    case "valueProp": return <ValueProp {...ctx} />;
    case "cheers": return <Cheers {...ctx} />;
    case "featureBanner": return <FeatureBanner {...ctx} />;
    case "productRow": return <ProductRowSection {...ctx} section={section} />;
    case "press": return <Press {...ctx} />;
    default: return null;
  }
}

export { Link };
