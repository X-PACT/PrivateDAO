"use client";

import { useEffect, useMemo, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { BaseWalletMultiButton } from "@solana/wallet-adapter-react-ui";

import { type ButtonProps, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type WalletConnectButtonProps = {
  className?: string;
  connectLabel?: string;
  connectedLabelPrefix?: string;
} & Pick<ButtonProps, "size" | "variant">;

export function WalletConnectButton({
  className,
  connectLabel = "Connect Devnet Wallet",
  connectedLabelPrefix,
  size = "sm",
  variant = "default",
}: WalletConnectButtonProps) {
  const { connected, connecting, disconnecting, publicKey, wallet } = useWallet();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const label = useMemo(() => {
    if (!isMounted) return "Loading wallets...";
    if (connecting) return "Connecting...";
    if (disconnecting) return "Disconnecting...";
    if (connected && publicKey) {
      const address = publicKey.toBase58();
      if (connectedLabelPrefix) {
        return `${connectedLabelPrefix} · ${address.slice(0, 4)}…${address.slice(-4)}`;
      }
      return `${wallet?.adapter.name ?? "Wallet"} · ${address.slice(0, 4)}…${address.slice(-4)}`;
    }
    return connectLabel;
  }, [connectLabel, connected, connectedLabelPrefix, connecting, disconnecting, isMounted, publicKey, wallet]);

  return (
    <div className="wallet-adapter-shell">
      <BaseWalletMultiButton
        className={cn(
          "wallet-adapter-button wallet-adapter-button-trigger",
          buttonVariants({ size, variant }),
          className,
        )}
        disabled={!isMounted || connecting || disconnecting}
        labels={{
          "change-wallet": "Change wallet",
          "copy-address": "Copy address",
          connecting: "Connecting...",
          copied: "Copied",
          disconnect: "Disconnect",
          "has-wallet": "Connect Devnet Wallet",
          "no-wallet": connectLabel,
        }}
      >
        {label}
      </BaseWalletMultiButton>
    </div>
  );
}
