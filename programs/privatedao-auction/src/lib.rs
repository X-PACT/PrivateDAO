#![allow(unexpected_cfgs)]
#![allow(clippy::diverging_sub_expression)]
#![allow(clippy::too_many_arguments)]

use anchor_lang::prelude::*;
use ephemeral_rollups_sdk::access_control::{
    instructions::{
        CloseEphemeralPermissionCpi, CreateEphemeralPermissionCpi, UpdateEphemeralPermissionCpi,
    },
    structs::{
        EphemeralMembersArgs, EphemeralPermission, Member, TX_BALANCES_FLAG, TX_LOGS_FLAG,
        TX_MESSAGE_FLAG,
    },
};
use ephemeral_rollups_sdk::anchor::{delegate, ephemeral};
use ephemeral_rollups_sdk::consts::{EPHEMERAL_VAULT_ID, MAGIC_PROGRAM_ID, PERMISSION_PROGRAM_ID};
use ephemeral_rollups_sdk::cpi::DelegateConfig;
use ephemeral_rollups_sdk::ephem::MagicIntentBundleBuilder;
use ephemeral_rollups_sdk::ephemeral_accounts::rent as ephemeral_rent;
use sha2::{Digest, Sha256};

declare_id!("4Z7AeFRZHBCok68hhbUgVLC3uFaEP2aDWozsYVksPuQd");

const AUCTION_SEED: &[u8] = b"auction";
const SESSION_SEED: &[u8] = b"session";
const AUTH_SEED: &[u8] = b"authorization";
const RECEIPT_SEED: &[u8] = b"receipt";
const MAX_BIDS: usize = 32;
const MAX_PERMISSION_MEMBERS: usize = MAX_BIDS + 1;

#[ephemeral]
#[program]
pub mod privatedao_auction {
    use super::*;

    pub fn initialize_auction(
        ctx: Context<InitializeAuction>,
        auction_id: [u8; 32],
        bidding_start: i64,
        bidding_deadline: i64,
        rules_digest: [u8; 32],
        policy_digest: [u8; 32],
        disclose_winning_amount: bool,
        allow_bid_updates: bool,
    ) -> Result<()> {
        let now = Clock::get()?.unix_timestamp;
        require!(bidding_start >= now, AuctionError::StartInPast);
        require!(
            bidding_deadline > bidding_start,
            AuctionError::InvalidDeadline
        );
        require!(!is_zero(&auction_id), AuctionError::InvalidAuctionId);
        require!(!is_zero(&rules_digest), AuctionError::InvalidRulesDigest);
        require!(!is_zero(&policy_digest), AuctionError::InvalidPolicyDigest);

        let config = &mut ctx.accounts.config;
        config.auction_id = auction_id;
        config.authority = ctx.accounts.authority.key();
        config.room_reference = None;
        config.bidding_start = bidding_start;
        config.bidding_deadline = bidding_deadline;
        config.rules_digest = rules_digest;
        config.policy_digest = policy_digest;
        config.disclose_winning_amount = disclose_winning_amount;
        config.allow_bid_updates = allow_bid_updates;
        config.status = AuctionStatus::Scheduled;
        config.created_at = now;
        config.bump = ctx.bumps.config;

        let session = &mut ctx.accounts.session;
        anchor_lang::system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.key(),
                anchor_lang::system_program::Transfer {
                    from: ctx.accounts.authority.to_account_info(),
                    to: session.to_account_info(),
                },
            ),
            ephemeral_rent(EphemeralPermission::size_of(MAX_PERMISSION_MEMBERS) as u32),
        )?;
        session.auction = config.key();
        session.auction_id = auction_id;
        session.authority = config.authority;
        session.rules_digest = rules_digest;
        session.policy_digest = policy_digest;
        session.disclose_winning_amount = disclose_winning_amount;
        session.session_reference = session_reference(&auction_id);
        session.bidding_start = bidding_start;
        session.bidding_deadline = bidding_deadline;
        session.allow_bid_updates = allow_bid_updates;
        session.state_commitment = [0; 32];
        session.result_commitment = [0; 32];
        session.winner_commitment = [0; 32];
        session.public_winning_amount = None;
        session.bid_count = 0;
        session.revision = 0;
        session.status = AuctionStatus::Scheduled;
        session.private_state_cleared = false;
        session.bump = ctx.bumps.session;

        emit!(AuctionInitialized {
            auction: config.key(),
            auction_id,
            authority: config.authority,
            bidding_start,
            bidding_deadline,
            rules_digest,
            policy_digest,
        });
        Ok(())
    }

    pub fn activate_auction(ctx: Context<ManageAuction>) -> Result<()> {
        let now = Clock::get()?.unix_timestamp;
        require!(
            ctx.accounts.config.status == AuctionStatus::Scheduled,
            AuctionError::InvalidStatus
        );
        require!(
            now >= ctx.accounts.config.bidding_start,
            AuctionError::TooEarly
        );
        require!(
            now < ctx.accounts.config.bidding_deadline,
            AuctionError::DeadlinePassed
        );
        ctx.accounts.config.status = AuctionStatus::Active;
        ctx.accounts.session.status = AuctionStatus::Active;
        Ok(())
    }

    pub fn authorize_bidder(
        ctx: Context<AuthorizeBidder>,
        bidder_commitment: [u8; 32],
        bidder_wallet: Pubkey,
    ) -> Result<()> {
        require!(
            !is_zero(&bidder_commitment),
            AuctionError::InvalidBidderCommitment
        );
        require!(
            ctx.accounts.config.status == AuctionStatus::Scheduled
                || ctx.accounts.config.status == AuctionStatus::Active,
            AuctionError::InvalidStatus
        );
        let auth = &mut ctx.accounts.authorization;
        auth.auction = ctx.accounts.config.key();
        auth.bidder_commitment = bidder_commitment;
        auth.bidder_wallet = bidder_wallet;
        auth.authorized_by = ctx.accounts.authority.key();
        auth.authorized_at = Clock::get()?.unix_timestamp;
        auth.active = true;
        auth.bump = ctx.bumps.authorization;
        Ok(())
    }

    pub fn revoke_bidder(ctx: Context<RevokeBidder>) -> Result<()> {
        require!(
            ctx.accounts.config.status != AuctionStatus::Finalized,
            AuctionError::InvalidStatus
        );
        ctx.accounts.authorization.active = false;
        Ok(())
    }

    pub fn delegate_auction_session(ctx: Context<DelegateAuctionSession>) -> Result<()> {
        require!(
            ctx.accounts.config.status == AuctionStatus::Active,
            AuctionError::InvalidStatus
        );
        ctx.accounts.delegate_session(
            &ctx.accounts.payer,
            &[SESSION_SEED, ctx.accounts.config.key().as_ref()],
            DelegateConfig {
                validator: ctx.remaining_accounts.first().map(|account| account.key()),
                ..Default::default()
            },
        )?;
        Ok(())
    }

    pub fn init_permission(ctx: Context<PermissionContext>) -> Result<()> {
        validate_permission_accounts(ctx.accounts)?;
        if ctx.accounts.permission.lamports() > 0 {
            return Ok(());
        }
        let config_key = ctx.accounts.config.key();
        let signer_seeds: &[&[u8]] = &[
            SESSION_SEED,
            config_key.as_ref(),
            &[ctx.accounts.session.bump],
        ];
        CreateEphemeralPermissionCpi {
            payer: ctx.accounts.session.to_account_info(),
            permissioned_account: ctx.accounts.session.to_account_info(),
            permission: ctx.accounts.permission.to_account_info(),
            vault: ctx.accounts.ephemeral_vault.to_account_info(),
            magic_program: ctx.accounts.magic_program.to_account_info(),
            permission_program: ctx.accounts.permission_program.to_account_info(),
            args: EphemeralMembersArgs {
                // MagicBlock creates the ephemeral permission first, then the
                // separate set_private call applies the bidder allow-list.
                is_private: false,
                members: Vec::new(),
            },
        }
        .invoke_signed(&[signer_seeds])?;
        Ok(())
    }

    pub fn set_private(ctx: Context<PermissionContext>, is_private: bool) -> Result<()> {
        validate_permission_accounts(ctx.accounts)?;
        let members = if is_private {
            permission_members(&ctx)?
        } else {
            Vec::new()
        };
        let config_key = ctx.accounts.config.key();
        let signer_seeds: &[&[u8]] = &[
            SESSION_SEED,
            config_key.as_ref(),
            &[ctx.accounts.session.bump],
        ];
        UpdateEphemeralPermissionCpi {
            payer: ctx.accounts.session.to_account_info(),
            permissioned_account: ctx.accounts.session.to_account_info(),
            permission: ctx.accounts.permission.to_account_info(),
            vault: ctx.accounts.ephemeral_vault.to_account_info(),
            magic_program: ctx.accounts.magic_program.to_account_info(),
            permission_program: ctx.accounts.permission_program.to_account_info(),
            authority: ctx.accounts.session.to_account_info(),
            authority_is_signer: false,
            args: EphemeralMembersArgs {
                is_private,
                members,
            },
        }
        .invoke_signed(&[signer_seeds])?;
        Ok(())
    }

    pub fn close_permission(ctx: Context<PermissionContext>) -> Result<()> {
        validate_permission_accounts(ctx.accounts)?;
        let config_key = ctx.accounts.config.key();
        let signer_seeds: &[&[u8]] = &[
            SESSION_SEED,
            config_key.as_ref(),
            &[ctx.accounts.session.bump],
        ];
        CloseEphemeralPermissionCpi {
            payer: ctx.accounts.session.to_account_info(),
            permissioned_account: ctx.accounts.session.to_account_info(),
            permission: ctx.accounts.permission.to_account_info(),
            vault: ctx.accounts.ephemeral_vault.to_account_info(),
            magic_program: ctx.accounts.magic_program.to_account_info(),
            permission_program: ctx.accounts.permission_program.to_account_info(),
            authority: ctx.accounts.session.to_account_info(),
            authority_is_signer: false,
        }
        .invoke_signed(&[signer_seeds])?;
        Ok(())
    }

    pub fn submit_private_bid(
        ctx: Context<SubmitPrivateBid>,
        bidder_commitment: [u8; 32],
        amount: u64,
        salt: [u8; 32],
        revision: u32,
    ) -> Result<()> {
        let now = Clock::get()?.unix_timestamp;
        let session = &mut ctx.accounts.session;
        require!(
            session.status == AuctionStatus::Active,
            AuctionError::InvalidStatus
        );
        require!(
            now >= session.bidding_start && now < session.bidding_deadline,
            AuctionError::DeadlinePassed
        );
        require!(amount > 0, AuctionError::InvalidAmount);
        require!(
            !is_zero(&bidder_commitment) && !is_zero(&salt),
            AuctionError::InvalidBidderCommitment
        );
        require!(
            ctx.accounts.authorization.active,
            AuctionError::BidderNotAuthorized
        );
        require!(
            ctx.accounts.authorization.bidder_wallet == ctx.accounts.bidder.key(),
            AuctionError::BidderWalletMismatch
        );
        require!(
            ctx.accounts.authorization.auction == session.auction,
            AuctionError::AuthorizationMismatch
        );
        require!(
            ctx.accounts.authorization.bidder_commitment == bidder_commitment,
            AuctionError::BidderCommitmentMismatch
        );

        let allow_bid_updates = session.allow_bid_updates;
        let existing = session
            .bids
            .iter_mut()
            .find(|bid| bid.bidder_commitment == bidder_commitment);
        match existing {
            Some(bid) => {
                require!(allow_bid_updates, AuctionError::BidUpdatesDisabled);
                require!(revision > bid.revision, AuctionError::RevisionReplay);
                bid.amount = amount;
                bid.salt = salt;
                bid.revision = revision;
                bid.submitted_at = now;
            }
            None => {
                require!(revision == 0, AuctionError::InvalidRevision);
                require!(
                    session.bids.len() < MAX_BIDS,
                    AuctionError::BidCapacityReached
                );
                session.bids.push(PrivateBid {
                    bidder_commitment,
                    amount,
                    salt,
                    revision,
                    submitted_at: now,
                });
                session.bid_count = session
                    .bid_count
                    .checked_add(1)
                    .ok_or(AuctionError::ArithmeticOverflow)?;
            }
        }
        session.revision = session
            .revision
            .checked_add(1)
            .ok_or(AuctionError::ArithmeticOverflow)?;
        Ok(())
    }

    pub fn close_bidding(ctx: Context<ClosePrivateBidding>) -> Result<()> {
        let now = Clock::get()?.unix_timestamp;
        require!(
            ctx.accounts.session.status == AuctionStatus::Active,
            AuctionError::InvalidStatus
        );
        require!(
            now >= ctx.accounts.session.bidding_deadline,
            AuctionError::TooEarly
        );
        ctx.accounts.session.status = AuctionStatus::Closed;
        Ok(())
    }

    pub fn finalize_private_result(ctx: Context<FinalizePrivateResult>) -> Result<()> {
        require!(
            ctx.accounts.session.status == AuctionStatus::Closed,
            AuctionError::InvalidStatus
        );
        let session = &mut ctx.accounts.session;
        require!(!session.bids.is_empty(), AuctionError::NoValidBids);
        let winner = session
            .bids
            .iter()
            .max_by(|left, right| {
                left.amount
                    .cmp(&right.amount)
                    .then_with(|| right.bidder_commitment.cmp(&left.bidder_commitment))
            })
            .copied()
            .ok_or(AuctionError::NoValidBids)?;

        session.winner_commitment = winner.bidder_commitment;
        session.public_winning_amount = if session.disclose_winning_amount {
            Some(winner.amount)
        } else {
            None
        };
        session.result_commitment = result_commitment(
            &session.auction_id,
            &session.rules_digest,
            &session.policy_digest,
            &session.winner_commitment,
            winner.amount,
            session.bid_count,
            session.bidding_deadline,
        );
        session.state_commitment = state_commitment(session);
        session.status = AuctionStatus::Finalized;
        session.private_state_cleared = true;
        session.bids.clear();
        Ok(())
    }

    pub fn commit_final_result(ctx: Context<CommitSession>) -> Result<()> {
        require!(
            ctx.accounts.session.status == AuctionStatus::Finalized,
            AuctionError::InvalidStatus
        );
        ctx.accounts.session.exit(&crate::ID)?;
        MagicIntentBundleBuilder::new(
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.magic_context.to_account_info(),
            ctx.accounts.magic_program.to_account_info(),
        )
        .commit(&[ctx.accounts.session.to_account_info()])
        .build_and_invoke()?;
        Ok(())
    }

    pub fn commit_and_undelegate_session(ctx: Context<CommitSession>) -> Result<()> {
        require!(
            ctx.accounts.session.status == AuctionStatus::Finalized,
            AuctionError::InvalidStatus
        );
        ctx.accounts.session.exit(&crate::ID)?;
        MagicIntentBundleBuilder::new(
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.magic_context.to_account_info(),
            ctx.accounts.magic_program.to_account_info(),
        )
        .commit_and_undelegate(&[ctx.accounts.session.to_account_info()])
        .build_and_invoke()?;
        Ok(())
    }

    pub fn finalize_receipt(
        ctx: Context<FinalizeReceipt>,
        receipt_id: [u8; 32],
        solana_signature: String,
        slot: u64,
        finality: u8,
    ) -> Result<()> {
        require!(
            ctx.accounts.session.status == AuctionStatus::Finalized,
            AuctionError::InvalidStatus
        );
        require!(
            ctx.accounts.session.private_state_cleared,
            AuctionError::PrivateStateNotCleared
        );
        require!(!is_zero(&receipt_id), AuctionError::InvalidReceiptId);
        require!(
            solana_signature.len() <= 128,
            AuctionError::SignatureTooLong
        );
        require!(finality > 0, AuctionError::ReceiptNotFinal);
        let receipt = &mut ctx.accounts.receipt;
        receipt.auction = ctx.accounts.config.key();
        receipt.receipt_id = receipt_id;
        receipt.auction_id = ctx.accounts.config.auction_id;
        receipt.rules_digest = ctx.accounts.config.rules_digest;
        receipt.policy_digest = ctx.accounts.config.policy_digest;
        receipt.result_commitment = ctx.accounts.session.result_commitment;
        receipt.session_reference = ctx.accounts.session.session_reference;
        receipt.solana_signature = solana_signature;
        receipt.slot = slot;
        receipt.finality = finality;
        receipt.created_at = Clock::get()?.unix_timestamp;
        receipt.bump = ctx.bumps.receipt;
        Ok(())
    }

    pub fn recover_stale_session(ctx: Context<ManageAuction>) -> Result<()> {
        let now = Clock::get()?.unix_timestamp;
        require!(
            now > ctx.accounts.config.bidding_deadline,
            AuctionError::DeadlineNotReached
        );
        require!(
            ctx.accounts.config.status == AuctionStatus::Active
                || ctx.accounts.config.status == AuctionStatus::Closed,
            AuctionError::InvalidStatus
        );
        ctx.accounts.config.status = AuctionStatus::RecoveryPending;
        ctx.accounts.session.status = AuctionStatus::RecoveryPending;
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(auction_id: [u8; 32])]
pub struct InitializeAuction<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(init, payer = authority, space = 8 + AuctionConfig::SPACE, seeds = [AUCTION_SEED, auction_id.as_ref()], bump)]
    pub config: Account<'info, AuctionConfig>,
    #[account(init, payer = authority, space = 8 + AuctionSession::SPACE, seeds = [SESSION_SEED, config.key().as_ref()], bump)]
    pub session: Account<'info, AuctionSession>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ManageAuction<'info> {
    #[account(mut, has_one = authority)]
    pub config: Account<'info, AuctionConfig>,
    #[account(mut, seeds = [SESSION_SEED, config.key().as_ref()], bump = session.bump)]
    pub session: Account<'info, AuctionSession>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct ClosePrivateBidding<'info> {
    #[account(mut, has_one = authority)]
    pub session: Account<'info, AuctionSession>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(bidder_commitment: [u8; 32])]
pub struct AuthorizeBidder<'info> {
    #[account(mut, has_one = authority)]
    pub config: Account<'info, AuctionConfig>,
    #[account(init, payer = authority, space = 8 + BidderAuthorization::SPACE, seeds = [AUTH_SEED, config.key().as_ref(), bidder_commitment.as_ref()], bump)]
    pub authorization: Account<'info, BidderAuthorization>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RevokeBidder<'info> {
    #[account(mut, has_one = authority)]
    pub config: Account<'info, AuctionConfig>,
    #[account(mut, close = authority, seeds = [AUTH_SEED, config.key().as_ref(), authorization.bidder_commitment.as_ref()], bump = authorization.bump)]
    pub authorization: Account<'info, BidderAuthorization>,
    #[account(mut)]
    pub authority: Signer<'info>,
}

#[delegate]
#[derive(Accounts)]
pub struct DelegateAuctionSession<'info> {
    pub payer: Signer<'info>,
    /// CHECK: MagicBlock's delegation macro validates the delegated session account and its owner.
    #[account(mut, del)]
    pub session: UncheckedAccount<'info>,
    pub config: Account<'info, AuctionConfig>,
    /// CHECK: the deployed program ID is checked by the delegation macro.
    #[account(address = crate::ID)]
    pub owner_program: UncheckedAccount<'info>,
    /// CHECK: MagicBlock delegation program.
    #[account(address = ephemeral_rollups_sdk::id())]
    pub delegation_program: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct PermissionContext<'info> {
    #[account(mut, seeds = [SESSION_SEED, config.key().as_ref()], bump = session.bump)]
    pub session: Account<'info, AuctionSession>,
    pub config: Account<'info, AuctionConfig>,
    /// CHECK: validated against MagicBlock's permission PDA in the handler.
    #[account(mut)]
    pub permission: UncheckedAccount<'info>,
    /// CHECK: validated against MagicBlock's fixed ephemeral vault ID.
    #[account(mut)]
    pub ephemeral_vault: UncheckedAccount<'info>,
    /// CHECK: validated against MagicBlock's fixed program ID.
    pub magic_program: UncheckedAccount<'info>,
    /// CHECK: validated against MagicBlock's fixed permission program ID.
    pub permission_program: UncheckedAccount<'info>,
}

#[derive(Accounts)]
pub struct SubmitPrivateBid<'info> {
    pub bidder: Signer<'info>,
    #[account(mut)]
    pub session: Account<'info, AuctionSession>,
    pub authorization: Account<'info, BidderAuthorization>,
}

#[derive(Accounts)]
pub struct FinalizePrivateResult<'info> {
    #[account(mut, has_one = authority)]
    pub session: Account<'info, AuctionSession>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct CommitSession<'info> {
    pub payer: Signer<'info>,
    #[account(mut)]
    pub session: Account<'info, AuctionSession>,
    /// CHECK: MagicBlock runtime context account validated by the MagicBlock program.
    #[account(mut)]
    pub magic_context: UncheckedAccount<'info>,
    /// CHECK: MagicBlock runtime program account validated by CPI.
    pub magic_program: UncheckedAccount<'info>,
}

#[derive(Accounts)]
pub struct FinalizeReceipt<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    pub config: Account<'info, AuctionConfig>,
    pub session: Account<'info, AuctionSession>,
    #[account(init, payer = authority, space = 8 + SettlementReceipt::SPACE, seeds = [RECEIPT_SEED, config.key().as_ref()], bump)]
    pub receipt: Account<'info, SettlementReceipt>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct AuctionConfig {
    pub auction_id: [u8; 32],
    pub authority: Pubkey,
    pub room_reference: Option<Pubkey>,
    pub bidding_start: i64,
    pub bidding_deadline: i64,
    pub rules_digest: [u8; 32],
    pub policy_digest: [u8; 32],
    pub disclose_winning_amount: bool,
    pub allow_bid_updates: bool,
    pub status: AuctionStatus,
    pub created_at: i64,
    pub bump: u8,
}
impl AuctionConfig {
    pub const SPACE: usize = 32 + 32 + 33 + 8 + 8 + 32 + 32 + 1 + 1 + 1 + 8 + 1;
}

#[account]
pub struct AuctionSession {
    pub auction: Pubkey,
    pub auction_id: [u8; 32],
    pub authority: Pubkey,
    pub session_reference: [u8; 32],
    pub rules_digest: [u8; 32],
    pub policy_digest: [u8; 32],
    pub bidding_start: i64,
    pub bidding_deadline: i64,
    pub allow_bid_updates: bool,
    pub disclose_winning_amount: bool,
    pub state_commitment: [u8; 32],
    pub result_commitment: [u8; 32],
    pub winner_commitment: [u8; 32],
    pub public_winning_amount: Option<u64>,
    pub bid_count: u32,
    pub revision: u32,
    pub status: AuctionStatus,
    pub private_state_cleared: bool,
    pub bids: Vec<PrivateBid>,
    pub bump: u8,
}
impl AuctionSession {
    pub const SPACE: usize = 32
        + 32
        + 32
        + 32
        + 32
        + 32
        + 8
        + 8
        + 1
        + 1
        + 32
        + 32
        + 32
        + 9
        + 4
        + 4
        + 1
        + 1
        + 4
        + MAX_BIDS * PrivateBid::SPACE
        + 1;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Default)]
pub struct PrivateBid {
    pub bidder_commitment: [u8; 32],
    pub amount: u64,
    pub salt: [u8; 32],
    pub revision: u32,
    pub submitted_at: i64,
}
impl PrivateBid {
    pub const SPACE: usize = 32 + 8 + 32 + 4 + 8;
}

#[account]
pub struct BidderAuthorization {
    pub auction: Pubkey,
    pub bidder_commitment: [u8; 32],
    pub bidder_wallet: Pubkey,
    pub authorized_by: Pubkey,
    pub authorized_at: i64,
    pub active: bool,
    pub bump: u8,
}
impl BidderAuthorization {
    pub const SPACE: usize = 32 + 32 + 32 + 32 + 8 + 1 + 1;
}

#[account]
pub struct SettlementReceipt {
    pub auction: Pubkey,
    pub receipt_id: [u8; 32],
    pub auction_id: [u8; 32],
    pub rules_digest: [u8; 32],
    pub policy_digest: [u8; 32],
    pub result_commitment: [u8; 32],
    pub session_reference: [u8; 32],
    pub solana_signature: String,
    pub slot: u64,
    pub finality: u8,
    pub created_at: i64,
    pub bump: u8,
}
impl SettlementReceipt {
    pub const SPACE: usize = 32 + 32 + 32 + 32 + 32 + 32 + 32 + 4 + 128 + 8 + 1 + 8 + 1;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, Default)]
pub enum AuctionStatus {
    #[default]
    Scheduled,
    Active,
    Closed,
    Finalized,
    RecoveryPending,
    Cancelled,
}

#[event]
pub struct AuctionInitialized {
    pub auction: Pubkey,
    pub auction_id: [u8; 32],
    pub authority: Pubkey,
    pub bidding_start: i64,
    pub bidding_deadline: i64,
    pub rules_digest: [u8; 32],
    pub policy_digest: [u8; 32],
}

#[error_code]
pub enum AuctionError {
    #[msg("Auction start is in the past")]
    StartInPast,
    #[msg("Auction deadline is invalid")]
    InvalidDeadline,
    #[msg("Auction id is invalid")]
    InvalidAuctionId,
    #[msg("Rules digest is invalid")]
    InvalidRulesDigest,
    #[msg("Policy digest is invalid")]
    InvalidPolicyDigest,
    #[msg("Invalid auction status")]
    InvalidStatus,
    #[msg("Auction has not started")]
    TooEarly,
    #[msg("Auction deadline has passed")]
    DeadlinePassed,
    #[msg("Bidder commitment is invalid")]
    InvalidBidderCommitment,
    #[msg("Bidder is not authorized")]
    BidderNotAuthorized,
    #[msg("Bidder commitment does not match authorization")]
    BidderCommitmentMismatch,
    #[msg("Bidder wallet does not match authorization")]
    BidderWalletMismatch,
    #[msg("Bidder authorization belongs to another auction")]
    AuthorizationMismatch,
    #[msg("Bid amount is invalid")]
    InvalidAmount,
    #[msg("Bid updates are disabled")]
    BidUpdatesDisabled,
    #[msg("Bid revision is replayed")]
    RevisionReplay,
    #[msg("Initial bid revision must be zero")]
    InvalidRevision,
    #[msg("Bid capacity reached")]
    BidCapacityReached,
    #[msg("Arithmetic overflow")]
    ArithmeticOverflow,
    #[msg("No valid bids exist")]
    NoValidBids,
    #[msg("Private state was not cleared")]
    PrivateStateNotCleared,
    #[msg("Receipt id is invalid")]
    InvalidReceiptId,
    #[msg("Signature is too long")]
    SignatureTooLong,
    #[msg("Receipt is not final")]
    ReceiptNotFinal,
    #[msg("Deadline has not been reached")]
    DeadlineNotReached,
    #[msg("Invalid MagicBlock permission account")]
    InvalidPermissionAccount,
    #[msg("Invalid MagicBlock account")]
    InvalidMagicBlockAccount,
    #[msg("Invalid MagicBlock permission program")]
    InvalidPermissionProgram,
    #[msg("Session belongs to another auction")]
    SessionAuctionMismatch,
    #[msg("Invalid bidder authorization account")]
    InvalidAuthorizationAccount,
    #[msg("Duplicate permission member")]
    DuplicatePermissionMember,
    #[msg("Permission member capacity reached")]
    PermissionMemberCapacityReached,
}

fn is_zero(value: &[u8; 32]) -> bool {
    value.iter().all(|byte| *byte == 0)
}

fn session_reference(auction_id: &[u8; 32]) -> [u8; 32] {
    let mut hasher = Sha256::new();
    hasher.update(b"privatedao-auction-session-v1");
    hasher.update(auction_id);
    hasher.finalize().into()
}

fn result_commitment(
    auction_id: &[u8; 32],
    rules: &[u8; 32],
    policy: &[u8; 32],
    winner: &[u8; 32],
    amount: u64,
    bid_count: u32,
    deadline: i64,
) -> [u8; 32] {
    let mut hasher = Sha256::new();
    hasher.update(b"privatedao-auction-result-v1");
    hasher.update(auction_id);
    hasher.update(rules);
    hasher.update(policy);
    hasher.update(winner);
    hasher.update(amount.to_le_bytes());
    hasher.update(bid_count.to_le_bytes());
    hasher.update(deadline.to_le_bytes());
    hasher.finalize().into()
}

fn state_commitment(session: &AuctionSession) -> [u8; 32] {
    let mut hasher = Sha256::new();
    hasher.update(b"privatedao-auction-state-v1");
    hasher.update(session.auction.as_ref());
    hasher.update(session.result_commitment);
    hasher.update(session.winner_commitment);
    hasher.update(session.bid_count.to_le_bytes());
    hasher.update(session.revision.to_le_bytes());
    hasher.finalize().into()
}

fn validate_permission_accounts(accounts: &PermissionContext) -> Result<()> {
    let (permission, _) = EphemeralPermission::find_pda(&accounts.session.key());
    require_keys_eq!(
        accounts.permission.key(),
        permission,
        AuctionError::InvalidPermissionAccount
    );
    require_keys_eq!(
        accounts.ephemeral_vault.key(),
        EPHEMERAL_VAULT_ID,
        AuctionError::InvalidMagicBlockAccount
    );
    require_keys_eq!(
        accounts.magic_program.key(),
        MAGIC_PROGRAM_ID,
        AuctionError::InvalidMagicBlockAccount
    );
    require_keys_eq!(
        accounts.permission_program.key(),
        PERMISSION_PROGRAM_ID,
        AuctionError::InvalidPermissionProgram
    );
    require_keys_eq!(
        accounts.session.auction,
        accounts.config.key(),
        AuctionError::SessionAuctionMismatch
    );
    Ok(())
}

fn permission_members(ctx: &Context<PermissionContext>) -> Result<Vec<Member>> {
    let viewer_flags = TX_LOGS_FLAG | TX_MESSAGE_FLAG | TX_BALANCES_FLAG;
    let mut members = vec![Member {
        flags: viewer_flags,
        pubkey: ctx.accounts.config.authority,
    }];
    for account_info in ctx.remaining_accounts.iter() {
        let authorization = Account::<BidderAuthorization>::try_from(account_info)
            .map_err(|_| error!(AuctionError::InvalidAuthorizationAccount))?;
        require!(
            authorization.auction == ctx.accounts.config.key(),
            AuctionError::AuthorizationMismatch
        );
        if !authorization.active {
            continue;
        }
        require!(
            !members
                .iter()
                .any(|member| member.pubkey == authorization.bidder_wallet),
            AuctionError::DuplicatePermissionMember
        );
        require!(
            members.len() < MAX_PERMISSION_MEMBERS,
            AuctionError::PermissionMemberCapacityReached
        );
        members.push(Member {
            flags: viewer_flags,
            pubkey: authorization.bidder_wallet,
        });
    }
    Ok(members)
}
