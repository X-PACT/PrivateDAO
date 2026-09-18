"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Building2, Landmark, Users, WalletCards } from "lucide-react";

type Fit = {
  id: string;
  label: string;
  icon: typeof Users;
  title: string;
  body: string;
  solutions: readonly [string, string][];
};

const fits: readonly Fit[] = [
  {
    id: "small-team",
    label: "5-10 people",
    icon: Users,
    title: "A small team with work that should stay private.",
    body: "Start with one workflow and give the people involved a clear way to prepare, approve, and share the result.",
    solutions: [["Confidential Payroll", "/payroll"], ["Private Governance", "/govern"], ["Record Verification", "/products/record-verification"]],
  },
  {
    id: "growing-org",
    label: "10+ people",
    icon: Building2,
    title: "A growing organization that needs repeatable control.",
    body: "Bring finance, operations, and leadership into one policy-led process without exposing every internal detail.",
    solutions: [["Treasury Coordination", "/treasury"], ["Confidential Payroll", "/payroll"], ["Blind Verification", "/proof-workflows/blind-policy"]],
  },
  {
    id: "public-institution",
    label: "Government or institution",
    icon: Landmark,
    title: "A public institution balancing transparency with confidentiality.",
    body: "Protect sensitive inputs while publishing outcomes that citizens, boards, auditors, and partners can check.",
    solutions: [["Private Governance", "/govern"], ["Record Verification", "/products/record-verification"], ["Confidential Auctions", "/auctions"]],
  },
  {
    id: "financial-market",
    label: "Financial market",
    icon: WalletCards,
    title: "A market workflow where timing and information matter.",
    body: "Coordinate bids, approvals, and settlement without revealing commercial intent before the right moment.",
    solutions: [["Confidential Auctions", "/auctions"], ["Private Treasury", "/treasury"], ["Blind Verification", "/proof-workflows/blind-policy"]],
  },
];

export function OrganizationFitSelector() {
  const [activeId, setActiveId] = useState(fits[0].id);
  const active = fits.find((fit) => fit.id === activeId) ?? fits[0];
  const Icon = active.icon;

  return (
    <section className="space-y-6" aria-labelledby="organization-fit-title">
      <div className="max-w-3xl">
        <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#175cd3]">Find your starting point</div>
        <h2 id="organization-fit-title" className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[#10233f] sm:text-5xl">Privacy looks different at every scale.</h2>
        <p className="mt-4 text-base leading-8 text-[#5d6d82]">Choose the organization you are building. PrivateDAO will show the clearest first workflow.</p>
      </div>
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Organization type">
        {fits.map((fit) => {
          const FitIcon = fit.icon;
          const selected = fit.id === active.id;
          return <button key={fit.id} type="button" role="tab" aria-selected={selected} onClick={() => setActiveId(fit.id)} className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition ${selected ? "border-[#175cd3] bg-[#175cd3] text-white shadow-[0_6px_18px_rgba(23,92,211,0.2)]" : "border-[#dce5f0] bg-white text-[#425570] hover:border-[#175cd3] hover:text-[#175cd3]"}`}><FitIcon className="h-4 w-4" />{fit.label}</button>;
        })}
      </div>
      <div className="enterprise-card grid gap-6 rounded-[20px] p-6 lg:grid-cols-[0.9fr_1.1fr] lg:p-8">
        <div><div className="flex items-center gap-3"><div className="rounded-[12px] bg-[#edf4ff] p-2.5"><Icon className="h-5 w-5 text-[#175cd3]" /></div><div className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#175cd3]">Recommended path</div></div><h3 className="mt-5 text-2xl font-semibold tracking-[-0.03em] text-[#10233f]">{active.title}</h3><p className="mt-3 text-sm leading-7 text-[#5d6d82]">{active.body}</p><Link href="/contact" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#175cd3]">Talk through your workflow <ArrowRight className="h-4 w-4" /></Link></div>
        <div className="grid gap-3 sm:grid-cols-3">{active.solutions.map(([label, href]) => <Link key={label} href={href} className="group rounded-[16px] border border-[#dce5f0] bg-[#f7f9fc] p-4 transition hover:-translate-y-0.5 hover:border-[#175cd3]"><div className="flex items-start justify-between gap-2"><span className="text-sm font-semibold text-[#10233f]">{label}</span><ArrowRight className="h-4 w-4 shrink-0 text-[#175cd3] transition group-hover:translate-x-1" /></div><span className="mt-3 block text-xs leading-5 text-[#7a8ba0]">Open workflow</span></Link>)}</div>
      </div>
    </section>
  );
}
