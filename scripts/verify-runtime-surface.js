"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function main() {
    const diagnosticsPage = fs_1.default.readFileSync(path_1.default.resolve("apps/web/src/app/diagnostics/page.tsx"), "utf8");
    const diagnostics = fs_1.default.readFileSync(path_1.default.resolve("apps/web/src/components/diagnostics-center.tsx"), "utf8");
    const walletRuntime = fs_1.default.readFileSync(path_1.default.resolve("apps/web/src/components/wallet-runtime-panel.tsx"), "utf8");
    const walletProvider = fs_1.default.readFileSync(path_1.default.resolve("apps/web/src/components/wallet-provider.tsx"), "utf8");
    const siteData = fs_1.default.readFileSync(path_1.default.resolve("apps/web/src/lib/site-data.ts"), "utf8");
    const runtime = readJson("docs/runtime-attestation.generated.json");
    const proof = readJson("docs/proof-registry.json");
    for (const fragment of [
        "Diagnostics",
        "Operational diagnostics",
        "Verification chain",
        "runtime checks",
        "Connect Solflare, Phantom, or Backpack",
        "Execution boundary",
        "Launch honesty",
    ]) {
        assert(diagnosticsPage.includes(fragment) || diagnostics.includes(fragment) || walletRuntime.includes(fragment), `runtime surface is missing: ${fragment}`);
    }
    for (const wallet of runtime.supportedWallets) {
        if (["Phantom", "Solflare", "Backpack"].includes(wallet.label)) {
            assert(walletProvider.includes(wallet.label), `runtime surface is missing wallet adapter: ${wallet.label}`);
        }
    }
    assert(runtime.diagnosticsPage.endsWith("/diagnostics/"), "runtime attestation diagnostics URL is unexpected");
    assert(Boolean(runtime.runtimeDocs?.includes?.("docs/wallet-compatibility-matrix.generated.md")), "runtime attestation is missing wallet matrix docs");
    assert(Boolean(runtime.runtimeDocs?.includes?.("docs/runtime/browser-wallet.generated.md")), "runtime attestation is missing browser-wallet runtime docs");
    assert(Boolean(runtime.runtimeDocs?.includes?.("docs/runtime/real-device.generated.md")), "runtime attestation is missing real-device runtime docs");
    assert(Boolean(runtime.runtimeDocs?.includes?.("docs/magicblock/runtime.generated.md")), "runtime attestation is missing MagicBlock runtime docs");
    assert(Boolean(runtime.runtimeDocs?.includes?.("docs/frontier-integrations.generated.md")), "runtime attestation is missing Frontier integration docs");
    assert(Boolean(runtime.runtimeDocs?.includes?.("docs/devnet-canary.generated.md")), "runtime attestation is missing devnet canary docs");
    if (proof.pdaoToken?.mint) {
        assert(runtime.pdaoToken?.mint === proof.pdaoToken.mint, "runtime attestation PDAO mint drift detected");
    }
    console.log("Runtime surface verification: PASS");
}
function readJson(relativePath) {
    return JSON.parse(fs_1.default.readFileSync(path_1.default.resolve(relativePath), "utf8"));
}
function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}
main();
