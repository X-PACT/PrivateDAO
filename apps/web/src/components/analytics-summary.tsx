"use client";

import { ShieldAlert, Sparkles, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { analyticsReadiness, analyticsSnapshots } from "@/lib/site-data";

export function AnalyticsSummary() {
  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {analyticsSnapshots.map((snapshot) => (
          <Card key={snapshot.label}>
            <CardHeader className="pb-3">
              <div className="text-[11px] uppercase tracking-[0.28em] text-white/40">{snapshot.label}</div>
              <CardTitle className="text-2xl">{snapshot.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-7 text-white/58">{snapshot.detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {analyticsReadiness.map((item, index) => (
          <Card key={item.title} className="h-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div
                  className={`rounded-2xl border border-white/8 p-3 ${
                    item.tone === "success"
                      ? "bg-emerald-300/10 text-emerald-200"
                      : item.tone === "cyan"
                        ? "bg-cyan-300/10 text-cyan-200"
                        : "bg-amber-300/10 text-amber-200"
                  }`}
                >
                  {index === 0 ? <Sparkles className="h-4 w-4" /> : index === 1 ? <TrendingUp className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <Badge variant={item.tone === "success" ? "success" : item.tone === "cyan" ? "cyan" : "warning"}>
                    {item.tone === "success" ? "Live now" : item.tone === "cyan" ? "Operational" : "Boundary"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-7 text-white/58">{item.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
