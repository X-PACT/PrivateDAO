import type { Metadata } from "next";

import { BreadcrumbJsonLd, JsonLd } from "@/components/seo-structured-data";
import { OperationsShell } from "@/components/operations-shell";
import { buildRouteMetadata } from "@/lib/route-metadata";
import { siteUrl } from "@/lib/site-brand";

export const metadata: Metadata = buildRouteMetadata({
  title: "Network Capabilities",
  description: "See how PrivateDAO describes network support honestly: by product capability and independent execution evidence, not by RPC reachability alone.",
  path: "/networks",
  image: "/assets/social/whitepaper.png",
  keywords: ["PrivateDAO networks", "network capability matrix", "Web3 infrastructure support", "testnet evidence"],
});

const principles = [
  ["Capability before branding", "A network appears in a product surface only when the relevant workflow can use it through a real adapter."],
  ["Health is not execution", "An RPC responding proves reachability. It does not prove that payroll, governance, auctions, or verification execute there."],
  ["Evidence stays current", "Product and network status should be read alongside the latest receipt, reconciliation, and verification evidence."],
] as const;

export default function NetworksPage() {
  return (
    <OperationsShell eyebrow="Build · Networks" title="Choose the workflow first. Confirm the execution path second." description="PrivateDAO is designed to keep network complexity behind the workflow while showing a truthful capability boundary to builders and reviewers." navigationMode="guided" badges={[{ label: "Evidence-first", variant: "success" }, { label: "Wallet-agnostic UX", variant: "cyan" }]}>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "TechArticle", headline: "PrivateDAO Network Capabilities", description: metadata.description, url: `${siteUrl}/networks/`, author: { "@type": "Organization", name: "PrivateDAO", url: siteUrl } }} />
      <BreadcrumbJsonLd items={[{ name: "PrivateDAO", path: "/" }, { name: "Network Capabilities", path: "/networks" }]} />
      <section className="grid gap-4 md:grid-cols-3">{principles.map(([title, body]) => <article key={title} className="enterprise-card rounded-[22px] p-5 sm:p-6"><h2 className="text-lg font-semibold text-[#10233f]">{title}</h2><p className="mt-3 text-sm leading-7 text-[#5d6d82]">{body}</p></article>)}</section>
      <section className="enterprise-card rounded-[24px] p-6 sm:p-8"><div className="commercial-eyebrow">Current boundary</div><h2 className="mt-3 text-2xl font-semibold text-[#10233f]">The customer does not need to memorize the infrastructure.</h2><p className="mt-4 max-w-4xl text-sm leading-7 text-[#5d6d82]">The commercial interface starts with the product and requirements. Developers can inspect the capability catalog and evidence surfaces before enabling a specific network lane. Unsupported or unverified paths remain clearly gated.</p></section>
    </OperationsShell>
  );
}
