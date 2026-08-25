"use client";
import { useCartStore } from "@/lib/store/cart";
import { rupees, cn } from "@/lib/utils";
import { Plus, Minus, Trash2, ShoppingCart, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const DELIVERY_FEE: number = 30;
const PLATFORM_FEE: number = 5;

export default function CartPage() {
  const { items, update, remove, total, count } = useCartStore();
  const subtotal = total();
  const discount = subtotal > 300 ? 50 : 0;
  const grandTotal = subtotal + DELIVERY_FEE + PLATFORM_FEE - discount;

  if (count() === 0) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 md:px-10 py-20 flex flex-col items-center gap-4">
        <ShoppingCart size={64} className="text-[--color-outline]" />
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
            <div key={item.id} className="flex items-center gap-3 bg-[--color-surface-container-lowest] p-3 rounded-[--radius-lg] shadow-[--shadow-sm] border border-[--color-border]">
              {item.image && (
                <div className="relative w-16 h-14 rounded-[--radius-md] overflow-hidden shrink-0">
                  <Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-[--color-on-surface] line-clamp-1">{item.name}</p>
                <p className="text-xs text-[--color-on-surface-variant] tabular-nums">₹{item.price} each</p>
              </div>

              {/* Stepper */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => update(item.id, item.quantity - 1)}
                  className="w-7 h-7 rounded-full border-2 flex items-center justify-center transition-colors hover:bg-[--color-primary] hover:border-[--color-primary] hover:text-white"
                  style={{ borderColor: "var(--color-primary)", color: "var(--color-primary)" }}
                >
                  <Minus size={12} />
                </button>
                <span className="font-bold w-5 text-center tabular-nums text-sm">{item.quantity}</span>
                <button
                  onClick={() => update(item.id, item.quantity + 1)}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white transition-colors hover:opacity-80"
                  style={{ background: "var(--color-primary)" }}
                >
                  <Plus size={12} />
                </button>
              </div>

              <span className="font-bold tabular-nums text-sm w-16 text-right">{rupees(item.price * item.quantity)}</span>

              <button onClick={() => remove(item.id)} className="text-[--color-error] hover:opacity-70 transition-opacity ml-1">
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
              <BillRow label="Delivery fee" value={DELIVERY_FEE === 0 ? "FREE" : rupees(DELIVERY_FEE)} highlight={DELIVERY_FEE === 0} />
              <BillRow label="Platform fee" value={rupees(PLATFORM_FEE)} />
              {discount > 0 && <BillRow label="Discount (VITAP50)" value={`-${rupees(discount)}`} highlight />}
              <div className="border-t border-[--color-border] pt-2.5 flex justify-between font-bold text-base">
                <span>Grand Total</span>
                <span className="tabular-nums">{rupees(grandTotal)}</span>
              </div>
            </div>

            {/* Coupon input */}
            <div className="mt-4 flex gap-2">
              <input
                placeholder="Promo code"
                className="flex-1 px-3 py-2 border border-[--color-border] rounded-[--radius-md] text-sm focus:outline-none focus:border-[--color-primary] bg-[--color-surface-container-low]"
              />
              <button className="px-3 py-2 text-sm font-semibold rounded-[--radius-md] border-2 transition-colors hover:bg-[--color-primary] hover:text-white hover:border-[--color-primary]"
                style={{ borderColor: "var(--color-primary)", color: "var(--color-primary)" }}>
                Apply
              </button>
            </div>

            <Link
              href="/checkout"
              className="mt-4 w-full flex items-center justify-between px-5 py-3.5 text-white font-bold text-sm rounded-[--radius-md] hover:opacity-90 transition-opacity"
              style={{ background: "var(--color-primary)", boxShadow: "var(--shadow-primary)" }}
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function BillRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-[--color-on-surface-variant]">{label}</span>
      <span className={cn("tabular-nums font-medium", highlight ? "text-[--color-tertiary]" : "text-[--color-on-surface]")}>{value}</span>
    </div>
  );
}
