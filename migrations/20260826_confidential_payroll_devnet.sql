-- SPDX-License-Identifier: AGPL-3.0-or-later
-- Confidential Payroll Devnet E2E schema. Mainnet settlement is intentionally excluded.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS payroll_tenants (
  tenant_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  network TEXT NOT NULL CHECK (network = 'solana-devnet'),
  created_at TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'suspended'))
);

CREATE TABLE IF NOT EXISTS payroll_members (
  member_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES payroll_tenants(tenant_id),
  actor_ref TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('maker', 'approver', 'auditor', 'admin')),
  created_at TEXT NOT NULL,
  UNIQUE (tenant_id, actor_ref, role)
);

CREATE TABLE IF NOT EXISTS payroll_policies (
  policy_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES payroll_tenants(tenant_id),
  version INTEGER NOT NULL CHECK (version > 0),
  policy_hash TEXT NOT NULL CHECK (length(policy_hash) = 64),
  jurisdiction TEXT NOT NULL,
  tax_year TEXT NOT NULL,
  max_total_cents INTEGER NOT NULL CHECK (max_total_cents >= 0),
  max_employee_cents INTEGER NOT NULL CHECK (max_employee_cents >= 0),
  allowed_asset TEXT NOT NULL,
  required_approvers INTEGER NOT NULL CHECK (required_approvers > 0),
  allow_self_approval INTEGER NOT NULL CHECK (allow_self_approval IN (0, 1)),
  created_at TEXT NOT NULL,
  UNIQUE (tenant_id, version)
);

CREATE TABLE IF NOT EXISTS payroll_employees (
  employee_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES payroll_tenants(tenant_id),
  employee_ref_ciphertext TEXT NOT NULL,
  recipient_address TEXT NOT NULL,
  recipient_commitment TEXT NOT NULL CHECK (length(recipient_commitment) = 64),
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive')),
  created_at TEXT NOT NULL,
  UNIQUE (tenant_id, recipient_address)
);

CREATE TABLE IF NOT EXISTS payroll_batches (
  batch_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES payroll_tenants(tenant_id),
  policy_id TEXT NOT NULL REFERENCES payroll_policies(policy_id),
  policy_hash TEXT NOT NULL CHECK (length(policy_hash) = 64),
  idempotency_key TEXT NOT NULL,
  manifest_commitment TEXT NOT NULL CHECK (length(manifest_commitment) = 64),
  batch_commitment TEXT NOT NULL CHECK (length(batch_commitment) = 64),
  recipient_root TEXT NOT NULL CHECK (length(recipient_root) = 64),
  gross_cents INTEGER NOT NULL CHECK (gross_cents >= 0),
  tax_cents INTEGER NOT NULL CHECK (tax_cents >= 0),
  deductions_cents INTEGER NOT NULL CHECK (deductions_cents >= 0),
  net_cents INTEGER NOT NULL CHECK (net_cents >= 0),
  employee_count INTEGER NOT NULL CHECK (employee_count > 0),
  state TEXT NOT NULL CHECK (state IN ('DRAFT','CALCULATED','POLICY_CHECKED','PENDING_APPROVAL','APPROVED','SIGNING','SETTLING','PARTIALLY_SETTLED','SETTLED','RECONCILED','VERIFIED','FAILED','CANCELLED','EXPIRED')),
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (tenant_id, idempotency_key)
);

CREATE TABLE IF NOT EXISTS payroll_items (
  item_id TEXT PRIMARY KEY,
  batch_id TEXT NOT NULL REFERENCES payroll_batches(batch_id),
  employee_id TEXT NOT NULL REFERENCES payroll_employees(employee_id),
  payout_id TEXT NOT NULL,
  gross_cents INTEGER NOT NULL CHECK (gross_cents >= 0),
  tax_cents INTEGER NOT NULL CHECK (tax_cents >= 0),
  deductions_cents INTEGER NOT NULL CHECK (deductions_cents >= 0),
  net_cents INTEGER NOT NULL CHECK (net_cents >= 0),
  recipient_commitment TEXT NOT NULL CHECK (length(recipient_commitment) = 64),
  settlement_state TEXT NOT NULL CHECK (settlement_state IN ('PENDING','SIGNED','SUBMITTED','CONFIRMED','CLAIMABLE','CLAIMED','FAILED')),
  tx_signature TEXT,
  error_code TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (batch_id, payout_id),
  UNIQUE (batch_id, employee_id),
  UNIQUE (tx_signature)
);

CREATE TABLE IF NOT EXISTS payroll_approvals (
  approval_id TEXT PRIMARY KEY,
  batch_id TEXT NOT NULL REFERENCES payroll_batches(batch_id),
  actor_ref TEXT NOT NULL,
  decision TEXT NOT NULL CHECK (decision IN ('approved','rejected','cancelled')),
  signature TEXT,
  created_at TEXT NOT NULL,
  UNIQUE (batch_id, actor_ref)
);

CREATE TABLE IF NOT EXISTS payroll_settlement_attempts (
  attempt_id TEXT PRIMARY KEY,
  item_id TEXT NOT NULL REFERENCES payroll_items(item_id),
  idempotency_key TEXT NOT NULL,
  provider TEXT NOT NULL CHECK (provider = 'umbra'),
  network TEXT NOT NULL CHECK (network = 'solana-devnet'),
  request_id TEXT,
  tx_signature TEXT,
  state TEXT NOT NULL CHECK (state IN ('queued','awaiting_signature','submitted','confirmed','failed','expired')),
  error_code TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (item_id, idempotency_key),
  UNIQUE (tx_signature)
);

CREATE TABLE IF NOT EXISTS payroll_verifications (
  verification_id TEXT PRIMARY KEY,
  batch_id TEXT NOT NULL REFERENCES payroll_batches(batch_id),
  public_token_hash TEXT NOT NULL UNIQUE,
  scope TEXT NOT NULL CHECK (scope IN ('public','auditor','finance','custom')),
  proof_hash TEXT NOT NULL CHECK (length(proof_hash) = 64),
  settlement_root TEXT NOT NULL CHECK (length(settlement_root) = 64),
  status TEXT NOT NULL CHECK (status IN ('active','revoked','expired')),
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  revoked_at TEXT
);

CREATE TABLE IF NOT EXISTS payroll_audit_events (
  event_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES payroll_tenants(tenant_id),
  batch_id TEXT REFERENCES payroll_batches(batch_id),
  item_id TEXT REFERENCES payroll_items(item_id),
  actor_ref TEXT NOT NULL,
  event_type TEXT NOT NULL,
  correlation_id TEXT NOT NULL,
  metadata_json TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS payroll_wallet_challenges (
  nonce TEXT PRIMARY KEY,
  wallet TEXT NOT NULL,
  message TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  used_at TEXT
);

CREATE TABLE IF NOT EXISTS payroll_wallet_sessions (
  token_hash TEXT PRIMARY KEY,
  wallet TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  revoked_at TEXT
);

CREATE INDEX IF NOT EXISTS payroll_batches_tenant_state_idx ON payroll_batches(tenant_id, state);
CREATE INDEX IF NOT EXISTS payroll_items_batch_state_idx ON payroll_items(batch_id, settlement_state);
CREATE INDEX IF NOT EXISTS payroll_audit_batch_idx ON payroll_audit_events(batch_id, created_at);
CREATE INDEX IF NOT EXISTS payroll_wallet_sessions_wallet_idx ON payroll_wallet_sessions(wallet, expires_at);
