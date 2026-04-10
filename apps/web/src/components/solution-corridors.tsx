import Link from "next/link";
import { ArrowUpRight, Blocks, Gamepad2, Network, ShieldCheck, Smartphone } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { productCorridors } from "@/lib/site-data";

const corridorIcons = [ShieldCheck, Blocks, Smartphone, Gamepad2, Network];

export function SolutionCorridors() {
  return (
    <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
      {productCorridors.map((corridor, index) => {
        const Icon = corridorIcons[index] ?? ShieldCheck;

        return (
          <Link
            key={corridor.name}
            href={corridor.href}
            className="group"
          >
            <Card className="h-full border-white/10 bg-[linear-gradient(180deg,rgba(12,17,32,0.92),rgba(8,10,22,0.98))] transition hover:border-cyan-300/20 hover:bg-[linear-gradient(180deg,rgba(16,24,44,0.94),rgba(9,12,26,0.99))]">
              <CardHeader className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/8 bg-black/25 text-cyan-100">
                    <Icon className="h-5 w-5" />
                  </div>
                  <ArrowUpRight className="mt-1 h-4 w-4 text-white/38 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-cyan-100" />
                </div>
                <div className="space-y-2">
                  <div className="text-[11px] uppercase tracking-[0.3em] text-emerald-300/72">{corridor.audience}</div>
                  <CardTitle className="text-xl">{corridor.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <p className="text-sm leading-7 text-white/58">{corridor.summary}</p>
                <div className="flex flex-wrap gap-2">
                  {corridor.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-full border border-white/8 bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white/64"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
                <div className="text-sm font-medium text-cyan-200">{corridor.cta}</div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
