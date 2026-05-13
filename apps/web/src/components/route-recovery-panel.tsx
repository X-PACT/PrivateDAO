"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Bot, FileText, Search, ShieldCheck, Sparkles } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const recoveryRoutes = [
  {
    href: "/proof/?judge=1",
    title: "Judge proof lane",
    body: "Fast review path, receipts, runtime proof, and submitted-hackathon evidence.",
    icon: ShieldCheck,
    keywords: ["judge", "judges", "proof", "review", "receipt", "frontier", "colosseum"],
  },
  {
    href: "/services/qvac-sovereign-ai/",
    title: "QVAC sovereign AI",
    body: "Offline/on-device intelligence lane for pre-sign review and private operational reasoning.",
    icon: Bot,
    keywords: ["qvac", "ai", "sovereign", "intelligence", "llm", "sdk", "wdk"],
  },
  {
    href: "/services/cloak-private-settlement/",
    title: "Cloak private settlement",
    body: "Private settlement intent, confidential payout posture, and Testnet execution receipts.",
    icon: Sparkles,
    keywords: ["cloak", "settlement", "private", "payment", "payout", "umbra", "payroll"],
  },
  {
    href: "/whiteprint/",
    title: "Whiteprint and roadmap",
    body: "Phase 2 privacy infrastructure, phase 3 cross-chain roadmap, and ecosystem thesis.",
    icon: FileText,
    keywords: ["whitepaper", "whiteprint", "roadmap", "vision", "phase", "founder"],
  },
  {
    href: "/trust/",
    title: "Trust and security",
    body: "Security boundaries, legal posture, public-good terms, and launch-readiness controls.",
    icon: ShieldCheck,
    keywords: ["trust", "security", "legal", "privacy", "compliance", "audit"],
  },
  {
    href: "/services/",
    title: "Services catalog",
    body: "Best-fit service lanes for institutions, teams, developers, and reviewer walkthroughs.",
    icon: ArrowRight,
    keywords: ["service", "services", "pricing", "api", "benefit", "product", "demo"],
  },
] as const;

function scoreRoute(pathname: string, keywords: readonly string[]) {
  const path = pathname.toLowerCase();
  return keywords.reduce((score, keyword) => (path.includes(keyword) ? score + 1 : score), 0);
}

export function RouteRecoveryPanel() {
  const pathname = usePathname() ?? "/";
  const recommended =
    recoveryRoutes
      .map((route) => ({ route, score: scoreRoute(pathname, route.keywords) }))
      .sort((a, b) => b.score - a.score)[0]?.route ?? recoveryRoutes[0];
  const remainingRoutes = recoveryRoutes.filter((route) => route.href !== recommended.href).slice(0, 4);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-16 sm:px-6 lg:px-8">
      <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/18 bg-cyan-300/[0.08] px-3 py-1 text-xs uppercase tracking-[0.22em] text-cyan-100">
            <Search className="h-3.5 w-3.5" />
            Route recovery
          </div>
          <div className="space-y-4">
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              This route moved into the active PrivateDAO review surface.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-white/68">
              The original link is preserved for judging history. Continue through the closest live section below, or use search to reach the exact packet, service, or proof lane.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={recommended.href} className={cn(buttonVariants({ size: "lg" }))}>
              Open best live route
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/search" className={cn(buttonVariants({ size: "lg", variant: "outline" }))}>
              Search site
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/20">
          <div className="flex items-start gap-4">
            <recommended.icon className="mt-1 h-6 w-6 shrink-0 text-cyan-200" />
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.22em] text-white/42">Recommended</p>
              <h2 className="text-2xl font-semibold text-white">{recommended.title}</h2>
              <p className="text-sm leading-6 text-white/64">{recommended.body}</p>
              <Link href={recommended.href} className="inline-flex items-center gap-2 text-sm font-medium text-cyan-200 hover:text-cyan-100">
                {recommended.href}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {remainingRoutes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className="group rounded-xl border border-white/10 bg-white/[0.035] p-4 transition hover:border-cyan-200/30 hover:bg-white/[0.06]"
          >
            <route.icon className="mb-4 h-5 w-5 text-white/62 group-hover:text-cyan-200" />
            <h3 className="text-sm font-semibold text-white">{route.title}</h3>
            <p className="mt-2 text-xs leading-5 text-white/52">{route.body}</p>
          </Link>
        ))}
      </section>
    </main>
  );
}
