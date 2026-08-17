"use client";

import { useEffect, useRef, useState } from "react";
import { PHONE_MODELS } from "../data/products";

// One scrollable list of every supported phone model (iPhone + Pixel). Starts
// unselected (shows a prompt). Shared by the hero and the product page.
export default function ModelSelector({
  value,
  onChange,
  className = "",
  prefix = "Shop for",
}: {
  value: string;
  onChange: (model: string) => void;
  className?: string;
  prefix?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const toggle = () => setOpen((v) => !v);

  // Close on outside click / Escape (Escape returns focus to the trigger)
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Keyboard: focus the selected (or first) option when opened; arrows loop.
  useEffect(() => {
    if (!open) return;
    const rows = Array.from(
      menuRef.current?.querySelectorAll<HTMLButtonElement>(".model-option") ?? []
    );
    if (!rows.length) return;
    (rows.find((o) => o.classList.contains("is-selected")) ?? rows[0]).focus();
    const onKey = (e: KeyboardEvent) => {
      if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) return;
      e.preventDefault();
      const idx = rows.indexOf(document.activeElement as HTMLButtonElement);
      const next =
        e.key === "Home" ? 0 :
          e.key === "End" ? rows.length - 1 :
            e.key === "ArrowDown" ? (idx + 1) % rows.length :
              (idx - 1 + rows.length) % rows.length;
      rows[next].focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const pick = (m: string) => {
    onChange(m);
    setOpen(false);
  };

  return (
    <div className={`model-selector ${className}`.trim()} ref={rootRef}>
      <button
        type="button"
        ref={triggerRef}
        className="model-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={value ? `${prefix} ${value}. Click to change phone model.` : "Select your phone model"}
        onClick={toggle}
      >
        <svg className="model-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="6" y="2" width="12" height="20" rx="2" />
          <line x1="11" y1="18" x2="13" y2="18" />
        </svg>
        <span className="model-label">
          <span className="model-prefix">{prefix}</span>
          <span className={`model-value ${value ? "" : "is-placeholder"}`.trim()}>
            {value || "Select your phone"}
          </span>
        </span>
        <svg className={`model-chevron ${open ? "is-open" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="model-menu" ref={menuRef} role="listbox" aria-label="Phone models">
          {PHONE_MODELS.map((m) => (
            <button
              key={m}
              type="button"
              role="option"
              aria-selected={m === value}
              className={`model-option ${m === value ? "is-selected" : ""}`}
              onClick={() => pick(m)}
            >
              {m}
              {m === value && (
                <svg className="model-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
