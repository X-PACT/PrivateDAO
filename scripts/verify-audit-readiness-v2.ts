// SPDX-License-Identifier: AGPL-3.0-or-later
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");

function read(rel: string): string {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

function requireIncludes(haystack: string, needle: string, rel: string): void {
  if (!haystack.includes(needle)) {
    throw new Error(`${rel} is missing required audit-readiness marker: ${needle}`);
  }
}

function requireRegex(haystack: string, regex: RegExp, rel: string, label: string): void {
  if (!regex.test(haystack)) {
    throw new Error(`${rel} is missing required audit-readiness pattern: ${label}`);
  }
}

function main(): void {
  const libRel = "programs/private-dao/src/lib.rs";
  const hardeningRel = "docs/security-hardening-v2.md";
  const specRel = "docs/protocol-spec.md";
  const goLiveRel = "docs/mainnet-go-live-checklist.md";

  const lib = read(libRel);
  const hardening = read(hardeningRel);
  const spec = read(specRel);
  const goLive = read(goLiveRel);

  const libMarkers = [
    "pub fn cancel_proposal_v2",
    "pub fn snapshot_proposal_execution_policy",
    "pub fn record_proof_verification_v2",
    "pub fn finalize_zk_enforced_proposal_v2",
    "pub fn record_settlement_evidence_v2",
    "pub fn execute_confidential_payout_plan_v2",
    "pub fn update_voter_weight_record_v2",
    "pub struct DaoSecurityPolicy",
    "pub struct ProposalExecutionPolicySnapshot",
    "pub struct ProposalProofVerification",
    "pub struct SettlementEvidence",
    "pub struct SettlementConsumptionRecord",
    "pub struct VoterWeightScopeRecord",
    "pub enum VerificationStatus",
    "pub enum EvidenceStatus",
    "pub enum SettlementEvidenceKind",
    "pub enum VoterWeightScope",
    "fn canonical_proposal_payload_hash",
    "fn canonical_payout_fields_hash",
    "fn count_matching_signers",
    "ProofVerificationAlreadyRecorded",
    "SettlementEvidenceAlreadyRecorded",
  ];

  for (const marker of libMarkers) requireIncludes(lib, marker, libRel);

  requireRegex(
    lib,
    /seeds = \[\s*b"settlement-consumption",\s*settlement_evidence\.key\(\)\.as_ref\(\)\s*\]/s,
    libRel,
    "single-use settlement-consumption PDA derived from settlement evidence",
  );
  requireRegex(
    lib,
    /verification\.status == VerificationStatus::Verified/s,
    libRel,
    "strict ZK status check",
  );
  requireRegex(
    lib,
    /verification\.proposal != Pubkey::default\(\)/s,
    libRel,
    "strict proof verification no-overwrite guard",
  );
  requireRegex(
    lib,
    /evidence\.status == EvidenceStatus::Verified/s,
    libRel,
    "strict settlement status check",
  );
  requireRegex(
    lib,
    /evidence\.proposal != Pubkey::default\(\)/s,
    libRel,
    "strict settlement evidence no-overwrite guard",
  );
  requireRegex(
    lib,
    /domain_separator == proof_domain_separator/s,
    libRel,
    "domain-separated proof verification",
  );
  requireRegex(
    lib,
    /policy_snapshot\.zk_policy == FeaturePolicy::StrictRequired\s*\|\|\s*policy_snapshot\.zk_policy == FeaturePolicy::ThresholdAttestedRequired/s,
    libRel,
    "object-level ZK policy snapshot gate",
  );
  requireRegex(
    lib,
    /policy_snapshot\.settlement_policy == FeaturePolicy::StrictRequired\s*\|\|\s*policy_snapshot\.settlement_policy == FeaturePolicy::ThresholdAttestedRequired/s,
    libRel,
    "object-level settlement policy snapshot gate",
  );
  requireRegex(
    lib,
    /p\.status == ProposalStatus::Voting\s*&&\s*now < p\.voting_end\s*&&\s*p\.commit_count == 0\s*&&\s*p\.reveal_count == 0/s,
    libRel,
    "strict no-cancel-after-participation gate",
  );

  const docMarkers = [
    "Legacy flows remain readable and callable",
    "status == Verified",
    "canonical payload hash",
    "single-use PDA",
    "threshold attestation",
    "Policy transition invariants",
    "State Transition Diagrams",
    "cryptographic verifier CPI",
    "attested fallback",
  ];
  for (const marker of docMarkers) requireIncludes(hardening, marker, hardeningRel);

  const specMarkers = [
    "Strict V2 Overlay Invariants",
    "Settlement V2 Invariants",
    "Policy Transition Invariants",
  ];
  for (const marker of specMarkers) requireIncludes(spec, marker, specRel);

  const goLiveMarkers = [
    "V2 strict security layer",
    "DaoSecurityPolicy",
    "ProposalExecutionPolicySnapshot",
    "SettlementEvidence",
    "SettlementConsumptionRecord",
  ];
  for (const marker of goLiveMarkers) requireIncludes(goLive, marker, goLiveRel);

  console.log("[audit-readiness-v2] PASS");
}

main();
