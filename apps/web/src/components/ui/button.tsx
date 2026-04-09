import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all outline-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-[linear-gradient(135deg,#14f195,#00c2ff)] text-slate-950 shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_12px_28px_rgba(20,241,149,0.16)] hover:brightness-105",
        secondary:
          "bg-white/5 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)] hover:bg-white/8",
        ghost: "text-white/70 hover:bg-white/6 hover:text-white",
        outline:
          "bg-transparent text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.14)] hover:bg-white/5",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-6 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
