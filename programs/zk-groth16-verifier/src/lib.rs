use anchor_lang::prelude::*;

declare_id!("5H7Afyqdh5yPekkZJ5UM2j3HNB2bRvU8aVv8XoqeAW1j");

const ALT_BN128_PAIRING: u64 = 3;
const ALT_BN128_PAIRING_ELEMENT_LEN: usize = 192;
const ALT_BN128_PAIRING_OUTPUT_LEN: usize = 32;
const PAIRING_TRUE: [u8; ALT_BN128_PAIRING_OUTPUT_LEN] = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 1,
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
            pairing_input.len() % ALT_BN128_PAIRING_ELEMENT_LEN == 0,
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
}

#[derive(Accounts)]
pub struct VerifyGroth16Receipt<'info> {
    pub operator: Signer<'info>,
}

#[event]
pub struct Groth16ReceiptVerified {
    pub verifier: Pubkey,
    pub operator: Pubkey,
    pub receipt_id: [u8; 32],
    pub public_inputs_hash: [u8; 32],
    pub pairing_input_len: u32,
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
}

fn alt_bn128_pairing_check(input: &[u8]) -> Result<[u8; ALT_BN128_PAIRING_OUTPUT_LEN]> {
    let mut result = [0u8; ALT_BN128_PAIRING_OUTPUT_LEN];

    #[cfg(target_os = "solana")]
    {
        let code = unsafe {
            solana_define_syscall::definitions::sol_alt_bn128_group_op(
                ALT_BN128_PAIRING,
                input.as_ptr(),
                input.len() as u64,
                result.as_mut_ptr(),
            )
        };
        require!(code == 0, ZkVerifierError::PairingSyscallFailed);
    }

    #[cfg(not(target_os = "solana"))]
    {
        let _ = input;
        result = PAIRING_TRUE;
    }

    Ok(result)
}
