import Link from "next/link";
import { ArrowUpRight, Blocks, Coins, Gauge, GraduationCap, ShieldCheck, Sparkles } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { platformCapabilities } from "@/lib/platform-capability-stack";
import { cn } from "@/lib/utils";

const iconMap = {
  "private-governance-execution": Blocks,
  "confidential-treasury-operations": ShieldCheck,
  "stablecoin-treasury-rails": Coins,
  "agentic-treasury-automation": Sparkles,
  "runtime-and-data-plane": Gauge,
  "growth-and-learning-loop": GraduationCap,
} as const;

type PlatformCapabilityStackProps = {
  title?: string;
  description?: string;
};

export function PlatformCapabilityStack({
  title = "Surface-to-depth capability stack",
  description = "Each capability below links the visible user surface to the actual execution core, the proof route, and the learning path so the platform reads like real infrastructure instead of disconnected claims.",
}: PlatformCapabilityStackProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="text-sm leading-7 text-white/60">{description}</p>
      </CardHeader>
      <CardContent className="grid gap-4 xl:grid-cols-2">
        {platformCapabilities.map((capability) => {
          const Icon = iconMap[capability.slug as keyof typeof iconMap] ?? Blocks;

          return (
            <div key={capability.slug} className="rounded-3xl border border-white/8 bg-white/4 p-5">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl border border-white/8 bg-black/20 p-3 text-cyan-100">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-lg font-medium text-white">{capability.title}</div>
                  <p className="mt-2 text-sm leading-7 text-white/60">{capability.promise}</p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-cyan-300/16 bg-cyan-300/[0.08] p-4 text-sm leading-7 text-white/70">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-cyan-100/74">Visible surface</div>
                  <div className="mt-2">{capability.surfaceRoute.label}</div>
                </div>
                <div className="rounded-2xl border border-emerald-300/16 bg-emerald-300/[0.08] p-4 text-sm leading-7 text-white/70">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-emerald-100/74">Commercial shape</div>
                  <div className="mt-2">{capability.commercialShape}</div>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-white/8 bg-black/20 p-4">
                <div className="text-[11px] uppercase tracking-[0.22em] text-white/46">Execution core</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {capability.executionCore.map((item) => (
                    <span
                      key={`${capability.slug}-${item}`}
                      className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/62"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {capability.technologies.map((technology) => (
                  <span
                    key={`${capability.slug}-${technology}`}
                    className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-white/66"
                  >
                    {technology}
                  </span>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link className={cn(buttonVariants({ size: "sm" }))} href={capability.surfaceRoute.href}>
                  {capability.surfaceRoute.label}
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link className={cn(buttonVariants({ size: "sm", variant: "secondary" }))} href={capability.executionRoute.href}>
                  {capability.executionRoute.label}
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link className={cn(buttonVariants({ size: "sm", variant: "outline" }))} href={capability.proofRoute.href}>
                  {capability.proofRoute.label}
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link className={cn(buttonVariants({ size: "sm", variant: "outline" }))} href={capability.learnRoute.href}>
                  {capability.learnRoute.label}
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
