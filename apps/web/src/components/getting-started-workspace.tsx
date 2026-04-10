import Link from "next/link";
import { ArrowRight, CheckCircle2, Wallet } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buyerJourneySteps, gettingStartedActions, servicePacks, walletChoices } from "@/lib/site-data";
import { cn } from "@/lib/utils";

export function GettingStartedWorkspace() {
  return (
    <div className="space-y-8">
      <Card className="border-white/10 bg-[linear-gradient(135deg,rgba(20,241,149,0.09),rgba(153,69,255,0.11),rgba(0,194,255,0.08))]">
        <CardContent className="grid gap-8 p-6 lg:grid-cols-[1.1fr_0.9fr] lg:p-8">
          <div className="space-y-5">
            <Badge variant="success">Built for a normal user first-run</Badge>
            <div className="space-y-3">
              <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Start with the corridor that matches your team, then connect a wallet and move straight into governance.
              </h2>
              <p className="max-w-2xl text-base leading-8 text-white/62 sm:text-lg">
                This workspace removes the need to understand every proof packet up front. It gives a direct path into
                the right service rail, the right wallet, and the right command surface for the team using PrivateDAO.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link className={buttonVariants({ size: "lg" })} href="/command-center">
                Open command center
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link className={buttonVariants({ size: "lg", variant: "secondary" })} href="/services">
                Compare service corridors
              </Link>
              <Link className={buttonVariants({ size: "lg", variant: "outline" })} href="/story">
                Watch story video
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            {gettingStartedActions.map((action, index) => (
              <Link
                key={action.title}
                href={action.href}
                className="rounded-[26px] border border-white/10 bg-black/20 p-5 transition hover:border-cyan-300/25 hover:bg-white/[0.05]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-sm font-semibold text-cyan-100">
                    0{index + 1}
                  </div>
                  <div className="text-base font-medium text-white">{action.title}</div>
                </div>
                <p className="mt-3 text-sm leading-7 text-white/58">{action.detail}</p>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
        <Card>
          <CardHeader>
            <CardTitle>Choose your PrivateDAO corridor</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {servicePacks.map((pack) => (
              <Link
                key={pack.name}
                href="/services"
                className="rounded-[26px] border border-white/8 bg-white/[0.04] p-5 transition hover:border-emerald-300/25 hover:bg-white/[0.06]"
              >
                <div className="text-base font-medium text-white">{pack.name}</div>
                <p className="mt-3 text-sm leading-7 text-white/58">{pack.fit}</p>
                <div className="mt-4 text-sm font-medium text-cyan-200">{pack.cta}</div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recommended wallet path</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {walletChoices.map((wallet) => (
              <div key={wallet.name} className="rounded-[24px] border border-white/8 bg-white/[0.04] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-cyan-100">
                    <Wallet className="h-4 w-4" />
                  </div>
                  <div className="text-base font-medium text-white">{wallet.name}</div>
                </div>
                <p className="mt-3 text-sm leading-7 text-white/58">{wallet.fit}</p>
              </div>
            ))}
            <div className="rounded-[24px] border border-emerald-300/18 bg-emerald-300/8 p-4 text-sm leading-7 text-white/68">
              Connect Wallet is kept in the top-right shell position and auto-reconnects when possible, so users land
              in the product instead of redoing wallet setup every visit.
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>What the first successful session looks like</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-2">
          {buyerJourneySteps.map((step) => (
            <div key={step.title} className="rounded-[26px] border border-white/8 bg-white/[0.04] p-5">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                <div className="text-base font-medium text-white">{step.title}</div>
              </div>
              <p className="mt-3 text-sm leading-7 text-white/58">{step.description}</p>
              <div className="mt-4 rounded-2xl border border-white/8 bg-black/20 px-4 py-3 text-sm text-white/68">
                {step.outcome}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Link className={cn(buttonVariants({ size: "lg" }))} href="/command-center">
          Continue to command center
        </Link>
        <Link className={cn(buttonVariants({ size: "lg", variant: "secondary" }))} href="/proof">
          Open proof center
        </Link>
        <Link className={cn(buttonVariants({ size: "lg", variant: "outline" }))} href="/tracks">
          Open competition center
        </Link>
      </div>
    </div>
  );
}
