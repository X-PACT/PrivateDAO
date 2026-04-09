"use client";

import { useState } from "react";

import { DaoCard } from "@/components/dao-card";
import { ExecutionLogPanel } from "@/components/execution-log-panel";
import { ProposalCard } from "@/components/proposal-card";
import { TreasuryTable } from "@/components/treasury-table";
import { VoteModal } from "@/components/vote-modal";
import { VoteTimeline } from "@/components/vote-timeline";
import type { ProposalCardModel } from "@/lib/site-data";
import { proposalCards } from "@/lib/site-data";

export function GovernanceDashboard() {
  const [selectedProposal, setSelectedProposal] = useState<ProposalCardModel | null>(null);

  return (
    <>
      <div className="grid gap-6 xl:grid-cols-[1.05fr_1.25fr]">
        <DaoCard />
        <ExecutionLogPanel />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.45fr_0.95fr]">
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
            {proposalCards.map((proposal) => (
              <ProposalCard key={proposal.id} proposal={proposal} onVote={setSelectedProposal} />
            ))}
          </div>
          <TreasuryTable />
        </div>
        <VoteTimeline />
      </div>

      <VoteModal proposal={selectedProposal} onClose={() => setSelectedProposal(null)} />
    </>
  );
}
