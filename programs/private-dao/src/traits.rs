use anchor_lang::prelude::*;

use crate::{Proposal, ProposalStatus, TreasuryAction, TreasuryActionType};

pub trait VoteCommitment {
    fn compute(voter: &Pubkey, proposal: &Pubkey, vote: bool, salt: &[u8; 32]) -> [u8; 32];
}

pub struct Sha256VoteCommitment;

impl VoteCommitment for Sha256VoteCommitment {
    fn compute(voter: &Pubkey, proposal: &Pubkey, vote: bool, salt: &[u8; 32]) -> [u8; 32] {
        crate::utils::compute_vote_commitment(proposal, voter, vote, salt)
    }
}

pub trait ProposalLifecycle {
    fn is_voting_open_at(&self, now: i64) -> bool;
    fn is_reveal_open_at(&self, now: i64) -> bool;
    fn is_execution_ready_at(&self, now: i64) -> bool;
}

impl ProposalLifecycle for Proposal {
    fn is_voting_open_at(&self, now: i64) -> bool {
        self.status == ProposalStatus::Voting && now < self.voting_end
    }

    fn is_reveal_open_at(&self, now: i64) -> bool {
        self.status == ProposalStatus::Voting && now >= self.voting_end && now < self.reveal_end
    }

    fn is_execution_ready_at(&self, now: i64) -> bool {
        self.status == ProposalStatus::Passed && now >= self.execution_unlocks_at && !self.is_executed
    }
}

pub trait TreasuryActionPolicy {
    fn requires_token_mint(&self) -> bool;
    fn allows_native_sol_transfer(&self) -> bool;
}

impl TreasuryActionPolicy for TreasuryAction {
    fn requires_token_mint(&self) -> bool {
        matches!(self.action_type, TreasuryActionType::SendToken)
    }

    fn allows_native_sol_transfer(&self) -> bool {
        matches!(self.action_type, TreasuryActionType::SendSol)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn sample_proposal(status: ProposalStatus) -> Proposal {
        Proposal {
            dao: Pubkey::new_from_array([1; 32]),
            proposer: Pubkey::new_from_array([2; 32]),
            proposal_id: 7,
            title: "Test proposal".to_string(),
            description: "Lifecycle semantics".to_string(),
            status,
            voting_end: 100,
            reveal_end: 200,
            yes_capital: 0,
            no_capital: 0,
            yes_community: 0,
            no_community: 0,
            commit_count: 0,
            reveal_count: 0,
            treasury_action: None,
            execution_unlocks_at: 300,
            is_executed: false,
            bump: 1,
        }
    }

    #[test]
    fn sha256_vote_commitment_trait_matches_utils() {
        let voter = Pubkey::new_from_array([3; 32]);
        let proposal = Pubkey::new_from_array([4; 32]);
        let salt = [9u8; 32];

        assert_eq!(
            Sha256VoteCommitment::compute(&voter, &proposal, true, &salt),
            crate::utils::compute_vote_commitment(&proposal, &voter, true, &salt)
        );
    }

    #[test]
    fn proposal_lifecycle_gates_voting_reveal_and_execution_windows() {
        let proposal = sample_proposal(ProposalStatus::Voting);
        assert!(proposal.is_voting_open_at(99));
        assert!(!proposal.is_voting_open_at(100));

        assert!(!proposal.is_reveal_open_at(99));
        assert!(proposal.is_reveal_open_at(100));
        assert!(proposal.is_reveal_open_at(199));
        assert!(!proposal.is_reveal_open_at(200));

        assert!(!proposal.is_execution_ready_at(300));

        let mut passed = sample_proposal(ProposalStatus::Passed);
        assert!(!passed.is_execution_ready_at(299));
        assert!(passed.is_execution_ready_at(300));
        passed.is_executed = true;
        assert!(!passed.is_execution_ready_at(300));
    }

    #[test]
    fn treasury_action_policy_reflects_asset_requirements() {
        let send_sol = TreasuryAction {
            action_type: TreasuryActionType::SendSol,
            amount_lamports: 1,
            recipient: Pubkey::new_from_array([5; 32]),
            token_mint: None,
        };
        let send_token = TreasuryAction {
            action_type: TreasuryActionType::SendToken,
            amount_lamports: 1,
            recipient: Pubkey::new_from_array([6; 32]),
            token_mint: Some(Pubkey::new_from_array([7; 32])),
        };
        let custom_cpi = TreasuryAction {
            action_type: TreasuryActionType::CustomCPI,
            amount_lamports: 1,
            recipient: Pubkey::new_from_array([8; 32]),
            token_mint: None,
        };

        assert!(send_sol.allows_native_sol_transfer());
        assert!(!send_sol.requires_token_mint());

        assert!(!send_token.allows_native_sol_transfer());
        assert!(send_token.requires_token_mint());

        assert!(!custom_cpi.allows_native_sol_transfer());
        assert!(!custom_cpi.requires_token_mint());
    }
}
