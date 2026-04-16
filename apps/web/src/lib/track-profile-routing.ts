import type { CompetitionTrackWorkspace } from "@/lib/site-data";

export type CommercialProfile =
  | "pilot-funding"
  | "agentic-micropayment-rail"
  | "treasury-top-up"
  | "vendor-payout"
  | "contributor-payout";

export type WorkspacePanelKey =
  | "submissionPath"
  | "submissionCoach"
  | "trackAlignment"
  | "trackNarrative"
  | "trackInvestmentCase"
  | "devnetServiceMetrics"
  | "trackTechnicalFit"
  | "trackCommercialization"
  | "trackMainnetGates"
  | "trackCustodyImpact"
  | "authorityHardening"
  | "incidentReadiness";

export function resolveCommercialProfile(
  profile?: string | null,
  intake?: string | null,
): CommercialProfile | undefined {
  if (profile === "pilot-funding") return "pilot-funding";
  if (profile === "agentic-micropayment-rail") return "agentic-micropayment-rail";
  if (profile === "treasury-top-up") return "treasury-top-up";
  if (profile === "vendor-payout") return "vendor-payout";
  if (profile === "contributor-payout") return "contributor-payout";
  if (intake === "pilot") return "pilot-funding";
  if (intake === "payments") return "vendor-payout";
  return undefined;
}

export function getCommercialContinuityBundle(
  workspace: CompetitionTrackWorkspace,
  commercialProfile?: string | null,
  intake?: string | null,
) {
  const resolvedProfile = resolveCommercialProfile(commercialProfile, intake);

  if (!resolvedProfile && !intake) {
    return null;
  }

  if (resolvedProfile === "pilot-funding") {
    return {
      title: "Pilot continuity bundle",
      summary:
        "Keep the buyer path tied to the live startup route: demo first, then proof, then trust. This track is now carrying the same commercial context that began in Engage.",
      routes: [
        { label: "Live demo", href: workspace.liveRoute },
        { label: "Proof", href: workspace.proofRoute },
        { label: "Trust", href: "/security" },
        { label: "Story", href: workspace.videoRoute },
      ],
    };
  }

  if (resolvedProfile === "agentic-micropayment-rail") {
    return {
      title: "Agentic micropayment continuity",
      summary:
        "Keep the batched payout path tied to govern, proof, and telemetry so agentic execution reads as policy-bound DAO automation rather than an isolated payments demo.",
      routes: [
        { label: "Services", href: "/services#treasury-payment-request" },
        { label: "Govern", href: "/govern" },
        { label: "Judge", href: "/judge" },
        { label: "Telemetry", href: "/analytics" },
      ],
    };
  }

  if (resolvedProfile === "treasury-top-up") {
    return {
      title: "Treasury capitalization continuity",
      summary:
        "Frame this as operating runway for a real product, not a donation. Services, Engage, and Trust stay connected so the sender sees where capital improves reliability and buyer readiness.",
      routes: [
        { label: "Services", href: "/services" },
        { label: "Engage", href: "/engage?profile=treasury-top-up" },
        { label: "Trust", href: "/security" },
        { label: "Proof", href: workspace.proofRoute },
      ],
    };
  }

  if (resolvedProfile === "vendor-payout" || resolvedProfile === "contributor-payout") {
    return {
      title: "Governed payout continuity",
      summary:
        "This commercial path stays operational: governed execution, diagnostics, and proof are kept in one visible bundle so payouts read as treasury policy instead of ad-hoc transfers.",
      routes: [
        { label: "Govern", href: "/govern" },
        { label: "Diagnostics", href: "/diagnostics" },
        { label: "Trust", href: "/security" },
        { label: "Proof", href: workspace.proofRoute },
      ],
    };
  }

  return null;
}

export function getWorkspacePanelOrder(
  commercialProfile?: string | null,
  intake?: string | null,
): WorkspacePanelKey[] {
  const resolvedProfile = resolveCommercialProfile(commercialProfile, intake);

  if (resolvedProfile === "pilot-funding") {
    return [
      "submissionPath",
      "submissionCoach",
      "trackAlignment",
      "trackCustodyImpact",
      "devnetServiceMetrics",
      "trackTechnicalFit",
      "trackNarrative",
      "trackInvestmentCase",
      "trackCommercialization",
      "trackMainnetGates",
      "authorityHardening",
      "incidentReadiness",
    ];
  }

  if (resolvedProfile === "agentic-micropayment-rail") {
    return [
      "submissionPath",
      "devnetServiceMetrics",
      "trackTechnicalFit",
      "trackCustodyImpact",
      "trackCommercialization",
      "trackInvestmentCase",
      "trackMainnetGates",
      "authorityHardening",
      "incidentReadiness",
      "submissionCoach",
      "trackAlignment",
      "trackNarrative",
    ];
  }

  if (resolvedProfile === "treasury-top-up") {
    return [
      "trackCommercialization",
      "trackInvestmentCase",
      "trackMainnetGates",
      "devnetServiceMetrics",
      "trackAlignment",
      "trackCustodyImpact",
      "submissionPath",
      "submissionCoach",
      "trackTechnicalFit",
      "trackNarrative",
      "authorityHardening",
      "incidentReadiness",
    ];
  }

  if (resolvedProfile === "vendor-payout" || resolvedProfile === "contributor-payout") {
    return [
      "submissionPath",
      "devnetServiceMetrics",
      "trackCustodyImpact",
      "authorityHardening",
      "incidentReadiness",
      "trackAlignment",
      "trackTechnicalFit",
      "trackCommercialization",
      "trackInvestmentCase",
      "trackMainnetGates",
      "submissionCoach",
      "trackNarrative",
    ];
  }

  return [
    "submissionCoach",
    "trackAlignment",
    "trackNarrative",
    "trackInvestmentCase",
    "devnetServiceMetrics",
    "trackTechnicalFit",
    "trackCommercialization",
    "trackMainnetGates",
    "trackCustodyImpact",
    "authorityHardening",
    "incidentReadiness",
    "submissionPath",
  ];
}
