import Link from "next/link";
import { ArrowUpRight, BriefcaseBusiness, Database, LockKeyhole, ShieldCheck, TowerControl } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { getCanonicalCustodyProofSnapshot } from "@/lib/canonical-custody-proof";
import { getDevnetServiceMetrics, getOperationalValidationSnapshot } from "@/lib/devnet-service-metrics";
import type { CompetitionTrackWorkspace } from "@/lib/site-data";
import { cn } from "@/lib/utils";

type TrackOperationalEdgePanelProps = {
  workspace: CompetitionTrackWorkspace;
};

const telemetrySlugs = new Set(["rpc-infrastructure", "dune-analytics"]);
const payoutSlugs = new Set(["privacy-track", "encrypt-ika", "umbra-confidential-payout"]);
const capitalSlugs = new Set(["startup-accelerator", "poland-grants", "superteam-poland"]);

function buildTelemetryModel(workspace: CompetitionTrackWorkspace) {
  const metrics = getDevnetServiceMetrics();
  const validation = getOperationalValidationSnapshot();
  const cards = metrics.tracks[workspace.slug] ?? metrics.overview;

  return {
    eyebrow: "Telemetry export edge",
    title: "Make the telemetry corridor judge-verifiable in under a minute",
    description:
      "This track no longer depends on a generic analytics story. It now exposes a compact export corridor with the exact metrics and routes a data or RPC reviewer can validate quickly.",
    highlights: [
      {
        label: cards[0]?.label ?? "Hosted read coverage",
        value: cards[0]?.value ?? validation.proposalFlowHealth.value,
        detail: cards[0]?.detail ?? validation.proposalFlowHealth.detail,
        icon: Database,
      },
      {
        label: validation.walletReadiness.label,
        value: validation.walletReadiness.value,
        detail: validation.walletReadiness.detail,
        icon: ShieldCheck,
      },
      {
        label: validation.proofFreshness.label,
        value: validation.proofFreshness.value,
        detail: validation.proofFreshness.detail,
        icon: TowerControl,
      },
    ],
    routes: [
      { label: "Open telemetry export packet", href: "/documents/telemetry-export-packet" },
      { label: "Open analytics telemetry lane", href: "/analytics#telemetry-inspection" },
      { label: "Open monitoring closure", href: "/security#monitoring-delivery-readiness" },
      { label: "Open diagnostics", href: "/diagnostics" },
      { label: "Open runtime evidence", href: "/documents/runtime-evidence" },
    ],
  };
}

function buildPayoutModel(workspace: CompetitionTrackWorkspace) {
  const metrics = getDevnetServiceMetrics();
  const custody = getCanonicalCustodyProofSnapshot();
  const cards = metrics.tracks[workspace.slug] ?? metrics.services;

  return {
    eyebrow: "Confidential payout edge",
    title: "Show the payout corridor as a governed product lane, not a privacy claim",
    description:
      "This track now ties treasury motion, confidential settlement, custody discipline, and reviewer-safe proof together so Umbra and Encrypt judges can inspect one operational corridor.",
    highlights: [
      {
        label: cards[0]?.label ?? "REFHE settled proposals",
        value: cards[0]?.value ?? `${custody.completedItems}/${custody.totalItems}`,
        detail: cards[0]?.detail ?? custody.blocker.nextAction,
        icon: LockKeyhole,
      },
      {
        label: "Custody completion",
        value: `${custody.completedItems}/${custody.totalItems}`,
        detail: `${custody.pendingItems.length} pending item${custody.pendingItems.length === 1 ? "" : "s"} remain before any mainnet real-funds claim.`,
        icon: ShieldCheck,
      },
      {
        label: "Exact blocker",
        value: custody.blocker.status,
        detail: custody.blocker.nextAction,
        icon: BriefcaseBusiness,
      },
    ],
    routes: [
      { label: "Open payout evidence packet", href: "/documents/confidential-payout-evidence-packet" },
      { label: "Open receipt closure", href: "/services#settlement-receipt-readiness" },
      { label: "Open services payout lane", href: "/services#payout-route-selection" },
      { label: "Open security", href: "/security" },
      { label: "Open custody proof", href: "/custody" },
    ],
  };
}

function buildCapitalModel(workspace: CompetitionTrackWorkspace) {
  const validation = getOperationalValidationSnapshot();
  const custody = getCanonicalCustodyProofSnapshot();
  const primaryPacket =
    workspace.slug === "poland-grants"
      ? { label: "Open Poland grant packet", href: "/documents/poland-foundation-grant-application-packet" }
      : workspace.slug === "startup-accelerator"
        ? { label: "Open accelerator packet", href: "/documents/startup-accelerator-application-packet" }
      : { label: "Open capital readiness packet", href: "/documents/capital-readiness-packet" };

  return {
    eyebrow: "Capital readiness edge",
    title: "Make startup and grant review feel like a capital memo, not a feature dump",
    description:
      "This track now gives accelerator and grant reviewers a direct line from commercial product value to trust discipline and the exact mainnet gates that still need capital.",
    highlights: [
      {
        label: "Commercial readiness",
        value: validation.commercialReadiness.value,
        detail: validation.commercialReadiness.detail,
        icon: BriefcaseBusiness,
      },
      {
        label: "Mainnet blocker",
        value: custody.blocker.id,
        detail: custody.blocker.nextAction,
        icon: ShieldCheck,
      },
      {
        label: "Custody progress",
        value: `${custody.completedItems}/${custody.totalItems}`,
        detail: `${custody.pendingItems.length} remaining gate${custody.pendingItems.length === 1 ? "" : "s"} tie directly to audit, multisig, monitoring, receipts, and cutover discipline.`,
        icon: TowerControl,
      },
    ],
    routes: [
      primaryPacket,
      { label: "Open runtime closure", href: "/security#real-device-capture-readiness" },
      { label: "Open monitoring closure", href: "/security#monitoring-delivery-readiness" },
      { label: "Open services", href: "/services" },
      { label: "Open trust", href: "/trust" },
    ],
  };
}

export function TrackOperationalEdgePanel({ workspace }: TrackOperationalEdgePanelProps) {
  const model = telemetrySlugs.has(workspace.slug)
    ? buildTelemetryModel(workspace)
    : payoutSlugs.has(workspace.slug)
      ? buildPayoutModel(workspace)
      : capitalSlugs.has(workspace.slug)
        ? buildCapitalModel(workspace)
        : null;

  if (!model) return null;

  return (
    <Card className="border-cyan-300/16 bg-[linear-gradient(180deg,rgba(9,16,28,0.96),rgba(8,11,20,0.99))]">
      <CardHeader className="space-y-3">
        <div className="text-[11px] uppercase tracking-[0.3em] text-cyan-200/78">{model.eyebrow}</div>
        <CardTitle className="text-2xl">{model.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-sm leading-7 text-white/66">{model.description}</div>

        <div className="grid gap-4 md:grid-cols-3">
          {model.highlights.map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.label} className="rounded-3xl border border-white/8 bg-white/[0.04] p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-cyan-100">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="mt-4 text-[11px] uppercase tracking-[0.24em] text-white/54">{item.label}</div>
                <div className="mt-2 text-lg font-medium text-white">{item.value}</div>
                <div className="mt-3 text-sm leading-7 text-white/60">{item.detail}</div>
              </div>
            );
          })}
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {model.routes.map((route, index) => (
            <Link
              key={`${route.href}-${index}`}
              href={route.href}
              className={cn(buttonVariants({ variant: index === 0 ? "secondary" : "outline" }), "justify-between")}
            >
              {route.label}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
