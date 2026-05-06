"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const anchor = __importStar(require("@coral-xyz/anchor"));
const web3_js_1 = require("@solana/web3.js");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const proof_registry_1 = require("./lib/proof-registry");
const DEFAULT_WALLET_PATH = process.env.ANCHOR_WALLET || "/home/x-pact/Desktop/wallet-keypair.json";
const DEFAULT_RPC_URL = process.env.PRIVATE_DAO_RPC_URL || process.env.ANCHOR_PROVIDER_URL || (0, web3_js_1.clusterApiUrl)("devnet");
const DEFAULT_WS_URL = process.env.PRIVATE_DAO_WS_URL ||
    process.env.ANCHOR_WALLET_WS_URL ||
    DEFAULT_RPC_URL.replace(/^https:/, "wss:").replace(/^http:/, "ws:");
const LAYER_CONFIG = {
    vote: {
        seedByte: 1,
        layerArg: { vote: {} },
    },
    delegation: {
        seedByte: 2,
        layerArg: { delegation: {} },
    },
    tally: {
        seedByte: 3,
        layerArg: { tally: {} },
    },
};
function readKeypair(filePath) {
    const secret = JSON.parse(fs_1.default.readFileSync(filePath, "utf8"));
    return web3_js_1.Keypair.fromSecretKey(Uint8Array.from(secret));
}
async function confirmByPolling(connection, signature, lastValidBlockHeight) {
    for (;;) {
        const [status] = (await connection.getSignatureStatuses([signature], {
            searchTransactionHistory: true,
        })).value;
        if (status?.err) {
            throw new Error(`zk proof verification transaction failed: ${JSON.stringify(status.err)}`);
        }
        if (status?.confirmationStatus === "confirmed" || status?.confirmationStatus === "finalized") {
            return;
        }
        const currentBlockHeight = await connection.getBlockHeight("confirmed");
        if (currentBlockHeight > lastValidBlockHeight) {
            throw new Error(`zk proof verification transaction expired before confirmation: ${signature}`);
        }
        await new Promise((resolve) => setTimeout(resolve, 1500));
    }
}
async function verifyLayer(program, verifier, dao, proposal, layer, mode) {
    const config = LAYER_CONFIG[layer];
    const [zkProofAnchor] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("zk-proof"), proposal.toBuffer(), Buffer.from([config.seedByte])], program.programId);
    const [zkVerificationReceipt] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("zk-verify"), proposal.toBuffer(), Buffer.from([config.seedByte])], program.programId);
    const existing = await program.provider.connection.getAccountInfo(zkVerificationReceipt, "confirmed");
    if (existing) {
        return {
            layer,
            zkProofAnchor: zkProofAnchor.toBase58(),
            zkVerificationReceipt: zkVerificationReceipt.toBase58(),
            txSignature: null,
            explorerUrl: null,
            skipped: true,
        };
    }
    const transaction = await program.methods
        .verifyZkProofOnChain(config.layerArg, mode === "zk_enforced" ? { zkEnforced: {} } : { parallel: {} }, mode === "zk_enforced" ? verifier.publicKey : null)
        .accounts({
        dao,
        proposal,
        zkProofAnchor,
        zkVerificationReceipt,
        verifier: verifier.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
    })
        .transaction();
    const latest = await program.provider.connection.getLatestBlockhash("confirmed");
    transaction.feePayer = verifier.publicKey;
    transaction.recentBlockhash = latest.blockhash;
    transaction.sign(verifier);
    const txSignature = await program.provider.connection.sendRawTransaction(transaction.serialize(), {
        preflightCommitment: "confirmed",
        maxRetries: 3,
    });
    await confirmByPolling(program.provider.connection, txSignature, latest.lastValidBlockHeight);
    return {
        layer,
        zkProofAnchor: zkProofAnchor.toBase58(),
        zkVerificationReceipt: zkVerificationReceipt.toBase58(),
        txSignature,
        explorerUrl: `https://explorer.solana.com/tx/${txSignature}?cluster=devnet`,
        skipped: false,
    };
}
async function main() {
    const requested = (process.argv[2] ?? "all").toLowerCase();
    const requestedMode = (process.argv[3] ?? "parallel").toLowerCase();
    if (requestedMode !== "parallel" && requestedMode !== "zk_enforced") {
        throw new Error(`unsupported verification mode: ${requestedMode}`);
    }
    const layers = requested === "all"
        ? ["vote", "delegation", "tally"]
        : [requested];
    for (const layer of layers) {
        if (!(layer in LAYER_CONFIG)) {
            throw new Error(`unsupported layer: ${layer}`);
        }
    }
    const verifier = readKeypair(DEFAULT_WALLET_PATH);
    const connection = new web3_js_1.Connection(DEFAULT_RPC_URL, {
        commitment: "confirmed",
        confirmTransactionInitialTimeout: 60000,
        wsEndpoint: DEFAULT_WS_URL,
    });
    const provider = new anchor.AnchorProvider(connection, new anchor.Wallet(verifier), {
        commitment: "confirmed",
        preflightCommitment: "confirmed",
        maxRetries: 3,
    });
    anchor.setProvider(provider);
    const idl = JSON.parse(fs_1.default.readFileSync(path_1.default.resolve("target/idl/private_dao.json"), "utf8"));
    const programId = new web3_js_1.PublicKey(idl.address);
    const program = new anchor.Program(idl, provider);
    if (!programId.equals(program.programId)) {
        throw new Error("IDL program id does not match runtime program id");
    }
    const proof = (0, proof_registry_1.loadProofRegistry)();
    const dao = new web3_js_1.PublicKey(proof.dao);
    const proposal = new web3_js_1.PublicKey(proof.proposal);
    console.log(`RPC: ${DEFAULT_RPC_URL}`);
    console.log(`Verifier: ${verifier.publicKey.toBase58()}`);
    console.log(`DAO: ${dao.toBase58()}`);
    console.log(`Proposal: ${proposal.toBase58()}`);
    for (const layer of layers) {
        const result = await verifyLayer(program, verifier, dao, proposal, layer, requestedMode);
        console.log(JSON.stringify(result, null, 2));
    }
}
main().catch((error) => {
    console.error(error);
    process.exit(1);
});
