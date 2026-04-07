# Devnet Resilience Report

- network: devnet
- program id: `5AhUsbQ4mJ8Xh7QJEomuS85qGgmK9iNvFqzF669Y7Psx`
- governance mint: `AZUkprJDfJPgAp7L4z3TpCV3KHqLiA8RjHAVhK9HCvDt`
- source wallet run: `20260407202442`
- primary rpc healthy: yes
- fallback rpc healthy: yes
- failover recovered: yes
- stale blockhash rejected: yes
- stale blockhash recovered: yes
- unexpected successes: 0

## RPC Health Matrix

- primary: `https://api.devnet.solana.com` | version `3.1.10` | blockhash `999yuXkuJAvBSYXJxWS5SAULsVi7MY2zoyz2jDhAPHWF` | version latency 1724 ms | blockhash latency 1086 ms
- fallback: `https://api.devnet.solana.com` | version `3.1.10` | blockhash `2jMavqixzQawsqZ5swNWftLthRm3EmFEdgnyZY2vCyiW` | version latency 3624 ms | blockhash latency 341 ms

## Failover Recovery

- invalid rpc: `http://127.0.0.1:65535`
- invalid rpc error: fetch failed
- fallback rpc: `https://api.devnet.solana.com`
- fallback blockhash: `BygAd7qt7wwcgpB3cdhV3yrGkBAqPCbPM8QBvfXJA4yZ`
- fallback latency: 229 ms

## Stale Blockhash Recovery

- probe wallet: `JDaW1PntvyheypPK963TcjFqq1RzMD3CP9SSWDLkHjNu`
- stale blockhash: `11111111111111111111111111111111`
- stale error: Simulation failed. 
Message: Transaction simulation failed: Blockhash not found. 
Logs: 
[]. 
Catch the `SendTransactionError` and call `getLogs()` on it for full details.
- fresh blockhash: `FdJdG9BY8SW8j4cVZrwTezTriWgN4PUwEy5hRAW6EHP1`
- recovered tx: `2baU3KWmnsM6MRq5uDrjr7WSvQzMvC6BbwsDKyqX4URXoAujdPF1JGsuBimr8YKsCdXBRTKdLYVh9iREAZXgnA17`
- recovered explorer: https://solscan.io/tx/2baU3KWmnsM6MRq5uDrjr7WSvQzMvC6BbwsDKyqX4URXoAujdPF1JGsuBimr8YKsCdXBRTKdLYVh9iREAZXgnA17?cluster=devnet
- probe balance before: 78006400
- probe balance after: 78006401
- probe balance delta: 1

## Interpretation

This resilience harness proves that the Devnet operator surface can recover from a dead RPC endpoint and from a transaction assembled with a stale blockhash. The successful path is a rejected stale transaction followed by one recovered transaction on a fresh blockhash, without protocol mutation drift or ambiguous retry behavior.
