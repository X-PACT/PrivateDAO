# Devnet Resilience Report

- network: devnet
- program id: `5AhUsbQ4mJ8Xh7QJEomuS85qGgmK9iNvFqzF669Y7Psx`
- governance mint: `AZUkprJDfJPgAp7L4z3TpCV3KHqLiA8RjHAVhK9HCvDt`
- source wallet run: `20260404110609`
- primary rpc healthy: yes
- fallback rpc healthy: yes
- failover recovered: yes
- stale blockhash rejected: yes
- stale blockhash recovered: yes
- unexpected successes: 0

## RPC Health Matrix

- primary: `https://api.devnet.solana.com` | version `3.1.10` | blockhash `A1JvqpXHncVNN1TSz1znbjAb9vtpznNSMEbF4siUNGCp` | version latency 1379 ms | blockhash latency 266 ms
- fallback: `https://api.devnet.solana.com` | version `3.1.10` | blockhash `FxaTsvWDrmCihMMrDJPEgtF9bXhaXgZUPVg1bVfLyc6T` | version latency 1153 ms | blockhash latency 302 ms

## Failover Recovery

- invalid rpc: `http://127.0.0.1:65535`
- invalid rpc error: fetch failed
- fallback rpc: `https://api.devnet.solana.com`
- fallback blockhash: `3gxUoQwrB8f2g9gLPuyZ9qZHRKdR8d2fTXD5p26BiPEu`
- fallback latency: 325 ms

## Stale Blockhash Recovery

- probe wallet: `Bog4dEsJk1wJstwoLwkSdvsCy16sbHhzZ1yFeqP3xv1D`
- stale blockhash: `11111111111111111111111111111111`
- stale error: Simulation failed. 
Message: Transaction simulation failed: Blockhash not found. 
Logs: 
[]. 
Catch the `SendTransactionError` and call `getLogs()` on it for full details.
- fresh blockhash: `4p2awMRKUbwz4xGgbfddqYQr8vrPwu8ydyifCFby83Rg`
- recovered tx: `5mGQHRwULFrHC6Y1Avt7eRWivvcKG7wauppjEHuXn1vxnpuANG1aXwTCM1CP1dnvPqWjfFGW7EickQKgAsPxUUkT`
- recovered explorer: https://solscan.io/tx/5mGQHRwULFrHC6Y1Avt7eRWivvcKG7wauppjEHuXn1vxnpuANG1aXwTCM1CP1dnvPqWjfFGW7EickQKgAsPxUUkT?cluster=devnet
- probe balance before: 80000000
- probe balance after: 80000001
- probe balance delta: 1

## Interpretation

This resilience harness proves that the Devnet operator surface can recover from a dead RPC endpoint and from a transaction assembled with a stale blockhash. The successful path is a rejected stale transaction followed by one recovered transaction on a fresh blockhash, without protocol mutation drift or ambiguous retry behavior.
