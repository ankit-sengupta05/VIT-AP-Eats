"use client";
import { useState, useCallback } from "react";
import { Search, SlidersHorizontal, X, Star, Clock, ChevronDown } from "lucide-react";
import RestaurantCard, { type Restaurant } from "@/components/customer/RestaurantCard";
import { debounce, cn } from "@/lib/utils";

const ALL_RESTAURANTS: Restaurant[] = [
  { id: "1", slug: "spice-garden", name: "Spice Garden", cuisine: ["North Indian", "Biryani"], rating: 4.5, deliveryTime: 28, deliveryFee: 0, minOrder: 150, image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80", isOpen: true, promoted: true, discount: "50% OFF up to ₹100" },
  { id: "2", slug: "pizza-palace", name: "Pizza Palace", cuisine: ["Pizza", "Italian"], rating: 4.3, deliveryTime: 35, deliveryFee: 30, minOrder: 200, image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80", isOpen: true },
  { id: "3", slug: "campus-tiffins", name: "Campus Tiffins", cuisine: ["South Indian", "Tiffin"], rating: 4.7, deliveryTime: 20, deliveryFee: 0, minOrder: 80, image: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=600&q=80", isOpen: true, isVeg: true },
  { id: "4", slug: "wok-express", name: "Wok Express", cuisine: ["Chinese", "Asian"], rating: 4.2, deliveryTime: 40, deliveryFee: 20, minOrder: 150, image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&q=80", isOpen: true },
  { id: "5", slug: "burger-barn", name: "Burger Barn", cuisine: ["Burgers", "Sandwiches"], rating: 4.4, deliveryTime: 30, deliveryFee: 0, minOrder: 120, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80", isOpen: true },
  { id: "6", slug: "green-bowl", name: "Green Bowl", cuisine: ["Healthy", "Salads"], rating: 4.6, deliveryTime: 25, deliveryFee: 0, minOrder: 100, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80", isOpen: true, isVeg: true },
];

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "rating",    label: "Rating"    },
  { value: "time",      label: "Delivery time" },
  { value: "fee",       label: "Delivery fee" },
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("relevance");
  const [vegOnly, setVegOnly] = useState(false);
  const [maxTime, setMaxTime] = useState<number | null>(null);

  // Debounced filter — no re-render spam on every keystroke
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleInput = useCallback(debounce((v: string) => setQuery(v), 300), []);

  const filtered = ALL_RESTAURANTS
    .filter((r) => {
      if (vegOnly && !r.isVeg) return false;
      if (maxTime && r.deliveryTime > maxTime) return false;
      if (!query) return true;
      const q = query.toLowerCase();
      return r.name.toLowerCase().includes(q) || r.cuisine.some((c) => c.toLowerCase().includes(q));
    })
    .sort((a, b) => {
      if (sort === "rating") return b.rating - a.rating;
      if (sort === "time")   return a.deliveryTime - b.deliveryTime;
      if (sort === "fee")    return a.deliveryFee - b.deliveryFee;
      return 0;
    });

  return (
    <div className="max-w-[1280px] mx-auto px-4 md:px-10 py-6">
      {/* Search input */}
      <div className="relative mb-4">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[--color-on-surface-variant]" />
        <input
          type="search"
          placeholder="Search restaurants, cuisines, dishes…"
          onChange={(e) => handleInput(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface-container-lowest] text-[--color-on-surface] placeholder:text-[--color-text-secondary] focus:outline-none focus:border-[--color-primary] focus:ring-1 focus:ring-[--color-primary] transition-all text-sm"
        />
      </div>

      {/* Filters bar */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-6 pb-1">
        {/* Sort */}
        <div className="relative shrink-0">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="appearance-none pl-3 pr-8 py-1.5 rounded-[--radius-full] border border-[--color-border] bg-[--color-surface-container-lowest] text-sm font-medium text-[--color-on-surface] focus:outline-none cursor-pointer"
          >
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[--color-on-surface-variant]" />
        </div>

        {/* Veg only */}
        <button
          onClick={() => setVegOnly((v) => !v)}
          className={cn(
            "shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-[--radius-full] border text-sm font-medium transition-all",
            vegOnly ? "border-green-600 bg-green-50 text-green-700" : "border-[--color-border] text-[--color-on-surface-variant] bg-[--color-surface-container-lowest]"
          )}
        >
          <span className="w-3 h-3 rounded-sm border-2 border-green-600 flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-green-600" />
          </span>
          Veg Only
          {vegOnly && <X size={12} />}
        </button>

        {/* Delivery time chips */}
        {[30, 45].map((t) => (
          <button
            key={t}
            onClick={() => setMaxTime((prev) => prev === t ? null : t)}
            className={cn(
              "shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-[--radius-full] border text-sm font-medium transition-all",
              maxTime === t ? "text-white border-[--color-primary]" : "border-[--color-border] text-[--color-on-surface-variant] bg-[--color-surface-container-lowest]"
            )}
            style={maxTime === t ? { background: "var(--color-primary)" } : {}}
          >
            <Clock size={12} />Under {t} min
          </button>
        ))}
      </div>

      {/* Results count */}
      <p className="text-sm text-[--color-on-surface-variant] mb-4">
        {filtered.length} restaurant{filtered.length !== 1 ? "s" : ""}{query ? ` for "${query}"` : " near you"}
      </p>

      {/* Results grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filtered.map((r) => <RestaurantCard key={r.id} r={r} />)}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🍽️</div>
          <h3 className="text-lg font-bold text-[--color-on-surface] mb-2" style={{ fontFamily: "var(--font-heading)" }}>No results found</h3>
          <p className="text-[--color-on-surface-variant] text-sm">Try different keywords or remove filters</p>
        </div>
      )}
    </div>
  );
}
