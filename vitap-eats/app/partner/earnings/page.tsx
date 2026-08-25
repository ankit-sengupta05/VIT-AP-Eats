"use client";
import { useEffect, useState } from "react";
import { rupees } from "@/lib/utils";
import { Banknote, Clock, Loader2, ChevronLeft, TrendingUp, PackageCheck } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/Skeleton";

interface EarningRecord {
  order_id: string;
  restaurant_name: string | { name: string };
  payout: number;
  delivered_at: string;
}

export default function PartnerEarningsPage() {
  const [records, setRecords] = useState<EarningRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.partner.earnings()
      .then(setRecords)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const totalEarnings = records.reduce((s, r) => s + r.payout, 0);

  // Group by day
  const byDay = records.reduce<Record<string, EarningRecord[]>>((acc, r) => {
    const day = new Date(r.delivered_at).toLocaleDateString("en-IN", {
      weekday: "short", day: "numeric", month: "short",
    });
    if (!acc[day]) acc[day] = [];
    acc[day].push(r);
    return acc;
  }, {});

  const restaurantName = (r: EarningRecord) =>
    typeof r.restaurant_name === "string" ? r.restaurant_name : r.restaurant_name?.name ?? "Restaurant";

  return (
    <div className="min-h-screen" style={{ background: "var(--color-bg)" }}>
      {/* Header */}
      <header className="sticky top-0 z-40 shadow-[--shadow-sm]" style={{ background: "var(--color-inverse-surface)" }}>
        <div className="max-w-[700px] mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/partner"
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors text-[--color-inverse-on-surface]">
            <ChevronLeft size={20} />
          </Link>
          <span className="text-[--color-inverse-on-surface] font-bold" style={{ fontFamily: "var(--font-heading)" }}>
            Earnings & Payouts
          </span>
        </div>
      </header>

      <div className="max-w-[700px] mx-auto px-4 py-6 space-y-5">
        {/* Summary card */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[--color-surface-container-lowest] rounded-[--radius-lg] shadow-[--shadow-md] border border-[--color-border] p-4">
            <div className="w-9 h-9 rounded-[--radius-md] flex items-center justify-center mb-2" style={{ background: "#dcfce7" }}>
              <TrendingUp size={18} className="text-green-600" />
            </div>
            <p className="text-xl font-extrabold tabular-nums text-[--color-on-surface]">
              {isLoading ? "—" : rupees(totalEarnings)}
            </p>
            <p className="text-xs text-[--color-on-surface-variant]">All-time Earnings</p>
          </div>
          <div className="bg-[--color-surface-container-lowest] rounded-[--radius-lg] shadow-[--shadow-md] border border-[--color-border] p-4">
            <div className="w-9 h-9 rounded-[--radius-md] flex items-center justify-center mb-2" style={{ background: "var(--color-primary-fixed)" }}>
              <PackageCheck size={18} style={{ color: "var(--color-primary)" }} />
            </div>
            <p className="text-xl font-extrabold tabular-nums text-[--color-on-surface]">
              {isLoading ? "—" : records.length}
            </p>
            <p className="text-xs text-[--color-on-surface-variant]">Total Deliveries</p>
          </div>
        </div>

        {/* Earnings list */}
        <div>
          <h2 className="text-base font-bold text-[--color-on-surface] mb-3" style={{ fontFamily: "var(--font-heading)" }}>
            Payout History
          </h2>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-16" />)}
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-16 bg-[--color-surface-container-lowest] rounded-[--radius-lg] border border-[--color-border] border-dashed">
              <Banknote size={36} className="mx-auto mb-3 text-[--color-on-surface-variant] opacity-40" />
              <p className="font-semibold text-[--color-on-surface]">No earnings yet</p>
              <p className="text-sm text-[--color-on-surface-variant] mt-1">Complete deliveries to see your payouts here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(byDay).map(([day, dayRecords]) => (
                <div key={day}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-[--color-on-surface-variant] uppercase tracking-wider">{day}</p>
                    <p className="text-xs font-bold text-[--color-on-surface]">
                      {rupees(dayRecords.reduce((s, r) => s + r.payout, 0))}
                    </p>
                  </div>
                  <div className="space-y-2">
                    {dayRecords.map((r) => (
                      <div key={r.order_id}
                        className="flex items-center justify-between bg-[--color-surface-container-lowest] rounded-[--radius-md] border border-[--color-border] px-4 py-3">
                        <div>
                          <p className="font-semibold text-sm text-[--color-on-surface]">{restaurantName(r)}</p>
                          <p className="text-xs text-[--color-on-surface-variant] flex items-center gap-1">
                            <Clock size={10} />
                            {new Date(r.delivered_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                        <span className="font-extrabold text-sm tabular-nums text-green-600">
                          +{rupees(r.payout)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
