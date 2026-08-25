import Link from "next/link";
import Image from "next/image";
import { Star, Clock, Bike } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { rupees } from "@/lib/utils";

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
}

export default function RestaurantCard({ r }: { r: Restaurant }) {
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
        <div className="absolute top-2 left-2 flex gap-1.5 flex-wrap">
          {r.promoted && (
            <span className="bg-[--color-primary] text-white text-[10px] font-bold px-2 py-0.5 rounded-[--radius-full] uppercase tracking-wide">
              Promoted
            </span>
          )}
          {r.discount && (
            <span className="bg-[--color-inverse-surface] text-[--color-inverse-on-surface] text-[10px] font-semibold px-2 py-0.5 rounded-[--radius-full]">
              {r.discount}
            </span>
          )}
        </div>
        {/* Closed overlay */}
        {!r.isOpen && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
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
        </div>
      </div>
    </Link>
  );
}
