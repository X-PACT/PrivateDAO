import { AwardBanner } from "../components/AwardBanner";

export default function AwardsPage() {
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
        <header style={{ marginBottom: "32px" }}>
          <h1 style={{ margin: 0, fontSize: "clamp(2.4rem, 6vw, 4.5rem)", lineHeight: 1 }}>
            PrivateDAO Awards &amp; Recognition
          </h1>
          <p style={{ margin: "14px 0 0", maxWidth: "760px", fontSize: "1.05rem", lineHeight: 1.8, color: "#9db0c7" }}>
            PrivateDAO engineering work achieved 1st Place in a competitive backend systems challenge focused on implementing production-grade logic using Solana Rust programs.
          </p>
        </header>

        <AwardBanner />

        <section
          style={{
            marginTop: "28px",
            background: "#0c1e30",
            border: "1px solid #1a3a5c",
            borderRadius: "24px",
            padding: "28px",
          }}
        >
          <h2 style={{ marginTop: 0, fontSize: "1.6rem" }}>🥇 1st Place — Superteam Earn</h2>
          <p style={{ margin: "0 0 18px", color: "#9db0c7", lineHeight: 1.8 }}>
            This recognition reflects backend systems engineering translated into deterministic on-chain execution, with clear state transitions, permission controls, and production-oriented architectural thinking.
          </p>
          <div style={{ display: "grid", gap: "14px", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
            <div style={{ background: "#081420", borderRadius: "16px", padding: "18px", border: "1px solid #112840" }}>
              <div style={{ fontSize: "0.75rem", color: "#8e9fb5", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Challenge
              </div>
              <div style={{ lineHeight: 1.6 }}>Rebuild production backend systems as on-chain Rust programs</div>
            </div>
            <div style={{ background: "#081420", borderRadius: "16px", padding: "18px", border: "1px solid #112840" }}>
              <div style={{ fontSize: "0.75rem", color: "#8e9fb5", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Platform
              </div>
              <div style={{ lineHeight: 1.6 }}>Superteam Poland</div>
            </div>
            <div style={{ background: "#081420", borderRadius: "16px", padding: "18px", border: "1px solid #112840" }}>
              <div style={{ fontSize: "0.75rem", color: "#8e9fb5", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Date
              </div>
              <div style={{ lineHeight: 1.6 }}>March 2026</div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
