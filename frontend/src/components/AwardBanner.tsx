type AwardBannerProps = {
  className?: string;
};

export function AwardBanner({ className = "" }: AwardBannerProps) {
  return (
    <section
      className={className}
      style={{
        background:
          "linear-gradient(135deg, rgba(255, 215, 0, 0.22), rgba(180, 118, 0, 0.34))",
        border: "1px solid rgba(255, 214, 102, 0.34)",
        borderRadius: "24px",
        padding: "24px",
        boxShadow: "0 18px 48px rgba(148, 102, 0, 0.18)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "20px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ maxWidth: "720px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              padding: "8px 14px",
              borderRadius: "999px",
              background: "rgba(41, 24, 0, 0.24)",
              color: "#fff0ae",
              fontSize: "12px",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: "14px",
            }}
          >
            <span>🏆</span>
            <span>Awards &amp; Recognition</span>
          </div>
          <h2
            style={{
              margin: 0,
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              lineHeight: 1,
              color: "#fff6d1",
            }}
          >
            1st Place — Superteam Earn
          </h2>
          <p
            style={{
              margin: "12px 0 0",
              fontSize: "1rem",
              lineHeight: 1.7,
              color: "rgba(255, 246, 209, 0.88)",
            }}
          >
            Backend Systems Engineering Challenge
          </p>
        </div>

        <div
          style={{
            minWidth: "220px",
            background: "rgba(41, 24, 0, 0.24)",
            border: "1px solid rgba(255, 214, 102, 0.22)",
            borderRadius: "18px",
            padding: "16px 18px",
          }}
        >
          <div style={{ fontSize: "12px", color: "rgba(255, 240, 174, 0.72)", marginBottom: "6px" }}>
            Platform
          </div>
          <div style={{ fontSize: "0.98rem", fontWeight: 600, color: "#fff6d1", marginBottom: "14px" }}>
            Superteam Poland
          </div>
          <div style={{ fontSize: "12px", color: "rgba(255, 240, 174, 0.72)", marginBottom: "6px" }}>
            Date
          </div>
          <div style={{ fontSize: "0.98rem", fontWeight: 600, color: "#fff6d1" }}>March 2026</div>
        </div>
      </div>
    </section>
  );
}
