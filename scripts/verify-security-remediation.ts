import fs from "fs";

function read(path: string) {
  return fs.readFileSync(path, "utf8");
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

const program = read("programs/private-dao/src/lib.rs");
const demo = read("tests/demo.ts");
const privateDaoTest = read("tests/private-dao.ts");
const remediation = read("docs/security-audit-remediation-2026-04-08.md");

assert(
  demo.includes("function makeCommitment(vote: boolean, salt: Buffer, voter: PublicKey, proposal: PublicKey): Buffer"),
  "demo commitment helper must accept proposal pubkey",
);
assert(
  demo.includes("salt, proposal.toBuffer(), voter.toBuffer()"),
  "demo commitment helper must bind proposal pubkey",
);
assert(!demo.includes("salt, voter.toBuffer()])"), "demo commitment helper must not use legacy voter-only binding");

assert(
  program.includes("&& now < p.voting_end") &&
    program.includes("&& p.commit_count == 0") &&
    program.includes("&& p.reveal_count == 0"),
  "legacy cancel_proposal must reject cancellation after participation starts",
);
assert(
  privateDaoTest.includes("rejects legacy cancellation after a commit has been recorded"),
  "missing regression test for legacy cancellation after commit",
);

assert(
  program.includes("fn validate_supported_token_program(program_id: &Pubkey) -> Result<()>") &&
    program.includes("*program_id == token::ID || *program_id == token_2022::ID"),
  "token execution paths must pin supported token programs",
);
assert(
  program.includes("*ctx.accounts.refhe_envelope.owner == crate::ID") &&
    program.includes("*ctx.accounts.magicblock_private_payment_corridor.owner == crate::ID"),
  "optional REFHE/MagicBlock companion accounts must be program-owned before deserialization",
);

assert(
  program.includes("pub const VOTER_WEIGHT_EXPIRY_SLOTS: u64 = 10_000") &&
    program.includes("Clock::get()?.slot + VOTER_WEIGHT_EXPIRY_SLOTS"),
  "voter weight expiry must use the bounded 10,000-slot constant",
);
assert(
  program.includes("((x as u128 + (n / x) as u128) / 2) as u64"),
  "isqrt Newton step must use widened arithmetic",
);

for (const required of [
  "Confirmed And Fixed",
  "Commitment Hash Mismatch In Demo Test",
  "Late Legacy Cancellation",
  "Token Program Pinning",
  "Optional REFHE / MagicBlock Account Ownership",
  "Reviewed But Not Claimed As Fully Solved",
]) {
  assert(remediation.includes(required), `security remediation doc missing section: ${required}`);
}

console.log("Security remediation verification: PASS");
