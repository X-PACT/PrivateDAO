import fs from "fs";
import path from "path";

function main() {
  const auditPacketPath = path.resolve("docs/audit-packet.generated.md");
  const attestationPath = path.resolve("docs/review-attestation.generated.json");
  const cryptographicManifestPath = path.resolve("docs/cryptographic-manifest.generated.json");
  const zkRegistryPath = path.resolve("docs/zk-registry.generated.json");
  const zkTranscriptPath = path.resolve("docs/zk-transcript.generated.md");
  const zkAttestationPath = path.resolve("docs/zk-attestation.generated.json");
  const mainnetReadinessReportPath = path.resolve("docs/mainnet-readiness.generated.md");
  const deploymentAttestationPath = path.resolve("docs/deployment-attestation.generated.json");
  const goLiveAttestationPath = path.resolve("docs/go-live-attestation.generated.json");
  const runtimeAttestationPath = path.resolve("docs/runtime-attestation.generated.json");
  const pdaoAttestationPath = path.resolve("docs/pdao-attestation.generated.json");
  const walletMatrixJsonPath = path.resolve("docs/wallet-compatibility-matrix.generated.json");
  const walletMatrixMdPath = path.resolve("docs/wallet-compatibility-matrix.generated.md");
  const devnetCanaryJsonPath = path.resolve("docs/devnet-canary.generated.json");
  const devnetCanaryMdPath = path.resolve("docs/devnet-canary.generated.md");
  const devnetWalletRegistryPath = path.resolve("docs/devnet-wallet-registry.json");
  const devnetBootstrapPath = path.resolve("docs/devnet-bootstrap.json");
  const devnetTxRegistryPath = path.resolve("docs/devnet-tx-registry.json");
  const adversarialReportPath = path.resolve("docs/adversarial-report.json");
  const zkProofRegistryPath = path.resolve("docs/zk-proof-registry.json");
  const performanceMetricsPath = path.resolve("docs/performance-metrics.json");
  const loadTestReportPath = path.resolve("docs/load-test-report.md");
  const devnetMultiProposalReportJsonPath = path.resolve("docs/devnet-multi-proposal-report.json");
  const devnetMultiProposalReportMdPath = path.resolve("docs/devnet-multi-proposal-report.md");
  const devnetRaceReportJsonPath = path.resolve("docs/devnet-race-report.json");
  const devnetRaceReportMdPath = path.resolve("docs/devnet-race-report.md");
  const devnetResilienceReportJsonPath = path.resolve("docs/devnet-resilience-report.json");
  const devnetResilienceReportMdPath = path.resolve("docs/devnet-resilience-report.md");

  if (!fs.existsSync(auditPacketPath)) {
    throw new Error("missing generated audit packet");
  }
  if (!fs.existsSync(attestationPath)) {
    throw new Error("missing generated review attestation");
  }
  if (!fs.existsSync(cryptographicManifestPath)) {
    throw new Error("missing generated cryptographic manifest");
  }
  if (!fs.existsSync(zkRegistryPath)) {
    throw new Error("missing generated zk registry");
  }
  if (!fs.existsSync(zkTranscriptPath)) {
    throw new Error("missing generated zk transcript");
  }
  if (!fs.existsSync(zkAttestationPath)) {
    throw new Error("missing generated zk attestation");
  }
  if (!fs.existsSync(mainnetReadinessReportPath)) {
    throw new Error("missing generated mainnet readiness report");
  }
  if (!fs.existsSync(deploymentAttestationPath)) {
    throw new Error("missing generated deployment attestation");
  }
  if (!fs.existsSync(goLiveAttestationPath)) {
    throw new Error("missing generated go-live attestation");
  }
  if (!fs.existsSync(runtimeAttestationPath)) {
    throw new Error("missing generated runtime attestation");
  }
  if (!fs.existsSync(pdaoAttestationPath)) {
    throw new Error("missing generated PDAO attestation");
  }
  if (!fs.existsSync(walletMatrixJsonPath) || !fs.existsSync(walletMatrixMdPath)) {
    throw new Error("missing wallet compatibility matrix artifacts");
  }
  if (!fs.existsSync(devnetCanaryJsonPath) || !fs.existsSync(devnetCanaryMdPath)) {
    throw new Error("missing devnet canary artifacts");
  }
  if (!fs.existsSync(devnetWalletRegistryPath)) {
    throw new Error("missing devnet wallet registry");
  }
  if (!fs.existsSync(devnetBootstrapPath)) {
    throw new Error("missing devnet bootstrap report");
  }
  if (!fs.existsSync(devnetTxRegistryPath)) {
    throw new Error("missing devnet tx registry");
  }
  if (!fs.existsSync(adversarialReportPath)) {
    throw new Error("missing adversarial report");
  }
  if (!fs.existsSync(zkProofRegistryPath)) {
    throw new Error("missing zk proof registry");
  }
  if (!fs.existsSync(performanceMetricsPath)) {
    throw new Error("missing performance metrics report");
  }
  if (!fs.existsSync(loadTestReportPath)) {
    throw new Error("missing load test report");
  }
  if (!fs.existsSync(devnetMultiProposalReportJsonPath)) {
    throw new Error("missing devnet multi-proposal report");
  }
  if (!fs.existsSync(devnetMultiProposalReportMdPath)) {
    throw new Error("missing devnet multi-proposal markdown report");
  }
  if (!fs.existsSync(devnetRaceReportJsonPath)) {
    throw new Error("missing devnet race report");
  }
  if (!fs.existsSync(devnetRaceReportMdPath)) {
    throw new Error("missing devnet race markdown report");
  }
  if (!fs.existsSync(devnetResilienceReportJsonPath)) {
    throw new Error("missing devnet resilience report");
  }
  if (!fs.existsSync(devnetResilienceReportMdPath)) {
    throw new Error("missing devnet resilience markdown report");
  }

  const auditPacket = fs.readFileSync(auditPacketPath, "utf8");
  const attestation = JSON.parse(fs.readFileSync(attestationPath, "utf8")) as {
    project: string;
    programId: string;
    verificationWallet: string;
    pdaoToken?: {
      mint: string;
      programId: string;
      tokenAccount: string;
      metadataUri: string;
      decimals: number;
      supplyUi: string;
      transactionLabels: string[];
    };
    gateCount: number;
    packageCounts: Record<string, number>;
    zk?: {
      stackVersion: number;
      entryCount: number;
      verificationDocs?: string[];
      layers: Array<{ layer: string; circuit: string; publicSignalCount: number }>;
    };
    runtimeDocs?: string[];
    cryptographicIntegrity?: {
      algorithm: string;
      entryCount: number;
      aggregateSha256: string;
    };
  };
  const cryptographicManifest = JSON.parse(fs.readFileSync(cryptographicManifestPath, "utf8")) as {
    project: string;
    algorithm: string;
    entryCount: number;
    aggregateSha256: string;
    files: Array<{ path: string; sha256: string }>;
  };
  const zkRegistry = JSON.parse(fs.readFileSync(zkRegistryPath, "utf8")) as {
    project: string;
    zkStackVersion: number;
    entryCount: number;
    entries: Array<{ circuit: string; layer: string; publicSignalCount: number }>;
  };
  const zkTranscript = fs.readFileSync(zkTranscriptPath, "utf8");
  const mainnetReadinessReport = fs.readFileSync(mainnetReadinessReportPath, "utf8");
  const deploymentAttestation = JSON.parse(fs.readFileSync(deploymentAttestationPath, "utf8")) as {
    project: string;
    programId: string;
    verificationWallet: string;
    gateCount: number;
    runtimeDocs: string[];
  };
  const goLiveAttestation = JSON.parse(fs.readFileSync(goLiveAttestationPath, "utf8")) as {
    project: string;
    programId: string;
    verificationWallet: string;
    decision: string;
    criteriaDocs: string[];
    runtimeDocs: string[];
    blockers: Array<{ name: string; status: string }>;
  };
  const runtimeAttestation = JSON.parse(fs.readFileSync(runtimeAttestationPath, "utf8")) as {
    project: string;
    programId: string;
    verificationWallet: string;
    diagnosticsPage: string;
    runtimeDocs: string[];
    supportedWallets: Array<{ id: string; label: string }>;
  };
  const pdaoAttestation = JSON.parse(fs.readFileSync(pdaoAttestationPath, "utf8")) as {
    project: string;
    privateDaoProgramId: string;
    verificationWallet: string;
    pdaoToken: {
      name: string;
      symbol: string;
      platform: string;
      mint: string;
      tokenProgramId: string;
      metadataAssetPath: string;
      metadataUri: string;
      supplyUi: string;
      transactionLabels: string[];
    };
    programBoundary: {
      privateDaoProgramId: string;
      tokenProgramId: string;
      explanation: string;
    };
    verificationDocs: string[];
  };
  const walletMatrix = JSON.parse(fs.readFileSync(walletMatrixJsonPath, "utf8")) as {
    programId: string;
    diagnosticsPage: string;
    entries: Array<{ id: string; label: string; diagnosticsVisible: boolean; selectorVisible: boolean }>;
  };
  const walletMatrixMd = fs.readFileSync(walletMatrixMdPath, "utf8");
  const devnetCanary = JSON.parse(fs.readFileSync(devnetCanaryJsonPath, "utf8")) as {
    network: string;
    programId: string;
    primaryRpc: { label: string; blockhash: string; slot: number };
    fallbackRpc: { label: string; blockhash: string; slot: number };
    anchors: Array<{ label: string; exists: boolean }>;
    tokenSupply: { mint: string };
    summary: {
      primaryHealthy: boolean;
      fallbackHealthy: boolean;
      anchorAccountsPresent: boolean;
      unexpectedFailures: number;
    };
  };
  const devnetCanaryMd = fs.readFileSync(devnetCanaryMdPath, "utf8");
  const devnetWalletRegistry = JSON.parse(fs.readFileSync(devnetWalletRegistryPath, "utf8")) as {
    network: string;
    wallets: Array<{ wallet_index: number; public_key: string; role: string; funding: { success: boolean } }>;
  };
  const devnetBootstrap = JSON.parse(fs.readFileSync(devnetBootstrapPath, "utf8")) as {
    network: string;
    program_id: string;
    governance_mint: string;
    dao_public_key: string;
    proposal_public_key: string;
    transactions: Record<string, string>;
  };
  const devnetTxRegistry = JSON.parse(fs.readFileSync(devnetTxRegistryPath, "utf8")) as {
    network: string;
    entries: Array<{ tx_signature: string; action: string }>;
  };
  const adversarialReport = JSON.parse(fs.readFileSync(adversarialReportPath, "utf8")) as {
    total_scenarios: number;
    rejected: number;
    scenarios: Array<{ outcome: string; scenario: string }>;
  };
  const zkProofRegistry = JSON.parse(fs.readFileSync(zkProofRegistryPath, "utf8")) as {
    verification_mode: string;
    entries: Array<{ layer: string; proof_hash: string; public_inputs_hash: string }>;
  };
  const performanceMetrics = JSON.parse(fs.readFileSync(performanceMetricsPath, "utf8")) as {
    walletCount: number;
    totalTxCount: number;
    totalAttemptCount: number;
  };
  const loadTestReport = fs.readFileSync(loadTestReportPath, "utf8");
  const devnetMultiProposalReport = JSON.parse(fs.readFileSync(devnetMultiProposalReportJsonPath, "utf8")) as {
    network: string;
    programId: string;
    governanceMint: string;
    proposals: Array<{ proposalPublicKey: string; executeTx: string }>;
    summary: {
      proposalCount: number;
      executedCount: number;
      crossProposalRejections: number;
      unexpectedSuccesses: number;
    };
  };
  const devnetMultiProposalReportMd = fs.readFileSync(devnetMultiProposalReportMdPath, "utf8");
  const devnetRaceReport = JSON.parse(fs.readFileSync(devnetRaceReportJsonPath, "utf8")) as {
    network: string;
    programId: string;
    governanceMint: string;
    finalizeRace: { successCount: number; rejectedCount: number };
    executeRace: { successCount: number; rejectedCount: number };
    summary: {
      finalizeSingleWinner: boolean;
      executeSingleWinner: boolean;
      unexpectedSuccesses: number;
    };
  };
  const devnetRaceReportMd = fs.readFileSync(devnetRaceReportMdPath, "utf8");
  const devnetResilienceReport = JSON.parse(fs.readFileSync(devnetResilienceReportJsonPath, "utf8")) as {
    network: string;
    programId: string;
    governanceMint: string;
    primaryRpc: string;
    fallbackRpc: string;
    rpcMatrix: Array<{ label: string; status: string; blockhash: string }>;
    failover: { recovered: boolean; invalidRpcError: string; fallbackBlockhash: string };
    staleBlockhashRecovery: {
      rejectedAsExpected: boolean;
      staleError: string;
      recoveredTx: string;
      probeBalanceDeltaLamports: number;
    };
    summary: {
      primaryHealthy: boolean;
      fallbackHealthy: boolean;
      failoverRecovered: boolean;
      staleBlockhashRejected: boolean;
      staleBlockhashRecovered: boolean;
      unexpectedSuccesses: number;
    };
  };
  const devnetResilienceReportMd = fs.readFileSync(devnetResilienceReportMdPath, "utf8");
  const zkAttestation = JSON.parse(fs.readFileSync(zkAttestationPath, "utf8")) as {
    project: string;
    zkStackVersion: number;
    provingSystem: string;
    layerCount: number;
    layers: Array<{ layer: string; circuit: string; publicSignalCount: number }>;
  };

  if (attestation.project !== "PrivateDAO") {
    throw new Error("generated attestation project mismatch");
  }

  if (attestation.programId !== "5AhUsbQ4mJ8Xh7QJEomuS85qGgmK9iNvFqzF669Y7Psx") {
    throw new Error("generated attestation program id mismatch");
  }

  if (attestation.verificationWallet !== "4Mm5YTRbJuyA8NcWM85wTnx6ZQMXNph2DSnzCCKLhsMD") {
    throw new Error("generated attestation verification wallet mismatch");
  }

  if (!attestation.pdaoToken) {
    throw new Error("generated attestation is missing the PDAO token summary");
  }

  if (attestation.pdaoToken.mint !== "AZUkprJDfJPgAp7L4z3TpCV3KHqLiA8RjHAVhK9HCvDt") {
    throw new Error("generated attestation PDAO mint mismatch");
  }

  if (attestation.pdaoToken.programId !== "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb") {
    throw new Error("generated attestation PDAO program mismatch");
  }

  if (attestation.pdaoToken.transactionLabels.length < 4) {
    throw new Error("generated attestation PDAO transaction labels are incomplete");
  }

  if (devnetWalletRegistry.network !== "devnet" || devnetWalletRegistry.wallets.length !== 50) {
    throw new Error("devnet wallet registry is incomplete");
  }

  if (!devnetWalletRegistry.wallets.every((wallet) => wallet.funding.success)) {
    throw new Error("devnet wallet registry contains unfunded wallets");
  }

  if (devnetBootstrap.network !== "devnet" || devnetBootstrap.program_id !== attestation.programId) {
    throw new Error("devnet bootstrap report does not match canonical program state");
  }

  if (devnetBootstrap.governance_mint !== attestation.pdaoToken.mint) {
    throw new Error("devnet bootstrap governance mint does not match PDAO mint");
  }

  if (devnetTxRegistry.network !== "devnet" || devnetTxRegistry.entries.length < 40) {
    throw new Error("devnet tx registry is unexpectedly weak");
  }

  if (adversarialReport.total_scenarios <= 0 || adversarialReport.rejected <= 0) {
    throw new Error("adversarial report is missing rejection evidence");
  }

  if (zkProofRegistry.verification_mode !== "offchain-groth16" || zkProofRegistry.entries.length < 5) {
    throw new Error("zk proof registry is unexpectedly weak");
  }

  if (!zkProofRegistry.entries.every((entry) => entry.proof_hash && entry.public_inputs_hash)) {
    throw new Error("zk proof registry entries are incomplete");
  }

  if (performanceMetrics.walletCount !== 50 || performanceMetrics.totalTxCount < 40 || performanceMetrics.totalAttemptCount < 50) {
    throw new Error("performance metrics are unexpectedly weak");
  }

  if (!loadTestReport.includes("# Devnet Load Test Report") || !loadTestReport.includes("number of wallets: 50")) {
    throw new Error("load test report is missing the expected overview");
  }

  if (walletMatrix.programId !== attestation.programId || !walletMatrix.diagnosticsPage.endsWith("?page=diagnostics")) {
    throw new Error("wallet compatibility matrix does not match canonical runtime state");
  }

  if (walletMatrix.entries.length < 5 || walletMatrix.entries.some((entry) => !entry.diagnosticsVisible || !entry.selectorVisible)) {
    throw new Error("wallet compatibility matrix is unexpectedly weak");
  }

  if (!walletMatrixMd.includes("# Wallet Compatibility Matrix")) {
    throw new Error("wallet compatibility matrix markdown is invalid");
  }

  if (devnetCanary.network !== "devnet" || devnetCanary.programId !== attestation.programId) {
    throw new Error("devnet canary does not match canonical program state");
  }

  if (!devnetCanary.summary.primaryHealthy || !devnetCanary.summary.fallbackHealthy || !devnetCanary.summary.anchorAccountsPresent) {
    throw new Error("devnet canary is missing healthy runtime evidence");
  }

  if (devnetCanary.summary.unexpectedFailures !== 0 || devnetCanary.anchors.length < 6) {
    throw new Error("devnet canary is unexpectedly weak");
  }

  if (!devnetCanary.primaryRpc.blockhash || !devnetCanary.fallbackRpc.blockhash || devnetCanary.primaryRpc.slot <= 0 || devnetCanary.fallbackRpc.slot <= 0) {
    throw new Error("devnet canary rpc health is incomplete");
  }

  if (devnetCanary.tokenSupply.mint !== attestation.pdaoToken.mint) {
    throw new Error("devnet canary governance mint does not match PDAO mint");
  }

  if (!devnetCanaryMd.includes("# Devnet Canary Report")) {
    throw new Error("devnet canary markdown report is invalid");
  }

  if (devnetMultiProposalReport.network !== "devnet" || devnetMultiProposalReport.programId !== attestation.programId) {
    throw new Error("devnet multi-proposal report does not match canonical program state");
  }

  if (devnetMultiProposalReport.governanceMint !== attestation.pdaoToken.mint) {
    throw new Error("devnet multi-proposal report governance mint does not match PDAO mint");
  }

  if (devnetMultiProposalReport.summary.proposalCount < 3 || devnetMultiProposalReport.summary.executedCount < 3) {
    throw new Error("devnet multi-proposal report is unexpectedly weak");
  }

  if (devnetMultiProposalReport.summary.crossProposalRejections < 3 || devnetMultiProposalReport.summary.unexpectedSuccesses !== 0) {
    throw new Error("devnet multi-proposal report is missing cross-proposal rejection coverage");
  }

  if (!devnetMultiProposalReport.proposals.every((proposal) => proposal.proposalPublicKey && proposal.executeTx)) {
    throw new Error("devnet multi-proposal report contains incomplete proposal execution evidence");
  }

  if (!devnetMultiProposalReportMd.includes("# Devnet Multi-Proposal Report") || !devnetMultiProposalReportMd.includes("cross-proposal rejections")) {
    throw new Error("devnet multi-proposal markdown report is missing reviewer-facing summary text");
  }

  if (devnetRaceReport.network !== "devnet" || devnetRaceReport.programId !== attestation.programId) {
    throw new Error("devnet race report does not match canonical program state");
  }

  if (devnetRaceReport.governanceMint !== attestation.pdaoToken.mint) {
    throw new Error("devnet race report governance mint does not match PDAO mint");
  }

  if (!devnetRaceReport.summary.finalizeSingleWinner || !devnetRaceReport.summary.executeSingleWinner) {
    throw new Error("devnet race report does not prove single-winner collision behavior");
  }

  if (devnetRaceReport.summary.unexpectedSuccesses !== 0) {
    throw new Error("devnet race report contains unexpected successes");
  }

  if (devnetRaceReport.finalizeRace.successCount !== 1 || devnetRaceReport.executeRace.successCount !== 1) {
    throw new Error("devnet race report winning counts are invalid");
  }

  if (devnetRaceReport.finalizeRace.rejectedCount < 1 || devnetRaceReport.executeRace.rejectedCount < 1) {
    throw new Error("devnet race report is missing rejected collision attempts");
  }

  if (
    !devnetRaceReportMd.includes("# Devnet Race Report") ||
    !devnetRaceReportMd.includes("one winning finalize") ||
    !devnetRaceReportMd.includes("one winning execute")
  ) {
    throw new Error("devnet race markdown report is missing reviewer-facing collision wording");
  }

  if (devnetResilienceReport.network !== "devnet" || devnetResilienceReport.programId !== attestation.programId) {
    throw new Error("devnet resilience report does not match canonical program state");
  }

  if (devnetResilienceReport.governanceMint !== attestation.pdaoToken.mint) {
    throw new Error("devnet resilience report governance mint does not match PDAO mint");
  }

  if (!devnetResilienceReport.summary.primaryHealthy || !devnetResilienceReport.summary.fallbackHealthy) {
    throw new Error("devnet resilience report is missing healthy RPC evidence");
  }

  if (!devnetResilienceReport.summary.failoverRecovered || !devnetResilienceReport.failover.recovered) {
    throw new Error("devnet resilience report is missing failover recovery evidence");
  }

  if (!devnetResilienceReport.failover.invalidRpcError || !devnetResilienceReport.failover.fallbackBlockhash) {
    throw new Error("devnet resilience report failover details are incomplete");
  }

  if (!devnetResilienceReport.summary.staleBlockhashRejected || !devnetResilienceReport.staleBlockhashRecovery.rejectedAsExpected) {
    throw new Error("devnet resilience report is missing stale blockhash rejection evidence");
  }

  if (!devnetResilienceReport.summary.staleBlockhashRecovered || !devnetResilienceReport.staleBlockhashRecovery.recoveredTx) {
    throw new Error("devnet resilience report is missing stale blockhash recovery evidence");
  }

  if (devnetResilienceReport.staleBlockhashRecovery.probeBalanceDeltaLamports !== 1) {
    throw new Error("devnet resilience report probe balance delta is unexpected");
  }

  if (devnetResilienceReport.summary.unexpectedSuccesses !== 0 || devnetResilienceReport.rpcMatrix.length < 2) {
    throw new Error("devnet resilience report is unexpectedly weak");
  }

  if (
    !devnetResilienceReportMd.includes("# Devnet Resilience Report") ||
    !devnetResilienceReportMd.includes("Failover Recovery") ||
    !devnetResilienceReportMd.includes("Stale Blockhash Recovery")
  ) {
    throw new Error("devnet resilience markdown report is missing reviewer-facing resilience wording");
  }

  if (attestation.gateCount < 8) {
    throw new Error("generated attestation gate count is unexpectedly low");
  }

  if (cryptographicManifest.project !== "PrivateDAO") {
    throw new Error("generated cryptographic manifest project mismatch");
  }

  if (cryptographicManifest.algorithm !== "sha256") {
    throw new Error("generated cryptographic manifest algorithm mismatch");
  }

  if (cryptographicManifest.entryCount < 10 || cryptographicManifest.files.length !== cryptographicManifest.entryCount) {
    throw new Error("generated cryptographic manifest entry count is unexpectedly low");
  }

  if (!attestation.cryptographicIntegrity) {
    throw new Error("generated attestation is missing cryptographic integrity summary");
  }

  if (!attestation.zk) {
    throw new Error("generated attestation is missing zk summary");
  }

  if (attestation.packageCounts.zk <= 0) {
    throw new Error("generated attestation zk package count is invalid");
  }

  if (attestation.zk.stackVersion < 1 || attestation.zk.entryCount < 3 || attestation.zk.layers.length < 3) {
    throw new Error("generated attestation zk summary is unexpectedly weak");
  }

  if (!attestation.zk.verificationDocs || attestation.zk.verificationDocs.length < 4) {
    throw new Error("generated attestation zk verification docs are missing");
  }

  if (!attestation.zk.verificationDocs.includes("docs/zk-attestation.generated.json")) {
    throw new Error("generated attestation is missing the zk attestation doc");
  }

  if (!attestation.runtimeDocs || !attestation.runtimeDocs.includes("docs/wallet-runtime.md")) {
    throw new Error("generated attestation runtime docs are missing");
  }
  if (!attestation.runtimeDocs.includes("docs/wallet-compatibility-matrix.generated.md")) {
    throw new Error("generated attestation is missing the wallet matrix doc");
  }
  if (!attestation.runtimeDocs.includes("docs/devnet-canary.generated.md")) {
    throw new Error("generated attestation is missing the devnet canary doc");
  }
  if (!attestation.runtimeDocs.includes("docs/go-live-attestation.generated.json")) {
    throw new Error("generated attestation is missing the go-live attestation doc");
  }
  if (!attestation.runtimeDocs.includes("docs/runtime-attestation.generated.json")) {
    throw new Error("generated attestation is missing the runtime attestation doc");
  }
  if (!attestation.runtimeDocs.includes("docs/pdao-attestation.generated.json")) {
    throw new Error("generated attestation is missing the PDAO attestation doc");
  }

  if (zkRegistry.project !== "PrivateDAO") {
    throw new Error("generated zk registry project mismatch");
  }

  if (zkRegistry.zkStackVersion < 1) {
    throw new Error("generated zk registry version mismatch");
  }

  if (zkRegistry.entryCount !== zkRegistry.entries.length || zkRegistry.entries.length < 3) {
    throw new Error("generated zk registry entry count mismatch");
  }

  for (const entry of zkRegistry.entries) {
    if (!entry.circuit || !entry.layer || entry.publicSignalCount <= 0) {
      throw new Error(`generated zk registry entry is invalid for ${entry.circuit || "unknown-circuit"}`);
    }
  }

  if (attestation.cryptographicIntegrity.algorithm !== cryptographicManifest.algorithm) {
    throw new Error("generated attestation cryptographic algorithm mismatch");
  }

  if (attestation.cryptographicIntegrity.entryCount !== cryptographicManifest.entryCount) {
    throw new Error("generated attestation cryptographic entry count mismatch");
  }

  if (attestation.cryptographicIntegrity.aggregateSha256 !== cryptographicManifest.aggregateSha256) {
    throw new Error("generated attestation cryptographic aggregate mismatch");
  }

  for (const manifestFile of [
    "docs/go-live-criteria.md",
    "docs/operational-drillbook.md",
    "docs/runtime-attestation.generated.json",
    "docs/go-live-attestation.generated.json",
  ]) {
    if (!cryptographicManifest.files.some((entry) => entry.path === manifestFile)) {
      throw new Error(`generated cryptographic manifest is missing ${manifestFile}`);
    }
  }

  for (const [pkg, count] of Object.entries(attestation.packageCounts)) {
    if (count <= 0) {
      throw new Error(`generated attestation package count is invalid for ${pkg}`);
    }
  }

  if (!auditPacket.includes("# Audit Packet")) {
    throw new Error("generated audit packet content is invalid");
  }

  if (!auditPacket.includes("## ZK Package")) {
    throw new Error("generated audit packet is missing the ZK package section");
  }

  if (!auditPacket.includes("## PDAO Token Surface")) {
    throw new Error("generated audit packet is missing the PDAO token section");
  }
  if (!auditPacket.includes("docs/pdao-attestation.generated.json")) {
    throw new Error("generated audit packet is missing the PDAO attestation reference");
  }

  if (!auditPacket.includes("### ZK Review Commands")) {
    throw new Error("generated audit packet is missing the ZK review command section");
  }

  if (!auditPacket.includes("docs/mainnet-readiness.generated.md")) {
    throw new Error("generated audit packet is missing the mainnet readiness report reference");
  }
  if (!auditPacket.includes("docs/go-live-attestation.generated.json")) {
    throw new Error("generated audit packet is missing the go-live attestation reference");
  }
  if (!auditPacket.includes("docs/devnet-multi-proposal-report.json")) {
    throw new Error("generated audit packet is missing the devnet multi-proposal reference");
  }
  if (!auditPacket.includes("docs/devnet-race-report.json")) {
    throw new Error("generated audit packet is missing the devnet race reference");
  }
  if (!auditPacket.includes("docs/devnet-resilience-report.json")) {
    throw new Error("generated audit packet is missing the devnet resilience reference");
  }
  if (!auditPacket.includes("docs/wallet-compatibility-matrix.generated.json")) {
    throw new Error("generated audit packet is missing the wallet matrix reference");
  }
  if (!auditPacket.includes("docs/devnet-canary.generated.json")) {
    throw new Error("generated audit packet is missing the devnet canary reference");
  }

  if (!zkTranscript.includes("# ZK Transcript")) {
    throw new Error("generated zk transcript content is invalid");
  }

  if (!mainnetReadinessReport.includes("# Mainnet Readiness Report")) {
    throw new Error("generated mainnet readiness report content is invalid");
  }

  if (deploymentAttestation.project !== "PrivateDAO") {
    throw new Error("generated deployment attestation project mismatch");
  }

  if (deploymentAttestation.programId !== "5AhUsbQ4mJ8Xh7QJEomuS85qGgmK9iNvFqzF669Y7Psx") {
    throw new Error("generated deployment attestation program mismatch");
  }

  if (deploymentAttestation.verificationWallet !== "4Mm5YTRbJuyA8NcWM85wTnx6ZQMXNph2DSnzCCKLhsMD") {
    throw new Error("generated deployment attestation verification wallet mismatch");
  }

  if (!deploymentAttestation.runtimeDocs.includes("docs/wallet-runtime.md")) {
    throw new Error("generated deployment attestation is missing wallet runtime docs");
  }
  if (!deploymentAttestation.runtimeDocs.includes("docs/go-live-criteria.md")) {
    throw new Error("generated deployment attestation is missing go-live criteria docs");
  }

  if (goLiveAttestation.project !== "PrivateDAO") {
    throw new Error("generated go-live attestation project mismatch");
  }

  if (goLiveAttestation.programId !== "5AhUsbQ4mJ8Xh7QJEomuS85qGgmK9iNvFqzF669Y7Psx") {
    throw new Error("generated go-live attestation program mismatch");
  }

  if (goLiveAttestation.verificationWallet !== "4Mm5YTRbJuyA8NcWM85wTnx6ZQMXNph2DSnzCCKLhsMD") {
    throw new Error("generated go-live attestation verification wallet mismatch");
  }

  if (goLiveAttestation.decision !== "blocked-pending-external-steps") {
    throw new Error("generated go-live attestation decision is unexpectedly weak");
  }

  if (!goLiveAttestation.criteriaDocs.includes("docs/go-live-criteria.md")) {
    throw new Error("generated go-live attestation is missing go-live criteria docs");
  }

  if (!goLiveAttestation.runtimeDocs.includes("docs/wallet-runtime.md")) {
    throw new Error("generated go-live attestation is missing wallet runtime docs");
  }

  if (!goLiveAttestation.blockers.some((entry) => entry.name === "externalAudit" && entry.status === "pending")) {
    throw new Error("generated go-live attestation is missing the external-audit blocker");
  }

  if (runtimeAttestation.project !== "PrivateDAO") {
    throw new Error("generated runtime attestation project mismatch");
  }

  if (runtimeAttestation.programId !== "5AhUsbQ4mJ8Xh7QJEomuS85qGgmK9iNvFqzF669Y7Psx") {
    throw new Error("generated runtime attestation program mismatch");
  }

  if (runtimeAttestation.verificationWallet !== "4Mm5YTRbJuyA8NcWM85wTnx6ZQMXNph2DSnzCCKLhsMD") {
    throw new Error("generated runtime attestation verification wallet mismatch");
  }

  if (!runtimeAttestation.diagnosticsPage.endsWith("?page=diagnostics")) {
    throw new Error("generated runtime attestation diagnostics page mismatch");
  }

  if (!runtimeAttestation.supportedWallets.some((entry) => entry.id === "phantom")) {
    throw new Error("generated runtime attestation is missing Phantom support");
  }

  if (pdaoAttestation.project !== "PrivateDAO") {
    throw new Error("generated PDAO attestation project mismatch");
  }

  if (pdaoAttestation.privateDaoProgramId !== "5AhUsbQ4mJ8Xh7QJEomuS85qGgmK9iNvFqzF669Y7Psx") {
    throw new Error("generated PDAO attestation governance program mismatch");
  }

  if (pdaoAttestation.verificationWallet !== "4Mm5YTRbJuyA8NcWM85wTnx6ZQMXNph2DSnzCCKLhsMD") {
    throw new Error("generated PDAO attestation verification wallet mismatch");
  }

  if (pdaoAttestation.pdaoToken.name !== "PDAO" || pdaoAttestation.pdaoToken.symbol !== "PDAO") {
    throw new Error("generated PDAO attestation token identity mismatch");
  }

  if (pdaoAttestation.pdaoToken.platform !== "DeAura") {
    throw new Error("generated PDAO attestation platform mismatch");
  }

  if (pdaoAttestation.pdaoToken.mint !== "AZUkprJDfJPgAp7L4z3TpCV3KHqLiA8RjHAVhK9HCvDt") {
    throw new Error("generated PDAO attestation mint mismatch");
  }

  if (pdaoAttestation.pdaoToken.tokenProgramId !== "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb") {
    throw new Error("generated PDAO attestation token program mismatch");
  }

  if (pdaoAttestation.pdaoToken.metadataAssetPath !== "docs/assets/pdao-token.json") {
    throw new Error("generated PDAO attestation metadata asset path mismatch");
  }

  if (pdaoAttestation.pdaoToken.metadataUri !== "https://x-pact.github.io/PrivateDAO/assets/pdao-token.json") {
    throw new Error("generated PDAO attestation metadata URI mismatch");
  }

  if (pdaoAttestation.pdaoToken.supplyUi !== "1000000" || pdaoAttestation.pdaoToken.transactionLabels.length < 4) {
    throw new Error("generated PDAO attestation supply summary is incomplete");
  }

  if (pdaoAttestation.programBoundary.privateDaoProgramId !== pdaoAttestation.privateDaoProgramId) {
    throw new Error("generated PDAO attestation boundary governance mismatch");
  }

  if (!pdaoAttestation.programBoundary.explanation.includes("Token-2022")) {
    throw new Error("generated PDAO attestation boundary explanation is incomplete");
  }

  if (!pdaoAttestation.verificationDocs.includes("docs/assets/pdao-token.json")) {
    throw new Error("generated PDAO attestation is missing the metadata asset reference");
  }

  if (zkAttestation.project !== "PrivateDAO") {
    throw new Error("generated zk attestation project mismatch");
  }

  if (zkAttestation.zkStackVersion !== zkRegistry.zkStackVersion || zkAttestation.layerCount !== zkRegistry.entryCount) {
    throw new Error("generated zk attestation summary mismatch");
  }

  if (zkAttestation.provingSystem !== "groth16" || zkAttestation.layers.length < 3) {
    throw new Error("generated zk attestation proving summary is unexpectedly weak");
  }

  if (!cryptographicManifest.files.some((entry) => entry.path === "docs/zk-registry.generated.json")) {
    throw new Error("generated cryptographic manifest is missing the zk registry");
  }

  if (!cryptographicManifest.files.some((entry) => entry.path === "docs/zk-transcript.generated.md")) {
    throw new Error("generated cryptographic manifest is missing the zk transcript");
  }

  if (!cryptographicManifest.files.some((entry) => entry.path === "docs/zk-attestation.generated.json")) {
    throw new Error("generated cryptographic manifest is missing the zk attestation");
  }

  if (!cryptographicManifest.files.some((entry) => entry.path === "docs/deployment-attestation.generated.json")) {
    throw new Error("generated cryptographic manifest is missing the deployment attestation");
  }
  if (!cryptographicManifest.files.some((entry) => entry.path === "docs/pdao-attestation.generated.json")) {
    throw new Error("generated cryptographic manifest is missing the PDAO attestation");
  }
  if (!cryptographicManifest.files.some((entry) => entry.path === "docs/assets/pdao-token.json")) {
    throw new Error("generated cryptographic manifest is missing the PDAO metadata asset");
  }
  if (!cryptographicManifest.files.some((entry) => entry.path === "docs/devnet-multi-proposal-report.json")) {
    throw new Error("generated cryptographic manifest is missing the multi-proposal report");
  }
  if (!cryptographicManifest.files.some((entry) => entry.path === "docs/devnet-race-report.json")) {
    throw new Error("generated cryptographic manifest is missing the race report");
  }
  if (!cryptographicManifest.files.some((entry) => entry.path === "docs/devnet-resilience-report.json")) {
    throw new Error("generated cryptographic manifest is missing the resilience report");
  }
  if (!cryptographicManifest.files.some((entry) => entry.path === "docs/wallet-compatibility-matrix.generated.json")) {
    throw new Error("generated cryptographic manifest is missing the wallet matrix");
  }
  if (!cryptographicManifest.files.some((entry) => entry.path === "docs/devnet-canary.generated.json")) {
    throw new Error("generated cryptographic manifest is missing the devnet canary");
  }

  console.log("Generated artifact verification: PASS");
}

main();
