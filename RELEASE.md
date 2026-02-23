# Release Checklist

<<<<<<< ours
- [ ] `bash scripts/verify.sh`
- [ ] CI build/test/verify green
- [ ] Devnet deploy workflow succeeded
- [ ] `docs/config.json` contains latest deployed Program ID
- [ ] GitHub Pages demo loads and connects to Phantom
- [ ] README reflects current behavior
- [ ] CHANGELOG updated
=======
## Pre-release

- [ ] `anchor build` passes
- [ ] `anchor test` passes
- [ ] `./scripts/verify.sh` passes
- [ ] README/docs match actual behavior
- [ ] Devnet Program ID references are consistent
- [ ] CHANGELOG updated

## Publish

- [ ] Tag release (`vX.Y.Z`)
- [ ] Create GitHub Release notes
- [ ] Verify GitHub Pages demo is reachable
- [ ] Share release links
>>>>>>> theirs
