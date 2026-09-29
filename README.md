# CASEVA

An e-commerce storefront for designer iPhone cases, with animated scrolling, product pages, a cart drawer and checkout.

## Features

- Landing page with a hero, curated product rows (new arrivals, sale, featured) and collection showcase
- Product detail pages at `/product/[slug]`
- Cart drawer with a shared cart context
- Checkout page
- GSAP animations (ScrollTrigger, CustomEase) and a page loader
- Promo bar, responsive navigation and footer

## Tech stack

Next.js (App Router), React 19, TypeScript, GSAP with `@gsap/react`, `next/font` (DM Sans, Fraunces, Caveat)

## Getting started

```bash
npm install
npm run dev       # http://localhost:3000
npm run build     # run before shipping any change
```

## Adding a product

The catalog is a single source of truth in `app/data/products.ts`. Drop the case image(s) in `public/` and add one entry:

- `collections`: free-form tags that place the product in merchandising rows (`new-arrivals`, `sale`, `featured`, or your own)
- `salePrice`: puts the product on sale
- `isNew`: shows the NEW badge
- `featured`: makes it eligible for the hero

Currency is set in one place (`CURRENCY` in the same file). bKash payments are planned.

## Project notes

See [`HANDOFF.md`](HANDOFF.md) for the project history and design notes.