# PrivateDAO ZK Product Inventory and Originality Report

**Report date:** 2026-09-03  
**Reviewed source:** `PrivateDAO-CANONICAL-LIVE-20260818/source/commercial-core`  
**Scope:** Circom/Groth16 circuits, product bindings, artifact traceability, and authorship evidence.

## Executive Summary

The reviewed canonical source contains **9 distinct Circom circuit definitions** and matching compiled R1CS artifacts. They form two groups:

- **5 domain circuits:** KYC, AML, employment, payroll, and underwriting.
- **4 PrivateDAO overlay circuits:** blind policy, private vote, delegation, and tally.

Each Groth16 circuit is represented by the standard logical R1CS constraint matrices **A, B, and C**. On that accounting basis, the 9 circuits represent **27 logical matrices**. This is not 27 hand-authored matrix files: the matrices are encoded inside the compiled R1CS artifacts.

The repository contains strong **artifact traceability** evidence: source files, R1CS, WASM, proving keys, verification keys, sample inputs, proofs, generated registries, transcripts, attestations, and SHA-256 hashes. It does **not** contain Git history in the canonical snapshot, a signed authorship statement, an external code-similarity report, or a reproducible independent build record sufficient to prove that every circuit was invented exclusively by PrivateDAO.

The defensible current wording is:

> PrivateDAO-authored application circuits and proof workflows, built with standard open-source Circom/circomlib primitives and verified with Groth16.

Do not claim “PrivateDAO invented zero-knowledge circuits” or “all cryptographic components are original.” Standard primitives such as Poseidon and comparator templates are explicitly imported from `circomlib`.

## Circuit Inventory

| Circuit | Category | Product/use binding | Source SHA-256 |
|---|---|---|---|
| `private_dao_blind_kyc` | Domain | Blind identity/KYC claim | `face1ef05c700694963b42b608c07822a80816d6d986948616014073529f59c5` |
| `private_dao_blind_aml` | Domain | Blind AML/risk claim | `52cfb9521ca7dcc6946876395caac52bda93cce3d60331a16abb46a984ed1d3e` |
| `private_dao_blind_employment` | Domain | Employment/eligibility claim | `7aa8837abb12a9c09886940f7efc8c74658893ed65f0f71abe9173a0fcca22e7` |
| `private_dao_blind_payroll` | Domain | Confidential Payroll proof | `e8b03b0a5e654ce19695d8d3be51f5a914d2a8ac5e5452caaa832c9fd21b40a5` |
| `private_dao_blind_underwriting` | Domain | Blind underwriting/coverage claim | `06a622bd131ef4be8cd888164888c9fd447a7d49f737131d6de53dd2e3778a63` |
| `private_dao_blind_policy_overlay` | Overlay | Blind Verification and policy satisfaction | `133bfb5ab34552f1f4a2e29e461b545badd69dc849235ae05e2f2fe64b62e75a` |
| `private_dao_vote_overlay` | Overlay | Private Governance vote validity | `10894814dbd80792f331313330a9e2b560c4c1d6dddfcefd5fd00af16c8290d0` |
| `private_dao_delegation_overlay` | Overlay | Governance delegation authorization | `b9a63f53fd942f675ca9ffc1a765f17f4fbe87a7bba77244bec582fe6f02fea0` |
| `private_dao_tally_overlay` | Overlay | Bounded tally integrity | `9cb2cd4b9537bcebc0f6b2414c1937288c085fba6688fb6825db34a6a76ac3ad` |

## Product Mapping

### Blind Verification

The primary circuit is `private_dao_blind_policy_overlay`. Its public inputs bind a policy identifier, policy commitment, input commitment, and satisfied claim. The implementation is in `apps/web/src/lib/blind-policy-proof.ts`, and the proof package identifies the circuit as `private_dao_blind_policy_overlay` with version `groth16-v1`.

The five domain circuits are reusable claim-specific circuits that can support blind verification workflows. Their presence in the private-engine release manifest establishes packaging, not automatic proof that each one is currently exposed as a live customer route.

### Confidential Payroll

`private_dao_blind_payroll` is directly bound to the payroll proof path:

- `scripts/lib/payroll-domain.ts`
- `scripts/test-payroll-domain.mjs`
- `apps/web/src/lib/payroll-groth16-proof.ts`
- `apps/web/src/lib/providers/umbra-payroll-workflow.ts`

The checked-in payroll path uses a payroll commitment, batch commitment, variance bound, approval claim, private witness values, a WASM artifact, a final proving key, and a verification key. This is the strongest current product-to-circuit binding in the reviewed tree.

### Private Governance

Governance uses three overlay circuits:

- `private_dao_vote_overlay`
- `private_dao_delegation_overlay`
- `private_dao_tally_overlay`

Their build/prove/verify commands are explicit in `package.json`, and their sample proof artifacts are included in the generated ZK registry, transcript, and attestation.

### Record Verification

Record Verification is primarily a verification/receipt layer that consumes proof packages and public claims. The reviewed evidence does not show a separate `record_verification.circom` circuit. It should therefore be described as **using the ZK proof and verification infrastructure**, not as owning a tenth circuit.

### Auctions, Treasury, Agent Exchange, and Game

The reviewed canonical tree contains product references to ZK and proof workflows around treasury, auctions, and agent surfaces, but no distinct auction, treasury, agent, or game circuit definition was found among the 9 Circom sources. Do not state that these products have their own ZK circuit unless a separate current source is identified and added to the registry.

## Matrix and Artifact Accounting

| Measure | Verified result |
|---|---:|
| Circom source definitions | 9 |
| Compiled R1CS artifacts | 9 |
| Logical Groth16 matrices per R1CS | 3 (`A`, `B`, `C`) |
| Logical matrix total | 27 |
| Shared setup artifact | 1: `zk/setup/pot12_final.ptau` |
| Governance layers in generated ZK attestation | 3 |
| Circuit entries listed by private-engine manifest | 7 circuits plus runtime engine files |

The exact sparse matrix dimensions and constraint counts are not asserted here because the canonical snapshot does not contain an installed `snarkjs` CLI executable, and a stale generated registry covers only the three governance overlays plus the policy overlay. The R1CS files themselves are present and can be independently inspected after installing the locked toolchain.

## Documented Build and Verification Usage

The following are **static references and checked-in evidence counts**, not production customer usage counts:

| Circuit | Files containing identifier | Textual references | Strongest current evidence |
|---|---:|---:|---|
| `private_dao_blind_aml` | 3 | 8 | Source, build artifact, engine manifest |
| `private_dao_blind_employment` | 3 | 8 | Source, build artifact, engine manifest |
| `private_dao_blind_kyc` | 4 | 9 | Source, build artifact, engine manifest |
| `private_dao_blind_payroll` | 8 | 19 | Source, payroll domain test/path, build artifact, engine manifest |
| `private_dao_blind_policy_overlay` | 21 | 97 | Source, proof package, browser integration, build artifact, engine manifest |
| `private_dao_blind_underwriting` | 4 | 9 | Source, build artifact, engine manifest |
| `private_dao_vote_overlay` | 45 | 136 | Source, sample proof, registry, transcript, attestation, negative tests, anchor path |
| `private_dao_delegation_overlay` | 43 | 124 | Source, sample proof, registry, transcript, attestation, negative tests, anchor path |
| `private_dao_tally_overlay` | 43 | 124 | Source, sample proof, registry, transcript, attestation, negative tests, anchor path |

These counts were obtained from the canonical tree while excluding `node_modules` and source maps. A textual reference is not a proof generation or a customer execution.

### What can currently be claimed about “how many times used”

- **Build/package presence:** all 9 are listed in the private-engine manifest path.
- **Checked-in proof examples:** the generated ZK registry and attestation provide sample proof evidence for the governance overlays and the policy overlay.
- **Payroll proof path:** a direct local payroll Groth16 test/path exists.
- **Production executions:** no authoritative production telemetry or append-only proof execution ledger was found in this snapshot that would support a numeric count of real customer proof generations.
- **Revenue/customer usage:** must be reported separately from repository references and must not be inferred from these files.

## Evidence of PrivateDAO Attribution

### Direct evidence present

1. Nine source files use the `private_dao_*` namespace and PrivateDAO-specific domain inputs and claims.
2. Each source has matching compiled artifacts under `zk/build` and setup artifacts under `zk/setup`.
3. `scripts/build-private-engine-manifest.mjs` hashes the artifact chain for 7 circuits: policy, KYC, AML, employment, payroll, underwriting, and vote.
4. `docs/zk-registry.generated.json`, `docs/zk-transcript.generated.md`, and `docs/zk-attestation.generated.json` bind source, inputs, proof, public signals, keys, R1CS, WASM, commands, and hashes for the documented layers.
5. Negative verification scripts test rejection of altered proof/public-signal material for the documented governance layers.
6. Product code binds payroll and blind policy workflows to exact circuit identifiers and verification keys.

The private-engine manifest currently omits `private_dao_delegation_overlay` and `private_dao_tally_overlay`; their separate governance registry/transcript/attestation evidence is present, but the release-manifest coverage is incomplete.

### External material explicitly used

The circuits import standard public templates:

- `circomlib/circuits/poseidon.circom`
- `circomlib/circuits/comparators.circom` where needed

Those dependencies must remain attributed to their upstream authors. PrivateDAO attribution should apply to the application circuit composition, public/private signal design, domain constraints, product workflow, integration, and release artifacts that PrivateDAO actually authored.

### Evidence currently missing

- Git repository history for the canonical source.
- Signed commits or signed release tags.
- A dated first-party authorship declaration.
- Independent code-similarity scan against public repositories.
- Complete SBOM and license report tied to the exact release hash.
- Independent reproducible rebuild from a clean environment.
- Third-party cryptographic/security review naming the reviewed commit and hashes.
- A production proof-execution ledger with circuit ID, artifact hash, timestamp, and privacy-safe job reference.

## Defensible Investor/Reviewer Language

Use:

> PrivateDAO maintains a proprietary application-layer ZK circuit suite consisting of nine Circom/Groth16 circuits for blind policy claims, payroll, eligibility, AML/KYC, underwriting, and confidential governance. The suite is hash-linked to compiled R1CS/WASM/key/proof artifacts and verified through reproducible local checks. Standard cryptographic primitives are used under their upstream open-source licenses; PrivateDAO's claim is to its application circuits, workflow composition, product integration, and release artifacts.

Avoid:

- “PrivateDAO invented Groth16.”
- “PrivateDAO invented Poseidon.”
- “Every line is original” without a similarity audit and provenance history.
- “All nine circuits are live in production” unless runtime telemetry proves it.
- “Record Verification has its own circuit” unless a dedicated current circuit is added.

## Required Authorship Proof Package

To upgrade the current attribution from **artifact-linked / partially evidenced** to a strong defensible authorship claim:

1. Recover or create the canonical Git repository without changing source contents.
2. Commit the exact nine source files and all release manifests; create a signed tag.
3. Publish a release manifest containing SHA-256 for every source, dependency lockfile, R1CS, WASM, zkey, vkey, proof, and transcript.
4. Record Circom, circomlib, snarkjs, Node, and OS versions; rebuild all R1CS/WASM artifacts from clean checkout.
5. Generate a complete SBOM and license notices, separating PrivateDAO-authored code from upstream templates.
6. Run an independent similarity scan against public GitHub and package sources and retain the signed report.
7. Have the founder/company sign a dated authorship and third-party-license declaration.
8. Timestamp the release manifest using a public immutable timestamp service or a signed public release; never publish private witnesses or secrets.
9. Obtain an external security review against the signed commit and artifact manifest.
10. Add privacy-safe runtime telemetry so each real proof execution records circuit ID and artifact hash without recording private inputs.

## Current Conclusion

**Inventory:** verified: 9 circuits, 27 logical Groth16 matrices, one shared PTau artifact.  
**Product attribution:** strongest for Blind Verification, Confidential Payroll, and Private Governance; Record Verification is a consuming verification layer.  
**Usage count:** static reference counts are available above; real production execution counts are not proven by the current snapshot.  
**Originality:** PrivateDAO-specific application composition is evidenced; exclusive invention and non-copying are not conclusively proven without Git provenance, dependency audit, similarity analysis, and independent attestation.
