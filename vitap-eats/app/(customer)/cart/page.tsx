"use client";
import { useState, useCallback } from "react";
import { useCartStore } from "@/lib/store/cart";
import { rupees, cn } from "@/lib/utils";
import { Plus, Minus, Trash2, ShoppingCart, ArrowRight, Tag, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";


function BillRow({ label, value, highlight, bold }: { label: string; value: string; highlight?: boolean; bold?: boolean }) {
  return (
    <div className={cn("flex justify-between items-center", bold && "font-bold text-base")}>
      <span className={highlight ? "text-green-600 font-semibold" : "text-[--color-on-surface-variant]"}>{label}</span>
      <span className={cn("tabular-nums font-medium", highlight ? "text-green-600" : "text-[--color-on-surface]")}>{value}</span>
    </div>
  );
}

// ── Restaurant Conflict Dialog ─────────────────────────────────────────────
function ConflictDialog({ conflictName, onConfirm, onCancel }: { conflictName: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[--color-surface-container-lowest] w-full max-w-sm rounded-[--radius-lg] shadow-[--shadow-xl] p-6 border border-[--color-border]">
        <h3 className="text-lg font-bold text-[--color-on-surface] mb-2" style={{ fontFamily: "var(--font-heading)" }}>
          Start a new cart?
        </h3>
        <p className="text-sm text-[--color-on-surface-variant] mb-6">
          Your cart already has items from <strong>{conflictName}</strong>. Adding this item will clear your current cart.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-[--radius-md] border border-[--color-border] font-semibold text-sm text-[--color-on-surface] hover:bg-[--color-surface-container-low]">
            Keep cart
          </button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-[--radius-md] text-white font-bold text-sm hover:opacity-90" style={{ background: "var(--color-error, #d32f2f)" }}>
            Clear & add
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CartPage() {
  const { items, update, remove, total, count, clear } = useCartStore();
  const subtotal = total();

  // Coupon state
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; description: string; discount_amount: number } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const DELIVERY_FEE = 30;
  const PLATFORM_FEE = 5;
  const discount = appliedCoupon?.discount_amount ?? 0;
  const grandTotal = subtotal + DELIVERY_FEE + PLATFORM_FEE - discount;

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError(null);
    try {
      // Simulate API call
      await new Promise((r) => setTimeout(r, 500));
      if (couponInput === "WELCOME") {
        setAppliedCoupon({ code: "WELCOME", description: "Flat ₹50 off on first order", discount_amount: 50 });
      } else {
        throw new Error("Invalid or expired coupon code");
      }
    } catch (err: any) {
      setCouponError(err.message);
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponError(null);
  };

  if (count() === 0) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 md:px-10 py-20 flex flex-col items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-[--color-surface-container-low] flex items-center justify-center mb-2">
          <ShoppingCart size={36} className="text-[--color-on-surface-variant]" />
        </div>
        <h2 className="text-2xl font-bold text-[--color-on-surface]" style={{ fontFamily: "var(--font-heading)" }}>Your cart is empty</h2>
        <p className="text-[--color-on-surface-variant]">Add items from a restaurant to get started</p>
        <Link
          href="/"
          className="mt-2 px-6 py-3 text-white rounded-[--radius-full] font-semibold text-sm transition-opacity hover:opacity-90"
          style={{ background: "var(--color-primary)", boxShadow: "var(--shadow-primary)" }}
        >
          Browse Restaurants
        </Link>
      </div>
    );
  }

  const restaurantName = items[0]?.restaurantName;

  return (
    <div className="max-w-[1280px] mx-auto px-4 md:px-10 py-6 md:py-10">
      <h1 className="text-2xl font-extrabold text-[--color-on-surface] mb-1" style={{ fontFamily: "var(--font-heading)" }}>Your Cart</h1>
      <p className="text-sm text-[--color-on-surface-variant] mb-6">{restaurantName}</p>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Items list */}
        <div className="flex-1 space-y-3">
          {items.map((item) => (
            <div key={item.cartKey} className="flex items-center gap-3 bg-[--color-surface-container-lowest] p-3 rounded-[--radius-lg] shadow-[--shadow-sm] border border-[--color-border]">
              {item.image && (
                <div className="relative w-16 h-14 rounded-[--radius-md] overflow-hidden shrink-0">
                  <Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-[--color-on-surface] line-clamp-1">{item.name}</p>
                <p className="text-xs text-[--color-on-surface-variant] tabular-nums">₹{item.price} each</p>
                {item.customization && (
                  <p className="text-xs text-[--color-primary] mt-0.5 line-clamp-1">{item.customization}</p>
                )}
              </div>

              {/* Stepper */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => update(item.cartKey, item.quantity - 1)}
                  className="w-7 h-7 rounded-full border-2 flex items-center justify-center transition-colors hover:bg-[--color-primary] hover:border-[--color-primary] hover:text-white"
                  style={{ borderColor: "var(--color-primary)", color: "var(--color-primary)" }}
                >
                  <Minus size={12} />
                </button>
                <span className="font-bold w-5 text-center tabular-nums text-sm">{item.quantity}</span>
                <button
                  onClick={() => update(item.cartKey, item.quantity + 1)}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white transition-colors hover:opacity-80"
                  style={{ background: "var(--color-primary)" }}
                >
                  <Plus size={12} />
                </button>
              </div>

              <span className="font-bold tabular-nums text-sm w-16 text-right">{rupees(item.price * item.quantity)}</span>

              <button onClick={() => remove(item.cartKey)} className="text-[--color-error] hover:opacity-70 transition-opacity ml-1">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* Bill summary — sticky on desktop */}
        <div className="lg:w-80 shrink-0">
          <div className="bg-[--color-surface-container-lowest] rounded-[--radius-lg] shadow-[--shadow-md] border border-[--color-border] p-5 lg:sticky lg:top-20">
            <h2 className="font-bold text-base text-[--color-on-surface] mb-4" style={{ fontFamily: "var(--font-heading)" }}>Bill Summary</h2>

            <div className="space-y-2.5 text-sm">
              <BillRow label="Subtotal" value={rupees(subtotal)} />
              <BillRow label="Delivery fee" value={rupees(DELIVERY_FEE)} />
              <BillRow label="Platform fee" value={rupees(PLATFORM_FEE)} />
              {discount > 0 && (
                <BillRow label={`Coupon (${appliedCoupon?.code})`} value={`-${rupees(discount)}`} highlight />
              )}
              <div className="border-t border-[--color-border] pt-2.5">
                <BillRow label="Grand Total" value={rupees(grandTotal)} bold />
              </div>
            </div>

            {/* Coupon input */}
            <div className="mt-4 space-y-2">
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-[--radius-md] border border-green-200">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle2 size={16} />
                    <div>
                      <p className="text-sm font-bold">{appliedCoupon.code}</p>
                      <p className="text-xs">{appliedCoupon.description}</p>
                    </div>
                  </div>
                  <button onClick={handleRemoveCoupon} className="text-green-700 hover:opacity-70">
                    <XCircle size={18} />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[--color-on-surface-variant]" />
                    <input
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                      placeholder="Promo code"
                      className="w-full pl-9 pr-3 py-2 border border-[--color-border] rounded-[--radius-md] text-sm focus:outline-none focus:border-[--color-primary] bg-[--color-surface-container-low] uppercase"
                    />
                  </div>
                  <button
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponInput.trim()}
                    className="px-3 py-2 text-sm font-semibold rounded-[--radius-md] border-2 transition-colors hover:bg-[--color-primary] hover:text-white hover:border-[--color-primary] disabled:opacity-50"
                    style={{ borderColor: "var(--color-primary)", color: "var(--color-primary)" }}
                  >
                    {couponLoading ? <Loader2 size={14} className="animate-spin" /> : "Apply"}
                  </button>
                </div>
              )}
              {couponError && <p className="text-xs text-red-600 flex items-center gap-1"><XCircle size={12} />{couponError}</p>}
            </div>

            <Link
              href={`/checkout?coupon=${appliedCoupon?.code ?? ""}`}
              className="mt-4 w-full flex items-center justify-between px-5 py-3.5 text-white font-bold text-sm rounded-[--radius-md] hover:opacity-90 transition-opacity"
              style={{ background: "var(--color-primary)", boxShadow: "var(--shadow-primary)" }}
            >
              <span>Proceed to Checkout</span>
              <span className="flex items-center gap-1">{rupees(grandTotal)} <ArrowRight size={18} /></span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}