import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Search, MapPin, ChevronRight, Flame, Star, TrendingUp, Clock, Zap } from "lucide-react";
import RestaurantCard, { type Restaurant } from "@/components/customer/RestaurantCard";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = {
  title: "Home",
  description: "Order food from the best restaurants near VIT-AP campus",
};

/* ─── Static seed data (replace with Supabase fetch) ─────────────────────── */
const CUISINES = [
  { id: "all",       label: "All",        emoji: "🍽️" },
  { id: "biryani",   label: "Biryani",    emoji: "🍛" },
  { id: "pizza",     label: "Pizza",      emoji: "🍕" },
  { id: "burgers",   label: "Burgers",    emoji: "🍔" },
  { id: "south",     label: "South",      emoji: "🥘" },
  { id: "chinese",   label: "Chinese",    emoji: "🥡" },
  { id: "desserts",  label: "Desserts",   emoji: "🍦" },
  { id: "healthy",   label: "Healthy",    emoji: "🥗" },
  { id: "tea",       label: "Tea & More", emoji: "☕" },
];

const RESTAURANTS: Restaurant[] = [
  {
    id: "1", slug: "spice-garden", name: "Spice Garden", cuisine: ["North Indian", "Biryani"],
    rating: 4.5, deliveryTime: 28, deliveryFee: 0, minOrder: 150,
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80",
    isOpen: true, promoted: true, discount: "50% OFF up to ₹100",
  },
  {
    id: "2", slug: "pizza-palace", name: "Pizza Palace", cuisine: ["Pizza", "Italian", "Pastas"],
    rating: 4.3, deliveryTime: 35, deliveryFee: 30, minOrder: 200,
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80",
    isOpen: true, discount: "Buy 1 Get 1",
  },
  {
    id: "3", slug: "campus-tiffins", name: "Campus Tiffins", cuisine: ["South Indian", "Tiffin"],
    rating: 4.7, deliveryTime: 20, deliveryFee: 0, minOrder: 80,
    image: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=600&q=80",
    isOpen: true, isVeg: true,
  },
  {
    id: "4", slug: "wok-express", name: "Wok Express", cuisine: ["Chinese", "Asian"],
    rating: 4.2, deliveryTime: 40, deliveryFee: 20, minOrder: 150,
    image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&q=80",
    isOpen: true,
  },
  {
    id: "5", slug: "burger-barn", name: "Burger Barn", cuisine: ["Burgers", "Sandwiches", "Fries"],
    rating: 4.4, deliveryTime: 30, deliveryFee: 0, minOrder: 120,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80",
    isOpen: true, promoted: true,
  },
  {
    id: "6", slug: "green-bowl", name: "Green Bowl", cuisine: ["Healthy", "Salads", "Wraps"],
    rating: 4.6, deliveryTime: 25, deliveryFee: 0, minOrder: 100,
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80",
    isOpen: true, isVeg: true, discount: "10% OFF first order",
  },
];

const TOP_DISHES = [
  { id: "d1", name: "Chicken Biryani",   price: 149, restaurant: "Spice Garden",  image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&q=80", rating: 4.8 },
  { id: "d2", name: "Veg Thali",         price: 89,  restaurant: "Campus Tiffins",image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&q=80", rating: 4.7 },
  { id: "d3", name: "Margherita Pizza",  price: 199, restaurant: "Pizza Palace",  image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80", rating: 4.5 },
  { id: "d4", name: "Paneer Butter Masala", price: 169, restaurant: "Spice Garden", image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&q=80", rating: 4.6 },
];

/* ─── Page ────────────────────────────────────────────────────────────────── */
export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* ── Hero Section ── */}
      <section
        className="relative overflow-hidden py-12 md:py-20"
        style={{ background: "linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary) 60%, #ff8c42 100%)" }}
      >
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-10 bg-white translate-x-16 -translate-y-16" />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-10 bg-white -translate-x-8 translate-y-8" />

        <div className="relative max-w-[1280px] mx-auto px-4 md:px-10">
          <div className="max-w-xl">
            {/* Location pill */}
            <div className="inline-flex items-center gap-1.5 bg-white/20 text-white text-sm px-3 py-1.5 rounded-[--radius-full] mb-4 backdrop-blur-sm">
              <MapPin size={14} />
              <span>VIT-AP Campus, Amaravati</span>
              <ChevronRight size={14} className="opacity-70" />
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-3 leading-tight" style={{ fontFamily: "var(--font-heading)" }}>
              Hungry? <br className="sm:hidden" />
              <span className="opacity-90">We deliver</span>{" "}
              <span className="underline decoration-white/40">fast.</span>
            </h1>
            <p className="text-white/80 text-base md:text-lg mb-6">
              Food from the best campus restaurants in 20–40 min.
            </p>

            {/* Search bar */}
            <Link
              href="/search"
              className="flex items-center gap-3 bg-white rounded-[--radius-lg] px-4 py-3.5 shadow-[--shadow-lg] hover:shadow-[--shadow-xl] transition-shadow max-w-lg"
            >
              <Search size={18} className="shrink-0" style={{ color: "var(--color-primary)" }} />
              <span className="text-[--color-text-secondary] text-sm flex-1">Search for restaurants, dishes...</span>
              <span
                className="text-xs text-white font-semibold px-3 py-1 rounded-[--radius-full] shrink-0"
                style={{ background: "var(--color-primary)" }}
              >
                Search
              </span>
            </Link>

            {/* Quick stats */}
            <div className="flex gap-6 mt-6">
              {[
                { icon: Zap, value: "20 min", label: "Avg. delivery" },
                { icon: Star, value: "4.6★",  label: "Avg. rating" },
                { icon: Flame, value: "50+",  label: "Restaurants" },
              ].map(({ icon: Icon, value, label }) => (
                <div key={label} className="text-white">
                  <div className="flex items-center gap-1.5 font-bold text-lg">
                    <Icon size={16} className="opacity-80" />
                    {value}
                  </div>
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
                className="flex flex-col items-center gap-1.5 min-w-[64px] group cursor-pointer"
              >
                <div className="w-14 h-14 rounded-[--radius-lg] bg-[--color-surface-container-lowest] shadow-[--shadow-md] flex items-center justify-center text-2xl group-hover:shadow-[--shadow-lg] group-hover:scale-105 transition-all border border-[--color-border]">
                  {c.emoji}
                </div>
                <span className="text-xs text-[--color-on-surface-variant] font-medium group-hover:text-[--color-primary] transition-colors whitespace-nowrap">
                  {c.label}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* ── Top Dishes (horizontal scroll) ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[--color-on-surface]" style={{ fontFamily: "var(--font-heading)" }}>
              <Flame size={20} className="inline mr-2 text-[--color-primary]" />
              Popular Dishes
            </h2>
            <Link href="/search?filter=popular" className="text-sm font-semibold flex items-center gap-1" style={{ color: "var(--color-primary)" }}>
              View all <ChevronRight size={16} />
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
            {TOP_DISHES.map((dish) => (
              <div
                key={dish.id}
                className="min-w-[160px] bg-[--color-surface-container-lowest] rounded-[--radius-lg] overflow-hidden shadow-[--shadow-md] hover:shadow-[--shadow-lg] transition-shadow cursor-pointer group"
              >
                <div className="relative w-full h-28 overflow-hidden">
                  <Image src={dish.image} alt={dish.name} fill sizes="200px" className="object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="p-2.5">
                  <p className="font-semibold text-sm text-[--color-on-surface] line-clamp-1">{dish.name}</p>
                  <p className="text-xs text-[--color-on-surface-variant] mb-1 line-clamp-1">{dish.restaurant}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm tabular-nums" style={{ color: "var(--color-primary)" }}>₹{dish.price}</span>
                    <span className="flex items-center gap-0.5 text-xs font-medium text-[--color-tertiary]">
                      <Star size={10} fill="currentColor" />{dish.rating}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Offers Banner ── */}
        <section>
          <div
            className="rounded-[--radius-lg] p-5 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 overflow-hidden relative"
            style={{ background: "linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary) 100%)" }}
          >
            <div className="absolute right-0 top-0 w-40 h-40 rounded-full bg-white/10 translate-x-10 -translate-y-10" />
            <div>
              <Badge variant="warning" className="mb-2">Limited Time</Badge>
              <h3 className="text-xl md:text-2xl font-extrabold text-white mb-1" style={{ fontFamily: "var(--font-heading)" }}>
                First order? Get 50% OFF
              </h3>
              <p className="text-white/70 text-sm">Use code <strong className="text-white">VITAP50</strong> · Max discount ₹100</p>
            </div>
            <Link
              href="/search"
              className="shrink-0 bg-white font-bold text-sm px-5 py-2.5 rounded-[--radius-full] hover:shadow-[--shadow-lg] transition-shadow"
              style={{ color: "var(--color-primary)" }}
            >
              Order Now
            </Link>
          </div>
        </section>

        {/* ── All Restaurants ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[--color-on-surface]" style={{ fontFamily: "var(--font-heading)" }}>
              <TrendingUp size={20} className="inline mr-2 text-[--color-primary]" />
              Restaurants Near You
            </h2>
            <span className="text-xs text-[--color-on-surface-variant] flex items-center gap-1">
              <Clock size={12} /> Sorted by delivery time
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {RESTAURANTS.map((r) => (
              <RestaurantCard key={r.id} r={r} />
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              href="/search"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-[--radius-full] border-2 font-semibold text-sm transition-colors hover:bg-[--color-primary] hover:text-white hover:border-[--color-primary]"
              style={{ borderColor: "var(--color-primary)", color: "var(--color-primary)" }}
            >
              See all restaurants <ChevronRight size={16} />
            </Link>
          </div>
        </section>

      </div>

      {/* ── Footer ── */}
      <footer className="border-t border-[--color-border] bg-[--color-surface-container-lowest] mt-10">
        <div className="max-w-[1280px] mx-auto px-4 md:px-10 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[--color-on-surface-variant]">
          <div className="flex items-center gap-2 font-bold text-[--color-on-surface]" style={{ fontFamily: "var(--font-heading)" }}>
            <span className="w-7 h-7 rounded-[--radius-md] flex items-center justify-center text-white text-xs font-bold" style={{ background: "var(--color-primary)" }}>VE</span>
            VIT-AP Eats
          </div>
          <p>© 2026 VIT-AP Eats · Made with ❤️ on campus</p>
          <div className="flex gap-4">
            <Link href="/partner" className="hover:text-[--color-primary] transition-colors">Partner with us</Link>
            <Link href="/admin" className="hover:text-[--color-primary] transition-colors">Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
