"use client";

import { useEffect, useState } from "react";
import { getMerchandising, saveMerchandising, type Merchandising } from "../store";
import { type FilterTag, type ShowcaseTile } from "../../data/products";

const ACCENTS: ShowcaseTile["accent"][] = ["blue", "pink", "cream", "lavender", "mint", "peach"];
const TAGS: FilterTag[] = ["all", "new-arrivals", "sale", "bestsellers"];

export default function AdminMerchandising() {
  const [m, setM] = useState<Merchandising | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => { void getMerchandising().then(setM); }, []);
  if (!m) return <p className="admin-empty">Loading…</p>;

  const touch = (next: Merchandising) => { setM(next); setSaved(false); };

  const setScene = (i: number, v: string) =>
    touch({ ...m, bannerScenes: m.bannerScenes.map((s, n) => (n === i ? v : s)) });
  const addScene = () => touch({ ...m, bannerScenes: [...m.bannerScenes, ""] });
  const removeScene = (i: number) =>
    touch({ ...m, bannerScenes: m.bannerScenes.filter((_, n) => n !== i) });

  const setTile = (i: number, patch: Partial<ShowcaseTile>) =>
    touch({ ...m, tiles: m.tiles.map((t, n) => (n === i ? { ...t, ...patch } : t)) });

  const save = async () => { await saveMerchandising(m); setSaved(true); };

  return (
    <>
      <h1>Merchandising</h1>
      <p className="admin-sub">The copy and imagery around the products.</p>

      <div className="admin-panel">
        <h2>Promo bar</h2>
        <div className="admin-field">
          <label htmlFor="promo">Announcement text</label>
          <input id="promo" type="text" value={m.promoText}
            onChange={(e) => touch({ ...m, promoText: e.target.value })} />
          <p className="admin-hint">
            The black strip above the nav on every page. Currently hardcoded in{" "}
            <code>app/components/PromoBar.tsx</code>.
          </p>
        </div>
        <div className="promo-bar" style={{ borderRadius: 8, marginTop: 12 }}>
          <span aria-hidden="true">✦</span>
          <span>{m.promoText}</span>
          <span aria-hidden="true">✦</span>
        </div>
      </div>

      <div className="admin-panel">
        <h2>Feature banner</h2>
        <p className="admin-hint" style={{ marginBottom: 12 }}>
          The “Ready to stand out?” stage on the home page, which snaps between these
          scenes. Shoot them <b>4:5</b> at <b>1600×2000</b> or larger, and keep the subject
          in the <b>central 50% vertically</b> — desktop crops the same file to 16:10 and
          discards the top and bottom quarters.
        </p>
        {m.bannerScenes.map((src, i) => (
          <div className="admin-img-row" key={i}>
            <img className="admin-thumb" src={src || undefined} alt="" />
            <input type="text" value={src} placeholder="/feature-banner.jpg"
              aria-label={`Scene ${i + 1} path`} onChange={(e) => setScene(i, e.target.value)} />
            <div className="admin-img-actions">
              <button type="button" className="admin-btn admin-btn--sm admin-btn--danger"
                onClick={() => removeScene(i)} disabled={m.bannerScenes.length === 1}
                aria-label={`Remove scene ${i + 1}`}>✕</button>
            </div>
          </div>
        ))}
        <button type="button" className="admin-btn admin-btn--sm" onClick={addScene}>+ Add scene</button>
      </div>

      <div className="admin-panel">
        <h2>Homepage tiles</h2>
        <p className="admin-hint" style={{ marginBottom: 12 }}>
          The bento tiles linking into the shop. <code>tag</code> decides which products the
          tile leads to; <code>accent</code> picks its pastel background.
        </p>
        {m.tiles.map((t, i) => (
          <div key={i} style={{ borderTop: i ? "1px solid var(--ad-line)" : 0, paddingTop: i ? 14 : 0, marginTop: i ? 14 : 0 }}>
            <div className="admin-row admin-row--2">
              <div className="admin-field">
                <label htmlFor={`tl${i}`}>Label</label>
                <input id={`tl${i}`} type="text" value={t.label}
                  onChange={(e) => setTile(i, { label: e.target.value })} />
              </div>
              <div className="admin-field">
                <label htmlFor={`tb${i}`}>Blurb</label>
                <input id={`tb${i}`} type="text" value={t.blurb}
                  onChange={(e) => setTile(i, { blurb: e.target.value })} />
              </div>
            </div>
            <div className="admin-row admin-row--2">
              <div className="admin-field">
                <label htmlFor={`tt${i}`}>Links to</label>
                <select id={`tt${i}`} value={t.tag}
                  onChange={(e) => setTile(i, { tag: e.target.value as FilterTag })}>
                  {TAGS.map((x) => <option key={x} value={x}>{x}</option>)}
                </select>
              </div>
              <div className="admin-field">
                <label htmlFor={`ta${i}`}>Accent</label>
                <select id={`ta${i}`} value={t.accent}
                  onChange={(e) => setTile(i, { accent: e.target.value as ShowcaseTile["accent"] })}>
                  {ACCENTS.map((x) => <option key={x} value={x}>{x}</option>)}
                </select>
              </div>
            </div>
            <div className="admin-img-row">
              <img className="admin-thumb" src={t.image || undefined} alt="" />
              <input type="text" value={t.image} aria-label={`Tile ${i + 1} image`}
                onChange={(e) => setTile(i, { image: e.target.value })} />
              <span />
            </div>
          </div>
        ))}
      </div>

      <div className="admin-save">
        <button type="button" className="admin-btn admin-btn--primary" onClick={save}>Save</button>
        {saved && <span style={{ alignSelf: "center", fontSize: 13, color: "var(--ad-dim)" }}>Saved.</span>}
      </div>
    </>
  );
}
