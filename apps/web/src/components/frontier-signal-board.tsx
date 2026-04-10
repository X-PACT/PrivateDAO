import { ShieldCheck, Sparkles, Trophy } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { frontierOperatingSignals } from "@/lib/site-data";

const icons = [Trophy, ShieldCheck, ShieldCheck, Sparkles, Sparkles];

export function FrontierSignalBoard() {
  return (
    <div className="grid gap-5 xl:grid-cols-2">
      {frontierOperatingSignals.map((signal, index) => {
        const Icon = icons[index] ?? Sparkles;
        return (
          <Card key={signal.title} className="border-white/10 bg-[linear-gradient(180deg,rgba(12,16,30,0.94),rgba(8,10,22,0.98))]">
            <CardHeader className="space-y-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-cyan-100">
                <Icon className="h-5 w-5" />
              </div>
              <CardTitle className="text-xl">{signal.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-7 text-white/60">{signal.summary}</p>
              <div className="rounded-[22px] border border-emerald-300/18 bg-emerald-300/8 px-4 py-3 text-sm text-white/72">
                {signal.action}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
