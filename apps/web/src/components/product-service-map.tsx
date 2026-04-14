"use client";

import Link from "next/link";
import { ArrowRight, Radar, ShieldCheck, WalletCards, BriefcaseBusiness } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const serviceMap = [
  {
    title: "1. Start",
    description: "Connect a wallet and understand the product in under a minute.",
    href: "/start",
    cta: "Open start",
    icon: WalletCards,
  },
  {
    title: "2. Govern",
    description: "Create a DAO, create a proposal, vote, and execute from one live Devnet flow.",
    href: "/govern",
    cta: "Open govern",
    icon: ArrowRight,
  },
  {
    title: "3. Track activity",
    description: "Check proposals, treasury movement, and runtime state after any wallet action.",
    href: "/live",
    cta: "Open activity",
    icon: Radar,
  },
  {
    title: "4. API and trust",
    description: "See hosted API, pricing, security, proof, and operating trust without leaving the public surface.",
    href: "/services",
    cta: "Open services",
    icon: BriefcaseBusiness,
  },
];

type ProductServiceMapProps = {
  title?: string;
  description?: string;
  compact?: boolean;
};

export function ProductServiceMap({
  title = "What PrivateDAO offers",
  description = "Use this map when you want to know where to start, where to act, where to track the result, and where to inspect the trust and API layer.",
  compact = false,
}: ProductServiceMapProps) {
  return (
    <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(10,16,32,0.94),rgba(7,11,23,0.98))]">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="text-sm leading-7 text-white/58">{description}</p>
      </CardHeader>
      <CardContent className={cn("grid gap-4", compact ? "md:grid-cols-2" : "lg:grid-cols-4")}>
        {serviceMap.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="rounded-[24px] border border-white/8 bg-white/[0.04] p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-cyan-100">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="text-base font-medium text-white">{item.title}</div>
              </div>
              <p className="mt-3 text-sm leading-7 text-white/58">{item.description}</p>
              <Link className={cn(buttonVariants({ size: "sm", variant: "secondary" }), "mt-4 w-full justify-between")} href={item.href}>
                {item.cta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          );
        })}
        <div className="rounded-[24px] border border-emerald-300/18 bg-emerald-300/[0.08] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-300/20 bg-emerald-300/[0.12] text-emerald-100">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="text-base font-medium text-white">Security and proof</div>
          </div>
          <p className="mt-3 text-sm leading-7 text-white/62">
            Product routes stay simple first. Security packets, proof, and reviewer-grade detail stay available when you need them, not before.
          </p>
          <Link className={cn(buttonVariants({ size: "sm", variant: "outline" }), "mt-4 w-full justify-between")} href="/trust">
            Open trust
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
