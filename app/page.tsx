"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const PHONE_MODELS = [
  "iPhone 16 Pro Max",
  "iPhone 16 Pro",
  "iPhone 16 Plus",
  "iPhone 16",
  "iPhone 15 Pro Max",
  "iPhone 15 Pro",
  "iPhone 15 Plus",
  "iPhone 15",
  "iPhone 14 Pro Max",
  "iPhone 14 Pro",
  "iPhone 14",
  "iPhone 13 Pro",
  "iPhone 13",
];
const DEFAULT_MODEL = "iPhone 16 Pro";
const MODEL_STORAGE_KEY = "caseva-iphone-model";

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
// Flip back to "classic" to instantly revert. Pure GSAP — no deps.
const LOADER_FX: "classic" | "cinematic" | "thread" | "lite" = "lite";

const heroCases = [
  { src: "/tulip-case-v2.png", alt: "Tulip pattern case", className: "case case-fan-0", rotate: -30, x: -200, y: 60, priority: true },
  { src: "/pink-floral-case-v2.png", alt: "Pink floral case", className: "case case-fan-1", rotate: -15, x: -100, y: 30, priority: true },
  { src: "/cream-floral-case-v2.png", alt: "Cream floral case", className: "case case-fan-2", rotate: 0, x: 0, y: 0, priority: true },
  { src: "/silver-flower-case-v2.png", alt: "Silver flower case", className: "case case-fan-3", rotate: 15, x: 100, y: 30, priority: true },
  { src: "/rose-case-v2.png", alt: "Rose pattern case", className: "case case-fan-4", rotate: 30, x: 200, y: 60, priority: true },
];


const benefits = [
  { icon: "🛡️", label: "Drop Protection" },
  { icon: "✨", label: "Premium Finish" },
  { icon: "🧲", label: "MagSafe Ready" },
  { icon: "🌿", label: "Eco Materials" },
  { icon: "📱", label: "Slim Profile" },
  { icon: "💖", label: "Designed in CA" },
];

const collection = [
  { src: "/tulip-case-v2.png", name: "Tulip Garden", price: "$32" },
  { src: "/pink-floral-case-v2.png", name: "Pink Bloom", price: "$32" },
  { src: "/cream-floral-case-v2.png", name: "Cream Petal", price: "$34" },
  { src: "/silver-flower-case-v2.png", name: "Silver Dream", price: "$34" },
  { src: "/rose-case-v2.png", name: "Rose Whisper", price: "$32" },
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
  const [selectedModel, setSelectedModel] = useState<string>(DEFAULT_MODEL);
  const [modelOpen, setModelOpen] = useState(false);
  const modelMenuRef = useRef<HTMLDivElement>(null);

  // Hydrate from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(MODEL_STORAGE_KEY);
      if (saved && PHONE_MODELS.includes(saved)) setSelectedModel(saved);
    } catch {
      /* localStorage unavailable */
    }
  }, []);

  // Close dropdown on outside click + Escape
  useEffect(() => {
    if (!modelOpen) return;
    const onDown = (e: MouseEvent) => {
      if (modelMenuRef.current && !modelMenuRef.current.contains(e.target as Node)) {
        setModelOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModelOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [modelOpen]);

  const handleModelSelect = (model: string) => {
    setSelectedModel(model);
    setModelOpen(false);
    try {
      window.localStorage.setItem(MODEL_STORAGE_KEY, model);
    } catch {
      /* ignore */
    }
    document.querySelector("#collection")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useGSAP(
    () => {
      // ============ HERO ANIMATIONS (reduced-motion-aware) ============
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Non-GSAP side effects (timeouts) registered here are torn down when
        // the matchMedia context reverts (unmount / dev hot-reload)
        const cleanupFns: Array<() => void> = [];

        // Set initial rotation for each case
        gsap.utils.toArray<HTMLElement>(".case").forEach((el) => {
          gsap.set(el, { rotate: Number(el.dataset.rotate || 0) });
        });

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
          gsap.from(".case", {
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
          ringEls.forEach((ring) => {
            const len = ring.getTotalLength() + 2;
            gsap.set(ring, {
              strokeDasharray: len,
              strokeDashoffset: len,
              opacity: 0,
            });
          });
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

          const finishIntro = () => {
            window.clearTimeout(failsafe);
            try { window.sessionStorage.setItem("caseva-intro-played", "true"); } catch { }
            document.documentElement.style.overflow = "";
            document.body.style.overflow = "";
            if ("scrollRestoration" in history) history.scrollRestoration = "auto";
            overlay.style.display = "none";
            overlay.style.pointerEvents = "none";
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
          cleanupFns.push(() => window.clearTimeout(failsafe));

          // Per-ring timing: linear, evenly spaced starts (each 0.22) so every ring
          // closes on its own beat — a clear one-by-one radar pulse, not a parallel finish.
          const RING_START = 0.15;
          const RING_EACH = 0.16;
          const RING_DUR = 0.58;
          
          // ===== Rolling odometer counter (000 → 100%) =====
          // One tweened value drives three digit columns via GPU translateY.
          // Hits 100 exactly as the opening starts (2.75s).
          const colH = document.querySelector<HTMLElement>(".ic-col-h");
          const colT = document.querySelector<HTMLElement>(".ic-col-t");
          const colO = document.querySelector<HTMLElement>(".ic-col-o");
          if (colH && colT && colO) {
            const cnt = { v: 0 };
            
            // Stagger pop-in the counter digits
            intro.fromTo(".ic-digit", 
              { opacity: 0, y: 15 },
              { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "back.out(2)" }, 
              RING_START - 0.2
            );

            intro.to(cnt, {
              v: 100,
              duration: 2.6 - RING_START,
              ease: "power2.inOut",
              onUpdate: () => {
                // Add motion blur class when spinning fast
                if (cnt.v > 10 && cnt.v < 90) {
                  colO.classList.add("blur-spin");
                  colT.classList.add("blur-spin-light");
                } else {
                  colO.classList.remove("blur-spin");
                  colT.classList.remove("blur-spin-light");
                }

                colO.style.transform = `translateY(${-cnt.v}em)`;            // ones spin fast (101 rows)
                colT.style.transform = `translateY(${-(cnt.v / 10)}em)`;     // tens roll continuously
                colH.style.transform = `translateY(${-Math.max(0, cnt.v - 99)}em)`; // "1" arrives at the end
              },
            }, RING_START);
            // gentle float — the pill bobs like it's buoyant while counting
            intro.to(".intro-counter", {
              y: -6, duration: 0.85, ease: "sine.inOut", yoyo: true, repeat: 3,
            }, 0.3);
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

          // PHASE 1: rings trace themselves one by one, center → out.
          // (DOM order is outer → inner, so stagger from "end" = inner-first = center → out.)
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
          } else if (LOADER_FX === "lite") {
            // ===== THREAD (lite): per-ring parting via stacked cream rects, no masks =====
            // Each ring sits directly under a full-width cream rect; rings + rects are
            // stacked outer → inner, so rect-k hides ring-k (outer rings already parted).
            // Each rect grows its height — STRAIGHT horizontal edges, like the logo — on a
            // stagger, so rings part outer → inner. Same look as "thread", far lighter
            // (no mask re-rasterization; just a few small cream-rect repaints).
            const partRects = gsap.utils.toArray<SVGRectElement>(".part-rect"); // DOM: outer → inner
            const THREAD_AT = 1.5;
            const THREAD_DUR = 0.95;
            intro.to(partRects, {
              attr: { y: 84, height: 32 },
              duration: 0.4,
              ease: "power2.out",
              stagger: 0.13,
            }, THREAD_AT);

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

          // PHASE 4: brief beat on the finished lockup, then flow out.

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
            intro.to(".intro-overlay", {
              yPercent: -100,
              duration: 1.0,
              ease: "power4.inOut",
            }, 2.75);
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


        // ----- HERO PARALLAX: cases drift outward on scroll -----
        gsap.utils.toArray<HTMLElement>(".case").forEach((el) => {
          gsap.to(el, {
            x: Number(el.dataset.x || 0),
            y: Number(el.dataset.y || 0),
            rotate: Number(el.dataset.rotate || 0) * 1.5,
            ease: "none",
            scrollTrigger: {
              trigger: ".hero",
              start: "top top",
              end: "bottom top",
              scrub: 0.6,
            },
          });
        });

        // ----- HERO PARALLAX: text drifts up + fades on scroll -----
        gsap.to(".hero-content", {
          y: -150,
          opacity: 0,
          ease: "none",
          scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 0.6 },
        });

        return () => cleanupFns.forEach((fn) => fn());
      });

      // Reduced-motion fallback: cases settled, no intro, no animation
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.utils.toArray<HTMLElement>(".case").forEach((el) => {
          gsap.set(el, { rotate: Number(el.dataset.rotate || 0) });
        });
        const overlay = document.querySelector<HTMLElement>(".intro-overlay");
        if (overlay) gsap.set(overlay, { display: "none" });
      });

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
            toggleActions: "play none none reverse",
          },
        });
      });

      // ----- Cheers section: cases tilt inward from off-screen -----
      gsap.set(".cheers-case.left", { x: -400, rotate: 35, opacity: 0 });
      gsap.set(".cheers-case.right", { x: 400, rotate: -35, opacity: 0 });
      gsap.to(".cheers-case.left", {
        x: 0, rotate: 18, opacity: 1,
        ease: "power3.out", duration: 1.2,
        scrollTrigger: { trigger: ".cheers", start: "top 75%", toggleActions: "play none none reverse" },
      });
      gsap.to(".cheers-case.right", {
        x: 0, rotate: -18, opacity: 1,
        ease: "power3.out", duration: 1.2,
        scrollTrigger: { trigger: ".cheers", start: "top 75%", toggleActions: "play none none reverse" },
      });
      // splash fade
      gsap.from(".splash", {
        scale: 0, opacity: 0, stagger: 0.15, duration: 0.8, ease: "back.out(1.7)",
        scrollTrigger: { trigger: ".cheers", start: "top 70%", toggleActions: "play none none reverse" },
      });
      // benefit pills stagger
      gsap.from(".bpill", {
        y: 30, opacity: 0, stagger: 0.08, duration: 0.7, ease: "power3.out",
        scrollTrigger: { trigger: ".cheers-benefits", start: "top 85%", toggleActions: "play none none reverse" },
      });
      // value-prop corners drift parallax
      gsap.utils.toArray<HTMLElement>(".vp-corner").forEach((el, i) => {
        gsap.to(el, {
          y: i % 2 === 0 ? -80 : 80, ease: "none",
          scrollTrigger: { trigger: ".value-prop", start: "top bottom", end: "bottom top", scrub: true },
        });
      });

      // ----- Pinned horizontal Collection scroll -----
      const track = document.querySelector<HTMLElement>(".collection-track");
      const wrap = document.querySelector<HTMLElement>(".collection-wrap");
      if (track && wrap) {
        const distance = () => track.scrollWidth - window.innerWidth + 80;
        gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: wrap,
            start: "top top",
            end: () => `+=${distance()}`,
            scrub: 1,
            pin: true,
            invalidateOnRefresh: true,
          },
        });
      }

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
            toggleActions: "play none none reverse",
          },
          onUpdate: () => {
            el.textContent = Math.round(obj.val).toString();
          },
        });
      });

      // ----- Subscribe section background parallax -----
      gsap.to(".subscribe-bg", {
        yPercent: -20,
        ease: "none",
        scrollTrigger: {
          trigger: ".subscribe",
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });

      // ----- Gradual full-page background color wash via per-section ScrollTriggers -----
      gsap.set(document.body, { backgroundColor: "#fbf3dc" });
      const sectionColors: Array<{ sel: string; color: string }> = [
        { sel: ".value-prop", color: "#b2cdff" },       // blue
        { sel: ".cheers", color: "#fce5e5" },           // soft pink
        { sel: ".collection-wrap", color: "#fbf3dc" },  // cream
        { sel: ".comparison", color: "#0f5132" },       // forest
        { sel: ".testimonial", color: "#fbf3dc" },      // cream
        { sel: ".subscribe", color: "#2540ad" },        // deep indigo
        { sel: ".press", color: "#ffffff" },            // white
        { sel: ".footer", color: "#111111" },           // black
      ];
      sectionColors.forEach(({ sel, color }) => {
        const target = document.querySelector(sel);
        if (!target) return;
        gsap.to(document.body, {
          backgroundColor: color,
          ease: "none",
          immediateRender: false,
          overwrite: "auto",
          scrollTrigger: {
            trigger: target,
            start: "top bottom",
            end: "top 40%",
            scrub: 0.5,
          },
        });
      });

      // ----- Press: auto-rotate reviews -----
      const reviewEls = gsap.utils.toArray<HTMLElement>(".review");
      if (reviewEls.length > 1) {
        const tl = gsap.timeline({ repeat: -1, defaults: { duration: 0.8, ease: "power2.inOut" } });
        reviewEls.forEach((_, i) => {
          tl.to(reviewEls, {
            opacity: (j) => (j === i ? 1 : 0),
            y: (j) => (j === i ? 0 : 20),
          }).to({}, { duration: 3 });
        });
      }
    },
    { scope: root },
  );

  return (
    <div ref={root} suppressHydrationWarning>
      {/* Skip link for keyboard users */}
      <a href="#main" className="skip-link">Skip to content</a>

      {/* ============ FULL-SCREEN CINEMATIC INTRO (once per session) ============ */}
      <div className={`intro-overlay exit-${EXIT_STYLE}`} aria-hidden="true">
        {/* Curtain panels — only used when EXIT_STYLE = "curtain" */}
        <div className="curtain-top" aria-hidden="true" />
        <div className="curtain-bottom" aria-hidden="true" />
        <div className="intro-mark">
        <svg className="intro-rings" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          {LOADER_FX !== "lite" && (
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
                  <circle className="intro-ring" mask={LOADER_FX === "lite" ? undefined : `url(#gap-mask-${i})`} cx="100" cy="100" r={r} fill="none" stroke="#1757f2" strokeWidth="10" />
                  <rect className="part-rect" x="85" y="100" width="131" height="0" fill="#fffad6" />
                </g>
              );
            })}
          </g>
          <text className="intro-wordmark" x="82" y="100" textAnchor="start" dominantBaseline="central" fontFamily="var(--font-dm-sans), DM Sans, sans-serif" fontWeight="900" fontSize="30" fill="#000" stroke="#000" strokeWidth="0.7" paintOrder="stroke" letterSpacing="0">CASEVA</text>
        </svg>
        </div>
        {/* Rolling odometer counter (000 → 100%) */}
        <div className="intro-counter" aria-hidden="true">
          <CounterDigits />
        </div>
      </div>

      {/* ============ PROMO BAR ============ */}
      <div className="promo-bar" role="region" aria-label="Promotion">
        <span aria-hidden="true">✦</span>
        <span>Free shipping on orders $30+ · Buy 2, get 1 free</span>
        <span aria-hidden="true">✦</span>
      </div>

      {/* ============ NAV ============ */}
      <nav className="nav-bar">
        <div className="nav-inner">
          <a className="logo" href="#" aria-label="CASEVA home">
            CASEVA
          </a>
          <div className="nav-right">
            <a className="nav-link" href="#collection">Shop</a>
            <a className="nav-link" href="#collection">Floral</a>
            <a className="nav-link" href="#collection">Clear</a>
            <a className="nav-link" href="#collection">MagSafe</a>
            <button className="icon-btn" aria-label="Search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </button>
            <button className="icon-btn" aria-label="Account">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="10" r="3" />
                <path d="M7 20.66a8 8 0 0 1 10 0" />
              </svg>
            </button>
            <button className="icon-btn cart-btn" aria-label="Cart, 2 items">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              <span className="cart-badge" aria-hidden="true">2</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ============ HERO ============ */}
      <section id="main" className="hero" aria-label="Hero">


        <div className="hero-content">
          <h1 className="headline left-align">
            Phone cases pretty enough<br className="desktop-br" />{" "}to keep on.
          </h1>

          <div className="model-selector" ref={modelMenuRef}>
            <button
              type="button"
              className="model-trigger"
              aria-haspopup="listbox"
              aria-expanded={modelOpen}
              aria-label={`Shop for ${selectedModel}. Click to change phone model.`}
              onClick={() => setModelOpen((v) => !v)}
            >
              <svg className="model-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="6" y="2" width="12" height="20" rx="2" />
                <line x1="11" y1="18" x2="13" y2="18" />
              </svg>
              <span className="model-label">
                <span className="model-prefix">Shop for</span>
                <span className="model-value">{selectedModel}</span>
              </span>
              <svg className={`model-chevron ${modelOpen ? "is-open" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {modelOpen && (
              <ul className="model-menu" role="listbox" aria-label="iPhone models">
                {PHONE_MODELS.map((m) => (
                  <li key={m} role="option" aria-selected={m === selectedModel}>
                    <button
                      type="button"
                      className={`model-option ${m === selectedModel ? "is-selected" : ""}`}
                      onClick={() => handleModelSelect(m)}
                    >
                      {m}
                      {m === selectedModel && (
                        <svg className="model-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="cta-wrap left-align">
            <a className="cta" href="#collection">
              Shop the Collection
              <svg className="cta-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </a>
          </div>

        </div>

        <div className="cases" suppressHydrationWarning>
          {heroCases.map((c) => (
            <Image
              key={c.src}
              className={c.className}
              data-rotate={c.rotate}
              data-x={c.x}
              data-y={c.y}
              src={c.src}
              alt={c.alt}
              width={300}
              height={450}
              priority={c.priority}
              draggable={false}
            />
          ))}
        </div>
      </section>

      {/* ============ VALUE PROP (Olipop frame 1 style) ============ */}
      <section className="value-prop">
        <Image className="vp-corner vp-tr" src="/silver-flower-case-v2.png" alt="" width={260} height={400} />
        <Image className="vp-corner vp-bl" src="/pink-floral-case-v2.png" alt="" width={260} height={400} />
        <Image className="vp-corner vp-br" src="/rose-case-v2.png" alt="" width={260} height={400} />
        <svg className="vp-dot vp-dot-1" viewBox="0 0 24 24"><circle cx="12" cy="12" r="6" /></svg>
        <svg className="vp-dot vp-dot-2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="6" /></svg>
        <div className="container vp-inner">
          <p className="vp-text reveal">
            Our <span className="vp-highlight">stylish</span> and{" "}
            <span className="vp-highlight">protective</span> phone cases combine impact-tested
            engineering and premium materials trusted by the top designers in the world.
          </p>
        </div>
      </section>

      {/* ============ CHEERS (Olipop frames 2-6 style) ============ */}
      <section className="cheers" id="benefits">
        <div className="cheers-stage">
          <div className="cheers-case left">
            <Image src="/tulip-case-v2.png" alt="Tulip case" width={420} height={620} priority />
            <svg className="splash splash-l" viewBox="0 0 200 120">
              <path d="M30 80 Q50 20 90 50 T160 30 L150 70 Q120 90 80 70 T30 80Z" />
              <circle cx="170" cy="20" r="5" />
              <circle cx="180" cy="60" r="3" />
              <circle cx="100" cy="10" r="4" />
            </svg>
          </div>
          <div className="cheers-case right">
            <Image src="/cream-floral-case-v2.png" alt="Cream case" width={420} height={620} priority />
            <svg className="splash splash-r" viewBox="0 0 200 120">
              <path d="M170 80 Q150 20 110 50 T40 30 L50 70 Q80 90 120 70 T170 80Z" />
              <circle cx="30" cy="20" r="5" />
              <circle cx="20" cy="60" r="3" />
              <circle cx="100" cy="10" r="4" />
            </svg>
          </div>
        </div>
        <div className="cheers-benefits">
          <span className="bpill bpill-1">Drop Protection</span>
          <span className="bpill bpill-2"><em>High</em><br />Quality</span>
          <span className="bpill bpill-3">Low<br /><strong>Profile</strong></span>
          <span className="bpill bpill-4">No<br />Compromise</span>
          <span className="bpill bpill-5">Slim Fit</span>
          <span className="bpill bpill-6"><span className="sm">2yr</span><br /><strong>Warranty</strong></span>
        </div>
      </section>

      {/* ============ COLLECTION (horizontal pinned scroll) ============ */}
      <section className="collection-wrap" id="collection">
        <div className="collection-inner">
          <h2 className="collection-title">Meet the Collection</h2>
          <div className="collection-track">
            {collection.map((p) => (
              <div className="collection-card" key={p.src}>
                <div className="collection-img">
                  <Image src={p.src} alt={p.name} width={360} height={540} />
                </div>
                <div className="collection-meta">
                  <span className="collection-name">{p.name}</span>
                  <span className="collection-price">{p.price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ COMPARISON ============ */}
      <section className="comparison">
        <div className="container">
          <h2 className="reveal headline">Why CASEVA?</h2>
          <div className="compare-grid">
            <div className="compare-col us">
              <div className="compare-tag">CASEVA</div>
              <div className="compare-stat">
                <span className="count" data-value="12">0</span>
                <span className="compare-unit">ft drop tested</span>
              </div>
              <div className="compare-stat">
                <span className="count" data-value="100">0</span>
                <span className="compare-unit">% recycled materials</span>
              </div>
              <div className="compare-stat">
                <span className="count" data-value="2">0</span>
                <span className="compare-unit">year warranty</span>
              </div>
            </div>
            <div className="compare-col them">
              <div className="compare-tag">Other Cases</div>
              <div className="compare-stat">
                <span>4</span>
                <span className="compare-unit">ft drop tested</span>
              </div>
              <div className="compare-stat">
                <span>0</span>
                <span className="compare-unit">% recycled materials</span>
              </div>
              <div className="compare-stat">
                <span>30</span>
                <span className="compare-unit">day warranty</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIAL ============ */}
      <section className="testimonial">
        <div className="container testimonial-inner">
          <div className="testimonial-image reveal">
            <Image src="/cream-floral-case-v2.png" alt="Featured case" width={360} height={540} />
          </div>
          <div className="testimonial-text reveal">
            <p className="quote">
              &ldquo;CASEVA hits the sweet spot between fashion accessory and serious protection.
              I haven&rsquo;t taken mine off since.&rdquo;
            </p>
            <div className="attribution">— Featured in Cosmopolitan</div>
          </div>
        </div>
      </section>

      {/* ============ SUBSCRIBE ============ */}
      <section className="subscribe" id="subscribe">
        <div className="subscribe-bg" />
        <div className="container subscribe-inner">
          <div className="subscribe-text">
            <h2 className="reveal headline light">Never miss a drop.</h2>
            <ul className="subscribe-list reveal">
              <li>Save 15% on every order</li>
              <li>Free shipping, always</li>
              <li>Early access to new collections</li>
              <li>Swap designs anytime</li>
            </ul>
            <button className="reveal cta light">Subscribe</button>
          </div>
          <div className="subscribe-image reveal">
            <Image src="/rose-case-v2.png" alt="Subscribe" width={300} height={450} />
          </div>
        </div>
      </section>

      {/* ============ PRESS ============ */}
      <section className="press">
        <div className="container">
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

      {/* ============ FOOTER ============ */}
      <footer className="footer">
        <div className="container footer-grid">
          <div>
            <div className="logo light">CASEVA</div>
            <p className="footer-tag">Your paradise, case by case.</p>
          </div>
          <div>
            <h4>Shop</h4>
            <a href="#">All Cases</a>
            <a href="#">New Arrivals</a>
            <a href="#">Best Sellers</a>
          </div>
          <div>
            <h4>Help</h4>
            <a href="#">Shipping</a>
            <a href="#">Returns</a>
            <a href="#">Contact</a>
          </div>
          <div>
            <h4>About</h4>
            <a href="#">Our Story</a>
            <a href="#">Sustainability</a>
            <a href="#">Press</a>
          </div>
        </div>
        <div className="container footer-bottom">© 2026 CASEVA. All rights reserved.</div>
      </footer>
    </div>
  );
}
