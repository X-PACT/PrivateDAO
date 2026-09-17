import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all outline-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-[#175cd3] text-white shadow-[0_8px_20px_rgba(23,92,211,0.18)] hover:bg-[#1146a5]",
        secondary:
          "bg-[#eef3f9] text-[#10233f] shadow-[inset_0_0_0_1px_#dce5f0] hover:bg-[#e4ebf4]",
        ghost: "text-[#425570] hover:bg-[#f1f5f9] hover:text-[#10233f]",
        outline:
          "bg-transparent text-[#175cd3] shadow-[inset_0_0_0_1px_#b9d8f2] hover:bg-[#f1f8ff]",
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
