import { useState, useEffect } from "react";
import { Loader2, TrendingUp, ShoppingBag, ArrowRight } from "lucide-react";
import { rupees } from "@/lib/utils";
import { subscribeToAllOrders, type Order } from "@/lib/db/orders";

export function InsightsTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToAllOrders((data) => {
      setOrders(data);
      setIsLoading(false);
    });
    return () => unsub();
  }, []);

  if (isLoading) {
    return <div className="py-20 flex justify-center"><Loader2 size={32} className="animate-spin text-gray-400" /></div>;
  }

  // Generate basic daily stats from orders (last 7 days for demo)
  const today = new Date();
  const daily_stats = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
    const dayOrders = orders.filter(o => o.createdAt?.toDate && o.createdAt.toDate().toDateString() === d.toDateString());
    return {
      day: d.toISOString(),
      dateStr,
      revenue: dayOrders.reduce((acc, o) => acc + (o.total || 0), 0),
      total_orders: dayOrders.length,
    };
  }).reverse();

  // Calculate max revenue for bar chart scaling
  const maxRev = Math.max(...daily_stats.map(s => s.revenue || 0), 1000);

  // Top dishes
  const itemCounts: Record<string, { name: string; count: number; restaurant: string }> = {};
  orders.forEach(o => {
    o.items?.forEach(i => {
      if (!itemCounts[i.menuItemId]) itemCounts[i.menuItemId] = { name: i.name, count: 0, restaurant: o.restaurantName };
      itemCounts[i.menuItemId].count += i.quantity;
    });
  });
  const top_dishes = Object.values(itemCounts).sort((a, b) => b.count - a.count).slice(0, 5);

  return (
    <div className="space-y-6">
      <h2 className="font-bold text-[--color-on-surface] text-lg mb-6" style={{ fontFamily: "var(--font-heading)" }}>Insights & Analytics</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Daily Revenue Chart */}
        <div className="lg:col-span-2 bg-[--color-surface-container-lowest] rounded-[--radius-lg] shadow-[--shadow-sm] border border-[--color-border] p-5">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp size={18} className="text-[--color-primary]" />
            <h3 className="font-bold text-gray-800">7-Day Revenue</h3>
          </div>
          
          <div className="h-64 flex items-end gap-2 overflow-x-auto hide-scrollbar pb-2">
            {daily_stats.map((stat, i) => {
              const h = ((stat.revenue || 0) / maxRev) * 100;
              return (
                <div key={i} className="group relative flex flex-col items-center justify-end h-full min-w-[32px] flex-1">
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded pointer-events-none whitespace-nowrap z-10">
                    <p className="font-bold">{rupees(stat.revenue || 0)}</p>
                    <p className="text-gray-300">{stat.total_orders} orders</p>
                  </div>
                  
                  {/* Bar */}
                  <div 
                    className="w-full bg-[--color-primary-fixed] group-hover:bg-[--color-primary] rounded-t-sm transition-all" 
                    style={{ height: `${Math.max(h, 2)}%` }}
                  />
                  {/* X-axis label */}
                  <span className="text-[9px] text-gray-400 mt-2 truncate w-full text-center">
                    {stat.dateStr}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Dishes */}
        <div className="bg-[--color-surface-container-lowest] rounded-[--radius-lg] shadow-[--shadow-sm] border border-[--color-border] p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingBag size={18} className="text-[--color-tertiary]" />
            <h3 className="font-bold text-gray-800">Top Dishes</h3>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1 hide-scrollbar">
            {top_dishes.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-10">No order data yet</p>
            ) : (
              top_dishes.map((dish, i) => (
                <div key={i} className="flex items-center gap-3 group">
                  <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-[--color-primary] transition-colors">{dish.name}</p>
                    <p className="text-[10px] text-gray-500 truncate">{dish.restaurant}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-gray-900 tabular-nums">{dish.count}</p>
                    <p className="text-[10px] text-gray-400">sold</p>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <button className="mt-4 w-full py-2 flex items-center justify-center gap-2 text-xs font-bold text-[--color-primary] bg-[--color-primary-fixed] hover:bg-indigo-100 rounded-md transition-colors">
            View Full Report <ArrowRight size={14} />
          </button>
        </div>

      </div>
    </div>
  );
}
