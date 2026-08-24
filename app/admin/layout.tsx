import type { Metadata } from "next";
import "./admin.css";
import AdminNav from "./AdminNav";

export const metadata: Metadata = {
  title: "Admin — CASEVA",
  // The admin has no business in search results.
  robots: { index: false, follow: false },
};

// Sits OUTSIDE app/(store), so it inherits only the root shell (html, body,
// fonts) and none of the storefront chrome.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin">
      <header className="admin-bar">
        <a className="admin-brand" href="/admin">CASEVA <span>admin</span></a>
        <a className="admin-back" href="/">View store →</a>
      </header>
      <AdminNav />
      <main className="admin-main" id="main">{children}</main>
    </div>
  );
}
