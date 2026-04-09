// SPDX-License-Identifier: AGPL-3.0-or-later
use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};
use anchor_spl::token_interface::{
    self as token_interface, Mint, TokenAccount, TokenInterface, Transfer as TokenTransfer,
};
use anchor_spl::{token, token_2022};
use sha2::{Digest, Sha256};

declare_id!("5AhUsbQ4mJ8Xh7QJEomuS85qGgmK9iNvFqzF669Y7Psx");

// ─────────────────────────────────────────────────────────────────────────────
//  PrivateDAO — Commit-reveal governance for Solana
//  Solana Graveyard Hackathon 2026
//
//  The problem: every vote on Realms is visible the moment it's cast.
//  That enables three attacks: vote buying, whale intimidation, treasury MEV.
//
//  The fix — three-phase commit-reveal:
//    Phase 1 COMMIT  → voter submits sha256(vote ‖ salt ‖ proposal ‖ voter)
//                      tally shows 0/0 throughout the entire voting period
//    Phase 2 REVEAL  → voter proves (vote, salt), tally updates
//    Phase 3 EXECUTE → after timelock delay, treasury action fires
//
//  Voting modes:
//    TokenWeighted → weight = raw token balance
//    Quadratic     → weight = √(token balance)
//                    Reduces concentration within a single-identity model;
//                    Sybil resistance still depends on DAO policy.
//    DualChamber   → capital chamber (token-weighted) AND community chamber
//                    (quadratic) both must clear their threshold independently.
//                    Whales need community support. Community needs capital buy-in.
//
//  Original features not found on any other Solana DAO tool:
//    Private delegation  — delegator grants weight to delegatee for one proposal.
//                          The vote stays hidden; even the delegatee chooses it.
//    Keeper auto-reveal  — voter authorizes a proposal-scoped keeper at
//                          commit time.
//                          Keeper can only submit the exact reveal if the
//                          voter forgets.
//                          Keeper earns the SOL rebate. Vote unchanged.
//    Timelock + veto     — passed proposals wait execution_delay_seconds.
//                          DAO authority can veto during the veto window.
//                          Mirrors Compound/Aave security model on Solana.
//    Cancel proposal     — authority cancels an open proposal immediately.
//    Realms plugin       — spl-governance-addin-api VoterWeightRecord layout.
//    migrate_from_realms — mirror a Realms DAO into PrivateDAO in one TX.
// ─────────────────────────────────────────────────────────────────────────────

pub const REVEAL_REBATE_LAMPORTS: u64 = 1_000_000; // 0.001 SOL per reveal
pub const MAX_REVEAL_REBATE_V3_LAMPORTS: u64 = REVEAL_REBATE_LAMPORTS;
pub const DEFAULT_EXECUTION_DELAY: i64 = 86_400; // 24-hour timelock default
pub const MIN_REVEAL_WINDOW_SECONDS: i64 = 5;
pub const MIN_VOTING_DURATION_SECONDS: i64 = 5;
pub const VOTER_WEIGHT_EXPIRY_SLOTS: u64 = 10_000;
pub const MAX_POLICY_ATTESTORS: usize = 5;
pub const PAYOUT_PAYLOAD_DOMAIN_V1: &[u8] = b"PrivateDAO::payout-payload:v1";
pub const PROOF_PAYLOAD_DOMAIN_V1: &[u8] = b"PrivateDAO::proof-payload:v1";
pub const SETTLEMENT_EVIDENCE_DOMAIN_V1: &[u8] = b"PrivateDAO::settlement-evidence:v1";

#[program]
pub mod private_dao {
    use super::*;

    // ── Initialize DAO ────────────────────────────────────────────────────────

    pub fn initialize_dao(
        ctx: Context<InitializeDao>,
        dao_name: String,
        quorum_percentage: u8,
        governance_token_required: u64,
        reveal_window_seconds: i64,
        execution_delay_seconds: i64,
        voting_config: VotingConfig,
    ) -> Result<()> {
        require!(dao_name.len() <= 64, Error::NameTooLong);
        require!(
            quorum_percentage > 0 && quorum_percentage <= 100,
            Error::InvalidQuorum
        );
        require!(
            reveal_window_seconds >= MIN_REVEAL_WINDOW_SECONDS,
            Error::RevealWindowTooShort
        );
        require!(execution_delay_seconds >= 0, Error::InvalidExecutionDelay);
        validate_voting_config(&voting_config)?;

        let dao = &mut ctx.accounts.dao;
        dao.authority = ctx.accounts.authority.key();
        dao.dao_name = dao_name.clone();
        dao.governance_token = ctx.accounts.governance_token.key();
        dao.quorum_percentage = quorum_percentage;
        dao.governance_token_required = governance_token_required;
        dao.reveal_window_seconds = reveal_window_seconds;
        dao.execution_delay_seconds = execution_delay_seconds;
        dao.voting_config = voting_config;
        dao.proposal_count = 0;
        dao.bump = ctx.bumps.dao;
        dao.migrated_from_realms = None;

        emit!(DaoCreated {
            dao: dao.key(),
            name: dao_name,
            authority: dao.authority
        });
        Ok(())
    }

    // ── Migrate from Realms (Sunrise track) ──────────────────────────────────
    //
    // Takes an existing Realms governance pubkey and mirrors its token config.
    // Non-destructive: no treasury moves, no proposal disruption, same token.

    pub fn migrate_from_realms(
        ctx: Context<MigrateFromRealms>,
        dao_name: String,
        realms_governance: Pubkey,
        quorum_percentage: u8,
        reveal_window_seconds: i64,
        execution_delay_seconds: i64,
        voting_config: VotingConfig,
    ) -> Result<()> {
        require!(dao_name.len() <= 64, Error::NameTooLong);
        require!(
            quorum_percentage > 0 && quorum_percentage <= 100,
            Error::InvalidQuorum
        );
        require!(
            reveal_window_seconds >= MIN_REVEAL_WINDOW_SECONDS,
            Error::RevealWindowTooShort
        );
        require!(execution_delay_seconds >= 0, Error::InvalidExecutionDelay);
        validate_voting_config(&voting_config)?;

        let dao = &mut ctx.accounts.dao;
        dao.authority = ctx.accounts.authority.key();
        dao.dao_name = dao_name.clone();
        dao.governance_token = ctx.accounts.governance_token.key();
        dao.quorum_percentage = quorum_percentage;
        dao.governance_token_required = 0;
        dao.reveal_window_seconds = reveal_window_seconds;
        dao.execution_delay_seconds = execution_delay_seconds;
        dao.voting_config = voting_config;
        dao.proposal_count = 0;
        dao.bump = ctx.bumps.dao;
        dao.migrated_from_realms = Some(realms_governance);

        emit!(DaoMigratedFromRealms {
            dao: dao.key(),
            name: dao_name,
            realms_governance,
            governance_token: dao.governance_token,
        });
        Ok(())
    }

    // ── Additive V2 security policy ──────────────────────────────────────────
    //
    // This companion account keeps legacy DAOs and existing proposal/payout
    // accounts readable while enabling opt-in strict paths for new objects.

    pub fn initialize_dao_security_policy(
        ctx: Context<InitializeDaoSecurityPolicy>,
        mode: EnforcementMode,
        zk_policy: FeaturePolicy,
        settlement_policy: FeaturePolicy,
        cancel_policy: CancelPolicy,
        proof_attestors: [Pubkey; MAX_POLICY_ATTESTORS],
        proof_attestor_count: u8,
        proof_threshold: u8,
        settlement_attestors: [Pubkey; MAX_POLICY_ATTESTORS],
        settlement_attestor_count: u8,
        settlement_threshold: u8,
        proof_ttl_seconds: i64,
        settlement_ttl_seconds: i64,
    ) -> Result<()> {
        validate_attestor_policy(&proof_attestors, proof_attestor_count, proof_threshold)?;
        validate_attestor_policy(
            &settlement_attestors,
            settlement_attestor_count,
            settlement_threshold,
        )?;
        require!(proof_ttl_seconds > 0, Error::InvalidSecurityPolicy);
        require!(settlement_ttl_seconds > 0, Error::InvalidSecurityPolicy);

        let policy = &mut ctx.accounts.dao_security_policy;
        if policy.dao != Pubkey::default() {
            require!(
                policy.dao == ctx.accounts.dao.key()
                    && policy.authority == ctx.accounts.authority.key()
                    && policy.mode == mode
                    && policy.zk_policy == zk_policy
                    && policy.settlement_policy == settlement_policy
                    && policy.cancel_policy == cancel_policy
                    && policy.proof_attestors == proof_attestors
                    && policy.proof_attestor_count == proof_attestor_count
                    && policy.proof_threshold == proof_threshold
                    && policy.settlement_attestors == settlement_attestors
                    && policy.settlement_attestor_count == settlement_attestor_count
                    && policy.settlement_threshold == settlement_threshold
                    && policy.proof_ttl_seconds == proof_ttl_seconds
                    && policy.settlement_ttl_seconds == settlement_ttl_seconds,
                Error::SecurityPolicyAlreadyInitialized
            );
            emit!(DaoSecurityPolicyInitialized {
                dao: policy.dao,
                authority: policy.authority,
                mode: policy.mode.clone(),
                zk_policy: policy.zk_policy.clone(),
                settlement_policy: policy.settlement_policy.clone(),
                cancel_policy: policy.cancel_policy.clone(),
                proof_threshold: policy.proof_threshold,
                settlement_threshold: policy.settlement_threshold,
                created_at: policy.created_at,
            });
            return Ok(());
        }
        policy.dao = ctx.accounts.dao.key();
        policy.authority = ctx.accounts.authority.key();
        policy.mode = mode.clone();
        policy.zk_policy = zk_policy.clone();
        policy.settlement_policy = settlement_policy.clone();
        policy.cancel_policy = cancel_policy.clone();
        policy.proof_attestors = proof_attestors;
        policy.proof_attestor_count = proof_attestor_count;
        policy.proof_threshold = proof_threshold;
        policy.settlement_attestors = settlement_attestors;
        policy.settlement_attestor_count = settlement_attestor_count;
        policy.settlement_threshold = settlement_threshold;
        policy.proof_ttl_seconds = proof_ttl_seconds;
        policy.settlement_ttl_seconds = settlement_ttl_seconds;
        policy.emergency_disabled = false;
        policy.created_at = Clock::get()?.unix_timestamp;
        policy.updated_at = policy.created_at;
        policy.bump = ctx.bumps.dao_security_policy;

        emit!(DaoSecurityPolicyInitialized {
            dao: policy.dao,
            authority: policy.authority,
            mode,
            zk_policy,
            settlement_policy,
            cancel_policy,
            proof_threshold,
            settlement_threshold,
            created_at: policy.created_at,
        });
        Ok(())
    }

    pub fn update_dao_security_policy_v2(
        ctx: Context<UpdateDaoSecurityPolicyV2>,
        mode: EnforcementMode,
        zk_policy: FeaturePolicy,
        settlement_policy: FeaturePolicy,
        cancel_policy: CancelPolicy,
        proof_attestors: [Pubkey; MAX_POLICY_ATTESTORS],
        proof_attestor_count: u8,
        proof_threshold: u8,
        settlement_attestors: [Pubkey; MAX_POLICY_ATTESTORS],
        settlement_attestor_count: u8,
        settlement_threshold: u8,
        proof_ttl_seconds: i64,
        settlement_ttl_seconds: i64,
    ) -> Result<()> {
        validate_attestor_policy(&proof_attestors, proof_attestor_count, proof_threshold)?;
        validate_attestor_policy(
            &settlement_attestors,
            settlement_attestor_count,
            settlement_threshold,
        )?;
        require!(proof_ttl_seconds > 0, Error::InvalidSecurityPolicy);
        require!(settlement_ttl_seconds > 0, Error::InvalidSecurityPolicy);

        let policy = &mut ctx.accounts.dao_security_policy;
        require!(!policy.emergency_disabled, Error::SecurityPolicyDisabled);
        require!(
            enforcement_rank(&mode) >= enforcement_rank(&policy.mode)
                && feature_rank(&zk_policy) >= feature_rank(&policy.zk_policy)
                && feature_rank(&settlement_policy) >= feature_rank(&policy.settlement_policy)
                && cancel_rank(&cancel_policy) >= cancel_rank(&policy.cancel_policy),
            Error::PolicyRollbackNotAllowed
        );

        policy.mode = mode.clone();
        policy.zk_policy = zk_policy.clone();
        policy.settlement_policy = settlement_policy.clone();
        policy.cancel_policy = cancel_policy.clone();
        policy.proof_attestors = proof_attestors;
        policy.proof_attestor_count = proof_attestor_count;
        policy.proof_threshold = proof_threshold;
        policy.settlement_attestors = settlement_attestors;
        policy.settlement_attestor_count = settlement_attestor_count;
        policy.settlement_threshold = settlement_threshold;
        policy.proof_ttl_seconds = proof_ttl_seconds;
        policy.settlement_ttl_seconds = settlement_ttl_seconds;
        policy.updated_at = Clock::get()?.unix_timestamp;

        emit!(DaoSecurityPolicyUpdatedV2 {
            dao: policy.dao,
            authority: policy.authority,
            mode,
            zk_policy,
            settlement_policy,
            cancel_policy,
            proof_threshold,
            settlement_threshold,
            updated_at: policy.updated_at,
        });
        Ok(())
    }

    pub fn initialize_dao_governance_policy_v3(
        ctx: Context<InitializeDaoGovernancePolicyV3>,
        quorum_policy: QuorumPolicyV3,
        reveal_rebate_policy: RevealRebatePolicyV3,
        reveal_rebate_lamports: u64,
    ) -> Result<()> {
        validate_governance_policy_v3(
            &quorum_policy,
            &reveal_rebate_policy,
            reveal_rebate_lamports,
        )?;

        let policy = &mut ctx.accounts.dao_governance_policy_v3;
        if policy.dao != Pubkey::default() {
            require!(
                policy.dao == ctx.accounts.dao.key()
                    && policy.authority == ctx.accounts.authority.key()
                    && policy.quorum_policy == quorum_policy
                    && policy.reveal_rebate_policy == reveal_rebate_policy
                    && policy.reveal_rebate_lamports == reveal_rebate_lamports,
                Error::GovernancePolicyAlreadyInitialized
            );
            emit!(DaoGovernancePolicyInitializedV3 {
                dao: policy.dao,
                authority: policy.authority,
                quorum_policy: policy.quorum_policy.clone(),
                reveal_rebate_policy: policy.reveal_rebate_policy.clone(),
                reveal_rebate_lamports: policy.reveal_rebate_lamports,
                created_at: policy.created_at,
            });
            return Ok(());
        }

        let now = Clock::get()?.unix_timestamp;
        policy.dao = ctx.accounts.dao.key();
        policy.authority = ctx.accounts.authority.key();
        policy.quorum_policy = quorum_policy.clone();
        policy.reveal_rebate_policy = reveal_rebate_policy.clone();
        policy.reveal_rebate_lamports = reveal_rebate_lamports;
        policy.created_at = now;
        policy.updated_at = now;
        policy.bump = ctx.bumps.dao_governance_policy_v3;

        emit!(DaoGovernancePolicyInitializedV3 {
            dao: policy.dao,
            authority: policy.authority,
            quorum_policy,
            reveal_rebate_policy,
            reveal_rebate_lamports,
            created_at: policy.created_at,
        });
        Ok(())
    }

    pub fn update_dao_governance_policy_v3(
        ctx: Context<UpdateDaoGovernancePolicyV3>,
        quorum_policy: QuorumPolicyV3,
        reveal_rebate_policy: RevealRebatePolicyV3,
        reveal_rebate_lamports: u64,
    ) -> Result<()> {
        validate_governance_policy_v3(
            &quorum_policy,
            &reveal_rebate_policy,
            reveal_rebate_lamports,
        )?;

        let policy = &mut ctx.accounts.dao_governance_policy_v3;
        policy.quorum_policy = quorum_policy.clone();
        policy.reveal_rebate_policy = reveal_rebate_policy.clone();
        policy.reveal_rebate_lamports = reveal_rebate_lamports;
        policy.updated_at = Clock::get()?.unix_timestamp;

        emit!(DaoGovernancePolicyUpdatedV3 {
            dao: policy.dao,
            authority: policy.authority,
            quorum_policy,
            reveal_rebate_policy,
            reveal_rebate_lamports,
            updated_at: policy.updated_at,
        });
        Ok(())
    }

    pub fn initialize_dao_settlement_policy_v3(
        ctx: Context<InitializeDaoSettlementPolicyV3>,
        min_evidence_age_seconds: i64,
        max_payout_amount: u64,
        require_refhe_settlement: bool,
        require_magicblock_settlement: bool,
    ) -> Result<()> {
        validate_settlement_policy_v3(
            min_evidence_age_seconds,
            max_payout_amount,
            require_refhe_settlement,
            require_magicblock_settlement,
        )?;

        let policy = &mut ctx.accounts.dao_settlement_policy_v3;
        if policy.dao != Pubkey::default() {
            require!(
                policy.dao == ctx.accounts.dao.key()
                    && policy.authority == ctx.accounts.authority.key()
                    && policy.min_evidence_age_seconds == min_evidence_age_seconds
                    && policy.max_payout_amount == max_payout_amount
                    && policy.require_refhe_settlement == require_refhe_settlement
                    && policy.require_magicblock_settlement == require_magicblock_settlement,
                Error::SettlementPolicyAlreadyInitialized
            );
            emit!(DaoSettlementPolicyInitializedV3 {
                dao: policy.dao,
                authority: policy.authority,
                min_evidence_age_seconds: policy.min_evidence_age_seconds,
                max_payout_amount: policy.max_payout_amount,
                require_refhe_settlement: policy.require_refhe_settlement,
                require_magicblock_settlement: policy.require_magicblock_settlement,
                created_at: policy.created_at,
            });
            return Ok(());
        }

        let now = Clock::get()?.unix_timestamp;
        policy.dao = ctx.accounts.dao.key();
        policy.authority = ctx.accounts.authority.key();
        policy.min_evidence_age_seconds = min_evidence_age_seconds;
        policy.max_payout_amount = max_payout_amount;
        policy.require_refhe_settlement = require_refhe_settlement;
        policy.require_magicblock_settlement = require_magicblock_settlement;
        policy.created_at = now;
        policy.updated_at = now;
        policy.bump = ctx.bumps.dao_settlement_policy_v3;

        emit!(DaoSettlementPolicyInitializedV3 {
            dao: policy.dao,
            authority: policy.authority,
            min_evidence_age_seconds,
            max_payout_amount,
            require_refhe_settlement,
            require_magicblock_settlement,
            created_at: policy.created_at,
        });
        Ok(())
    }

    pub fn update_dao_settlement_policy_v3(
        ctx: Context<UpdateDaoSettlementPolicyV3>,
        min_evidence_age_seconds: i64,
        max_payout_amount: u64,
        require_refhe_settlement: bool,
        require_magicblock_settlement: bool,
    ) -> Result<()> {
        validate_settlement_policy_v3(
            min_evidence_age_seconds,
            max_payout_amount,
            require_refhe_settlement,
            require_magicblock_settlement,
        )?;

        let policy = &mut ctx.accounts.dao_settlement_policy_v3;
        require!(
            min_evidence_age_seconds >= policy.min_evidence_age_seconds
                && max_payout_amount <= policy.max_payout_amount
                && (!policy.require_refhe_settlement || require_refhe_settlement)
                && (!policy.require_magicblock_settlement || require_magicblock_settlement),
            Error::SettlementPolicyRollbackNotAllowed
        );

        policy.min_evidence_age_seconds = min_evidence_age_seconds;
        policy.max_payout_amount = max_payout_amount;
        policy.require_refhe_settlement = require_refhe_settlement;
        policy.require_magicblock_settlement = require_magicblock_settlement;
        policy.updated_at = Clock::get()?.unix_timestamp;

        emit!(DaoSettlementPolicyUpdatedV3 {
            dao: policy.dao,
            authority: policy.authority,
            min_evidence_age_seconds,
            max_payout_amount,
            require_refhe_settlement,
            require_magicblock_settlement,
            updated_at: policy.updated_at,
        });
        Ok(())
    }

    // ── Create proposal ───────────────────────────────────────────────────────

    pub fn create_proposal(
        ctx: Context<CreateProposal>,
        title: String,
        description: String,
        voting_duration_seconds: i64,
        treasury_action: Option<TreasuryAction>,
    ) -> Result<()> {
        require!(title.len() <= 128, Error::TitleTooLong);
        require!(description.len() <= 1024, Error::DescriptionTooLong);
        require!(
            voting_duration_seconds >= MIN_VOTING_DURATION_SECONDS,
            Error::VotingDurationTooShort
        );
        if let Some(action) = &treasury_action {
            validate_treasury_action(action)?;
        }

        let now = Clock::get()?.unix_timestamp;
        let dao = &mut ctx.accounts.dao;
        let proposer_balance = ctx.accounts.proposer_token_account.amount;
        require!(proposer_balance > 0, Error::InsufficientTokens);
        if dao.governance_token_required > 0 {
            require!(
                proposer_balance >= dao.governance_token_required,
                Error::InsufficientTokens
            );
        }

        let p = &mut ctx.accounts.proposal;

        p.dao = dao.key();
        p.proposer = ctx.accounts.proposer.key();
        p.proposal_id = dao.proposal_count;
        p.title = title.clone();
        p.description = description;
        p.status = ProposalStatus::Voting;
        p.voting_end = now + voting_duration_seconds;
        p.reveal_end = now + voting_duration_seconds + dao.reveal_window_seconds;
        p.yes_capital = 0;
        p.no_capital = 0;
        p.yes_community = 0;
        p.no_community = 0;
        p.commit_count = 0;
        p.reveal_count = 0;
        p.treasury_action = treasury_action;
        p.execution_unlocks_at = 0;
        p.is_executed = false;
        p.bump = ctx.bumps.proposal;

        dao.proposal_count = dao.proposal_count.checked_add(1).ok_or(Error::Overflow)?;

        emit!(ProposalCreated {
            dao: dao.key(),
            proposal: p.key(),
            proposal_id: p.proposal_id,
            title,
            voting_end: p.voting_end,
            reveal_end: p.reveal_end,
        });
        Ok(())
    }

    pub fn configure_confidential_payout_plan(
        ctx: Context<ConfigureConfidentialPayoutPlan>,
        payout_type: ConfidentialPayoutType,
        asset_type: ConfidentialAssetType,
        settlement_recipient: Pubkey,
        token_mint: Option<Pubkey>,
        recipient_count: u16,
        total_amount: u64,
        encrypted_manifest_uri: String,
        manifest_hash: [u8; 32],
        ciphertext_hash: [u8; 32],
    ) -> Result<()> {
        let operator = ctx.accounts.operator.key();
        require!(
            operator == ctx.accounts.dao.authority || operator == ctx.accounts.proposal.proposer,
            Error::UnauthorizedConfidentialPayoutOperator
        );
        require!(
            ctx.accounts.proposal.status == ProposalStatus::Voting
                && ctx.accounts.proposal.commit_count == 0
                && ctx.accounts.proposal.reveal_count == 0,
            Error::ConfidentialPayoutPlanLocked
        );
        require!(
            ctx.accounts.proposal.treasury_action.is_none(),
            Error::ConfidentialPayoutConflictsWithTreasuryAction
        );

        validate_confidential_payout_plan(
            &asset_type,
            settlement_recipient,
            &token_mint,
            recipient_count,
            total_amount,
            &encrypted_manifest_uri,
            &manifest_hash,
            &ciphertext_hash,
        )?;

        let plan = &mut ctx.accounts.confidential_payout_plan;
        if plan.proposal != Pubkey::default() {
            require!(
                plan.dao == ctx.accounts.dao.key() && plan.proposal == ctx.accounts.proposal.key(),
                Error::ConfidentialPayoutPlanMismatch
            );
            require!(
                plan.status != ConfidentialPayoutStatus::Funded,
                Error::ConfidentialPayoutAlreadyFunded
            );
        }

        plan.dao = ctx.accounts.dao.key();
        plan.proposal = ctx.accounts.proposal.key();
        plan.configured_by = operator;
        plan.payout_type = payout_type.clone();
        plan.asset_type = asset_type.clone();
        plan.settlement_recipient = settlement_recipient;
        plan.token_mint = token_mint;
        plan.recipient_count = recipient_count;
        plan.total_amount = total_amount;
        plan.encrypted_manifest_uri = encrypted_manifest_uri.clone();
        plan.manifest_hash = manifest_hash;
        plan.ciphertext_hash = ciphertext_hash;
        plan.status = ConfidentialPayoutStatus::Configured;
        plan.configured_at = Clock::get()?.unix_timestamp;
        plan.funded_at = 0;
        plan.bump = ctx.bumps.confidential_payout_plan;

        emit!(ConfidentialPayoutConfigured {
            dao: plan.dao,
            proposal: plan.proposal,
            configured_by: plan.configured_by,
            payout_type,
            asset_type,
            settlement_recipient: plan.settlement_recipient,
            token_mint: plan.token_mint,
            recipient_count: plan.recipient_count,
            total_amount: plan.total_amount,
            encrypted_manifest_uri,
            manifest_hash: plan.manifest_hash,
            ciphertext_hash: plan.ciphertext_hash,
        });
        Ok(())
    }

    pub fn configure_refhe_envelope(
        ctx: Context<ConfigureRefheEnvelope>,
        model_uri: String,
        policy_hash: [u8; 32],
        input_ciphertext_hash: [u8; 32],
        evaluation_key_hash: [u8; 32],
    ) -> Result<()> {
        let operator = ctx.accounts.operator.key();
        require!(
            operator == ctx.accounts.dao.authority || operator == ctx.accounts.proposal.proposer,
            Error::UnauthorizedRefheOperator
        );
        require!(
            ctx.accounts.proposal.status == ProposalStatus::Voting
                && ctx.accounts.proposal.commit_count == 0
                && ctx.accounts.proposal.reveal_count == 0,
            Error::RefheEnvelopeLocked
        );

        let payout_plan = &ctx.accounts.confidential_payout_plan;
        require!(
            payout_plan.dao == ctx.accounts.dao.key()
                && payout_plan.proposal == ctx.accounts.proposal.key(),
            Error::RefheEnvelopeMismatch
        );
        require!(
            payout_plan.status == ConfidentialPayoutStatus::Configured,
            Error::RefheEnvelopeLocked
        );
        require!(
            input_ciphertext_hash == payout_plan.ciphertext_hash,
            Error::RefheEnvelopeMismatch
        );
        validate_refhe_envelope(
            &model_uri,
            &policy_hash,
            &input_ciphertext_hash,
            &evaluation_key_hash,
        )?;

        let envelope = &mut ctx.accounts.refhe_envelope;
        if envelope.proposal != Pubkey::default() {
            require!(
                envelope.dao == ctx.accounts.dao.key()
                    && envelope.proposal == ctx.accounts.proposal.key()
                    && envelope.payout_plan == ctx.accounts.confidential_payout_plan.key(),
                Error::RefheEnvelopeMismatch
            );
            require!(
                envelope.status != RefheEnvelopeStatus::Settled,
                Error::RefheEnvelopeLocked
            );
        }

        envelope.dao = ctx.accounts.dao.key();
        envelope.proposal = ctx.accounts.proposal.key();
        envelope.payout_plan = ctx.accounts.confidential_payout_plan.key();
        envelope.configured_by = operator;
        envelope.settled_by = None;
        envelope.model_uri = model_uri.clone();
        envelope.policy_hash = policy_hash;
        envelope.input_ciphertext_hash = input_ciphertext_hash;
        envelope.evaluation_key_hash = evaluation_key_hash;
        envelope.result_ciphertext_hash = [0u8; 32];
        envelope.result_commitment_hash = [0u8; 32];
        envelope.proof_bundle_hash = [0u8; 32];
        envelope.verifier_program = None;
        envelope.status = RefheEnvelopeStatus::Configured;
        envelope.configured_at = Clock::get()?.unix_timestamp;
        envelope.settled_at = 0;
        envelope.bump = ctx.bumps.refhe_envelope;

        emit!(RefheEnvelopeConfigured {
            dao: envelope.dao,
            proposal: envelope.proposal,
            payout_plan: envelope.payout_plan,
            configured_by: envelope.configured_by,
            model_uri,
            policy_hash: envelope.policy_hash,
            input_ciphertext_hash: envelope.input_ciphertext_hash,
            evaluation_key_hash: envelope.evaluation_key_hash,
        });
        Ok(())
    }

    pub fn settle_refhe_envelope(
        ctx: Context<SettleRefheEnvelope>,
        result_ciphertext_hash: [u8; 32],
        result_commitment_hash: [u8; 32],
        proof_bundle_hash: [u8; 32],
        verifier_program: Pubkey,
    ) -> Result<()> {
        let operator = ctx.accounts.operator.key();
        require!(
            operator == ctx.accounts.dao.authority || operator == ctx.accounts.proposal.proposer,
            Error::UnauthorizedRefheOperator
        );
        require!(
            verifier_program != Pubkey::default(),
            Error::RefheVerifierProgramRequired
        );
        require!(
            !is_zero_hash(&result_ciphertext_hash)
                && !is_zero_hash(&result_commitment_hash)
                && !is_zero_hash(&proof_bundle_hash),
            Error::InvalidRefheEnvelope
        );

        let payout_plan = &ctx.accounts.confidential_payout_plan;
        let envelope = &mut ctx.accounts.refhe_envelope;
        require!(
            envelope.dao == ctx.accounts.dao.key()
                && envelope.proposal == ctx.accounts.proposal.key()
                && envelope.payout_plan == payout_plan.key(),
            Error::RefheEnvelopeMismatch
        );
        require!(
            payout_plan.dao == ctx.accounts.dao.key()
                && payout_plan.proposal == ctx.accounts.proposal.key(),
            Error::RefheEnvelopeMismatch
        );
        require!(
            payout_plan.status == ConfidentialPayoutStatus::Configured,
            Error::RefheEnvelopeLocked
        );
        require!(
            envelope.status == RefheEnvelopeStatus::Configured,
            Error::RefheEnvelopeLocked
        );

        envelope.result_ciphertext_hash = result_ciphertext_hash;
        envelope.result_commitment_hash = result_commitment_hash;
        envelope.proof_bundle_hash = proof_bundle_hash;
        envelope.verifier_program = Some(verifier_program);
        envelope.status = RefheEnvelopeStatus::Settled;
        envelope.settled_by = Some(operator);
        envelope.settled_at = Clock::get()?.unix_timestamp;

        emit!(RefheEnvelopeSettled {
            dao: envelope.dao,
            proposal: envelope.proposal,
            payout_plan: envelope.payout_plan,
            settled_by: operator,
            verifier_program,
            result_ciphertext_hash: envelope.result_ciphertext_hash,
            result_commitment_hash: envelope.result_commitment_hash,
            proof_bundle_hash: envelope.proof_bundle_hash,
            settled_at: envelope.settled_at,
        });
        Ok(())
    }

    pub fn configure_magicblock_private_payment_corridor(
        ctx: Context<ConfigureMagicBlockPrivatePaymentCorridor>,
        api_base_url: String,
        cluster: String,
        owner_wallet: Pubkey,
        validator: Option<Pubkey>,
        route_hash: [u8; 32],
        deposit_amount: u64,
        private_transfer_amount: u64,
        withdrawal_amount: u64,
    ) -> Result<()> {
        let operator = ctx.accounts.operator.key();
        require!(
            operator == ctx.accounts.dao.authority || operator == ctx.accounts.proposal.proposer,
            Error::UnauthorizedMagicBlockOperator
        );
        require!(
            ctx.accounts.proposal.status == ProposalStatus::Voting
                && ctx.accounts.proposal.commit_count == 0
                && ctx.accounts.proposal.reveal_count == 0,
            Error::MagicBlockCorridorLocked
        );

        let payout_plan = &ctx.accounts.confidential_payout_plan;
        require!(
            payout_plan.dao == ctx.accounts.dao.key()
                && payout_plan.proposal == ctx.accounts.proposal.key(),
            Error::MagicBlockCorridorMismatch
        );
        require!(
            payout_plan.status == ConfidentialPayoutStatus::Configured,
            Error::MagicBlockCorridorLocked
        );
        require!(
            payout_plan.asset_type == ConfidentialAssetType::Token,
            Error::MagicBlockTokenMintRequired
        );

        validate_magicblock_corridor(
            &api_base_url,
            &cluster,
            owner_wallet,
            payout_plan.settlement_recipient,
            payout_plan.token_mint,
            &route_hash,
            deposit_amount,
            private_transfer_amount,
            withdrawal_amount,
        )?;

        let corridor = &mut ctx.accounts.magicblock_private_payment_corridor;
        if corridor.proposal != Pubkey::default() {
            require!(
                corridor.dao == ctx.accounts.dao.key()
                    && corridor.proposal == ctx.accounts.proposal.key()
                    && corridor.payout_plan == payout_plan.key(),
                Error::MagicBlockCorridorMismatch
            );
            require!(
                corridor.status != MagicBlockSettlementStatus::Settled,
                Error::MagicBlockCorridorLocked
            );
        }

        corridor.dao = ctx.accounts.dao.key();
        corridor.proposal = ctx.accounts.proposal.key();
        corridor.payout_plan = payout_plan.key();
        corridor.configured_by = operator;
        corridor.settled_by = None;
        corridor.api_base_url = api_base_url.clone();
        corridor.cluster = cluster.clone();
        corridor.owner_wallet = owner_wallet;
        corridor.settlement_wallet = payout_plan.settlement_recipient;
        corridor.token_mint = payout_plan
            .token_mint
            .ok_or(Error::MagicBlockTokenMintRequired)?;
        corridor.validator = validator;
        corridor.transfer_queue = None;
        corridor.route_hash = route_hash;
        corridor.deposit_amount = deposit_amount;
        corridor.private_transfer_amount = private_transfer_amount;
        corridor.withdrawal_amount = withdrawal_amount;
        corridor.deposit_tx_signature = String::new();
        corridor.transfer_tx_signature = String::new();
        corridor.withdraw_tx_signature = String::new();
        corridor.status = MagicBlockSettlementStatus::Configured;
        corridor.configured_at = Clock::get()?.unix_timestamp;
        corridor.settled_at = 0;
        corridor.bump = ctx.bumps.magicblock_private_payment_corridor;

        emit!(MagicBlockPrivatePaymentCorridorConfigured {
            dao: corridor.dao,
            proposal: corridor.proposal,
            payout_plan: corridor.payout_plan,
            configured_by: corridor.configured_by,
            api_base_url,
            cluster,
            owner_wallet: corridor.owner_wallet,
            settlement_wallet: corridor.settlement_wallet,
            token_mint: corridor.token_mint,
            validator: corridor.validator,
            route_hash: corridor.route_hash,
            deposit_amount: corridor.deposit_amount,
            private_transfer_amount: corridor.private_transfer_amount,
            withdrawal_amount: corridor.withdrawal_amount,
        });
        Ok(())
    }

    pub fn settle_magicblock_private_payment_corridor(
        ctx: Context<SettleMagicBlockPrivatePaymentCorridor>,
        validator: Pubkey,
        transfer_queue: Pubkey,
        deposit_tx_signature: String,
        transfer_tx_signature: String,
        withdraw_tx_signature: String,
    ) -> Result<()> {
        let operator = ctx.accounts.operator.key();
        require!(
            operator == ctx.accounts.dao.authority || operator == ctx.accounts.proposal.proposer,
            Error::UnauthorizedMagicBlockOperator
        );
        require!(
            validator != Pubkey::default() && transfer_queue != Pubkey::default(),
            Error::InvalidMagicBlockCorridor
        );

        validate_magicblock_tx_signature(&deposit_tx_signature, true)?;
        validate_magicblock_tx_signature(&transfer_tx_signature, false)?;
        validate_magicblock_tx_signature(&withdraw_tx_signature, true)?;

        let payout_plan = &ctx.accounts.confidential_payout_plan;
        let corridor = &mut ctx.accounts.magicblock_private_payment_corridor;
        require!(
            corridor.dao == ctx.accounts.dao.key()
                && corridor.proposal == ctx.accounts.proposal.key()
                && corridor.payout_plan == payout_plan.key(),
            Error::MagicBlockCorridorMismatch
        );
        require!(
            payout_plan.dao == ctx.accounts.dao.key()
                && payout_plan.proposal == ctx.accounts.proposal.key(),
            Error::MagicBlockCorridorMismatch
        );
        require!(
            payout_plan.status == ConfidentialPayoutStatus::Configured,
            Error::MagicBlockCorridorLocked
        );
        require!(
            corridor.status == MagicBlockSettlementStatus::Configured,
            Error::MagicBlockCorridorLocked
        );

        corridor.validator = Some(validator);
        corridor.transfer_queue = Some(transfer_queue);
        corridor.deposit_tx_signature = deposit_tx_signature.clone();
        corridor.transfer_tx_signature = transfer_tx_signature.clone();
        corridor.withdraw_tx_signature = withdraw_tx_signature.clone();
        corridor.status = MagicBlockSettlementStatus::Settled;
        corridor.settled_by = Some(operator);
        corridor.settled_at = Clock::get()?.unix_timestamp;

        emit!(MagicBlockPrivatePaymentCorridorSettled {
            dao: corridor.dao,
            proposal: corridor.proposal,
            payout_plan: corridor.payout_plan,
            settled_by: operator,
            validator,
            transfer_queue,
            deposit_tx_signature,
            transfer_tx_signature,
            withdraw_tx_signature,
            settled_at: corridor.settled_at,
        });
        Ok(())
    }

    // ── Cancel proposal ───────────────────────────────────────────────────────
    //
    // Authority-only legacy cancellation. The ABI is preserved, but the safety
    // invariant is now shared with V2: ordinary cancellation is only valid before
    // meaningful participation starts.

    pub fn cancel_proposal(ctx: Context<CancelProposal>) -> Result<()> {
        let now = Clock::get()?.unix_timestamp;
        let p = &mut ctx.accounts.proposal;
        require!(
            p.status == ProposalStatus::Voting
                && now < p.voting_end
                && p.commit_count == 0
                && p.reveal_count == 0,
            Error::ProposalNotCancellable
        );

        p.status = ProposalStatus::Cancelled;

        emit!(ProposalCancelled {
            proposal: p.key(),
            cancelled_by: ctx.accounts.authority.key(),
        });
        Ok(())
    }

    pub fn cancel_proposal_v2(ctx: Context<CancelProposalV2>) -> Result<()> {
        let now = Clock::get()?.unix_timestamp;
        let policy = &ctx.accounts.dao_security_policy;
        require!(!policy.emergency_disabled, Error::SecurityPolicyDisabled);
        require!(
            policy.mode != EnforcementMode::LegacyAllowed
                && policy.cancel_policy == CancelPolicy::NoCancelAfterParticipation,
            Error::StrictPolicyRequired
        );

        let p = &mut ctx.accounts.proposal;
        require!(
            p.status == ProposalStatus::Voting
                && now < p.voting_end
                && p.commit_count == 0
                && p.reveal_count == 0,
            Error::ProposalNotCancellable
        );

        p.status = ProposalStatus::Cancelled;

        emit!(ProposalCancelledV2 {
            proposal: p.key(),
            cancelled_by: ctx.accounts.authority.key(),
            policy_mode: policy.mode.clone(),
            cancel_policy: policy.cancel_policy.clone(),
        });
        Ok(())
    }

    // ── Veto proposal ─────────────────────────────────────────────────────────
    //
    // Authority can veto a Passed proposal during the timelock window,
    // before execute_proposal is called.
    //
    // This is the standard security mechanism in serious governance systems
    // (Compound, Aave, Maker). If a malicious proposal slips through, the
    // authority has one last line of defense before funds move.
    //
    // After the timelock expires OR after is_executed=true, veto is impossible.
    // This prevents the authority from becoming a permanent blocker.

    pub fn veto_proposal(ctx: Context<VetoProposal>) -> Result<()> {
        let now = Clock::get()?.unix_timestamp;
        let p = &mut ctx.accounts.proposal;

        require!(p.status == ProposalStatus::Passed, Error::ProposalNotPassed);
        require!(!p.is_executed, Error::AlreadyExecuted);
        // Veto is only valid while still in the timelock window
        require!(now < p.execution_unlocks_at, Error::VetoWindowExpired);

        p.status = ProposalStatus::Vetoed;

        emit!(ProposalVetoed {
            proposal: p.key(),
            vetoed_by: ctx.accounts.authority.key(),
        });
        Ok(())
    }

    // ── Phase 1 — Commit ──────────────────────────────────────────────────────
    //
    // commitment = sha256(vote_byte ‖ salt_32 ‖ proposal_pubkey_32 ‖ voter_pubkey_32)
    //
    // Both chamber weights are snapshotted at commit time to prevent:
    //   "buy tokens → vote → dump tokens immediately"
    //
    // voter_reveal_authority: optional keeper pubkey.
    //   - Cannot change the vote (hash is committed).
    //   - Can submit the reveal if voter is unavailable.
    //   - Earns the SOL rebate for the service.

    pub fn commit_vote(
        ctx: Context<CommitVote>,
        commitment: [u8; 32],
        voter_reveal_authority: Option<Pubkey>,
    ) -> Result<()> {
        let now = Clock::get()?.unix_timestamp;
        let p = &mut ctx.accounts.proposal;
        let dao = &ctx.accounts.dao;

        require!(p.status == ProposalStatus::Voting, Error::VotingNotOpen);
        require!(now < p.voting_end, Error::VotingClosed);

        let raw = ctx.accounts.voter_token_account.amount;
        require!(raw > 0, Error::InsufficientTokens);

        if dao.governance_token_required > 0 {
            require!(
                raw >= dao.governance_token_required,
                Error::InsufficientTokens
            );
        }
        require!(
            !account_exists(&ctx.accounts.delegation_marker.to_account_info()),
            Error::DelegationOverlap
        );

        let vr = &mut ctx.accounts.voter_record;
        require!(!vr.has_committed, Error::AlreadyCommitted);

        vr.capital_weight = raw;
        vr.community_weight = isqrt(raw);
        vr.voter = ctx.accounts.voter.key();
        vr.proposal = p.key();
        vr.commitment = commitment;
        vr.has_committed = true;
        vr.has_revealed = false;
        vr.voted_yes = false;
        vr.bump = ctx.bumps.voter_record;
        vr.voter_reveal_authority = voter_reveal_authority;

        p.commit_count = p.commit_count.checked_add(1).ok_or(Error::Overflow)?;

        emit!(VoteCommitted {
            proposal: p.key(),
            voter: ctx.accounts.voter.key(),
            commit_count: p.commit_count,
        });
        Ok(())
    }

    // ── Vote delegation ───────────────────────────────────────────────────────
    //
    // Delegator grants their token weight to a delegatee for exactly this proposal.
    // The delegatee commits+reveals combining both balances.
    //
    // Privacy is fully preserved:
    //   - Delegatee chooses the vote and salt independently
    //   - Tally stays 0/0 throughout commit phase
    //   - No other Solana governance tool supports private delegation

    pub fn delegate_vote(ctx: Context<DelegateVote>, delegatee: Pubkey) -> Result<()> {
        let now = Clock::get()?.unix_timestamp;
        let p = &ctx.accounts.proposal;
        let dao = &ctx.accounts.dao;

        require!(p.status == ProposalStatus::Voting, Error::VotingNotOpen);
        require!(now < p.voting_end, Error::VotingClosed);
        require!(delegatee != Pubkey::default(), Error::InvalidDelegatee);
        require!(
            delegatee != ctx.accounts.delegator.key(),
            Error::SelfDelegationNotAllowed
        );

        let raw = ctx.accounts.delegator_token_account.amount;
        require!(raw > 0, Error::InsufficientTokens);
        if dao.governance_token_required > 0 {
            require!(
                raw >= dao.governance_token_required,
                Error::InsufficientTokens
            );
        }
        require!(
            !account_exists(&ctx.accounts.direct_vote_marker.to_account_info()),
            Error::DirectVoteAlreadyCommitted
        );

        let del = &mut ctx.accounts.delegation;
        del.delegator = ctx.accounts.delegator.key();
        del.delegatee = delegatee;
        del.proposal = p.key();
        del.delegated_capital = raw;
        del.delegated_community = isqrt(raw);
        del.is_used = false;
        del.bump = ctx.bumps.delegation;

        emit!(VoteDelegated {
            proposal: p.key(),
            delegator: ctx.accounts.delegator.key(),
            delegatee,
            delegated_weight: raw,
        });
        Ok(())
    }

    // ── Commit with delegation ────────────────────────────────────────────────
    //
    // Delegatee commits their own weight PLUS the delegated weight.
    // The commitment preimage uses the delegatee's pubkey, so reveal is identical
    // to a normal reveal — no special handling needed.

    pub fn commit_delegated_vote(
        ctx: Context<CommitDelegatedVote>,
        commitment: [u8; 32],
        voter_reveal_authority: Option<Pubkey>,
    ) -> Result<()> {
        let now = Clock::get()?.unix_timestamp;
        let p = &mut ctx.accounts.proposal;
        let del = &mut ctx.accounts.delegation;
        let dao = &ctx.accounts.dao;

        require!(p.status == ProposalStatus::Voting, Error::VotingNotOpen);
        require!(now < p.voting_end, Error::VotingClosed);
        require!(!del.is_used, Error::DelegationAlreadyUsed);
        require!(
            !account_exists(&ctx.accounts.delegator_vote_marker.to_account_info()),
            Error::DirectVoteAlreadyCommitted
        );

        let delegatee_raw = ctx.accounts.delegatee_token_account.amount;

        let combined_capital = delegatee_raw
            .checked_add(del.delegated_capital)
            .ok_or(Error::Overflow)?;
        let combined_community = isqrt(delegatee_raw)
            .checked_add(del.delegated_community)
            .ok_or(Error::Overflow)?;
        if dao.governance_token_required > 0 {
            require!(
                combined_capital >= dao.governance_token_required,
                Error::InsufficientTokens
            );
        }

        let vr = &mut ctx.accounts.voter_record;
        require!(!vr.has_committed, Error::AlreadyCommitted);

        vr.capital_weight = combined_capital;
        vr.community_weight = combined_community;
        vr.voter = ctx.accounts.delegatee.key();
        vr.proposal = p.key();
        vr.commitment = commitment;
        vr.has_committed = true;
        vr.has_revealed = false;
        vr.voted_yes = false;
        vr.bump = ctx.bumps.voter_record;
        vr.voter_reveal_authority = voter_reveal_authority;

        del.is_used = true;

        p.commit_count = p.commit_count.checked_add(1).ok_or(Error::Overflow)?;

        emit!(VoteCommitted {
            proposal: p.key(),
            voter: ctx.accounts.delegatee.key(),
            commit_count: p.commit_count,
        });
        Ok(())
    }

    // ── Phase 2 — Reveal ──────────────────────────────────────────────────────
    //
    // Voter or authorized keeper submits (vote, salt).
    // Program recomputes sha256(vote_byte ‖ salt ‖ proposal_pubkey ‖ voter_pubkey)
    // and verifies.
    // Replay stays proposal-scoped through the VoteRecord PDA and lifecycle
    // flags. On match, both chamber tallies update. The rebate comes from the
    // proposal account only when it remains rent-safe.

    pub fn reveal_vote(ctx: Context<RevealVote>, vote: bool, salt: [u8; 32]) -> Result<()> {
        let now = Clock::get()?.unix_timestamp;
        let p = &mut ctx.accounts.proposal;
        let vr = &mut ctx.accounts.voter_record;

        require!(p.status == ProposalStatus::Voting, Error::VotingNotOpen);
        require!(now >= p.voting_end, Error::RevealTooEarly);
        require!(now < p.reveal_end, Error::RevealClosed);
        require!(vr.has_committed, Error::NotCommitted);
        require!(!vr.has_revealed, Error::AlreadyRevealed);

        let caller = ctx.accounts.revealer.key();
        let is_voter = caller == vr.voter;
        let is_keeper = vr.voter_reveal_authority == Some(caller);
        require!(is_voter || is_keeper, Error::NotAuthorizedToReveal);

        let computed = compute_vote_commitment(&p.key(), &vr.voter, vote, &salt);
        require!(computed == vr.commitment, Error::CommitmentMismatch);

        let cap = vr.capital_weight;
        let com = vr.community_weight;

        if vote {
            p.yes_capital = p.yes_capital.checked_add(cap).ok_or(Error::Overflow)?;
            p.yes_community = p.yes_community.checked_add(com).ok_or(Error::Overflow)?;
        } else {
            p.no_capital = p.no_capital.checked_add(cap).ok_or(Error::Overflow)?;
            p.no_community = p.no_community.checked_add(com).ok_or(Error::Overflow)?;
        }

        vr.has_revealed = true;
        vr.voted_yes = vote;
        vr.voter_reveal_authority = None;
        p.reveal_count = p.reveal_count.checked_add(1).ok_or(Error::Overflow)?;

        // Rebate: only transfer when proposal account remains rent-exempt.
        let proposal_info = p.to_account_info();
        let lamports = proposal_info.lamports();
        let rent_minimum = Rent::get()?.minimum_balance(proposal_info.data_len());
        let rebate_floor = rent_minimum
            .checked_add(REVEAL_REBATE_LAMPORTS)
            .ok_or(Error::Overflow)?;

        if lamports > rebate_floor {
            **proposal_info.try_borrow_mut_lamports()? -= REVEAL_REBATE_LAMPORTS;
            **ctx.accounts.revealer.try_borrow_mut_lamports()? += REVEAL_REBATE_LAMPORTS;
        }

        emit!(VoteRevealed {
            proposal: p.key(),
            voter: vr.voter,
            reveal_count: p.reveal_count,
        });
        Ok(())
    }

    pub fn reveal_vote_v3(ctx: Context<RevealVoteV3>, vote: bool, salt: [u8; 32]) -> Result<()> {
        let now = Clock::get()?.unix_timestamp;
        let p = &mut ctx.accounts.proposal;
        let vr = &mut ctx.accounts.voter_record;
        let snapshot = &ctx.accounts.proposal_governance_policy_snapshot_v3;

        require!(
            snapshot.dao == p.dao && snapshot.proposal == p.key(),
            Error::GovernancePolicySnapshotMismatch
        );
        require!(p.status == ProposalStatus::Voting, Error::VotingNotOpen);
        require!(now >= p.voting_end, Error::RevealTooEarly);
        require!(now < p.reveal_end, Error::RevealClosed);
        require!(vr.has_committed, Error::NotCommitted);
        require!(!vr.has_revealed, Error::AlreadyRevealed);

        let caller = ctx.accounts.revealer.key();
        let is_voter = caller == vr.voter;
        let is_keeper = vr.voter_reveal_authority == Some(caller);
        require!(is_voter || is_keeper, Error::NotAuthorizedToReveal);

        let computed = compute_vote_commitment(&p.key(), &vr.voter, vote, &salt);
        require!(computed == vr.commitment, Error::CommitmentMismatch);

        let cap = vr.capital_weight;
        let com = vr.community_weight;

        if vote {
            p.yes_capital = p.yes_capital.checked_add(cap).ok_or(Error::Overflow)?;
            p.yes_community = p.yes_community.checked_add(com).ok_or(Error::Overflow)?;
        } else {
            p.no_capital = p.no_capital.checked_add(cap).ok_or(Error::Overflow)?;
            p.no_community = p.no_community.checked_add(com).ok_or(Error::Overflow)?;
        }

        vr.has_revealed = true;
        vr.voted_yes = vote;
        vr.voter_reveal_authority = None;
        p.reveal_count = p.reveal_count.checked_add(1).ok_or(Error::Overflow)?;

        let mut rebate_issued = 0u64;
        if snapshot.reveal_rebate_policy == RevealRebatePolicyV3::DedicatedVaultRequired
            && snapshot.reveal_rebate_lamports > 0
        {
            let expected_vault = reveal_rebate_vault_address(&p.dao);
            require!(
                ctx.accounts.reveal_rebate_vault.key() == expected_vault,
                Error::RevealRebateVaultMismatch
            );
            require!(
                ctx.accounts.reveal_rebate_vault.dao == p.dao,
                Error::RevealRebateVaultMismatch
            );

            let vault_info = ctx.accounts.reveal_rebate_vault.to_account_info();
            let vault_lamports = vault_info.lamports();
            let vault_rent = Rent::get()?.minimum_balance(vault_info.data_len());
            let rebate_floor = vault_rent
                .checked_add(snapshot.reveal_rebate_lamports)
                .ok_or(Error::Overflow)?;
            if vault_lamports > rebate_floor {
                **vault_info.try_borrow_mut_lamports()? -= snapshot.reveal_rebate_lamports;
                **ctx.accounts.revealer.try_borrow_mut_lamports()? +=
                    snapshot.reveal_rebate_lamports;
                rebate_issued = snapshot.reveal_rebate_lamports;
            }
        }

        emit!(VoteRevealedV3 {
            proposal: p.key(),
            voter: vr.voter,
            reveal_count: p.reveal_count,
            rebate_issued,
            reveal_rebate_policy: snapshot.reveal_rebate_policy.clone(),
        });
        Ok(())
    }

    // ── Phase 3a — Finalize ───────────────────────────────────────────────────
    //
    // Permissionless. Anyone calls after reveal_end.
    //
    // Evaluates pass/fail based on VotingConfig:
    //   TokenWeighted → yes_capital  > no_capital,   quorum met
    //   Quadratic     → yes_community > no_community, quorum met
    //   DualChamber   → BOTH chambers must independently clear their threshold
    //
    // If passed: sets execution_unlocks_at = now + dao.execution_delay_seconds
    // Funds do NOT move here. Call execute_proposal after the timelock.
    // During the timelock, authority can call veto_proposal to block execution.

    pub fn finalize_proposal(ctx: Context<FinalizeProposal>) -> Result<()> {
        let now = Clock::get()?.unix_timestamp;
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

    pub fn finalize_proposal_v3(ctx: Context<FinalizeProposalV3>) -> Result<()> {
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
            ctx.accounts.proposal_governance_policy_snapshot_v3.dao == ctx.accounts.dao.key()
                && ctx.accounts.proposal_governance_policy_snapshot_v3.proposal
                    == ctx.accounts.proposal.key(),
            Error::GovernancePolicySnapshotMismatch
        );
        finalize_proposal_state_v3(
            &ctx.accounts.dao,
            &mut ctx.accounts.proposal,
            &ctx.accounts.proposal_governance_policy_snapshot_v3,
            now,
        )
    }

    // ── Phase 3b — Execute ────────────────────────────────────────────────────
    //
    // Permissionless. Anyone calls after execution_unlocks_at.
    // Fires the treasury CPI attached to the proposal.
    //
    // Two-step design (finalize → execute) mirrors Compound Governor Bravo:
    //   finalize = compute result (instant, no funds move)
    //   execute  = move funds     (only after timelock + no veto)

    pub fn execute_proposal(ctx: Context<ExecuteProposal>) -> Result<()> {
        let now = Clock::get()?.unix_timestamp;
        let p = &mut ctx.accounts.proposal;

        require!(p.status == ProposalStatus::Passed, Error::ProposalNotPassed);
        require!(!p.is_executed, Error::AlreadyExecuted);
        require!(
            now >= p.execution_unlocks_at,
            Error::ExecutionTimelockActive
        );
        require!(
            !account_exists(&ctx.accounts.confidential_payout_plan),
            Error::UseConfidentialPayoutExecution
        );

        if let Some(ref action) = p.treasury_action.clone() {
            validate_treasury_action(action)?;
            let dao_key = ctx.accounts.dao.key();
            let t_bump = ctx.bumps.treasury;
            let seeds: &[&[u8]] = &[b"treasury", dao_key.as_ref(), &[t_bump]];
            let signer = &[seeds];

            match action.action_type {
                TreasuryActionType::SendSol => {
                    require!(
                        ctx.accounts.treasury_recipient.key() == action.recipient,
                        Error::TreasuryRecipientMismatch
                    );
                    transfer(
                        CpiContext::new_with_signer(
                            ctx.accounts.system_program.to_account_info(),
                            Transfer {
                                from: ctx.accounts.treasury.to_account_info(),
                                to: ctx.accounts.treasury_recipient.to_account_info(),
                            },
                            signer,
                        ),
                        action.amount_lamports,
                    )?;
                    emit!(TreasuryExecuted {
                        proposal: p.key(),
                        amount: action.amount_lamports,
                        recipient: ctx.accounts.treasury_recipient.key(),
                    });
                }
                TreasuryActionType::SendToken => {
                    validate_supported_token_program(&ctx.accounts.token_program.key())?;
                    require!(
                        ctx.accounts.treasury_recipient.key() == action.recipient,
                        Error::TreasuryRecipientMismatch
                    );
                    let action_mint = action.token_mint.ok_or(Error::TokenMintRequired)?;
                    require!(
                        *ctx.accounts.treasury_token_account.owner
                            == ctx.accounts.token_program.key(),
                        Error::InvalidTokenProgram
                    );
                    require!(
                        *ctx.accounts.recipient_token_account.owner
                            == ctx.accounts.token_program.key(),
                        Error::InvalidTokenProgram
                    );
                    let treasury_token_account = parse_token_account(
                        &ctx.accounts.treasury_token_account,
                        &ctx.accounts.token_program.key(),
                    )?;
                    let recipient_token_account = parse_token_account(
                        &ctx.accounts.recipient_token_account,
                        &ctx.accounts.token_program.key(),
                    )?;

                    require!(
                        treasury_token_account.owner == ctx.accounts.treasury.key(),
                        Error::InvalidTreasuryTokenAuthority
                    );
                    require!(
                        treasury_token_account.mint == action_mint,
                        Error::InvalidTokenMint
                    );
                    require!(
                        recipient_token_account.mint == action_mint,
                        Error::InvalidTokenMint
                    );
                    require!(
                        ctx.accounts.treasury_token_account.key()
                            != ctx.accounts.recipient_token_account.key(),
                        Error::DuplicateTokenAccounts
                    );
                    require!(
                        recipient_token_account.owner == action.recipient,
                        Error::RecipientOwnerMismatch
                    );

                    #[allow(deprecated)]
                    token_interface::transfer(
                        CpiContext::new_with_signer(
                            ctx.accounts.token_program.to_account_info(),
                            TokenTransfer {
                                from: ctx.accounts.treasury_token_account.to_account_info(),
                                to: ctx.accounts.recipient_token_account.to_account_info(),
                                authority: ctx.accounts.treasury.to_account_info(),
                            },
                            signer,
                        ),
                        action.amount_lamports,
                    )?;
                    emit!(TreasuryExecuted {
                        proposal: p.key(),
                        amount: action.amount_lamports,
                        recipient: ctx.accounts.recipient_token_account.key(),
                    });
                }
                TreasuryActionType::CustomCPI => {
                    return err!(Error::UnsupportedTreasuryAction);
                }
            }
        }
        p.is_executed = true;
        Ok(())
    }

    pub fn execute_confidential_payout_plan(
        ctx: Context<ExecuteConfidentialPayoutPlan>,
    ) -> Result<()> {
        let now = Clock::get()?.unix_timestamp;
        let p = &mut ctx.accounts.proposal;

        require!(p.status == ProposalStatus::Passed, Error::ProposalNotPassed);
        require!(!p.is_executed, Error::AlreadyExecuted);
        require!(
            now >= p.execution_unlocks_at,
            Error::ExecutionTimelockActive
        );
        require!(
            p.treasury_action.is_none(),
            Error::ConfidentialPayoutConflictsWithTreasuryAction
        );

        let plan = &mut ctx.accounts.confidential_payout_plan;
        require!(
            plan.dao == ctx.accounts.dao.key() && plan.proposal == p.key(),
            Error::ConfidentialPayoutPlanMismatch
        );
        require!(
            plan.status == ConfidentialPayoutStatus::Configured,
            Error::ConfidentialPayoutAlreadyFunded
        );
        if account_exists(&ctx.accounts.refhe_envelope) {
            require!(
                *ctx.accounts.refhe_envelope.owner == crate::ID,
                Error::RefheEnvelopeMismatch
            );
            let mut data: &[u8] = &ctx.accounts.refhe_envelope.data.borrow();
            let envelope = RefheEnvelope::try_deserialize(&mut data)
                .map_err(|_| error!(Error::RefheEnvelopeMismatch))?;
            require!(
                envelope.dao == ctx.accounts.dao.key()
                    && envelope.proposal == p.key()
                    && envelope.payout_plan == plan.key(),
                Error::RefheEnvelopeMismatch
            );
            require!(
                envelope.status == RefheEnvelopeStatus::Settled,
                Error::RefheSettlementRequired
            );
            require!(
                envelope.verifier_program.is_some(),
                Error::RefheVerifierProgramRequired
            );
        }
        if account_exists(&ctx.accounts.magicblock_private_payment_corridor) {
            require!(
                *ctx.accounts.magicblock_private_payment_corridor.owner == crate::ID,
                Error::MagicBlockCorridorMismatch
            );
            let mut data: &[u8] = &ctx
                .accounts
                .magicblock_private_payment_corridor
                .data
                .borrow();
            let corridor = MagicBlockPrivatePaymentCorridor::try_deserialize(&mut data)
                .map_err(|_| error!(Error::MagicBlockCorridorMismatch))?;
            require!(
                corridor.dao == ctx.accounts.dao.key()
                    && corridor.proposal == p.key()
                    && corridor.payout_plan == plan.key(),
                Error::MagicBlockCorridorMismatch
            );
            require!(
                corridor.status == MagicBlockSettlementStatus::Settled,
                Error::MagicBlockSettlementRequired
            );
            require!(
                corridor.token_mint == plan.token_mint.ok_or(Error::MagicBlockTokenMintRequired)?,
                Error::MagicBlockCorridorMismatch
            );
            require!(
                corridor.settlement_wallet == plan.settlement_recipient,
                Error::MagicBlockCorridorMismatch
            );
            require!(
                corridor.validator.is_some() && corridor.transfer_queue.is_some(),
                Error::InvalidMagicBlockCorridor
            );
        }

        let dao_key = ctx.accounts.dao.key();
        let t_bump = ctx.bumps.treasury;
        let seeds: &[&[u8]] = &[b"treasury", dao_key.as_ref(), &[t_bump]];
        let signer = &[seeds];

        match plan.asset_type {
            ConfidentialAssetType::Sol => {
                require!(
                    ctx.accounts.settlement_recipient.key() == plan.settlement_recipient,
                    Error::TreasuryRecipientMismatch
                );
                transfer(
                    CpiContext::new_with_signer(
                        ctx.accounts.system_program.to_account_info(),
                        Transfer {
                            from: ctx.accounts.treasury.to_account_info(),
                            to: ctx.accounts.settlement_recipient.to_account_info(),
                        },
                        signer,
                    ),
                    plan.total_amount,
                )?;
            }
            ConfidentialAssetType::Token => {
                validate_supported_token_program(&ctx.accounts.token_program.key())?;
                let action_mint = plan
                    .token_mint
                    .ok_or(Error::ConfidentialPayoutTokenMintRequired)?;
                require!(
                    ctx.accounts.settlement_recipient.key() == plan.settlement_recipient,
                    Error::TreasuryRecipientMismatch
                );
                require!(
                    *ctx.accounts.treasury_token_account.owner == ctx.accounts.token_program.key(),
                    Error::InvalidTokenProgram
                );
                require!(
                    *ctx.accounts.recipient_token_account.owner == ctx.accounts.token_program.key(),
                    Error::InvalidTokenProgram
                );

                let treasury_token_account = parse_token_account(
                    &ctx.accounts.treasury_token_account,
                    &ctx.accounts.token_program.key(),
                )?;
                let recipient_token_account = parse_token_account(
                    &ctx.accounts.recipient_token_account,
                    &ctx.accounts.token_program.key(),
                )?;

                require!(
                    treasury_token_account.owner == ctx.accounts.treasury.key(),
                    Error::InvalidTreasuryTokenAuthority
                );
                require!(
                    treasury_token_account.mint == action_mint,
                    Error::InvalidTokenMint
                );
                require!(
                    recipient_token_account.mint == action_mint,
                    Error::InvalidTokenMint
                );
                require!(
                    ctx.accounts.treasury_token_account.key()
                        != ctx.accounts.recipient_token_account.key(),
                    Error::DuplicateTokenAccounts
                );
                require!(
                    recipient_token_account.owner == plan.settlement_recipient,
                    Error::RecipientOwnerMismatch
                );

                #[allow(deprecated)]
                token_interface::transfer(
                    CpiContext::new_with_signer(
                        ctx.accounts.token_program.to_account_info(),
                        TokenTransfer {
                            from: ctx.accounts.treasury_token_account.to_account_info(),
                            to: ctx.accounts.recipient_token_account.to_account_info(),
                            authority: ctx.accounts.treasury.to_account_info(),
                        },
                        signer,
                    ),
                    plan.total_amount,
                )?;
            }
        }

        plan.status = ConfidentialPayoutStatus::Funded;
        plan.funded_at = now;
        p.is_executed = true;

        emit!(ConfidentialPayoutExecuted {
            proposal: p.key(),
            settlement_recipient: plan.settlement_recipient,
            asset_type: plan.asset_type.clone(),
            token_mint: plan.token_mint,
            recipient_count: plan.recipient_count,
            total_amount: plan.total_amount,
            funded_at: plan.funded_at,
        });
        Ok(())
    }

    pub fn execute_confidential_payout_plan_v2(
        ctx: Context<ExecuteConfidentialPayoutPlanV2>,
    ) -> Result<()> {
        let now = Clock::get()?.unix_timestamp;
        let policy_snapshot = &ctx.accounts.proposal_execution_policy_snapshot;
        let evidence = &ctx.accounts.settlement_evidence;
        require!(
            policy_snapshot.dao == ctx.accounts.dao.key()
                && policy_snapshot.proposal == ctx.accounts.proposal.key(),
            Error::PolicySnapshotMismatch
        );
        require!(
            policy_snapshot.settlement_policy == FeaturePolicy::StrictRequired
                || policy_snapshot.settlement_policy == FeaturePolicy::ThresholdAttestedRequired,
            Error::StrictPolicyRequired
        );
        require!(
            evidence.dao == ctx.accounts.dao.key()
                && evidence.proposal == ctx.accounts.proposal.key()
                && evidence.payout_plan == ctx.accounts.confidential_payout_plan.key(),
            Error::SettlementEvidenceMismatch
        );
        require!(
            evidence.status == EvidenceStatus::Verified,
            Error::SettlementEvidenceNotVerified
        );
        require!(
            now >= evidence.valid_after && now <= evidence.expires_at,
            Error::StaleSettlementEvidence
        );
        require!(
            evidence.payout_fields_hash
                == canonical_payout_fields_hash(
                    &ctx.accounts.dao.key(),
                    &ctx.accounts.proposal.key(),
                    &ctx.accounts.confidential_payout_plan,
                ),
            Error::SettlementEvidenceMismatch
        );

        let p = &mut ctx.accounts.proposal;
        require!(p.status == ProposalStatus::Passed, Error::ProposalNotPassed);
        require!(!p.is_executed, Error::AlreadyExecuted);
        require!(
            now >= p.execution_unlocks_at,
            Error::ExecutionTimelockActive
        );
        require!(
            p.treasury_action.is_none(),
            Error::ConfidentialPayoutConflictsWithTreasuryAction
        );

        let plan = &mut ctx.accounts.confidential_payout_plan;
        require!(
            plan.dao == ctx.accounts.dao.key() && plan.proposal == p.key(),
            Error::ConfidentialPayoutPlanMismatch
        );
        require!(
            plan.status == ConfidentialPayoutStatus::Configured,
            Error::ConfidentialPayoutAlreadyFunded
        );

        let dao_key = ctx.accounts.dao.key();
        let t_bump = ctx.bumps.treasury;
        let seeds: &[&[u8]] = &[b"treasury", dao_key.as_ref(), &[t_bump]];
        let signer = &[seeds];

        match plan.asset_type {
            ConfidentialAssetType::Sol => {
                require!(
                    ctx.accounts.settlement_recipient.key() == plan.settlement_recipient,
                    Error::TreasuryRecipientMismatch
                );
                transfer(
                    CpiContext::new_with_signer(
                        ctx.accounts.system_program.to_account_info(),
                        Transfer {
                            from: ctx.accounts.treasury.to_account_info(),
                            to: ctx.accounts.settlement_recipient.to_account_info(),
                        },
                        signer,
                    ),
                    plan.total_amount,
                )?;
            }
            ConfidentialAssetType::Token => {
                validate_supported_token_program(&ctx.accounts.token_program.key())?;
                let action_mint = plan
                    .token_mint
                    .ok_or(Error::ConfidentialPayoutTokenMintRequired)?;
                require!(
                    ctx.accounts.settlement_recipient.key() == plan.settlement_recipient,
                    Error::TreasuryRecipientMismatch
                );
                require!(
                    *ctx.accounts.treasury_token_account.owner == ctx.accounts.token_program.key(),
                    Error::InvalidTokenProgram
                );
                require!(
                    *ctx.accounts.recipient_token_account.owner == ctx.accounts.token_program.key(),
                    Error::InvalidTokenProgram
                );

                let treasury_token_account = parse_token_account(
                    &ctx.accounts.treasury_token_account,
                    &ctx.accounts.token_program.key(),
                )?;
                let recipient_token_account = parse_token_account(
                    &ctx.accounts.recipient_token_account,
                    &ctx.accounts.token_program.key(),
                )?;

                require!(
                    treasury_token_account.owner == ctx.accounts.treasury.key(),
                    Error::InvalidTreasuryTokenAuthority
                );
                require!(
                    treasury_token_account.mint == action_mint,
                    Error::InvalidTokenMint
                );
                require!(
                    recipient_token_account.mint == action_mint,
                    Error::InvalidTokenMint
                );
                require!(
                    ctx.accounts.treasury_token_account.key()
                        != ctx.accounts.recipient_token_account.key(),
                    Error::DuplicateTokenAccounts
                );
                require!(
                    recipient_token_account.owner == plan.settlement_recipient,
                    Error::RecipientOwnerMismatch
                );

                #[allow(deprecated)]
                token_interface::transfer(
                    CpiContext::new_with_signer(
                        ctx.accounts.token_program.to_account_info(),
                        TokenTransfer {
                            from: ctx.accounts.treasury_token_account.to_account_info(),
                            to: ctx.accounts.recipient_token_account.to_account_info(),
                            authority: ctx.accounts.treasury.to_account_info(),
                        },
                        signer,
                    ),
                    plan.total_amount,
                )?;
            }
        }

        let consumption = &mut ctx.accounts.settlement_consumption_record;
        consumption.evidence = evidence.key();
        consumption.consumed_by_proposal = p.key();
        consumption.consumed_at = now;
        consumption.bump = ctx.bumps.settlement_consumption_record;

        plan.status = ConfidentialPayoutStatus::Funded;
        plan.funded_at = now;
        p.is_executed = true;

        emit!(SettlementEvidenceConsumedV2 {
            evidence: evidence.key(),
            proposal: p.key(),
            payout_plan: plan.key(),
            consumed_at: now,
        });
        emit!(ConfidentialPayoutExecuted {
            proposal: p.key(),
            settlement_recipient: plan.settlement_recipient,
            asset_type: plan.asset_type.clone(),
            token_mint: plan.token_mint,
            recipient_count: plan.recipient_count,
            total_amount: plan.total_amount,
            funded_at: plan.funded_at,
        });
        Ok(())
    }

    pub fn execute_confidential_payout_plan_v3(
        ctx: Context<ExecuteConfidentialPayoutPlanV3>,
    ) -> Result<()> {
        let now = Clock::get()?.unix_timestamp;
        let settlement_snapshot = &ctx.accounts.proposal_settlement_policy_snapshot_v3;
        let evidence = &ctx.accounts.settlement_evidence;
        require!(
            settlement_snapshot.dao == ctx.accounts.dao.key()
                && settlement_snapshot.proposal == ctx.accounts.proposal.key()
                && settlement_snapshot.payout_plan == ctx.accounts.confidential_payout_plan.key(),
            Error::SettlementPolicySnapshotMismatch
        );
        require!(
            settlement_snapshot.payout_fields_hash
                == canonical_payout_fields_hash(
                    &ctx.accounts.dao.key(),
                    &ctx.accounts.proposal.key(),
                    &ctx.accounts.confidential_payout_plan,
                ),
            Error::SettlementPolicySnapshotMismatch
        );
        require!(
            evidence.dao == ctx.accounts.dao.key()
                && evidence.proposal == ctx.accounts.proposal.key()
                && evidence.payout_plan == ctx.accounts.confidential_payout_plan.key(),
            Error::SettlementEvidenceMismatch
        );
        require!(
            evidence.status == EvidenceStatus::Verified,
            Error::SettlementEvidenceNotVerified
        );
        require!(
            now >= evidence.valid_after && now <= evidence.expires_at,
            Error::StaleSettlementEvidence
        );
        require!(
            now >= evidence
                .valid_after
                .checked_add(settlement_snapshot.min_evidence_age_seconds)
                .ok_or(Error::Overflow)?,
            Error::SettlementEvidenceTooFresh
        );

        let p = &mut ctx.accounts.proposal;
        require!(p.status == ProposalStatus::Passed, Error::ProposalNotPassed);
        require!(!p.is_executed, Error::AlreadyExecuted);
        require!(
            now >= p.execution_unlocks_at,
            Error::ExecutionTimelockActive
        );
        require!(
            p.treasury_action.is_none(),
            Error::ConfidentialPayoutConflictsWithTreasuryAction
        );

        let plan = &mut ctx.accounts.confidential_payout_plan;
        require!(
            plan.dao == ctx.accounts.dao.key() && plan.proposal == p.key(),
            Error::ConfidentialPayoutPlanMismatch
        );
        require!(
            plan.status == ConfidentialPayoutStatus::Configured,
            Error::ConfidentialPayoutAlreadyFunded
        );
        require!(
            plan.total_amount <= settlement_snapshot.max_payout_amount,
            Error::PayoutAmountExceedsSettlementCap
        );

        if settlement_snapshot.require_refhe_settlement {
            require!(
                account_exists(&ctx.accounts.refhe_envelope),
                Error::RefheSettlementRequired
            );
            require!(
                *ctx.accounts.refhe_envelope.owner == crate::ID,
                Error::RefheEnvelopeMismatch
            );
            let mut data: &[u8] = &ctx.accounts.refhe_envelope.data.borrow();
            let envelope = RefheEnvelope::try_deserialize(&mut data)
                .map_err(|_| error!(Error::RefheEnvelopeMismatch))?;
            require!(
                envelope.dao == ctx.accounts.dao.key()
                    && envelope.proposal == p.key()
                    && envelope.payout_plan == plan.key(),
                Error::RefheEnvelopeMismatch
            );
            require!(
                envelope.status == RefheEnvelopeStatus::Settled,
                Error::RefheSettlementRequired
            );
            require!(
                envelope.verifier_program.is_some(),
                Error::RefheVerifierProgramRequired
            );
        }

        if settlement_snapshot.require_magicblock_settlement
            && plan.asset_type == ConfidentialAssetType::Token
        {
            require!(
                account_exists(&ctx.accounts.magicblock_private_payment_corridor),
                Error::MagicBlockSettlementRequired
            );
            require!(
                *ctx.accounts.magicblock_private_payment_corridor.owner == crate::ID,
                Error::MagicBlockCorridorMismatch
            );
            let mut data: &[u8] = &ctx
                .accounts
                .magicblock_private_payment_corridor
                .data
                .borrow();
            let corridor = MagicBlockPrivatePaymentCorridor::try_deserialize(&mut data)
                .map_err(|_| error!(Error::MagicBlockCorridorMismatch))?;
            require!(
                corridor.dao == ctx.accounts.dao.key()
                    && corridor.proposal == p.key()
                    && corridor.payout_plan == plan.key(),
                Error::MagicBlockCorridorMismatch
            );
            require!(
                corridor.status == MagicBlockSettlementStatus::Settled,
                Error::MagicBlockSettlementRequired
            );
            require!(
                corridor.token_mint == plan.token_mint.ok_or(Error::MagicBlockTokenMintRequired)?,
                Error::MagicBlockCorridorMismatch
            );
            require!(
                corridor.settlement_wallet == plan.settlement_recipient,
                Error::MagicBlockCorridorMismatch
            );
            require!(
                corridor.validator.is_some() && corridor.transfer_queue.is_some(),
                Error::InvalidMagicBlockCorridor
            );
        }

        let dao_key = ctx.accounts.dao.key();
        let t_bump = ctx.bumps.treasury;
        let seeds: &[&[u8]] = &[b"treasury", dao_key.as_ref(), &[t_bump]];
        let signer = &[seeds];

        match plan.asset_type {
            ConfidentialAssetType::Sol => {
                require!(
                    ctx.accounts.settlement_recipient.key() == plan.settlement_recipient,
                    Error::TreasuryRecipientMismatch
                );
                transfer(
                    CpiContext::new_with_signer(
                        ctx.accounts.system_program.to_account_info(),
                        Transfer {
                            from: ctx.accounts.treasury.to_account_info(),
                            to: ctx.accounts.settlement_recipient.to_account_info(),
                        },
                        signer,
                    ),
                    plan.total_amount,
                )?;
            }
            ConfidentialAssetType::Token => {
                validate_supported_token_program(&ctx.accounts.token_program.key())?;
                let action_mint = plan
                    .token_mint
                    .ok_or(Error::ConfidentialPayoutTokenMintRequired)?;
                require!(
                    ctx.accounts.settlement_recipient.key() == plan.settlement_recipient,
                    Error::TreasuryRecipientMismatch
                );
                require!(
                    *ctx.accounts.treasury_token_account.owner == ctx.accounts.token_program.key(),
                    Error::InvalidTokenProgram
                );
                require!(
                    *ctx.accounts.recipient_token_account.owner == ctx.accounts.token_program.key(),
                    Error::InvalidTokenProgram
                );

                let treasury_token_account = parse_token_account(
                    &ctx.accounts.treasury_token_account,
                    &ctx.accounts.token_program.key(),
                )?;
                let recipient_token_account = parse_token_account(
                    &ctx.accounts.recipient_token_account,
                    &ctx.accounts.token_program.key(),
                )?;

                require!(
                    treasury_token_account.owner == ctx.accounts.treasury.key(),
                    Error::InvalidTreasuryTokenAuthority
                );
                require!(
                    treasury_token_account.mint == action_mint,
                    Error::InvalidTokenMint
                );
                require!(
                    recipient_token_account.mint == action_mint,
                    Error::InvalidTokenMint
                );
                require!(
                    ctx.accounts.treasury_token_account.key()
                        != ctx.accounts.recipient_token_account.key(),
                    Error::DuplicateTokenAccounts
                );
                require!(
                    recipient_token_account.owner == plan.settlement_recipient,
                    Error::RecipientOwnerMismatch
                );

                #[allow(deprecated)]
                token_interface::transfer(
                    CpiContext::new_with_signer(
                        ctx.accounts.token_program.to_account_info(),
                        TokenTransfer {
                            from: ctx.accounts.treasury_token_account.to_account_info(),
                            to: ctx.accounts.recipient_token_account.to_account_info(),
                            authority: ctx.accounts.treasury.to_account_info(),
                        },
                        signer,
                    ),
                    plan.total_amount,
                )?;
            }
        }

        let consumption = &mut ctx.accounts.settlement_consumption_record;
        consumption.evidence = evidence.key();
        consumption.consumed_by_proposal = p.key();
        consumption.consumed_at = now;
        consumption.bump = ctx.bumps.settlement_consumption_record;

        plan.status = ConfidentialPayoutStatus::Funded;
        plan.funded_at = now;
        p.is_executed = true;

        emit!(SettlementEvidenceConsumedV2 {
            evidence: evidence.key(),
            proposal: p.key(),
            payout_plan: plan.key(),
            consumed_at: now,
        });
        emit!(ConfidentialPayoutExecutedV3 {
            proposal: p.key(),
            settlement_recipient: plan.settlement_recipient,
            asset_type: plan.asset_type.clone(),
            token_mint: plan.token_mint,
            recipient_count: plan.recipient_count,
            total_amount: plan.total_amount,
            funded_at: plan.funded_at,
            min_evidence_age_seconds: settlement_snapshot.min_evidence_age_seconds,
            max_payout_amount: settlement_snapshot.max_payout_amount,
            require_refhe_settlement: settlement_snapshot.require_refhe_settlement,
            require_magicblock_settlement: settlement_snapshot.require_magicblock_settlement,
        });
        Ok(())
    }

    // ── Fund treasury ─────────────────────────────────────────────────────────

    pub fn deposit_treasury(ctx: Context<DepositTreasury>, amount: u64) -> Result<()> {
        require!(amount > 0, Error::InvalidTreasuryAction);
        transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.depositor.to_account_info(),
                    to: ctx.accounts.treasury.to_account_info(),
                },
            ),
            amount,
        )?;
        emit!(TreasuryDeposit {
            dao: ctx.accounts.dao.key(),
            from: ctx.accounts.depositor.key(),
            amount,
        });
        Ok(())
    }

    // ── Realms voter weight plugin ─────────────────────────────────────────────
    //
    // Implements spl-governance-addin-api VoterWeightRecord exactly.
    // Any Realms DAO can add PrivateDAO as a voter weight plugin today.
    // Weight expires after a bounded slot window to stay fresh without forcing
    // governance clients to refresh every few dozen seconds under normal
    // Solana slot times.
    // DualChamber exports the community chamber weight here; capital weight is
    // enforced inside PrivateDAO proposal finalization, not in this one record.

    pub fn update_voter_weight_record(ctx: Context<UpdateVoterWeightRecord>) -> Result<()> {
        let vwr = &mut ctx.accounts.voter_weight_record;
        let raw = ctx.accounts.voter_token_account.amount;

        let weight = match &ctx.accounts.dao.voting_config {
            VotingConfig::TokenWeighted => raw,
            VotingConfig::Quadratic => isqrt(raw),
            VotingConfig::DualChamber { .. } => isqrt(raw),
        };

        vwr.realm = ctx.accounts.realm.key();
        vwr.governing_token_mint = ctx.accounts.governing_token_mint.key();
        vwr.governing_token_owner = ctx.accounts.voter.key();
        vwr.voter_weight = weight;
        vwr.voter_weight_expiry = Some(Clock::get()?.slot + VOTER_WEIGHT_EXPIRY_SLOTS);
        vwr.weight_action = None;
        vwr.weight_action_target = None;
        vwr.reserved = [0u8; 8];
        Ok(())
    }

    pub fn update_voter_weight_record_v2(
        ctx: Context<UpdateVoterWeightRecordV2>,
        scope: VoterWeightScope,
    ) -> Result<()> {
        let raw = ctx.accounts.voter_token_account.amount;
        let weight = match scope {
            VoterWeightScope::CommunityTokenWeighted => raw,
            VoterWeightScope::CommunityQuadratic => isqrt(raw),
            VoterWeightScope::CapitalWeighted => raw,
            VoterWeightScope::DualChamberCommunityLeg => isqrt(raw),
            VoterWeightScope::DualChamberCapitalLeg => raw,
        };

        let vwr = &mut ctx.accounts.voter_weight_record;
        vwr.realm = ctx.accounts.realm.key();
        vwr.governing_token_mint = ctx.accounts.governing_token_mint.key();
        vwr.governing_token_owner = ctx.accounts.voter.key();
        vwr.voter_weight = weight;
        vwr.voter_weight_expiry = Some(Clock::get()?.slot + VOTER_WEIGHT_EXPIRY_SLOTS);
        vwr.weight_action = None;
        vwr.weight_action_target = None;
        vwr.reserved = [0u8; 8];

        let scope_record = &mut ctx.accounts.voter_weight_scope_record;
        scope_record.realm = ctx.accounts.realm.key();
        scope_record.governing_token_mint = ctx.accounts.governing_token_mint.key();
        scope_record.governing_token_owner = ctx.accounts.voter.key();
        scope_record.scope = scope.clone();
        scope_record.weight = weight;
        scope_record.recorded_at_slot = Clock::get()?.slot;
        scope_record.bump = ctx.bumps.voter_weight_scope_record;

        emit!(VoterWeightScopeRecorded {
            realm: scope_record.realm,
            governing_token_mint: scope_record.governing_token_mint,
            governing_token_owner: scope_record.governing_token_owner,
            scope,
            weight,
        });
        Ok(())
    }

    pub fn get_voter_weight_record(ctx: Context<GetVoterWeightRecord>) -> Result<u64> {
        Ok(if ctx.accounts.voter_record.has_committed {
            ctx.accounts.voter_record.community_weight
        } else {
            0
        })
    }

    // ── ZK proof anchor ──────────────────────────────────────────────────────
    //
    // Records a proposal-bound zk proof anchor on-chain without changing the
    // live governance lifecycle semantics. This makes the proof surface
    // visible on Solscan and binds proof/public/vkey/bundle hashes to a real
    // DAO proposal.

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

    // ── ZK verifier path receipt ────────────────────────────────────────────
    //
    // Phase A: keeps commit-reveal as the canonical live path while adding a
    // proposal-bound on-chain verification receipt path in parallel.
    //
    // This does not replace the current enforcement boundary yet. It records
    // that an anchored proof bundle has been accepted by the parallel verifier
    // path and binds that acceptance on-chain for the same proposal and layer.

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
            ctx.accounts.proposal_zk_policy.required_layers_mask
                == ProposalZkPolicy::ALL_LAYERS_MASK,
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
                    && snapshot.require_magicblock_settlement
                        == policy.require_magicblock_settlement
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
            domain_separator
                == proof_domain_separator(&ctx.accounts.dao.key(), &ctx.accounts.proposal.key()),
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
        require!(
            now <= verification.expires_at,
            Error::StaleProofVerification
        );
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
        require!(
            now <= verification.expires_at,
            Error::StaleProofVerification
        );
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
}

// ── Helpers ───────────────────────────────────────────────────────────────────

// Integer square root — floor(√n) without floating point.
// Newton's method. Converges in ≤ 32 iterations for u64::MAX.
fn isqrt(n: u64) -> u64 {
    if n == 0 {
        return 0;
    }
    let mut x = n;
    let mut y = x.div_ceil(2);
    while y < x {
        x = y;
        y = ((x as u128 + (n / x) as u128) / 2) as u64;
    }
    x
}

fn compute_vote_commitment(
    proposal: &Pubkey,
    voter: &Pubkey,
    vote: bool,
    salt: &[u8; 32],
) -> [u8; 32] {
    let vote_byte: u8 = if vote { 1 } else { 0 };
    let mut preimage = Vec::with_capacity(97);
    preimage.push(vote_byte);
    preimage.extend_from_slice(salt);
    preimage.extend_from_slice(proposal.as_ref());
    preimage.extend_from_slice(voter.as_ref());
    Sha256::digest(&preimage).into()
}

fn account_exists(info: &AccountInfo) -> bool {
    info.lamports() > 0
}

fn is_zero_hash(hash: &[u8; 32]) -> bool {
    hash.iter().all(|byte| *byte == 0)
}

fn hash_bytes(parts: &[&[u8]]) -> [u8; 32] {
    let mut hasher = Sha256::new();
    for part in parts {
        hasher.update(part);
    }
    hasher.finalize().into()
}

fn proof_domain_separator(dao: &Pubkey, proposal: &Pubkey) -> [u8; 32] {
    hash_bytes(&[PROOF_PAYLOAD_DOMAIN_V1, dao.as_ref(), proposal.as_ref()])
}

fn enforcement_rank(mode: &EnforcementMode) -> u8 {
    match mode {
        EnforcementMode::LegacyAllowed => 0,
        EnforcementMode::CompatibilityRequired => 1,
        EnforcementMode::StrictRequired => 2,
    }
}

fn feature_rank(policy: &FeaturePolicy) -> u8 {
    match policy {
        FeaturePolicy::LegacyAllowed => 0,
        FeaturePolicy::ThresholdAttestedRequired => 1,
        FeaturePolicy::StrictRequired => 2,
    }
}

fn cancel_rank(policy: &CancelPolicy) -> u8 {
    match policy {
        CancelPolicy::LegacyAllowed => 0,
        CancelPolicy::NoCancelAfterParticipation => 1,
    }
}

fn validate_governance_policy_v3(
    quorum_policy: &QuorumPolicyV3,
    reveal_rebate_policy: &RevealRebatePolicyV3,
    reveal_rebate_lamports: u64,
) -> Result<()> {
    match quorum_policy {
        QuorumPolicyV3::LegacyRevealParticipation | QuorumPolicyV3::TokenSupplyParticipation => {}
    }
    match reveal_rebate_policy {
        RevealRebatePolicyV3::Disabled => {
            require!(
                reveal_rebate_lamports == 0,
                Error::InvalidRevealRebateConfig
            );
        }
        RevealRebatePolicyV3::DedicatedVaultRequired => {
            require!(
                reveal_rebate_lamports > 0
                    && reveal_rebate_lamports <= MAX_REVEAL_REBATE_V3_LAMPORTS,
                Error::InvalidRevealRebateConfig
            );
        }
    }
    Ok(())
}

fn validate_settlement_policy_v3(
    min_evidence_age_seconds: i64,
    max_payout_amount: u64,
    _require_refhe_settlement: bool,
    _require_magicblock_settlement: bool,
) -> Result<()> {
    require!(
        min_evidence_age_seconds >= 0,
        Error::InvalidSettlementPolicyV3
    );
    require!(max_payout_amount > 0, Error::InvalidSettlementPolicyV3);
    Ok(())
}

fn reveal_rebate_vault_address(dao: &Pubkey) -> Pubkey {
    Pubkey::find_program_address(&[b"reveal-rebate-vault-v3", dao.as_ref()], &crate::ID).0
}

fn canonical_proposal_payload_hash(
    dao: &Pubkey,
    proposal: &Pubkey,
    object_version: u8,
) -> [u8; 32] {
    let version = [object_version];
    hash_bytes(&[
        PROOF_PAYLOAD_DOMAIN_V1,
        dao.as_ref(),
        proposal.as_ref(),
        version.as_ref(),
    ])
}

fn finalize_proposal_state_v3(
    dao: &Account<Dao>,
    p: &mut Account<Proposal>,
    snapshot: &Account<ProposalGovernancePolicySnapshotV3>,
    now: i64,
) -> Result<()> {
    let quorum_met = match snapshot.quorum_policy {
        QuorumPolicyV3::LegacyRevealParticipation => {
            p.commit_count > 0
                && (p.reveal_count as u128) * 100
                    >= (p.commit_count as u128) * (dao.quorum_percentage as u128)
        }
        QuorumPolicyV3::TokenSupplyParticipation => {
            snapshot.eligible_capital > 0
                && ((p.yes_capital as u128) + (p.no_capital as u128)) * 100
                    >= (snapshot.eligible_capital as u128) * (dao.quorum_percentage as u128)
        }
    };

    let passed = if quorum_met {
        match &dao.voting_config {
            VotingConfig::TokenWeighted => {
                let total = p.yes_capital + p.no_capital;
                total > 0 && p.yes_capital > p.no_capital
            }
            VotingConfig::Quadratic => {
                let total = p.yes_community + p.no_community;
                total > 0 && p.yes_community > p.no_community
            }
            VotingConfig::DualChamber {
                capital_threshold,
                community_threshold,
            } => {
                let cap_total = p.yes_capital + p.no_capital;
                let capital_passes = cap_total > 0
                    && (p.yes_capital as u128) * 100
                        >= (cap_total as u128) * (*capital_threshold as u128);

                let com_total = p.yes_community + p.no_community;
                let community_passes = com_total > 0
                    && (p.yes_community as u128) * 100
                        >= (com_total as u128) * (*community_threshold as u128);

                capital_passes && community_passes
            }
        }
    } else {
        false
    };

    p.status = if passed {
        ProposalStatus::Passed
    } else {
        ProposalStatus::Failed
    };

    if passed {
        p.execution_unlocks_at = now
            .checked_add(dao.execution_delay_seconds)
            .ok_or(Error::Overflow)?;
    }

    emit!(ProposalFinalizedV3 {
        proposal: p.key(),
        yes_capital: p.yes_capital,
        no_capital: p.no_capital,
        yes_community: p.yes_community,
        no_community: p.no_community,
        passed,
        quorum_met,
        commit_count: p.commit_count,
        reveal_count: p.reveal_count,
        eligible_capital: snapshot.eligible_capital,
        quorum_policy: snapshot.quorum_policy.clone(),
        execution_unlocks_at: p.execution_unlocks_at,
    });
    Ok(())
}

fn canonical_payout_fields_hash(
    dao: &Pubkey,
    proposal: &Pubkey,
    plan: &Account<ConfidentialPayoutPlan>,
) -> [u8; 32] {
    let plan_key = plan.key();
    let token_mint = plan.token_mint.unwrap_or_default();
    let payout_type = [plan.payout_type.seed_byte()];
    let asset_type = [plan.asset_type.seed_byte()];
    let recipient_count = plan.recipient_count.to_le_bytes();
    let total_amount = plan.total_amount.to_le_bytes();
    hash_bytes(&[
        PAYOUT_PAYLOAD_DOMAIN_V1,
        dao.as_ref(),
        proposal.as_ref(),
        plan_key.as_ref(),
        payout_type.as_ref(),
        asset_type.as_ref(),
        plan.settlement_recipient.as_ref(),
        token_mint.as_ref(),
        recipient_count.as_ref(),
        total_amount.as_ref(),
        plan.manifest_hash.as_ref(),
        plan.ciphertext_hash.as_ref(),
    ])
}

fn validate_attestor_policy(
    attestors: &[Pubkey; MAX_POLICY_ATTESTORS],
    attestor_count: u8,
    threshold: u8,
) -> Result<()> {
    require!(
        attestor_count > 0 && (attestor_count as usize) <= MAX_POLICY_ATTESTORS,
        Error::InvalidSecurityPolicy
    );
    require!(
        threshold > 0 && threshold <= attestor_count,
        Error::InvalidSecurityPolicy
    );
    for idx in 0..attestor_count as usize {
        require!(
            attestors[idx] != Pubkey::default(),
            Error::InvalidSecurityPolicy
        );
        for prior in 0..idx {
            require!(
                attestors[prior] != attestors[idx],
                Error::InvalidSecurityPolicy
            );
        }
    }
    Ok(())
}

fn count_matching_signers(
    primary_signer: Option<Pubkey>,
    remaining_accounts: &[AccountInfo],
    attestors: &[Pubkey; MAX_POLICY_ATTESTORS],
    attestor_count: u8,
) -> u8 {
    let mut matched = [false; MAX_POLICY_ATTESTORS];
    if let Some(primary) = primary_signer {
        for idx in 0..attestor_count as usize {
            if attestors[idx] == primary {
                matched[idx] = true;
            }
        }
    }
    for account in remaining_accounts {
        if !account.is_signer {
            continue;
        }
        for idx in 0..attestor_count as usize {
            if attestors[idx] == account.key() {
                matched[idx] = true;
            }
        }
    }
    matched
        .iter()
        .take(attestor_count as usize)
        .filter(|seen| **seen)
        .count() as u8
}

fn validate_zk_receipt(
    dao: &Account<Dao>,
    proposal: &Account<Proposal>,
    receipt_info: &UncheckedAccount,
    expected_layer: ZkProofLayer,
    required_mode: Option<ZkVerificationMode>,
) -> Result<()> {
    let (expected_receipt, _) = Pubkey::find_program_address(
        &[
            b"zk-verify",
            proposal.key().as_ref(),
            &[expected_layer.seed_byte()],
        ],
        &crate::ID,
    );
    require!(
        receipt_info.key() == expected_receipt,
        Error::ZkVerificationReceiptMismatch
    );
    require!(
        account_exists(&receipt_info.to_account_info()),
        Error::ZkVerificationReceiptMissing
    );
    let mut data: &[u8] = &receipt_info.data.borrow();
    let receipt = ZkVerificationReceipt::try_deserialize(&mut data)
        .map_err(|_| error!(Error::ZkVerificationReceiptMismatch))?;
    require!(
        receipt.dao == dao.key()
            && receipt.proposal == proposal.key()
            && receipt.layer == expected_layer,
        Error::ZkVerificationReceiptMismatch
    );
    require!(
        receipt.verification_mode == ZkVerificationMode::Parallel
            || receipt.verification_mode == ZkVerificationMode::ZkEnforced,
        Error::ZkVerificationReceiptMismatch
    );
    if let Some(mode) = required_mode {
        require!(
            receipt.verification_mode == mode,
            Error::InsufficientZkVerificationMode
        );
    }
    Ok(())
}

fn finalize_proposal_state(dao: &Account<Dao>, p: &mut Account<Proposal>, now: i64) -> Result<()> {
    let quorum_met = p.commit_count > 0
        && (p.reveal_count as u128) * 100
            >= (p.commit_count as u128) * (dao.quorum_percentage as u128);

    let passed = if quorum_met {
        match &dao.voting_config {
            VotingConfig::TokenWeighted => {
                let total = p.yes_capital + p.no_capital;
                total > 0 && p.yes_capital > p.no_capital
            }
            VotingConfig::Quadratic => {
                let total = p.yes_community + p.no_community;
                total > 0 && p.yes_community > p.no_community
            }
            VotingConfig::DualChamber {
                capital_threshold,
                community_threshold,
            } => {
                let cap_total = p.yes_capital + p.no_capital;
                let capital_passes = cap_total > 0
                    && (p.yes_capital as u128) * 100
                        >= (cap_total as u128) * (*capital_threshold as u128);

                let com_total = p.yes_community + p.no_community;
                let community_passes = com_total > 0
                    && (p.yes_community as u128) * 100
                        >= (com_total as u128) * (*community_threshold as u128);

                capital_passes && community_passes
            }
        }
    } else {
        false
    };

    p.status = if passed {
        ProposalStatus::Passed
    } else {
        ProposalStatus::Failed
    };

    if passed {
        p.execution_unlocks_at = now
            .checked_add(dao.execution_delay_seconds)
            .ok_or(Error::Overflow)?;
    }

    emit!(ProposalFinalized {
        proposal: p.key(),
        yes_capital: p.yes_capital,
        no_capital: p.no_capital,
        yes_community: p.yes_community,
        no_community: p.no_community,
        passed,
        quorum_met,
        commit_count: p.commit_count,
        reveal_count: p.reveal_count,
        execution_unlocks_at: p.execution_unlocks_at,
    });
    Ok(())
}

fn parse_token_account(info: &AccountInfo, expected_program: &Pubkey) -> Result<TokenAccount> {
    require!(*info.owner == *expected_program, Error::InvalidTokenProgram);
    let mut data: &[u8] = &info.try_borrow_data()?;
    TokenAccount::try_deserialize_unchecked(&mut data).map_err(Into::into)
}

fn validate_supported_token_program(program_id: &Pubkey) -> Result<()> {
    require!(
        *program_id == token::ID || *program_id == token_2022::ID,
        Error::InvalidTokenProgram
    );
    Ok(())
}

fn validate_voting_config(cfg: &VotingConfig) -> Result<()> {
    if let VotingConfig::DualChamber {
        capital_threshold,
        community_threshold,
    } = cfg
    {
        require!(
            *capital_threshold > 0 && *capital_threshold <= 100,
            Error::InvalidThreshold
        );
        require!(
            *community_threshold > 0 && *community_threshold <= 100,
            Error::InvalidThreshold
        );
    }
    Ok(())
}

fn validate_treasury_action(action: &TreasuryAction) -> Result<()> {
    match action.action_type {
        TreasuryActionType::SendSol => {
            require!(action.amount_lamports > 0, Error::InvalidTreasuryAction);
            require!(action.token_mint.is_none(), Error::InvalidTreasuryAction);
            require!(
                action.recipient != Pubkey::default(),
                Error::InvalidTreasuryAction
            );
        }
        TreasuryActionType::SendToken => {
            require!(action.amount_lamports > 0, Error::InvalidTreasuryAction);
            require!(action.token_mint.is_some(), Error::TokenMintRequired);
            require!(
                action.recipient != Pubkey::default(),
                Error::InvalidTreasuryAction
            );
        }
        TreasuryActionType::CustomCPI => {
            return err!(Error::UnsupportedTreasuryAction);
        }
    }
    Ok(())
}

fn validate_confidential_payout_plan(
    asset_type: &ConfidentialAssetType,
    settlement_recipient: Pubkey,
    token_mint: &Option<Pubkey>,
    recipient_count: u16,
    total_amount: u64,
    encrypted_manifest_uri: &str,
    manifest_hash: &[u8; 32],
    ciphertext_hash: &[u8; 32],
) -> Result<()> {
    require!(
        settlement_recipient != Pubkey::default(),
        Error::InvalidConfidentialPayoutPlan
    );
    require!(recipient_count > 0, Error::InvalidConfidentialPayoutPlan);
    require!(total_amount > 0, Error::InvalidConfidentialPayoutPlan);
    require!(
        !encrypted_manifest_uri.trim().is_empty()
            && encrypted_manifest_uri.len() <= ConfidentialPayoutPlan::MAX_URI_LEN,
        Error::ConfidentialManifestUriTooLong
    );
    require!(
        !is_zero_hash(manifest_hash) && !is_zero_hash(ciphertext_hash),
        Error::InvalidZkArtifactHash
    );

    match asset_type {
        ConfidentialAssetType::Sol => {
            require!(token_mint.is_none(), Error::InvalidConfidentialPayoutPlan);
        }
        ConfidentialAssetType::Token => {
            require!(
                token_mint.is_some(),
                Error::ConfidentialPayoutTokenMintRequired
            );
        }
    }

    Ok(())
}

fn validate_refhe_envelope(
    model_uri: &String,
    policy_hash: &[u8; 32],
    input_ciphertext_hash: &[u8; 32],
    evaluation_key_hash: &[u8; 32],
) -> Result<()> {
    require!(
        !model_uri.trim().is_empty() && model_uri.len() <= RefheEnvelope::MAX_URI_LEN,
        Error::InvalidRefheEnvelope
    );
    require!(
        !is_zero_hash(policy_hash)
            && !is_zero_hash(input_ciphertext_hash)
            && !is_zero_hash(evaluation_key_hash),
        Error::InvalidRefheEnvelope
    );
    Ok(())
}

fn validate_magicblock_corridor(
    api_base_url: &str,
    cluster: &str,
    owner_wallet: Pubkey,
    settlement_wallet: Pubkey,
    token_mint: Option<Pubkey>,
    route_hash: &[u8; 32],
    deposit_amount: u64,
    private_transfer_amount: u64,
    withdrawal_amount: u64,
) -> Result<()> {
    require!(
        !api_base_url.trim().is_empty()
            && api_base_url.len() <= MagicBlockPrivatePaymentCorridor::MAX_API_BASE_LEN,
        Error::MagicBlockApiBaseUrlTooLong
    );
    require!(
        !cluster.trim().is_empty()
            && cluster.len() <= MagicBlockPrivatePaymentCorridor::MAX_CLUSTER_LEN,
        Error::MagicBlockClusterTooLong
    );
    require!(
        owner_wallet != Pubkey::default() && settlement_wallet != Pubkey::default(),
        Error::InvalidMagicBlockCorridor
    );
    require!(token_mint.is_some(), Error::MagicBlockTokenMintRequired);
    require!(!is_zero_hash(route_hash), Error::InvalidMagicBlockCorridor);
    require!(
        private_transfer_amount > 0,
        Error::InvalidMagicBlockCorridor
    );
    require!(
        deposit_amount > 0 || withdrawal_amount > 0 || private_transfer_amount > 0,
        Error::InvalidMagicBlockCorridor
    );
    Ok(())
}

fn validate_magicblock_tx_signature(signature: &str, allow_empty: bool) -> Result<()> {
    if allow_empty && signature.trim().is_empty() {
        return Ok(());
    }
    require!(
        !signature.trim().is_empty()
            && signature.len() <= MagicBlockPrivatePaymentCorridor::MAX_SIGNATURE_LEN,
        Error::InvalidMagicBlockCorridor
    );
    Ok(())
}

// ── Account contexts ──────────────────────────────────────────────────────────

#[derive(Accounts)]
#[instruction(dao_name: String)]
pub struct InitializeDao<'info> {
    #[account(
        init, payer = authority, space = Dao::LEN,
        seeds = [b"dao", authority.key().as_ref(), dao_name.as_bytes()], bump
    )]
    pub dao: Box<Account<'info, Dao>>,
    pub governance_token: InterfaceAccount<'info, Mint>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(dao_name: String)]
pub struct MigrateFromRealms<'info> {
    #[account(
        init, payer = authority, space = Dao::LEN,
        seeds = [b"dao", authority.key().as_ref(), dao_name.as_bytes()], bump
    )]
    pub dao: Account<'info, Dao>,
    pub governance_token: InterfaceAccount<'info, Mint>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct InitializeDaoSecurityPolicy<'info> {
    #[account(has_one = authority)]
    pub dao: Account<'info, Dao>,
    #[account(
        init_if_needed,
        payer = authority,
        space = DaoSecurityPolicy::LEN,
        seeds = [b"dao-security-policy", dao.key().as_ref()],
        bump
    )]
    pub dao_security_policy: Account<'info, DaoSecurityPolicy>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateDaoSecurityPolicyV2<'info> {
    #[account(has_one = authority)]
    pub dao: Account<'info, Dao>,
    #[account(
        mut,
        seeds = [b"dao-security-policy", dao.key().as_ref()],
        bump = dao_security_policy.bump,
        constraint = dao_security_policy.dao == dao.key() @ Error::SecurityPolicyMismatch,
        constraint = dao_security_policy.authority == authority.key() @ Error::UnauthorizedConfidentialPayoutOperator
    )]
    pub dao_security_policy: Account<'info, DaoSecurityPolicy>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct InitializeDaoGovernancePolicyV3<'info> {
    #[account(has_one = authority)]
    pub dao: Account<'info, Dao>,
    #[account(
        init_if_needed,
        payer = authority,
        space = DaoGovernancePolicyV3::LEN,
        seeds = [b"dao-governance-policy-v3", dao.key().as_ref()],
        bump
    )]
    pub dao_governance_policy_v3: Account<'info, DaoGovernancePolicyV3>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateDaoGovernancePolicyV3<'info> {
    #[account(has_one = authority)]
    pub dao: Account<'info, Dao>,
    #[account(
        mut,
        seeds = [b"dao-governance-policy-v3", dao.key().as_ref()],
        bump = dao_governance_policy_v3.bump,
        constraint = dao_governance_policy_v3.dao == dao.key() @ Error::GovernancePolicyMismatch,
        constraint = dao_governance_policy_v3.authority == authority.key() @ Error::GovernancePolicyMismatch
    )]
    pub dao_governance_policy_v3: Account<'info, DaoGovernancePolicyV3>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct InitializeDaoSettlementPolicyV3<'info> {
    #[account(has_one = authority)]
    pub dao: Account<'info, Dao>,
    #[account(
        init_if_needed,
        payer = authority,
        space = DaoSettlementPolicyV3::LEN,
        seeds = [b"dao-settlement-policy-v3", dao.key().as_ref()],
        bump
    )]
    pub dao_settlement_policy_v3: Account<'info, DaoSettlementPolicyV3>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateDaoSettlementPolicyV3<'info> {
    #[account(has_one = authority)]
    pub dao: Account<'info, Dao>,
    #[account(
        mut,
        seeds = [b"dao-settlement-policy-v3", dao.key().as_ref()],
        bump = dao_settlement_policy_v3.bump,
        constraint = dao_settlement_policy_v3.dao == dao.key() @ Error::SettlementPolicyMismatch,
        constraint = dao_settlement_policy_v3.authority == authority.key() @ Error::SettlementPolicyMismatch
    )]
    pub dao_settlement_policy_v3: Account<'info, DaoSettlementPolicyV3>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(title: String)]
pub struct CreateProposal<'info> {
    #[account(
        mut,
        seeds = [b"dao", dao.authority.as_ref(), dao.dao_name.as_bytes()],
        bump = dao.bump
    )]
    pub dao: Account<'info, Dao>,
    #[account(
        init, payer = proposer, space = Proposal::LEN,
        seeds = [b"proposal", dao.key().as_ref(), dao.proposal_count.to_le_bytes().as_ref()],
        bump
    )]
    pub proposal: Box<Account<'info, Proposal>>,
    #[account(
        constraint = proposer_token_account.owner == proposer.key(),
        constraint = proposer_token_account.mint == dao.governance_token,
    )]
    pub proposer_token_account: InterfaceAccount<'info, TokenAccount>,
    #[account(mut)]
    pub proposer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CancelProposal<'info> {
    #[account(has_one = authority)]
    pub dao: Account<'info, Dao>,
    #[account(
        mut, has_one = dao,
        seeds = [b"proposal", dao.key().as_ref(), proposal.proposal_id.to_le_bytes().as_ref()],
        bump = proposal.bump
    )]
    pub proposal: Account<'info, Proposal>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct CancelProposalV2<'info> {
    #[account(has_one = authority)]
    pub dao: Account<'info, Dao>,
    #[account(
        seeds = [b"dao-security-policy", dao.key().as_ref()],
        bump = dao_security_policy.bump,
        constraint = dao_security_policy.dao == dao.key() @ Error::SecurityPolicyMismatch
    )]
    pub dao_security_policy: Account<'info, DaoSecurityPolicy>,
    #[account(
        mut, has_one = dao,
        seeds = [b"proposal", dao.key().as_ref(), proposal.proposal_id.to_le_bytes().as_ref()],
        bump = proposal.bump
    )]
    pub proposal: Account<'info, Proposal>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct VetoProposal<'info> {
    #[account(has_one = authority)]
    pub dao: Account<'info, Dao>,
    #[account(
        mut, has_one = dao,
        seeds = [b"proposal", dao.key().as_ref(), proposal.proposal_id.to_le_bytes().as_ref()],
        bump = proposal.bump
    )]
    pub proposal: Account<'info, Proposal>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct CommitVote<'info> {
    pub dao: Account<'info, Dao>,
    #[account(
        mut, has_one = dao,
        seeds = [b"proposal", dao.key().as_ref(), proposal.proposal_id.to_le_bytes().as_ref()],
        bump = proposal.bump
    )]
    pub proposal: Account<'info, Proposal>,
    #[account(
        init, payer = voter, space = VoterRecord::LEN,
        seeds = [b"vote", proposal.key().as_ref(), voter.key().as_ref()], bump
    )]
    pub voter_record: Account<'info, VoterRecord>,
    /// CHECK: proposal-scoped delegation marker for this voter. PDA may be
    /// uninitialized; only its existence matters.
    #[account(
        seeds = [b"delegation", proposal.key().as_ref(), voter.key().as_ref()],
        bump
    )]
    pub delegation_marker: UncheckedAccount<'info>,
    // Verify token account belongs to the voter and uses the DAO's governance mint
    #[account(
        constraint = voter_token_account.owner == voter.key(),
        constraint = voter_token_account.mint  == dao.governance_token,
    )]
    pub voter_token_account: InterfaceAccount<'info, TokenAccount>,
    #[account(mut)]
    pub voter: Signer<'info>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DelegateVote<'info> {
    pub dao: Account<'info, Dao>,
    #[account(
        has_one = dao,
        seeds = [b"proposal", dao.key().as_ref(), proposal.proposal_id.to_le_bytes().as_ref()],
        bump = proposal.bump
    )]
    pub proposal: Account<'info, Proposal>,
    #[account(
        init, payer = delegator, space = VoteDelegation::LEN,
        seeds = [b"delegation", proposal.key().as_ref(), delegator.key().as_ref()], bump
    )]
    pub delegation: Account<'info, VoteDelegation>,
    /// CHECK: proposal-scoped direct vote marker for this delegator. PDA may
    /// be uninitialized; only its existence matters.
    #[account(
        seeds = [b"vote", proposal.key().as_ref(), delegator.key().as_ref()],
        bump
    )]
    pub direct_vote_marker: UncheckedAccount<'info>,
    // Verify token account belongs to the delegator and uses the DAO's governance mint
    #[account(
        constraint = delegator_token_account.owner == delegator.key(),
        constraint = delegator_token_account.mint  == dao.governance_token,
    )]
    pub delegator_token_account: InterfaceAccount<'info, TokenAccount>,
    #[account(mut)]
    pub delegator: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CommitDelegatedVote<'info> {
    pub dao: Account<'info, Dao>,
    #[account(
        mut, has_one = dao,
        seeds = [b"proposal", dao.key().as_ref(), proposal.proposal_id.to_le_bytes().as_ref()],
        bump = proposal.bump
    )]
    pub proposal: Account<'info, Proposal>,
    #[account(
        mut,
        seeds = [b"delegation", proposal.key().as_ref(), delegation.delegator.as_ref()],
        bump = delegation.bump,
        constraint = delegation.delegatee == delegatee.key() @ Error::NotDelegatee,
        constraint = delegation.proposal  == proposal.key()  @ Error::WrongProposal,
    )]
    pub delegation: Account<'info, VoteDelegation>,
    /// CHECK: proposal-scoped direct vote marker for the delegator. PDA may
    /// be uninitialized; only its existence matters.
    #[account(
        seeds = [b"vote", proposal.key().as_ref(), delegation.delegator.as_ref()],
        bump
    )]
    pub delegator_vote_marker: UncheckedAccount<'info>,
    #[account(
        init, payer = delegatee, space = VoterRecord::LEN,
        seeds = [b"vote", proposal.key().as_ref(), delegatee.key().as_ref()], bump
    )]
    pub voter_record: Account<'info, VoterRecord>,
    #[account(
        constraint = delegatee_token_account.owner == delegatee.key(),
        constraint = delegatee_token_account.mint  == dao.governance_token,
    )]
    pub delegatee_token_account: InterfaceAccount<'info, TokenAccount>,
    #[account(mut)]
    pub delegatee: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RevealVote<'info> {
    #[account(
        mut,
        seeds = [b"proposal", proposal.dao.as_ref(), proposal.proposal_id.to_le_bytes().as_ref()],
        bump = proposal.bump
    )]
    pub proposal: Account<'info, Proposal>,
    #[account(
        mut,
        seeds = [b"vote", proposal.key().as_ref(), voter_record.voter.as_ref()],
        bump = voter_record.bump
    )]
    pub voter_record: Account<'info, VoterRecord>,
    #[account(mut)]
    pub revealer: Signer<'info>,
}

#[derive(Accounts)]
pub struct RevealVoteV3<'info> {
    #[account(
        mut,
        seeds = [b"proposal", proposal.dao.as_ref(), proposal.proposal_id.to_le_bytes().as_ref()],
        bump = proposal.bump
    )]
    pub proposal: Account<'info, Proposal>,
    #[account(
        mut,
        seeds = [b"vote", proposal.key().as_ref(), voter_record.voter.as_ref()],
        bump = voter_record.bump
    )]
    pub voter_record: Account<'info, VoterRecord>,
    #[account(
        seeds = [b"proposal-governance-snapshot-v3", proposal.key().as_ref()],
        bump = proposal_governance_policy_snapshot_v3.bump
    )]
    pub proposal_governance_policy_snapshot_v3: Account<'info, ProposalGovernancePolicySnapshotV3>,
    #[account(mut, seeds = [b"reveal-rebate-vault-v3", proposal.dao.as_ref()], bump = reveal_rebate_vault.bump)]
    pub reveal_rebate_vault: Account<'info, RevealRebateVaultV3State>,
    #[account(mut)]
    pub revealer: Signer<'info>,
}

#[derive(Accounts)]
pub struct FinalizeProposal<'info> {
    pub dao: Account<'info, Dao>,
    #[account(
        mut, has_one = dao,
        seeds = [b"proposal", dao.key().as_ref(), proposal.proposal_id.to_le_bytes().as_ref()],
        bump = proposal.bump
    )]
    pub proposal: Account<'info, Proposal>,
    pub finalizer: Signer<'info>,
}

#[derive(Accounts)]
pub struct FinalizeProposalV3<'info> {
    pub dao: Account<'info, Dao>,
    #[account(
        mut, has_one = dao,
        seeds = [b"proposal", dao.key().as_ref(), proposal.proposal_id.to_le_bytes().as_ref()],
        bump = proposal.bump
    )]
    pub proposal: Account<'info, Proposal>,
    #[account(
        seeds = [b"proposal-governance-snapshot-v3", proposal.key().as_ref()],
        bump = proposal_governance_policy_snapshot_v3.bump
    )]
    pub proposal_governance_policy_snapshot_v3: Account<'info, ProposalGovernancePolicySnapshotV3>,
    pub finalizer: Signer<'info>,
}

#[derive(Accounts)]
pub struct ExecuteProposal<'info> {
    pub dao: Account<'info, Dao>,
    #[account(
        mut, has_one = dao,
        seeds = [b"proposal", dao.key().as_ref(), proposal.proposal_id.to_le_bytes().as_ref()],
        bump = proposal.bump
    )]
    pub proposal: Account<'info, Proposal>,
    /// Treasury PDA — holds SOL for SendSol actions
    #[account(mut, seeds = [b"treasury", dao.key().as_ref()], bump)]
    pub treasury: SystemAccount<'info>,
    pub executor: Signer<'info>,
    /// CHECK: recipient for SOL or CustomCPI actions — validated by transfer CPI
    #[account(mut)]
    pub treasury_recipient: AccountInfo<'info>,
    /// CHECK: source token account for SendToken actions — validated by token CPI at runtime.
    ///        Pass any account (e.g. treasury PDA) for non-SendToken actions.
    #[account(mut)]
    pub treasury_token_account: AccountInfo<'info>,
    /// CHECK: destination token account for SendToken actions — validated by token CPI at runtime.
    ///        Pass any account (e.g. treasury PDA) for non-SendToken actions.
    #[account(mut)]
    pub recipient_token_account: AccountInfo<'info>,
    /// CHECK: if a confidential payout plan exists for this proposal, the standard execute path must reject.
    #[account(
        seeds = [b"payout-plan", proposal.key().as_ref()],
        bump
    )]
    pub confidential_payout_plan: UncheckedAccount<'info>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ConfigureConfidentialPayoutPlan<'info> {
    pub dao: Account<'info, Dao>,
    #[account(
        mut,
        has_one = dao,
        seeds = [b"proposal", dao.key().as_ref(), proposal.proposal_id.to_le_bytes().as_ref()],
        bump = proposal.bump
    )]
    pub proposal: Account<'info, Proposal>,
    #[account(
        init_if_needed,
        payer = operator,
        space = ConfidentialPayoutPlan::LEN,
        seeds = [b"payout-plan", proposal.key().as_ref()],
        bump
    )]
    pub confidential_payout_plan: Account<'info, ConfidentialPayoutPlan>,
    #[account(mut)]
    pub operator: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ExecuteConfidentialPayoutPlan<'info> {
    pub dao: Account<'info, Dao>,
    #[account(
        mut,
        has_one = dao,
        seeds = [b"proposal", dao.key().as_ref(), proposal.proposal_id.to_le_bytes().as_ref()],
        bump = proposal.bump
    )]
    pub proposal: Account<'info, Proposal>,
    #[account(
        mut,
        seeds = [b"payout-plan", proposal.key().as_ref()],
        bump = confidential_payout_plan.bump
    )]
    pub confidential_payout_plan: Account<'info, ConfidentialPayoutPlan>,
    #[account(mut, seeds = [b"treasury", dao.key().as_ref()], bump)]
    pub treasury: SystemAccount<'info>,
    pub executor: Signer<'info>,
    /// CHECK: settlement wallet for the encrypted payout batch
    #[account(mut)]
    pub settlement_recipient: AccountInfo<'info>,
    /// CHECK: source token ATA for token payout batches; ignored for SOL payout batches
    #[account(mut)]
    pub treasury_token_account: AccountInfo<'info>,
    /// CHECK: destination token ATA for token payout batches; ignored for SOL payout batches
    #[account(mut)]
    pub recipient_token_account: AccountInfo<'info>,
    /// CHECK: optional REFHE envelope for proposal-bound confidential execution
    #[account(
        seeds = [b"refhe-envelope", proposal.key().as_ref()],
        bump
    )]
    pub refhe_envelope: UncheckedAccount<'info>,
    /// CHECK: optional MagicBlock private payments corridor for token settlement hardening
    #[account(
        seeds = [b"magicblock-corridor", proposal.key().as_ref()],
        bump
    )]
    pub magicblock_private_payment_corridor: UncheckedAccount<'info>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ExecuteConfidentialPayoutPlanV2<'info> {
    pub dao: Box<Account<'info, Dao>>,
    #[account(
        mut,
        has_one = dao,
        seeds = [b"proposal", dao.key().as_ref(), proposal.proposal_id.to_le_bytes().as_ref()],
        bump = proposal.bump
    )]
    pub proposal: Box<Account<'info, Proposal>>,
    #[account(
        seeds = [b"proposal-policy-snapshot", proposal.key().as_ref()],
        bump = proposal_execution_policy_snapshot.bump,
        constraint = proposal_execution_policy_snapshot.dao == dao.key() @ Error::PolicySnapshotMismatch,
        constraint = proposal_execution_policy_snapshot.proposal == proposal.key() @ Error::PolicySnapshotMismatch
    )]
    pub proposal_execution_policy_snapshot: Box<Account<'info, ProposalExecutionPolicySnapshot>>,
    #[account(
        mut,
        seeds = [b"payout-plan", proposal.key().as_ref()],
        bump = confidential_payout_plan.bump
    )]
    pub confidential_payout_plan: Box<Account<'info, ConfidentialPayoutPlan>>,
    #[account(
        seeds = [
            b"settlement-evidence",
            proposal.key().as_ref(),
            confidential_payout_plan.key().as_ref(),
            settlement_evidence.settlement_id.as_ref()
        ],
        bump = settlement_evidence.bump
    )]
    pub settlement_evidence: Box<Account<'info, SettlementEvidence>>,
    #[account(
        init,
        payer = executor,
        space = SettlementConsumptionRecord::LEN,
        seeds = [b"settlement-consumption", settlement_evidence.key().as_ref()],
        bump
    )]
    pub settlement_consumption_record: Box<Account<'info, SettlementConsumptionRecord>>,
    #[account(mut, seeds = [b"treasury", dao.key().as_ref()], bump)]
    pub treasury: SystemAccount<'info>,
    #[account(mut)]
    pub executor: Signer<'info>,
    /// CHECK: settlement wallet for the encrypted payout batch
    #[account(mut)]
    pub settlement_recipient: AccountInfo<'info>,
    /// CHECK: source token ATA for token payout batches; ignored for SOL payout batches
    #[account(mut)]
    pub treasury_token_account: AccountInfo<'info>,
    /// CHECK: destination token ATA for token payout batches; ignored for SOL payout batches
    #[account(mut)]
    pub recipient_token_account: AccountInfo<'info>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ExecuteConfidentialPayoutPlanV3<'info> {
    pub dao: Box<Account<'info, Dao>>,
    #[account(
        mut,
        has_one = dao,
        seeds = [b"proposal", dao.key().as_ref(), proposal.proposal_id.to_le_bytes().as_ref()],
        bump = proposal.bump
    )]
    pub proposal: Box<Account<'info, Proposal>>,
    #[account(
        mut,
        seeds = [b"payout-plan", proposal.key().as_ref()],
        bump = confidential_payout_plan.bump
    )]
    pub confidential_payout_plan: Box<Account<'info, ConfidentialPayoutPlan>>,
    #[account(
        seeds = [b"proposal-settlement-policy-v3", proposal.key().as_ref()],
        bump = proposal_settlement_policy_snapshot_v3.bump,
        constraint = proposal_settlement_policy_snapshot_v3.dao == dao.key() @ Error::SettlementPolicySnapshotMismatch,
        constraint = proposal_settlement_policy_snapshot_v3.proposal == proposal.key() @ Error::SettlementPolicySnapshotMismatch,
        constraint = proposal_settlement_policy_snapshot_v3.payout_plan == confidential_payout_plan.key() @ Error::SettlementPolicySnapshotMismatch
    )]
    pub proposal_settlement_policy_snapshot_v3:
        Box<Account<'info, ProposalSettlementPolicySnapshotV3>>,
    #[account(
        seeds = [
            b"settlement-evidence",
            proposal.key().as_ref(),
            confidential_payout_plan.key().as_ref(),
            settlement_evidence.settlement_id.as_ref()
        ],
        bump = settlement_evidence.bump
    )]
    pub settlement_evidence: Box<Account<'info, SettlementEvidence>>,
    #[account(
        init,
        payer = executor,
        space = SettlementConsumptionRecord::LEN,
        seeds = [b"settlement-consumption", settlement_evidence.key().as_ref()],
        bump
    )]
    pub settlement_consumption_record: Box<Account<'info, SettlementConsumptionRecord>>,
    #[account(mut, seeds = [b"treasury", dao.key().as_ref()], bump)]
    pub treasury: SystemAccount<'info>,
    #[account(mut)]
    pub executor: Signer<'info>,
    /// CHECK: settlement wallet for the encrypted payout batch
    #[account(mut)]
    pub settlement_recipient: AccountInfo<'info>,
    /// CHECK: source token ATA for token payout batches; ignored for SOL payout batches
    #[account(mut)]
    pub treasury_token_account: AccountInfo<'info>,
    /// CHECK: destination token ATA for token payout batches; ignored for SOL payout batches
    #[account(mut)]
    pub recipient_token_account: AccountInfo<'info>,
    /// CHECK: policy-checked REFHE envelope for proposal-bound confidential execution
    #[account(
        seeds = [b"refhe-envelope", proposal.key().as_ref()],
        bump
    )]
    pub refhe_envelope: UncheckedAccount<'info>,
    /// CHECK: policy-checked MagicBlock private payments corridor
    #[account(
        seeds = [b"magicblock-corridor", proposal.key().as_ref()],
        bump
    )]
    pub magicblock_private_payment_corridor: UncheckedAccount<'info>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ConfigureRefheEnvelope<'info> {
    pub dao: Account<'info, Dao>,
    #[account(
        has_one = dao,
        seeds = [b"proposal", dao.key().as_ref(), proposal.proposal_id.to_le_bytes().as_ref()],
        bump = proposal.bump
    )]
    pub proposal: Account<'info, Proposal>,
    #[account(
        seeds = [b"payout-plan", proposal.key().as_ref()],
        bump = confidential_payout_plan.bump
    )]
    pub confidential_payout_plan: Account<'info, ConfidentialPayoutPlan>,
    #[account(
        init_if_needed,
        payer = operator,
        space = RefheEnvelope::LEN,
        seeds = [b"refhe-envelope", proposal.key().as_ref()],
        bump
    )]
    pub refhe_envelope: Account<'info, RefheEnvelope>,
    #[account(mut)]
    pub operator: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SettleRefheEnvelope<'info> {
    pub dao: Account<'info, Dao>,
    #[account(
        has_one = dao,
        seeds = [b"proposal", dao.key().as_ref(), proposal.proposal_id.to_le_bytes().as_ref()],
        bump = proposal.bump
    )]
    pub proposal: Account<'info, Proposal>,
    #[account(
        seeds = [b"payout-plan", proposal.key().as_ref()],
        bump = confidential_payout_plan.bump
    )]
    pub confidential_payout_plan: Account<'info, ConfidentialPayoutPlan>,
    #[account(
        mut,
        seeds = [b"refhe-envelope", proposal.key().as_ref()],
        bump = refhe_envelope.bump
    )]
    pub refhe_envelope: Account<'info, RefheEnvelope>,
    #[account(mut)]
    pub operator: Signer<'info>,
}

#[derive(Accounts)]
pub struct ConfigureMagicBlockPrivatePaymentCorridor<'info> {
    pub dao: Account<'info, Dao>,
    #[account(
        has_one = dao,
        seeds = [b"proposal", dao.key().as_ref(), proposal.proposal_id.to_le_bytes().as_ref()],
        bump = proposal.bump
    )]
    pub proposal: Account<'info, Proposal>,
    #[account(
        seeds = [b"payout-plan", proposal.key().as_ref()],
        bump = confidential_payout_plan.bump
    )]
    pub confidential_payout_plan: Account<'info, ConfidentialPayoutPlan>,
    #[account(
        init_if_needed,
        payer = operator,
        space = MagicBlockPrivatePaymentCorridor::LEN,
        seeds = [b"magicblock-corridor", proposal.key().as_ref()],
        bump
    )]
    pub magicblock_private_payment_corridor: Account<'info, MagicBlockPrivatePaymentCorridor>,
    #[account(mut)]
    pub operator: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SettleMagicBlockPrivatePaymentCorridor<'info> {
    pub dao: Account<'info, Dao>,
    #[account(
        has_one = dao,
        seeds = [b"proposal", dao.key().as_ref(), proposal.proposal_id.to_le_bytes().as_ref()],
        bump = proposal.bump
    )]
    pub proposal: Account<'info, Proposal>,
    #[account(
        seeds = [b"payout-plan", proposal.key().as_ref()],
        bump = confidential_payout_plan.bump
    )]
    pub confidential_payout_plan: Account<'info, ConfidentialPayoutPlan>,
    #[account(
        mut,
        seeds = [b"magicblock-corridor", proposal.key().as_ref()],
        bump = magicblock_private_payment_corridor.bump
    )]
    pub magicblock_private_payment_corridor: Account<'info, MagicBlockPrivatePaymentCorridor>,
    #[account(mut)]
    pub operator: Signer<'info>,
}

#[derive(Accounts)]
pub struct DepositTreasury<'info> {
    pub dao: Account<'info, Dao>,
    #[account(mut, seeds = [b"treasury", dao.key().as_ref()], bump)]
    pub treasury: SystemAccount<'info>,
    #[account(mut)]
    pub depositor: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateVoterWeightRecord<'info> {
    pub dao: Account<'info, Dao>,
    /// CHECK: Realms realm account — not owned by this program
    pub realm: AccountInfo<'info>,
    #[account(
        constraint = governing_token_mint.key() == dao.governance_token @ Error::GoverningMintMismatch
    )]
    pub governing_token_mint: InterfaceAccount<'info, Mint>,
    #[account(
        init_if_needed, payer = voter, space = VoterWeightRecord::LEN,
        seeds = [
            b"voter-weight-record",
            realm.key().as_ref(),
            governing_token_mint.key().as_ref(),
            voter.key().as_ref()
        ],
        bump
    )]
    pub voter_weight_record: Account<'info, VoterWeightRecord>,
    #[account(
        constraint = voter_token_account.owner == voter.key(),
        constraint = voter_token_account.mint  == dao.governance_token,
    )]
    pub voter_token_account: InterfaceAccount<'info, TokenAccount>,
    #[account(mut)]
    pub voter: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(scope: VoterWeightScope)]
pub struct UpdateVoterWeightRecordV2<'info> {
    pub dao: Account<'info, Dao>,
    /// CHECK: Realms realm account — not owned by this program
    pub realm: AccountInfo<'info>,
    #[account(
        constraint = governing_token_mint.key() == dao.governance_token @ Error::GoverningMintMismatch
    )]
    pub governing_token_mint: InterfaceAccount<'info, Mint>,
    #[account(
        init_if_needed, payer = voter, space = VoterWeightRecord::LEN,
        seeds = [
            b"voter-weight-record",
            realm.key().as_ref(),
            governing_token_mint.key().as_ref(),
            voter.key().as_ref()
        ],
        bump
    )]
    pub voter_weight_record: Account<'info, VoterWeightRecord>,
    #[account(
        init_if_needed, payer = voter, space = VoterWeightScopeRecord::LEN,
        seeds = [
            b"voter-weight-scope",
            realm.key().as_ref(),
            governing_token_mint.key().as_ref(),
            voter.key().as_ref(),
            &[scope.seed_byte()]
        ],
        bump
    )]
    pub voter_weight_scope_record: Account<'info, VoterWeightScopeRecord>,
    #[account(
        constraint = voter_token_account.owner == voter.key(),
        constraint = voter_token_account.mint  == dao.governance_token,
    )]
    pub voter_token_account: InterfaceAccount<'info, TokenAccount>,
    #[account(mut)]
    pub voter: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct GetVoterWeightRecord<'info> {
    pub proposal: Account<'info, Proposal>,
    #[account(
        seeds = [b"vote", proposal.key().as_ref(), voter.key().as_ref()],
        bump = voter_record.bump
    )]
    pub voter_record: Account<'info, VoterRecord>,
    /// CHECK: read-only, no mutation
    pub voter: AccountInfo<'info>,
}

#[derive(Accounts)]
#[instruction(layer: ZkProofLayer)]
pub struct AnchorZkProof<'info> {
    pub dao: Account<'info, Dao>,
    #[account(
        has_one = dao,
        seeds = [b"proposal", dao.key().as_ref(), proposal.proposal_id.to_le_bytes().as_ref()],
        bump = proposal.bump
    )]
    pub proposal: Account<'info, Proposal>,
    #[account(
        init,
        payer = recorder,
        space = ZkProofAnchor::LEN,
        seeds = [b"zk-proof", proposal.key().as_ref(), &[layer.seed_byte()]],
        bump
    )]
    pub zk_proof_anchor: Account<'info, ZkProofAnchor>,
    #[account(mut)]
    pub recorder: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(layer: ZkProofLayer)]
pub struct VerifyZkProofOnChain<'info> {
    pub dao: Account<'info, Dao>,
    #[account(
        has_one = dao,
        seeds = [b"proposal", dao.key().as_ref(), proposal.proposal_id.to_le_bytes().as_ref()],
        bump = proposal.bump
    )]
    pub proposal: Account<'info, Proposal>,
    #[account(
        seeds = [b"zk-proof", proposal.key().as_ref(), &[layer.seed_byte()]],
        bump = zk_proof_anchor.bump
    )]
    pub zk_proof_anchor: Account<'info, ZkProofAnchor>,
    #[account(
        init_if_needed,
        payer = verifier,
        space = ZkVerificationReceipt::LEN,
        seeds = [b"zk-verify", proposal.key().as_ref(), &[layer.seed_byte()]],
        bump
    )]
    pub zk_verification_receipt: Account<'info, ZkVerificationReceipt>,
    #[account(mut)]
    pub verifier: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ConfigureProposalZkMode<'info> {
    pub dao: Account<'info, Dao>,
    #[account(
        mut,
        has_one = dao,
        seeds = [b"proposal", dao.key().as_ref(), proposal.proposal_id.to_le_bytes().as_ref()],
        bump = proposal.bump
    )]
    pub proposal: Account<'info, Proposal>,
    #[account(
        init_if_needed,
        payer = operator,
        space = ProposalZkPolicy::LEN,
        seeds = [b"zk-policy", proposal.key().as_ref()],
        bump
    )]
    pub proposal_zk_policy: Account<'info, ProposalZkPolicy>,
    /// CHECK: validated by validate_zk_receipt
    pub vote_zk_receipt: UncheckedAccount<'info>,
    /// CHECK: validated by validate_zk_receipt
    pub delegation_zk_receipt: UncheckedAccount<'info>,
    /// CHECK: validated by validate_zk_receipt
    pub tally_zk_receipt: UncheckedAccount<'info>,
    #[account(mut)]
    pub operator: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct FinalizeZkEnforcedProposal<'info> {
    pub dao: Account<'info, Dao>,
    #[account(
        mut,
        has_one = dao,
        seeds = [b"proposal", dao.key().as_ref(), proposal.proposal_id.to_le_bytes().as_ref()],
        bump = proposal.bump
    )]
    pub proposal: Account<'info, Proposal>,
    #[account(
        seeds = [b"zk-policy", proposal.key().as_ref()],
        bump = proposal_zk_policy.bump
    )]
    pub proposal_zk_policy: Account<'info, ProposalZkPolicy>,
    pub finalizer: Signer<'info>,
}

#[derive(Accounts)]
pub struct SnapshotProposalExecutionPolicy<'info> {
    pub dao: Account<'info, Dao>,
    #[account(
        seeds = [b"dao-security-policy", dao.key().as_ref()],
        bump = dao_security_policy.bump,
        constraint = dao_security_policy.dao == dao.key() @ Error::SecurityPolicyMismatch
    )]
    pub dao_security_policy: Account<'info, DaoSecurityPolicy>,
    #[account(
        has_one = dao,
        seeds = [b"proposal", dao.key().as_ref(), proposal.proposal_id.to_le_bytes().as_ref()],
        bump = proposal.bump
    )]
    pub proposal: Account<'info, Proposal>,
    #[account(
        init_if_needed,
        payer = operator,
        space = ProposalExecutionPolicySnapshot::LEN,
        seeds = [b"proposal-policy-snapshot", proposal.key().as_ref()],
        bump
    )]
    pub proposal_execution_policy_snapshot: Account<'info, ProposalExecutionPolicySnapshot>,
    #[account(mut)]
    pub operator: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SnapshotProposalGovernancePolicyV3<'info> {
    pub dao: Account<'info, Dao>,
    #[account(
        seeds = [b"dao-governance-policy-v3", dao.key().as_ref()],
        bump = dao_governance_policy_v3.bump,
        constraint = dao_governance_policy_v3.dao == dao.key() @ Error::GovernancePolicyMismatch
    )]
    pub dao_governance_policy_v3: Account<'info, DaoGovernancePolicyV3>,
    #[account(
        has_one = dao,
        seeds = [b"proposal", dao.key().as_ref(), proposal.proposal_id.to_le_bytes().as_ref()],
        bump = proposal.bump
    )]
    pub proposal: Account<'info, Proposal>,
    #[account(
        constraint = governance_token.key() == dao.governance_token @ Error::GoverningMintMismatch
    )]
    pub governance_token: InterfaceAccount<'info, Mint>,
    #[account(
        init_if_needed,
        payer = operator,
        space = ProposalGovernancePolicySnapshotV3::LEN,
        seeds = [b"proposal-governance-snapshot-v3", proposal.key().as_ref()],
        bump
    )]
    pub proposal_governance_policy_snapshot_v3: Account<'info, ProposalGovernancePolicySnapshotV3>,
    #[account(mut)]
    pub operator: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SnapshotProposalSettlementPolicyV3<'info> {
    pub dao: Account<'info, Dao>,
    #[account(
        seeds = [b"dao-settlement-policy-v3", dao.key().as_ref()],
        bump = dao_settlement_policy_v3.bump,
        constraint = dao_settlement_policy_v3.dao == dao.key() @ Error::SettlementPolicyMismatch
    )]
    pub dao_settlement_policy_v3: Account<'info, DaoSettlementPolicyV3>,
    #[account(
        has_one = dao,
        seeds = [b"proposal", dao.key().as_ref(), proposal.proposal_id.to_le_bytes().as_ref()],
        bump = proposal.bump
    )]
    pub proposal: Account<'info, Proposal>,
    #[account(
        seeds = [b"payout-plan", proposal.key().as_ref()],
        bump = confidential_payout_plan.bump
    )]
    pub confidential_payout_plan: Account<'info, ConfidentialPayoutPlan>,
    #[account(
        init_if_needed,
        payer = operator,
        space = ProposalSettlementPolicySnapshotV3::LEN,
        seeds = [b"proposal-settlement-policy-v3", proposal.key().as_ref()],
        bump
    )]
    pub proposal_settlement_policy_snapshot_v3: Account<'info, ProposalSettlementPolicySnapshotV3>,
    #[account(mut)]
    pub operator: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct FundRevealRebateVaultV3<'info> {
    pub dao: Account<'info, Dao>,
    #[account(
        seeds = [b"dao-governance-policy-v3", dao.key().as_ref()],
        bump = dao_governance_policy_v3.bump,
        constraint = dao_governance_policy_v3.dao == dao.key() @ Error::GovernancePolicyMismatch
    )]
    pub dao_governance_policy_v3: Account<'info, DaoGovernancePolicyV3>,
    #[account(
        init_if_needed,
        payer = funder,
        space = RevealRebateVaultV3State::LEN,
        seeds = [b"reveal-rebate-vault-v3", dao.key().as_ref()],
        bump
    )]
    pub reveal_rebate_vault: Account<'info, RevealRebateVaultV3State>,
    #[account(mut)]
    pub funder: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RecordProofVerificationV2<'info> {
    pub dao: Account<'info, Dao>,
    #[account(
        seeds = [b"dao-security-policy", dao.key().as_ref()],
        bump = dao_security_policy.bump,
        constraint = dao_security_policy.dao == dao.key() @ Error::SecurityPolicyMismatch
    )]
    pub dao_security_policy: Account<'info, DaoSecurityPolicy>,
    #[account(
        has_one = dao,
        seeds = [b"proposal", dao.key().as_ref(), proposal.proposal_id.to_le_bytes().as_ref()],
        bump = proposal.bump
    )]
    pub proposal: Account<'info, Proposal>,
    #[account(
        init_if_needed,
        payer = recorder,
        space = ProposalProofVerification::LEN,
        seeds = [b"proposal-proof-verification", proposal.key().as_ref()],
        bump
    )]
    pub proposal_proof_verification: Account<'info, ProposalProofVerification>,
    #[account(mut)]
    pub recorder: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct FinalizeZkEnforcedProposalV2<'info> {
    pub dao: Account<'info, Dao>,
    #[account(
        mut,
        has_one = dao,
        seeds = [b"proposal", dao.key().as_ref(), proposal.proposal_id.to_le_bytes().as_ref()],
        bump = proposal.bump
    )]
    pub proposal: Account<'info, Proposal>,
    #[account(
        seeds = [b"proposal-policy-snapshot", proposal.key().as_ref()],
        bump = proposal_execution_policy_snapshot.bump
    )]
    pub proposal_execution_policy_snapshot: Account<'info, ProposalExecutionPolicySnapshot>,
    #[account(
        seeds = [b"proposal-proof-verification", proposal.key().as_ref()],
        bump = proposal_proof_verification.bump
    )]
    pub proposal_proof_verification: Account<'info, ProposalProofVerification>,
    pub finalizer: Signer<'info>,
}

#[derive(Accounts)]
pub struct FinalizeZkEnforcedProposalV3<'info> {
    pub dao: Account<'info, Dao>,
    #[account(
        mut,
        has_one = dao,
        seeds = [b"proposal", dao.key().as_ref(), proposal.proposal_id.to_le_bytes().as_ref()],
        bump = proposal.bump
    )]
    pub proposal: Account<'info, Proposal>,
    #[account(
        seeds = [b"proposal-policy-snapshot", proposal.key().as_ref()],
        bump = proposal_execution_policy_snapshot.bump
    )]
    pub proposal_execution_policy_snapshot: Account<'info, ProposalExecutionPolicySnapshot>,
    #[account(
        seeds = [b"proposal-governance-snapshot-v3", proposal.key().as_ref()],
        bump = proposal_governance_policy_snapshot_v3.bump
    )]
    pub proposal_governance_policy_snapshot_v3: Account<'info, ProposalGovernancePolicySnapshotV3>,
    #[account(
        seeds = [b"proposal-proof-verification", proposal.key().as_ref()],
        bump = proposal_proof_verification.bump
    )]
    pub proposal_proof_verification: Account<'info, ProposalProofVerification>,
    pub finalizer: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(kind: SettlementEvidenceKind, settlement_id: [u8; 32])]
pub struct RecordSettlementEvidenceV2<'info> {
    pub dao: Box<Account<'info, Dao>>,
    #[account(
        seeds = [b"dao-security-policy", dao.key().as_ref()],
        bump = dao_security_policy.bump,
        constraint = dao_security_policy.dao == dao.key() @ Error::SecurityPolicyMismatch
    )]
    pub dao_security_policy: Box<Account<'info, DaoSecurityPolicy>>,
    #[account(
        has_one = dao,
        seeds = [b"proposal", dao.key().as_ref(), proposal.proposal_id.to_le_bytes().as_ref()],
        bump = proposal.bump
    )]
    pub proposal: Box<Account<'info, Proposal>>,
    #[account(
        seeds = [b"payout-plan", proposal.key().as_ref()],
        bump = confidential_payout_plan.bump
    )]
    pub confidential_payout_plan: Box<Account<'info, ConfidentialPayoutPlan>>,
    #[account(
        init_if_needed,
        payer = recorder,
        space = SettlementEvidence::LEN,
        seeds = [
            b"settlement-evidence",
            proposal.key().as_ref(),
            confidential_payout_plan.key().as_ref(),
            settlement_id.as_ref()
        ],
        bump
    )]
    pub settlement_evidence: Box<Account<'info, SettlementEvidence>>,
    #[account(mut)]
    pub recorder: Signer<'info>,
    pub system_program: Program<'info, System>,
}

// ── State ─────────────────────────────────────────────────────────────────────

#[account]
pub struct DaoSecurityPolicy {
    pub dao: Pubkey,
    pub authority: Pubkey,
    pub mode: EnforcementMode,
    pub zk_policy: FeaturePolicy,
    pub settlement_policy: FeaturePolicy,
    pub cancel_policy: CancelPolicy,
    pub proof_attestors: [Pubkey; MAX_POLICY_ATTESTORS],
    pub proof_attestor_count: u8,
    pub proof_threshold: u8,
    pub settlement_attestors: [Pubkey; MAX_POLICY_ATTESTORS],
    pub settlement_attestor_count: u8,
    pub settlement_threshold: u8,
    pub proof_ttl_seconds: i64,
    pub settlement_ttl_seconds: i64,
    pub emergency_disabled: bool,
    pub created_at: i64,
    pub updated_at: i64,
    pub bump: u8,
}

impl DaoSecurityPolicy {
    pub const LEN: usize = 8
        + 32
        + 32
        + 1
        + 1
        + 1
        + 1
        + (32 * MAX_POLICY_ATTESTORS)
        + 1
        + 1
        + (32 * MAX_POLICY_ATTESTORS)
        + 1
        + 1
        + 8
        + 8
        + 1
        + 8
        + 8
        + 1;
}

#[account]
pub struct DaoGovernancePolicyV3 {
    pub dao: Pubkey,
    pub authority: Pubkey,
    pub quorum_policy: QuorumPolicyV3,
    pub reveal_rebate_policy: RevealRebatePolicyV3,
    pub reveal_rebate_lamports: u64,
    pub created_at: i64,
    pub updated_at: i64,
    pub bump: u8,
}

impl DaoGovernancePolicyV3 {
    pub const LEN: usize = 8 + 32 + 32 + 1 + 1 + 8 + 8 + 8 + 1;
}

#[account]
pub struct DaoSettlementPolicyV3 {
    pub dao: Pubkey,
    pub authority: Pubkey,
    pub min_evidence_age_seconds: i64,
    pub max_payout_amount: u64,
    pub require_refhe_settlement: bool,
    pub require_magicblock_settlement: bool,
    pub created_at: i64,
    pub updated_at: i64,
    pub bump: u8,
}

impl DaoSettlementPolicyV3 {
    pub const LEN: usize = 8 + 32 + 32 + 8 + 8 + 1 + 1 + 8 + 8 + 1;
}

#[account]
pub struct ProposalGovernancePolicySnapshotV3 {
    pub dao: Pubkey,
    pub proposal: Pubkey,
    pub quorum_policy: QuorumPolicyV3,
    pub reveal_rebate_policy: RevealRebatePolicyV3,
    pub reveal_rebate_lamports: u64,
    pub eligible_capital: u64,
    pub snapshot_at: i64,
    pub object_version: u8,
    pub bump: u8,
}

impl ProposalGovernancePolicySnapshotV3 {
    pub const LEN: usize = 8 + 32 + 32 + 1 + 1 + 8 + 8 + 8 + 1 + 1;
}

#[account]
pub struct ProposalSettlementPolicySnapshotV3 {
    pub dao: Pubkey,
    pub proposal: Pubkey,
    pub payout_plan: Pubkey,
    pub min_evidence_age_seconds: i64,
    pub max_payout_amount: u64,
    pub require_refhe_settlement: bool,
    pub require_magicblock_settlement: bool,
    pub payout_fields_hash: [u8; 32],
    pub snapshot_at: i64,
    pub object_version: u8,
    pub bump: u8,
}

impl ProposalSettlementPolicySnapshotV3 {
    pub const LEN: usize = 8 + 32 + 32 + 32 + 8 + 8 + 1 + 1 + 32 + 8 + 1 + 1;
}

#[account]
pub struct RevealRebateVaultV3State {
    pub dao: Pubkey,
    pub bump: u8,
}

impl RevealRebateVaultV3State {
    pub const LEN: usize = 8 + 32 + 1;
}

#[account]
pub struct ProposalExecutionPolicySnapshot {
    pub dao: Pubkey,
    pub proposal: Pubkey,
    pub created_under_mode: EnforcementMode,
    pub zk_policy: FeaturePolicy,
    pub settlement_policy: FeaturePolicy,
    pub cancel_policy: CancelPolicy,
    pub object_version: u8,
    pub snapshot_at: i64,
    pub bump: u8,
}

impl ProposalExecutionPolicySnapshot {
    pub const LEN: usize = 8 + 32 + 32 + 1 + 1 + 1 + 1 + 1 + 8 + 1;
}

#[account]
pub struct ProposalProofVerification {
    pub dao: Pubkey,
    pub proposal: Pubkey,
    pub payload_hash: [u8; 32],
    pub proof_hash: [u8; 32],
    pub public_inputs_hash: [u8; 32],
    pub verification_key_hash: [u8; 32],
    pub verification_kind: VerificationKind,
    pub status: VerificationStatus,
    pub domain_separator: [u8; 32],
    pub verified_by: Pubkey,
    pub verified_at: i64,
    pub expires_at: i64,
    pub bump: u8,
}

impl ProposalProofVerification {
    pub const LEN: usize = 8 + 32 + 32 + 32 + 32 + 32 + 32 + 1 + 1 + 32 + 32 + 8 + 8 + 1;
}

#[account]
pub struct SettlementEvidence {
    pub dao: Pubkey,
    pub proposal: Pubkey,
    pub payout_plan: Pubkey,
    pub kind: SettlementEvidenceKind,
    pub status: EvidenceStatus,
    pub settlement_id: [u8; 32],
    pub evidence_hash: [u8; 32],
    pub payout_fields_hash: [u8; 32],
    pub recorded_by: Pubkey,
    pub valid_after: i64,
    pub expires_at: i64,
    pub bump: u8,
}

impl SettlementEvidence {
    pub const LEN: usize = 8 + 32 + 32 + 32 + 1 + 1 + 32 + 32 + 32 + 32 + 8 + 8 + 1;
}

#[account]
pub struct SettlementConsumptionRecord {
    pub evidence: Pubkey,
    pub consumed_by_proposal: Pubkey,
    pub consumed_at: i64,
    pub bump: u8,
}

impl SettlementConsumptionRecord {
    pub const LEN: usize = 8 + 32 + 32 + 8 + 1;
}

#[account]
pub struct VoterWeightScopeRecord {
    pub realm: Pubkey,
    pub governing_token_mint: Pubkey,
    pub governing_token_owner: Pubkey,
    pub scope: VoterWeightScope,
    pub weight: u64,
    pub recorded_at_slot: u64,
    pub bump: u8,
}

impl VoterWeightScopeRecord {
    pub const LEN: usize = 8 + 32 + 32 + 32 + 1 + 8 + 8 + 1;
}

#[account]
pub struct Dao {
    pub authority: Pubkey,                    // 32
    pub dao_name: String,                     // 4 + 64
    pub governance_token: Pubkey,             // 32
    pub quorum_percentage: u8,                // 1
    pub governance_token_required: u64,       // 8
    pub reveal_window_seconds: i64,           // 8
    pub execution_delay_seconds: i64,         // 8
    pub voting_config: VotingConfig,          // 3 (DualChamber is largest variant)
    pub proposal_count: u64,                  // 8
    pub bump: u8,                             // 1
    pub migrated_from_realms: Option<Pubkey>, // 33
}

impl Dao {
    pub const LEN: usize = 8      // discriminator
        + 32               // authority
        + (4 + 64)         // dao_name
        + 32               // governance_token
        + 1                // quorum_percentage
        + 8                // governance_token_required
        + 8                // reveal_window_seconds
        + 8                // execution_delay_seconds
        + 3                // voting_config (DualChamber: 1 variant + 2×u8 = 3 bytes max)
        + 8                // proposal_count
        + 1                // bump
        + 33; // migrated_from_realms (Option<Pubkey>)
              // = 210
}

#[account]
pub struct Proposal {
    pub dao: Pubkey,                             // 32
    pub proposer: Pubkey,                        // 32
    pub proposal_id: u64,                        // 8
    pub title: String,                           // 4 + 128
    pub description: String,                     // 4 + 1024
    pub status: ProposalStatus,                  // 1
    pub voting_end: i64,                         // 8
    pub reveal_end: i64,                         // 8
    pub yes_capital: u64,                        // 8
    pub no_capital: u64,                         // 8
    pub yes_community: u64,                      // 8
    pub no_community: u64,                       // 8
    pub commit_count: u64,                       // 8
    pub reveal_count: u64,                       // 8
    pub treasury_action: Option<TreasuryAction>, // 1 + 74 = 75
    pub execution_unlocks_at: i64,               // 8
    pub is_executed: bool,                       // 1
    pub bump: u8,                                // 1
}

impl Proposal {
    // TreasuryAction: action_type(1) + amount_lamports(8) + recipient(32) + token_mint(1+32) = 74
    // Option<TreasuryAction> = 1 + 74 = 75
    pub const LEN: usize = 8          // discriminator
        + 32 + 32 + 8                 // dao, proposer, proposal_id
        + (4 + 128) + (4 + 1024)      // title, description
        + 1                           // status
        + 8 + 8                       // voting_end, reveal_end
        + 8 + 8 + 8 + 8               // yes/no capital, yes/no community
        + 8 + 8                       // commit_count, reveal_count
        + (1 + 74)                    // Option<TreasuryAction>
        + 8 + 1 + 1; // execution_unlocks_at, is_executed, bump
                     // = 1390
}

#[account]
pub struct VoterRecord {
    pub voter: Pubkey,                          // 32
    pub proposal: Pubkey,                       // 32
    pub commitment: [u8; 32],                   // 32
    pub capital_weight: u64,                    // 8   (own + delegated)
    pub community_weight: u64,                  // 8   (own + delegated)
    pub has_committed: bool,                    // 1
    pub has_revealed: bool,                     // 1
    pub voted_yes: bool,                        // 1
    pub bump: u8,                               // 1
    pub voter_reveal_authority: Option<Pubkey>, // 33
}

impl VoterRecord {
    pub const LEN: usize = 8 + 32 + 32 + 32 + 8 + 8 + 1 + 1 + 1 + 1 + 33; // = 157
}

#[account]
pub struct VoteDelegation {
    pub delegator: Pubkey,        // 32
    pub delegatee: Pubkey,        // 32
    pub proposal: Pubkey,         // 32
    pub delegated_capital: u64,   // 8
    pub delegated_community: u64, // 8
    pub is_used: bool,            // 1
    pub bump: u8,                 // 1
}

impl VoteDelegation {
    pub const LEN: usize = 8 + 32 + 32 + 32 + 8 + 8 + 1 + 1; // = 122
}

// Matches spl-governance-addin-api VoterWeightRecord layout exactly
#[account]
pub struct VoterWeightRecord {
    pub realm: Pubkey,                        // 32
    pub governing_token_mint: Pubkey,         // 32
    pub governing_token_owner: Pubkey,        // 32
    pub voter_weight: u64,                    // 8
    pub voter_weight_expiry: Option<u64>,     // 9
    pub weight_action: Option<u8>,            // 2
    pub weight_action_target: Option<Pubkey>, // 33
    pub reserved: [u8; 8],                    // 8
}

impl VoterWeightRecord {
    pub const LEN: usize = 8 + 32 + 32 + 32 + 8 + 9 + 2 + 33 + 8; // = 164
}

#[account]
pub struct ZkProofAnchor {
    pub dao: Pubkey,                     // 32
    pub proposal: Pubkey,                // 32
    pub recorded_by: Pubkey,             // 32
    pub layer: ZkProofLayer,             // 1
    pub proof_system: ZkProofSystem,     // 1
    pub proof_hash: [u8; 32],            // 32
    pub public_inputs_hash: [u8; 32],    // 32
    pub verification_key_hash: [u8; 32], // 32
    pub bundle_hash: [u8; 32],           // 32
    pub recorded_at: i64,                // 8
    pub bump: u8,                        // 1
}

impl ZkProofAnchor {
    pub const LEN: usize = 8 + 32 + 32 + 32 + 1 + 1 + 32 + 32 + 32 + 32 + 8 + 1; // 243
}

#[account]
pub struct ZkVerificationReceipt {
    pub dao: Pubkey,                           // 32
    pub proposal: Pubkey,                      // 32
    pub verified_by: Pubkey,                   // 32
    pub layer: ZkProofLayer,                   // 1
    pub proof_system: ZkProofSystem,           // 1
    pub verification_mode: ZkVerificationMode, // 1
    pub verifier_program: Option<Pubkey>,      // 33
    pub proof_hash: [u8; 32],                  // 32
    pub public_inputs_hash: [u8; 32],          // 32
    pub verification_key_hash: [u8; 32],       // 32
    pub bundle_hash: [u8; 32],                 // 32
    pub verified_at: i64,                      // 8
    pub bump: u8,                              // 1
}

impl ZkVerificationReceipt {
    pub const LEN: usize = 8 + 32 + 32 + 32 + 1 + 1 + 1 + 33 + 32 + 32 + 32 + 32 + 8 + 1; // 277
}

#[account]
pub struct ProposalZkPolicy {
    pub dao: Pubkey,              // 32
    pub proposal: Pubkey,         // 32
    pub configured_by: Pubkey,    // 32
    pub mode: ProposalZkMode,     // 1
    pub required_layers_mask: u8, // 1
    pub configured_at: i64,       // 8
    pub bump: u8,                 // 1
}

impl ProposalZkPolicy {
    pub const ALL_LAYERS_MASK: u8 = 0b0000_0111;
    pub const LEN: usize = 8 + 32 + 32 + 32 + 1 + 1 + 8 + 1; // 115
}

#[account]
pub struct ConfidentialPayoutPlan {
    pub dao: Pubkey,                         // 32
    pub proposal: Pubkey,                    // 32
    pub configured_by: Pubkey,               // 32
    pub payout_type: ConfidentialPayoutType, // 1
    pub asset_type: ConfidentialAssetType,   // 1
    pub settlement_recipient: Pubkey,        // 32
    pub token_mint: Option<Pubkey>,          // 33
    pub recipient_count: u16,                // 2
    pub total_amount: u64,                   // 8
    pub encrypted_manifest_uri: String,      // 4 + 256
    pub manifest_hash: [u8; 32],             // 32
    pub ciphertext_hash: [u8; 32],           // 32
    pub status: ConfidentialPayoutStatus,    // 1
    pub configured_at: i64,                  // 8
    pub funded_at: i64,                      // 8
    pub bump: u8,                            // 1
}

impl ConfidentialPayoutPlan {
    pub const MAX_URI_LEN: usize = 256;
    pub const LEN: usize =
        8 + 32 + 32 + 32 + 1 + 1 + 32 + 33 + 2 + 8 + (4 + 256) + 32 + 32 + 1 + 8 + 8 + 1; // 523
}

#[account]
pub struct RefheEnvelope {
    pub dao: Pubkey,                      // 32
    pub proposal: Pubkey,                 // 32
    pub payout_plan: Pubkey,              // 32
    pub configured_by: Pubkey,            // 32
    pub settled_by: Option<Pubkey>,       // 33
    pub model_uri: String,                // 4 + 256
    pub policy_hash: [u8; 32],            // 32
    pub input_ciphertext_hash: [u8; 32],  // 32
    pub evaluation_key_hash: [u8; 32],    // 32
    pub result_ciphertext_hash: [u8; 32], // 32
    pub result_commitment_hash: [u8; 32], // 32
    pub proof_bundle_hash: [u8; 32],      // 32
    pub verifier_program: Option<Pubkey>, // 33
    pub status: RefheEnvelopeStatus,      // 1
    pub configured_at: i64,               // 8
    pub settled_at: i64,                  // 8
    pub bump: u8,                         // 1
}

impl RefheEnvelope {
    pub const MAX_URI_LEN: usize = 256;
    pub const LEN: usize =
        8 + 32 + 32 + 32 + 32 + 33 + (4 + 256) + 32 + 32 + 32 + 32 + 32 + 32 + 33 + 1 + 8 + 8 + 1; // 673
}

#[account]
pub struct MagicBlockPrivatePaymentCorridor {
    pub dao: Pubkey,                        // 32
    pub proposal: Pubkey,                   // 32
    pub payout_plan: Pubkey,                // 32
    pub configured_by: Pubkey,              // 32
    pub settled_by: Option<Pubkey>,         // 33
    pub api_base_url: String,               // 4 + 128
    pub cluster: String,                    // 4 + 64
    pub owner_wallet: Pubkey,               // 32
    pub settlement_wallet: Pubkey,          // 32
    pub token_mint: Pubkey,                 // 32
    pub validator: Option<Pubkey>,          // 33
    pub transfer_queue: Option<Pubkey>,     // 33
    pub route_hash: [u8; 32],               // 32
    pub deposit_amount: u64,                // 8
    pub private_transfer_amount: u64,       // 8
    pub withdrawal_amount: u64,             // 8
    pub deposit_tx_signature: String,       // 4 + 128
    pub transfer_tx_signature: String,      // 4 + 128
    pub withdraw_tx_signature: String,      // 4 + 128
    pub status: MagicBlockSettlementStatus, // 1
    pub configured_at: i64,                 // 8
    pub settled_at: i64,                    // 8
    pub bump: u8,                           // 1
}

impl MagicBlockPrivatePaymentCorridor {
    pub const MAX_API_BASE_LEN: usize = 128;
    pub const MAX_CLUSTER_LEN: usize = 64;
    pub const MAX_SIGNATURE_LEN: usize = 128;
    pub const LEN: usize = 8
        + 32
        + 32
        + 32
        + 32
        + 33
        + (4 + 128)
        + (4 + 64)
        + 32
        + 32
        + 32
        + 33
        + 33
        + 32
        + 8
        + 8
        + 8
        + (4 + 128)
        + (4 + 128)
        + (4 + 128)
        + 1
        + 8
        + 8
        + 1; // 1001
}

// ── Types ─────────────────────────────────────────────────────────────────────

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum EnforcementMode {
    LegacyAllowed,
    CompatibilityRequired,
    StrictRequired,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum FeaturePolicy {
    LegacyAllowed,
    ThresholdAttestedRequired,
    StrictRequired,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum CancelPolicy {
    LegacyAllowed,
    NoCancelAfterParticipation,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum QuorumPolicyV3 {
    LegacyRevealParticipation,
    TokenSupplyParticipation,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum RevealRebatePolicyV3 {
    Disabled,
    DedicatedVaultRequired,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum VerificationKind {
    ThresholdAttestation,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum VerificationStatus {
    Pending,
    Verified,
    Rejected,
    Revoked,
    Expired,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum SettlementEvidenceKind {
    RefheAttested,
    MagicBlockAttested,
    VerifierCpiReceipt,
    ThresholdAttestation,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum EvidenceStatus {
    Pending,
    Verified,
    Rejected,
    Revoked,
    Expired,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum VoterWeightScope {
    CommunityTokenWeighted,
    CommunityQuadratic,
    CapitalWeighted,
    DualChamberCommunityLeg,
    DualChamberCapitalLeg,
}

impl VoterWeightScope {
    pub fn seed_byte(&self) -> u8 {
        match self {
            Self::CommunityTokenWeighted => 1,
            Self::CommunityQuadratic => 2,
            Self::CapitalWeighted => 3,
            Self::DualChamberCommunityLeg => 4,
            Self::DualChamberCapitalLeg => 5,
        }
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum VotingConfig {
    TokenWeighted,
    Quadratic,
    DualChamber {
        capital_threshold: u8,   // % of token-weighted YES required (1–100)
        community_threshold: u8, // % of quadratic YES required      (1–100)
    },
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum ProposalStatus {
    Voting,
    Passed,
    Failed,
    Cancelled,
    Vetoed,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct TreasuryAction {
    pub action_type: TreasuryActionType,
    pub amount_lamports: u64,
    pub recipient: Pubkey,
    pub token_mint: Option<Pubkey>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub enum TreasuryActionType {
    SendSol,
    SendToken,
    CustomCPI,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum ZkProofLayer {
    Vote,
    Delegation,
    Tally,
}

impl ZkProofLayer {
    pub fn seed_byte(&self) -> u8 {
        match self {
            Self::Vote => 1,
            Self::Delegation => 2,
            Self::Tally => 3,
        }
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum ZkProofSystem {
    Groth16,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum ZkVerificationMode {
    Companion,
    Parallel,
    ZkEnforced,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum ProposalZkMode {
    Companion,
    Parallel,
    ZkEnforced,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum ConfidentialPayoutType {
    Salary,
    Bonus,
}

impl ConfidentialPayoutType {
    pub fn seed_byte(&self) -> u8 {
        match self {
            Self::Salary => 1,
            Self::Bonus => 2,
        }
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum ConfidentialAssetType {
    Sol,
    Token,
}

impl ConfidentialAssetType {
    pub fn seed_byte(&self) -> u8 {
        match self {
            Self::Sol => 1,
            Self::Token => 2,
        }
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum ConfidentialPayoutStatus {
    Configured,
    Funded,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum RefheEnvelopeStatus {
    Configured,
    Settled,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum MagicBlockSettlementStatus {
    Configured,
    Settled,
}

// ── Events ────────────────────────────────────────────────────────────────────

#[event]
pub struct DaoCreated {
    pub dao: Pubkey,
    pub name: String,
    pub authority: Pubkey,
}

#[event]
pub struct DaoMigratedFromRealms {
    pub dao: Pubkey,
    pub name: String,
    pub realms_governance: Pubkey,
    pub governance_token: Pubkey,
}

#[event]
pub struct ProposalCreated {
    pub dao: Pubkey,
    pub proposal: Pubkey,
    pub proposal_id: u64,
    pub title: String,
    pub voting_end: i64,
    pub reveal_end: i64,
}

#[event]
pub struct ProposalCancelled {
    pub proposal: Pubkey,
    pub cancelled_by: Pubkey,
}

#[event]
pub struct ProposalVetoed {
    pub proposal: Pubkey,
    pub vetoed_by: Pubkey,
}

#[event]
pub struct VoteDelegated {
    pub proposal: Pubkey,
    pub delegator: Pubkey,
    pub delegatee: Pubkey,
    pub delegated_weight: u64,
}

#[event]
pub struct VoteCommitted {
    pub proposal: Pubkey,
    pub voter: Pubkey,
    pub commit_count: u64,
}

#[event]
pub struct VoteRevealed {
    pub proposal: Pubkey,
    pub voter: Pubkey,
    pub reveal_count: u64,
}

#[event]
pub struct ProposalFinalized {
    pub proposal: Pubkey,
    pub yes_capital: u64,
    pub no_capital: u64,
    pub yes_community: u64,
    pub no_community: u64,
    pub passed: bool,
    pub quorum_met: bool,
    pub commit_count: u64,
    pub reveal_count: u64,
    pub execution_unlocks_at: i64,
}

#[event]
pub struct TreasuryDeposit {
    pub dao: Pubkey,
    pub from: Pubkey,
    pub amount: u64,
}

#[event]
pub struct TreasuryExecuted {
    pub proposal: Pubkey,
    pub amount: u64,
    pub recipient: Pubkey,
}

#[event]
pub struct ZkProofAnchored {
    pub dao: Pubkey,
    pub proposal: Pubkey,
    pub recorded_by: Pubkey,
    pub layer: ZkProofLayer,
    pub proof_system: ZkProofSystem,
    pub proof_hash: [u8; 32],
    pub public_inputs_hash: [u8; 32],
    pub verification_key_hash: [u8; 32],
    pub bundle_hash: [u8; 32],
}

#[event]
pub struct ZkProofVerified {
    pub dao: Pubkey,
    pub proposal: Pubkey,
    pub verified_by: Pubkey,
    pub layer: ZkProofLayer,
    pub proof_system: ZkProofSystem,
    pub verification_mode: ZkVerificationMode,
    pub verifier_program: Option<Pubkey>,
    pub proof_hash: [u8; 32],
    pub public_inputs_hash: [u8; 32],
    pub verification_key_hash: [u8; 32],
    pub bundle_hash: [u8; 32],
}

#[event]
pub struct ProposalZkModeConfigured {
    pub dao: Pubkey,
    pub proposal: Pubkey,
    pub configured_by: Pubkey,
    pub mode: ProposalZkMode,
    pub required_layers_mask: u8,
}

#[event]
pub struct ConfidentialPayoutConfigured {
    pub dao: Pubkey,
    pub proposal: Pubkey,
    pub configured_by: Pubkey,
    pub payout_type: ConfidentialPayoutType,
    pub asset_type: ConfidentialAssetType,
    pub settlement_recipient: Pubkey,
    pub token_mint: Option<Pubkey>,
    pub recipient_count: u16,
    pub total_amount: u64,
    pub encrypted_manifest_uri: String,
    pub manifest_hash: [u8; 32],
    pub ciphertext_hash: [u8; 32],
}

#[event]
pub struct ConfidentialPayoutExecuted {
    pub proposal: Pubkey,
    pub settlement_recipient: Pubkey,
    pub asset_type: ConfidentialAssetType,
    pub token_mint: Option<Pubkey>,
    pub recipient_count: u16,
    pub total_amount: u64,
    pub funded_at: i64,
}

#[event]
pub struct RefheEnvelopeConfigured {
    pub dao: Pubkey,
    pub proposal: Pubkey,
    pub payout_plan: Pubkey,
    pub configured_by: Pubkey,
    pub model_uri: String,
    pub policy_hash: [u8; 32],
    pub input_ciphertext_hash: [u8; 32],
    pub evaluation_key_hash: [u8; 32],
}

#[event]
pub struct RefheEnvelopeSettled {
    pub dao: Pubkey,
    pub proposal: Pubkey,
    pub payout_plan: Pubkey,
    pub settled_by: Pubkey,
    pub verifier_program: Pubkey,
    pub result_ciphertext_hash: [u8; 32],
    pub result_commitment_hash: [u8; 32],
    pub proof_bundle_hash: [u8; 32],
    pub settled_at: i64,
}

#[event]
pub struct MagicBlockPrivatePaymentCorridorConfigured {
    pub dao: Pubkey,
    pub proposal: Pubkey,
    pub payout_plan: Pubkey,
    pub configured_by: Pubkey,
    pub api_base_url: String,
    pub cluster: String,
    pub owner_wallet: Pubkey,
    pub settlement_wallet: Pubkey,
    pub token_mint: Pubkey,
    pub validator: Option<Pubkey>,
    pub route_hash: [u8; 32],
    pub deposit_amount: u64,
    pub private_transfer_amount: u64,
    pub withdrawal_amount: u64,
}

#[event]
pub struct MagicBlockPrivatePaymentCorridorSettled {
    pub dao: Pubkey,
    pub proposal: Pubkey,
    pub payout_plan: Pubkey,
    pub settled_by: Pubkey,
    pub validator: Pubkey,
    pub transfer_queue: Pubkey,
    pub deposit_tx_signature: String,
    pub transfer_tx_signature: String,
    pub withdraw_tx_signature: String,
    pub settled_at: i64,
}

#[event]
pub struct DaoSecurityPolicyInitialized {
    pub dao: Pubkey,
    pub authority: Pubkey,
    pub mode: EnforcementMode,
    pub zk_policy: FeaturePolicy,
    pub settlement_policy: FeaturePolicy,
    pub cancel_policy: CancelPolicy,
    pub proof_threshold: u8,
    pub settlement_threshold: u8,
    pub created_at: i64,
}

#[event]
pub struct DaoSecurityPolicyUpdatedV2 {
    pub dao: Pubkey,
    pub authority: Pubkey,
    pub mode: EnforcementMode,
    pub zk_policy: FeaturePolicy,
    pub settlement_policy: FeaturePolicy,
    pub cancel_policy: CancelPolicy,
    pub proof_threshold: u8,
    pub settlement_threshold: u8,
    pub updated_at: i64,
}

#[event]
pub struct DaoGovernancePolicyInitializedV3 {
    pub dao: Pubkey,
    pub authority: Pubkey,
    pub quorum_policy: QuorumPolicyV3,
    pub reveal_rebate_policy: RevealRebatePolicyV3,
    pub reveal_rebate_lamports: u64,
    pub created_at: i64,
}

#[event]
pub struct DaoGovernancePolicyUpdatedV3 {
    pub dao: Pubkey,
    pub authority: Pubkey,
    pub quorum_policy: QuorumPolicyV3,
    pub reveal_rebate_policy: RevealRebatePolicyV3,
    pub reveal_rebate_lamports: u64,
    pub updated_at: i64,
}

#[event]
pub struct DaoSettlementPolicyInitializedV3 {
    pub dao: Pubkey,
    pub authority: Pubkey,
    pub min_evidence_age_seconds: i64,
    pub max_payout_amount: u64,
    pub require_refhe_settlement: bool,
    pub require_magicblock_settlement: bool,
    pub created_at: i64,
}

#[event]
pub struct DaoSettlementPolicyUpdatedV3 {
    pub dao: Pubkey,
    pub authority: Pubkey,
    pub min_evidence_age_seconds: i64,
    pub max_payout_amount: u64,
    pub require_refhe_settlement: bool,
    pub require_magicblock_settlement: bool,
    pub updated_at: i64,
}

#[event]
pub struct ProposalGovernancePolicySnapshottedV3 {
    pub dao: Pubkey,
    pub proposal: Pubkey,
    pub quorum_policy: QuorumPolicyV3,
    pub reveal_rebate_policy: RevealRebatePolicyV3,
    pub reveal_rebate_lamports: u64,
    pub eligible_capital: u64,
    pub object_version: u8,
}

#[event]
pub struct ProposalSettlementPolicySnapshottedV3 {
    pub dao: Pubkey,
    pub proposal: Pubkey,
    pub payout_plan: Pubkey,
    pub min_evidence_age_seconds: i64,
    pub max_payout_amount: u64,
    pub require_refhe_settlement: bool,
    pub require_magicblock_settlement: bool,
    pub object_version: u8,
}

#[event]
pub struct ProposalExecutionPolicySnapshotted {
    pub dao: Pubkey,
    pub proposal: Pubkey,
    pub created_under_mode: EnforcementMode,
    pub zk_policy: FeaturePolicy,
    pub settlement_policy: FeaturePolicy,
    pub cancel_policy: CancelPolicy,
    pub object_version: u8,
}

#[event]
pub struct RevealRebateVaultFundedV3 {
    pub dao: Pubkey,
    pub funder: Pubkey,
    pub amount: u64,
    pub vault: Pubkey,
}

#[event]
pub struct ProposalCancelledV2 {
    pub proposal: Pubkey,
    pub cancelled_by: Pubkey,
    pub policy_mode: EnforcementMode,
    pub cancel_policy: CancelPolicy,
}

#[event]
pub struct VoteRevealedV3 {
    pub proposal: Pubkey,
    pub voter: Pubkey,
    pub reveal_count: u64,
    pub rebate_issued: u64,
    pub reveal_rebate_policy: RevealRebatePolicyV3,
}

#[event]
pub struct ProposalFinalizedV3 {
    pub proposal: Pubkey,
    pub yes_capital: u64,
    pub no_capital: u64,
    pub yes_community: u64,
    pub no_community: u64,
    pub passed: bool,
    pub quorum_met: bool,
    pub commit_count: u64,
    pub reveal_count: u64,
    pub eligible_capital: u64,
    pub quorum_policy: QuorumPolicyV3,
    pub execution_unlocks_at: i64,
}

#[event]
pub struct ConfidentialPayoutExecutedV3 {
    pub proposal: Pubkey,
    pub settlement_recipient: Pubkey,
    pub asset_type: ConfidentialAssetType,
    pub token_mint: Option<Pubkey>,
    pub recipient_count: u16,
    pub total_amount: u64,
    pub funded_at: i64,
    pub min_evidence_age_seconds: i64,
    pub max_payout_amount: u64,
    pub require_refhe_settlement: bool,
    pub require_magicblock_settlement: bool,
}

#[event]
pub struct ProofVerificationRecordedV2 {
    pub dao: Pubkey,
    pub proposal: Pubkey,
    pub verification_kind: VerificationKind,
    pub status: VerificationStatus,
    pub payload_hash: [u8; 32],
    pub proof_hash: [u8; 32],
    pub expires_at: i64,
}

#[event]
pub struct SettlementEvidenceRecordedV2 {
    pub dao: Pubkey,
    pub proposal: Pubkey,
    pub payout_plan: Pubkey,
    pub kind: SettlementEvidenceKind,
    pub status: EvidenceStatus,
    pub settlement_id: [u8; 32],
    pub evidence_hash: [u8; 32],
    pub expires_at: i64,
}

#[event]
pub struct SettlementEvidenceConsumedV2 {
    pub evidence: Pubkey,
    pub proposal: Pubkey,
    pub payout_plan: Pubkey,
    pub consumed_at: i64,
}

#[event]
pub struct VoterWeightScopeRecorded {
    pub realm: Pubkey,
    pub governing_token_mint: Pubkey,
    pub governing_token_owner: Pubkey,
    pub scope: VoterWeightScope,
    pub weight: u64,
}

// ── Errors ────────────────────────────────────────────────────────────────────

#[error_code]
pub enum Error {
    #[msg("DAO name max 64 chars")]
    NameTooLong,
    #[msg("Quorum must be 1–100")]
    InvalidQuorum,
    #[msg("Reveal window must be at least 5 seconds")]
    RevealWindowTooShort,
    #[msg("Voting duration must be at least 5 seconds")]
    VotingDurationTooShort,
    #[msg("Execution delay must be non-negative")]
    InvalidExecutionDelay,
    #[msg("Title max 128 chars")]
    TitleTooLong,
    #[msg("Description max 1024 chars")]
    DescriptionTooLong,
    #[msg("Voting is not open")]
    VotingNotOpen,
    #[msg("Voting period has closed")]
    VotingClosed,
    #[msg("Already committed a vote")]
    AlreadyCommitted,
    #[msg("Reveal phase has not started yet")]
    RevealTooEarly,
    #[msg("Reveal window has closed")]
    RevealClosed,
    #[msg("Reveal phase is still open")]
    RevealStillOpen,
    #[msg("No commitment found for this voter")]
    NotCommitted,
    #[msg("Vote already revealed")]
    AlreadyRevealed,
    #[msg("Commitment hash does not match")]
    CommitmentMismatch,
    #[msg("Proposal has already been finalized")]
    AlreadyFinalized,
    #[msg("Not enough governance tokens")]
    InsufficientTokens,
    #[msg("Not authorized to reveal this vote")]
    NotAuthorizedToReveal,
    #[msg("Threshold must be 1–100")]
    InvalidThreshold,
    #[msg("Arithmetic overflow")]
    Overflow,
    #[msg("Can only cancel voting proposals before any commit or reveal starts")]
    ProposalNotCancellable,
    #[msg("Proposal did not pass")]
    ProposalNotPassed,
    #[msg("Treasury action already executed")]
    AlreadyExecuted,
    #[msg("Execution timelock has not yet expired")]
    ExecutionTimelockActive,
    #[msg("Veto window has expired — timelock has passed")]
    VetoWindowExpired,
    #[msg("This delegation has already been used")]
    DelegationAlreadyUsed,
    #[msg("Caller is not the designated delegatee")]
    NotDelegatee,
    #[msg("Delegation belongs to a different proposal")]
    WrongProposal,
    #[msg("Delegatee must be a real wallet and cannot self-delegate")]
    InvalidDelegatee,
    #[msg("Delegators cannot delegate to themselves")]
    SelfDelegationNotAllowed,
    #[msg("Treasury action payload is invalid")]
    InvalidTreasuryAction,
    #[msg("SendToken action requires token_mint")]
    TokenMintRequired,
    #[msg("Executor must use action recipient")]
    TreasuryRecipientMismatch,
    #[msg("Treasury token account must be treasury-owned")]
    InvalidTreasuryTokenAuthority,
    #[msg("Provided token mint does not match action")]
    InvalidTokenMint,
    #[msg("Token program account does not match the supplied mint/accounts")]
    InvalidTokenProgram,
    #[msg("Recipient token owner does not match action")]
    RecipientOwnerMismatch,
    #[msg("Treasury token source and recipient token destination must differ")]
    DuplicateTokenAccounts,
    #[msg("Token account is invalid or owned by wrong program")]
    InvalidTokenAccount,
    #[msg("Governing mint must match DAO governance token")]
    GoverningMintMismatch,
    #[msg("Direct voting and delegation cannot overlap for the same proposal")]
    DelegationOverlap,
    #[msg("Delegation is blocked because this wallet already committed directly")]
    DirectVoteAlreadyCommitted,
    #[msg("CustomCPI actions are reserved and not executable in the current release")]
    UnsupportedTreasuryAction,
    #[msg("Only the DAO authority or proposal proposer may anchor zk proof material")]
    UnauthorizedZkAnchor,
    #[msg("Only the DAO authority may record zk_enforced receipts; proposers may only record parallel receipts")]
    UnauthorizedZkVerifier,
    #[msg("ZK proof anchor hashes must be non-zero")]
    InvalidZkArtifactHash,
    #[msg("Phase A only allows the parallel on-chain verification mode")]
    InvalidZkVerificationMode,
    #[msg("The provided zk proof anchor does not match the expected proposal-bound layer")]
    ZkProofAnchorMismatch,
    #[msg("Only the DAO authority may enable zk_enforced mode; proposers may only configure non-enforced zk modes")]
    UnauthorizedZkModeConfig,
    #[msg("Proposal zk mode can only be configured before commits or reveals begin")]
    ProposalZkModeLocked,
    #[msg("Required zk verification receipt is missing")]
    ZkVerificationReceiptMissing,
    #[msg("Provided zk verification receipt does not match the expected proposal-bound layer")]
    ZkVerificationReceiptMismatch,
    #[msg("Selected proposal is not configured for zk_enforced finalization")]
    ProposalNotZkEnforced,
    #[msg("Once a proposal is locked to zk_enforced mode it cannot be downgraded or reconfigured")]
    ProposalZkModeImmutable,
    #[msg("This proposal requires zk_enforced verification receipts, not only parallel receipts")]
    InsufficientZkVerificationMode,
    #[msg("zk_enforced receipts must identify the verifier program boundary")]
    ZkVerifierProgramRequired,
    #[msg("Only the DAO authority or proposal proposer may configure confidential payout plans")]
    UnauthorizedConfidentialPayoutOperator,
    #[msg("Confidential payout plans can only be configured before commits or reveals begin")]
    ConfidentialPayoutPlanLocked,
    #[msg("Confidential payout plan does not match the expected proposal-bound PDA")]
    ConfidentialPayoutPlanMismatch,
    #[msg("Confidential payout plan is invalid")]
    InvalidConfidentialPayoutPlan,
    #[msg(
        "Confidential payout encrypted manifest URI must be non-empty and at most 256 characters"
    )]
    ConfidentialManifestUriTooLong,
    #[msg("This proposal already executed its confidential payout batch")]
    ConfidentialPayoutAlreadyFunded,
    #[msg("Token payout batches require a token mint")]
    ConfidentialPayoutTokenMintRequired,
    #[msg("Confidential payout plans cannot coexist with a direct treasury action on the same proposal")]
    ConfidentialPayoutConflictsWithTreasuryAction,
    #[msg("This proposal must execute through the confidential payout path rather than the standard treasury execution path")]
    UseConfidentialPayoutExecution,
    #[msg("Only the DAO authority may settle REFHE envelopes; proposers may only configure them before voting starts")]
    UnauthorizedRefheOperator,
    #[msg("REFHE envelope is invalid")]
    InvalidRefheEnvelope,
    #[msg("REFHE envelope does not match the expected proposal-bound payout plan")]
    RefheEnvelopeMismatch,
    #[msg("REFHE envelope is locked and cannot be changed in the current lifecycle state")]
    RefheEnvelopeLocked,
    #[msg("REFHE settlement is required before executing this confidential payout plan")]
    RefheSettlementRequired,
    #[msg("REFHE settlement must identify the verifier program boundary")]
    RefheVerifierProgramRequired,
    #[msg("Only the DAO authority may settle MagicBlock private payment corridors; proposers may only configure them before voting starts")]
    UnauthorizedMagicBlockOperator,
    #[msg("MagicBlock private payment corridor is invalid")]
    InvalidMagicBlockCorridor,
    #[msg("MagicBlock private payment corridors are locked in the current lifecycle state")]
    MagicBlockCorridorLocked,
    #[msg("MagicBlock private payment corridor does not match the expected proposal-bound payout plan")]
    MagicBlockCorridorMismatch,
    #[msg("MagicBlock private payment corridor requires a token payout mint")]
    MagicBlockTokenMintRequired,
    #[msg("MagicBlock private payment corridor settlement is required before executing this confidential payout plan")]
    MagicBlockSettlementRequired,
    #[msg("MagicBlock API base URL must be non-empty and at most 128 characters")]
    MagicBlockApiBaseUrlTooLong,
    #[msg("MagicBlock cluster selector must be non-empty and at most 64 characters")]
    MagicBlockClusterTooLong,
    #[msg("DAO security policy is invalid")]
    InvalidSecurityPolicy,
    #[msg("DAO security policy was already initialized with a different configuration")]
    SecurityPolicyAlreadyInitialized,
    #[msg("DAO security policy updates cannot roll back to weaker enforcement")]
    PolicyRollbackNotAllowed,
    #[msg("DAO governance policy v3 is invalid")]
    InvalidGovernancePolicy,
    #[msg("DAO governance policy v3 was already initialized with a different configuration")]
    GovernancePolicyAlreadyInitialized,
    #[msg("DAO governance policy v3 does not match the expected DAO or authority")]
    GovernancePolicyMismatch,
    #[msg("Proposal governance snapshot v3 does not match the proposal or DAO")]
    GovernancePolicySnapshotMismatch,
    #[msg("Proposal governance snapshot v3 was already recorded under a different policy")]
    GovernancePolicySnapshotAlreadyRecorded,
    #[msg("DAO settlement policy v3 is invalid")]
    InvalidSettlementPolicyV3,
    #[msg("DAO settlement policy v3 was already initialized with a different configuration")]
    SettlementPolicyAlreadyInitialized,
    #[msg("DAO settlement policy updates cannot roll back to weaker execution requirements")]
    SettlementPolicyRollbackNotAllowed,
    #[msg("DAO settlement policy v3 does not match the expected DAO or authority")]
    SettlementPolicyMismatch,
    #[msg("Proposal settlement snapshot v3 does not match the proposal, DAO, or payout plan")]
    SettlementPolicySnapshotMismatch,
    #[msg("Proposal settlement snapshot v3 was already recorded under a different policy")]
    SettlementPolicySnapshotAlreadyRecorded,
    #[msg("Settlement evidence is still too fresh for V3 execution")]
    SettlementEvidenceTooFresh,
    #[msg("Confidential payout amount exceeds the V3 settlement cap")]
    PayoutAmountExceedsSettlementCap,
    #[msg("Reveal rebate configuration is invalid for V3 governance mode")]
    InvalidRevealRebateConfig,
    #[msg("Reveal rebate vault PDA does not match the DAO v3 governance configuration")]
    RevealRebateVaultMismatch,
    #[msg("DAO security policy does not match the expected DAO")]
    SecurityPolicyMismatch,
    #[msg("DAO security policy is emergency-disabled")]
    SecurityPolicyDisabled,
    #[msg("This instruction requires a strict or threshold-attested policy")]
    StrictPolicyRequired,
    #[msg("Required attestor threshold was not met by transaction signers")]
    AttestationThresholdNotMet,
    #[msg("Proposal policy snapshot does not match the proposal or DAO")]
    PolicySnapshotMismatch,
    #[msg("Proposal policy snapshot was already recorded under a different policy")]
    PolicySnapshotAlreadyRecorded,
    #[msg("Proof verification companion account does not match the proposal or DAO")]
    ProofVerificationMismatch,
    #[msg("Proof verification was already recorded with a different strict payload")]
    ProofVerificationAlreadyRecorded,
    #[msg("Proof verification is not in verified status")]
    ProofVerificationNotVerified,
    #[msg("Proof verification is stale or expired")]
    StaleProofVerification,
    #[msg("Proof payload hash does not match canonical executable payload")]
    PayloadHashMismatch,
    #[msg("Verification kind is not supported in this release")]
    UnsupportedVerificationKind,
    #[msg("Settlement evidence is invalid")]
    InvalidSettlementEvidence,
    #[msg("Settlement evidence does not match the payout plan, proposal, or DAO")]
    SettlementEvidenceMismatch,
    #[msg("Settlement evidence was already recorded with different strict evidence")]
    SettlementEvidenceAlreadyRecorded,
    #[msg("Settlement evidence is not verified")]
    SettlementEvidenceNotVerified,
    #[msg("Settlement evidence is stale or not yet valid")]
    StaleSettlementEvidence,
    #[msg("Proposal governance snapshot requires a non-zero eligible capital supply")]
    InvalidGovernanceSnapshot,
}
