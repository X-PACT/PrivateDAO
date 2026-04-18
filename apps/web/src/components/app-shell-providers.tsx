"use client";

import type { ReactNode } from "react";

import { GovernanceSessionProvider } from "@/components/governance-session";
import { I18nProvider } from "@/components/i18n-provider";
import { WalletProviderShell } from "@/components/wallet-provider";

type AppShellProvidersProps = {
  children: ReactNode;
};

export function AppShellProviders({ children }: AppShellProvidersProps) {
  return (
    <I18nProvider>
      <WalletProviderShell>
        <GovernanceSessionProvider>{children}</GovernanceSessionProvider>
      </WalletProviderShell>
    </I18nProvider>
  );
}
