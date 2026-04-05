import fs from "fs";
import path from "path";

const FRONTEND = path.resolve("docs/index.html");

function main() {
  const body = fs.readFileSync(FRONTEND, "utf8");

  const requiredFragments = [
    "Zero-Knowledge Layer Live",
    "Groth16 companion proofs live",
    "vote-validity, delegation-authorization, and tally-integrity proof layers",
    "DELEGATION LAYER",
    "TALLY LAYER",
    "zk-stack.md",
    "Connect a Solana wallet such as Phantom, Solflare, or Backpack on Devnet.",
    "window.backpack?.solana",
    "window.solflare?.solflare",
    "walletProviderName",
    "waitForWalletPublicKey",
    "selectedAddress",
    "accountsArray",
    "custom-cursor-enabled",
    "requestAnimationFrame(renderCursor)",
    "verify:all",
    "zk-layer.md",
    "zk-capability-matrix.md",
    "CAPABILITY MATRIX",
    "PER-LAYER REVIEW PATH",
    "🔒 ZK Companion Layer",
    "Gold Medal · 1st Place",
    "Zero-Knowledge Protection",
    "Groth16 zk-SNARK companion proofs",
    "ZK Layer",
    "Groth16 companion proof layer",
    "The current proof layer is additive and off-chain",
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
    "Community treasury app",
    "Token-gated participation",
    "PrivateDAO Governance Token (PDAO)",
    "Enables proposal participation",
    "Supports voting authority",
    "Aligns treasury governance",
    "Prevents governance spam",
    "Anchors long-term ecosystem participation",
    "token.md",
    "pdao-token.md",
    "pdao-attestation.generated.json",
    "assets/pdao-token.json",
    "AZUkprJDfJPgAp7L4z3TpCV3KHqLiA8RjHAVhK9HCvDt",
    "1,000,000 PDAO",
    "Token-2022",
    "PROGRAM BOUNDARY",
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
    "TRUTH-ALIGNED",
    "The raw commitment hash binds vote, salt, proposal key, and voter key.",
    "proposal account stays rent-safe",
    "Save the salt yourself; the browser does not persist it.",
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
    "mainnet-acceptance-matrix.generated.md",
    "mainnet-proof-package.generated.md",
    "deployment-attestation.generated.json",
    "go-live-criteria.md",
    "operational-drillbook.md",
    "runtime-attestation.generated.json",
    "runtime-evidence.generated.md",
    "real-device-runtime.md",
    "real-device-runtime.generated.md",
    "go-live-attestation.generated.json",
    "Fair Voting Model",
    "Wallet Runtime",
    "Real-Device Runtime QA",
    "Real-Device Runtime Evidence",
    "Runtime Evidence",
    "Operational Evidence",
    "Devnet Scale Profiles",
    "Consumer Readiness",
    "Consumer User Flows",
    "Launch And Growth Plan",
    "Wallet Compatibility Matrix",
    "Devnet Canary",
    "Cryptographic Posture",
    "Artifact Freshness",
    "Supply-Chain Attestation",
    "Release Ceremony",
    "Release Drill",
    "Review Automation",
    "Go-Live Criteria",
    "Operational Drillbook",
    "External Readiness Intake",
    "Runtime Attestation",
    "Go-Live Attestation",
    "Mainnet Acceptance Matrix",
    "Mainnet Proof Package",
    "wallet-compatibility-matrix.generated.md",
    "devnet-canary.generated.md",
    "cryptographic-posture.md",
    "supply-chain-attestation.generated.md",
    "release-ceremony-attestation.generated.md",
    "release-drill.generated.md",
    "devnet-scale-profiles.md",
    "artifact-freshness.md",
    "review-automation.md",
    "Open Runtime Evidence",
    "Open Real-Device Runtime",
    "Open Operational Evidence",
    "Open Acceptance Matrix",
    "Open Mainnet Proof Package",
    "domain-mirror.md",
    "Mirror Deployment",
    "Open Devnet Scale Profiles",
    "Open Wallet Matrix",
    "Open Devnet Canary",
    "Open Release Drill",
    "Open Artifact Freshness",
    "Open External Readiness Intake",
    "Open Review Automation",
    "RPC HEALTH",
    "SUPPORTED PROVIDERS",
    "BROWSER CAPABILITIES",
    "LIVE RUNTIME",
    "Wallet connected but did not expose a public key in time.",
    "assets/vendor/solana-web3.iife.min.js",
  ];

  for (const fragment of requiredFragments) {
    assertContains(body, fragment, `frontend surface is missing required fragment: ${fragment}`);
  }

  assertNotContains(body, "setInterval(() => {\n  rx +=", "frontend still uses the old interval-based cursor loop");
  assertNotContains(body, "Tracks, sponsors,<br>and ecosystem fit.", "low-signal hackathon context section still exists on the main surface");
  assertNotContains(body, "Install Phantom or Solflare to sign transactions.", "frontend still shows the outdated wallet-install guidance");
  assertNotContains(body, "https://unpkg.com/@solana/web3.js", "frontend must not depend on the unpkg-hosted Solana web3 bundle");
  assertNotContains(body, "https://fonts.googleapis.com", "frontend must not depend on Google Fonts");
  assertNotContains(body, "localStorage.setItem", "frontend must not persist sensitive governance state in localStorage");
  assertNotContains(body, "localStorage.getItem", "frontend must not read persisted localStorage vote secrets");
  assertNotContains(body, "sessionStorage.setItem", "frontend must not persist sensitive governance state in sessionStorage");
  assertNotContains(body, "sessionStorage.getItem", "frontend must not read persisted sessionStorage vote secrets");

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
