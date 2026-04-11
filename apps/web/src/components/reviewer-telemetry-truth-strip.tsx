import Link from "next/link";
import { ArrowRight, Gauge, Network, ShieldCheck, Waves } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getReviewerTelemetryTruthSnapshot } from "@/lib/reviewer-telemetry-truth";
import { cn } from "@/lib/utils";

type ReviewerTelemetryTruthStripProps = {
  title?: string;
  description?: string;
};

const statMeta = [
  {
    key: "freshnessLabel",
    label: "Freshness",
    icon: Gauge,
  },
  {
    key: "indexedProposalCount",
    label: "Indexed proposal count",
    icon: Network,
  },
  {
    key: "governanceFinalized",
    label: "Governance finalized",
    icon: ShieldCheck,
  },
  {
    key: "confidentialFinalized",
    label: "Confidential finalized",
    icon: Waves,
  },
] as const;

export function ReviewerTelemetryTruthStrip({
  title = "Telemetry truth strip",
  description = "Read the current telemetry truth from the generated packet and the same runtime metrics used by the live surface.",
}: ReviewerTelemetryTruthStripProps) {
  const snapshot = getReviewerTelemetryTruthSnapshot();

  return (
    <Card className="border-cyan-300/14 bg-[linear-gradient(180deg,rgba(9,16,31,0.96),rgba(6,11,21,0.98))]">
      <CardHeader className="gap-3">
        <div className="text-[11px] uppercase tracking-[0.3em] text-cyan-200/80">
          Telemetry truth
        </div>
        <CardTitle>{title}</CardTitle>
        <div className="max-w-3xl text-sm leading-7 text-white/58">{description}</div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {statMeta.map((item) => {
            const Icon = item.icon;
            const value = snapshot[item.key];

            return (
              <div
                key={item.key}
                className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4"
              >
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-white/42">
                  <Icon className="h-3.5 w-3.5 text-cyan-200/78" />
                  {item.label}
                </div>
                <div className="mt-3 text-2xl font-semibold tracking-tight text-white">
                  {value}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href={snapshot.packetHref}
            className={cn(buttonVariants({ variant: "secondary" }), "justify-between sm:min-w-[250px]")}
          >
            {snapshot.packetLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/diagnostics"
            className={cn(buttonVariants({ variant: "outline" }), "justify-between sm:min-w-[220px]")}
          >
            Open diagnostics
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/analytics"
            className={cn(buttonVariants({ variant: "outline" }), "justify-between sm:min-w-[200px]")}
          >
            Open analytics
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
