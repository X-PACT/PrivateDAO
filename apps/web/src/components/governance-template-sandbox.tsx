"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";

type GovernanceTemplateSandboxProps = {
  recentSignature: string;
  recentExplorerUrl: string;
};

type StarterStatus = "Draft" | "Committed" | "Reveal ready" | "Execution ready";

export function GovernanceTemplateSandbox({
  recentSignature,
  recentExplorerUrl,
}: GovernanceTemplateSandboxProps) {
  const [status, setStatus] = useState<StarterStatus>("Draft");
  const lifecycleHint = useMemo(() => {
    if (status === "Draft") return "Start with a proposal, then commit the vote from the live corridor.";
    if (status === "Committed") return "The vote stays hidden until reveal. Continue into the reveal step when the window opens.";
    if (status === "Reveal ready") return "The vote can now be revealed and audited before execution.";
    return "The proposal is ready for final execution in the live Testnet route.";
  }, [status]);

  return (
    <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
      <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6">
        <div className="text-[11px] uppercase tracking-[0.28em] text-white/42">Lifecycle state</div>
        <h3 className="mt-3 text-xl font-semibold text-white">Practice the UI state, then run the real vote cycle</h3>
        <p className="mt-3 text-sm leading-7 text-white/62">
          This sandbox teaches the sequence. The real signatures still happen in Govern, where the connected wallet
          creates the proposal, commits the vote, reveals it later, and executes on Testnet.
        </p>
        <div className="mt-5 rounded-[24px] border border-cyan-300/16 bg-cyan-300/[0.08] p-4 text-sm leading-7 text-white/70">
          <div className="text-[11px] uppercase tracking-[0.22em] text-cyan-100/78">Current sandbox state</div>
          <div className="mt-2 text-white">{status}</div>
          <div className="mt-3 text-white/62">{lifecycleHint}</div>
        </div>
        <div className="mt-5 rounded-[24px] border border-white/8 bg-black/20 p-4 text-sm leading-7 text-white/68">
          <div className="text-[11px] uppercase tracking-[0.22em] text-white/42">Recent verified governance signature</div>
          <div className="mt-2 break-all text-white">{recentSignature}</div>
          <a
            className="mt-3 inline-flex text-sm text-cyan-200 transition hover:text-cyan-100"
            href={recentExplorerUrl}
            target="_blank"
            rel="noreferrer"
          >
            Open this transaction on Testnet
          </a>
        </div>
      </div>
      <div className="rounded-[30px] border border-white/10 bg-black/20 p-4">
        <section className="grid gap-4 rounded-[20px] bg-[#081420] p-6 text-[#e0f0ff]">
          <div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-white/70">Governance starter</div>
            <h2 className="mt-2 text-2xl font-semibold text-white">Confidential payroll release for verified contributors</h2>
          </div>
          <div className="rounded-2xl bg-[#0c1e30] p-4">
            <div className="text-[11px] uppercase tracking-[0.18em] text-white/70">Lifecycle state</div>
            <div className="mt-2 text-white">{status}</div>
          </div>
          <p className="text-sm leading-7 text-white/80">
            This starter is built for create, commit, reveal, and execute flows that stay readable to the user while
            preserving the signer boundary and privacy model.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button type="button" size="sm" onClick={() => setStatus("Committed")}>
              Commit vote
            </Button>
            <Button type="button" size="sm" variant="secondary" onClick={() => setStatus("Reveal ready")}>
              Reveal vote
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setStatus("Execution ready")}>
              Execute proposal
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
