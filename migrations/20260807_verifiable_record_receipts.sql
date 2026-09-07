-- Future new Supabase project migration. Do not run against current production.
create table if not exists public.verifiable_record_receipts (
  receipt_id text primary key,
  organization_id text not null,
  record_type text not null,
  record_id text not null,
  issuer text not null,
  canonicalization_version text not null,
  canonical_record_digest text not null,
  schema_id text not null,
  schema_version text not null,
  schema_digest text not null,
  policy_id text,
  policy_version text,
  policy_digest text,
  verification_status text not null check (verification_status in ('VERIFIED', 'INVALID')),
  proof_profile text,
  proof_digest text,
  evidence_digest text not null,
  anchor_network text not null default 'pending',
  anchor_reference text,
  public_fields jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (organization_id, receipt_id)
);
create unique index if not exists verifiable_record_receipts_org_digest_idx on public.verifiable_record_receipts (organization_id, canonical_record_digest, coalesce(policy_digest, 'none'));
create table if not exists public.verifiable_record_idempotency (
  organization_id text not null,
  idempotency_key text not null,
  receipt_id text,
  status text not null,
  created_at timestamptz not null default now(),
  primary key (organization_id, idempotency_key)
);
alter table public.verifiable_record_receipts enable row level security;
alter table public.verifiable_record_idempotency enable row level security;
-- Add tenant policies in the new project after the organization identity model is finalized.
