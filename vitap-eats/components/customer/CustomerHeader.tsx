"use client";
import Link from "next/link";
import { ShoppingCart, MapPin, Search, Bell } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";

export default function CustomerHeader() {
  const count = useCartStore((s) => s.count());

  return (
    <header className="sticky top-0 z-50 bg-[--color-surface-container-lowest] border-b border-[--color-border] shadow-[--shadow-sm]">
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

        {/* Location chip (desktop) */}
        <button className="hidden md:flex items-center gap-1.5 text-sm text-[--color-on-surface-variant] hover:text-[--color-on-surface] border border-[--color-border] rounded-[--radius-full] px-3 py-1.5 transition-colors">
          <MapPin size={14} className="text-[--color-primary]" />
          <span className="max-w-[160px] truncate">VIT-AP Campus, Amaravati</span>
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

          <Link
            href="/login"
            className="ml-1 px-4 py-1.5 text-sm font-semibold text-white rounded-[--radius-full] transition-opacity hover:opacity-90"
            style={{ background: "var(--color-primary)", boxShadow: "var(--shadow-primary)" }}
          >
            Sign in
          </Link>
        </div>
      </div>
    </header>
  );
}
