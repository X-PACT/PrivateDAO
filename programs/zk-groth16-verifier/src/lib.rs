#![allow(unexpected_cfgs)]
#![allow(clippy::diverging_sub_expression)]
#![allow(clippy::too_many_arguments)]

use anchor_lang::prelude::*;

declare_id!("GGqZKsdEwH9YVAqWYqjMgCmZ5nNbvGc8RkiMee3S6SdK");

#[cfg(target_os = "solana")]
const ALT_BN128_PAIRING: u64 = 3;
const ALT_BN128_PAIRING_ELEMENT_LEN: usize = 192;
const ALT_BN128_PAIRING_OUTPUT_LEN: usize = 32;
const PAIRING_TRUE: [u8; ALT_BN128_PAIRING_OUTPUT_LEN] = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
];

#[program]
pub mod zk_groth16_verifier {
    use super::*;

    pub fn verify_groth16_receipt(
        ctx: Context<VerifyGroth16Receipt>,
        receipt_id: [u8; 32],
        public_inputs_hash: [u8; 32],
        pairing_input: Vec<u8>,
    ) -> Result<()> {
        require!(
            pairing_input
                .len()
                .is_multiple_of(ALT_BN128_PAIRING_ELEMENT_LEN),
            ZkVerifierError::InvalidPairingInputLength
        );
        require!(
            !pairing_input.is_empty(),
            ZkVerifierError::InvalidPairingInputLength
        );
        require!(
            pairing_input.len() <= 768,
            ZkVerifierError::PairingInputTooLarge
        );

        let output = alt_bn128_pairing_check(&pairing_input)?;
        require!(output == PAIRING_TRUE, ZkVerifierError::InvalidPairingProof);

        emit!(Groth16ReceiptVerified {
            verifier: crate::ID,
            operator: ctx.accounts.operator.key(),
            receipt_id,
            public_inputs_hash,
            pairing_input_len: pairing_input.len() as u32,
        });

        Ok(())
    }

    pub fn store_blind_policy_receipt(
        ctx: Context<StoreBlindPolicyReceipt>,
        receipt_id: [u8; 32],
        proof_hash: [u8; 32],
        policy_commitment_hash: [u8; 32],
        input_commitment_hash: [u8; 32],
        verification_key_hash: [u8; 32],
        circuit_version_hash: [u8; 32],
        policy_version_hash: [u8; 32],
        issued_at: i64,
        expires_at: i64,
    ) -> Result<()> {
        require!(proof_hash != [0u8; 32], ZkVerifierError::ZeroHash);
        require!(
            policy_commitment_hash != [0u8; 32],
            ZkVerifierError::ZeroHash
        );
        require!(
            input_commitment_hash != [0u8; 32],
            ZkVerifierError::ZeroHash
        );
        require!(
            verification_key_hash != [0u8; 32],
            ZkVerifierError::ZeroHash
        );
        require!(expires_at > issued_at, ZkVerifierError::InvalidReceiptTime);

        let receipt = &mut ctx.accounts.receipt;
        receipt.authority = ctx.accounts.authority.key();
        receipt.receipt_id = receipt_id;
        receipt.proof_hash = proof_hash;
        receipt.policy_commitment_hash = policy_commitment_hash;
        receipt.input_commitment_hash = input_commitment_hash;
        receipt.verification_key_hash = verification_key_hash;
        receipt.circuit_version_hash = circuit_version_hash;
        receipt.policy_version_hash = policy_version_hash;
        receipt.issued_at = issued_at;
        receipt.expires_at = expires_at;
        receipt.bump = ctx.bumps.receipt;

        emit!(BlindPolicyReceiptStored {
            verifier: crate::ID,
            authority: ctx.accounts.authority.key(),
            receipt: ctx.accounts.receipt.key(),
            receipt_id,
            proof_hash,
            policy_commitment_hash,
            input_commitment_hash,
            verification_key_hash,
            circuit_version_hash,
            policy_version_hash,
            issued_at,
            expires_at,
        });

        Ok(())
    }
}

#[derive(Accounts)]
pub struct VerifyGroth16Receipt<'info> {
    pub operator: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(receipt_id: [u8; 32])]
pub struct StoreBlindPolicyReceipt<'info> {
    #[account(
        init,
        payer = authority,
        space = BlindPolicyReceipt::SPACE,
        seeds = [b"blind_policy_receipt", authority.key().as_ref(), receipt_id.as_ref()],
        bump
    )]
    pub receipt: Account<'info, BlindPolicyReceipt>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct BlindPolicyReceipt {
    pub authority: Pubkey,
    pub receipt_id: [u8; 32],
    pub proof_hash: [u8; 32],
    pub policy_commitment_hash: [u8; 32],
    pub input_commitment_hash: [u8; 32],
    pub verification_key_hash: [u8; 32],
    pub circuit_version_hash: [u8; 32],
    pub policy_version_hash: [u8; 32],
    pub issued_at: i64,
    pub expires_at: i64,
    pub bump: u8,
}

impl BlindPolicyReceipt {
    pub const SPACE: usize = 8 + 32 + (32 * 7) + 8 + 8 + 1;
}

#[event]
pub struct Groth16ReceiptVerified {
    pub verifier: Pubkey,
    pub operator: Pubkey,
    pub receipt_id: [u8; 32],
    pub public_inputs_hash: [u8; 32],
    pub pairing_input_len: u32,
}

#[event]
pub struct BlindPolicyReceiptStored {
    pub verifier: Pubkey,
    pub authority: Pubkey,
    pub receipt: Pubkey,
    pub receipt_id: [u8; 32],
    pub proof_hash: [u8; 32],
    pub policy_commitment_hash: [u8; 32],
    pub input_commitment_hash: [u8; 32],
    pub verification_key_hash: [u8; 32],
    pub circuit_version_hash: [u8; 32],
    pub policy_version_hash: [u8; 32],
    pub issued_at: i64,
    pub expires_at: i64,
}

#[error_code]
pub enum ZkVerifierError {
    #[msg("Pairing input length must be a multiple of one BN254 G1/G2 pair")]
    InvalidPairingInputLength,
    #[msg("Pairing input exceeds the bounded receipt size")]
    PairingInputTooLarge,
    #[msg("Solana alt_bn128 pairing syscall rejected the input")]
    PairingSyscallFailed,
    #[msg("Pairing check returned false")]
    InvalidPairingProof,
    #[msg("Receipt hash fields cannot be zero")]
    ZeroHash,
    #[msg("Receipt expiry must be after issuance")]
    InvalidReceiptTime,
}

fn alt_bn128_pairing_check(input: &[u8]) -> Result<[u8; ALT_BN128_PAIRING_OUTPUT_LEN]> {
    #[cfg(target_os = "solana")]
    {
        let mut result = [0u8; ALT_BN128_PAIRING_OUTPUT_LEN];
        let code = unsafe {
            solana_define_syscall::definitions::sol_alt_bn128_group_op(
                ALT_BN128_PAIRING,
                input.as_ptr(),
                input.len() as u64,
                result.as_mut_ptr(),
            )
        };
        require!(code == 0, ZkVerifierError::PairingSyscallFailed);
        Ok(result)
    }

    #[cfg(not(target_os = "solana"))]
    {
        let _ = input;
        Ok(PAIRING_TRUE)
    }
}
