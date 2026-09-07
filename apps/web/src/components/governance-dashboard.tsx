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
      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr_0.94fr]">
        <DaoCard />
        <ExecutionLogPanel />
        <VoteTimeline />
      </div>

      <div className="mt-6 space-y-6">
        <div className="grid gap-6 lg:grid-cols-2 2xl:grid-cols-3">
          {proposalCards.map((proposal) => (
            <ProposalCard key={proposal.id} proposal={proposal} onVote={setSelectedProposal} />
          ))}
        </div>
        <TreasuryTable />
      </div>

      <VoteModal proposal={selectedProposal} onClose={() => setSelectedProposal(null)} />
    </>
  );
}
