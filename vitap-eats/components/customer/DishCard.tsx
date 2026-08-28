"use client";
import { useState } from "react";
import Image from "next/image";
import { Plus, Minus, ChevronDown } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import { cn } from "@/lib/utils";
import type { MenuItem, MenuItemVariant } from "@/lib/db/items";

export function DishCard({
  dish,
  restaurantId,
  restaurantName,
}: {
  dish: MenuItem;
  restaurantId: string;
  restaurantName: string;
}) {
  const { items, add, update } = useCartStore();

  const hasVariants = dish.variants && dish.variants.length > 0;
  const [selectedVariant, setSelectedVariant] = useState<MenuItemVariant | null>(
    hasVariants && dish.variants ? dish.variants[0] : null
  );

  const effectivePrice = selectedVariant ? selectedVariant.price : dish.price;
  const variantLabel = selectedVariant?.label ?? undefined;
  const cartKey = `${dish.id}__${variantLabel ?? "default"}`;
  const cartItem = items.find((i) => i.cartKey === cartKey);
  const qty = cartItem?.quantity ?? 0;

  const handleAdd = () =>
    add({ id: dish.id, restaurantId, restaurantName, name: dish.name, price: effectivePrice, image: dish.imageUrl, variantLabel });
  const handleIncrease = () =>
    add({ id: dish.id, restaurantId, restaurantName, name: dish.name, price: effectivePrice, image: dish.imageUrl, variantLabel });
  const handleDecrease = () => update(cartKey, qty - 1);

  return (
    <div
      className="flex gap-3 items-start py-4"
    >
      {/* ── Left: text ── */}
      <div className="flex-1 min-w-0 pr-1">
        {/* Veg/non-veg dot */}
        <div className="flex items-center gap-1.5 mb-1">
          <span
            className={cn(
              "w-3.5 h-3.5 rounded-sm border-2 flex items-center justify-center shrink-0",
              dish.isVeg ? "border-green-600" : "border-red-500"
            )}
          >
            <span
              className={cn("w-1.5 h-1.5 rounded-full", dish.isVeg ? "bg-green-600" : "bg-red-500")}
            />
          </span>

        </div>

        <h4
          className="font-bold text-sm leading-tight mb-0.5"
          style={{ fontFamily: "var(--font-heading)", color: "var(--color-on-surface)" }}
        >
          {dish.name}
        </h4>
        <p
          className="text-xs line-clamp-2 mb-2 leading-relaxed"
          style={{ color: "var(--color-on-surface-variant)" }}
        >
          {dish.description}
        </p>

        {/* Variant selector */}
        {hasVariants && (
          <div className="relative inline-flex items-center mb-2">
            <select
              value={selectedVariant?.label ?? ""}
              onChange={(e) => {
                const v = dish.variants?.find((v: MenuItemVariant) => v.label === e.target.value);
                setSelectedVariant(v ?? null);
              }}
              className="appearance-none pl-4 pr-8 py-1.5 text-xs font-bold cursor-pointer shadow-[--shadow-sm]"
              style={{
                background: "var(--color-surface-container-lowest)",
                borderRadius: "var(--radius-full)",
                color: "var(--color-on-surface)",
              }}
            >
              {dish.variants?.map((v: MenuItemVariant) => (
                <option key={v.label} value={v.label}>
                  {v.label} — ₹{v.price}
                </option>
              ))}
            </select>
            <ChevronDown
              size={11}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "var(--color-on-surface-variant)" }}
            />
          </div>
        )}

        {/* Price */}
        <div className="mt-1">
          <span
            className="font-extrabold tabular-nums"
            style={{ fontSize: "1rem", color: "var(--color-on-surface)" }}
          >
            ₹{effectivePrice}
          </span>
        </div>
      </div>

      {/* ── Right: image + add button ── */}
      <div className="shrink-0 flex flex-col items-center gap-2">
        {/* Circular-ish image */}
        <div
          className="relative overflow-hidden"
          style={{
            width: 96,
            height: 80,
            borderRadius: "var(--radius-xl)",
            background: "var(--color-surface-container)",
            boxShadow: "var(--shadow-sm)"
          }}
        >
          {dish.imageUrl ? (
            <Image
              src={dish.imageUrl}
              alt={dish.name}
              fill
              sizes="96px"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl">🍽️</div>
          )}
        </div>

        {/* ADD / qty stepper */}
        {qty === 0 ? (
          <button
            onClick={handleAdd}
            className="font-bold text-xs tracking-wide"
            style={{
              width: 96,
              height: 32,
              borderRadius: "var(--radius-full)",
              background: "var(--color-primary-fixed)",
              color: "var(--color-primary)",
              boxShadow: "var(--shadow-sm)",
              fontFamily: "var(--font-heading)",
            }}
          >
            + ADD
          </button>
        ) : (
          <div
            className="flex items-center justify-between"
            style={{
              width: 96,
              height: 32,
              borderRadius: "var(--radius-full)",
              background: "var(--color-primary)",
              paddingInline: "0.375rem",
            }}
          >
            <button
              onClick={handleDecrease}
              className="flex items-center justify-center"
              style={{ color: "var(--color-on-primary)", width: 22, height: 22 }}
            >
              <Minus size={13} />
            </button>
            <span
              className="font-bold text-sm tabular-nums"
              style={{ color: "var(--color-on-primary)" }}
            >
              {qty}
            </span>
            <button
              onClick={handleIncrease}
              className="flex items-center justify-center"
              style={{ color: "var(--color-on-primary)", width: 22, height: 22 }}
            >
              <Plus size={13} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
