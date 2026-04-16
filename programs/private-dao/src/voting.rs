use anchor_lang::prelude::{Clock, Context, Pubkey, Rent, Result};

use crate::*;
use crate::utils::*;

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

pub fn veto_proposal(ctx: Context<VetoProposal>) -> Result<()> {
    let now = Clock::get()?.unix_timestamp;
    let p = &mut ctx.accounts.proposal;

    require!(p.status == ProposalStatus::Passed, Error::ProposalNotPassed);
    require!(!p.is_executed, Error::AlreadyExecuted);
    require!(now < p.execution_unlocks_at, Error::VetoWindowExpired);

    p.status = ProposalStatus::Vetoed;

    emit!(ProposalVetoed {
        proposal: p.key(),
        vetoed_by: ctx.accounts.authority.key(),
    });
    Ok(())
}

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
        require!(raw >= dao.governance_token_required, Error::InsufficientTokens);
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
        require!(raw >= dao.governance_token_required, Error::InsufficientTokens);
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

pub fn finalize_proposal(ctx: Context<FinalizeProposal>) -> Result<()> {
    let now = Clock::get()?.unix_timestamp;
    require!(now >= ctx.accounts.proposal.reveal_end, Error::RevealStillOpen);
    require!(
        ctx.accounts.proposal.status == ProposalStatus::Voting,
        Error::AlreadyFinalized
    );
    finalize_proposal_state(&ctx.accounts.dao, &mut ctx.accounts.proposal, now)
}

pub fn finalize_proposal_v3(ctx: Context<FinalizeProposalV3>) -> Result<()> {
    let now = Clock::get()?.unix_timestamp;
    require!(now >= ctx.accounts.proposal.reveal_end, Error::RevealStillOpen);
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
