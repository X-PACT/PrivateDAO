#![no_main]

use arbitrary::Arbitrary;
use libfuzzer_sys::fuzz_target;

use anchor_lang::prelude::Pubkey;
use private_dao::{
    validate_treasury_action, TreasuryAction, TreasuryActionType,
};

#[derive(Arbitrary, Debug)]
struct TreasuryActionInput {
    action_type: u8,
    amount_lamports: u64,
    recipient: [u8; 32],
    token_mint: Option<[u8; 32]>,
}

fuzz_target!(|input: TreasuryActionInput| {
    let action_type = match input.action_type % 3 {
        0 => TreasuryActionType::SendSol,
        1 => TreasuryActionType::SendToken,
        _ => TreasuryActionType::CustomCPI,
    };

    let action = TreasuryAction {
        action_type,
        amount_lamports: input.amount_lamports,
        recipient: Pubkey::new_from_array(input.recipient),
        token_mint: input.token_mint.map(Pubkey::new_from_array),
    };

    let _ = validate_treasury_action(&action);
});
