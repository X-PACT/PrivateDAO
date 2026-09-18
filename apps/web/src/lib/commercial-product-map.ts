import type { LucideIcon } from "lucide-react";
import { Bot, Gavel, GitBranch, ShieldCheck, WalletCards } from "lucide-react";

import type { RuntimeProductId } from "@/lib/runtime-catalog";

export type CommercialProduct = {
  title: string;
  summary: string;
  audience: string;
  href: string;
  cta: string;
  runtimeProductId?: RuntimeProductId;
};

export type CommercialProductGroup = {
  title: string;
  summary: string;
  icon: LucideIcon;
  products: readonly CommercialProduct[];
};

/**
 * The buyer-facing catalog mirrors the kernel product IDs. Product pages can
 * describe value in normal language while runtime bindings remain explicit.
 */
export const commercialProductGroups: readonly CommercialProductGroup[] = [
  {
    title: "Private Operations",
    summary: "Run the sensitive work that keeps an organization moving.",
    icon: WalletCards,
    products: [
      {
        title: "Confidential Payroll",
        summary: "Prepare payroll, apply policies, approve the batch, and share a verified outcome without exposing employee details.",
        audience: "Companies, finance teams, contributor networks, and institutions.",
        href: "/payroll",
        cta: "Open payroll",
        runtimeProductId: "payroll",
      },
      {
        title: "Treasury Coordination",
        summary: "Move spending requests through budgets, approvals, execution, and a clear record of what happened.",
        audience: "Finance teams, DAOs, operations teams, and treasury committees.",
        href: "/treasury",
        cta: "Open treasury",
        runtimeProductId: "treasury",
      },
      {
        title: "Private Governance",
        summary: "Create a decision room, keep sensitive intent private, and preserve an accountable result.",
        audience: "Boards, governments, DAOs, foundations, and communities.",
        href: "/govern",
        cta: "Start governance",
        runtimeProductId: "governance",
      },
    ],
  },
  {
    title: "Private Transactions",
    summary: "Coordinate commercial intent without exposing it too early.",
    icon: Gavel,
    products: [
      {
        title: "Confidential Auctions",
        summary: "Collect sealed offers, close the decision fairly, and share an outcome participants can check.",
        audience: "Procurement teams, marketplaces, DAOs, and agent operators.",
        href: "/auctions",
        cta: "Run an auction",
        runtimeProductId: "auction",
      },
      {
        title: "Private Settlement Workflows",
        summary: "Move an approved transaction through the appropriate execution provider only when the workflow requires it.",
        audience: "Operations teams, financial markets, and organizations with controlled payouts.",
        href: "/payments",
        cta: "Review settlement",
      },
    ],
  },
  {
    title: "Verification",
    summary: "Give others confidence without handing over sensitive source data.",
    icon: ShieldCheck,
    products: [
      {
        title: "Blind Verification",
        summary: "Prove that a private condition was satisfied without revealing the information behind it.",
        audience: "Compliance, lending, HR, finance, and review teams.",
        href: "/proof-workflows/blind-policy",
        cta: "Try blind verification",
        runtimeProductId: "blind-verification",
      },
      {
        title: "Record Verification",
        summary: "Create a shareable receipt for a critical record without publishing private fields.",
        audience: "Auditors, data platforms, finance teams, and API products.",
        href: "/products/record-verification",
        cta: "Verify a record",
        runtimeProductId: "record-verification",
      },
    ],
  },
  {
    title: "Ecosystem Products",
    summary: "Extend the same privacy and evidence model to software and consumer audiences.",
    icon: Bot,
    products: [
      {
        title: "Agent Marketplace",
        summary: "Discover capabilities, request bounded work, and receive a result with a clear receipt.",
        audience: "AI agents, bots, data providers, and automation teams.",
        href: "https://agents.privatedao.org/",
        cta: "Open Agent Marketplace",
        runtimeProductId: "agent",
      },
      {
        title: "PDAO Worlds",
        summary: "Explore privacy, trust, evidence, and coordination through an independent game product.",
        audience: "Players, communities, and consumer acquisition channels.",
        href: "https://game.privatedao.org/game/godot/index.html",
        cta: "Play PDAO Worlds",
      },
    ],
  },
  {
    title: "Developers",
    summary: "Connect the same commercial workflows to your systems through documented interfaces.",
    icon: GitBranch,
    products: [
      {
        title: "API and SDK",
        summary: "Integrate verification, receipts, governance, and coordination workflows without exposing internal implementation details to your users.",
        audience: "Product, engineering, and operations teams.",
        href: "/developers",
        cta: "Explore integrations",
      },
    ],
  },
];

export const primaryCommercialProducts = commercialProductGroups.slice(0, 3);
export const ecosystemCommercialProducts = commercialProductGroups.slice(3, 4);
export const developerCommercialProducts = commercialProductGroups.slice(4);

export const commercialProductByRuntimeId = new Map(
  commercialProductGroups
    .flatMap((group) => group.products)
    .filter((product): product is CommercialProduct & { runtimeProductId: RuntimeProductId } => Boolean(product.runtimeProductId))
    .map((product) => [product.runtimeProductId, product]),
);
