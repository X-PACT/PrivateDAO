import type { CompetitionTrackWorkspace } from "@/lib/site-data";

export type TrackMainnetGatePlan = {
  beforeMainnet: string[];
  devnetOnly: string[];
  releaseDiscipline: string;
};

export function getTrackMainnetGatePlan(
  workspace: CompetitionTrackWorkspace,
): TrackMainnetGatePlan {
  if (workspace.slug === "privacy-track") {
    return {
      beforeMainnet: [
        "External review of the encrypted operations corridor and the exact proposal-to-payout path.",
        "Stronger runtime evidence for wallet, signer, and payout execution across the confidential workflow.",
        "Explicit signer policy, timelock, and launch-boundary completion for real-funds governance.",
      ],
      devnetOnly: [
        "Reviewer packet and proof-first demonstrations of encrypted payroll and grant approvals.",
        "Confidence-engine interpretation used as deterministic guidance, not as a formal proof artifact.",
      ],
      releaseDiscipline:
        "Keep privacy claims bounded to the exact encrypted workflow that is evidenced, and keep all production statements tied to operating-gate completion rather than aspiration.",
    };
  }

  if (workspace.slug === "rpc-infrastructure") {
    return {
      beforeMainnet: [
        "Production-grade monitoring, alerting, and uptime posture for hosted reads and operator diagnostics.",
        "Evidence-backed service expectations that can support an SLA without overclaiming throughput.",
        "Clear customer separation between informational devnet diagnostics and production operational commitments.",
      ],
      devnetOnly: [
        "Current reviewer-facing runtime evidence packets and frontier integration demonstrations.",
        "Hosted-read API language that is still presented as pre-mainnet commercial packaging.",
      ],
      releaseDiscipline:
        "Treat diagnostics as a commercial proof surface first, then promote it to a stronger service promise only when runtime evidence and monitoring maturity justify it.",
    };
  }

  if (workspace.slug === "eitherway-live-dapp" || workspace.slug === "consumer-apps") {
    return {
      beforeMainnet: [
        "Broader wallet rehearsal on the exact first-run path users will see in production.",
        "A stable operator support path so user onboarding does not rely on reviewer-only documentation.",
        "Trust and release-gate routes that remain understandable to normal users after launch.",
      ],
      devnetOnly: [
        "Current judge-first proof routes and technical reviewer shortcuts.",
        "Wallet-first demo choreography optimized for competition presentation rather than broader user support at scale.",
      ],
      releaseDiscipline:
        "Do not let consumer polish outrun operational truth. Mainnet user growth should come only after the same onboarding path survives wider wallet and runtime checks.",
    };
  }

  if (workspace.slug === "colosseum-frontier" || workspace.slug === "ranger-main") {
    return {
      beforeMainnet: [
        "Close the launch gate pack and keep external review and runtime capture expectations explicit.",
        "Preserve signer hygiene, timelock posture, and release discipline across the full product shell.",
        "Prove the startup-quality path works end to end with the same routes customers and judges see.",
      ],
      devnetOnly: [
        "Current award, reviewer packet, and demo-first choreography that compresses the product story for judges.",
        "Some trust surfaces that still package readiness as evidence rather than as completed external sign-off.",
      ],
      releaseDiscipline:
        "Mainnet must feel like a disciplined extension of the same product shell, not a separate rushed deployment narrative.",
    };
  }

  if (workspace.slug === "ranger-drift") {
    return {
      beforeMainnet: [
        "Tighter policy, threshold, and timelock review for any treasury or capital-allocation workflow.",
        "Explicit admin and signer posture that responds directly to Drift-style operational lessons.",
        "Clear evidence that analytics and confidence scoring remain bounded to governance decisions, not open-ended automation.",
      ],
      devnetOnly: [
        "Current analytics-first treasury demos and confidence-engine walkthroughs.",
        "Submission-specific storytelling around Drift-like operating lessons.",
      ],
      releaseDiscipline:
        "Never let this corridor imply autonomous capital deployment. Keep it grounded in bounded governance and treasury policy review.",
    };
  }

  if (workspace.slug === "100xdevs") {
    return {
      beforeMainnet: [
        "Production-stable deployment, wallet, and route integrity across the entire multi-page shell.",
        "Operational runbooks that match the buyer-facing product story and hosted surfaces.",
        "Mainnet trust and customer conversion paths that stay consistent with the root-domain experience.",
      ],
      devnetOnly: [
        "Current reviewer-heavy route shortcuts and competition-specific workspace framing.",
        "Some implementation proof that exists primarily to show engineering discipline to judges.",
      ],
      releaseDiscipline:
        "Use the engineering quality story to justify the mainnet path, but keep the trust boundary and operational evidence explicit at every stage.",
    };
  }

  if (workspace.slug === "encrypt-ika") {
    return {
      beforeMainnet: [
        "External review confidence around the encrypted operations path and its exact trust boundaries.",
        "Operational evidence for confidential workflows under real customer conditions.",
        "A production-safe release policy that keeps encrypted operations bounded and auditable.",
      ],
      devnetOnly: [
        "Current encrypted workflow demonstrations and integrations packets used as judge-facing proof surfaces.",
        "Interpretive confidence scoring that helps explain the privacy thesis without standing in for external sign-off.",
      ],
      releaseDiscipline:
        "Anchor the encrypted product story in one or two exact workflows and only promote what has matching operational evidence.",
    };
  }

  if (workspace.slug === "solrouter-encrypted-ai") {
    return {
      beforeMainnet: [
        "Deterministic assistant behavior must stay bounded to route guidance and policy interpretation.",
        "Proof-linked assistant outputs need clear operational trust boundaries before any broader production claim.",
        "Mainnet helper flows must remain governance-assistant surfaces, not speculative autonomous agents.",
      ],
      devnetOnly: [
        "Current AI-style navigation, search, and confidence-engine interpretation paths.",
        "Track-specific assistant choreography designed for judges and technical reviewers.",
      ],
      releaseDiscipline:
        "Keep this assistant product deterministic, route-bound, and evidence-backed so it strengthens trust rather than inflating claims.",
    };
  }

  return {
    beforeMainnet: [
      "Close all visible gate routes that still distinguish reviewer proof from production readiness.",
      "Keep signer, timelock, and runtime evidence disciplined across the exact product path used in demos.",
      "Promote only what the current trust package and gate surfaces can support.",
    ],
    devnetOnly: [
      "Reviewer-first packets, demo choreography, and competition-specific framing.",
      "Evidence surfaces that are designed to prove readiness without implying completed external completion.",
    ],
    releaseDiscipline:
      "Mainnet promotion should follow the same product shell and trust routes already visible in the live app.",
  };
}
