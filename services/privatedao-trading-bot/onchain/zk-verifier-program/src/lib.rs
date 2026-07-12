use groth16_solana::groth16::Groth16Verifier;
use solana_program::{
    account_info::AccountInfo, entrypoint, entrypoint::ProgramResult, msg,
    program_error::ProgramError, pubkey::Pubkey,
};

mod verifying_key;

const NR_INPUTS: usize = 8;
const PROOF_A_LEN: usize = 64;
const PROOF_B_LEN: usize = 128;
const PROOF_C_LEN: usize = 64;
const PUBLIC_INPUTS_LEN: usize = NR_INPUTS * 32;
const MIN_INSTRUCTION_LEN: usize = PROOF_A_LEN + PROOF_B_LEN + PROOF_C_LEN + PUBLIC_INPUTS_LEN;

entrypoint!(process_instruction);

pub fn process_instruction(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let signer = accounts.first().ok_or(ProgramError::NotEnoughAccountKeys)?;
    if !signer.is_signer {
        msg!("PrivateDAO ZK verifier rejected: missing signer");
        return Err(ProgramError::MissingRequiredSignature);
    }

    verify_instruction(instruction_data)?;
    msg!("PrivateDAO Groth16 proof verified on-chain");
    Ok(())
}

pub fn verify_instruction(instruction_data: &[u8]) -> ProgramResult {
    if instruction_data.len() < MIN_INSTRUCTION_LEN {
        msg!("PrivateDAO ZK verifier rejected: invalid instruction length");
        return Err(ProgramError::InvalidInstructionData);
    }

    let proof_a: [u8; PROOF_A_LEN] = instruction_data[0..64]
        .try_into()
        .map_err(|_| ProgramError::InvalidInstructionData)?;
    let proof_b: [u8; PROOF_B_LEN] = instruction_data[64..192]
        .try_into()
        .map_err(|_| ProgramError::InvalidInstructionData)?;
    let proof_c: [u8; PROOF_C_LEN] = instruction_data[192..256]
        .try_into()
        .map_err(|_| ProgramError::InvalidInstructionData)?;

    let mut public_inputs = [[0u8; 32]; NR_INPUTS];
    let mut offset = 256;
    for input in public_inputs.iter_mut() {
        input.copy_from_slice(&instruction_data[offset..offset + 32]);
        offset += 32;
    }

    let mut verifier = Groth16Verifier::<NR_INPUTS>::new(
        &proof_a,
        &proof_b,
        &proof_c,
        &public_inputs,
        &verifying_key::VERIFYINGKEY,
    )
    .map_err(|_| ProgramError::InvalidInstructionData)?;

    verifier
        .verify()
        .map_err(|_| ProgramError::InvalidInstructionData)
}

#[cfg(test)]
mod tests {
    use super::*;
    include!(concat!(env!("OUT_DIR"), "/test_vectors.rs"));

    #[test]
    fn verifies_fixture_instruction() {
        verify_instruction(&TEST_INSTRUCTION_DATA).unwrap();
    }
}
