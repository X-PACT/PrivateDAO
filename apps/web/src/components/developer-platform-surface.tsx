"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Code2, ServerCog, WalletCards } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { developerPlatformFeatures, rpcPlans } from "@/lib/site-data";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const stackOptions = [
  { value: "rpc", label: "RPC / hosted reads" },
  { value: "governance", label: "Governance integration" },
  { value: "gaming", label: "Gaming DAO" },
  { value: "payments", label: "Payments / payouts" },
] as const;

export function DeveloperPlatformSurface() {
  const [focus, setFocus] = useState<(typeof stackOptions)[number]["value"]>("rpc");

  const recommendation = useMemo(() => {
    switch (focus) {
      case "governance":
        return {
          title: "Governance integration path",
          summary: "Start with the govern flow and docs, then keep proof and diagnostics visible while integrating DAO actions into your own app.",
          href: "/govern",
          cta: "Open governance path",
        };
      case "gaming":
        return {
          title: "Gaming DAO path",
          summary: "Use proposal templates, reward treasury, and clan or tournament governance as the first product layer for game studios.",
          href: "/products",
          cta: "Open gaming path",
        };
      case "payments":
        return {
          title: "Payments engine path",
          summary: "Lead with governed payouts and treasury approvals, then extend into vendors, contributors, and subscription billing logic.",
          href: "/services",
          cta: "Open payments path",
        };
      default:
        return {
          title: "RPC and hosted reads path",
          summary: "Start with the services route for shared or dedicated RPC, diagnostics, runtime evidence, and hosted API framing.",
          href: "/services",
          cta: "Open RPC path",
        };
    }
  }, [focus]);

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/18 bg-cyan-300/10 text-cyan-100">
              <Code2 className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Developer portal</CardTitle>
              <p className="mt-2 text-sm leading-7 text-white/60">
                The developer surface should make PrivateDAO feel like a platform: RPC, API, SDK, templates, diagnostics, and proof-aware integration paths.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
          <div className="grid gap-4">
            <div className="flex flex-wrap gap-3">
              {stackOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFocus(option.value)}
                  className={cn(
                    "rounded-full border px-4 py-2 text-xs uppercase tracking-[0.18em] transition",
                    focus === option.value
                      ? "border-cyan-300/28 bg-cyan-300/10 text-white"
                      : "border-white/10 bg-white/4 text-white/62 hover:border-white/16 hover:text-white",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="rounded-3xl border border-cyan-300/16 bg-cyan-300/[0.08] p-5">
              <div className="text-[11px] uppercase tracking-[0.28em] text-cyan-100/74">Recommended path</div>
              <div className="mt-3 text-lg font-medium text-white">{recommendation.title}</div>
              <p className="mt-3 text-sm leading-7 text-white/66">{recommendation.summary}</p>
              <Link className={cn(buttonVariants({ size: "sm" }), "mt-4")} href={recommendation.href}>
                {recommendation.cta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {developerPlatformFeatures.map((feature) => (
                <Link key={feature.title} href={feature.href} className="rounded-3xl border border-white/8 bg-white/4 p-5 transition hover:border-cyan-300/22 hover:bg-white/6">
                  <div className="text-base font-medium text-white">{feature.title}</div>
                  <p className="mt-3 text-sm leading-7 text-white/60">{feature.summary}</p>
                </Link>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-3xl border border-white/8 bg-white/4 p-5">
              <div className="flex items-center gap-3">
                <ServerCog className="h-5 w-5 text-emerald-200" />
                <div className="text-base font-medium text-white">RPC plans</div>
              </div>
              <div className="mt-4 grid gap-3">
                {rpcPlans.map((plan) => (
                  <div key={plan.name} className="rounded-2xl border border-white/8 bg-black/20 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-medium text-white">{plan.name}</div>
                      <div className="text-xs uppercase tracking-[0.18em] text-emerald-300/76">{plan.price}</div>
                    </div>
                    <div className="mt-3 text-sm leading-7 text-white/62">
                      {plan.requests} · {plan.network}
                    </div>
                    <div className="mt-2 text-sm leading-7 text-white/54">{plan.fit}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/8 bg-white/4 p-5">
              <div className="flex items-center gap-3">
                <WalletCards className="h-5 w-5 text-violet-200" />
                <div className="text-base font-medium text-white">Access model</div>
              </div>
              <div className="mt-4 text-sm leading-7 text-white/62">
                PrivateDAO presents the commercial surface now and keeps the launch boundary honest: API key issuance posture, metered quotas, and usage billing belong to the product strategy and services layer while Devnet operation and proof stay visible in the app today.
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link href="/engage" className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}>
                  Open engage
                </Link>
                <Link href="/diagnostics" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
                  Open diagnostics
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
