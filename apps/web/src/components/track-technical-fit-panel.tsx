import Link from "next/link";
import { ArrowUpRight, Cpu, KeyRound, ShieldCheck, Wallet } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getTrackTechnicalFit } from "@/lib/technical-eligibility";

type TrackTechnicalFitPanelProps = {
  slug: string;
};

export function TrackTechnicalFitPanel({ slug }: TrackTechnicalFitPanelProps) {
  const fit = getTrackTechnicalFit(slug);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Technical eligibility</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          {fit.coreIdentity.map((item) => (
            <div key={`${slug}-${item.label}`} className="rounded-3xl border border-white/8 bg-white/4 p-4">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-cyan-200/76">
                {item.label.toLowerCase().includes("wallet") ? (
                  <Wallet className="h-3.5 w-3.5" />
                ) : item.label.toLowerCase().includes("token") || item.label.toLowerCase().includes("mint") ? (
                  <KeyRound className="h-3.5 w-3.5" />
                ) : (
                  <Cpu className="h-3.5 w-3.5" />
                )}
                {item.label}
              </div>
              <div className="mt-2 break-all text-sm leading-7 text-white/72">{item.value}</div>
            </div>
          ))}
        </div>

        <div className="grid gap-3">
          {fit.sponsorUsage.map((line) => (
            <div key={`${slug}-${line}`} className="flex gap-3 rounded-3xl border border-white/8 bg-white/4 p-4 text-sm leading-7 text-white/64">
              <ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-emerald-200" />
              <div>{line}</div>
            </div>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {fit.evidenceRoutes.map((route) => (
            <Link key={`${slug}-${route.href}`} href={route.href} className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
              {route.label}
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          ))}
        </div>

        <div className="rounded-3xl border border-white/8 bg-black/20 p-4 text-sm leading-7 text-white/62">
          <div className="text-[11px] uppercase tracking-[0.28em] text-white/46">Validation gates</div>
          <div className="mt-3 grid gap-2">
            {fit.validationGates.map((gate) => (
              <div key={`${slug}-${gate}`} className="rounded-2xl border border-white/8 bg-white/4 px-3 py-2 font-mono text-xs text-white/66">
                {gate}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
