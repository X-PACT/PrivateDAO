import { useMemo } from "react";

type WalletConnectStarterProps = {
  walletAddress: string | null;
  onConnect: () => void;
  onOpenGovernance: () => void;
};

export function WalletConnectStarter({
  walletAddress,
  onConnect,
  onOpenGovernance,
}: WalletConnectStarterProps) {
  const shortAddress = useMemo(() => {
    if (!walletAddress) return "No wallet connected";
    return `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`;
  }, [walletAddress]);

  return (
    <section style={{ display: "grid", gap: 16, padding: 24, borderRadius: 20, background: "#081420", color: "#e0f0ff" }}>
      <div>
        <div style={{ fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.7 }}>Wallet-first starter</div>
        <h2 style={{ margin: "8px 0 0", fontSize: 28 }}>Connect first, then enter the product corridor</h2>
      </div>
      <p style={{ margin: 0, lineHeight: 1.7, opacity: 0.85 }}>
        This starter keeps the first Solana action simple: connect a Devnet wallet, display signer context, then move into governance or treasury work from one browser shell.
      </p>
      <div style={{ padding: 16, borderRadius: 16, background: "#0c1e30" }}>
        <div style={{ fontSize: 12, textTransform: "uppercase", opacity: 0.7 }}>Connected signer</div>
        <div style={{ marginTop: 8, fontFamily: "monospace" }}>{shortAddress}</div>
      </div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <button type="button" onClick={onConnect}>
          {walletAddress ? "Reconnect wallet" : "Connect wallet"}
        </button>
        <button type="button" onClick={onOpenGovernance} disabled={!walletAddress}>
          Open governance corridor
        </button>
      </div>
    </section>
  );
}
