import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-medium uppercase tracking-[0.22em]",
  {
    variants: {
      variant: {
        default: "border-white/10 bg-white/6 text-white/80",
        success: "border-emerald-400/20 bg-emerald-400/12 text-emerald-200",
        warning: "border-amber-400/25 bg-amber-400/12 text-amber-100",
        violet: "border-fuchsia-400/20 bg-fuchsia-400/12 text-fuchsia-100",
        cyan: "border-cyan-400/20 bg-cyan-400/12 text-cyan-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
