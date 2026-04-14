"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Compass, LockKeyhole, PlayCircle, Radar, Shield, Sparkles, Trophy, WalletCards } from "lucide-react";

import { SectionHeader } from "@/components/section-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { achievements, heroPersonas, techCards } from "@/lib/site-data";
import { useSiteUrls } from "@/lib/site-urls";
import { cn } from "@/lib/utils";

export function HomeShell() {
  const [persona, setPersona] = useState<keyof typeof heroPersonas>("buyer");
  const activePersona = heroPersonas[persona];
  const { judgeViewUrl } = useSiteUrls();
  const primaryRoutes = [
    {
      title: "Command Center",
      description: "Create, vote, reveal, and execute through the wallet-first governance rail.",
      href: "/govern",
      cta: "Open govern",
      icon: Compass,
    },
    {
      title: "Proof Center",
      description: "Give judges and reviewers the shortest path to baseline, V3, and trust packets.",
      href: "/proof/?judge=1",
      cta: "Open proof path",
      icon: Shield,
    },
    {
      title: "Security Layer",
      description: "Open ZK matrix, confidence engine, policy composer, and launch boundaries.",
      href: "/trust",
      cta: "Open trust",
      icon: LockKeyhole,
    },
    {
      title: "Services and API",
      description: "Surface pilot packages, RPC, hosted reads, and enterprise governance offerings.",
      href: "/services",
      cta: "Open services",
      icon: WalletCards,
    },
    {
      title: "Diagnostics",
      description: "Check runtime posture, readiness, generated artifacts, and reviewer surfaces.",
      href: "/diagnostics",
      cta: "Open diagnostics",
      icon: Radar,
    },
    {
      title: "Competition Center",
      description: "Go directly to submission-ready tracks, decks, and proof routes for judges.",
      href: "/tracks",
      cta: "Open tracks",
      icon: Sparkles,
    },
  ];
  const storyCards = [
    {
      title: "Start in under a minute",
      description: "Normal users begin from onboarding and wallet connection instead of raw governance controls.",
      href: "/start",
      icon: Compass,
    },
    {
      title: "Judge path stays explicit",
      description: "Proof, V3, trust packet, and runtime surfaces stay one click away from the product shell.",
      href: "/proof/?judge=1",
      icon: Shield,
    },
    {
      title: "Story video is submission-ready",
      description: "The public reel explains the product, cryptography, and commercial corridors in one watch surface.",
      href: "/demo",
      icon: PlayCircle,
    },
  ];
  const fastActionSteps = [
    {
      title: "1. Connect a wallet",
      description: "Start from the onboarding flow and land in the product with Devnet-ready wallet controls.",
      href: "/start",
      cta: "Open start",
    },
    {
      title: "2. Create and govern",
      description: "Create a DAO, submit a proposal, vote, and execute from one wallet-first surface.",
      href: "/govern",
      cta: "Open govern",
    },
    {
      title: "3. Verify the result",
      description: "Check live state, logs, and proof without leaving the product corridor.",
      href: "/live",
      cta: "Open live state",
    },
  ];
  const trustSignals = [
    "Wallet-first Devnet flow is exposed directly from the product, not buried behind docs.",
    "Proof and trust surfaces stay available when needed, but no longer dominate the homepage.",
    "Android, web, and reviewer routes now point to one product story instead of competing shells.",
  ];

  return (
    <main className="pb-20 sm:pb-24">
      <section className="mx-auto w-full max-w-7xl px-4 pt-8 sm:px-6 sm:pt-12 lg:px-8 lg:pt-18">
        <div className="grid items-start gap-8 xl:grid-cols-[1.14fr_0.86fr] xl:gap-10">
          <div className="space-y-6 sm:space-y-8">
            <div className="flex flex-wrap gap-3">
              <Badge variant="cyan">Private governance on Solana</Badge>
              <Badge variant="violet">ZK + REFHE + MagicBlock + Fast RPC</Badge>
              <Badge variant="success">{activePersona.badge}</Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              {(Object.entries(heroPersonas) as Array<[keyof typeof heroPersonas, (typeof heroPersonas)[keyof typeof heroPersonas]]>).map(([key, value]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setPersona(key)}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm transition",
                    persona === key
                      ? "border-cyan-300/35 bg-cyan-300/12 text-cyan-100"
                      : "border-white/10 bg-white/4 text-white/65 hover:bg-white/6 hover:text-white",
                  )}
                >
                  {value.label} View
                </button>
              ))}
            </div>
            <div className="space-y-4 sm:space-y-5">
              <div className="text-[11px] uppercase tracking-[0.34em] text-emerald-300/80">{activePersona.eyebrow}</div>
              <div className="max-w-3xl text-3xl font-semibold tracking-[-0.045em] text-white sm:text-5xl lg:text-[4rem] xl:text-[4.35rem]">
                {activePersona.title}
              </div>
              <p className="max-w-2xl text-sm leading-7 text-white/62 sm:text-lg sm:leading-8">
                {activePersona.description}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link className={cn(buttonVariants({ size: "lg" }))} href={activePersona.primaryCtaHref}>
                {activePersona.primaryCtaLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link className={cn(buttonVariants({ size: "lg", variant: "secondary" }))} href={activePersona.secondaryCtaHref}>
                {activePersona.secondaryCtaLabel}
              </Link>
              <a
                className={cn(buttonVariants({ size: "lg", variant: "outline" }))}
                href={judgeViewUrl}
                rel="noreferrer"
                target="_blank"
              >
                Open judge proof view
              </a>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {storyCards.map((item) => {
                const Icon = item.icon;

                return (
                  <Link key={item.title} href={item.href} className="group">
                    <div className="h-full rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,15,29,0.94),rgba(6,9,20,0.98))] p-5 transition hover:border-cyan-300/22 hover:bg-[linear-gradient(180deg,rgba(15,22,40,0.95),rgba(8,11,24,0.99))]">
                      <div className="flex h-10 w-10 items-center justify-center rounded-[18px] border border-white/10 bg-white/[0.04] text-cyan-200">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="mt-4 text-base font-medium text-white">{item.title}</div>
                      <p className="mt-2 text-sm leading-7 text-white/56">{item.description}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          <Card className="overflow-hidden border-white/12 bg-[linear-gradient(180deg,rgba(13,18,34,0.94),rgba(7,10,22,0.98))] xl:mt-1">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-300/15 bg-emerald-300/10 text-emerald-200">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-[0.28em] text-white/40">Do something now</div>
                  <CardTitle className="mt-2">Fastest path from landing page to live Devnet action</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
                <div className="text-[11px] uppercase tracking-[0.28em] text-white/42">Live on</div>
                <div className="mt-2 text-2xl font-semibold text-white">Solana Devnet</div>
                <div className="mt-2 text-sm leading-7 text-white/56">
                  Start from wallet connection, move into governance, and keep live state and proof one click away.
                </div>
              </div>

              <div className="grid gap-3">
                {fastActionSteps.map((item) => (
                  <div key={item.title} className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="text-base font-medium text-white">{item.title}</div>
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" />
                    </div>
                    <p className="mt-2 text-sm leading-7 text-white/58">{item.description}</p>
                    <Link className={cn(buttonVariants({ size: "sm", variant: "secondary" }), "mt-4 w-full justify-between")} href={item.href}>
                      {item.cta}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                ))}
              </div>

              <div className="rounded-[24px] border border-amber-300/18 bg-[linear-gradient(180deg,rgba(61,46,9,0.92),rgba(26,20,5,0.98))] p-4">
                <div className="flex items-center gap-2 text-amber-100">
                  <Trophy className="h-4 w-4" />
                  <div className="text-[11px] uppercase tracking-[0.28em]">Recognition</div>
                </div>
                <div className="mt-2 text-lg font-semibold text-amber-50">1st Place · Superteam Poland</div>
                <div className="mt-2 text-sm leading-7 text-amber-50/70">
                  Strong proof remains available for judges and investors, but the homepage now stays focused on product action first.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto mt-16 w-full max-w-7xl px-4 sm:mt-20 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Start here"
          title="Open the exact PrivateDAO surface you need without guessing route names"
          description="The homepage should behave like a product front door: act now, learn fast, and open deeper proof only when you actually need it."
        />
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(11,16,31,0.92),rgba(7,10,22,0.98))]">
            <CardHeader>
              <CardTitle className="text-2xl">Start the live app</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-7 text-white/58">
                Connect a wallet and move straight into the guided Devnet flow without reading docs first.
              </p>
              <Link className={cn(buttonVariants({ size: "sm" }))} href="/start">
                Open start workspace
              </Link>
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(11,16,31,0.92),rgba(7,10,22,0.98))]">
            <CardHeader>
              <CardTitle className="text-2xl">Inspect trust when needed</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-7 text-white/58">
                Open the judge and reviewer path only when you want the deeper proof and operating detail.
              </p>
              <Link className={cn(buttonVariants({ size: "sm", variant: "secondary" }))} href="/proof/?judge=1">
                Open judge path
              </Link>
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(11,16,31,0.92),rgba(7,10,22,0.98))]">
            <CardHeader>
              <CardTitle className="text-2xl">Explore plans and API</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-7 text-white/58">
                See service plans, hosted reads, API positioning, and commercial rollout surfaces in one place.
              </p>
              <Link className={cn(buttonVariants({ size: "sm", variant: "outline" }))} href="/services">
                Open services
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto mt-16 w-full max-w-7xl px-4 sm:mt-18 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Quick access"
          title="Choose a route by task, not by internal architecture"
          description="These cards translate the product into plain next actions instead of exposing internal naming that only makes sense to the team."
        />
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {primaryRoutes.map((item) => {
            const Icon = item.icon;

            return (
              <Card key={item.title} className="border-white/10 bg-[linear-gradient(180deg,rgba(10,15,30,0.92),rgba(6,9,20,0.98))]">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-[18px] border border-white/10 bg-white/[0.04] text-cyan-200">
                      <Icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-xl">{item.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm leading-7 text-white/58">{item.description}</p>
                  <Link className={cn(buttonVariants({ size: "sm", variant: "secondary" }), "w-full justify-between")} href={item.href}>
                    {item.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="mx-auto mt-16 w-full max-w-7xl px-4 sm:mt-18 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Why teams trust it"
          title="A user-first governance product with proof behind it, not proof pasted in front of it"
          description="The homepage now keeps the message simple: act on Devnet quickly, then open the deeper trust and review surfaces only when needed."
        />
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {achievements.map((item) => (
            <Card key={item.title} className="border-amber-300/18 bg-[linear-gradient(180deg,rgba(56,43,8,0.92),rgba(27,20,5,0.98))]">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl text-amber-50">{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-2xl border border-amber-200/12 bg-black/18 px-4 py-3 text-sm leading-7 text-amber-50/72">
                  {item.detail}
                </div>
                <div className="text-[11px] uppercase tracking-[0.28em] text-amber-200/68">{item.meta}</div>
              </CardContent>
            </Card>
          ))}

          <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(10,15,30,0.92),rgba(6,9,20,0.98))] lg:col-span-2">
            <CardHeader className="pb-4">
              <CardTitle>What users get right away</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {trustSignals.map((signal) => (
                <div key={signal} className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4 text-sm leading-7 text-white/60">
                  {signal}
                </div>
              ))}
              {techCards.slice(0, 1).map((item) => (
                <div key={item.name} className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4 text-sm leading-7 text-white/60">
                  {item.name}: {item.description}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto mt-18 w-full max-w-7xl px-4 sm:mt-24 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Next step"
          title="When you are ready for more depth, open the dedicated surface instead of forcing it into the homepage"
          description="The homepage now stays focused. Deeper operations, proof, and rollout details live on their own routes where they belong."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(10,15,30,0.92),rgba(6,9,20,0.98))]">
            <CardHeader><CardTitle className="text-xl">Watch the demo</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-7 text-white/58">Open the hosted demo when you want the fast visual explanation.</p>
              <Link className={cn(buttonVariants({ size: "sm", variant: "secondary" }))} href="/story">Open demo</Link>
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(10,15,30,0.92),rgba(6,9,20,0.98))]">
            <CardHeader><CardTitle className="text-xl">Open live state</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-7 text-white/58">Use the dedicated live state route for proposals, treasury, and execution logs.</p>
              <Link className={cn(buttonVariants({ size: "sm", variant: "secondary" }))} href="/dashboard">Open live state</Link>
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(10,15,30,0.92),rgba(6,9,20,0.98))]">
            <CardHeader><CardTitle className="text-xl">Open trust surfaces</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-7 text-white/58">Use proof and trust routes for judges, operators, and technical review when needed.</p>
              <Link className={cn(buttonVariants({ size: "sm", variant: "outline" }))} href="/proof">Open proof</Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
