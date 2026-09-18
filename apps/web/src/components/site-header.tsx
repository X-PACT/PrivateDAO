"use client";

import Link from "next/link";
import Image from "next/image";
import { LockKeyhole } from "lucide-react";

import { LanguageSwitcher } from "@/components/language-switcher";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/products", label: "Solutions" },
  { href: "/thesis", label: "Thesis" },
  { href: "/whitepaper", label: "Whitepaper" },
  { href: "/token", label: "PDAO" },
  { href: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[#dce5f0] bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="min-w-0">
          <div className="flex items-center gap-3">
            <Image unoptimized src="/assets/privatedao-brand-mark-20260918.jpeg" alt="PrivateDAO" width={40} height={40} className="h-10 w-10 rounded-full object-cover ring-1 ring-[#b9d8f2]" />
            <div className="whitespace-nowrap text-lg font-semibold tracking-[-0.03em] text-[#10233f] sm:text-2xl">
              Private<span className="text-[#175cd3]">DAO</span>
            </div>
          </div>
          <div className="mt-1 hidden items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-[#5d6d82] lg:flex">
            <LockKeyhole className="h-3.5 w-3.5 text-[#175cd3]" />
            <span>Private work. Trusted outcomes.</span>
          </div>
        </Link>

        <nav aria-label="Primary navigation" className="no-scrollbar flex min-w-0 items-center gap-1 overflow-x-auto">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className={cn(buttonVariants({ size: "sm", variant: "ghost" }), "shrink-0 px-2 text-[11px] text-[#425570] sm:px-3 sm:text-sm")}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden shrink-0 items-center gap-2 sm:flex">
          <LanguageSwitcher />
          <Link href="/contact" className={cn(buttonVariants({ size: "sm" }), "hidden lg:inline-flex")}>Talk to us</Link>
        </div>
      </div>
    </header>
  );
}
