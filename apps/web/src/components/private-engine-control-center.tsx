"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ChevronRight, FileKey2, GitBranch, History, Layers3, LockKeyhole, Plus, RefreshCw, ShieldCheck, Users } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const baseUrl = (process.env.NEXT_PUBLIC_PRIVATE_ENGINE_URL || "http://127.0.0.1:8787").replace(/\/+$/, "");
type Plugin = { id: string; name: string; description: string; status: string; proofReady: boolean; circuitId: string; circuitVersion: string; capabilities: string[] };
type Template = { id: string; name: string; pluginId: string; description: string; conditions: Array<{ field: string; operator: string; value: string | number }>; proofReady?: boolean };
type Policy = { policyId: string; name: string; pluginId: string; createdBy: string; versions: Array<{ versionId: string; status: string; createdBy: string; approvedBy?: string | null; createdAt: string; ast?: { conditions: Array<{ field: string; operator: string; value: string | number }>; logic: string } }> };
type TimelineEvent = { type: string; createdAt: string; workflowId?: string; policyId?: string; proofId?: string; createdBy?: string; approvedBy?: string };

async function api(path: string, init?: RequestInit) {
  const response = await fetch(`${baseUrl}${path}`, { ...init, headers: { "Content-Type": "application/json", ...(init?.headers || {}) }, cache: "no-store" });
  const payload = await response.json();
  if (!response.ok || payload.ok === false) throw new Error(payload.error || payload.reason || "Engine request failed.");
  return payload;
}

const operators: Record<string, string> = { equals: "=", not_in: "!=", greater_than: ">", less_than_or_equal: "<=", greater_than_or_equal: ">=" };

export function PrivateEngineControlCenter() {
  const [tab, setTab] = useState("marketplace");
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [license, setLicense] = useState<any>(null);
  const [hierarchy, setHierarchy] = useState<any>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [policyName, setPolicyName] = useState("");
  const [conditions, setConditions] = useState<Array<{ field: string; operator: string; value: string | number }>>([]);
  const [logic, setLogic] = useState("AND");
  const [message, setMessage] = useState<string>();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true); setError(undefined);
    try {
      const [pluginPayload, marketplacePayload, policyPayload, timelinePayload, licensePayload, orgPayload] = await Promise.all([
        api("/v1/plugins"), api("/v1/marketplace"), api("/v1/policies"), api("/v1/audit/timeline"), api("/v1/license/center"), api("/v1/organizations"),
      ]);
      setPlugins(pluginPayload.plugins); setTemplates(marketplacePayload.templates); setPolicies(policyPayload.policies); setTimeline(timelinePayload.timeline); setLicense(licensePayload.center); setHierarchy(orgPayload.hierarchy);
    } catch (loadError) { setError(loadError instanceof Error ? loadError.message : "Local engine is unavailable."); } finally { setLoading(false); }
  }

  useEffect(() => { void load(); }, []);
  const selectedPlugin = useMemo(() => plugins.find((plugin) => plugin.id === selectedTemplate?.pluginId), [plugins, selectedTemplate]);
  function chooseTemplate(template: Template) { setSelectedTemplate(template); setPolicyName(template.name); setConditions(template.conditions); setTab("builder"); setMessage(undefined); }
  async function createPolicy() {
    if (!selectedTemplate || !policyName.trim()) return;
    setLoading(true); setError(undefined);
    try { await api("/v1/policies", { method: "POST", body: JSON.stringify({ name: policyName, templateId: selectedTemplate.id, pluginId: selectedTemplate.pluginId, conditions, logic, createdBy: "local-admin" }) }); setMessage("Policy v1 created as draft. Approve it before production use."); await load(); setTab("versions"); }
    catch (createError) { setError(createError instanceof Error ? createError.message : "Policy creation failed."); } finally { setLoading(false); }
  }
  async function approve(policy: Policy) {
    setLoading(true); setError(undefined);
    try { await api(`/v1/policies/${policy.policyId}/approve`, { method: "POST", body: JSON.stringify({ approvedBy: "local-admin" }) }); setMessage(`${policy.name} approved.`); await load(); }
    catch (approveError) { setError(approveError instanceof Error ? approveError.message : "Approval failed."); } finally { setLoading(false); }
  }
  async function createVersion(policy: Policy) {
    const latest = policy.versions.at(-1);
    if (!latest?.ast) return;
    setLoading(true); setError(undefined);
    try { await api(`/v1/policies/${policy.policyId}/versions`, { method: "POST", body: JSON.stringify({ conditions: latest.ast.conditions, logic: latest.ast.logic, createdBy: "compliance-admin" }) }); setMessage(`${policy.name} updated with a new draft version.`); await load(); }
    catch (versionError) { setError(versionError instanceof Error ? versionError.message : "Version creation failed."); } finally { setLoading(false); }
  }
  const tabs = [["marketplace", "Marketplace", Layers3], ["builder", "Policy Builder", GitBranch], ["versions", "Versions", History], ["audit", "Audit Timeline", ShieldCheck], ["org", "Organization", Users], ["license", "License Center", FileKey2]] as const;

  return <section className="grid gap-5">
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-cyan-300/16 bg-cyan-300/[0.055] p-4"><div><div className="text-[11px] uppercase tracking-[0.25em] text-cyan-100/76">Private Engine Control Center</div><div className="mt-2 text-sm text-white/64">Choose a workflow, build a policy, approve it, and keep every proof action auditable.</div></div><button type="button" onClick={() => void load()} disabled={loading} className={cn(buttonVariants({ size: "sm", variant: "outline" }))}><RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />Refresh</button></div>
    {message ? <div className="rounded-xl border border-emerald-300/20 bg-emerald-300/[0.06] p-3 text-sm text-emerald-50">{message}</div> : null}
    {error ? <div className="rounded-xl border border-red-300/20 bg-red-400/[0.08] p-3 text-sm text-red-50">{error}</div> : null}
    <nav className="flex flex-wrap gap-2" aria-label="Private engine sections">{tabs.map(([id, label, Icon]) => <button key={id} type="button" onClick={() => setTab(id)} className={cn(buttonVariants({ size: "sm", variant: tab === id ? "default" : "outline" }))}><Icon className="h-4 w-4" />{label}</button>)}</nav>

    {tab === "marketplace" ? <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{templates.map((template) => { const plugin = plugins.find((item) => item.id === template.pluginId); return <button key={template.id} type="button" onClick={() => chooseTemplate(template)} className="group rounded-2xl border border-white/10 bg-white/[0.035] p-5 text-left transition hover:border-cyan-200/40 hover:bg-cyan-200/[0.06]"><div className="flex items-start justify-between gap-3"><div><div className="text-base font-semibold text-white">{template.name}</div><div className="mt-1 text-xs text-cyan-100/65">{plugin?.name || template.pluginId}</div></div><ChevronRight className="h-4 w-4 text-white/35 group-hover:text-cyan-100" /></div><p className="mt-4 text-sm leading-6 text-white/60">{template.description}</p><div className="mt-4 flex items-center gap-2 text-xs">{plugin?.proofReady ? <span className="text-emerald-200"><CheckCircle2 className="mr-1 inline h-3.5 w-3.5" />Proof ready</span> : <span className="text-amber-200">Plugin registered, circuit artifact pending</span>}</div></button>; })}</div> : null}

    {tab === "builder" ? <div className="grid gap-5 lg:grid-cols-[0.72fr_1.28fr]"><article className="rounded-2xl border border-white/10 bg-white/[0.035] p-5"><div className="text-sm font-semibold text-white">Start from a template</div><div className="mt-4 grid gap-2">{templates.map((template) => <button key={template.id} type="button" onClick={() => chooseTemplate(template)} className={cn("flex items-center justify-between rounded-xl border px-3 py-3 text-left text-sm", selectedTemplate?.id === template.id ? "border-cyan-200/45 bg-cyan-200/[0.08] text-white" : "border-white/10 text-white/65 hover:border-white/25")}><span>{template.name}</span><ChevronRight className="h-4 w-4" /></button>)}</div></article><article className="rounded-2xl border border-white/10 bg-white/[0.035] p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><div className="text-sm font-semibold text-white">Visual policy builder</div><div className="mt-1 text-xs text-white/50">No JSON. The engine compiles these conditions into a policy AST and circuit binding.</div></div><select value={logic} onChange={(event) => setLogic(event.target.value)} className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white"><option value="AND">All conditions (AND)</option><option value="OR">Any condition (OR)</option></select></div><input value={policyName} onChange={(event) => setPolicyName(event.target.value)} placeholder="Policy name" className="mt-5 w-full rounded-lg border border-white/12 bg-black/20 px-3 py-2 text-sm text-white outline-none" />{selectedPlugin ? <div className="mt-3 text-xs text-cyan-100/65">Plugin: {selectedPlugin.name} - {selectedPlugin.proofReady ? "Groth16 ready" : "Circuit artifact required before proving"}</div> : null}<div className="mt-5 grid gap-3">{conditions.map((condition, index) => <div key={`${condition.field}-${index}`} className="grid gap-2 sm:grid-cols-[1fr_0.9fr_1fr_auto] sm:items-center"><span className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white">{condition.field}</span><span className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-center text-sm text-cyan-100">{operators[condition.operator] || condition.operator}</span><input value={String(condition.value)} onChange={(event) => setConditions((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, value: event.target.value } : item))} className="rounded-lg border border-white/12 bg-black/20 px-3 py-2 text-sm text-white outline-none" /><button type="button" title="Remove condition" onClick={() => setConditions((items) => items.filter((_, itemIndex) => itemIndex !== index))} className="rounded-lg border border-white/10 px-3 py-2 text-sm text-white/55 hover:text-white">x</button></div>)}</div><button type="button" onClick={() => setConditions((items) => [...items, { field: "kyc", operator: "equals", value: "verified" }])} className={cn(buttonVariants({ size: "sm", variant: "outline" }), "mt-5")}><Plus className="h-4 w-4" />Add condition</button><div className="mt-6 border-t border-white/10 pt-5"><div className="text-xs uppercase tracking-[0.18em] text-white/42">THEN</div><div className="mt-2 text-sm text-emerald-100">Issue Proof -&gt; Verify -&gt; Generate Receipt</div><button type="button" disabled={!selectedTemplate || !conditions.length || loading} onClick={() => void createPolicy()} className={cn(buttonVariants({ size: "sm" }), "mt-5")}>Create Policy v1</button></div></article></div> : null}

    {tab === "versions" ? <div className="grid gap-3">{policies.length ? policies.map((policy) => <article key={policy.policyId} className="rounded-2xl border border-white/10 bg-white/[0.035] p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><div className="text-base font-semibold text-white">{policy.name}</div><div className="mt-1 text-xs text-white/45">{policy.pluginId} - created by {policy.createdBy}</div></div><div className="flex flex-wrap gap-2"><button type="button" onClick={() => void createVersion(policy)} disabled={loading} className={cn(buttonVariants({ size: "sm", variant: "outline" }))}><Plus className="h-4 w-4" />New version</button><button type="button" onClick={() => void approve(policy)} disabled={loading || policy.versions.at(-1)?.status === "approved"} className={cn(buttonVariants({ size: "sm", variant: "outline" }))}><CheckCircle2 className="h-4 w-4" />{policy.versions.at(-1)?.status === "approved" ? "Approved" : "Approve latest"}</button></div></div><div className="mt-4 grid gap-2">{policy.versions.map((version) => <div key={version.versionId} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-black/15 px-3 py-3 text-sm"><span className="font-mono text-cyan-100">Policy v{version.versionId.replace("v", "")}</span><span className="text-white/55">{version.status}</span><span className="text-xs text-white/38">{version.createdAt} - {version.approvedBy ? `approved by ${version.approvedBy}` : `created by ${version.createdBy}`}</span></div>)}</div></article>) : <div className="rounded-2xl border border-dashed border-white/15 p-8 text-sm text-white/50">Create a policy from Marketplace to start version history.</div>}</div> : null}

    {tab === "audit" ? <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5"><div className="text-sm font-semibold text-white">Audit timeline</div><div className="mt-5 grid gap-0">{timeline.length ? timeline.map((event, index) => <div key={`${event.createdAt}-${index}`} className="relative grid grid-cols-[24px_1fr] gap-3 pb-6 last:pb-0"><div className="relative flex justify-center"><span className="z-10 mt-1 h-3 w-3 rounded-full border-2 border-cyan-100 bg-slate-950" />{index < timeline.length - 1 ? <span className="absolute top-4 h-full w-px bg-white/15" /> : null}</div><div><div className="text-sm font-medium capitalize text-white">{event.type.replaceAll("-", " ")}</div><div className="mt-1 text-xs text-white/45">{event.createdAt} {event.workflowId ? `- workflow ${event.workflowId}` : ""} {event.policyId ? `- policy ${event.policyId}` : ""} {event.approvedBy ? `- approved by ${event.approvedBy}` : ""}</div></div></div>) : <div className="text-sm text-white/50">No audit events recorded yet.</div>}</div></div> : null}

    {tab === "org" ? <div className="grid gap-4 lg:grid-cols-2"><article className="rounded-2xl border border-white/10 bg-white/[0.035] p-5"><div className="text-sm font-semibold text-white">Organization hierarchy</div><div className="mt-5 grid gap-3 text-sm">{[["Organizations", hierarchy?.organizations?.length || 0], ["Departments", hierarchy?.departments?.length || 0], ["Teams", hierarchy?.teams?.length || 0], ["Users", hierarchy?.users?.length || 0]].map(([label, value]) => <div key={String(label)} className="flex items-center justify-between rounded-xl border border-white/10 bg-black/15 px-4 py-3"><span className="text-white/60">{label}</span><span className="font-semibold text-white">{value}</span></div>)}</div></article><article className="rounded-2xl border border-emerald-300/16 bg-emerald-300/[0.05] p-5"><div className="text-sm font-semibold text-white">Roles and permissions</div><div className="mt-4 grid gap-2 text-sm text-emerald-50/80"><div><b className="text-white">Admin</b> - manage organization, licenses, policies</div><div><b className="text-white">Auditor</b> - read receipts and audit timeline</div><div><b className="text-white">Compliance</b> - build and approve policy versions</div><div><b className="text-white">Operator</b> - run approved workflows</div><div><b className="text-white">Viewer</b> - read approved outcomes</div></div></article></div> : null}

    {tab === "license" ? <div className="grid gap-4 lg:grid-cols-2"><article className="rounded-2xl border border-white/10 bg-white/[0.035] p-5"><div className="flex items-center gap-2 text-sm font-semibold text-white"><LockKeyhole className="h-4 w-4 text-cyan-100" />License Center</div><div className="mt-5 grid gap-3 text-sm text-white/60"><div>Status <b className="float-right text-white">{license?.status || "Unavailable"}</b></div><div>Organization <b className="float-right text-white">{license?.organizationId || "Not bound"}</b></div><div>Plan <b className="float-right text-white">{license?.plan || "-"}</b></div><div>Seats <b className="float-right text-white">{license?.seatLimit || 0}</b></div><div>Organizations <b className="float-right text-white">{license?.organizationLimit || 0}</b></div><div>Expiry <b className="float-right text-white">{license?.expiresAt || "-"}</b></div></div></article><article className="rounded-2xl border border-amber-300/16 bg-amber-300/[0.05] p-5"><div className="text-sm font-semibold text-white">Activation and renewal</div><div className="mt-4 grid gap-3 text-sm text-white/65"><div className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-200" />Signed license activation</div><div className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-200" />Offline license file support</div><div className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-200" />Usage, seats, organizations, expiry</div><div className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-200" />Grace period keeps historical reads available</div><div className="mt-2 rounded-xl border border-amber-200/15 bg-black/15 p-3 text-xs text-amber-50/75">The control plane issues renewals. The customer deployment verifies the signed file locally and never receives a private signing key.</div></div></article></div> : null}
  </section>;
}
