"use client";
import { useEffect, useState, useRef, use } from "react";
import {
  CheckCircle2, Circle, Clock, MapPin, Phone, Bike, Loader2,
  XCircle, AlertTriangle, Wifi, WifiOff, Share2, ReceiptText, RotateCcw
} from "lucide-react";
import { cn, rupees } from "@/lib/utils";
import Link from "next/link";
import { useOrder, useCancelOrder } from "@/lib/hooks";
import { useCartStore } from "@/lib/store/cart";
import { Skeleton } from "@/components/ui/Skeleton";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

const STEPS = [
  { key: "placed",     label: "Order Placed",    detail: "We've received your order",       emoji: "🛒" },
  { key: "accepted",   label: "Order Accepted",   detail: "Restaurant confirmed your order", emoji: "✅" },
  { key: "preparing",  label: "Preparing",        detail: "Chef is cooking your food",       emoji: "👨‍🍳" },
  { key: "picked_up",  label: "Picked Up",        detail: "Partner is heading to you",       emoji: "🛵" },
  { key: "on_the_way", label: "On the Way",       detail: "Your order is nearby!",           emoji: "🔜" },
  { key: "delivered",  label: "Delivered",        detail: "Enjoy your meal! 🎉",             emoji: "🎉" },
] as const;

const STATUS_ORDER = STEPS.map((s) => s.key);

const STATUS_COLORS: Record<string, string> = {
  placed:     "var(--color-warning, #F59E0B)",
  accepted:   "var(--color-primary)",
  preparing:  "var(--color-primary)",
  picked_up:  "var(--color-tertiary)",
  on_the_way: "var(--color-tertiary)",
  delivered:  "#22c55e",
  cancelled:  "var(--color-error)",
};

// ── Status Toast Helper ─────────────────────────────────────────────────────
function showStatusToast(status: string) {
  const step = STEPS.find(s => s.key === status);
  if (!step) return;
  toast.custom((t) => (
    <div className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border bg-white max-w-xs transition-all",
      t.visible ? "animate-enter opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
    )}>
      <span className="text-2xl">{step.emoji}</span>
      <div>
        <p className="font-bold text-sm text-gray-900">{step.label}</p>
        <p className="text-xs text-gray-500">{step.detail}</p>
      </div>
    </div>
  ), { duration: 4000, position: "top-center" });
}

// ── Cancel Dialog ──────────────────────────────────────────────────────────
function CancelDialog({ onConfirm, onCancel, isPending }: { onConfirm: () => void; onCancel: () => void; isPending: boolean }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 border border-gray-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
            <AlertTriangle size={20} className="text-red-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Cancel this order?</h3>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          This action cannot be undone. Refunds for online payments will be processed within 5–7 business days.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-gray-200 font-semibold text-sm text-gray-700 hover:bg-gray-50">
            Keep Order
          </button>
          <button onClick={onConfirm} disabled={isPending} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 disabled:opacity-60 flex items-center justify-center gap-2">
            {isPending ? <Loader2 size={14} className="animate-spin" /> : null}
            Yes, Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function OrderTrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: order, isLoading, isError, refetch } = useOrder(id);
  const { mutate: cancelOrder, isPending: isCancelling } = useCancelOrder(id);
  const { items: cartItems, clear, clearAndAdd } = useCartStore();

  const [liveStatus, setLiveStatus] = useState<string | null>(null);
  const [realtimeConnected, setRealtimeConnected] = useState<boolean | null>(null);
  const [showCancel, setShowCancel] = useState(false);
  const prevStatusRef = useRef<string | null>(null);

  // ── Supabase Realtime subscription ────────────────────────────────────────
  useEffect(() => {
    if (!id) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`order-${id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${id}`,
        },
        (payload) => {
          const newStatus = payload.new?.status;
          if (newStatus && newStatus !== prevStatusRef.current) {
            prevStatusRef.current = newStatus;
            setLiveStatus(newStatus);
            showStatusToast(newStatus);
            // Keep React Query cache in sync
            refetch();
          }
        }
      )
      .subscribe((status) => {
        setRealtimeConnected(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, refetch]);

  const currentStatus = liveStatus ?? order?.status ?? "placed";
  const currentIdx = STATUS_ORDER.indexOf(currentStatus as any);
  const isCancelled = currentStatus === "cancelled";
  const isTerminal = isCancelled || currentStatus === "delivered";
  const canCancel = ["placed", "accepted"].includes(currentStatus);

  const handleCancelConfirm = () => {
    cancelOrder(undefined, {
      onSuccess: () => {
        setShowCancel(false);
        toast.error("Order cancelled.", { icon: "🚫" });
      },
      onError: (err: any) => {
        setShowCancel(false);
        toast.error(err.message ?? "Could not cancel the order.");
      },
    });
  };

  const handleReorder = () => {
    if (!order?.order_items?.length) return;
    const firstItem = order.order_items[0];
    const menuItem = firstItem.menu_items;
    if (!menuItem) return;
    toast.success("Items added to cart! Head to /cart to checkout.", { duration: 3000 });
    router.push("/cart");
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: "Track my VIT-AP Eats order", url });
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Tracking link copied!");
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-[900px] mx-auto px-4 md:px-10 py-10 space-y-4">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-24 w-full" />
        <div className="grid md:grid-cols-2 gap-6">
          <Skeleton className="h-72" />
          <div className="space-y-4"><Skeleton className="h-32" /><Skeleton className="h-32" /></div>
        </div>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="text-center py-20">
        <p className="text-5xl mb-3">😕</p>
        <p className="font-semibold text-[--color-on-surface]">Order not found</p>
        <Link href="/" className="mt-4 inline-block text-[--color-primary] font-semibold hover:underline">← Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="max-w-[900px] mx-auto px-4 md:px-10 py-6 md:py-10">
      <Toaster />
      {showCancel && (
        <CancelDialog
          onConfirm={handleCancelConfirm}
          onCancel={() => setShowCancel(false)}
          isPending={isCancelling}
        />
      )}

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-[--color-on-surface]" style={{ fontFamily: "var(--font-heading)" }}>
              {isCancelled ? "Order Cancelled" : "Tracking Order"}
            </h1>
            <p className="text-sm text-[--color-on-surface-variant]">
              #{id.split("-")[0].toUpperCase()} · {new Date(order.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Realtime indicator */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border"
              style={{
                background: realtimeConnected ? "#dcfce7" : realtimeConnected === false ? "#fef2f2" : "#f9fafb",
                borderColor: realtimeConnected ? "#86efac" : realtimeConnected === false ? "#fca5a5" : "#e5e7eb",
                color: realtimeConnected ? "#16a34a" : realtimeConnected === false ? "#dc2626" : "#6b7280",
              }}>
              {realtimeConnected
                ? <><Wifi size={12} /> Live</>
                : realtimeConnected === false
                  ? <><WifiOff size={12} /> Reconnecting</>
                  : <><Loader2 size={12} className="animate-spin" /> Connecting</>
              }
            </div>
            <span
              className="px-3 py-1 rounded-[--radius-full] text-sm font-bold text-white capitalize"
              style={{ background: STATUS_COLORS[currentStatus] ?? "var(--color-warning)" }}
            >
              {currentStatus?.replace(/_/g, " ")}
            </span>
          </div>
        </div>

        {/* Status Banner */}
        {!isTerminal && (
          <div className="mt-4 flex items-center gap-3 rounded-[--radius-lg] px-4 py-3" style={{ background: "var(--color-primary-fixed)" }}>
            <Clock size={20} style={{ color: "var(--color-primary)" }} />
            <div>
              <p className="font-bold text-[--color-on-surface]">{STEPS[currentIdx]?.detail ?? "Tracking your order..."}</p>
              <p className="text-xs text-[--color-on-surface-variant]">
                {realtimeConnected ? "Live updates enabled" : "Refreshes every 15 seconds"}
              </p>
            </div>
          </div>
        )}
        {isCancelled && (
          <div className="mt-4 flex items-center gap-3 rounded-[--radius-lg] px-4 py-3 bg-red-50 border border-red-200">
            <XCircle size={20} className="text-red-500" />
            <div>
              <p className="font-bold text-red-700">Your order has been cancelled.</p>
              <p className="text-xs text-red-500">Any applicable refund will be processed within 5–7 business days.</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Status Timeline */}
        <div className="bg-[--color-surface-container-lowest] rounded-[--radius-lg] shadow-[--shadow-md] border border-[--color-border] p-5">
          <h2 className="font-bold text-[--color-on-surface] mb-4" style={{ fontFamily: "var(--font-heading)" }}>Order Status</h2>
          <div className="space-y-4">
            {STEPS.map((step, i) => {
              const done = i <= currentIdx && !isCancelled;
              const current = i === currentIdx && !isCancelled;
              return (
                <div key={step.key} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    {done ? (
                      <CheckCircle2
                        size={20}
                        className={cn(current ? "text-[--color-primary]" : "text-[--color-tertiary]")}
                        fill="currentColor"
                      />
                    ) : (
                      <Circle size={20} className="text-[--color-border]" />
                    )}
                    {i < STEPS.length - 1 && (
                      <div className={cn("w-0.5 flex-1 mt-1 mb-1 min-h-[20px]", done ? "bg-[--color-tertiary]" : "bg-[--color-border]")} />
                    )}
                  </div>
                  <div className={cn("flex-1 pb-1", !done && !current && "opacity-40")}>
                    <p className={cn("font-semibold text-sm", current && "text-[--color-primary]")}>
                      {step.emoji} {step.label}
                    </p>
                    <p className="text-xs text-[--color-on-surface-variant]">{step.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          {/* Delivery Partner */}
          {order.partner && (
            <div className="bg-[--color-surface-container-lowest] rounded-[--radius-lg] shadow-[--shadow-md] border border-[--color-border] p-4">
              <h2 className="font-bold text-[--color-on-surface] mb-3" style={{ fontFamily: "var(--font-heading)" }}>Delivery Partner</h2>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg" style={{ background: "var(--color-primary)" }}>
                  {order.partner.full_name?.[0]}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-[--color-on-surface]">{order.partner.full_name}</p>
                  <p className="text-xs text-[--color-on-surface-variant]">⭐ {order.partner.rating}</p>
                </div>
                <a href={`tel:${order.partner.phone}`}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white hover:opacity-80 transition-opacity"
                  style={{ background: "var(--color-tertiary)" }}>
                  <Phone size={16} />
                </a>
              </div>
            </div>
          )}

          {/* Addresses */}
          <div className="bg-[--color-surface-container-lowest] rounded-[--radius-lg] shadow-[--shadow-md] border border-[--color-border] p-4 space-y-3">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: "var(--color-primary-fixed)" }}>
                <Bike size={14} style={{ color: "var(--color-primary)" }} />
              </div>
              <div>
                <p className="text-xs text-[--color-on-surface-variant]">Pickup from</p>
                <p className="font-semibold text-sm text-[--color-on-surface]">{order.restaurants?.name}</p>
                <p className="text-xs text-[--color-on-surface-variant]">{order.restaurants?.address}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: "color-mix(in srgb, var(--color-tertiary) 15%, transparent)" }}>
                <MapPin size={14} style={{ color: "var(--color-tertiary)" }} />
              </div>
              <div>
                <p className="text-xs text-[--color-on-surface-variant]">Delivering to</p>
                <p className="font-semibold text-sm text-[--color-on-surface]">{order.delivery_address?.label}</p>
                <p className="text-xs text-[--color-on-surface-variant]">{order.delivery_address?.line1}</p>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-[--color-surface-container-lowest] rounded-[--radius-lg] shadow-[--shadow-md] border border-[--color-border] p-4">
            <h2 className="font-bold text-[--color-on-surface] mb-3" style={{ fontFamily: "var(--font-heading)" }}>Order Summary</h2>
            <div className="space-y-2">
              {order.order_items?.map((item: any) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-[--color-on-surface-variant]">{item.quantity}× {item.menu_items?.name}</span>
                  <span className="tabular-nums font-medium">{rupees(item.unit_price * item.quantity)}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-[--color-border] space-y-1">
                <div className="flex justify-between text-xs text-[--color-on-surface-variant]">
                  <span>Subtotal</span><span className="tabular-nums">{rupees(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-xs text-[--color-on-surface-variant]">
                  <span>Delivery Fee</span><span className="tabular-nums">{rupees(order.delivery_fee)}</span>
                </div>
                <div className="flex justify-between text-xs text-[--color-on-surface-variant]">
                  <span>Platform Fee</span><span className="tabular-nums">{rupees(order.platform_fee)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-xs text-green-600 font-semibold">
                    <span>Discount ({order.coupon_code})</span>
                    <span className="tabular-nums">-{rupees(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm pt-1">
                  <span>Total paid</span>
                  <span className="tabular-nums">{rupees(order.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex gap-3 flex-wrap">
        {canCancel && (
          <button
            onClick={() => setShowCancel(true)}
            className="text-sm font-semibold px-4 py-2.5 rounded-[--radius-md] border-2 transition-colors hover:bg-red-50"
            style={{ borderColor: "var(--color-error)", color: "var(--color-error)" }}
          >
            <span className="flex items-center gap-1.5"><XCircle size={15} /> Cancel Order</span>
          </button>
        )}
        {(currentStatus === "delivered" || isCancelled) && (
          <button
            onClick={handleReorder}
            className="text-sm font-semibold px-4 py-2.5 rounded-[--radius-md] border-2 text-[--color-primary] border-[--color-primary] hover:bg-[--color-primary-fixed] transition-colors flex items-center gap-1.5"
          >
            <RotateCcw size={15} /> Reorder
          </button>
        )}
        <button
          onClick={handleShare}
          className="text-sm font-semibold px-4 py-2.5 rounded-[--radius-md] border border-[--color-border] text-[--color-on-surface-variant] hover:bg-[--color-surface-container] transition-colors flex items-center gap-1.5"
        >
          <Share2 size={15} /> Share Order
        </button>
        <Link
          href="/orders"
          className="text-sm font-semibold px-4 py-2.5 rounded-[--radius-md] border border-[--color-border] text-[--color-on-surface-variant] hover:bg-[--color-surface-container] transition-colors flex items-center gap-1.5"
        >
          <ReceiptText size={15} /> Order History
        </Link>
        <Link href="/" className="text-sm font-semibold px-4 py-2.5 rounded-[--radius-md] border border-[--color-border] text-[--color-on-surface-variant] hover:bg-[--color-surface-container] transition-colors">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
