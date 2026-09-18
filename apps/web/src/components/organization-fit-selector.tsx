"use client";

import Link from "next/link";
import { ArrowUpRight, Building2, Landmark, LineChart, Users } from "lucide-react";
import { useState } from "react";

type Fit = {
  id: string;
  label: string;
  icon: typeof Users;
  title: string;
  body: string;
  path: string;
  pathLabel: string;
};

const fits: readonly Fit[] = [
  { id: "five", label: "5 people", icon: Users, title: "Start with one workflow your team can trust.", body: "A focused starting point for payroll, approvals, or a sensitive record that should not become public.", path: "/payroll", pathLabel: "Start with payroll" },
  { id: "ten", label: "10 people", icon: Building2, title: "Give a growing team one clear control path.", body: "Bring finance, operations, and leadership into the same private process with responsibilities that are easy to follow.", path: "/treasury", pathLabel: "Explore treasury" },
  { id: "more", label: "50+ people", icon: Building2, title: "Make repeatable work safer at organizational scale.", body: "Standardize approvals, payments, bids, and evidence without exposing every internal detail to every participant.", path: "/products", pathLabel: "See the solutions" },
  { id: "government", label: "Government", icon: Landmark, title: "Balance public confidence with protected operations.", body: "Keep sensitive inputs private while publishing outcomes citizens, boards, and auditors can check.", path: "/govern", pathLabel: "Explore governance" },
  { id: "markets", label: "Financial markets", icon: LineChart, title: "Protect commercial intent until the right moment.", body: "Coordinate bids, approvals, and settlement where timing, confidentiality, and evidence all matter.", path: "/auctions", pathLabel: "Explore auctions" },
];

export function OrganizationFitSelector() {
  const [activeId, setActiveId] = useState(fits[0].id);
  const active = fits.find((fit) => fit.id === activeId) ?? fits[0];
  const Icon = active.icon;

  return (
    <section className="organization-fit-section mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28" aria-labelledby="organization-fit-title">
      <div className="max-w-3xl"><div className="commercial-eyebrow">Built for your organization</div><h2 id="organization-fit-title" className="commercial-section-title mt-4">Start with the people and decisions that matter most.</h2><p className="commercial-section-lead mt-5">Choose the closest fit and find a simple first use for privacy without losing confidence in the result.</p></div>
      <div className="organization-fit-tabs mt-9" role="tablist" aria-label="Organization size and type">
        {fits.map((fit) => { const FitIcon = fit.icon; const selected = fit.id === active.id; return <button key={fit.id} type="button" role="tab" aria-selected={selected} onClick={() => setActiveId(fit.id)} className={`organization-fit-tab ${selected ? "is-active" : ""}`}><FitIcon className="h-4 w-4" />{fit.label}</button>; })}
      </div>
      <div className="organization-fit-result"><div className="organization-fit-copy"><div className="organization-fit-icon"><Icon className="h-5 w-5" /></div><div className="solution-group-label">A practical first step</div><h3>{active.title}</h3><p>{active.body}</p><Link href={active.path} className="commercial-text-link">{active.pathLabel} <ArrowUpRight className="h-4 w-4" /></Link></div><div className="organization-fit-note"><span className="organization-fit-note-line" /><span>Your team starts with a familiar business task. PrivateDAO keeps the technical choices out of the way until they are needed.</span></div></div>
    </section>
  );
}
