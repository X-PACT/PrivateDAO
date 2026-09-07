"use client";

import Link from "next/link";
import { Mail } from "lucide-react";
import { communityLinks } from "@/lib/site-data";

const companyLinks = [
  { href: "/security", label: "Security" },
  { href: "/compliance", label: "Compliance" },
  { href: "/pricing", label: "Pricing" },
  { href: "/enterprise", label: "Enterprise" },
  { href: "/pilots", label: "Request Pilot" },
  { href: "/contact", label: "Contact" },
] as const;

const productLinks = [
  { href: "/products/record-verification", label: "Record Verification" },
  { href: "/proof-workflows", label: "Proof Workflows" },
  { href: "/proof-workflows/blind-policy", label: "Blind Verification" },
  { href: "/govern", label: "Private Governance" },
  { href: "/treasury", label: "Treasury Coordination" },
  { href: "/auctions", label: "Sealed Auctions" },
  { href: "/token", label: "PDAO Ecosystem" },
] as const;

const developerLinks = [
  { href: "/developers", label: "Developers" },
  { href: "/documents", label: "Docs" },
  { href: "/matrix", label: "Capability Matrix" },
  { href: "/judge", label: "Evidence" },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-white/8 bg-[#050816]">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 text-sm text-white/58 sm:px-6 lg:grid-cols-[1.25fr_0.75fr_0.75fr_0.75fr] lg:px-8">
        <div>
          <div className="text-lg font-semibold text-white">PrivateDAO</div>
          <p className="mt-3 max-w-xl text-sm leading-7 text-white/58">
            Private decisions. Verifiable outcomes. Proof workflows, private governance, and treasury coordination
            for organizations that need privacy, accountability, and audit-ready verification.
          </p>
          <a
            href="/contact"
            className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-300/22 bg-emerald-300/[0.08] px-4 py-2 text-sm font-semibold text-white transition hover:border-emerald-200/45"
          >
            <Mail className="h-4 w-4 text-emerald-100" />
            Contact sales
          </a>
        </div>

        <nav aria-label="Company footer links" className="grid gap-2">
          <div className="mb-2 text-[11px] uppercase tracking-[0.24em] text-white/38">Company</div>
          {companyLinks.map((item) =>
            item.href.startsWith("mailto:") ? (
              <a key={item.href} href={item.href} className="hover:text-white">
                {item.label}
              </a>
            ) : (
              <Link key={item.href} href={item.href} className="hover:text-white">
                {item.label}
              </Link>
            ),
          )}
        </nav>

        <nav aria-label="Product footer links" className="grid gap-2">
          <div className="mb-2 text-[11px] uppercase tracking-[0.24em] text-white/38">Products</div>
          {productLinks.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-white">
              {item.label}
            </Link>
          ))}
        </nav>

        <nav aria-label="Developer footer links" className="grid gap-2">
          <div className="mb-2 text-[11px] uppercase tracking-[0.24em] text-white/38">Developers</div>
          {developerLinks.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-white">
              {item.label}
            </Link>
          ))}
        </nav>
        <nav aria-label="Community footer links" className="grid gap-2">
          <div className="mb-2 text-[11px] uppercase tracking-[0.24em] text-white/38">Community</div>
          {communityLinks.map((item) => (
            <a key={item.href} href={item.href} target="_blank" rel="noreferrer" className="hover:text-white">
              {item.title}
            </a>
          ))}
        </nav>
      </div>
      <div className="border-t border-white/8 px-4 py-4 text-center text-xs leading-6 text-white/42">
        © PrivateDAO. Official product surfaces, deployment packaging, brand assets, and commercial use require written coordination through official PrivateDAO channels.
      </div>
    </footer>
  );
}
