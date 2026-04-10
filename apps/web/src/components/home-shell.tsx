"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Compass, LockKeyhole, PlayCircle, Radar, Shield, Sparkles, Trophy, WalletCards, Zap } from "lucide-react";

import { CommunityHub } from "@/components/community-hub";
import { GovernanceDashboard } from "@/components/governance-dashboard";
import { MetricsStrip } from "@/components/metrics-strip";
import { OperatingBoundaryPanel } from "@/components/operating-boundary-panel";
import { SectionHeader } from "@/components/section-header";
import { SolutionCorridors } from "@/components/solution-corridors";
import { VideoCenter } from "@/components/video-center";
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
      href: "/command-center",
      cta: "Open command center",
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
      href: "/security",
      cta: "Open security",
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
      href: "/story",
      icon: PlayCircle,
    },
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
                  <div className="text-[11px] uppercase tracking-[0.28em] text-white/40">Live product snapshot</div>
                  <CardTitle className="mt-2">One serious governance product, six visible operating rails</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                  <div className="text-[11px] uppercase tracking-[0.28em] text-white/42">Live on</div>
                  <div className="mt-2 text-2xl font-semibold text-white">Solana Devnet</div>
                  <div className="mt-2 text-sm leading-7 text-white/56">Wallet-first product shell with proof, diagnostics, tracks, and services already routed.</div>
                </div>
                <div className="rounded-[24px] border border-amber-300/18 bg-[linear-gradient(180deg,rgba(61,46,9,0.92),rgba(26,20,5,0.98))] p-4">
                  <div className="flex items-center gap-2 text-amber-100">
                    <Trophy className="h-4 w-4" />
                    <div className="text-[11px] uppercase tracking-[0.28em]">Achievement</div>
                  </div>
                  <div className="mt-2 text-lg font-semibold text-amber-50">1st Place · Superteam Poland</div>
                  <div className="mt-2 text-sm leading-7 text-amber-50/70">Execution proof belongs here, not repeated across the hero and top navigation.</div>
                </div>
              </div>

              <div className="grid gap-3">
                {techCards.map((item, index) => (
                  <div key={item.name} className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-[18px] border border-white/8 bg-black/30 text-white/85">
                        {index === 0 ? (
                          <Sparkles className="h-4 w-4" />
                        ) : index === 1 ? (
                          <LockKeyhole className="h-4 w-4" />
                        ) : index === 2 ? (
                          <Shield className="h-4 w-4" />
                        ) : (
                          <Zap className="h-4 w-4" />
                        )}
                      </div>
                      <div className="text-base font-medium text-white">{item.name}</div>
                    </div>
                    <p className="mt-2 text-sm leading-7 text-white/58">{item.description}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Link className={cn(buttonVariants({ size: "sm" }), "justify-between")} href="/dashboard">
                  Open dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link className={cn(buttonVariants({ size: "sm", variant: "secondary" }), "justify-between")} href="/tracks">
                  Open tracks
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto mt-14 w-full max-w-7xl px-4 sm:mt-18 sm:px-6 lg:px-8">
        <MetricsStrip />
      </section>

      <section className="mx-auto mt-8 w-full max-w-7xl px-4 sm:mt-10 sm:px-6 lg:px-8">
        <OperatingBoundaryPanel />
      </section>

      <section className="mx-auto mt-16 w-full max-w-7xl px-4 sm:mt-20 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Start Building"
          title="Reference paths for governance, proof, and end-user rollout"
          description="The landing page should make the first three moves obvious: launch the product flow, inspect the proof stack, or open the service corridor."
        />
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(11,16,31,0.92),rgba(7,10,22,0.98))]">
            <CardHeader>
              <CardTitle className="text-2xl">Launch the live app</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-7 text-white/58">
                Start with the guided onboarding, connect a wallet, and continue into the operational flow without reading documentation first.
              </p>
              <Link className={cn(buttonVariants({ size: "sm" }))} href="/start">
                Open start workspace
              </Link>
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(11,16,31,0.92),rgba(7,10,22,0.98))]">
            <CardHeader>
              <CardTitle className="text-2xl">Inspect proof and trust</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-7 text-white/58">
                Jump straight into the reviewer path, V3 packet, ZK matrix, and trust surfaces that explain why the system is credible on Devnet today.
              </p>
              <Link className={cn(buttonVariants({ size: "sm", variant: "secondary" }))} href="/proof/?judge=1">
                Open judge path
              </Link>
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(11,16,31,0.92),rgba(7,10,22,0.98))]">
            <CardHeader>
              <CardTitle className="text-2xl">Package services and rollout</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-7 text-white/58">
                Open the service corridor for pilot packages, hosted reads, enterprise governance, and competition-facing buyer narratives.
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
          title="Open the exact PrivateDAO surface you need without scrolling through a long landing page"
          description="The homepage now behaves like a startup product front door: it points users directly to the route they need instead of embedding every heavy panel inline."
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
          eyebrow="Why PrivateDAO"
          title="A Solana-native governance product shaped around the rails judges and users actually inspect"
          description="The product is not just a dashboard. It connects private governance, proof, diagnostics, services, and track-specific submission posture in one system."
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
              <CardTitle>Why the stack is credible</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4 text-sm leading-7 text-white/60">
                `ZK`, `REFHE`, `MagicBlock`, and `Fast RPC` are visible as product rails, not hidden implementation details.
              </div>
              <div className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4 text-sm leading-7 text-white/60">
                Judges, operators, and normal users each get their own route into the same live system without breaking the product story.
              </div>
              <div className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4 text-sm leading-7 text-white/60">
                The system stays truth-aligned about Devnet, hardening, launch blockers, and external dependencies.
              </div>
              <div className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4 text-sm leading-7 text-white/60">
                Wallet UX, proof continuity, commercial corridors, and competition tracks all point to one coherent startup surface.
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto mt-18 w-full max-w-7xl px-4 sm:mt-24 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Story Video"
          title="A single upload-ready reel that explains everything we offer and why PrivateDAO wins"
          description="The product now ships with one comprehensive video hosted on the live site. It covers the product, the cryptographic stack, the service corridors, and the strongest competition-ready paths in a single watch surface."
        />
        <div className="mt-10">
          <VideoCenter compact />
        </div>
      </section>

      <section className="mx-auto mt-18 w-full max-w-7xl px-4 sm:mt-24 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Operational Dashboard"
          title="A real governance dashboard, centered and readable instead of buried in a long landing page"
          description="The main operational board stays visible on the homepage as a single strong preview, while the full route remains available at `/dashboard`."
        />
        <div className="mt-10 hidden lg:block">
          <GovernanceDashboard />
          <div className="mt-6 flex justify-end">
            <Link className={cn(buttonVariants({ size: "sm", variant: "secondary" }))} href="/dashboard">
              Open full dashboard
            </Link>
          </div>
        </div>
        <div className="mt-8 lg:hidden">
          <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(10,15,30,0.92),rgba(6,9,20,0.98))]">
            <CardHeader>
              <CardTitle className="text-2xl">Open the full dashboard on mobile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-7 text-white/58">
                The mobile homepage keeps the dashboard summary lightweight. Use the dedicated route for the full treasury, proposal, and execution board.
              </p>
              <Link className={cn(buttonVariants({ size: "sm", variant: "secondary" }))} href="/dashboard">
                Open full dashboard
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto mt-18 w-full max-w-7xl px-4 sm:mt-24 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Routes and Corridors"
          title="Use-case corridors, product rails, and community surfaces stay visible without bloating the homepage"
          description="This keeps the product understandable to buyers, users, judges, and sponsors while leaving each heavy surface on its own dedicated route."
        />
        <div className="mt-10 grid gap-8 xl:grid-cols-[1.08fr_0.92fr]">
          <SolutionCorridors />
          <div className="space-y-6">
            <div className="hidden xl:block">
              <VideoCenter compact />
            </div>
            <CommunityHub />
          </div>
        </div>
      </section>
    </main>
  );
}
