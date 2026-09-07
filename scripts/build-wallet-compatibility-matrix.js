"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function main() {
    const runtime = readJson("docs/runtime-attestation.generated.json");
    const matrix = runtime.supportedWallets.map((wallet) => {
        switch (wallet.id) {
            case "auto-detect":
                return {
                    id: wallet.id,
                    label: wallet.label,
                    detection: "Auto resolution across Phantom, Solflare, Backpack, Glow, and compatible injected providers.",
                    connectPath: "connect -> request({ method: 'connect' }) -> enable fallback",
                    transactionPath: "sendTransaction -> signAndSendTransaction -> signTransaction fallback",
                    diagnosticsVisible: true,
                    selectorVisible: true,
                    status: "devnet-review-ready",
                    note: "Acts as the default browser path when reviewers connect without choosing a wallet explicitly.",
                };
            case "phantom":
                return {
                    id: wallet.id,
                    label: wallet.label,
                    detection: "window.phantom?.solana and compatible window.solana fallbacks",
                    connectPath: "Direct provider connect with request and enable fallback",
                    transactionPath: "sendTransaction preferred, then signAndSendTransaction, then signTransaction",
                    diagnosticsVisible: true,
                    selectorVisible: true,
                    status: "devnet-review-ready",
                    note: "Primary reviewer path on desktop browser; still requires live wallet QA before any mainnet cutover claim.",
                };
            case "solflare":
                return {
                    id: wallet.id,
                    label: wallet.label,
                    detection: "window.solflare and window.solflare?.solflare resolution",
                    connectPath: "Provider connect with request/enable fallback",
                    transactionPath: "sendTransaction and signAndSendTransaction fallback path",
                    diagnosticsVisible: true,
                    selectorVisible: true,
                    status: "devnet-review-ready",
                    note: "Explicit selector path is present in the wallet panel and diagnostics surface.",
                };
            case "backpack":
                return {
                    id: wallet.id,
                    label: wallet.label,
                    detection: "window.backpack?.solana resolution",
                    connectPath: "Provider connect with explicit provider selection from wallet panel",
                    transactionPath: "sendTransaction with normalized signature handling",
                    diagnosticsVisible: true,
                    selectorVisible: true,
                    status: "devnet-review-ready",
                    note: "Included as a first-class selector option rather than relying on generic injected-provider handling.",
                };
            case "glow":
                return {
                    id: wallet.id,
                    label: wallet.label,
                    detection: "Compatible injected provider path through wallet selector and fallback provider discovery",
                    connectPath: "Provider connect with generic request/enable fallback",
                    transactionPath: "Normalized transaction path through generic injected-provider compatibility layer",
                    diagnosticsVisible: true,
                    selectorVisible: true,
                    status: "manual-runtime-qa-required",
                    note: "Frontend support is explicit, but live release QA remains a real-browser runtime task.",
                };
            default:
                return {
                    id: wallet.id,
                    label: wallet.label,
                    detection: "Compatible injected provider",
                    connectPath: "connect/request/enable fallback",
                    transactionPath: "normalized multi-path transaction signing",
                    diagnosticsVisible: true,
                    selectorVisible: true,
                    status: "manual-runtime-qa-required",
                    note: "Compatibility is surfaced intentionally, but still requires real runtime validation.",
                };
        }
    });
    const jsonOut = {
        project: runtime.project,
        programId: runtime.programId,
        diagnosticsPage: runtime.diagnosticsPage,
        generatedAt: new Date().toISOString(),
        entries: matrix,
    };
    const md = `# Wallet Compatibility Matrix

- diagnostics page: \`${runtime.diagnosticsPage}\`
- program id: \`${runtime.programId}\`

## Matrix

${matrix
        .map((entry) => `### ${entry.label}

- detection: ${entry.detection}
- connect path: ${entry.connectPath}
- transaction path: ${entry.transactionPath}
- diagnostics visible: ${entry.diagnosticsVisible ? "yes" : "no"}
- selector visible: ${entry.selectorVisible ? "yes" : "no"}
- status: \`${entry.status}\`
- note: ${entry.note}
`)
        .join("\n")}

## Interpretation

This matrix makes wallet compatibility reviewer-visible instead of implicit. It documents how each supported wallet class is detected, how connection fallback works, how transaction signing fallback works, and where real runtime QA is still required before mainnet claims should be made.
`;
    writeJson("docs/wallet-compatibility-matrix.generated.json", jsonOut);
    fs_1.default.writeFileSync(path_1.default.resolve("docs/wallet-compatibility-matrix.generated.md"), md, "utf8");
    console.log("Wrote wallet compatibility matrix");
}
function readJson(relativePath) {
    return JSON.parse(fs_1.default.readFileSync(path_1.default.resolve(relativePath), "utf8"));
}
function writeJson(relativePath, value) {
    fs_1.default.writeFileSync(path_1.default.resolve(relativePath), JSON.stringify(value, null, 2) + "\n");
}
main();
