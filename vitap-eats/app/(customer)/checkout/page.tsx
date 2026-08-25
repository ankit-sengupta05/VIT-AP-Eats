"use client";
import { useState } from "react";
import { useCartStore } from "@/lib/store/cart";
import { rupees, cn } from "@/lib/utils";
import { MapPin, CreditCard, Wallet, ChevronLeft, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const DELIVERY_FEE = 30;
const PLATFORM_FEE = 5;

export default function CheckoutPage() {
  const router = useRouter();
  const { total, count, clear } = useCartStore();
  const subtotal = total();
  const discount = subtotal > 300 ? 50 : 0;
  const grandTotal = subtotal + DELIVERY_FEE + PLATFORM_FEE - discount;
  
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "cod">("upi");
  const [isProcessing, setIsProcessing] = useState(false);

  // Redirect to cart if empty
  if (count() === 0 && !isProcessing) {
    if (typeof window !== "undefined") router.push("/cart");
    return null;
  }

  const handlePayment = () => {
    setIsProcessing(true);
    // Simulate payment delay
    setTimeout(() => {
      clear();
      router.push("/order/ORD-2026-001");
    }, 2000);
  };

  return (
    <div className="max-w-[800px] mx-auto px-4 md:px-10 py-6 md:py-10">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/cart" className="w-10 h-10 rounded-full flex items-center justify-center bg-[--color-surface-container-low] hover:bg-[--color-surface-container] transition-colors">
          <ChevronLeft size={20} className="text-[--color-on-surface]" />
        </Link>
        <h1 className="text-2xl font-extrabold text-[--color-on-surface]" style={{ fontFamily: "var(--font-heading)" }}>Checkout</h1>
      </div>

      <div className="space-y-6">
        {/* Delivery Address */}
        <section className="bg-[--color-surface-container-lowest] rounded-[--radius-lg] shadow-[--shadow-sm] border border-[--color-border] p-5">
          <h2 className="font-bold text-lg text-[--color-on-surface] mb-4" style={{ fontFamily: "var(--font-heading)" }}>Delivery Address</h2>
          <div className="flex gap-4 p-4 rounded-[--radius-md] border-2 transition-colors cursor-pointer" style={{ borderColor: "var(--color-primary)", background: "var(--color-primary-fixed)" }}>
            <div className="mt-1">
              <MapPin size={20} style={{ color: "var(--color-primary)" }} />
            </div>
            <div>
              <p className="font-bold text-[--color-on-surface]">Hostel Block C, Room 404</p>
              <p className="text-sm text-[--color-on-surface-variant] mt-1">VIT-AP Campus, Amaravati, Andhra Pradesh 522237</p>
              <p className="text-sm font-semibold mt-2 text-[--color-on-surface]">Priya S. · +91 90000 12345</p>
            </div>
          </div>
          <button className="mt-4 text-sm font-semibold text-[--color-primary] hover:underline">
            + Add New Address
          </button>
        </section>

        {/* Payment Method */}
        <section className="bg-[--color-surface-container-lowest] rounded-[--radius-lg] shadow-[--shadow-sm] border border-[--color-border] p-5">
          <h2 className="font-bold text-lg text-[--color-on-surface] mb-4" style={{ fontFamily: "var(--font-heading)" }}>Payment Method</h2>
          <div className="space-y-3">
            {[
              { id: "upi", label: "UPI / Google Pay", icon: Wallet },
              { id: "card", label: "Credit / Debit Card", icon: CreditCard },
              { id: "cod", label: "Cash on Delivery", icon: MapPin },
            ].map(({ id, label, icon: Icon }) => (
              <label
                key={id}
                className={cn(
                  "flex items-center justify-between p-4 rounded-[--radius-md] border-2 cursor-pointer transition-colors hover:bg-[--color-surface-container-low]",
                  paymentMethod === id ? "border-[--color-primary] bg-[--color-primary-fixed]" : "border-[--color-border]"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon size={20} className={paymentMethod === id ? "text-[--color-primary]" : "text-[--color-on-surface-variant]"} />
                  <span className="font-semibold text-[--color-on-surface]">{label}</span>
                </div>
                <div className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                  paymentMethod === id ? "border-[--color-primary]" : "border-[--color-border]"
                )}>
                  {paymentMethod === id && <div className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--color-primary)" }} />}
                </div>
              </label>
            ))}
          </div>
        </section>

        {/* Pay Button */}
        <section className="pt-4">
          <div className="flex items-center justify-center gap-2 mb-4 text-sm text-[--color-tertiary] font-semibold">
            <ShieldCheck size={18} />
            Secure checkout powered by Razorpay
          </div>
          
          <button
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full py-4 text-white font-bold text-lg rounded-[--radius-lg] shadow-[--shadow-lg] hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            style={{ background: "var(--color-primary)" }}
          >
            {isProcessing ? (
              <span className="animate-pulse">Processing Payment...</span>
            ) : (
              <>
                Pay {rupees(grandTotal)} <ArrowRight size={20} />
              </>
            )}
          </button>
        </section>
      </div>
    </div>
  );
}
