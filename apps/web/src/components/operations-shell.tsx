"use client";
/* eslint-disable @next/next/no-img-element -- the brand asset is a static export asset. */

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, Bot, FileCheck2, Gavel, Landmark, LockKeyhole, ShieldCheck, Users } from "lucide-react";
import { usePathname } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const productNav = [
  { href: "/payroll", label: "Payroll", icon: LockKeyhole },
  { href: "/treasury", label: "Treasury", icon: Landmark },
  { href: "/govern", label: "Governance", icon: Users },
  { href: "/auctions", label: "Auctions", icon: Gavel },
  { href: "/proof-workflows/blind-policy", label: "Blind Verification", icon: ShieldCheck },
  { href: "/products/record-verification", label: "Record Verification", icon: FileCheck2 },
  { href: "/agents", label: "Agents", icon: Bot },
] as const;

type OperationsShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  navigationMode?: "full" | "guided" | "focused";
  badges?: Array<{
    label: string;
    variant?: "cyan" | "violet" | "success" | "warning";
  }>;
  children: ReactNode;
};

export function OperationsShell({ eyebrow, title, description, navigationMode = "full", badges = [], children }: OperationsShellProps) {
  const pathname = usePathname();
  const focused = navigationMode === "focused";

  return (
    <main className="enterprise-operations mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      {!focused ? (
        <nav aria-label="PrivateDAO products" className="enterprise-product-nav no-scrollbar mb-8 flex gap-2 overflow-x-auto pb-1">
          {productNav.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link key={href} href={href} className={cn("flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition", active ? "border-[#175cd3] bg-[#175cd3] text-white shadow-[0_6px_18px_rgba(23,92,211,0.2)]" : "border-[#dce5f0] bg-white text-[#425570] hover:border-[#175cd3] hover:text-[#175cd3]")}>
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>
      ) : null}

      <section className="enterprise-operations-hero relative overflow-hidden rounded-[24px] border border-[#dce5f0] bg-white p-6 shadow-[0_14px_42px_rgba(16,35,63,0.07)] sm:p-10">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full border border-[#d9e8f7] opacity-80" />
        <div className="pointer-events-none absolute right-10 top-10 h-24 w-24 rounded-full border border-[#f0c9cd] opacity-70" />
        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_240px] lg:items-center">
          <div>
            {badges.length > 0 ? <div className="flex flex-wrap gap-2">{badges.map((badge) => <Badge key={badge.label} variant={badge.variant ?? "cyan"}>{badge.label}</Badge>)}</div> : null}
            <div className="mt-5 text-[11px] font-bold uppercase tracking-[0.28em] text-[#175cd3]">{eyebrow}</div>
            <h1 className="mt-3 max-w-4xl text-3xl font-semibold tracking-[-0.045em] text-[#10233f] sm:text-5xl">{title}</h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-[#5d6d82] sm:text-lg">{description}</p>
            {!focused ? <div className="mt-6 flex flex-wrap gap-3"><Link href="/contact" className={buttonVariants({ size: "sm" })}>Talk to PrivateDAO <ArrowRight className="h-4 w-4" /></Link><Link href="/products" className={buttonVariants({ size: "sm", variant: "outline" })}>View solutions</Link></div> : null}
          </div>
          <div className="enterprise-brand-orbit mx-auto hidden h-44 w-44 items-center justify-center lg:flex" aria-hidden="true">
            <div className="absolute h-40 w-40 rounded-full border border-[#b9d8f2]" />
            <div className="absolute h-28 w-28 rounded-full border border-[#f0c9cd]" />
            <img src="/assets/privatedao-brand-mark-20260918.jpeg" alt="" className="relative h-20 w-20 rounded-full object-cover shadow-[0_10px_26px_rgba(23,92,211,0.2)]" />
          </div>
        </div>
      </section>

      <div className="enterprise-operations-content mt-8 min-w-0 space-y-8">{children}</div>
    </main>
  );
}
