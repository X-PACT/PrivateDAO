import { CheckCircle2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { executionLog } from "@/lib/site-data";

export function ExecutionLogPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Execution log panel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {executionLog.map((item) => (
          <div
            key={item.label}
            className="flex items-start gap-4 rounded-3xl border border-white/8 bg-white/4 p-4"
          >
            <div className="rounded-full border border-emerald-300/20 bg-emerald-300/10 p-2 text-emerald-200">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div className="space-y-1">
              <div className="text-sm font-medium text-white">{item.label}</div>
              <div className="text-sm leading-7 text-white/55">{item.value}</div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
