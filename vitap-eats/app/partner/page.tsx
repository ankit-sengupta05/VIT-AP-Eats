"use client";
import { useState } from "react";
import { TrendingUp, Bike, CheckCircle2, Clock, Star, Phone, MapPin, Bell, ToggleLeft, ToggleRight } from "lucide-react";
import { rupees, cn } from "@/lib/utils";

const TODAY_STATS = [
  { label: "Deliveries",  value: "12",      icon: Bike,        color: "var(--color-primary)" },
  { label: "Earnings",    value: "₹1,240",  icon: TrendingUp,  color: "var(--color-tertiary)" },
  { label: "Rating",      value: "4.8 ★",  icon: Star,        color: "var(--color-warning)" },
  { label: "Avg. Time",   value: "22 min",  icon: Clock,       color: "var(--color-info, #3A6EA5)" },
];

const ACTIVE_ORDER = {
  id: "ORD-2026-042",
  status: "preparing" as const,
  customer: { name: "Priya S.", phone: "+91 90000 12345", address: "Hostel Block A, Room 201" },
  restaurant: { name: "Spice Garden", address: "Near Main Gate, VIT-AP" },
  items: [{ name: "Chicken Biryani", qty: 1 }, { name: "Butter Naan", qty: 2 }],
  payout: 45,
  distance: "1.2 km",
};

export default function PartnerDashboardPage() {
  const [isOnline, setIsOnline] = useState(true);

  return (
    <div className="min-h-screen" style={{ background: "var(--color-bg)" }}>
      {/* Partner header */}
      <header className="sticky top-0 z-40 shadow-[--shadow-sm]" style={{ background: "var(--color-inverse-surface)" }}>
        <div className="max-w-[1280px] mx-auto px-4 md:px-10 h-14 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[--color-primary] flex items-center justify-center text-white font-bold text-sm">R</div>
          <span className="text-[--color-inverse-on-surface] font-bold flex-1" style={{ fontFamily: "var(--font-heading)" }}>
            Partner App
          </span>
          <button className="text-[--color-inverse-on-surface] hover:opacity-70 transition-opacity">
            <Bell size={20} />
          </button>
        </div>
      </header>

      <div className="max-w-[1280px] mx-auto px-4 md:px-10 py-6 space-y-6">

        {/* Online toggle */}
        <div className="flex items-center justify-between bg-[--color-surface-container-lowest] rounded-[--radius-lg] shadow-[--shadow-md] p-4 border border-[--color-border]">
          <div>
            <p className="font-bold text-[--color-on-surface]" style={{ fontFamily: "var(--font-heading)" }}>
              {isOnline ? "You're Online 🟢" : "You're Offline ⚫"}
            </p>
            <p className="text-sm text-[--color-on-surface-variant]">
              {isOnline ? "Accepting delivery requests" : "Go online to receive orders"}
            </p>
          </div>
          <button
            onClick={() => setIsOnline((v) => !v)}
            className="transition-colors"
            style={{ color: isOnline ? "var(--color-tertiary)" : "var(--color-outline)" }}
          >
            {isOnline ? <ToggleRight size={44} /> : <ToggleLeft size={44} />}
          </button>
        </div>

        {/* Today's stats */}
        <div>
          <h2 className="text-lg font-bold text-[--color-on-surface] mb-3" style={{ fontFamily: "var(--font-heading)" }}>Today's Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {TODAY_STATS.map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-[--color-surface-container-lowest] rounded-[--radius-lg] shadow-[--shadow-md] p-4 border border-[--color-border]">
                <div className="w-9 h-9 rounded-[--radius-md] flex items-center justify-center mb-2" style={{ background: `${color}18` }}>
                  <Icon size={18} style={{ color }} />
                </div>
                <p className="text-xl font-extrabold tabular-nums text-[--color-on-surface]">{value}</p>
                <p className="text-xs text-[--color-on-surface-variant]">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Active order */}
        {isOnline && (
          <div>
            <h2 className="text-lg font-bold text-[--color-on-surface] mb-3" style={{ fontFamily: "var(--font-heading)" }}>Active Delivery</h2>
            <div className="bg-[--color-surface-container-lowest] rounded-[--radius-lg] shadow-[--shadow-md] border border-[--color-border] overflow-hidden">
              {/* Status bar */}
              <div className="px-4 py-2 flex items-center justify-between" style={{ background: "var(--color-primary)" }}>
                <span className="text-white text-sm font-semibold">{ACTIVE_ORDER.id}</span>
                <span className="text-white text-sm bg-white/20 px-2 py-0.5 rounded-full">Preparing</span>
              </div>

              <div className="p-4 space-y-4">
                {/* Restaurant */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "var(--color-primary-fixed)" }}>
                    <Bike size={16} style={{ color: "var(--color-primary)" }} />
                  </div>
                  <div>
                    <p className="text-xs text-[--color-on-surface-variant]">Pick up from</p>
                    <p className="font-semibold text-sm text-[--color-on-surface]">{ACTIVE_ORDER.restaurant.name}</p>
                    <p className="text-xs text-[--color-on-surface-variant]">{ACTIVE_ORDER.restaurant.address}</p>
                  </div>
                </div>

                {/* Customer */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "var(--color-tertiary-container)", opacity: 0.2 }}>
                    <MapPin size={16} style={{ color: "var(--color-tertiary)" }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-[--color-on-surface-variant]">Deliver to</p>
                    <p className="font-semibold text-sm text-[--color-on-surface]">{ACTIVE_ORDER.customer.name} · {ACTIVE_ORDER.distance}</p>
                    <p className="text-xs text-[--color-on-surface-variant]">{ACTIVE_ORDER.customer.address}</p>
                  </div>
                  <a href={`tel:${ACTIVE_ORDER.customer.phone}`} className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm" style={{ background: "var(--color-tertiary)" }}>
                    <Phone size={14} />
                  </a>
                </div>

                {/* Items */}
                <div className="bg-[--color-surface-container-low] rounded-[--radius-md] p-3 text-sm">
                  {ACTIVE_ORDER.items.map((i) => (
                    <p key={i.name} className="text-[--color-on-surface-variant]">{i.qty}× {i.name}</p>
                  ))}
                </div>

                {/* Payout + CTA */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-[--color-primary-fixed] rounded-[--radius-md] p-3 text-center">
                    <p className="text-xs text-[--color-on-surface-variant]">Your Payout</p>
                    <p className="font-extrabold text-lg tabular-nums" style={{ color: "var(--color-primary)" }}>{rupees(ACTIVE_ORDER.payout)}</p>
                  </div>
                  <button
                    className="flex-1 py-3 text-white font-bold text-sm rounded-[--radius-md] hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                    style={{ background: "var(--color-tertiary)", boxShadow: "0 4px 12px rgba(0,107,41,0.3)" }}
                  >
                    <CheckCircle2 size={16} /> Mark Picked Up
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
