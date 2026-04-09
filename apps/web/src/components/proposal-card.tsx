import { ArrowUpRight, LockKeyhole, TimerReset } from "lucide-react";

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
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-[0.28em] text-emerald-300/75">{proposal.id}</div>
            <CardTitle className="mt-2 text-xl">{proposal.title}</CardTitle>
            <CardDescription>{proposal.type}</CardDescription>
          </div>
          <StatusBadge status={proposal.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <p className="text-sm leading-7 text-white/65">{proposal.summary}</p>
        <div className="grid gap-3 rounded-3xl border border-white/8 bg-black/20 p-4">
          <div className="flex items-start gap-3">
            <TimerReset className="mt-0.5 h-4 w-4 text-cyan-300" />
            <div>
              <div className="text-sm font-medium text-white">Window</div>
              <div className="text-sm text-white/55">{proposal.window}</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <LockKeyhole className="mt-0.5 h-4 w-4 text-fuchsia-300" />
            <div>
              <div className="text-sm font-medium text-white">Privacy boundary</div>
              <div className="text-sm text-white/55">{proposal.privacy}</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <ArrowUpRight className="mt-0.5 h-4 w-4 text-emerald-300" />
            <div>
              <div className="text-sm font-medium text-white">Treasury path</div>
              <div className="text-sm text-white/55">{proposal.treasury}</div>
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
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs uppercase tracking-[0.24em] text-white/35">{proposal.quorum}</div>
          <Button variant="secondary" size="sm" onClick={() => onVote(proposal)}>
            Open vote modal
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
