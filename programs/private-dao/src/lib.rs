use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};
use anchor_spl::token::{self, Token, TokenAccount, Mint, Transfer as TokenTransfer};
use sha2::{Sha256, Digest};

declare_id!("DTFXjbcv2dFQkEFvBhgTUj1dNDgPRgRCyBa8yeVz8wZs");

// ─────────────────────────────────────────────────────────────────────────────
//  PrivateDAO — Commit-reveal governance for Solana
//  Solana Graveyard Hackathon 2026
//
//  The problem: every vote on Realms is visible the moment it's cast.
//  That enables three attacks: vote buying, whale intimidation, treasury MEV.
//
//  The fix — three-phase commit-reveal:
//    Phase 1 COMMIT  → voter submits sha256(vote ‖ salt ‖ pubkey)
//                      tally shows 0/0 throughout the entire voting period
//    Phase 2 REVEAL  → voter proves (vote, salt), tally updates
//    Phase 3 EXECUTE → after timelock delay, treasury action fires
//
//  Voting modes:
//    TokenWeighted → weight = raw token balance
//    Quadratic     → weight = √(token balance)   anti-whale, fair
//    DualChamber   → capital chamber (token-weighted) AND community chamber
//                    (quadratic) both must clear their threshold independently.
//                    Whales need community support. Community needs capital buy-in.
//
//  Original features not found on any other Solana DAO tool:
//    Private delegation  — delegator grants weight to delegatee for one proposal.
//                          The vote stays hidden; even the delegatee chooses it.
//    Keeper auto-reveal  — voter authorizes a keeper at commit time.
//                          Keeper submits reveal if voter forgets.
//                          Keeper earns the SOL rebate. Vote unchanged.
//    Timelock + veto     — passed proposals wait execution_delay_seconds.
//                          DAO authority can veto during the veto window.
//                          Mirrors Compound/Aave security model on Solana.
//    Cancel proposal     — authority cancels an open proposal immediately.
//    Realms plugin       — spl-governance-addin-api VoterWeightRecord layout.
//    migrate_from_realms — mirror a Realms DAO into PrivateDAO in one TX.
// ─────────────────────────────────────────────────────────────────────────────

pub const REVEAL_REBATE_LAMPORTS: u64 = 1_000_000; // 0.001 SOL per reveal
pub const DEFAULT_EXECUTION_DELAY: i64 = 86_400;   // 24-hour timelock default
pub const MIN_REVEAL_WINDOW_SECONDS: i64 = 5;
pub const MIN_VOTING_DURATION_SECONDS: i64 = 5;

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
        require!(dao_name.len() <= 64,          Error::NameTooLong);
        require!(quorum_percentage > 0 && quorum_percentage <= 100, Error::InvalidQuorum);
        require!(
            reveal_window_seconds >= MIN_REVEAL_WINDOW_SECONDS,
            Error::RevealWindowTooShort
        );
        require!(execution_delay_seconds >= 0, Error::InvalidExecutionDelay);
        validate_voting_config(&voting_config)?;

        let dao = &mut ctx.accounts.dao;
        dao.authority                 = ctx.accounts.authority.key();
        dao.dao_name                  = dao_name.clone();
        dao.governance_token          = ctx.accounts.governance_token.key();
        dao.quorum_percentage         = quorum_percentage;
        dao.governance_token_required = governance_token_required;
        dao.reveal_window_seconds     = reveal_window_seconds;
        dao.execution_delay_seconds   = execution_delay_seconds;
        dao.voting_config             = voting_config;
        dao.proposal_count            = 0;
        dao.bump                      = ctx.bumps.dao;
        dao.migrated_from_realms      = None;

        emit!(DaoCreated { dao: dao.key(), name: dao_name, authority: dao.authority });
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
        require!(dao_name.len() <= 64,          Error::NameTooLong);
        require!(quorum_percentage > 0 && quorum_percentage <= 100, Error::InvalidQuorum);
        require!(
            reveal_window_seconds >= MIN_REVEAL_WINDOW_SECONDS,
            Error::RevealWindowTooShort
        );
        require!(execution_delay_seconds >= 0, Error::InvalidExecutionDelay);
        validate_voting_config(&voting_config)?;

        let dao = &mut ctx.accounts.dao;
        dao.authority                 = ctx.accounts.authority.key();
        dao.dao_name                  = dao_name.clone();
        dao.governance_token          = ctx.accounts.governance_token.key();
        dao.quorum_percentage         = quorum_percentage;
        dao.governance_token_required = 0;
        dao.reveal_window_seconds     = reveal_window_seconds;
        dao.execution_delay_seconds   = execution_delay_seconds;
        dao.voting_config             = voting_config;
        dao.proposal_count            = 0;
        dao.bump                      = ctx.bumps.dao;
        dao.migrated_from_realms      = Some(realms_governance);

        emit!(DaoMigratedFromRealms {
            dao: dao.key(), name: dao_name,
            realms_governance, governance_token: dao.governance_token,
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
        require!(title.len() <= 128,             Error::TitleTooLong);
        require!(description.len() <= 1024,      Error::DescriptionTooLong);
        require!(
            voting_duration_seconds >= MIN_VOTING_DURATION_SECONDS,
            Error::VotingDurationTooShort
        );
        if let Some(action) = &treasury_action {
            validate_treasury_action(action)?;
        }

        let now = Clock::get()?.unix_timestamp;
        let dao = &mut ctx.accounts.dao;
        let p   = &mut ctx.accounts.proposal;

        p.dao                  = dao.key();
        p.proposer             = ctx.accounts.proposer.key();
        p.proposal_id          = dao.proposal_count;
        p.title                = title.clone();
        p.description          = description;
        p.status               = ProposalStatus::Voting;
        p.voting_end           = now + voting_duration_seconds;
        p.reveal_end           = now + voting_duration_seconds + dao.reveal_window_seconds;
        p.yes_capital          = 0;
        p.no_capital           = 0;
        p.yes_community        = 0;
        p.no_community         = 0;
        p.commit_count         = 0;
        p.reveal_count         = 0;
        p.treasury_action      = treasury_action;
        p.execution_unlocks_at = 0;
        p.is_executed          = false;
        p.bump                 = ctx.bumps.proposal;

        dao.proposal_count = dao.proposal_count.checked_add(1).ok_or(Error::Overflow)?;

        emit!(ProposalCreated {
            dao: dao.key(), proposal: p.key(), proposal_id: p.proposal_id,
            title, voting_end: p.voting_end, reveal_end: p.reveal_end,
        });
        Ok(())
    }

    // ── Cancel proposal ───────────────────────────────────────────────────────
    //
    // Authority-only. Can only cancel while status == Voting.
    // Useful for catching errors or security issues before reveals begin.

    pub fn cancel_proposal(ctx: Context<CancelProposal>) -> Result<()> {
        let p = &mut ctx.accounts.proposal;
        require!(p.status == ProposalStatus::Voting, Error::ProposalNotCancellable);

        p.status = ProposalStatus::Cancelled;

        emit!(ProposalCancelled {
            proposal:     p.key(),
            cancelled_by: ctx.accounts.authority.key(),
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
        let p   = &mut ctx.accounts.proposal;

        require!(p.status == ProposalStatus::Passed, Error::ProposalNotPassed);
        require!(!p.is_executed,                     Error::AlreadyExecuted);
        // Veto is only valid while still in the timelock window
        require!(now < p.execution_unlocks_at,       Error::VetoWindowExpired);

        p.status = ProposalStatus::Vetoed;

        emit!(ProposalVetoed {
            proposal:  p.key(),
            vetoed_by: ctx.accounts.authority.key(),
        });
        Ok(())
    }

    // ── Phase 1 — Commit ──────────────────────────────────────────────────────
    //
    // commitment = sha256(vote_byte ‖ salt_32 ‖ voter_pubkey_32)
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
        let p   = &mut ctx.accounts.proposal;
        let dao = &ctx.accounts.dao;

        require!(p.status == ProposalStatus::Voting, Error::VotingNotOpen);
        require!(now < p.voting_end,                 Error::VotingClosed);

        if dao.governance_token_required > 0 {
            require!(
                ctx.accounts.voter_token_account.amount >= dao.governance_token_required,
                Error::InsufficientTokens
            );
        }

        let vr = &mut ctx.accounts.voter_record;
        require!(!vr.has_committed, Error::AlreadyCommitted);

        let raw = ctx.accounts.voter_token_account.amount;

        vr.capital_weight         = raw;
        vr.community_weight       = isqrt(raw);
        vr.voter                  = ctx.accounts.voter.key();
        vr.proposal               = p.key();
        vr.commitment             = commitment;
        vr.has_committed          = true;
        vr.has_revealed           = false;
        vr.voted_yes              = false;
        vr.bump                   = ctx.bumps.voter_record;
        vr.voter_reveal_authority = voter_reveal_authority;

        p.commit_count = p.commit_count.checked_add(1).ok_or(Error::Overflow)?;

        emit!(VoteCommitted {
            proposal: p.key(), voter: ctx.accounts.voter.key(), commit_count: p.commit_count,
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

    pub fn delegate_vote(
        ctx: Context<DelegateVote>,
        delegatee: Pubkey,
    ) -> Result<()> {
        let now = Clock::get()?.unix_timestamp;
        let p   = &ctx.accounts.proposal;

        require!(p.status == ProposalStatus::Voting, Error::VotingNotOpen);
        require!(now < p.voting_end,                 Error::VotingClosed);

        let raw = ctx.accounts.delegator_token_account.amount;
        require!(raw > 0, Error::InsufficientTokens);

        let del = &mut ctx.accounts.delegation;
        del.delegator           = ctx.accounts.delegator.key();
        del.delegatee           = delegatee;
        del.proposal            = p.key();
        del.delegated_capital   = raw;
        del.delegated_community = isqrt(raw);
        del.is_used             = false;
        del.bump                = ctx.bumps.delegation;

        emit!(VoteDelegated {
            proposal:         p.key(),
            delegator:        ctx.accounts.delegator.key(),
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
        let p   = &mut ctx.accounts.proposal;
        let del = &mut ctx.accounts.delegation;

        require!(p.status == ProposalStatus::Voting, Error::VotingNotOpen);
        require!(now < p.voting_end,                 Error::VotingClosed);
        require!(!del.is_used,                       Error::DelegationAlreadyUsed);

        let delegatee_raw = ctx.accounts.delegatee_token_account.amount;

        let combined_capital   = delegatee_raw
            .checked_add(del.delegated_capital).ok_or(Error::Overflow)?;
        let combined_community = isqrt(delegatee_raw)
            .checked_add(del.delegated_community).ok_or(Error::Overflow)?;

        let vr = &mut ctx.accounts.voter_record;
        require!(!vr.has_committed, Error::AlreadyCommitted);

        vr.capital_weight         = combined_capital;
        vr.community_weight       = combined_community;
        vr.voter                  = ctx.accounts.delegatee.key();
        vr.proposal               = p.key();
        vr.commitment             = commitment;
        vr.has_committed          = true;
        vr.has_revealed           = false;
        vr.voted_yes              = false;
        vr.bump                   = ctx.bumps.voter_record;
        vr.voter_reveal_authority = voter_reveal_authority;

        del.is_used = true;

        p.commit_count = p.commit_count.checked_add(1).ok_or(Error::Overflow)?;

        emit!(VoteCommitted {
            proposal: p.key(), voter: ctx.accounts.delegatee.key(), commit_count: p.commit_count,
        });
        Ok(())
    }

    // ── Phase 2 — Reveal ──────────────────────────────────────────────────────
    //
    // Voter or authorized keeper submits (vote, salt).
    // Program recomputes sha256(vote_byte ‖ salt ‖ voter_pubkey) and verifies.
    // On match, both chamber tallies update. SOL rebate goes to the caller.

    pub fn reveal_vote(
        ctx: Context<RevealVote>,
        vote: bool,
        salt: [u8; 32],
    ) -> Result<()> {
        let now = Clock::get()?.unix_timestamp;
        let p   = &mut ctx.accounts.proposal;
        let vr  = &mut ctx.accounts.voter_record;

        require!(now >= p.voting_end, Error::RevealTooEarly);
        require!(now <  p.reveal_end, Error::RevealClosed);
        require!(vr.has_committed,    Error::NotCommitted);
        require!(!vr.has_revealed,    Error::AlreadyRevealed);

        let caller    = ctx.accounts.revealer.key();
        let is_voter  = caller == vr.voter;
        let is_keeper = vr.voter_reveal_authority.map_or(false, |k| k == caller);
        require!(is_voter || is_keeper, Error::NotAuthorizedToReveal);

        // sha256(vote_byte ‖ salt ‖ voter_pubkey) must match stored commitment
        let vote_byte: u8 = if vote { 1 } else { 0 };
        let mut preimage  = Vec::with_capacity(65);
        preimage.push(vote_byte);
        preimage.extend_from_slice(&salt);
        preimage.extend_from_slice(vr.voter.as_ref());
        let computed: [u8; 32] = Sha256::digest(&preimage).into();
        require!(computed == vr.commitment, Error::CommitmentMismatch);

        let cap = vr.capital_weight;
        let com = vr.community_weight;

        if vote {
            p.yes_capital   = p.yes_capital.checked_add(cap).ok_or(Error::Overflow)?;
            p.yes_community = p.yes_community.checked_add(com).ok_or(Error::Overflow)?;
        } else {
            p.no_capital   = p.no_capital.checked_add(cap).ok_or(Error::Overflow)?;
            p.no_community = p.no_community.checked_add(com).ok_or(Error::Overflow)?;
        }

        vr.has_revealed = true;
        vr.voted_yes    = vote;
        p.reveal_count  = p.reveal_count.checked_add(1).ok_or(Error::Overflow)?;

        // Rebate: keep a 1.5m lamport buffer so the account stays rent-exempt
        let lamports = p.to_account_info().lamports();
        if lamports > REVEAL_REBATE_LAMPORTS + 1_500_000 {
            **p.to_account_info().try_borrow_mut_lamports()? -= REVEAL_REBATE_LAMPORTS;
            **ctx.accounts.revealer.try_borrow_mut_lamports()? += REVEAL_REBATE_LAMPORTS;
        }

        emit!(VoteRevealed {
            proposal: p.key(), voter: vr.voter, reveal_count: p.reveal_count,
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
        require!(now >= ctx.accounts.proposal.reveal_end, Error::RevealStillOpen);
        require!(
            ctx.accounts.proposal.status == ProposalStatus::Voting,
            Error::AlreadyFinalized
        );

        let dao = &ctx.accounts.dao;
        let p   = &mut ctx.accounts.proposal;

        let quorum_met = p.commit_count > 0
            && (p.reveal_count as u64) * 100
                >= (p.commit_count as u64) * (dao.quorum_percentage as u64);

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
                VotingConfig::DualChamber { capital_threshold, community_threshold } => {
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

        p.status = if passed { ProposalStatus::Passed } else { ProposalStatus::Failed };

        if passed {
            p.execution_unlocks_at = now
                .checked_add(dao.execution_delay_seconds)
                .ok_or(Error::Overflow)?;
        }

        emit!(ProposalFinalized {
            proposal: p.key(),
            yes_capital: p.yes_capital, no_capital: p.no_capital,
            yes_community: p.yes_community, no_community: p.no_community,
            passed, quorum_met,
            commit_count: p.commit_count, reveal_count: p.reveal_count,
            execution_unlocks_at: p.execution_unlocks_at,
        });
        Ok(())
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
        let p   = &mut ctx.accounts.proposal;

        require!(p.status == ProposalStatus::Passed, Error::ProposalNotPassed);
        require!(!p.is_executed,                     Error::AlreadyExecuted);
        require!(now >= p.execution_unlocks_at,      Error::ExecutionTimelockActive);

        p.is_executed = true;

        if let Some(ref action) = p.treasury_action.clone() {
            validate_treasury_action(action)?;
            let dao_key = ctx.accounts.dao.key();
            let t_bump  = ctx.bumps.treasury;
            let seeds: &[&[u8]] = &[b"treasury", dao_key.as_ref(), &[t_bump]];
            let signer  = &[seeds];

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
                                to:   ctx.accounts.treasury_recipient.to_account_info(),
                            },
                            signer,
                        ),
                        action.amount_lamports,
                    )?;
                    emit!(TreasuryExecuted {
                        proposal:  p.key(),
                        amount:    action.amount_lamports,
                        recipient: ctx.accounts.treasury_recipient.key(),
                    });
                }
                TreasuryActionType::SendToken => {
                    require!(
                        ctx.accounts.treasury_recipient.key() == action.recipient,
                        Error::TreasuryRecipientMismatch
                    );
                    let action_mint = action.token_mint.ok_or(Error::TokenMintRequired)?;
                    require!(
                        *ctx.accounts.treasury_token_account.owner == ctx.accounts.token_program.key(),
                        Error::InvalidTokenAccount
                    );
                    require!(
                        *ctx.accounts.recipient_token_account.owner == ctx.accounts.token_program.key(),
                        Error::InvalidTokenAccount
                    );
                    require!(
                        ctx.accounts.treasury_token_account.data_len() >= 72,
                        Error::InvalidTokenAccount
                    );
                    require!(
                        ctx.accounts.recipient_token_account.data_len() >= 72,
                        Error::InvalidTokenAccount
                    );
                    let treasury_token_owner =
                        token::accessor::authority(&ctx.accounts.treasury_token_account)?;
                    let treasury_token_mint =
                        token::accessor::mint(&ctx.accounts.treasury_token_account)?;
                    let recipient_token_owner =
                        token::accessor::authority(&ctx.accounts.recipient_token_account)?;
                    let recipient_token_mint =
                        token::accessor::mint(&ctx.accounts.recipient_token_account)?;

                    require!(
                        treasury_token_owner == ctx.accounts.treasury.key(),
                        Error::InvalidTreasuryTokenAuthority
                    );
                    require!(treasury_token_mint == action_mint, Error::InvalidTokenMint);
                    require!(recipient_token_mint == action_mint, Error::InvalidTokenMint);
                    require!(
                        recipient_token_owner == action.recipient,
                        Error::RecipientOwnerMismatch
                    );

                    token::transfer(
                        CpiContext::new_with_signer(
                            ctx.accounts.token_program.to_account_info(),
                            TokenTransfer {
                                from:      ctx.accounts.treasury_token_account.to_account_info(),
                                to:        ctx.accounts.recipient_token_account.to_account_info(),
                                authority: ctx.accounts.treasury.to_account_info(),
                            },
                            signer,
                        ),
                        action.amount_lamports,
                    )?;
                    emit!(TreasuryExecuted {
                        proposal:  p.key(),
                        amount:    action.amount_lamports,
                        recipient: ctx.accounts.recipient_token_account.key(),
                    });
                }
                TreasuryActionType::CustomCPI => {
                    require!(
                        ctx.accounts.treasury_recipient.key() == action.recipient,
                        Error::TreasuryRecipientMismatch
                    );
                    // Emit event; off-chain relayer handles the custom call
                    emit!(TreasuryExecuted {
                        proposal:  p.key(),
                        amount:    0,
                        recipient: ctx.accounts.treasury_recipient.key(),
                    });
                }
            }
        }
        Ok(())
    }

    // ── Fund treasury ─────────────────────────────────────────────────────────

    pub fn deposit_treasury(ctx: Context<DepositTreasury>, amount: u64) -> Result<()> {
        transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.depositor.to_account_info(),
                    to:   ctx.accounts.treasury.to_account_info(),
                },
            ),
            amount,
        )?;
        emit!(TreasuryDeposit {
            dao:    ctx.accounts.dao.key(),
            from:   ctx.accounts.depositor.key(),
            amount,
        });
        Ok(())
    }

    // ── Realms voter weight plugin ─────────────────────────────────────────────
    //
    // Implements spl-governance-addin-api VoterWeightRecord exactly.
    // Any Realms DAO can add PrivateDAO as a voter weight plugin today.
    // Weight expires in 100 slots to stay fresh without repeated syncing.

    pub fn update_voter_weight_record(ctx: Context<UpdateVoterWeightRecord>) -> Result<()> {
        let vwr = &mut ctx.accounts.voter_weight_record;
        let raw = ctx.accounts.voter_token_account.amount;

        let weight = match &ctx.accounts.dao.voting_config {
            VotingConfig::TokenWeighted      => raw,
            VotingConfig::Quadratic          => isqrt(raw),
            VotingConfig::DualChamber { .. } => isqrt(raw),
        };

        vwr.realm                 = ctx.accounts.realm.key();
        vwr.governing_token_mint  = ctx.accounts.governing_token_mint.key();
        vwr.governing_token_owner = ctx.accounts.voter.key();
        vwr.voter_weight          = weight;
        vwr.voter_weight_expiry   = Some(Clock::get()?.slot + 100);
        vwr.weight_action         = None;
        vwr.weight_action_target  = None;
        vwr.reserved              = [0u8; 8];
        Ok(())
    }

    pub fn get_voter_weight_record(ctx: Context<GetVoterWeightRecord>) -> Result<u64> {
        Ok(if ctx.accounts.voter_record.has_committed {
            ctx.accounts.voter_record.community_weight
        } else {
            0
        })
    }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

// Integer square root — floor(√n) without floating point.
// Newton's method. Converges in ≤ 32 iterations for u64::MAX.
fn isqrt(n: u64) -> u64 {
    if n == 0 { return 0; }
    let mut x = n;
    let mut y = (x + 1) / 2;
    while y < x {
        x = y;
        y = (x + n / x) / 2;
    }
    x
}

fn validate_voting_config(cfg: &VotingConfig) -> Result<()> {
    if let VotingConfig::DualChamber { capital_threshold, community_threshold } = cfg {
        require!(*capital_threshold   > 0 && *capital_threshold   <= 100, Error::InvalidThreshold);
        require!(*community_threshold > 0 && *community_threshold <= 100, Error::InvalidThreshold);
    }
    Ok(())
}

fn validate_treasury_action(action: &TreasuryAction) -> Result<()> {
    match action.action_type {
        TreasuryActionType::SendSol => {
            require!(action.amount_lamports > 0, Error::InvalidTreasuryAction);
            require!(action.token_mint.is_none(), Error::InvalidTreasuryAction);
            require!(action.recipient != Pubkey::default(), Error::InvalidTreasuryAction);
        }
        TreasuryActionType::SendToken => {
            require!(action.amount_lamports > 0, Error::InvalidTreasuryAction);
            require!(action.token_mint.is_some(), Error::TokenMintRequired);
            require!(action.recipient != Pubkey::default(), Error::InvalidTreasuryAction);
        }
        TreasuryActionType::CustomCPI => {
            require!(action.amount_lamports == 0, Error::InvalidTreasuryAction);
            require!(action.token_mint.is_none(), Error::InvalidTreasuryAction);
            require!(action.recipient != Pubkey::default(), Error::InvalidTreasuryAction);
        }
    }
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
    pub dao:              Account<'info, Dao>,
    pub governance_token: Account<'info, Mint>,
    #[account(mut)]
    pub authority:        Signer<'info>,
    pub system_program:   Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(dao_name: String)]
pub struct MigrateFromRealms<'info> {
    #[account(
        init, payer = authority, space = Dao::LEN,
        seeds = [b"dao", authority.key().as_ref(), dao_name.as_bytes()], bump
    )]
    pub dao:              Account<'info, Dao>,
    pub governance_token: Account<'info, Mint>,
    #[account(mut)]
    pub authority:        Signer<'info>,
    pub system_program:   Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(title: String)]
pub struct CreateProposal<'info> {
    #[account(
        mut, has_one = authority,
        seeds = [b"dao", dao.authority.as_ref(), dao.dao_name.as_bytes()],
        bump = dao.bump
    )]
    pub dao:            Account<'info, Dao>,
    #[account(
        init, payer = proposer, space = Proposal::LEN,
        seeds = [b"proposal", dao.key().as_ref(), dao.proposal_count.to_le_bytes().as_ref()],
        bump
    )]
    pub proposal:       Account<'info, Proposal>,
    pub authority:      Signer<'info>,
    #[account(mut)]
    pub proposer:       Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CancelProposal<'info> {
    #[account(has_one = authority)]
    pub dao:       Account<'info, Dao>,
    #[account(
        mut, has_one = dao,
        seeds = [b"proposal", dao.key().as_ref(), proposal.proposal_id.to_le_bytes().as_ref()],
        bump = proposal.bump
    )]
    pub proposal:  Account<'info, Proposal>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct VetoProposal<'info> {
    #[account(has_one = authority)]
    pub dao:       Account<'info, Dao>,
    #[account(
        mut, has_one = dao,
        seeds = [b"proposal", dao.key().as_ref(), proposal.proposal_id.to_le_bytes().as_ref()],
        bump = proposal.bump
    )]
    pub proposal:  Account<'info, Proposal>,
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
    // Verify token account belongs to the voter and uses the DAO's governance mint
    #[account(
        constraint = voter_token_account.owner == voter.key(),
        constraint = voter_token_account.mint  == dao.governance_token,
    )]
    pub voter_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub voter:               Signer<'info>,
    pub token_program:       Program<'info, Token>,
    pub system_program:      Program<'info, System>,
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
    // Verify token account belongs to the delegator and uses the DAO's governance mint
    #[account(
        constraint = delegator_token_account.owner == delegator.key(),
        constraint = delegator_token_account.mint  == dao.governance_token,
    )]
    pub delegator_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub delegator:               Signer<'info>,
    pub system_program:          Program<'info, System>,
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
    #[account(
        init, payer = delegatee, space = VoterRecord::LEN,
        seeds = [b"vote", proposal.key().as_ref(), delegatee.key().as_ref()], bump
    )]
    pub voter_record: Account<'info, VoterRecord>,
    #[account(
        constraint = delegatee_token_account.owner == delegatee.key(),
        constraint = delegatee_token_account.mint  == dao.governance_token,
    )]
    pub delegatee_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub delegatee:               Signer<'info>,
    pub system_program:          Program<'info, System>,
}

#[derive(Accounts)]
pub struct RevealVote<'info> {
    #[account(
        mut,
        seeds = [b"proposal", proposal.dao.as_ref(), proposal.proposal_id.to_le_bytes().as_ref()],
        bump = proposal.bump
    )]
    pub proposal:     Account<'info, Proposal>,
    #[account(
        mut,
        seeds = [b"vote", proposal.key().as_ref(), voter_record.voter.as_ref()],
        bump = voter_record.bump
    )]
    pub voter_record: Account<'info, VoterRecord>,
    #[account(mut)]
    pub revealer:     Signer<'info>,
}

#[derive(Accounts)]
pub struct FinalizeProposal<'info> {
    pub dao: Account<'info, Dao>,
    #[account(
        mut, has_one = dao,
        seeds = [b"proposal", dao.key().as_ref(), proposal.proposal_id.to_le_bytes().as_ref()],
        bump = proposal.bump
    )]
    pub proposal:  Account<'info, Proposal>,
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
    pub executor:                Signer<'info>,
    pub token_program:           Program<'info, Token>,
    pub system_program:          Program<'info, System>,
}

#[derive(Accounts)]
pub struct DepositTreasury<'info> {
    pub dao: Account<'info, Dao>,
    #[account(mut, seeds = [b"treasury", dao.key().as_ref()], bump)]
    pub treasury:       SystemAccount<'info>,
    #[account(mut)]
    pub depositor:      Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateVoterWeightRecord<'info> {
    pub dao:                  Account<'info, Dao>,
    /// CHECK: Realms realm account — not owned by this program
    pub realm:                AccountInfo<'info>,
    #[account(
        constraint = governing_token_mint.key() == dao.governance_token @ Error::GoverningMintMismatch
    )]
    pub governing_token_mint: Account<'info, Mint>,
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
    pub voter_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub voter:               Signer<'info>,
    pub system_program:      Program<'info, System>,
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

// ── State ─────────────────────────────────────────────────────────────────────

#[account]
pub struct Dao {
    pub authority:                 Pubkey,       // 32
    pub dao_name:                  String,       // 4 + 64
    pub governance_token:          Pubkey,       // 32
    pub quorum_percentage:         u8,           // 1
    pub governance_token_required: u64,          // 8
    pub reveal_window_seconds:     i64,          // 8
    pub execution_delay_seconds:   i64,          // 8
    pub voting_config:             VotingConfig, // 3 (DualChamber is largest variant)
    pub proposal_count:            u64,          // 8
    pub bump:                      u8,           // 1
    pub migrated_from_realms:      Option<Pubkey>, // 33
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
        + 33;              // migrated_from_realms (Option<Pubkey>)
                           // = 210
}

#[account]
pub struct Proposal {
    pub dao:                  Pubkey,                // 32
    pub proposer:             Pubkey,                // 32
    pub proposal_id:          u64,                   // 8
    pub title:                String,                // 4 + 128
    pub description:          String,                // 4 + 1024
    pub status:               ProposalStatus,        // 1
    pub voting_end:           i64,                   // 8
    pub reveal_end:           i64,                   // 8
    pub yes_capital:          u64,                   // 8
    pub no_capital:           u64,                   // 8
    pub yes_community:        u64,                   // 8
    pub no_community:         u64,                   // 8
    pub commit_count:         u64,                   // 8
    pub reveal_count:         u64,                   // 8
    pub treasury_action:      Option<TreasuryAction>, // 1 + 74 = 75
    pub execution_unlocks_at: i64,                   // 8
    pub is_executed:          bool,                  // 1
    pub bump:                 u8,                    // 1
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
        + 8 + 1 + 1;                  // execution_unlocks_at, is_executed, bump
                                      // = 1390
}

#[account]
pub struct VoterRecord {
    pub voter:                  Pubkey,         // 32
    pub proposal:               Pubkey,         // 32
    pub commitment:             [u8; 32],       // 32
    pub capital_weight:         u64,            // 8   (own + delegated)
    pub community_weight:       u64,            // 8   (own + delegated)
    pub has_committed:          bool,           // 1
    pub has_revealed:           bool,           // 1
    pub voted_yes:              bool,           // 1
    pub bump:                   u8,             // 1
    pub voter_reveal_authority: Option<Pubkey>, // 33
}

impl VoterRecord {
    pub const LEN: usize = 8 + 32 + 32 + 32 + 8 + 8 + 1 + 1 + 1 + 1 + 33; // = 157
}

#[account]
pub struct VoteDelegation {
    pub delegator:           Pubkey, // 32
    pub delegatee:           Pubkey, // 32
    pub proposal:            Pubkey, // 32
    pub delegated_capital:   u64,    // 8
    pub delegated_community: u64,    // 8
    pub is_used:             bool,   // 1
    pub bump:                u8,     // 1
}

impl VoteDelegation {
    pub const LEN: usize = 8 + 32 + 32 + 32 + 8 + 8 + 1 + 1; // = 122
}

// Matches spl-governance-addin-api VoterWeightRecord layout exactly
#[account]
pub struct VoterWeightRecord {
    pub realm:                 Pubkey,         // 32
    pub governing_token_mint:  Pubkey,         // 32
    pub governing_token_owner: Pubkey,         // 32
    pub voter_weight:          u64,            // 8
    pub voter_weight_expiry:   Option<u64>,    // 9
    pub weight_action:         Option<u8>,     // 2
    pub weight_action_target:  Option<Pubkey>, // 33
    pub reserved:              [u8; 8],        // 8
}

impl VoterWeightRecord {
    pub const LEN: usize = 8 + 32 + 32 + 32 + 8 + 9 + 2 + 33 + 8; // = 164
}

// ── Types ─────────────────────────────────────────────────────────────────────

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum VotingConfig {
    TokenWeighted,
    Quadratic,
    DualChamber {
        capital_threshold:   u8, // % of token-weighted YES required (1–100)
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
    pub action_type:     TreasuryActionType,
    pub amount_lamports: u64,
    pub recipient:       Pubkey,
    pub token_mint:      Option<Pubkey>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub enum TreasuryActionType { SendSol, SendToken, CustomCPI }

// ── Events ────────────────────────────────────────────────────────────────────

#[event]
pub struct DaoCreated { pub dao: Pubkey, pub name: String, pub authority: Pubkey }

#[event]
pub struct DaoMigratedFromRealms {
    pub dao: Pubkey, pub name: String,
    pub realms_governance: Pubkey, pub governance_token: Pubkey,
}

#[event]
pub struct ProposalCreated {
    pub dao: Pubkey, pub proposal: Pubkey, pub proposal_id: u64,
    pub title: String, pub voting_end: i64, pub reveal_end: i64,
}

#[event]
pub struct ProposalCancelled { pub proposal: Pubkey, pub cancelled_by: Pubkey }

#[event]
pub struct ProposalVetoed { pub proposal: Pubkey, pub vetoed_by: Pubkey }

#[event]
pub struct VoteDelegated {
    pub proposal: Pubkey, pub delegator: Pubkey,
    pub delegatee: Pubkey, pub delegated_weight: u64,
}

#[event]
pub struct VoteCommitted { pub proposal: Pubkey, pub voter: Pubkey, pub commit_count: u64 }

#[event]
pub struct VoteRevealed { pub proposal: Pubkey, pub voter: Pubkey, pub reveal_count: u64 }

#[event]
pub struct ProposalFinalized {
    pub proposal: Pubkey,
    pub yes_capital: u64, pub no_capital: u64,
    pub yes_community: u64, pub no_community: u64,
    pub passed: bool, pub quorum_met: bool,
    pub commit_count: u64, pub reveal_count: u64,
    pub execution_unlocks_at: i64,
}

#[event]
pub struct TreasuryDeposit { pub dao: Pubkey, pub from: Pubkey, pub amount: u64 }

#[event]
pub struct TreasuryExecuted { pub proposal: Pubkey, pub amount: u64, pub recipient: Pubkey }

// ── Errors ────────────────────────────────────────────────────────────────────

#[error_code]
pub enum Error {
    #[msg("DAO name max 64 chars")]                        NameTooLong,
    #[msg("Quorum must be 1–100")]                         InvalidQuorum,
    #[msg("Reveal window must be at least 5 seconds")]     RevealWindowTooShort,
    #[msg("Voting duration must be at least 5 seconds")]   VotingDurationTooShort,
    #[msg("Execution delay must be non-negative")]         InvalidExecutionDelay,
    #[msg("Title max 128 chars")]                          TitleTooLong,
    #[msg("Description max 1024 chars")]                   DescriptionTooLong,
    #[msg("Voting is not open")]                           VotingNotOpen,
    #[msg("Voting period has closed")]                     VotingClosed,
    #[msg("Already committed a vote")]                     AlreadyCommitted,
    #[msg("Reveal phase has not started yet")]             RevealTooEarly,
    #[msg("Reveal window has closed")]                     RevealClosed,
    #[msg("Reveal phase is still open")]                   RevealStillOpen,
    #[msg("No commitment found for this voter")]           NotCommitted,
    #[msg("Vote already revealed")]                        AlreadyRevealed,
    #[msg("Commitment hash does not match")]               CommitmentMismatch,
    #[msg("Proposal has already been finalized")]          AlreadyFinalized,
    #[msg("Not enough governance tokens")]                 InsufficientTokens,
    #[msg("Not authorized to reveal this vote")]           NotAuthorizedToReveal,
    #[msg("Threshold must be 1–100")]                      InvalidThreshold,
    #[msg("Arithmetic overflow")]                          Overflow,
    #[msg("Can only cancel proposals that are voting")]    ProposalNotCancellable,
    #[msg("Proposal did not pass")]                        ProposalNotPassed,
    #[msg("Treasury action already executed")]             AlreadyExecuted,
    #[msg("Execution timelock has not yet expired")]       ExecutionTimelockActive,
    #[msg("Veto window has expired — timelock has passed")] VetoWindowExpired,
    #[msg("This delegation has already been used")]        DelegationAlreadyUsed,
    #[msg("Caller is not the designated delegatee")]       NotDelegatee,
    #[msg("Delegation belongs to a different proposal")]   WrongProposal,
    #[msg("Treasury action payload is invalid")]           InvalidTreasuryAction,
    #[msg("SendToken action requires token_mint")]         TokenMintRequired,
    #[msg("Executor must use action recipient")]           TreasuryRecipientMismatch,
    #[msg("Treasury token account must be treasury-owned")] InvalidTreasuryTokenAuthority,
    #[msg("Provided token mint does not match action")]    InvalidTokenMint,
    #[msg("Recipient token owner does not match action")]  RecipientOwnerMismatch,
    #[msg("Token account is invalid or owned by wrong program")] InvalidTokenAccount,
    #[msg("Governing mint must match DAO governance token")] GoverningMintMismatch,
}
