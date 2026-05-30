"use client";

import Link from "next/link";
import { Download, MessageSquareMore, Rocket, Send, Trophy, Youtube } from "lucide-react";

import { androidApkDownloadUrl } from "@/lib/android-surface";
import { communityLinks } from "@/lib/site-data";
import { useSiteUrls } from "@/lib/site-urls";
import { useI18n } from "@/components/i18n-provider";

const footerCommunityIconClass = "h-4 w-4";

function FooterCommunityIcon({ title }: { title: string }) {
  if (title === "YouTube") return <Youtube className={`${footerCommunityIconClass} text-red-300`} />;
  if (title === "Discord") return <MessageSquareMore className={`${footerCommunityIconClass} text-cyan-200`} />;
  if (title === "Colosseum") return <Trophy className={`${footerCommunityIconClass} text-amber-200`} />;
  if (title === "Superteam Earn") return <Rocket className={`${footerCommunityIconClass} text-emerald-200`} />;
  if (title === "Telegram") return <Send className={`${footerCommunityIconClass} text-sky-200`} />;
  if (title === "X") return <span className="text-sm font-black leading-none text-white">X</span>;
  return <MessageSquareMore className={`${footerCommunityIconClass} text-cyan-200`} />;
}

const primaryFooterLinks = [
  { href: "/judge", label: "Judge" },
  { href: "/govern", label: "Govern" },
  { href: "/treasury", label: "Treasury" },
  { href: "/proof", label: "Proof" },
  { href: "/android", label: "Android" },
  { href: "/api-status", label: "API Status" },
  { href: "/documents/governance-runtime-proof", label: "Runtime Proof" },
  { href: "/documents/pdao-token-surface", label: "PDAO Token" },
  { href: "/whitepaper", label: "Whitepaper" },
];

const secondaryFooterLinks = [
  { href: "/services", label: "Services" },
  { href: "/intelligence", label: "Intelligence" },
  { href: "/rpc-services", label: "RPC" },
  { href: "/documents/treasury-reviewer-packet", label: "Treasury Packet" },
  { href: "/documents/canonical-custody-proof", label: "Custody Proof" },
  { href: "/documents/privacy-and-encryption-proof-guide", label: "Privacy Proof" },
  { href: "/legal", label: "Legal" },
];

export function SiteFooter() {
  const { judgeViewUrl, liveSiteUrl } = useSiteUrls();
  const { copy } = useI18n();

  return (
    <footer className="border-t border-white/8 bg-[#050816]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-10 text-sm text-white/55 sm:px-6 lg:flex-row lg:items-start lg:justify-between lg:px-8">
        <div className="max-w-3xl space-y-2">
          <div>{copy.chrome.footerSummary}</div>
          <div className="text-xs leading-6 text-white/44">{copy.chrome.footerSupport}</div>
        </div>
        <div className="flex max-w-3xl flex-col gap-4 lg:items-end">
          <nav className="flex flex-wrap items-center gap-4 lg:justify-end">
            {primaryFooterLinks.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-white">
                {item.label}
              </Link>
            ))}
          </nav>
          <nav className="flex flex-wrap items-center gap-4 text-xs text-white/46 lg:justify-end">
            {secondaryFooterLinks.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-white">
                {item.label}
              </Link>
            ))}
            <a href={judgeViewUrl} target="_blank" rel="noreferrer" className="hover:text-white">
              {copy.chrome.verificationView}
            </a>
            <a href="https://github.com/X-PACT/PrivateDAO" target="_blank" rel="noreferrer" className="hover:text-white">
              {copy.chrome.repository}
            </a>
            <a href={liveSiteUrl} target="_blank" rel="noreferrer" className="hover:text-white">
              {copy.chrome.currentLiveSite}
            </a>
          </nav>
          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <a
              href={androidApkDownloadUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-emerald-400/18 bg-emerald-400/8 px-3 py-1.5 text-white/76 transition hover:border-emerald-300/30 hover:text-white"
            >
              <Download className="h-4 w-4 text-emerald-200" />
              <span>{copy.chrome.androidApk}</span>
            </a>
            {communityLinks.map((item) => (
              <a
                key={item.title}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                aria-label={item.title}
                className="inline-flex items-center gap-2 rounded-full border border-cyan-400/18 bg-cyan-400/8 px-3 py-1.5 text-white/76 transition hover:border-cyan-300/30 hover:text-white"
              >
                <FooterCommunityIcon title={item.title} />
                <span>{item.title === "Discord" ? copy.chrome.discord : item.title}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-white/8 px-4 py-4 text-center text-xs leading-6 text-white/42">
        © PrivateDAO. Core source remains open where the repository license applies. Brand, product design,
        documentation, digital evidence, and official deployments are reserved; official-looking derivative deployments,
        service packaging, or commercial use require written coordination through official PrivateDAO channels.
      </div>
    </footer>
  );
}
