"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Compass, FileText, Search, ShieldCheck, Sparkles, Wallet } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { getAssistantSuggestion } from "@/lib/search-assistant";
import { cn } from "@/lib/utils";

const assistantPaths = [
  {
    title: "I want the easiest start",
    summary: "Open the onboarding path, connect a wallet, and move into the command center.",
    href: "/start",
    icon: Compass,
  },
  {
    title: "I am a judge",
    summary: "Open the shortest proof route, V3 packet, and trust docs without digging.",
    href: "/proof/?judge=1",
    icon: Sparkles,
  },
  {
    title: "I need security and cryptography",
    summary: "Go straight to the ZK matrix, confidence engine, and policy composer.",
    href: "/security",
    icon: ShieldCheck,
  },
  {
    title: "I need docs fast",
    summary: "Use the in-app document library or the broader repo viewer.",
    href: "/documents",
    icon: FileText,
  },
  {
    title: "I need the right wallet flow",
    summary: "Use Solflare-first onboarding and continue into command-center execution.",
    href: "/start",
    icon: Wallet,
  },
  {
    title: "I need the best competition workspace",
    summary: "Open the competition center, then route into the exact track bundle for Colosseum, privacy, RPC, consumer, Ranger, or 100xDevs.",
    href: "/tracks",
    icon: Sparkles,
  },
];

export function InternalAssistantPanel() {
  const [query, setQuery] = useState("");
  const suggestion = useMemo(() => getAssistantSuggestion(query), [query]);

  return (
    <div className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
      <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(10,16,32,0.94),rgba(7,11,23,0.98))]">
        <CardHeader>
          <CardTitle>PrivateDAO internal assistant</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 text-sm leading-7 text-white/62">
          <div className="flex items-center gap-3 rounded-3xl border border-white/10 bg-white/4 px-4 py-3">
            <Search className="h-4 w-4 text-cyan-200" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Ask AI where to go: QuickNode, Solflare, privacy, judge path, consumer, Ranger, 100xDevs..."
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/34"
            />
          </div>
          <div className="rounded-3xl border border-white/8 bg-white/4 p-5">
            This assistant is optimized for routing users, judges, operators, and competition reviewers to the shortest correct path in the product. It keeps the site usable without forcing anyone to understand the whole system first.
          </div>
          <div className="rounded-3xl border border-white/8 bg-black/20 p-4 text-sm leading-7 text-white/58">
            Try: “what is blocking privacy track mainnet?” or “what is the fastest paid motion for QuickNode track?”.
          </div>
          <div className="grid gap-4">
            {assistantPaths.map((path) => {
              const Icon = path.icon;
              return (
                <Link key={path.title} href={path.href} className="rounded-3xl border border-white/10 bg-white/4 p-5 transition hover:border-cyan-300/20 hover:bg-cyan-300/8">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/8 bg-black/20 text-cyan-200">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="text-base font-medium text-white">{path.title}</div>
                  </div>
                  <div className="mt-3 text-sm leading-7 text-white/58">{path.summary}</div>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-white/[0.03]">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-100">
              <Sparkles className="h-5 w-5" />
            </div>
            <CardTitle>Recommended fast routes</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-3xl border border-cyan-300/16 bg-cyan-300/[0.08] p-5">
            <div className="text-[11px] uppercase tracking-[0.28em] text-cyan-100/72">AI routing answer</div>
            <div className="mt-3 text-lg font-medium text-white">{suggestion.title}</div>
            <p className="mt-3 text-sm leading-7 text-white/68">{suggestion.summary}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href={suggestion.primaryActionHref} className={cn(buttonVariants({ size: "sm" }))}>
                {suggestion.primaryActionLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
              {suggestion.relatedRoutes.map((route) => (
                <Link key={`${suggestion.title}-${route.href}`} href={route.href} className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
                  {route.label}
                </Link>
              ))}
            </div>
          </div>
          <Link href="/search" className={cn(buttonVariants({ size: "sm", variant: "secondary" }), "w-full")}>
            Open site search
          </Link>
          <Link href="/story" className={cn(buttonVariants({ size: "sm", variant: "secondary" }), "w-full")}>
            Open story video
          </Link>
          <Link href="/dashboard" className={cn(buttonVariants({ size: "sm", variant: "outline" }), "w-full")}>
            Open dashboard
          </Link>
          <Link href="/tracks" className={cn(buttonVariants({ size: "sm", variant: "outline" }), "w-full")}>
            Open competition center
          </Link>
          <div className="rounded-3xl border border-white/10 bg-black/20 p-4 text-sm leading-7 text-white/58">
            Best wallet for the current surface: <span className="text-white">Solflare</span>. Keep Phantom as a fallback for judges who expect it.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
