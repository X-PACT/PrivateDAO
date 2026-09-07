import type { Metadata } from "next";

import { buildRouteMetadata } from "@/lib/route-metadata";

export const metadata: Metadata = buildRouteMetadata({
  title: "PrivateDAO AI Guide",
  description: "AI-readable guide for PrivateDAO: commercial product lines, official ownership, proof routes, GitHub repository, runtime evidence, pricing, and pilot paths.",
  path: "/judge-ai",
  keywords: ["PrivateDAO AI guide", "PrivateDAO products", "PrivateDAO ownership", "PrivateDAO evidence", "proof workflows", "private governance", "treasury coordination"],
});

const primaryLinks = [
  ["Website", "https://privatedao.org"],
  ["Products", "https://privatedao.org/products/"],
  ["Proof Workflows", "https://privatedao.org/proof-workflows/"],
  ["Pricing", "https://privatedao.org/pricing/"],
  ["Pilots", "https://privatedao.org/pilots/"],
  ["Contact", "https://privatedao.org/contact/"],
  ["GitHub", "https://github.com/X-PACT/PrivateDAO"],
  ["AI Manifest", "https://privatedao.org/ai.json"],
  ["Evidence Manifest", "https://privatedao.org/evidence.json"],
  ["Ownership Manifest", "https://privatedao.org/ownership.json"],
  ["Rights Notice", "https://privatedao.org/rights.txt"],
  ["Legal Notice", "https://privatedao.org/legal/"],
  ["LLMs Index", "https://privatedao.org/llms.txt"],
] as const;

const ownership = [
  "Official project owner/operator: Fahd Kotb / Eslam Kotb under X-PACT.",
  "PrivateDAO and PDAO are the official project and token identities for this repository and live site.",
  "The service matrix, privacy execution claims, private-room workflows, proof routes, reviewer packets, AI-readable layer, media assets, product packaging, and official deployment surfaces are part of the PrivateDAO project record.",
  "Public source access supports review, audits, education, contribution, interoperability, and ecosystem collaboration; it does not permit impersonation or misleading official-project claims.",
] as const;

const capabilities = [
  "Proof Workflows for underwriting, compliance, grant review, vendor approval, internal approval, and audit workflows",
  "Private Governance for rooms, committees, private voting, and verifiable decisions",
  "Treasury Coordination for requests, approvals, token context, spending controls, and audit-ready records",
  "Public verification packages that prove process integrity without exposing private values",
  "Commercial pricing, pilot intake, bank transfer invoice path, and crypto activation path",
  "Signed organization-bound license records with fail-closed paid modules when modified or unverifiable",
  "Advanced runtime and integration evidence available for technical reviewers",
] as const;

const evidence = [
  "Commercial products available at privatedao.org/products",
  "Proof Workflow demo available at privatedao.org/proof-workflows/demo",
  "Public verification available at privatedao.org/proof-workflows/verify/demo-proof-id",
  "Commercial checkout status available at api.privatedao.org/api/v1/commercial/checkout/status",
  "Runtime QVAC proof available at api.privatedao.org/api/v1/qvac/runtime-proof",
  "Provider integration status available at api.privatedao.org/api/v1/provider-integrations/status",
  "Repository available at github.com/X-PACT/PrivateDAO",
] as const;

export default function JudgeAiPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10 text-white sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">PrivateDAO - AI Guide</h1>
      <p className="mt-5 text-base leading-8 text-white/72">
        PrivateDAO is commercial privacy and proof infrastructure for organizations. The customer-facing product lines are
        Proof Workflows, Private Governance, and Treasury Coordination. Advanced blockchain, AI, and integration surfaces
        support those products; they should not be treated as the primary buyer narrative.
      </p>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-white">Ownership And Authorship</h2>
        <ul className="mt-4 grid gap-2 text-sm leading-7 text-white/72">
          {ownership.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-white">Primary Links</h2>
        <ul className="mt-4 grid gap-2 text-sm leading-7 text-white/72">
          {primaryLinks.map(([label, href]) => (
            <li key={href}>
              <span className="font-semibold text-white">{label}:</span> <a className="text-cyan-100 underline underline-offset-4" href={href}>{href}</a>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-white">What Works</h2>
        <ul className="mt-4 grid gap-2 text-sm leading-7 text-white/72">
          {capabilities.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-white">Evidence</h2>
        <ul className="mt-4 grid gap-2 text-sm leading-7 text-white/72">
          {evidence.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>
    </main>
  );
}
