"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
const LAMPORTS_PER_SOL = 1000000000;
const WORKSPACE_ROOT = path_1.default.resolve(process.cwd(), "..");
const SOLANA_CONFIG_PATH = path_1.default.resolve(WORKSPACE_ROOT, ".config/solana/cli/config.yml");
function buildExplorerAddressUrl(address, cluster) {
    const suffix = cluster === "mainnet-beta" ? "" : `?cluster=${cluster}`;
    return `https://explorer.solana.com/address/${address}${suffix}`;
}
function readJson(relativePath) {
    return JSON.parse(fs_1.default.readFileSync(path_1.default.resolve(relativePath), "utf8"));
}
function runSolanaJson(args) {
    const command = ["solana", ...args].join(" ");
    const commandWithConfig = `SOLANA_CONFIG_PATH=${SOLANA_CONFIG_PATH} ${command}`;
    try {
        const stdout = (0, child_process_1.execSync)(commandWithConfig, {
            encoding: "utf8",
            stdio: ["ignore", "pipe", "pipe"],
            shell: "/bin/bash",
            cwd: WORKSPACE_ROOT,
        });
        return { ok: true, command, stdout };
    }
    catch (error) {
        const stderr = error instanceof Error && "stderr" in error
            ? String(error.stderr ?? "").trim()
            : error.message;
        return { ok: false, command, error: stderr || error.message };
    }
}
function formatLamports(lamports) {
    if (lamports === null)
        return null;
    return (lamports / LAMPORTS_PER_SOL).toString();
}
function recordProgramReadout(params) {
    const result = runSolanaJson([
        "program",
        "show",
        params.address,
        "--url",
        params.cluster,
    ]);
    if (!result.ok) {
        return {
            id: params.id,
            label: params.label,
            cluster: params.cluster,
            status: "not-found",
            address: params.address,
            explorerUrl: buildExplorerAddressUrl(params.address, params.cluster),
            observedAt: new Date().toISOString(),
            command: result.command,
            owner: null,
            authority: null,
            programDataAddress: null,
            lastDeploySlot: null,
            balanceSol: null,
            executable: null,
            error: result.error,
            note: params.note,
        };
    }
    const payload = parseProgramShow(result.stdout);
    return {
        id: params.id,
        label: params.label,
        cluster: params.cluster,
        status: "observed",
        address: payload.programId,
        explorerUrl: buildExplorerAddressUrl(payload.programId, params.cluster),
        observedAt: new Date().toISOString(),
        command: result.command,
        owner: payload.owner,
        authority: payload.authority,
        programDataAddress: payload.programDataAddress,
        lastDeploySlot: payload.lastDeploySlot,
        balanceSol: payload.balanceSol,
        executable: true,
        error: null,
        note: params.note,
    };
}
function recordAccountReadout(params) {
    const result = runSolanaJson([
        "account",
        params.address,
        "--url",
        params.cluster,
        "--output",
        "json",
    ]);
    if (!result.ok) {
        return {
            id: params.id,
            label: params.label,
            cluster: params.cluster,
            status: "not-found",
            address: params.address,
            explorerUrl: buildExplorerAddressUrl(params.address, params.cluster),
            observedAt: new Date().toISOString(),
            command: result.command,
            owner: null,
            authority: null,
            programDataAddress: null,
            lastDeploySlot: null,
            balanceSol: null,
            executable: null,
            error: result.error,
            note: params.note,
        };
    }
    const payload = JSON.parse(result.stdout);
    return {
        id: params.id,
        label: params.label,
        cluster: params.cluster,
        status: "observed",
        address: payload.pubkey,
        explorerUrl: buildExplorerAddressUrl(payload.pubkey, params.cluster),
        observedAt: new Date().toISOString(),
        command: result.command,
        owner: payload.account.owner,
        authority: null,
        programDataAddress: null,
        lastDeploySlot: null,
        balanceSol: formatLamports(payload.account.lamports),
        executable: payload.account.executable,
        error: null,
        note: params.note,
    };
}
function main() {
    const ceremony = readJson("docs/release-ceremony-attestation.generated.json");
    const payload = {
        schemaVersion: 1,
        project: "PrivateDAO",
        targetNetwork: "mainnet-beta",
        targetProgramId: ceremony.programId,
        observedReadouts: [
            recordProgramReadout({
                id: "devnet-program",
                label: "Current deployed program readout",
                cluster: "devnet",
                address: ceremony.programId,
                note: "This is the currently observed live deployment readout. It is external chain evidence, but it is not mainnet custody proof by itself.",
            }),
            recordAccountReadout({
                id: "devnet-dao",
                label: "Current DAO anchor readout",
                cluster: "devnet",
                address: ceremony.anchors.dao,
                note: "Current DAO PDA visibility on devnet.",
            }),
            recordAccountReadout({
                id: "devnet-treasury",
                label: "Current treasury anchor readout",
                cluster: "devnet",
                address: ceremony.anchors.treasury,
                note: "Current treasury PDA visibility on devnet.",
            }),
            recordProgramReadout({
                id: "mainnet-program",
                label: "Target network program readout",
                cluster: "mainnet-beta",
                address: ceremony.programId,
                note: "If this stays not-found, mainnet custody transfer is not merely pending multisig evidence; there is no current mainnet program readout for this program id.",
            }),
            recordAccountReadout({
                id: "mainnet-treasury",
                label: "Target network treasury readout",
                cluster: "mainnet-beta",
                address: ceremony.anchors.treasury,
                note: "Target-network treasury visibility is required before claiming real-funds mainnet readiness.",
            }),
        ],
    };
    fs_1.default.writeFileSync(path_1.default.resolve("docs/custody-observed-readouts.json"), `${JSON.stringify(payload, null, 2)}\n`);
    console.log("Wrote docs/custody-observed-readouts.json");
}
function parseProgramShow(stdout) {
    const lines = stdout
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
    const values = new Map();
    for (const line of lines) {
        const separatorIndex = line.indexOf(":");
        if (separatorIndex === -1)
            continue;
        values.set(line.slice(0, separatorIndex).trim(), line.slice(separatorIndex + 1).trim());
    }
    const programId = values.get("Program Id");
    const owner = values.get("Owner");
    const programDataAddress = values.get("ProgramData Address");
    const authority = values.get("Authority");
    const lastDeploySlot = values.get("Last Deployed In Slot");
    const balance = values.get("Balance");
    if (!programId || !owner || !programDataAddress || !authority || !lastDeploySlot) {
        throw new Error(`Unable to parse solana program show output:\n${stdout}`);
    }
    return {
        programId,
        owner,
        programDataAddress,
        authority,
        lastDeploySlot: Number(lastDeploySlot),
        balanceSol: balance?.split(" ")[0] ?? null,
    };
}
main();
