import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { Keypair } from "@solana/web3.js";
import { assert } from "chai";

import {
  __testables,
  runAgenticMicropaymentRail,
  type MicropaymentRailReport,
} from "../../scripts/lib/micropayment-engine";

describe("micropayment engine unit coverage", () => {
  it("formats amounts with trimmed fractions", () => {
    assert.equal(__testables.formatAmount(1_230_000n, 6, "USDC"), "1.23 USDC");
    assert.equal(__testables.formatAmount(20_000n, 9, "SOL"), "0.00002 SOL");
    assert.equal(__testables.formatAmount(5_000_000_000n, 9, "SOL"), "5 SOL");
  });

  it("builds the correct SOL micropayment execution plan", () => {
    const plan = __testables.buildMicropaymentPlan({
      assetMode: "SOL",
      targetCount: 10,
      transferTarget: 50,
    });

    assert.equal(plan.batchActionCount, 5);
    assert.equal(plan.batchCount, 10);
    assert.deepEqual(plan.actionsPerBatch, [
      "proposal-approved",
      "vote-settled",
      "reveal-settled",
      "execute-settled",
      "proof-attached",
    ]);
  });

  it("builds the correct SPL micropayment execution plan", () => {
    const plan = __testables.buildMicropaymentPlan({
      assetMode: "SPL",
      targetCount: 5,
      transferTarget: 12,
    });

    assert.equal(plan.batchActionCount, 5);
    assert.equal(plan.batchCount, 3);
    assert.equal(plan.assetMode, "SPL");
    assert.equal(plan.targetCount, 5);
    assert.equal(plan.transferTarget, 12);
    assert.deepEqual(plan.actionsPerBatch, [
      "proposal-approved",
      "vote-settled",
      "reveal-settled",
      "execute-settled",
      "proof-attached",
    ]);
  });

  it("renders the markdown packet with explorer links", () => {
    const report: MicropaymentRailReport = {
      project: "PrivateDAO",
      feature: "Agentic Treasury Micropayment Rail",
      generatedAt: "2026-04-18T00:00:00.000Z",
      network: "devnet",
      assetMode: "SOL",
      settlementAssetSymbol: "SOL",
      settlementMint: null,
      targetCount: 10,
      batchCount: 10,
      transferCount: 2,
      successfulTransferCount: 2,
      executionWallet: "Wallet1111111111111111111111111111111111",
      totalAmountRaw: "100000",
      totalAmountDisplay: "0.0001 SOL",
      actionsPerBatch: ["proposal-approved", "vote-settled"],
      reportPath: "docs/agentic-treasury-micropayment-rail.generated.json",
      transfers: [
        {
          batchIndex: 0,
          action: "proposal-approved",
          recipient: "Recipient1111111111111111111111111111111",
          amountRaw: "20000",
          amountDisplay: "0.00002 SOL",
          signature: "Sig1111111111111111111111111111111111111111111111111111111111",
          explorerUrl: "https://solscan.io/tx/Sig1111111111111111111111111111111111111111111111111111111111?cluster=devnet",
          status: "finalized",
          slot: 1,
          settledAt: "2026-04-18T00:00:01.000Z",
        },
        {
          batchIndex: 0,
          action: "vote-settled",
          recipient: "Recipient2222222222222222222222222222222",
          amountRaw: "20000",
          amountDisplay: "0.00002 SOL",
          signature: "Sig2222222222222222222222222222222222222222222222222222222222",
          explorerUrl: "https://solscan.io/tx/Sig2222222222222222222222222222222222222222222222222222222222?cluster=devnet",
          status: "finalized",
          slot: 2,
          settledAt: "2026-04-18T00:00:02.000Z",
        },
      ],
    };

    const markdown = __testables.buildMicropaymentMarkdown(report);

    assert.include(markdown, "# Agentic Treasury Micropayment Rail Evidence");
    assert.include(markdown, "`0.0001 SOL`");
    assert.include(markdown, "Sig1111111111111111111111111111111111111111111111111111111111");
    assert.include(markdown, "docs/agentic-treasury-micropayment-rail.generated.json");
  });

  it("writes both JSON and markdown artifacts into the working tree", () => {
    const report: MicropaymentRailReport = {
      project: "PrivateDAO",
      feature: "Agentic Treasury Micropayment Rail",
      generatedAt: "2026-04-18T00:00:00.000Z",
      network: "devnet",
      assetMode: "SPL",
      settlementAssetSymbol: "USDC",
      settlementMint: "Mint111111111111111111111111111111111111111",
      targetCount: 5,
      batchCount: 3,
      transferCount: 1,
      successfulTransferCount: 1,
      executionWallet: "Wallet1111111111111111111111111111111111",
      totalAmountRaw: "10000",
      totalAmountDisplay: "0.01 USDC",
      actionsPerBatch: ["proposal-approved"],
      reportPath: "docs/agentic-treasury-micropayment-rail.generated.json",
      transfers: [],
    };

    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "pdao-micropayment-"));
    const cwd = process.cwd();

    try {
      process.chdir(tempDir);
      __testables.writeReportArtifacts(report);

      const jsonPath = path.join(tempDir, "docs/agentic-treasury-micropayment-rail.generated.json");
      const markdownPath = path.join(tempDir, "docs/agentic-treasury-micropayment-rail.generated.md");

      assert.equal(fs.existsSync(jsonPath), true);
      assert.equal(fs.existsSync(markdownPath), true);
      assert.include(fs.readFileSync(markdownPath, "utf8"), "0.01 USDC");
    } finally {
      process.chdir(cwd);
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("executes the SOL rail against a fake confirmed connection and emits finalized transfers", async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "pdao-micropayment-run-"));
    const wallet = Keypair.generate();
    const walletPath = path.join(tempDir, "wallet.json");
    fs.writeFileSync(walletPath, JSON.stringify(Array.from(wallet.secretKey)), "utf8");

    const signatures = Array.from({ length: 6 }, (_, index) => `sig-${index + 1}`);
    let signatureIndex = 0;
    const fakeConnection = {
      getMinimumBalanceForRentExemption: async () => 0,
      getLatestBlockhash: async () => ({
        blockhash: Keypair.generate().publicKey.toBase58(),
        lastValidBlockHeight: 1,
      }),
      sendRawTransaction: async () => signatures[signatureIndex++],
      confirmTransaction: async () => ({ value: { err: null } }),
      getTransaction: async (signature: string) => ({
        slot: signatures.indexOf(signature) + 1,
      }),
    };
    const cwd = process.cwd();

    try {
      process.chdir(tempDir);
      const report = await runAgenticMicropaymentRail({
        connection: fakeConnection as any,
        walletPath,
        targetCount: 1,
        transferTarget: 5,
      });

      assert.equal(report.assetMode, "SOL");
      assert.equal(report.transferCount, 5);
      assert.equal(report.successfulTransferCount, 5);
      assert.equal(report.executionWallet, wallet.publicKey.toBase58());
      assert.equal(report.transfers[0]?.action, "recipient-activation");
      assert.equal(report.transfers.at(-1)?.action, "execute-settled");
      assert.equal(fs.existsSync(path.join(tempDir, "docs/agentic-treasury-micropayment-rail.generated.json")), true);
    } finally {
      process.chdir(cwd);
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });
});
