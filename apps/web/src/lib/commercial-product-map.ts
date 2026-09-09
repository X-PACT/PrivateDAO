import type { LucideIcon } from "lucide-react";
import { Banknote, Bot, FileCheck2, Gavel, Gamepad2, GitBranch, ShieldCheck, WalletCards } from "lucide-react";

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

export const commercialProductGroups: readonly CommercialProductGroup[] = [
  {
    title: "Confidential Payroll",
    summary: "Run payroll privately, apply approval rules, and share proof without exposing employee details.",
    icon: Banknote,
    products: [
      {
        title: "Private payroll workspace",
        summary: "Prepare payroll, review the totals, approve the payout, and keep a clear completion record.",
        audience: "Companies, finance teams, operators, and contributor networks.",
        href: "/payroll",
        cta: "Open payroll",
        runtimeProductId: "payroll",
      },
    ],
  },
  {
    title: "Private Treasury",
    summary: "Control spending with clear requests, approvals, and payment records.",
    icon: WalletCards,
    products: [
      {
        title: "Treasury coordination",
        summary: "Move a payment request from review to approved action with the context your team needs.",
        audience: "Finance teams, DAOs, operations teams, and treasury committees.",
        href: "/treasury",
        cta: "Open treasury",
        runtimeProductId: "treasury",
      },
    ],
  },
  {
    title: "Private Governance",
    summary: "Make sensitive decisions privately and keep the outcome accountable.",
    icon: ShieldCheck,
    products: [
      {
        title: "Governance rooms",
        summary: "Create a room, review a proposal, vote privately, and preserve the decision trail.",
        audience: "DAOs, boards, committees, foundations, and communities.",
        href: "/govern",
        cta: "Start governance",
        runtimeProductId: "governance",
      },
    ],
  },
  {
    title: "Private Auctions",
    summary: "Collect sealed offers, choose fairly, and share a result everyone can check.",
    icon: Gavel,
    products: [
      {
        title: "Sealed-bid auctions",
        summary: "Keep offers hidden until the decision point, then publish a clear and verifiable result.",
        audience: "Procurement teams, marketplaces, DAOs, and agent operators.",
        href: "/auctions",
        cta: "Run an auction",
        runtimeProductId: "auction",
      },
    ],
  },
  {
    title: "Verification Infrastructure",
    summary: "Turn sensitive records and business processes into evidence others can check.",
    icon: FileCheck2,
    products: [
      {
        title: "Blind Verification",
        summary: "Prove that a private condition was met without revealing the information behind it.",
        audience: "Compliance, lending, HR, finance, and review teams.",
        href: "/proof-workflows/blind-policy",
        cta: "Try blind verification",
        runtimeProductId: "blind-verification",
      },
      {
        title: "Record Verification",
        summary: "Give an important record a durable proof link that is easy to share and check.",
        audience: "Auditors, data platforms, finance teams, and API products.",
        href: "/products/record-verification",
        cta: "Verify a record",
        runtimeProductId: "record-verification",
      },
    ],
  },
  {
    title: "Developers",
    summary: "Connect the same products to your systems through APIs and SDKs.",
    icon: GitBranch,
    products: [
      {
        title: "API and SDK",
        summary: "Connect your systems to verification, receipts, governance, and coordination workflows.",
        audience: "Product, engineering, and operations teams.",
        href: "/developers",
        cta: "Explore integrations",
      },
    ],
  },
  {
    title: "Agent Marketplace",
    summary: "Let software discover services, request work, pay, and verify results through one machine-ready marketplace.",
    icon: Bot,
    products: [
      {
        title: "Agent Exchange",
        summary: "Discover capabilities, hire providers, receive results, and verify receipts without a dashboard-first workflow.",
        audience: "AI agents, Solana bots, data providers, and automation teams.",
        href: "https://agents.privatedao.org/",
        cta: "Open Agent Exchange",
        runtimeProductId: "agent",
      },
    ],
  },
  {
    title: "PDAO Worlds",
    summary: "A playable world where trust, privacy, verification, and coordination become memorable experiences.",
    icon: Gamepad2,
    products: [
      {
        title: "PDAO Worlds",
        summary: "Explore missions and stories inspired by the problems PrivateDAO helps organizations solve.",
        audience: "Players, communities, and future consumer acquisition channels.",
        href: "https://game.privatedao.org/game/godot/index.html",
        cta: "Play PDAO Worlds",
      },
    ],
  },
];

export const primaryCommercialProducts = commercialProductGroups.slice(0, 4);
