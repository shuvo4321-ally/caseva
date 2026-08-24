"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveProduct } from "../store";
import { validateProduct, errorsOnly, slugify, type Issue } from "../validate";
import {
  CASE_TYPES,
  PHONE_BRANDS,
  type CaseType,
  type Product,
} from "../../data/products";

// Tags the storefront actually reads. `collections` is free-form by design, so
// this is a convenience list, not a restriction — hence the free-text field too.
const KNOWN_TAGS = ["new-arrivals", "sale", "bestsellers", "featured", "florals", "magsafe"];

const BLANK: Product = {
  slug: "", name: "", price: 32, images: [""], alt: "", description: "",
  caseType: "Impact Case", collections: [],
};

export default function ProductForm({
  initial,
  others,
}: {
  initial?: Product;
  others: Product[];
}) {
  const router = useRouter();
  const originalSlug = initial?.slug;
  const [p, setP] = useState<Product>(initial ? structuredClone(initial) : structuredClone(BLANK));
  // Slug auto-follows the name only until it's been typed in directly —
  // otherwise renaming a live product would silently break its URL.
  const [slugTouched, setSlugTouched] = useState(Boolean(initial));
  const [tried, setTried] = useState(false);
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof Product>(k: K, v: Product[K]) => setP((prev) => ({ ...prev, [k]: v }));

  const issues = validateProduct(p, others);
  const errors = errorsOnly(issues);
  const forField = (f: string) => issues.filter((i) => i.field === f);
  const invalid = (f: string) => tried && forField(f).some((i) => i.level === "error");

  const setName = (name: string) => {
    setP((prev) => ({ ...prev, name, slug: slugTouched ? prev.slug : slugify(name) }));
  };

  // ---- gallery ----
  const setImage = (i: number, v: string) =>
    setP((prev) => ({ ...prev, images: prev.images.map((x, n) => (n === i ? v : x)) }));
  const addImage = () => setP((prev) => ({ ...prev, images: [...prev.images, ""] }));
  const removeImage = (i: number) =>
    setP((prev) => ({ ...prev, images: prev.images.filter((_, n) => n !== i) }));
  const moveImage = (i: number, dir: -1 | 1) =>
    setP((prev) => {
      const next = [...prev.images];
      const j = i + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j], next[i]];
      return { ...prev, images: next };
    });

  // ---- compatibility ----
  // No fitsModels at all means "fits every phone"; an empty array would mean
  // "fits none", so unchecking the last box removes the field entirely.
  const fits = p.fitsModels;
  const toggleModel = (model: string) => {
    const current = fits ?? [];
    const next = current.includes(model) ? current.filter((m) => m !== model) : [...current, model];
    setP((prev) => ({ ...prev, fitsModels: next.length ? next : undefined }));
  };
  const toggleBrand = (models: string[]) => {
    const current = fits ?? [];
    const all = models.every((m) => current.includes(m));
    const next = all
      ? current.filter((m) => !models.includes(m))
      : [...new Set([...current, ...models])];
    setP((prev) => ({ ...prev, fitsModels: next.length ? next : undefined }));
  };

  const toggleTag = (tag: string) =>
    setP((prev) => ({
      ...prev,
      collections: prev.collections.includes(tag)
        ? prev.collections.filter((c) => c !== tag)
        : [...prev.collections, tag],
    }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (errors.length) {
      document.querySelector(".admin-issues")?.scrollIntoView({ block: "center" });
      return;
    }
    setSaving(true);
    await saveProduct(p, originalSlug);
    router.push("/admin/products");
  };

  return (
    <form onSubmit={submit} noValidate>
      {tried && issues.length > 0 && (
        <ul className="admin-issues">
          {issues.map((i, n) => (
            <li key={n} className={`admin-issue admin-issue--${i.level}`}>
              <b>{i.field}</b><span>{i.message}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="admin-panel">
        <h2>Basics</h2>

        <div className="admin-field">
          <label htmlFor="name">Name</label>
          <input id="name" type="text" value={p.name} aria-invalid={invalid("name")}
            onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="admin-field">
          <label htmlFor="slug">Slug</label>
          <input id="slug" type="text" value={p.slug} aria-invalid={invalid("slug")}
            onChange={(e) => { setSlugTouched(true); set("slug", e.target.value); }} />
          <p className="admin-hint">
            The product URL: /product/<b>{p.slug || "…"}</b>. It also keys cart lines, so
            changing it on a live product orphans anything already in a shopper&apos;s cart.
          </p>
        </div>

        <div className="admin-row admin-row--2">
          <div className="admin-field">
            <label htmlFor="price">Price</label>
            <input id="price" type="number" min={1} step={1} value={p.price} aria-invalid={invalid("price")}
              onChange={(e) => set("price", Number(e.target.value))} />
          </div>
          <div className="admin-field">
            <label htmlFor="salePrice">Sale price</label>
            <input id="salePrice" type="number" min={1} step={1}
              value={p.salePrice ?? ""} aria-invalid={invalid("salePrice")}
              onChange={(e) =>
                set("salePrice", e.target.value === "" ? undefined : Number(e.target.value))} />
            <p className="admin-hint">Leave blank for no sale. Setting it adds the SALE badge.</p>
          </div>
        </div>

        <div className="admin-field">
          <label htmlFor="caseType">Case type</label>
          <select id="caseType" value={p.caseType}
            onChange={(e) => set("caseType", e.target.value as CaseType)}>
            {CASE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div className="admin-field">
          <label htmlFor="description">Description</label>
          <textarea id="description" value={p.description}
            onChange={(e) => set("description", e.target.value)} />
        </div>

        <div className="admin-field">
          <label htmlFor="alt">Image alt text</label>
          <input id="alt" type="text" value={p.alt} onChange={(e) => set("alt", e.target.value)} />
          <p className="admin-hint">Describe the case for screen readers, e.g. “Pink bow-knot case”.</p>
        </div>

        <label className="admin-check">
          <input type="checkbox" checked={Boolean(p.isNew)}
            onChange={(e) => set("isNew", e.target.checked || undefined)} />
          Show the NEW badge
        </label>
        <label className="admin-check">
          <input type="checkbox" checked={Boolean(p.featured)}
            onChange={(e) => set("featured", e.target.checked || undefined)} />
          Eligible for the homepage hero fan
        </label>
      </div>

      <div className="admin-panel">
        <h2>Gallery</h2>
        <p className="admin-hint" style={{ marginBottom: 12 }}>
          Paths under <code>/public</code>. The <b>first</b> image is the card image on the
          shop grid and home row. <code>.png</code> renders as a packshot (contained, with a
          contact shadow); <code>.jpg</code> renders as a full-bleed lifestyle shot.
        </p>

        {p.images.map((src, i) => (
          <div className="admin-img-row" key={i}>
            <img className="admin-thumb" src={src || undefined} alt="" />
            <input type="text" value={src} placeholder="/pink-bow-hero.png"
              aria-label={`Image ${i + 1} path`}
              onChange={(e) => setImage(i, e.target.value)} />
            <div className="admin-img-actions">
              <button type="button" className="admin-btn admin-btn--sm" onClick={() => moveImage(i, -1)}
                disabled={i === 0} aria-label={`Move image ${i + 1} up`}>↑</button>
              <button type="button" className="admin-btn admin-btn--sm" onClick={() => moveImage(i, 1)}
                disabled={i === p.images.length - 1} aria-label={`Move image ${i + 1} down`}>↓</button>
              <button type="button" className="admin-btn admin-btn--sm admin-btn--danger"
                onClick={() => removeImage(i)} disabled={p.images.length === 1}
                aria-label={`Remove image ${i + 1}`}>✕</button>
            </div>
          </div>
        ))}

        <button type="button" className="admin-btn admin-btn--sm" onClick={addImage}>+ Add image</button>
      </div>

      <div className="admin-panel">
        <h2>Fits which phones</h2>
        <p className="admin-hint" style={{ marginBottom: 12 }}>
          Leave <b>everything unchecked</b> to mean “fits every phone”. That is the safe
          default while compatibility is still being filled in — it keeps a product visible
          under every brand rather than hiding it.
        </p>
        <p className="admin-hint" style={{ marginBottom: 12 }}>
          Currently: <b>{fits ? `${fits.length} model${fits.length === 1 ? "" : "s"}` : "fits all phones"}</b>
        </p>

        {PHONE_BRANDS.map((b) => (
          <fieldset key={b.brand} style={{ border: 0, padding: 0, margin: "0 0 14px" }}>
            <legend className="admin-legend">{b.brand}</legend>
            <button type="button" className="admin-btn admin-btn--sm" style={{ marginBottom: 8 }}
              onClick={() => toggleBrand(b.models)}>
              {b.models.every((m) => (fits ?? []).includes(m)) ? `Clear all ${b.brand}` : `Select all ${b.brand}`}
            </button>
            <div className="admin-checkgrid">
              {b.models.map((m) => (
                <label className="admin-check" key={m}>
                  <input type="checkbox" checked={(fits ?? []).includes(m)}
                    onChange={() => toggleModel(m)} />
                  {m}
                </label>
              ))}
            </div>
          </fieldset>
        ))}
      </div>

      <div className="admin-panel">
        <h2>Collections</h2>
        <p className="admin-hint" style={{ marginBottom: 12 }}>
          Merchandising tags. <code>new-arrivals</code>, <code>sale</code> and{" "}
          <code>bestsellers</code> drive the shop filter tabs and the homepage tiles.
        </p>
        <div className="admin-checkgrid">
          {KNOWN_TAGS.map((t) => (
            <label className="admin-check" key={t}>
              <input type="checkbox" checked={p.collections.includes(t)} onChange={() => toggleTag(t)} />
              {t}
            </label>
          ))}
        </div>
        <div className="admin-field" style={{ marginTop: 12 }}>
          <label htmlFor="tags">All tags (comma separated)</label>
          <input id="tags" type="text" value={p.collections.join(", ")}
            onChange={(e) =>
              set("collections", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} />
          <p className="admin-hint">Free-form — invent any tag you like here.</p>
        </div>
      </div>

      <div className="admin-save">
        <button type="submit" className="admin-btn admin-btn--primary" disabled={saving}>
          {saving ? "Saving…" : initial ? "Save changes" : "Create product"}
        </button>
        <button type="button" className="admin-btn" onClick={() => router.push("/admin/products")}>
          Cancel
        </button>
        {tried && errors.length > 0 && (
          <span style={{ alignSelf: "center", color: "var(--ad-danger)", fontSize: 13 }}>
            {errors.length} error{errors.length === 1 ? "" : "s"} to fix
          </span>
        )}
      </div>
    </form>
  );
}
