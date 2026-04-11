import {
  PRIVATE_DAO_CORE_INSTRUCTION_PARITY,
  PRIVATE_DAO_GOVERNANCE_MINT,
  PRIVATE_DAO_GOVERNANCE_TOKEN_PROGRAM,
  PRIVATE_DAO_PROGRAM_ID,
  type CoreGovernanceInstructionName,
} from "@/lib/onchain-parity.generated";
import type { ProposalCardModel } from "@/lib/site-data";

export type PreparedActionSummary = {
  displayName: string;
  instructionName: CoreGovernanceInstructionName;
  signerRole: string;
  proposalId: string;
  network: string;
  programId: string;
  governanceMint: string;
  governanceTokenProgram: string;
  beneficiary: string;
  amountOrAsset: string;
  timelock: string;
  operationType: string;
  fieldOrder: readonly string[];
  reviewChecklist: readonly string[];
  validationRules: readonly string[];
};

type BuildPreparedActionInput = {
  action: CoreGovernanceInstructionName;
  daoName?: string;
  proposalTitle?: string;
  proposalId?: string;
  voteChoice?: string;
  proposal?: ProposalCardModel;
};

const SIGNER_ROLE_LABELS: Record<CoreGovernanceInstructionName, string> = {
  initialize_dao: "authority",
  create_proposal: "proposer",
  commit_vote: "voter",
  reveal_vote: "revealer",
  finalize_proposal: "finalizer",
  execute_proposal: "executor",
};

export const PRIVATE_DAO_NETWORK = "Solana Devnet" as const;

export function getCoreInstructionParity(action: CoreGovernanceInstructionName) {
  return PRIVATE_DAO_CORE_INSTRUCTION_PARITY[action];
}

export function buildPreparedActionSummary({
  action,
  daoName,
  proposalTitle,
  proposalId,
  voteChoice,
  proposal,
}: BuildPreparedActionInput): PreparedActionSummary {
  const parity = getCoreInstructionParity(action);
  const baseProposalId = proposalId ?? proposal?.id ?? "Pending proposal PDA";
  const execution = proposal?.execution;

  let beneficiary = "Not applicable";
  let amountOrAsset = "Not applicable";
  let timelock = "Not applicable";
  let operationType: string = parity.displayName;

  switch (action) {
    case "initialize_dao":
      beneficiary = daoName ? `DAO PDA for ${daoName}` : "DAO PDA derived from authority + dao_name";
      amountOrAsset = "Governance mint + voting policy";
      timelock = "Execution delay stored at DAO creation";
      break;
    case "create_proposal":
      beneficiary = proposalTitle ? `Proposal PDA for ${proposalTitle}` : "Proposal PDA derived from dao + proposal_count";
      amountOrAsset = execution?.amountDisplay ?? proposal?.treasury ?? "Treasury action or descriptive proposal payload";
      timelock = execution?.timelockLabel ?? "Voting window starts immediately, reveal follows after voting_end";
      break;
    case "commit_vote":
      beneficiary = `${baseProposalId} voter record PDA`;
      amountOrAsset = voteChoice ? `${voteChoice} commitment` : "Vote commitment hash";
      timelock = "Commit phase only; must happen before voting_end";
      operationType = "Commit vote";
      break;
    case "reveal_vote":
      beneficiary = `${baseProposalId} tally update`;
      amountOrAsset = voteChoice ? `${voteChoice} reveal payload` : "Vote + salt reveal payload";
      timelock = "Reveal opens only after voting_end and closes at reveal_end";
      operationType = "Reveal vote";
      break;
    case "finalize_proposal":
      beneficiary = `${baseProposalId} finalization gate`;
      amountOrAsset = "Passed/failed status computation";
      timelock = "Only after reveal_end; sets execution_unlocks_at for passed proposals";
      operationType = "Finalize proposal";
      break;
    case "execute_proposal":
      beneficiary = execution?.recipient ?? execution?.recipientLabel ?? proposal?.treasury ?? "Treasury recipient from approved treasury_action";
      amountOrAsset = execution?.amountDisplay ?? proposal?.treasury ?? "Approved treasury amount and asset";
      timelock = execution?.timelockLabel
        ?? (proposal?.status === "Execution ready"
          ? "Execution ready in current surface; on-chain path still enforces execution_unlocks_at"
          : "Blocked until proposal is passed, finalized, and timelock expires");
      operationType = "Execute proposal";
      break;
  }

  return {
    displayName: parity.displayName,
    instructionName: parity.instructionName,
    signerRole: SIGNER_ROLE_LABELS[action],
    proposalId: baseProposalId,
    network: PRIVATE_DAO_NETWORK,
    programId: PRIVATE_DAO_PROGRAM_ID,
    governanceMint: PRIVATE_DAO_GOVERNANCE_MINT,
    governanceTokenProgram: PRIVATE_DAO_GOVERNANCE_TOKEN_PROGRAM,
    beneficiary,
    amountOrAsset,
    timelock,
    operationType,
    fieldOrder: parity.fieldOrder,
    reviewChecklist: parity.reviewChecklist,
    validationRules: parity.validationRules,
  };
}
