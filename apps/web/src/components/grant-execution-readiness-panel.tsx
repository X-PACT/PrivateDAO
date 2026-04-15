import Link from "next/link";
import { ArrowUpRight, BriefcaseBusiness, CircleCheckBig, Coins, ShieldCheck, TimerReset } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import type { CompetitionTrackWorkspace } from "@/lib/site-data";
import { cn } from "@/lib/utils";

type GrantExecutionReadinessPanelProps = {
  workspace: CompetitionTrackWorkspace;
};

type GrantPanelModel = {
  eyebrow: string;
  title: string;
  summary: string;
  shippedNow: string[];
  fundUse: string[];
  milestones: string[];
  primaryPacketHref: string;
  primaryPacketLabel: string;
};

function getGrantPanelModel(workspace: CompetitionTrackWorkspace): GrantPanelModel | null {
  if (workspace.slug === "poland-grants") {
    return {
      eyebrow: "Grant execution readiness",
      title: "This Poland grant now reads like a fast, executable funding ask",
      summary:
        "The Poland grant corridor is strongest when it looks concise, open-source, and ship-fast. The funded work is now framed as the shortest path from live Devnet proof to a grant-complete release candidate.",
      shippedNow: [
        "live Devnet product with start, govern, services, trust, and story routes",
        "public proof, telemetry, custody, and blocker packets",
        "regional credibility from the Poland win and open-source repo",
      ],
      fundUse: [
        "audit and authority/custody preparation",
        "wallet/runtime coverage and settlement receipts",
        "public trust and telemetry surfaces that make ecosystem value legible fast",
      ],
      milestones: [
        "Week 1: hardening and reviewer packet closure",
        "Week 2: audit and custody preparation closure",
        "Week 3: runtime and settlement evidence closure",
        "Week 4: mainnet candidate or hardened Devnet release candidate",
      ],
      primaryPacketHref: "/documents/poland-foundation-grant-application-packet",
      primaryPacketLabel: "Open Poland grant packet",
    };
  }

  if (workspace.slug === "startup-accelerator") {
    return {
      eyebrow: "Capital execution readiness",
      title: "This accelerator corridor now reads like a company memo, not a grant wishlist",
      summary:
        "The startup corridor is strongest when reviewers see one coherent company thesis: live product, trust discipline, buyer-facing surfaces, and a narrow use-of-capital path to mainnet readiness.",
      shippedNow: [
        "live root-domain product shell with wallet-first governance",
        "commercial services, trust, story, and proof corridors",
        "documented blocker path to mainnet with explicit next actions",
      ],
      fundUse: [
        "external audit completion",
        "multisig / custody and monitoring closure",
        "final release-candidate and mainnet cutover discipline",
      ],
      milestones: [
        "Week 1: release-candidate scope and audit prep freeze",
        "Week 2: authority, custody, and timelock closure work",
        "Week 3: wallet/runtime and settlement evidence completion",
        "Week 4: mainnet cutover or explicit release-candidate closeout",
      ],
      primaryPacketHref: "/documents/startup-accelerator-application-packet",
      primaryPacketLabel: "Open accelerator packet",
    };
  }

  return null;
}

export function GrantExecutionReadinessPanel({ workspace }: GrantExecutionReadinessPanelProps) {
  const model = getGrantPanelModel(workspace);

  if (!model) return null;

  return (
    <Card className="border-emerald-300/16 bg-[linear-gradient(180deg,rgba(12,18,24,0.96),rgba(9,12,18,0.99))]">
      <CardHeader className="space-y-3">
        <div className="text-[11px] uppercase tracking-[0.3em] text-emerald-200/78">{model.eyebrow}</div>
        <CardTitle className="text-2xl">{model.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-sm leading-7 text-white/66">{model.summary}</div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-white/8 bg-white/[0.04] p-5">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-emerald-200/78">
              <CircleCheckBig className="h-4 w-4" />
              Already shipped
            </div>
            <div className="mt-4 grid gap-2 text-sm leading-7 text-white/62">
              {model.shippedNow.map((item) => (
                <div key={item}>{item}</div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/8 bg-white/[0.04] p-5">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-cyan-200/78">
              <Coins className="h-4 w-4" />
              Capital use
            </div>
            <div className="mt-4 grid gap-2 text-sm leading-7 text-white/62">
              {model.fundUse.map((item) => (
                <div key={item}>{item}</div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/8 bg-white/[0.04] p-5">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-fuchsia-200/78">
              <TimerReset className="h-4 w-4" />
              4-week execution
            </div>
            <div className="mt-4 grid gap-2 text-sm leading-7 text-white/62">
              {model.milestones.map((item) => (
                <div key={item}>{item}</div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Link href={model.primaryPacketHref} className={cn(buttonVariants({ variant: "secondary" }), "justify-between")}>
            {model.primaryPacketLabel}
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link href="/documents/funding-readiness-scorecard" className={cn(buttonVariants({ variant: "outline" }), "justify-between")}>
            Open funding scorecard
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link href="/documents/runtime-operations-readiness-packet" className={cn(buttonVariants({ variant: "outline" }), "justify-between")}>
            Open runtime ops packet
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link href="/documents/real-device-capture-closure-packet" className={cn(buttonVariants({ variant: "outline" }), "justify-between")}>
            Open capture closure
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link href="/services" className={cn(buttonVariants({ variant: "outline" }), "justify-between")}>
            Open services
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link href="/trust" className={cn(buttonVariants({ variant: "outline" }), "justify-between")}>
            Open trust
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link href="/documents/mainnet-blockers" className={cn(buttonVariants({ variant: "outline" }), "justify-between md:col-span-2 xl:col-span-2")}>
            Open blockers
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="rounded-3xl border border-cyan-300/14 bg-cyan-300/[0.06] p-5 text-sm leading-7 text-white/64">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-cyan-200/78">
            <BriefcaseBusiness className="h-4 w-4" />
            Funding posture
          </div>
          <div className="mt-3">
            This asks the reviewer to fund execution acceleration, not idea discovery. That is the strongest truthful posture we have right now.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
