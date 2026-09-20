import type { Metadata } from "next";
import { LockKeyhole, ShieldCheck, UserRound } from "lucide-react";

import { OperationsShell } from "@/components/operations-shell";
import { buildRouteMetadata } from "@/lib/route-metadata";

export const metadata: Metadata = buildRouteMetadata({
  title: "Privacy",
  description: "How PrivateDAO describes data handling, privacy boundaries, and public verification surfaces.",
  path: "/privacy",
  keywords: ["PrivateDAO privacy", "data handling", "privacy boundaries"],
});

const principles = [
  ["Sensitive inputs stay scoped", "PrivateDAO product workflows are designed to limit sensitive information to the people, services, and review scope required for that workflow.", LockKeyhole],
  ["Proof does not mean publication", "Verification surfaces may expose a claim, status, or outcome without exposing the original record or private organizational details.", ShieldCheck],
  ["You choose what to share", "Where a product supports selective disclosure, the organization decides the verification scope and whether a shared result expires or is revoked.", UserRound],
] as const;

export default function PrivacyPage() {
  return (
    <OperationsShell
      eyebrow="Privacy"
      title="Privacy without losing confidence."
      description="PrivateDAO is built around a simple boundary: sensitive organizational information should remain limited to the people and systems that need it, while the resulting work can still be checked."
      navigationMode="focused"
      badges={[{ label: "Privacy by design", variant: "cyan" }, { label: "Selective proof", variant: "success" }]}
    >
      <section className="grid gap-4 md:grid-cols-3">
        {principles.map(([title, body, Icon]) => (
          <article key={title} className="enterprise-card rounded-[20px] p-5">
            <Icon className="h-5 w-5 text-[#175cd3]" aria-hidden="true" />
            <h2 className="mt-4 text-base font-semibold text-[#10233f]">{title}</h2>
            <p className="mt-2 text-sm leading-7 text-[#5d6d82]">{body}</p>
          </article>
        ))}
      </section>

      <section className="enterprise-card rounded-[24px] p-6 sm:p-8">
        <div className="commercial-eyebrow">What we collect</div>
        <h2 className="mt-3 text-2xl font-semibold text-[#10233f]">Only what a requested interaction needs.</h2>
        <p className="mt-4 max-w-4xl text-sm leading-7 text-[#5d6d82]">The public website may receive information you submit through contact or product flows, such as your email address, organization details, workflow description, or technical request. Product runtimes may process workflow data needed to provide the requested operation. The exact data boundary depends on the product and configuration.</p>
        <p className="mt-4 max-w-4xl text-sm leading-7 text-[#5d6d82]">Do not submit passwords, seed phrases, private keys, or other credentials through public forms. Wallet and external-provider interactions are controlled by the relevant wallet or service interface.</p>
      </section>

      <section className="enterprise-card rounded-[24px] p-6 sm:p-8">
        <div className="commercial-eyebrow">Verification links and third parties</div>
        <h2 className="mt-3 text-2xl font-semibold text-[#10233f]">A public result is not the private source.</h2>
        <p className="mt-4 max-w-4xl text-sm leading-7 text-[#5d6d82]">A verification link may contain a public status, proof identifier, timestamp, scope, or network reference. It should not be used to publish employee records, private payroll details, confidential bids, or source documents. Integrations such as wallets, networks, hosting providers, and external protocols have their own systems and policies.</p>
      </section>

      <section className="rounded-[24px] border border-[#f0d6a6] bg-[#fffaf0] p-6">
        <div className="text-sm font-semibold text-[#6b4f1d]">Questions or data requests</div>
        <p className="mt-2 text-sm leading-7 text-[#7c6845]">For privacy questions about a PrivateDAO interaction, contact the project owner at <a className="font-semibold underline" href="mailto:fahd@privatedao.org">fahd@privatedao.org</a> and include the relevant public reference. Do not email private keys or seed phrases.</p>
      </section>
    </OperationsShell>
  );
}
