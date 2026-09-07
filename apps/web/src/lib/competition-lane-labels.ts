export function getCompetitionLaneLabel(slug: string) {
  switch (slug) {
    case "colosseum-frontier":
      return "Core Product Route";
    case "privacy-track":
      return "Privacy Governance Route";
    case "eitherway-live-dapp":
      return "Eitherway Live dApp Route";
    case "rpc-infrastructure":
      return "Runtime Infrastructure Route";
    case "consumer-apps":
      return "Wallet-First Product Route";
    case "ranger-main":
      return "Integrated Product Route";
    case "ranger-drift":
      return "Treasury Strategy Route";
    case "100xdevs":
      return "Frontend Execution Route";
    case "encrypt-ika":
      return "Encrypted Operations Route";
    case "solrouter-encrypted-ai":
      return "Deterministic Reasoning Route";
    case "dune-analytics":
      return "Telemetry Intelligence Route";
    case "umbra-confidential-payout":
      return "Confidential Payout Route";
    case "adevar-audit-credits":
      return "Hardening Review Route";
    case "superteam-poland":
      return "Regional Product Leadership Brief";
    case "poland-grants":
      return "Regional Grants Route";
    case "startup-accelerator":
      return "Startup Capital Route";
    default:
      return "Product Route";
  }
}

export function getCompetitionLaneSummary(slug: string) {
  switch (slug) {
    case "colosseum-frontier":
      return "Primary startup-quality submission corridor for product impact, trust, proof, and buyer readiness.";
    case "privacy-track":
      return "Confidential governance corridor for private voting, encrypted operations, and reviewer-visible proof.";
    case "eitherway-live-dapp":
      return "Wallet-first live app corridor for partner-facing product walkthroughs and polished operational flow.";
    case "rpc-infrastructure":
      return "Runtime and hosted-read corridor for diagnostics, API packaging, and infrastructure credibility.";
    case "consumer-apps":
      return "Consumer-grade route for clarity, onboarding, and low-friction wallet adoption.";
    case "ranger-main":
      return "Integrated-product corridor for startup-quality execution across UX, proof, and commercialization.";
    case "ranger-drift":
      return "Treasury strategy corridor for bounded capital governance, analytics, and risk posture.";
    case "100xdevs":
      return "Frontend execution corridor for shipping discipline, route quality, and product-shell polish.";
    case "encrypt-ika":
      return "Encrypted operations corridor for confidential payroll, treasury approvals, and deterministic proof.";
    case "solrouter-encrypted-ai":
      return "Deterministic reasoning corridor for policy-guided AI-adjacent workflows without overclaiming autonomy.";
    case "dune-analytics":
      return "Telemetry corridor for analytics exports, runtime evidence, and hosted-read infrastructure value.";
    case "umbra-confidential-payout":
      return "Confidential payout corridor for private treasury motions, payroll, and reviewer-visible settlement proof.";
    case "adevar-audit-credits":
      return "Hardening corridor for authority control, incident readiness, and audit-credit eligibility without overclaiming audit closure.";
    case "superteam-poland":
      return "Regional product leadership corridor for ecosystem support, execution breadth, and infrastructure credibility on Solana.";
    case "poland-grants":
      return "Regional grant corridor for funding reviewers who need infrastructure value and product traction.";
    case "startup-accelerator":
      return "Capital-readiness corridor for startup reviewers who need product proof, commercial rails, and disciplined mainnet boundaries.";
    default:
      return "Product corridor aligned with live product, proof, and trust surfaces.";
  }
}
