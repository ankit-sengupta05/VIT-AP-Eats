"use client";
import { useState, useEffect } from "react";
import { Clock, CheckCircle2, AlertCircle, MoreVertical, MessageCircle } from "lucide-react";
import { rupees, cn } from "@/lib/utils";
import { subscribeToAllOrders, updateOrderStatus, type Order, type OrderStatus } from "@/lib/db/orders";
import toast from "react-hot-toast";

const STATUS_STYLES: Record<string, { label: string; cls: string }> = {
  pending:          { label: "New",         cls: "bg-blue-50 text-blue-700 border-blue-200" },
  confirmed:        { label: "Confirmed",   cls: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  preparing:        { label: "Preparing",   cls: "bg-amber-50 text-amber-700 border-amber-200" },
  out_for_delivery: { label: "On the Way",  cls: "bg-orange-50 text-orange-700 border-orange-200" },
  delivered:        { label: "Delivered",   cls: "bg-green-50 text-green-700 border-green-200" },
  cancelled:        { label: "Cancelled",   cls: "bg-red-50 text-red-700 border-red-200" },
};

function buildWhatsAppUrl(order: Order): string {
  const phone = order.userPhone?.replace(/\D/g, ""); // strip non-digits
  const shortId = order.id.slice(0, 6).toUpperCase();
  const itemsList = order.items.map((i) => `${i.quantity}× ${i.name}`).join(", ");
  const text = encodeURIComponent(
    `Hi ${order.userName}! 👋\n\nYour order #${shortId} from VIT-AP Eats has been *confirmed* ✅\n\n` +
    `🍽️ Items: ${itemsList}\n💰 Total: ₹${order.total}\n\nExpected delivery: ~30 mins. Thank you! 🚀`
  );
  return `https://wa.me/${phone}?text=${text}`;
}

export function OrdersTab() {
  const [orders, setOrders]         = useState<Order[]>([]);
  const [filter, setFilter]         = useState<string>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  // Real-time Firestore subscription
  useEffect(() => {
    const unsub = subscribeToAllOrders(setOrders);
    return () => unsub();
  }, []);

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const handleUpdateStatus = async (id: string, newStatus: OrderStatus) => {
    setUpdatingId(id);
    setMenuOpenId(null);
    try {
      await updateOrderStatus(id, newStatus);
      toast.success(`Order marked as ${newStatus}`);
    } catch (err: any) {
      toast.error(err.message ?? "Update failed");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h2 className="font-bold text-[--color-on-surface] text-lg" style={{ fontFamily: "var(--font-heading)" }}>
          Live Orders
        </h2>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(["all", "pending", "confirmed", "preparing", "out_for_delivery"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn(
                "shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border",
                filter === s
                  ? "text-white border-[--color-primary]"
                  : "border-[--color-border] text-[--color-on-surface-variant] bg-[--color-surface-container-lowest] hover:bg-[--color-surface-container-low]"
              )}
              style={filter === s ? { background: "var(--color-primary)" } : {}}
            >
              {s === "all" ? "All" : STATUS_STYLES[s]?.label ?? s}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-[--color-surface-container-lowest] rounded-[--radius-lg] border border-[--color-border] border-dashed">
          <p className="font-semibold text-[--color-on-surface-variant]">No orders matching this filter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => {
            const s = STATUS_STYLES[order.status] ?? { label: order.status, cls: "bg-gray-100 text-gray-700" };
            const timeStr = order.createdAt?.toDate
              ? order.createdAt.toDate().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
              : "—";
            const isUpdating = updatingId === order.id;
            const waUrl = buildWhatsAppUrl(order);

            return (
              <div
                key={order.id}
                className={cn(
                  "bg-[--color-surface-container-lowest] rounded-[--radius-lg] shadow-[--shadow-sm] border p-4 flex items-start gap-4 transition-opacity",
                  isUpdating && "opacity-50"
                )}
              >
                {order.status === "pending" ? (
                  <AlertCircle size={22} style={{ color: "var(--color-primary)" }} className="shrink-0 mt-1" />
                ) : order.status === "delivered" ? (
                  <CheckCircle2 size={22} className="shrink-0 mt-1 text-green-600" />
                ) : (
                  <Clock size={22} className="shrink-0 mt-1 text-amber-500" />
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-bold text-sm text-[--color-on-surface]">
                      #{order.id.slice(0, 6).toUpperCase()}
                    </span>
                    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold border", s.cls)}>
                      {s.label}
                    </span>
                    <span className="text-xs text-[--color-on-surface-variant] ml-auto">{timeStr}</span>
                  </div>

                  <p className="text-sm font-semibold text-[--color-on-surface] mb-0.5">
                    {order.userName}{" "}
                    <span className="text-xs font-normal text-[--color-on-surface-variant]">
                      · {order.restaurantName}
                    </span>
                  </p>
                  <p className="text-xs text-[--color-on-surface-variant] mb-2 line-clamp-1">
                    {order.items.map((i) => `${i.quantity}× ${i.name}`).join(", ")}
                  </p>
                  <p className="text-xs text-[--color-on-surface-variant]">📍 {order.address}</p>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0 relative">
                  <span className="font-extrabold tabular-nums text-sm">{rupees(order.total)}</span>

                  {/* ✅ WhatsApp confirm button */}
                  {order.userPhone && (
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Confirm via WhatsApp"
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90 active:scale-95"
                      style={{ background: "#25D366" }}
                    >
                      <MessageCircle size={14} />
                      WhatsApp
                    </a>
                  )}

                  <button
                    onClick={() => setMenuOpenId(menuOpenId === order.id ? null : order.id)}
                    className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 transition-colors"
                  >
                    <MoreVertical size={18} />
                  </button>

                  {menuOpenId === order.id && (
                    <div className="absolute top-full right-0 mt-1 w-44 bg-white rounded-md shadow-lg border border-gray-100 py-1 z-10 text-sm">
                      <div className="px-3 py-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Update Status
                      </div>
                      <button
                        onClick={() => handleUpdateStatus(order.id, "confirmed")}
                        className="w-full text-left px-4 py-2 hover:bg-indigo-50 text-indigo-600 font-medium"
                      >
                        ✅ Confirm
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(order.id, "preparing")}
                        className="w-full text-left px-4 py-2 hover:bg-amber-50 text-amber-600 font-medium"
                      >
                        🍳 Preparing
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(order.id, "out_for_delivery")}
                        className="w-full text-left px-4 py-2 hover:bg-orange-50 text-orange-600 font-medium"
                      >
                        🛵 Out for Delivery
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(order.id, "delivered")}
                        className="w-full text-left px-4 py-2 hover:bg-green-50 text-green-600 font-medium"
                      >
                        ✔️ Delivered
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(order.id, "cancelled")}
                        className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 font-medium"
                      >
                        ❌ Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
