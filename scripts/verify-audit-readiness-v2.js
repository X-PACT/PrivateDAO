"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
// SPDX-License-Identifier: AGPL-3.0-or-later
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const ROOT = path.resolve(__dirname, "..");
function read(rel) {
    return fs.readFileSync(path.join(ROOT, rel), "utf8");
}
function requireIncludes(haystack, needle, rel) {
    if (!haystack.includes(needle)) {
        throw new Error(`${rel} is missing required audit-readiness marker: ${needle}`);
    }
}
function requireRegex(haystack, regex, rel, label) {
    if (!regex.test(haystack)) {
        throw new Error(`${rel} is missing required audit-readiness pattern: ${label}`);
    }
}
function main() {
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
    for (const marker of libMarkers)
        requireIncludes(lib, marker, libRel);
    requireRegex(lib, /seeds = \[\s*b"settlement-consumption",\s*settlement_evidence\.key\(\)\.as_ref\(\)\s*\]/s, libRel, "single-use settlement-consumption PDA derived from settlement evidence");
    requireRegex(lib, /verification\.status == VerificationStatus::Verified/s, libRel, "strict ZK status check");
    requireRegex(lib, /verification\.proposal != Pubkey::default\(\)/s, libRel, "strict proof verification no-overwrite guard");
    requireRegex(lib, /evidence\.status == EvidenceStatus::Verified/s, libRel, "strict settlement status check");
    requireRegex(lib, /evidence\.proposal != Pubkey::default\(\)/s, libRel, "strict settlement evidence no-overwrite guard");
    requireRegex(lib, /domain_separator\s*==\s*proof_domain_separator/s, libRel, "domain-separated proof verification");
    requireRegex(lib, /policy_snapshot\.zk_policy\s*==\s*FeaturePolicy::StrictRequired\s*\|\|\s*policy_snapshot\.zk_policy\s*==\s*FeaturePolicy::ThresholdAttestedRequired/s, libRel, "object-level ZK policy snapshot gate");
    requireRegex(lib, /policy_snapshot\.settlement_policy\s*==\s*FeaturePolicy::StrictRequired\s*\|\|\s*policy_snapshot\.settlement_policy\s*==\s*FeaturePolicy::ThresholdAttestedRequired/s, libRel, "object-level settlement policy snapshot gate");
    requireRegex(lib, /snapshot\.proposal != Pubkey::default\(\)/s, libRel, "strict proposal policy snapshot no-overwrite guard");
    requireRegex(lib, /enforcement_rank\(&mode\) >= enforcement_rank\(&policy\.mode\)/s, libRel, "monotonic DAO policy update gate");
    requireRegex(lib, /p\.status == ProposalStatus::Voting\s*&&\s*now < p\.voting_end\s*&&\s*p\.commit_count == 0\s*&&\s*p\.reveal_count == 0/s, libRel, "strict no-cancel-after-participation gate");
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
    for (const marker of docMarkers)
        requireIncludes(hardening, marker, hardeningRel);
    const specMarkers = [
        "Strict V2 Overlay Invariants",
        "Settlement V2 Invariants",
        "Policy Transition Invariants",
    ];
    for (const marker of specMarkers)
        requireIncludes(spec, marker, specRel);
    const goLiveMarkers = [
        "V2 strict security layer",
        "DaoSecurityPolicy",
        "ProposalExecutionPolicySnapshot",
        "SettlementEvidence",
        "SettlementConsumptionRecord",
    ];
    for (const marker of goLiveMarkers)
        requireIncludes(goLive, marker, goLiveRel);
    console.log("[audit-readiness-v2] PASS");
}
main();
