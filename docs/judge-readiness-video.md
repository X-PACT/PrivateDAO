# PrivateDAO Judge Readiness Video

This is a narrow repo-native render asset for a new **3-minute English demo video** focused on PrivateDAO readiness.

It reuses the existing terminal render pattern from `scripts/render-demo-video.sh`, `scripts/render-frontier-overview-video.sh`, and `scripts/render-private-dao-3min-product-video.sh`: static 1280x720 ffmpeg scenes, 5 fps slide-video MP4 output, and poster generation.

## Render Targets

- Render script: `scripts/render-judge-readiness-video.sh`
- MP4: `docs/assets/private-dao-judge-readiness-3min.mp4`
- Poster: `docs/assets/private-dao-judge-readiness-3min-poster.png`
- Hosted MP4 asset: `apps/web/public/assets/private-dao-judge-readiness-3min.mp4`
- Hosted poster asset: `apps/web/public/assets/private-dao-judge-readiness-3min-poster.png`
- Desktop copy: `/home/x-pact/Desktop/PrivateDAO-Judge-Readiness-Video/PrivateDAO - Judge Readiness 3 Minute Demo.mp4`

## Render Command

```bash
ccp bash scripts/render-judge-readiness-video.sh
```

## Dependencies

Required local tools:

- `ffmpeg`
- DejaVu fonts at `/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf` and `/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf`
- Optional: `edge-tts` at `/tmp/pdao-media-venv/bin/edge-tts`; otherwise the script uses the local `ffmpeg` `flite` filter for English voiceover.

Ubuntu/Debian install command:

```bash
sudo apt-get update && sudo apt-get install -y ffmpeg fonts-dejavu-core
```

Fallback if rendering is unavailable: use this document as the shot list, record the live app manually, and keep the same claim boundaries.

## Current Render Verification

Latest local render:

- duration: `180.000000` seconds
- video: `h264`, `1280x720`, `5 fps`
- audio: `aac`, mono voiceover generated locally through `ffmpeg flite`
- web path after build/deploy: `/assets/private-dao-judge-readiness-3min.mp4`

## Narrative Boundaries

The video may say:

- PrivateDAO won **1st place at Superteam Poland**.
- PrivateDAO won **3rd place at the UAE Frontier Hackathon**.
- PrivateDAO is **currently selected in Arena**.
- The backend was rebuilt around API readiness, indexed evidence, diagnostics, service corridors, and reviewer-visible proof.
- Encryption and privacy are framed across governance, payroll, rewards, compliance, confidential payments, and scoped disclosure.
- The intelligence layer supports human review before wallet signing.
- Testnet proof is live and should be inspectable through the product and reviewer documents.
- PrivateDAO is **mainnet-candidate** in architecture and product readiness.

The video must not imply:

- Completed external audit.
- Unrestricted real-funds mainnet clearance.
- Production SLA or monitored production ownership unless separately proven.
- Arena win or final Arena result.

## Scene List

1. Three minute judge demo: readiness, proof, backend rebuild, privacy services, and mainnet-candidate discipline.
2. External validation: Superteam Poland 1st place, UAE Frontier Hackathon 3rd place, currently selected in Arena.
3. Product entry: connect, review, sign, verify through the live wallet-first shell.
4. Backend rebuild: API readiness, indexed evidence, diagnostics, and operational telemetry.
5. Encryption everywhere: privacy as a service boundary across governance, payroll, rewards, compliance, and payments.
6. Intelligence layer: QVAC, wallet context, route previews, policy checks, and bounded automation before signing.
7. Testnet proof: proof center, documents, diagnostics, and runtime evidence.
8. Mainnet candidate: ready without overclaiming, with external launch gates explicit.
9. Service corridors: confidential payments, hosted reads, reviewer evidence, diagnostics, and encrypted execution.
10. Judge story: show readiness, product path, and proof boundary in one tight sequence.
11. Why it matters: private operations need public confidence.
12. Close: awards, Testnet proof, backend rebuild, encryption, intelligence, Arena selection, and explicit mainnet path.

## Voiceover Draft

PrivateDAO is now ready for a serious three minute judge review. The story is no longer just private governance. It is a product, a backend, a proof surface, and a launch discipline.

The project already has real external signal: first place at Superteam Poland, third place at the UAE Frontier Hackathon, and current Arena selection. That signal matters, but the demo still leads with what can be inspected.

Start with the product path. A normal operator can connect a Testnet wallet, review the action, sign, and verify the result. Create DAO, submit proposal, private vote, and execute treasury remain part of one operating shell.

The backend has been rebuilt around API readiness, indexed evidence, diagnostics, telemetry, and service corridors. That makes PrivateDAO easier to judge, easier to operate, and easier to package for partners.

Privacy is handled as a service boundary. Governance, payroll, rewards, compliance, confidential payments, and viewing-key style disclosure each explain what stays private and what becomes reviewable evidence.

The intelligence layer supports human approval before the wallet prompt. Local reasoning, wallet context, route previews, and policy checks help the signer understand risk before funds or authority move.

The proof path stays visible. Testnet evidence, proof documents, runtime packets, diagnostics, and reviewer routes show where claims can be checked.

PrivateDAO is mainnet-candidate in architecture and product readiness, but it does not overclaim. Real-funds launch still needs external audit, production authority transfer, monitoring, and operator ownership.

That is the readiness story: awards prove signal, Testnet proof proves motion, the rebuilt backend proves operating direction, and explicit launch gates prove discipline.
