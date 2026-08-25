"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  TrendingUp, Bike, CheckCircle2, Clock, Star, Phone, MapPin,
  Bell, ToggleLeft, ToggleRight, Navigation, PackageCheck,
  AlertCircle, Loader2, ChevronRight, Banknote, X, Zap
} from "lucide-react";
import { rupees, cn } from "@/lib/utils";
import { api } from "@/lib/api";
import toast, { Toaster } from "react-hot-toast";

// ── Types ──────────────────────────────────────────────────────────────────
interface ActiveOrder {
  id: string;
  status: string;
  partner_payout: number;
  delivery_address: { label: string; line1: string; lat: number; lng: number };
  restaurants: { name: string; address: string; lat?: number; lng?: number };
  order_items: { quantity: number; menu_items: { name: string } }[];
}

interface DashboardData {
  profile: {
    full_name: string;
    is_online: boolean;
    today_earnings: number;
    total_deliveries: number;
    rating: number;
  } | null;
  active_order: ActiveOrder | null;
  today_deliveries: number;
}

// ── Step labels ─────────────────────────────────────────────────────────────
const STEP_ACTIONS: Record<string, { label: string; icon: any; color: string }> = {
  accepted:   { label: "Mark Preparing",   icon: Clock,         color: "var(--color-warning)" },
  preparing:  { label: "Mark Picked Up",   icon: PackageCheck,  color: "var(--color-primary)" },
  picked_up:  { label: "On the Way",       icon: Navigation,    color: "var(--color-tertiary)" },
  on_the_way: { label: "Mark Delivered ✓", icon: CheckCircle2,  color: "#22c55e" },
};

// ── Incoming Order Modal (30-second countdown) ───────────────────────────────
function IncomingOrderModal({
  order,
  onAccept,
  onReject,
}: {
  order: ActiveOrder;
  onAccept: () => void;
  onReject: () => void;
}) {
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    const t = setInterval(() => {
      setTimeLeft((s) => {
        if (s <= 1) { clearInterval(t); onReject(); return 0; }
        return s - 1;
      });
    }, 1000);

    // Vibrate on supported devices
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);

    return () => clearInterval(t);
  }, [onReject]);

  const pct = (timeLeft / 30) * 100;
  const itemCount = order.order_items?.reduce((s, i) => s + i.quantity, 0) ?? 0;

  return (
    <div className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-sm bg-white rounded-[--radius-lg] shadow-2xl overflow-hidden">
        {/* Countdown progress bar */}
        <div className="h-1.5 bg-gray-100">
          <div
            className="h-full transition-all duration-1000 ease-linear"
            style={{ width: `${pct}%`, background: timeLeft > 10 ? "#22c55e" : "#ef4444" }}
          />
        </div>

        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full flex items-center justify-center animate-bounce" style={{ background: "var(--color-primary)" }}>
                <Zap size={18} className="text-white" />
              </div>
              <div>
                <p className="font-extrabold text-gray-900" style={{ fontFamily: "var(--font-heading)" }}>New Order!</p>
                <p className="text-xs text-gray-500">{itemCount} item{itemCount !== 1 ? "s" : ""}</p>
              </div>
            </div>
            <div className={cn("text-2xl font-black tabular-nums", timeLeft <= 10 ? "text-red-500" : "text-gray-800")}>
              {timeLeft}s
            </div>
          </div>

          {/* Restaurant */}
          <div className="flex items-start gap-3 mb-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: "var(--color-primary-fixed)" }}>
              <Bike size={14} style={{ color: "var(--color-primary)" }} />
            </div>
            <div>
              <p className="text-xs text-gray-500">Pick up from</p>
              <p className="font-semibold text-gray-900 text-sm">{order.restaurants?.name}</p>
              <p className="text-xs text-gray-400">{order.restaurants?.address}</p>
            </div>
          </div>

          {/* Delivery location */}
          <div className="flex items-start gap-3 mb-4">
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-green-50">
              <MapPin size={14} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Deliver to</p>
              <p className="font-semibold text-gray-900 text-sm">{order.delivery_address?.label}</p>
              <p className="text-xs text-gray-400">{order.delivery_address?.line1}</p>
            </div>
          </div>

          {/* Payout */}
          <div className="flex items-center justify-between bg-green-50 rounded-[--radius-md] px-4 py-3 mb-5">
            <div className="flex items-center gap-2 text-green-700">
              <Banknote size={18} />
              <span className="font-semibold text-sm">Your Payout</span>
            </div>
            <span className="font-black text-xl text-green-700 tabular-nums">{rupees(order.partner_payout)}</span>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onReject}
              className="flex-1 py-3 rounded-[--radius-md] border-2 border-red-200 text-red-600 font-bold text-sm hover:bg-red-50 transition-colors flex items-center justify-center gap-1.5"
            >
              <X size={16} /> Reject
            </button>
            <button
              onClick={onAccept}
              className="flex-1 py-3 rounded-[--radius-md] text-white font-black text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
              style={{ background: "#22c55e", boxShadow: "0 4px 12px rgba(34,197,94,0.35)" }}
            >
              <CheckCircle2 size={16} /> Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Partner Dashboard ───────────────────────────────────────────────────
export default function PartnerDashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTogglingOnline, setIsTogglingOnline] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<ActiveOrder | null>(null);
  const locationWatchRef = useRef<number | null>(null);
  const pendingPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isOnline = dashboard?.profile?.is_online ?? false;
  const activeOrder = dashboard?.active_order ?? null;

  // ── Fetch dashboard data ─────────────────────────────────────────────────
  const fetchDashboard = useCallback(async () => {
    try {
      const data = await api.partner.dashboard();
      setDashboard(data);
    } catch {
      // Silently fail on background refresh
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  // ── GPS location broadcast ───────────────────────────────────────────────
  useEffect(() => {
    if (!isOnline) {
      if (locationWatchRef.current !== null) {
        navigator.geolocation.clearWatch(locationWatchRef.current);
        locationWatchRef.current = null;
      }
      return;
    }

    // Start watching; throttle broadcasts to at most once per 5s
    let lastBroadcast = 0;
    locationWatchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const now = Date.now();
        if (now - lastBroadcast < 5000) return;
        lastBroadcast = now;
        api.partner.broadcastLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          heading: pos.coords.heading ?? undefined,
          speed: pos.coords.speed ?? undefined,
        }).catch(() => {}); // Best-effort
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 4000 }
    );

    return () => {
      if (locationWatchRef.current !== null) {
        navigator.geolocation.clearWatch(locationWatchRef.current);
        locationWatchRef.current = null;
      }
    };
  }, [isOnline]);

  // ── Poll for incoming order requests (while online, no active order) ─────
  useEffect(() => {
    if (!isOnline || activeOrder) {
      if (pendingPollRef.current) clearInterval(pendingPollRef.current);
      return;
    }

    const poll = async () => {
      try {
        const data = await api.partner.getPending();
        if (data) setPendingOrder(data);
      } catch {}
    };

    poll();
    pendingPollRef.current = setInterval(poll, 8000);

    return () => {
      if (pendingPollRef.current) clearInterval(pendingPollRef.current);
    };
  }, [isOnline, activeOrder]);

  // ── Toggle online/offline ───────────────────────────────────────────────
  const handleToggleOnline = async () => {
    setIsTogglingOnline(true);
    try {
      await api.partner.setStatus(!isOnline);
      setDashboard((prev) => prev ? { ...prev, profile: prev.profile ? { ...prev.profile, is_online: !isOnline } : null } : null);
      toast.success(isOnline ? "You are now Offline" : "You're Online! Accepting orders 🟢");
    } catch {
      toast.error("Failed to update status");
    } finally {
      setIsTogglingOnline(false);
    }
  };

  // ── Accept incoming order ────────────────────────────────────────────────
  const handleAcceptOrder = async () => {
    if (!pendingOrder) return;
    try {
      await api.partner.acceptOrder(pendingOrder.id);
      setPendingOrder(null);
      await fetchDashboard();
      toast.success("Order accepted! Head to the restaurant.");
    } catch {
      toast.error("Could not accept order.");
      setPendingOrder(null);
    }
  };

  // ── Reject incoming order ────────────────────────────────────────────────
  const handleRejectOrder = async () => {
    if (!pendingOrder) return;
    try {
      await api.partner.rejectOrder(pendingOrder.id);
    } finally {
      setPendingOrder(null);
    }
  };

  // ── Advance order state ──────────────────────────────────────────────────
  const handleAdvance = async () => {
    if (!activeOrder) return;
    setIsAdvancing(true);
    try {
      const result = await api.partner.advanceOrder(activeOrder.id);
      const newStatus = result.status;
      const statusLabels: Record<string, string> = {
        preparing:  "Marked as Preparing 👨‍🍳",
        picked_up:  "Order Picked Up! 📦",
        on_the_way: "On the Way! 🛵",
        delivered:  "Delivered! Great job! 🎉",
      };
      toast.success(statusLabels[newStatus] ?? `Status: ${newStatus}`);
      await fetchDashboard();
    } catch (err: any) {
      toast.error(err.message ?? "Failed to update order status");
    } finally {
      setIsAdvancing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--color-bg)" }}>
        <Loader2 size={36} className="animate-spin text-[--color-primary]" />
      </div>
    );
  }

  const profile = dashboard?.profile;
  const stats = [
    { label: "Today's Deliveries", value: String(dashboard?.today_deliveries ?? 0),        icon: Bike,       color: "var(--color-primary)" },
    { label: "Today's Earnings",   value: rupees(profile?.today_earnings ?? 0),              icon: TrendingUp, color: "var(--color-tertiary)" },
    { label: "Rating",             value: `${profile?.rating ?? "—"} ★`,                   icon: Star,       color: "#f59e0b" },
    { label: "Total Deliveries",   value: String(profile?.total_deliveries ?? 0),           icon: CheckCircle2, color: "#22c55e" },
  ];

  const actionConfig = activeOrder ? STEP_ACTIONS[activeOrder.status] : null;

  return (
    <div className="min-h-screen pb-10" style={{ background: "var(--color-bg)" }}>
      <Toaster />

      {/* Incoming order modal */}
      {pendingOrder && (
        <IncomingOrderModal
          order={pendingOrder}
          onAccept={handleAcceptOrder}
          onReject={handleRejectOrder}
        />
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 shadow-[--shadow-sm]" style={{ background: "var(--color-inverse-surface)" }}>
        <div className="max-w-[800px] mx-auto px-4 h-14 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: "var(--color-primary)" }}>
            {profile?.full_name?.[0] ?? "P"}
          </div>
          <div className="flex-1">
            <p className="text-[--color-inverse-on-surface] font-bold text-sm leading-none" style={{ fontFamily: "var(--font-heading)" }}>
              {profile?.full_name ?? "Partner"}
            </p>
            <p className="text-[--color-inverse-on-surface] opacity-60 text-xs">{profile?.rating ?? "—"} ★</p>
          </div>
          <div className={cn(
            "w-2.5 h-2.5 rounded-full border-2 border-[--color-inverse-surface]",
            isOnline ? "bg-green-400" : "bg-gray-400"
          )} />
          <span className="text-[--color-inverse-on-surface] text-xs font-semibold opacity-70">
            {isOnline ? "Online" : "Offline"}
          </span>
        </div>
      </header>

      <div className="max-w-[800px] mx-auto px-4 py-6 space-y-5">

        {/* Online / Offline Toggle */}
        <div className={cn(
          "flex items-center justify-between rounded-[--radius-lg] shadow-[--shadow-md] p-4 border transition-colors",
          isOnline
            ? "border-green-200 bg-green-50"
            : "border-[--color-border] bg-[--color-surface-container-lowest]"
        )}>
          <div>
            <p className="font-bold text-[--color-on-surface]" style={{ fontFamily: "var(--font-heading)" }}>
              {isOnline ? "🟢 You're Online" : "⚫ You're Offline"}
            </p>
            <p className="text-sm text-[--color-on-surface-variant]">
              {isOnline ? "Accepting delivery requests" : "Go online to receive orders"}
            </p>
          </div>
          <button
            onClick={handleToggleOnline}
            disabled={isTogglingOnline}
            className="transition-colors disabled:opacity-50"
            style={{ color: isOnline ? "#22c55e" : "var(--color-outline)" }}
          >
            {isTogglingOnline
              ? <Loader2 size={40} className="animate-spin" />
              : isOnline ? <ToggleRight size={52} /> : <ToggleLeft size={52} />
            }
          </button>
        </div>

        {/* Today's Stats */}
        <div>
          <h2 className="text-base font-bold text-[--color-on-surface] mb-3" style={{ fontFamily: "var(--font-heading)" }}>Today's Summary</h2>
          <div className="grid grid-cols-2 gap-3">
            {stats.map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-[--color-surface-container-lowest] rounded-[--radius-lg] shadow-[--shadow-sm] p-4 border border-[--color-border]">
                <div className="w-8 h-8 rounded-[--radius-md] flex items-center justify-center mb-2" style={{ background: `${color}18` }}>
                  <Icon size={16} style={{ color }} />
                </div>
                <p className="text-xl font-extrabold tabular-nums text-[--color-on-surface]">{value}</p>
                <p className="text-xs text-[--color-on-surface-variant]">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Active Delivery */}
        {isOnline && activeOrder ? (
          <div>
            <h2 className="text-base font-bold text-[--color-on-surface] mb-3" style={{ fontFamily: "var(--font-heading)" }}>Active Delivery</h2>
            <div className="bg-[--color-surface-container-lowest] rounded-[--radius-lg] shadow-[--shadow-md] border border-[--color-border] overflow-hidden">
              {/* Status bar */}
              <div className="px-4 py-2.5 flex items-center justify-between" style={{ background: "var(--color-primary)" }}>
                <span className="text-white text-sm font-semibold">#{activeOrder.id.split("-")[0].toUpperCase()}</span>
                <span className="text-white text-xs bg-white/20 px-2.5 py-1 rounded-full font-semibold capitalize">
                  {activeOrder.status?.replace(/_/g, " ")}
                </span>
              </div>

              <div className="p-4 space-y-3">
                {/* Restaurant */}
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: "var(--color-primary-fixed)" }}>
                    <Bike size={15} style={{ color: "var(--color-primary)" }} />
                  </div>
                  <div>
                    <p className="text-xs text-[--color-on-surface-variant]">Pick up from</p>
                    <p className="font-semibold text-sm text-[--color-on-surface]">{activeOrder.restaurants?.name}</p>
                    <p className="text-xs text-[--color-on-surface-variant]">{activeOrder.restaurants?.address}</p>
                  </div>
                </div>

                {/* Customer */}
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-green-50">
                    <MapPin size={15} className="text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-[--color-on-surface-variant]">Deliver to</p>
                    <p className="font-semibold text-sm text-[--color-on-surface]">{activeOrder.delivery_address?.label}</p>
                    <p className="text-xs text-[--color-on-surface-variant]">{activeOrder.delivery_address?.line1}</p>
                  </div>
                </div>

                {/* Items summary */}
                <div className="bg-[--color-surface-container-low] rounded-[--radius-md] p-3 text-sm space-y-0.5">
                  {activeOrder.order_items?.map((item, i) => (
                    <p key={i} className="text-[--color-on-surface-variant]">
                      {item.quantity}× {item.menu_items?.name}
                    </p>
                  ))}
                </div>

                {/* Payout + Advance CTA */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 rounded-[--radius-md] p-3 text-center bg-[--color-primary-fixed]">
                    <p className="text-xs text-[--color-on-surface-variant]">Your Payout</p>
                    <p className="font-extrabold text-lg tabular-nums" style={{ color: "var(--color-primary)" }}>
                      {rupees(activeOrder.partner_payout)}
                    </p>
                  </div>
                  {actionConfig && (
                    <button
                      onClick={handleAdvance}
                      disabled={isAdvancing}
                      className="flex-1 py-3 text-white font-bold text-sm rounded-[--radius-md] hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-60"
                      style={{ background: actionConfig.color, boxShadow: "0 4px 14px rgba(0,0,0,0.2)" }}
                    >
                      {isAdvancing
                        ? <Loader2 size={16} className="animate-spin" />
                        : <actionConfig.icon size={16} />}
                      {isAdvancing ? "Updating..." : actionConfig.label}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : isOnline ? (
          <div className="flex flex-col items-center gap-3 py-12 bg-[--color-surface-container-lowest] rounded-[--radius-lg] border border-[--color-border] border-dashed">
            <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "var(--color-primary-fixed)" }}>
              <Bell size={24} style={{ color: "var(--color-primary)" }} className="animate-pulse" />
            </div>
            <p className="font-bold text-[--color-on-surface]" style={{ fontFamily: "var(--font-heading)" }}>Waiting for orders...</p>
            <p className="text-sm text-[--color-on-surface-variant] text-center max-w-xs">
              You'll be notified the moment a delivery request arrives nearby.
            </p>
          </div>
        ) : null}

        {/* Quick links */}
        <div className="bg-[--color-surface-container-lowest] rounded-[--radius-lg] border border-[--color-border] divide-y divide-[--color-border] overflow-hidden">
          <a href="/partner/earnings"
            className="flex items-center justify-between px-4 py-3.5 hover:bg-[--color-surface-container-low] transition-colors">
            <div className="flex items-center gap-3">
              <Banknote size={18} style={{ color: "var(--color-tertiary)" }} />
              <span className="font-semibold text-sm text-[--color-on-surface]">Earnings & Payouts</span>
            </div>
            <ChevronRight size={16} className="text-[--color-on-surface-variant]" />
          </a>
          <a href="/partner/history"
            className="flex items-center justify-between px-4 py-3.5 hover:bg-[--color-surface-container-low] transition-colors">
            <div className="flex items-center gap-3">
              <Clock size={18} style={{ color: "var(--color-primary)" }} />
              <span className="font-semibold text-sm text-[--color-on-surface]">Delivery History</span>
            </div>
            <ChevronRight size={16} className="text-[--color-on-surface-variant]" />
          </a>
        </div>

      </div>
    </div>
  );
}
