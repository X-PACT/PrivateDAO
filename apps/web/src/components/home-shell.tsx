import Link from "next/link";
import { ArrowRight, Shield, Sparkles, TrendingUp } from "lucide-react";

import { GovernanceDashboard } from "@/components/governance-dashboard";
import { MetricsStrip } from "@/components/metrics-strip";
import { ProofCenter } from "@/components/proof-center";
import { SectionHeader } from "@/components/section-header";
import { ServicesSurface } from "@/components/services-surface";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { servicePacks, techCards } from "@/lib/site-data";
import { cn } from "@/lib/utils";

export function HomeShell() {
  return (
    <main className="pb-24">
      <section className="mx-auto w-full max-w-7xl px-4 pt-12 sm:px-6 lg:px-8 lg:pt-20">
        <div className="grid items-end gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-8">
            <div className="flex flex-wrap gap-3">
              <Badge variant="warning">1st Place - Superteam Poland</Badge>
              <Badge variant="cyan">Private governance on Solana</Badge>
              <Badge variant="violet">ZK + REFHE + MagicBlock + Fast RPC</Badge>
            </div>
            <div className="space-y-6">
              <div className="max-w-4xl text-5xl font-semibold tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl">
                Governance and treasury execution that feels like a real product, not a protocol demo.
              </div>
              <p className="max-w-2xl text-lg leading-8 text-white/62 sm:text-xl">
                PrivateDAO combines private voting, additive hardening, confidential payout rails, runtime trust packets, and commercial service surfaces in one governance dashboard.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link className={cn(buttonVariants({ size: "lg" }))} href="/dashboard">
                Open governance dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                className={cn(buttonVariants({ size: "lg", variant: "secondary" }))}
                href="https://x-pact.github.io/PrivateDAO/?page=proof&judge=1"
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
                </CardContent>
              </Card>
              <Card className="bg-white/[0.03]">
                <CardContent className="p-5">
                  <div className="text-[11px] uppercase tracking-[0.3em] text-cyan-300/70">Commercial</div>
                  <div className="mt-3 text-2xl font-semibold text-white">API + services</div>
                  <div className="mt-2 text-sm leading-7 text-white/55">Pilot-ready packs, hosted read surfaces, and operator trust packets.</div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Card className="overflow-hidden border-white/12">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-emerald-300/15 bg-emerald-300/10 p-3 text-emerald-200">
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
                    <div className="rounded-2xl border border-white/8 bg-black/30 p-3 text-white/85">
                      {index === 0 ? <Sparkles className="h-4 w-4" /> : index === 1 ? <Shield className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
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
          eyebrow="Product packs"
          title="Commercial surfaces that still explain the technology clearly"
          description="PrivateDAO is not only a protocol. The app also needs to communicate service packs, API-ready operations, and buyer-friendly rollout paths."
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-4">
          {servicePacks.map((pack) => (
            <Card key={pack.name}>
              <CardHeader>
                <CardTitle className="text-lg">{pack.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-7 text-white/58">{pack.fit}</p>
                <div className="rounded-3xl border border-white/8 bg-white/4 p-4 text-sm text-white/70">{pack.cta}</div>
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
    </main>
  );
}
