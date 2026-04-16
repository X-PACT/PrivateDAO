use anchor_lang::prelude::{Clock, Context, Pubkey, Result};
use anchor_lang::system_program::{transfer, Transfer};

use crate::*;
use crate::utils::*;

pub fn anchor_zk_proof(
    ctx: Context<AnchorZkProof>,
    layer: ZkProofLayer,
    proof_system: ZkProofSystem,
    proof_hash: [u8; 32],
    public_inputs_hash: [u8; 32],
    verification_key_hash: [u8; 32],
    bundle_hash: [u8; 32],
) -> Result<()> {
    let recorder = ctx.accounts.recorder.key();
    require!(
        recorder == ctx.accounts.dao.authority || recorder == ctx.accounts.proposal.proposer,
        Error::UnauthorizedZkAnchor
    );
    require!(!is_zero_hash(&proof_hash), Error::InvalidZkArtifactHash);
    require!(
        !is_zero_hash(&public_inputs_hash),
        Error::InvalidZkArtifactHash
    );
    require!(
        !is_zero_hash(&verification_key_hash),
        Error::InvalidZkArtifactHash
    );
    require!(!is_zero_hash(&bundle_hash), Error::InvalidZkArtifactHash);

    let anchor = &mut ctx.accounts.zk_proof_anchor;
    anchor.dao = ctx.accounts.dao.key();
    anchor.proposal = ctx.accounts.proposal.key();
    anchor.recorded_by = recorder;
    anchor.layer = layer.clone();
    anchor.proof_system = proof_system.clone();
    anchor.proof_hash = proof_hash;
    anchor.public_inputs_hash = public_inputs_hash;
    anchor.verification_key_hash = verification_key_hash;
    anchor.bundle_hash = bundle_hash;
    anchor.recorded_at = Clock::get()?.unix_timestamp;
    anchor.bump = ctx.bumps.zk_proof_anchor;

    emit!(ZkProofAnchored {
        dao: anchor.dao,
        proposal: anchor.proposal,
        recorded_by: anchor.recorded_by,
        layer,
        proof_system,
        proof_hash,
        public_inputs_hash,
        verification_key_hash,
        bundle_hash,
    });
    Ok(())
}

pub fn verify_zk_proof_on_chain(
    ctx: Context<VerifyZkProofOnChain>,
    layer: ZkProofLayer,
    verification_mode: ZkVerificationMode,
    verifier_program: Option<Pubkey>,
) -> Result<()> {
    let verifier = ctx.accounts.verifier.key();
    require!(
        verification_mode == ZkVerificationMode::Parallel
            || verification_mode == ZkVerificationMode::ZkEnforced,
        Error::InvalidZkVerificationMode
    );
    require!(
        verifier == ctx.accounts.dao.authority || verifier == ctx.accounts.proposal.proposer,
        Error::UnauthorizedZkVerifier
    );

    let anchor = &ctx.accounts.zk_proof_anchor;
    require!(
        anchor.dao == ctx.accounts.dao.key() && anchor.proposal == ctx.accounts.proposal.key(),
        Error::ZkProofAnchorMismatch
    );
    require!(anchor.layer == layer, Error::ZkProofAnchorMismatch);

    let receipt = &mut ctx.accounts.zk_verification_receipt;
    if receipt.proposal != Pubkey::default() {
        require!(
            receipt.dao == ctx.accounts.dao.key()
                && receipt.proposal == ctx.accounts.proposal.key()
                && receipt.layer == layer,
            Error::ZkVerificationReceiptMismatch
        );
        require!(
            !(receipt.verification_mode == ZkVerificationMode::ZkEnforced
                && verification_mode == ZkVerificationMode::Parallel),
            Error::InsufficientZkVerificationMode
        );
    }
    receipt.dao = ctx.accounts.dao.key();
    receipt.proposal = ctx.accounts.proposal.key();
    receipt.verified_by = verifier;
    receipt.layer = anchor.layer.clone();
    receipt.proof_system = anchor.proof_system.clone();
    receipt.verification_mode = verification_mode.clone();
    receipt.verifier_program = verifier_program;
    receipt.proof_hash = anchor.proof_hash;
    receipt.public_inputs_hash = anchor.public_inputs_hash;
    receipt.verification_key_hash = anchor.verification_key_hash;
    receipt.bundle_hash = anchor.bundle_hash;
    receipt.verified_at = Clock::get()?.unix_timestamp;
    receipt.bump = ctx.bumps.zk_verification_receipt;

    emit!(ZkProofVerified {
        dao: receipt.dao,
        proposal: receipt.proposal,
        verified_by: receipt.verified_by,
        layer: receipt.layer.clone(),
        proof_system: receipt.proof_system.clone(),
        verification_mode,
        verifier_program: receipt.verifier_program,
        proof_hash: receipt.proof_hash,
        public_inputs_hash: receipt.public_inputs_hash,
        verification_key_hash: receipt.verification_key_hash,
        bundle_hash: receipt.bundle_hash,
    });
    Ok(())
}

pub fn configure_proposal_zk_mode(
    ctx: Context<ConfigureProposalZkMode>,
    mode: ProposalZkMode,
) -> Result<()> {
    let operator = ctx.accounts.operator.key();
    require!(
        operator == ctx.accounts.dao.authority || operator == ctx.accounts.proposal.proposer,
        Error::UnauthorizedZkModeConfig
    );
    require!(
        ctx.accounts.proposal.status == ProposalStatus::Voting
            && ctx.accounts.proposal.commit_count == 0
            && ctx.accounts.proposal.reveal_count == 0,
        Error::ProposalZkModeLocked
    );

    let policy = &mut ctx.accounts.proposal_zk_policy;
    let policy_initialized = policy.proposal != Pubkey::default();
    if policy_initialized {
        require!(
            policy.dao == ctx.accounts.dao.key()
                && policy.proposal == ctx.accounts.proposal.key(),
            Error::ZkVerificationReceiptMismatch
        );
        require!(
            policy.mode != ProposalZkMode::ZkEnforced,
            Error::ProposalZkModeImmutable
        );
    }

    let required_layers_mask = match mode {
        ProposalZkMode::Companion | ProposalZkMode::Parallel => 0,
        ProposalZkMode::ZkEnforced => {
            validate_zk_receipt(
                &ctx.accounts.dao,
                &ctx.accounts.proposal,
                &ctx.accounts.vote_zk_receipt,
                ZkProofLayer::Vote,
                Some(ZkVerificationMode::ZkEnforced),
            )?;
            validate_zk_receipt(
                &ctx.accounts.dao,
                &ctx.accounts.proposal,
                &ctx.accounts.delegation_zk_receipt,
                ZkProofLayer::Delegation,
                Some(ZkVerificationMode::ZkEnforced),
            )?;
            validate_zk_receipt(
                &ctx.accounts.dao,
                &ctx.accounts.proposal,
                &ctx.accounts.tally_zk_receipt,
                ZkProofLayer::Tally,
                Some(ZkVerificationMode::ZkEnforced),
            )?;
            ProposalZkPolicy::ALL_LAYERS_MASK
        }
    };

    policy.dao = ctx.accounts.dao.key();
    policy.proposal = ctx.accounts.proposal.key();
    policy.configured_by = operator;
    policy.mode = mode.clone();
    policy.required_layers_mask = required_layers_mask;
    policy.configured_at = Clock::get()?.unix_timestamp;
    policy.bump = ctx.bumps.proposal_zk_policy;

    emit!(ProposalZkModeConfigured {
        dao: policy.dao,
        proposal: policy.proposal,
        configured_by: policy.configured_by,
        mode,
        required_layers_mask,
    });
    Ok(())
}

pub fn finalize_zk_enforced_proposal(ctx: Context<FinalizeZkEnforcedProposal>) -> Result<()> {
    let now = Clock::get()?.unix_timestamp;
    require!(
        now >= ctx.accounts.proposal.reveal_end,
        Error::RevealStillOpen
    );
    require!(
        ctx.accounts.proposal.status == ProposalStatus::Voting,
        Error::AlreadyFinalized
    );
    require!(
        ctx.accounts.proposal_zk_policy.mode == ProposalZkMode::ZkEnforced,
        Error::ProposalNotZkEnforced
    );
    require!(
        ctx.accounts.proposal_zk_policy.required_layers_mask == ProposalZkPolicy::ALL_LAYERS_MASK,
        Error::ZkVerificationReceiptMissing
    );

    finalize_proposal_state(&ctx.accounts.dao, &mut ctx.accounts.proposal, now)
}

pub fn snapshot_proposal_execution_policy(
    ctx: Context<SnapshotProposalExecutionPolicy>,
) -> Result<()> {
    let snapshot = &mut ctx.accounts.proposal_execution_policy_snapshot;
    let policy = &ctx.accounts.dao_security_policy;
    if snapshot.proposal != Pubkey::default() {
        require!(
            snapshot.dao == ctx.accounts.dao.key()
                && snapshot.proposal == ctx.accounts.proposal.key()
                && snapshot.created_under_mode == policy.mode
                && snapshot.zk_policy == policy.zk_policy
                && snapshot.settlement_policy == policy.settlement_policy
                && snapshot.cancel_policy == policy.cancel_policy
                && snapshot.object_version == 2,
            Error::PolicySnapshotAlreadyRecorded
        );
        emit!(ProposalExecutionPolicySnapshotted {
            dao: snapshot.dao,
            proposal: snapshot.proposal,
            created_under_mode: snapshot.created_under_mode.clone(),
            zk_policy: snapshot.zk_policy.clone(),
            settlement_policy: snapshot.settlement_policy.clone(),
            cancel_policy: snapshot.cancel_policy.clone(),
            object_version: snapshot.object_version,
        });
        return Ok(());
    }
    snapshot.dao = ctx.accounts.dao.key();
    snapshot.proposal = ctx.accounts.proposal.key();
    snapshot.created_under_mode = policy.mode.clone();
    snapshot.zk_policy = policy.zk_policy.clone();
    snapshot.settlement_policy = policy.settlement_policy.clone();
    snapshot.cancel_policy = policy.cancel_policy.clone();
    snapshot.object_version = 2;
    snapshot.snapshot_at = Clock::get()?.unix_timestamp;
    snapshot.bump = ctx.bumps.proposal_execution_policy_snapshot;

    emit!(ProposalExecutionPolicySnapshotted {
        dao: snapshot.dao,
        proposal: snapshot.proposal,
        created_under_mode: snapshot.created_under_mode.clone(),
        zk_policy: snapshot.zk_policy.clone(),
        settlement_policy: snapshot.settlement_policy.clone(),
        cancel_policy: snapshot.cancel_policy.clone(),
        object_version: snapshot.object_version,
    });
    Ok(())
}

pub fn snapshot_proposal_governance_policy_v3(
    ctx: Context<SnapshotProposalGovernancePolicyV3>,
) -> Result<()> {
    let snapshot = &mut ctx.accounts.proposal_governance_policy_snapshot_v3;
    let policy = &ctx.accounts.dao_governance_policy_v3;
    let eligible_capital = ctx.accounts.governance_token.supply;
    require!(eligible_capital > 0, Error::InvalidGovernanceSnapshot);

    if snapshot.proposal != Pubkey::default() {
        require!(
            snapshot.dao == ctx.accounts.dao.key()
                && snapshot.proposal == ctx.accounts.proposal.key()
                && snapshot.quorum_policy == policy.quorum_policy
                && snapshot.reveal_rebate_policy == policy.reveal_rebate_policy
                && snapshot.reveal_rebate_lamports == policy.reveal_rebate_lamports
                && snapshot.eligible_capital == eligible_capital
                && snapshot.object_version == 3,
            Error::GovernancePolicySnapshotAlreadyRecorded
        );
        emit!(ProposalGovernancePolicySnapshottedV3 {
            dao: snapshot.dao,
            proposal: snapshot.proposal,
            quorum_policy: snapshot.quorum_policy.clone(),
            reveal_rebate_policy: snapshot.reveal_rebate_policy.clone(),
            reveal_rebate_lamports: snapshot.reveal_rebate_lamports,
            eligible_capital: snapshot.eligible_capital,
            object_version: snapshot.object_version,
        });
        return Ok(());
    }

    snapshot.dao = ctx.accounts.dao.key();
    snapshot.proposal = ctx.accounts.proposal.key();
    snapshot.quorum_policy = policy.quorum_policy.clone();
    snapshot.reveal_rebate_policy = policy.reveal_rebate_policy.clone();
    snapshot.reveal_rebate_lamports = policy.reveal_rebate_lamports;
    snapshot.eligible_capital = eligible_capital;
    snapshot.snapshot_at = Clock::get()?.unix_timestamp;
    snapshot.object_version = 3;
    snapshot.bump = ctx.bumps.proposal_governance_policy_snapshot_v3;

    emit!(ProposalGovernancePolicySnapshottedV3 {
        dao: snapshot.dao,
        proposal: snapshot.proposal,
        quorum_policy: snapshot.quorum_policy.clone(),
        reveal_rebate_policy: snapshot.reveal_rebate_policy.clone(),
        reveal_rebate_lamports: snapshot.reveal_rebate_lamports,
        eligible_capital: snapshot.eligible_capital,
        object_version: snapshot.object_version,
    });
    Ok(())
}

pub fn snapshot_proposal_settlement_policy_v3(
    ctx: Context<SnapshotProposalSettlementPolicyV3>,
) -> Result<()> {
    let snapshot = &mut ctx.accounts.proposal_settlement_policy_snapshot_v3;
    let policy = &ctx.accounts.dao_settlement_policy_v3;
    let payout_fields_hash = canonical_payout_fields_hash(
        &ctx.accounts.dao.key(),
        &ctx.accounts.proposal.key(),
        &ctx.accounts.confidential_payout_plan,
    );

    if snapshot.proposal != Pubkey::default() {
        require!(
            snapshot.dao == ctx.accounts.dao.key()
                && snapshot.proposal == ctx.accounts.proposal.key()
                && snapshot.payout_plan == ctx.accounts.confidential_payout_plan.key()
                && snapshot.min_evidence_age_seconds == policy.min_evidence_age_seconds
                && snapshot.max_payout_amount == policy.max_payout_amount
                && snapshot.require_refhe_settlement == policy.require_refhe_settlement
                && snapshot.require_magicblock_settlement == policy.require_magicblock_settlement
                && snapshot.payout_fields_hash == payout_fields_hash
                && snapshot.object_version == 3,
            Error::SettlementPolicySnapshotAlreadyRecorded
        );
        emit!(ProposalSettlementPolicySnapshottedV3 {
            dao: snapshot.dao,
            proposal: snapshot.proposal,
            payout_plan: snapshot.payout_plan,
            min_evidence_age_seconds: snapshot.min_evidence_age_seconds,
            max_payout_amount: snapshot.max_payout_amount,
            require_refhe_settlement: snapshot.require_refhe_settlement,
            require_magicblock_settlement: snapshot.require_magicblock_settlement,
            object_version: snapshot.object_version,
        });
        return Ok(());
    }

    snapshot.dao = ctx.accounts.dao.key();
    snapshot.proposal = ctx.accounts.proposal.key();
    snapshot.payout_plan = ctx.accounts.confidential_payout_plan.key();
    snapshot.min_evidence_age_seconds = policy.min_evidence_age_seconds;
    snapshot.max_payout_amount = policy.max_payout_amount;
    snapshot.require_refhe_settlement = policy.require_refhe_settlement;
    snapshot.require_magicblock_settlement = policy.require_magicblock_settlement;
    snapshot.payout_fields_hash = payout_fields_hash;
    snapshot.snapshot_at = Clock::get()?.unix_timestamp;
    snapshot.object_version = 3;
    snapshot.bump = ctx.bumps.proposal_settlement_policy_snapshot_v3;

    emit!(ProposalSettlementPolicySnapshottedV3 {
        dao: snapshot.dao,
        proposal: snapshot.proposal,
        payout_plan: snapshot.payout_plan,
        min_evidence_age_seconds: snapshot.min_evidence_age_seconds,
        max_payout_amount: snapshot.max_payout_amount,
        require_refhe_settlement: snapshot.require_refhe_settlement,
        require_magicblock_settlement: snapshot.require_magicblock_settlement,
        object_version: snapshot.object_version,
    });
    Ok(())
}

pub fn fund_reveal_rebate_vault_v3(
    ctx: Context<FundRevealRebateVaultV3>,
    amount: u64,
) -> Result<()> {
    require!(amount > 0, Error::InvalidRevealRebateConfig);
    require!(
        ctx.accounts.dao_governance_policy_v3.reveal_rebate_policy
            == RevealRebatePolicyV3::DedicatedVaultRequired,
        Error::InvalidRevealRebateConfig
    );
    let vault = &mut ctx.accounts.reveal_rebate_vault;
    if vault.dao == Pubkey::default() {
        vault.dao = ctx.accounts.dao.key();
        vault.bump = ctx.bumps.reveal_rebate_vault;
    } else {
        require!(
            vault.dao == ctx.accounts.dao.key(),
            Error::RevealRebateVaultMismatch
        );
    }
    transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            Transfer {
                from: ctx.accounts.funder.to_account_info(),
                to: ctx.accounts.reveal_rebate_vault.to_account_info(),
            },
        ),
        amount,
    )?;

    emit!(RevealRebateVaultFundedV3 {
        dao: ctx.accounts.dao.key(),
        funder: ctx.accounts.funder.key(),
        amount,
        vault: ctx.accounts.reveal_rebate_vault.key(),
    });
    Ok(())
}

pub fn record_proof_verification_v2(
    ctx: Context<RecordProofVerificationV2>,
    verification_kind: VerificationKind,
    payload_hash: [u8; 32],
    proof_hash: [u8; 32],
    public_inputs_hash: [u8; 32],
    verification_key_hash: [u8; 32],
    domain_separator: [u8; 32],
) -> Result<()> {
    let policy = &ctx.accounts.dao_security_policy;
    require!(!policy.emergency_disabled, Error::SecurityPolicyDisabled);
    require!(
        policy.zk_policy == FeaturePolicy::StrictRequired
            || policy.zk_policy == FeaturePolicy::ThresholdAttestedRequired,
        Error::StrictPolicyRequired
    );
    require!(
        verification_kind == VerificationKind::ThresholdAttestation,
        Error::UnsupportedVerificationKind
    );
    require!(!is_zero_hash(&payload_hash), Error::InvalidZkArtifactHash);
    require!(!is_zero_hash(&proof_hash), Error::InvalidZkArtifactHash);
    require!(
        !is_zero_hash(&public_inputs_hash) && !is_zero_hash(&verification_key_hash),
        Error::InvalidZkArtifactHash
    );
    require!(
        domain_separator == proof_domain_separator(&ctx.accounts.dao.key(), &ctx.accounts.proposal.key()),
        Error::PayloadHashMismatch
    );
    require!(
        count_matching_signers(
            Some(ctx.accounts.recorder.key()),
            ctx.remaining_accounts,
            &policy.proof_attestors,
            policy.proof_attestor_count,
        ) >= policy.proof_threshold,
        Error::AttestationThresholdNotMet
    );

    let now = Clock::get()?.unix_timestamp;
    let verification = &mut ctx.accounts.proposal_proof_verification;
    if verification.proposal != Pubkey::default() {
        require!(
            verification.dao == ctx.accounts.dao.key()
                && verification.proposal == ctx.accounts.proposal.key()
                && verification.payload_hash == payload_hash
                && verification.proof_hash == proof_hash
                && verification.public_inputs_hash == public_inputs_hash
                && verification.verification_key_hash == verification_key_hash
                && verification.verification_kind == verification_kind
                && verification.status == VerificationStatus::Verified
                && verification.domain_separator == domain_separator
                && now <= verification.expires_at,
            Error::ProofVerificationAlreadyRecorded
        );
        emit!(ProofVerificationRecordedV2 {
            dao: verification.dao,
            proposal: verification.proposal,
            verification_kind,
            status: verification.status.clone(),
            payload_hash: verification.payload_hash,
            proof_hash: verification.proof_hash,
            expires_at: verification.expires_at,
        });
        return Ok(());
    }
    verification.dao = ctx.accounts.dao.key();
    verification.proposal = ctx.accounts.proposal.key();
    verification.payload_hash = payload_hash;
    verification.proof_hash = proof_hash;
    verification.public_inputs_hash = public_inputs_hash;
    verification.verification_key_hash = verification_key_hash;
    verification.verification_kind = verification_kind.clone();
    verification.status = VerificationStatus::Verified;
    verification.domain_separator = domain_separator;
    verification.verified_by = ctx.accounts.recorder.key();
    verification.verified_at = now;
    verification.expires_at = now
        .checked_add(policy.proof_ttl_seconds)
        .ok_or(Error::Overflow)?;
    verification.bump = ctx.bumps.proposal_proof_verification;

    emit!(ProofVerificationRecordedV2 {
        dao: verification.dao,
        proposal: verification.proposal,
        verification_kind,
        status: verification.status.clone(),
        payload_hash: verification.payload_hash,
        proof_hash: verification.proof_hash,
        expires_at: verification.expires_at,
    });
    Ok(())
}

pub fn finalize_zk_enforced_proposal_v2(
    ctx: Context<FinalizeZkEnforcedProposalV2>,
) -> Result<()> {
    let now = Clock::get()?.unix_timestamp;
    let policy_snapshot = &ctx.accounts.proposal_execution_policy_snapshot;
    let verification = &ctx.accounts.proposal_proof_verification;
    require!(
        policy_snapshot.proposal == ctx.accounts.proposal.key()
            && policy_snapshot.dao == ctx.accounts.dao.key(),
        Error::PolicySnapshotMismatch
    );
    require!(
        policy_snapshot.zk_policy == FeaturePolicy::StrictRequired
            || policy_snapshot.zk_policy == FeaturePolicy::ThresholdAttestedRequired,
        Error::StrictPolicyRequired
    );
    require!(
        verification.dao == ctx.accounts.dao.key()
            && verification.proposal == ctx.accounts.proposal.key(),
        Error::ProofVerificationMismatch
    );
    require!(
        verification.status == VerificationStatus::Verified,
        Error::ProofVerificationNotVerified
    );
    require!(now <= verification.expires_at, Error::StaleProofVerification);
    require!(
        verification.payload_hash
            == canonical_proposal_payload_hash(
                &ctx.accounts.dao.key(),
                &ctx.accounts.proposal.key(),
                policy_snapshot.object_version,
            ),
        Error::PayloadHashMismatch
    );

    require!(
        now >= ctx.accounts.proposal.reveal_end,
        Error::RevealStillOpen
    );
    require!(
        ctx.accounts.proposal.status == ProposalStatus::Voting,
        Error::AlreadyFinalized
    );

    finalize_proposal_state(&ctx.accounts.dao, &mut ctx.accounts.proposal, now)
}

pub fn finalize_zk_enforced_proposal_v3(
    ctx: Context<FinalizeZkEnforcedProposalV3>,
) -> Result<()> {
    let now = Clock::get()?.unix_timestamp;
    let policy_snapshot = &ctx.accounts.proposal_execution_policy_snapshot;
    let governance_snapshot = &ctx.accounts.proposal_governance_policy_snapshot_v3;
    let verification = &ctx.accounts.proposal_proof_verification;
    require!(
        policy_snapshot.proposal == ctx.accounts.proposal.key()
            && policy_snapshot.dao == ctx.accounts.dao.key(),
        Error::PolicySnapshotMismatch
    );
    require!(
        governance_snapshot.proposal == ctx.accounts.proposal.key()
            && governance_snapshot.dao == ctx.accounts.dao.key(),
        Error::GovernancePolicySnapshotMismatch
    );
    require!(
        policy_snapshot.zk_policy == FeaturePolicy::StrictRequired
            || policy_snapshot.zk_policy == FeaturePolicy::ThresholdAttestedRequired,
        Error::StrictPolicyRequired
    );
    require!(
        verification.dao == ctx.accounts.dao.key()
            && verification.proposal == ctx.accounts.proposal.key(),
        Error::ProofVerificationMismatch
    );
    require!(
        verification.status == VerificationStatus::Verified,
        Error::ProofVerificationNotVerified
    );
    require!(now <= verification.expires_at, Error::StaleProofVerification);
    require!(
        verification.payload_hash
            == canonical_proposal_payload_hash(
                &ctx.accounts.dao.key(),
                &ctx.accounts.proposal.key(),
                policy_snapshot.object_version,
            ),
        Error::PayloadHashMismatch
    );
    require!(
        now >= ctx.accounts.proposal.reveal_end,
        Error::RevealStillOpen
    );
    require!(
        ctx.accounts.proposal.status == ProposalStatus::Voting,
        Error::AlreadyFinalized
    );

    finalize_proposal_state_v3(
        &ctx.accounts.dao,
        &mut ctx.accounts.proposal,
        governance_snapshot,
        now,
    )
}

pub fn record_settlement_evidence_v2(
    ctx: Context<RecordSettlementEvidenceV2>,
    kind: SettlementEvidenceKind,
    settlement_id: [u8; 32],
    evidence_hash: [u8; 32],
    payout_fields_hash: [u8; 32],
) -> Result<()> {
    let policy = &ctx.accounts.dao_security_policy;
    require!(!policy.emergency_disabled, Error::SecurityPolicyDisabled);
    require!(
        policy.settlement_policy == FeaturePolicy::StrictRequired
            || policy.settlement_policy == FeaturePolicy::ThresholdAttestedRequired,
        Error::StrictPolicyRequired
    );
    require!(
        !is_zero_hash(&settlement_id),
        Error::InvalidSettlementEvidence
    );
    require!(
        !is_zero_hash(&evidence_hash),
        Error::InvalidSettlementEvidence
    );
    require!(
        payout_fields_hash
            == canonical_payout_fields_hash(
                &ctx.accounts.dao.key(),
                &ctx.accounts.proposal.key(),
                &ctx.accounts.confidential_payout_plan,
            ),
        Error::SettlementEvidenceMismatch
    );
    require!(
        count_matching_signers(
            Some(ctx.accounts.recorder.key()),
            ctx.remaining_accounts,
            &policy.settlement_attestors,
            policy.settlement_attestor_count,
        ) >= policy.settlement_threshold,
        Error::AttestationThresholdNotMet
    );

    let now = Clock::get()?.unix_timestamp;
    let evidence = &mut ctx.accounts.settlement_evidence;
    if evidence.proposal != Pubkey::default() {
        require!(
            evidence.dao == ctx.accounts.dao.key()
                && evidence.proposal == ctx.accounts.proposal.key()
                && evidence.payout_plan == ctx.accounts.confidential_payout_plan.key()
                && evidence.kind == kind
                && evidence.status == EvidenceStatus::Verified
                && evidence.settlement_id == settlement_id
                && evidence.evidence_hash == evidence_hash
                && evidence.payout_fields_hash == payout_fields_hash
                && now >= evidence.valid_after
                && now <= evidence.expires_at,
            Error::SettlementEvidenceAlreadyRecorded
        );
        emit!(SettlementEvidenceRecordedV2 {
            dao: evidence.dao,
            proposal: evidence.proposal,
            payout_plan: evidence.payout_plan,
            kind,
            status: evidence.status.clone(),
            settlement_id: evidence.settlement_id,
            evidence_hash: evidence.evidence_hash,
            expires_at: evidence.expires_at,
        });
        return Ok(());
    }
    evidence.dao = ctx.accounts.dao.key();
    evidence.proposal = ctx.accounts.proposal.key();
    evidence.payout_plan = ctx.accounts.confidential_payout_plan.key();
    evidence.kind = kind.clone();
    evidence.status = EvidenceStatus::Verified;
    evidence.settlement_id = settlement_id;
    evidence.evidence_hash = evidence_hash;
    evidence.payout_fields_hash = payout_fields_hash;
    evidence.recorded_by = ctx.accounts.recorder.key();
    evidence.valid_after = now;
    evidence.expires_at = now
        .checked_add(policy.settlement_ttl_seconds)
        .ok_or(Error::Overflow)?;
    evidence.bump = ctx.bumps.settlement_evidence;

    emit!(SettlementEvidenceRecordedV2 {
        dao: evidence.dao,
        proposal: evidence.proposal,
        payout_plan: evidence.payout_plan,
        kind,
        status: evidence.status.clone(),
        settlement_id: evidence.settlement_id,
        evidence_hash: evidence.evidence_hash,
        expires_at: evidence.expires_at,
    });
    Ok(())
}
