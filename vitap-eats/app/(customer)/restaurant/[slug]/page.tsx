"use client";
import { useState } from "react";
import Image from "next/image";
import { Star, Clock, Bike, Plus, Minus, Heart, ChevronLeft, Info } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/lib/store/cart";
import { rupees, cn } from "@/lib/utils";
import Link from "next/link";

interface DishItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  isVeg: boolean;
  popular?: boolean;
  restaurantId: string;
  restaurantName: string;
}

interface MenuSection {
  id: string;
  name: string;
  items: DishItem[];
}

/* ─── Seed data ────────────────────────────────────────────────────────────── */
const RESTAURANT = {
  id: "1", slug: "spice-garden", name: "Spice Garden",
  cuisine: ["North Indian", "Biryani", "Kebabs"],
  rating: 4.5, reviewCount: 1240,
  deliveryTime: 28, deliveryFee: 0, minOrder: 150,
  image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=1200&q=80",
  isOpen: true, address: "Near Main Gate, VIT-AP, Amaravati",
  description: "Authentic North Indian flavours crafted fresh every day. Known for our dum biryani and tandoor kebabs.",
};

const MENU: MenuSection[] = [
  {
    id: "biryanis", name: "Biryanis",
    items: [
      { id: "b1", name: "Chicken Dum Biryani", description: "Slow-cooked with whole spices, served with raita", price: 149, image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&q=80", isVeg: false, popular: true, restaurantId: "1", restaurantName: "Spice Garden" },
      { id: "b2", name: "Veg Biryani", description: "Fragrant basmati with seasonal vegetables & saffron", price: 119, image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&q=80", isVeg: true, restaurantId: "1", restaurantName: "Spice Garden" },
      { id: "b3", name: "Egg Biryani", description: "Fluffy basmati with masala egg curry", price: 129, isVeg: false, restaurantId: "1", restaurantName: "Spice Garden" },
    ],
  },
  {
    id: "mains", name: "Main Course",
    items: [
      { id: "m1", name: "Paneer Butter Masala", description: "Creamy tomato gravy with soft paneer", price: 169, image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&q=80", isVeg: true, popular: true, restaurantId: "1", restaurantName: "Spice Garden" },
      { id: "m2", name: "Chicken Tikka Masala", description: "Chargrilled chicken in rich masala sauce", price: 189, isVeg: false, restaurantId: "1", restaurantName: "Spice Garden" },
      { id: "m3", name: "Dal Tadka", description: "Yellow lentils tempered with cumin & garlic", price: 99, isVeg: true, restaurantId: "1", restaurantName: "Spice Garden" },
    ],
  },
  {
    id: "breads", name: "Breads",
    items: [
      { id: "br1", name: "Butter Naan", description: "Tandoor-baked, brushed with butter", price: 29, isVeg: true, restaurantId: "1", restaurantName: "Spice Garden" },
      { id: "br2", name: "Parotta", description: "Flaky layered flatbread", price: 25, isVeg: true, restaurantId: "1", restaurantName: "Spice Garden" },
    ],
  },
];

/* ─── Dish card with add/stepper ─────────────────────────────────────────── */
function DishCard({ dish }: { dish: DishItem }) {
  const { items, add, update } = useCartStore();
  const cartItem = items.find((i) => i.id === dish.id);
  const qty = cartItem?.quantity ?? 0;

  return (
    <div className="flex gap-3 py-4 border-b border-[--color-border] last:border-0">
      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1">
          <span className={cn("w-3.5 h-3.5 rounded-sm border-2 flex items-center justify-center", dish.isVeg ? "border-green-600" : "border-red-500")}>
            <span className={cn("w-1.5 h-1.5 rounded-full", dish.isVeg ? "bg-green-600" : "bg-red-500")} />
          </span>
          {dish.popular && <Badge variant="success" className="text-[9px] py-0">Bestseller</Badge>}
        </div>
        <h4 className="font-semibold text-[--color-on-surface] text-sm mb-0.5">{dish.name}</h4>
        <p className="text-xs text-[--color-on-surface-variant] line-clamp-2 mb-2">{dish.description}</p>
        <span className="font-bold tabular-nums" style={{ color: "var(--color-on-surface)" }}>₹{dish.price}</span>
      </div>

      {/* Image + action */}
      <div className="shrink-0 flex flex-col items-center gap-2">
        <div className="relative w-24 h-20 rounded-[--radius-md] overflow-hidden bg-[--color-surface-container]">
          {dish.image && (
            <Image src={dish.image} alt={dish.name} fill sizes="96px" className="object-cover" />
          )}
        </div>
        {qty === 0 ? (
          <button
            onClick={() => add({ id: dish.id, restaurantId: dish.restaurantId, restaurantName: dish.restaurantName, name: dish.name, price: dish.price, image: dish.image })}
            className="w-24 h-8 text-xs font-bold rounded-[--radius-md] border-2 bg-white hover:bg-[--color-primary] hover:text-white hover:border-[--color-primary] transition-all"
            style={{ borderColor: "var(--color-primary)", color: "var(--color-primary)" }}
          >
            ADD
          </button>
        ) : (
          <div className="w-24 h-8 flex items-center justify-between bg-[--color-primary] rounded-[--radius-md] px-1.5">
            <button onClick={() => update(dish.id, qty - 1)} className="text-white p-0.5 hover:opacity-80">
              <Minus size={14} />
            </button>
            <span className="text-white font-bold text-sm tabular-nums">{qty}</span>
            <button onClick={() => add({ id: dish.id, restaurantId: dish.restaurantId, restaurantName: dish.restaurantName, name: dish.name, price: dish.price, image: dish.image })} className="text-white p-0.5 hover:opacity-80">
              <Plus size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────────────────────── */
export default function RestaurantPage() {
  const [activeSection, setActiveSection] = useState(MENU[0].id);
  const { items, total, count } = useCartStore();
  const cartCount = count();
  const cartTotal = total();

  return (
    <div className="min-h-screen">
      {/* Cover */}
      <div className="relative w-full h-48 md:h-64 overflow-hidden">
        <Image src={RESTAURANT.image} alt={RESTAURANT.name} fill sizes="100vw" className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <Link href="/" className="absolute top-4 left-4 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors">
          <ChevronLeft size={20} />
        </Link>
        <button className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors">
          <Heart size={18} />
        </button>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 md:px-10">
        {/* Restaurant info */}
        <div className="py-4 border-b border-[--color-border]">
          <h1 className="text-2xl font-extrabold text-[--color-on-surface] mb-1" style={{ fontFamily: "var(--font-heading)" }}>
            {RESTAURANT.name}
          </h1>
          <p className="text-sm text-[--color-on-surface-variant] mb-3">{RESTAURANT.cuisine.join(", ")} · {RESTAURANT.address}</p>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="flex items-center gap-1.5 font-semibold" style={{ color: "var(--color-tertiary)" }}>
              <Star size={14} fill="currentColor" />
              {RESTAURANT.rating} ({RESTAURANT.reviewCount}+)
            </span>
            <span className="flex items-center gap-1.5 text-[--color-on-surface-variant]">
              <Clock size={14} />{RESTAURANT.deliveryTime} min
            </span>
            <span className="flex items-center gap-1.5 text-[--color-on-surface-variant]">
              <Bike size={14} />{RESTAURANT.deliveryFee === 0 ? "Free delivery" : rupees(RESTAURANT.deliveryFee)}
            </span>
            <span className="flex items-center gap-1.5 text-[--color-on-surface-variant]">
              <Info size={14} />Min order {rupees(RESTAURANT.minOrder)}
            </span>
          </div>
        </div>

        <div className="flex gap-8 mt-4">
          {/* Sidebar — section nav (desktop) */}
          <aside className="hidden md:block w-48 shrink-0">
            <nav className="sticky top-20 space-y-1">
              {MENU.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-[--radius-md] text-sm font-medium transition-colors",
                    activeSection === section.id
                      ? "text-white"
                      : "text-[--color-on-surface-variant] hover:bg-[--color-surface-container-low]"
                  )}
                  style={activeSection === section.id ? { background: "var(--color-primary)" } : {}}
                >
                  {section.name}
                  <span className="float-right text-xs opacity-60">{section.items.length}</span>
                </button>
              ))}
            </nav>
          </aside>

          {/* Menu */}
          <div className="flex-1 min-w-0 pb-32">
            {/* Mobile: section tabs */}
            <div className="md:hidden flex gap-2 overflow-x-auto hide-scrollbar pb-2 mb-4 -mx-4 px-4">
              {MENU.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "shrink-0 px-4 py-1.5 rounded-[--radius-full] text-sm font-semibold border transition-all",
                    activeSection === section.id
                      ? "text-white border-[--color-primary]"
                      : "border-[--color-border] text-[--color-on-surface-variant] bg-[--color-surface-container-lowest]"
                  )}
                  style={activeSection === section.id ? { background: "var(--color-primary)" } : {}}
                >
                  {section.name}
                </button>
              ))}
            </div>

            {MENU.map((section) => (
              <div key={section.id} className={cn(activeSection !== section.id && "hidden md:block")}>
                <h2 className="text-lg font-bold text-[--color-on-surface] mb-2 mt-4 first:mt-0" style={{ fontFamily: "var(--font-heading)" }}>
                  {section.name}
                </h2>
                {section.items.map((dish) => <DishCard key={dish.id} dish={dish} />)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating cart bar */}
      {cartCount > 0 && (
        <div className="fixed bottom-0 md:bottom-4 inset-x-0 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-auto z-50 px-0 md:px-4">
          <Link
            href="/cart"
            className="flex items-center justify-between w-full md:w-auto md:min-w-80 px-4 py-3 text-white shadow-[--shadow-xl]"
            style={{ background: "var(--color-primary)", borderRadius: "var(--radius-lg) var(--radius-lg) 0 0" }}
          >
            <span className="font-bold text-sm bg-white/20 px-2 py-0.5 rounded">{cartCount} item{cartCount > 1 ? "s" : ""}</span>
            <span className="font-bold">View Cart</span>
            <span className="font-bold tabular-nums">{rupees(cartTotal)}</span>
          </Link>
        </div>
      )}
    </div>
  );
}
