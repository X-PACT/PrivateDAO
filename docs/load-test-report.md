# Devnet Load Test Report

## Overview

- number of wallets: 50
- network: devnet
- program id: `5AhUsbQ4mJ8Xh7QJEomuS85qGgmK9iNvFqzF669Y7Psx`
- governance mint: `AZUkprJDfJPgAp7L4z3TpCV3KHqLiA8RjHAVhK9HCvDt`
- total tx count: 223
- zk participation summary: 5 zk tester wallets, 7 zk proof artifacts

## DAO Bootstrap Results

- DAO: `DZvgwbANngbvDViiF3DtexaVM7V3vkWxHwR4GMdd9Paj`
- Treasury: `7cnFuUj1B1qCx9Soy2n4KLyABF6qaq5rvxgt7b4396bw`
- Proposal: `EkxgKFqH2uewTEsEU4LfV8bvdX5WUX5SwsS1p186Vrtn`
- create-dao tx: `2aHnkaEqiWok2qmcXAsXTDPPGpbUNMMCiY1rMf5Jvt1v2ZnPzpRDNUU63qGHeub9QuYFsnZnmKaVh8nZZtujR1Bc`
- deposit tx: `63HQMgXiMd4h2EwFitCxNv4c4fJWGagjyo8TUvPX6rmPXUpJD7TpGUUXNsgGsMhXeik2dagwdaem1SmXSHq1K42Q`
- create-proposal tx: `188wGF4ZKepivu3j41MHzgMKzs5Gmh3soJEjPtb7RB5GuJAJ4ww34mJZ8mJ5zBeZtz6D9R5BjLNgJq2m64Vsfgp`

## Commit Wave Results

- total commit-capable wallets: 40
- successful commits: 40
- adversarial commit rejections: 10
- wave size: 10

## Reveal Results

- successful reveals: 35
- late reveal attempts: 5
- replay and invalid reveal rejections: 34

## Finalize Results

- finalize success tx count: 1
- duplicate finalize rejections: 1

## Execute Results

- execute success tx count: 1
- pre-unlock execute rejections: 1
- treasury miswiring rejections: 1
- duplicate execute rejections: 1

## ZK Verification Results

- verification mode: off-chain Groth16 companion layer
- on-chain verifier integration: not present in the current protocol
- zk proof entries: 7
- vote proof entries: 5
- tally proof entries: 1
- delegation proof entries: 1

## Adversarial Results

- total adversarial scenarios: 50
- rejected as expected: 49
- unexpected successes: 0

## Performance Metrics

- total execution time ms: 4588011
- average tx latency ms: 1660.69
- failure rate: 23.34%
- retry rate: 0.70%

## Interpretation

This run demonstrates that PrivateDAO can execute a full Devnet governance lifecycle with 50 persistent wallets under wave-based submission, while preserving deterministic reviewer artifacts and explorer-verifiable transaction evidence. The successful commit, reveal, finalize, and execute paths remained reproducible, and the negative-path scenarios were rejected without advancing proposal lifecycle state or bypassing treasury controls.
