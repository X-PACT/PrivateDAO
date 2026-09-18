import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ExternalLink, LockKeyhole, ShieldCheck } from "lucide-react";

import { OperationsShell } from "@/components/operations-shell";
import { buildRouteMetadata } from "@/lib/route-metadata";
import { siteUrl } from "@/lib/site-brand";

const TOKEN_ADDRESS = "9isGuumtaqvJeJeyLF44fvfskk2cv5mYsopexMBfpump";
const LOCK_ADDRESS = "3s5gg6upQXd4USTUQKdrWPBexEa2sZwzoD4P3HLA4tUK";
const PUMPFUN_URL = `https://pump.fun/coin/${TOKEN_ADDRESS}`;
const DEXSCREENER_URL = "https://dexscreener.com/solana/EZiPEFFGhvU7BmZTcsJxKFVw7Edby7KxN91fGfzpxHpz";
const STREAMFLOW_URL = `https://app.streamflow.finance/contract/solana/mainnet/${LOCK_ADDRESS}`;
const SOLSCAN_URL = `https://solscan.io/token/${TOKEN_ADDRESS}`;
const TELEGRAM_URL = "https://t.me/PrivateDAOO";
const X_URL = "https://x.com/privateDAOOS";
const DISCORD_URL = "https://discord.gg/PRcD9nFeVf";
const TOTAL_SUPPLY = "999,999,998 PDAO";
const LOCKED_AMOUNT = "34,429,079 PDAO";

export const metadata: Metadata = {
  ...buildRouteMetadata({
    title: "PDAO",
    description: "Official PDAO community token facts and official links.",
    path: "/token",
    keywords: ["PDAO", "PrivateDAO token", "PDAO contract address", "Solana token"],
  }),
  openGraph: {
    title: "PDAO | PrivateDAO",
    description: "Official PDAO community token facts and links.",
    url: "/token/",
    siteName: "PrivateDAO",
    type: "website",
    images: [{ url: `${siteUrl}/assets/token/pdao-token-logo.png`, width: 1024, height: 1024, alt: "PDAO" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "PDAO | PrivateDAO",
    description: "Official PDAO community token facts and links.",
    images: [`${siteUrl}/assets/token/pdao-token-logo.png`],
  },
};

const tokenJsonLd = {
  "@context": "https://schema.org",
  "@type": "Thing",
  name: "PDAO",
  alternateName: ["PrivateDAO community token"],
  identifier: TOKEN_ADDRESS,
  url: `${siteUrl}/token/`,
  image: `${siteUrl}/assets/token/pdao-token-logo.png`,
  sameAs: [PUMPFUN_URL, DEXSCREENER_URL, STREAMFLOW_URL, SOLSCAN_URL, TELEGRAM_URL, X_URL, DISCORD_URL],
  additionalProperty: [
    { "@type": "PropertyValue", name: "chain", value: "Solana" },
    { "@type": "PropertyValue", name: "contractAddress", value: TOKEN_ADDRESS },
    { "@type": "PropertyValue", name: "totalSupply", value: TOTAL_SUPPLY },
    { "@type": "PropertyValue", name: "developerLock", value: LOCKED_AMOUNT },
  ],
};

const facts = [
  ["Network", "Solana"],
  ["Contract address", TOKEN_ADDRESS],
  ["Decimals", "6"],
  ["Total supply", TOTAL_SUPPLY],
  ["Developer allocation", `${LOCKED_AMOUNT} locked until November 30, 2026`],
  ["Lock contract", LOCK_ADDRESS],
] as const;

const officialLinks = [
  ["Trading page", PUMPFUN_URL],
  ["Market overview", DEXSCREENER_URL],
  ["Streamflow lock", STREAMFLOW_URL],
  ["Solscan", SOLSCAN_URL],
  ["Telegram", TELEGRAM_URL],
  ["X", X_URL],
  ["Discord", DISCORD_URL],
] as const;

export default function TokenPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(tokenJsonLd) }} />
      <OperationsShell
        eyebrow="PDAO"
        title="The community asset around PrivateDAO."
        description="This page contains the official PDAO facts and links. PrivateDAO products remain the focus of the ecosystem; PDAO is presented here as a factual community asset, not as an investment promise."
        navigationMode="focused"
        badges={[
          { label: "Official facts", variant: "cyan" },
          { label: "Solana", variant: "success" },
          { label: "Community asset", variant: "violet" },
        ]}
      >
        <section className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
          <article className="enterprise-card rounded-[24px] p-6 sm:p-8">
            <div className="flex items-center gap-4"><Image unoptimized src="/assets/token/pdao-token-logo.png" alt="PDAO" width={72} height={72} className="h-16 w-16 rounded-2xl object-cover ring-1 ring-[#b9d8f2]" /><div><div className="text-3xl font-semibold tracking-[-0.04em] text-[#10233f]">PDAO</div><div className="mt-1 text-sm text-[#5d6d82]">PrivateDAO community token</div></div></div>
            <p className="mt-6 text-sm leading-7 text-[#5d6d82]">PDAO is connected to the PrivateDAO ecosystem and community. The commercial products are the focus: private payroll, treasury coordination, governance, auctions, and verification.</p>
            <div className="mt-6 flex flex-wrap gap-3"><a href={PUMPFUN_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#175cd3] px-5 py-3 text-sm font-semibold text-white">Open official market <ExternalLink className="h-4 w-4" /></a><a href={STREAMFLOW_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-[#dce5f0] px-5 py-3 text-sm font-semibold text-[#10233f]"><LockKeyhole className="h-4 w-4 text-[#175cd3]" /> View lock</a></div>
          </article>
          <section className="grid gap-3 sm:grid-cols-2">
            {facts.map(([label, value]) => <article key={label} className="enterprise-card rounded-[18px] p-5"><div className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#7a8ba0]">{label}</div><div className="mt-3 break-all text-sm font-semibold text-[#10233f]">{value}</div></article>)}
          </section>
        </section>

        <section className="enterprise-dark-panel rounded-[24px] bg-[#10233f] p-6 text-white sm:p-8">
          <div className="flex items-start gap-3"><ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-[#9fc7ff]" /><div><div className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#9fc7ff]">Keep the distinction clear</div><h2 className="mt-3 text-2xl font-semibold">Products create the value. The token page records the facts.</h2><p className="mt-3 max-w-3xl text-sm leading-7 text-[#d5e2f3]">PDAO does not guarantee price appreciation, profit, liquidity, exchange listings, or investment returns. Use the official links below for independent information.</p></div></div>
        </section>

        <section className="enterprise-card rounded-[24px] p-6 sm:p-8"><div className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#175cd3]">Official links</div><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{officialLinks.map(([label, href]) => <a key={label} href={href} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-[16px] border border-[#dce5f0] bg-[#f7f9fc] px-4 py-3 text-sm font-semibold text-[#10233f] transition hover:border-[#175cd3]">{label}<ExternalLink className="h-4 w-4 text-[#175cd3]" /></a>)}</div><Link href="/products" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#175cd3]">Explore PrivateDAO solutions <ArrowRight className="h-4 w-4" /></Link></section>
      </OperationsShell>
    </>
  );
}
