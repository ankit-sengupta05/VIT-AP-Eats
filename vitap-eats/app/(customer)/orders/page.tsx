"use client";
import Link from "next/link";
import Image from "next/image";
import { useOrders } from "@/lib/hooks";
import { Skeleton } from "@/components/ui/Skeleton";
import { rupees } from "@/lib/utils";
import { Clock, ChevronRight, ShoppingBag, RotateCcw } from "lucide-react";

const STATUS_COLOR: Record<string, string> = {
  placed:     "bg-blue-100 text-blue-700",
  accepted:   "bg-indigo-100 text-indigo-700",
  preparing:  "bg-amber-100 text-amber-700",
  picked_up:  "bg-orange-100 text-orange-700",
  on_the_way: "bg-orange-100 text-orange-700",
  delivered:  "bg-green-100 text-green-700",
  cancelled:  "bg-red-100 text-red-700",
};

export default function OrdersPage() {
  const { data: orders = [], isLoading, isError } = useOrders();

  return (
    <div className="max-w-[700px] mx-auto px-4 md:px-10 py-6 md:py-10">
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

            return (
              <Link key={order.id} href={`/order/${order.id}`}
                className="block bg-[--color-surface-container-lowest] rounded-[--radius-lg] border border-[--color-border] shadow-[--shadow-sm] hover:shadow-[--shadow-md] transition-shadow overflow-hidden">
                <div className="p-4">
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="font-bold text-[--color-on-surface]">{order.restaurants?.name}</p>
                      <p className="text-xs text-[--color-on-surface-variant] flex items-center gap-1 mt-0.5">
                        <Clock size={11} />
                        {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        &nbsp;·&nbsp;{rupees(order.total)}
                      </p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-[--radius-full] capitalize shrink-0 ${STATUS_COLOR[order.status] ?? "bg-gray-100 text-gray-700"}`}>
                      {order.status?.replace(/_/g, " ")}
                    </span>
                  </div>

                  {/* Item previews */}
                  {previewItems.length > 0 && (
                    <p className="text-sm text-[--color-on-surface-variant]">
                      {previewItems.map((item: any) => `${item.quantity}× ${item.menu_items?.name}`).join(", ")}
                      {extraCount > 0 && ` +${extraCount} more`}
                    </p>
                  )}
                </div>

                {/* Active order CTA */}
                {isActive ? (
                  <div className="px-4 py-2.5 flex items-center justify-between text-white text-sm font-semibold" style={{ background: "var(--color-primary)" }}>
                    <span>Track Order</span>
                    <ChevronRight size={16} />
                  </div>
                ) : (
                  <div className="px-4 py-2.5 flex items-center justify-between text-[--color-primary] border-t border-[--color-border] text-sm font-semibold">
                    <span className="flex items-center gap-1.5"><RotateCcw size={14} />Reorder</span>
                    <ChevronRight size={16} />
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
