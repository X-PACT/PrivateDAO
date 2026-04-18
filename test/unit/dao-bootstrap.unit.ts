import { assert } from "chai";
import { Keypair, PublicKey } from "@solana/web3.js";

import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  buildCreateDaoBootstrapTransaction,
  buildExecuteProposalTransaction,
  buildFinalizeProposalTransaction,
  buildRevealVoteTransaction,
  computeProposalCommitment,
  fetchGovernanceHolderSnapshot,
  TOKEN_PROGRAM_ID,
} from "../../apps/web/src/lib/dao-bootstrap";

type MockConnection = {
  getAccountInfo: (address: { toBase58?: () => string } | unknown, commitment?: unknown) => Promise<unknown>;
  getMinimumBalanceForRentExemption: (space: number, commitment?: unknown) => Promise<number>;
  getLatestBlockhash: (commitment?: unknown) => Promise<{ blockhash: string; lastValidBlockHeight: number }>;
  getTokenAccountBalance: (
    address: { toBase58?: () => string } | unknown,
    commitment?: unknown,
  ) => Promise<{ value: { amount: string } }>;
};

function createConnection(options?: {
  accounts?: Record<string, { owner: { equals: (target: unknown) => boolean; toBase58: () => string } }>;
  tokenBalances?: Record<string, string>;
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
      return {
        blockhash: "11111111111111111111111111111111",
        lastValidBlockHeight: 1,
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
  };
}

function deriveAta(owner: PublicKey, mint: PublicKey, tokenProgram = TOKEN_PROGRAM_ID) {
  const [ata] = PublicKey.findProgramAddressSync(
    [owner.toBytes(), tokenProgram.toBytes(), mint.toBytes()],
    ASSOCIATED_TOKEN_PROGRAM_ID,
  );
  return ata;
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
});
