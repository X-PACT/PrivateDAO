"use client";

import { useSyncExternalStore } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

const emptySubscribe = () => () => {};

export function WalletConnectButton() {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  if (!mounted) {
    return (
      <div className="wallet-adapter-shell">
        <button
          type="button"
          className="wallet-adapter-button wallet-adapter-button-trigger"
          aria-label="Connect wallet"
        >
          Select Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="wallet-adapter-shell">
      <WalletMultiButton />
    </div>
  );
}
