"use client";
import { useState } from "react";
import Image from "next/image";
import { Plus, Minus, ChevronDown } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import { cn } from "@/lib/utils";
import type { MenuItem, MenuItemVariant } from "@/lib/db/items";

export function DishCard({ dish, restaurantId, restaurantName }: { dish: MenuItem; restaurantId: string; restaurantName: string }) {
  const { items, add, update } = useCartStore();

  const hasVariants = dish.variants && dish.variants.length > 0;
  const [selectedVariant, setSelectedVariant] = useState<MenuItemVariant | null>(
    hasVariants ? dish.variants[0] : null
  );

  const effectivePrice = selectedVariant ? selectedVariant.price : dish.price;
  const variantLabel = selectedVariant?.label ?? undefined;

  const cartKey = `${dish.id}__${variantLabel ?? "default"}`;
  const cartItem = items.find((i) => i.cartKey === cartKey);
  const qty = cartItem?.quantity ?? 0;

  const handleAdd = () => {
    add({
      id: dish.id,
      restaurantId,
      restaurantName,
      name: dish.name,
      price: effectivePrice,
      image: dish.imageUrl,
      variantLabel,
    });
  };

  const handleIncrease = () => {
    add({
      id: dish.id,
      restaurantId,
      restaurantName,
      name: dish.name,
      price: effectivePrice,
      image: dish.imageUrl,
      variantLabel,
    });
  };

  const handleDecrease = () => {
    update(cartKey, qty - 1);
  };

  return (
    <div className="flex gap-3 py-4 border-b border-[--color-border] last:border-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1">
          <span className={cn("w-3.5 h-3.5 rounded-sm border-2 flex items-center justify-center", dish.isVeg ? "border-green-600" : "border-red-500")}>
            <span className={cn("w-1.5 h-1.5 rounded-full", dish.isVeg ? "bg-green-600" : "bg-red-500")} />
          </span>
        </div>
        <h4 className="font-semibold text-[--color-on-surface] text-sm mb-0.5">{dish.name}</h4>
        <p className="text-xs text-[--color-on-surface-variant] line-clamp-2 mb-2">{dish.description}</p>

        {hasVariants && (
          <div className="relative inline-block mb-2">
            <select
              value={selectedVariant?.label ?? ""}
              onChange={(e) => {
                const v = dish.variants.find((v: MenuItemVariant) => v.label === e.target.value);
                setSelectedVariant(v ?? null);
              }}
              className="appearance-none pl-2 pr-7 py-1 text-xs font-semibold rounded-md border border-[--color-border] bg-[--color-surface-container-low] text-[--color-on-surface] focus:outline-none focus:ring-1 focus:ring-[--color-primary] cursor-pointer"
            >
              {dish.variants.map((v: MenuItemVariant) => (
                <option key={v.label} value={v.label}>{v.label} — ₹{v.price}</option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-[--color-on-surface-variant] pointer-events-none" />
          </div>
        )}

        <span className="font-bold tabular-nums text-[--color-on-surface]">₹{effectivePrice}</span>
      </div>

      <div className="shrink-0 flex flex-col items-center gap-2">
        <div className="relative w-24 h-20 rounded-[--radius-md] overflow-hidden bg-[--color-surface-container]">
          {dish.imageUrl && <Image src={dish.imageUrl} alt={dish.name} fill sizes="96px" className="object-cover" />}
        </div>
        {qty === 0 ? (
          <button
            onClick={handleAdd}
            className="w-24 h-8 text-xs font-bold rounded-[--radius-md] border-2 bg-white hover:bg-[--color-primary] hover:text-white hover:border-[--color-primary] transition-all"
            style={{ borderColor: "var(--color-primary)", color: "var(--color-primary)" }}>
            ADD
          </button>
        ) : (
          <div className="w-24 h-8 flex items-center justify-between rounded-[--radius-md] px-1.5" style={{ background: "var(--color-primary)" }}>
            <button onClick={handleDecrease} className="text-white p-0.5 hover:opacity-80"><Minus size={14} /></button>
            <span className="text-white font-bold text-sm tabular-nums">{qty}</span>
            <button onClick={handleIncrease} className="text-white p-0.5 hover:opacity-80"><Plus size={14} /></button>
          </div>
        )}
      </div>
    </div>
  );
}
