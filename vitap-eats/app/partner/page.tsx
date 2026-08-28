"use client";
import { useState } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  TrendingUp, Bike,
  Bell, ToggleLeft, ToggleRight, Loader2
} from "lucide-react";
import { rupees, cn } from "@/lib/utils";
import toast, { Toaster } from "react-hot-toast";
import { useSession } from "@/lib/hooks/useSession";
import { getMyApplication, type PartnerApplication } from "@/lib/db/partners";
import Link from "next/link";

export default function PartnerDashboardPage() {
  const { user, loading: sessionLoading } = useSession();
  const router = useRouter();
  
  const [appStatus, setAppStatus] = useState<PartnerApplication | null | "loading">("loading");
  const [isOnline, setIsOnline] = useState(false);
  const [isTogglingOnline, setIsTogglingOnline] = useState(false);

  useEffect(() => {
    if (sessionLoading) return;
    if (!user) {
      router.push("/login?redirect=/partner");
      return;
    }
    getMyApplication(user.uid)
      .then((app) => setAppStatus(app))
      .catch(() => setAppStatus(null));
  }, [user, sessionLoading, router]);

  if (sessionLoading || appStatus === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--color-bg)" }}>
        <Loader2 size={36} className="animate-spin text-[--color-primary]" />
      </div>
    );
  }

  // If not approved, show prompt to apply
  if (!appStatus || appStatus.status !== "approved") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center" style={{ background: "var(--color-bg)" }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl mx-auto mb-4 bg-gray-200 text-gray-500">
          <Bike size={28} />
        </div>
        <h1 className="text-2xl font-bold text-[--color-on-surface] mb-2" style={{ fontFamily: "var(--font-heading)" }}>
          Partner Access Required
        </h1>
        <p className="text-[--color-on-surface-variant] mb-6">
          {appStatus?.status === "pending" 
            ? "Your application is currently under review." 
            : appStatus?.status === "declined"
            ? "Your previous application was declined."
            : "You need an approved partner account to access this dashboard."}
        </p>
        <Link href="/partner/apply"
          className="px-6 py-3 rounded-[--radius-full] text-white font-bold text-sm"
          style={{ background: "var(--color-primary)" }}>
          {appStatus ? "View Application Status" : "Apply to Partner"}
        </Link>
      </div>
    );
  }

  const profile = {
    full_name: user?.displayName || "Delivery Partner",
    rating: 4.8,
    today_earnings: 120,
    total_deliveries: 45
  };

  const handleToggleOnline = async () => {
    setIsTogglingOnline(true);
    setTimeout(() => {
      setIsOnline(!isOnline);
      setIsTogglingOnline(false);
      toast.success(!isOnline ? "You're Online! Accepting orders 🟢" : "You are now Offline");
    }, 500);
  };

  return (
    <div className="min-h-screen pb-10" style={{ background: "var(--color-bg)" }}>
      <Toaster />
      <header className="sticky top-0 z-40 shadow-[--shadow-sm]" style={{ background: "var(--color-inverse-surface)" }}>
        <div className="max-w-[800px] mx-auto px-4 h-14 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: "var(--color-primary)" }}>
            {profile.full_name[0]}
          </div>
          <div className="flex-1">
            <p className="text-[--color-inverse-on-surface] font-bold text-sm leading-none" style={{ fontFamily: "var(--font-heading)" }}>
              {profile.full_name}
            </p>
            <p className="text-[--color-inverse-on-surface] opacity-60 text-xs">{profile.rating} ★</p>
          </div>
          <div className={cn("w-2.5 h-2.5 rounded-full border-2 border-[--color-inverse-surface]", isOnline ? "bg-green-400" : "bg-gray-400")} />
          <span className="text-[--color-inverse-on-surface] text-xs font-semibold opacity-70">
            {isOnline ? "Online" : "Offline"}
          </span>
        </div>
      </header>

      <div className="max-w-[800px] mx-auto px-4 py-6 space-y-5">
        <div className={cn("flex items-center justify-between rounded-[--radius-lg] shadow-[--shadow-md] p-4 border transition-colors", isOnline ? "border-green-200 bg-green-50" : "border-[--color-border] bg-[--color-surface-container-lowest]")}>
          <div>
            <p className="font-bold text-[--color-on-surface]" style={{ fontFamily: "var(--font-heading)" }}>
              {isOnline ? "🟢 You're Online" : "⚫ You're Offline"}
            </p>
            <p className="text-sm text-[--color-on-surface-variant]">
              {isOnline ? "Accepting delivery requests" : "Go online to receive orders"}
            </p>
          </div>
          <button onClick={handleToggleOnline} disabled={isTogglingOnline} className="transition-colors disabled:opacity-50" style={{ color: isOnline ? "#22c55e" : "var(--color-outline)" }}>
            {isTogglingOnline ? <Loader2 size={40} className="animate-spin" /> : isOnline ? <ToggleRight size={52} /> : <ToggleLeft size={52} />}
          </button>
        </div>

        <div>
          <h2 className="text-base font-bold text-[--color-on-surface] mb-3" style={{ fontFamily: "var(--font-heading)" }}>Today&apos;s Summary</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[--color-surface-container-lowest] rounded-[--radius-lg] shadow-[--shadow-sm] p-4 border border-[--color-border]">
              <div className="w-8 h-8 rounded-[--radius-md] flex items-center justify-center mb-2 bg-indigo-50"><Bike size={16} className="text-indigo-600" /></div>
              <p className="text-xl font-extrabold tabular-nums text-[--color-on-surface]">3</p>
              <p className="text-xs text-[--color-on-surface-variant]">Today&apos;s Deliveries</p>
            </div>
            <div className="bg-[--color-surface-container-lowest] rounded-[--radius-lg] shadow-[--shadow-sm] p-4 border border-[--color-border]">
              <div className="w-8 h-8 rounded-[--radius-md] flex items-center justify-center mb-2 bg-orange-50"><TrendingUp size={16} className="text-orange-600" /></div>
              <p className="text-xl font-extrabold tabular-nums text-[--color-on-surface]">{rupees(profile.today_earnings)}</p>
              <p className="text-xs text-[--color-on-surface-variant]">Today&apos;s Earnings</p>
            </div>
          </div>
        </div>

        {isOnline && (
          <div className="flex flex-col items-center gap-3 py-12 bg-[--color-surface-container-lowest] rounded-[--radius-lg] border border-[--color-border] border-dashed">
            <div className="w-14 h-14 rounded-full flex items-center justify-center bg-indigo-50">
              <Bell size={24} className="text-indigo-600 animate-pulse" />
            </div>
            <p className="font-bold text-[--color-on-surface]" style={{ fontFamily: "var(--font-heading)" }}>Waiting for orders...</p>
            <p className="text-sm text-[--color-on-surface-variant] text-center max-w-xs">You&apos;ll be notified the moment a delivery request arrives nearby.</p>
          </div>
        )}
      </div>
    </div>
  );
}
