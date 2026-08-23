"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/content", label: "Content" },
  { href: "/admin/merchandising", label: "Merchandising" },
  { href: "/admin/phones", label: "Phones" },
  { href: "/admin/orders", label: "Orders" },
];

export default function AdminNav() {
  const path = usePathname();
  return (
    <nav className="admin-nav" aria-label="Admin sections">
      {TABS.map((t) => {
        // Overview must match exactly or it would light up on every page;
        // the others also match their child routes (e.g. /products/new).
        const active = t.href === "/admin" ? path === "/admin" : path.startsWith(t.href);
        return (
          <Link key={t.href} href={t.href} aria-current={active ? "page" : undefined}>
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
