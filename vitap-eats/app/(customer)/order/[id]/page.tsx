"use client";
import { useEffect, useState, useRef, use } from "react";
import {
  CheckCircle2, Circle, Clock, MapPin, Phone, Bike, Loader2,
  XCircle, AlertTriangle, Wifi, WifiOff, Share2, ReceiptText, RotateCcw, Package
} from "lucide-react";
import { cn, rupees } from "@/lib/utils";
import Link from "next/link";
import { useCancelOrder } from "@/lib/hooks";
import { subscribeToOrder, type Order, type OrderStatus } from "@/lib/db/orders";
import { useCartStore } from "@/lib/store/cart";
import { Skeleton } from "@/components/ui/Skeleton";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

const STEPS = [
  { key: "pending",          label: "Order Placed",    detail: "We've received your order",                       emoji: "🛒" },
  { key: "confirmed",        label: "Order Confirmed", detail: "Restaurant confirmed your order",                 emoji: "✅" },
  { key: "preparing",        label: "Preparing",       detail: "Chef is cooking your food",                       emoji: "👨‍🍳" },
  { key: "out_for_delivery", label: "Ready for Pickup", detail: "Head to Main Gate — your order is ready! 🏃",    emoji: "🔜" },
  { key: "delivered",        label: "Collected",       detail: "Enjoy your meal! 🎉",                             emoji: "🎉" },
] as const;

const STATUS_ORDER = STEPS.map((s) => s.key);

const STATUS_COLORS: Record<string, string> = {
  pending:          "var(--color-warning, #F59E0B)",
  confirmed:        "var(--color-primary)",
  preparing:        "var(--color-primary)",
  out_for_delivery: "var(--color-tertiary)",
  delivered:        "#22c55e",
  cancelled:        "var(--color-error)",
};

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
  
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  
  const { mutate: cancelOrder, isPending: isCancelling } = useCancelOrder(id);
  const { clearAndAdd } = useCartStore();

  const [realtimeConnected, setRealtimeConnected] = useState<boolean>(true);
  const [showCancel, setShowCancel] = useState(false);
  const prevStatusRef = useRef<string | null>(null);

  // Firestore realtime subscription
  useEffect(() => {
    if (!id) return;
    const unsub = subscribeToOrder(id, (updatedOrder) => {
      setIsLoading(false);
      if (!updatedOrder) {
        setIsError(true);
        return;
      }
      setOrder(updatedOrder);
      
      const newStatus = updatedOrder.status;
      if (prevStatusRef.current && prevStatusRef.current !== newStatus) {
        showStatusToast(newStatus);
      }
      prevStatusRef.current = newStatus;
    });

    return () => unsub();
  }, [id]);

  const currentStatus = order?.status ?? "pending";
  const currentIdx = STATUS_ORDER.indexOf(currentStatus as any);
  const isCancelled = currentStatus === "cancelled";
  const isTerminal = isCancelled || currentStatus === "delivered";
  const canCancel = ["pending", "confirmed"].includes(currentStatus);

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
    if (!order?.items?.length) return;
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
              #{id.slice(0, 6).toUpperCase()} · {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border"
              style={{
                background: realtimeConnected ? "#dcfce7" : "#fef2f2",
                borderColor: realtimeConnected ? "#86efac" : "#fca5a5",
                color: realtimeConnected ? "#16a34a" : "#dc2626",
              }}>
              {realtimeConnected ? <><Wifi size={12} /> Live</> : <><WifiOff size={12} /> Reconnecting</>}
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
            <Package size={20} style={{ color: "var(--color-primary)" }} />
            <div>
              <p className="font-bold text-[--color-on-surface]">{STEPS[currentIdx]?.detail ?? "Tracking your order..."}</p>
              <p className="text-xs text-[--color-on-surface-variant]">
                🕔 Receive by Evening · Collect at Main Gate
              </p>
            </div>
          </div>
        )}
        {isCancelled && (
          <div className="mt-4 flex items-center gap-3 rounded-[--radius-lg] px-4 py-3 bg-red-50 border border-red-200">
            <XCircle size={20} className="text-red-600" />
            <div>
              <p className="font-bold text-red-900">Order Cancelled</p>
              <p className="text-xs text-red-700">This order has been cancelled and will not be delivered.</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left Col: Timeline & Map */}
        <div className="space-y-6">
          <div className="bg-[--color-surface-container-lowest] rounded-[--radius-lg] shadow-[--shadow-sm] p-6 border border-[--color-border]">
            <h2 className="font-bold text-[--color-on-surface] mb-6">Order Status</h2>
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute left-3.5 top-2 bottom-6 w-0.5 bg-[--color-border]" />
              
              <div className="space-y-6 relative">
                {STEPS.map((step, idx) => {
                  const isCompleted = idx <= currentIdx && !isCancelled;
                  const isCurrent = idx === currentIdx && !isCancelled;
                  
                  return (
                    <div key={step.key} className={cn("flex gap-4 transition-opacity", isCancelled ? "opacity-40" : (idx > currentIdx ? "opacity-50" : "opacity-100"))}>
                      <div className={cn("relative z-10 w-7 h-7 rounded-full flex items-center justify-center shrink-0 border-2", isCompleted ? "border-[--color-primary] bg-[--color-primary] text-white" : "border-[--color-border] bg-white")}>
                        {isCompleted ? <CheckCircle2 size={14} /> : <Circle size={10} className="text-transparent" />}
                      </div>
                      <div className="pt-1">
                        <p className={cn("font-bold text-sm", isCurrent ? "text-[--color-primary]" : "text-[--color-on-surface]")}>{step.label}</p>
                        <p className="text-xs text-[--color-on-surface-variant] mt-0.5">{step.detail}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Details */}
        <div className="space-y-6">
          {/* Items */}
          <div className="bg-[--color-surface-container-lowest] rounded-[--radius-lg] shadow-[--shadow-sm] p-6 border border-[--color-border]">
            <div className="flex items-center gap-2 mb-4 text-[--color-on-surface-variant]">
              <ReceiptText size={18} />
              <h2 className="font-bold text-[--color-on-surface]">Order Items</h2>
            </div>
            
            <div className="space-y-3 mb-4">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start text-sm">
                  <div>
                    <p className="font-semibold text-[--color-on-surface]">{item.quantity}× {item.name}</p>
                  </div>
                  <p className="font-semibold text-[--color-on-surface]">{rupees(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
            
            <div className="border-t border-dashed border-[--color-border] pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-[--color-on-surface-variant]">
                <span>Item Total</span>
                <span>{rupees(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-[--color-on-surface-variant]">
                <span>Delivery Fee</span>
                <span>{rupees(order.deliveryFee)}</span>
              </div>
              {order.discount ? (
                <div className="flex justify-between font-medium" style={{ color: "var(--color-primary)" }}>
                  <span>Discount</span>
                  <span>-{rupees(order.discount)}</span>
                </div>
              ) : null}
              <div className="flex justify-between font-bold text-base text-[--color-on-surface] pt-2 border-t border-[--color-border]">
                <span>Total</span>
                <div className="text-right">
                  <span>{rupees(order.total)}</span>
                  <span className="ml-1 text-xs font-normal text-[--color-on-surface-variant]">+ GST</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex gap-3">
            {canCancel ? (
              <button onClick={() => setShowCancel(true)} className="flex-1 py-3 bg-red-50 text-red-600 font-bold text-sm rounded-[--radius-md] hover:bg-red-100 transition-colors">
                Cancel Order
              </button>
            ) : isTerminal ? (
              <button onClick={handleReorder} className="flex-1 py-3 text-white font-bold text-sm rounded-[--radius-md] shadow-[--shadow-sm] hover:opacity-90 transition-all flex items-center justify-center gap-2" style={{ background: "var(--color-primary)" }}>
                <RotateCcw size={16} /> Reorder
              </button>
            ) : null}
            <button onClick={handleShare} className="flex-1 py-3 bg-[--color-surface-container] text-[--color-on-surface] font-bold text-sm rounded-[--radius-md] hover:bg-[--color-surface-container-high] transition-colors flex items-center justify-center gap-2">
              <Share2 size={16} /> Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
