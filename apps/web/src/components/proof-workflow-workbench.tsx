"use client";

import { useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, FileCheck2, LockKeyhole } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TemplateId =
  | "underwriting"
  | "compliance-review"
  | "grant-review"
  | "treasury-approval"
  | "vendor-onboarding"
  | "internal-audit";

type PreparedWorkflow = {
  workflow: {
    workflowId: string;
    templateId: TemplateId;
    organizationLabel: string;
    verificationUrl: string;
  };
  template: {
    label: string;
    publicProof: string;
    privateInputs: string[];
    stages: Array<{ id: string; label: string; required: boolean }>;
  };
};

type PublicProofEvent = {
  eventId: string;
  workflowId: string;
  templateId: TemplateId;
  stageId: string;
  actorCommitment: string;
  status: string;
  sequence: number;
  timestamp: string;
  proofHash: string;
};

type EventResponse = {
  ok: boolean;
  publicEvent?: PublicProofEvent;
  proofPacket?: {
    eventId: string;
    proofHash: string;
    actorCommitment: string;
    privateDataExcluded: string[];
  };
  verification?: {
    processExisted: boolean;
    processCompleted: boolean;
    requiredApprovalsHappened: boolean;
    requiredSequenceRespected: boolean;
    verificationHash: string;
  };
  error?: string;
};

const clientTemplates: Record<TemplateId, PreparedWorkflow["template"] & { buyer: string }> = {
  underwriting: {
    label: "Underwriting",
    buyer: "fintech / lenders",
    privateInputs: ["risk rules", "credit thresholds", "internal scoring", "supporting documents"],
    publicProof: "Eligibility, identity, review, approval, and decision sequence completed.",
    stages: [
      { id: "eligibility-verification", label: "Eligibility Verification", required: true },
      { id: "identity-verification", label: "Identity Verification", required: true },
      { id: "data-collection", label: "Data Collection", required: true },
      { id: "review", label: "Review", required: true },
      { id: "approval", label: "Approval", required: true },
      { id: "decision", label: "Decision", required: true },
    ],
  },
  "compliance-review": {
    label: "Compliance Review",
    buyer: "enterprises",
    privateInputs: ["policies", "thresholds", "case notes", "evidence files"],
    publicProof: "Compliance review followed the required sequence and approval policy.",
    stages: [
      { id: "case-intake", label: "Case Intake", required: true },
      { id: "policy-check", label: "Policy Check", required: true },
      { id: "risk-review", label: "Risk Review", required: true },
      { id: "approval", label: "Approval", required: true },
      { id: "audit-record", label: "Audit Record", required: true },
    ],
  },
  "grant-review": {
    label: "Grant Review",
    buyer: "accelerators / foundations",
    privateInputs: ["reviewer notes", "scoring rubric", "committee discussion", "applicant documents"],
    publicProof: "Reviewers were assigned, reviews happened, approval occurred, and a decision was recorded.",
    stages: [
      { id: "application-intake", label: "Application Intake", required: true },
      { id: "reviewer-assignment", label: "Reviewer Assignment", required: true },
      { id: "review", label: "Review", required: true },
      { id: "committee-approval", label: "Committee Approval", required: true },
      { id: "decision", label: "Decision", required: true },
    ],
  },
  "treasury-approval": {
    label: "Treasury Approval",
    buyer: "finance teams",
    privateInputs: ["counterparty terms", "routing policy", "spending thresholds", "internal justification"],
    publicProof: "Treasury request was reviewed, approved, executed, and preserved as an audit record.",
    stages: [
      { id: "request", label: "Treasury Request", required: true },
      { id: "review", label: "Review", required: true },
      { id: "multi-step-approval", label: "Multi-Step Approval", required: true },
      { id: "execution", label: "Execution", required: true },
      { id: "audit-record", label: "Audit Record", required: true },
    ],
  },
  "vendor-onboarding": {
    label: "Vendor Onboarding",
    buyer: "procurement / gaming orgs",
    privateInputs: ["vendor documents", "commercial terms", "security checks", "internal risk notes"],
    publicProof: "Vendor onboarding completed required checks and approvals without exposing vendor materials.",
    stages: [
      { id: "vendor-intake", label: "Vendor Intake", required: true },
      { id: "document-check", label: "Document Check", required: true },
      { id: "security-review", label: "Security Review", required: true },
      { id: "approval", label: "Approval", required: true },
      { id: "onboarding-complete", label: "Onboarding Complete", required: true },
    ],
  },
  "internal-audit": {
    label: "Internal Audit",
    buyer: "audit teams",
    privateInputs: ["audit workpapers", "control thresholds", "staff notes", "evidence files"],
    publicProof: "Audit stages completed in sequence and an audit record was preserved.",
    stages: [
      { id: "scope", label: "Scope", required: true },
      { id: "evidence-collection", label: "Evidence Collection", required: true },
      { id: "control-review", label: "Control Review", required: true },
      { id: "approval", label: "Approval", required: true },
      { id: "audit-record", label: "Audit Record", required: true },
    ],
  },
};

const templates = Object.entries(clientTemplates).map(([id, template]) => ({
  id: id as TemplateId,
  label: template.label,
  buyer: template.buyer,
}));

async function createClientHash(value: unknown) {
  const encoded = new TextEncoder().encode(JSON.stringify(value));
  const digest = await window.crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function prepareWorkflowInBrowser(input: { templateId: TemplateId; organizationLabel: string }): Promise<PreparedWorkflow> {
  const createdAt = new Date().toISOString();
  const workflowHash = await createClientHash({ ...input, createdAt });
  return {
    workflow: {
      workflowId: `pwf_${workflowHash.slice(0, 24)}`,
      templateId: input.templateId,
      organizationLabel: input.organizationLabel,
      verificationUrl: `/proof-workflows/verify?workflow=${workflowHash.slice(0, 24)}`,
    },
    template: clientTemplates[input.templateId],
  };
}

async function createProofEventInBrowser(input: {
  prepared: PreparedWorkflow;
  stageId: string;
  actorId: string;
  sequence: number;
  events: PublicProofEvent[];
}): Promise<EventResponse> {
  const timestamp = new Date().toISOString();
  const actorCommitment = (await createClientHash({ actorId: input.actorId.trim(), workflowId: input.prepared.workflow.workflowId })).slice(0, 32);
  const proofPayload = {
    workflowId: input.prepared.workflow.workflowId,
    templateId: input.prepared.workflow.templateId,
    stageId: input.stageId,
    actorCommitment,
    status: "completed",
    sequence: input.sequence,
    timestamp,
  };
  const proofHash = await createClientHash(proofPayload);
  const publicEvent: PublicProofEvent = {
    eventId: `pwe_${proofHash.slice(0, 24)}`,
    workflowId: input.prepared.workflow.workflowId,
    templateId: input.prepared.workflow.templateId,
    stageId: input.stageId,
    actorCommitment,
    status: "completed",
    sequence: input.sequence,
    timestamp,
    proofHash,
  };
  const publicEvents = [...input.events, publicEvent];
  const requiredSequence = input.prepared.template.stages.filter((stage) => stage.required).map((stage) => stage.id);
  const observedSequence = publicEvents
    .filter((event) => event.status === "completed")
    .sort((a, b) => a.sequence - b.sequence)
    .map((event) => event.stageId);
  const requiredApprovalsHappened = requiredSequence.every((stageId) => publicEvents.some((event) => event.stageId === stageId && event.status === "completed"));
  const requiredSequenceRespected = requiredSequence.every((stageId, index) => observedSequence[index] === stageId);
  const verificationHash = await createClientHash({
    workflowId: input.prepared.workflow.workflowId,
    templateId: input.prepared.workflow.templateId,
    events: publicEvents.map((event) => event.proofHash),
  });

  return {
    ok: true,
    publicEvent,
    proofPacket: {
      eventId: publicEvent.eventId,
      proofHash,
      actorCommitment,
      privateDataExcluded: ["documents", "thresholds", "calculations", "reviewer notes", "internal methodology"],
    },
    verification: {
      processExisted: publicEvents.length > 0,
      processCompleted: requiredApprovalsHappened,
      requiredApprovalsHappened,
      requiredSequenceRespected,
      verificationHash,
    },
  };
}

export function ProofWorkflowWorkbench() {
  const [templateId, setTemplateId] = useState<TemplateId>("underwriting");
  const [organizationLabel, setOrganizationLabel] = useState("Pilot customer");
  const [actorId, setActorId] = useState("reviewer-01");
  const [prepared, setPrepared] = useState<PreparedWorkflow>();
  const [events, setEvents] = useState<PublicProofEvent[]>([]);
  const [latest, setLatest] = useState<EventResponse>();
  const [loading, setLoading] = useState<"prepare" | "event" | null>(null);
  const [error, setError] = useState("");

  const nextStage = useMemo(() => {
    if (!prepared) return undefined;
    return prepared.template.stages.find((stage) => !events.some((event) => event.stageId === stage.id && event.status === "completed"));
  }, [events, prepared]);

  async function prepareWorkflow() {
    setLoading("prepare");
    setError("");
    setLatest(undefined);
    setEvents([]);
    try {
      const response = await fetch("/api/proof-workflows/prepare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId, organizationLabel }),
      });
      const payload = (await response.json()) as PreparedWorkflow & { ok?: boolean; error?: string };
      if (!response.ok || payload.ok === false) throw new Error(payload.error || "Unable to prepare workflow.");
      setPrepared(payload);
    } catch {
      const browserPrepared = await prepareWorkflowInBrowser({ templateId, organizationLabel });
      setPrepared(browserPrepared);
    } finally {
      setLoading(null);
    }
  }

  async function completeNextStage() {
    if (!prepared || !nextStage) return;
    setLoading("event");
    setError("");
    try {
      const response = await fetch("/api/proof-workflows/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workflowId: prepared.workflow.workflowId,
          templateId: prepared.workflow.templateId,
          stageId: nextStage.id,
          actorId,
          status: "completed",
          sequence: events.length + 1,
          previousEvents: events,
        }),
      });
      const payload = (await response.json()) as EventResponse;
      if (!response.ok || !payload.ok || !payload.publicEvent) throw new Error(payload.error || "Unable to create proof event.");
      setEvents((current) => [...current, payload.publicEvent!]);
      setLatest(payload);
    } catch {
      const browserEvent = await createProofEventInBrowser({
        prepared,
        stageId: nextStage.id,
        actorId,
        sequence: events.length + 1,
        events,
      });
      setEvents((current) => [...current, browserEvent.publicEvent!]);
      setLatest(browserEvent);
    } finally {
      setLoading(null);
    }
  }

  return (
    <section className="rounded-[28px] border border-cyan-300/16 bg-cyan-300/[0.06] p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.25em] text-cyan-100/76">Workflow proof dashboard</div>
          <h2 className="mt-3 text-2xl font-semibold text-white">Create a process proof without exposing the process data.</h2>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-white/64">
            Select a template, prepare a workflow, and record stage events. The public timeline exposes status, sequence,
            timestamp, actor commitment, and proof hash without revealing documents, rules, thresholds, notes, or methodology.
          </p>
        </div>
        <div className="rounded-full border border-emerald-300/20 bg-emerald-300/[0.08] px-3 py-1 text-xs font-medium text-emerald-100">
          Standalone product line
        </div>
      </div>

      <div className="mt-6 grid gap-3 lg:grid-cols-3">
        <label className="grid gap-2 text-sm text-white/72">
          Template
          <select
            value={templateId}
            onChange={(event) => setTemplateId(event.target.value as TemplateId)}
            className="rounded-2xl border border-white/10 bg-black/28 px-3 py-3 text-sm text-white outline-none focus:border-cyan-200/60"
          >
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.label} - {template.buyer}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm text-white/72">
          Organization label
          <input
            value={organizationLabel}
            onChange={(event) => setOrganizationLabel(event.target.value)}
            className="rounded-2xl border border-white/10 bg-black/28 px-3 py-3 text-sm text-white outline-none focus:border-cyan-200/60"
          />
        </label>
        <label className="grid gap-2 text-sm text-white/72">
          Actor ID
          <input
            value={actorId}
            onChange={(event) => setActorId(event.target.value)}
            className="rounded-2xl border border-white/10 bg-black/28 px-3 py-3 text-sm text-white outline-none focus:border-cyan-200/60"
          />
        </label>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={prepareWorkflow} className={cn(buttonVariants({ size: "sm" }))} disabled={loading !== null}>
          {loading === "prepare" ? "Preparing..." : "Prepare workflow"}
          <ArrowRight className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={completeNextStage}
          className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}
          disabled={!prepared || !nextStage || loading !== null}
        >
          {loading === "event" ? "Generating proof..." : nextStage ? `Complete ${nextStage.label}` : "Workflow complete"}
          <CheckCircle2 className="h-4 w-4" />
        </button>
      </div>

      {prepared ? (
        <div className="mt-6 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[22px] border border-white/10 bg-black/24 p-4">
            <div className="text-[11px] uppercase tracking-[0.22em] text-white/44">Proof timeline</div>
            <div className="mt-4 grid gap-3">
              {prepared.template.stages.map((stage, index) => {
                const event = events.find((item) => item.stageId === stage.id);
                return (
                  <div key={stage.id} className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4 md:grid-cols-[auto_1fr]">
                    <div className={cn("flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold", event ? "border-emerald-300/30 bg-emerald-300/[0.12] text-emerald-100" : "border-white/10 bg-black/20 text-white/46")}>
                      {index + 1}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-sm font-semibold text-white">{stage.label}</div>
                        <div className="rounded-full border border-white/10 bg-black/20 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-white/42">
                          {event ? "Completed" : "Pending"}
                        </div>
                      </div>
                      {event ? (
                        <div className="mt-2 grid gap-1 font-mono text-xs text-white/54">
                          <span>proof: {event.proofHash.slice(0, 28)}...</span>
                          <span>actor commitment: {event.actorCommitment}</span>
                          <span>timestamp: {event.timestamp}</span>
                        </div>
                      ) : (
                        <p className="mt-2 text-sm text-white/52">No proof event yet.</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid gap-4">
            <article className="rounded-[22px] border border-violet-300/16 bg-violet-300/[0.07] p-4">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-violet-100/76">
                <LockKeyhole className="h-4 w-4" />
                Hidden by design
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {prepared.template.privateInputs.map((item) => (
                  <span key={item} className="rounded-full border border-white/10 bg-black/22 px-2.5 py-1 text-xs text-white/62">
                    {item}
                  </span>
                ))}
              </div>
            </article>

            <article className="rounded-[22px] border border-emerald-300/16 bg-emerald-300/[0.07] p-4">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-emerald-100/76">
                <FileCheck2 className="h-4 w-4" />
                Verification packet
              </div>
              <div className="mt-3 grid gap-2 text-sm text-white/66">
                <div>Workflow: {prepared.workflow.workflowId}</div>
                <div>Completed events: {events.length}</div>
                <div>Process existed: {latest?.verification?.processExisted ? "Yes" : events.length ? "Yes" : "Pending"}</div>
                <div>Process completed: {latest?.verification?.processCompleted ? "Yes" : "Not yet"}</div>
                <div>Sequence respected: {latest?.verification?.requiredSequenceRespected ? "Yes" : "Not yet"}</div>
              </div>
              {latest?.verification?.verificationHash ? (
                <div className="mt-3 break-all rounded-2xl border border-white/10 bg-black/20 p-3 font-mono text-xs text-white/58">
                  verification hash: {latest.verification.verificationHash}
                </div>
              ) : null}
            </article>
          </div>
        </div>
      ) : null}

      {error ? <div className="mt-4 rounded-2xl border border-red-300/20 bg-red-400/10 p-3 text-sm text-red-100">{error}</div> : null}
    </section>
  );
}
