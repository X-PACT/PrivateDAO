import type { Metadata } from "next";
import Link from "next/link";

import { buildRouteMetadata } from "@/lib/route-metadata";

export const metadata: Metadata = buildRouteMetadata({
  title: "Judges Fast Path",
  description:
    "Legacy judges URL that points reviewers to the canonical PrivateDAO verification route with live proof, integrations, awards, and runtime evidence.",
  path: "/judges",
  keywords: ["judges", "fast path", "verification", "PrivateDAO"],
  index: false,
});

export default function JudgesPage() {
  return (
    <main className="min-h-screen bg-[#05070d] px-6 py-16 text-white">
      <meta httpEquiv="refresh" content="0;url=/judge" />
      <section className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-black/30">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-200">Legacy judge route</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em]">PrivateDAO judge hub moved to one canonical route.</h1>
        <p className="mt-4 text-sm leading-7 text-slate-300">
          This archived reviewer URL now forwards to the live judge hub with the product walkthrough,
          track launch paths, encryption status, and Testnet proof.
        </p>
        <Link
          href="/judge"
          className="mt-6 inline-flex rounded-full bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white"
        >
          Open the judge hub
        </Link>
      </section>
    </main>
  );
}
