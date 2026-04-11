"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export function WalletConnectButton() {
  return (
    <div className="wallet-adapter-shell">
      <WalletMultiButton />
    </div>
  );
}
