import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3, ExternalLink, LockKeyhole, ShieldCheck } from "lucide-react";

import { TokenBuyTerminal } from "@/components/token-buy-terminal";
import { JupiterPdaoPlugin } from "@/components/jupiter-pdao-plugin";
import { TokenMarketSnapshot } from "@/components/token-market-snapshot";
import { siteUrl } from "@/lib/site-brand";

const TOKEN_ADDRESS = "9isGuumtaqvJeJeyLF44fvfskk2cv5mYsopexMBfpump";
const LOCK_ADDRESS = "3s5gg6upQXd4USTUQKdrWPBexEa2sZwzoD4P3HLA4tUK";
const LOCK_ENDS_AT = "November 30, 2026";
const LOCKED_AMOUNT = "34,429,079 PDAO";
const TOKEN_DECIMALS = 6;
const SUPPLY_RAW = "999983437433758";
const TOTAL_SUPPLY = "999,983,437.433758 PDAO";
const CIRCULATING_SUPPLY = "965,554,358.433758 PDAO";
const CIRCULATING_SUPPLY_RAW = "965554358.433758";
const LOCKED_PERCENT = "3.44%";

const TELEGRAM_URL = "https://t.me/PrivateDAOO";
const X_URL = "https://x.com/privateDAOOS";
const DISCORD_URL = "https://discord.gg/PRcD9nFeVf";
const GITHUB_URL = "https://github.com/X-PACT/PrivateDAO";
const WHITEPAPER_URL = "https://privatedao.org/whitepaper/";
const INVESTORS_URL = "https://privatedao.org/investors/";
const DECK_URL = "https://privatedao.org/deck/";
const PRODUCTS_URL = "https://privatedao.org/products/";
const COLOSSEUM_URL = "https://arena.colosseum.org/projects/explore/praivatedao";
const SUPERTEAM_URL = "https://superteam.fun/earn/t/Private-dao-1";
const DEXSCREENER_URL = "https://dexscreener.com/solana/EZiPEFFGhvU7BmZTcsJxKFVw7Edby7KxN91fGfzpxHpz";
const GECKOTERMINAL_URL = "https://www.geckoterminal.com/solana/pools/EZiPEFFGhvU7BmZTcsJxKFVw7Edby7KxN91fGfzpxHpz";
const BIRDEYE_URL = `https://birdeye.so/solana/token/${TOKEN_ADDRESS}?tab=trades&trades_layout=table`;
const SOLSCAN_URL = `https://solscan.io/token/${TOKEN_ADDRESS}`;
const SOLANA_EXPLORER_URL = `https://explorer.solana.com/address/${TOKEN_ADDRESS}`;
const SOLANA_FM_URL = `https://solana.fm/address/${TOKEN_ADDRESS}`;
const SOLANA_TRACKER_URL = `https://www.solanatracker.io/tokens/${TOKEN_ADDRESS}`;
const RUGCHECK_URL = `https://rugcheck.xyz/tokens/${TOKEN_ADDRESS}`;
const DEXTOOLS_URL = "https://www.dextools.io/app/en/solana/pair-explorer/EZiPEFFGhvU7BmZTcsJxKFVw7Edby7KxN91fGfzpxHpz";
const GMGN_URL = `https://gmgn.ai/sol/token/${TOKEN_ADDRESS}`;
const JUPITER_SWAP_URL = `https://jup.ag/swap/SOL-${TOKEN_ADDRESS}`;
const JUPITER_PLUGIN_DOCS_URL = "https://dev.jup.ag/docs/tool-kits/plugin";
const JUPITER_STANDARD_SUBMIT_URL = `https://verified.jup.ag/tokens/submit?token=${TOKEN_ADDRESS}&tier=standard`;
const JUPITER_STANDARD_PACKET_URL = `${siteUrl}/vrfd-pdao-standard.json`;
const JUPITER_VERIFY_STATUS_URL = `https://token-verify-api.jup.ag/verifications/token/${TOKEN_ADDRESS}`;
const DEXSCREENER_EMBED_URL =
  "https://dexscreener.com/solana/EZiPEFFGhvU7BmZTcsJxKFVw7Edby7KxN91fGfzpxHpz?embed=1&theme=dark&trades=0&info=0";
const PUMPFUN_URL = `https://pump.fun/coin/${TOKEN_ADDRESS}`;
const STREAMFLOW_URL = `https://app.streamflow.finance/contract/solana/mainnet/${LOCK_ADDRESS}`;

const TOKEN_DESCRIPTION =
  "Official PrivateDAO community token page with live chart, contract address, Pump.fun trading link, and Streamflow developer allocation lock.";

export const metadata: Metadata = {
  title: "PDAO Community Token | PrivateDAO",
  description: TOKEN_DESCRIPTION,
  alternates: {
    canonical: "/token/",
  },
  robots: {
    index: true,
    follow: true,
  },
  keywords: [
    "PDAO token",
    "PrivateDAO token",
    "PrivateDAO community token",
    "Pump.fun",
    "Solana token",
    "PDAO chart",
    "PDAO contract address",
    "Streamflow lock",
    TOKEN_ADDRESS,
  ],
  openGraph: {
    title: "PDAO Community Token | PrivateDAO",
    description: TOKEN_DESCRIPTION,
    url: "/token/",
    siteName: "PrivateDAO",
    type: "website",
    images: [
      {
        url: `${siteUrl}/assets/token/pdao-token-logo.png`,
        width: 1024,
        height: 1024,
        alt: "PDAO community token",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PDAO Community Token | PrivateDAO",
    description: TOKEN_DESCRIPTION,
    images: [`${siteUrl}/assets/token/pdao-token-logo.png`],
  },
  other: {
    "token:name": "PrivateDAO",
    "token:symbol": "PDAO",
    "token:chain": "solana",
    "token:address": TOKEN_ADDRESS,
    "token:ca": TOKEN_ADDRESS,
    "token:mint": TOKEN_ADDRESS,
    "token:decimals": String(TOKEN_DECIMALS),
    "token:supply-raw": SUPPLY_RAW,
    "token:metadata": "/token.json",
    "token:chart": DEXSCREENER_URL,
    "token:geckoterminal": GECKOTERMINAL_URL,
    "token:birdeye": BIRDEYE_URL,
    "token:solscan": SOLSCAN_URL,
    "token:solana-explorer": SOLANA_EXPLORER_URL,
    "token:solana-fm": SOLANA_FM_URL,
    "token:solana-tracker": SOLANA_TRACKER_URL,
    "token:rugcheck": RUGCHECK_URL,
    "token:dextools": DEXTOOLS_URL,
    "token:gmgn": GMGN_URL,
    "token:jupiter-swap": JUPITER_SWAP_URL,
    "token:jupiter-plugin": JUPITER_PLUGIN_DOCS_URL,
    "token:jupiter-standard-vrfd": JUPITER_STANDARD_SUBMIT_URL,
    "token:vrfd-packet": "/vrfd-pdao-standard.json",
    "token:vrfd-status": "standard-basic-pending",
    "token:pumpfun": PUMPFUN_URL,
    "token:streamflow-lock": STREAMFLOW_URL,
    "token:lock-contract": LOCK_ADDRESS,
    "token:lock-until": "2026-11-30",
    "token:discord": DISCORD_URL,
    "token:x": X_URL,
    "token:telegram": TELEGRAM_URL,
    "token:circulating-supply": CIRCULATING_SUPPLY_RAW,
    "crypto:contractAddress": TOKEN_ADDRESS,
    "crypto:chain": "solana",
    "crawler:official-token-page": "true",
  },
};

const tokenJsonLd = {
  "@context": "https://schema.org",
  "@type": "Thing",
  name: "PDAO",
  alternateName: ["PrivateDAO Token", "PrivateDAO Community Token"],
  identifier: TOKEN_ADDRESS,
  description: TOKEN_DESCRIPTION,
  url: `${siteUrl}/token/`,
  image: `${siteUrl}/assets/token/pdao-token-logo.png`,
  sameAs: [
    PUMPFUN_URL,
    DEXSCREENER_URL,
    GECKOTERMINAL_URL,
    BIRDEYE_URL,
    SOLSCAN_URL,
    SOLANA_EXPLORER_URL,
    SOLANA_FM_URL,
    SOLANA_TRACKER_URL,
    RUGCHECK_URL,
    DEXTOOLS_URL,
    GMGN_URL,
    JUPITER_SWAP_URL,
    JUPITER_STANDARD_SUBMIT_URL,
    JUPITER_STANDARD_PACKET_URL,
    STREAMFLOW_URL,
    X_URL,
    TELEGRAM_URL,
    DISCORD_URL,
    GITHUB_URL,
    COLOSSEUM_URL,
    SUPERTEAM_URL,
  ],
  additionalProperty: [
    { "@type": "PropertyValue", name: "chain", value: "solana" },
    { "@type": "PropertyValue", name: "contractAddress", value: TOKEN_ADDRESS },
    { "@type": "PropertyValue", name: "mintAddress", value: TOKEN_ADDRESS },
    { "@type": "PropertyValue", name: "decimals", value: String(TOKEN_DECIMALS) },
    { "@type": "PropertyValue", name: "mintAuthority", value: "null" },
    { "@type": "PropertyValue", name: "freezeAuthority", value: "null" },
    { "@type": "PropertyValue", name: "launchpad", value: "pump.fun" },
    { "@type": "PropertyValue", name: "streamflowLockContract", value: LOCK_ADDRESS },
    { "@type": "PropertyValue", name: "lockedAmount", value: LOCKED_AMOUNT },
    { "@type": "PropertyValue", name: "unlockDate", value: "2026-11-30" },
    { "@type": "PropertyValue", name: "tokenMetadata", value: `${siteUrl}/token.json` },
    { "@type": "PropertyValue", name: "circulatingSupply", value: CIRCULATING_SUPPLY_RAW },
    { "@type": "PropertyValue", name: "jupiterVerificationMetadata", value: `${siteUrl}/token.json#jupiterVerification` },
    { "@type": "PropertyValue", name: "jupiterStandardVrfdStatus", value: "standard-basic-pending" },
    { "@type": "PropertyValue", name: "jupiterStandardVrfdPacket", value: JUPITER_STANDARD_PACKET_URL },
    { "@type": "PropertyValue", name: "longTermProjectSignal", value: "PrivateDAO is a long-running builder-led project with product, proof, repository, and investor surfaces." },
  ],
};

const facts = [
  ["Contract address", TOKEN_ADDRESS],
  ["Mint address", TOKEN_ADDRESS],
  ["Decimals", String(TOKEN_DECIMALS)],
  ["Mint / freeze authority", "null / null"],
  ["Developer lock", `${LOCKED_AMOUNT} locked until ${LOCK_ENDS_AT}`],
  ["Lock contract", LOCK_ADDRESS],
] as const;

const links = [
  ["Trade on Pump.fun", PUMPFUN_URL],
  ["Live chart", DEXSCREENER_URL],
  ["GeckoTerminal", GECKOTERMINAL_URL],
  ["Birdeye", BIRDEYE_URL],
  ["Solscan", SOLSCAN_URL],
  ["Solana Explorer", SOLANA_EXPLORER_URL],
  ["SolanaFM", SOLANA_FM_URL],
  ["Solana Tracker", SOLANA_TRACKER_URL],
  ["RugCheck", RUGCHECK_URL],
  ["DexTools", DEXTOOLS_URL],
  ["GMGN", GMGN_URL],
  ["Jupiter swap", JUPITER_SWAP_URL],
  ["Jupiter Plugin docs", JUPITER_PLUGIN_DOCS_URL],
  ["Jupiter Standard VRFD", JUPITER_STANDARD_SUBMIT_URL],
  ["Standard VRFD packet", JUPITER_STANDARD_PACKET_URL],
  ["Jupiter status API", JUPITER_VERIFY_STATUS_URL],
  ["Streamflow lock", STREAMFLOW_URL],
  ["X", X_URL],
  ["Telegram", TELEGRAM_URL],
  ["Discord", DISCORD_URL],
  ["GitHub", GITHUB_URL],
  ["Colosseum", COLOSSEUM_URL],
  ["Superteam", SUPERTEAM_URL],
  ["Whitepaper", WHITEPAPER_URL],
  ["Investors", INVESTORS_URL],
  ["Pitch deck", DECK_URL],
  ["Products", PRODUCTS_URL],
] as const;

const investorSignals = [
  ["Long-term builder signal", "PDAO is attached to PrivateDAO, a product-led privacy and proof infrastructure project, not a standalone token page."],
  ["Commercial product surface", "PrivateDAO already presents Proof Workflows, Private Governance, Treasury Coordination, and Sealed Auctions."],
  ["Public evidence", "GitHub, whitepaper, AI manifests, proof routes, and product pages are linked from the token surface."],
  ["Visible lock", "Developer allocation lock information is public through Streamflow until November 30, 2026."],
] as const;

const founderSignals = [
  ["Founder", "Fahd Kotb"],
  ["Official proof", "Superteam, Colosseum, GitHub, PrivateDAO investor page, and deck are linked publicly."],
  ["Alignment", "Developer allocation is locked through Streamflow until November 30, 2026."],
  ["Execution", "PrivateDAO has live product routes, public APIs, proof pages, and the PDAO token surface."],
] as const;

const tokenomics = [
  ["Community circulation", CIRCULATING_SUPPLY, "≈ 96.56% derived from the current on-chain mint supply minus the published Streamflow lock."],
  ["Developer allocation lock", LOCKED_AMOUNT, `${LOCKED_PERCENT} locked through Streamflow until ${LOCK_ENDS_AT}.`],
  ["Total supply", TOTAL_SUPPLY, "Read from the Solana mint supply with 6 decimals."],
  ["Mint / freeze authority", "null / null", "No mint authority and no freeze authority are shown on the official token page."],
] as const;

const utilityRoadmap = [
  ["Now", "Community discovery", "Official token page, live chart, metadata, Streamflow lock, and product links are active."],
  ["Phase 1", "Proof Workflow access", "PDAO can be used as a community access and activation layer around Proof Workflows and Blind Policy verification pilots."],
  ["Phase 2", "Private Governance and Rooms", "Token-gated rooms, community voting corridors, and private coordination access can be layered into PrivateDAO rooms."],
  ["Phase 3", "Sealed Auctions and Treasury", "Auction deposits, premium verification lanes, treasury coordination access, and product community benefits become the deeper utility path."],
] as const;

const productUtility = [
  ["Blind Policy Verification", "/proof-workflows/blind-policy", "Groth16 policy proofs that prove a private policy was satisfied without exposing policy inputs."],
  ["Proof Workflows", "/proof-workflows", "Decision and verification workflows for organizations that need public proof without private data leakage."],
  ["Sealed Auctions", "/auctions", "Public or private-room auctions where bidding intent remains hidden until reveal."],
  ["Payment Gate", "/payment-gate", "Solana wallet payment verification for paid access and community utilities."],
] as const;

export default function TokenPage() {
  return (
    <main className="min-h-screen bg-[#050612] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(tokenJsonLd),
        }}
      />
      <section className="mx-auto grid min-h-screen w-full max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[0.86fr_1.14fr] lg:px-8">
        <div className="flex flex-col justify-center">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-violet-200/18 bg-violet-300/[0.08] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-violet-100">
            Official community token
          </div>
          <h1 className="mt-5 text-5xl font-semibold tracking-[-0.055em] text-white sm:text-7xl">PDAO</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/68">
            PDAO is the PrivateDAO community token for the ecosystem around private decisions, proof workflows,
            treasury coordination, and verifiable organizational infrastructure.
          </p>

          <div className="mt-7 grid gap-3">
            {facts.map(([label, value]) => (
              <div key={label} className="rounded-[22px] border border-white/10 bg-white/[0.035] p-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/42">{label}</div>
                <div className="mt-2 break-all font-mono text-sm text-white/82">{value}</div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={PUMPFUN_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(90deg,#9945ff,#14f195,#00c2ff)] px-5 py-3 text-sm font-semibold text-[#050612]"
            >
              Open trading page
              <ExternalLink className="h-4 w-4" />
            </a>
            <a
              href={STREAMFLOW_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white"
            >
              View Streamflow lock
              <LockKeyhole className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="grid content-center gap-5">
          <TokenMarketSnapshot />
          <TokenBuyTerminal />
          <JupiterPdaoPlugin />

          <section className="overflow-hidden rounded-[30px] border border-cyan-300/14 bg-black/30 shadow-[0_24px_80px_rgba(0,194,255,0.12)]">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <BarChart3 className="h-4 w-4 text-cyan-100" />
                Live PDAO chart
              </div>
              <a href={DEXSCREENER_URL} target="_blank" rel="noreferrer" className="text-xs font-semibold text-cyan-100">
                DexScreener
              </a>
            </div>
            <iframe
              title="PDAO live chart"
              src={DEXSCREENER_EMBED_URL}
              className="h-[430px] w-full border-0 sm:h-[520px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </section>

          <section className="rounded-[26px] border border-emerald-300/16 bg-emerald-300/[0.055] p-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-100/76">
              Tokenomics
            </div>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.025em] text-white">
              Supply, lock, and authority facts.
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {tokenomics.map(([title, value, note]) => (
                <article key={title} className="rounded-2xl border border-white/10 bg-black/24 p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/42">{title}</div>
                  <div className="mt-2 break-words text-lg font-semibold text-white">{value}</div>
                  <p className="mt-2 text-sm leading-6 text-white/58">{note}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-[26px] border border-violet-300/16 bg-violet-300/[0.06] p-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-violet-100/76">
              Utility roadmap
            </div>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.025em] text-white">
              From community token to product utility.
            </h2>
            <div className="mt-4 grid gap-3">
              {utilityRoadmap.map(([phase, title, body]) => (
                <article key={phase} className="grid gap-3 rounded-2xl border border-white/10 bg-black/24 p-4 sm:grid-cols-[0.24fr_0.76fr]">
                  <div className="text-sm font-semibold text-violet-100">{phase}</div>
                  <div>
                    <div className="text-sm font-semibold text-white">{title}</div>
                    <p className="mt-1 text-sm leading-6 text-white/58">{body}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-[26px] border border-cyan-300/16 bg-cyan-300/[0.055] p-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-100/76">
              Product utility surface
            </div>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.025em] text-white">
              PDAO points back to real PrivateDAO products.
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {productUtility.map(([title, href, body]) => (
                <Link
                  key={href}
                  href={href}
                  className="rounded-2xl border border-white/10 bg-black/24 p-4 hover:border-cyan-200/32"
                >
                  <div className="text-sm font-semibold text-white">{title}</div>
                  <p className="mt-2 text-sm leading-6 text-white/58">{body}</p>
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-[26px] border border-emerald-300/16 bg-emerald-300/[0.055] p-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-100/76">
              Jupiter Standard VRFD
            </div>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.025em] text-white">
              Standard review is already pending.
            </h2>
            <p className="mt-3 text-sm leading-7 text-white/64">
              Jupiter public APIs report an existing Basic/Standard verification request and metadata update request for
              PDAO. Express verification is not used for this token path.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                ["Status", "standard-basic-pending"],
                ["Tier", "basic"],
                ["Submitted", "2026-06-22 23:39 UTC"],
              ].map(([label, value]) => (
                <article key={label} className="rounded-2xl border border-white/10 bg-black/24 p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/42">{label}</div>
                  <div className="mt-2 break-words text-sm font-semibold text-white">{value}</div>
                </article>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <a
                href={JUPITER_STANDARD_SUBMIT_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-black/24 px-4 py-2 text-sm font-semibold text-white"
              >
                Open Standard lane
                <ExternalLink className="h-4 w-4" />
              </a>
              <a
                href={JUPITER_STANDARD_PACKET_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-black/24 px-4 py-2 text-sm font-semibold text-white"
              >
                Open VRFD packet
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </section>

          <section className="grid gap-3 sm:grid-cols-3">
            {[
              ["Community", "Open community channels for token holders and PrivateDAO supporters."],
              ["Lock", "Developer allocation lock is linked publicly through Streamflow."],
              ["Product", "Token surface points back to the live PrivateDAO product, not empty token copy."],
            ].map(([title, body]) => (
              <article key={title} className="rounded-[22px] border border-white/10 bg-white/[0.035] p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <ShieldCheck className="h-4 w-4 text-emerald-100" />
                  {title}
                </div>
                <p className="mt-2 text-sm leading-6 text-white/58">{body}</p>
              </article>
            ))}
          </section>

          <section className="rounded-[26px] border border-violet-300/16 bg-violet-300/[0.06] p-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-violet-100/76">
              Long-term project signal
            </div>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.025em] text-white">
              Built around products, proof, and continuity.
            </h2>
            <p className="mt-3 text-sm leading-7 text-white/64">
              PDAO points back to a broader PrivateDAO ecosystem focused on private decisions, proof workflows, treasury
              coordination, sealed auctions, and verifiable organizational infrastructure.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {investorSignals.map(([title, body]) => (
                <article key={title} className="rounded-2xl border border-white/10 bg-black/24 p-4">
                  <div className="text-sm font-semibold text-white">{title}</div>
                  <p className="mt-2 text-sm leading-6 text-white/58">{body}</p>
                </article>
              ))}
            </div>
            <div className="mt-4 text-xs leading-6 text-white/42">
              Informational only. This page does not promise price appreciation, profit, liquidity, exchange listings, or
              investment returns.
            </div>
          </section>

          <section className="rounded-[26px] border border-emerald-300/16 bg-emerald-300/[0.055] p-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-100/76">
              Founder and long-term alignment
            </div>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.025em] text-white">
              Fahd Kotb is publicly tied to the product, repo, and ecosystem surfaces.
            </h2>
            <p className="mt-3 text-sm leading-7 text-white/64">
              PDAO is presented as the community token around a live PrivateDAO product ecosystem with public founder
              evidence, awards, product routes, GitHub history, Streamflow lock, and Jupiter Standard VRFD review.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {founderSignals.map(([title, body]) => (
                <article key={title} className="rounded-2xl border border-white/10 bg-black/24 p-4">
                  <div className="text-sm font-semibold text-white">{title}</div>
                  <p className="mt-2 text-sm leading-6 text-white/58">{body}</p>
                </article>
              ))}
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {[
                ["Superteam", SUPERTEAM_URL],
                ["Colosseum", COLOSSEUM_URL],
                ["GitHub", GITHUB_URL],
                ["Investors", INVESTORS_URL],
                ["Pitch deck", DECK_URL],
                ["Token metadata", "/token.json"],
              ].map(([label, href]) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noreferrer" : undefined}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/24 px-4 py-3 text-sm font-semibold text-white/76 hover:border-emerald-200/30 hover:text-white"
                >
                  {label}
                  <ExternalLink className="h-4 w-4" />
                </a>
              ))}
            </div>
            <div className="mt-4 text-xs leading-6 text-white/42">
              These are diligence and alignment signals, not financial advice or a promise of profit, listings, liquidity,
              or price performance.
            </div>
          </section>

          <section className="rounded-[26px] border border-white/10 bg-white/[0.035] p-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/42">
              Official links for crawlers and trading tools
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {links.map(([label, href]) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/24 px-4 py-3 text-sm font-semibold text-white/76 hover:border-cyan-200/30 hover:text-white"
                >
                  {label}
                  <ExternalLink className="h-4 w-4" />
                </a>
              ))}
            </div>
            <div className="mt-4 text-xs leading-6 text-white/42">
              Clean canonical route: <Link href="/token" className="text-cyan-100">privatedao.org/token</Link>. Legacy
              shared links with query parameters continue to load this same token surface.
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
