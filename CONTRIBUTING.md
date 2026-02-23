# Contributing

<<<<<<< ours
## Development flow
1. Create a feature branch.
2. Keep changes small and focused.
3. Run verification:
   ```bash
   bash scripts/verify.sh
   ```
4. Open a pull request with context, risk, and test evidence.

## Code standards
- Keep documentation accurate to real behavior.
- Avoid placeholder logic in frontend and tests.
- Prefer deterministic tests.
=======
Thanks for contributing to PrivateDAO.

## Development flow

1. Fork and create a feature branch.
2. Keep changes scoped and reproducible.
3. Run verification locally:

```bash
./scripts/verify.sh
anchor test
```

4. Update docs when behavior changes.
5. Open a PR using the provided template.

## Standards

- Keep code and docs accurate.
- Do not add placeholder/mock behavior to user-facing demo paths.
- Keep Solana/Anchor config consistent across code and docs.
>>>>>>> theirs
