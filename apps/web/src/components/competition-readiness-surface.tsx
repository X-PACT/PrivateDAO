import Link from "next/link";
import { ArrowUpRight, Award, CircleCheckBig, CircleDashed, TriangleAlert } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { competitionTracks } from "@/lib/site-data";

function fitTone(fit: string) {
  if (fit.toLowerCase().includes("very")) return "border-emerald-300/20 bg-emerald-300/10 text-emerald-100";
  if (fit.toLowerCase().includes("strong")) return "border-cyan-300/20 bg-cyan-300/10 text-cyan-100";
  if (fit.toLowerCase().includes("moderate")) return "border-amber-300/20 bg-amber-300/10 text-amber-100";
  return "border-white/10 bg-white/6 text-white/80";
}

function statusIcon(status: string) {
  const text = status.toLowerCase();
  if (text.includes("submission-ready")) return CircleCheckBig;
  if (text.includes("needs")) return TriangleAlert;
  return CircleDashed;
}

export function CompetitionReadinessSurface() {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      {competitionTracks.map((track) => {
        const StatusIcon = statusIcon(track.status);

        return (
          <Card key={track.title} className="h-full border-white/10 bg-[linear-gradient(180deg,rgba(12,16,30,0.92),rgba(8,10,22,0.98))]">
            <CardHeader className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.24em] ${fitTone(track.fit)}`}>
                  <Award className="h-3.5 w-3.5" />
                  {track.fit} fit
                </div>
                <a
                  href={track.sourceUrl}
                  rel="noreferrer"
                  target="_blank"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/8 bg-white/[0.04] text-white/60 transition hover:border-white/14 hover:bg-white/[0.08] hover:text-white"
                >
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
              <div className="space-y-2">
                <div className="text-[11px] uppercase tracking-[0.32em] text-emerald-300/72">{track.sponsor}</div>
                <CardTitle className="text-2xl">{track.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="rounded-3xl border border-white/8 bg-black/20 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-white">
                  <StatusIcon className="h-4 w-4 text-cyan-200" />
                  {track.status}
                </div>
                <p className="mt-3 text-sm leading-7 text-white/58">{track.summary}</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-white/8 bg-white/[0.04] p-4">
                  <div className="text-[11px] uppercase tracking-[0.24em] text-cyan-200/76">Edge</div>
                  <div className="mt-2 text-sm leading-7 text-white/60">{track.edge}</div>
                </div>
                <div className="rounded-3xl border border-white/8 bg-white/[0.04] p-4">
                  <div className="text-[11px] uppercase tracking-[0.24em] text-amber-200/76">Gap</div>
                  <div className="mt-2 text-sm leading-7 text-white/60">{track.gap}</div>
                </div>
                <div className="rounded-3xl border border-white/8 bg-white/[0.04] p-4">
                  <div className="text-[11px] uppercase tracking-[0.24em] text-emerald-300/76">Next action</div>
                  <div className="mt-2 text-sm leading-7 text-white/60">{track.action}</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href={track.href}
                  className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.22em] text-cyan-100 transition hover:bg-cyan-300/14"
                >
                  Open relevant surface
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
                <a
                  href={track.sourceUrl}
                  rel="noreferrer"
                  target="_blank"
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-xs font-medium uppercase tracking-[0.22em] text-white/72 transition hover:bg-white/10"
                >
                  Open track source
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
