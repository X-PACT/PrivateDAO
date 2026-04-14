"use client";

import Link from "next/link";
import { ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getGovernanceRuntimeStatus } from "@/lib/governance-runtime-status";
import { getCoreInstructionParity, type PreparedActionSummary } from "@/lib/onchain-parity";
import type { CoreGovernanceInstructionName } from "@/lib/onchain-parity.generated";
import { cn } from "@/lib/utils";

type OnchainParityPanelProps = {
  action: CoreGovernanceInstructionName;
  title?: string;
  compact?: boolean;
  preparedSummary?: PreparedActionSummary;
};

export function OnchainParityPanel({
  action,
  title = "On-chain parity",
  compact = false,
  preparedSummary,
}: OnchainParityPanelProps) {
  const parity = getCoreInstructionParity(action);
  const runtimeStatus = getGovernanceRuntimeStatus(action);

  return (
    <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(9,14,28,0.96),rgba(5,9,20,0.98))]">
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[18px] border border-white/10 bg-black/20 text-cyan-200">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.28em] text-cyan-200/72">{title}</div>
              <CardTitle className="mt-2">{parity.displayName}</CardTitle>
            </div>
          </div>
          <Badge variant="cyan">{parity.instructionName}</Badge>
        </div>
        <p className="max-w-3xl text-sm leading-7 text-white/60">{parity.summary}</p>
      </CardHeader>
      <CardContent className="space-y-5">
        {preparedSummary ? (
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
              <div className="text-[11px] uppercase tracking-[0.28em] text-white/42">Signer role</div>
              <div className="mt-2 text-sm font-medium text-white">{preparedSummary.signerRole}</div>
            </div>
            <div className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
              <div className="text-[11px] uppercase tracking-[0.28em] text-white/42">Network</div>
              <div className="mt-2 text-sm font-medium text-white">{preparedSummary.network}</div>
            </div>
          </div>
        ) : null}

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-[22px] border border-white/8 bg-black/20 p-4">
            <div className="text-[11px] uppercase tracking-[0.28em] text-white/42">Field order</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {parity.fieldOrder.length > 0 ? parity.fieldOrder.map((field) => (
                <span key={field} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs uppercase tracking-[0.16em] text-white/72">
                  {field}
                </span>
              )) : <span className="text-sm text-white/48">No instruction args</span>}
            </div>
          </div>
          <div className="rounded-[22px] border border-white/8 bg-black/20 p-4">
            <div className="text-[11px] uppercase tracking-[0.28em] text-white/42">Accounts</div>
            <div className="mt-3 space-y-2">
              {parity.accounts.map((account) => (
                <div key={account.name} className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-2 text-xs text-white/72">
                  <span className="font-medium text-white">{account.name}</span>
                  <span>{account.writable ? "mutable" : "read"} · {account.signer ? "signer" : "non-signer"}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-[22px] border border-cyan-300/16 bg-cyan-300/[0.08] p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-[11px] uppercase tracking-[0.28em] text-cyan-100/72">Runtime verification status</div>
              <div className="mt-2 text-sm leading-7 text-white/68">{runtimeStatus.supportNote}</div>
            </div>
            <Link href="/documents/real-device-runtime" className={cn(buttonVariants({ size: "sm", variant: "outline" }), "justify-between")}>
              Open runtime evidence
            </Link>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[18px] border border-white/8 bg-black/20 p-3">
              <div className="text-[11px] uppercase tracking-[0.22em] text-white/40">Live lane</div>
              <div className="mt-2">
                <Badge variant={runtimeStatus.liveWalletLane ? "success" : "warning"}>
                  {runtimeStatus.liveWalletLane ? "Wallet-first live" : "Pending"}
                </Badge>
              </div>
            </div>
            <div className="rounded-[18px] border border-white/8 bg-black/20 p-3">
              <div className="text-[11px] uppercase tracking-[0.22em] text-white/40">Repo proof</div>
              <div className="mt-2">
                <Badge variant={runtimeStatus.repoScriptProofCaptured ? "success" : "warning"}>
                  {runtimeStatus.repoScriptProofCaptured ? "Captured" : "Pending"}
                </Badge>
              </div>
            </div>
            <div className="rounded-[18px] border border-white/8 bg-black/20 p-3">
              <div className="text-[11px] uppercase tracking-[0.22em] text-white/40">Browser wallet proof</div>
              <div className="mt-2">
                <Badge variant={runtimeStatus.browserWalletProofCaptured ? "success" : "warning"}>
                  {runtimeStatus.browserWalletProofCaptured ? "Captured" : "Pending"}
                </Badge>
              </div>
            </div>
            <div className="rounded-[18px] border border-white/8 bg-black/20 p-3">
              <div className="text-[11px] uppercase tracking-[0.22em] text-white/40">Real-device proof</div>
              <div className="mt-2">
                <Badge variant={runtimeStatus.realDeviceProofCaptured ? "success" : "warning"}>
                  {runtimeStatus.realDeviceProofCaptured ? "Captured" : "Pending"}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {!compact ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-[22px] border border-emerald-300/16 bg-emerald-300/8 p-4">
              <div className="text-[11px] uppercase tracking-[0.28em] text-emerald-100/72">Review checklist</div>
              <div className="mt-3 space-y-2 text-sm leading-7 text-white/68">
                {parity.reviewChecklist.map((item) => (
                  <div key={item}>• {item}</div>
                ))}
              </div>
            </div>
            <div className="rounded-[22px] border border-amber-300/16 bg-amber-300/8 p-4">
              <div className="text-[11px] uppercase tracking-[0.28em] text-amber-100/72">Validation rules</div>
              <div className="mt-3 space-y-2 text-sm leading-7 text-white/68">
                {parity.validationRules.map((item) => (
                  <div key={item}>• {item}</div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
