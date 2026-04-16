"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { GovernanceSessionProvider } from "@/components/governance-session";
import { WalletProviderShell } from "@/components/wallet-provider";

type AppShellProvidersProps = {
  children: ReactNode;
};

function isWalletRoute(pathname: string) {
  return (
    pathname === "/start" ||
    pathname === "/govern" ||
    pathname === "/command-center"
  );
}

export function AppShellProviders({ children }: AppShellProvidersProps) {
  const pathname = usePathname() ?? "/";
  const walletEnabled = isWalletRoute(pathname);

  if (!walletEnabled) {
    return <GovernanceSessionProvider>{children}</GovernanceSessionProvider>;
  }

  return (
    <WalletProviderShell>
      <GovernanceSessionProvider>{children}</GovernanceSessionProvider>
    </WalletProviderShell>
  );
}
