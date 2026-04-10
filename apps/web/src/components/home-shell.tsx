"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Compass, LockKeyhole, Radar, Shield, Sparkles, WalletCards, Zap } from "lucide-react";

import { BuyerJourneyRail } from "@/components/buyer-journey-rail";
import { GovernanceDashboard } from "@/components/governance-dashboard";
import { MetricsStrip } from "@/components/metrics-strip";
import { SectionHeader } from "@/components/section-header";
import { SolutionCorridors } from "@/components/solution-corridors";
import { SponsorSignalBar } from "@/components/sponsor-signal-bar";
import { VideoCenter } from "@/components/video-center";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { achievements, heroPersonas, servicePacks, techCards } from "@/lib/site-data";
import { useSiteUrls } from "@/lib/site-urls";
import { cn } from "@/lib/utils";

export function HomeShell() {
  const [persona, setPersona] = useState<keyof typeof heroPersonas>("buyer");
  const activePersona = heroPersonas[persona];
  const { judgeViewUrl } = useSiteUrls();
  const surfaceCards = [
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

  return (
    <main className="pb-24">
      <section className="mx-auto w-full max-w-7xl px-4 pt-12 sm:px-6 lg:px-8 lg:pt-18">
        <div className="grid items-start gap-8 xl:grid-cols-[1.12fr_0.88fr]">
          <div className="space-y-7">
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
            <div className="space-y-5">
              <div className="text-[11px] uppercase tracking-[0.34em] text-emerald-300/80">{activePersona.eyebrow}</div>
              <div className="max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl lg:text-[3.8rem] xl:text-[4rem]">
                {activePersona.title}
              </div>
              <p className="max-w-2xl text-base leading-8 text-white/62 sm:text-lg">
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
          </div>

          <Card className="overflow-hidden border-white/12 bg-[linear-gradient(180deg,rgba(13,18,34,0.94),rgba(7,10,22,0.98))] xl:mt-2">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-300/15 bg-emerald-300/10 text-emerald-200">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-[0.28em] text-white/40">Live product stack</div>
                  <CardTitle className="mt-2">Technology rails built into the product</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-3">
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
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto mt-18 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <MetricsStrip />
      </section>

      <section className="mx-auto mt-20 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
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

      <section className="mx-auto mt-18 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Achievements"
          title="Proof of execution, shown once and in the right place"
          description="Recognition belongs in a dedicated achievement layer, not repeated across the hero and top navigation."
        />
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {achievements.map((item) => (
            <Card key={item.title} className="border-amber-300/18 bg-[linear-gradient(180deg,rgba(56,43,8,0.92),rgba(27,20,5,0.98))]">
              <CardHeader>
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
        </div>
      </section>

      <section className="mx-auto mt-18 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Why PrivateDAO"
          title="A Solana-native governance product with visible sponsor-fit and real operating rails"
          description="This layer should feel closer to the Solana DAO reference page: fewer distractions, clearer strengths, and a direct explanation of why the product belongs on Solana."
        />
        <div className="mt-8">
          <SponsorSignalBar />
        </div>
      </section>

      <section className="mx-auto mt-24 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Story Video"
          title="A single upload-ready reel that explains everything we offer and why PrivateDAO wins"
          description="The product now ships with one comprehensive video hosted on the live site. It covers the product, the cryptographic stack, the service corridors, and the strongest competition-ready paths in a single watch surface."
        />
        <div className="mt-10">
          <VideoCenter compact />
        </div>
      </section>

      <section className="mx-auto mt-24 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Explore PrivateDAO"
          title="Every heavy surface stays real, but the homepage now behaves like a product entrypoint"
          description="Instead of stacking every operational panel on the landing page, route users into the exact surface they need: command flow, proof, security, diagnostics, services, or competition tracks."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {surfaceCards.map((item) => {
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

      <section className="mx-auto mt-24 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Operational Dashboard"
          title="A calmer, more product-grade dashboard for proposals, treasury, and execution posture"
          description="The dashboard stays real and interactive, but it now sits in one concentrated section with clearer ratios, better card rhythm, and less homepage noise around it."
        />
        <div className="mt-10">
          <GovernanceDashboard />
        </div>
      </section>

      <section className="mx-auto mt-24 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Corridors"
          title="The same stack still powers buyer corridors, operator paths, and service packaging"
          description="The homepage now samples these routes instead of embedding every heavy panel, while keeping all corridors live and reachable in one click."
        />
        <div className="mt-10 grid gap-8 xl:grid-cols-[1.08fr_0.92fr]">
          <SolutionCorridors />
          <div className="space-y-6">
            <BuyerJourneyRail />
            <div className="grid gap-5 sm:grid-cols-2">
              {servicePacks.slice(0, 4).map((pack) => (
                <Card key={pack.name} className="h-full border-white/10 bg-[linear-gradient(180deg,rgba(10,15,30,0.92),rgba(6,9,20,0.98))]">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{pack.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm leading-7 text-white/58">{pack.fit}</p>
                    <div className="rounded-[22px] border border-white/8 bg-white/[0.03] p-3 text-sm text-white/68">{pack.cta}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
