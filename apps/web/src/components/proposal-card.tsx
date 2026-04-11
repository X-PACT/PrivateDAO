import { ArrowUpRight, LockKeyhole, TimerReset } from "lucide-react";

import { ProposalAnalyzerInline } from "@/components/proposal-analyzer-inline";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProposalCardModel } from "@/lib/site-data";

type ProposalCardProps = {
  proposal: ProposalCardModel;
  onVote: (proposal: ProposalCardModel) => void;
};

export function ProposalCard({ proposal, onVote }: ProposalCardProps) {
  return (
    <Card className="h-full border-white/10 bg-[linear-gradient(180deg,rgba(10,15,29,0.94),rgba(6,9,20,0.98))]">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="text-[11px] uppercase tracking-[0.28em] text-emerald-300/75">{proposal.id}</div>
            <CardTitle className="text-[1.15rem] leading-8">{proposal.title}</CardTitle>
            <CardDescription className="text-white/48">{proposal.type}</CardDescription>
          </div>
          <StatusBadge status={proposal.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <p className="text-sm leading-7 text-white/62">{proposal.summary}</p>
        <ProposalAnalyzerInline proposal={proposal} compact />
        <div className="grid gap-3 rounded-[24px] border border-white/8 bg-black/20 p-4">
          <div className="flex items-start gap-3">
            <TimerReset className="mt-0.5 h-4 w-4 text-cyan-300" />
            <div>
              <div className="text-sm font-medium text-white/90">Window</div>
              <div className="text-sm text-white/52">{proposal.window}</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <LockKeyhole className="mt-0.5 h-4 w-4 text-fuchsia-300" />
            <div>
              <div className="text-sm font-medium text-white/90">Privacy boundary</div>
              <div className="text-sm text-white/52">{proposal.privacy}</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <ArrowUpRight className="mt-0.5 h-4 w-4 text-emerald-300" />
            <div>
              <div className="text-sm font-medium text-white/90">Treasury path</div>
              <div className="text-sm text-white/52">{proposal.treasury}</div>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {proposal.tech.map((tech) => (
            <Badge key={tech} variant={tech === "ZK" ? "violet" : tech === "Fast RPC" ? "cyan" : "success"}>
              {tech}
            </Badge>
          ))}
        </div>
        <div className="flex items-end justify-between gap-3">
          <div className="max-w-[65%] text-[11px] uppercase tracking-[0.22em] text-white/34">{proposal.quorum}</div>
          <Button variant="secondary" size="sm" onClick={() => onVote(proposal)}>
            Open vote modal
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
