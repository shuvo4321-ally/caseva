# CASEVA — Project Handoff

**Last updated:** 2026-07-07
**Project:** CASEVA — e-commerce landing page for designer iPhone cases
**Location:** `C:\Users\Shuvo\OneDrive\Desktop\New folder`

---

## 1. Stack & Setup

| Item | Value |
|---|---|
| Framework | Next.js 16.2.6 (App Router, Turbopack) |
| UI | React 19, single page (`app/page.tsx`), global CSS (`app/globals.css`) |
| Animation | GSAP 3.15 + `@gsap/react` (`useGSAP`), plugins: ScrollTrigger, CustomEase |
| Fonts | DM Sans, Fraunces, Caveat (via `next/font/google` in `app/layout.tsx`) |
| Node | v24 |

```bash
npm run dev     # dev server on :3000 (LAN access allowed for 192.168.0.175 in next.config.mjs)
npm run build   # production build — ALWAYS run before considering a change done
```

**Git note:** working tree has uncommitted changes on `main` (`app/page.tsx`, `app/globals.css`, `app/layout.tsx`). Last commit: `38e845e "Save state before testing loader animations"`. All recent loader/mobile work described below is uncommitted.

---

## 2. File Map

Everything meaningful lives in three files:

- **`app/page.tsx`** (~1400 lines) — the entire site: intro loader, hero, all sections, all GSAP logic in one `useGSAP` block.
- **`app/globals.css`** — all styles; responsive breakpoints at `900px` and `640px` (mobile).
- **`app/layout.tsx`** — fonts, metadata, viewport.

Product images in `public/*.png` (5 case designs, reused across hero/collection/sections).

---

## 3. Architecture: the intro loader

Full-screen cinematic intro, plays **once per session** (`sessionStorage` key `caseva-intro-played`). To replay: clear that key and reload.

### Flag system (top of `page.tsx`)
- `LOADER_FX: "classic" | "cinematic" | "thread" | "lite" | "ripple"` — **currently `"ripple"`**. Each is a separate timeline branch; only edit the active branch.
- `COUNTER_STYLE: "digits" | "dots" | "none" | "line" | "ring" | "drop"` — **currently `"line"`** (hairline progress bar at viewport bottom).
- `EXIT_STYLE: "curtain" | "wipe" | "iris"` — **currently `"wipe"`**.

### "ripple" mode sequence (current, all times in timeline seconds)
1. **0 → 0.45** — blue drop falls from off-screen top (`power2.in`); its shape settles to a circle in the first 0.15s (separate tween — prevents visible mid-fall deformation).
2. **0.45 (`IMPACT_AT`)** — drop lands. Progress line fades in here (never before).
3. **0.48 → 0.58** — impact squash to `scaleY:0.55, scaleX:1.5` (~2.7x pancake — deliberately soft; 8.8x looked like a UFO).
4. **0.48 → 1.35** — revealer wave (thicker stroke circle) expands 0→r96 on the bespoke `casevaRipple` CustomEase; each of the 5 rings switches on while hidden under the wave band. The drop's fade is driven by the wave's radius (`front.r` 6→18) inside the wave's `onUpdate` — not a separate timer.
5. **1.35 → 1.45** — wave dissolves.
6. **1.45 (`THREAD_AT`)** — 5 cream "part-rects" grow (dur 0.16, stagger 0.02 — all open by ~1.7s) carving the C-gap; CASEVA letters slide in **simultaneously** (x-slide `power2.out` + opacity `power3.in`, both dur 0.32, stagger 0.08). No flat delay — safety comes from the ease-in opacity curve staying ≈invisible until rects clear. **Do not reintroduce a LETTER_DELAY** (user rejects any perceptible pause — see §6).
7. **2.4** — progress line hits 100%; fades at 2.45.
8. **2.7 →** — wipe exit; hero content staggers in (PHASE 6).

Failsafe: 9s `setTimeout` kills the timeline and force-finishes the handoff if the tab was throttled. Click anywhere = 6x fast-forward skip.

### Mouse-tilt parallax during intro
Two independent `quickTo` layers (ring group vs wordmark, counter-tilted) — disabled at handoff via `disableTilt()`.

---

## 4. Architecture: the page sections

Order: promo bar → nav → **hero** (case fan + model selector) → value-prop → cheers → collection (horizontal pinned scroll) → comparison → testimonial → subscribe → press → footer.

**Adding a new case (owner workflow):** drop the PNG in `public/`, add ONE entry to the `CASES` catalog at the top of `page.tsx` (`{ src, alt, name, price, isNew: true }`). `featured: true` puts it in the hero fan (first five featured win; fan geometry lives in `FAN_SLOTS` by slot index, not per case). `isNew` floats it to the front of the collection with a NEW badge. Once the catalog exceeds 5, an auto-counting "+N more designs" chip appears under the hero CTA. The pinned collection scroll measures its own width — no animation edits needed.

Key mechanics:
- **Hero case fan:** 5 absolutely-positioned `.case-fan-N` images. **Mobile (≤640px) shows the SAME 5-case fan as desktop, scaled down** (user request 2026-07-09 — reverted the earlier 3-case trio experiment). The mobile media query overrides only width/height/left/top/z-index on `.case-fan-0..4`; rotation (±30/±15/0) and `transform-origin: bottom center` are inherited from the desktop rules, so the fan orientation matches the web version. Outer cards (slots 0/4, ±30°) bleed off-screen; their transparent margins are clipped by `body { overflow-x: hidden }`. Verified symmetric + edge-filling at 360px (outer boxes centred at ±157 from midline). **All 5 hero photos are 2:3 (`/blue-case-hero.png`, `/white-rose-hero.png`, `/pink-case-hero.png`, `/pink-bow-hero.png`, `/tulip-hero.png`)** so they fill the 2:3 boxes undistorted — ⚠️ `.case` IS the `<img>` (object-fit defaults to `fill`), so any replacement photo MUST be 2:3 or it stretches. Catalog order = fan slot order (Blue -30, Rose -15, Pink 0/centre, Bow +15, Tulip +30). Positions tuned against real `getBoundingClientRect()` — don't position by raw width math.
- **Hero scroll parallax (`setupCaseParallax` in page.tsx):** cases drift outward/down as the hero scrolls away. **Mobile mirrors desktop's outward-opening logic scaled to card size: x×0.3 (outer ~60px, freely bleeds past screen edges mid-scroll — that bleed IS the desktop look; an x×0.03 "no-clip" pass read as vertical-only motion and was rejected), y×0.2, rotation×1.5 (same as desktop), scrub `true`** (desktop: full `data-x/y`, rotation×1.5, scrub 0.6). Numeric scrub on mobile caused visible drift-after-scroll-stop on a real Android device — keep it `true`. Clipping only matters at REST, not during scroll-away. Rotation base is read via `gsap.getProperty(el, "rotation")`, NOT `data-rotate`, because mobile CSS overrides the outer cards' angle. `ScrollTrigger.config({ ignoreMobileResize: true })` is set globally (address-bar resizes were shifting trigger positions post-gesture), and the mobile hero min-height uses `100svh` (not dvh) so the hero doesn't grow when the URL bar collapses. ⚠️ **This tween must only be created AFTER the entrance animation completes** (it's called from the intro's `finishIntro()` or the skip-path timeline's `onComplete`. Both target x/y/rotate on the same elements; creating them concurrently causes GSAP `overwrite:"auto"` to kill the entrance mid-flight and inherit a race-condition start value — this was a real shipped bug ("massive structure bug… drift effect")).
- **Model selector:** listbox dropdown, persists to `localStorage` (`caseva-iphone-model`), scrolls to `#collection` on select.
- **Body background wash:** per-section ScrollTriggers tween `document.body` background between pastels. The `.value-prop` trigger starts at `top bottom-=100` (buffer against dvh razor-edge misfire) and `.footer` ends at `bottom bottom` (last section can't reach `top 40%`).
- **Collection:** pinned horizontal scroll (`ScrollTrigger` pin + `x` scrub).
- Mobile shadow: `.case` drop-shadow blur reduced 40px→16px inside the 640px media query (rasterization cost during scroll animation).

---

## 5. Verification methodology (IMPORTANT — hard-won lessons)

The preview-tool environment throttles hidden tabs: GSAP timelines freeze at frame 0, screenshots come back stale. Live sampling is unreliable. What actually works:

1. **Trust real GSAP execution, not hand-math.** To verify timing/positions: temporarily attach `onUpdate` to the real tween pushing `{t: intro.time(), ...DOM reads}` into a `window.__trace` array, reload, let it run, read the array back, **then remove the instrumentation**. Hand-computed "forced frames" produced false confidence twice (see §6 gotchas).
2. **Forced-frame screenshots** (manually setting styles then screenshotting) are fine for *visual composition* checks, but not as proof that the animation code does what you think.
3. Always `sessionStorage.removeItem('caseva-intro-played')` before ending a session so the user sees the intro fresh; set it to `"true"` to skip the intro while inspecting static layout.
4. `npm run build` after every change — check for "Compiled successfully" AND "Finished TypeScript".
5. The user tests on a real phone via LAN (`192.168.0.175:3000`) — treat their screenshots as ground truth over preview screenshots.

---

## 6. Gotchas that already bit us (do not re-learn these)

1. **GSAP `attr:{}` needs kebab-case SVG attribute names.** `attr: { strokeWidth: 11 }` silently creates a bogus camelCase attribute and the real `stroke-width` never animates. Use `attr: { "stroke-width": 11 }`. (Shipped bug: the wave appeared as a full-width dot at birth.)
2. **SVG `transform-origin` percentages** resolve against the viewBox by default, not the element's own bbox — manual CSS-transform tests can mislead vs. what GSAP actually renders.
3. **Never create two tweens targeting the same properties on the same element without sequencing them** (`overwrite:"auto"` race — see hero parallax note in §4).
4. **Function-valued attr tweens**: correct form is `attr: { x: (i) => value }` (per-property function), NOT `attr: (i) => ({x: value})`.
5. **User's pacing taste:** any perceptible dead pause in the loader is an "eyesore" — even 0.26s. Prefer zero-delay starts with ease-in curves shaping the risky property. Also applies generally: stacked "nothing is changing" moments compound.
6. **Mobile parallax amplitude:** 3px horizontal travel is invisible; ~7px is the sweet spot that reads as motion while fitting the ~13px margins. Scrub of 2 lags too much to register during a normal scroll gesture — 1.2 is the ceiling.
7. **Letters vs. gap-parting:** the C-gap channel only counts as "open" when **all five** rects have grown, not just the outermost. Any letter-reveal timing must be checked against the LAST rect (index 4).
8. Progress indicators (`line`/`ring`/`drop` counter styles) have **no opacity:0 default in CSS** — they must be `gsap.set(..., {opacity:0})` in JS and faded in at `IMPACT_AT`, or they're visible before the drop lands.

---

## 7. Current state & open threads

- ✅ Loader (ripple mode) — user signed off: "current version is perfect".
- ✅ Mobile 5-card hero fan (wide desktop-like spread), rect-verified at 360/375/430 wide.
- ✅ Structural parallax race fixed; entrance settles to y:0 then parallax takes over.
- ✅ Vertical drift after scroll-stop fixed (scrub `true` + `ignoreMobileResize` + svh hero).
- 🔶 **Awaiting user confirmation on a real device**: the 5-card fan composition, and that the drift fix + reduced x-travel (×0.03) feel right.
- 🔶 An abandoned experiment: making the squashed drop visually "become" the first ring via wave-radius-driven fade is **in** (works), but a deeper pancake→ring merge (position-anchored) was dropped due to the SVG transform-origin issue (§6.2). User said current is fine.
- ⬜ Uncommitted work — consider committing before further big changes.

## 8. Memory files (assistant-side)

Cross-session notes live in `C:\Users\Shuvo\.claude\projects\C--Users-Shuvo-OneDrive-Desktop-New-folder\memory\`:
- `project_preview_verification_quirks.md` — port-3000 conflicts, frozen-tab screenshots, hand-math traps, onUpdate-trace method.
- `feedback_caseva_loader_pacing.md` — the "no perceptible delays" rule and how to satisfy it.
- `feedback_no_worktree_edits.md` — always edit the main folder, never `.claude/worktrees/...` (user's dev server runs from main).
