import { useState } from "react";
import { Clock, CheckCircle2, AlertCircle, MoreVertical, Search, Filter } from "lucide-react";
import { rupees, cn } from "@/lib/utils";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

type OrderStatus = "placed" | "accepted" | "preparing" | "picked_up" | "on_the_way" | "delivered" | "cancelled";

const STATUS_STYLES: Record<string, { label: string; cls: string }> = {
  placed:     { label: "New",       cls: "bg-blue-50 text-blue-700 border-blue-200" },
  accepted:   { label: "Accepted",  cls: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  preparing:  { label: "Preparing", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  picked_up:  { label: "Picked Up", cls: "bg-orange-50 text-orange-700 border-orange-200" },
  on_the_way: { label: "On the Way",cls: "bg-purple-50 text-purple-700 border-purple-200" },
  delivered:  { label: "Delivered", cls: "bg-green-50 text-green-700 border-green-200" },
  cancelled:  { label: "Cancelled", cls: "bg-red-50 text-red-700 border-red-200" },
};

export function OrdersTab({ orders, onUpdate }: { orders: any[]; onUpdate: () => void }) {
  const [filter, setFilter] = useState<string>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const filtered = filter === "all" ? orders : orders.filter(o => o.status === filter);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    setMenuOpenId(null);
    try {
      await api.admin.updateOrderStatus(id, { status: newStatus });
      toast.success(`Order marked as ${newStatus}`);
      onUpdate();
    } catch (err: any) {
      toast.error(err.message ?? "Update failed");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h2 className="font-bold text-[--color-on-surface] text-lg" style={{ fontFamily: "var(--font-heading)" }}>Live Orders</h2>
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {(["all", "placed", "preparing", "picked_up", "on_the_way"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn(
                "shrink-0 px-3 py-1.5 rounded-[--radius-full] text-xs font-semibold transition-all border",
                filter === s ? "text-white border-[--color-primary]" : "border-[--color-border] text-[--color-on-surface-variant] bg-[--color-surface-container-lowest] hover:bg-[--color-surface-container-low]"
              )}
              style={filter === s ? { background: "var(--color-primary)" } : {}}
            >
              {s === "all" ? "All Active" : STATUS_STYLES[s]?.label ?? s}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-[--color-surface-container-lowest] rounded-[--radius-lg] border border-[--color-border] border-dashed">
          <p className="font-semibold text-[--color-on-surface-variant]">No active orders matching this filter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => {
            const s = STATUS_STYLES[order.status] ?? { label: order.status, cls: "bg-gray-100 text-gray-700" };
            const timeStr = new Date(order.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
            const itemsStr = order.order_items?.map((i: any) => `${i.quantity}× ${i.menu_items?.name}`).join(", ");
            const isUpdating = updatingId === order.id;

            return (
              <div key={order.id} className={cn("bg-[--color-surface-container-lowest] rounded-[--radius-lg] shadow-[--shadow-sm] border p-4 flex items-start gap-4 transition-opacity", isUpdating && "opacity-50")}>
                {order.status === "placed" ? (
                  <AlertCircle size={22} style={{ color: "var(--color-primary)" }} className="shrink-0 mt-1" />
                ) : order.status === "delivered" ? (
                  <CheckCircle2 size={22} className="shrink-0 mt-1 text-green-600" />
                ) : (
                  <Clock size={22} className="shrink-0 mt-1 text-amber-500" />
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-bold text-sm text-[--color-on-surface]">#{order.id.split("-")[0].toUpperCase()}</span>
                    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold border", s.cls)}>{s.label}</span>
                    <span className="text-xs text-[--color-on-surface-variant] ml-auto">{timeStr}</span>
                  </div>
                  
                  <p className="text-sm font-semibold text-[--color-on-surface] mb-0.5">
                    {order.profiles?.full_name} <span className="text-xs font-normal text-[--color-on-surface-variant]">· {order.restaurants?.name}</span>
                  </p>
                  <p className="text-xs text-[--color-on-surface-variant] mb-2 line-clamp-1">{itemsStr}</p>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 bg-[--color-surface-container-low] rounded text-[--color-on-surface-variant]">
                      {order.payment_method}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0 relative">
                  <span className="font-extrabold tabular-nums text-sm">{rupees(order.total)}</span>
                  
                  <button 
                    onClick={() => setMenuOpenId(menuOpenId === order.id ? null : order.id)}
                    className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 transition-colors"
                  >
                    <MoreVertical size={18} />
                  </button>

                  {/* Action Dropdown */}
                  {menuOpenId === order.id && (
                    <div className="absolute top-full right-0 mt-1 w-40 bg-white rounded-md shadow-lg border border-gray-100 py-1 z-10 text-sm">
                      <div className="px-3 py-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Override Status</div>
                      <button onClick={() => handleUpdateStatus(order.id, "accepted")} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-indigo-600 font-medium">Force Accept</button>
                      <button onClick={() => handleUpdateStatus(order.id, "cancelled")} className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 font-medium">Cancel Order</button>
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
