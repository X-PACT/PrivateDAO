import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { proofFlowSteps } from "@/lib/site-data";

export function ProofFlowRail() {
  return (
    <div className="grid gap-5 lg:grid-cols-4">
      {proofFlowSteps.map((step, index) => (
        step.href.startsWith("/") ? (
          <Link key={step.title} href={step.href} className="group">
            <Card className="h-full transition hover:border-cyan-300/25 hover:bg-white/[0.035]">
              <CardContent className="space-y-4 p-6">
                <div className="flex items-center justify-between gap-3">
                  <div className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-cyan-100">
                    Step {index + 1}
                  </div>
                  {index < proofFlowSteps.length - 1 ? (
                    <ArrowRight className="h-4 w-4 text-white/28" />
                  ) : (
                    <ShieldCheck className="h-4 w-4 text-emerald-300" />
                  )}
                </div>
                <div className="text-lg font-medium text-white">{step.title}</div>
                <p className="text-sm leading-7 text-white/58">{step.detail}</p>
              </CardContent>
            </Card>
          </Link>
        ) : (
          <a
            key={step.title}
            href={step.href}
            rel="noreferrer"
            target="_blank"
            className="group"
          >
            <Card className="h-full transition hover:border-cyan-300/25 hover:bg-white/[0.035]">
              <CardContent className="space-y-4 p-6">
                <div className="flex items-center justify-between gap-3">
                  <div className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-cyan-100">
                    Step {index + 1}
                  </div>
                  {index < proofFlowSteps.length - 1 ? (
                    <ArrowRight className="h-4 w-4 text-white/28" />
                  ) : (
                    <ShieldCheck className="h-4 w-4 text-emerald-300" />
                  )}
                </div>
                <div className="text-lg font-medium text-white">{step.title}</div>
                <p className="text-sm leading-7 text-white/58">{step.detail}</p>
              </CardContent>
            </Card>
          </a>
        )
      ))}
    </div>
  );
}
