"use client";
import { CheckCircle2, Circle, Clock, MapPin, Phone, Bike } from "lucide-react";
import { cn } from "@/lib/utils";
import { rupees } from "@/lib/utils";
import Link from "next/link";

/* ─── Mock order state ────────────────────────────────────────────────────── */
const ORDER = {
  id: "ORD-2026-001",
  status: "on_the_way" as const,
  placedAt: "7:45 PM",
  restaurant: { name: "Spice Garden", address: "Near Main Gate, VIT-AP" },
  partner: { name: "Ravi K.", phone: "+91 98765 43210", rating: 4.8, completedOrders: 342 },
  items: [
    { name: "Chicken Dum Biryani", qty: 1, price: 149 },
    { name: "Butter Naan", qty: 2, price: 29 },
  ],
  total: 237,
  estimatedDelivery: "8:18 PM",
};

const STEPS = [
  { key: "placed",    label: "Order Placed",    detail: "We've received your order",        time: "7:45 PM" },
  { key: "accepted",  label: "Order Accepted",  detail: "Restaurant confirmed your order",  time: "7:47 PM" },
  { key: "preparing", label: "Preparing",       detail: "Chef is cooking your food",        time: "7:50 PM" },
  { key: "picked_up", label: "Picked Up",       detail: "Partner is on the way to you",    time: "" },
  { key: "on_the_way",label: "On the Way",      detail: "Your order is nearby!",            time: "" },
  { key: "delivered", label: "Delivered",       detail: "Enjoy your meal!",                 time: "" },
] as const;

type Status = typeof STEPS[number]["key"];
const STATUS_ORDER: Status[] = ["placed", "accepted", "preparing", "picked_up", "on_the_way", "delivered"];

export default function OrderTrackingPage() {
  const currentIdx = STATUS_ORDER.indexOf(ORDER.status);

  return (
    <div className="max-w-[900px] mx-auto px-4 md:px-10 py-6 md:py-10">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-[--color-on-surface]" style={{ fontFamily: "var(--font-heading)" }}>
              Tracking Order
            </h1>
            <p className="text-sm text-[--color-on-surface-variant]">{ORDER.id} · Placed at {ORDER.placedAt}</p>
          </div>
          <span className="px-3 py-1 rounded-[--radius-full] text-sm font-bold text-white" style={{ background: "var(--color-warning)" }}>
            {ORDER.status.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
          </span>
        </div>

        {/* ETA banner */}
        <div className="mt-4 flex items-center gap-3 bg-[--color-primary-fixed] rounded-[--radius-lg] px-4 py-3">
          <Clock size={20} style={{ color: "var(--color-primary)" }} />
          <div>
            <p className="font-bold text-[--color-on-surface]">Estimated delivery: {ORDER.estimatedDelivery}</p>
            <p className="text-xs text-[--color-on-surface-variant]">Your food is on the way 🛵</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Status timeline */}
        <div className="bg-[--color-surface-container-lowest] rounded-[--radius-lg] shadow-[--shadow-md] border border-[--color-border] p-5">
          <h2 className="font-bold text-[--color-on-surface] mb-4" style={{ fontFamily: "var(--font-heading)" }}>Order Status</h2>
          <div className="space-y-4">
            {STEPS.map((step, i) => {
              const done    = i <= currentIdx;
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
                      <div className={cn("w-0.5 flex-1 mt-1 mb-1", done ? "bg-[--color-tertiary]" : "bg-[--color-border]")} style={{ minHeight: "20px" }} />
                    )}
                  </div>
                  <div className={cn("flex-1 pb-1", !done && "opacity-40")}>
                    <p className={cn("font-semibold text-sm", current && "text-[--color-primary]")}>{step.label}</p>
                    <p className="text-xs text-[--color-on-surface-variant]">{step.detail}</p>
                    {step.time && <p className="text-xs text-[--color-on-surface-variant] mt-0.5">{step.time}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          {/* Partner info */}
          <div className="bg-[--color-surface-container-lowest] rounded-[--radius-lg] shadow-[--shadow-md] border border-[--color-border] p-4">
            <h2 className="font-bold text-[--color-on-surface] mb-3" style={{ fontFamily: "var(--font-heading)" }}>Your Delivery Partner</h2>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg" style={{ background: "var(--color-primary)" }}>
                {ORDER.partner.name[0]}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-[--color-on-surface]">{ORDER.partner.name}</p>
                <p className="text-xs text-[--color-on-surface-variant]">⭐ {ORDER.partner.rating} · {ORDER.partner.completedOrders} deliveries</p>
              </div>
              <a
                href={`tel:${ORDER.partner.phone}`}
                className="w-10 h-10 rounded-full flex items-center justify-center text-white hover:opacity-80 transition-opacity"
                style={{ background: "var(--color-tertiary)" }}
              >
                <Phone size={16} />
              </a>
            </div>
          </div>

          {/* Addresses */}
          <div className="bg-[--color-surface-container-lowest] rounded-[--radius-lg] shadow-[--shadow-md] border border-[--color-border] p-4 space-y-3">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: "var(--color-primary-fixed)" }}>
                <Bike size={14} style={{ color: "var(--color-primary)" }} />
              </div>
              <div>
                <p className="text-xs text-[--color-on-surface-variant]">Pickup from</p>
                <p className="font-semibold text-sm text-[--color-on-surface]">{ORDER.restaurant.name}</p>
                <p className="text-xs text-[--color-on-surface-variant]">{ORDER.restaurant.address}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-[--color-tertiary-container]/20">
                <MapPin size={14} style={{ color: "var(--color-tertiary)" }} />
              </div>
              <div>
                <p className="text-xs text-[--color-on-surface-variant]">Delivering to</p>
                <p className="font-semibold text-sm text-[--color-on-surface]">Room 404, Hostel Block C</p>
                <p className="text-xs text-[--color-on-surface-variant]">VIT-AP Campus, Amaravati</p>
              </div>
            </div>
          </div>

          {/* Order summary */}
          <div className="bg-[--color-surface-container-lowest] rounded-[--radius-lg] shadow-[--shadow-md] border border-[--color-border] p-4">
            <h2 className="font-bold text-[--color-on-surface] mb-3" style={{ fontFamily: "var(--font-heading)" }}>Order Summary</h2>
            <div className="space-y-2">
              {ORDER.items.map((item) => (
                <div key={item.name} className="flex justify-between text-sm">
                  <span className="text-[--color-on-surface-variant]">{item.qty}× {item.name}</span>
                  <span className="tabular-nums font-medium">{rupees(item.price * item.qty)}</span>
                </div>
              ))}
              <div className="border-t border-[--color-border] pt-2 flex justify-between font-bold">
                <span>Total paid</span>
                <span className="tabular-nums">{rupees(ORDER.total)}</span>
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
