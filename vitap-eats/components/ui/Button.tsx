import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef } from "react";

const btn = cva(
  "inline-flex items-center justify-center gap-2 font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-primary] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        primary:     "bg-[--color-primary] text-white shadow-[var(--shadow-primary)] hover:bg-[--color-primary-dark] active:scale-95",
        secondary:   "bg-[--color-surface-container-lowest] border border-[--color-border] text-[--color-on-surface] hover:bg-[--color-surface-container-low] active:scale-95",
        ghost:       "text-[--color-primary] hover:bg-[--color-primary-fixed] active:scale-95",
        destructive: "bg-[--color-error] text-white hover:opacity-90 active:scale-95",
        outline:     "border border-[--color-primary] text-[--color-primary] hover:bg-[--color-primary-fixed] active:scale-95",
      },
      size: {
        sm:   "h-8  px-3 text-xs rounded-[--radius-md]",
        md:   "h-10 px-5 text-sm rounded-[--radius-md]",
        lg:   "h-12 px-7 text-base rounded-[--radius-lg]",
        icon: "h-10 w-10 rounded-[--radius-md]",
        pill: "h-10 px-6 text-sm rounded-[--radius-full]",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof btn> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(btn({ variant, size }), className)} {...props} />
  )
);
Button.displayName = "Button";
export { Button };
