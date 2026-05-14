import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const endpoints = [
  ["Health", "https://api.privatedao.org/api/v1/magicblock/health"],
  ["Challenge", "https://api.privatedao.org/api/v1/magicblock/challenge?pubkey=B3STL1akxLGLvPpKd6Grz19jjVySkWrGgHFwGNK8yEZ"],
  ["Payments API", "https://payments.magicblock.app/health"],
];

const flow = [
  "public balance read",
  "challenge",
  "wallet signs message",
  "login bearer token",
  "private balance read",
  "unsigned deposit/transfer/withdraw transaction",
  "wallet signs and submits",
];

export function MagicBlockPrivatePaymentsStatus() {
  return (
    <section className="rounded-[28px] border border-sky-300/16 bg-sky-300/[0.07] p-6">
      <div className="text-[11px] uppercase tracking-[0.28em] text-sky-100/78">MagicBlock Private Payments</div>
      <div className="mt-3 grid gap-6 lg:grid-cols-[1fr_0.85fr]">
        <div>
          <h2 className="text-2xl font-semibold text-white">Private Payments API is wired with the correct auth boundary</h2>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-white/66">
            PrivateDAO now exposes MagicBlock health and challenge initiation through the read-node while preserving the
            required wallet-signed login step. Private balance reads are not fetched anonymously because MagicBlock
            requires the challenge/login bearer token for private state.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/viewer/magicblock/private-payments-live-probe.generated" className={cn(buttonVariants({ size: "sm" }))}>
              Open MagicBlock live probe
            </Link>
            {endpoints.map(([label, href]) => (
              <a key={label} href={href} className={cn(buttonVariants({ size: "sm", variant: label === "Health" ? "secondary" : "outline" }))}>
                {label}
              </a>
            ))}
          </div>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
          <div className="text-[11px] uppercase tracking-[0.22em] text-white/44">Execution shape</div>
          <div className="mt-3 space-y-2">
            {flow.map((step, index) => (
              <div key={step} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white/70">
                <span className="flex h-6 w-6 items-center justify-center rounded-full border border-white/10 font-mono text-[11px] text-white/56">
                  {index + 1}
                </span>
                {step}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
