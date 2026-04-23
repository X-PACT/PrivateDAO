import Link from "next/link";
import { CheckCircle2, FileSearch, ReceiptText, Signature, Wallet } from "lucide-react";

import { cn } from "@/lib/utils";

type GuidedOperationRailProps = {
  current: "connect" | "review" | "sign" | "verify";
  reviewHref?: string;
  verifyHref?: string;
  compact?: boolean;
  pendingNote?: string;
};

const steps = [
  {
    key: "connect",
    label: "Connect",
    summary: "Choose wallet, confirm account, and stay on Solana Testnet.",
    icon: Wallet,
  },
  {
    key: "review",
    label: "Review",
    summary: "Read the action, policy, risk, privacy mode, and execution lane first.",
    icon: FileSearch,
  },
  {
    key: "sign",
    label: "Sign",
    summary: "Approve the exact wallet request only after the operation is clear.",
    icon: Signature,
  },
  {
    key: "verify",
    label: "Verify",
    summary: "Open the receipt, explorer hash, and proof continuity from the same flow.",
    icon: ReceiptText,
  },
] as const;

export function GuidedOperationRail({
  current,
  reviewHref = "/intelligence",
  verifyHref = "/proof",
  compact = false,
  pendingNote,
}: GuidedOperationRailProps) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(9,15,28,0.96),rgba(6,9,18,0.98))] p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-full border border-cyan-300/18 bg-cyan-300/[0.1] px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-cyan-100/84">
          Wallet-orchestrated UX
        </span>
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-white/56">
          Review first · Sign second · Verify third
        </span>
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const active = step.key === current;
          const completed = index < steps.findIndex((entry) => entry.key === current);
          return (
            <div
              key={step.key}
              className={cn(
                "rounded-[22px] border px-4 py-4 transition",
                active
                  ? "border-cyan-300/24 bg-cyan-300/[0.1]"
                  : completed
                    ? "border-emerald-300/20 bg-emerald-300/[0.08]"
                    : "border-white/8 bg-white/[0.03]",
              )}
            >
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-xl border",
                    active
                      ? "border-cyan-300/24 bg-cyan-300/[0.14] text-cyan-100"
                      : completed
                        ? "border-emerald-300/24 bg-emerald-300/[0.14] text-emerald-100"
                        : "border-white/10 bg-black/20 text-white/68",
                  )}
                >
                  {completed ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                <div className="text-sm font-medium text-white">{step.label}</div>
              </div>
              {!compact ? <div className="mt-3 text-sm leading-6 text-white/62">{step.summary}</div> : null}
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm leading-7 text-white/66">
        <Link href={reviewHref} className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 transition hover:border-cyan-300/24 hover:text-white">
          Review route
        </Link>
        <Link href={verifyHref} className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 transition hover:border-cyan-300/24 hover:text-white">
          Verify route
        </Link>
        {pendingNote ? (
          <div className="rounded-xl border border-amber-300/16 bg-amber-300/[0.08] px-3 py-2 text-white/72">
            {pendingNote}
          </div>
        ) : null}
      </div>
    </section>
  );
}
