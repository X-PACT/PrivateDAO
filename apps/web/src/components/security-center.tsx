import { ArrowUpRight, LockKeyhole, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { securityTracks } from "@/lib/site-data";

export function SecurityCenter() {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <Card>
        <CardHeader>
          <CardTitle>Security architecture</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {securityTracks.map((track, index) => (
            <a
              key={track.title}
              href={track.href}
              rel="noreferrer"
              target="_blank"
              className="group rounded-3xl border border-white/8 bg-white/4 p-5 transition hover:border-fuchsia-300/25 hover:bg-white/6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl border border-white/8 bg-black/25 p-3 text-fuchsia-200">
                      {index < 2 ? <ShieldCheck className="h-4 w-4" /> : <LockKeyhole className="h-4 w-4" />}
                    </div>
                    <div className="text-lg font-medium text-white">{track.title}</div>
                  </div>
                  <Badge variant={track.status === "Pending external" ? "warning" : track.status === "Integrated" ? "cyan" : "success"}>
                    {track.status}
                  </Badge>
                  <p className="text-sm leading-7 text-white/56">{track.summary}</p>
                </div>
                <ArrowUpRight className="mt-1 h-4 w-4 text-fuchsia-300 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </a>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security posture</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="rounded-3xl border border-white/8 bg-white/4 p-5">
            <div className="text-[11px] uppercase tracking-[0.3em] text-emerald-300/70">What is live</div>
            <p className="mt-3 text-sm leading-7 text-white/58">
              Private governance, treasury execution, generated proof packets, V3 hardening proofs, reviewer bundle verification, and honest launch boundaries are already part of the repository surface.
            </p>
          </div>
          <div className="rounded-3xl border border-white/8 bg-white/4 p-5">
            <div className="text-[11px] uppercase tracking-[0.3em] text-cyan-300/70">What stays explicit</div>
            <p className="mt-3 text-sm leading-7 text-white/58">
              Mainnet custody, multisig ceremony, audit closure, and real-device runtime captures stay outside the claim boundary until they are evidenced and recorded.
            </p>
          </div>
          <div className="rounded-3xl border border-white/8 bg-white/4 p-5">
            <div className="text-[11px] uppercase tracking-[0.3em] text-fuchsia-300/70">Why it matters</div>
            <p className="mt-3 text-sm leading-7 text-white/58">
              The security story remains additive: protocol rails stay compatible while governance, settlement, and launch trust surfaces become stronger and more reviewable.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
