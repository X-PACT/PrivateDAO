import Link from "next/link";
import { Activity, BellRing, ShieldCheck, Wallet, BriefcaseBusiness } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import type { ExecutionSurfaceSignal, ExecutionSurfaceSnapshot } from "@/lib/devnet-service-metrics";
import { cn } from "@/lib/utils";

type ExecutionSurfaceInlineProps = {
  mode: "proposal" | "wallet" | "start";
  snapshot: ExecutionSurfaceSnapshot;
};

const toneClass = {
  cyan: "border-cyan-300/16 bg-cyan-300/[0.08]",
  emerald: "border-emerald-300/18 bg-emerald-300/8",
  amber: "border-amber-300/16 bg-amber-300/8",
  fuchsia: "border-fuchsia-300/16 bg-fuchsia-300/[0.08]",
};

function InlineMetric({ signal }: { signal: ExecutionSurfaceSignal }) {
  return (
    <div className={cn("rounded-[24px] border p-4", toneClass[signal.tone])}>
      <div className="flex items-start justify-between gap-3">
        <div className="text-[11px] uppercase tracking-[0.24em] text-white/46">{signal.label}</div>
        <div className="text-base font-semibold text-white">{signal.value}</div>
      </div>
      <p className="mt-3 text-sm leading-7 text-white/68">{signal.detail}</p>
      <Link className={cn(buttonVariants({ size: "sm", variant: "secondary" }), "mt-4 w-full")} href={signal.routeHref}>
        {signal.routeLabel}
      </Link>
    </div>
  );
}

export function ExecutionSurfaceInline({ mode, snapshot }: ExecutionSurfaceInlineProps) {
  const metricGroups = {
    proposal: [snapshot.proposalFlow, snapshot.proofFreshness],
    wallet: [snapshot.walletReadiness, snapshot.commercialReadiness],
    start: [snapshot.walletReadiness, snapshot.proposalFlow],
  } satisfies Record<ExecutionSurfaceInlineProps["mode"], ExecutionSurfaceSignal[]>;

  const headers = {
    proposal: {
      title: "Live proposal execution health",
      description: "These metrics are shown here so commit, reveal, finalize, and execute stay tied to the live Testnet proof boundary.",
      icon: Activity,
    },
    wallet: {
      title: "Wallet readiness and incident watch",
      description: "Before the user signs, the product should expose wallet coverage, proof freshness, and the current operator watch state.",
      icon: Wallet,
    },
    start: {
      title: "Start-path readiness",
      description: "First-run users should see whether wallet, proposal, and proof surfaces are healthy before entering deeper governance steps.",
      icon: ShieldCheck,
    },
  } satisfies Record<ExecutionSurfaceInlineProps["mode"], { title: string; description: string; icon: typeof Activity }>;

  const header = headers[mode];
  const Icon = header.icon;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-cyan-200">
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <CardTitle>{header.title}</CardTitle>
            <p className="mt-2 text-sm leading-7 text-white/60">{header.description}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 xl:grid-cols-2">
          {metricGroups[mode].map((signal) => (
            <InlineMetric key={signal.label} signal={signal} />
          ))}
        </div>

        <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
          <div className="flex items-center gap-3">
            <BellRing className="h-4 w-4 text-fuchsia-200" />
            <div className="text-sm font-medium text-white">Current incident watch</div>
          </div>
          <div className="mt-4 grid gap-3 xl:grid-cols-3">
            {snapshot.incidentAlerts.map((alert) => (
              <div key={alert.title} className="rounded-2xl border border-white/8 bg-black/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-medium text-white">{alert.title}</div>
                  <Badge variant={alert.status === "Healthy" ? "success" : alert.status === "Watch" ? "warning" : "violet"}>
                    {alert.status}
                  </Badge>
                </div>
                <p className="mt-3 text-sm leading-7 text-white/62">{alert.summary}</p>
                <Link className={cn(buttonVariants({ size: "sm", variant: "outline" }), "mt-3 w-full")} href={alert.routeHref}>
                  {alert.routeLabel}
                </Link>
              </div>
            ))}
          </div>
        </div>

        {mode !== "wallet" ? (
          <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
            <div className="flex items-center gap-3">
              <BriefcaseBusiness className="h-4 w-4 text-emerald-200" />
              <div className="text-sm font-medium text-white">Buyer path stays connected</div>
            </div>
            <p className="mt-3 text-sm leading-7 text-white/62">
              Devnet operation is not isolated from the commercial surface. The same execution evidence that helps reviewers also supports pilot, hosted API, and enterprise governance conversations.
            </p>
            <Link className={cn(buttonVariants({ size: "sm", variant: "secondary" }), "mt-3")} href="/engage">
              Open engage
            </Link>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
