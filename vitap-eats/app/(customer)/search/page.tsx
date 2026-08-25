"use client";
import { useState, useCallback } from "react";
import { Search, X, Clock, ChevronDown } from "lucide-react";
import RestaurantCard from "@/components/customer/RestaurantCard";
import { RestaurantGridSkeleton } from "@/components/ui/Skeleton";
import { useRestaurants } from "@/lib/hooks";
import { debounce, cn } from "@/lib/utils";

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "rating",    label: "Rating"    },
  { value: "time",      label: "Delivery time" },
  { value: "fee",       label: "Delivery fee" },
];

export default function SearchPage() {
  const [query, setQuery]     = useState("");
  const [sort, setSort]       = useState("relevance");
  const [vegOnly, setVegOnly] = useState(false);
  const [maxTime, setMaxTime] = useState<number | null>(null);

  // Fetch all restaurants — client-side filter on the result
  const { data: restaurants = [], isLoading, isError } = useRestaurants();

  // Debounce the search query state update
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleInput = useCallback(debounce((v: string) => setQuery(v), 300), []);

  const filtered = restaurants
    .filter((r: any) => {
      if (vegOnly && !r.is_veg_only) return false;
      if (maxTime && r.delivery_time_min > maxTime) return false;
      if (!query) return true;
      const q = query.toLowerCase();
      return r.name.toLowerCase().includes(q) || r.cuisine?.some((c: string) => c.toLowerCase().includes(q));
    })
    .sort((a: any, b: any) => {
      if (sort === "rating") return b.rating - a.rating;
      if (sort === "time")   return a.delivery_time_min - b.delivery_time_min;
      if (sort === "fee")    return a.delivery_fee - b.delivery_fee;
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

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-6 pb-1">
        <div className="relative shrink-0">
          <select value={sort} onChange={(e) => setSort(e.target.value)}
            className="appearance-none pl-3 pr-8 py-1.5 rounded-[--radius-full] border border-[--color-border] bg-[--color-surface-container-lowest] text-sm font-medium text-[--color-on-surface] focus:outline-none cursor-pointer">
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[--color-on-surface-variant]" />
        </div>

        <button onClick={() => setVegOnly((v) => !v)}
          className={cn("shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-[--radius-full] border text-sm font-medium transition-all",
            vegOnly ? "border-green-600 bg-green-50 text-green-700" : "border-[--color-border] text-[--color-on-surface-variant] bg-[--color-surface-container-lowest]")}>
          <span className="w-3 h-3 rounded-sm border-2 border-green-600 flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-green-600" />
          </span>
          Veg Only {vegOnly && <X size={12} />}
        </button>

        {[30, 45].map((t) => (
          <button key={t} onClick={() => setMaxTime((prev) => prev === t ? null : t)}
            className={cn("shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-[--radius-full] border text-sm font-medium transition-all",
              maxTime === t ? "text-white border-[--color-primary]" : "border-[--color-border] text-[--color-on-surface-variant] bg-[--color-surface-container-lowest]")}
            style={maxTime === t ? { background: "var(--color-primary)" } : {}}>
            <Clock size={12} />Under {t} min
          </button>
        ))}
      </div>

      {/* State */}
      {isLoading && <RestaurantGridSkeleton />}
      {isError && (
        <div className="text-center py-20">
          <p className="text-5xl mb-3">😕</p>
          <p className="font-semibold text-[--color-on-surface]">Failed to load restaurants</p>
        </div>
      )}

      {!isLoading && !isError && (
        <>
          <p className="text-sm text-[--color-on-surface-variant] mb-4">
            {filtered.length} restaurant{filtered.length !== 1 ? "s" : ""}{query ? ` for "${query}"` : " near you"}
          </p>
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filtered.map((r: any) => (
                <RestaurantCard key={r.id} r={{
                  id: r.id, slug: r.slug, name: r.name, cuisine: r.cuisine,
                  rating: r.rating, deliveryTime: r.delivery_time_min,
                  deliveryFee: r.delivery_fee, minOrder: r.min_order,
                  image: r.image_url, isOpen: r.is_open, isVeg: r.is_veg_only,
                  discount: r.discount_label,
                }} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🍽️</div>
              <h3 className="text-lg font-bold text-[--color-on-surface] mb-2" style={{ fontFamily: "var(--font-heading)" }}>No results found</h3>
              <p className="text-[--color-on-surface-variant] text-sm">Try different keywords or remove filters</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
