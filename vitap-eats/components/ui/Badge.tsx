import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info" | "veg" | "nonveg";
}

const variants: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default:  "bg-[--color-surface-container] text-[--color-on-surface-variant]",
  success:  "bg-[--color-tertiary-container]/20 text-[--color-tertiary]",
  warning:  "bg-amber-50 text-amber-700",
  danger:   "bg-[--color-error-container] text-[--color-error]",
  info:     "bg-blue-50 text-blue-700",
  veg:      "bg-green-50 text-green-700 border border-green-600",
  nonveg:   "bg-red-50 text-red-700 border border-red-500",
};

export function Badge({ variant = "default", className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-[--radius-full]",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
