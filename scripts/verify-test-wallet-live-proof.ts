import fs from "fs";
import path from "path";

type Proof = {
  programId: string;
  operatorWallet: string;
  recipientWallet: string;
  dao: string;
  governanceMint: string;
  treasury: string;
  proposal: string;
  transactions: Record<string, string>;
  invariants: {
    status: string;
    isExecuted: boolean;
    recipientBeforeLamports: number;
    recipientAfterLamports: number;
  };
};

const JSON_PATH = path.resolve("docs/test-wallet-live-proof.generated.json");
const MD_PATH = path.resolve("docs/test-wallet-live-proof.generated.md");

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function main() {
  const json = JSON.parse(fs.readFileSync(JSON_PATH, "utf8")) as Proof;
  const markdown = fs.readFileSync(MD_PATH, "utf8");

  assert(json.programId === "5AhUsbQ4mJ8Xh7QJEomuS85qGgmK9iNvFqzF669Y7Psx", "unexpected program id in test-wallet live proof");
  assert(json.invariants.status === "Passed", "test-wallet live proof must show Passed");
  assert(json.invariants.isExecuted === true, "test-wallet live proof must show executed proposal");
  assert(json.invariants.recipientAfterLamports > json.invariants.recipientBeforeLamports, "recipient balance must increase");

  for (const value of [json.operatorWallet, json.recipientWallet, json.dao, json.governanceMint, json.treasury, json.proposal]) {
    assert(markdown.includes(`\`${value}\``), `markdown missing expected address ${value}`);
  }

  for (const [label, signature] of Object.entries(json.transactions)) {
    assert(signature.length > 20, `transaction signature too short for ${label}`);
    assert(markdown.includes(`\`${label}\``), `markdown missing transaction label ${label}`);
    assert(markdown.includes(`\`${signature}\``), `markdown missing transaction signature ${label}`);
  }

  console.log("Test-wallet live proof verification: PASS");
}

main();
