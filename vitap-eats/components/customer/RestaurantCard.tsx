import Link from "next/link";
import Image from "next/image";
import { Star, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFavorites, useAddFavorite, useRemoveFavorite } from "@/lib/hooks";

export interface Restaurant {
  id: string;
  slug: string;
  name: string;
  cuisine: string;
  rating: number;
  deliveryTime: number;
  deliveryFee: number;
  minOrder: number;
  image: string;
  isVeg?: boolean;
  isOpen: boolean;
  promoted?: boolean;
  discount?: string;
  distance_meters?: number;
}

export default function RestaurantCard({ r }: { r: Restaurant }) {
  const { data: favorites = [] } = useFavorites();
  const { mutate: addFavorite } = useAddFavorite();
  const { mutate: removeFavorite } = useRemoveFavorite();

  const isFavorited = favorites.some(
    (f: { restaurant_id: string }) => f.restaurant_id === r.id
  );

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    isFavorited ? removeFavorite(r.id) : addFavorite(r.id);
  };

  return (
    <Link
      href={`/restaurant/${r.slug}`}
      className="group block overflow-hidden"
      style={{
        background: "var(--color-surface-container-lowest)",
        borderRadius: "var(--radius-xl)",
        boxShadow: "var(--shadow-md)",
      }}
    >
      {/* ── Food thumbnail ── */}
      <div className="relative w-full aspect-[4/3] overflow-hidden" style={{ borderRadius: "var(--radius-xl) var(--radius-xl) 0 0" }}>
        <Image
          src={r.image || "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80"}
          alt={r.name}
          fill
          sizes="(max-width: 480px) 100vw, 50vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Closed overlay — fully opaque dark */}
        {!r.isOpen && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: "var(--color-primary-dark)", opacity: 0.85 }}
          >
            <span
              className="font-bold text-lg tracking-widest uppercase"
              style={{ color: "var(--color-on-primary)", fontFamily: "var(--font-heading)" }}
            >
              Closed
            </span>
          </div>
        )}

        {/* Promo badge */}
        {r.discount && (
          <span
            className="absolute top-3 left-3 text-[11px] font-bold px-2.5 py-1 tracking-wide uppercase"
            style={{
              background: "var(--color-primary)",
              color: "var(--color-on-primary)",
              borderRadius: "var(--radius-full)",
            }}
          >
            {r.discount}
          </span>
        )}

        {/* Veg dot */}
        {r.isVeg && (
          <span
            className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center"
            style={{
              background: "var(--color-surface-container-lowest)",
              borderRadius: "var(--radius-full)",
              border: "1.5px solid var(--color-border)",
            }}
          >
            <span className="w-3 h-3 rounded-full bg-green-600" />
          </span>
        )}

        {/* Favourite (fully opaque cream bg) */}
        <button
          onClick={handleFavoriteClick}
          aria-label="Toggle favourite"
          className="absolute bottom-3 right-3 w-8 h-8 flex items-center justify-center"
          style={{
            background: "var(--color-surface-container-lowest)",
            borderRadius: "var(--radius-full)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <svg
            viewBox="0 0 24 24"
            className="w-4 h-4"
            fill={isFavorited ? "var(--color-primary)" : "none"}
            stroke={isFavorited ? "var(--color-primary)" : "var(--color-on-surface-variant)"}
            strokeWidth={2}
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>

      {/* ── Info ── */}
      <div className="px-4 py-3">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3
            className="font-extrabold text-base leading-tight line-clamp-1 flex-1"
            style={{ fontFamily: "var(--font-heading)", color: "var(--color-on-surface)" }}
          >
            {r.name}
          </h3>
          {/* Rating pill */}
          <span
            className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 shrink-0"
            style={{
              background: "var(--color-primary)",
              color: "var(--color-on-primary)",
              borderRadius: "var(--radius-full)",
            }}
          >
            <Star size={10} fill="currentColor" />
            {r.rating.toFixed(1)}
          </span>
        </div>

        <p
          className="text-xs line-clamp-1 mb-2"
          style={{ color: "var(--color-on-surface-variant)" }}
        >
          {r.cuisine}
        </p>

        {/* Bottom row */}
        <div
          className="flex items-center gap-2 text-xs font-medium pt-2"
          style={{ color: "var(--color-on-surface-variant)" }}
        >
          <span
            className="flex items-center gap-1 px-2 py-0.5"
            style={{
              background: "var(--color-surface-container)",
              borderRadius: "var(--radius-full)",
            }}
          >
            <Package size={11} />
            Main Gate
          </span>
          <span
            className="flex items-center gap-1 px-2 py-0.5"
            style={{
              background: "var(--color-surface-container)",
              borderRadius: "var(--radius-full)",
            }}
          >
            🕔 By Evening
          </span>
          {r.deliveryFee === 0 && (
            <span
              className="ml-auto font-semibold"
              style={{ color: "var(--color-success)" }}
            >
              Free
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
