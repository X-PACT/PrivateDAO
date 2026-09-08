import type { CapabilityId, NetworkId, ProductId, ProviderId } from "./index.js";

export type JobState = "queued" | "running" | "retrying" | "completed" | "failed" | "dead-letter" | "cancelled";

export interface ProtocolJob<TResult = unknown> {
  jobId: string;
  requestId: string;
  product: ProductId;
  capability: CapabilityId;
  network: NetworkId;
  provider?: ProviderId;
  state: JobState;
  attempt: number;
  maxAttempts: number;
  createdAt: string;
  updatedAt: string;
  result?: TResult;
  errorCode?: string;
}

export interface JobStore {
  create<TResult>(job: ProtocolJob<TResult>): void;
  get<TResult = unknown>(jobId: string): ProtocolJob<TResult> | undefined;
  update<TResult>(jobId: string, update: Partial<ProtocolJob<TResult>>): ProtocolJob<TResult>;
}

export class InMemoryJobStore implements JobStore {
  private readonly jobs = new Map<string, ProtocolJob>();

  create<TResult>(job: ProtocolJob<TResult>): void {
    if (this.jobs.has(job.jobId)) throw new Error(`Job already exists: ${job.jobId}`);
    this.jobs.set(job.jobId, { ...job });
  }

  get<TResult = unknown>(jobId: string): ProtocolJob<TResult> | undefined {
    const job = this.jobs.get(jobId);
    return job ? ({ ...job } as ProtocolJob<TResult>) : undefined;
  }

  update<TResult>(jobId: string, update: Partial<ProtocolJob<TResult>>): ProtocolJob<TResult> {
    const current = this.jobs.get(jobId);
    if (!current) throw new Error(`Job not found: ${jobId}`);
    const next = { ...current, ...update, jobId: current.jobId } as ProtocolJob<TResult>;
    this.jobs.set(jobId, next);
    return { ...next };
  }
}

export interface AuditEvent {
  eventId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  actorId?: string;
  organizationId?: string;
  correlationId?: string;
  occurredAt: string;
  metadata?: Readonly<Record<string, string | number | boolean | null>>;
}

export interface AuditLog {
  append(event: AuditEvent): void;
  list(resourceType?: string, resourceId?: string): readonly AuditEvent[];
}

export class InMemoryAuditLog implements AuditLog {
  private readonly events: AuditEvent[] = [];

  append(event: AuditEvent): void {
    if (this.events.some((existing) => existing.eventId === event.eventId)) {
      throw new Error(`Audit event already exists: ${event.eventId}`);
    }
    this.events.push({ ...event, metadata: event.metadata ? { ...event.metadata } : undefined });
  }

  list(resourceType?: string, resourceId?: string): readonly AuditEvent[] {
    return this.events
      .filter((event) => (!resourceType || event.resourceType === resourceType) && (!resourceId || event.resourceId === resourceId))
      .map((event) => ({ ...event, metadata: event.metadata ? { ...event.metadata } : undefined }));
  }
}

export function isTerminalJobState(state: JobState): boolean {
  return state === "completed" || state === "failed" || state === "dead-letter" || state === "cancelled";
}

export function nextRetryState(attempt: number, maxAttempts: number): JobState {
  return attempt < maxAttempts ? "retrying" : "dead-letter";
}
