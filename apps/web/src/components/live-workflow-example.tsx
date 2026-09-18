import Link from "next/link";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";

type LiveWorkflowExampleProps = {
  compact?: boolean;
};

/** The old review videos are retired; the product surface now leads with a live workflow. */
export function LiveWorkflowExample({ compact = false }: LiveWorkflowExampleProps) {
  return (
    <section className="enterprise-card rounded-[24px] p-6 sm:p-8">
      <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#175cd3]">A live example</div>
      <h2 className="mt-3 text-2xl font-semibold text-[#10233f]">See the value in a workflow, not a video.</h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-[#5d6d82]">Choose a sensitive task, apply your organization&apos;s rules, approve the outcome, and share only the evidence the next person needs.</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {["Choose the private work", "Apply the right policy", "Share a trusted result"].map((step) => <div key={step} className="flex items-center gap-2 rounded-2xl border border-[#dce5f0] bg-[#f7f9fc] p-4 text-sm font-semibold text-[#10233f]"><CheckCircle2 className="h-4 w-4 shrink-0 text-[#175cd3]" />{step}</div>)}
      </div>
      {!compact ? <Link href="/products" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#175cd3]">Explore the workflows <ArrowUpRight className="h-4 w-4" /></Link> : null}
    </section>
  );
}
