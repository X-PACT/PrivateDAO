"use client";

export default function GlobalError() {
  return (
    <html lang="en">
      <body style={{ background: "#030510", color: "#ffffff", fontFamily: "Arial, sans-serif", padding: "48px" }}>
        <main>
          <p style={{ color: "#67e8f9", letterSpacing: "0.18em", textTransform: "uppercase", fontSize: "12px" }}>PrivateDAO</p>
          <h1 style={{ fontSize: "36px", marginTop: "16px" }}>This page could not load.</h1>
          <p style={{ color: "#b8c4d8", marginTop: "12px", lineHeight: 1.7 }}>Return to the product home and try the request again.</p>
          <a href="/" style={{ color: "#67e8f9", display: "inline-block", marginTop: "24px" }}>Return home</a>
        </main>
      </body>
    </html>
  );
}
