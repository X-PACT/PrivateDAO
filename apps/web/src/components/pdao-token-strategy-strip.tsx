import Link from "next/link";
import {
  ArrowRight,
  Blocks,
  Coins,
  Gamepad2,
  LockKeyhole,
  Vote,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getPdaoTokenStrategySnapshot,
  type PdaoTokenStrategyContext,
} from "@/lib/pdao-token-strategy";
import { cn } from "@/lib/utils";

type PdaoTokenStrategyStripProps = {
  context: PdaoTokenStrategyContext;
};

const sectionMeta = [
  {
    key: "now",
    title: "What PDAO does now",
    icon: Vote,
  },
  {
    key: "gates",
    title: "What it gates",
    icon: LockKeyhole,
  },
  {
    key: "futureFacing",
    title: "What remains future-facing",
    icon: Gamepad2,
  },
  {
    key: "techRails",
    title: "How it connects to the stack",
    icon: Blocks,
  },
] as const;

export function PdaoTokenStrategyStrip({ context }: PdaoTokenStrategyStripProps) {
  const snapshot = getPdaoTokenStrategySnapshot(context);

  return (
    <Card className="border-fuchsia-300/16 bg-[linear-gradient(180deg,rgba(18,12,32,0.96),rgba(8,9,20,0.99))]">
      <CardHeader className="gap-4">
        <div className="flex flex-wrap gap-3">
          <Badge variant="violet">PDAO token strategy</Badge>
          <Badge variant="cyan">{snapshot.network}</Badge>
          <Badge variant="success">{snapshot.tokenProgram}</Badge>
          <Badge variant="warning">Mint authority disabled</Badge>
        </div>
        <div className="space-y-3">
          <CardTitle>{snapshot.title}</CardTitle>
          <div className="max-w-4xl text-sm leading-7 text-white/60">{snapshot.description}</div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-3 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-white/42">
              <Coins className="h-3.5 w-3.5 text-fuchsia-200/80" />
              Live token truth
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <div className="text-[11px] uppercase tracking-[0.22em] text-white/38">Mint</div>
                <div className="mt-2 break-all text-sm font-medium text-white">{snapshot.mint}</div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-[0.22em] text-white/38">Initial supply</div>
                <div className="mt-2 text-sm font-medium text-white">{snapshot.supply}</div>
              </div>
            </div>
          </div>
          <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4">
            <div className="text-[11px] uppercase tracking-[0.24em] text-white/42">
              Exact boundary
            </div>
            <div className="mt-3 text-sm leading-7 text-white/64">{snapshot.boundary}</div>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          {sectionMeta.map((section) => {
            const Icon = section.icon;
            const items = snapshot[section.key];

            return (
              <div
                key={section.key}
                className="rounded-[24px] border border-white/8 bg-white/[0.03] px-4 py-4"
              >
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-white/42">
                  <Icon className="h-3.5 w-3.5 text-fuchsia-200/78" />
                  {section.title}
                </div>
                <div className="mt-4 space-y-4">
                  {items.map((item) => (
                    <div key={item.label} className="rounded-[18px] border border-white/7 bg-black/20 px-3 py-3">
                      <div className="text-sm font-medium text-white">{item.label}</div>
                      <div className="mt-2 text-sm leading-7 text-white/58">{item.detail}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link
            href={snapshot.tokenArchitectureHref}
            className={cn(buttonVariants({ variant: "secondary" }), "justify-between")}
          >
            Open token architecture
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href={snapshot.tokenSurfaceHref}
            className={cn(buttonVariants({ variant: "outline" }), "justify-between")}
          >
            Open PDAO token surface
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href={snapshot.bestRouteHref}
            className={cn(buttonVariants({ variant: "outline" }), "justify-between")}
          >
            {snapshot.bestRouteLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
