#![no_main]

use arbitrary::Arbitrary;
use libfuzzer_sys::fuzz_target;

use anchor_lang::prelude::Pubkey;
use private_dao::{
    validate_confidential_payout_plan, validate_magicblock_corridor, validate_refhe_envelope,
    validate_settlement_policy_v3, ConfidentialAssetType,
};

#[derive(Arbitrary, Debug)]
struct ConfidentialSettlementInput {
    asset_type: u8,
    settlement_recipient: [u8; 32],
    token_mint: Option<[u8; 32]>,
    recipient_count: u16,
    total_amount: u64,
    encrypted_manifest_uri: String,
    manifest_hash: [u8; 32],
    ciphertext_hash: [u8; 32],
    model_uri: String,
    policy_hash: [u8; 32],
    input_ciphertext_hash: [u8; 32],
    evaluation_key_hash: [u8; 32],
    api_base_url: String,
    cluster: String,
    owner_wallet: [u8; 32],
    settlement_wallet: [u8; 32],
    route_hash: [u8; 32],
    deposit_amount: u64,
    private_transfer_amount: u64,
    withdrawal_amount: u64,
    min_evidence_age_seconds: i64,
    max_payout_amount: u64,
    require_refhe_settlement: bool,
    require_magicblock_settlement: bool,
}

fuzz_target!(|input: ConfidentialSettlementInput| {
    let asset_type = if input.asset_type % 2 == 0 {
        ConfidentialAssetType::Sol
    } else {
        ConfidentialAssetType::Token
    };

    let token_mint = input.token_mint.map(Pubkey::new_from_array);

    let _ = validate_confidential_payout_plan(
        &asset_type,
        Pubkey::new_from_array(input.settlement_recipient),
        &token_mint,
        input.recipient_count,
        input.total_amount,
        &input.encrypted_manifest_uri,
        &input.manifest_hash,
        &input.ciphertext_hash,
    );

    let _ = validate_refhe_envelope(
        &input.model_uri,
        &input.policy_hash,
        &input.input_ciphertext_hash,
        &input.evaluation_key_hash,
    );

    let _ = validate_magicblock_corridor(
        &input.api_base_url,
        &input.cluster,
        Pubkey::new_from_array(input.owner_wallet),
        Pubkey::new_from_array(input.settlement_wallet),
        token_mint,
        &input.route_hash,
        input.deposit_amount,
        input.private_transfer_amount,
        input.withdrawal_amount,
    );

    let _ = validate_settlement_policy_v3(
        input.min_evidence_age_seconds,
        input.max_payout_amount,
        input.require_refhe_settlement,
        input.require_magicblock_settlement,
    );
});
