import fs from "fs";
import path from "path";

function main() {
  const auditPacketPath = path.resolve("docs/audit-packet.generated.md");
  const attestationPath = path.resolve("docs/review-attestation.generated.json");

  if (!fs.existsSync(auditPacketPath)) {
    throw new Error("missing generated audit packet");
  }
  if (!fs.existsSync(attestationPath)) {
    throw new Error("missing generated review attestation");
  }

  const auditPacket = fs.readFileSync(auditPacketPath, "utf8");
  const attestation = JSON.parse(fs.readFileSync(attestationPath, "utf8")) as {
    project: string;
    programId: string;
    verificationWallet: string;
    gateCount: number;
    packageCounts: Record<string, number>;
  };

  if (attestation.project !== "PrivateDAO") {
    throw new Error("generated attestation project mismatch");
  }

  if (attestation.programId !== "5AhUsbQ4mJ8Xh7QJEomuS85qGgmK9iNvFqzF669Y7Psx") {
    throw new Error("generated attestation program id mismatch");
  }

  if (attestation.verificationWallet !== "4Mm5YTRbJuyA8NcWM85wTnx6ZQMXNph2DSnzCCKLhsMD") {
    throw new Error("generated attestation verification wallet mismatch");
  }

  if (attestation.gateCount < 8) {
    throw new Error("generated attestation gate count is unexpectedly low");
  }

  for (const [pkg, count] of Object.entries(attestation.packageCounts)) {
    if (count <= 0) {
      throw new Error(`generated attestation package count is invalid for ${pkg}`);
    }
  }

  if (!auditPacket.includes("# Audit Packet")) {
    throw new Error("generated audit packet content is invalid");
  }

  console.log("Generated artifact verification: PASS");
}

main();
