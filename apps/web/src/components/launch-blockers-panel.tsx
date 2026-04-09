import { AlertTriangle, CheckCircle2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { launchBlockers } from "@/lib/site-data";

export function LaunchBlockersPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Launch blockers and readiness</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {launchBlockers.map((blocker) => (
          <div key={blocker.name} className="rounded-3xl border border-white/8 bg-white/4 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-white/8 bg-black/25 p-3 text-white/85">
                  {blocker.state === "Documented" ? <CheckCircle2 className="h-4 w-4 text-emerald-300" /> : <AlertTriangle className="h-4 w-4 text-amber-300" />}
                </div>
                <div className="text-base font-medium text-white">{blocker.name}</div>
              </div>
              <Badge variant={blocker.state === "Documented" ? "cyan" : "warning"}>{blocker.state}</Badge>
            </div>
            <p className="mt-3 text-sm leading-7 text-white/58">{blocker.note}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
