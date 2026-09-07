import Link from "next/link";
import { ArrowUpRight, BrainCircuit, Coins, Gavel, Layers3, WalletCards } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type LauncherAction = {
  label: string;
  href: string;
  primary?: boolean;
};

type LauncherService = {
  title: string;
  pain: string;
  outcome: string;
  intelligence: {
    checks: string[];
    route: string;
  };
  icon: typeof Gavel;
  actions: LauncherAction[];
};

const services: LauncherService[] = [
  {
    title: "Proof Workflows",
    pain: "Organizations need to prove decisions happened correctly, but exposing raw data creates privacy and compliance risk.",
    outcome: "Run underwriting, compliance, grant, vendor, and audit workflows with public proof and private values hidden.",
    intelligence: {
      checks: ["workflow summary", "risk explanation", "audit narrative", "tamper check"],
      route: "/settings/intelligence?focus=proof-workflows",
    },
    icon: Layers3,
    actions: [
      { label: "Run workflow demo", href: "/pilots/credit-decision-verification", primary: true },
      { label: "View proof", href: "/proof-workflows/verify/demo-proof-id" },
      { label: "Request pilot", href: "/pilots" },
    ],
  },
  {
    title: "Private Governance",
    pain: "Public vote counts, whale signals, and visible momentum influence members before the vote ends.",
    outcome: "Create proposals, run private voting, and reveal governance records with proof when the workflow completes.",
    intelligence: {
      checks: ["proposal risk", "treasury impact", "privacy mode", "historical outcomes"],
      route: "/intelligence?focus=governance",
    },
    icon: Gavel,
    actions: [
      { label: "Create VIP room", href: "/rooms/new" },
      { label: "Try private vote", href: "/try", primary: true },
      { label: "Open governance", href: "/govern" },
    ],
  },
  {
    title: "Private Auctions",
    pain: "Open bidding exposes price pressure and lets participants react before the decision is complete.",
    outcome: "Collect private offers, choose a winner fairly, and share a result that anyone can verify afterward.",
    intelligence: {
      checks: ["eligibility", "deadline", "result policy", "receipt check"],
      route: "/auctions",
    },
    icon: Gavel,
    actions: [
      { label: "Try private auction", href: "/auctions", primary: true },
      { label: "Request a pilot", href: "/pilots" },
    ],
  },
  {
    title: "Treasury Coordination",
    pain: "Treasury actions expose strategy, counterparties, and timing before the organization is ready.",
    outcome: "Route treasury requests through review, approval, execution, and audit records instead of informal chats.",
    intelligence: {
      checks: ["asset context", "price/oracle context", "route risk", "counterparty review"],
      route: "/intelligence?focus=treasury",
    },
    icon: Coins,
    actions: [
      { label: "Create treasury request", href: "/treasury", primary: true },
      { label: "Explore treasury token", href: "/services/pusd-stablecoin" },
      { label: "Treasury proof", href: "/proof/?judge=1" },
    ],
  },
];

const advancedModules = [
  {
    title: "Advanced Financial Modules",
    body: "Confidential payroll, encrypted payments, compensation, vesting, and private settlement rails.",
    href: "/payroll",
    icon: WalletCards,
  },
  {
    title: "Connect your systems",
    body: "API, SDK, security, evidence, and deployment guidance for teams connecting PrivateDAO to their systems.",
    href: "/services",
    icon: BrainCircuit,
  },
] as const;

export function ServiceLauncher({ compact = false }: { compact?: boolean }) {
  return (
    <section className="min-w-0 overflow-hidden rounded-[28px] border border-emerald-300/18 bg-[linear-gradient(135deg,rgba(20,241,149,0.12),rgba(0,194,255,0.08),rgba(153,69,255,0.10),rgba(3,7,18,0.96))] p-4 sm:p-6">
      <div className="flex min-w-0 flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-[0.24em] text-emerald-100/78">Choose a service to try</div>
          <h2 className="mt-3 max-w-4xl text-2xl font-semibold tracking-[-0.035em] text-white md:text-3xl">
            Choose the business process, then run the private workflow.
          </h2>
          <p className="mt-3 max-w-5xl text-sm leading-7 text-white/66">
            PrivateDAO starts with four clear paths: Verify, Govern, Decide, and Coordinate.
            Integrations support these products and stay out of the way until a team needs them.
          </p>
        </div>
        <Link href="/try" className={cn(buttonVariants({ size: "sm" }))}>
          Try the fastest flow
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <div className={cn("mt-5 grid gap-3", compact ? "lg:grid-cols-2" : "md:grid-cols-2 xl:grid-cols-3")}>
        {services.map((service) => {
          const Icon = service.icon;

          return (
            <article key={service.title} className="min-w-0 rounded-[22px] border border-white/10 bg-black/28 p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-2.5 text-emerald-100">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-semibold text-white">{service.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/58">{service.pain}</p>
                </div>
              </div>
              <div className="mt-4 rounded-2xl border border-cyan-300/14 bg-cyan-300/[0.07] p-3 text-sm leading-6 text-white/68">
                {service.outcome}
              </div>
              <div className="mt-3 rounded-2xl border border-violet-300/16 bg-violet-300/[0.08] p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-violet-100/78">
                    <BrainCircuit className="h-3.5 w-3.5" />
                    Intelligence before signing
                  </div>
                  <Link href={service.intelligence.route} className="text-xs font-medium text-cyan-100 underline underline-offset-4">
                    Review intelligence
                  </Link>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {service.intelligence.checks.map((check) => (
                    <span key={`${service.title}-${check}`} className="rounded-full border border-white/10 bg-black/24 px-2.5 py-1 text-xs text-white/64">
                      {check}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {service.actions.map((action) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    className={cn(buttonVariants({ size: "sm", variant: action.primary ? "default" : "outline" }))}
                  >
                    {action.label}
                  </Link>
                ))}
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-6 rounded-[24px] border border-white/10 bg-black/24 p-4">
        <div className="text-[11px] uppercase tracking-[0.24em] text-white/48">Advanced modules</div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {advancedModules.map((module) => {
            const Icon = module.icon;
            return (
              <Link key={module.title} href={module.href} className="rounded-[18px] border border-white/10 bg-white/[0.035] p-4 transition hover:border-cyan-200/24 hover:bg-white/[0.06]">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Icon className="h-4 w-4 text-cyan-100" />
                  {module.title}
                </div>
                <p className="mt-2 text-sm leading-6 text-white/58">{module.body}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
