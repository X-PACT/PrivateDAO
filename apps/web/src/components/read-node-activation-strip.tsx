import Link from "next/link";
import { Activity, ArrowRight, Database, FileText, Network, ServerCog } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getReadNodeActivationSnapshot, type ReadNodeActivationContext } from "@/lib/read-node-activation";
import { cn } from "@/lib/utils";

type ReadNodeActivationStripProps = {
  context: ReadNodeActivationContext;
};

const statMeta = [
  { key: "readPath", label: "Read path", icon: Network },
  { key: "indexedProposalCount", label: "Indexed coverage", icon: Database },
  { key: "confidentialCoverage", label: "Confidential", icon: Activity },
  { key: "operatorCheckCount", label: "Operator checks", icon: ServerCog },
] as const;

export function ReadNodeActivationStrip({ context }: ReadNodeActivationStripProps) {
  const snapshot = getReadNodeActivationSnapshot(context);

  return (
    <Card className="border-cyan-300/16 bg-cyan-300/[0.06]">
      <CardHeader className="gap-3">
        <div className="text-[11px] uppercase tracking-[0.3em] text-cyan-200/80">
          Read-node activation
        </div>
        <CardTitle>{snapshot.title}</CardTitle>
        <div className="max-w-4xl text-sm leading-7 text-white/60">{snapshot.description}</div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-[24px] border border-white/8 bg-black/20 p-4">
          <div className="text-[11px] uppercase tracking-[0.24em] text-white/40">Activation state</div>
          <div className="mt-2 text-base font-medium text-white">{snapshot.activationState}</div>
          <div className="mt-2 text-sm leading-7 text-white/58">{snapshot.exactGap}</div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {statMeta.map((item) => {
            const Icon = item.icon;
            const value = snapshot[item.key];

            return (
              <div key={item.key} className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-white/42">
                  <Icon className="h-3.5 w-3.5 text-cyan-200/78" />
                  {item.label}
                </div>
                <div className="mt-3 text-lg font-semibold tracking-tight text-white">{value}</div>
              </div>
            );
          })}
        </div>

        <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
          <div className="text-[11px] uppercase tracking-[0.24em] text-white/40">Integration coverage</div>
          <div className="mt-2 text-sm leading-7 text-white/62">{snapshot.integrationCoverage}</div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
          <Link href={snapshot.bestRouteHref} className={cn(buttonVariants({ variant: "secondary" }), "justify-between")}>
            {snapshot.bestRouteLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href={snapshot.telemetryHref} className={cn(buttonVariants({ variant: "outline" }), "justify-between")}>
            {snapshot.telemetryLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href={snapshot.snapshotHref} className={cn(buttonVariants({ variant: "outline" }), "justify-between")}>
            {snapshot.snapshotLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href={snapshot.opsHref} className={cn(buttonVariants({ variant: "outline" }), "justify-between")}>
            {snapshot.opsLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href={snapshot.deployHref} className={cn(buttonVariants({ variant: "outline" }), "justify-between")}>
            <span className="inline-flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {snapshot.deployLabel}
            </span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href={snapshot.cutoverPacketHref} className={cn(buttonVariants({ variant: "outline" }), "justify-between")}>
            {snapshot.cutoverPacketLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
