"use client";
import { useState, useEffect, Suspense } from "react";
import { useCartStore } from "@/lib/store/cart";
import { useAddresses, useProfile } from "@/lib/hooks";
import { rupees, cn } from "@/lib/utils";
import { MapPin, CreditCard, Wallet, ChevronLeft, ArrowRight, ShieldCheck, Loader2, Banknote, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/Skeleton";
import { createOrder } from "@/lib/db/orders";
import toast from "react-hot-toast";

function BillRow({ label, value, highlight, bold }: { label: string; value: string; highlight?: boolean; bold?: boolean }) {
  return (
    <div className={cn("flex justify-between items-center", bold && "font-bold text-base")}>
      <span className={highlight ? "text-green-600" : "text-[--color-on-surface-variant]"}>{label}</span>
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
  
  // Hardcoded addresses since we removed complex address subcollections for simplicity
  const addresses = [
    { id: "addr_1", label: "Hostel Block A", line1: "Room 402, Block A", lat: 16.5, lng: 80.5 },
    { id: "addr_2", label: "Academic Block", line1: "Near Library, Academic Block", lat: 16.5, lng: 80.5 }
  ];
  const [selectedAddressId, setSelectedAddressId] = useState<string>(addresses[0].id);
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
  const delivery_fee = 30;
  const platform_fee = 5;
  const discount = couponCode === "WELCOME" ? 50 : 0;
  const grand_total = Math.max(0, subtotal + delivery_fee + platform_fee - discount);

  const displayBill = { subtotal, delivery_fee, platform_fee, discount, total: grand_total };

  const handlePayment = async () => {
    const address = addresses.find((a) => a.id === selectedAddressId) ?? addresses[0];
    if (!profile) {
      toast.error("Please login to place an order");
      router.push("/login");
      return;
    }

    setIsPaying(true);

    try {
      // Simulate payment delay for non-COD
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
          name: i.name,
          price: i.price,
          quantity: i.quantity,
        })),
        subtotal,
        deliveryFee: delivery_fee,
        discount,
        total: grand_total,
        address: `${address.label} - ${address.line1}`,
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
        {/* Delivery Addresses */}
        <section className="bg-[--color-surface-container-lowest] rounded-[--radius-lg] shadow-[--shadow-sm] border border-[--color-border] p-5">
          <h2 className="font-bold text-lg text-[--color-on-surface] mb-4" style={{ fontFamily: "var(--font-heading)" }}>Delivery Address</h2>
          <div className="space-y-3">
            {addresses.map((addr: any) => (
              <label key={addr.id}
                className={cn("flex items-center gap-4 p-4 rounded-[--radius-md] border-2 cursor-pointer transition-colors",
                  selectedAddressId === addr.id
                    ? "border-[--color-primary] bg-[--color-primary-fixed]"
                    : "border-[--color-border] hover:bg-[--color-surface-container-low]"
                )}>
                <input type="radio" name="address" value={addr.id} className="accent-[--color-primary]"
                  checked={selectedAddressId === addr.id}
                  onChange={() => setSelectedAddressId(addr.id)} />
                <div>
                  <p className="font-bold text-sm text-[--color-on-surface]">{addr.label}</p>
                  <p className="text-xs text-[--color-on-surface-variant]">{addr.line1}</p>
                </div>
              </label>
            ))}
          </div>
        </section>

        {/* Payment Method */}
        <section className="bg-[--color-surface-container-lowest] rounded-[--radius-lg] shadow-[--shadow-sm] border border-[--color-border] p-5">
          <h2 className="font-bold text-lg text-[--color-on-surface] mb-4" style={{ fontFamily: "var(--font-heading)" }}>Payment Method</h2>
          <div className="space-y-3">
            {[
              { id: "upi",  label: "UPI / Google Pay",     icon: Wallet    },
              { id: "card", label: "Credit / Debit Card",  icon: CreditCard },
              { id: "cod",  label: "Cash on Delivery",     icon: Banknote  },
            ].map(({ id, label, icon: Icon }) => (
              <label key={id}
                className={cn("flex items-center justify-between p-4 rounded-[--radius-md] border-2 cursor-pointer transition-colors",
                  paymentMethod === id ? "border-[--color-primary] bg-[--color-primary-fixed]" : "border-[--color-border] hover:bg-[--color-surface-container-low]"
                )}>
                <div className="flex items-center gap-3">
                  <Icon size={20} className={paymentMethod === id ? "text-[--color-primary]" : "text-[--color-on-surface-variant]"} />
                  <span className="font-semibold text-[--color-on-surface]">{label}</span>
                </div>
                <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                  paymentMethod === id ? "border-[--color-primary]" : "border-[--color-border]")}>
                  {paymentMethod === id && <div className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--color-primary)" }} />}
                </div>
                <input type="radio" name="payment" value={id} className="sr-only"
                  checked={paymentMethod === id} onChange={() => setPaymentMethod(id as any)} />
              </label>
            ))}
          </div>
        </section>

        {/* Bill Summary */}
        <section className="bg-[--color-surface-container-lowest] rounded-[--radius-lg] shadow-[--shadow-sm] border border-[--color-border] p-5">
          <h2 className="font-bold text-lg text-[--color-on-surface] mb-4" style={{ fontFamily: "var(--font-heading)" }}>Bill Details</h2>
          <div className="space-y-2.5 text-sm">
            <BillRow label="Subtotal" value={rupees(displayBill.subtotal)} />
            <BillRow label="Delivery fee" value={rupees(displayBill.delivery_fee)} />
            <BillRow label="Platform fee" value={rupees(displayBill.platform_fee)} />
            {displayBill.discount > 0 && (
              <BillRow label={`Coupon ${couponCode ? `(${couponCode})` : ""}`} value={`-${rupees(displayBill.discount)}`} highlight />
            )}
            <div className="border-t border-[--color-border] pt-2.5">
              <BillRow label="Total" value={rupees(displayBill.total)} bold />
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
              <>Pay {rupees(displayBill.total)} <ArrowRight size={20} /></>
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
