"use client";

import { Button } from "@/components/ui/button";

type RuntimeTemplateSandboxProps = {
  latestAction: string;
  signature: string;
  status: string;
  explorerUrl: string;
  freshness: string;
};

export function RuntimeTemplateSandbox({
  latestAction,
  signature,
  status,
  explorerUrl,
  freshness,
}: RuntimeTemplateSandboxProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
      <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6">
        <div className="text-[11px] uppercase tracking-[0.28em] text-white/42">Runtime visibility</div>
        <h3 className="mt-3 text-xl font-semibold text-white">Show the post-signature truth, not a toast only</h3>
        <p className="mt-3 text-sm leading-7 text-white/62">
          This starter teaches the UI pattern. The values shown here are pulled from the generated Devnet evidence so
          the learner can open a real signature and see how PrivateDAO reports status, freshness, and verification.
        </p>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <div className="rounded-[24px] border border-cyan-300/16 bg-cyan-300/[0.08] p-4 text-sm leading-7 text-white/68">
            <div className="text-[11px] uppercase tracking-[0.22em] text-cyan-100/78">Freshness</div>
            <div className="mt-2 text-white">{freshness}</div>
          </div>
          <div className="rounded-[24px] border border-white/8 bg-black/20 p-4 text-sm leading-7 text-white/68">
            <div className="text-[11px] uppercase tracking-[0.22em] text-white/42">Explorer link</div>
            <a className="mt-2 inline-flex text-cyan-200 transition hover:text-cyan-100" href={explorerUrl} target="_blank" rel="noreferrer">
              Open the current signature
            </a>
          </div>
        </div>
      </div>
      <div className="rounded-[30px] border border-white/10 bg-black/20 p-4">
        <section className="grid gap-4 rounded-[20px] bg-[#081420] p-6 text-[#e0f0ff]">
          <div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-white/70">Runtime activity starter</div>
            <h2 className="mt-2 text-2xl font-semibold text-white">Show what happened after the wallet action</h2>
          </div>
          <div className="rounded-2xl bg-[#0c1e30] p-4">
            <div>Latest action: {latestAction}</div>
            <div className="mt-2 break-all font-mono text-sm">Signature: {signature}</div>
            <div className="mt-2">Status: {status}</div>
          </div>
          <p className="text-sm leading-7 text-white/80">
            A real Solana product cannot stop at a toast. It must expose hashes, status, and the next verification step
            in one visible widget.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button type="button" size="sm" onClick={() => window.open(explorerUrl, "_blank", "noopener,noreferrer")}>
              Verify on-chain
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
