"use client";

import { X } from "lucide-react";

import { OnchainParityPanel } from "@/components/onchain-parity-panel";
import { ProposalAnalyzerInline } from "@/components/proposal-analyzer-inline";
import type { GovernanceExecutionIntent } from "@/components/governance-session";
import { TreasuryRiskInline } from "@/components/treasury-risk-inline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buildPreparedActionSummary } from "@/lib/onchain-parity";
import type { CoreGovernanceInstructionName } from "@/lib/onchain-parity.generated";
import type { ProposalCardModel } from "@/lib/site-data";

type ActionReviewModalProps = {
  action: CoreGovernanceInstructionName | null;
  daoName?: string;
  proposalTitle?: string;
  proposalId?: string;
  voteChoice?: string;
  proposal?: ProposalCardModel;
  executionIntent?: GovernanceExecutionIntent | null;
  onClose: () => void;
  onConfirm: () => void;
};

export function ActionReviewModal({
  action,
  daoName,
  proposalTitle,
  proposalId,
  voteChoice,
  proposal,
  executionIntent,
  onClose,
  onConfirm,
}: ActionReviewModalProps) {
  if (!action) return null;

  const summary = buildPreparedActionSummary({
    action,
    daoName,
    proposalTitle,
    proposalId,
    voteChoice,
    proposal,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#03050e]/84 px-4 backdrop-blur-md">
      <div className="w-full max-w-4xl rounded-[32px] border border-white/12 bg-[linear-gradient(180deg,rgba(12,16,30,0.97),rgba(6,8,20,0.99))] p-6 shadow-[0_30px_120px_rgba(0,0,0,0.48)] sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-[0.32em] text-cyan-200/72">Pre-sign review</div>
            <h3 className="mt-2 text-2xl font-semibold text-white">{summary.displayName}</h3>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-white/60">
              Review the exact operation type, signer role, program path, field order, accounts, and validation boundary before continuing in the UI workflow.
            </p>
          </div>
          <button
            aria-label="Close review modal"
            className="rounded-full border border-white/10 p-2 text-white/60 transition hover:bg-white/8 hover:text-white"
            onClick={onClose}
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-white/8 bg-white/4 p-4">
            <div className="text-[11px] uppercase tracking-[0.28em] text-white/40">Operation</div>
            <div className="mt-2 text-sm font-medium text-white">{summary.operationType}</div>
          </div>
          <div className="rounded-3xl border border-white/8 bg-white/4 p-4">
            <div className="text-[11px] uppercase tracking-[0.28em] text-white/40">Proposal ID</div>
            <div className="mt-2 text-sm font-medium text-white">{summary.proposalId}</div>
          </div>
          <div className="rounded-3xl border border-white/8 bg-white/4 p-4">
            <div className="text-[11px] uppercase tracking-[0.28em] text-white/40">Network</div>
            <div className="mt-2 text-sm font-medium text-white">{summary.network}</div>
          </div>
          <div className="rounded-3xl border border-white/8 bg-white/4 p-4">
            <div className="text-[11px] uppercase tracking-[0.28em] text-white/40">Signer role</div>
            <div className="mt-2 text-sm font-medium text-white">{summary.signerRole}</div>
          </div>
          <div className="rounded-3xl border border-white/8 bg-white/4 p-4">
            <div className="text-[11px] uppercase tracking-[0.28em] text-white/40">Beneficiary / path</div>
            <div className="mt-2 text-sm font-medium text-white">{summary.beneficiary}</div>
          </div>
          <div className="rounded-3xl border border-white/8 bg-white/4 p-4">
            <div className="text-[11px] uppercase tracking-[0.28em] text-white/40">Amount / asset</div>
            <div className="mt-2 text-sm font-medium text-white">{summary.amountOrAsset}</div>
          </div>
          <div className="rounded-3xl border border-white/8 bg-white/4 p-4">
            <div className="text-[11px] uppercase tracking-[0.28em] text-white/40">Governance mint</div>
            <div className="mt-2 break-all text-sm font-medium text-white">{summary.governanceMint}</div>
          </div>
          <div className="rounded-3xl border border-white/8 bg-white/4 p-4">
            <div className="text-[11px] uppercase tracking-[0.28em] text-white/40">Timelock / gate</div>
            <div className="mt-2 text-sm font-medium text-white">{summary.timelock}</div>
          </div>
          {proposal?.execution ? (
            <div className="rounded-3xl border border-white/8 bg-white/4 p-4 md:col-span-2 xl:col-span-4">
              <div className="text-[11px] uppercase tracking-[0.28em] text-white/40">Execution target</div>
              <div className="mt-2 text-sm font-medium text-white">{proposal.execution.executionTarget}</div>
            </div>
          ) : null}
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <Badge variant="cyan">{summary.instructionName}</Badge>
          <Badge variant="success">Program {summary.programId.slice(0, 8)}…</Badge>
          <Badge variant="violet">Token {summary.governanceTokenProgram.slice(0, 8)}…</Badge>
        </div>

        {executionIntent ? (
          <div className="mt-6 rounded-3xl border border-emerald-300/18 bg-emerald-300/[0.08] p-5">
            <div className="text-[11px] uppercase tracking-[0.28em] text-emerald-100/80">Execution continuity packet</div>
            <div className="mt-3 text-base font-medium text-white">
              {executionIntent.payoutTitle} · {executionIntent.amountDisplay}
            </div>
            <div className="mt-2 text-sm leading-7 text-white/62">
              {executionIntent.reference} · {executionIntent.purpose}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/8 bg-black/20 p-3 text-sm text-white/68">
                <div className="text-[11px] uppercase tracking-[0.22em] text-white/40">Payout profile</div>
                <div className="mt-2 text-white">{executionIntent.payoutProfile}</div>
              </div>
              <div className="rounded-2xl border border-white/8 bg-black/20 p-3 text-sm text-white/68">
                <div className="text-[11px] uppercase tracking-[0.22em] text-white/40">Telemetry mode</div>
                <div className="mt-2 text-white">{executionIntent.telemetryMode}</div>
              </div>
              <div className="rounded-2xl border border-white/8 bg-black/20 p-3 text-sm text-white/68 sm:col-span-2">
                <div className="text-[11px] uppercase tracking-[0.22em] text-white/40">Execution target</div>
                <div className="mt-2 text-white">{executionIntent.executionTarget}</div>
              </div>
            </div>
          </div>
        ) : null}

        {proposal ? (
          <div className="mt-6 grid gap-4">
            <ProposalAnalyzerInline proposal={proposal} />
            <TreasuryRiskInline proposal={proposal} />
          </div>
        ) : null}

        <div className="mt-6">
          <OnchainParityPanel action={action} preparedSummary={summary} />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button onClick={onConfirm}>{executionIntent ? "Continue with staged action" : "Continue in UI"}</Button>
          <Button variant="secondary" onClick={onClose}>
            Go back
          </Button>
        </div>
      </div>
    </div>
  );
}
