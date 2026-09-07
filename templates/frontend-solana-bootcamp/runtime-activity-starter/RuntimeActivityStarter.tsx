type RuntimeActivityStarterProps = {
  latestAction: string;
  signature: string;
  status: string;
  onVerify: () => void;
};

export function RuntimeActivityStarter({
  latestAction,
  signature,
  status,
  onVerify,
}: RuntimeActivityStarterProps) {
  return (
    <section style={{ display: "grid", gap: 16, padding: 24, borderRadius: 20, background: "#081420", color: "#e0f0ff" }}>
      <div>
        <div style={{ fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.7 }}>Runtime activity starter</div>
        <h2 style={{ margin: "8px 0 0", fontSize: 28 }}>Show what happened after the wallet action</h2>
      </div>
      <div style={{ padding: 16, borderRadius: 16, background: "#0c1e30" }}>
        <div>Latest action: {latestAction}</div>
        <div style={{ marginTop: 8, fontFamily: "monospace" }}>Signature: {signature}</div>
        <div style={{ marginTop: 8 }}>Status: {status}</div>
      </div>
      <p style={{ margin: 0, lineHeight: 1.7, opacity: 0.85 }}>
        A real Solana product cannot stop at a toast. It must expose hashes, status, and the next verification step in one visible widget.
      </p>
      <button type="button" onClick={onVerify}>Verify on-chain</button>
    </section>
  );
}
