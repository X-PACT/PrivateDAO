# ZK Transcript

## Purpose

This transcript gives reviewers a deterministic, machine-backed summary of the current PrivateDAO zk stack.

It is intended to answer:

- which proving system is used
- which ptau artifact underpins setup
- which files belong to each circuit layer
- which hashes identify the reviewer-facing artifacts
- which commands replay build, prove, and verify for each layer

## Stack Identity

- Project: `PrivateDAO`
- ZK stack version: `1`
- Proving system: `groth16`
- PTau artifact: `zk/setup/pot12_final.ptau`
- PTau sha256: `ed4298dfb57be7831b9def92e6caa5d584d2c7a1bcf984fb8a9ace6250ed94d8`
- PTau bytes: `4720054`

## Layer Transcript

### VOTE — `private_dao_vote_overlay`

- Source: `zk/circuits/private_dao_vote_overlay.circom`
- Sample input: `zk/inputs/private_dao_vote_overlay.sample.json`
- Proof: `zk/proofs/private_dao_vote_overlay.proof.json`
- Public signals: `zk/proofs/private_dao_vote_overlay.public.json`
- Verification key: `zk/setup/private_dao_vote_overlay_vkey.json`
- Proving key: `zk/setup/private_dao_vote_overlay_final.zkey`
- R1CS: `zk/build/private_dao_vote_overlay.r1cs`
- WASM: `zk/build/private_dao_vote_overlay_js/private_dao_vote_overlay.wasm`
- Witness: `zk/proofs/private_dao_vote_overlay.wtns`
- Public signal count: `6`
- Build command: `npm run zk:build:vote`
- Prove command: `npm run zk:prove:vote`
- Verify command: `npm run zk:verify:vote`

Artifact hashes:

- source sha256: `10894814dbd80792f331313330a9e2b560c4c1d6dddfcefd5fd00af16c8290d0`
- sample input sha256: `fda2fceecc017bb179639a955d54809ebb35941b985e6a928098c0feb7740485`
- proof sha256: `8b006e248fe3cc9532d6e351ff15e6a1c962668ff51e00112919ff01f1dc8410`
- public signals sha256: `274280bc7d44e7dd52969cc806ba16236af08a18aefffc0b9000ac6648377a83`
- verification key sha256: `d4973d720f547cbebc64affc52ab678d0bc7135f03bb8f6b221df1ebd49d2469`
- proving key sha256: `479699baf7005dd1081a047a5fccd6704f4dedb5908bb6bf4be88fa8fb71ccd9`
- r1cs sha256: `ca6bc6eccf007559963ded14e2bc528b97c7a03e839884996c71f06a11b1b5c0`
- wasm sha256: `de36974ba8461c2c27e89ed172266bad4cbf18d961e5074658a84e5621e9921f`
- witness sha256: `24a9b5d55a8934bb02eaba520b8f87f2cf8f4df8dafe66c2785763a7fc7c827b`

### DELEGATION — `private_dao_delegation_overlay`

- Source: `zk/circuits/private_dao_delegation_overlay.circom`
- Sample input: `zk/inputs/private_dao_delegation_overlay.sample.json`
- Proof: `zk/proofs/private_dao_delegation_overlay.proof.json`
- Public signals: `zk/proofs/private_dao_delegation_overlay.public.json`
- Verification key: `zk/setup/private_dao_delegation_overlay_vkey.json`
- Proving key: `zk/setup/private_dao_delegation_overlay_final.zkey`
- R1CS: `zk/build/private_dao_delegation_overlay.r1cs`
- WASM: `zk/build/private_dao_delegation_overlay_js/private_dao_delegation_overlay.wasm`
- Witness: `zk/proofs/private_dao_delegation_overlay.wtns`
- Public signal count: `7`
- Build command: `npm run zk:build:delegation`
- Prove command: `npm run zk:prove:delegation`
- Verify command: `npm run zk:verify:delegation`

Artifact hashes:

- source sha256: `b9a63f53fd942f675ca9ffc1a765f17f4bfe87a7bba77244bec582fe6f02fea0`
- sample input sha256: `ed558bdd30408483f4f9b2fd442ca7d53ddb2d76dd652fae68468ab0e1d75b96`
- proof sha256: `c94d61f9201271edf6e86f4970611d59bfea461afa97b605e007ad1a1bbf7294`
- public signals sha256: `715fae38b0d06dd66b637e1c59f30cd38428bc75146b1ed1524a6565ea439c6f`
- verification key sha256: `bb1fa1187507cd88b428bc4d8120290999907560a3761253ff6a68c2985eaf9b`
- proving key sha256: `e382cc1d03d20316a332a8f21f67a25c2b75e4b33348d362f1300c41dec4b202`
- r1cs sha256: `41c5db4f837208142be9ee099b7784666a3ba1195b262cc07127306bfe53627e`
- wasm sha256: `908acca6d51866bde376844f00a99049257c28aa25330a0906b5edec15978674`
- witness sha256: `8fe660ce20c09d3c524916d3cb6c15a3af1156b5e338ae9520dd00f8e10dc9e0`

### TALLY — `private_dao_tally_overlay`

- Source: `zk/circuits/private_dao_tally_overlay.circom`
- Sample input: `zk/inputs/private_dao_tally_overlay.sample.json`
- Proof: `zk/proofs/private_dao_tally_overlay.proof.json`
- Public signals: `zk/proofs/private_dao_tally_overlay.public.json`
- Verification key: `zk/setup/private_dao_tally_overlay_vkey.json`
- Proving key: `zk/setup/private_dao_tally_overlay_final.zkey`
- R1CS: `zk/build/private_dao_tally_overlay.r1cs`
- WASM: `zk/build/private_dao_tally_overlay_js/private_dao_tally_overlay.wasm`
- Witness: `zk/proofs/private_dao_tally_overlay.wtns`
- Public signal count: `7`
- Build command: `npm run zk:build:tally`
- Prove command: `npm run zk:prove:tally`
- Verify command: `npm run zk:verify:tally`

Artifact hashes:

- source sha256: `9cb2cd4b9537bcebc0f6b2414c1937288c085fba6688fb6825db34a6a76ac3ad`
- sample input sha256: `2e6296ad1107b4228114e4bb07f3aa351f83286199256aa335b220c41ba98e26`
- proof sha256: `d60a9cb872c925ce142d78ffebee443471de12e3026cceb59a183b6e4717739d`
- public signals sha256: `f4a395063aa902dc6c943b8941fec71310342cd246d151d9d994e3e85d5046ee`
- verification key sha256: `9e8aad21b0a5aa74cb169f8856643b9d90f5231016f14b648e03a3d87a649ce6`
- proving key sha256: `e0d3a7df3cb6cde5cb3934c8a3f268f0887444c97e77452d209aa4aaf63f10a7`
- r1cs sha256: `2e8d0e3c1ef40f76b9df0404e6ddd223e3b75213e699fd81d29a81b60b5d2883`
- wasm sha256: `eb6dc0cf3078fa6514a3303aa21714f8c5848d8013ea140b0eec3ba72f22cdd0`
- witness sha256: `fe876091a42cff1a172cff96e3cec5546cea6ada02e4ea2e4d50d5b2260948d2`

## Canonical Replay Commands

```bash
npm run build:zk-registry
npm run build:zk-transcript
npm run verify:zk-registry
npm run verify:zk-transcript
npm run verify:zk-docs
npm run verify:zk-consistency
npm run verify:zk-negative
npm run zk:all
```

## Honest Boundary

This transcript proves that the current repository contains a real Circom and Groth16 artifact stack with reproducible layer commands and stable hashes for the tracked zk materials.

It does not claim:

- on-chain verifier integration
- arbitrary hidden execution
- full hidden tally replacement on the deployed Solana program
