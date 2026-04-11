export function getCompetitionLaneLabel(slug: string) {
  switch (slug) {
    case "colosseum-frontier":
      return "Frontier Primary Workspace";
    case "privacy-track":
      return "Confidential Governance Workspace";
    case "eitherway-live-dapp":
      return "Live App Corridor Workspace";
    case "rpc-infrastructure":
      return "Runtime Infrastructure Workspace";
    case "consumer-apps":
      return "Wallet-First Product Workspace";
    case "ranger-main":
      return "Integrated Product Workspace";
    case "ranger-drift":
      return "Treasury Strategy Workspace";
    case "100xdevs":
      return "Frontend Execution Workspace";
    case "encrypt-ika":
      return "Encrypted Operations Workspace";
    case "solrouter-encrypted-ai":
      return "Deterministic Reasoning Workspace";
    default:
      return "Competition Workspace";
  }
}

export function getCompetitionLaneSummary(slug: string) {
  switch (slug) {
    case "colosseum-frontier":
      return "Primary startup-quality submission corridor for product impact, trust, proof, and buyer readiness.";
    case "privacy-track":
      return "Confidential governance corridor for private voting, encrypted operations, and reviewer-safe proof.";
    case "eitherway-live-dapp":
      return "Wallet-first live app corridor for partner-facing demos and polished operational flow.";
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
    default:
      return "Competition corridor aligned with live product, proof, and trust surfaces.";
  }
}
