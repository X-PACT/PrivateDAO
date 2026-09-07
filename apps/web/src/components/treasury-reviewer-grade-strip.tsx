import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BanknoteArrowDown,
  CheckSquare,
  Landmark,
  ShieldCheck,
  WalletCards,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCanonicalCustodyProofSnapshot } from "@/lib/canonical-custody-proof";
import { getEcosystemFocusAlignment } from "@/lib/ecosystem-focus-alignment";
import { getTreasuryReceiveConfig } from "@/lib/treasury-receive-config";
import { cn } from "@/lib/utils";

type TreasuryReviewerGradeStripProps = {
  context?: "services" | "custody" | "documents";
  title?: string;
  description?: string;
};

const reviewerTruthLinks = [
  {
    label: "Treasury proof packet",
    href: "/documents/treasury-reviewer-packet",
  },
  {
    label: "Canonical custody proof",
    href: "/documents/canonical-custody-proof",
  },
  {
    label: "Custody proof packet",
    href: "/documents/custody-proof-reviewer-packet",
  },
  {
    label: "Launch trust packet",
    href: "/documents/launch-trust-packet",
  },
  {
    label: "Telemetry packet",
    href: "/documents/reviewer-telemetry-packet",
  },
  {
    label: "Mainnet readiness gates",
    href: "/documents/mainnet-blockers",
  },
  {
    label: "Ecosystem focus alignment",
    href: "/documents/ecosystem-focus-alignment",
  },
] as const;

const strictSenderChecklist = [
  "Confirm whether the request is a treasury top-up, pilot-funding packet, vendor payout, or contributor payout before selecting a rail.",
  "Copy the exact public receive address and explorer link for the selected asset rail. Do not reuse a rail from memory.",
  "Attach a reference string that includes payer, purpose, amount, and settlement context so the intake packet can be matched later.",
  "Open the proof and trust surfaces before describing the current treasury rail, the operating posture, and the next production milestone to a sender, buyer, or judge.",
  "Treat the current rails as live Testnet treasury intake with a clear path toward stronger custody evidence and production-safe release readiness.",
] as const;

function buildStripCopy(context: TreasuryReviewerGradeStripProps["context"]) {
  if (context === "custody") {
    return {
      title: "Treasury product-grade bundle",
      description:
        "Use the same treasury discipline inside custody: sender checklist, proof links, rail references, commercial fit, and the next readiness gate remain visible next to the ceremony workflow.",
    };
  }

  if (context === "documents") {
    return {
      title: "Treasury product-grade bundle",
      description:
        "Use this packet layer when a reviewer enters through documents and needs the treasury story collapsed into one surface instead of reconstructing it from separate proof and service routes.",
    };
  }

  return {
    title: "Treasury product-grade bundle",
    description:
      "Present treasury intake like a real infrastructure product: strict sender discipline, reference-linked rails, proof and trust links, payments fit, and the next production gate in one package.",
  };
}

function buildExplorerHref(address: string, network: string) {
  const cluster = network.toLowerCase().includes("testnet")
    ? "?cluster=testnet"
    : network.toLowerCase().includes("devnet")
      ? "?cluster=devnet"
      : "";
  return `https://solscan.io/account/${address}${cluster}`;
}

export function TreasuryReviewerGradeStrip({
  context = "services",
  title,
  description,
}: TreasuryReviewerGradeStripProps) {
  const copy = buildStripCopy(context);
  const custody = getCanonicalCustodyProofSnapshot();
  const treasury = getTreasuryReceiveConfig();
  const focusAlignment = getEcosystemFocusAlignment();
  const alignmentItems = focusAlignment.focusAreas.filter((item) =>
    ["payments", "dao-tooling", "developer-tooling"].includes(item.slug),
  );

  return (
    <Card
      id="treasury-reviewer-grade"
      className="border-emerald-300/14 bg-[linear-gradient(180deg,rgba(8,18,25,0.96),rgba(7,12,20,0.98))]"
    >
      <CardHeader className="gap-3">
        <div className="text-[11px] uppercase tracking-[0.3em] text-emerald-200/80">
          Treasury product-grade
        </div>
        <CardTitle>{title ?? copy.title}</CardTitle>
        <div className="max-w-4xl text-sm leading-7 text-white/58">
          {description ?? copy.description}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-white/42">
              <WalletCards className="h-3.5 w-3.5 text-emerald-200/78" />
              Treasury network
            </div>
            <div className="mt-3 text-2xl font-semibold tracking-tight text-white">
              {treasury.network}
            </div>
          </div>
          <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-white/42">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-200/78" />
              Next readiness gate
            </div>
            <div className="mt-3 text-base font-semibold tracking-tight text-white">
              {custody.blocker.id}
            </div>
            <div className="mt-1 text-xs uppercase tracking-[0.22em] text-white/42">
              next operating milestone
            </div>
          </div>
          <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-white/42">
              <Landmark className="h-3.5 w-3.5 text-emerald-200/78" />
              Payments fit
            </div>
            <div className="mt-3 text-base font-semibold tracking-tight text-white">
              {alignmentItems.find((item) => item.slug === "payments")?.fit ?? "strong"}
            </div>
            <div className="mt-1 text-sm leading-6 text-white/56">
              Treasury intake and payout framing are already live and ready to be strengthened with the next execution evidence.
            </div>
          </div>
          <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-white/42">
              <BanknoteArrowDown className="h-3.5 w-3.5 text-emerald-200/78" />
              Next readiness lift
            </div>
            <div className="mt-3 text-base font-semibold tracking-tight text-white">
              {custody.pendingItems.length} items
            </div>
            <div className="mt-1 text-sm leading-6 text-white/56">
              Move from live treasury intake into stronger custody evidence and production-grade operating confidence.
            </div>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[26px] border border-white/8 bg-white/[0.03] p-5">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-emerald-200/76">
              <CheckSquare className="h-4 w-4" />
              Strict sender checklist
            </div>
            <div className="mt-4 grid gap-3 text-sm leading-7 text-white/60">
              {strictSenderChecklist.map((item, index) => (
                <div key={item} className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                  <span className="mr-3 inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[11px] font-medium text-emerald-100">
                    {index + 1}
                  </span>
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/custody#strict-intake-packet"
                className={cn(buttonVariants({ variant: "secondary" }), "justify-between")}
              >
                Open strict intake shape
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/services#treasury-reviewer-grade"
                className={cn(buttonVariants({ variant: "outline" }), "justify-between")}
              >
                Open services rail view
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="rounded-[26px] border border-white/8 bg-white/[0.03] p-5">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-white/50">
              <ShieldCheck className="h-4 w-4 text-emerald-200/76" />
              Proof and trust links
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {reviewerTruthLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(buttonVariants({ variant: "outline" }), "justify-between")}
                >
                  {item.label}
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[26px] border border-white/8 bg-white/[0.03] p-5">
            <div className="text-[11px] uppercase tracking-[0.24em] text-cyan-200/76">
              Reference-linked rails
            </div>
            <div className="mt-4 grid gap-3 lg:grid-cols-3">
              {treasury.assets.map((asset) => (
                <div key={asset.symbol} className="rounded-2xl border border-white/8 bg-black/20 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-base font-medium text-white">{asset.symbol}</div>
                      <div className="text-xs uppercase tracking-[0.22em] text-white/42">
                        {asset.name}
                      </div>
                    </div>
                    <a
                      href={buildExplorerHref(asset.receiveAddress, treasury.network)}
                      target="_blank"
                      rel="noreferrer"
                      className={cn(buttonVariants({ size: "sm", variant: "outline" }), "px-3")}
                    >
                      Explorer
                    </a>
                  </div>
                  <div className="mt-3 break-all rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2 font-mono text-xs leading-6 text-white/70">
                    {asset.receiveAddress}
                  </div>
                  <div className="mt-3 text-sm leading-6 text-white/56">{asset.note}</div>
                  <div className="mt-3 text-xs leading-6 text-white/42">
                    Mint: {asset.mint ?? "Configured at deployment / public receive rail only"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[26px] border border-white/8 bg-white/[0.03] p-5">
            <div className="text-[11px] uppercase tracking-[0.24em] text-violet-200/76">
              Commercial + payments focus alignment
            </div>
              <div className="mt-4 grid gap-3">
                {alignmentItems.map((item) => (
                  <div key={item.slug} className="rounded-2xl border border-white/8 bg-black/20 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-medium text-white">{item.title}</div>
                      <div className="text-[11px] uppercase tracking-[0.22em] text-white/42">
                        {item.fit}
                      </div>
                    </div>
                    <div className="mt-2 text-sm leading-6 text-white/56">{item.whatWorksNow}</div>
                    <div className="mt-2 text-xs leading-6 text-amber-100/72">
                      Next lift: {item.exactGap}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[26px] border border-amber-300/18 bg-amber-300/[0.06] p-5">
            <div className="text-[11px] uppercase tracking-[0.24em] text-amber-100/80">
              Next production gate
            </div>
              <div className="mt-3 text-base font-medium text-white">{custody.blocker.id}</div>
              <div className="mt-2 text-sm leading-7 text-white/60">
                {custody.blocker.nextAction}
              </div>
              <div className="mt-3 grid gap-2 text-xs leading-6 text-white/46">
                <div>Severity: {custody.blocker.severity}</div>
                <div>Current operating state: {custody.blocker.status}</div>
                <div>Next evidence set: {custody.pendingItems.slice(0, 4).join(" · ")}</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
