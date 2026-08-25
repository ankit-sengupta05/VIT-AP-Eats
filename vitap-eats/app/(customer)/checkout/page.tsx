"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useCartStore } from "@/lib/store/cart";
import { useAddresses } from "@/lib/hooks";
import { rupees, cn } from "@/lib/utils";
import { MapPin, CreditCard, Wallet, ChevronLeft, ArrowRight, ShieldCheck, Loader2, Banknote, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/Skeleton";
import { api } from "@/lib/api";

declare global {
  interface Window {
    Razorpay: any;
  }
}

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
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [bill, setBill] = useState<{
    subtotal: number; delivery_fee: number; platform_fee: number; discount: number; total: number;
  } | null>(null);
  const [billLoading, setBillLoading] = useState(true);

  const { data: addresses = [], isLoading: addrLoading } = useAddresses();

  // Redirect if cart is empty
  useEffect(() => {
    if (count() === 0) router.push("/cart");
  }, [count, router]);

  // Fetch server-computed bill on mount
  useEffect(() => {
    if (items.length === 0) return;
    const restaurantId = items[0]?.restaurantId;
    if (!restaurantId) return;

    setBillLoading(true);
    api.payments.calculate({
      restaurant_id: restaurantId,
      items: items.map(i => ({ menu_item_id: i.id, quantity: i.quantity })),
      coupon_code: couponCode || undefined,
    })
      .then(setBill)
      .catch(() => {
        // Fallback to client-side calc if API fails
        const subtotal = total();
        setBill({ subtotal, delivery_fee: 30, platform_fee: 5, discount: 0, total: subtotal + 35 });
      })
      .finally(() => setBillLoading(false));
  }, [items, couponCode]);

  if (count() === 0) return null;

  const restaurantId = items[0]?.restaurantId;

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    const address = addresses.find((a: any) => a.id === selectedAddressId) ?? addresses[0];
    if (!address) return alert("Please add a delivery address first.");

    setIsPaying(true);

    try {
      if (paymentMethod === "cod") {
        // Cash on delivery — skip Razorpay, go straight to order creation via verify
        const order = await api.payments.verify({
          razorpay_order_id: `cod_${Date.now()}`,
          razorpay_payment_id: `cod_${Date.now()}`,
          razorpay_signature: "cod",
          restaurant_id: restaurantId,
          items: items.map(i => ({ menu_item_id: i.id, quantity: i.quantity })),
          delivery_address: { label: address.label, line1: address.line1, lat: address.lat, lng: address.lng },
          coupon_code: couponCode || undefined,
          payment_method: "cod",
        });
        clear();
        router.push(`/order/${order.id}`);
        return;
      }

      // Online payment via Razorpay
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert("Failed to load payment gateway. Please try again.");
        return;
      }

      // 1. Create Razorpay order server-side
      const rzpData = await api.payments.createOrder({
        restaurant_id: restaurantId,
        items: items.map(i => ({ menu_item_id: i.id, quantity: i.quantity })),
        coupon_code: couponCode || undefined,
      });

      // 2. Open Razorpay modal
      await new Promise<void>((resolve, reject) => {
        const options = {
          key: rzpData.key_id,
          amount: rzpData.amount,
          currency: rzpData.currency,
          name: "VIT-AP Eats",
          description: `Order from ${items[0]?.restaurantName}`,
          order_id: rzpData.razorpay_order_id,
          handler: async (response: any) => {
            try {
              // 3. Verify payment + create order atomically
              const order = await api.payments.verify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                restaurant_id: restaurantId,
                items: items.map(i => ({ menu_item_id: i.id, quantity: i.quantity })),
                delivery_address: { label: address.label, line1: address.line1, lat: address.lat, lng: address.lng },
                coupon_code: couponCode || undefined,
                payment_method: paymentMethod,
              });
              clear();
              router.push(`/order/${order.id}`);
              resolve();
            } catch (err: any) {
              reject(err);
            }
          },
          modal: { ondismiss: () => reject(new Error("Payment cancelled")) },
          prefill: { name: "", email: "", contact: "" },
          theme: { color: "#ff6b35" },
        };
        new window.Razorpay(options).open();
      });

    } catch (err: any) {
      if (err.message !== "Payment cancelled") {
        alert(`Payment failed: ${err.message}. Please try again.`);
      }
    } finally {
      setIsPaying(false);
    }
  };

  const displayBill = bill ?? { subtotal: total(), delivery_fee: 30, platform_fee: 5, discount: 0, total: total() + 35 };

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
          {addrLoading ? (
            <div className="space-y-3"><Skeleton className="h-20" /><Skeleton className="h-20" /></div>
          ) : addresses.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-[--color-on-surface-variant] mb-3">No saved addresses. Add one to proceed.</p>
              <button className="text-sm font-semibold text-[--color-primary] hover:underline flex items-center gap-1 mx-auto">
                <MapPin size={14} /> + Add Address
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {addresses.map((addr: any) => (
                <label key={addr.id}
                  className={cn("flex items-center gap-4 p-4 rounded-[--radius-md] border-2 cursor-pointer transition-colors",
                    (selectedAddressId ?? addresses[0]?.id) === addr.id
                      ? "border-[--color-primary] bg-[--color-primary-fixed]"
                      : "border-[--color-border] hover:bg-[--color-surface-container-low]"
                  )}>
                  <input type="radio" name="address" value={addr.id} className="accent-[--color-primary]"
                    checked={(selectedAddressId ?? addresses[0]?.id) === addr.id}
                    onChange={() => setSelectedAddressId(addr.id)} />
                  <div>
                    <p className="font-bold text-sm text-[--color-on-surface]">{addr.label}</p>
                    <p className="text-xs text-[--color-on-surface-variant]">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}</p>
                  </div>
                </label>
              ))}
            </div>
          )}
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
          {billLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-5" />)}
            </div>
          ) : (
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
          )}
        </section>

        {/* Pay CTA */}
        <section className="pt-2">
          <div className="flex items-center justify-center gap-2 mb-4 text-sm font-semibold" style={{ color: "var(--color-tertiary)" }}>
            <ShieldCheck size={18} />
            Secure checkout powered by Razorpay
          </div>
          <button
            onClick={handlePayment}
            disabled={isPaying || billLoading || addrLoading}
            className="w-full py-4 text-white font-bold text-lg rounded-[--radius-lg] shadow-[--shadow-lg] hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            style={{ background: "var(--color-primary)" }}
          >
            {isPaying ? (
              <><Loader2 size={20} className="animate-spin" />Processing...</>
            ) : (
              <>Pay {billLoading ? "..." : rupees(displayBill.total)} <ArrowRight size={20} /></>
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
