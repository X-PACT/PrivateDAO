import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Mail, Send } from "lucide-react";

import { OperationsShell } from "@/components/operations-shell";
import { buttonVariants } from "@/components/ui/button";
import { buildRouteMetadata } from "@/lib/route-metadata";
import { cn } from "@/lib/utils";

export const metadata: Metadata = buildRouteMetadata({
  title: "Contact",
  description:
    "Contact PrivateDAO for proof workflow pilots, private governance, treasury coordination, bank transfer invoices, crypto activation, and enterprise deployments.",
  path: "/contact",
  keywords: ["PrivateDAO contact", "PrivateDAO pilot", "PrivateDAO pricing", "PrivateDAO enterprise"],
});

const contacts = [
  {
    label: "Telegram",
    value: "@privateDAOOS",
    href: "https://t.me/privateDAOOS",
    icon: Send,
  },
  {
    label: "Founder Telegram",
    value: "@Fahdkotb",
    href: "https://t.me/Fahdkotb",
    icon: Send,
  },
  {
    label: "X",
    value: "@privateDAOOS",
    href: "https://x.com/privateDAOOS",
    icon: ArrowRight,
  },
  {
    label: "Primary email",
    value: "Fahd.kotb@tuta.io",
    href: "mailto:Fahd.kotb@tuta.io?subject=PrivateDAO%20commercial%20pilot",
    icon: Mail,
  },
  {
    label: "Business email",
    value: "Fahdkotb.8888@gmail.com",
    href: "mailto:Fahdkotb.8888@gmail.com?subject=PrivateDAO%20commercial%20pilot",
    icon: Mail,
  },
  {
    label: "Security / enterprise",
    value: "I.Kotb@proton.me",
    href: "mailto:I.Kotb@proton.me?subject=PrivateDAO%20enterprise%20or%20security",
    icon: Mail,
  },
] as const;

export default function ContactPage() {
  return (
    <OperationsShell
      eyebrow="Contact"
      title="Start a pilot, activate a plan, or request a private deployment."
      description="Use this page for proof workflow pilots, private governance rooms, treasury coordination, bank transfer invoices, crypto activation, and enterprise deployments."
      navigationMode="guided"
      badges={[
        { label: "Bank transfer", variant: "cyan" },
        { label: "Crypto activation", variant: "success" },
        { label: "Enterprise deployment", variant: "violet" },
      ]}
    >
      <section className="grid gap-4 lg:grid-cols-3">
        {[
          ["Request Pilot", "Map one real workflow, room, or treasury approval path and prove it with a public verification package.", "/pilots"],
          ["View Pricing", "Choose Starter, Business, Enterprise, fixed-scope pilot, or paid add-ons for intelligence and proof capacity.", "/pricing"],
          ["Security", "Review the encryption, data isolation, audit trail, infrastructure, and verification model before procurement.", "/security"],
        ].map(([title, body, href]) => (
          <Link key={title} href={href} className="rounded-[28px] border border-white/10 bg-white/[0.035] p-5 transition hover:border-cyan-200/35 hover:bg-cyan-300/[0.05]">
            <div className="text-base font-semibold text-white">{title}</div>
            <p className="mt-3 text-sm leading-7 text-white/62">{body}</p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-cyan-100">
              Open <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        ))}
      </section>

      <section className="rounded-[28px] border border-emerald-300/16 bg-emerald-300/[0.06] p-5 sm:p-6">
        <div className="text-[11px] uppercase tracking-[0.25em] text-emerald-100/76">Payment paths</div>
        <h2 className="mt-3 text-2xl font-semibold text-white">Bank transfer and crypto activation are both supported.</h2>
        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-black/22 p-4">
            <div className="text-sm font-semibold text-white">Bank transfer</div>
            <p className="mt-2 text-sm leading-6 text-white/62">
              Request an invoice and bank transfer instructions for pilots, monthly plans, or private deployment.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/22 p-4">
            <div className="text-sm font-semibold text-white">Crypto transfer</div>
            <p className="mt-2 text-sm leading-6 text-white/62">
              Activate from the pricing page using USDC, SOL, ETH, BTC, WBTC, ZEC, USDT, or DAI, then submit the transaction hash.
            </p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/pricing#commercial-checkout" className={cn(buttonVariants({ size: "sm" }))}>
            Open Activation
          </Link>
          <a href="mailto:Fahd.kotb@tuta.io?subject=PrivateDAO%20bank%20transfer%20invoice" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
            Request Invoice
          </a>
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-white/[0.035] p-5 sm:p-6">
        <div className="text-[11px] uppercase tracking-[0.25em] text-white/44">Official channels</div>
        <div className="mt-5 grid gap-3 lg:grid-cols-3">
          {contacts.map((contact) => {
            const Icon = contact.icon;
            return (
              <a key={contact.href} href={contact.href} className="rounded-2xl border border-white/10 bg-black/22 p-4 transition hover:border-cyan-200/35">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Icon className="h-4 w-4 text-cyan-100" />
                  {contact.label}
                </div>
                <div className="mt-2 break-all text-sm text-white/62">{contact.value}</div>
              </a>
            );
          })}
        </div>
      </section>
    </OperationsShell>
  );
}
