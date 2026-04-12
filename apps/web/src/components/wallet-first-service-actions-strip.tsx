import { Suspense } from "react";

import {
  getWalletFirstServiceWorkbenchData,
  type WalletFirstServiceActionContext,
} from "@/lib/wallet-first-service-actions";

import { WalletFirstServiceActionsWorkbench } from "@/components/wallet-first-service-actions-workbench";

type WalletFirstServiceActionsStripProps = {
  context: WalletFirstServiceActionContext;
};

export function WalletFirstServiceActionsStrip({ context }: WalletFirstServiceActionsStripProps) {
  const data = getWalletFirstServiceWorkbenchData(context);

  return (
    <Suspense
      fallback={
        <div className="rounded-3xl border border-white/8 bg-white/4 p-6 text-sm text-white/60">
          Loading execution workbench…
        </div>
      }
    >
      <WalletFirstServiceActionsWorkbench context={context} data={data} />
    </Suspense>
  );
}
