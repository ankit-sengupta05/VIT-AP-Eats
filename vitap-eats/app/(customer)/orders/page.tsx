"use client";
import Link from "next/link";
import { useOrders } from "@/lib/hooks";
import { useCartStore } from "@/lib/store/cart";
import { Skeleton } from "@/components/ui/Skeleton";
import { rupees, cn } from "@/lib/utils";
import { Clock, ChevronRight, ShoppingBag, RotateCcw, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { api } from "@/lib/api";
import { useState } from "react";

const STATUS_COLOR: Record<string, { bg: string; text: string }> = {
  placed:     { bg: "#dbeafe", text: "#1d4ed8" },
  accepted:   { bg: "#e0e7ff", text: "#4338ca" },
  preparing:  { bg: "#fef3c7", text: "#d97706" },
  picked_up:  { bg: "#ffedd5", text: "#ea580c" },
  on_the_way: { bg: "#ffedd5", text: "#ea580c" },
  delivered:  { bg: "#dcfce7", text: "#16a34a" },
  cancelled:  { bg: "#fee2e2", text: "#dc2626" },
};

export default function OrdersPage() {
  const router = useRouter();
  const { data: orders = [], isLoading, isError } = useOrders();
  const { add, clearAndAdd, conflictingRestaurant } = useCartStore();
  const [reorderingId, setReorderingId] = useState<string | null>(null);

  const handleReorder = async (order: any, e: React.MouseEvent) => {
    e.preventDefault(); // Don't navigate to tracking page when reorder is clicked
    if (!order.order_items?.length) return;

    setReorderingId(order.id);

    try {
      // Fetch full menu item details to add to cart
      const restaurantId = order.restaurant_id;
      const restaurantName = order.restaurants?.name ?? "Restaurant";

      for (const item of order.order_items) {
        const menuItemId = item.menu_items?.id ?? item.menu_item_id;
        const name = item.menu_items?.name ?? "Item";
        const price = item.unit_price;
        const conflicting = conflictingRestaurant(restaurantId);

        if (conflicting) {
          // Auto-clear and reorder since user explicitly chose "Reorder"
          clearAndAdd({ id: menuItemId, restaurantId, restaurantName, name, price });
        } else {
          add({ id: menuItemId, restaurantId, restaurantName, name, price });
        }
      }

      toast.success("Items added to cart!", { icon: "🛒" });
      router.push("/cart");
    } catch {
      toast.error("Failed to reorder. Please try again.");
    } finally {
      setReorderingId(null);
    }
  };

  return (
    <div className="max-w-[700px] mx-auto px-4 md:px-10 py-6 md:py-10">
      <Toaster />
      <h1 className="text-2xl font-extrabold text-[--color-on-surface] mb-6" style={{ fontFamily: "var(--font-heading)" }}>
        Your Orders
      </h1>

      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 w-full" />)}
        </div>
      )}

      {isError && (
        <div className="text-center py-20">
          <p className="text-5xl mb-3">😕</p>
          <p className="font-semibold text-[--color-on-surface]">Failed to load orders</p>
          <p className="text-sm text-[--color-on-surface-variant]">Please check your connection</p>
        </div>
      )}

      {!isLoading && !isError && orders.length === 0 && (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-[--color-surface-container-low]">
            <ShoppingBag size={28} className="text-[--color-on-surface-variant]" />
          </div>
          <h2 className="text-lg font-bold text-[--color-on-surface] mb-2" style={{ fontFamily: "var(--font-heading)" }}>
            No orders yet
          </h2>
          <p className="text-sm text-[--color-on-surface-variant] mb-6">Start by browsing restaurants nearby</p>
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-[--radius-full] text-white font-semibold text-sm hover:opacity-90 transition-all"
            style={{ background: "var(--color-primary)" }}>
            Browse Restaurants
          </Link>
        </div>
      )}

      {!isLoading && !isError && orders.length > 0 && (
        <div className="space-y-4">
          {orders.map((order: any) => {
            const isActive = !["delivered", "cancelled"].includes(order.status);
            const previewItems = order.order_items?.slice(0, 2) ?? [];
            const extraCount = (order.order_items?.length ?? 0) - 2;
            const colors = STATUS_COLOR[order.status] ?? { bg: "#f3f4f6", text: "#374151" };

            return (
              <div key={order.id}
                className="bg-[--color-surface-container-lowest] rounded-[--radius-lg] border border-[--color-border] shadow-[--shadow-sm] hover:shadow-[--shadow-md] transition-shadow overflow-hidden">
                <Link href={`/order/${order.id}`} className="block p-4">
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <p className="font-bold text-[--color-on-surface]">{order.restaurants?.name}</p>
                      <p className="text-xs text-[--color-on-surface-variant] flex items-center gap-1 mt-0.5">
                        <Clock size={11} />
                        {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        &nbsp;·&nbsp;{rupees(order.total)}
                      </p>
                    </div>
                    <span
                      className="text-xs font-bold px-2.5 py-1 rounded-[--radius-full] capitalize shrink-0"
                      style={{ background: colors.bg, color: colors.text }}
                    >
                      {order.status?.replace(/_/g, " ")}
                    </span>
                  </div>

                  {/* Item previews */}
                  {previewItems.length > 0 && (
                    <p className="text-sm text-[--color-on-surface-variant] line-clamp-1">
                      {previewItems.map((item: any) => `${item.quantity}× ${item.menu_items?.name}`).join(", ")}
                      {extraCount > 0 && ` +${extraCount} more`}
                    </p>
                  )}
                </Link>

                {/* Action Footer */}
                {isActive ? (
                  <Link href={`/order/${order.id}`}
                    className="px-4 py-2.5 flex items-center justify-between text-white text-sm font-semibold"
                    style={{ background: "var(--color-primary)" }}>
                    <span>Track Order</span>
                    <ChevronRight size={16} />
                  </Link>
                ) : (
                  <button
                    onClick={(e) => handleReorder(order, e)}
                    disabled={reorderingId === order.id}
                    className="w-full px-4 py-2.5 flex items-center justify-between border-t border-[--color-border] text-sm font-semibold hover:bg-[--color-surface-container-low] transition-colors disabled:opacity-60"
                    style={{ color: "var(--color-primary)" }}
                  >
                    <span className="flex items-center gap-1.5">
                      {reorderingId === order.id
                        ? <Loader2 size={14} className="animate-spin" />
                        : <RotateCcw size={14} />}
                      Reorder
                    </span>
                    <ChevronRight size={16} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
