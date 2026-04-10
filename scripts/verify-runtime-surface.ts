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
  const diagnosticsPage = fs.readFileSync(path.resolve("apps/web/src/app/diagnostics/page.tsx"), "utf8");
  const diagnostics = fs.readFileSync(path.resolve("apps/web/src/components/diagnostics-center.tsx"), "utf8");
  const walletRuntime = fs.readFileSync(path.resolve("apps/web/src/components/wallet-runtime-panel.tsx"), "utf8");
  const walletProvider = fs.readFileSync(path.resolve("apps/web/src/components/wallet-provider.tsx"), "utf8");
  const siteData = fs.readFileSync(path.resolve("apps/web/src/lib/site-data.ts"), "utf8");
  const runtime = readJson<RuntimeAttestation>("docs/runtime-attestation.generated.json");
  const proof = readJson<ProofRegistry>("docs/proof-registry.json");

  for (const fragment of [
    "Diagnostics",
    "Operational diagnostics",
    "Verification chain",
    "runtime checks",
    "Connect Phantom, Solflare, or Backpack",
    "Execution boundary",
    "Launch honesty",
  ]) {
    assert(
      diagnosticsPage.includes(fragment) || diagnostics.includes(fragment) || walletRuntime.includes(fragment),
      `runtime surface is missing: ${fragment}`,
    );
  }

  for (const wallet of runtime.supportedWallets) {
    if (["Phantom", "Solflare", "Backpack"].includes(wallet.label)) {
      assert(walletProvider.includes(wallet.label), `runtime surface is missing wallet adapter: ${wallet.label}`);
    }
  }

  assert(runtime.diagnosticsPage.endsWith("/diagnostics/"), "runtime attestation diagnostics URL is unexpected");

  assert(Boolean(runtime.runtimeDocs?.includes?.("docs/wallet-compatibility-matrix.generated.md")), "runtime attestation is missing wallet matrix docs");
  assert(Boolean(runtime.runtimeDocs?.includes?.("docs/runtime/real-device.generated.md")), "runtime attestation is missing real-device runtime docs");
  assert(Boolean(runtime.runtimeDocs?.includes?.("docs/magicblock/runtime.generated.md")), "runtime attestation is missing MagicBlock runtime docs");
  assert(Boolean(runtime.runtimeDocs?.includes?.("docs/frontier-integrations.generated.md")), "runtime attestation is missing Frontier integration docs");
  assert(Boolean(runtime.runtimeDocs?.includes?.("docs/devnet-canary.generated.md")), "runtime attestation is missing devnet canary docs");

  if (proof.pdaoToken?.mint) {
    assert(runtime.pdaoToken?.mint === proof.pdaoToken.mint, "runtime attestation PDAO mint drift detected");
  }

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
