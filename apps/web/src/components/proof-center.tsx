import Link from "next/link";
import { ArrowUpRight, ShieldCheck } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { proofPackets, securitySurfaces } from "@/lib/site-data";

export function ProofCenter() {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <Card>
        <CardHeader>
          <CardTitle>Proof center</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {proofPackets.map((packet) => {
            const isInternal = packet.href.startsWith("/");
            const content = (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-lg font-medium text-white">{packet.title}</div>
                    <p className="mt-2 text-sm leading-7 text-white/56">{packet.summary}</p>
                  </div>
                  <ArrowUpRight className="mt-1 h-4 w-4 text-cyan-300 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
                <div className="mt-4 text-[11px] uppercase tracking-[0.28em] text-emerald-300/75">{packet.cta}</div>
              </>
            );

            if (isInternal) {
              return (
                <Link
                  className="group rounded-3xl border border-white/8 bg-white/4 p-5 transition hover:border-cyan-300/30 hover:bg-white/6"
                  href={packet.href}
                  key={packet.title}
                >
                  {content}
                </Link>
              );
            }

            return (
              <a
              className="group rounded-3xl border border-white/8 bg-white/4 p-5 transition hover:border-cyan-300/30 hover:bg-white/6"
              href={packet.href}
              key={packet.title}
              rel="noreferrer"
              target="_blank"
            >
                {content}
              </a>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security rails</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {securitySurfaces.map((surface) => {
            const isInternal = surface.href.startsWith("/");
            const content = (
              <>
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl border border-white/8 bg-black/25 p-3 text-fuchsia-200">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div className="text-base font-medium text-white">{surface.title}</div>
                </div>
                <p className="mt-3 text-sm leading-7 text-white/56">{surface.body}</p>
              </>
            );

            if (isInternal) {
              return (
                <Link
                  className="rounded-3xl border border-white/8 bg-white/4 p-5 transition hover:border-fuchsia-300/25 hover:bg-white/6"
                  href={surface.href}
                  key={surface.title}
                >
                  {content}
                </Link>
              );
            }

            return (
              <a
              className="rounded-3xl border border-white/8 bg-white/4 p-5 transition hover:border-fuchsia-300/25 hover:bg-white/6"
              href={surface.href}
              key={surface.title}
              rel="noreferrer"
              target="_blank"
            >
                {content}
              </a>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
