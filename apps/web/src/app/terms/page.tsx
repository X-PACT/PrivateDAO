import type { Metadata } from "next";
import Link from "next/link";

import { OperationsShell } from "@/components/operations-shell";
import { buildRouteMetadata } from "@/lib/route-metadata";

export const metadata: Metadata = buildRouteMetadata({
  title: "Terms",
  description: "General terms for using PrivateDAO public software surfaces, product demonstrations, and verification links.",
  path: "/terms",
  keywords: ["PrivateDAO terms", "software terms", "verification terms"],
});

const sections = [
  ["Use of the public site", "PrivateDAO provides public software pages, product interfaces, documentation, demonstrations, and verification surfaces. Use them lawfully and do not attempt to interfere with their operation, impersonate the project, or submit data you are not authorized to use."],
  ["Product availability", "Capabilities, networks, integrations, and product modes vary by route and environment. A page or demonstration is not a promise that every capability is available on every network or suitable for production use."],
  ["Verification results", "A verification result is limited to the claims, scope, timestamp, and evidence shown on its verification page. It is not a general warranty of the underlying organization, person, asset, or transaction."],
  ["External services and wallets", "Some workflows may connect to wallets, networks, hosting providers, or other external services. Those services operate under their own terms and availability. You remain responsible for confirming the destination, network, permissions, and information you submit before authorizing an external action."],
  ["No financial or legal advice", "PrivateDAO pages and product demonstrations are software and infrastructure information. They are not financial, tax, legal, accounting, investment, or compliance advice. Obtain advice appropriate to your organization before relying on a workflow for a regulated decision."],
  ["Intellectual property and contact", "PrivateDAO branding, product presentation, and project materials are maintained by Fahd Kotb unless a specific license or notice says otherwise. Questions about permitted use or these terms should be sent to fahd@privatedao.org."],
] as const;

export default function TermsPage() {
  return (
    <OperationsShell
      eyebrow="Terms"
      title="Clear boundaries for using PrivateDAO."
      description="These general terms describe the public website, software interfaces, product demonstrations, and verification links. They do not replace a signed commercial agreement for a specific engagement."
      navigationMode="focused"
      badges={[{ label: "Public software surfaces", variant: "cyan" }, { label: "Read before use", variant: "warning" }]}
    >
      <section className="grid gap-4 md:grid-cols-2">
        {sections.map(([title, body]) => (
          <article key={title} className="enterprise-card rounded-[20px] p-5">
            <h2 className="text-base font-semibold text-[#10233f]">{title}</h2>
            <p className="mt-3 text-sm leading-7 text-[#5d6d82]">{body}</p>
          </article>
        ))}
      </section>
      <section className="enterprise-card rounded-[24px] p-6 sm:p-8">
        <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#175cd3]">Questions</div>
        <h2 className="mt-3 text-2xl font-semibold text-[#10233f]">Need terms for a specific workflow?</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[#5d6d82]">Contact the project owner before relying on a product flow for an organization or external audience.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <a href="mailto:fahd@privatedao.org?subject=PrivateDAO%20terms" className="inline-flex rounded-full bg-[#175cd3] px-5 py-3 text-sm font-semibold text-white">Email fahd@privatedao.org</a>
          <Link href="/privacy" className="inline-flex rounded-full border border-[#c8d7e8] px-5 py-3 text-sm font-semibold text-[#175cd3]">Read privacy</Link>
        </div>
      </section>
    </OperationsShell>
  );
}
