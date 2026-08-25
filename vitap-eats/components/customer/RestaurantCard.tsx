import Link from "next/link";
import Image from "next/image";
import { Star, Clock, Bike, Heart, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { rupees, cn } from "@/lib/utils";
import { useFavorites, useAddFavorite, useRemoveFavorite } from "@/lib/hooks";

export interface Restaurant {
  id: string;
  slug: string;
  name: string;
  cuisine: string[];
  rating: number;
  deliveryTime: number;        // minutes
  deliveryFee: number;         // 0 = free
  minOrder: number;
  image: string;
  isVeg?: boolean;
  isOpen: boolean;
  promoted?: boolean;
  discount?: string;           // e.g. "50% OFF up to ₹100"
  distance_meters?: number;    // From PostGIS
}

export default function RestaurantCard({ r }: { r: Restaurant }) {
  const { data: favorites = [] } = useFavorites();
  const { mutate: addFavorite } = useAddFavorite();
  const { mutate: removeFavorite } = useRemoveFavorite();

  const isFavorited = favorites.some((f: any) => f.restaurant_id === r.id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isFavorited) {
      removeFavorite(r.id);
    } else {
      addFavorite(r.id);
    }
  };

  return (
    <Link
      href={`/restaurant/${r.slug}`}
      className="group block bg-[--color-surface-container-lowest] rounded-[--radius-lg] overflow-hidden shadow-[--shadow-md] hover:shadow-[--shadow-lg] transition-shadow"
    >
      {/* Thumbnail */}
      <div className="relative w-full aspect-[16/9] overflow-hidden">
        <Image
          src={r.image}
          alt={r.name}
          fill
          sizes="(max-width:768px) 100vw, (max-width:1280px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Overlay badges */}
        <div className="absolute top-2 left-2 flex gap-1.5 flex-wrap z-10">
          {r.promoted && (
            <span className="bg-[--color-primary] text-white text-[10px] font-bold px-2 py-0.5 rounded-[--radius-full] uppercase tracking-wide shadow-sm">
              Promoted
            </span>
          )}
          {r.discount && (
            <span className="bg-[--color-inverse-surface] text-[--color-inverse-on-surface] text-[10px] font-semibold px-2 py-0.5 rounded-[--radius-full] shadow-sm">
              {r.discount}
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-2 right-2 z-20 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm shadow-sm flex items-center justify-center hover:bg-white transition-colors"
        >
          <Heart size={16} className={cn("transition-colors", isFavorited ? "fill-red-500 text-red-500" : "text-gray-600")} />
        </button>

        {/* Closed overlay */}
        {!r.isOpen && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
            <span className="text-white font-bold text-lg">Closed</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-[--color-on-surface] leading-tight line-clamp-1" style={{ fontFamily: "var(--font-heading)" }}>
            {r.name}
          </h3>
          {r.isVeg && <Badge variant="veg">Veg</Badge>}
        </div>

        <p className="text-[--color-on-surface-variant] text-xs mb-2 line-clamp-1">
          {r.cuisine.join(" · ")}
        </p>

        {/* Stats row */}
        <div className="flex items-center gap-3 text-xs text-[--color-on-surface-variant]">
          <span className="flex items-center gap-1 text-[--color-tertiary] font-semibold">
            <Star size={12} fill="currentColor" />
            {r.rating.toFixed(1)}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {r.deliveryTime} min
          </span>
          <span className="flex items-center gap-1">
            <Bike size={12} />
            {r.deliveryFee === 0 ? "Free delivery" : rupees(r.deliveryFee)}
          </span>
          {r.distance_meters !== undefined && (
            <span className="flex items-center gap-1 ml-auto text-gray-500">
              <MapPin size={12} />
              {(r.distance_meters / 1000).toFixed(1)} km
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
