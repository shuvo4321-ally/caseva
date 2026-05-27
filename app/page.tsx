"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger, useGSAP);

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

export default function Home() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // ----- HERO: strong directional parallax for each case -----
      gsap.utils.toArray<HTMLElement>(".case").forEach((el) => {
        const rotate = Number(el.dataset.rotate || 0);
        const x = Number(el.dataset.x || 0);
        const y = Number(el.dataset.y || 0);
        gsap.set(el, { rotate });
        gsap.to(el, {
          x,
          y,
          rotate: rotate * 1.5,
          ease: "none",
          scrollTrigger: {
            trigger: ".hero",
            start: "top top",
            end: "bottom top",
            scrub: 0.6,
          },
        });
      });

      const heroTl = gsap.timeline({
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 0.6 },
      });

      // Layered text/CTA drift at different speeds via same timeline
      heroTl
        .to(".hero-content", { y: -150, opacity: 0 }, 0);

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
        { sel: ".subscribe", color: "#1948e8" },        // blue
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
      {/* ============ NAV ============ */}
      <nav className="nav-bar">
        <div className="nav-inner">
          <a className="logo" href="#" aria-label="CASEVA home">
            CASEVA
          </a>
          <div className="nav-right">
            <button className="shop-btn">Shop</button>
            <a className="nav-link" href="#benefits">Learn</a>
            <a className="nav-link" href="#subscribe">Subscribe</a>
            <button className="icon-btn" aria-label="Account">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="10" r="3" />
                <path d="M7 20.66a8 8 0 0 1 10 0" />
              </svg>
            </button>
            <button className="icon-btn" aria-label="Cart">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* ============ HERO ============ */}
      <section className="hero" aria-label="Hero">
        <div className="hero-pattern" aria-hidden="true" />

        <div className="hero-content">
          <h1 className="headline left-align">Say hello to<br/>your new<br/>favorite designs</h1>
          <div className="cta-wrap left-align">
            <a className="cta" href="#collection">
              Shop Now
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
