import fs from "fs";
import path from "path";

type RuntimeAttestation = {
  diagnosticsPage: string;
  supportedWallets: Array<{ id: string; label: string }>;
  runtimeDocs?: string[];
  pdaoToken?: {
    mint: string;
  };
};

type ProofRegistry = {
  programId: string;
  verificationWallet: string;
  pdaoToken?: {
    mint: string;
  };
};

function main() {
  const frontend = fs.readFileSync(path.resolve("docs/index.html"), "utf8");
  const runtime = readJson<RuntimeAttestation>("docs/runtime-attestation.generated.json");
  const proof = readJson<ProofRegistry>("docs/proof-registry.json");

  for (const fragment of [
    "page-diagnostics",
    "Wallet Diagnostics",
    "Wallet Compatibility Matrix",
    "Real-Device Runtime QA",
    "Devnet Canary",
    "SUPPORTED PROVIDERS",
    "SUPPORTED DEVNET WALLETS",
    "updateDiagnostics()",
    "copyDiagnosticsSnapshot()",
    "Open Wallet Matrix",
    "Open Real-Device Runtime",
    "Open MagicBlock Runtime Path",
    "Open MagicBlock Runtime Package",
    "Open Devnet Canary",
    "Open Runtime Attestation",
    "Open Go-Live Attestation",
    "wallet-compatibility-matrix.generated.md",
    "real-device-runtime.generated.md",
    "devnet-canary.generated.md",
    "runtime-attestation.generated.json",
    "go-live-attestation.generated.json",
    "mainnet-readiness.generated.md",
  ]) {
    assert(frontend.includes(fragment), `runtime surface is missing: ${fragment}`);
  }

  for (const wallet of runtime.supportedWallets) {
    assert(frontend.includes(wallet.label), `runtime surface is missing wallet label: ${wallet.label}`);
  }

  assert(runtime.diagnosticsPage.endsWith("?page=diagnostics"), "runtime attestation diagnostics URL is unexpected");

  assert(Boolean(runtime.runtimeDocs?.includes?.("docs/wallet-compatibility-matrix.generated.md")), "runtime attestation is missing wallet matrix docs");
  assert(Boolean(runtime.runtimeDocs?.includes?.("docs/real-device-runtime.generated.md")), "runtime attestation is missing real-device runtime docs");
  assert(Boolean(runtime.runtimeDocs?.includes?.("docs/magicblock-runtime.generated.md")), "runtime attestation is missing MagicBlock runtime docs");
  assert(Boolean(runtime.runtimeDocs?.includes?.("docs/devnet-canary.generated.md")), "runtime attestation is missing devnet canary docs");

  if (runtime.pdaoToken?.mint) {
    assert(frontend.includes(runtime.pdaoToken.mint), "runtime surface is missing the PDAO mint");
  }

  if (proof.pdaoToken?.mint) {
    assert(runtime.pdaoToken?.mint === proof.pdaoToken.mint, "runtime attestation PDAO mint drift detected");
  }

  assert(frontend.includes(proof.programId), "runtime surface is missing the live program id");

  console.log("Runtime surface verification: PASS");
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.resolve(relativePath), "utf8")) as T;
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

main();
