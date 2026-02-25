<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
# Build & Deploy — Troubleshooting

## Known issues and their fixes

---

### Error: `cannot find 'hash' in 'solana_program'`

**Root cause:** Anchor 0.32 pulls in `solana-program 2.x`, which removed the
`hash::hash()` function from the public API. The fix is already applied in
this repo: we use the `sha2` crate directly instead.

**What changed in `Cargo.toml`:**
```toml
# workspace Cargo.toml — [workspace.dependencies]
sha2 = "0.10"

# programs/private-dao/Cargo.toml — [dependencies]
sha2 = { workspace = true }
```

**What changed in `lib.rs`:**
```rust
// Added at the top:
use sha2::{Sha256, Digest};

// Replaced the broken hash::hash() call with:
let computed: [u8; 32] = Sha256::digest(&preimage).into();
require!(computed == vr.commitment, Error::CommitmentMismatch);
```

`sha2` compiles for the SBF target and is used in many production Solana programs.
The SHA256 output is identical to what `solana_program::hash::hash()` produced.

---

### Error: `anchor build` fails with `edition2024 feature required`

This is a Cargo version issue, not a code issue. `anchor build` uses a bundled
Cargo that may be too old.

**Fix — use `cargo build` directly:**
```bash
cargo build --target sbf-solana-solana
```

Or upgrade your Anchor CLI:
```bash
cargo install --git https://github.com/coral-xyz/anchor anchor-cli --locked --force
```

---

### Error: `overflow-checks is not enabled`

Already fixed in `Cargo.toml`. Verify these lines exist:
```toml
[profile.release]
overflow-checks = true
```

---

### Error: `no such command: build-sbf`

The Solana CLI is installed but `cargo-build-sbf` isn't in your PATH.

```bash
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
echo 'export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

cargo build-sbf --version  # verify
```

---

### Error: anchor version mismatch (0.30 vs 0.32)

```bash
yarn upgrade @coral-xyz/anchor@0.31.1
```

---

## Clean Build From Scratch

```bash
# Step 0 — Fix PATH (Parrot Linux / Debian-based)
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
export PATH="$HOME/.cargo/bin:$PATH"

# Step 1 — Verify tools
solana --version       # >= 1.18
anchor --version       # >= 0.32
cargo build-sbf --version

# Step 2 — Install Node packages
yarn install

# Step 3 — Build the program
anchor build

# Step 4 — Run tests locally (needs solana-test-validator in another terminal)
solana-test-validator --reset &
sleep 5
anchor test -- --grep "demo"

# Step 5 — Deploy to devnet
cp .env.example .env
# Edit .env and add your HELIUS_API_KEY
./deploy.sh
```

---

## After deploy.sh runs

Your program will be live at:
```
https://solscan.io/account/C5Z9tmoCMfdFBTLr2nKT2XMdqJHf1MydDdk7Ni5BASF6?cluster=devnet
```

If the Program ID changed during deploy, the script auto-updates `lib.rs` and rebuilds.

---

## Getting SOL on Devnet

```bash
# preferred: retry script with RPC rotation + custom endpoints
bash scripts/fund-devnet.sh 2

# direct CLI fallback
solana airdrop 2 --url https://api.devnet.solana.com
```

Public devnet faucets are rate-limited and may return `429` during peak times.
If that happens, use `https://faucet.solana.com` manually or switch network/IP.

## Check existing contracts

```bash
bash scripts/check-contracts.sh <ADDRESS_1> <ADDRESS_2>
```

## Cloud build (recommended for low-end hardware)

```bash
gh workflow run CI
gh run watch
```

This runs full build + test in GitHub Actions without local CPU/RAM pressure.

---

## Helius RPC (free devnet)

1. Go to https://dev.helius.xyz
2. Sign up (free, no credit card)
3. Create a project → copy the API key
4. Add to `.env`: `HELIUS_API_KEY=your_key_here`
5. Run `./deploy.sh` — picks it up automatically
