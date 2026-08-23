"use client";

import { useEffect, useState } from "react";
import {
  getAll, saveCopy, saveMerchandising, saveSections,
  SECTION_LABELS,
  type AdminData, type Merchandising, type PageSection, type SectionType, type SiteCopy,
} from "../store";
import { renderSection } from "./Sections";
import "./preview.css";

const ADDABLE: SectionType[] = ["hero", "valueProp", "cheers", "featureBanner", "productRow", "press"];

export default function AdminPreview() {
  const [data, setData] = useState<AdminData | null>(null);
  const [editing, setEditing] = useState(true);
  const [device, setDevice] = useState<"mobile" | "desktop">("mobile");
  const [dirty, setDirty] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => { void getAll().then(setData); }, []);
  if (!data) return <p className="admin-empty">Loading…</p>;

  const touch = (patch: Partial<AdminData>) => {
    setData({ ...data, ...patch });
    setDirty(true);
  };
  const setCopy = (patch: Partial<SiteCopy>) => touch({ copy: { ...data.copy, ...patch } });
  const setMerch = (patch: Partial<Merchandising>) => touch({ merchandising: { ...data.merchandising, ...patch } });
  const setSections = (sections: PageSection[]) => touch({ sections });

  const move = (i: number, dir: -1 | 1) => {
    const next = [...data.sections];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    setSections(next);
  };

  const addSection = (type: SectionType) => {
    // A repeatable section needs its own props bag, or a second product row
    // would edit the first one's title.
    const id = `${type}-${Date.now().toString(36)}`;
    const props = type === "productRow"
      ? { tag: "all" as const, title: data.copy.rowTitle, viewAll: data.copy.rowViewAll }
      : undefined;
    setSections([...data.sections, { id, type, enabled: true, props }]);
    setAdding(false);
  };

  const save = async () => {
    await Promise.all([
      saveCopy(data.copy),
      saveMerchandising(data.merchandising),
      saveSections(data.sections),
    ]);
    setDirty(false);
    setSavedAt(new Date().toLocaleTimeString());
  };

  const shown = data.sections.filter((s) => editing || s.enabled);

  return (
    <>
      <div className="ed-bar">
        <div className="ed-toggle" role="group" aria-label="Mode">
          <button type="button" aria-pressed={editing} onClick={() => setEditing(true)}>Edit</button>
          <button type="button" aria-pressed={!editing} onClick={() => setEditing(false)}>Preview</button>
        </div>
        <div className="ed-toggle" role="group" aria-label="Device">
          <button type="button" aria-pressed={device === "mobile"} onClick={() => setDevice("mobile")}>Mobile</button>
          <button type="button" aria-pressed={device === "desktop"} onClick={() => setDevice("desktop")}>Desktop</button>
        </div>
        <div className="ed-bar-right">
          {dirty
            ? <span className="ed-dirty">Unsaved changes</span>
            : savedAt && <span className="ed-saved">Saved {savedAt}</span>}
          <button type="button" className="admin-btn admin-btn--primary admin-btn--sm"
            onClick={save} disabled={!dirty}>Save</button>
        </div>
      </div>

      {editing && (
        <p className="ed-help">
          Click any text to type into it. Use the controls on each section to move, hide,
          or remove it. <b>Preview</b> shows the page exactly as a shopper sees it.
        </p>
      )}

      {/* The frame is width-constrained rather than an iframe: same document,
          so globals.css already applies and the real components render as-is.
          Container queries are not in play here, so a width is enough to see
          the mobile layout. */}
      <div className={`ed-frame ed-frame--${device}`}>
        <div className="ed-page">
          <div className="promo-bar">
            <span aria-hidden="true">✦</span>
            <span>{data.merchandising.promoText}</span>
            <span aria-hidden="true">✦</span>
          </div>

          {shown.map((section) => {
            const i = data.sections.indexOf(section);
            return (
              <div key={section.id}
                className={`ed-section ${editing ? "is-editing" : ""} ${section.enabled ? "" : "is-hidden"}`}>
                {editing && (
                  <div className="ed-section-bar">
                    <span className="ed-section-name">{SECTION_LABELS[section.type]}</span>
                    <button type="button" onClick={() => move(i, -1)} disabled={i === 0}
                      aria-label={`Move ${SECTION_LABELS[section.type]} up`}>↑</button>
                    <button type="button" onClick={() => move(i, 1)} disabled={i === data.sections.length - 1}
                      aria-label={`Move ${SECTION_LABELS[section.type]} down`}>↓</button>
                    <button type="button" onClick={() => setSections(
                      data.sections.map((s) => (s.id === section.id ? { ...s, enabled: !s.enabled } : s))
                    )} aria-label={section.enabled ? "Hide section" : "Show section"}>
                      {section.enabled ? "Hide" : "Show"}
                    </button>
                    <button type="button" className="ed-danger" onClick={() => {
                      if (window.confirm(`Remove the ${SECTION_LABELS[section.type]} section?`)) {
                        setSections(data.sections.filter((s) => s.id !== section.id));
                      }
                    }} aria-label="Remove section">✕</button>
                  </div>
                )}
                {renderSection(section, {
                  copy: data.copy,
                  merch: data.merchandising,
                  products: data.products,
                  editing,
                  setCopy,
                  setMerch,
                  setProps: (patch) => setSections(
                    data.sections.map((s) => (s.id === section.id ? { ...s, props: { ...s.props, ...patch } } : s))
                  ),
                })}
              </div>
            );
          })}
        </div>
      </div>

      {editing && (
        <div className="ed-addbar">
          {adding ? (
            <div className="ed-addmenu">
              {ADDABLE.map((t) => (
                <button key={t} type="button" className="admin-btn admin-btn--sm"
                  onClick={() => addSection(t)}>{SECTION_LABELS[t]}</button>
              ))}
              <button type="button" className="admin-btn admin-btn--sm" onClick={() => setAdding(false)}>Cancel</button>
            </div>
          ) : (
            <button type="button" className="admin-btn" onClick={() => setAdding(true)}>+ Add section</button>
          )}
        </div>
      )}
    </>
  );
}
