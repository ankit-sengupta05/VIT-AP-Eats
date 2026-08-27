"use client";
import { useState } from "react";
import { rupees } from "@/lib/utils";
import { Banknote, Clock, ChevronLeft, TrendingUp, PackageCheck } from "lucide-react";
import Link from "next/link";

interface EarningRecord {
  order_id: string;
  restaurant_name: string;
  payout: number;
  delivered_at: string;
}

export default function PartnerEarningsPage() {
  const [records] = useState<EarningRecord[]>([
    { order_id: "1", restaurant_name: "Temptations", payout: 40, delivered_at: new Date().toISOString() },
    { order_id: "2", restaurant_name: "Night Canteen", payout: 80, delivered_at: new Date().toISOString() }
  ]);

  const totalEarnings = records.reduce((s, r) => s + r.payout, 0);

  const byDay = records.reduce<Record<string, EarningRecord[]>>((acc, r) => {
    const day = new Date(r.delivered_at).toLocaleDateString("en-IN", {
      weekday: "short", day: "numeric", month: "short",
    });
    if (!acc[day]) acc[day] = [];
    acc[day].push(r);
    return acc;
  }, {});

  return (
    <div className="min-h-screen" style={{ background: "var(--color-bg)" }}>
      <header className="sticky top-0 z-40 shadow-[--shadow-sm]" style={{ background: "var(--color-inverse-surface)" }}>
        <div className="max-w-[700px] mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/partner" className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors text-[--color-inverse-on-surface]">
            <ChevronLeft size={20} />
          </Link>
          <span className="text-[--color-inverse-on-surface] font-bold" style={{ fontFamily: "var(--font-heading)" }}>Earnings & Payouts</span>
        </div>
      </header>

      <div className="max-w-[700px] mx-auto px-4 py-6 space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[--color-surface-container-lowest] rounded-[--radius-lg] shadow-[--shadow-md] border border-[--color-border] p-4">
            <div className="w-9 h-9 rounded-[--radius-md] flex items-center justify-center mb-2" style={{ background: "#dcfce7" }}>
              <TrendingUp size={18} className="text-green-600" />
            </div>
            <p className="text-xl font-extrabold tabular-nums text-[--color-on-surface]">{rupees(totalEarnings)}</p>
            <p className="text-xs text-[--color-on-surface-variant]">All-time Earnings</p>
          </div>
          <div className="bg-[--color-surface-container-lowest] rounded-[--radius-lg] shadow-[--shadow-md] border border-[--color-border] p-4">
            <div className="w-9 h-9 rounded-[--radius-md] flex items-center justify-center mb-2" style={{ background: "var(--color-primary-fixed)" }}>
              <PackageCheck size={18} style={{ color: "var(--color-primary)" }} />
            </div>
            <p className="text-xl font-extrabold tabular-nums text-[--color-on-surface]">{records.length}</p>
            <p className="text-xs text-[--color-on-surface-variant]">Total Deliveries</p>
          </div>
        </div>

        <div>
          <h2 className="text-base font-bold text-[--color-on-surface] mb-3" style={{ fontFamily: "var(--font-heading)" }}>Payout History</h2>
          <div className="space-y-4">
            {Object.entries(byDay).map(([day, dayRecords]) => (
              <div key={day}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-[--color-on-surface-variant] uppercase tracking-wider">{day}</p>
                  <p className="text-xs font-bold text-[--color-on-surface]">{rupees(dayRecords.reduce((s, r) => s + r.payout, 0))}</p>
                </div>
                <div className="space-y-2">
                  {dayRecords.map((r) => (
                    <div key={r.order_id} className="flex items-center justify-between bg-[--color-surface-container-lowest] rounded-[--radius-md] border border-[--color-border] px-4 py-3">
                      <div>
                        <p className="font-semibold text-sm text-[--color-on-surface]">{r.restaurant_name}</p>
                        <p className="text-xs text-[--color-on-surface-variant] flex items-center gap-1">
                          <Clock size={10} />
                          {new Date(r.delivered_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      <span className="font-extrabold text-sm tabular-nums text-green-600">+{rupees(r.payout)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
