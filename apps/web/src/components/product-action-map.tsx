import Link from "next/link";
import {
  Activity,
  ChevronRight,
  FilePlus2,
  Flag,
  FolderPlus,
  ListChecks,
  Play,
  Vote,
  Wallet,
  Wrench,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const uiActions = [
  {
    title: "Connect Wallet",
    detail: "Start with Solflare, Phantom, or Backpack and activate the live governance flow.",
    href: "/start",
    icon: Wallet,
  },
  {
    title: "Create DAO",
    detail: "Use the guided start workspace to move into the DAO creation rail instead of repo setup.",
    href: "/start",
    icon: FolderPlus,
  },
  {
    title: "Create Proposal",
    detail: "Stay in the same govern flow and submit the first proposal after the DAO is ready.",
    href: "/govern",
    icon: FilePlus2,
  },
  {
    title: "Commit Vote",
    detail: "Commit voting stays inside the same live wallet-connected govern surface.",
    href: "/govern",
    icon: Vote,
  },
  {
    title: "Reveal Vote",
    detail: "Reveal remains a first-class product action rather than a hidden protocol-only step.",
    href: "/govern",
    icon: ListChecks,
  },
  {
    title: "Finalize Proposal",
    detail: "Finalize stays explicit in the govern flow so the product matches the real on-chain phase boundary before execution.",
    href: "/govern",
    icon: Flag,
  },
  {
    title: "Execute Proposal",
    detail: "Execution only becomes visible when the real readiness boundary says it is ready.",
    href: "/govern",
    icon: Play,
  },
  {
    title: "Live Activity",
    detail: "Follow proposals, vote timeline, treasury state, and execution results in the activity view.",
    href: "/live",
    icon: ListChecks,
  },
  {
    title: "Diagnostics",
    detail: "Runtime evidence, proof freshness, and operational health stay in the product diagnostics route.",
    href: "/diagnostics",
    icon: Activity,
  },
] as const;

const cliActions = [
  "Advanced debugging",
  "Batch operations",
  "Emergency recovery",
  "Migration tools",
  "Stress tests",
] as const;

type ProductActionMapProps = {
  title?: string;
  description?: string;
};

export function ProductActionMap({
  title = "What the app lets you do",
  description = "The public app should expose the real user journey only: connect, govern, track the result, and inspect trust when needed. Engineering-heavy flows stay outside the normal user path.",
}: ProductActionMapProps) {
  return (
    <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(10,16,32,0.94),rgba(7,11,23,0.98))]">
      <CardHeader className="space-y-3">
        <CardTitle>{title}</CardTitle>
        <p className="max-w-3xl text-sm leading-7 text-white/60">{description}</p>
      </CardHeader>
      <CardContent className="grid gap-6 xl:grid-cols-[1.18fr_0.82fr]">
        <div className="space-y-4">
          <div className="text-[11px] uppercase tracking-[0.28em] text-emerald-200/72">Product flow</div>
          <div className="grid gap-3 md:grid-cols-2">
            {uiActions.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group rounded-[24px] border border-white/10 bg-white/[0.03] p-4 transition hover:border-cyan-300/22 hover:bg-white/[0.05]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-[18px] border border-white/10 bg-black/20 text-cyan-200">
                      <Icon className="h-4 w-4" />
                    </div>
                    <ChevronRight className="mt-1 h-4 w-4 text-white/32 transition group-hover:text-cyan-200" />
                  </div>
                  <div className="mt-4 text-base font-medium text-white">{item.title}</div>
                  <p className="mt-2 text-sm leading-7 text-white/56">{item.detail}</p>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-[11px] uppercase tracking-[0.28em] text-cyan-200/72">Operator layer</div>
          <div className="rounded-[28px] border border-cyan-300/16 bg-cyan-300/8 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/16 bg-black/20 text-cyan-100">
                <Wrench className="h-5 w-5" />
              </div>
              <div className="text-lg font-medium text-white">Engineering and recovery rails</div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {cliActions.map((item) => (
                <div
                  key={item}
                  className={cn(
                    "rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-xs uppercase tracking-[0.16em] text-white/72",
                  )}
                >
                  {item}
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm leading-7 text-white/58">
              These stay outside the buyer-facing flow. They remain accessible through the repo for maintainers, audits, migrations, incident handling, and deep protocol operations.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
