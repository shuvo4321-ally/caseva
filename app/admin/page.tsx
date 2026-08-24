"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAll, exportAll, exportProductsTs, resetToSeed, type AdminData } from "./store";
import { validateProduct, type Issue } from "./validate";

type Sweep = { slug: string; name: string; issues: Issue[] };

export default function AdminOverview() {
  const [data, setData] = useState<AdminData | null>(null);
  const [out, setOut] = useState<{ label: string; text: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => { void getAll().then(setData); }, []);

  if (!data) return <p className="admin-empty">Loading…</p>;

  // Run every product through the same rules the editor uses, so problems are
  // visible from here instead of only when you happen to open that product.
  const sweep: Sweep[] = data.products
    .map((p) => ({
      slug: p.slug,
      name: p.name,
      issues: validateProduct(p, data.products.filter((o) => o.slug !== p.slug)),
    }))
    .filter((r) => r.issues.length > 0);

  const errors = sweep.reduce((n, r) => n + r.issues.filter((i) => i.level === "error").length, 0);
  const warnings = sweep.reduce((n, r) => n + r.issues.filter((i) => i.level === "warning").length, 0);
  const models = data.phoneBrands.reduce((n, b) => n + b.models.length, 0);

  const show = async (label: string, fn: () => Promise<string>) => {
    setOut({ label, text: await fn() });
    setCopied(false);
  };

  const copy = async () => {
    if (!out) return;
    try {
      await navigator.clipboard.writeText(out.text);
      setCopied(true);
    } catch {
      /* clipboard blocked — the textarea below is selectable as a fallback */
    }
  };

  const reset = async () => {
    if (!window.confirm("Discard every admin edit and reload the catalog from products.ts?")) return;
    setData(await resetToSeed());
    setOut(null);
  };

  return (
    <>
      <h1>Overview</h1>
      <p className="admin-sub">Everything in the store, editable in one place.</p>

      <div className="admin-note admin-note--info">
        <b>Edits live in this browser only.</b> The storefront still reads{" "}
        <code>app/data/products.ts</code>, which is baked in at build time. Use{" "}
        <b>Export products.ts</b> below and paste the result over that array to
        publish changes — or point <code>app/admin/store.ts</code> at your API.
      </div>

      <div className="admin-stats">
        <div className="admin-stat"><b>{data.products.length}</b><span>Products</span></div>
        <div className="admin-stat"><b>{models}</b><span>Phone models</span></div>
        <div className="admin-stat"><b>{data.orders.length}</b><span>Orders (mock)</span></div>
        <div className="admin-stat"><b>{errors}</b><span>Errors to fix</span></div>
      </div>

      <div className="admin-panel">
        <h2>Catalog health</h2>
        {sweep.length === 0 ? (
          <p className="admin-hint">No problems found across {data.products.length} products.</p>
        ) : (
          <>
            <p className="admin-hint" style={{ marginBottom: 12 }}>
              {errors} error{errors === 1 ? "" : "s"} and {warnings} warning{warnings === 1 ? "" : "s"}.
              Errors will break something on the storefront; warnings are worth a look.
            </p>
            <ul className="admin-issues">
              {sweep.flatMap((r) =>
                r.issues.map((i, n) => (
                  <li key={`${r.slug}-${n}`} className={`admin-issue admin-issue--${i.level}`}>
                    <b>
                      <Link href={`/admin/products/${r.slug}`} style={{ color: "inherit" }}>
                        {r.name}
                      </Link>
                    </b>
                    <span>{i.message}</span>
                  </li>
                ))
              )}
            </ul>
          </>
        )}
      </div>

      <div className="admin-panel">
        <h2>Export &amp; reset</h2>
        <div className="admin-actions">
          <button type="button" className="admin-btn admin-btn--primary"
            onClick={() => show("products.ts", exportProductsTs)}>
            Export products.ts
          </button>
          <button type="button" className="admin-btn"
            onClick={() => show("Everything (JSON)", exportAll)}>
            Export all as JSON
          </button>
          <button type="button" className="admin-btn admin-btn--danger" onClick={reset}>
            Reset to seed
          </button>
        </div>

        {out && (
          <div style={{ marginTop: 16 }}>
            <div className="admin-actions" style={{ marginBottom: 8 }}>
              <strong style={{ marginRight: "auto" }}>{out.label}</strong>
              <button type="button" className="admin-btn admin-btn--sm" onClick={copy}>
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <textarea className="admin-code" readOnly value={out.text}
              onFocus={(e) => e.currentTarget.select()} />
            {out.label === "products.ts" && (
              <p className="admin-hint">
                Paste this over the <code>PRODUCTS</code> array in{" "}
                <code>app/data/products.ts</code>. The <code>Product</code> type and every
                helper around it stay as they are.
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
}
