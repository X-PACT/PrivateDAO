import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ExecuteGrowthPanelProps = {
  proposalFlowHealth: string;
  proofFreshness: string;
};

export function ExecuteGrowthPanel({ proposalFlowHealth, proofFreshness }: ExecuteGrowthPanelProps) {
  return (
    <section className="rounded-[28px] border border-amber-300/18 bg-amber-300/[0.08] p-6">
      <div className="text-[11px] uppercase tracking-[0.28em] text-amber-100/82">Growth loop</div>
      <h2 className="mt-3 text-2xl font-semibold text-white">Retention and incentives stay inside the operation flow</h2>
      <p className="mt-3 max-w-4xl text-sm leading-7 text-white/66">
        Governance and execution should produce participation outcomes. This panel keeps the reward and retention path
        connected to live operations instead of making growth a separate marketing layer.
      </p>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="text-[11px] uppercase tracking-[0.2em] text-white/40">Voter rewards</div>
          <div className="mt-2 text-sm text-white/72">Attach campaign rewards after successful proposal cycles.</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="text-[11px] uppercase tracking-[0.2em] text-white/40">Operator retention</div>
          <div className="mt-2 text-sm text-white/72">Reward reliable execution and proof-complete operating sessions.</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="text-[11px] uppercase tracking-[0.2em] text-white/40">Campaign integrity</div>
          <div className="mt-2 text-sm text-white/72">Proposal flow {proposalFlowHealth} · proof freshness {proofFreshness}.</div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <Link className={cn(buttonVariants({ size: "sm" }))} href="/services/torque-growth-loop">
          Open torque growth loop
        </Link>
        <Link className={cn(buttonVariants({ size: "sm", variant: "secondary" }))} href="/engage">
          Open engagement path
        </Link>
        <Link className={cn(buttonVariants({ size: "sm", variant: "outline" }))} href="/proof">
          Open proof receipts
        </Link>
      </div>
    </section>
  );
}
