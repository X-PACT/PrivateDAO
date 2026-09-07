import Link from "next/link";

const curveMap = [
  ["ECDSASecp256k1 / Taproot", "Curve.SECP256K1"],
  ["ECDSASecp256r1", "Curve.SECP256R1"],
  ["EdDSA", "Curve.ED25519"],
  ["SchnorrkelSubstrate", "Curve.RISTRETTO"],
] as const;

export function IkaUserShareOpsGuardrail() {
  return (
    <section className="rounded-[26px] border border-violet-300/16 bg-violet-300/[0.07] p-5">
      <div className="text-[11px] uppercase tracking-[0.24em] text-violet-100/78">IKA key control guardrails</div>
      <h3 className="mt-3 text-xl font-semibold text-white">UserShareEncryptionKeys activation rules</h3>
      <p className="mt-2 max-w-5xl text-sm leading-7 text-white/66">
        `UserShareEncryptionKeys` must be created before dWallet creation, and the selected curve must match the dWallet
        signature path. Any mismatch breaks authorization and decryption flows.
      </p>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {curveMap.map(([algo, curve]) => (
          <div key={algo} className="rounded-2xl border border-white/10 bg-black/20 p-3">
            <div className="text-sm font-medium text-white">{algo}</div>
            <div className="mt-1 font-mono text-xs text-cyan-100">{curve}</div>
          </div>
        ))}
      </div>

      <ol className="mt-4 grid gap-3 text-sm leading-7 text-white/64 md:grid-cols-2">
        <li className="rounded-2xl border border-white/8 bg-black/20 p-3">1. Generate root seed securely, then derive `UserShareEncryptionKeys` with matching curve.</li>
        <li className="rounded-2xl border border-white/8 bg-black/20 p-3">2. Register encryption key and keep serialized key bytes in secure storage only.</li>
        <li className="rounded-2xl border border-white/8 bg-black/20 p-3">3. For dWallet activation: sign user public output and verify state before submit.</li>
        <li className="rounded-2xl border border-white/8 bg-black/20 p-3">4. For decrypt flow: verify active dWallet state, validate share signature, then decrypt and verify output consistency.</li>
      </ol>

      <div className="mt-4 text-sm text-white/60">
        Reference routes:{" "}
        <Link href="/services/encrypt-ika-operations" className="text-cyan-200 hover:text-cyan-100">
          Encrypt / IKA operations
        </Link>{" "}
        ·{" "}
        <Link href="/services/confidential-payments" className="text-cyan-200 hover:text-cyan-100">
          Confidential payments
        </Link>
      </div>
    </section>
  );
}
