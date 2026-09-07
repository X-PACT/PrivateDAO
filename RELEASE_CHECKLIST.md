# Release Checklist

- [ ] `git diff --check` passes
- [ ] `anchor build` passes
- [ ] `cargo test -p private-dao --lib -- --nocapture` passes
- [ ] `bash scripts/check-mainnet-readiness.sh` passes
- [ ] Devnet wallet funded (`bash scripts/fund-devnet.sh`)
- [ ] External devnet contracts validated (`bash scripts/check-contracts.sh <ADDR1> <ADDR2>`)
- [ ] Program deployed and program id updated in `Anchor.toml`
- [ ] Live proof links reviewed in `docs/live-proof.md`
- [ ] Judge audit note reviewed in `docs/judge-technical-audit.md`
- [ ] Mainnet readiness note reviewed in `docs/mainnet-readiness.md`
- [ ] Demo walkthrough checked in `docs/index.html#demo`
- [ ] `SUBMISSION.md` reflects current capabilities
- [ ] CHANGELOG updated with release notes
