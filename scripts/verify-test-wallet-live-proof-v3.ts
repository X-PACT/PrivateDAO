import fs from "fs";
import path from "path";

type ProofV3 = {
  programId: string;
  operatorWallet: string;
  governanceV3: {
    dao: string;
    governanceMint: string;
    treasury: string;
    proposal: string;
    governancePolicy: string;
    governanceSnapshot: string;
    revealRebateVault: string;
    recipientWallet: string;
    transactions: Record<string, string>;
    invariants: {
      status: string;
      isExecuted: boolean;
      revealVaultBeforeLamports: number;
      revealVaultAfterLamports: number;
      recipientBeforeLamports: number;
      recipientAfterLamports: number;
    };
  };
  settlementV3: {
    dao: string;
    treasury: string;
    proposal: string;
    securityPolicy: string;
    governancePolicy: string;
    governanceSnapshot: string;
    settlementPolicy: string;
    settlementSnapshot: string;
    payoutPlan: string;
    refheEnvelope: string;
    magicblockCorridor: string;
    settlementEvidence: string;
    settlementConsumptionRecord: string;
    settlementRecipient: string;
    transactions: Record<string, string>;
    invariants: {
      status: string;
      isExecuted: boolean;
      evidenceConsumed: boolean;
      recipientBeforeLamports: number;
      recipientAfterLamports: number;
    };
  };
};

const JSON_PATH = path.resolve("docs/test-wallet-live-proof-v3.generated.json");
const MD_PATH = path.resolve("docs/test-wallet-live-proof-v3.generated.md");

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function assertMarkdownHas(markdown: string, value: string, label: string) {
  assert(markdown.includes(`\`${value}\``) || markdown.includes(value), `markdown missing ${label}: ${value}`);
}

function main() {
  const json = JSON.parse(fs.readFileSync(JSON_PATH, "utf8")) as ProofV3;
  const markdown = fs.readFileSync(MD_PATH, "utf8");

  assert(json.programId === "5AhUsbQ4mJ8Xh7QJEomuS85qGgmK9iNvFqzF669Y7Psx", "unexpected program id in V3 live proof");

  assert(json.governanceV3.invariants.status === "Passed", "governance V3 proof must show Passed");
  assert(json.governanceV3.invariants.isExecuted === true, "governance V3 proof must show executed proposal");
  assert(json.governanceV3.invariants.revealVaultBeforeLamports > json.governanceV3.invariants.revealVaultAfterLamports, "governance V3 rebate vault must be debited");
  assert(json.governanceV3.invariants.recipientAfterLamports > json.governanceV3.invariants.recipientBeforeLamports, "governance V3 recipient balance must increase");

  assert(json.settlementV3.invariants.status === "Passed", "settlement V3 proof must show Passed");
  assert(json.settlementV3.invariants.isExecuted === true, "settlement V3 proof must show executed proposal");
  assert(json.settlementV3.invariants.evidenceConsumed === true, "settlement V3 proof must consume settlement evidence");
  assert(json.settlementV3.invariants.recipientAfterLamports > json.settlementV3.invariants.recipientBeforeLamports, "settlement V3 recipient balance must increase");

  for (const value of [
    json.operatorWallet,
    json.governanceV3.dao,
    json.governanceV3.governanceMint,
    json.governanceV3.treasury,
    json.governanceV3.proposal,
    json.governanceV3.governancePolicy,
    json.governanceV3.governanceSnapshot,
    json.governanceV3.revealRebateVault,
    json.governanceV3.recipientWallet,
    json.settlementV3.dao,
    json.settlementV3.treasury,
    json.settlementV3.proposal,
    json.settlementV3.securityPolicy,
    json.settlementV3.governancePolicy,
    json.settlementV3.governanceSnapshot,
    json.settlementV3.settlementPolicy,
    json.settlementV3.settlementSnapshot,
    json.settlementV3.payoutPlan,
    json.settlementV3.refheEnvelope,
    json.settlementV3.magicblockCorridor,
    json.settlementV3.settlementEvidence,
    json.settlementV3.settlementConsumptionRecord,
    json.settlementV3.settlementRecipient,
  ]) {
    assertMarkdownHas(markdown, value, "address");
  }

  for (const [label, signature] of Object.entries({
    ...json.governanceV3.transactions,
    ...json.settlementV3.transactions,
  })) {
    assert(signature.length > 20, `transaction signature too short for ${label}`);
    assertMarkdownHas(markdown, label, "transaction label");
    assertMarkdownHas(markdown, signature, `transaction signature ${label}`);
  }

  console.log("Test-wallet live proof V3 verification: PASS");
}

main();
