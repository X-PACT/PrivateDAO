"use client";

import Link from "next/link";
import { MessageSquareMore, Youtube } from "lucide-react";

import { useSiteUrls } from "@/lib/site-urls";

export function SiteFooter() {
  const { judgeViewUrl, liveSiteUrl } = useSiteUrls();

  return (
    <footer className="border-t border-white/8 bg-[#050816]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-10 text-sm text-white/55 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="max-w-2xl">
          PrivateDAO is a privacy-focused governance and treasury product on Solana with additive hardening, runtime evidence, and reviewer-ready proof surfaces.
        </div>
        <div className="flex flex-wrap items-center gap-5">
          <Link href="/community" className="hover:text-white">
            Community
          </Link>
          <Link href="/story" className="hover:text-white">
            Story video
          </Link>
          <a href={judgeViewUrl} target="_blank" rel="noreferrer" className="hover:text-white">
            Judge view
          </a>
          <Link href="/documents/launch-trust-packet" className="hover:text-white">
            Launch trust packet
          </Link>
          <Link href="/documents/mainnet-blockers" className="hover:text-white">
            Mainnet blockers
          </Link>
          <a href="https://github.com/X-PACT/PrivateDAO" target="_blank" rel="noreferrer" className="hover:text-white">
            Repository
          </a>
          <a href={liveSiteUrl} target="_blank" rel="noreferrer" className="hover:text-white">
            Current live site
          </a>
          <a
            href="https://www.youtube.com/@privatedao"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-red-400/18 bg-red-400/8 px-3 py-1.5 text-white/76 transition hover:border-red-300/30 hover:text-white"
          >
            <Youtube className="h-4 w-4 text-red-300" />
            <span>YouTube</span>
          </a>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/4 px-3 py-1.5 text-white/46">
            <MessageSquareMore className="h-4 w-4 text-cyan-200/80" />
            <span>Discord soon</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
