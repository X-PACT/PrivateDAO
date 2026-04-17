"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import { learnModuleNav } from "@/lib/learn-bootcamp";
import { cn } from "@/lib/utils";

export function LearnBootcampNav() {
  const pathname = usePathname();

  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-4">
      <div className="text-[11px] uppercase tracking-[0.28em] text-cyan-100/72">PrivateDAO Frontend Bootcamp</div>
      <div className="mt-4 flex flex-wrap gap-2">
        {learnModuleNav.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                buttonVariants({
                  size: "sm",
                  variant: active ? "default" : "outline",
                }),
              )}
            >
              <span className="hidden sm:inline">{item.label}</span>
              <span className="sm:hidden">{item.shortLabel}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
