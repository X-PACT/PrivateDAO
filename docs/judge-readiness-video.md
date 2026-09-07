# PrivateDAO Judge Readiness Video

This is a narrow repo-native render asset for a new **3-minute English demo video** focused on PrivateDAO readiness.

It reuses the existing terminal render pattern from `scripts/render-demo-video.sh`, `scripts/render-frontier-overview-video.sh`, and `scripts/render-private-dao-3min-product-video.sh`: static 1280x720 ffmpeg scenes, 5 fps slide-video MP4 output, generated motivational music, and poster generation.

## Render Targets

- Render script: `scripts/render-judge-readiness-video.sh`
- MP4: `docs/assets/private-dao-judge-readiness-3min.mp4`
- Poster: `docs/assets/private-dao-judge-readiness-3min-poster.png`
- Hosted MP4 asset: `apps/web/public/assets/private-dao-judge-readiness-3min.mp4`
- Hosted poster asset: `apps/web/public/assets/private-dao-judge-readiness-3min-poster.png`
- Desktop copy: `/home/x-pact/Desktop/PrivateDAO-Judge-Readiness-Video/PrivateDAO - Judge Readiness 3 Minute Demo.mp4`

## Hosting Policy

Use YouTube as the primary judge-page embed after upload. This keeps bandwidth away from GitHub Pages, Supabase, AWS, and mirrors during judging spikes.

Keep the hosted MP4 as a fallback/download artifact only. The site should use `preload="none"` for the local MP4 unless it is the only available playback path.

## Render Command

```bash
ccp bash scripts/render-judge-readiness-video.sh
```

## Dependencies

Required local tools:

- `ffmpeg`
- DejaVu fonts at `/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf` and `/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf`

Ubuntu/Debian install command:

```bash
sudo apt-get update && sudo apt-get install -y ffmpeg fonts-dejavu-core
```

Fallback if rendering is unavailable: use this document as the shot list, record the live app manually, and keep the same claim boundaries.

## Current Render Verification

Latest local render:

- duration: `180.000000` seconds
- video: `h264`, `1280x720`, `5 fps`
- audio: `aac`, generated motivational music bed from local `ffmpeg` oscillators
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

## Upload Notes

Suggested YouTube title:

`PrivateDAO Judge Readiness: Confidential Governance, Encrypted Operations, Testnet Proof`

Suggested description:

`PrivateDAO is a Solana Testnet product for private governance, confidential treasury operations, encrypted payroll, intelligence-assisted signing, and reviewer-visible proof. Awards: Superteam Poland 1st place, UAE Frontier Hackathon 3rd place, selected in Arena. Inspect the live proof path at https://privatedao.org/judge/`
