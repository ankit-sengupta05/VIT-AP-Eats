"use client";
import Link from "next/link";
import { Home, Search, ShoppingCart, User, Bike } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/",        icon: Home,        label: "Home"   },
  { href: "/search",  icon: Search,      label: "Search" },
  { href: "/cart",    icon: ShoppingCart,label: "Cart",  cart: true },
  { href: "/orders",  icon: Bike,        label: "Orders" },
  { href: "/profile", icon: User,        label: "Me"     },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const count = useCartStore((s) => s.count());

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-[--color-border]"
      style={{
        backgroundColor: "var(--color-surface-container-lowest)",
        boxShadow: "0 -2px 12px rgba(0, 0, 0, 0.12)",
        paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 0.2rem)",
      }}
    >
      <div className="flex">
        {NAV.map(({ href, icon: Icon, label, cart }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors",
                active ? "text-[--color-primary]" : "text-[--color-on-surface-variant]"
              )}
            >
              <span className="relative">
                <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
                {cart && count > 0 && (
                  <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center bg-[--color-primary]">
                    {count > 9 ? "9+" : count}
                  </span>
                )}
              </span>
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
