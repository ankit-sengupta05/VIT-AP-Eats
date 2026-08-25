"use client";
import { useCartStore } from "@/lib/store/cart";
import { usePlaceOrder, useAddresses } from "@/lib/hooks";
import { rupees, cn } from "@/lib/utils";
import { MapPin, CreditCard, Wallet, ChevronLeft, ArrowRight, ShieldCheck, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/Skeleton";

const DELIVERY_FEE = 30;
const PLATFORM_FEE = 5;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, count, clear } = useCartStore();
  const subtotal = total();
  const grandTotal = subtotal + DELIVERY_FEE + PLATFORM_FEE;
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "cod">("upi");
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  const { data: addresses = [], isLoading: addrLoading } = useAddresses();
  const { mutate: placeOrder, isPending } = usePlaceOrder();

  useEffect(() => {
    if (count() === 0) router.push("/cart");
  }, [count, router]);

  if (count() === 0) return null;

  const restaurantId = items[0]?.restaurantId;

  const handlePayment = () => {
    const address = addresses.find((a: any) => a.id === selectedAddressId) ?? addresses[0];
    if (!address) return alert("Please add a delivery address first.");

    placeOrder(
      {
        restaurant_id: restaurantId,
        items: items.map((i) => ({
          menu_item_id: i.id,
          quantity: i.quantity,
          unit_price: i.price,
        })),
        delivery_address: {
          label: address.label,
          line1: address.line1,
          lat: address.lat,
          lng: address.lng,
        },
        payment_method: paymentMethod,
      },
      {
        onSuccess: (order) => {
          clear();
          router.push(`/order/${order.id}`);
        },
        onError: (err) => alert(err.message),
      }
    );
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
        {/* Delivery Addresses */}
        <section className="bg-[--color-surface-container-lowest] rounded-[--radius-lg] shadow-[--shadow-sm] border border-[--color-border] p-5">
          <h2 className="font-bold text-lg text-[--color-on-surface] mb-4" style={{ fontFamily: "var(--font-heading)" }}>Delivery Address</h2>
          {addrLoading ? (
            <div className="space-y-3"><Skeleton className="h-20" /><Skeleton className="h-20" /></div>
          ) : addresses.length === 0 ? (
            <p className="text-sm text-[--color-on-surface-variant]">No saved addresses. Add one below.</p>
          ) : (
            <div className="space-y-3">
              {addresses.map((addr: any) => (
                <label key={addr.id}
                  className={cn("flex items-center gap-4 p-4 rounded-[--radius-md] border-2 cursor-pointer transition-colors",
                    (selectedAddressId ?? addresses[0]?.id) === addr.id ? "border-[--color-primary] bg-[--color-primary-fixed]" : "border-[--color-border] hover:bg-[--color-surface-container-low]")}>
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
          <button className="mt-4 text-sm font-semibold text-[--color-primary] hover:underline flex items-center gap-1">
            <MapPin size={14} /> Add New Address
          </button>
        </section>

        {/* Payment Method */}
        <section className="bg-[--color-surface-container-lowest] rounded-[--radius-lg] shadow-[--shadow-sm] border border-[--color-border] p-5">
          <h2 className="font-bold text-lg text-[--color-on-surface] mb-4" style={{ fontFamily: "var(--font-heading)" }}>Payment Method</h2>
          <div className="space-y-3">
            {[
              { id: "upi",  label: "UPI / Google Pay",      icon: Wallet     },
              { id: "card", label: "Credit / Debit Card",   icon: CreditCard },
              { id: "cod",  label: "Cash on Delivery",      icon: MapPin     },
            ].map(({ id, label, icon: Icon }) => (
              <label key={id}
                className={cn("flex items-center justify-between p-4 rounded-[--radius-md] border-2 cursor-pointer transition-colors hover:bg-[--color-surface-container-low]",
                  paymentMethod === id ? "border-[--color-primary] bg-[--color-primary-fixed]" : "border-[--color-border]")}>
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

        {/* Pay CTA */}
        <section className="pt-4">
          <div className="flex items-center justify-center gap-2 mb-4 text-sm font-semibold" style={{ color: "var(--color-tertiary)" }}>
            <ShieldCheck size={18} />Secure checkout powered by Razorpay
          </div>
          <button onClick={handlePayment} disabled={isPending}
            className="w-full py-4 text-white font-bold text-lg rounded-[--radius-lg] shadow-[--shadow-lg] hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            style={{ background: "var(--color-primary)" }}>
            {isPending ? (
              <><Loader2 size={20} className="animate-spin" /> Processing...</>
            ) : (
              <>Pay {rupees(grandTotal)} <ArrowRight size={20} /></>
            )}
          </button>
        </section>
      </div>
    </div>
  );
}
