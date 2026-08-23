"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CustomEase } from "gsap/CustomEase";
import { MODEL_STORAGE_KEY } from "../data/products";
import CollectionShowcase from "../components/CollectionShowcase";
import ModelSelector from "../components/ModelSelector";

gsap.registerPlugin(ScrollTrigger, CustomEase, useGSAP);

// Bespoke ease (hand-tuned bezier curve, not a stock power/back preset) —
// registered once at module load. Drives the wave's outward spread: a beat
// of gather, then flows out; never overshoots (water doesn't bounce backward).
CustomEase.create("casevaRipple", "M0,0 C0.22,0.61 0.36,1 1,1");

// ============ INTRO EXIT STYLE ============
// Change this to pick which exit you want:
//   "curtain" → top half slides UP, bottom half slides DOWN (classic film-studio bumper)
//   "wipe"    → entire overlay slides UP off-screen (Apple/Stripe modern feel)
//   "iris"    → growing transparent circle in the center reveals hero through the overlay
const EXIT_STYLE: "curtain" | "wipe" | "iris" = "wipe";

// ============ LOADER FLAVOR ============
//   "classic"   → the clean radar draw (rings trace one-by-one, center → out)
//   "cinematic" → classic draw + depth scale-in, a gentle spin and a wordmark
//                 overshoot. No spark dots, no pulse, no end beat.
//   "thread"    → (masked) rings draw, then CASEVA threads through; each ring's gap
//                 parts outer → inner, locked to one clock. Heaviest — animates masks.
//   "lite"      → SAME look as "thread" (per-ring parting, straight edges) but each
//                 ring is parted by a stacked cream rect, not an SVG mask — far lighter.
//                 PHASE 1 is the radar sweep (rings materialize behind a sonar hand).
//   "ripple"    → lite parting + RIPPLE GENESIS: a drop falls to the center and the
//                 rings are born from the impact, expanding outward like wavefronts.
// Flip back to "classic" to instantly revert. Pure GSAP — no deps.
const LOADER_FX: "classic" | "cinematic" | "thread" | "lite" | "ripple" = "ripple";

// ============ LOADER COUNTER ============
//   "digits" → rolling odometer 000→100% (with the magnifier lens)
//   "dots"   → five formation dots — each lights the instant its ring is
//              revealed by the ripple wave (true construction progress)
const COUNTER_STYLE: "digits" | "dots" | "none" | "line" | "ring" | "drop" = "line";

// Fan geometry belongs to the SLOT (position in the fan), not the case —
// these are the hand-tuned rotate/parallax tuples the CSS classes expect.
const FAN_SLOTS = [
  { rotate: -30, x: -200, y: 60 },
  { rotate: -15, x: -100, y: 30 },
  { rotate: 0, x: 0, y: 0 },
  { rotate: 15, x: 100, y: 30 },
  { rotate: 30, x: 200, y: 60 },
];

// Hero fan — CURATED, not derived from the catalog.
//
// It used to map over featured products and take each one's images[0], which
// tied the hero's art direction to product identity: restyling the fan meant
// changing a product's primary image, and that image is also its card on
// /shop, its product page and its cart thumbnail. The fan is decorative
// (.cases sets pointer-events: none, so nothing here links anywhere), so it
// should be chosen for how the five look together, independent of the catalog.
//
// Order runs left to right; index 2 is the large centre case. Keep the list
// FAN_SLOTS.length long — extra entries are ignored, missing ones leave a gap.
const heroCases = [
  { src: "/white-rose-fan.png", alt: "White rose floral case", name: "white-rose" },
  { src: "/blue-floral-fan.png", alt: "Blue floral case", name: "blue-floral" },
  { src: "/pink-rose-hero.png", alt: "Pink ditsy rose case", name: "pink-rose" },
  { src: "/blossom-fan.png", alt: "Pressed blossom case", name: "blossom" },
  { src: "/tulip-hero.png", alt: "Tulip pattern case", name: "tulip" },
].slice(0, FAN_SLOTS.length);

const benefits = [
  { icon: "🛡️", label: "Drop Protection" },
  { icon: "✨", label: "Premium Finish" },
  { icon: "🧲", label: "MagSafe Ready" },
  { icon: "🌿", label: "Eco Materials" },
  { icon: "📱", label: "Slim Profile" },
  { icon: "💖", label: "Designed in CA" },
];

const reviews = [
  { quote: "Honestly the prettiest case I've owned. Slim but solid.", author: "Vogue" },
  { quote: "The only phone case that makes me want to take it off less.", author: "Harper's Bazaar" },
  { quote: "Stylish, durable, sustainable — a rare combo.", author: "Refinery29" },
];

function CounterDigits() {
  return (
    <>
      <span className="ic-digit">
        <span className="ic-col ic-col-h">
          <span>0</span>
          <span>1</span>
        </span>
      </span>
      <span className="ic-digit">
        <span className="ic-col ic-col-t">
          {Array.from({ length: 11 }).map((_, i) => (
            <span key={i}>{i % 10}</span>
          ))}
        </span>
      </span>
      <span className="ic-digit">
        <span className="ic-col ic-col-o">
          {Array.from({ length: 101 }).map((_, i) => (
            <span key={i}>{i % 10}</span>
          ))}
        </span>
      </span>
      <span className="ic-pct">%</span>
    </>
  );
}

export default function Home() {
  const root = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [selectedModel, setSelectedModel] = useState<string>(""); // unselected → "Select your phone" until the shopper picks brand + model

  const handleModelSelect = (model: string) => {
    setSelectedModel(model);
    try {
      window.localStorage.setItem(MODEL_STORAGE_KEY, model);
    } catch {
      /* ignore */
    }
    // Picking a phone is a shopping intent — send them straight to the shop
    // (it reads the same storage key, so the device carries over).
    router.push("/shop");
  };

  // The scroll colour-wash paints document.body's background inline. Clear it
  // when this page unmounts so navigating to another route (e.g. a product
  // page) doesn't inherit whatever wash colour was showing — the body falls
  // back to the CSS site cream (#fbf3dc), which matches the header.
  useEffect(() => {
    return () => {
      document.body.style.removeProperty("--page-ground");
    };
  }, []);

  useGSAP(
    () => {
      // ============ HERO ANIMATIONS (reduced-motion-aware) ============
      // Mobile browsers (Android Chrome especially) fire a resize when the
      // address bar collapses right after a scroll gesture. A full
      // ScrollTrigger.refresh() at that moment shifts every trigger's
      // start/end, so scrubbed tweens glide to new values with the finger
      // already off the screen. Ignore bar-only resizes entirely.
      ScrollTrigger.config({ ignoreMobileResize: true });

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Non-GSAP side effects (timeouts) registered here are torn down when
        // the matchMedia context reverts (unmount / dev hot-reload)
        const cleanupFns: Array<() => void> = [];

        gsap.utils.toArray<HTMLElement>(".case").forEach((el) => {
          gsap.set(el, { rotate: Number(el.dataset.rotate || 0) });
        });

        // ----- HERO PARALLAX: cases drift outward on scroll -----
        // MUST be created only AFTER the entrance animation (below) has fully
        // settled — both target x/y/rotate on the same .case elements. GSAP's
        // default overwrite:"auto" kills the OLDER tween's control of a
        // property the instant a new tween targets it, so creating this
        // scroll-linked tween while the entrance is still mid-flight silently
        // cuts the entrance short and hands this tween an implicit "from"
        // value that's whatever transient state the entrance happened to be
        // in at that exact instant — a race condition, not a fixed value.
        // That's what was producing the inconsistent "drift"/"rough motion"
        // symptoms. Explicit fromTo (not implicit-from `to()`) plus deferring
        // creation until entrance-complete (see call sites below) removes the
        // race entirely: the parallax always starts from a known x:0/y:0.
        const setupCaseParallax = () => {
          const isMobileFan = window.innerWidth <= 640;
          gsap.utils.toArray<HTMLElement>(".case").forEach((el) => {
            const dataX = Number(el.dataset.x || 0);
            const dataY = Number(el.dataset.y || 0);
            // Resting rotation comes from CSS, and the mobile breakpoint
            // overrides the outer cards to ±20° (data-rotate still says ±30)
            // — read the real rendered value, not the data attribute. Safe:
            // this only runs after the entrance has fully settled, so the
            // current rotation IS the CSS resting value.
            const baseRotate = Number(gsap.getProperty(el, "rotation"));
            gsap.fromTo(el,
              { x: 0, y: 0, rotate: baseRotate },
              {
                // Mobile mirrors the desktop "fan opens outward" logic, scaled
                // to card size (~0.37 of desktop): outer cards travel ~60px
                // sideways and rotation amplifies ×1.5, freely bleeding past
                // the screen edges mid-scroll — that bleed IS the desktop look
                // (desktop's fan bleeds off the right edge even at rest).
                // An earlier ×0.03 pass kept everything inside the ~4px rest
                // margins, which capped travel at 6px — below the visibility
                // threshold, so the motion read as vertical-only. Clipping
                // only matters at REST; while scrolling away it reads as the
                // fan spreading open.
                x: isMobileFan ? dataX * 0.3 : dataX,
                y: isMobileFan ? dataY * 0.2 : dataY,
                rotate: baseRotate * 1.5,
                ease: "none",
                force3D: true, // own GPU layer — transforms composite instead of repaint
                scrollTrigger: {
                  trigger: ".hero",
                  start: "top top",
                  end: "bottom top",
                  // Mobile was hard-locked (scrub: true), which snaps straight
                  // to each scroll position — a fast fling arrives as coarse
                  // jumps, so the fan visibly stepped. A SMALL numeric scrub
                  // smooths those deltas. Earlier attempts used large values
                  // (1.2 / 2) whose long catch-up read as free-floating drift
                  // after the finger lifted; 0.3 settles in ~a fifth of that,
                  // fast enough to feel locked while still filtering the jerk.
                  scrub: isMobileFan ? 0.3 : 0.6,
                },
              }
            );
          });
        };

        // ----- Determine whether to play the intro this session -----
        let showIntro = true;
        try {
          showIntro = window.sessionStorage.getItem("caseva-intro-played") !== "true";
        } catch { /* sessionStorage unavailable */ }

        const overlay = document.querySelector<HTMLElement>(".intro-overlay");

        if (!showIntro || !overlay) {
          // Skip intro entirely — hide overlay and run normal entrance
          if (overlay) gsap.set(overlay, { display: "none" });

          gsap.from(".hero-content > *", {
            opacity: 0, y: 24, duration: 0.6, stagger: 0.1, ease: "power3.out", delay: 0.2,
          });
          // Wrapped in a timeline so onComplete fires exactly ONCE for the
          // whole staggered group (a vars-level onComplete on a staggered
          // tween fires once per staggered child instead) — that single
          // "entrance is truly done" signal is what setupCaseParallax needs.
          gsap.timeline({ onComplete: setupCaseParallax }).from(".case", {
            opacity: 0, y: 40, scale: 0.95, duration: 0.6,
            stagger: { each: 0.08, from: "center" }, ease: "power3.out", delay: 0.4,
          });
        } else {
          // ============ FULL-SCREEN CINEMATIC INTRO ============
          // "A radar pulse being born" — rings trace themselves center → out as full
          // circles with a glowing ink stroke, the C-gap breathes open, CASEVA slides
          // in from the right, then one giant heartbeat pulse. ~3s brand moment.

          // Prep ring stroke-dasharray so each "draws" from nothing.
          // +2 overlap: getTotalLength() runs a hair short of the rendered
          // circumference, which leaves a hairline seam where the circle closes
          const ringEls = gsap.utils.toArray<SVGCircleElement>(".intro-ring");
          if (LOADER_FX !== "ripple") {
            // dash-draw prep — ripple mode grows whole rings via scale instead
            ringEls.forEach((ring) => {
              const len = ring.getTotalLength() + 2;
              gsap.set(ring, {
                strokeDasharray: len,
                strokeDashoffset: len,
                opacity: 0,
              });
            });
          }
          gsap.set(".intro-wordmark", { opacity: 0, x: 70 });

          // The loader owns the screen: kill the browser's deferred scroll
          // restoration (it would yank the page down after the intro), start
          // at the top, and lock scrolling behind the overlay
          if ("scrollRestoration" in history) history.scrollRestoration = "manual";
          window.scrollTo(0, 0);
          // Lock BOTH html + body so no scrollbar ("slider") shows behind the loader
          document.documentElement.style.overflow = "hidden";
          document.body.style.overflow = "hidden";

          // Hide hero content + cases until handoff
          gsap.set(".hero-content > *", { opacity: 0, y: 24 });
          gsap.set(".case", { opacity: 0, y: 40, scale: 0.95 });

          let disableTilt: (() => void) | null = null;

          const finishIntro = () => {
            window.clearTimeout(failsafe);
            disableTilt?.();
            try { window.sessionStorage.setItem("caseva-intro-played", "true"); } catch { }
            document.documentElement.style.overflow = "";
            document.body.style.overflow = "";
            if ("scrollRestoration" in history) history.scrollRestoration = "auto";
            overlay.style.display = "none";
            overlay.style.pointerEvents = "none";
            // The hero's entrance is a fromTo starting at scale 1.05, and
            // fromTo applies its from-state the moment the timeline is built.
            // If the timeline never finishes — failsafe fires, the tab is
            // backgrounded mid-intro (rAF pauses, so GSAP stops advancing), or
            // the user taps to skip — its clearProps never runs and the hero
            // stays at 1.05, overflowing ~9px and shifting all hero content
            // left. Clearing it here makes the hand-off idempotent.
            gsap.set(".hero", { clearProps: "transform,transformOrigin" });
            // The intro timeline's OWN case-reveal (PHASE 6 below) has fully
            // resolved by the time this onComplete fires, so it's safe to
            // create the scroll-parallax now — no race with it.
            setupCaseParallax();
            // Defer the (synchronous, heavy) trigger recalc off the hand-off frame
            setTimeout(() => ScrollTrigger.refresh(), 100);
          };

          const intro = gsap.timeline({ onComplete: finishIntro });

          // Failsafe: if the timeline can't run to completion (throttled tab,
          // battery saver, dropped frames), never trap the user behind the
          // overlay — kill the intro and finish the handoff manually
          const failsafe = window.setTimeout(() => {
            intro.kill();
            gsap.set(".hero-content > *", { opacity: 1, y: 0 });
            gsap.set(".case", { opacity: 1, y: 0, scale: 1 });
            finishIntro();
          }, 9000);

          // Interactive tilt — TWO independent layers for real parallax depth,
          // not one flat tilt. Ring group and wordmark are separately-targeted
          // (both live inside the same SVG, so tilting the whole SVG would move
          // them together as one rigid unit — no depth cue at all). The wordmark
          // counter-tilts at roughly a third of the rings' angle, so the two
          // planes read as sitting at different depths. Never the SAME element
          // the timeline transforms; quickTo reuses ONE tween pair per element
          // instead of allocating a new tween per mousemove. Off at handoff.
          const tiltRingsEl = document.querySelector<HTMLElement>(".intro-ring-group");
          const tiltWordEl = document.querySelector<HTMLElement>(".intro-wordmark");
          if (tiltRingsEl && tiltWordEl) {
            gsap.set(".intro-mark", { perspective: 800 });
            const ringTiltX = gsap.quickTo(tiltRingsEl, "rotationX", { duration: 0.6, ease: "power3.out" });
            const ringTiltY = gsap.quickTo(tiltRingsEl, "rotationY", { duration: 0.6, ease: "power3.out" });
            const wordTiltX = gsap.quickTo(tiltWordEl, "rotationX", { duration: 0.7, ease: "power3.out" });
            const wordTiltY = gsap.quickTo(tiltWordEl, "rotationY", { duration: 0.7, ease: "power3.out" });
            const onTilt = (e: PointerEvent) => {
              const nx = (e.clientX / window.innerWidth - 0.5);
              const ny = (e.clientY / window.innerHeight - 0.5);
              ringTiltX(ny * -8);
              ringTiltY(nx * 8);
              // inverted, smaller angle — a second depth plane, not a mirrored copy
              wordTiltX(ny * 3);
              wordTiltY(nx * -3);
            };
            window.addEventListener("pointermove", onTilt, { passive: true });
            disableTilt = () => {
              window.removeEventListener("pointermove", onTilt);
              gsap.set([tiltRingsEl, tiltWordEl], { rotationX: 0, rotationY: 0 });
            };
            cleanupFns.push(() => disableTilt?.());
          }
          cleanupFns.push(() => window.clearTimeout(failsafe));

          // Per-ring timing: linear, evenly spaced starts (each 0.22) so every ring
          // closes on its own beat — a clear one-by-one radar pulse, not a parallel finish.
          const RING_START = 0.15;
          const RING_EACH = 0.16;
          const RING_DUR = 0.58;

          // ===== Rolling odometer counter (000 → 100%) =====
          // Disciplined: the SPLASH starts the clock. The counter appears once,
          // quietly, at drop impact (0.45s) — no per-digit bounce, no floating
          // bob. The odometer roll is the only motion; 100% lands exactly as
          // the opening lifts. Two copies of the columns exist (bare row +
          // magnified lens copy) — one tweened value drives both.
          const IMPACT_AT = 0.45; // must match the drop-impact / wave-launch time
          const colsH = gsap.utils.toArray<HTMLElement>(".ic-col-h");
          const colsT = gsap.utils.toArray<HTMLElement>(".ic-col-t");
          const colsO = gsap.utils.toArray<HTMLElement>(".ic-col-o");
          if (COUNTER_STYLE === "digits" && colsH.length && colsT.length && colsO.length) {
            const cnt = { v: 0 };

            // one quiet entrance at impact
            gsap.set(".intro-counter", { opacity: 0, y: 10 });
            intro.to(".intro-counter", {
              opacity: 1, y: 0, duration: 0.25, ease: "power2.out",
            }, IMPACT_AT);

            intro.to(cnt, {
              v: 100,
              duration: 2.6 - IMPACT_AT,
              ease: "power2.inOut",
              onUpdate: () => {
                // Motion blur while spinning fast
                const fast = cnt.v > 10 && cnt.v < 90;
                colsO.forEach((c) => {
                  c.classList.toggle("blur-spin", fast);
                  c.style.transform = `translateY(${-cnt.v}em)`;             // ones spin fast (101 rows)
                });
                colsT.forEach((c) => {
                  c.classList.toggle("blur-spin-light", fast);
                  c.style.transform = `translateY(${-(cnt.v / 10)}em)`;      // tens roll continuously
                });
                colsH.forEach((c) => {
                  c.style.transform = `translateY(${-Math.max(0, cnt.v - 99)}em)`; // "1" arrives at the end
                });
              },
            }, IMPACT_AT);
          }

          if (LOADER_FX === "cinematic") {
            // CINEMATIC depth: whole mark eases in from slightly small + softly spun,
            // resolving to rest BEFORE the gap opens (so the C-gap lands square).
            intro.from(".intro-rings", {
              scale: 0.86,
              duration: 1.45,
              ease: "power3.out",
            }, RING_START);
            intro.from(".intro-rings", {
              rotation: -9,
              duration: 1.5,
              ease: "power3.out",
              transformOrigin: "50% 50%",
            }, RING_START);
          }

          if (LOADER_FX === "ripple") {
            // ============ PHASE 1 — RIPPLE GENESIS ============
            // A drop falls to the center; every ring is born from the impact and
            // expands outward like a wavefront — one clean deceleration with a
            // single tiny crest (back.out), never oscillating (water doesn't
            // bounce backward). Fully settled by ~1.45s, BEFORE the gap parts at
            // 1.5s, so the threading always lands on still rings.
            gsap.set(".intro-ring", {
              strokeDasharray: "none",
              strokeDashoffset: 0,
              opacity: 0,
            });
            const drop = document.querySelector<SVGCircleElement>(".intro-drop");
            if (drop) {
              // A real droplet: starts OFF-SCREEN above the viewport (distance
              // computed in mark units so it clears the top on any device),
              // falls with gravity, then HITS and holds for a beat before
              // reacting — a tiny "hit-stop": impact, then consequence, rather
              // than the two being the same instant. The UI (counter/dots,
              // IMPACT_AT=0.45) still reacts the moment contact happens; only
              // the physical splash gets this beat of anticipation.
              const markBox = document.querySelector(".intro-mark")?.getBoundingClientRect();
              const unit = markBox && markBox.width > 0 ? markBox.width / 200 : 2.8;
              const screenH = Math.max(overlay.clientHeight, window.innerHeight, 700);
              const fallFrom = -(screenH / 2 / unit + 15);
              gsap.set(drop, { y: fallFrom, opacity: 1, scaleY: 1.25, scaleX: 0.8, transformOrigin: "50% 100%" });
              // Shape and position are SEPARATE tweens on purpose. The drop
              // enters the viewport at roughly the halfway point of a single
              // combined 0.45s tween — if shape shared that same duration, it's
              // still ~22% away from being a circle right as it becomes visible,
              // so viewers watch it visibly morph mid-fall (an unwanted "deform").
              // Settling the shape in 0.15s means it's already a plain circle
              // well before it's on-screen — the only visible deform left is the
              // actual impact-squash, which is the one moment that's supposed to read as physical.
              intro.to(drop, { scaleY: 1, scaleX: 1, duration: 0.15, ease: "power1.out" }, 0);
              intro.to(drop, { y: 0, duration: 0.45, ease: "power2.in" }, 0);
              // Softer squash: 0.25/2.2 was an 8.8x ratio between axes — reads as
              // a flat pancake, not a splash. 0.55/1.5 (~2.7x) still clearly
              // registers as "squashed on impact" without looking like a UFO.
              intro.to(drop, { scaleY: 0.55, scaleX: 1.5, duration: 0.1, ease: "power1.out" }, 0.48);
              // No standalone dissolve tween — the drop's fade-out is driven
              // directly by the wave's own radius (see the wave's onUpdate
              // below), not by a separate timer. That's what makes the
              // pancake read as BECOMING the ring rather than two
              // independently-timed animations that happen to overlap.
            }
            // REVEALER WAVE — the rings themselves NEVER move (they sit at their
            // final radii, invisible). ONE thicker wavefront expands outward from
            // the impact, and each ring switches on while fully hidden beneath the
            // wave's wider stroke (14 covers the ring's 10) as it passes. Since no
            // two strokes ever slide against each other over cream, every seam /
            // sliver / band artifact is geometrically impossible. Reads as: the
            // ripple sweeps out once, and the logo is what it leaves behind.
            const wave = document.querySelector<SVGCircleElement>(".ripple-wave");
            if (wave) {
              // strokeWidth starts at 0, NOT opacity — a stroked circle at
              // width 0 paints nothing no matter its radius, so there's truly
              // nothing on screen yet. Ramping width (not fading opacity) is
              // what makes the ring's birth read as smooth growth rather than
              // a hard on/off flash: a width-0→11 pop-in fakes a "point"
              // appearing out of nowhere (r=0.01 with the full 11 stroke is
              // already an ~11-unit solid dot the instant opacity hits 1),
              // which reads as a discrete trigger event, not the ring
              // actually being created.
              // "stroke-width" (kebab-case), NOT "strokeWidth" — GSAP's attr
              // plugin calls raw setAttribute(), and SVG only recognizes the
              // kebab-case name. camelCase silently creates an inert, unused
              // attribute alongside the real one (which then never moves from
              // its static JSX value) — the exact reason the pop-in fix below
              // didn't actually take effect the first time.
              gsap.set(wave, { attr: { r: 0.01, "stroke-width": 0 }, opacity: 1 });
              // Formation dots (inner → outer), paired to each ring by ascending radius
              // so a dot lights exactly as the wave reveals its ring — TRUE progress.
              const dotEls = gsap.utils.toArray<HTMLElement>(".intro-dot");
              const pending = ringEls
                .map((el) => ({ el, r: Number(el.getAttribute("r")), done: false }))
                .sort((a, b) => a.r - b.r) // inner → outer, matches dot order
                .map((p, i) => ({ ...p, dot: dotEls[i] as HTMLElement | undefined }));
              // dots fade in quietly at impact (instant UI reaction — no hit-stop)
              if (dotEls.length) {
                gsap.set(".intro-dots", { opacity: 0, y: 8 });
                intro.to(".intro-dots", { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" }, IMPACT_AT);
              }
              const front = { r: 0.01 };
              // wave launches after the hit-stop (0.48, matching the drop's
              // splash); duration trimmed to 0.87 so it still finishes at 1.35
              // exactly as before — every downstream anchor (fadeout, thread at
              // 1.5) stays untouched.
              // Full width well before the first ring (r=32) is reached —
              // casevaRipple's fast initial rise gets front.r there quickly,
              // so the wave must already be at its full covering width by then.
              intro.to(wave, { attr: { "stroke-width": 11 }, duration: 0.15, ease: "power2.out" }, 0.48);
              intro.to(front, {
                r: 96,
                duration: 0.87,
                ease: "casevaRipple", // bespoke — a beat of gather, then flows out, no overshoot
                onUpdate: () => {
                  wave.setAttribute("r", String(front.r));
                  // Drop fades exactly as the expanding wavefront engulfs it
                  // — a direct function of the wave's own radius, not a
                  // separately-timed tween. The squashed drop's footprint
                  // (base r=10, scaleX 1.5) spans roughly 15 units, so the
                  // fade window (front.r: 6→18) starts just as the wave
                  // starts overtaking it and finishes just past it — the
                  // pancake visibly BECOMES the ring, rather than two
                  // coincidentally-overlapping animations.
                  if (drop) {
                    drop.style.opacity = String(1 - gsap.utils.clamp(0, 1, (front.r - 6) / 12));
                  }
                  pending.forEach((p) => {
                    if (!p.done && front.r >= p.r) {
                      p.done = true;
                      p.el.style.opacity = "1"; // ring switched on underneath the wave
                      if (p.dot) {
                        gsap.set(p.dot, { transformOrigin: "50% 50%" });
                        gsap.timeline({ overwrite: true })
                          .to(p.dot, { opacity: 1, scale: 1.4, duration: 0.16, ease: "power2.out" })
                          .to(p.dot, { scale: 1, duration: 0.34, ease: "power2.out" });
                      }
                    }
                  });
                },
              }, 0.48);
              // wave settles onto the outer ring and dissolves — gone before THREAD_AT
              intro.to(wave, { opacity: 0, duration: 0.1, ease: "power1.out" }, 1.35);
            }
          } else if (LOADER_FX === "lite") {
            // PHASE 1 — RADAR SWEEP: a sonar hand makes ONE full clockwise rotation
            // and all five rings materialize exactly behind it — each ring's drawn
            // arc is locked to the hand's angle (SVG circles dash-draw clockwise
            // from 3 o'clock, so hand and ink share the same clock).
            const sweepGroup = document.querySelector<SVGGElement>(".sweep-group");
            const dialRings = ringEls.map((ring) => ({ ring, len: ring.getTotalLength() + 2 }));
            gsap.set(".intro-ring", { opacity: 1 }); // dash keeps them invisible until swept
            intro.to(".sweep-group", { opacity: 1, duration: 0.18, ease: "power1.out" }, RING_START);
            const dial = { ang: 0 };
            intro.to(dial, {
              ang: 360,
              duration: 1.25,
              ease: "power2.inOut",
              onUpdate: () => {
                const frac = dial.ang / 360;
                dialRings.forEach(({ ring, len }) => {
                  ring.style.strokeDashoffset = String(len * (1 - frac));
                });
                if (sweepGroup) sweepGroup.setAttribute("transform", `rotate(${dial.ang} 100 100)`);
              },
            }, RING_START);
            // hand dissolves as it completes the lap (rings are whole by then)
            intro.to(".sweep-group", { opacity: 0, duration: 0.2, ease: "power2.out" }, RING_START + 1.2);
          } else {
            // PHASE 1: rings trace themselves one by one, center → out.
            // (DOM order is outer → inner, so stagger from "end" = inner-first.)
            const ringStagger = { each: RING_EACH, ease: "none", from: "end" as const };
            intro.to(".intro-ring", {
              opacity: 1,
              duration: 0.16,
              ease: "none",
              stagger: ringStagger,
            }, RING_START);
            intro.to(".intro-ring", {
              strokeDashoffset: 0,
              duration: RING_DUR,
              ease: "power2.inOut",
              stagger: ringStagger,
            }, RING_START);
          }

          if (LOADER_FX === "thread") {
            // ============ THREAD: CASEVA threads through the rings ============
            // One clock drives BOTH: each ring's gap parts (outer → inner) exactly as
            // the leading letter reaches it, and the wordmark rides just behind that
            // opening frontier. Gap-openings and the text share the same start, duration
            // and ease, so they're mechanically locked — a beat off would "collapse" it.
            const gapRects = gsap.utils.toArray<SVGRectElement>(".gap-rect"); // inner → outer
            const outerFirst = gapRects.slice().reverse();                    // outer → inner
            const THREAD_AT = 1.5;
            const THREAD_DUR = 1.0;
            const STEP = 0.15; // delay between successive ring openings, in progress units
            const WIN = 0.34;  // how long each individual ring takes to part
            const sweep = { p: 0 };
            intro.to(sweep, {
              p: 1,
              duration: THREAD_DUR,
              ease: "power2.inOut",
              onUpdate: () => {
                outerFirst.forEach((rect, k) => {
                  const o = gsap.utils.clamp(0, 1, (sweep.p - k * STEP) / WIN);
                  rect.setAttribute("height", String(32 * o));
                  rect.setAttribute("y", String(100 - 16 * o));
                });
              },
            }, THREAD_AT);

            // Wordmark threads in from the right, locked to the same clock + ease.
            intro.fromTo(".intro-wordmark",
              { x: 96, opacity: 0 },
              { x: 0, duration: THREAD_DUR, ease: "power2.inOut" },
              THREAD_AT);
            intro.to(".intro-wordmark", {
              opacity: 1, duration: 0.4, ease: "power2.out",
            }, THREAD_AT + 0.1);
            intro.to(".intro-mark", {
              xPercent: -1.5, duration: THREAD_DUR, ease: "power2.inOut",
            }, THREAD_AT);
          } else if (LOADER_FX === "lite" || LOADER_FX === "ripple") {
            // ===== THREAD (lite): per-ring parting via stacked cream rects, no masks =====
            // Each ring sits directly under a full-width cream rect; rings + rects are
            // stacked outer → inner, so rect-k hides ring-k (outer rings already parted).
            // Each rect grows its height — STRAIGHT horizontal edges, like the logo — on a
            // stagger, so rings part outer → inner. Same look as "thread", far lighter
            // (no mask re-rasterization; just a few small cream-rect repaints).
            const partRects = gsap.utils.toArray<SVGRectElement>(".part-rect"); // DOM: outer → inner
            // 1.45, not 1.5 — the wave's fade-out (launched 1.35, duration
            // 0.1) finishes right at 1.45, so the gap starts parting the
            // instant the wave is gone, no held buffer in between.
            const THREAD_AT = 1.45;
            const THREAD_DUR = 0.95;

            // Rect timing pushed much tighter (duration 0.16, stagger 0.02) —
            // the full 5-rect cascade now finishes in ~0.24s instead of ~0.54s.
            // This is what actually buys back a short LETTER_DELAY: the delay
            // isn't a dead pause bolted on top, it's just "wait for the (now
            // fast) cascade to finish" — the eye stays busy watching rings
            // part instead of sitting through empty time before text arrives.
            intro.to(partRects, {
              attr: { y: 84, height: 32 },
              duration: 0.16,
              ease: "power2.out",
              stagger: 0.02,
            }, THREAD_AT);

            // ===== PER-LETTER REVEAL, synced to the gap's own cadence =====
            // The gap doesn't open left-to-right (it's a radial outer→inner
            // per-ring reveal), so letters don't map to specific rings —
            // instead each letter arrives on its OWN beat. No LETTER_DELAY —
            // any flat "wait, then start" pause reads as a dead beat no matter
            // how short. Instead, x-position and opacity are split into two
            // independent tweens that BOTH start at THREAD_AT (zero delay,
            // continuous motion with the gap-parting — nothing ever looks
            // idle), but opacity rides a slow-rising ease-IN curve (power3.in
            // = x^4). Durations tightened (0.45/0.55 → 0.32/0.32) so the
            // "hop in" itself reads faster: by the time every rect has
            // finished (~0.25s in), opacity is already ~32% — a bigger
            // number than before, but the rects are ALSO ~99%+ open by then
            // (verified), so there's negligible ring-ink left to show through.
            // getBBox().x is measured from the tspans' natural (correctly
            // kerned) flow BEFORE any explicit x is applied — no guessed widths.
            const letterEls = gsap.utils.toArray<SVGTSpanElement>(".wordmark-letter");
            if (letterEls.length) {
              // the parent <text> stays fully visible/neutral; only its letters
              // carry the hidden-offset state (a parent opacity:0 would hide
              // every child regardless of the child's own opacity).
              gsap.set(".intro-wordmark", { opacity: 1, x: 0 });
              const letterHomeX = letterEls.map((el) => el.getBBox().x);
              letterEls.forEach((el, i) => {
                gsap.set(el, { attr: { x: letterHomeX[i] + 60 }, opacity: 0 });
              });
              intro.to(letterEls, {
                attr: { x: (i: number) => letterHomeX[i] },
                duration: 0.32,
                ease: "power2.out",
                stagger: 0.08,
              }, THREAD_AT);
              intro.to(letterEls, {
                opacity: 1,
                duration: 0.32,
                ease: "power3.in",
                stagger: 0.08,
              }, THREAD_AT);
            }

            intro.to(".intro-mark", {
              xPercent: -1.5, duration: THREAD_DUR, ease: "power2.inOut",
            }, THREAD_AT);
          } else {
            // PHASE 2 — DOMINO: each ring's gap opens shortly after THAT ring finishes
            // drawing, cascading inner → outer. The gap stagger (0.16) matches the ring
            // stagger, and the start (0.9) sits ~0.17s after ring 0 closes — so every
            // ring gets its own "complete → beat → open", never all opening at once.
            intro.to(".gap-rect", {
              attr: { y: 84, height: 32 },
              duration: 0.38,
              ease: "power2.out",
              stagger: { each: 0.16, from: "start" },
            }, 0.9);

            // PHASE 3 (1.95s → 2.55s): CASEVA hops in AFTER the domino finishes.
            intro.to(".intro-wordmark", {
              x: 0,
              opacity: 1,
              duration: 0.6,
              ease: "back.out(1.6)",
            }, 1.95);

            // The wordmark juts past the rings' right edge, so the whole mark
            // glides slightly left as the text lands — final lockup sits dead-center
            intro.to(".intro-mark", {
              xPercent: -1.5,
              duration: 0.7,
              ease: "expo.out",
            }, 1.95);
          }

          // Progress line animation — LINEAR by design: these are abstract time
          // indicators, not physical objects. power2.inOut would fake a slowdown
          // right near completion, which reads as "stalling" exactly when it
          // should feel fastest — works against perceived performance.
          //
          // All three share the same entrance rule as the digits/dots counters:
          // quiet fade-in AT impact (IMPACT_AT), never visible before it. None of
          // these elements has an opacity:0 default in CSS, so without the
          // gsap.set below they render (and start filling) from frame 0 — i.e.
          // the progress indicator is already moving while the drop is still
          // mid-air, well before it has actually landed.
          if (COUNTER_STYLE === "line") {
            gsap.set(".intro-line-track", { opacity: 0 });
            intro.to(".intro-line-track", { opacity: 1, duration: 0.25, ease: "power2.out" }, IMPACT_AT);
            intro.to(".intro-line-fill", {
              scaleX: 1,
              duration: 2.4 - IMPACT_AT, // still lands at 2.4 (the loader lockup timeline)
              ease: "none"
            }, IMPACT_AT);
          } else if (COUNTER_STYLE === "ring") {
            gsap.set(".intro-ring-spinner", { opacity: 0 });
            intro.to(".intro-ring-spinner", { opacity: 1, duration: 0.25, ease: "power2.out" }, IMPACT_AT);
            intro.to(".spinner-fill", {
              strokeDashoffset: 0,
              duration: 2.4 - IMPACT_AT,
              ease: "none"
            }, IMPACT_AT);
          } else if (COUNTER_STYLE === "drop") {
            gsap.set(".intro-drop-gauge", { opacity: 0 });
            intro.to(".intro-drop-gauge", { opacity: 1, duration: 0.25, ease: "power2.out" }, IMPACT_AT);
            intro.to(".drop-fill-rect", {
              attr: { y: 0 },
              duration: 2.4 - IMPACT_AT,
              ease: "none"
            }, IMPACT_AT);
          }

          // Fade out the counter/dots immediately so the final lockup reads cleanly as the logo
          intro.to(".intro-counter, .intro-dots, .intro-line-track, .intro-ring-spinner, .intro-drop-gauge", {
            opacity: 0,
            duration: 0.3,
            ease: "power2.out"
          }, 2.45);
          // PHASE 5 (2.7s → 3.8s): EXIT — branched by EXIT_STYLE
          if (EXIT_STYLE === "curtain") {
            intro.to(".intro-mark", { opacity: 0, duration: 0.55, ease: "power2.in" }, 2.7);
            // CURTAIN: top half slides UP, bottom half slides DOWN — classic film bumper
            intro.to(".curtain-top", {
              yPercent: -100,
              duration: 1.0,
              ease: "power3.inOut",
            }, 2.7);
            intro.to(".curtain-bottom", {
              yPercent: 100,
              duration: 1.0,
              ease: "power3.inOut",
            }, 2.7);
          } else if (EXIT_STYLE === "wipe") {
            intro.to(".intro-mark", { opacity: 0, duration: 0.55, ease: "power2.in" }, 2.7);
            // OPENING: the loader panel lifts up like a curtain (beautyinstem-style)
            // while the page underneath settles from a slight zoom — the "opening".
            intro.to(
              overlay,
              {
                yPercent: -100,
                duration: 1.0,
                ease: "power3.inOut",
                // level the mark before the panel lifts (also unbinds the listener)
                onStart: () => { disableTilt?.(); disableTilt = null; },
              },
              2.7
            );
            intro.fromTo(".hero",
              { scale: 1.05, transformOrigin: "50% 25%" },
              { scale: 1, duration: 1.3, ease: "power3.out", clearProps: "transform" },
              2.85);
          } else if (EXIT_STYLE === "iris") {
            // ZOOM-THROUGH REVEAL:
            // The Rings explode outwards while the overlay fades, creating a 
            // 3D dive through the center of the logo.
            intro.to(".intro-counter, .intro-wordmark", {
              opacity: 0, duration: 0.3, ease: "power2.out"
            }, 2.5);

            intro.to(".intro-mark", {
              scale: 30,
              opacity: 0,
              duration: 1.1,
              ease: "expo.in",
              transformOrigin: "50% 50%",
            }, 2.6);
            intro.to(".intro-overlay", {
              opacity: 0,
              duration: 0.7,
              ease: "power2.inOut",
            }, 2.8);
          }

          // PHASE 6 (2.7s → 4.9s): GRADUAL hero reveal — cases + text flow in,
          // overlapping the exit so the loader dissolves straight into the page.
          intro.to(".case", {
            opacity: 1, y: 0, scale: 1,
            duration: 1.3,
            stagger: { each: 0.16, from: "center" },
            ease: "power3.out",
          }, 2.7);

          intro.to(".hero-content > *", {
            opacity: 1, y: 0,
            duration: 1.1,
            stagger: 0.18,
            ease: "power3.out",
          }, 2.9);

          // Click-to-skip — fast-forward 6x rather than jump (smooth)
          const skip = () => {
            intro.timeScale(6);
            overlay.removeEventListener("click", skip);
          };
          overlay.addEventListener("click", skip);
        }


        // ----- HERO PARALLAX: text drifts up + fades on scroll -----
        gsap.to(".hero-content", {
          y: -150,
          opacity: 0,
          ease: "none",
          scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 0.6 },
        });

        return () => cleanupFns.forEach((fn) => fn());
      });

      // Reduced-motion fallback: cases settled, no intro, no animation —
      // and every end-state the animated path would eventually reach.
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.utils.toArray<HTMLElement>(".case").forEach((el) => {
          gsap.set(el, { rotate: Number(el.dataset.rotate || 0) });
        });
        const overlay = document.querySelector<HTMLElement>(".intro-overlay");
        if (overlay) gsap.set(overlay, { display: "none" });
        // Comparison numbers land on their final values instead of counting
        gsap.utils.toArray<HTMLElement>(".count").forEach((el) => {
          el.textContent = String(Number(el.dataset.value || 0));
        });
        // Only the first press review shows; hide the stacked others from
        // both sight and the accessibility tree (no rotation runs here)
        gsap.utils.toArray<HTMLElement>(".review").forEach((el, i) => {
          if (i > 0) {
            gsap.set(el, { autoAlpha: 0 });
            el.setAttribute("aria-hidden", "true");
          }
        });
      });

      // ============ SCROLL ANIMATIONS (skipped under prefers-reduced-motion) ============
      // Everything below used to be created unconditionally, which meant
      // reduced-motion users still got every scroll effect. Registering it in
      // its own no-preference context keeps the diff minimal and lets GSAP
      // revert it all if the media preference flips at runtime.
      mm.add("(prefers-reduced-motion: no-preference)", () => {

        // ----- Reveal-on-scroll for headlines and rows -----
        gsap.utils.toArray<HTMLElement>(".reveal").forEach((el) => {
          gsap.from(el, {
            y: 60,
            opacity: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              // once — content stays revealed; replaying (and un-revealing) on
              // every up-scroll read as visual noise rather than delight
              once: true,
            },
          });
        });

        // ----- Cheers section: the two hands slide in from opposite sides sequentially -----
        gsap.set(".cheers-case.left", { xPercent: -44, rotate: -7, opacity: 0 });
        gsap.set(".cheers-case.right", { xPercent: 44, rotate: 7, opacity: 0 });
        gsap.to(".cheers-case.left", {
          xPercent: 0, rotate: 0, opacity: 1,
          ease: "power3.out", duration: 1.1,
          scrollTrigger: { trigger: ".cheers-case.left", start: "top 78%", toggleActions: "play none none reverse" },
        });
        gsap.to(".cheers-case.right", {
          xPercent: 0, rotate: 0, opacity: 1,
          ease: "power3.out", duration: 1.1,
          scrollTrigger: { trigger: ".cheers-case.right", start: "top 78%", toggleActions: "play none none reverse" },
        });

        // value-prop corners drift parallax
        gsap.utils.toArray<HTMLElement>(".vp-corner").forEach((el, i) => {
          gsap.to(el, {
            y: i % 2 === 0 ? -80 : 80, ease: "none",
            scrollTrigger: { trigger: ".value-prop", start: "top bottom", end: "bottom top", scrub: true },
          });
        });


        // ----- Comparison numbers count up -----
        gsap.utils.toArray<HTMLElement>(".count").forEach((el) => {
          const target = Number(el.dataset.value || 0);
          const obj = { val: 0 };
          gsap.to(obj, {
            val: target,
            duration: 1.6,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              // once — resetting to 0 and recounting on every scroll pass made
              // the stats look unstable
              once: true,
            },
            onUpdate: () => {
              el.textContent = Math.round(obj.val).toString();
            },
          });
        });

        // ----- Full-page background colour wash -----
        // Drive document.body's background from a SINGLE scroll-mapped function
        // rather than one scrub tween per section. The old approach layered
        // independent tweens on the same property with overwrite:"auto", so
        // scrolling down killed the previous tween and scrolling back UP had
        // nothing left to reverse — the colour snapped instead of easing. A pure
        // interpolation of scroll position is identical (and smooth) both ways.
        const HERO_CREAM = "#fff9d6"; // the page opens on this (hero)
        const CREAM = "#fbf3dc";      // site cream used further down the page
        const wash: Array<{ sel: string; color: string; at?: number }> = [
          { sel: ".value-prop", color: "#b2cdff" },      // blue
          { sel: ".cheers", color: "#fce5e5" },          // soft pink
          // The feature banner opens .collection-wrap and is transparent, so this
          // wash colour IS its frame. The photography is warm (hues 21-23) and
          // mid-dark (L39-57); the old periwinkle sat at 220/L90, so the shots
          // were marooned in a cool pale band. A warm blush keeps them in the
          // same family.
          { sel: ".collection-wrap", color: "#f3e7de" }, // warm blush
          // Product carousel keeps its CASETiFY grey; a higher `at` greys the
          // body a little later so the feature band is mostly scrolled off
          // before it engages.
          // Warm off-white, not pure white: cream (51/L92) -> white (0/L100) was a
          // temperature flip between consecutive sections, which is what made the
          // product row read as clinical rather than airy.
          { sel: ".product-row", color: "#fdfaf2", at: 0.25 }, // warm off-white
          { sel: ".comparison", color: "#cbe8ce" },      // light sage
          { sel: ".testimonial", color: CREAM },         // cream
          { sel: ".subscribe", color: "#e2dbf7" },       // light lavender
          { sel: ".press", color: "#ffffff" },           // white
          { sel: ".footer", color: "#f3ead2" },          // warm light sand
        ];
        // Colour "stops" keyed by absolute scroll position; rebuilt on refresh
        // so it survives layout changes (image load, resize, intro hand-off).
        let stops: Array<{ y: number; color: string }> = [];
        const buildStops = () => {
          const maxY = ScrollTrigger.maxScroll(window);
          stops = wash
            .map((w) => {
              const el = document.querySelector(w.sel);
              if (!el) return null;
              const top = el.getBoundingClientRect().top + window.scrollY;
              // colour is fully reached when the section top hits `at`·viewport
              const y = gsap.utils.clamp(0, maxY, top - window.innerHeight * (w.at ?? 0.4));
              return { y, color: w.color };
            })
            .filter((s): s is { y: number; color: string } => s !== null)
            .sort((a, b) => a.y - b.y);
          // open on the hero cream at the very top of the page
          if (!stops.length || stops[0].y > 0) stops.unshift({ y: 0, color: HERO_CREAM });
        };
        const colorAt = (y: number): string => {
          if (y <= stops[0].y) return stops[0].color;
          const last = stops[stops.length - 1];
          if (y >= last.y) return last.color;
          let i = 0;
          while (i < stops.length - 1 && stops[i + 1].y <= y) i++;
          // hold stops[i].color, then ease to the next over the last ~0.6·viewport
          const segEnd = stops[i + 1].y;
          const transStart = Math.max(stops[i].y, segEnd - window.innerHeight * 0.6);
          if (y <= transStart) return stops[i].color;
          const t = (y - transStart) / (segEnd - transStart);
          return gsap.utils.interpolate(stops[i].color, stops[i + 1].color, t) as string;
        };
        // Only touch the DOM when the colour actually changes. The wash holds a
        // flat colour for long stretches (the whole hero, for one), and writing
        // body.backgroundColor on every scroll tick repaints the full page
        // background each frame — a real source of scroll jank on phones.
        let lastWash = "";
        const paintWash = () => {
          const next = colorAt(window.scrollY);
          if (next === lastWash) return;
          lastWash = next;
          // Writes the page-ground TOKEN, not background-color directly. The
          // sticky nav reads the same token, so it washes with the page instead
          // of staying frozen on the opening cream over a blue or green section.
          document.body.style.setProperty("--page-ground", next);
        };
        buildStops();
        paintWash();
        ScrollTrigger.create({
          start: 0,
          end: () => ScrollTrigger.maxScroll(window),
          onUpdate: paintWash,
          onRefresh: () => {
            buildStops();
            lastWash = ""; // stops moved — force a repaint even if the colour matches
            paintWash();
          },
        });

        // ----- Press: auto-rotate reviews -----
        // autoAlpha (opacity + visibility) keeps the two inactive reviews out
        // of the accessibility tree and untappable; aria-hidden follows each
        // step. Hovering the stage pauses the rotation so quotes can be read
        // at the reader's own pace.
        const reviewEls = gsap.utils.toArray<HTMLElement>(".review");
        if (reviewEls.length > 1) {
          const setAria = (active: number) =>
            reviewEls.forEach((el, j) => el.setAttribute("aria-hidden", String(j !== active)));
          setAria(0);
          const tl = gsap.timeline({ repeat: -1, defaults: { duration: 0.8, ease: "power2.inOut" } });
          reviewEls.forEach((_, i) => {
            tl.to(reviewEls, {
              autoAlpha: (j) => (j === i ? 1 : 0),
              y: (j) => (j === i ? 0 : 20),
              onStart: () => setAria(i),
            }).to({}, { duration: 3 });
          });
          const stage = document.querySelector<HTMLElement>(".press-stage");
          if (stage) {
            const pause = () => tl.pause();
            const play = () => tl.play();
            stage.addEventListener("pointerenter", pause);
            stage.addEventListener("pointerleave", play);
            return () => {
              stage.removeEventListener("pointerenter", pause);
              stage.removeEventListener("pointerleave", play);
            };
          }
        }
      }); // end scroll-animations no-preference context
    },
    { scope: root },
  );

  return (
    <div ref={root} suppressHydrationWarning>
      {/* ============ FULL-SCREEN CINEMATIC INTRO (once per session) ============ */}
      <div className={`intro-overlay exit-${EXIT_STYLE}`} aria-hidden="true">
        {/* Curtain panels — only used when EXIT_STYLE = "curtain" */}
        <div className="curtain-top" aria-hidden="true" />
        <div className="curtain-bottom" aria-hidden="true" />
        <div className="intro-mark">
          <svg className="intro-rings" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            {LOADER_FX === "ripple" && (
              <circle className="intro-drop" cx="100" cy="100" r="10" fill="#1757f2" opacity="0" />
            )}
            {LOADER_FX !== "lite" && LOADER_FX !== "ripple" && (
              <defs>
                {/* One mask per ring so each "C" gap can open on its own beat (the
                  gap-rect starts closed at height 0; GSAP staggers them open).
                  Lite mode ships NO masks at all — cheaper DOM + zero raster risk. */}
                {[32, 48, 64, 80, 96].map((r, i) => (
                  <mask key={r} id={`gap-mask-${i}`} maskUnits="userSpaceOnUse" x="-200" y="-200" width="600" height="600">
                    <rect x="-200" y="-200" width="600" height="600" fill="white" />
                    <rect className="gap-rect" data-ring={i} x="85" y="100" width="130" height="0" fill="black" />
                  </mask>
                ))}
              </defs>
            )}
            <g className="intro-ring-group">
              {/* Rendered outer → inner so each ring sits ABOVE the cream rect that parts
                the rings beneath it (lite mode). Masks still drive the gap in other modes. */}
              {[96, 80, 64, 48, 32].map((r) => {
                const i = [32, 48, 64, 80, 96].indexOf(r);
                return (
                  <g key={r}>
                    <circle className="intro-ring" mask={LOADER_FX === "lite" || LOADER_FX === "ripple" ? undefined : `url(#gap-mask-${i})`} cx="100" cy="100" r={r} fill="none" stroke="#1757f2" strokeWidth="7" />
                    <rect className="part-rect" x="85" y="100" width="131" height="0" fill="#fffad6" />
                  </g>
                );
              })}
            </g>
            {/* Revealer wave — painted ABOVE the rings so each ring switches on fully
              hidden beneath its wider stroke as it passes (ripple mode). */}
            {LOADER_FX === "ripple" && (
              <circle className="ripple-wave" cx="100" cy="100" r="0.01" fill="none" stroke="#1757f2" strokeWidth="11" opacity="0" />
            )}
            {/* Radar sweep hand + fading trail wedge (lite mode) — GSAP rotates the
              group one full clockwise lap; rings dash-draw locked to its angle. */}
            {LOADER_FX === "lite" && (
              <g className="sweep-group" opacity="0">
                <path className="sweep-trail" d="M 100 100 L 203 100 A 103 103 0 0 0 190.9 51.7 Z" fill="#1757f2" opacity="0.08" />
                <line className="sweep-hand" x1="100" y1="100" x2="203" y2="100" stroke="#1757f2" strokeWidth="2.5" />
              </g>
            )}
            <text className="intro-wordmark" x="82" y="100" textAnchor="start" dominantBaseline="central" fontFamily="var(--font-dm-sans), DM Sans, sans-serif" fontWeight="900" fontSize="30" fill="#000" stroke="#000" strokeWidth="0.7" paintOrder="stroke" letterSpacing="0">
              {"CASEVA".split("").map((ch, i) => (
                <tspan key={i} className="wordmark-letter">{ch}</tspan>
              ))}
            </text>
          </svg>
        </div>
        {/* Progress indicator — five formation dots (each lights as its ring is
            revealed by the wave) OR the rolling odometer, per COUNTER_STYLE. */}
        {COUNTER_STYLE === "dots" ? (
          <div className="intro-dots" aria-hidden="true">
            {[0, 1, 2, 3, 4].map((i) => (
              <span key={i} className="intro-dot" />
            ))}
          </div>
        ) : COUNTER_STYLE === "digits" ? (
          <div className="intro-counter" aria-hidden="true">
            <CounterDigits />
          </div>
        ) : COUNTER_STYLE === "line" ? (
          <div className="intro-line-track" aria-hidden="true">
            <div className="intro-line-fill" />
          </div>
        ) : COUNTER_STYLE === "ring" ? (
          <div className="intro-ring-spinner" aria-hidden="true">
            <svg viewBox="0 0 24 24" className="spinner-svg">
              <circle className="spinner-track" cx="12" cy="12" r="10" fill="none" stroke="rgba(23, 87, 242, 0.15)" strokeWidth="2" />
              <circle className="spinner-fill" cx="12" cy="12" r="10" fill="none" stroke="#1757f2" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        ) : COUNTER_STYLE === "drop" ? (
          <div className="intro-drop-gauge" aria-hidden="true">
            <svg viewBox="0 0 24 24" className="drop-gauge-svg">
              <defs>
                <clipPath id="drop-fill-clip">
                  <rect className="drop-fill-rect" x="0" y="24" width="24" height="24" />
                </clipPath>
              </defs>
              <path className="drop-gauge-track" d="M12 2.5 C12 2.5 4 11 4 16.5 A8 8 0 0 0 20 16.5 C20 11 12 2.5 12 2.5 Z" fill="none" stroke="rgba(23, 87, 242, 0.15)" strokeWidth="2" />
              <path className="drop-gauge-fill" d="M12 2.5 C12 2.5 4 11 4 16.5 A8 8 0 0 0 20 16.5 C20 11 12 2.5 12 2.5 Z" fill="#1757f2" clipPath="url(#drop-fill-clip)" />
            </svg>
          </div>
        ) : null}
      </div>

      {/* Promo bar, nav, footer + cart drawer are shared chrome in app/layout.tsx */}

      {/* ============ MAIN (skip-link target; tabIndex so focus actually moves) ============ */}
      <main id="main" tabIndex={-1}>

        {/* ============ HERO ============ */}
        <section className="hero" aria-label="Hero">


          <div className="hero-content">
            <h1 className="headline left-align">
              Phone cases pretty enough<br className="desktop-br" />{" "}to keep on.
            </h1>

            <ModelSelector
              value={selectedModel}
              onChange={handleModelSelect}
              placeholder="iPhone & Pixel Cases"
            />

            <div className="cta-wrap left-align">
              <Link className="cta" href="/shop">
                Shop the Collection
                <svg className="cta-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
            </div>

          </div>

          <div className="cases" suppressHydrationWarning>
            {heroCases.map((c, i) => (
              <Image
                key={c.name}
                className={`case case-fan-${i}`}
                data-rotate={FAN_SLOTS[i].rotate}
                data-x={FAN_SLOTS[i].x}
                data-y={FAN_SLOTS[i].y}
                src={c.src}
                alt={c.alt}
                width={300}
                height={450}
                priority
                draggable={false}
              />
            ))}
          </div>
        </section>

        {/* ============ VALUE PROP (Olipop frame 1 style) ============ */}
        <section className="value-prop">
          {/* Declared at the files' TRUE intrinsic size. object-fit computes to
              `fill` here, so a declared ratio that disagrees with the source
              stretches it — 260x400 (0.650) against these 1587x2245 files
              (0.707) squashed both corners ~8% too narrow. Quoting the real
              dimensions means the ratio can never drift from the artwork.
              CSS still drives the rendered size (.vp-bl/.vp-br set width). */}
          <Image className="vp-corner vp-bl" src="/blossom.png" alt="" width={1587} height={2245} />
          <Image className="vp-corner vp-br" src="/blossom.png" alt="" width={1587} height={2245} />
          <div className="container vp-inner">
            <p className="vp-text reveal">
              Our <span className="vp-highlight">stylish</span> and{" "}
              <span className="vp-highlight">protective</span> phone cases combine impact-tested
              engineering and premium materials trusted by the top designers in the world.
            </p>
          </div>
        </section>

        {/* ============ CHEERS (cases rise in diagonally) ============ */}
        <section className="cheers" id="benefits">
          <div className="cheers-stage">
            <div className="cheers-case left">
              <Image src="/cheers-v3-1.png" alt="Hand holding new case 1" width={420} height={630} />
            </div>
            <div className="cheers-case right">
              <Image src="/cheers-v3-2.png" alt="Hand holding new case 2" width={420} height={630} />
            </div>
          </div>
        </section>

        {/* ============ COLLECTION (carousel on desktop, tiles on mobile) ============ */}
        {/* Renders its own <section.collection-wrap id="collection">. */}
        <CollectionShowcase />

        {/* ============ PRESS ============ */}
        <section className="press" id="press">
          <div className="container">
            <div className="press-kicker reveal">As seen in</div>
            <div className="press-stage">
              {reviews.map((r, i) => (
                <div className="review" key={r.author} style={{ opacity: i === 0 ? 1 : 0 }}>
                  <p className="review-quote">&ldquo;{r.quote}&rdquo;</p>
                  <div className="review-author">— {r.author}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>
      {/* Footer is shared chrome in app/layout.tsx */}
    </div>
  );
}
