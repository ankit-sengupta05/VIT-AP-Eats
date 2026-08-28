"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TrendingUp, ShoppingBag, Star, Bike, Loader2, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Toaster } from "react-hot-toast";
import { useSession } from "@/lib/hooks/useSession";

// Import tabs
import { OrdersTab }  from "./OrdersTab";
import { PartnersTab } from "./PartnersTab";
import { MenuTab }    from "./MenuTab";
import { InsightsTab } from "./InsightsTab";

const NAV_ITEMS = [
  { id: "orders",   label: "Orders",   icon: ShoppingBag },
  { id: "partners", label: "Partners", icon: Bike        },
  { id: "menu",     label: "Menu",     icon: Star        },
  { id: "insights", label: "Insights", icon: TrendingUp  },
];

export default function AdminPage() {
  const { user, role, loading } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<"orders" | "partners" | "menu" | "insights">("orders");

  // Redirect if not admin after session resolves
  useEffect(() => {
    if (!loading && role !== "admin") {
      router.replace("/");
    }
  }, [loading, role, router]);

  // Loading / access denied states
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[--color-bg]">
        <Loader2 size={36} className="animate-spin text-[--color-primary]" />
      </div>
    );
  }

  if (role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[--color-bg] text-center p-4">
        <Lock size={48} className="text-[--color-error]" />
        <h1 className="text-2xl font-bold text-[--color-on-surface]">Access Denied</h1>
        <p className="text-[--color-on-surface-variant]">You need admin privileges to access this page.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[--color-bg]">
      <Toaster position="top-right" />

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
          <p className="text-xs text-[--color-on-surface-variant] mt-2 truncate">{user?.email}</p>
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
        <div className="p-3 border-t border-[--color-border]">
          <a href="/" className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-[--color-on-surface-variant] hover:bg-[--color-surface-container-low] transition-colors">
            ← Back to Site
          </a>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-40 bg-[--color-surface-container-lowest] border-b border-[--color-border] shadow-sm">
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
