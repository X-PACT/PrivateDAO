# مراجعة أمنية بفريق وكلاء GPT-5.5

PrivateDAO security review by a GPT-5.5 agent team

Date: 2026-05-22

Reviewed web commit: `580d0cd8c29692cacd1b4ec1b002b6b03d156990`

Reviewed Android commit: `4300ca3fd513a569dd62f072bdb9ddfa7934e7fa`

Status: internal AI-assisted security review for judging and release hardening.

Boundary: this is not an external audit, not a mainnet readiness certificate, and not a custody sign-off. It is a repository-grounded review of the current web and Android applications, focused on exploitable product, wallet, API, mobile, storage, dependency, and reviewer-surface risk.

## نطاق المراجعة

راجعت مجموعة وكلاء GPT-5.5 تطبيقين:

- Web app: `PrivateDAO/apps/web`, including Next.js API routes, static export behavior, wallet UX, client telemetry, public proof surfaces, environment boundary, and dependency audit.
- Android app: `PrivateDAO-android/apps/android-native`, including manifest, Gradle build configuration, Mobile Wallet Adapter flow, RPC handling, local storage, APK artifact posture, and runtime logs.

تمت المراجعة على أساس Devnet/Testnet الحالي. أي انتقال إلى Mainnet أو real-funds يحتاج مراجعة إضافية، audit خارجي، custody ceremony، rate limits، ومراقبة تشغيلية مغلقة.

## منهجية فريق الوكلاء

استخدمت المراجعة ثلاث مسارات مستقلة:

- Web security agent: فحص API proxies، استخدام مفاتيح الخادم، static export، wallet/client boundaries، وملفات الأسرار.
- Android security agent: فحص MWA، تخزين الجلسات، commit-reveal salts، manifest، debug APK، RPC provider exposure.
- Documentation/security-surface agent: فحص مكان التوثيق، طريقة عرضه في `/documents` و`/viewer`، ورصد العبارات الأمنية التي تحتاج تحديثاً.

ثم تم دمج النتائج محلياً مع فحص يدوي إضافي شمل `npm audit --omit=dev --audit-level=high` وقراءة الملفات عالية الحساسية.

## ملخص تنفيذي

PrivateDAO يقدم مساراً قوياً: كل تنفيذ حساس يجب أن يبقى عند حدود Review -> Sign -> Verify، والمحفظة هي بوابة التوقيع. لا توجد نتيجة في هذه المراجعة تقول إن الواجهة نفسها تملك مفاتيح مستخدمين أو تتجاوز المحفظة.

لكن توجد بوابات أمنية يجب إغلاقها قبل تقديم أي ادعاء production/mainnet:

- أعلى خطر حالي في الويب هو وجود API relay لمسار private settlement يمكنه، إذا نُشر مع credentials، تمرير intent من مستخدم عام إلى relay خارجي باسم PrivateDAO.
- مسارات API التي تستخدم مفاتيح خادم تحتاج authentication/rate limits حتى لا تصبح proxy عام لاستهلاك quotas أو تزوير events.
- تطبيق Android الحالي المرفوع كـ debug APK يصلح كتجربة Testnet للحكام، لكنه ليس artifact إنتاجياً: يحتاج signed non-debuggable staging/release APK قبل أي توزيع أوسع.
- تخزين MWA auth token وcommit-reveal salt في SharedPreferences مع backup مفعّل يجب تصحيحه قبل اعتبار التصويت الخاص آمناً على أجهزة حقيقية.
- dependency audit وجد ثغرات عالية عبر سلسلة `@solana/web3.js`/`bigint-buffer`; الإصلاح التلقائي المقترح كاسر، لذلك يجب التعامل معه كـ release gate لا كـ `audit fix --force` عشوائي.

## النتائج المؤكدة

### P1 - Public private-settlement relay can forward arbitrary intents with server credentials

Severity: High

Affected files:

- `apps/web/src/app/api/private-settlement/intent/route.ts`
- `apps/web/src/components/private-settlement-rail-workbench.tsx`

Evidence:

- The route accepts unauthenticated `POST` in `apps/web/src/app/api/private-settlement/intent/route.ts`.
- It normalizes caller-controlled `rail`, `amount`, `recipient`, and memo fields.
- If `CLOAK_RELAY_URL` or `UMBRA_RELAY_URL` is configured, it forwards the payload with `Authorization: Bearer <relay-api-key>`.
- The client surface defaults toward an external `api.privatedao.org` private settlement endpoint.

Exploit path:

An attacker can post arbitrary settlement intents. If relay credentials are live, the server can forward that request as PrivateDAO infrastructure.

Required fix:

- Require authenticated operator/session authorization before relay forwarding.
- Require signed intent or HMAC with timestamp and nonce.
- Enforce strict recipient and amount allowlists for demo/Testnet paths.
- Add replay protection and rate limits.
- Separate "simulation/testnet rehearsal" from "credentialed relay-live" at the API boundary.

Current release decision:

Keep this lane under Testnet/rehearsal language until credentialed forwarding is protected.

### P2 - Server API-key proxy routes are unauthenticated and unrate-limited

Severity: Medium

Affected routes:

- `apps/web/src/app/api/dune/balances/route.ts`
- `apps/web/src/app/api/dune/transactions/route.ts`
- `apps/web/src/app/api/goldrush/query/route.ts`
- `apps/web/src/app/api/jupiter/order/route.ts`
- `apps/web/src/app/api/torque/custom-event/route.ts`
- `apps/web/src/app/api/zerion/portfolio/route.ts`

Evidence:

These routes read server-side provider keys such as `DUNE_SIM_API_KEY`, `GOLDRUSH_API_KEY`, `JUP_API_KEY`, `TORQUE_API_KEY`, and `ZERION_API_KEY`, then accept public wallet/query inputs without an application-level auth or rate-limit gate in the local route code.

Exploit path:

Public callers can use PrivateDAO as a paid indexer/proxy, consume quotas, submit arbitrary growth events, or create noisy reviewer telemetry.

Required fix:

- Add rate limits per IP/session/wallet.
- Add operator or reviewer-session auth where the endpoint is not meant for open public use.
- Add origin/CSRF controls for browser-only endpoints.
- Use demo-scoped provider keys with constrained quotas.
- Log rejection reasons without logging secrets or full provider URLs.

Current release decision:

Safe enough as a documented Testnet/demo surface only if production keys are quota-limited and backend controls exist outside this repo. Not safe as an unrestricted production proxy.

### P3 - Static export creates a backend split that must be explicit

Severity: Medium

Affected files:

- `apps/web/next.config.ts`
- `apps/web/package.json`
- client callers using `NEXT_PUBLIC_PRIVATE_DAO_API_BASE` or `https://api.privatedao.org`

Evidence:

The public root build is a static export, so local Next.js API routes are not present in `dist/web-mirror-root`. Multiple client paths call `api.privatedao.org` directly.

Exploit path:

Reviewers may believe they are reviewing the exact local API route implementation while the live static site depends on a separately deployed backend.

Required fix:

- Document the authoritative backend deployment and source of truth.
- Add CI/build checks for expected `NEXT_PUBLIC_PRIVATE_DAO_API_BASE`.
- Treat backend API security as a separate release gate.
- Keep static export pages honest: "this site calls the hosted read/API node" where relevant.

Current release decision:

Acceptable for static reviewer site if the backend split is documented and monitored. Not acceptable for mainnet readiness without backend audit evidence.

### P4 - `dynamic = "force-static"` appears on secret-backed API routes

Severity: Medium

Affected files:

- `apps/web/src/app/api/jupiter/order/route.ts`
- `apps/web/src/app/api/torque/custom-event/route.ts`
- `apps/web/src/app/api/goldrush/query/route.ts`
- `apps/web/src/app/api/zerion/portfolio/route.ts`
- Dune API routes

Evidence:

These handlers include `export const dynamic = "force-static"` while also using request-specific inputs and server-side API keys.

Exploit path:

If these routes are deployed on a Next server instead of static export, caching/static route behavior can conflict with request-specific wallet/API responses.

Required fix:

- Remove `force-static` from secret-backed handlers.
- Use `dynamic = "force-dynamic"` or `revalidate = 0`.
- Keep `cache: "no-store"` but do not rely on it as the only signal.

Current release decision:

Fix before any server-rendered deployment of these routes.

### P5 - Android stores wallet session and commit-reveal secrets in backup-eligible plain SharedPreferences

Severity: Medium

Affected files:

- `PrivateDAO-android/apps/android-native/app/src/main/AndroidManifest.xml`
- `PrivateDAO-android/apps/android-native/app/src/main/java/io/xpact/privatedao/android/wallet/WalletSessionStore.kt`
- `PrivateDAO-android/apps/android-native/app/src/main/java/io/xpact/privatedao/android/data/VoteEnvelopeStore.kt`
- `PrivateDAO-android/apps/android-native/app/src/main/java/io/xpact/privatedao/android/presentation/PrivateDaoViewModel.kt`

Evidence:

- `android:allowBackup="true"` is enabled.
- MWA `auth_token` and `wallet_uri` are stored in standard SharedPreferences.
- Commit-reveal salt and vote direction are stored in standard SharedPreferences.

Exploit path:

A backup restore, compromised device, adb/debug extraction, or filesystem-level access can recover wallet session material and unrevealed vote salt. A salt leak breaks commit-reveal privacy before reveal.

Required fix:

- Set `android:allowBackup="false"` for the current app or add backup/data-extraction rules excluding wallet and vote stores.
- Move MWA tokens and vote salts to encrypted hardware-backed storage.
- Clear vote salts after reveal.
- Avoid persisting MWA auth tokens unless required.

Current release decision:

Testnet APK is acceptable for review with disclosure. Production/staging APK must harden this before broader use.

### P6 - Android RPC provider keys can be compiled, displayed, or logged if env-backed endpoints are used

Severity: Medium

Affected files:

- `PrivateDAO-android/apps/android-native/app/build.gradle`
- `PrivateDAO-android/apps/android-native/app/src/main/java/io/xpact/privatedao/android/presentation/PrivateDaoApp.kt`
- `PrivateDAO-android/apps/android-native/app/src/main/java/io/xpact/privatedao/android/solana/SolanaRpcClient.kt`

Evidence:

Gradle can construct RPC URLs from `ALCHEMY_API_KEY`, `HELIUS_API_KEY`, or similar environment variables and embed them in `BuildConfig`. The UI can display RPC route summaries, and logs can include endpoint URLs during failover or error handling.

Exploit path:

If a distributed APK is built with provider-key URLs, users can recover keys from UI, logcat, or decompiled strings and abuse RPC quota.

Required fix:

- Do not embed privileged RPC keys in mobile builds.
- Prefer a backend relay with rate limits.
- Redact query strings and `/v2/<key>` path fragments in UI and logs.
- Add a Gradle release check that fails if RPC URLs contain `api-key=`, `/v2/`, or known provider-key patterns.

Current release decision:

The local debug build did not prove a live key was embedded. Keep this as a conditional release gate.

### P7 - Public Android artifact is a debug APK

Severity: Medium

Affected files:

- `PrivateDAO-android/artifacts/android/PrivateDAO-android-devnet-debug.apk`
- `PrivateDAO-android/artifacts/android/README.md`
- debug merged manifest

Evidence:

The currently published artifact is documented as a debug APK, not production-signed. The debug manifest permits debug surfaces and cleartext/test tooling behavior.

Exploit path:

Reviewers can install it for Testnet proof, but a debug APK is weaker against local attackers, repackaging, and provenance confusion.

Required fix:

- Publish a signed non-debuggable staging/release APK for judging.
- Keep debug APKs clearly labeled as Testnet/debug only.
- Disable cleartext except local debug.
- Remove debug/test manifest components from distributable artifacts.

Current release decision:

Good for judge-visible Testnet demonstration. Not sufficient as production mobile security posture.

### P8 - `.secrets/*.pem` was locally present and not covered by ignore policy

Severity: Low

Affected file:

- `.gitignore`

Evidence:

Local `.secrets/privatedao_onboard_private.pem` existed while root `.gitignore` did not ignore `.secrets/` or `*.pem`.

Exploit path:

A future broad `git add` could commit private onboarding key material.

Fix applied in this review:

`.secrets/` and `*.pem` were added to `.gitignore`.

Follow-up:

Move private keys outside the repo and rotate if any key was ever pushed, shared, or copied into artifacts.

### P9 - Dependency audit flags high-severity Solana dependency chain issues

Severity: High as a release gate; Medium in current Testnet-only product context unless reachable with attacker-controlled binary buffers.

Evidence:

`npm audit --omit=dev --audit-level=high` reported:

- `bigint-buffer`: high severity buffer overflow advisory through the Solana dependency chain.
- `uuid`: moderate advisory through `jayson`/`@solana/web3.js`.
- `ws`: moderate advisory through `rpc-websockets`.
- Total: 12 vulnerabilities, including 3 high.

Important constraint:

The suggested `npm audit fix --force` would install a breaking `@solana/spl-token` version path. This should not be applied blindly during judging.

Required fix:

- Open a dependency-upgrade branch.
- Test `@solana/web3.js`, `@solana/spl-token`, and Anchor compatibility.
- Add a security exception note if no safe upstream fix is available.
- Keep this as a mainnet release blocker until resolved or formally risk-accepted.

## Security language and documentation issues

The documentation agent found several copy risks:

- Some older docs still say Devnet where the current public posture is Testnet-live with Devnet preserved as rehearsal evidence.
- `docs/security-guarantees.md` uses "Guarantees" language; "Security Properties" or "Enforced Properties" is safer.
- `docs/reviewer-telemetry-packet.generated.md` appears stale because it was generated on 2026-05-06 while describing freshness.
- Some ZK/security architecture copy should repeat the additive/off-chain boundary more explicitly.

Recommended fix:

Clean those docs in a separate documentation-hardening pass so public security language does not overstate audit or mainnet status.

## Positive controls observed

The review also confirmed useful controls:

- Browser wallet actions remain wallet-signed; no evidence showed frontend possession of user private keys.
- Visitor transaction capture validates Solana signature and wallet address shapes before telemetry submission.
- Android MWA flow uses wallet-side authorize, reauthorize, and sign/send boundaries.
- Android main manifest exposes only launcher activity; no WebView or `addJavascriptInterface` path was found.
- The public Android page labels the APK as Devnet/Testnet review artifact and exposes SHA-256.
- Public copy now avoids claiming mainnet custody completion.

## Verification commands run

Commands run locally:

```bash
npm audit --omit=dev --audit-level=high
```

Recent validation already completed before this review:

```bash
npm --prefix apps/web run lint
npm -C /home/x-pact/PrivateDAO run web:build:root
npm -C /home/x-pact/PrivateDAO run web:bundle:root
npm -C /home/x-pact/PrivateDAO run web:verify:bundle:root
```

Android validation already completed before this review:

```bash
./gradlew :app:assembleDebug
```

## Not covered

This review did not perform:

- live attack testing against `api.privatedao.org`;
- external relay exploitation;
- Supabase RLS verification;
- deployed CDN/cache header review;
- Solana on-chain program invariant audit;
- decompilation of the published APK beyond manifest/build evidence;
- real-device backup extraction;
- wallet vendor behavior testing;
- external third-party audit.

## Release gate recommendation

For Colosseum/Testnet judging:

- Keep the product live and reviewer-friendly.
- Present this document as evidence of serious security discipline.
- Make clear that the APK is a Testnet/debug artifact and that real-funds production is gated.

Before production or mainnet claims:

- close P1 through P7;
- resolve or risk-accept P9 with documented dependency analysis;
- complete external audit and custody hardening;
- publish signed non-debuggable Android staging/release APK;
- document and verify the hosted backend security boundary.

