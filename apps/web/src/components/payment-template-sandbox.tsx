"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

type PaymentTemplateSandboxProps = {
  proofSignature: string;
  explorerUrl: string;
};

export function PaymentTemplateSandbox({
  proofSignature,
  explorerUrl,
}: PaymentTemplateSandboxProps) {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const submittedLabel = useMemo(
    () =>
      submitted
        ? "The payment request is staged. Continue into the live security and proof corridor to inspect the current Testnet evidence."
        : "Submit the starter request first, then open the proof lane or the production security route to continue.",
    [submitted],
  );

  return (
    <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
      <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6">
        <div className="text-[11px] uppercase tracking-[0.28em] text-white/42">Confidential operations</div>
        <h3 className="mt-3 text-xl font-semibold text-white">Explain privacy in normal language, then verify the result</h3>
        <p className="mt-3 text-sm leading-7 text-white/62">
          The sandbox teaches the operator-facing wording: what stays confidential, what becomes public, and where the
          reviewer should click next. The verification link below points to a real Testnet signature from the current
          payment evidence set.
        </p>
        <div className="mt-5 rounded-[24px] border border-white/8 bg-black/20 p-4 text-sm leading-7 text-white/68">
          <div className="text-[11px] uppercase tracking-[0.22em] text-white/42">Current proof reference</div>
          <div className="mt-2 break-all text-white">{proofSignature}</div>
          <a className="mt-3 inline-flex text-cyan-200 transition hover:text-cyan-100" href={explorerUrl} target="_blank" rel="noreferrer">
            Open Testnet payment evidence
          </a>
        </div>
        <div className="mt-5 rounded-[24px] border border-cyan-300/16 bg-cyan-300/[0.08] p-4 text-sm leading-7 text-white/68">
          <div className="text-[11px] uppercase tracking-[0.22em] text-cyan-100/78">Submission state</div>
          <div className="mt-2 text-white/70">{submittedLabel}</div>
        </div>
      </div>
      <div className="rounded-[30px] border border-white/10 bg-black/20 p-4">
        <section className="grid gap-4 rounded-[20px] bg-[#081420] p-6 text-[#e0f0ff]">
          <div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-white/70">Private payment starter</div>
            <h2 className="mt-2 text-2xl font-semibold text-white">Explain privacy and proof in user language</h2>
          </div>
          <div className="rounded-2xl bg-[#0c1e30] p-4">
            <div>Amount: 12.50 USDC equivalent on the agentic treasury rail</div>
            <div className="mt-2">Execution rail: REFHE privacy boundary + MagicBlock execution corridor</div>
            <div className="mt-2">Visibility: Recipient, intent, and payout posture stay confidential until the proof lane is opened.</div>
          </div>
          <p className="text-sm leading-7 text-white/80">
            This starter shows how to explain what remains confidential, what becomes public, and where the reviewer
            can verify the result without exposing the user to cryptographic jargon.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button type="button" size="sm" onClick={() => setSubmitted(true)}>
              Submit payment request
            </Button>
            <Button type="button" size="sm" variant="secondary" onClick={() => router.push("/proof?judge=1")}>
              Open proof route
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
