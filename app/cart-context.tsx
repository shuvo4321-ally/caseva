"use client";

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";

export type CartItem = {
  slug: string;
  name: string;
  image: string;
  price: number; // unit price actually charged (sale price if on sale)
  model: string;
  qty: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  addItem: (item: Omit<CartItem, "qty">, qty?: number) => void;
  removeItem: (slug: string, model: string) => void;
  setQty: (slug: string, model: string, qty: number) => void;
  clear: () => void;
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "caseva-cart";

// A line is unique per (slug + model): the same case for two different iPhones
// is two lines, but re-adding the same case+model just bumps qty.
const sameLine = (a: { slug: string; model: string }, b: { slug: string; model: string }) =>
  a.slug === b.slug && a.model === b.model;

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Load once on mount (avoids SSR/client mismatch — render empty first).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* localStorage unavailable / corrupt */
    }
    setHydrated(true);
  }, []);

  // Persist after hydration so we never overwrite saved data with the initial [].
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items, hydrated]);

  const addItem = useCallback((item: Omit<CartItem, "qty">, qty = 1) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => sameLine(i, item));
      if (idx === -1) return [...prev, { ...item, qty }];
      const next = [...prev];
      next[idx] = { ...next[idx], qty: next[idx].qty + qty };
      return next;
    });
  }, []);

  const removeItem = useCallback((slug: string, model: string) => {
    setItems((prev) => prev.filter((i) => !sameLine(i, { slug, model })));
  }, []);

  const setQty = useCallback((slug: string, model: string, qty: number) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => !sameLine(i, { slug, model }))
        : prev.map((i) => (sameLine(i, { slug, model }) ? { ...i, qty } : i))
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);
  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const count = useMemo(() => items.reduce((n, i) => n + i.qty, 0), [items]);
  const subtotal = useMemo(() => items.reduce((s, i) => s + i.price * i.qty, 0), [items]);

  const value: CartContextValue = {
    items, count, subtotal,
    addItem, removeItem, setQty, clear,
    drawerOpen, openDrawer, closeDrawer,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within <CartProvider>");
  return ctx;
}
