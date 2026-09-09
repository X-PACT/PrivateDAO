// SPDX-License-Identifier: AGPL-3.0-or-later
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { mkdirSync, readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { dirname, resolve } from "node:path";
import { verifyPayrollGroth16 } from "./payroll-groth16.ts";
import { assertPayrollTransition } from "../../packages/privatedao-runtime/src/payroll.ts";
import type { PayrollState } from "../../packages/privatedao-runtime/src/payroll.ts";

export type SettlementState = "PENDING" | "SIGNED" | "SUBMITTED" | "CONFIRMED" | "CLAIMABLE" | "CLAIMED" | "FAILED";

export { assertPayrollTransition as assertTransition };
export function sha256(value: string) { return createHash("sha256").update(value).digest("hex"); }
function isSha256Hex(value: unknown): value is string { return typeof value === "string" && /^[a-f0-9]{64}$/i.test(value); }

export type PayrollStoreOptions = { databasePath: string; schemaPath: string; verificationKeyPath?: string };

export class PayrollStore {
  readonly db: DatabaseSync;
  readonly verificationKeyPath: string;
  constructor(options: PayrollStoreOptions) {
    mkdirSync(dirname(resolve(options.databasePath)), { recursive: true });
    this.db = new DatabaseSync(resolve(options.databasePath));
    this.db.exec("PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;");
    const schema = readFileSync(resolve(options.schemaPath), "utf8");
    this.db.exec(schema);
    this.verificationKeyPath = resolve(options.verificationKeyPath || "zk/setup/private_dao_blind_payroll_vkey.json");
  }

  createTenant(input: { name: string; actorRef: string }) {
    const tenantId = `tenant_${randomUUID()}`; const now = new Date().toISOString();
    this.db.prepare("INSERT INTO payroll_tenants (tenant_id,name,network,created_at,status) VALUES (?,?,?,?,?)").run(tenantId, input.name, "solana-devnet", now, "active");
    this.db.prepare("INSERT INTO payroll_members (member_id,tenant_id,actor_ref,role,created_at) VALUES (?,?,?,?,?)").run(`member_${randomUUID()}`, tenantId, input.actorRef, "maker", now);
    this.addAudit(tenantId, null, null, input.actorRef, "tenant.created", tenantId, {});
    return { tenantId, network: "solana-devnet", createdAt: now };
  }

  addMember(input: { tenantId: string; actorRef: string; role: "maker" | "approver" | "auditor" | "admin"; addedBy: string }) {
    const tenant = this.db.prepare("SELECT tenant_id FROM payroll_tenants WHERE tenant_id=? AND status='active'").get(input.tenantId);
    if (!tenant) throw new Error("Active payroll tenant not found.");
    const memberId = `member_${randomUUID()}`; const now = new Date().toISOString();
    this.db.prepare("INSERT INTO payroll_members (member_id,tenant_id,actor_ref,role,created_at) VALUES (?,?,?,?,?)").run(memberId, input.tenantId, input.actorRef, input.role, now);
    this.addAudit(input.tenantId, null, null, input.addedBy, "member.created", memberId, { role: input.role });
    return { memberId, tenantId: input.tenantId, actorRef: input.actorRef, role: input.role, createdAt: now };
  }

  createPolicy(input: {
    tenantId: string; jurisdiction: string; taxYear: string; maxTotalCents: number;
    maxEmployeeCents: number; allowedAsset: string; requiredApprovers: number;
    allowSelfApproval: boolean; actorRef: string;
  }) {
    const tenant = this.db.prepare("SELECT tenant_id FROM payroll_tenants WHERE tenant_id=? AND status='active'").get(input.tenantId);
    if (!tenant) throw new Error("Active payroll tenant not found.");
    if (!Number.isSafeInteger(input.maxTotalCents) || input.maxTotalCents < 0) throw new Error("maxTotalCents must be a non-negative safe integer.");
    if (!Number.isSafeInteger(input.maxEmployeeCents) || input.maxEmployeeCents < 0) throw new Error("maxEmployeeCents must be a non-negative safe integer.");
    if (!Number.isInteger(input.requiredApprovers) || input.requiredApprovers < 1) throw new Error("requiredApprovers must be positive.");
    const latest = this.db.prepare("SELECT COALESCE(MAX(version),0) AS version FROM payroll_policies WHERE tenant_id=?").get(input.tenantId) as { version: number };
    const version = Number(latest.version) + 1;
    const policyHash = sha256(JSON.stringify({ jurisdiction: input.jurisdiction, taxYear: input.taxYear, maxTotalCents: input.maxTotalCents, maxEmployeeCents: input.maxEmployeeCents, allowedAsset: input.allowedAsset, requiredApprovers: input.requiredApprovers, allowSelfApproval: input.allowSelfApproval }));
    const policyId = `policy_${randomUUID()}`; const now = new Date().toISOString();
    this.db.prepare("INSERT INTO payroll_policies (policy_id,tenant_id,version,policy_hash,jurisdiction,tax_year,max_total_cents,max_employee_cents,allowed_asset,required_approvers,allow_self_approval,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)").run(policyId, input.tenantId, version, policyHash, input.jurisdiction, input.taxYear, input.maxTotalCents, input.maxEmployeeCents, input.allowedAsset, input.requiredApprovers, input.allowSelfApproval ? 1 : 0, now);
    this.addAudit(input.tenantId, null, null, input.actorRef, "policy.created", policyId, { version, jurisdiction: input.jurisdiction, taxYear: input.taxYear });
    return { policyId, version, policyHash, createdAt: now };
  }

  addEmployee(input: { tenantId: string; employeeRefCiphertext: string; recipientAddress: string; recipientCommitment: string; actorRef: string }) {
    if (!input.employeeRefCiphertext || !isSha256Hex(input.recipientCommitment)) throw new Error("Employee reference ciphertext and recipient commitment are required.");
    const tenant = this.db.prepare("SELECT tenant_id FROM payroll_tenants WHERE tenant_id=? AND status='active'").get(input.tenantId);
    if (!tenant) throw new Error("Active payroll tenant not found.");
    const employeeId = `employee_${randomUUID()}`; const now = new Date().toISOString();
    this.db.prepare("INSERT INTO payroll_employees (employee_id,tenant_id,employee_ref_ciphertext,recipient_address,recipient_commitment,status,created_at) VALUES (?,?,?,?,?,?,?)").run(employeeId, input.tenantId, input.employeeRefCiphertext, input.recipientAddress, input.recipientCommitment, "active", now);
    this.addAudit(input.tenantId, null, null, input.actorRef, "employee.created", employeeId, { recipientCommitment: input.recipientCommitment });
    return { employeeId, recipientCommitment: input.recipientCommitment, createdAt: now };
  }

  createBatch(input: {
    tenantId: string; policyId: string; idempotencyKey: string; manifestCommitment: string;
    batchCommitment: string; recipientRoot: string; grossCents: number; taxCents: number;
    deductionsCents: number; netCents: number; createdBy: string;
    items: Array<{ employeeId: string; payoutId: string; grossCents: number; taxCents: number; deductionsCents: number; netCents: number; recipientCommitment: string }>;
  }) {
    const existing = this.db.prepare("SELECT batch_id,state FROM payroll_batches WHERE tenant_id=? AND idempotency_key=?").get(input.tenantId, input.idempotencyKey) as { batch_id: string; state: PayrollState } | undefined;
    if (existing) return { idempotent: true, batchId: existing.batch_id, state: existing.state };
    for (const value of [input.manifestCommitment, input.batchCommitment, input.recipientRoot]) if (!isSha256Hex(value)) throw new Error("Batch commitments must be SHA-256 hex values.");
    const policy = this.db.prepare("SELECT policy_id,policy_hash,max_total_cents,max_employee_cents,allowed_asset FROM payroll_policies WHERE policy_id=? AND tenant_id=?").get(input.policyId, input.tenantId) as { policy_id: string; policy_hash: string; max_total_cents: number; max_employee_cents: number; allowed_asset: string } | undefined;
    if (!policy) throw new Error("Payroll policy not found for tenant.");
    if (!input.items.length || input.items.length > 500) throw new Error("Payroll batch must contain between 1 and 500 items.");
    if (input.netCents < 0 || input.netCents > policy.max_total_cents) throw new Error("Payroll exceeds the approved policy budget.");
    if (input.items.some((item) => item.netCents < 0 || item.netCents > policy.max_employee_cents)) throw new Error("Payroll item exceeds the approved employee limit.");
    const totals = input.items.reduce((sum, item) => ({
      grossCents: sum.grossCents + item.grossCents,
      taxCents: sum.taxCents + item.taxCents,
      deductionsCents: sum.deductionsCents + item.deductionsCents,
      netCents: sum.netCents + item.netCents,
    }), { grossCents: 0, taxCents: 0, deductionsCents: 0, netCents: 0 });
    if (totals.grossCents !== input.grossCents || totals.taxCents !== input.taxCents || totals.deductionsCents !== input.deductionsCents || totals.netCents !== input.netCents) throw new Error("Payroll totals do not match payout items.");
    for (const item of input.items) {
      if (!item.employeeId || !item.payoutId) throw new Error("Every payroll item requires employeeId and payoutId.");
      const employee = this.db.prepare("SELECT employee_id FROM payroll_employees WHERE employee_id=? AND tenant_id=? AND status='active'").get(item.employeeId, input.tenantId);
      if (!employee) throw new Error("Payroll item employee is not active in this tenant.");
      if (item.grossCents !== item.taxCents + item.deductionsCents + item.netCents) throw new Error("Payroll item arithmetic is invalid.");
    }
    const batchId = `batch_${randomUUID()}`; const now = new Date().toISOString();
    this.db.exec("BEGIN IMMEDIATE");
    try {
      this.db.prepare("INSERT INTO payroll_batches (batch_id,tenant_id,policy_id,policy_hash,idempotency_key,manifest_commitment,batch_commitment,recipient_root,gross_cents,tax_cents,deductions_cents,net_cents,employee_count,state,created_by,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)").run(batchId, input.tenantId, input.policyId, policy.policy_hash, input.idempotencyKey, input.manifestCommitment, input.batchCommitment, input.recipientRoot, input.grossCents, input.taxCents, input.deductionsCents, input.netCents, input.items.length, "DRAFT", input.createdBy, now, now);
      for (const item of input.items) {
        if (!isSha256Hex(item.recipientCommitment)) throw new Error("Payroll item recipient commitment is invalid.");
        this.db.prepare("INSERT INTO payroll_items (item_id,batch_id,employee_id,payout_id,gross_cents,tax_cents,deductions_cents,net_cents,recipient_commitment,settlement_state,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)").run(`item_${randomUUID()}`, batchId, item.employeeId, item.payoutId, item.grossCents, item.taxCents, item.deductionsCents, item.netCents, item.recipientCommitment, "PENDING", now, now);
      }
      this.addAudit(input.tenantId, batchId, null, input.createdBy, "batch.created", batchId, { employeeCount: input.items.length, policyHash: policy.policy_hash });
      this.db.exec("COMMIT");
    } catch (error) { this.db.exec("ROLLBACK"); throw error; }
    return { idempotent: false, batchId, state: "DRAFT" as const, network: "solana-devnet", policyHash: policy.policy_hash };
  }

  addAudit(tenantId: string, batchId: string | null, itemId: string | null, actorRef: string, eventType: string, correlationId: string, metadata: Record<string, unknown>) {
    this.db.prepare("INSERT INTO payroll_audit_events (event_id,tenant_id,batch_id,item_id,actor_ref,event_type,correlation_id,metadata_json,created_at) VALUES (?,?,?,?,?,?,?,?,?)").run(`audit_${randomUUID()}`, tenantId, batchId, itemId, actorRef, eventType, correlationId, JSON.stringify(metadata), new Date().toISOString());
  }

  createWalletChallenge(input: { wallet: string; message: string; expiresAt: string; nonce: string }) {
    const now = new Date().toISOString();
    this.db.prepare("DELETE FROM payroll_wallet_challenges WHERE expires_at <= ? OR used_at IS NOT NULL").run(now);
    this.db.prepare("INSERT INTO payroll_wallet_challenges (nonce,wallet,message,expires_at) VALUES (?,?,?,?)").run(input.nonce, input.wallet, input.message, input.expiresAt);
    return { nonce: input.nonce, wallet: input.wallet, message: input.message, expiresAt: input.expiresAt };
  }

  consumeWalletChallenge(input: { nonce: string; wallet: string; message: string }) {
    const row = this.db.prepare("SELECT wallet,message,expires_at,used_at FROM payroll_wallet_challenges WHERE nonce=?").get(input.nonce) as { wallet: string; message: string; expires_at: string; used_at: string | null } | undefined;
    if (!row || row.used_at || row.wallet !== input.wallet || row.message !== input.message || Date.parse(row.expires_at) <= Date.now()) throw new Error("Wallet challenge is invalid, expired, or already used.");
    const usedAt = new Date().toISOString();
    const result = this.db.prepare("UPDATE payroll_wallet_challenges SET used_at=? WHERE nonce=? AND used_at IS NULL").run(usedAt, input.nonce);
    if (Number(result.changes) !== 1) throw new Error("Wallet challenge was already consumed.");
    return { wallet: row.wallet, expiresAt: row.expires_at, usedAt };
  }

  createWalletSession(input: { token: string; wallet: string; expiresAt: string }) {
    const now = new Date().toISOString();
    this.db.prepare("DELETE FROM payroll_wallet_sessions WHERE expires_at <= ? OR revoked_at IS NOT NULL").run(now);
    this.db.prepare("INSERT INTO payroll_wallet_sessions (token_hash,wallet,expires_at,created_at) VALUES (?,?,?,?)").run(sha256(input.token), input.wallet, input.expiresAt, now);
    return { wallet: input.wallet, expiresAt: input.expiresAt, createdAt: now };
  }

  getWalletSession(token: string) {
    const row = this.db.prepare("SELECT wallet,expires_at,revoked_at FROM payroll_wallet_sessions WHERE token_hash=?").get(sha256(token)) as { wallet: string; expires_at: string; revoked_at: string | null } | undefined;
    if (!row || row.revoked_at || Date.parse(row.expires_at) <= Date.now()) return null;
    return { wallet: row.wallet, expiresAt: row.expires_at };
  }

  findBatchByActorIdempotency(actorRef: string, idempotencyKey: string) {
    const row = this.db.prepare("SELECT b.batch_id FROM payroll_batches b JOIN payroll_members m ON m.tenant_id=b.tenant_id WHERE b.created_by=? AND b.idempotency_key=? AND m.actor_ref=? LIMIT 1").get(actorRef, idempotencyKey, actorRef) as { batch_id: string } | undefined;
    return row ? this.getBatch(row.batch_id) : null;
  }

  actorCanAccessBatch(batchId: string, actorRef: string) {
    return Boolean(this.db.prepare("SELECT 1 FROM payroll_batches b JOIN payroll_members m ON m.tenant_id=b.tenant_id WHERE b.batch_id=? AND m.actor_ref=? LIMIT 1").get(batchId, actorRef));
  }

  transition(batchId: string, to: PayrollState, actorRef: string) {
    const row = this.db.prepare("SELECT tenant_id,state FROM payroll_batches WHERE batch_id=?").get(batchId) as { tenant_id: string; state: PayrollState } | undefined;
    if (!row) throw new Error("Payroll batch not found.");
    assertPayrollTransition(row.state, to);
    const now = new Date().toISOString();
    this.db.prepare("UPDATE payroll_batches SET state=?,updated_at=? WHERE batch_id=? AND state=?").run(to, now, batchId, row.state);
    this.addAudit(row.tenant_id, batchId, null, actorRef, "batch.state_changed", batchId, { from: row.state, to });
    return { batchId, from: row.state, state: to, updatedAt: now };
  }

  approve(batchId: string, actorRef: string, decision: "approved" | "rejected", signature?: string) {
    const batch = this.db.prepare("SELECT tenant_id,created_by,state,policy_id FROM payroll_batches WHERE batch_id=?").get(batchId) as { tenant_id: string; created_by: string; state: PayrollState; policy_id: string } | undefined;
    if (!batch) throw new Error("Payroll batch not found.");
    const policy = this.db.prepare("SELECT required_approvers,allow_self_approval FROM payroll_policies WHERE policy_id=?").get(batch.policy_id) as { required_approvers: number; allow_self_approval: number };
    const member = this.db.prepare("SELECT role FROM payroll_members WHERE tenant_id=? AND actor_ref=? AND role IN ('approver','admin')").get(batch.tenant_id, actorRef) as { role: string } | undefined;
    if (!member) throw new Error("Actor is not an approver for this payroll tenant.");
    if (decision === "approved" && batch.created_by === actorRef && Number(policy.allow_self_approval) !== 1) throw new Error("Maker cannot self-approve this payroll batch.");
    if (batch.state !== "PENDING_APPROVAL") throw new Error(`Approval is not allowed in state ${batch.state}.`);
    const approvalId = `approval_${randomUUID()}`;
    this.db.prepare("INSERT INTO payroll_approvals (approval_id,batch_id,actor_ref,decision,signature,created_at) VALUES (?,?,?,?,?,?)").run(approvalId, batchId, actorRef, decision, signature || null, new Date().toISOString());
    this.addAudit(batch.tenant_id, batchId, null, actorRef, `batch.${decision}`, batchId, { signaturePresent: Boolean(signature) });
    if (decision === "rejected") return this.transition(batchId, "FAILED", actorRef);
    const approvals = this.db.prepare("SELECT COUNT(*) AS count FROM payroll_approvals WHERE batch_id=? AND decision='approved'").get(batchId) as { count: number };
    if (Number(approvals.count) >= Number(policy.required_approvers)) this.transition(batchId, "APPROVED", actorRef);
    return { approvalId, batchId, decision, approvals: Number(approvals.count), requiredApprovers: Number(policy.required_approvers) };
  }

  recordSettlement(input: { batchId: string; itemId: string; idempotencyKey: string; state: SettlementState; txSignature?: string; actorRef: string; errorCode?: string; chainEvidence?: { signature: string; network: string; commitment: string; slot: number; programId: string; optionalDataHash: string } }) {
    const item = this.db.prepare("SELECT b.tenant_id,b.state AS batch_state FROM payroll_batches b JOIN payroll_items i ON i.batch_id=b.batch_id WHERE b.batch_id=? AND i.item_id=?").get(input.batchId, input.itemId) as { tenant_id: string; batch_state: PayrollState } | undefined;
    if (!item) throw new Error("Payroll item not found for batch.");
    if (![ 
      "SETTLING", "PARTIALLY_SETTLED",
    ].includes(item.batch_state)) throw new Error(`Settlement is not allowed in state ${item.batch_state}.`);
    if (input.state === "CONFIRMED" && !input.txSignature) throw new Error("Confirmed settlement requires a transaction signature.");
    if (input.state === "CONFIRMED") {
      if (!input.chainEvidence) throw new Error("Confirmed settlement requires finalized chain evidence.");
      if (input.chainEvidence.signature !== input.txSignature) throw new Error("Chain evidence signature does not match settlement signature.");
      if (input.chainEvidence.network !== "solana-devnet" || input.chainEvidence.commitment !== "finalized") throw new Error("Settlement chain evidence must be finalized Solana Devnet evidence.");
      if (!input.chainEvidence.programId || !/^[a-zA-Z0-9]+$/.test(input.chainEvidence.programId)) throw new Error("Settlement chain evidence is missing a valid program identifier.");
      if (!/^[a-f0-9]{64}$/i.test(input.chainEvidence.optionalDataHash)) throw new Error("Settlement chain evidence is missing the payroll binding.");
    }
    this.db.exec("BEGIN IMMEDIATE");
    try {
      const existing = this.db.prepare("SELECT attempt_id,state,tx_signature FROM payroll_settlement_attempts WHERE item_id=? AND idempotency_key=?").get(input.itemId, input.idempotencyKey) as { attempt_id: string; state: string; tx_signature: string | null } | undefined;
      if (existing) { this.db.exec("COMMIT"); return { idempotent: true, ...existing }; }
      const attemptId = `attempt_${randomUUID()}`; const now = new Date().toISOString();
      this.db.prepare("INSERT INTO payroll_settlement_attempts (attempt_id,item_id,idempotency_key,provider,network,tx_signature,state,error_code,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)").run(attemptId, input.itemId, input.idempotencyKey, "umbra", "solana-devnet", input.txSignature || null, input.state === "CONFIRMED" ? "confirmed" : input.state === "FAILED" ? "failed" : "submitted", input.errorCode || null, now, now);
      this.db.prepare("UPDATE payroll_items SET settlement_state=?,tx_signature=?,error_code=?,updated_at=? WHERE item_id=?").run(input.state, input.txSignature || null, input.errorCode || null, now, input.itemId);
      this.addAudit(item.tenant_id, input.batchId, input.itemId, input.actorRef, "settlement.updated", input.batchId, { state: input.state, txSignaturePresent: Boolean(input.txSignature), chainEvidence: input.chainEvidence ? { signature: input.chainEvidence.signature, network: input.chainEvidence.network, commitment: input.chainEvidence.commitment, slot: input.chainEvidence.slot, programId: input.chainEvidence.programId, optionalDataHash: input.chainEvidence.optionalDataHash } : null });
      this.db.exec("COMMIT");
      return { idempotent: false, attemptId, itemId: input.itemId, state: input.state, txSignature: input.txSignature || null };
    } catch (error) { this.db.exec("ROLLBACK"); throw error; }
  }

  reconcile(batchId: string, actorRef: string) {
    const batch = this.db.prepare("SELECT state,tenant_id FROM payroll_batches WHERE batch_id=?").get(batchId) as { state: PayrollState; tenant_id: string } | undefined;
    if (!batch) throw new Error("Payroll batch not found.");
    const rows = this.db.prepare("SELECT settlement_state,net_cents,tx_signature FROM payroll_items WHERE batch_id=?").all(batchId) as Array<{ settlement_state: SettlementState; net_cents: number; tx_signature: string | null }>;
    if (!rows.length) throw new Error("Payroll batch has no payout items.");
    const confirmed = rows.filter((row) => ["CONFIRMED", "CLAIMABLE", "CLAIMED"].includes(row.settlement_state));
    const failed = rows.filter((row) => row.settlement_state === "FAILED");
    const signatures = rows.map((row) => row.tx_signature).filter(Boolean);
    const duplicateSignatures = signatures.length - new Set(signatures).size;
    const result = { expectedCount: rows.length, confirmedCount: confirmed.length, failedCount: failed.length, duplicateSignatures, allConfirmed: confirmed.length === rows.length && duplicateSignatures === 0 };
    if (!result.allConfirmed) {
      if (confirmed.length > 0) this.transition(batchId, "PARTIALLY_SETTLED", actorRef);
      throw new Error(`Payroll reconciliation incomplete: ${confirmed.length}/${rows.length} recipients confirmed.`);
    }
    if (batch.state !== "VERIFIED") {
      this.transition(batchId, "SETTLED", actorRef); this.transition(batchId, "RECONCILED", actorRef);
      this.addAudit(batch.tenant_id, batchId, null, actorRef, "batch.reconciled", batchId, result);
    }
    return result;
  }

  private verificationCommitments(batchId: string) {
    const batch = this.db.prepare("SELECT batch_id,tenant_id,policy_hash,manifest_commitment,batch_commitment,recipient_root,gross_cents,tax_cents,deductions_cents,net_cents,employee_count,state FROM payroll_batches WHERE batch_id=?").get(batchId) as Record<string, unknown> | undefined;
    if (!batch) throw new Error("Payroll batch not found.");
    const items = this.db.prepare("SELECT payout_id,gross_cents,tax_cents,deductions_cents,net_cents,recipient_commitment,settlement_state,tx_signature FROM payroll_items WHERE batch_id=? ORDER BY payout_id").all(batchId) as Array<Record<string, unknown>>;
    if (!items.length) throw new Error("Payroll batch has no payout items.");
    const confirmed = items.filter((item) => ["CONFIRMED", "CLAIMABLE", "CLAIMED"].includes(String(item.settlement_state)));
    if (confirmed.length !== items.length || confirmed.some((item) => typeof item.tx_signature !== "string" || !item.tx_signature)) throw new Error("All payout settlements must be independently confirmed before verification.");
    const settlementPayload = items.map((item) => ({ payoutId: item.payout_id, netCents: item.net_cents, recipientCommitment: item.recipient_commitment, txSignature: item.tx_signature }));
    const settlementRoot = sha256(JSON.stringify(settlementPayload));
    const evidencePayload = {
      version: "payroll-evidence-binding-v1",
      network: "solana-devnet",
      batchId: batch.batch_id,
      policyHash: batch.policy_hash,
      manifestCommitment: batch.manifest_commitment,
      batchCommitment: batch.batch_commitment,
      recipientRoot: batch.recipient_root,
      grossCents: batch.gross_cents,
      taxCents: batch.tax_cents,
      deductionsCents: batch.deductions_cents,
      netCents: batch.net_cents,
      employeeCount: batch.employee_count,
      settlementRoot,
    };
    return { settlementRoot, proofHash: sha256(JSON.stringify(evidencePayload)), proofType: "sha256-evidence-binding-v1" };
  }

  getBatch(batchId: string) {
    const batch = this.db.prepare("SELECT batch_id,tenant_id,policy_id,policy_hash,idempotency_key,manifest_commitment,batch_commitment,recipient_root,gross_cents,tax_cents,deductions_cents,net_cents,employee_count,state,created_by,created_at,updated_at FROM payroll_batches WHERE batch_id=?").get(batchId) as Record<string, unknown> | undefined;
    if (!batch) throw new Error("Payroll batch not found.");
    const items = this.db.prepare("SELECT item_id,employee_id,payout_id,gross_cents,tax_cents,deductions_cents,net_cents,recipient_commitment,settlement_state,tx_signature,error_code,created_at,updated_at FROM payroll_items WHERE batch_id=? ORDER BY created_at").all(batchId);
    const approvals = this.db.prepare("SELECT approval_id,actor_ref,decision,signature,created_at FROM payroll_approvals WHERE batch_id=? ORDER BY created_at").all(batchId);
    const audit = this.db.prepare("SELECT event_id,actor_ref,event_type,correlation_id,metadata_json,created_at FROM payroll_audit_events WHERE batch_id=? ORDER BY created_at").all(batchId);
    return { batch, items, approvals, audit };
  }

  async createVerification(input: { batchId: string; scope: "public" | "auditor" | "finance" | "custom"; expiresAt: string; actorRef: string; proof: unknown; publicSignals: unknown[] }) {
    const batch = this.db.prepare("SELECT tenant_id,state FROM payroll_batches WHERE batch_id=?").get(input.batchId) as { tenant_id: string; state: PayrollState } | undefined;
    if (!batch) throw new Error("Payroll batch not found.");
    if (!["RECONCILED", "VERIFIED"].includes(batch.state)) throw new Error("Payroll must be reconciled before verification.");
    if (Date.parse(input.expiresAt) <= Date.now()) throw new Error("Verification expiry must be in the future.");
    const commitments = this.verificationCommitments(input.batchId);
    const proof = await verifyPayrollGroth16({ manifestCommitment: String((this.db.prepare("SELECT manifest_commitment FROM payroll_batches WHERE batch_id=?").get(input.batchId) as { manifest_commitment: string }).manifest_commitment), settlementRoot: commitments.settlementRoot, policyHash: String((this.db.prepare("SELECT policy_hash FROM payroll_batches WHERE batch_id=?").get(input.batchId) as { policy_hash: string }).policy_hash), proof: input.proof, publicSignals: input.publicSignals, verificationKeyPath: this.verificationKeyPath });
    const token = randomBytes(32).toString("base64url");
    const verificationId = `verification_${randomUUID()}`; const now = new Date().toISOString();
    this.db.prepare("INSERT INTO payroll_verifications (verification_id,batch_id,public_token_hash,scope,proof_hash,settlement_root,status,expires_at,created_at) VALUES (?,?,?,?,?,?,?,?,?)").run(verificationId, input.batchId, sha256(token), input.scope, proof.proofHash, commitments.settlementRoot, "active", input.expiresAt, now);
    if (batch.state === "RECONCILED") this.transition(input.batchId, "VERIFIED", input.actorRef);
    this.addAudit(batch.tenant_id, input.batchId, null, input.actorRef, "verification.created", verificationId, { scope: input.scope, proofHash: proof.proofHash, settlementRoot: commitments.settlementRoot, proofType: proof.proofType });
    return { verificationId, token, scope: input.scope, proofHash: proof.proofHash, settlementRoot: commitments.settlementRoot, proofType: proof.proofType, expiresAt: input.expiresAt, createdAt: now, verificationUrl: `/verify/payroll?token=${encodeURIComponent(token)}` };
  }

  getVerification(token: string) {
    const row = this.db.prepare("SELECT verification_id,batch_id,scope,proof_hash,settlement_root,status,expires_at,created_at,revoked_at FROM payroll_verifications WHERE public_token_hash=?").get(sha256(token)) as Record<string, unknown> | undefined;
    if (!row) throw new Error("Payroll verification link not found.");
    if (row.status === "active" && Date.parse(String(row.expires_at)) <= Date.now()) {
      this.db.prepare("UPDATE payroll_verifications SET status='expired' WHERE verification_id=?").run(row.verification_id);
      row.status = "expired";
    }
    return { ...row, proofType: "groth16-private-dao-blind-payroll-v1", verificationUrl: `/verify/payroll?token=${encodeURIComponent(token)}` };
  }

  revokeVerification(verificationId: string, actorRef: string) {
    const row = this.db.prepare("SELECT batch_id,tenant_id,status FROM payroll_verifications WHERE verification_id=?").get(verificationId) as { batch_id: string; tenant_id: string; status: string } | undefined;
    if (!row) throw new Error("Payroll verification not found.");
    if (row.status !== "active") throw new Error("Payroll verification is not active.");
    const now = new Date().toISOString();
    this.db.prepare("UPDATE payroll_verifications SET status='revoked',revoked_at=? WHERE verification_id=? AND status='active'").run(now, verificationId);
    this.addAudit(row.tenant_id, row.batch_id, null, actorRef, "verification.revoked", verificationId, {});
    return { verificationId, status: "revoked", revokedAt: now };
  }
}
