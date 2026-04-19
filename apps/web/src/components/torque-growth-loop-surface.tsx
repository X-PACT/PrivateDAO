"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const torqueEventTemplates = [
  {
    id: "dao_created",
    title: "DAO created",
    description: "Reward the first successful organization setup from a new operator.",
    rewardIntent: "onboarding rebate",
    route: "/govern",
  },
  {
    id: "proposal_created",
    title: "Proposal created",
    description: "Measure governance activation after the user creates a real proposal.",
    rewardIntent: "builder activation points",
    route: "/govern",
  },
  {
    id: "billing_signed",
    title: "Billing signed",
    description: "Track commercial intent when the operator signs a Testnet billing SKU.",
    rewardIntent: "operator rebate",
    route: "/services/testnet-billing-rehearsal",
  },
  {
    id: "learn_completed",
    title: "Lecture completed",
    description: "Retain developers by rewarding completion of the Frontend Solana learning path.",
    rewardIntent: "education completion raffle",
    route: "/learn",
  },
];

type TorqueEventRecord = {
  id: string;
  event: string;
  rewardIntent: string;
  route: string;
  timestamp: string;
};

function buildTorquePayload(template: (typeof torqueEventTemplates)[number]) {
  return {
    project: "PrivateDAO",
    integration: "torque-mcp-growth-loop",
    custom_event: template.id,
    reward_intent: template.rewardIntent,
    route: `https://privatedao.org${template.route}/`.replace("//.", "/"),
    timestamp: new Date().toISOString(),
    metadata: {
      network: "solana-testnet",
      product: "private-governance-and-stablecoin-treasury",
      proofRoutes: ["https://privatedao.org/judge/", "https://privatedao.org/proof/?judge=1"],
    },
  };
}

export function TorqueGrowthLoopSurface() {
  const [activeId, setActiveId] = useState(torqueEventTemplates[0].id);
  const [records, setRecords] = useState<TorqueEventRecord[]>([]);
  const [deliveryState, setDeliveryState] = useState<string>("Local event log ready");
  const activeTemplate = torqueEventTemplates.find((event) => event.id === activeId) ?? torqueEventTemplates[0];
  const payload = useMemo(() => buildTorquePayload(activeTemplate), [activeTemplate]);
  const payloadText = JSON.stringify(payload, null, 2);

  async function recordEvent() {
    const record: TorqueEventRecord = {
      id: `${activeTemplate.id}-${Date.now()}`,
      event: activeTemplate.id,
      rewardIntent: activeTemplate.rewardIntent,
      route: activeTemplate.route,
      timestamp: new Date().toISOString(),
    };
    setRecords((current) => [record, ...current].slice(0, 6));

    const endpoint = process.env.NEXT_PUBLIC_TORQUE_CUSTOM_EVENT_ENDPOINT;
    if (!endpoint) {
      setDeliveryState("Event recorded locally. Add NEXT_PUBLIC_TORQUE_CUSTOM_EVENT_ENDPOINT to forward live Torque custom_events.");
      return;
    }

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setDeliveryState(response.ok ? "Torque custom_event delivered" : `Torque endpoint responded ${response.status}`);
    } catch (error) {
      setDeliveryState(error instanceof Error ? error.message : "Torque delivery failed");
    }
  }

  return (
    <section className="rounded-[32px] border border-white/10 bg-[#06111f]/88 p-6 shadow-2xl shadow-emerald-950/20">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.34em] text-emerald-200/78">Torque MCP growth loop</div>
          <h2 className="mt-3 max-w-3xl text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">
            Convert real product actions into retention events and incentive loops
          </h2>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-white/64">
            Torque fits PrivateDAO as a measurable growth layer: users do not earn rewards for visiting a page; they
            earn from wallet-first actions such as creating a DAO, creating a proposal, signing a billing SKU, or
            finishing the Solana frontend learning path.
          </p>
        </div>
        <Badge variant="success">Custom events</Badge>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-4">
        {torqueEventTemplates.map((event) => (
          <button
            key={event.id}
            type="button"
            onClick={() => setActiveId(event.id)}
            className={cn(
              "rounded-3xl border p-5 text-left transition",
              activeId === event.id
                ? "border-emerald-300/45 bg-emerald-300/[0.10]"
                : "border-white/8 bg-white/[0.03] hover:border-white/16 hover:bg-white/[0.05]",
            )}
          >
            <div className="text-base font-semibold text-white">{event.title}</div>
            <p className="mt-3 text-sm leading-7 text-white/58">{event.description}</p>
            <div className="mt-4 text-[11px] uppercase tracking-[0.2em] text-emerald-100/70">{event.rewardIntent}</div>
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-3xl border border-emerald-300/14 bg-emerald-300/[0.06] p-5">
          <div className="text-sm font-semibold text-emerald-100">Live activity path</div>
          <p className="mt-3 text-sm leading-7 text-white/62">
            The event workbench records local activity immediately and can forward the same payload to Torque when the
            MCP/API endpoint is configured. This keeps the growth loop tied to product behavior rather than detached
            campaign copy.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" onClick={() => void recordEvent()} className={cn(buttonVariants({ size: "sm" }))}>
              Record event
            </button>
            <button
              type="button"
              onClick={() => void navigator.clipboard?.writeText(payloadText)}
              className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
            >
              Copy payload
            </button>
            <Link href={activeTemplate.route} className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}>
              Open route
            </Link>
          </div>
          <div className="mt-4 rounded-2xl border border-white/8 bg-black/24 p-4 text-xs leading-6 text-white/58">
            {deliveryState}
          </div>
          {records.length > 0 ? (
            <div className="mt-4 space-y-2">
              {records.map((record) => (
                <div key={record.id} className="rounded-2xl border border-white/8 bg-white/[0.03] p-3 text-xs text-white/58">
                  {record.event} · {record.rewardIntent} · {record.timestamp}
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="rounded-3xl border border-white/10 bg-black/24 p-5">
          <div className="text-sm font-semibold text-white">Torque custom_event payload</div>
          <pre className="mt-4 max-h-[420px] overflow-auto rounded-2xl border border-white/8 bg-black/40 p-4 text-xs leading-6 text-emerald-100/82">
            {payloadText}
          </pre>
        </div>
      </div>
    </section>
  );
}

