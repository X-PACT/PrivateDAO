import Link from "next/link";
import { ArrowUpRight, ShieldCheck, Sparkles } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { zkMatrixHighlights } from "@/lib/site-data";

export function ZkMatrixSurface() {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <Card>
        <CardHeader>
          <CardTitle>PrivateDAO ZK matrix</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {zkMatrixHighlights.map((item, index) => (
            <div key={item.layer} className="rounded-3xl border border-white/8 bg-white/4 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl border border-white/8 bg-black/25 p-3 text-violet-200">
                      {index < 4 ? <Sparkles className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                    </div>
                    <div className="text-lg font-medium text-white">{item.layer}</div>
                  </div>
                  <div className="text-sm font-medium text-cyan-100">{item.state}</div>
                  <p className="text-sm leading-7 text-white/58">
                    <span className="text-white/78">Verifier path:</span> {item.verifier}
                  </p>
                  <p className="text-sm leading-7 text-white/58">
                    <span className="text-white/78">Boundary:</span> {item.boundary}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Why this matrix matters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-3xl border border-white/8 bg-white/4 p-5 text-sm leading-7 text-white/58">
            It separates live ZK capability from future work. That makes the reviewer story stronger and keeps the buyer/operator story honest.
          </div>
          <Link
            href="/documents/zk-capability-matrix"
            className="group block rounded-3xl border border-white/8 bg-white/4 p-5 transition hover:border-violet-300/25 hover:bg-white/6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-base font-medium text-white">Open curated ZK capability matrix</div>
                <p className="mt-3 text-sm leading-7 text-white/58">
                  Layer-by-layer truth-aligned matrix for proofs, anchors, attestation, `zk_enforced`, and verifier boundaries.
                </p>
              </div>
              <ArrowUpRight className="mt-1 h-4 w-4 text-violet-300 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </Link>
          <div className="rounded-3xl border border-white/8 bg-black/20 p-5 text-sm leading-7 text-white/58">
            This does not claim full on-chain verifier CPI, anonymous treasury execution, or a hidden tally replacement. It keeps those boundaries explicit.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
