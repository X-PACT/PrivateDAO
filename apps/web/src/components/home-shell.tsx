"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, LockKeyhole, Shield, Sparkles, Zap } from "lucide-react";

import { BuyerJourneyRail } from "@/components/buyer-journey-rail";
import { CommandCenter } from "@/components/command-center";
import { GovernanceDashboard } from "@/components/governance-dashboard";
import { DiagnosticsCenter } from "@/components/diagnostics-center";
import { MetricsStrip } from "@/components/metrics-strip";
import { ProofCenter } from "@/components/proof-center";
import { SecurityCenter } from "@/components/security-center";
import { SectionHeader } from "@/components/section-header";
import { ServicesSurface } from "@/components/services-surface";
import { SolutionCorridors } from "@/components/solution-corridors";
import { SponsorSignalBar } from "@/components/sponsor-signal-bar";
import { VideoCenter } from "@/components/video-center";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { heroPersonas, servicePacks, techCards } from "@/lib/site-data";
import { useSiteUrls } from "@/lib/site-urls";
import { cn } from "@/lib/utils";

export function HomeShell() {
  const [persona, setPersona] = useState<keyof typeof heroPersonas>("buyer");
  const activePersona = heroPersonas[persona];
  const { judgeViewUrl } = useSiteUrls();

  return (
    <main className="pb-24">
      <section className="mx-auto w-full max-w-7xl px-4 pt-12 sm:px-6 lg:px-8 lg:pt-20">
        <div className="grid items-end gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-8">
            <div className="flex flex-wrap gap-3">
              <Badge variant="warning">1st Place - Superteam Poland</Badge>
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
            <div className="space-y-6">
              <div className="text-[11px] uppercase tracking-[0.34em] text-emerald-300/80">{activePersona.eyebrow}</div>
              <div className="max-w-4xl text-5xl font-semibold tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl">
                {activePersona.title}
              </div>
              <p className="max-w-2xl text-lg leading-8 text-white/62 sm:text-xl">
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
              <Card className="bg-white/[0.03]">
                <CardContent className="p-5">
                  <div className="text-[11px] uppercase tracking-[0.3em] text-emerald-300/70">Lifecycle</div>
                  <div className="mt-3 text-2xl font-semibold text-white">Create → Vote → Execute</div>
                  <div className="mt-2 text-sm leading-7 text-white/55">One continuous governance and treasury rail for reviewers and operators.</div>
                </CardContent>
              </Card>
              <Card className="bg-white/[0.03]">
                <CardContent className="p-5">
                  <div className="text-[11px] uppercase tracking-[0.3em] text-fuchsia-300/70">Security</div>
                  <div className="mt-3 text-2xl font-semibold text-white">V3 hardening</div>
                  <div className="mt-2 text-sm leading-7 text-white/55">Quorum snapshots, evidence gates, and additive policy companions stay explicit.</div>
                  <Link className="mt-4 inline-flex text-sm text-cyan-200 transition hover:text-cyan-100" href="/documents/governance-hardening-v3">
                    Open curated hardening doc
                  </Link>
                </CardContent>
              </Card>
              <Card className="bg-white/[0.03]">
                <CardContent className="p-5">
                  <div className="text-[11px] uppercase tracking-[0.3em] text-cyan-300/70">Commercial</div>
                  <div className="mt-3 text-2xl font-semibold text-white">API + services</div>
                  <div className="mt-2 text-sm leading-7 text-white/55">Pilot-ready packs, hosted read surfaces, and operator trust packets.</div>
                  <Link className="mt-4 inline-flex text-sm text-cyan-200 transition hover:text-cyan-100" href="/documents/trust-package">
                    Open curated trust package
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>

          <Card className="overflow-hidden border-white/12">
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
            <CardContent className="grid gap-4">
              {techCards.map((item, index) => (
                <div key={item.name} className="rounded-3xl border border-white/8 bg-white/4 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/8 bg-black/30 text-white/85">
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
                    <div className="text-lg font-medium text-white">{item.name}</div>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-white/58">{item.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto mt-18 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <MetricsStrip />
      </section>

      <section className="mx-auto mt-18 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Sponsor-ready identity"
          title="A Solana-native visual surface with sponsor-aware product signals"
          description="The new shell leans into Solana’s signature gradient language while still giving sponsor-aligned corridors room to feel intentional, modern, and professional."
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
          eyebrow="Solution Corridors"
          title="One governance product, multiple user-ready corridors"
          description="The professional surface should make it obvious how the same stack serves private treasury teams, Realms-style committees, Android operators, gaming reward corridors, and RPC or API buyers."
        />
        <div className="mt-10">
          <SolutionCorridors />
        </div>
      </section>

      <section className="mx-auto mt-24 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Buyer Journey"
          title="The migration keeps the product path obvious for normal users"
          description="Instead of forcing users through a raw governance console, the app should guide them from product-pack selection to DAO setup, proposal submission, private voting, and treasury execution."
        />
        <div className="mt-10">
          <BuyerJourneyRail />
        </div>
      </section>

      <section className="mx-auto mt-24 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Command Center"
          title="The core governance flow stays in one visible product rail"
          description="Proposal creation, voting, evidence gates, and treasury execution should feel connected to the same product surface rather than split across unrelated screens."
        />
        <div className="mt-10">
          <CommandCenter />
        </div>
      </section>

      <section className="mx-auto mt-24 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Governance dashboard"
          title="A reusable React dashboard for proposals, treasury actions, and execution visibility"
          description="This migration keeps the current product story intact: proposal cards, a treasury table, status badges, a vote timeline, and an execution log panel in one reusable surface."
        />
        <div className="mt-10">
          <GovernanceDashboard />
        </div>
      </section>

      <section className="mx-auto mt-24 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Proof center"
          title="Baseline proof, V3 hardening, and runtime evidence stay first-class in the new app"
          description="The migration should carry forward the reviewer story that already exists in the repository, including generated packets, integration proof, and honest launch boundaries."
        />
        <div className="mt-10">
          <ProofCenter />
        </div>
      </section>

      <section className="mx-auto mt-24 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Security"
          title="Security and launch boundaries stay visible in the product, not only in docs"
          description="Additive V3 hardening, launch blockers, integrations, and audit-oriented trust surfaces should remain understandable to operators, judges, and buyers."
        />
        <div className="mt-10">
          <SecurityCenter />
        </div>
      </section>

      <section className="mx-auto mt-24 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Product packs"
          title="Commercial surfaces that still explain the technology clearly"
          description="PrivateDAO is not only a protocol. The app also needs to communicate service packs, API-ready operations, and buyer-friendly rollout paths."
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-4">
          {servicePacks.map((pack) => (
            <Card key={pack.name} className="h-full">
              <CardHeader>
                <CardTitle className="text-lg">{pack.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex h-full flex-col gap-4">
                <p className="text-sm leading-7 text-white/58">{pack.fit}</p>
                <div className="mt-auto rounded-3xl border border-white/8 bg-white/4 p-4 text-sm text-white/70">{pack.cta}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-24 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Services"
          title="API and operator services presented in the same product language"
          description="The migration keeps the hosted read API, pilot, and operator support surfaces visible to normal users instead of burying them in documentation."
        />
        <div className="mt-10">
          <ServicesSurface />
        </div>
      </section>

      <section className="mx-auto mt-24 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Diagnostics"
          title="Generated artifacts and runtime checks stay close to the product experience"
          description="The migration should not lose the operator story: reviewer bundles, readiness gates, wallet runtime boundaries, and artifact freshness all need a clean UI surface."
        />
        <div className="mt-10">
          <DiagnosticsCenter />
        </div>
      </section>
    </main>
  );
}
