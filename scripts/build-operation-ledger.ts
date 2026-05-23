import fs from "fs";
import path from "path";

type LedgerEntry = {
  id: string;
  lane: "custody" | "zk" | "refhe-fhe" | "runtime";
  status: "verified" | "code-ready" | "pending-signature" | "pending-runtime-capture";
  title: string;
  evidence: string[];
  verification: string[];
};

function main() {
  const entries: LedgerEntry[] = [
    {
      id: "squads-testnet-upgrade-authority",
      lane: "custody",
      status: "verified",
      title: "Testnet program upgrade authority transferred to Squads 2-of-3 vault",
      evidence: [
        "docs/squads-testnet-custody-transfer-2026-05-22.md",
        "docs/custody-observed-readouts.json",
      ],
      verification: [
        "solana program show EP9xE8MJZ6FfyEwLqns6HDdUZBknEa7WGYs1Jzsecuva --url https://api.testnet.solana.com",
        "npm run verify:canonical-custody-proof",
      ],
    },
    {
      id: "dao-authority-handoff",
      lane: "custody",
      status: "pending-signature",
      title: "DAO operating authority handoff instruction is implemented and packaged in an active Squads upgrade proposal",
      evidence: [
        "docs/dao-treasury-authority-handoff-2026-05-23.md",
        "docs/squads-testnet-upgrade-proposal-2026-05-23.md",
        "programs/private-dao/src/dao.rs",
        "tests/private-dao.ts",
      ],
      verification: [
        "anchor build",
        "solana program dump HSX3ZK3BzueJnVy4EmrQ5xHUPq3LtXxxaVWuuZqew1Mz /tmp/privatedao-buffer-final.so --url https://api.testnet.solana.com",
        "node --import tsx ./node_modules/mocha/bin/mocha --timeout 20000 --exit test/unit/anonymous-governance-primitive.unit.ts",
      ],
    },
    {
      id: "anonymous-governance-primitive",
      lane: "zk",
      status: "verified",
      title: "Solana anonymous governance primitive packaged with frozen roots, nullifiers, and tally modes",
      evidence: [
        "docs/solana-anonymous-governance-primitive.md",
        "sdk/src/index.ts",
        "test/unit/anonymous-governance-primitive.unit.ts",
      ],
      verification: [
        "node --import tsx ./node_modules/mocha/bin/mocha --timeout 20000 --exit test/unit/anonymous-governance-primitive.unit.ts",
        "npm run zk:verify:sample",
      ],
    },
    {
      id: "zk-enforced-runtime",
      lane: "zk",
      status: "pending-runtime-capture",
      title: "ZK-enforced runtime captures remain machine-tracked until wallet evidence closes them",
      evidence: [
        "docs/zk/enforced-runtime.generated.json",
        "docs/zk/enforced-runtime-captures.json",
        "docs/zk/enforced-operator-flow.md",
      ],
      verification: [
        "npm run build:zk-enforced-runtime",
        "npm run verify:zk-enforced-runtime",
      ],
    },
    {
      id: "refhe-fhe-confidential-ops",
      lane: "refhe-fhe",
      status: "pending-runtime-capture",
      title: "REFHE/FHE confidential operations are documented with explicit runtime and audit boundaries",
      evidence: [
        "docs/refhe-protocol.md",
        "docs/refhe-security-model.md",
        "docs/refhe-operator-flow.md",
        "docs/encrypt-ika-2pcmpc-refhe-desktop-report-2026-05-21.md",
      ],
      verification: [
        "npm run configure:refhe",
        "npm run settle:refhe",
        "npm run inspect:refhe",
      ],
    },
  ];

  const payload = {
    project: "PrivateDAO",
    generatedAt: new Date().toISOString(),
    purpose:
      "Machine-readable operation ledger for custody, ZK, and REFHE/FHE evidence surfaced on the reviewer site.",
    entries,
  };

  fs.writeFileSync(
    path.resolve("docs/operation-ledger.generated.json"),
    `${JSON.stringify(payload, null, 2)}\n`,
  );
  fs.writeFileSync(path.resolve("docs/operation-ledger.generated.md"), buildMarkdown(payload));
  console.log("Wrote operation ledger");
}

function buildMarkdown(payload: {
  project: string;
  generatedAt: string;
  purpose: string;
  entries: LedgerEntry[];
}) {
  return `# Operation Ledger

- project: \`${payload.project}\`
- generated at: \`${payload.generatedAt}\`
- purpose: ${payload.purpose}

## Entries

${payload.entries
  .map(
    (entry) => `### ${entry.title}

- id: \`${entry.id}\`
- lane: \`${entry.lane}\`
- status: \`${entry.status}\`
- evidence:
${entry.evidence.map((item) => `  - \`${item}\``).join("\n")}
- verification:
${entry.verification.map((item) => `  - \`${item}\``).join("\n")}`,
  )
  .join("\n\n")}

## Boundary

This ledger records what is verified, what is code-ready, and what still needs runtime signatures or wallet captures. It must not be used to claim a DAO authority transfer, treasury authority handoff, ZK-enforced runtime close, or REFHE/FHE production close until the corresponding signature or capture exists in the evidence files above.
`;
}

main();
