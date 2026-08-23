"use client";

import { useEffect, useState } from "react";
import { getCopy, saveCopy, type SiteCopy, type Review } from "../store";

// The value-prop line renders two words in brand pink. Rather than expose HTML
// to the editor, the stored string marks them {{like this}} and the preview
// below shows what that will look like.
const renderHighlights = (text: string) =>
  text.split(/(\{\{[^}]*\}\})/g).map((part, i) =>
    part.startsWith("{{") && part.endsWith("}}") ? (
      <span key={i} className="vp-highlight">{part.slice(2, -2)}</span>
    ) : (
      <span key={i}>{part}</span>
    )
  );

export default function AdminContent() {
  const [c, setC] = useState<SiteCopy | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => { void getCopy().then(setC); }, []);
  if (!c) return <p className="admin-empty">Loading…</p>;

  const set = <K extends keyof SiteCopy>(k: K, v: SiteCopy[K]) => {
    setC({ ...c, [k]: v });
    setSaved(false);
  };

  const setReview = (i: number, patch: Partial<Review>) =>
    set("reviews", c.reviews.map((r, n) => (n === i ? { ...r, ...patch } : r)));
  const addReview = () => set("reviews", [...c.reviews, { quote: "", author: "" }]);
  const removeReview = (i: number) => set("reviews", c.reviews.filter((_, n) => n !== i));
  const moveReview = (i: number, dir: -1 | 1) => {
    const next = [...c.reviews];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    set("reviews", next);
  };

  const field = (
    key: keyof SiteCopy,
    label: string,
    hint?: string,
    multiline = false
  ) => (
    <div className="admin-field">
      <label htmlFor={key}>{label}</label>
      {multiline ? (
        <textarea id={key} value={c[key] as string}
          onChange={(e) => set(key, e.target.value as SiteCopy[typeof key])} />
      ) : (
        <input id={key} type="text" value={c[key] as string}
          onChange={(e) => set(key, e.target.value as SiteCopy[typeof key])} />
      )}
      {hint && <p className="admin-hint">{hint}</p>}
    </div>
  );

  const save = async () => { await saveCopy(c); setSaved(true); };

  return (
    <>
      <h1>Content</h1>
      <p className="admin-sub">Every word on the site that isn&apos;t a product.</p>

      <div className="admin-panel">
        <h2>Hero</h2>
        {field("heroHeadline", "Headline",
          "The h1 on the home page. The site inserts its own line break before “to keep on” on wide screens.")}
        {field("heroSelectorLabel", "Model selector label",
          "Shown before a phone is chosen. Picking a model sends the shopper to /shop.")}
        {field("heroCta", "Button label")}
      </div>

      <div className="admin-panel">
        <h2>Value proposition</h2>
        {field("valueProp", "Statement",
          "Wrap a phrase in {{double braces}} to highlight it in brand pink.", true)}
        <div style={{ marginTop: 12, padding: "14px 16px", background: "#fff", borderRadius: 10, border: "1px solid var(--ad-line)" }}>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6 }}>{renderHighlights(c.valueProp)}</p>
        </div>
      </div>

      <div className="admin-panel">
        <h2>Feature banner</h2>
        {field("featureTitle", "Title")}
        {field("featureDesc", "Description", undefined, true)}
        {field("featureCta", "Button label")}
      </div>

      <div className="admin-panel">
        <h2>Product row &amp; shop</h2>
        {field("rowTitle", "Home row heading", "Sits above the bestsellers carousel.")}
        {field("rowViewAll", "“View all” link label")}
        {field("shopTitleAll", "Shop page title",
          "Used when no brand filter is applied. With one, the page titles itself “iPhone Cases” or “Pixel Cases”.")}
      </div>

      <div className="admin-panel">
        <h2>Press quotes</h2>
        {field("pressKicker", "Kicker", "The small line above the quotes.")}
        {c.reviews.map((r, i) => (
          <div key={i} style={{ borderTop: i ? "1px solid var(--ad-line)" : 0, paddingTop: i ? 14 : 10, marginTop: i ? 14 : 0 }}>
            <div className="admin-field">
              <label htmlFor={`q${i}`}>Quote {i + 1}</label>
              <textarea id={`q${i}`} value={r.quote}
                onChange={(e) => setReview(i, { quote: e.target.value })} />
            </div>
            <div className="admin-field">
              <label htmlFor={`a${i}`}>Attributed to</label>
              <input id={`a${i}`} type="text" value={r.author}
                onChange={(e) => setReview(i, { author: e.target.value })} />
            </div>
            <div className="admin-actions">
              <button type="button" className="admin-btn admin-btn--sm" onClick={() => moveReview(i, -1)}
                disabled={i === 0}>↑ Earlier</button>
              <button type="button" className="admin-btn admin-btn--sm" onClick={() => moveReview(i, 1)}
                disabled={i === c.reviews.length - 1}>↓ Later</button>
              <button type="button" className="admin-btn admin-btn--sm admin-btn--danger"
                onClick={() => removeReview(i)} disabled={c.reviews.length === 1}>Remove</button>
            </div>
          </div>
        ))}
        <button type="button" className="admin-btn admin-btn--sm" style={{ marginTop: 12 }}
          onClick={addReview}>+ Add quote</button>
      </div>

      <div className="admin-save">
        <button type="button" className="admin-btn admin-btn--primary" onClick={save}>Save</button>
        {saved && <span style={{ alignSelf: "center", fontSize: 13, color: "var(--ad-dim)" }}>Saved.</span>}
      </div>
    </>
  );
}
