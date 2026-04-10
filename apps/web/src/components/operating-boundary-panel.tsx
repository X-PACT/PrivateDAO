import { Code2, MonitorSmartphone } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const uiOperations = [
  "Connect Wallet",
  "Create DAO",
  "Create Proposal",
  "Commit Vote",
  "Reveal Vote",
  "Execute Proposal",
  "View Logs",
  "Diagnostics",
];

const repoOperations = [
  "Advanced debugging",
  "Batch operations",
  "Emergency recovery",
  "Migration tools",
  "Stress tests",
];

type OperatingBoundaryPanelProps = {
  title?: string;
  summary?: string;
};

export function OperatingBoundaryPanel({
  title = "Product operating split",
  summary = "The product UI handles the full user journey. The repo and CLI stay available for engineering, recovery, migration, and deeper operational discipline.",
}: OperatingBoundaryPanelProps) {
  return (
    <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(10,16,32,0.94),rgba(7,11,23,0.98))]">
      <CardHeader className="space-y-3">
        <CardTitle>{title}</CardTitle>
        <p className="max-w-3xl text-sm leading-7 text-white/60">{summary}</p>
      </CardHeader>
      <CardContent className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-[28px] border border-emerald-300/16 bg-emerald-300/8 p-5">
          <div className="flex items-center gap-3 text-emerald-100">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-300/16 bg-black/20">
              <MonitorSmartphone className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.28em] text-emerald-200/72">UI Full</div>
              <div className="mt-1 text-lg font-medium text-white">Normal-user product surface</div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {uiOperations.map((item) => (
              <div key={item} className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-xs uppercase tracking-[0.16em] text-white/72">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-cyan-300/16 bg-cyan-300/8 p-5">
          <div className="flex items-center gap-3 text-cyan-100">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/16 bg-black/20">
              <Code2 className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.28em] text-cyan-200/72">Repo Public + CLI</div>
              <div className="mt-1 text-lg font-medium text-white">Engineering and ops discipline</div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {repoOperations.map((item) => (
              <div key={item} className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-xs uppercase tracking-[0.16em] text-white/72">
                {item}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
