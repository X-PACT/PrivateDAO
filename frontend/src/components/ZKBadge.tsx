type ZKBadgeProps = {
  label?: string;
};

export function ZKBadge({ label = "🔒 Zero-Knowledge Verified" }: ZKBadgeProps) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: "8px 14px",
        borderRadius: "999px",
        border: "1px solid rgba(0, 229, 255, 0.24)",
        background: "linear-gradient(135deg, rgba(0, 229, 255, 0.18), rgba(16, 185, 129, 0.24))",
        color: "#f3fdff",
        fontSize: "0.78rem",
        fontWeight: 700,
        letterSpacing: "0.02em",
        boxShadow: "0 10px 24px rgba(0, 229, 255, 0.12)",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}
