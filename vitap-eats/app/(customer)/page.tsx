"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, MapPin, ChevronRight, Flame, Star, TrendingUp, Package, Gift } from "lucide-react";
import RestaurantCard from "@/components/customer/RestaurantCard";
import { RestaurantGridSkeleton } from "@/components/ui/Skeleton";
import { useRestaurants, useMenuItems } from "@/lib/hooks";
import { useLocationStore } from "@/lib/store/location";
import { DishCard } from "@/components/customer/DishCard";

const CUISINES = [
  { id: "all",   label: "All",   emoji: "🍽️" },
  { id: "pizza", label: "Pizza", emoji: "🍕" },
  { id: "wraps", label: "Wraps", emoji: "🌯" },
];

const TOP_DISHES = [
  { id: "d1", name: "Dragonfire Margherita",  price: 150, restaurant: "VIT Bites", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80" },
  { id: "d2", name: "Paneer Golden Delight",  price: 180, restaurant: "VIT Bites", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80" },
  { id: "d3", name: "Death by Cheese",        price: 209, restaurant: "VIT Bites", image: "https://images.unsplash.com/photo-1598023696416-0193a0bcd302?w=400&q=80" },
  { id: "d4", name: "Cheese Melt Wrap",       price: 150, restaurant: "VIT Bites", image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&q=80" },
];

export default function HomePage() {
  const [activeCuisine, setActiveCuisine] = useState("all");
  const { label } = useLocationStore();

  const { data: restaurants, isLoading: isResLoading, isError: isResError } = useRestaurants(
    activeCuisine === "all" ? undefined : activeCuisine
  );
  const activeCategoryLabel = CUISINES.find(c => c.id === activeCuisine)?.label;
  const { data: menuItems, isLoading: isMenuLoading } = useMenuItems(
    activeCuisine === "all" ? undefined : activeCategoryLabel
  );

  return (
    <div className="min-h-screen pb-20" style={{ background: "var(--color-bg)" }}>

      {/* ── HEADER BAR ──────────────────────────────────── */}
      <header
        className="sticky top-0 z-40 px-4 py-3 flex items-center justify-between"
        style={{
          background: "var(--color-primary)",
          borderBottom: "1px solid var(--color-primary-dark)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2">
          <span
            className="w-8 h-8 flex items-center justify-center font-extrabold text-sm"
            style={{
              background: "var(--color-on-primary)",
              color: "var(--color-primary)",
              borderRadius: "var(--radius-md)",
              fontFamily: "var(--font-heading)",
            }}
          >
            VE
          </span>
          <span
            className="text-base font-extrabold tracking-tight"
            style={{ color: "var(--color-on-primary)", fontFamily: "var(--font-heading)" }}
          >
            VIT-AP Eats
          </span>
        </div>

        {/* Location pill */}
        <Link
          href="/search"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold max-w-[160px]"
          style={{
            background: "var(--color-primary-dark)",
            color: "var(--color-on-primary)",
            borderRadius: "var(--radius-full)",
          }}
        >
          <MapPin size={12} className="shrink-0" />
          <span className="truncate">{label}</span>
        </Link>
      </header>

      {/* ── HERO / SEARCH ────────────────────────────────── */}
      <section
        className="px-4 pt-5 pb-6"
        style={{ background: "var(--color-primary)" }}
      >
        <h1
          className="text-2xl font-extrabold mb-1"
          style={{ color: "var(--color-on-primary)", fontFamily: "var(--font-heading)", lineHeight: 1.2 }}
        >
          Hungry? 🍕<br />We deliver <span style={{ opacity: 0.8 }}>fresh.</span>
        </h1>
        <p className="text-xs mb-4" style={{ color: "var(--color-primary-fixed)" }}>
          VIT Bites · Collect at Main Gate · Receive by Evening
        </p>

        {/* Small offer pill in banner */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 mb-5 rounded-full" style={{ background: "rgba(255, 255, 255, 0.15)", border: "1px solid rgba(255, 255, 255, 0.2)" }}>
          <Gift size={12} style={{ color: "#ffffff" }} />
          <span className="text-[11px] font-bold tracking-wide" style={{ color: "#ffffff" }}>
            ORDER ABOVE ₹700 FOR A SURPRISE
          </span>
        </div>

        {/* Search bar — fully opaque cream */}
        <Link
          href="/search"
          className="flex items-center gap-3 px-4 py-3"
          style={{
            background: "var(--color-surface-container-lowest)",
            borderRadius: "var(--radius-full)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <Search size={16} style={{ color: "var(--color-primary)", flexShrink: 0 }} />
          <span className="text-sm flex-1" style={{ color: "var(--color-on-surface-variant)" }}>
            Search dishes or restaurants…
          </span>
        </Link>

        {/* Stats row */}
        <div className="flex gap-4 mt-4">
          {[
            { icon: Star,    value: "4.8★",       label: "Avg rating"  },
            { icon: Flame,   value: "Fresh Daily", label: "Made fresh"  },
            { icon: Package, value: "Main Gate",   label: "Easy pickup" },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label}>
              <div
                className="flex items-center gap-1 font-bold text-sm"
                style={{ color: "var(--color-on-primary)" }}
              >
                <Icon size={13} style={{ opacity: 0.8 }} />
                {value}
              </div>
              <div className="text-[11px]" style={{ color: "var(--color-primary-fixed)" }}>
                {label}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="px-4 py-5 space-y-8">

        {/* ── PROMO CARD ─────────────────────────────── */}
        <section>
          <div 
            className="relative overflow-hidden p-5 flex items-center justify-between transition-transform active:scale-[0.98]"
            style={{ 
              background: "linear-gradient(135deg, var(--color-primary) 0%, #FF8A50 100%)",
              borderRadius: "var(--radius-xl)",
              boxShadow: "0 8px 20px -6px rgba(255, 107, 53, 0.5)",
              color: "#ffffff"
            }}
          >
            <div className="relative z-10 max-w-[80%]">
              <h3 className="font-extrabold text-lg mb-1 shadow-sm" style={{ fontFamily: "var(--font-heading)", textShadow: "0 1px 2px rgba(0,0,0,0.1)", color: "#ffffff" }}>
                Special Offer! ✨
              </h3>
              <p className="text-[13px] font-medium leading-tight" style={{ color: "rgba(255,255,255,0.95)" }}>
                Order above <span className="font-extrabold" style={{ color: "#ffffff" }}>₹700</span> and receive a <span className="font-extrabold" style={{ color: "#ffffff" }}>complimentary surprise</span> with your meal!
              </p>
            </div>
            
            {/* Decorative element */}
            <div className="absolute -right-4 -bottom-4 opacity-20 pointer-events-none" style={{ color: "#ffffff" }}>
              <Gift size={100} strokeWidth={1.5} />
            </div>
          </div>
        </section>

        {/* ── CUISINE FILTERS ─────────────────────────────── */}
        <section>
          <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1">
            {CUISINES.map((c) => {
              const active = activeCuisine === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveCuisine(c.id)}
                  className="flex flex-col items-center gap-1.5 min-w-[64px]"
                >
                  <div
                    className="w-14 h-14 flex items-center justify-center text-2xl transition-all"
                    style={{
                      borderRadius: "var(--radius-xl)",
                      background: active ? "var(--color-primary)" : "var(--color-surface-container-lowest)",
                      boxShadow: active ? "var(--shadow-primary)" : "var(--shadow-sm)",
                    }}
                  >
                    {c.emoji}
                  </div>
                  <span
                    className="text-xs font-semibold whitespace-nowrap"
                    style={{ color: active ? "var(--color-primary)" : "var(--color-on-surface-variant)" }}
                  >
                    {c.label}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* ── POPULAR DISHES ───────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2
              className="section-heading flex items-center gap-1.5"
              style={{ color: "var(--color-on-surface)" }}
            >
              <Flame size={18} style={{ color: "var(--color-primary)" }} />
              Popular Dishes
            </h2>
            <Link
              href="/search?filter=popular"
              className="text-xs font-semibold flex items-center gap-0.5"
              style={{ color: "var(--color-primary)" }}
            >
              See all <ChevronRight size={14} />
            </Link>
          </div>

          <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
            {TOP_DISHES.map((dish) => (
              <div
                key={dish.id}
                className="shrink-0 group cursor-pointer overflow-hidden"
                style={{
                  width: 148,
                  background: "var(--color-surface-container-lowest)",
                  borderRadius: "var(--radius-xl)",
                  boxShadow: "var(--shadow-md)",
                }}
              >
                <div className="relative w-full h-24 overflow-hidden" style={{ borderRadius: "var(--radius-xl) var(--radius-xl) 0 0" }}>
                  <Image
                    src={dish.image}
                    alt={dish.name}
                    fill
                    sizes="148px"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-2.5">
                  <p
                    className="font-bold text-xs leading-tight line-clamp-1 mb-0.5"
                    style={{ fontFamily: "var(--font-heading)", color: "var(--color-on-surface)" }}
                  >
                    {dish.name}
                  </p>
                  <p className="text-[11px] mb-1.5" style={{ color: "var(--color-on-surface-variant)" }}>
                    {dish.restaurant}
                  </p>
                  <span
                    className="font-extrabold text-sm tabular-nums"
                    style={{ color: "var(--color-primary)" }}
                  >
                    ₹{dish.price}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── RESTAURANTS / MENU GRID ──────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="section-heading" style={{ color: "var(--color-on-surface)" }}>
              {activeCuisine === "all" ? (
                <><TrendingUp size={18} className="inline mr-1.5" style={{ color: "var(--color-primary)" }} />All Restaurants</>
              ) : (
                <><Flame size={18} className="inline mr-1.5" style={{ color: "var(--color-primary)" }} />{CUISINES.find((c) => c.id === activeCuisine)?.label} Menu</>
              )}
            </h2>
          </div>

          {activeCuisine === "all" ? (
            <>
              {isResLoading && <RestaurantGridSkeleton />}
              {isResError && (
                <div className="text-center py-14">
                  <p className="text-4xl mb-2">😕</p>
                  <p className="font-semibold text-sm" style={{ color: "var(--color-on-surface)" }}>Could not load restaurants</p>
                  <p className="text-xs mt-1" style={{ color: "var(--color-on-surface-variant)" }}>Check your connection and try again</p>
                </div>
              )}
              {restaurants && restaurants.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {restaurants.map((r) => (
                    <RestaurantCard
                      key={r.id}
                      r={{
                        id: r.id, slug: r.slug, name: r.name,
                        cuisine: r.cuisine, rating: r.rating,
                        deliveryTime: 0, deliveryFee: r.deliveryFee,
                        minOrder: 0, image: r.imageUrl, isOpen: r.isOpen,
                        isVeg: r.isVeg, discount: undefined,
                      }}
                    />
                  ))}
                </div>
              )}
              {restaurants && restaurants.length === 0 && (
                <div className="text-center py-14">
                  <p className="text-4xl mb-2">🍽️</p>
                  <p className="font-semibold text-sm" style={{ color: "var(--color-on-surface)" }}>No restaurants open right now</p>
                </div>
              )}
              <div className="text-center mt-6">
                <Link
                  href="/search"
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold"
                  style={{
                    border: "2px solid var(--color-primary)",
                    color: "var(--color-primary)",
                    borderRadius: "var(--radius-full)",
                    background: "var(--color-surface-container-lowest)",
                  }}
                >
                  See all restaurants <ChevronRight size={14} />
                </Link>
              </div>
            </>
          ) : (
            <div
              style={{
                background: "var(--color-surface-container-lowest)",
                borderRadius: "var(--radius-xl)",
                boxShadow: "var(--shadow-sm)",
                padding: "0 1rem",
              }}
            >
              {isMenuLoading ? (
                <div className="space-y-4 py-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-20 animate-pulse"
                      style={{ background: "var(--color-surface-container)", borderRadius: "var(--radius-md)" }}
                    />
                  ))}
                </div>
              ) : menuItems && menuItems.length > 0 ? (
                <div>
                  {menuItems.map((item) => {
                    const rName = restaurants?.find((r) => r.id === item.restaurantId)?.name || "VIT Bites";
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
                  <p className="text-4xl mb-2">🍽️</p>
                  <p className="font-semibold text-sm" style={{ color: "var(--color-on-surface)" }}>No items in this category</p>
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      {/* ── FOOTER ────────────────────────────────────────── */}
      <footer
        className="px-4 py-6 mt-4"
        style={{
          background: "var(--color-surface-container)",
        }}
      >
        <div className="flex items-center justify-between gap-3 text-xs" style={{ color: "var(--color-on-surface-variant)" }}>
          <span className="font-bold" style={{ fontFamily: "var(--font-heading)", color: "var(--color-on-surface)" }}>
            VIT-AP Eats
          </span>
          <span>© 2026 · Made on campus ❤️</span>
          <div className="flex flex-wrap items-center gap-3">
            <a href="tel:+919034537165" className="hover:underline" style={{ color: "var(--color-primary)" }}>Call: +91 90345 37165</a>
            <Link href="/partner/apply" className="hover:underline" style={{ color: "var(--color-primary)" }}>Partner</Link>
            <Link href="/admin" className="hover:underline" style={{ color: "var(--color-primary)" }}>Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
