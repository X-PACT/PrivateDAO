import { createHash } from "crypto";

export type ProofWorkflowStatus = "pending" | "completed" | "rejected" | "skipped";

export type ProofWorkflowTemplateId =
  | "underwriting"
  | "compliance-review"
  | "grant-review"
  | "treasury-approval"
  | "vendor-onboarding"
  | "internal-audit";

export type ProofWorkflowStage = {
  id: string;
  label: string;
  required: boolean;
};

export type ProofWorkflowTemplate = {
  id: ProofWorkflowTemplateId;
  label: string;
  buyerFit: string;
  privateInputs: string[];
  publicProof: string;
  stages: ProofWorkflowStage[];
};

export type ProofWorkflowEventInput = {
  workflowId: string;
  templateId: ProofWorkflowTemplateId;
  stageId: string;
  actorId: string;
  status: ProofWorkflowStatus;
  sequence: number;
  note?: string;
  occurredAt?: string;
};

export type ProofWorkflowEvent = {
  eventId: string;
  workflowId: string;
  templateId: ProofWorkflowTemplateId;
  stageId: string;
  actorId: string;
  actorCommitment: string;
  status: ProofWorkflowStatus;
  sequence: number;
  timestamp: string;
  proofHash: string;
};

export type PublicProofWorkflowEvent = Omit<ProofWorkflowEvent, "actorId">;

export const proofWorkflowTemplates: ProofWorkflowTemplate[] = [
  {
    id: "underwriting",
    label: "Underwriting",
    buyerFit: "Fintech companies, lenders, risk committees",
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
  {
    id: "compliance-review",
    label: "Compliance Review",
    buyerFit: "Enterprises, compliance teams, regulated operators",
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
  {
    id: "grant-review",
    label: "Grant Review",
    buyerFit: "Grant programs, accelerators, foundations",
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
  {
    id: "treasury-approval",
    label: "Treasury Approval",
    buyerFit: "Foundations, operating companies, investment committees",
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
  {
    id: "vendor-onboarding",
    label: "Vendor Onboarding",
    buyerFit: "Enterprises, gaming organizations, procurement teams",
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
  {
    id: "internal-audit",
    label: "Internal Audit",
    buyerFit: "Enterprises, foundations, operating teams",
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
];

export const proofWorkflowPricing = [
  {
    plan: "Pilot",
    price: "$5,000 setup + $1,500/month",
    includes: ["1 live workflow", "Customer-data connector", "Proof timeline", "Public verification page", "1,000 proof events/month"],
  },
  {
    plan: "Professional",
    price: "$3,500/month",
    includes: ["Reusable templates", "10 active workflows", "5,000 proof events/month", "Approval proofs", "Workflow analytics"],
  },
  {
    plan: "Enterprise",
    price: "From $12,000/month",
    includes: ["Dedicated deployment", "Custom proof systems", "Compliance workflows", "SLA", "Custom capacity and annual contracts"],
  },
] as const;

export const blindPolicyVerificationPricing = [
  {
    plan: "Blind Policy Pilot",
    price: "$10,000 setup + $3,500/month",
    includes: [
      "1 private policy template",
      "Groth16 proof generation",
      "Public verification page",
      "API status and verification endpoints",
      "2,500 blind policy proofs/month",
      "Pilot onboarding and policy mapping",
    ],
  },
  {
    plan: "Blind Policy Business",
    price: "$7,500/month",
    includes: [
      "Up to 5 active private policies",
      "10,000 proof events/month",
      "Custom proof package labels",
      "Audit-ready verification reports",
      "Intelligence summaries optional",
      "Priority support",
    ],
  },
  {
    plan: "Blind Policy Enterprise",
    price: "From $25,000/month",
    includes: [
      "Dedicated deployment",
      "Custom policy circuits",
      "Customer data connector",
      "Custom verification domain",
      "SLA and security review support",
      "Annual private deployment option",
    ],
  },
] as const;

export function getProofWorkflowTemplate(templateId: ProofWorkflowTemplateId) {
  const template = proofWorkflowTemplates.find((item) => item.id === templateId);
  if (!template) throw new Error("Unknown proof workflow template.");
  return template;
}

export function createStableProofHash(value: unknown) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

export function createWorkflowId(input: { templateId: ProofWorkflowTemplateId; organizationLabel: string; createdAt: string }) {
  return `pwf_${createStableProofHash(input).slice(0, 24)}`;
}

export function createProofWorkflowEvent(input: ProofWorkflowEventInput): ProofWorkflowEvent {
  const template = getProofWorkflowTemplate(input.templateId);
  if (!template.stages.some((stage) => stage.id === input.stageId)) throw new Error("Stage does not belong to template.");
  if (!input.actorId.trim()) throw new Error("actorId is required.");

  const timestamp = input.occurredAt ?? new Date().toISOString();
  const actorCommitment = createStableProofHash({ actorId: input.actorId.trim(), workflowId: input.workflowId }).slice(0, 32);
  const proofPayload = {
    workflowId: input.workflowId,
    templateId: input.templateId,
    stageId: input.stageId,
    actorCommitment,
    status: input.status,
    sequence: input.sequence,
    timestamp,
  };
  const proofHash = createStableProofHash(proofPayload);
  const eventId = `pwe_${proofHash.slice(0, 24)}`;

  return {
    eventId,
    workflowId: input.workflowId,
    templateId: input.templateId,
    stageId: input.stageId,
    actorId: input.actorId.trim(),
    actorCommitment,
    status: input.status,
    sequence: input.sequence,
    timestamp,
    proofHash,
  };
}

export function redactProofWorkflowEvent(event: ProofWorkflowEvent): PublicProofWorkflowEvent {
  const { actorId: _actorId, ...publicEvent } = event;
  return publicEvent;
}

export function buildProofWorkflowVerification(input: {
  templateId: ProofWorkflowTemplateId;
  workflowId: string;
  events: PublicProofWorkflowEvent[];
}) {
  const template = getProofWorkflowTemplate(input.templateId);
  const completedStageIds = new Set(input.events.filter((event) => event.status === "completed").map((event) => event.stageId));
  const requiredSequence = template.stages.filter((stage) => stage.required).map((stage) => stage.id);
  const requiredApprovalsHappened = requiredSequence.every((stageId) => completedStageIds.has(stageId));
  const observedSequence = input.events
    .filter((event) => event.status === "completed")
    .sort((a, b) => a.sequence - b.sequence)
    .map((event) => event.stageId);
  const sequenceRespected = requiredSequence.every((stageId, index) => observedSequence[index] === stageId);

  return {
    workflowId: input.workflowId,
    templateId: input.templateId,
    processExisted: input.events.length > 0,
    processCompleted: requiredApprovalsHappened,
    requiredApprovalsHappened,
    requiredSequenceRespected: sequenceRespected,
    publicProof: template.publicProof,
    privateDataExcluded: ["documents", "thresholds", "calculations", "reviewer notes", "internal methodology"],
    eventCount: input.events.length,
    verificationHash: createStableProofHash({
      workflowId: input.workflowId,
      templateId: input.templateId,
      events: input.events.map((event) => event.proofHash),
    }),
  };
}
