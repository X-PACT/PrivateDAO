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
    <Suspense fallback={null}>
      <WalletFirstServiceActionsWorkbench context={context} data={data} />
    </Suspense>
  );
}
