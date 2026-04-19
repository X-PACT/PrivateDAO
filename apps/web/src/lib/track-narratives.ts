import type { CompetitionTrackWorkspace } from "@/lib/site-data";

export type TrackNarrativePlan = {
  whyUs: string;
  futureProblemSolution: string;
  whySponsorShouldCareNow: string;
};

export function getTrackNarrativePlan(
  workspace: CompetitionTrackWorkspace,
): TrackNarrativePlan {
  if (workspace.slug === "colosseum-frontier") {
    return {
      whyUs:
        "We are not presenting a one-week prototype. We are presenting a live governance company already operating on Testnet with product shell, proof, diagnostics, services, and trust continuity under one root domain.",
      futureProblemSolution:
        "The future problem is not launching more DAOs. It is operating them safely, privately, and credibly. PrivateDAO solves that by turning governance, treasury execution, proof, and operator workflows into one coherent infrastructure product.",
      whySponsorShouldCareNow:
        "This is exactly the type of startup-quality outcome a strong ecosystem review cycle should accelerate: a real product with a Program ID, token surface, wallet UX, commercial packaging, and a credible path to mainnet and customers.",
    };
  }

  if (workspace.slug === "privacy-track") {
    return {
      whyUs:
        "We already combine ZK, REFHE, MagicBlock, Fast RPC, and proof-backed governance in one live product. That combination is rare, and the integration work behind it usually takes far longer than a short build cycle.",
      futureProblemSolution:
        "The future problem is that sensitive treasury and governance actions still force teams to choose between privacy and trust. PrivateDAO solves that by making confidential workflows reviewable, bounded, and operator-ready.",
      whySponsorShouldCareNow:
        "This is a real privacy product use, not a decorative cryptography claim. MagicBlock, ZK, and REFHE each change the workflow in a visible way and together create a category-defining governance surface.",
    };
  }

  if (workspace.slug === "eitherway-live-dapp") {
    return {
      whyUs:
        "We already ship the wallet-first product shell this track wants, and we use it to move a real user from onboarding to proposal and treasury action instead of stopping at a connect button.",
      futureProblemSolution:
        "The future problem is that crypto apps still feel like tools for experts. PrivateDAO solves that by turning complex governance and proof flows into guided product routes with clear next actions.",
      whySponsorShouldCareNow:
        "Solflare, QuickNode, and the live dApp corridor are not superficial sponsor badges here. They are part of a route that already looks commercial and is close to customer adoption on Testnet.",
    };
  }

  if (workspace.slug === "rpc-infrastructure") {
    return {
      whyUs:
        "We do not hide infrastructure in the backend. We surface hosted reads, diagnostics, runtime evidence, and buyer-facing packaging as product features, which is exactly what serious infrastructure customers and judges want to see.",
      futureProblemSolution:
        "The future problem is that governance products fail when read paths, diagnostics, and operational visibility are weak. PrivateDAO solves that by making infra value directly visible to operators, reviewers, and buyers.",
      whySponsorShouldCareNow:
        "QuickNode or any RPC sponsor should care because this is an infrastructure-backed governance product that turns low-level performance into clear buyer value and long-term commercial demand.",
    };
  }

  if (workspace.slug === "consumer-apps") {
    return {
      whyUs:
        "We already turned a complex governance stack into a guided experience with onboarding, wallet flow, search, assistant routing, and clear trust surfaces. That is much harder than simply shipping a beautiful landing page.",
      futureProblemSolution:
        "The future problem is that governance remains inaccessible to normal users. PrivateDAO solves that by making participation, proof, and treasury actions understandable without hiding the underlying rigor.",
      whySponsorShouldCareNow:
        "Consumer judges and partners should care because this is one of the few governance products that can be both technically serious and easy for a normal user to navigate.",
    };
  }

  if (workspace.slug === "ranger-main") {
    return {
      whyUs:
        "We look like a company because we built the full stack: product shell, proof continuity, trust surfaces, services, learning/proof routes, and customer conversion paths. That level of completion is what investors and main-track judges reward.",
      futureProblemSolution:
        "The future problem is not lack of governance primitives. It is lack of integrated governance businesses. PrivateDAO solves that by packaging protocol, operations, trust, and commercial delivery into one investable product.",
      whySponsorShouldCareNow:
        "Ranger should care because this reads like infrastructure with startup velocity: a real product now, a commercial surface now, and a believable path to retained governance revenue later.",
    };
  }

  if (workspace.slug === "ranger-drift") {
    return {
      whyUs:
        "We are not improvising a treasury angle to fit the track. We already have policy, analytics, confidence scoring, and trust-bound execution corridors that can be applied to capital governance in a disciplined way.",
      futureProblemSolution:
        "The future problem is that treasury decisions become dangerous when policy, execution, and review are disconnected. PrivateDAO solves that by making capital governance bounded, inspectable, and backed by evidence.",
      whySponsorShouldCareNow:
        "This matters now because post-Drift teams need governance-grade treasury discipline, not another speculative trading interface. That makes this corridor commercially credible beyond the track itself.",
    };
  }

  if (workspace.slug === "100xdevs") {
    return {
      whyUs:
        "We already completed the hard work that many teams postpone: a multi-page Next.js product shell, static export discipline, track-aware routing, wallet-first UX, and deployment continuity on a real domain.",
      futureProblemSolution:
        "The future problem is that strong protocols still fail to become great products. PrivateDAO solves that by turning serious blockchain and privacy infrastructure into a product people can actually navigate and adopt.",
      whySponsorShouldCareNow:
        "100xDevs should care because this is proof of shipping discipline at speed: years of product and infra integration compressed into a coherent live surface with commercial relevance.",
    };
  }

  if (workspace.slug === "encrypt-ika") {
    return {
      whyUs:
        "We already built the rare part: encrypted operations that stay tied to user workflows, proof routes, and honest trust boundaries. That is much more valuable than abstract cryptographic sophistication alone.",
      futureProblemSolution:
        "The future problem is that private operations remain too opaque or too brittle for real teams. PrivateDAO solves that by making encrypted governance and payout workflows inspectable, bounded, and ready for commercial packaging.",
      whySponsorShouldCareNow:
        "Encrypt and IKA should care because this is not theory. It is a live governance product where advanced cryptographic rails already shape how the product behaves for real users and buyers.",
    };
  }

  if (workspace.slug === "solrouter-encrypted-ai") {
    return {
      whyUs:
        "We chose the harder path: deterministic assistant behavior, bounded reasoning, and route-aware guidance instead of inflated autonomous-AI claims. That creates trust instead of hype.",
      futureProblemSolution:
        "The future problem is that governance systems need AI-like guidance without surrendering trust and control. PrivateDAO solves that by combining deterministic assistant routing with cryptographic and policy evidence.",
      whySponsorShouldCareNow:
        "SolRouter should care because this is an early but credible foundation for an encrypted-governance assistant that remains honest about what is live today and what still belongs to the future roadmap.",
    };
  }

  return {
    whyUs:
      "We already operate as a live governance product with proof, trust, wallet, and commercial surfaces connected under one system.",
    futureProblemSolution:
      "The future problem is disconnected governance infrastructure. PrivateDAO solves that by connecting product, security, proof, and operations into one company-grade platform.",
    whySponsorShouldCareNow:
      "This sponsor should care because the product already turns serious technical rails into visible, investable, and commercially meaningful user value.",
  };
}
