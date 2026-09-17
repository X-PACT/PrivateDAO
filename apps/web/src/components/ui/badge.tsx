import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-medium uppercase tracking-[0.22em]",
  {
    variants: {
      variant: {
        default: "border-[#dce5f0] bg-[#f7f9fc] text-[#425570]",
        success: "border-[#b8e4d4] bg-[#effaf5] text-[#08754f]",
        warning: "border-[#f0d29d] bg-[#fff8e8] text-[#8a5a00]",
        violet: "border-[#d9c8f3] bg-[#f8f3ff] text-[#6840a8]",
        cyan: "border-[#b9d8f2] bg-[#f1f8ff] text-[#175cd3]",
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
