import { AwardBanner } from "../components/AwardBanner";
import { ZKBadge } from "../components/ZKBadge";

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#07111b",
        color: "#eaf2ff",
        padding: "48px 20px 72px",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div style={{ maxWidth: "1080px", margin: "0 auto" }}>
        <nav
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
            marginBottom: "28px",
          }}
        >
          <div style={{ fontSize: "1.25rem", fontWeight: 700 }}>PrivateDAO</div>
          <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
            <a href="/" style={{ color: "#eaf2ff", textDecoration: "none" }}>
              Home
            </a>
            <a href="https://privatedao.org/zk-layer.md" style={{ color: "#eaf2ff", textDecoration: "none" }}>
              ZK Layer
            </a>
            <a href="/awards" style={{ color: "#eaf2ff", textDecoration: "none" }}>
              Awards
            </a>
          </div>
        </nav>

        <AwardBanner />

        <section
          style={{
            marginTop: "28px",
            background: "#0c1e30",
            border: "1px solid #1a3a5c",
            borderRadius: "24px",
            padding: "28px",
            position: "relative",
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              top: "18px",
              right: "18px",
              opacity: 0.5,
              color: "#48e7ff",
              fontSize: "2rem",
            }}
          >
            🛡️
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", marginBottom: "18px" }}>
            <span style={{ fontSize: "0.8rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "#7dd3fc" }}>
              Commit-Reveal Governance on Solana
            </span>
            <ZKBadge label="⟡ Groth16 Companion Layer" />
          </div>
          <h1 style={{ marginTop: 0, fontSize: "clamp(2.4rem, 6vw, 4.5rem)", lineHeight: 1 }}>
            Vote without fear.
          </h1>
          <p style={{ margin: "14px 0 0", maxWidth: "760px", fontSize: "1.05rem", lineHeight: 1.8, color: "#9db0c7" }}>
            PrivateDAO is a Solana governance framework built around commit-reveal voting, timelocked execution, and treasury safety checks.
          </p>
          <div style={{ marginTop: "14px", color: "#8aa4bf", fontSize: "0.95rem", lineHeight: 1.8 }}>
            Quadratic voting · Timelocked treasury execution · Realms migration · Groth16 companion proofs published
          </div>
        </section>
      </div>
    </main>
  );
}
