import Link from "next/link";
import { ArrowRight, Blocks, BookOpen, HandCoins, ShieldCheck, Sparkles, Workflow, Coins } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { getEcosystemFocusAlignment } from "@/lib/ecosystem-focus-alignment";
import { cn } from "@/lib/utils";

type EcosystemFocusAlignmentStripProps = {
  title?: string;
  description?: string;
};

const iconMap = {
  decentralisation: Blocks,
  "censorship-resistance": ShieldCheck,
  "dao-tooling": Workflow,
  education: BookOpen,
  "developer-tooling": Sparkles,
  payments: HandCoins,
  "cause-driven": Coins,
} as const;

function fitClass(fit: "strong" | "moderate" | "selective") {
  if (fit === "strong") return "border-emerald-300/14 bg-emerald-300/[0.06]";
  if (fit === "moderate") return "border-cyan-300/14 bg-cyan-300/[0.06]";
  return "border-amber-300/14 bg-amber-300/[0.06]";
}

export function EcosystemFocusAlignmentStrip({
  title = "Ecosystem focus alignment",
  description = "Show where PrivateDAO already fits the current ecosystem focus areas, what is already real, and what remains the exact next gap.",
}: EcosystemFocusAlignmentStripProps) {
  const payload = getEcosystemFocusAlignment();

  return (
    <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(10,15,29,0.94),rgba(7,10,22,0.99))]">
      <CardHeader className="gap-3">
        <div className="text-[11px] uppercase tracking-[0.3em] text-cyan-200/80">Ecosystem fit</div>
        <CardTitle>{title}</CardTitle>
        <div className="max-w-4xl text-sm leading-7 text-white/58">{description}</div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
          {payload.focusAreas.map((area) => {
            const Icon = iconMap[area.slug as keyof typeof iconMap] ?? Sparkles;

            return (
              <div key={area.slug} className={cn("rounded-[22px] border px-4 py-4", fitClass(area.fit))}>
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-white/42">
                  <Icon className="h-3.5 w-3.5 text-cyan-200/78" />
                  {area.title}
                </div>
                <div className="mt-3 text-sm leading-7 text-white/66">{area.whatWorksNow}</div>
                <div className="mt-3 text-sm leading-7 text-white/52">{area.exactGap}</div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/documents/ecosystem-focus-alignment"
            className={cn(buttonVariants({ variant: "secondary" }), "justify-between sm:min-w-[240px]")}
          >
            Open focus packet
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/documents/strategic-opportunity-readiness-2026"
            className={cn(buttonVariants({ variant: "outline" }), "justify-between sm:min-w-[290px]")}
          >
            Open strategic opportunity map
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
