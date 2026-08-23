"use client";

import { useEffect, useRef } from "react";

/**
 * A span of storefront text you can type into directly.
 *
 * contentEditable is deliberately UNCONTROLLED: writing React state back into
 * the node on every keystroke moves the caret to the end, which makes editing
 * mid-sentence impossible. So the DOM owns the text while focused, and the
 * `useEffect` only re-syncs when the value changes from OUTSIDE (undo, reset,
 * switching sections) — the `activeElement` guard is what stops it fighting
 * the caret.
 *
 * Changes lift on every input, not just on blur. Blur-only editing silently
 * drops whatever you typed if you navigate away or hit Save without clicking
 * out first, which is exactly when it matters. The guard above makes this
 * safe: state updating mid-type cannot rewrite the node you are typing in.
 */
export default function Editable({
  value,
  onChange,
  as: Tag = "span",
  className,
  editing,
  multiline = false,
  label,
}: {
  value: string;
  onChange: (next: string) => void;
  as?: React.ElementType;
  className?: string;
  editing: boolean;
  multiline?: boolean;
  label?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (el && el.textContent !== value && document.activeElement !== el) {
      el.textContent = value;
    }
  }, [value]);

  if (!editing) return <Tag className={className}>{value}</Tag>;

  return (
    <Tag
      ref={ref}
      className={`${className ?? ""} ed-text`.trim()}
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      aria-label={label}
      tabIndex={0}
      onInput={(e: React.FormEvent<HTMLElement>) => {
        const next = e.currentTarget.textContent ?? "";
        if (next !== value) onChange(next);
      }}
      onBlur={(e: React.FocusEvent<HTMLElement>) => {
        // Belt and braces: catches a paste or IME commit that did not raise
        // an input event.
        const next = e.currentTarget.textContent ?? "";
        if (next !== value) onChange(next);
      }}
      onKeyDown={(e: React.KeyboardEvent<HTMLElement>) => {
        // Enter commits on a single-line field instead of inserting a <br>,
        // which would smuggle markup into what is meant to be plain text.
        if (e.key === "Enter" && !multiline) {
          e.preventDefault();
          (e.currentTarget as HTMLElement).blur();
        }
        if (e.key === "Escape") {
          e.currentTarget.textContent = value;
          (e.currentTarget as HTMLElement).blur();
        }
      }}
      onPaste={(e: React.ClipboardEvent<HTMLElement>) => {
        // Paste as plain text — otherwise copying from another site drags its
        // fonts, colours and tags into the page.
        e.preventDefault();
        const text = e.clipboardData.getData("text/plain");
        document.execCommand("insertText", false, text);
      }}
    >
      {value}
    </Tag>
  );
}
