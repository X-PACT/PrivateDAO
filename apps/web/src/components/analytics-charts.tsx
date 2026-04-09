"use client";

import { useSyncExternalStore } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { analyticsSeries } from "@/lib/site-data";

const pieColors = ["#14f195", "#9945ff", "#00c2ff", "#ffb100"];

export function AnalyticsCharts() {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  if (!mounted) {
    return (
      <div className="grid gap-6 xl:grid-cols-2">
        {[0, 1, 2].map((index) => (
          <Card key={index} className={index === 2 ? "xl:col-span-2" : ""}>
            <CardHeader>
              <CardTitle>{index === 0 ? "Votes: commits vs reveals" : index === 1 ? "Treasury action mix" : "Proposal throughput"}</CardTitle>
            </CardHeader>
            <CardContent className="h-[320px] xl:min-h-[340px]">
              <div className="flex h-full items-center justify-center rounded-[28px] border border-dashed border-white/10 bg-white/[0.03] text-sm text-white/40">
                Loading analytics canvas...
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Votes: commits vs reveals</CardTitle>
        </CardHeader>
        <CardContent className="h-[320px] min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analyticsSeries.votes}>
              <defs>
                <linearGradient id="commitFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#14f195" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#14f195" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="revealFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#9945ff" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#9945ff" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  borderRadius: 18,
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(10,14,28,0.94)",
                  color: "white",
                }}
              />
              <Area dataKey="commits" stroke="#14f195" fill="url(#commitFill)" strokeWidth={2.2} />
              <Area dataKey="reveals" stroke="#9945ff" fill="url(#revealFill)" strokeWidth={2.2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Treasury action mix</CardTitle>
        </CardHeader>
        <CardContent className="h-[320px] min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={analyticsSeries.treasury} dataKey="value" nameKey="name" innerRadius={62} outerRadius={110} paddingAngle={4}>
                {analyticsSeries.treasury.map((entry, index) => (
                  <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: 18,
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(10,14,28,0.94)",
                  color: "white",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="xl:col-span-2">
        <CardHeader>
          <CardTitle>Proposal throughput</CardTitle>
        </CardHeader>
        <CardContent className="h-[340px] min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analyticsSeries.proposals}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  borderRadius: 18,
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(10,14,28,0.94)",
                  color: "white",
                }}
              />
              <Bar dataKey="proposals" fill="#00c2ff" radius={[16, 16, 0, 0]} />
              <Bar dataKey="executed" fill="#14f195" radius={[16, 16, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
