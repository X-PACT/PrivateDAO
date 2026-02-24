# PrivateDAO — Complete Deployment Guide
### Solana Graveyard Hackathon 2026

<p align="center">
  <img src="docs/assets/logo.png" alt="PrivateDAO logo 🚀" width="150" />
</p>

---

## Prerequisites (one-time install)

```bash
# 1. Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
solana --version   # should be >= 1.18

# 2. Rust (required for Anchor)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env

# 3. Anchor CLI
cargo install --git https://github.com/coral-xyz/anchor anchor-cli --locked
anchor --version   # should be >= 0.30

# 4. Node.js >= 18 — https://nodejs.org
node --version

# 5. Yarn
npm install -g yarn
```

---

## Quick Start — Full Devnet Deploy

```bash
# 1. Configure Helius RPC
cp .env.example .env
# Edit .env and add your HELIUS_API_KEY
# Get free key at: https://dev.helius.xyz (devnet = free, no credit card)

# 2. Run the full deploy script (does everything)
./deploy.sh
```

That's it. The script handles: wallet creation, airdrop, build, deploy, and demo test.

---

## Step-by-Step (Manual)

### Step 1 — Configure Helius RPC

Get your free API key at https://dev.helius.xyz

```bash
cp .env.example .env
```

Edit `.env`:
```
HELIUS_API_KEY=your_actual_key_here
SOLANA_RPC_URL=https://devnet.helius-rpc.com/?api-key=your_actual_key_here
SOLANA_WSS_URL=wss://devnet.helius-rpc.com/?api-key=your_actual_key_here
SOLANA_CLUSTER=devnet
ANCHOR_WALLET=~/.config/solana/id.json
PROGRAM_ID=DnQTB3T6xWenyi7LYRsDADfqrKwGJntAaxStaePVkzhs
```

### Step 2 — Wallet Setup

```bash
# Generate wallet if you don't have one
solana-keygen new --outfile ~/.config/solana/id.json

# Configure CLI to use devnet with Helius
solana config set \
  --url "https://devnet.helius-rpc.com/?api-key=YOUR_KEY" \
  --keypair ~/.config/solana/id.json

# Get devnet SOL (free)
solana airdrop 2

# Optional fallback: your own faucet API (for strict rate limits)
export CUSTOM_FAUCET_URL="https://your-faucet-domain/api/airdrop"
export CUSTOM_FAUCET_METHOD="POST"
bash scripts/fund-devnet.sh 2

# Verify
solana balance
# Should show: 2 SOL
```

Backup your wallet key:
```
cat ~/.config/solana/id.json  # 64-number JSON array — save this somewhere safe
```

### Step 3 — Build

```bash
yarn install
anchor build
```

Build output:
```
target/deploy/private_dao.so        ← compiled program
target/idl/private_dao.json         ← IDL (interface definition)
target/types/private_dao.ts         ← TypeScript types
```

### Step 4 — Deploy

```bash
# Make sure you're on devnet with Helius RPC
solana config get

# Deploy (costs ~2-3 SOL in devnet for rent)
anchor deploy --provider.cluster devnet
```

Output:
```
Deploying cluster: https://devnet.helius-rpc.com/?api-key=...
Upgrade authority: <YOUR_WALLET>
Deploying program "private_dao"...
Program Id: DnQTB3T6xWenyi7LYRsDADfqrKwGJntAaxStaePVkzhs

Deploy success
```

**Important:** If the Program Id shown differs from what's in `declare_id!()`, update it:
```bash
NEW_ID="<actual deployed id>"
sed -i "s/DnQTB3T6xWenyi7LYRsDADfqrKwGJntAaxStaePVkzhs/$NEW_ID/" \
  programs/private-dao/src/lib.rs
anchor build && anchor deploy --provider.cluster devnet
```

### Step 5 — Verify Deployment

```bash
# Check program on-chain
solana program show DnQTB3T6xWenyi7LYRsDADfqrKwGJntAaxStaePVkzhs

# Or view on Solscan
# https://solscan.io/account/DnQTB3T6xWenyi7LYRsDADfqrKwGJntAaxStaePVkzhs?cluster=devnet
```

---

## Running a Full DAO Flow on Devnet

### Create a DAO

```bash
# DualChamber mode (capital + community both required)
ANCHOR_PROVIDER_URL="https://devnet.helius-rpc.com/?api-key=YOUR_KEY" \
  yarn create-dao -- \
    --name "MyDAO" \
    --quorum 51 \
    --mode dual \
    --delay 86400

# Save the output:
# DAO_PDA=<address>
# GOVERNANCE_MINT=<address>
```

### Create a Proposal

```bash
ANCHOR_PROVIDER_URL="..." yarn create-proposal -- \
  --dao $DAO_PDA \
  --title "Fund community education: 0.1 SOL" \
  --duration 3600 \
  --treasury-recipient <RECIPIENT_WALLET> \
  --treasury-amount 0.1
```

### Commit Votes (from multiple wallets)

```bash
# Voter 1 (simple)
ANCHOR_PROVIDER_URL="..." yarn commit -- \
  --proposal $PROPOSAL_PDA \
  --vote yes

# Voter 2 (with keeper — keeper will reveal if voter forgets)
ANCHOR_PROVIDER_URL="..." yarn commit -- \
  --proposal $PROPOSAL_PDA \
  --vote yes \
  --keeper <KEEPER_WALLET_PUBKEY>

# Voter 3 (after delegating from another wallet)
# First delegate:
ANCHOR_PROVIDER_URL="..." yarn delegate -- \
  --proposal $PROPOSAL_PDA \
  --delegatee <VOTER3_PUBKEY>
# Then voter3 commits with combined weight:
ANCHOR_PROVIDER_URL="..." yarn commit -- \
  --proposal $PROPOSAL_PDA \
  --vote yes \
  --delegator <DELEGATOR_PUBKEY>
```

### Reveal Votes (after voting ends)

```bash
# Voter reveals their own vote
ANCHOR_PROVIDER_URL="..." yarn reveal -- --proposal $PROPOSAL_PDA

# Keeper reveals on behalf of someone
ANCHOR_WALLET=~/.config/solana/keeper-id.json \
ANCHOR_PROVIDER_URL="..." yarn reveal -- \
  --proposal $PROPOSAL_PDA \
  --voter <VOTER_WHO_AUTHORIZED_KEEPER>
```

### Finalize (after reveal window)

```bash
ANCHOR_PROVIDER_URL="..." yarn finalize -- --proposal $PROPOSAL_PDA
```

### Execute (after timelock expires)

```bash
ANCHOR_PROVIDER_URL="..." yarn execute -- --proposal $PROPOSAL_PDA
```

---

## Migrate an Existing Realms DAO

```bash
ANCHOR_PROVIDER_URL="https://devnet.helius-rpc.com/?api-key=YOUR_KEY" \
  yarn migrate -- \
    --governance <REALMS_GOVERNANCE_PUBKEY> \
    --name "MyDAO-Private" \
    --mint <GOVERNANCE_TOKEN_MINT> \
    --quorum 51 \
    --reveal-window 86400
```

This creates a PrivateDAO mirroring your Realms config:
- Same governance token
- No treasury migration
- No existing proposals affected
- Records Realms governance pubkey for provenance

---

## Local Development (no devnet needed)

```bash
# Terminal 1
yarn localnet         # solana-test-validator --reset

# Terminal 2
anchor build
anchor test           # all tests
yarn demo             # just the demo
```

---

## WebSocket Usage (Helius)

For real-time event monitoring in your frontend:

```typescript
import { Connection } from "@solana/web3.js";

const connection = new Connection(
  "https://devnet.helius-rpc.com/?api-key=YOUR_KEY",
  {
    wsEndpoint: "wss://devnet.helius-rpc.com/?api-key=YOUR_KEY",
    commitment: "confirmed",
  }
);

// Subscribe to program account changes
connection.onProgramAccountChange(
  new PublicKey("DnQTB3T6xWenyi7LYRsDADfqrKwGJntAaxStaePVkzhs"),
  (info) => console.log("Account changed:", info.accountId.toBase58()),
  "confirmed",
);

// Subscribe to logs (events)
connection.onLogs(
  new PublicKey("DnQTB3T6xWenyi7LYRsDADfqrKwGJntAaxStaePVkzhs"),
  (logs) => console.log("Event:", logs.logs),
);
```

---

## Submission Checklist

Submit at: **https://app.superteam.fun** → Solana Graveyard Hackathon 2026
**Deadline: February 28, 2026**

### DAOs Track ($5,000 — Realms)
- [ ] Program deployed on devnet
- [ ] Demo video showing commit-reveal flow
- [ ] Realms VoterWeightRecord plugin working
- [ ] migrate_from_realms instruction demonstrated

### Migrations Track ($7,000 — Sunrise)  
- [ ] migrate-realms-dao.ts working on devnet
- [ ] Migration report JSON output
- [ ] Before/after comparison shown

### Overall Track ($15,000 — Solana Foundation)
- [ ] GitHub repo with clean README
- [ ] Deployed program ID on devnet
- [ ] Demo video (recommended: 3-5 min Loom)
- [ ] Highlights: DualChamber, Private Delegation, Timelock

### Demo Video Script (suggested)
1. (0:00) Problem: show a public Realms vote being front-run
2. (0:45) Solution: show commit phase with YES: 0 NO: 0
3. (1:30) Reveal phase — tally unlocks after voting ends  
4. (2:00) DualChamber — whale can't pass without community
5. (2:45) Private delegation — weight combined secretly
6. (3:15) Timelock — treasury waits 24h before executing
7. (3:45) Keeper auto-reveal — voter doesn't need to return

---

## Program Info

```
Program ID:   DnQTB3T6xWenyi7LYRsDADfqrKwGJntAaxStaePVkzhs
Network:      Solana Devnet
Framework:    Anchor 0.32
Language:     Rust (Solana BPF target)
IDL:          target/idl/private_dao.json
Explorer:     https://solscan.io/account/DnQTB3T6xWenyi7LYRsDADfqrKwGJntAaxStaePVkzhs?cluster=devnet
```
