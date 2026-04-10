"use client";

import { CheckCircle2, Clock3 } from "lucide-react";

import { useGovernanceSession } from "@/components/governance-session";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
