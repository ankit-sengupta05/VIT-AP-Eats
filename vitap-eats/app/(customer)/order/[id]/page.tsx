"use client";
import { CheckCircle2, Circle, Clock, MapPin, Phone, Bike, Loader2 } from "lucide-react";
import { cn, rupees } from "@/lib/utils";
import Link from "next/link";
import { use } from "react";
import { useOrder } from "@/lib/hooks";
import { Skeleton } from "@/components/ui/Skeleton";

const STEPS = [
  { key: "placed",     label: "Order Placed",   detail: "We've received your order"           },
  { key: "accepted",   label: "Order Accepted", detail: "Restaurant confirmed your order"     },
  { key: "preparing",  label: "Preparing",      detail: "Chef is cooking your food"           },
  { key: "picked_up",  label: "Picked Up",      detail: "Partner is on the way to you"       },
  { key: "on_the_way", label: "On the Way",     detail: "Your order is nearby!"              },
  { key: "delivered",  label: "Delivered",      detail: "Enjoy your meal! 🎉"                },
] as const;

const STATUS_ORDER = STEPS.map((s) => s.key);

export default function OrderTrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: order, isLoading, isError } = useOrder(id);

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

  const currentIdx = STATUS_ORDER.indexOf(order.status as any);

  return (
    <div className="max-w-[900px] mx-auto px-4 md:px-10 py-6 md:py-10">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-[--color-on-surface]" style={{ fontFamily: "var(--font-heading)" }}>Tracking Order</h1>
            <p className="text-sm text-[--color-on-surface-variant]">#{id.split("-")[0].toUpperCase()} · {new Date(order.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</p>
          </div>
          <span className="px-3 py-1 rounded-[--radius-full] text-sm font-bold text-white capitalize" style={{ background: "var(--color-warning, #F59E0B)" }}>
            {order.status?.replace(/_/g, " ")}
          </span>
        </div>
        <div className="mt-4 flex items-center gap-3 rounded-[--radius-lg] px-4 py-3" style={{ background: "var(--color-primary-fixed)" }}>
          <Clock size={20} style={{ color: "var(--color-primary)" }} />
          <div>
            <p className="font-bold text-[--color-on-surface]">Order is on its way</p>
            <p className="text-xs text-[--color-on-surface-variant]">Updates refresh automatically every 15 seconds</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Timeline */}
        <div className="bg-[--color-surface-container-lowest] rounded-[--radius-lg] shadow-[--shadow-md] border border-[--color-border] p-5">
          <h2 className="font-bold text-[--color-on-surface] mb-4" style={{ fontFamily: "var(--font-heading)" }}>Order Status</h2>
          <div className="space-y-4">
            {STEPS.map((step, i) => {
              const done = i <= currentIdx;
              const current = i === currentIdx;
              return (
                <div key={step.key} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    {done ? (
                      <CheckCircle2 size={20} className={cn(current ? "text-[--color-primary]" : "text-[--color-tertiary]")} fill="currentColor" />
                    ) : (
                      <Circle size={20} className="text-[--color-border]" />
                    )}
                    {i < STEPS.length - 1 && (
                      <div className={cn("w-0.5 flex-1 mt-1 mb-1 min-h-[20px]", done ? "bg-[--color-tertiary]" : "bg-[--color-border]")} />
                    )}
                  </div>
                  <div className={cn("flex-1 pb-1", !done && "opacity-40")}>
                    <p className={cn("font-semibold text-sm", current && "text-[--color-primary]")}>{step.label}</p>
                    <p className="text-xs text-[--color-on-surface-variant]">{step.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          {/* Partner */}
          {order.partner && (
            <div className="bg-[--color-surface-container-lowest] rounded-[--radius-lg] shadow-[--shadow-md] border border-[--color-border] p-4">
              <h2 className="font-bold text-[--color-on-surface] mb-3" style={{ fontFamily: "var(--font-heading)" }}>Your Delivery Partner</h2>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg" style={{ background: "var(--color-primary)" }}>
                  {order.partner.full_name?.[0]}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-[--color-on-surface]">{order.partner.full_name}</p>
                  <p className="text-xs text-[--color-on-surface-variant]">⭐ {order.partner.rating}</p>
                </div>
                <a href={`tel:${order.partner.phone}`} className="w-10 h-10 rounded-full flex items-center justify-center text-white hover:opacity-80 transition-opacity" style={{ background: "var(--color-tertiary)" }}>
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
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-[--color-tertiary-container]/20">
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
              <div className="border-t border-[--color-border] pt-2 flex justify-between font-bold">
                <span>Total paid</span>
                <span className="tabular-nums">{rupees(order.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-3 flex-wrap">
        <button className="text-sm font-semibold px-4 py-2 rounded-[--radius-md] border border-[--color-error] text-[--color-error] hover:bg-[--color-error-container] transition-colors">
          Cancel Order
        </button>
        <Link href="/" className="text-sm font-semibold px-4 py-2 rounded-[--radius-md] border border-[--color-border] text-[--color-on-surface-variant] hover:bg-[--color-surface-container] transition-colors">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
