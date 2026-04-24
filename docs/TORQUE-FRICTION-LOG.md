# Torque Friction Log

## Scope
- Product lane: `/services/torque-growth-loop`
- Runtime tie-in: private settlement events and operation receipts.

## Confirmed behavior
- Custom events can be tied to real product actions.
- Event payload structure is sufficient for growth/reward traceability.
- Proof route can expose event-linked continuity at reviewer level.

## Friction observed
1. Event debugging requires clearer inline status in UI.
2. Payload validation errors should return user-readable guidance immediately.
3. Campaign-level mapping is not yet centralized in one operator panel.

## Recommended next improvements
1. Add event delivery status chip per action (`queued`, `sent`, `confirmed`, `failed`).
2. Add event payload schema preview in UI before submission.
3. Add campaign mapping panel with filter by route/event type.

