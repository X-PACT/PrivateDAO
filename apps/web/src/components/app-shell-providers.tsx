"use client";

import type { ReactNode } from "react";

import { GovernanceSessionProvider } from "@/components/governance-session";
import { WalletProviderShell } from "@/components/wallet-provider";

type AppShellProvidersProps = {
  children: ReactNode;
};

export function AppShellProviders({ children }: AppShellProvidersProps) {
  return (
    <WalletProviderShell>
      <GovernanceSessionProvider>{children}</GovernanceSessionProvider>
    </WalletProviderShell>
  );
}
