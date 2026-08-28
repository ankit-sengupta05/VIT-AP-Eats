"use client";
import { useSession } from "@/lib/hooks/useSession";
import { useProfile } from "@/lib/hooks";
import { Loader2, User, Phone, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProfilePage() {
  const { user, loading: authLoading, signOut } = useSession();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  if (authLoading || profileLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 size={32} className="animate-spin text-[--color-primary]" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-[700px] mx-auto px-4 md:px-10 py-6 md:py-10">
      <h1 className="text-2xl font-extrabold text-[--color-on-surface] mb-6" style={{ fontFamily: "var(--font-heading)" }}>
        My Profile
      </h1>

      <div className="bg-[--color-surface-container-lowest] rounded-[--radius-lg] shadow-[--shadow-sm] border border-[--color-border] overflow-hidden mb-6">
        <div className="p-6 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          <div className="w-24 h-24 rounded-full bg-[--color-primary-fixed] flex items-center justify-center text-4xl font-bold text-[--color-primary] uppercase">
            {profile?.fullName?.[0] || user?.displayName?.[0] || "U"}
          </div>
          <div>
            <h2 className="text-xl font-bold text-[--color-on-surface]" style={{ fontFamily: "var(--font-heading)" }}>
              {profile?.fullName || user.displayName || "Unknown User"}
            </h2>
            <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start text-sm text-[--color-on-surface-variant]">
              <Phone size={14} />
              <span>{profile?.phone || "No phone added"}</span>
            </div>
            <div className="flex items-center gap-2 mt-1 justify-center sm:justify-start text-sm text-[--color-on-surface-variant]">
              <User size={14} />
              <span>{profile?.email || user.email || "No email"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Link href="/orders" className="bg-[--color-surface-container-lowest] rounded-[--radius-lg] shadow-[--shadow-sm] border border-[--color-border] p-5 hover:bg-[--color-surface-container-low] transition-colors">
          <h3 className="font-bold text-[--color-on-surface] mb-1" style={{ fontFamily: "var(--font-heading)" }}>My Orders</h3>
          <p className="text-xs text-[--color-on-surface-variant]">Track live orders and view history</p>
        </Link>
        <Link href="/favorites" className="bg-[--color-surface-container-lowest] rounded-[--radius-lg] shadow-[--shadow-sm] border border-[--color-border] p-5 hover:bg-[--color-surface-container-low] transition-colors">
          <h3 className="font-bold text-[--color-on-surface] mb-1" style={{ fontFamily: "var(--font-heading)" }}>Favorites</h3>
          <p className="text-xs text-[--color-on-surface-variant]">Quickly reorder from saved restaurants</p>
        </Link>
      </div>

      <button
        onClick={() => {
          signOut();
          router.push("/");
        }}
        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-[--radius-full] border-2 font-bold text-sm transition-colors hover:bg-[--color-error] hover:text-white"
        style={{ borderColor: "var(--color-error)", color: "var(--color-error)" }}
      >
        <LogOut size={16} />
        Sign out
      </button>
    </div>
  );
}
