"use client";
import { useState } from "react";
import Image from "next/image";
import { Star, Bike, Heart, ChevronLeft, Info } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { useCartStore } from "@/lib/store/cart";
import { useRestaurant } from "@/lib/hooks";
import { rupees, cn } from "@/lib/utils";
import Link from "next/link";
import { use } from "react";
import { DishCard } from "@/components/customer/DishCard";

export default function RestaurantPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data, isLoading, isError } = useRestaurant(slug);
  const [activeSection, setActiveSection] = useState<string>("");
  const { count, total, clear } = useCartStore();
  const cartCount = count();
  const cartTotal = total();
  const [conflict, setConflict] = useState<{ name: string; retry: () => void } | null>(null);

  const handleConflict = (conflictName: string, retry: () => void) => setConflict({ name: conflictName, retry });
  const confirmClearAndAdd = () => {
    clear();
    conflict?.retry();
    setConflict(null);
  };

  if (isLoading) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 md:px-10 py-6 space-y-4">
        <Skeleton className="w-full h-64 rounded-[--radius-lg]" />
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="text-center py-20">
        <p className="text-5xl mb-3">😕</p>
        <p className="font-semibold text-[--color-on-surface]">Restaurant not found</p>
        <Link href="/" className="mt-4 inline-block text-[--color-primary] font-semibold hover:underline">← Back to Home</Link>
      </div>
    );
  }

  const restaurant = data;
  const menuSections = Object.entries<Record<string, any>>(restaurant.menu ?? {}).sort(([a], [b]) => a.localeCompare(b));
  const currentSection = menuSections.some(([cat]) => cat === activeSection)
    ? activeSection
    : menuSections[0]?.[0] ?? "";
  const visibleSections = menuSections.filter(([cat]) => cat === currentSection);

  return (
    <div className="min-h-screen">
      <div className="relative w-full h-48 md:h-64 overflow-hidden">
        {restaurant.imageUrl && (
          <Image src={restaurant.imageUrl} alt={restaurant.name} fill sizes="100vw" className="object-cover" priority />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <Link href="/" className="absolute top-4 left-4 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors">
          <ChevronLeft size={20} />
        </Link>
        <button className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors">
          <Heart size={18} />
        </button>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 md:px-10">
        <div className="py-4 border-b border-[--color-border]">
          <h1 className="text-2xl font-extrabold text-[--color-on-surface] mb-1" style={{ fontFamily: "var(--font-heading)" }}>{restaurant.name}</h1>
          <p className="text-sm text-[--color-on-surface-variant] mb-3">{restaurant.cuisine} · VIT-AP Campus</p>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="flex items-center gap-1.5 font-semibold" style={{ color: "var(--color-tertiary)" }}>
              <Star size={14} fill="currentColor" />{restaurant.rating}
            </span>
            <span className="flex items-center gap-1.5 text-[--color-on-surface-variant]">
              <Bike size={14} />{restaurant.deliveryFee === 0 ? "Free delivery" : rupees(restaurant.deliveryFee)}
            </span>
            <span className="flex items-center gap-1.5 text-[--color-on-surface-variant]"><Info size={14} />Receive by Evening</span>
          </div>
        </div>

        <div className="flex gap-8 mt-4">
          <aside className="hidden md:block w-48 shrink-0">
            <nav className="sticky top-20 space-y-1">
              {menuSections.map(([cat]) => (
                <button key={cat} onClick={() => setActiveSection(cat)}
                  className={cn("w-full text-left px-3 py-2 rounded-[--radius-md] text-sm font-medium transition-colors",
                    currentSection === cat ? "text-white" : "text-[--color-on-surface-variant] hover:bg-[--color-surface-container-low]")}
                  style={currentSection === cat ? { background: "var(--color-primary)" } : {}}>
                  {cat}
                  <span className="float-right text-xs opacity-60">{(restaurant.menu[cat] as any[]).length}</span>
                </button>
              ))}
            </nav>
          </aside>

          <div className="flex-1 min-w-0 pb-32">
            <div className="md:hidden flex gap-2 overflow-x-auto hide-scrollbar pb-2 mb-4 -mx-4 px-4">
              {menuSections.map(([cat]) => (
                <button key={cat} onClick={() => setActiveSection(cat)}
                  className={cn("shrink-0 px-4 py-1.5 rounded-[--radius-full] text-sm font-semibold border transition-all",
                    currentSection === cat ? "text-white border-[--color-primary]" : "border-[--color-border] text-[--color-on-surface-variant] bg-[--color-surface-container-lowest]")}
                  style={currentSection === cat ? { background: "var(--color-primary)" } : {}}>
                  {cat}
                </button>
              ))}
            </div>

            {visibleSections.map(([cat, items]) => (
              <div key={cat} className="block">
                <h2 className="text-lg font-bold text-[--color-on-surface] mb-2 mt-4 first:mt-0" style={{ fontFamily: "var(--font-heading)" }}>{cat}</h2>
                {items.map((dish: any) => (
                  <DishCard key={dish.id} dish={dish} restaurantId={restaurant.id} restaurantName={restaurant.name} onConflict={handleConflict} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {conflict && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[--color-surface-container-lowest] w-full max-w-sm rounded-[--radius-lg] shadow-[--shadow-xl] p-6 border border-[--color-border]">
            <h3 className="text-lg font-bold text-[--color-on-surface] mb-2" style={{ fontFamily: "var(--font-heading)" }}>
              Start a new cart?
            </h3>
            <p className="text-sm text-[--color-on-surface-variant] mb-6">
              Your cart already has items from <strong>{conflict.name}</strong>. Adding this item will clear your current cart.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConflict(null)} className="flex-1 py-2.5 rounded-[--radius-md] border border-[--color-border] font-semibold text-sm text-[--color-on-surface] hover:bg-[--color-surface-container-low]">
                Keep cart
              </button>
              <button onClick={confirmClearAndAdd} className="flex-1 py-2.5 rounded-[--radius-md] text-white font-bold text-sm hover:opacity-90" style={{ background: "var(--color-error, #d32f2f)" }}>
                Clear & add
              </button>
            </div>
          </div>
        </div>
      )}

      {cartCount > 0 && (
        <div className="fixed bottom-0 md:bottom-4 inset-x-0 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-auto z-50 px-0 md:px-4">
          <Link href="/cart" className="flex items-center justify-between w-full md:w-auto md:min-w-80 px-4 py-3 text-white shadow-[--shadow-xl]"
            style={{ background: "var(--color-primary)", borderRadius: "var(--radius-lg) var(--radius-lg) 0 0" }}>
            <span className="font-bold text-sm bg-white/20 px-2 py-0.5 rounded">{cartCount} item{cartCount > 1 ? "s" : ""}</span>
            <span className="font-bold">View Cart</span>
            <span className="font-bold tabular-nums">{rupees(cartTotal)}</span>
          </Link>
        </div>
      )}
    </div>
  );
}