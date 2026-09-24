import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, FileCheck2, LockKeyhole, Network, ShieldCheck, Users } from "lucide-react";

import { OperationsShell } from "@/components/operations-shell";
import { buttonVariants } from "@/components/ui/button";
import { buildRouteMetadata } from "@/lib/route-metadata";
import { contactEmails } from "@/lib/site-brand";
import { cn } from "@/lib/utils";

export const metadata: Metadata = buildRouteMetadata({
  title: "Security and Trust",
  description: "How PrivateDAO protects sensitive organizational work while keeping important outcomes reviewable and verifiable.",
  path: "/security",
  keywords: ["PrivateDAO security", "organizational privacy", "verifiable workflows", "enterprise trust"],
});

const principles = [
  { title: "Private by design", body: "Sensitive payroll, treasury, governance, and commercial information stays inside the workflow that needs it.", icon: LockKeyhole },
  { title: "Controlled by policy", body: "Organizations define who can prepare, approve, execute, and review each important action.", icon: Users },
  { title: "Verifiable by outcome", body: "A partner, auditor, or board can verify the result without receiving every private input behind it.", icon: ShieldCheck },
  { title: "Flexible underneath", body: "The workflow stays consistent while the appropriate wallet, provider, or network is selected behind the experience.", icon: Network },
] as const;

const workflow = [
  ["Define the boundary", "Choose the people, records, and decisions that should remain private."],
  ["Set the responsibility", "Apply approval rules so important actions have clear ownership."],
  ["Run the workflow", "Execute through the appropriate infrastructure without exposing internal context."],
  ["Share the evidence", "Give the right audience a scoped result that can be checked independently."],
] as const;

const evidence = [
  ["Security review", "Security assumptions, controls, and known boundaries for reviewers.", "/documents/security-review"],
  ["Threat model", "The risks PrivateDAO considers when protecting sensitive workflows.", "/documents/threat-model"],
  ["Verification model", "How a result can remain useful without publishing the source record.", "/proof-workflows"],
  ["Security contact", "Report a security concern directly to the PrivateDAO security team.", `mailto:${contactEmails.security}`],
] as const;

export default function SecurityPage() {
  return (
    <OperationsShell
      eyebrow="Security and trust"
      title="Privacy is valuable only when people can trust the outcome."
      description="PrivateDAO helps organizations keep sensitive work private while giving the people who matter a clear, reviewable reason to trust what happened."
      navigationMode="focused"
      badges={[{ label: "Private workflows", variant: "cyan" }, { label: "Policy-led control", variant: "violet" }, { label: "Verifiable outcomes", variant: "success" }]}
    >
      <section className="enterprise-card rounded-[24px] p-6 sm:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.12fr_0.88fr] lg:items-center">
          <div>
            <div className="commercial-eyebrow">The business case</div>
            <h2 className="mt-3 max-w-3xl text-3xl font-semibold tracking-[-0.03em] text-[#10233f] sm:text-4xl">Keep the work private. Keep the result accountable.</h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[#5d6d82]">Organizations should not have to publish salaries, bids, internal decisions, or financial context just to use modern infrastructure. PrivateDAO creates a controlled path from sensitive input to a result that the right people can verify.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/contact" className={cn(buttonVariants({ size: "sm" }))}>Discuss your workflow <ArrowRight className="ml-2 h-4 w-4" /></Link>
              <Link href="/thesis" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>Read the thesis</Link>
            </div>
          </div>
          <div className="rounded-[22px] border border-[#dce5f0] bg-[#f7f9fc] p-5 sm:p-6">
            <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#175cd3]">A trust model buyers can understand</div>
            <div className="mt-5 space-y-4">
              {["Private information", "Approved process", "Verifiable result"].map((label, index) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#175cd3] text-sm font-bold text-white">{index + 1}</span>
                  <span className="text-sm font-semibold text-[#10233f]">{label}</span>
                  {index < 2 && <div className="h-px flex-1 bg-[#c8d7e8]" />}
                </div>
              ))}
            </div>
            <p className="mt-5 border-t border-[#dce5f0] pt-4 text-sm leading-6 text-[#5d6d82]">The customer sees the business outcome. The supporting evidence remains available for the people responsible for review.</p>
          </div>
        </div>
      </section>

      <section>
        <div className="commercial-eyebrow">What security means here</div>
        <h2 className="mt-3 max-w-3xl text-2xl font-semibold text-[#10233f] sm:text-3xl">Security is part of the product promise, not a technical appendix.</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {principles.map(({ title, body, icon: Icon }) => (
            <article key={title} className="enterprise-card rounded-[20px] p-5 sm:p-6">
              <Icon className="h-5 w-5 text-[#175cd3]" aria-hidden="true" />
              <h3 className="mt-4 text-lg font-semibold text-[#10233f]">{title}</h3>
              <p className="mt-2 text-sm leading-7 text-[#5d6d82]">{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="enterprise-card rounded-[24px] p-6 sm:p-8">
        <div className="commercial-eyebrow">How a protected workflow works</div>
        <h2 className="mt-3 text-2xl font-semibold text-[#10233f] sm:text-3xl">One operating model across payroll, treasury, governance, bids, and verification.</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {workflow.map(([title, body], index) => (
            <div key={title} className="rounded-2xl border border-[#dce5f0] bg-[#f7f9fc] p-5">
              <div className="text-sm font-bold text-[#175cd3]">0{index + 1}</div>
              <h3 className="mt-4 text-base font-semibold text-[#10233f]">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#5d6d82]">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="enterprise-card rounded-[24px] p-6 sm:p-8">
          <div className="commercial-eyebrow">Built for serious work</div>
          <h2 className="mt-3 text-2xl font-semibold text-[#10233f]">For organizations entering Web3 and organizations already operating there.</h2>
          <p className="mt-4 text-sm leading-7 text-[#5d6d82]">PrivateDAO is designed for companies, institutions, financial teams, data providers, DAOs, and Web3 operators. A customer can begin with a familiar workflow and add blockchain capability only where it creates value.</p>
          <div className="mt-5 space-y-3 text-sm text-[#5d6d82]">
            {["A clearer approval boundary", "Less exposure of sensitive context", "Evidence that travels with the outcome"].map((item) => <div key={item} className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#175cd3]" aria-hidden="true" /><span>{item}</span></div>)}
          </div>
        </div>
        <div className="enterprise-card rounded-[24px] p-6 sm:p-8">
          <div className="commercial-eyebrow">Evidence and review</div>
          <h2 className="mt-3 text-2xl font-semibold text-[#10233f]">Inspect the evidence behind the promise.</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {evidence.map(([title, body, href]) => {
              const external = href.startsWith("mailto:");
              const content = <><FileCheck2 className="h-4 w-4 text-[#175cd3]" aria-hidden="true" /><span className="min-w-0"><span className="block text-sm font-semibold text-[#10233f]">{title}</span><span className="mt-1 block text-xs leading-5 text-[#5d6d82]">{body}</span></span><ArrowRight className="ml-auto h-4 w-4 shrink-0 text-[#175cd3]" aria-hidden="true" /></>;
              return external ? <a key={title} href={href} className="flex items-start gap-3 rounded-2xl border border-[#dce5f0] bg-[#f7f9fc] p-4 transition hover:border-[#175cd3]">{content}</a> : <Link key={title} href={href} className="flex items-start gap-3 rounded-2xl border border-[#dce5f0] bg-[#f7f9fc] p-4 transition hover:border-[#175cd3]">{content}</Link>;
            })}
          </div>
          <p className="mt-5 text-xs leading-6 text-[#718198]">PrivateDAO does not present this page as a certification or external audit statement. Buyers can request the evidence and security review appropriate to their workflow.</p>
        </div>
      </section>

      <section className="enterprise-card rounded-[24px] p-6 sm:p-8">
        <div className="commercial-eyebrow">Custody evidence</div>
        <h2 className="mt-3 text-2xl font-semibold text-[#10233f] sm:text-3xl">Current custody review stays linked to the active proposal.</h2>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-[#5d6d82]">
          The current Squads proposal index is 3. The recorded timelock release is 2026-05-27T02:25:39Z; open the proposal packet and cryptographic readiness ladder for the supporting evidence and remaining review boundaries.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/documents/squads-current-binary-upgrade-proposal-2026-05-25" className={cn(buttonVariants({ size: "sm" }))}>Open Squads proposal 3</Link>
          <Link href="/documents/mainnet-cryptographic-readiness-ladder-2026-05-25" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>Open readiness ladder</Link>
          <a href="https://api.privatedao.org/api/v1/readiness" target="_blank" rel="noreferrer" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>Open readiness JSON</a>
        </div>
        <p className="mt-4 text-xs leading-6 text-[#718198]">Squads proposal index 3 · release 2026-05-27T02:25:39Z. This is evidence navigation, not an external certification.</p>
      </section>

      <section className="rounded-[24px] bg-[#10233f] p-6 text-white sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#8db8ff]">Security conversation</div>
            <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">Start with the information your organization cannot afford to expose.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/70">Tell us whether the workflow is payroll, treasury, governance, procurement, verification, or an agent integration. We will map the privacy boundary and the evidence your reviewers need.</p>
          </div>
          <a href={`mailto:${contactEmails.security}?subject=PrivateDAO%20security%20review`} className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#10233f]">Contact security <ArrowRight className="ml-2 h-4 w-4" /></a>
        </div>
      </section>
    </OperationsShell>
  );
}
