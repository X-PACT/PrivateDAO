# Torque Event Delivery Evidence (2026-04-24)

## Purpose

Record accepted Torque ingestion events used as runtime proof for the growth-loop lane.

## Accepted events

### Event 1

- status: `ACCEPTED`
- ingestionId: `e3a8cf2c-2056-45f5-b161-f179f0d66e70`
- receivedAt: `2026-04-24T06:10:35.822Z`
- eventName: `private_treasury_execution`
- data:
  - amount: `1250`
  - type: `audd_pusd_rebalance`
  - success: `true`

### Event 2

- status: `ACCEPTED`
- ingestionId: `d34ebdbe-7ce4-4dfb-b0a1-d322e61f3883`
- receivedAt: `2026-04-24T06:14:51.164Z`
- eventName: `private_treasury_execution`
- data:
  - amount: `2750`
  - type: `private_payroll_batch`
  - success: `true`

## Ingestion API

- endpoint: `https://ingest.torque.so/events`
- auth header: `x-api-key`

