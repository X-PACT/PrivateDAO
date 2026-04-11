import Link from "next/link";
import { ArrowRight, Radar, ReceiptText, WalletCards } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import {
  getWalletFirstServiceActions,
  type WalletFirstServiceActionContext,
} from "@/lib/wallet-first-service-actions";
import { cn } from "@/lib/utils";

type WalletFirstServiceActionsStripProps = {
  context: WalletFirstServiceActionContext;
};

const iconMeta = {
  "proposal-review": ReceiptText,
  "payout-route-selection": WalletCards,
  "telemetry-inspection": Radar,
} as const;

const copy = {
  start: {
    title: "Wallet-first service actions",
    description:
      "Close the first real service loop from the product shell itself: review a proposal, choose the payout path, and inspect telemetry without dropping into docs or terminal-first thinking.",
  },
  services: {
    title: "Commercial service actions",
    description:
      "Buyer-facing services should still expose executable product actions. These three lanes tie commercial reading back to proposal review, payout routing, and telemetry inspection.",
  },
  "command-center": {
    title: "Operator service actions",
    description:
      "The command shell should expose the real next actions directly: proposal review, payout route choice, and telemetry inspection with the matching proof routes already attached.",
  },
} as const;

export function WalletFirstServiceActionsStrip({ context }: WalletFirstServiceActionsStripProps) {
  const actions = getWalletFirstServiceActions(context);
  const sectionCopy = copy[context];

  return (
    <Card className="border-fuchsia-300/14 bg-[linear-gradient(180deg,rgba(19,12,34,0.95),rgba(11,9,24,0.98))]">
      <CardHeader className="gap-3">
        <div className="text-[11px] uppercase tracking-[0.3em] text-fuchsia-200/80">Wallet-first actions</div>
        <CardTitle>{sectionCopy.title}</CardTitle>
        <div className="max-w-4xl text-sm leading-7 text-white/58">{sectionCopy.description}</div>
      </CardHeader>
      <CardContent className="grid gap-4 xl:grid-cols-3">
        {actions.map((action) => {
          const Icon = iconMeta[action.slug];

          return (
            <div key={action.slug} className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-fuchsia-200">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="text-base font-medium text-white">{action.title}</div>
              </div>
              <p className="mt-3 text-sm leading-7 text-white/58">{action.summary}</p>
              <div className="mt-4 rounded-[20px] border border-white/8 bg-black/20 p-4">
                <div className="text-[11px] uppercase tracking-[0.24em] text-white/40">State</div>
                <div className="mt-2 text-base font-medium text-white">{action.state}</div>
                <div className="mt-2 text-sm leading-7 text-white/56">{action.stateDetail}</div>
              </div>
              <div className="mt-4 flex flex-col gap-3">
                <Link href={action.primaryHref} className={cn(buttonVariants({ variant: "secondary" }), "justify-between")}>
                  {action.primaryLabel}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href={action.proofHref} className={cn(buttonVariants({ variant: "outline" }), "justify-between")}>
                  {action.proofLabel}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
