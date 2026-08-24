"use client";

import { useEffect, useState } from "react";
import { listOrders, type Order } from "../store";
import { formatPrice } from "../../data/products";

const STATUSES: (Order["status"] | "all")[] = ["all", "paid", "pending", "shipped", "refunded"];

const total = (o: Order) => o.lines.reduce((n, l) => n + l.price * l.qty, 0);

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("all");

  useEffect(() => { void listOrders().then(setOrders); }, []);
  if (!orders) return <p className="admin-empty">Loading…</p>;

  const shown = status === "all" ? orders : orders.filter((o) => o.status === status);
  const revenue = orders.filter((o) => o.status !== "refunded").reduce((n, o) => n + total(o), 0);

  return (
    <>
      <h1>Orders</h1>
      <p className="admin-sub">Read-only.</p>

      <div className="admin-note admin-note--warn">
        <b>These are mock rows.</b> Nothing creates orders yet — checkout is entirely
        client-side and makes no network calls, so there is no order to record. This screen
        exists to give your backend a shape to fill: see <code>Order</code> and{" "}
        <code>listOrders</code> in <code>app/admin/store.ts</code>.
      </div>

      <div className="admin-stats">
        <div className="admin-stat"><b>{orders.length}</b><span>Orders</span></div>
        <div className="admin-stat"><b>{formatPrice(revenue)}</b><span>Revenue (excl. refunds)</span></div>
        <div className="admin-stat">
          <b>{orders.filter((o) => o.status === "pending").length}</b><span>Pending</span>
        </div>
        <div className="admin-stat">
          <b>{orders.reduce((n, o) => n + o.lines.reduce((k, l) => k + l.qty, 0), 0)}</b>
          <span>Items sold</span>
        </div>
      </div>

      <div className="admin-field">
        <label htmlFor="status">Status</label>
        <select id="status" value={status}
          onChange={(e) => setStatus(e.target.value as (typeof STATUSES)[number])}>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="admin-panel">
        {shown.length === 0 ? (
          <p className="admin-empty">No {status} orders.</p>
        ) : (
          shown.map((o) => (
            <div className="admin-order" key={o.id}>
              <div className="admin-order-head">
                <span className="admin-order-id">{o.id}</span>
                <span className={`admin-status admin-status--${o.status}`}>{o.status}</span>
                <span style={{ marginLeft: "auto", fontWeight: 700 }}>{formatPrice(total(o))}</span>
              </div>
              <div className="admin-order-line" style={{ marginTop: 4 }}>
                {o.customer} · {o.email} ·{" "}
                {new Date(o.placedAt).toLocaleDateString(undefined, {
                  year: "numeric", month: "short", day: "numeric",
                })}
              </div>
              {o.lines.map((l, i) => (
                <div className="admin-order-line" key={i}>
                  {l.qty}× {l.name} — {l.model} — {formatPrice(l.price * l.qty)}
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </>
  );
}
