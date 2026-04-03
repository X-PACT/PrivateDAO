import fs from "fs";
import path from "path";

const FRONTEND = path.resolve("docs/index.html");

function main() {
  const body = fs.readFileSync(FRONTEND, "utf8");

  const requiredFragments = [
    "Zero-Knowledge Layer Live",
    "Real Groth16 overlay live",
    "vote-validity, delegation-authorization, and tally-integrity proof layers",
    "DELEGATION LAYER",
    "TALLY LAYER",
    "zk-stack.md",
    "Connect a Solana wallet such as Phantom, Solflare, or Backpack on Devnet.",
    "window.backpack?.solana",
    "window.solflare?.solflare",
    "walletProviderName",
    "custom-cursor-enabled",
    "requestAnimationFrame(renderCursor)",
    "verify:all",
    "zk-layer.md",
    "zk-capability-matrix.md",
    "CAPABILITY MATRIX",
    "PER-LAYER REVIEW PATH",
    "🔒 ZK Secured",
    "Zero-Knowledge Protection",
    "Groth16 zk-SNARK proofs",
    "ZK Layer",
    "Zero-Knowledge Proof Verified",
    "verify:zk-docs",
    "zk-provenance.md",
    "zk-transcript.generated.md",
    "zk-attestation.generated.json",
    "verify:zk-transcript",
    "verify:zk-attestation",
    "verify:zk-consistency",
    "verify:zk-negative",
    "Artifact Integrity",
    "cryptographic-integrity.md",
    "cryptographic-manifest.generated.json",
    "PDAO",
    "DeAura",
    "Governance Voting Token",
    "PrivateDAO Governance Token (PDAO)",
    "Enables proposal participation",
    "Supports voting authority",
    "Aligns treasury governance",
    "Prevents governance spam",
    "Anchors long-term ecosystem participation",
    "token.md",
    "pdao-token.md",
    "AZUkprJDfJPgAp7L4z3TpCV3KHqLiA8RjHAVhK9HCvDt",
    "1,000,000 PDAO",
    "Token-2022",
    "verify:cryptographic-manifest",
    "SUPPORTED DEVNET WALLETS",
    "Phantom",
    "Solflare",
    "Backpack",
    "Glow",
    "toggleWalletPanel",
    "Security Evidence",
    "ATTESTATION",
    "Open zk attestation",
    "page-docs",
    "Interactive Review Document",
    "docViewerContent",
    "copyDocViewerLink",
    "renderMarkdownDocument",
    "renderJsonDocument",
    "isInteractiveDocLink",
    "Open Raw File",
    "openDocument('zk-layer.md','ZK Layer',this)",
    "openDocument('android-native.md','Android Native',this)",
    "page-diagnostics",
    "Wallet Diagnostics",
    "updateDiagnostics()",
    "copyDiagnosticsSnapshot",
    "diagSnapshotOutput",
    "mainnet-readiness.generated.md",
    "RPC HEALTH",
    "SUPPORTED PROVIDERS",
    "BROWSER CAPABILITIES",
    "LIVE RUNTIME",
  ];

  for (const fragment of requiredFragments) {
    assertContains(body, fragment, `frontend surface is missing required fragment: ${fragment}`);
  }

  assertNotContains(body, "setInterval(() => {\n  rx +=", "frontend still uses the old interval-based cursor loop");
  assertNotContains(body, "Tracks, sponsors,<br>and ecosystem fit.", "low-signal hackathon context section still exists on the main surface");
  assertNotContains(body, "Install Phantom or Solflare to sign transactions.", "frontend still shows the outdated wallet-install guidance");

  console.log("Frontend surface verification: PASS");
}

function assertContains(body: string, fragment: string, message: string) {
  if (!body.includes(fragment)) {
    throw new Error(message);
  }
}

function assertNotContains(body: string, fragment: string, message: string) {
  if (body.includes(fragment)) {
    throw new Error(message);
  }
}

main();
