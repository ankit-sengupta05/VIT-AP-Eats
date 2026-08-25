"use client";
import Link from "next/link";
import { useFavorites } from "@/lib/hooks";
import RestaurantCard from "@/components/customer/RestaurantCard";
import { Heart, ChevronLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";

export default function FavoritesPage() {
  const { data: favorites, isLoading, isError } = useFavorites();

  return (
    <div className="min-h-screen bg-[--color-bg] pb-20">
      <header className="px-4 md:px-10 h-16 flex items-center border-b border-[--color-border] bg-[--color-surface-container-lowest] sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-2 text-[--color-on-surface-variant] hover:text-[--color-on-surface] transition-colors">
          <ChevronLeft size={20} />
          <span className="font-semibold text-sm">Back</span>
        </Link>
        <h1 className="text-lg font-bold text-[--color-on-surface] mx-auto absolute left-1/2 -translate-x-1/2" style={{ fontFamily: "var(--font-heading)" }}>
          Your Favorites
        </h1>
      </header>

      <main className="max-w-[1280px] mx-auto px-4 md:px-10 py-8">
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="w-full h-48 rounded-[--radius-lg]" />
                <Skeleton className="w-3/4 h-5" />
                <Skeleton className="w-1/2 h-4" />
              </div>
            ))}
          </div>
        )}

        {isError && (
          <div className="text-center py-20">
            <p className="text-5xl mb-3">😕</p>
            <p className="font-semibold text-[--color-on-surface]">Failed to load favorites</p>
            <p className="text-sm text-[--color-on-surface-variant]">Please check your connection</p>
          </div>
        )}

        {!isLoading && !isError && (!favorites || favorites.length === 0) && (
          <div className="text-center py-24 flex flex-col items-center">
            <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mb-6">
              <Heart size={32} className="text-pink-500" />
            </div>
            <h2 className="text-xl font-bold text-[--color-on-surface] mb-2" style={{ fontFamily: "var(--font-heading)" }}>
              No favorites yet
            </h2>
            <p className="text-sm text-[--color-on-surface-variant] mb-8 max-w-sm">
              Tap the heart icon on any restaurant to save it here for quick access later.
            </p>
            <Link 
              href="/" 
              className="px-8 py-3 rounded-[--radius-md] text-white font-bold shadow-[--shadow-md] hover:opacity-90 transition-opacity"
              style={{ background: "var(--color-primary)" }}
            >
              Explore Restaurants
            </Link>
          </div>
        )}

        {!isLoading && !isError && favorites && favorites.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {favorites.map((fav: any) => (
              <RestaurantCard key={fav.favorite_id} {...fav} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
