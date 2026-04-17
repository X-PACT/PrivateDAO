"use client";

import { useMemo } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

export function WalletConnectButton() {
  const { connected, connecting, disconnecting, publicKey, wallet } = useWallet();
  const { setVisible } = useWalletModal();

  const label = useMemo(() => {
    if (connecting) return "Connecting...";
    if (disconnecting) return "Disconnecting...";
    if (connected && publicKey) {
      const address = publicKey.toBase58();
      return `${wallet?.adapter.name ?? "Wallet"} · ${address.slice(0, 4)}…${address.slice(-4)}`;
    }
    return "Connect Devnet Wallet";
  }, [connected, connecting, disconnecting, publicKey, wallet]);

  return (
    <div className="wallet-adapter-shell">
      <button
        type="button"
        className="wallet-adapter-button wallet-adapter-button-trigger"
        aria-label={connected ? "Wallet connected" : "Connect wallet"}
        onClick={() => {
          if (!connected && !connecting && !disconnecting) {
            setVisible(true);
          }
        }}
      >
        {label}
      </button>
    </div>
  );
}
