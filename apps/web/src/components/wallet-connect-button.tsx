"use client";

import { useEffect, useMemo, useState } from "react";
import { type WalletName, WalletReadyState } from "@solana/wallet-adapter-base";
import { useWallet } from "@solana/wallet-adapter-react";
import { Check, ChevronDown, Copy, LogOut, Wallet } from "lucide-react";

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
  const {
    wallets,
    wallet,
    publicKey,
    connected,
    connecting,
    disconnecting,
    select,
    connect,
    disconnect,
  } = useWallet();
  const [isMounted, setIsMounted] = useState(false);
  const [isWalletPickerOpen, setIsWalletPickerOpen] = useState(false);
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [selectedWalletName, setSelectedWalletName] = useState<WalletName | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!selectedWalletName || !wallet || wallet.adapter.name !== selectedWalletName || connected || connecting) {
      return;
    }

    let isCancelled = false;
    void connect()
      .then(() => {
        if (!isCancelled) {
          setFeedback(null);
          setSelectedWalletName(null);
        }
      })
      .catch((error) => {
        if (!isCancelled) {
          setFeedback(error instanceof Error ? error.message : "Wallet connection was interrupted.");
          setSelectedWalletName(null);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [connect, connected, connecting, selectedWalletName, wallet]);

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

  const availableWallets = useMemo(
    () =>
      wallets.filter(
        (entry) =>
          entry.readyState !== WalletReadyState.Unsupported && entry.readyState !== WalletReadyState.NotDetected,
      ),
    [wallets],
  );

  function describeReadyState(state: WalletReadyState) {
    switch (state) {
      case WalletReadyState.Installed:
        return "Installed";
      case WalletReadyState.Loadable:
        return "Loadable in browser";
      case WalletReadyState.NotDetected:
        return "Extension not detected";
      case WalletReadyState.Unsupported:
        return "Unsupported in this browser";
      default:
        return "Available";
    }
  }

  async function handleWalletSelection(walletName: WalletName) {
    setFeedback(null);
    setIsWalletPickerOpen(false);
    setIsActionsOpen(false);

    if (wallet?.adapter.name === walletName) {
      try {
        await connect();
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Wallet connection failed.");
      }
      return;
    }

    setSelectedWalletName(walletName);
    select(walletName);
  }

  async function handleCopyAddress() {
    if (!publicKey) {
      return;
    }
    try {
      await navigator.clipboard.writeText(publicKey.toBase58());
      setFeedback("Wallet address copied.");
      setIsActionsOpen(false);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to copy the wallet address.");
    }
  }

  async function handleDisconnect() {
    try {
      await disconnect();
      setFeedback("Wallet disconnected.");
      setIsActionsOpen(false);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Wallet disconnect failed.");
    }
  }

  return (
    <div className="wallet-adapter-shell relative inline-flex flex-col">
      <button
        type="button"
        data-wallet-connect-trigger="true"
        className={cn(
          "wallet-adapter-button wallet-adapter-button-trigger",
          buttonVariants({ size, variant }),
          className,
        )}
        disabled={!isMounted || connecting || disconnecting}
        onClick={() => {
          setFeedback(null);
          if (connected) {
            setIsActionsOpen((current) => !current);
            return;
          }
          setIsWalletPickerOpen(true);
        }}
      >
        <Wallet className="h-4 w-4" />
        {label}
        <ChevronDown className="h-4 w-4 opacity-80" />
      </button>

      {isActionsOpen && connected ? (
        <div className="absolute z-[70] mt-2 min-w-[220px] rounded-[20px] border border-white/10 bg-[#07111d] p-2 shadow-2xl">
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left text-sm text-white/78 transition hover:bg-white/6 hover:text-white"
            onClick={() => setIsWalletPickerOpen(true)}
          >
            <Wallet className="h-4 w-4" />
            Change wallet
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left text-sm text-white/78 transition hover:bg-white/6 hover:text-white"
            onClick={() => void handleCopyAddress()}
          >
            <Copy className="h-4 w-4" />
            Copy address
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left text-sm text-rose-200/82 transition hover:bg-rose-400/10 hover:text-white"
            onClick={() => void handleDisconnect()}
          >
            <LogOut className="h-4 w-4" />
            Disconnect
          </button>
        </div>
      ) : null}

      {isWalletPickerOpen ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/72 px-4 backdrop-blur-md">
          <div className="w-full max-w-xl rounded-[32px] border border-white/10 bg-[#060d18] p-6 shadow-[0_32px_120px_rgba(0,0,0,0.55)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[11px] uppercase tracking-[0.24em] text-white/44">Wallet-first connect</div>
                <h3 className="mt-3 text-2xl font-semibold text-white">Choose a Devnet wallet</h3>
                <p className="mt-3 text-sm leading-7 text-white/62">
                  Pick the wallet you want to use for real Devnet actions. After connect, continue directly into DAO
                  creation, proposals, voting, execution, and proof review from the same browser surface.
                </p>
              </div>
              <button
                type="button"
                className="rounded-full border border-white/10 px-3 py-1 text-sm text-white/70 transition hover:border-white/20 hover:text-white"
                onClick={() => setIsWalletPickerOpen(false)}
              >
                Close
              </button>
            </div>
            <div className="mt-6 grid gap-3">
              {(availableWallets.length > 0 ? availableWallets : wallets).map((entry) => {
                const isCurrent = wallet?.adapter.name === entry.adapter.name;
                return (
                  <button
                    key={entry.adapter.name}
                    type="button"
                    className="flex items-center justify-between rounded-[24px] border border-white/10 bg-white/[0.04] px-4 py-4 text-left transition hover:border-cyan-300/25 hover:bg-white/[0.07]"
                    onClick={() => void handleWalletSelection(entry.adapter.name)}
                  >
                    <div>
                      <div className="text-base font-medium text-white">{entry.adapter.name}</div>
                      <div className="mt-1 text-xs uppercase tracking-[0.2em] text-white/42">
                        {describeReadyState(entry.readyState)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white/64">
                      {isCurrent ? <Check className="h-4 w-4 text-emerald-300" /> : null}
                      {isCurrent ? "Selected" : "Use wallet"}
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="mt-5 rounded-[24px] border border-emerald-300/15 bg-emerald-300/[0.08] p-4 text-sm leading-7 text-white/72">
              Solflare is the recommended first path for guided Devnet execution. Phantom and Backpack remain available
              for reviewers and operators who already use them.
            </div>
          </div>
        </div>
      ) : null}

      {feedback ? (
        <div className="mt-2 max-w-sm rounded-2xl border border-white/8 bg-black/30 px-4 py-3 text-xs leading-6 text-white/68">
          {feedback}
        </div>
      ) : null}
    </div>
  );
}
