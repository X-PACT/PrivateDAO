"use client";

import { X } from "lucide-react";

import { OnchainParityPanel } from "@/components/onchain-parity-panel";
import { ProposalAnalyzerInline } from "@/components/proposal-analyzer-inline";
import { TreasuryRiskInline } from "@/components/treasury-risk-inline";
import { getConfidenceEngineSummary } from "@/lib/confidence-engine";
import { buildPreparedActionSummary, type PreparedActionSummary } from "@/lib/onchain-parity";
import type { ProposalCardModel } from "@/lib/site-data";

import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

type VoteModalProps = {
  proposal: ProposalCardModel | null;
  onClose: () => void;
};

export function VoteModal({ proposal, onClose }: VoteModalProps) {
  if (!proposal) return null;

  const isExecuted = proposal.status === "Executed";
  const reviewAction =
    proposal.status === "Execution ready" || proposal.status === "Executed"
      ? "execute_proposal"
      : proposal.status === "Ready to reveal"
        ? "reveal_vote"
        : "commit_vote";

  const confidence = getConfidenceEngineSummary({
    title: proposal.title,
    type: proposal.type,
    status: proposal.status,
    privacy: proposal.privacy,
    tech: proposal.tech,
    summary: proposal.summary,
  });
  const actionSummaries: PreparedActionSummary[] = [
    buildPreparedActionSummary({
      action: "commit_vote",
      proposal,
      proposalId: proposal.id,
      voteChoice: "Approve / Reject / Abstain",
    }),
    buildPreparedActionSummary({
      action: "reveal_vote",
      proposal,
      proposalId: proposal.id,
      voteChoice: "Stored vote + salt",
    }),
    buildPreparedActionSummary({
      action: proposal.status === "Execution ready" || proposal.status === "Executed" ? "execute_proposal" : "finalize_proposal",
      proposal,
      proposalId: proposal.id,
    }),
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#03050e]/80 px-4 backdrop-blur-md">
      <div className="w-full max-w-2xl rounded-[32px] border border-white/12 bg-[linear-gradient(180deg,rgba(12,16,30,0.96),rgba(6,8,20,0.98))] p-6 shadow-[0_30px_120px_rgba(0,0,0,0.45)] sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-[0.32em] text-emerald-300/80">Vote Modal</div>
            <h3 className="mt-2 text-2xl font-semibold text-white">{proposal.title}</h3>
            <p className="mt-2 max-w-xl text-sm leading-7 text-white/60">
              {isExecuted
                ? "This review surface now reflects an already executed proposal record: commit, reveal, treasury target, and proof context stay visible without pretending the operator is still about to sign."
                : "This React migration keeps the voting flow legible for normal operators: proposal scope, privacy boundary, treasury path, and evidence requirements all stay visible before the user signs."}
            </p>
          </div>
          <button
            aria-label="Close vote modal"
            className="rounded-full border border-white/10 p-2 text-white/60 transition hover:bg-white/8 hover:text-white"
            onClick={onClose}
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border border-white/8 bg-white/4 p-4">
            <div className="text-[11px] uppercase tracking-[0.28em] text-white/40">Proposal ID</div>
            <div className="mt-2 text-lg font-medium text-white">{proposal.id}</div>
          </div>
          <div className="rounded-3xl border border-white/8 bg-white/4 p-4">
            <div className="text-[11px] uppercase tracking-[0.28em] text-white/40">Status</div>
            <div className="mt-2">
              <Badge variant="cyan">{proposal.status}</Badge>
            </div>
          </div>
          <div className="rounded-3xl border border-white/8 bg-white/4 p-4 sm:col-span-2">
            <div className="text-[11px] uppercase tracking-[0.28em] text-white/40">Current boundary</div>
              <div className="mt-2 text-sm leading-7 text-white/65">
              {proposal.privacy}. {isExecuted ? "The indexed record shows that treasury execution already cleared the governance path on devnet." : "Treasury execution remains blocked until voting, reveal, timelock, and evidence gates align with the selected hardening path."}
            </div>
          </div>
          <div className="rounded-3xl border border-white/8 bg-white/4 p-4 sm:col-span-2">
            <div className="flex items-center justify-between gap-4">
              <div className="text-[11px] uppercase tracking-[0.28em] text-white/40">Confidence engine</div>
              <Badge variant={confidence.band === "Advanced" ? "success" : confidence.band === "Strong" ? "cyan" : "warning"}>
                {confidence.total} · {confidence.band}
              </Badge>
            </div>
            <div className="mt-2 text-sm leading-7 text-white/65">
              Strongest signals: {confidence.strongestSignals.slice(0, 2).join(", ")}.
            </div>
            <div className="mt-2 text-sm leading-7 text-white/55">
              Recommendation: {confidence.recommendations[0] ?? "Current path is already well-scoped for the selected proposal."}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4">
          <ProposalAnalyzerInline proposal={proposal} />
          <TreasuryRiskInline proposal={proposal} />
        </div>

        <div className="mt-6 grid gap-4">
          {actionSummaries.map((summary) => (
            <div key={summary.instructionName} className="rounded-3xl border border-white/8 bg-white/4 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.28em] text-white/40">Safe signing summary</div>
                  <div className="mt-2 text-base font-medium text-white">{summary.operationType}</div>
                </div>
                <Badge variant="cyan">{summary.instructionName}</Badge>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/8 bg-black/20 p-3 text-sm text-white/68">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-white/40">Proposal</div>
                  <div className="mt-2 text-white">{summary.proposalId}</div>
                </div>
                <div className="rounded-2xl border border-white/8 bg-black/20 p-3 text-sm text-white/68">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-white/40">Signer role</div>
                  <div className="mt-2 text-white">{summary.signerRole}</div>
                </div>
                <div className="rounded-2xl border border-white/8 bg-black/20 p-3 text-sm text-white/68">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-white/40">Beneficiary / path</div>
                  <div className="mt-2 text-white">{summary.beneficiary}</div>
                </div>
                <div className="rounded-2xl border border-white/8 bg-black/20 p-3 text-sm text-white/68">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-white/40">Amount / asset</div>
                  <div className="mt-2 text-white">{summary.amountOrAsset}</div>
                </div>
                <div className="rounded-2xl border border-white/8 bg-black/20 p-3 text-sm text-white/68">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-white/40">Mint</div>
                  <div className="mt-2 break-all text-white">{summary.governanceMint}</div>
                </div>
                <div className="rounded-2xl border border-white/8 bg-black/20 p-3 text-sm text-white/68">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-white/40">Timelock / gate</div>
                  <div className="mt-2 text-white">{summary.timelock}</div>
                </div>
                {proposal.execution ? (
                  <div className="rounded-2xl border border-white/8 bg-black/20 p-3 text-sm text-white/68 sm:col-span-2">
                    <div className="text-[11px] uppercase tracking-[0.22em] text-white/40">Execution target</div>
                    <div className="mt-2 text-white">{proposal.execution.executionTarget}</div>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <OnchainParityPanel action={reviewAction} compact />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button>{isExecuted ? "Review commit trail" : "Commit vote"}</Button>
          <Button variant="secondary">{isExecuted ? "Review reveal trail" : "Reveal vote"}</Button>
          <Button variant="outline">{isExecuted ? "Execution confirmed" : "Review execution path"}</Button>
        </div>
      </div>
    </div>
  );
}
