import crypto from "node:crypto";
import fs from "node:fs";
import { createRequire } from "node:module";
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import nacl from "tweetnacl";

const require = createRequire(import.meta.url);
const { AnchorProvider, BN, Program, Wallet } = require("@coral-xyz/anchor");
const magic = require("../apps/web/node_modules/@magicblock-labs/ephemeral-rollups-sdk");

const BASE_RPC = process.env.AUCTION_SOLANA_RPC ?? "https://api.devnet.solana.com";
const TEE_RPC = process.env.AUCTION_TEE_RPC ?? "https://devnet-tee.magicblock.app";
const PROGRAM_ID = new PublicKey("4Z7AeFRZHBCok68hhbUgVLC3uFaEP2aDWozsYVksPuQd");
const VALIDATOR = new PublicKey("MTEWGuqxUpYZGFJQcp8tLN7x5v9BSeoFHYWQQ3n3xzo");
const idl = JSON.parse(fs.readFileSync(new URL("../target/idl/privatedao_auction.json", import.meta.url)));
const discriminator = "420e99fabb24b3ec";

function digest(value) {
  return Uint8Array.from(crypto.createHash("sha256").update(value).digest());
}

function keypair(path) {
  return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync(path, "utf8"))));
}

function accountSummary(account) {
  return {
    pubkey: account.pubkey.toBase58(),
    signer: account.isSigner,
    writable: account.isWritable,
  };
}

function txSummary(transaction) {
  const message = transaction.compileMessage();
  return {
    instructionDataHex: Buffer.from(transaction.instructions[0].data).toString("hex"),
    programId: transaction.instructions[0].programId.toBase58(),
    instructionAccounts: transaction.instructions[0].keys.map(accountSummary),
    orderedMessageAccounts: message.accountKeys.map((pubkey, index) => ({
      index,
      pubkey: pubkey.toBase58(),
      signer: message.isAccountSigner(index),
      writable: message.isAccountWritable(index),
    })),
    serializedWireBase64: transaction.serialize({ requireAllSignatures: false }).toString("base64"),
  };
}

function accountState(account) {
  return account ? {
    owner: account.owner.toBase58(),
    lamports: account.lamports,
    dataLength: account.data.length,
    dataSha256: crypto.createHash("sha256").update(account.data).digest("hex"),
  } : null;
}

async function teeConnection(walletKeypair) {
  const signMessage = async (message) => Uint8Array.from(nacl.sign.detached(Buffer.from(message), walletKeypair.secretKey));
  const auth = await magic.getAuthToken(TEE_RPC, walletKeypair.publicKey, signMessage);
  const url = `${TEE_RPC}?token=${encodeURIComponent(auth.token)}`;
  const connection = new Connection(url, {
    commitment: "confirmed",
    wsEndpoint: url.replace(/^https:/, "wss:"),
  });
  return { connection, tokenExpiresAt: auth.expiresAt };
}

async function main() {
  const creator = keypair(process.env.AUCTION_CREATOR_KEYPAIR ?? `${process.env.HOME}/.config/solana/id.json`);
  const baseConnection = new Connection(BASE_RPC, "confirmed");
  const base = new Program(idl, new AnchorProvider(baseConnection, new Wallet(creator), { commitment: "confirmed" }));

  let teeAttestation = "verified";
  try {
    await magic.verifyTeeRpcIntegrity(TEE_RPC);
  } catch (error) {
    teeAttestation = `failed: ${error instanceof Error ? error.message : String(error)}`;
  }

  const auctionId = crypto.randomBytes(32);
  const [config] = PublicKey.findProgramAddressSync([Buffer.from("auction"), auctionId], PROGRAM_ID);
  const [session] = PublicKey.findProgramAddressSync([Buffer.from("session"), config.toBuffer()], PROGRAM_ID);
  const permission = magic.permissionPdaFromAccount(session);
  const now = Math.floor(Date.now() / 1000);
  const start = now + 30;
  const deadline = now + 180;

  const initializeSignature = await base.methods
    .initializeAuction(auctionId, new BN(start), new BN(deadline), digest("forge-rules:v1"), digest("forge-policy:v1"), true, false)
    .accounts({ authority: creator.publicKey, config, session, systemProgram: SystemProgram.programId })
    .rpc();
  await new Promise((resolve) => setTimeout(resolve, 35000));
  const activateSignature = await base.methods
    .activateAuction()
    .accounts({ config, session, authority: creator.publicKey })
    .rpc();

  const delegateSignature = await base.methods
    .delegateAuctionSession()
    .accountsPartial({
      payer: creator.publicKey,
      session,
      config,
      ownerProgram: PROGRAM_ID,
      delegationProgram: magic.DELEGATION_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .remainingAccounts([{ pubkey: VALIDATOR, isSigner: false, isWritable: false }])
    .rpc();

  const baseDelegatedState = await baseConnection.getAccountInfo(session, "confirmed");
  const { connection: teeConnectionValue, tokenExpiresAt } = await teeConnection(creator);
  const teeProgram = new Program(idl, new AnchorProvider(teeConnectionValue, new Wallet(creator), { commitment: "confirmed", skipPreflight: true }));
  const instruction = await teeProgram.methods.initPermission().accounts({
    session,
    config,
    permission,
    ephemeralVault: magic.EPHEMERAL_VAULT_ID,
    magicProgram: magic.MAGIC_PROGRAM_ID,
    permissionProgram: magic.PERMISSION_PROGRAM_ID,
  }).instruction();

  const baseLatest = await baseConnection.getLatestBlockhash("confirmed");
  const baseTransaction = new Transaction({ feePayer: creator.publicKey, recentBlockhash: baseLatest.blockhash }).add(instruction);
  const baseSimulation = await baseConnection.simulateTransaction(baseTransaction, [creator]);

  const teeLatest = await teeConnectionValue.getLatestBlockhash("processed");
  const teeTransaction = new Transaction({ feePayer: creator.publicKey, recentBlockhash: teeLatest.blockhash }).add(instruction);
  const instructionBytes = Buffer.from(instruction.data).toString("hex");
  if (instructionBytes !== discriminator) throw new Error(`Unexpected discriminator ${instructionBytes}`);
  const unsignedTeeSummary = txSummary(teeTransaction);
  teeTransaction.partialSign(creator);
  const signedTeeWire = teeTransaction.serialize();

  let teeSignature = null;
  let teeExecution = null;
  try {
    teeSignature = await teeConnectionValue.sendRawTransaction(signedTeeWire, { skipPreflight: true, maxRetries: 3 });
    await teeConnectionValue.confirmTransaction({ signature: teeSignature, blockhash: teeLatest.blockhash, lastValidBlockHeight: teeLatest.lastValidBlockHeight }, "confirmed");
    teeExecution = await teeConnectionValue.getTransaction(teeSignature, { commitment: "confirmed", maxSupportedTransactionVersion: 0 });
  } catch (error) {
    teeExecution = error?.signature ? await teeConnectionValue.getTransaction(error.signature, { commitment: "confirmed", maxSupportedTransactionVersion: 0 }) : null;
    teeSignature = teeSignature ?? error?.signature ?? null;
  }

  const deployedDump = "/tmp/privatedao-auction-differential.so";
  const dumpResult = await new Promise((resolve) => {
    const child = require("node:child_process").spawn("solana", ["program", "dump", PROGRAM_ID.toBase58(), deployedDump, "--url", BASE_RPC]);
    child.on("close", (code) => resolve(code));
  });
  const localHash = crypto.createHash("sha256").update(fs.readFileSync(new URL("../target/deploy/privatedao_auction.so", import.meta.url))).digest("hex");
  const deployedHash = dumpResult === 0 ? crypto.createHash("sha256").update(fs.readFileSync(deployedDump)).digest("hex") : null;
  const sourceText = fs.readFileSync(new URL("../programs/privatedao-auction/src/lib.rs", import.meta.url), "utf8");
  const sourceDiscriminator = crypto.createHash("sha256").update("global:init_permission").digest("hex").slice(0, 16);
  const idlInstruction = idl.instructions.find((value) => value.name === "init_permission");
  const idlDiscriminator = idlInstruction ? Buffer.from(idlInstruction.discriminator).toString("hex") : null;
  const artifactBytes = fs.readFileSync(new URL("../target/deploy/privatedao_auction.so", import.meta.url));
  const artifactDiscriminator = artifactBytes.includes(Buffer.from(discriminator, "hex"));

  console.log(JSON.stringify({
    programId: PROGRAM_ID.toBase58(),
    discriminator,
    sourceDiscriminator,
    sourceDiscriminatorVerified: sourceDiscriminator === discriminator && /pub fn init_permission\s*\(/.test(sourceText),
    generatedIdlDiscriminator: idlDiscriminator,
    generatedIdlDiscriminatorVerified: idlDiscriminator === discriminator,
    deployedArtifactContainsDiscriminator: artifactDiscriminator,
    localArtifactSha256: localHash,
    deployedArtifactSha256: deployedHash,
    deployedArtifactMatchesLocal: localHash === deployedHash,
    sdkVersion: require("../apps/web/node_modules/@magicblock-labs/ephemeral-rollups-sdk/package.json").version,
    permissionProgram: magic.PERMISSION_PROGRAM_ID.toBase58(),
    delegationProgram: magic.DELEGATION_PROGRAM_ID.toBase58(),
    teeEndpoint: TEE_RPC,
    teeAttestation,
    teeValidator: VALIDATOR.toBase58(),
    tokenExpiresAt,
    auction: config.toBase58(),
    session: session.toBase58(),
    permission: permission.toBase58(),
    initializeSignature,
    activateSignature,
    delegateSignature,
    freshSessionStateAfterDelegation: accountState(baseDelegatedState),
    baseSimulation: { err: baseSimulation.value.err, logs: baseSimulation.value.logs, transaction: txSummary(baseTransaction) },
    teeTransaction: { signature: teeSignature, transaction: unsignedTeeSummary, logs: teeExecution?.meta?.logMessages ?? null, err: teeExecution?.meta?.err ?? null },
    identicalInstruction: JSON.stringify({ data: instructionBytes, program: instruction.programId.toBase58(), accounts: instruction.keys.map(accountSummary) }) === JSON.stringify({ data: unsignedTeeSummary.instructionDataHex, program: unsignedTeeSummary.programId, accounts: unsignedTeeSummary.instructionAccounts }),
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : String(error));
  process.exitCode = 1;
});
