import { ArrowRight, CheckCircle2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buyerJourneySteps } from "@/lib/site-data";

export function BuyerJourneyRail() {
  return (
    <div className="grid gap-5 lg:grid-cols-4">
      {buyerJourneySteps.map((step, index) => (
        <Card key={step.title} className="h-full">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between gap-3">
              <div className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-emerald-200/85">
                Step {index + 1}
              </div>
              {index < buyerJourneySteps.length - 1 ? <ArrowRight className="h-4 w-4 text-white/28" /> : <CheckCircle2 className="h-4 w-4 text-emerald-300" />}
            </div>
            <CardTitle className="text-lg">{step.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-7 text-white/58">{step.description}</p>
            <div className="rounded-2xl border border-white/8 bg-white/4 p-4 text-sm leading-7 text-white/72">{step.outcome}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
