"use client";
/* eslint-disable @next/next/no-img-element -- the footer uses the supplied static brand asset. */

import Link from "next/link";
import { Mail } from "lucide-react";
import { communityLinks } from "@/lib/site-data";

const companyLinks = [
  { href: "/contact", label: "Contact" },
  { href: "/thesis", label: "Thesis" },
  { href: "/whitepaper", label: "Whitepaper" },
  { href: "/token", label: "PDAO" },
] as const;

const productLinks = [
  { href: "/payroll", label: "Confidential Payroll" },
  { href: "/treasury", label: "Treasury Coordination" },
  { href: "/govern", label: "Private Governance" },
  { href: "/auctions", label: "Confidential Auctions" },
  { href: "/proof-workflows/blind-policy", label: "Blind Verification" },
  { href: "/products/record-verification", label: "Record Verification" },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-[#dce5f0] bg-white">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 text-sm text-[#5d6d82] sm:px-6 lg:grid-cols-[1.25fr_0.75fr_0.75fr_0.75fr] lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <img src="/assets/privatedao-brand-mark-20260918.jpeg" alt="PrivateDAO" width={42} height={42} className="h-10 w-10 rounded-full object-cover ring-1 ring-[#b9d8f2]" />
            <div className="text-lg font-semibold tracking-[-0.03em] text-[#10233f]">Private<span className="text-[#175cd3]">DAO</span></div>
          </div>
          <p className="mt-3 max-w-xl text-sm leading-7 text-[#5d6d82]">
            PrivateDAO helps organizations keep sensitive work private while making the outcome trusted and shareable.
          </p>
          <a
            href="/contact"
            className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#b9d8f2] bg-[#f1f8ff] px-4 py-2 text-sm font-semibold text-[#175cd3] transition hover:border-[#175cd3]"
          >
            <Mail className="h-4 w-4 text-[#175cd3]" />
            Contact sales
          </a>
        </div>

        <nav aria-label="Company footer links" className="grid gap-2">
          <div className="mb-2 text-[11px] uppercase tracking-[0.24em] text-[#7a8ba0]">Company</div>
          {companyLinks.map((item) =>
            item.href.startsWith("mailto:") ? (
                <a key={item.href} href={item.href} className="hover:text-[#175cd3]">
                {item.label}
              </a>
            ) : (
                <Link key={item.href} href={item.href} className="hover:text-[#175cd3]">
                {item.label}
              </Link>
            ),
          )}
        </nav>

        <nav aria-label="Product footer links" className="grid gap-2">
          <div className="mb-2 text-[11px] uppercase tracking-[0.24em] text-[#7a8ba0]">Products</div>
          {productLinks.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-[#175cd3]">
              {item.label}
            </Link>
          ))}
        </nav>

        <nav aria-label="Community footer links" className="grid gap-2">
          <div className="mb-2 text-[11px] uppercase tracking-[0.24em] text-[#7a8ba0]">Community</div>
          {communityLinks.map((item) => (
            <a key={item.href} href={item.href} target="_blank" rel="noreferrer" className="hover:text-[#175cd3]">
              {item.title}
            </a>
          ))}
        </nav>
      </div>
      <div className="border-t border-[#dce5f0] px-4 py-4 text-center text-xs leading-6 text-[#7a8ba0]">
        © PrivateDAO. Official product surfaces, deployment packaging, brand assets, and commercial use require written coordination through official PrivateDAO channels.
      </div>
    </footer>
  );
}
