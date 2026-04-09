"use client";

import { useSiteUrls } from "@/lib/site-urls";

export function SiteFooter() {
  const { judgeViewUrl, liveSiteUrl } = useSiteUrls();

  return (
    <footer className="border-t border-white/8 bg-[#050816]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-10 text-sm text-white/55 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="max-w-2xl">
          PrivateDAO is a privacy-focused governance and treasury product on Solana with additive hardening, runtime evidence, and reviewer-ready proof surfaces.
        </div>
        <div className="flex flex-wrap gap-5">
          <a href={judgeViewUrl} target="_blank" rel="noreferrer" className="hover:text-white">
            Judge view
          </a>
          <a href="https://github.com/X-PACT/PrivateDAO/blob/main/docs/launch-trust-packet.generated.md" target="_blank" rel="noreferrer" className="hover:text-white">
            Launch trust packet
          </a>
          <a href="https://github.com/X-PACT/PrivateDAO/blob/main/docs/mainnet-blockers.md" target="_blank" rel="noreferrer" className="hover:text-white">
            Mainnet blockers
          </a>
          <a href="https://github.com/X-PACT/PrivateDAO" target="_blank" rel="noreferrer" className="hover:text-white">
            Repository
          </a>
          <a href={liveSiteUrl} target="_blank" rel="noreferrer" className="hover:text-white">
            Current live site
          </a>
        </div>
      </div>
    </footer>
  );
}
