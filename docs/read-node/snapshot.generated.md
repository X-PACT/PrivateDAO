# Read Node Snapshot

- Generated at: `2026-09-24T15:19:12.787Z`
- Read path: `backend-indexer`
- RPC endpoint: `https://api.testnet.solana.com`
- RPC pool size: `1`
- Cache entries: `2`
- Cache TTL ms: `15000`
- Program ID: `EP9xE8MJZ6FfyEwLqns6HDdUZBknEa7WGYs1Jzsecuva`
- Slot: `444574092`
- Solana core: `4.3.0`
- Feature set: `3383571666`

## Proposal Coverage

- Proposals indexed: `24`
- Unique DAOs: `23`
- Executed proposals: `10`
- Executable proposals: `3`
- Timelocked proposals: `0`
- ZK-enforced proposals: `0`
- Confidential payout proposals: `3`
- REFHE-configured proposals: `3`
- REFHE-settled proposals: `2`
- REFHE proposals with verifier binding: `2`
- Executable confidential proposals: `0`

## Testnet Load Profiles

- `50` | wallets=`50` | waves=`5` | wave-size=`10` | funding-wave=`5` | target-pdao-ui=`100` | negative=`wrong-voter-record, wrong-delegation-marker, wrong-token-account`
- `100` | wallets=`100` | waves=`5` | wave-size=`20` | funding-wave=`10` | target-pdao-ui=`100` | negative=`wrong-voter-record, wrong-delegation-marker, wrong-token-account, late-reveal`
- `350` | wallets=`350` | waves=`7` | wave-size=`50` | funding-wave=`25` | target-pdao-ui=`100` | negative=`invalid-reveal, late-reveal, execute-replay, wrong-vault, wrong-authority, payout-replay`
- `500` | wallets=`500` | waves=`20` | wave-size=`25` | funding-wave=`10` | target-pdao-ui=`100` | negative=`invalid-reveal, late-reveal, execute-replay, wrong-authority, payout-replay`

## Sample

- `REFHE confidential payroll envelope 2026-05-07` | phase=`Finalized` | recipient=`4Mm5YTRbJuyA8NcWM85wTnx6ZQMXNph2DSnzCCKLhsMD` | amount=`1,000,000 raw token units` | dao=`2gDRTWaNRjiySVdvqoSXnnUYF8CFSaJUxwG6LBg8P1gG`
- `Testnet treasury execution rehearsal` | phase=`Executed` | recipient=`6EaYzwrq8SB6v57ft3EJrF3iTksB87HtBQZeth3k6zPQ` | amount=`0.005 SOL` | dao=`2gDRTWaNRjiySVdvqoSXnnUYF8CFSaJUxwG6LBg8P1gG`
- `Settlement Hardening V3 + REFHE + MagicBlock live proof` | phase=`Executed` | recipient=`5vQiGkrsfz3wjeFWcPDFLAZV8Xyp36QRWatkh7Rt2FVj` | amount=`50,000,000 raw token units` | dao=`B8kydmvWdwNvGoGhgdP7oTNPphzNs2E6wfXpAoxHpeoo`
- `Confidential payroll batch / April` | phase=`Finalized` | recipient=`pending` | amount=`Pending exact amount from the indexed proposal record` | dao=`DscQ2dMffeMx7Zag2K4c2WwdNA1FZKbXSuURdUJzEG6T`
- `Confidential payroll batch / April55555555` | phase=`Finalized` | recipient=`pending` | amount=`Pending exact amount from the indexed proposal record` | dao=`EQcWzmUvqhd1ihEaxwRgoZt7xM4PBCPSdrkGYQLC4Jvg`

## Proposal Registry

- Registry entries: `24`
- Executed: `10`
- Evidence gated: `3`
- Execution ready: `3`

## Featured Proposal Contexts

- `payroll` | phase=`Finalized` | proposal=`4A2qwBvTKYL9kGzjCNHaSCp8jJXcMRaFxPMWf5NJ2qBt` | recipient=`Confidential settlement wallet` | mint=`SPL token`
- `gaming` | phase=`Executed` | proposal=`3oJ4hkmHr7dZ29MAREMAvDgMxYAMKbrHrFFbZG7TWTuQ` | recipient=`MagicBlock settlement corridor` | mint=`7VoozT9PVXieCZoB6KrNUQ8g2PDyBoVrhGy82NKGUudg`
- `grant` | phase=`Executed` | proposal=`27FtqDFgsKTqQXUSTPGatffYiQ5mQbuq4PFS4AzHX4uR` | recipient=`6EaYzwrq8SB6v57ft3EJrF3iTksB87HtBQZeth3k6zPQ` | mint=`SOL`

## Featured Proposal Registry

- `PDAO-001-2GDR` | `REFHE confidential payroll envelope 2026-05-07` | status=`Evidence gated` | treasury=`Confidential payout still gated for 1,000,000 units to 4Mm5…hsMD via mint native asset`
- `PDAO-000-2GDR` | `Testnet treasury execution rehearsal` | status=`Executed` | treasury=`0.005 SOL sent to 6EaY…6zPQ`
- `PDAO-000-B8KY` | `Settlement Hardening V3 + REFHE + MagicBlock live proof` | status=`Executed` | treasury=`Confidential payout executed for 50,000,000 units to 5vQi…2FVj via mint 7Voo…Uudg`
