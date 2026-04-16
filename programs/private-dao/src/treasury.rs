use anchor_lang::prelude::{Clock, Context, Pubkey, Result};
use anchor_lang::system_program::{transfer, Transfer};
use anchor_spl::token_interface::{self as token_interface, Transfer as TokenTransfer};

use crate::*;
use crate::utils::*;

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

pub fn execute_proposal(ctx: Context<ExecuteProposal>) -> Result<()> {
    let now = Clock::get()?.unix_timestamp;
    let p = &mut ctx.accounts.proposal;

    require!(p.status == ProposalStatus::Passed, Error::ProposalNotPassed);
    require!(!p.is_executed, Error::AlreadyExecuted);
    require!(now >= p.execution_unlocks_at, Error::ExecutionTimelockActive);
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
    require!(now >= p.execution_unlocks_at, Error::ExecutionTimelockActive);
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
        let mut data: &[u8] = &ctx.accounts.magicblock_private_payment_corridor.data.borrow();
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
    require!(now >= p.execution_unlocks_at, Error::ExecutionTimelockActive);
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
    require!(now >= p.execution_unlocks_at, Error::ExecutionTimelockActive);
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
        let mut data: &[u8] = &ctx.accounts.magicblock_private_payment_corridor.data.borrow();
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
