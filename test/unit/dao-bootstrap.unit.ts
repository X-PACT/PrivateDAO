import { assert } from "chai";
import { Keypair, PublicKey } from "@solana/web3.js";

import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  awaitLiveSignatureOnCluster,
  buildCreateDaoBootstrapTransaction,
  buildCreateProposalTransaction,
  buildExecuteProposalTransaction,
  buildFinalizeProposalTransaction,
  buildRevealVoteTransaction,
  computeProposalCommitment,
  fetchDaoAccountDetails,
  fetchGovernanceHolderSnapshot,
  fetchProposalAccountDetails,
  TOKEN_PROGRAM_ID,
} from "../../apps/web/src/lib/dao-bootstrap";

type MockConnection = {
  getAccountInfo: (address: { toBase58?: () => string } | unknown, commitment?: unknown) => Promise<unknown>;
  getMinimumBalanceForRentExemption: (space: number, commitment?: unknown) => Promise<number>;
  getLatestBlockhash: (commitment?: unknown) => Promise<{ blockhash: string; lastValidBlockHeight: number }>;
  getRecentBlockhash?: (commitment?: unknown) => Promise<{ blockhash: string }>;
  getSignatureStatuses?: (
    signatures: string[],
    options?: unknown,
  ) => Promise<{ value: Array<{ confirmationStatus: string | null; err: unknown; slot?: number; status?: unknown } | null> }>;
  getTokenAccountBalance: (
    address: { toBase58?: () => string } | unknown,
    commitment?: unknown,
  ) => Promise<{ value: { amount: string } }>;
  getTransaction?: (signature: string, options?: unknown) => Promise<{ meta?: { err: unknown }; slot: number } | null>;
};

function createConnection(options?: {
  accounts?: Record<string, { owner: { equals: (target: unknown) => boolean; toBase58: () => string } }>;
  tokenBalances?: Record<string, string>;
  latestBlockhashError?: Error;
  latestBlockhash?: { blockhash: string; lastValidBlockHeight: number };
  recentBlockhash?: { blockhash: string };
  signatureStatuses?: Array<{ confirmationStatus: string | null; err: unknown; slot?: number; status?: unknown } | null>;
  transactionBySignature?: Record<string, { meta?: { err: unknown }; slot: number } | null>;
}) : MockConnection {
  return {
    async getAccountInfo(address) {
      const key = typeof address === "object" && address && "toBase58" in address
        ? address.toBase58?.()
        : undefined;
      return (key && options?.accounts?.[key]) ?? null;
    },
    async getMinimumBalanceForRentExemption(space: number) {
      assert.equal(space, 82);
      return 1_500_000;
    },
    async getLatestBlockhash() {
      if (options?.latestBlockhashError) {
        throw options.latestBlockhashError;
      }
      if (options?.latestBlockhash) {
        return options.latestBlockhash;
      }
      return {
        blockhash: "11111111111111111111111111111111",
        lastValidBlockHeight: 1,
      };
    },
    async getRecentBlockhash() {
      return options?.recentBlockhash ?? { blockhash: "22222222222222222222222222222222" };
    },
    async getSignatureStatuses() {
      return {
        value: options?.signatureStatuses ?? [null],
      };
    },
    async getTokenAccountBalance(address) {
      const key = typeof address === "object" && address && "toBase58" in address
        ? address.toBase58?.()
        : undefined;
      return {
        value: {
          amount: (key && options?.tokenBalances?.[key]) ?? "0",
        },
      };
    },
    async getTransaction(signature) {
      return options?.transactionBySignature?.[signature] ?? null;
    },
  };
}

function deriveAta(owner: PublicKey, mint: PublicKey, tokenProgram = TOKEN_PROGRAM_ID) {
  const [ata] = PublicKey.findProgramAddressSync(
    [owner.toBytes(), tokenProgram.toBytes(), mint.toBytes()],
    ASSOCIATED_TOKEN_PROGRAM_ID,
  );
  return ata;
}

async function expectRejected(promise: Promise<unknown>, pattern: RegExp) {
  try {
    await promise;
    assert.fail(`expected rejection matching ${pattern}`);
  } catch (error) {
    assert.match(String(error), pattern);
  }
}

describe("dao bootstrap unit coverage", () => {
  it("rejects DAO names that exceed the PDA seed limit before signing", async () => {
    const authority = Keypair.generate().publicKey;

    try {
      await buildCreateDaoBootstrapTransaction({
        authority,
        connection: createConnection() as never,
        name: "PDAO ".repeat(7),
        quorum: 60,
      });
      assert.fail("expected DAO name length guard");
    } catch (error) {
      assert.include(String(error), "PDA seed limit is 32 bytes");
    }
  });

  it("builds a bootstrap transaction for a valid DAO name", async () => {
    const authority = Keypair.generate().publicKey;

    const result = await buildCreateDaoBootstrapTransaction({
      authority,
      connection: createConnection() as never,
      name: "PDAO Cairo",
      quorum: 60,
    });

    assert.equal(result.transaction.instructions.length >= 4, true);
    assert.equal(result.transaction.feePayer?.toBase58(), authority.toBase58());
    assert.equal(result.transaction.recentBlockhash, "11111111111111111111111111111111");
    assert.notEqual(result.dao.toBase58(), result.governanceMint.toBase58());
  });

  it("falls back to recent blockhash resolution when latest blockhash temporarily fails", async () => {
    const authority = Keypair.generate().publicKey;

    const result = await buildFinalizeProposalTransaction({
      connection: createConnection({
        latestBlockhashError: new Error("rpc temporarily unavailable"),
        recentBlockhash: { blockhash: "22222222222222222222222222222222" },
      }) as never,
      daoAddress: Keypair.generate().publicKey,
      finalizer: authority,
      proposalAddress: Keypair.generate().publicKey,
    });

    assert.equal(result.transaction.recentBlockhash, "22222222222222222222222222222222");
  });

  it("keeps proposal commitments deterministic and proposal-bound", async () => {
    const proposal = Keypair.generate().publicKey;
    const voter = Keypair.generate().publicKey;
    const salt = new Uint8Array(32).fill(9);

    const first = await computeProposalCommitment(true, salt, proposal, voter);
    const second = await computeProposalCommitment(true, salt, proposal, voter);
    const differentProposal = await computeProposalCommitment(
      true,
      salt,
      Keypair.generate().publicKey,
      voter,
    );

    assert.deepEqual(Array.from(first), Array.from(second));
    assert.notDeepEqual(Array.from(first), Array.from(differentProposal));
  });

  it("rejects empty proposal titles and invalid voting durations before signing", async () => {
    const proposer = Keypair.generate().publicKey;
    const dao = Keypair.generate().publicKey;

    await expectRejected(
      buildCreateProposalTransaction({
        connection: createConnection() as never,
        daoAddress: dao,
        proposer,
        title: "   ",
      }),
      /Proposal title is required/,
    );

    await expectRejected(
      buildCreateProposalTransaction({
        connection: createConnection() as never,
        daoAddress: dao,
        proposer,
        title: "Valid title",
        votingDurationSeconds: 0,
      }),
      /Proposal duration must be a positive number of seconds/,
    );
  });

  it("reports missing DAO and proposal accounts explicitly", async () => {
    const connection = createConnection();

    await expectRejected(
      fetchDaoAccountDetails(connection as never, Keypair.generate().publicKey),
      /DAO account was not found on devnet/,
    );

    await expectRejected(
      fetchProposalAccountDetails(connection as never, Keypair.generate().publicKey),
      /Proposal account was not found on devnet/,
    );
  });

  it("rejects reveal salts that are not exactly 32 bytes", async () => {
    try {
      await buildRevealVoteTransaction({
        connection: createConnection() as never,
        proposalAddress: Keypair.generate().publicKey,
        salt: new Uint8Array(31),
        vote: true,
        voter: Keypair.generate().publicKey,
      });
      assert.fail("expected reveal salt validation");
    } catch (error) {
      assert.include(String(error), "Reveal salt must be exactly 32 bytes");
    }
  });

  it("returns zero governance balance when the holder ATA is absent", async () => {
    const dao = Keypair.generate().publicKey;
    const holder = Keypair.generate().publicKey;
    const governanceMint = Keypair.generate().publicKey;

    const snapshot = await fetchGovernanceHolderSnapshot({
      connection: createConnection({
        accounts: {
          [governanceMint.toBase58()]: {
            owner: TOKEN_PROGRAM_ID,
          },
        },
      }) as never,
      daoAddress: dao,
      daoDetails: {
        authority: Keypair.generate().publicKey.toBase58(),
        daoName: "PDAO Cairo",
        executionDelaySeconds: 15,
        governanceToken: governanceMint.toBase58(),
        proposalCount: BigInt(1),
        quorumPercentage: 60,
        revealWindowSeconds: 45,
        votingConfig: "token",
      },
      holder,
    });

    assert.equal(snapshot.rawAmount, BigInt(0));
    assert.equal(snapshot.governanceMint.toBase58(), governanceMint.toBase58());
  });

  it("returns the governance balance when the holder ATA exists", async () => {
    const dao = Keypair.generate().publicKey;
    const holder = Keypair.generate().publicKey;
    const governanceMint = Keypair.generate().publicKey;
    const ata = deriveAta(holder, governanceMint);

    const snapshot = await fetchGovernanceHolderSnapshot({
      connection: createConnection({
        accounts: {
          [governanceMint.toBase58()]: {
            owner: TOKEN_PROGRAM_ID,
          },
          [ata.toBase58()]: {
            owner: TOKEN_PROGRAM_ID,
          },
        },
        tokenBalances: {
          [ata.toBase58()]: "42",
        },
      }) as never,
      daoAddress: dao,
      daoDetails: {
        authority: Keypair.generate().publicKey.toBase58(),
        daoName: "PDAO Cairo",
        executionDelaySeconds: 15,
        governanceToken: governanceMint.toBase58(),
        proposalCount: BigInt(1),
        quorumPercentage: 60,
        revealWindowSeconds: 45,
        votingConfig: "token",
      },
      holder,
    });

    assert.equal(snapshot.rawAmount, BigInt(42));
    assert.equal(snapshot.tokenAccount.toBase58(), ata.toBase58());
  });

  it("rejects unsupported treasury token programs before building execute instructions", async () => {
    const dao = Keypair.generate().publicKey;
    const proposal = Keypair.generate().publicKey;
    const executor = Keypair.generate().publicKey;
    const treasuryTokenMint = Keypair.generate().publicKey;

    await expectRejected(
      buildExecuteProposalTransaction({
        connection: createConnection({
          accounts: {
            [treasuryTokenMint.toBase58()]: {
              owner: Keypair.generate().publicKey,
            },
          },
        }) as never,
        daoAddress: dao,
        executor,
        proposalAddress: proposal,
        treasuryTokenMint,
      }),
      /Unsupported token program for mint/,
    );
  });

  it("builds a finalize transaction with the finalizer as fee payer", async () => {
    const dao = Keypair.generate().publicKey;
    const proposal = Keypair.generate().publicKey;
    const finalizer = Keypair.generate().publicKey;

    const result = await buildFinalizeProposalTransaction({
      connection: createConnection() as never,
      daoAddress: dao,
      finalizer,
      proposalAddress: proposal,
    });

    assert.equal(result.transaction.instructions.length, 1);
    assert.equal(result.transaction.feePayer?.toBase58(), finalizer.toBase58());
  });

  it("builds a token execute transaction and adds ATA creation when the recipient ATA is missing", async () => {
    const dao = Keypair.generate().publicKey;
    const proposal = Keypair.generate().publicKey;
    const executor = Keypair.generate().publicKey;
    const treasuryRecipient = Keypair.generate().publicKey;
    const treasuryTokenMint = Keypair.generate().publicKey;

    const result = await buildExecuteProposalTransaction({
      connection: createConnection({
        accounts: {
          [treasuryTokenMint.toBase58()]: {
            owner: TOKEN_PROGRAM_ID,
          },
        },
      }) as never,
      daoAddress: dao,
      executor,
      proposalAddress: proposal,
      treasuryRecipient,
      treasuryTokenMint,
    });

    assert.equal(result.transaction.instructions.length, 2);
    assert.equal(result.transaction.feePayer?.toBase58(), executor.toBase58());
    assert.equal(result.treasury.toBase58().length > 0, true);
  });

  it("builds a basic execute transaction without token mint sidecars", async () => {
    const dao = Keypair.generate().publicKey;
    const proposal = Keypair.generate().publicKey;
    const executor = Keypair.generate().publicKey;

    const result = await buildExecuteProposalTransaction({
      connection: createConnection() as never,
      daoAddress: dao,
      executor,
      proposalAddress: proposal,
    });

    assert.equal(result.transaction.instructions.length, 1);
    assert.equal(result.transaction.feePayer?.toBase58(), executor.toBase58());
    assert.notEqual(result.confidentialPayoutPlan.toBase58(), result.treasury.toBase58());
  });

  it("returns confirmed signature status immediately when Devnet already sees the transaction", async () => {
    const signature = "sig-confirmed";
    const status = await awaitLiveSignatureOnCluster({
      connection: createConnection({
        signatureStatuses: [
          {
            confirmationStatus: "confirmed",
            err: null,
            slot: 9,
            status: { Ok: null },
          },
        ],
      }) as never,
      signature,
      timeoutMs: 5,
      pollIntervalMs: 0,
    });

    assert.equal(status.confirmationStatus, "confirmed");
  });

  it("falls back to transaction lookup when signature status polling expires", async () => {
    const signature = "sig-fallback";
    const status = await awaitLiveSignatureOnCluster({
      connection: createConnection({
        signatureStatuses: [null],
        transactionBySignature: {
          [signature]: { meta: { err: null }, slot: 12 },
        },
      }) as never,
      signature,
      timeoutMs: 0,
      pollIntervalMs: 0,
    });

    assert.equal(status.confirmationStatus, "confirmed");
    assert.equal(status.slot, 12);
  });

  it("surfaces explicit Devnet execution errors during signature polling", async () => {
    await expectRejected(
      awaitLiveSignatureOnCluster({
        connection: createConnection({
          signatureStatuses: [
            {
              confirmationStatus: null,
              err: { InstructionError: [0, "Custom"] },
            },
          ],
        }) as never,
        signature: "sig-error",
        timeoutMs: 5,
        pollIntervalMs: 0,
      }),
      /Devnet rejected the submitted transaction/,
    );
  });
});
