"use client";
import { useState } from "react";
import Link from "next/link";
import { ShoppingCart, MapPin, Search, Bell } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import { useSession } from "@/lib/hooks/useSession";
import { useLocationStore } from "@/lib/store/location";
import LocationPickerModal from "@/components/shared/LocationPicker";

export default function CustomerHeader() {
  const count = useCartStore((s) => s.count());
  const { user, role, signOut, loading } = useSession();
  const { label } = useLocationStore();
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[--color-border] shadow-md transition-colors" style={{ backgroundColor: "var(--color-surface-container-lowest)" }}>
        <div className="max-w-[1280px] mx-auto px-4 md:px-10 h-16 flex items-center gap-3">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2 mr-auto shrink-0">
            <span
              className="w-8 h-8 rounded-[--radius-md] flex items-center justify-center text-white text-sm font-bold"
              style={{ background: "var(--color-primary)" }}
            >
              VE
            </span>
            <span className="font-bold text-lg hidden sm:block" style={{ fontFamily: "var(--font-heading)", color: "var(--color-on-surface)" }}>
              VIT-AP Eats
            </span>
          </Link>

          {/* Location chip (desktop) - NOW CLICKABLE */}
          <button 
            onClick={() => setIsLocationOpen(true)}
            className="hidden md:flex items-center gap-1.5 text-sm text-[--color-on-surface-variant] hover:text-[--color-on-surface] border border-[--color-border] hover:border-[--color-primary] rounded-[--radius-full] px-3 py-1.5 transition-colors cursor-pointer"
          >
            <MapPin size={14} className="text-[--color-primary]" />
            <span className="max-w-[160px] truncate">{label}</span>
          </button>

          {/* Search bar (desktop) */}
          <Link
            href="/search"
            className="hidden md:flex items-center gap-2 bg-[--color-surface-container-low] rounded-[--radius-md] px-4 py-2 text-sm text-[--color-text-secondary] hover:bg-[--color-surface-container] transition-colors flex-1 max-w-xs"
          >
            <Search size={16} />
            <span>Search restaurants...</span>
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button className="relative p-2 rounded-[--radius-md] hover:bg-[--color-surface-container-low] transition-colors">
              <Bell size={20} style={{ color: "var(--color-on-surface-variant)" }} />
            </button>

            <Link
              href="/cart"
              className="relative p-2 rounded-[--radius-md] hover:bg-[--color-surface-container-low] transition-colors"
            >
              <ShoppingCart size={20} style={{ color: "var(--color-on-surface-variant)" }} />
              {count > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
                  style={{ background: "var(--color-primary)" }}
                >
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </Link>

            {!loading && user ? (
              <div className="ml-1 relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="w-8 h-8 rounded-full flex items-center justify-center border-2 hover:bg-[--color-surface-container-low] transition-colors"
                  style={{ borderColor: "var(--color-primary)" }}
                >
                  <span className="text-xs font-bold uppercase" style={{ color: "var(--color-primary)" }}>
                    {user.displayName?.[0] ?? "U"}
                  </span>
                </button>
                
                {isProfileOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-48 z-50">
                      <div className="border border-[--color-border] rounded-[--radius-lg] shadow-[--shadow-lg] py-1 overflow-hidden" style={{ backgroundColor: "var(--color-surface-container-lowest)" }}>
                        {role === "admin" && (
                          <Link href="/admin" onClick={() => setIsProfileOpen(false)} className="block px-4 py-2 text-sm font-bold text-[--color-primary] bg-[--color-surface-container-low] hover:bg-[--color-surface-container]">
                            Admin Dashboard
                          </Link>
                        )}
                        <Link href="/profile" onClick={() => setIsProfileOpen(false)} className="block px-4 py-2 text-sm text-[--color-on-surface] hover:bg-[--color-surface-container-low] transition-colors">My Profile</Link>
                        <Link href="/orders" onClick={() => setIsProfileOpen(false)} className="block px-4 py-2 text-sm text-[--color-on-surface] hover:bg-[--color-surface-container-low] transition-colors">Orders</Link>
                        <Link href="/favorites" onClick={() => setIsProfileOpen(false)} className="block px-4 py-2 text-sm text-[--color-on-surface] hover:bg-[--color-surface-container-low] transition-colors">Favorites</Link>
                        <button onClick={() => { setIsProfileOpen(false); signOut(); }} className="block w-full text-left px-4 py-2 text-sm text-[--color-error] hover:bg-[--color-surface-container-low] transition-colors">Sign out</button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : !loading && !user ? (
              <Link
                href="/login"
                className="ml-1 px-4 py-1.5 text-sm font-semibold text-white rounded-[--radius-full] transition-opacity hover:opacity-90"
                style={{ background: "var(--color-primary)", boxShadow: "var(--shadow-primary)" }}
              >
                Sign in
              </Link>
            ) : (
              <div className="w-16 h-8 ml-1 rounded-[--radius-full] bg-[--color-surface-container] animate-pulse" />
            )}
          </div>
        </div>
      </header>

      <LocationPickerModal isOpen={isLocationOpen} onClose={() => setIsLocationOpen(false)} />
    </>
  );
}
