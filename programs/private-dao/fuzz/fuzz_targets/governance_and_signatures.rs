#![no_main]

use arbitrary::Arbitrary;
use libfuzzer_sys::fuzz_target;

use anchor_lang::prelude::Pubkey;
use private_dao::{
    utils::{
        compute_vote_commitment,
        validate_attestor_policy,
        validate_governance_policy_v3,
        validate_magicblock_tx_signature,
        validate_voting_config,
    },
    QuorumPolicyV3,
    RevealRebatePolicyV3,
    VotingConfig,
    MAX_POLICY_ATTESTORS,
    MAX_REVEAL_REBATE_V3_LAMPORTS,
};

#[derive(Arbitrary, Debug)]
struct GovernanceInput {
    vote: bool,
    salt: [u8; 32],
    proposal: [u8; 32],
    voter: [u8; 32],
    signature: String,
    allow_empty_signature: bool,
    voting_mode: u8,
    capital_threshold: u8,
    community_threshold: u8,
    attestors: [[u8; 32]; MAX_POLICY_ATTESTORS],
    attestor_count: u8,
    threshold: u8,
    quorum_policy: u8,
    reveal_rebate_policy: u8,
    reveal_rebate_lamports: u64,
}

fuzz_target!(|input: GovernanceInput| {
    let _ = compute_vote_commitment(
        &Pubkey::new_from_array(input.proposal),
        &Pubkey::new_from_array(input.voter),
        input.vote,
        &input.salt,
    );

    let voting_config = match input.voting_mode % 3 {
        0 => VotingConfig::TokenWeighted,
        1 => VotingConfig::Quadratic,
        _ => VotingConfig::DualChamber {
            capital_threshold: input.capital_threshold,
            community_threshold: input.community_threshold,
        },
    };
    let _ = validate_voting_config(&voting_config);

    let attestors = input.attestors.map(Pubkey::new_from_array);
    let _ = validate_attestor_policy(
        &attestors,
        input.attestor_count.min(MAX_POLICY_ATTESTORS as u8),
        input.threshold,
    );

    let quorum_policy = if input.quorum_policy % 2 == 0 {
        QuorumPolicyV3::LegacyRevealParticipation
    } else {
        QuorumPolicyV3::TokenSupplyParticipation
    };
    let rebate_policy = if input.reveal_rebate_policy % 2 == 0 {
        RevealRebatePolicyV3::Disabled
    } else {
        RevealRebatePolicyV3::DedicatedVaultRequired
    };

    let _ = validate_governance_policy_v3(
        &quorum_policy,
        &rebate_policy,
        input.reveal_rebate_lamports % (MAX_REVEAL_REBATE_V3_LAMPORTS.saturating_add(2)),
    );

    let _ = validate_magicblock_tx_signature(&input.signature, input.allow_empty_signature);
});
