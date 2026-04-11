export const custodyEvidenceStorageKey = "privatedao.custody.evidence";

export type CustodyEvidence = {
  multisigAddress: string;
  threshold: string;
  signerRoster: string;
  upgradeTransferSignature: string;
  treasuryTransferSignature: string;
  postTransferReadouts: string;
};

export const emptyCustodyEvidence: CustodyEvidence = {
  multisigAddress: "",
  threshold: "2-of-3",
  signerRoster: "",
  upgradeTransferSignature: "",
  treasuryTransferSignature: "",
  postTransferReadouts: "",
};

export function getCustodyEvidenceCompletion(evidence: CustodyEvidence) {
  const checks = {
    multisigAddress: evidence.multisigAddress.trim().length > 0,
    threshold: evidence.threshold.trim().length > 0,
    signerRoster: evidence.signerRoster.trim().length > 0,
    upgradeTransferSignature: evidence.upgradeTransferSignature.trim().length > 0,
    treasuryTransferSignature: evidence.treasuryTransferSignature.trim().length > 0,
    postTransferReadouts: evidence.postTransferReadouts.trim().length > 0,
  };

  const completed = Object.values(checks).filter(Boolean).length;
  const total = Object.keys(checks).length;

  return {
    checks,
    completed,
    total,
    ratio: completed / total,
  };
}

export function buildCustodyNarrative(evidence: CustodyEvidence) {
  const completion = getCustodyEvidenceCompletion(evidence);

  if (completion.completed === 0) {
    return {
      headline: "Custody workflow exists, but no ceremony evidence is recorded yet.",
      summary:
        "The product now exposes the custody workflow and evidence fields clearly. Mainnet trust remains blocked until multisig details, transfer signatures, and post-transfer readouts are recorded.",
      badge: "Pending external",
    };
  }

  if (completion.completed < completion.total) {
    return {
      headline: `Custody evidence is partially recorded: ${completion.completed}/${completion.total} items present.`,
      summary:
        "This improves reviewer confidence because the signer split and handoff are becoming inspectable, but the launch boundary must remain explicit until every transfer artifact and readout is captured.",
      badge: "Partially evidenced",
    };
  }

  return {
    headline: "Custody evidence packet is fully populated inside the product surface.",
    summary:
      "All required custody fields are present locally. The remaining discipline is to keep the recorded values synchronized with the underlying source of truth and final external validation flow.",
    badge: "Evidence recorded",
  };
}
