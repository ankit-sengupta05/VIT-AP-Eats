import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-[--radius-md] bg-[--color-surface-container]",
        className
      )}
    />
  );
}

export function RestaurantCardSkeleton() {
  return (
    <div className="bg-[--color-surface-container-lowest] rounded-[--radius-lg] overflow-hidden shadow-[--shadow-md] border border-[--color-border]">
      <Skeleton className="w-full aspect-[16/9] rounded-none" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex gap-3 mt-2">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  );
}

export function RestaurantGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <RestaurantCardSkeleton key={i} />
      ))}
    </div>
  );
}
