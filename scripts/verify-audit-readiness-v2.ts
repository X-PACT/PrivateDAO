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
  const sourceRels = [
    "programs/private-dao/src/lib.rs",
    "programs/private-dao/src/dao.rs",
    "programs/private-dao/src/privacy.rs",
    "programs/private-dao/src/treasury.rs",
    "programs/private-dao/src/voting.rs",
    "programs/private-dao/src/utils.rs",
    "programs/private-dao/src/error.rs",
  ];
  const hardeningRel = "docs/security-hardening-v2.md";
  const specRel = "docs/protocol-spec.md";
  const goLiveRel = "docs/mainnet-go-live-checklist.md";

  const lib = read(libRel);
  const programSource = sourceRels.map((rel) => read(rel)).join("\n");
  const hardening = read(hardeningRel);
  const spec = read(specRel);
  const goLive = read(goLiveRel);

  const libMarkers = [
    "pub fn cancel_proposal_v2",
    "pub fn snapshot_proposal_execution_policy",
    "pub fn update_dao_security_policy_v2",
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
    "fn enforcement_rank",
    "fn feature_rank",
    "fn cancel_rank",
    "SecurityPolicyAlreadyInitialized",
    "PolicyRollbackNotAllowed",
    "PolicySnapshotAlreadyRecorded",
    "ProofVerificationAlreadyRecorded",
    "SettlementEvidenceAlreadyRecorded",
  ];

  for (const marker of libMarkers) requireIncludes(programSource, marker, "programs/private-dao/src");

  requireRegex(
    programSource,
    /seeds = \[\s*b"settlement-consumption",\s*settlement_evidence\.key\(\)\.as_ref\(\)\s*\]/s,
    "programs/private-dao/src",
    "single-use settlement-consumption PDA derived from settlement evidence",
  );
  requireRegex(
    programSource,
    /verification\.status == VerificationStatus::Verified/s,
    "programs/private-dao/src",
    "strict ZK status check",
  );
  requireRegex(
    programSource,
    /verification\.proposal != Pubkey::default\(\)/s,
    "programs/private-dao/src",
    "strict proof verification no-overwrite guard",
  );
  requireRegex(
    programSource,
    /evidence\.status == EvidenceStatus::Verified/s,
    "programs/private-dao/src",
    "strict settlement status check",
  );
  requireRegex(
    programSource,
    /evidence\.proposal != Pubkey::default\(\)/s,
    "programs/private-dao/src",
    "strict settlement evidence no-overwrite guard",
  );
  requireRegex(
    programSource,
    /domain_separator\s*==\s*proof_domain_separator/s,
    "programs/private-dao/src",
    "domain-separated proof verification",
  );
  requireRegex(
    programSource,
    /policy_snapshot\.zk_policy\s*==\s*FeaturePolicy::StrictRequired\s*\|\|\s*policy_snapshot\.zk_policy\s*==\s*FeaturePolicy::ThresholdAttestedRequired/s,
    "programs/private-dao/src",
    "object-level ZK policy snapshot gate",
  );
  requireRegex(
    programSource,
    /policy_snapshot\.settlement_policy\s*==\s*FeaturePolicy::StrictRequired\s*\|\|\s*policy_snapshot\.settlement_policy\s*==\s*FeaturePolicy::ThresholdAttestedRequired/s,
    "programs/private-dao/src",
    "object-level settlement policy snapshot gate",
  );
  requireRegex(
    programSource,
    /snapshot\.proposal != Pubkey::default\(\)/s,
    "programs/private-dao/src",
    "strict proposal policy snapshot no-overwrite guard",
  );
  requireRegex(
    programSource,
    /enforcement_rank\(&mode\) >= enforcement_rank\(&policy\.mode\)/s,
    "programs/private-dao/src",
    "monotonic DAO policy update gate",
  );
  requireRegex(
    programSource,
    /p\.status == ProposalStatus::Voting\s*&&\s*now < p\.voting_end\s*&&\s*p\.commit_count == 0\s*&&\s*p\.reveal_count == 0/s,
    "programs/private-dao/src",
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
