"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Radar,
  ReceiptText,
  WalletCards,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import {
  type PayoutRouteOption,
  type ProposalReviewOption,
  type TelemetryInspectorMode,
  type WalletFirstServiceAction,
  type WalletFirstServiceActionContext,
  type WalletFirstServiceWorkbenchData,
} from "@/lib/wallet-first-service-actions";
import { cn } from "@/lib/utils";

type WalletFirstServiceActionsWorkbenchProps = {
  context: WalletFirstServiceActionContext;
  data: WalletFirstServiceWorkbenchData;
};

type LaneSlug = WalletFirstServiceAction["slug"];

const laneMeta = {
  "proposal-review": {
    icon: ReceiptText,
    eyebrow: "Proposal review",
  },
  "payout-route-selection": {
    icon: WalletCards,
    eyebrow: "Payout route selection",
  },
  "telemetry-inspection": {
    icon: Radar,
    eyebrow: "Telemetry inspection",
  },
} as const;

const copy = {
  start: {
    title: "Wallet-first service workbench",
    description:
      "Run the first three product loops from the UI itself: choose the proposal context, select the governed payout corridor, and inspect telemetry mode without dropping into documents or terminal-first operations.",
  },
  services: {
    title: "Commercial service workbench",
    description:
      "Keep the commercial path executable. Buyers should be able to choose the proposal context, pick the payout corridor, and inspect telemetry posture from the services surface itself.",
  },
  "command-center": {
    title: "Operator service workbench",
    description:
      "The command shell should not only point to routes. It should let operators stage proposal review, choose payout paths, and switch telemetry mode before taking the next action.",
  },
} as const;

function LaneButtons({
  actions,
  activeLane,
  onChange,
}: {
  actions: WalletFirstServiceAction[];
  activeLane: LaneSlug;
  onChange: (value: LaneSlug) => void;
}) {
  return (
    <div className="grid gap-3 xl:grid-cols-3">
      {actions.map((action) => {
        const Icon = laneMeta[action.slug].icon;
        const isActive = action.slug === activeLane;

        return (
          <button
            key={action.slug}
            type="button"
            onClick={() => onChange(action.slug)}
            className={cn(
              "rounded-[24px] border p-4 text-left transition",
              isActive
                ? "border-fuchsia-300/28 bg-fuchsia-300/[0.12] text-white"
                : "border-white/8 bg-white/[0.03] text-white/82 hover:bg-white/[0.05]",
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-2xl border",
                  isActive
                    ? "border-fuchsia-300/35 bg-black/25 text-fuchsia-100"
                    : "border-white/10 bg-black/20 text-fuchsia-200",
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-[0.24em] text-white/42">
                  {laneMeta[action.slug].eyebrow}
                </div>
                <div className="mt-1 text-base font-medium">{action.title}</div>
              </div>
            </div>
            <div className="mt-3 text-sm leading-7 text-white/58">{action.summary}</div>
            <div className="mt-4 rounded-[18px] border border-white/8 bg-black/20 p-3">
              <div className="text-[11px] uppercase tracking-[0.2em] text-white/38">Current state</div>
              <div className="mt-2 text-sm font-medium text-white">{action.state}</div>
              <div className="mt-2 text-sm leading-7 text-white/54">{action.stateDetail}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function ProposalReviewForm({
  proposals,
}: {
  proposals: ProposalReviewOption[];
}) {
  const [selectedId, setSelectedId] = useState(proposals[0]?.id ?? "");

  const selected = useMemo(
    () => proposals.find((item) => item.id === selectedId) ?? proposals[0],
    [proposals, selectedId],
  );

  if (!selected) return null;

  return (
    <div className="grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
      <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
        <div className="text-[11px] uppercase tracking-[0.24em] text-white/40">Prefilled review context</div>
        <div className="mt-4 grid gap-2">
          {proposals.map((proposal) => (
            <button
              key={proposal.id}
              type="button"
              onClick={() => setSelectedId(proposal.id)}
              className={cn(
                "rounded-2xl border px-4 py-3 text-left text-sm transition",
                proposal.id === selected.id
                  ? "border-cyan-300/30 bg-cyan-300/12 text-cyan-100"
                  : "border-white/8 bg-black/20 text-white/68 hover:bg-white/[0.05]",
              )}
            >
              <div className="font-medium">{proposal.id}</div>
              <div className="mt-1 text-white/54">{proposal.title}</div>
            </button>
          ))}
        </div>
      </div>
      <div className="rounded-[24px] border border-white/8 bg-black/20 p-5">
        <div className="text-[11px] uppercase tracking-[0.24em] text-white/40">Selected proposal</div>
        <div className="mt-3 text-xl font-medium text-white">{selected.title}</div>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
            <div className="text-[11px] uppercase tracking-[0.2em] text-white/38">Status</div>
            <div className="mt-2 text-sm font-medium text-white">{selected.status}</div>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
            <div className="text-[11px] uppercase tracking-[0.2em] text-white/38">Window</div>
            <div className="mt-2 text-sm font-medium text-white">{selected.window}</div>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
            <div className="text-[11px] uppercase tracking-[0.2em] text-white/38">Treasury</div>
            <div className="mt-2 text-sm font-medium text-white">{selected.treasury}</div>
          </div>
        </div>
        <div className="mt-4 text-sm leading-7 text-white/58">{selected.summary}</div>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Link href={selected.primaryHref} className={cn(buttonVariants({ variant: "secondary" }), "justify-between")}>
            {selected.primaryLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href={selected.proofHref} className={cn(buttonVariants({ variant: "outline" }), "justify-between")}>
            {selected.proofLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function PayoutRouteForm({
  payouts,
}: {
  payouts: PayoutRouteOption[];
}) {
  const [selectedSlug, setSelectedSlug] = useState(payouts[0]?.slug ?? "pilot-funding");

  const selected = useMemo(
    () => payouts.find((item) => item.slug === selectedSlug) ?? payouts[0],
    [payouts, selectedSlug],
  );

  if (!selected) return null;

  return (
    <div className="grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
      <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
        <div className="text-[11px] uppercase tracking-[0.24em] text-white/40">Governed profile selection</div>
        <div className="mt-4 grid gap-2">
          {payouts.map((item) => (
            <button
              key={item.slug}
              type="button"
              onClick={() => setSelectedSlug(item.slug)}
              className={cn(
                "rounded-2xl border px-4 py-3 text-left text-sm transition",
                item.slug === selected.slug
                  ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-100"
                  : "border-white/8 bg-black/20 text-white/68 hover:bg-white/[0.05]",
              )}
            >
              <div className="font-medium">{item.title}</div>
              <div className="mt-1 text-white/54">{item.routeFocus}</div>
            </button>
          ))}
        </div>
      </div>
      <div className="rounded-[24px] border border-white/8 bg-black/20 p-5">
        <div className="text-[11px] uppercase tracking-[0.24em] text-white/40">Selected payout corridor</div>
        <div className="mt-3 text-xl font-medium text-white">{selected.title}</div>
        <div className="mt-3 text-sm leading-7 text-white/58">{selected.summary}</div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
            <div className="text-[11px] uppercase tracking-[0.2em] text-white/38">Readiness</div>
            <div className="mt-2 text-sm font-medium text-white">{selected.state}</div>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
            <div className="text-[11px] uppercase tracking-[0.2em] text-white/38">Route focus</div>
            <div className="mt-2 text-sm font-medium text-white">{selected.routeFocus}</div>
          </div>
        </div>
        <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm leading-7 text-white/58">
          {selected.stateDetail}
        </div>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Link href={selected.primaryHref} className={cn(buttonVariants({ variant: "secondary" }), "justify-between")}>
            {selected.primaryLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href={selected.proofHref} className={cn(buttonVariants({ variant: "outline" }), "justify-between")}>
            {selected.proofLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function TelemetryInspectorForm({
  modes,
}: {
  modes: TelemetryInspectorMode[];
}) {
  const [selectedSlug, setSelectedSlug] = useState(modes[0]?.slug ?? "packet");

  const selected = useMemo(
    () => modes.find((item) => item.slug === selectedSlug) ?? modes[0],
    [modes, selectedSlug],
  );

  if (!selected) return null;

  return (
    <div className="grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
      <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
        <div className="text-[11px] uppercase tracking-[0.24em] text-white/40">Live mode switch</div>
        <div className="mt-4 grid gap-2">
          {modes.map((mode) => (
            <button
              key={mode.slug}
              type="button"
              onClick={() => setSelectedSlug(mode.slug)}
              className={cn(
                "rounded-2xl border px-4 py-3 text-left text-sm transition",
                mode.slug === selected.slug
                  ? "border-cyan-300/30 bg-cyan-300/12 text-cyan-100"
                  : "border-white/8 bg-black/20 text-white/68 hover:bg-white/[0.05]",
              )}
            >
              <div className="font-medium">{mode.title}</div>
              <div className="mt-1 text-white/54">{mode.summary}</div>
            </button>
          ))}
        </div>
      </div>
      <div className="rounded-[24px] border border-white/8 bg-black/20 p-5">
        <div className="text-[11px] uppercase tracking-[0.24em] text-white/40">Selected telemetry mode</div>
        <div className="mt-3 text-xl font-medium text-white">{selected.title}</div>
        <div className="mt-3 text-sm leading-7 text-white/58">{selected.summary}</div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
            <div className="text-[11px] uppercase tracking-[0.2em] text-white/38">State</div>
            <div className="mt-2 text-sm font-medium text-white">{selected.state}</div>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
            <div className="text-[11px] uppercase tracking-[0.2em] text-white/38">Mode detail</div>
            <div className="mt-2 text-sm font-medium text-white">{selected.stateDetail}</div>
          </div>
        </div>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Link href={selected.primaryHref} className={cn(buttonVariants({ variant: "secondary" }), "justify-between")}>
            {selected.primaryLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href={selected.proofHref} className={cn(buttonVariants({ variant: "outline" }), "justify-between")}>
            {selected.proofLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export function WalletFirstServiceActionsWorkbench({
  context,
  data,
}: WalletFirstServiceActionsWorkbenchProps) {
  const [activeLane, setActiveLane] = useState<LaneSlug>("proposal-review");
  const sectionCopy = copy[context];

  return (
    <Card className="border-fuchsia-300/14 bg-[linear-gradient(180deg,rgba(19,12,34,0.95),rgba(11,9,24,0.98))]">
      <CardHeader className="gap-3">
        <div className="text-[11px] uppercase tracking-[0.3em] text-fuchsia-200/80">Wallet-first actions</div>
        <CardTitle>{sectionCopy.title}</CardTitle>
        <div className="max-w-4xl text-sm leading-7 text-white/58">{sectionCopy.description}</div>
      </CardHeader>
      <CardContent className="space-y-5">
        <LaneButtons actions={data.actions} activeLane={activeLane} onChange={setActiveLane} />

        {activeLane === "proposal-review" ? (
          <ProposalReviewForm proposals={data.proposals} />
        ) : null}
        {activeLane === "payout-route-selection" ? (
          <PayoutRouteForm payouts={data.payouts} />
        ) : null}
        {activeLane === "telemetry-inspection" ? (
          <TelemetryInspectorForm modes={data.telemetryModes} />
        ) : null}
      </CardContent>
    </Card>
  );
}
