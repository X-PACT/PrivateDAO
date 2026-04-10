import { Activity, Gauge, ShieldCheck, Wallet } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDevnetServiceMetrics } from "@/lib/devnet-service-metrics";

type DevnetServiceMetricsPanelProps = {
  scope?: "overview" | "services" | "diagnostics";
  trackSlug?: string;
};

const toneClasses = {
  cyan: "border-cyan-300/16 bg-cyan-300/[0.08] text-cyan-100",
  emerald: "border-emerald-300/18 bg-emerald-300/8 text-emerald-100",
  amber: "border-amber-300/16 bg-amber-300/8 text-amber-100",
  fuchsia: "border-fuchsia-300/16 bg-fuchsia-300/[0.08] text-fuchsia-100",
};

const iconMap = {
  "Success rate": Activity,
  "Primary RPC latency": Gauge,
  "Wallet coverage": Wallet,
  "Proof completion": ShieldCheck,
};

export function DevnetServiceMetricsPanel({
  scope = "overview",
  trackSlug,
}: DevnetServiceMetricsPanelProps) {
  const metrics = getDevnetServiceMetrics();
  const cards = trackSlug ? metrics.tracks[trackSlug] ?? metrics.overview : metrics[scope];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Devnet service metrics</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((metric) => {
          const Icon = iconMap[metric.label as keyof typeof iconMap] ?? Activity;
          return (
            <div
              key={`${trackSlug ?? scope}-${metric.label}`}
              className={`rounded-3xl border p-5 ${toneClasses[metric.tone]}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="text-right">
                  <div className="text-[11px] uppercase tracking-[0.24em] text-white/54">
                    {metric.label}
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-white">{metric.value}</div>
                </div>
              </div>
              <div className="mt-4 text-sm leading-7 text-white/72">{metric.detail}</div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
