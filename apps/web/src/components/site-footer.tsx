"use client";

import { useState } from "react";
import Link from "next/link";
import { Download, MessageSquareMore, Smartphone, Youtube } from "lucide-react";

import { androidApkDownloadUrl } from "@/lib/android-surface";
import { useSiteUrls } from "@/lib/site-urls";

export function SiteFooter() {
  const [showMore, setShowMore] = useState(false);
  const { judgeViewUrl, liveSiteUrl } = useSiteUrls();

  return (
    <footer className="border-t border-white/8 bg-[#050816]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-10 text-sm text-white/55 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="max-w-3xl space-y-2">
          <div>
            PrivateDAO is a privacy-focused governance and treasury product on Solana with additive hardening, runtime evidence, and reviewer-ready proof surfaces.
          </div>
          <div className="text-xs leading-6 text-white/44">
            Produced with execution support from a multi-national technical team. Product ownership, brand control, and commercialization rights remain solely with Fahd Kotb.
          </div>
        </div>
        <div className="flex flex-col gap-4 lg:items-end">
          <div className="flex flex-wrap items-center gap-5">
            <Link href="/start" className="hover:text-white">
              Start
            </Link>
            <Link href="/govern" className="hover:text-white">
              Govern
            </Link>
            <Link href="/live" className="hover:text-white">
              Live State
            </Link>
            <Link href="/trust" className="hover:text-white">
              Trust
            </Link>
          </div>
          <button
            type="button"
            className="text-left text-xs uppercase tracking-[0.24em] text-white/44 transition hover:text-white lg:hidden"
            onClick={() => setShowMore((current) => !current)}
          >
            {showMore ? "Hide more links" : "Show more links"}
          </button>
          <div className={showMore ? "flex flex-wrap items-center gap-5" : "hidden flex-wrap items-center gap-5 lg:flex"}>
          <Link href="/engage" className="hover:text-white">
            Engage
          </Link>
          <Link href="/community" className="hover:text-white">
            Community
          </Link>
          <Link href="/android" className="hover:text-white">
            Android
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
          <Link href="/documents/ownership-and-contact" className="hover:text-white">
            Ownership and contact
          </Link>
          <a href="https://github.com/X-PACT/PrivateDAO" target="_blank" rel="noreferrer" className="hover:text-white">
            Repository
          </a>
          <a href={liveSiteUrl} target="_blank" rel="noreferrer" className="hover:text-white">
            Current live site
          </a>
          <a
            href={androidApkDownloadUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-emerald-400/18 bg-emerald-400/8 px-3 py-1.5 text-white/76 transition hover:border-emerald-300/30 hover:text-white"
          >
            <Download className="h-4 w-4 text-emerald-200" />
            <span>Android APK</span>
          </a>
          <Link
            href="/android"
            className="inline-flex items-center gap-2 rounded-full border border-violet-400/18 bg-violet-400/8 px-3 py-1.5 text-white/76 transition hover:border-violet-300/30 hover:text-white"
          >
            <Smartphone className="h-4 w-4 text-violet-200" />
            <span>Android app</span>
          </Link>
          <a
            href="https://www.youtube.com/@privatedao"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-red-400/18 bg-red-400/8 px-3 py-1.5 text-white/76 transition hover:border-red-300/30 hover:text-white"
          >
            <Youtube className="h-4 w-4 text-red-300" />
            <span>YouTube</span>
          </a>
          <a
            href="https://discord.gg/bC76YEcpDa"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-cyan-400/18 bg-cyan-400/8 px-3 py-1.5 text-white/76 transition hover:border-cyan-300/30 hover:text-white"
          >
            <MessageSquareMore className="h-4 w-4 text-cyan-200" />
            <span>Discord</span>
          </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
