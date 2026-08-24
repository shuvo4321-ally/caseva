"use client";

// Validation for the admin forms. Every rule here is a real way to break the
// storefront, not house style — the comment on each says which.

import { CASE_TYPES, PHONE_MODELS, type Product } from "../data/products";

export type Issue = { field: string; message: string; level: "error" | "warning" };

export const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const isPackshot = (src: string) => /\.png$/i.test(src);

/**
 * `others` is every OTHER product, used for the uniqueness check — pass the
 * list with the one being edited removed.
 */
export const validateProduct = (p: Partial<Product>, others: Product[]): Issue[] => {
  const issues: Issue[] = [];
  const err = (field: string, message: string) => issues.push({ field, message, level: "error" });
  const warn = (field: string, message: string) => issues.push({ field, message, level: "warning" });

  if (!p.name?.trim()) err("name", "Name is required.");

  // The slug is the product URL and half of the cart line key (cart-context
  // keys lines on slug + model), so a duplicate silently merges two products'
  // cart lines into one.
  if (!p.slug?.trim()) err("slug", "Slug is required.");
  else if (p.slug !== slugify(p.slug))
    err("slug", `Not URL-safe. Use "${slugify(p.slug)}".`);
  else if (others.some((o) => o.slug === p.slug))
    err("slug", "Another product already uses this slug.");

  if (p.price === undefined || Number.isNaN(p.price)) err("price", "Price is required.");
  else if (p.price <= 0) err("price", "Price must be above 0.");

  // A sale price at or above the full price renders a struck-through number
  // that looks like an increase.
  if (p.salePrice !== undefined && p.price !== undefined) {
    if (p.salePrice <= 0) err("salePrice", "Sale price must be above 0.");
    else if (p.salePrice >= p.price) err("salePrice", "Sale price must be below the regular price.");
  }

  const images = p.images ?? [];
  if (images.length === 0) err("images", "At least one image is required.");
  else {
    // images[0] is the card image on /shop and the home row.
    if (!images[0]?.trim()) err("images", "The first image cannot be blank.");
    else if (!isPackshot(images[0]))
      warn("images", "The first image is the card image and should be a .png packshot — ProductDetail renders .jpg as a full-bleed lifestyle shot.");
    if (new Set(images).size !== images.length) warn("images", "The same image is listed more than once.");
    images.forEach((src, i) => {
      if (src && !src.startsWith("/")) err("images", `Image ${i + 1} must start with "/" (a path under /public).`);
    });
  }

  if (!p.alt?.trim()) warn("alt", "Alt text is empty — screen readers will announce nothing for this image.");
  if (!p.description?.trim()) warn("description", "Description is empty.");

  // A caseType outside the list drops the product out of the case-type filter.
  if (!p.caseType) err("caseType", "Case type is required.");
  else if (!(CASE_TYPES as readonly string[]).includes(p.caseType))
    err("caseType", `Unknown case type "${p.caseType}".`);

  // Omitting fitsModels means "fits everything"; an unknown MODEL, though,
  // silently removes the product from that model's filter.
  if (p.fitsModels) {
    const unknown = p.fitsModels.filter((m) => !PHONE_MODELS.includes(m));
    if (unknown.length) err("fitsModels", `Unknown model(s): ${unknown.join(", ")}.`);
    if (p.fitsModels.length === 0)
      warn("fitsModels", "Empty list means this fits NO phone. Leave every box unchecked to mean “fits all”.");
  }

  return issues;
};

export const errorsOnly = (issues: Issue[]) => issues.filter((i) => i.level === "error");
