type PrivatePaymentStarterProps = {
  amountLabel: string;
  railLabel: string;
  visibilityLabel: string;
  onSubmit: () => void;
  onOpenProof: () => void;
};

export function PrivatePaymentStarter({
  amountLabel,
  railLabel,
  visibilityLabel,
  onSubmit,
  onOpenProof,
}: PrivatePaymentStarterProps) {
  return (
    <section style={{ display: "grid", gap: 16, padding: 24, borderRadius: 20, background: "#081420", color: "#e0f0ff" }}>
      <div>
        <div style={{ fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.7 }}>Private payment starter</div>
        <h2 style={{ margin: "8px 0 0", fontSize: 28 }}>Explain privacy and proof in user language</h2>
      </div>
      <div style={{ padding: 16, borderRadius: 16, background: "#0c1e30" }}>
        <div>Amount: {amountLabel}</div>
        <div style={{ marginTop: 8 }}>Execution rail: {railLabel}</div>
        <div style={{ marginTop: 8 }}>Visibility: {visibilityLabel}</div>
      </div>
      <p style={{ margin: 0, lineHeight: 1.7, opacity: 0.85 }}>
        This starter shows how to explain what remains confidential, what becomes public, and where the reviewer can verify the result without exposing the user to cryptographic jargon.
      </p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <button type="button" onClick={onSubmit}>Submit payment request</button>
        <button type="button" onClick={onOpenProof}>Open proof route</button>
      </div>
    </section>
  );
}
