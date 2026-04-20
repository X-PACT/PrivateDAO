"use client";

import Link from "next/link";
import { ArrowUpRight, ShieldCheck } from "lucide-react";

import { CustodySummaryInline } from "@/components/custody-summary-inline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trustLinks } from "@/lib/site-data";

export function TrustSurface() {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <Card>
        <CardHeader>
          <CardTitle>Reviewer and trust links</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {trustLinks.map((link) => {
            const isInternal = link.href.startsWith("/");
            const content = (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-base font-medium text-white">{link.title}</div>
                    <p className="mt-2 text-sm leading-7 text-white/56">{link.summary}</p>
                  </div>
                  <ArrowUpRight className="mt-1 h-4 w-4 text-cyan-300 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </>
            );

            if (isInternal) {
              return (
                <Link
                  key={link.title}
                  href={link.href}
                  className="group rounded-3xl border border-white/8 bg-white/4 p-5 transition hover:border-cyan-300/25 hover:bg-white/6"
                >
                  {content}
                </Link>
              );
            }

            return (
              <a
              key={link.title}
              href={link.href}
              rel="noreferrer"
              target="_blank"
              className="group rounded-3xl border border-white/8 bg-white/4 p-5 transition hover:border-cyan-300/25 hover:bg-white/6"
            >
                {content}
              </a>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Why this matters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <CustodySummaryInline />
          <div className="rounded-3xl border border-white/8 bg-white/4 p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-white/8 bg-black/25 p-3 text-emerald-200">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div className="text-base font-medium text-white">Recognition tied to evidence</div>
            </div>
            <p className="mt-3 text-sm leading-7 text-white/58">
              The awards surface should not be vanity-only. It should route judges, buyers, and operators directly into proof packets, trust surfaces, and production-readiness context.
            </p>
          </div>
          <div className="rounded-3xl border border-white/8 bg-white/4 p-5">
            <div className="text-[11px] uppercase tracking-[0.28em] text-white/40">Readiness discipline</div>
            <p className="mt-3 text-sm leading-7 text-white/58">
              This Next.js surface keeps the same discipline as the current site: Testnet proof is shown as current operating proof, preserved Devnet evidence stays separated as rehearsal history, and the remaining launch-critical work stays visible as the next readiness gate rather than hidden behind vague claims.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
