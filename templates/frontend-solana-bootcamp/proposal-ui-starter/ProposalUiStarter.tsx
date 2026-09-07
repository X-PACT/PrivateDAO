type ProposalUiStarterProps = {
  proposalTitle: string;
  status: "Draft" | "Committed" | "Reveal ready" | "Execution ready";
  onCommit: () => void;
  onReveal: () => void;
  onExecute: () => void;
};

export function ProposalUiStarter({
  proposalTitle,
  status,
  onCommit,
  onReveal,
  onExecute,
}: ProposalUiStarterProps) {
  return (
    <section style={{ display: "grid", gap: 16, padding: 24, borderRadius: 20, background: "#081420", color: "#e0f0ff" }}>
      <div>
        <div style={{ fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.7 }}>Governance starter</div>
        <h2 style={{ margin: "8px 0 0", fontSize: 28 }}>{proposalTitle}</h2>
      </div>
      <div style={{ padding: 16, borderRadius: 16, background: "#0c1e30" }}>
        <div style={{ fontSize: 12, textTransform: "uppercase", opacity: 0.7 }}>Lifecycle state</div>
        <div style={{ marginTop: 8 }}>{status}</div>
      </div>
      <p style={{ margin: 0, lineHeight: 1.7, opacity: 0.85 }}>
        This starter is built for create, commit, reveal, and execute flows that stay readable to the user while preserving the signer boundary and the privacy model.
      </p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <button type="button" onClick={onCommit}>Commit vote</button>
        <button type="button" onClick={onReveal}>Reveal vote</button>
        <button type="button" onClick={onExecute}>Execute proposal</button>
      </div>
    </section>
  );
}
