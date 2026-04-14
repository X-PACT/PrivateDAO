"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Compass, PlayCircle, Shield, Trophy } from "lucide-react";

import { SectionHeader } from "@/components/section-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { achievements, techCards } from "@/lib/site-data";
import { useSiteUrls } from "@/lib/site-urls";
import { cn } from "@/lib/utils";

export function HomeShell() {
  const { judgeViewUrl } = useSiteUrls();
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
      description: "Start from the onboarding flow and connect a Devnet-ready wallet without guessing which route to open.",
      href: "/start",
      cta: "Open start",
    },
    {
      title: "2. Create and govern",
      description: "Create a DAO, submit a proposal, vote, and execute from one guided governance surface.",
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
    "PrivateDAO is a wallet-first app for creating a private Solana DAO and running proposals on Devnet.",
    "Proof and trust surfaces are available when you need them, but they no longer block the first run.",
    "Web, Android, and reviewer routes now point to one product story instead of competing shells.",
  ];

  return (
    <main className="pb-20 sm:pb-24">
      <section className="mx-auto w-full max-w-7xl px-4 pt-8 sm:px-6 sm:pt-12 lg:px-8 lg:pt-18">
        <div className="grid items-start gap-8 xl:grid-cols-[1.14fr_0.86fr] xl:gap-10">
          <div className="space-y-6 sm:space-y-8">
            <div className="flex flex-wrap gap-3">
              <Badge variant="cyan">Private governance on Solana</Badge>
              <Badge variant="violet">Devnet live flow</Badge>
              <Badge variant="success">User-first start</Badge>
            </div>
            <div className="space-y-4 sm:space-y-5">
              <div className="text-[11px] uppercase tracking-[0.34em] text-emerald-300/80">What PrivateDAO does</div>
              <div className="max-w-3xl text-3xl font-semibold tracking-[-0.045em] text-white sm:text-5xl lg:text-[4rem] xl:text-[4.35rem]">
                Create a private Solana DAO, submit a proposal, vote, and execute without leaving one guided wallet flow.
              </div>
              <p className="max-w-2xl text-sm leading-7 text-white/62 sm:text-lg sm:leading-8">
                PrivateDAO turns treasury decisions into a simple Devnet product flow. Start with wallet connection, create a DAO, move into proposals and voting, then inspect live state and proof only when you need more depth.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link className={cn(buttonVariants({ size: "lg" }))} href="/start">
                Start in under a minute
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link className={cn(buttonVariants({ size: "lg", variant: "secondary" }))} href="/govern">
                Open the live governance flow
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
                  <div className="text-[11px] uppercase tracking-[0.28em] text-white/40">Try it now</div>
                  <CardTitle className="mt-2">The shortest path from landing page to a real Devnet action</CardTitle>
                  </div>
                </div>
              </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
                <div className="text-[11px] uppercase tracking-[0.28em] text-white/42">Use case</div>
                <div className="mt-2 text-2xl font-semibold text-white">Solana Devnet</div>
                <div className="mt-2 text-sm leading-7 text-white/56">
                  Use it when you want a team or community to create a DAO, propose an action, vote privately, and execute from one surface.
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
                  Strong proof remains available for judges and investors, but the homepage now stays focused on what the product lets a user do first.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto mt-16 w-full max-w-7xl px-4 sm:mt-18 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Why it feels credible"
          title="A governance product first, with proof behind it"
          description="The public surface now explains the product in plain language, then lets power users open trust and proof when they want the deeper layer."
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
          eyebrow="Need more?"
          title="Go deeper only when you need it"
          description="The homepage stays focused on using the product. Demo, live state, and trust stay available when you intentionally want more depth."
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
              <Link className={cn(buttonVariants({ size: "sm", variant: "secondary" }))} href="/live">Open live state</Link>
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
