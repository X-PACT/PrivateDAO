"use client";

import Link from "next/link";
import { ArrowUpRight, CheckCircle2, Clock3 } from "lucide-react";

import { useGovernanceSession } from "@/components/governance-session";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const steps = [
  { key: "daoCreated", label: "Create DAO" },
  { key: "proposalCreated", label: "Create Proposal" },
  { key: "voteCommitted", label: "Commit Vote" },
  { key: "voteRevealed", label: "Reveal Vote" },
  { key: "proposalFinalized", label: "Finalize Proposal" },
  { key: "proposalExecuted", label: "Execute Proposal" },
] as const;

type GovernanceSessionPanelProps = {
  title?: string;
};

export function GovernanceSessionPanel({
  title = "Current governance session",
}: GovernanceSessionPanelProps) {
  const session = useGovernanceSession();

  return (
    <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(10,16,32,0.94),rgba(7,11,23,0.98))]">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle>{title}</CardTitle>
          <Badge variant={session.proposalExecuted ? "success" : session.proposalFinalized ? "cyan" : "warning"}>
            {session.proposalExecuted ? "Execution staged" : session.proposalFinalized ? "Finalized" : "Session active"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {session.executionIntent?.requestPayload ? (
          <div className="rounded-[22px] border border-cyan-300/16 bg-cyan-300/[0.08] p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-[11px] uppercase tracking-[0.28em] text-cyan-100/78">Authoritative execution shell</div>
                <div className="mt-2 text-base font-medium text-white">
                  {session.executionIntent.requestPayload.requestId}
                </div>
                <div className="mt-2 text-sm leading-7 text-white/60">
                  {session.executionIntent.requestPayload.amountDisplay} · {session.executionIntent.requestPayload.reference}
                  <br />
                  {session.executionIntent.requestPayload.executionTarget}
                </div>
              </div>
              <Badge variant={session.executionIntent.requestDelivery?.state === "executed" ? "success" : "cyan"}>
                {session.executionIntent.requestDelivery?.state ?? session.executionIntent.requestPayload.state}
              </Badge>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[18px] border border-white/8 bg-black/20 p-3 text-sm text-white/64">
                <div className="text-[11px] uppercase tracking-[0.22em] text-white/40">Final signing source</div>
                <div className="mt-2 text-white">
                  {session.executionIntent.requestPayload.kind}
                </div>
              </div>
              <div className="rounded-[18px] border border-white/8 bg-black/20 p-3 text-sm text-white/64">
                <div className="text-[11px] uppercase tracking-[0.22em] text-white/40">Telemetry route</div>
                <div className="mt-2 break-all text-white">
                  {session.executionIntent.requestPayload.telemetryRoute}
                </div>
              </div>
              <div className="rounded-[18px] border border-white/8 bg-black/20 p-3 text-sm text-white/64 sm:col-span-2">
                <div className="text-[11px] uppercase tracking-[0.22em] text-white/40">Final signing packet</div>
                <div className="mt-2 text-white">
                  {session.executionIntent.requestPayload.requestId}
                </div>
                <div className="mt-1 text-white/72">{session.executionIntent.requestPayload.requestRoute}</div>
                <div className="mt-1 text-white/72">{session.executionIntent.requestPayload.deliveryRoute}</div>
                <div className="mt-1 text-white/72">{session.executionIntent.requestPayload.telemetryRoute}</div>
                <div className="mt-2 text-white/72">
                  {session.executionIntent.requestPayload.purpose}
                </div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href={`${session.executionIntent.requestPayload.deliveryRoute}#proposal-review-action`}
                className={cn(buttonVariants({ size: "sm", variant: "secondary" }), "justify-between")}
              >
                Open final signing lane
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link
                href={session.executionIntent.requestPayload.telemetryRoute}
                className={cn(buttonVariants({ size: "sm", variant: "outline" }), "justify-between")}
              >
                Open execution telemetry
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link
                href="/documents/monitoring-alert-rules"
                className={cn(buttonVariants({ size: "sm", variant: "outline" }), "justify-between")}
              >
                Open alert rules
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link
                href="/documents/real-device-runtime"
                className={cn(buttonVariants({ size: "sm", variant: "outline" }), "justify-between")}
              >
                Open real-device runtime
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ) : null}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
            <div className="text-[11px] uppercase tracking-[0.28em] text-white/40">DAO</div>
            <div className="mt-2 text-base font-medium text-white">{session.daoName}</div>
          </div>
          <div className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
            <div className="text-[11px] uppercase tracking-[0.28em] text-white/40">Proposal</div>
            <div className="mt-2 text-base font-medium text-white">{session.proposalTitle}</div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {steps.map((step) => {
            const complete = session[step.key];
            return (
              <div key={step.key} className="rounded-[22px] border border-white/8 bg-black/20 p-4">
                <div className="flex items-center gap-2">
                  {complete ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                  ) : (
                    <Clock3 className="h-4 w-4 text-white/40" />
                  )}
                  <div className="text-sm font-medium text-white">{step.label}</div>
                </div>
                <div className="mt-2 text-xs uppercase tracking-[0.18em] text-white/42">
                  {complete ? "Completed" : "Pending"}
                </div>
              </div>
            );
          })}
        </div>

        <div className="rounded-[22px] border border-white/8 bg-black/20 p-4">
          <div className="text-[11px] uppercase tracking-[0.28em] text-white/40">Latest log</div>
          <div className="mt-2 text-sm leading-7 text-white/60">
            {session.logs[0]?.label
              ? `${session.logs[0].label}: ${session.logs[0].value}`
              : "No action has been staged yet in this governance session."}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
