# PrivateDAO Token Verification Action

```yaml
name: Verify token
on: [push]
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: X-PACT/PrivateDAO/integrations/pdao-token-verification-action@main
        with:
          mint: YOUR_SOLANA_MINT
```

The action is read-only, uses `verify.basic`, and requires no secret or wallet.
