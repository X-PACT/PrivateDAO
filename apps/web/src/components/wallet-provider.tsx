"use client";

import { type ReactNode, useMemo } from "react";
import { clusterApiUrl } from "@solana/web3.js";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { BackpackWalletAdapter } from "@solana/wallet-adapter-backpack";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare";

type WalletProviderShellProps = {
  children: ReactNode;
};

export function WalletProviderShell({ children }: WalletProviderShellProps) {
  const endpoint = process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? clusterApiUrl("devnet");
  const wallets = useMemo(
    () => [new SolflareWalletAdapter(), new PhantomWalletAdapter(), new BackpackWalletAdapter()],
    [],
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
