"use client";
import { useState, useEffect, Suspense } from "react";
import { useCartStore } from "@/lib/store/cart";
import { useProfile } from "@/lib/hooks";
import { rupees, cn } from "@/lib/utils";
import { MapPin, CreditCard, Wallet, ChevronLeft, ArrowRight, ShieldCheck, Loader2, Banknote, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createOrder } from "@/lib/db/orders";
import toast from "react-hot-toast";

function BillRow({ label, value, highlight, bold, subtext }: { label: string; value: string; highlight?: boolean; bold?: boolean; subtext?: string }) {
  return (
    <div className={cn("flex justify-between items-center", bold && "font-bold text-base")}>
      <div>
        <span className={highlight ? "text-green-600" : "text-[--color-on-surface-variant]"}>{label}</span>
        {subtext && <span className="ml-1 text-xs text-[--color-on-surface-variant] opacity-70">{subtext}</span>}
      </div>
      <span className={cn("tabular-nums", highlight ? "text-green-600 font-semibold" : "font-medium text-[--color-on-surface]")}>{value}</span>
    </div>
  );
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const couponCode = searchParams.get("coupon") || undefined;

  const { items, total, count, clear } = useCartStore();
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "cod">("upi");
  const [isPaying, setIsPaying] = useState(false);

  const { data: profile } = useProfile();

  // Redirect if cart is empty
  useEffect(() => {
    if (count() === 0) router.push("/cart");
  }, [count, router]);

  if (count() === 0) return null;

  const restaurantId = items[0]?.restaurantId;
  const restaurantName = items[0]?.restaurantName;

  const subtotal = total();
  const delivery_fee = 0; // Free delivery — collect at main gate
  const discount = couponCode === "WELCOME" ? 50 : 0;
  const grand_total = Math.max(0, subtotal + delivery_fee - discount);

  const displayBill = { subtotal, delivery_fee, discount, total: grand_total };

  // Fixed address: everyone collects at main gate
  const deliveryAddress = "Collect at Main Gate";

  const handlePayment = async () => {
    if (!profile) {
      toast.error("Please login to place an order");
      router.push("/login");
      return;
    }

    setIsPaying(true);
    try {
      if (paymentMethod !== "cod") {
        await new Promise(r => setTimeout(r, 1500));
      }

      const newOrderId = await createOrder({
        userId: profile.uid,
        userName: profile.fullName,
        userPhone: profile.phone,
        restaurantId,
        restaurantName,
        items: items.map(i => ({
          menuItemId: i.id,
          name: i.variantLabel ? `${i.name} (${i.variantLabel})` : i.name,
          price: i.price,
          quantity: i.quantity,
        })),
        subtotal,
        deliveryFee: delivery_fee,
        discount,
        total: grand_total,
        address: deliveryAddress,
      });

      clear();
      router.push(`/order/${newOrderId}`);
    } catch (err: any) {
      toast.error(`Order failed: ${err.message}. Please try again.`);
      setIsPaying(false);
    }
  };

  return (
    <div className="max-w-[800px] mx-auto px-4 md:px-10 py-6 md:py-10">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/cart" className="w-10 h-10 rounded-full flex items-center justify-center bg-[--color-surface-container-low] hover:bg-[--color-surface-container] transition-colors">
          <ChevronLeft size={20} className="text-[--color-on-surface]" />
        </Link>
        <h1 className="text-2xl font-extrabold text-[--color-on-surface]" style={{ fontFamily: "var(--font-heading)" }}>Checkout</h1>
      </div>

      <div className="space-y-5">
        {/* Delivery Address — Fixed */}
        <section className="bg-[--color-surface-container-lowest] rounded-[--radius-lg] shadow-[--shadow-sm] border border-[--color-border] p-5">
          <h2 className="font-bold text-lg text-[--color-on-surface] mb-4" style={{ fontFamily: "var(--font-heading)" }}>Pickup Address</h2>
          <div className="flex items-start gap-3 p-4 rounded-[--radius-md] border-2 border-[--color-primary] bg-[--color-primary-fixed]">
            <MapPin size={20} style={{ color: "var(--color-primary)" }} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-bold text-[--color-on-surface]">Collect at Main Gate</p>
              <p className="text-sm text-[--color-on-surface-variant] mt-0.5">
                All orders must be collected at the main gate of VIT-AP Campus.
              </p>
              <p className="text-xs text-[--color-on-surface-variant] mt-1 italic">
                🕔 Delivery time: Receive by Evening
              </p>
            </div>
          </div>
        </section>



        {/* Bill Summary */}
        <section className="bg-[--color-surface-container-lowest] rounded-[--radius-lg] shadow-[--shadow-sm] border border-[--color-border] p-5">
          <h2 className="font-bold text-lg text-[--color-on-surface] mb-4" style={{ fontFamily: "var(--font-heading)" }}>Bill Details</h2>
          <div className="space-y-2.5 text-sm">
            <BillRow label="Subtotal" value={rupees(displayBill.subtotal)} />
            <BillRow label="Delivery fee" value="FREE" />
            {displayBill.discount > 0 && (
              <BillRow label={`Coupon ${couponCode ? `(${couponCode})` : ""}`} value={`-${rupees(displayBill.discount)}`} highlight />
            )}
            <div className="border-t border-[--color-border] pt-2.5">
              <div className="flex justify-between items-center font-bold text-base">
                <span>Total</span>
                <div className="text-right">
                  <span>{rupees(displayBill.total)}</span>
                  <span className="ml-1 text-xs font-normal text-[--color-on-surface-variant]">+ GST</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pay CTA */}
        <section className="pt-2">
          <div className="flex items-center justify-center gap-2 mb-4 text-sm font-semibold" style={{ color: "var(--color-tertiary)" }}>
            <ShieldCheck size={18} />
            Secure checkout (Mock Demo)
          </div>
          <button
            onClick={handlePayment}
            disabled={isPaying}
            className="w-full py-4 text-white font-bold text-lg rounded-[--radius-lg] shadow-[--shadow-lg] hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            style={{ background: "var(--color-primary)" }}
          >
            {isPaying ? (
              <><Loader2 size={20} className="animate-spin" />Processing...</>
            ) : (
              <>Confirm Order ({rupees(displayBill.total)} + GST) <ArrowRight size={20} /></>
            )}
          </button>
          <p className="text-xs text-[--color-on-surface-variant] text-center mt-3">
            By placing this order you agree to our Terms of Service
          </p>
        </section>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><Loader2 size={32} className="animate-spin text-[--color-primary]" /></div>}>
      <CheckoutContent />
    </Suspense>
  );
}
