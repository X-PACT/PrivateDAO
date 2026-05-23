import fs from "fs";
import path from "path";

const root = process.cwd();
const jsonPath = path.join(root, "docs/zk-standalone-verifier-testnet-2026-05-23.json");
const mdPath = path.join(root, "docs/zk-standalone-verifier-testnet-2026-05-23.md");
const programPath = path.join(root, "programs/zk-groth16-verifier/src/lib.rs");
const curatedPath = path.join(root, "apps/web/src/lib/curated-documents.ts");

function main() {
  const receipt = JSON.parse(read(jsonPath)) as {
    network: string;
    verifierProgramId: string;
    deploySignature: string;
    upgradeAuthority: string;
    upgradeAuthorityTransferSignature: string;
    receiptSignature: string;
    receiptId: string;
    publicInputsHash: string;
    pairingInputLength: number;
    syscall: string;
    event: string;
    truthBoundary: string;
  };
  const markdown = read(mdPath);
  const program = read(programPath);
  const curated = read(curatedPath);

  assert(receipt.network === "testnet", "receipt must be bound to Testnet");
  assert(receipt.verifierProgramId === "5H7Afyqdh5yPekkZJ5UM2j3HNB2bRvU8aVv8XoqeAW1j", "verifier program mismatch");
  assert(receipt.deploySignature.length >= 80, "deploy signature missing");
  assert(receipt.upgradeAuthority === "CALHrBqx6jbzcPn2NVcinqSAHeod65v9LcDuTxsdPqBv", "upgrade authority mismatch");
  assert(receipt.upgradeAuthorityTransferSignature.length >= 80, "upgrade authority transfer signature missing");
  assert(receipt.receiptSignature.length >= 80, "receipt signature missing");
  assert(receipt.receiptId.length === 64, "receipt id must be a 32-byte hex string");
  assert(receipt.publicInputsHash.length === 64, "public inputs hash must be a 32-byte hex string");
  assert(receipt.pairingInputLength === 384, "pairing input length mismatch");
  assert(receipt.syscall === "sol_alt_bn128_group_op", "syscall mismatch");
  assert(receipt.event === "Groth16ReceiptVerified", "event mismatch");
  assert(receipt.truthBoundary.includes("not yet the final embedded verification-key verifier"), "truth boundary missing");

  assertIncludes(program, "sol_alt_bn128_group_op", "program syscall");
  assertIncludes(program, "ALT_BN128_PAIRING", "program pairing op");
  assertIncludes(program, "Groth16ReceiptVerified", "program receipt event");
  assertIncludes(markdown, receipt.receiptSignature, "markdown receipt signature");
  assertIncludes(markdown, receipt.upgradeAuthorityTransferSignature, "markdown upgrade authority transfer signature");
  assertIncludes(markdown, "Boundary", "markdown boundary");
  assertIncludes(curated, "zk-standalone-verifier-testnet-2026-05-23", "curated doc route");

  console.log("ZK standalone verifier verification: PASS");
}

function read(filePath: string) {
  return fs.readFileSync(filePath, "utf8");
}

function assertIncludes(content: string, needle: string, label: string) {
  assert(content.includes(needle), `missing ${label}: ${needle}`);
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

main();
