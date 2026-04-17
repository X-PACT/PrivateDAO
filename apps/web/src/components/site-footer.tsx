"use client";

import { useState } from "react";
import Link from "next/link";
import { Download, MessageSquareMore, Youtube } from "lucide-react";

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
            PrivateDAO is a privacy-focused governance and treasury product on Solana with additive hardening, runtime evidence, and clear verification surfaces.
          </div>
          <div className="text-xs leading-6 text-white/44">
            Built with execution support from a multi-national technical team. Product direction, execution accountability, and external coordination are led by Fahd Kotb.
          </div>
        </div>
        <div className="flex flex-col gap-4 lg:items-end">
          <div className="flex flex-wrap items-center gap-5">
            <Link href="/start" className="hover:text-white">
              Start
            </Link>
            <Link href="/learn" className="hover:text-white">
              Learn
            </Link>
            <Link href="/services" className="hover:text-white">
              Services
            </Link>
            <Link href="/trust" className="hover:text-white">
              Trust
            </Link>
            <Link href="/story" className="hover:text-white">
              Story
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
          <Link href="/community" className="hover:text-white">
            Community
          </Link>
          <Link href="/documents" className="hover:text-white">
            Documents
          </Link>
          <Link href="/awards" className="hover:text-white">
            Awards
          </Link>
          <a href={judgeViewUrl} target="_blank" rel="noreferrer" className="hover:text-white">
            Verification view
          </a>
          <Link href="/documents/reviewer-fast-path" className="hover:text-white">
            Fast path
          </Link>
          <Link href="/documents/reviewer-telemetry-packet" className="hover:text-white">
            Telemetry packet
          </Link>
          <Link href="/documents/ownership-and-contact" className="hover:text-white">
            Leadership and contact
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
            href="/story"
            className="inline-flex items-center gap-2 rounded-full border border-violet-400/18 bg-violet-400/8 px-3 py-1.5 text-white/76 transition hover:border-violet-300/30 hover:text-white"
          >
            <Youtube className="h-4 w-4 text-violet-200" />
            <span>Story video</span>
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
            href="https://discord.gg/PbM8BC2A"
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
