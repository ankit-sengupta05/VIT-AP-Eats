"use client";
import { useState } from "react";
import { TrendingUp, ShoppingBag, Star, Bike } from "lucide-react";
import { cn } from "@/lib/utils";
import { Toaster } from "react-hot-toast";

// Import tabs
import { OrdersTab } from "./OrdersTab";
import { PartnersTab } from "./PartnersTab";
import { MenuTab } from "./MenuTab";
import { InsightsTab } from "./InsightsTab";

const NAV_ITEMS = [
  { id: "orders",   label: "Orders",   icon: ShoppingBag },
  { id: "partners", label: "Partners", icon: Bike        },
  { id: "menu",     label: "Menu",     icon: Star        },
  { id: "insights", label: "Insights", icon: TrendingUp  },
];

export default function AdminPage() {
  const [tab, setTab] = useState<"orders" | "partners" | "menu" | "insights">("orders");

  return (
    <div className="min-h-screen flex bg-[--color-bg]">
      <Toaster />

      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 border-r border-[--color-border] bg-white dark:bg-zinc-950 sticky top-0 h-screen">
        <div className="p-4 border-b border-[--color-border]">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-[--radius-md] flex items-center justify-center text-white text-xs font-bold" style={{ background: "var(--color-primary)" }}>VE</span>
            <div>
              <p className="font-bold text-sm text-[--color-on-surface]" style={{ fontFamily: "var(--font-heading)" }}>Admin Center</p>
              <p className="text-xs text-[--color-tertiary]">● Live Ops</p>
            </div>
          </div>
        </div>
        <nav className="p-3 flex-1 space-y-1">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id as typeof tab)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-[--radius-md] text-sm font-medium transition-colors",
                tab === id ? "text-white" : "text-[--color-on-surface-variant] hover:bg-[--color-surface-container-low]"
              )}
              style={tab === id ? { background: "var(--color-primary)" } : {}}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-40 bg-white dark:bg-zinc-950 border-b border-[--color-border] shadow-sm">
          <div className="px-4 md:px-6 h-14 flex items-center gap-3">
            <h1 className="font-bold text-[--color-on-surface] flex-1" style={{ fontFamily: "var(--font-heading)" }}>
              {NAV_ITEMS.find((n) => n.id === tab)?.label}
            </h1>
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
          {tab === "orders"   && <OrdersTab />}
          {tab === "partners" && <PartnersTab partners={[]} />}
          {tab === "menu"     && <MenuTab />}
          {tab === "insights" && <InsightsTab />}
        </div>
      </div>
    </div>
  );
}
