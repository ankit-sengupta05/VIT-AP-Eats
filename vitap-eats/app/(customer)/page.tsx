"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, MapPin, ChevronRight, Flame, Star, TrendingUp, Package } from "lucide-react";
import RestaurantCard from "@/components/customer/RestaurantCard";
import { Badge } from "@/components/ui/Badge";
import { RestaurantGridSkeleton } from "@/components/ui/Skeleton";
import { useRestaurants, useMenuItems } from "@/lib/hooks";
import { useLocationStore } from "@/lib/store/location";
import { DishCard } from "@/components/customer/DishCard";

const CUISINES = [
  { id: "all",   label: "All",   emoji: "🍽️" },
  { id: "pizza", label: "Pizza", emoji: "🍕" },
  { id: "wraps", label: "Wraps", emoji: "🌯" },
];

// Real VIT-BITES top picks from the menu
const TOP_DISHES = [
  { id: "d1", name: "Dragonfire Margherita",  price: 150, restaurant: "VIT-BITES", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80", rating: 4.8 },
  { id: "d2", name: "Paneer Golden Delight",  price: 180, restaurant: "VIT-BITES", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80", rating: 4.7 },
  { id: "d3", name: "Death by Cheese",        price: 209, restaurant: "VIT-BITES", image: "https://images.unsplash.com/photo-1598023696416-0193a0bcd302?w=400&q=80", rating: 4.9 },
  { id: "d4", name: "Cheese Melt Paneer Wrap", price: 150, restaurant: "VIT-BITES", image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&q=80", rating: 4.6 },
];

export default function HomePage() {
  const [activeCuisine, setActiveCuisine] = useState("all");
  const { label } = useLocationStore();
  
  const { data: restaurants, isLoading: isResLoading, isError: isResError } = useRestaurants(
    activeCuisine === "all" ? undefined : activeCuisine,
  );
  
  const { data: menuItems, isLoading: isMenuLoading } = useMenuItems(
    activeCuisine === "all" ? undefined : activeCuisine
  );

  return (
    <div className="min-h-screen">
      {/* ── Hero ── */}
      <section
        className="relative overflow-hidden py-12 md:py-20"
        style={{ background: "linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary) 60%, #ff8c42 100%)" }}
      >
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-10 bg-white translate-x-16 -translate-y-16" />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-10 bg-white -translate-x-8 translate-y-8" />
        <div className="relative max-w-[1280px] mx-auto px-4 md:px-10">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 bg-white/20 text-white text-sm px-3 py-1.5 rounded-[--radius-full] mb-4 backdrop-blur-sm truncate max-w-[250px]">
              <MapPin size={14} className="shrink-0" />
              <span className="truncate">{label}</span>
              <ChevronRight size={14} className="opacity-70 shrink-0" />
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-3 leading-tight" style={{ fontFamily: "var(--font-heading)" }}>
              Hungry? <br className="sm:hidden" />
              <span className="opacity-90">We deliver</span>{" "}
              <span className="underline decoration-white/40">fresh.</span>
            </h1>
            <p className="text-white/80 text-base md:text-lg mb-6">
              Campus food from VIT-BITES, delivered to the Main Gate.
            </p>
            <Link href="/search" className="flex items-center gap-3 bg-white rounded-[--radius-lg] px-4 py-3.5 shadow-[--shadow-lg] hover:shadow-[--shadow-xl] transition-shadow max-w-lg">
              <Search size={18} className="shrink-0" style={{ color: "var(--color-primary)" }} />
              <span className="text-[--color-text-secondary] text-sm flex-1">Search for restaurants, dishes...</span>
              <span className="text-xs text-white font-semibold px-3 py-1 rounded-[--radius-full] shrink-0" style={{ background: "var(--color-primary)" }}>Search</span>
            </Link>
            <div className="flex gap-6 mt-6">
              {[
                { icon: Star,    value: "4.8★",       label: "Avg. rating"   },
                { icon: Flame,   value: "Fresh Daily", label: "Made fresh"    },
                { icon: Package, value: "Main Gate",   label: "Easy pickup"   },
              ].map(({ icon: Icon, value, label }) => (
                <div key={label} className="text-white">
                  <div className="flex items-center gap-1.5 font-bold text-lg"><Icon size={16} className="opacity-80" />{value}</div>
                  <div className="text-white/60 text-xs">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-[1280px] mx-auto px-4 md:px-10 py-8 space-y-10">

        {/* ── Cuisine Filters ── */}
        <section>
          <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1">
            {CUISINES.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCuisine(c.id)}
                className="flex flex-col items-center gap-1.5 min-w-[64px] group cursor-pointer"
              >
                <div
                  className="w-14 h-14 rounded-[--radius-lg] flex items-center justify-center text-2xl transition-all shadow-[--shadow-md] border"
                  style={activeCuisine === c.id
                    ? { background: "var(--color-primary)", borderColor: "var(--color-primary)", boxShadow: "var(--shadow-primary)" }
                    : { background: "var(--color-surface-container-lowest)", borderColor: "var(--color-border)" }}
                >
                  {c.emoji}
                </div>
                <span className="text-xs font-medium whitespace-nowrap transition-colors"
                  style={{ color: activeCuisine === c.id ? "var(--color-primary)" : "var(--color-on-surface-variant)" }}>
                  {c.label}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* ── Popular Dishes ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[--color-on-surface]" style={{ fontFamily: "var(--font-heading)" }}>
              <Flame size={20} className="inline mr-2 text-[--color-primary]" />Popular Dishes
            </h2>
            <Link href="/search?filter=popular" className="text-sm font-semibold flex items-center gap-1" style={{ color: "var(--color-primary)" }}>
              View all <ChevronRight size={16} />
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
            {TOP_DISHES.map((dish) => (
              <div key={dish.id} className="min-w-[160px] bg-[--color-surface-container-lowest] rounded-[--radius-lg] overflow-hidden shadow-[--shadow-md] hover:shadow-[--shadow-lg] transition-shadow cursor-pointer group">
                <div className="relative w-full h-28 overflow-hidden">
                  <Image src={dish.image} alt={dish.name} fill sizes="200px" className="object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="p-2.5">
                  <p className="font-semibold text-sm text-[--color-on-surface] line-clamp-1">{dish.name}</p>
                  <p className="text-xs text-[--color-on-surface-variant] mb-1 line-clamp-1">{dish.restaurant}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm tabular-nums" style={{ color: "var(--color-primary)" }}>₹{dish.price}</span>
                    <span className="flex items-center gap-0.5 text-xs font-medium text-[--color-tertiary]"><Star size={10} fill="currentColor" />{dish.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Promo Banner ── */}
        <section>
          <div className="rounded-[--radius-lg] p-5 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 overflow-hidden relative"
            style={{ background: "linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary) 100%)" }}>
            <div className="absolute right-0 top-0 w-40 h-40 rounded-full bg-white/10 translate-x-10 -translate-y-10" />
            <div>
              <Badge variant="warning" className="mb-2">Limited Time</Badge>
              <h3 className="text-xl md:text-2xl font-extrabold text-white mb-1" style={{ fontFamily: "var(--font-heading)" }}>First order? Get 50% OFF</h3>
              <p className="text-white/70 text-sm">Use code <strong className="text-white">VITAP50</strong> · Max discount ₹100</p>
            </div>
            <Link href="/search" className="shrink-0 bg-white font-bold text-sm px-5 py-2.5 rounded-[--radius-full] hover:shadow-[--shadow-lg] transition-shadow" style={{ color: "var(--color-primary)" }}>
              Order Now
            </Link>
          </div>
        </section>

        {/* ── Restaurants & Items Grid ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[--color-on-surface]" style={{ fontFamily: "var(--font-heading)" }}>
              {activeCuisine === "all" ? (
                <><TrendingUp size={20} className="inline mr-2 text-[--color-primary]" /> All Restaurants</>
              ) : (
                <><Flame size={20} className="inline mr-2 text-[--color-primary]" /> {CUISINES.find(c => c.id === activeCuisine)?.label ?? ""} Menu</>
              )}
            </h2>
          </div>

          {/* If All is selected, show restaurants */}
          {activeCuisine === "all" ? (
            <>
              {isResLoading && <RestaurantGridSkeleton />}
              {isResError && (
                <div className="text-center py-16">
                  <p className="text-5xl mb-3">😕</p>
                  <p className="font-semibold text-[--color-on-surface]">Could not load restaurants</p>
                  <p className="text-sm text-[--color-on-surface-variant]">Check your connection and try again</p>
                </div>
              )}
              {restaurants && restaurants.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {restaurants.map((r) => <RestaurantCard key={r.id} r={{
                    id: r.id, slug: r.slug, name: r.name,
                    cuisine: r.cuisine, rating: r.rating,
                    deliveryTime: 0, deliveryFee: r.deliveryFee,
                    minOrder: 0, image: r.imageUrl, isOpen: r.isOpen,
                    isVeg: r.isVeg, discount: undefined,
                  }} />)}
                </div>
              )}
              {restaurants && restaurants.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-5xl mb-3">🍽️</p>
                  <p className="font-semibold text-[--color-on-surface]">No restaurants open right now</p>
                </div>
              )}
              <div className="text-center mt-8">
                <Link href="/search" className="inline-flex items-center gap-2 px-6 py-3 rounded-[--radius-full] border-2 font-semibold text-sm transition-colors hover:bg-[--color-primary] hover:text-white hover:border-[--color-primary]"
                  style={{ borderColor: "var(--color-primary)", color: "var(--color-primary)" }}>
                  See all restaurants <ChevronRight size={16} />
                </Link>
              </div>
            </>
          ) : (
            /* If a category is selected, show matching menu items directly */
            <div className="bg-[--color-surface-container-lowest] rounded-[--radius-lg] border border-[--color-border] p-4">
              {isMenuLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => <div key={i} className="h-24 bg-[--color-surface-container] animate-pulse rounded-md" />)}
                </div>
              ) : menuItems && menuItems.length > 0 ? (
                <div className="space-y-2">
                  {menuItems.map(item => {
                    const rName = restaurants?.find(r => r.id === item.restaurantId)?.name || "VIT-BITES";
                    return (
                      <DishCard 
                        key={item.id} 
                        dish={item} 
                        restaurantId={item.restaurantId} 
                        restaurantName={rName} 
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-4xl mb-3">🍽️</p>
                  <p className="font-semibold text-[--color-on-surface]">No items found in this category.</p>
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      <footer className="border-t border-[--color-border] bg-[--color-surface-container-lowest] mt-10">
        <div className="max-w-[1280px] mx-auto px-4 md:px-10 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[--color-on-surface-variant]">
          <div className="flex items-center gap-2 font-bold text-[--color-on-surface]" style={{ fontFamily: "var(--font-heading)" }}>
            <span className="w-7 h-7 rounded-[--radius-md] flex items-center justify-center text-white text-xs font-bold" style={{ background: "var(--color-primary)" }}>VE</span>
            VIT-AP Eats
          </div>
          <p>© 2026 VIT-AP Eats · Made with ❤️ on campus</p>
          <div className="flex gap-4">
            <Link href="/partner/apply" className="hover:text-[--color-primary] transition-colors">Partner with us</Link>
            <Link href="/admin" className="hover:text-[--color-primary] transition-colors">Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
