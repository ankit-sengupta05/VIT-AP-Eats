"use client";
import { useState } from "react";
import { TrendingUp, ShoppingBag, Users, Star, Clock, CheckCircle2, AlertCircle, Bike, MoreVertical, Search, RefreshCw } from "lucide-react";
import { rupees, cn } from "@/lib/utils";

/* ─── Mock data ──────────────────────────────────────────────────────────── */
const STATS = [
  { label: "Today's Revenue", value: "₹12,480", delta: "+12%", icon: TrendingUp, positive: true  },
  { label: "Total Orders",    value: "84",       delta: "+8%",  icon: ShoppingBag, positive: true },
  { label: "Avg Rating",      value: "4.6 ★",   delta: "+0.1", icon: Star,        positive: true  },
  { label: "Active Partners", value: "7",        delta: "-1",   icon: Bike,        positive: false },
];

type OrderStatus = "new" | "accepted" | "preparing" | "ready" | "picked_up" | "delivered" | "cancelled";

interface Order {
  id: string;
  customer: string;
  items: string;
  total: number;
  status: OrderStatus;
  time: string;
}

const ORDERS: Order[] = [
  { id: "ORD-042", customer: "Priya S.",   items: "Biryani × 1, Naan × 2",   total: 207, status: "new",       time: "2 min ago" },
  { id: "ORD-041", customer: "Arjun M.",   items: "Paneer × 1, Roti × 3",    total: 259, status: "preparing", time: "12 min ago" },
  { id: "ORD-040", customer: "Sneha R.",   items: "Egg Biryani × 2",         total: 258, status: "ready",     time: "18 min ago" },
  { id: "ORD-039", customer: "Karthik P.", items: "Dal Tadka × 1, Naan × 1", total: 128, status: "delivered", time: "45 min ago" },
  { id: "ORD-038", customer: "Divya N.",   items: "Chicken Tikka × 1",       total: 189, status: "cancelled", time: "1 hr ago"   },
];

const STATUS_STYLES: Record<OrderStatus, { label: string; cls: string }> = {
  new:       { label: "New",       cls: "bg-blue-50 text-blue-700" },
  accepted:  { label: "Accepted",  cls: "bg-orange-50 text-orange-700" },
  preparing: { label: "Preparing", cls: "bg-amber-50 text-amber-700" },
  ready:     { label: "Ready",     cls: "bg-green-50 text-green-700" },
  picked_up: { label: "Picked Up", cls: "bg-purple-50 text-purple-700" },
  delivered: { label: "Delivered", cls: "bg-[--color-tertiary-container]/20 text-[--color-tertiary]" },
  cancelled: { label: "Cancelled", cls: "bg-[--color-error-container] text-[--color-error]" },
};

const NAV_ITEMS = [
  { id: "orders",   label: "Orders",   icon: ShoppingBag },
  { id: "partners", label: "Partners", icon: Bike        },
  { id: "menu",     label: "Menu",     icon: Star        },
  { id: "insights", label: "Insights", icon: TrendingUp  },
];

export default function AdminPage() {
  const [tab, setTab] = useState<"orders" | "partners" | "menu" | "insights">("orders");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");

  const filtered = statusFilter === "all" ? ORDERS : ORDERS.filter((o) => o.status === statusFilter);

  return (
    <div className="min-h-screen flex">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 border-r border-[--color-border] bg-[--color-surface-container-lowest] sticky top-0 h-screen">
        <div className="p-4 border-b border-[--color-border]">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-[--radius-md] flex items-center justify-center text-white text-xs font-bold" style={{ background: "var(--color-primary)" }}>VE</span>
            <div>
              <p className="font-bold text-sm text-[--color-on-surface]" style={{ fontFamily: "var(--font-heading)" }}>Spice Garden</p>
              <p className="text-xs text-[--color-tertiary]">● Open</p>
            </div>
          </div>
        </div>
        <nav className="p-3 flex-1">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id as typeof tab)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-[--radius-md] text-sm font-medium transition-colors mb-1",
                tab === id ? "text-white" : "text-[--color-on-surface-variant] hover:bg-[--color-surface-container-low]"
              )}
              style={tab === id ? { background: "var(--color-primary)" } : {}}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-[--color-border]">
          <div className="flex items-center gap-2 px-3 py-2">
            <div className="w-7 h-7 rounded-full bg-[--color-primary] flex items-center justify-center text-white text-xs font-bold">A</div>
            <div>
              <p className="text-xs font-semibold text-[--color-on-surface]">Admin User</p>
              <p className="text-[10px] text-[--color-on-surface-variant]">admin@vitap.ac.in</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-40 bg-[--color-surface-container-lowest] border-b border-[--color-border] shadow-[--shadow-sm]">
          <div className="px-4 md:px-6 h-14 flex items-center gap-3">
            <h1 className="font-bold text-[--color-on-surface] flex-1" style={{ fontFamily: "var(--font-heading)" }}>
              Restaurant Dashboard
            </h1>
            <button className="text-[--color-on-surface-variant] hover:text-[--color-primary] transition-colors">
              <RefreshCw size={18} />
            </button>
            {/* Mobile nav tabs */}
            <div className="md:hidden flex gap-1">
              {NAV_ITEMS.map(({ id, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setTab(id as typeof tab)}
                  className={cn("p-1.5 rounded-[--radius-md] transition-colors", tab === id ? "text-white" : "text-[--color-on-surface-variant]")}
                  style={tab === id ? { background: "var(--color-primary)" } : {}}
                >
                  <Icon size={18} />
                </button>
              ))}
            </div>
          </div>
        </header>

        <div className="px-4 md:px-6 py-6 space-y-6">
          {/* Stats grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {STATS.map(({ label, value, delta, icon: Icon, positive }) => (
              <div key={label} className="bg-[--color-surface-container-lowest] rounded-[--radius-lg] shadow-[--shadow-md] border border-[--color-border] p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 rounded-[--radius-md] flex items-center justify-center" style={{ background: "var(--color-primary-fixed)" }}>
                    <Icon size={18} style={{ color: "var(--color-primary)" }} />
                  </div>
                  <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-[--radius-full]", positive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700")}>
                    {delta}
                  </span>
                </div>
                <p className="text-xl font-extrabold tabular-nums text-[--color-on-surface]">{value}</p>
                <p className="text-xs text-[--color-on-surface-variant]">{label}</p>
              </div>
            ))}
          </div>

          {/* Orders tab */}
          {tab === "orders" && (
            <div>
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <h2 className="font-bold text-[--color-on-surface]" style={{ fontFamily: "var(--font-heading)" }}>Live Orders</h2>
                {/* Status filter pills */}
                <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                  {(["all", "new", "preparing", "ready", "delivered"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      className={cn(
                        "shrink-0 px-3 py-1 rounded-[--radius-full] text-xs font-semibold transition-all border",
                        statusFilter === s ? "text-white border-[--color-primary]" : "border-[--color-border] text-[--color-on-surface-variant] bg-[--color-surface-container-lowest]"
                      )}
                      style={statusFilter === s ? { background: "var(--color-primary)" } : {}}
                    >
                      {s === "all" ? "All" : STATUS_STYLES[s]?.label ?? s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {filtered.map((order) => {
                  const s = STATUS_STYLES[order.status];
                  return (
                    <div key={order.id} className="bg-[--color-surface-container-lowest] rounded-[--radius-lg] shadow-[--shadow-sm] border border-[--color-border] p-4 flex items-center gap-3">
                      {order.status === "new" ? (
                        <AlertCircle size={20} style={{ color: "var(--color-primary)" }} className="shrink-0" />
                      ) : order.status === "delivered" ? (
                        <CheckCircle2 size={20} style={{ color: "var(--color-tertiary)" }} className="shrink-0" />
                      ) : (
                        <Clock size={20} className="shrink-0 text-[--color-warning]" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-bold text-sm text-[--color-on-surface]">{order.id}</span>
                          <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold", s.cls)}>{s.label}</span>
                        </div>
                        <p className="text-xs text-[--color-on-surface-variant]">{order.customer} · {order.items}</p>
                        <p className="text-xs text-[--color-on-surface-variant]">{order.time}</p>
                      </div>
                      <span className="font-bold tabular-nums text-sm shrink-0">{rupees(order.total)}</span>
                      <button className="text-[--color-on-surface-variant] hover:text-[--color-on-surface] transition-colors">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Partners placeholder */}
          {tab === "partners" && (
            <div className="text-center py-20 text-[--color-on-surface-variant]">
              <Bike size={48} className="mx-auto mb-3 opacity-30" />
              <p className="font-semibold">Live partner map coming soon</p>
              <p className="text-sm mt-1">Phase 7 — real-time Mapbox partner tracking</p>
            </div>
          )}

          {/* Menu placeholder */}
          {tab === "menu" && (
            <div className="text-center py-20 text-[--color-on-surface-variant]">
              <Star size={48} className="mx-auto mb-3 opacity-30" />
              <p className="font-semibold">Menu management coming soon</p>
              <p className="text-sm mt-1">Phase 7 — add/edit/toggle dishes</p>
            </div>
          )}

          {/* Insights placeholder */}
          {tab === "insights" && (
            <div className="text-center py-20 text-[--color-on-surface-variant]">
              <TrendingUp size={48} className="mx-auto mb-3 opacity-30" />
              <p className="font-semibold">Analytics dashboard coming soon</p>
              <p className="text-sm mt-1">Phase 10 — revenue charts, top dishes, peak hours</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
