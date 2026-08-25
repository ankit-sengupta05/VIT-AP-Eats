"use client";
import { useState, useEffect, useCallback } from "react";
import { TrendingUp, ShoppingBag, Star, Bike, RefreshCw, Loader2 } from "lucide-react";
import { rupees, cn } from "@/lib/utils";
import { api } from "@/lib/api";
import toast, { Toaster } from "react-hot-toast";

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
  const [dashboard, setDashboard] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDashboard = useCallback(async (background = false) => {
    if (!background) setIsLoading(true);
    else setIsRefreshing(true);
    
    try {
      const data = await api.admin.dashboard();
      setDashboard(data);
    } catch {
      toast.error("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
    
    // Auto refresh every 10 seconds if we are on orders or partners tab
    const interval = setInterval(() => {
      if (tab === "orders" || tab === "partners") {
        fetchDashboard(true);
      }
    }, 10000);
    
    return () => clearInterval(interval);
  }, [fetchDashboard, tab]);

  if (isLoading && !dashboard) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[--color-bg]">
        <Loader2 size={36} className="animate-spin text-[--color-primary]" />
      </div>
    );
  }

  const { stats = {}, live_orders = [], partners = [] } = dashboard || {};

  const STATS = [
    { label: "Today's Revenue", value: rupees(stats.revenue ?? 0), icon: TrendingUp, positive: true  },
    { label: "Total Orders",    value: String(stats.total_orders ?? 0), icon: ShoppingBag, positive: true },
    { label: "Cancelled",       value: String(stats.cancelled ?? 0), icon: Star, positive: false  },
    { label: "Active Partners", value: String(stats.active_partners ?? 0), icon: Bike, positive: (stats.active_partners ?? 0) > 0 },
  ];

  return (
    <div className="min-h-screen flex bg-[--color-bg]">
      <Toaster />
      
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 border-r border-[--color-border] bg-[--color-surface-container-lowest] sticky top-0 h-screen">
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
                "w-full flex items-center justify-between px-3 py-2.5 rounded-[--radius-md] text-sm font-medium transition-colors",
                tab === id ? "text-white" : "text-[--color-on-surface-variant] hover:bg-[--color-surface-container-low]"
              )}
              style={tab === id ? { background: "var(--color-primary)" } : {}}
            >
              <div className="flex items-center gap-3">
                <Icon size={18} />
                {label}
              </div>
              {id === "orders" && live_orders.length > 0 && (
                <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-bold", tab === id ? "bg-white/20" : "bg-[--color-primary-fixed] text-[--color-primary]")}>
                  {live_orders.length}
                </span>
              )}
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
              {NAV_ITEMS.find(n => n.id === tab)?.label}
            </h1>
            <button 
              onClick={() => fetchDashboard()}
              disabled={isRefreshing}
              className={cn("text-[--color-on-surface-variant] hover:text-[--color-primary] transition-colors p-2", isRefreshing && "animate-spin text-[--color-primary]")}
            >
              <RefreshCw size={18} />
            </button>
            {/* Mobile nav tabs */}
            <div className="md:hidden flex gap-1">
              {NAV_ITEMS.map(({ id, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setTab(id as typeof tab)}
                  className={cn("p-1.5 rounded-[--radius-md] transition-colors relative", tab === id ? "text-white" : "text-[--color-on-surface-variant]")}
                  style={tab === id ? { background: "var(--color-primary)" } : {}}
                >
                  <Icon size={18} />
                  {id === "orders" && live_orders.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 border border-white" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </header>

        <div className="px-4 md:px-6 py-6 space-y-6">
          {/* Stats grid (always visible at top of tabs, except maybe map) */}
          {tab !== "partners" && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              {STATS.map(({ label, value, icon: Icon, positive }) => (
                <div key={label} className="bg-[--color-surface-container-lowest] rounded-[--radius-lg] shadow-[--shadow-md] border border-[--color-border] p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-9 h-9 rounded-[--radius-md] flex items-center justify-center" style={{ background: "var(--color-primary-fixed)" }}>
                      <Icon size={18} style={{ color: "var(--color-primary)" }} />
                    </div>
                  </div>
                  <p className={cn("text-xl font-extrabold tabular-nums text-[--color-on-surface]", !positive && label === "Cancelled" ? "text-red-600" : "")}>{value}</p>
                  <p className="text-xs text-[--color-on-surface-variant]">{label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Tab Content */}
          {tab === "orders" && <OrdersTab orders={live_orders} onUpdate={() => fetchDashboard(true)} />}
          {tab === "partners" && <PartnersTab partners={partners} />}
          {tab === "menu" && <MenuTab />}
          {tab === "insights" && <InsightsTab />}

        </div>
      </div>
    </div>
  );
}
