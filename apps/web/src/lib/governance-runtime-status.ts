import type { CoreGovernanceInstructionName } from "@/lib/onchain-parity.generated";

export type GovernanceRuntimeStatus = {
  action: CoreGovernanceInstructionName;
  liveWalletLane: boolean;
  repoScriptProofCaptured: boolean;
  browserWalletProofCaptured: boolean;
  realDeviceProofCaptured: boolean;
  supportNote: string;
};

const GOVERNANCE_RUNTIME_STATUS: Record<CoreGovernanceInstructionName, GovernanceRuntimeStatus> = {
  initialize_dao: {
    action: "initialize_dao",
    liveWalletLane: true,
    repoScriptProofCaptured: true,
    browserWalletProofCaptured: false,
    realDeviceProofCaptured: false,
    supportNote:
      "DAO bootstrap is live in the web wallet lane. Repo-script proof exists; browser-wallet and real-device captures still need to be recorded.",
  },
  create_proposal: {
    action: "create_proposal",
    liveWalletLane: true,
    repoScriptProofCaptured: true,
    browserWalletProofCaptured: false,
    realDeviceProofCaptured: false,
    supportNote:
      "Proposal submit is live in the web wallet lane, including the current SendSol and SendToken treasury motions. Browser-wallet and real-device captures remain pending.",
  },
  commit_vote: {
    action: "commit_vote",
    liveWalletLane: true,
    repoScriptProofCaptured: true,
    browserWalletProofCaptured: false,
    realDeviceProofCaptured: false,
    supportNote:
      "Commit vote is live in the web wallet lane once a real DAO and proposal already exist in session state. Browser-wallet and real-device captures remain pending.",
  },
  reveal_vote: {
    action: "reveal_vote",
    liveWalletLane: true,
    repoScriptProofCaptured: true,
    browserWalletProofCaptured: false,
    realDeviceProofCaptured: false,
    supportNote:
      "Reveal vote is live in the web wallet lane once a live commit already exists in the same session. Browser-wallet and real-device captures remain pending.",
  },
  finalize_proposal: {
    action: "finalize_proposal",
    liveWalletLane: true,
    repoScriptProofCaptured: true,
    browserWalletProofCaptured: false,
    realDeviceProofCaptured: false,
    supportNote:
      "Finalize proposal is live in the web wallet lane. Repo-script proof exists; browser-wallet and real-device captures still need to be recorded.",
  },
  execute_proposal: {
    action: "execute_proposal",
    liveWalletLane: true,
    repoScriptProofCaptured: true,
    browserWalletProofCaptured: false,
    realDeviceProofCaptured: false,
    supportNote:
      "Execute proposal is live in the web wallet lane for standard, SendSol, and SendToken proposals. CustomCPI remains outside the current executable release boundary.",
  },
};

export function getGovernanceRuntimeStatus(action: CoreGovernanceInstructionName) {
  return GOVERNANCE_RUNTIME_STATUS[action];
}
