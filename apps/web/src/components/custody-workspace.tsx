"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Copy,
  Download,
  KeyRound,
  Link2,
  ShieldCheck,
  WalletCards,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authorityHardeningLinks, authorityHardeningSections } from "@/lib/authority-hardening";
import {
  buildCustodyEvidenceJson,
  buildCustodyEvidenceMarkdown,
  buildCustodyEvidenceIntakePayload,
  custodyAuthorityTransferSurfaces,
  custodyProgramId,
  emptyCustodyEvidence,
  getCustodyEvidenceCompletion,
  looksLikeReference,
  looksLikeSolanaAddress,
  looksLikeSolanaSignature,
  normalizeThreshold,
  readCustodyEvidence,
  writeCustodyEvidence,
  type CustodyAuthorityTransferEvidence,
  type CustodyEvidence,
  type CustodySignerEvidence,
} from "@/lib/custody-evidence";
import { cn } from "@/lib/utils";

const custodySteps = [
  {
    title: "Define signer set",
    summary: "Freeze the real 3-signer roster and backup procedures before any authority movement.",
    state: "Repo-ready",
  },
  {
    title: "Record multisig package",
    summary: "Collect the implementation, address, creation signature, rehearsal signature, and timelock references in one structured packet.",
    state: "Strict ingestion live",
  },
  {
    title: "Capture authority transfer evidence",
    summary: "Record the destination authority, transfer signature, and post-transfer readout reference for each operational surface.",
    state: "External execution next",
  },
  {
    title: "Apply and rebuild canonical proof",
    summary: "Save the JSON packet into `docs/custody-evidence-intake.json` and run the apply command to update canonical proof artifacts.",
    state: "Repo automation ready",
  },
];

type ValidationState = {
  ok: boolean;
  text: string;
};

function downloadPacket(filename: string, contents: string, mimeType = "text/plain;charset=utf-8") {
  const blob = new Blob([contents], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

function getValidationTone(validation: ValidationState) {
  return validation.ok
    ? "border-emerald-300/18 bg-emerald-300/[0.07] text-emerald-100"
    : "border-amber-300/18 bg-amber-300/[0.08] text-amber-100";
}

function summarizeValidation(ok: boolean, successText: string, pendingText: string): ValidationState {
  return { ok, text: ok ? successText : pendingText };
}

function getSignerValidation(signer: CustodySignerEvidence): ValidationState {
  return summarizeValidation(
    looksLikeSolanaAddress(signer.publicKey) && signer.backupProcedureDocumented,
    "Public key and backup discipline recorded.",
    "Need a real signer public key and backup confirmation.",
  );
}

function getTransferValidation(transfer: CustodyAuthorityTransferEvidence): ValidationState {
  const ok =
    looksLikeSolanaAddress(transfer.destinationAuthority) &&
    looksLikeSolanaSignature(transfer.transferSignature) &&
    transfer.postTransferReadout.trim().length > 0 &&
    looksLikeReference(transfer.postTransferReadoutReferenceUrl);

  return summarizeValidation(
    ok,
    "Destination, signature, and readout reference are all recorded.",
    "Need destination authority, transfer signature, readout text, and a reference link.",
  );
}

function EvidenceStatus({ validation }: { validation: ValidationState }) {
  return (
    <div className={cn("rounded-full border px-3 py-1 text-xs font-medium", getValidationTone(validation))}>
      {validation.ok ? "Valid" : "Next step"}
    </div>
  );
}

export function CustodyWorkspace() {
  const [draftEvidence, setDraftEvidence] = useState<CustodyEvidence>(emptyCustodyEvidence);
  const [copyState, setCopyState] = useState<"idle" | "json" | "markdown">("idle");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDraftEvidence(readCustodyEvidence());
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    writeCustodyEvidence(draftEvidence);
  }, [draftEvidence]);

  function updateDraftEvidence<K extends keyof CustodyEvidence>(
    key: K,
    value: CustodyEvidence[K],
  ) {
    setDraftEvidence((current) => ({ ...current, [key]: value }));
  }

  function updateSigner(slot: number, next: Partial<CustodySignerEvidence>) {
    setDraftEvidence((current) => ({
      ...current,
      signers: current.signers.map((signer) =>
        signer.slot === slot ? { ...signer, ...next } : signer,
      ),
    }));
  }

  function updateTransfer(surface: CustodyAuthorityTransferEvidence["surface"], next: Partial<CustodyAuthorityTransferEvidence>) {
    setDraftEvidence((current) => ({
      ...current,
      authorityTransfers: current.authorityTransfers.map((transfer) =>
        transfer.surface === surface ? { ...transfer, ...next } : transfer,
      ),
    }));
  }

  const completion = useMemo(() => getCustodyEvidenceCompletion(draftEvidence), [draftEvidence]);
  const intakePayload = useMemo(() => buildCustodyEvidenceIntakePayload(draftEvidence), [draftEvidence]);
  const jsonPacket = useMemo(() => buildCustodyEvidenceJson(draftEvidence), [draftEvidence]);
  const markdownPacket = useMemo(() => buildCustodyEvidenceMarkdown(draftEvidence), [draftEvidence]);

  const multisigValidation = useMemo(
    () =>
      summarizeValidation(
        draftEvidence.multisigImplementation !== "pending-selection" &&
          looksLikeSolanaAddress(draftEvidence.multisigAddress) &&
          looksLikeSolanaSignature(draftEvidence.multisigCreationSignature) &&
          looksLikeSolanaSignature(draftEvidence.rehearsalSignature),
        "Implementation, multisig address, creation signature, and rehearsal signature are recorded.",
        "Need implementation, multisig address, creation signature, and rehearsal signature.",
      ),
    [
      draftEvidence.multisigAddress,
      draftEvidence.multisigCreationSignature,
      draftEvidence.multisigImplementation,
      draftEvidence.rehearsalSignature,
    ],
  );

  const thresholdValidation = useMemo(
    () =>
      summarizeValidation(
        normalizeThreshold(draftEvidence.threshold) === "2-of-3" &&
          Number(draftEvidence.timelockConfiguredHours) >= 48 &&
          looksLikeSolanaSignature(draftEvidence.timelockConfigurationSignature) &&
          looksLikeReference(draftEvidence.timelockConfigurationReferenceUrl),
        "Threshold and timelock evidence are fully recorded.",
        "Need exact 2-of-3 threshold, 48+ hour timelock, configuration signature, and reference URL.",
      ),
    [
      draftEvidence.threshold,
      draftEvidence.timelockConfiguredHours,
      draftEvidence.timelockConfigurationReferenceUrl,
      draftEvidence.timelockConfigurationSignature,
    ],
  );

  const copyJsonPacket = async () => {
    await navigator.clipboard.writeText(jsonPacket);
    setCopyState("json");
    window.setTimeout(() => setCopyState("idle"), 1600);
  };

  const copyMarkdownPacket = async () => {
    await navigator.clipboard.writeText(markdownPacket);
    setCopyState("markdown");
    window.setTimeout(() => setCopyState("idle"), 1600);
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-[11px] uppercase tracking-[0.3em] text-cyan-300/80">Strict custody ingestion</div>
              <CardTitle className="mt-2">Record ceremony evidence in the exact shape needed by the canonical custody proof</CardTitle>
            </div>
            <Badge variant={completion.completed === completion.total ? "success" : completion.completed > 0 ? "cyan" : "warning"}>
              {completion.completed}/{completion.total} gates
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="rounded-3xl border border-white/8 bg-white/4 p-5">
            <div className="text-sm leading-7 text-white/60">
              This surface no longer collects free-form notes only. It builds a strict, reviewer-safe JSON packet that maps directly into{" "}
              <code>docs/multisig-setup-intake.json</code>. Only public keys, public transaction signatures, and readout references belong here.
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {custodySteps.map((step) => (
              <div key={step.title} className="rounded-3xl border border-white/8 bg-black/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-medium text-white">{step.title}</div>
                  <Badge variant={step.state === "Repo-ready" ? "success" : step.state === "Strict ingestion live" ? "cyan" : "warning"}>
                    {step.state}
                  </Badge>
                </div>
                <div className="mt-3 text-sm leading-7 text-white/56">{step.summary}</div>
              </div>
            ))}
          </div>

          <div id="multisig-address" className="rounded-3xl border border-cyan-300/12 bg-cyan-300/5 p-5 scroll-mt-24">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-[11px] uppercase tracking-[0.28em] text-cyan-200/72">Multisig package</div>
                <div className="mt-1 text-lg font-semibold text-white">Implementation, address, creation signature, and rehearsal signature</div>
              </div>
              <EvidenceStatus validation={multisigValidation} />
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <label className="space-y-2">
                <div className="text-sm font-medium text-white">Implementation</div>
                <input
                  value={draftEvidence.multisigImplementation}
                  onChange={(event) => updateDraftEvidence("multisigImplementation", event.target.value)}
                  className="h-11 w-full rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none placeholder:text-white/28"
                  placeholder="squads-v4"
                />
              </label>
              <label className="space-y-2">
                <div className="text-sm font-medium text-white">Multisig public address</div>
                <input
                  value={draftEvidence.multisigAddress}
                  onChange={(event) => updateDraftEvidence("multisigAddress", event.target.value)}
                  className="h-11 w-full rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none placeholder:text-white/28"
                  placeholder="Enter the production multisig public address"
                />
              </label>
              <label className="space-y-2">
                <div className="text-sm font-medium text-white">Multisig creation signature</div>
                <input
                  value={draftEvidence.multisigCreationSignature}
                  onChange={(event) => updateDraftEvidence("multisigCreationSignature", event.target.value)}
                  className="h-11 w-full rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none placeholder:text-white/28"
                  placeholder="Public creation transaction signature"
                />
              </label>
              <label className="space-y-2">
                <div className="text-sm font-medium text-white">Rehearsal signature</div>
                <input
                  value={draftEvidence.rehearsalSignature}
                  onChange={(event) => updateDraftEvidence("rehearsalSignature", event.target.value)}
                  className="h-11 w-full rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none placeholder:text-white/28"
                  placeholder="Zero-value or low-risk rehearsal transaction"
                />
              </label>
            </div>
            <div className="mt-4 text-sm leading-7 text-white/58">{multisigValidation.text}</div>
          </div>

          <div id="threshold" className="rounded-3xl border border-white/8 bg-black/20 p-5 scroll-mt-24">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-[11px] uppercase tracking-[0.28em] text-cyan-200/72">Threshold and timelock</div>
                <div className="mt-1 text-lg font-semibold text-white">Capture the final threshold and 48+ hour configuration evidence</div>
              </div>
              <EvidenceStatus validation={thresholdValidation} />
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <label className="space-y-2">
                <div className="text-sm font-medium text-white">Threshold</div>
                <input
                  value={draftEvidence.threshold}
                  onChange={(event) => updateDraftEvidence("threshold", event.target.value)}
                  className="h-11 w-full rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none placeholder:text-white/28"
                  placeholder="2-of-3"
                />
              </label>
              <label className="space-y-2">
                <div className="text-sm font-medium text-white">Configured timelock hours</div>
                <input
                  value={draftEvidence.timelockConfiguredHours}
                  onChange={(event) => updateDraftEvidence("timelockConfiguredHours", event.target.value)}
                  className="h-11 w-full rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none placeholder:text-white/28"
                  placeholder="48"
                />
              </label>
              <label className="space-y-2">
                <div className="text-sm font-medium text-white">Timelock configuration signature</div>
                <input
                  value={draftEvidence.timelockConfigurationSignature}
                  onChange={(event) => updateDraftEvidence("timelockConfigurationSignature", event.target.value)}
                  className="h-11 w-full rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none placeholder:text-white/28"
                  placeholder="Configuration transaction signature"
                />
              </label>
              <label className="space-y-2">
                <div className="text-sm font-medium text-white">Timelock reference URL or docs path</div>
                <input
                  value={draftEvidence.timelockConfigurationReferenceUrl}
                  onChange={(event) => updateDraftEvidence("timelockConfigurationReferenceUrl", event.target.value)}
                  className="h-11 w-full rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none placeholder:text-white/28"
                  placeholder="https://explorer.solana.com/... or docs/..."
                />
              </label>
            </div>
            <div className="mt-4 text-sm leading-7 text-white/58">{thresholdValidation.text}</div>
          </div>

          <div id="signer-roster" className="rounded-3xl border border-white/8 bg-black/20 p-5 scroll-mt-24">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[11px] uppercase tracking-[0.28em] text-cyan-200/72">Signer roster</div>
                <div className="mt-1 text-lg font-semibold text-white">Record each signer slot with a real public key and backup confirmation</div>
              </div>
              <EvidenceStatus
                validation={summarizeValidation(
                  completion.checks.signerRoster,
                  "All signer slots are structurally complete.",
                  "One or more signer slots still need a public key or backup confirmation.",
                )}
              />
            </div>
            <div className="mt-4 grid gap-4">
              {draftEvidence.signers.map((signer) => {
                const validation = getSignerValidation(signer);
                return (
                  <div key={signer.slot} className="rounded-3xl border border-white/8 bg-white/[0.03] p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="text-sm font-medium text-white">
                        Slot {signer.slot} · {signer.role}
                      </div>
                      <EvidenceStatus validation={validation} />
                    </div>
                    <div className="mt-4 grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
                      <label className="space-y-2">
                        <div className="text-sm font-medium text-white">Signer public key</div>
                        <input
                          value={signer.publicKey}
                          onChange={(event) => updateSigner(signer.slot, { publicKey: event.target.value })}
                          className="h-11 w-full rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none placeholder:text-white/28"
                          placeholder="Public key only"
                        />
                      </label>
                      <label className="flex items-end gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                        <input
                          type="checkbox"
                          checked={signer.backupProcedureDocumented}
                          onChange={(event) =>
                            updateSigner(signer.slot, { backupProcedureDocumented: event.target.checked })
                          }
                          className="mt-1 h-4 w-4 rounded border-white/20 bg-black/20"
                        />
                        <div>
                          <div className="text-sm font-medium text-white">Backup procedure documented</div>
                          <div className="text-xs leading-6 text-white/50">Still no private keys or seed phrases here.</div>
                        </div>
                      </label>
                    </div>
                    <div className="mt-3 text-sm leading-7 text-white/58">{validation.text}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-white/8 bg-black/20 p-5">
            <div className="text-[11px] uppercase tracking-[0.28em] text-cyan-200/72">Authority transfer surfaces</div>
            <div className="mt-1 text-lg font-semibold text-white">Each surface needs destination authority, transfer signature, and post-transfer readout reference</div>
            <div className="mt-4 grid gap-4">
              {custodyAuthorityTransferSurfaces.map((surface) => {
                const transfer = draftEvidence.authorityTransfers.find((entry) => entry.surface === surface)!;
                const validation = getTransferValidation(transfer);

                return (
                  <div
                    key={surface}
                    id={
                      surface === "program-upgrade-authority"
                        ? "upgrade-transfer-signature"
                        : surface === "treasury-operator-authority"
                          ? "treasury-transfer-signature"
                          : undefined
                    }
                    className="rounded-3xl border border-white/8 bg-white/[0.03] p-4 scroll-mt-24"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-medium text-white">{surface}</div>
                        <div className="mt-1 text-xs uppercase tracking-[0.24em] text-white/38">{transfer.programId}</div>
                      </div>
                      <EvidenceStatus validation={validation} />
                    </div>
                    <div className="mt-4 grid gap-4 lg:grid-cols-2">
                      <label className="space-y-2">
                        <div className="text-sm font-medium text-white">Destination authority</div>
                        <input
                          value={transfer.destinationAuthority}
                          onChange={(event) =>
                            updateTransfer(surface, { destinationAuthority: event.target.value, programId: custodyProgramId })
                          }
                          className="h-11 w-full rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none placeholder:text-white/28"
                          placeholder="Final authority public key"
                        />
                      </label>
                      <label className="space-y-2">
                        <div className="text-sm font-medium text-white">Transfer signature</div>
                        <input
                          value={transfer.transferSignature}
                          onChange={(event) =>
                            updateTransfer(surface, { transferSignature: event.target.value, programId: custodyProgramId })
                          }
                          className="h-11 w-full rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none placeholder:text-white/28"
                          placeholder="Public transaction signature"
                        />
                      </label>
                      <label
                        id={surface === "dao-authority" ? "post-transfer-readouts" : undefined}
                        className="space-y-2 lg:col-span-2 scroll-mt-24"
                      >
                        <div className="text-sm font-medium text-white">Post-transfer readout</div>
                        <textarea
                          value={transfer.postTransferReadout}
                          onChange={(event) =>
                            updateTransfer(surface, { postTransferReadout: event.target.value, programId: custodyProgramId })
                          }
                          className="min-h-24 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-white/28"
                          placeholder="Paste the exact authority or ownership readout here"
                        />
                      </label>
                      <label className="space-y-2 lg:col-span-2">
                        <div className="text-sm font-medium text-white">Readout reference URL or docs path</div>
                        <input
                          value={transfer.postTransferReadoutReferenceUrl}
                          onChange={(event) =>
                            updateTransfer(surface, {
                              postTransferReadoutReferenceUrl: event.target.value,
                              programId: custodyProgramId,
                            })
                          }
                          className="h-11 w-full rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none placeholder:text-white/28"
                          placeholder="https://explorer.solana.com/... or docs/..."
                        />
                      </label>
                    </div>
                    <div className="mt-3 text-sm leading-7 text-white/58">{validation.text}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {authorityHardeningSections.map((section, index) => (
              <div key={section.title} className="rounded-3xl border border-white/8 bg-white/4 p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl border border-white/8 bg-black/25 p-3 text-cyan-200">
                    {index === 0 ? <KeyRound className="h-4 w-4" /> : index === 1 ? <WalletCards className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                  </div>
                  <div className="text-base font-medium text-white">{section.title}</div>
                </div>
                <p className="mt-3 text-sm leading-7 text-white/58">{section.summary}</p>
                <div className="mt-4 space-y-2">
                  {section.bullets.map((bullet) => (
                    <div key={bullet} className="text-sm leading-7 text-white/54">
                      {bullet}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card id="strict-intake-packet" className="scroll-mt-24">
        <CardHeader>
          <CardTitle>Strict intake packet</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-3xl border border-emerald-300/12 bg-emerald-300/[0.06] p-5">
            <div className="text-[11px] uppercase tracking-[0.28em] text-emerald-300/75">How to close this fast</div>
            <div className="mt-3 text-sm leading-7 text-white/58">
              When the real ceremony values arrive, download the JSON packet below, save it as <code>docs/custody-evidence-intake.json</code>, then run <code>npm run apply:custody-evidence-intake</code>. That command updates the canonical intake and rebuilds canonical custody proof, reviewer packet, and launch trust packet artifacts together.
            </div>
          </div>

          <div className="rounded-3xl border border-white/8 bg-black/20 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[11px] uppercase tracking-[0.28em] text-white/40">Ingestion readiness</div>
                <div className="mt-1 text-lg font-semibold text-white">{completion.completed}/{completion.total} structured gates passed</div>
              </div>
              <Badge variant={completion.completed === completion.total ? "success" : completion.completed > 0 ? "cyan" : "warning"}>
                {intakePayload.status}
              </Badge>
            </div>
            <div className="mt-3 text-sm leading-7 text-white/58">
              This local packet remains reviewer-safe. It accepts only public keys, public transaction signatures, and docs or explorer references.
            </div>
          </div>

          <div className="rounded-3xl border border-white/8 bg-black/20 p-5">
            <div className="text-[11px] uppercase tracking-[0.28em] text-white/40">Current packet preview</div>
            <div className="mt-3 space-y-3 text-sm leading-7 text-white/58">
              <div>Multisig implementation: {intakePayload.multisig.implementation}</div>
              <div>Multisig address: {intakePayload.multisig.address ?? "Not recorded yet"}</div>
              <div>Timelock configured hours: {intakePayload.timelock.configuredHours ?? "Not recorded yet"}</div>
              <div>Signer keys populated: {intakePayload.signers.filter((signer) => signer.publicKey).length}/3</div>
              <div>Authority transfers with signatures: {intakePayload.authorityTransfers.filter((transfer) => transfer.transferSignature).length}/3</div>
            </div>
          </div>

          <div className="grid gap-3">
            <Button onClick={copyJsonPacket} className="justify-between">
              {copyState === "json" ? "Copied strict JSON packet" : "Copy strict JSON packet"}
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                downloadPacket(
                  "privatedao-custody-evidence-intake.json",
                  jsonPacket,
                  "application/json;charset=utf-8",
                )
              }
              className="justify-between"
            >
              Download strict JSON packet
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="secondary" onClick={copyMarkdownPacket} className="justify-between">
              {copyState === "markdown" ? "Copied handoff markdown" : "Copy operator handoff markdown"}
              <Link2 className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => downloadPacket("privatedao-custody-evidence-handoff.md", markdownPacket)}
              className="justify-between"
            >
              Download operator handoff markdown
              <Download className="h-4 w-4" />
            </Button>
            <div className="rounded-3xl border border-amber-300/12 bg-amber-300/[0.06] p-4">
              <div className="flex items-center gap-2 text-amber-100">
                <AlertTriangle className="h-4 w-4" />
                <div className="text-xs uppercase tracking-[0.24em] text-amber-200/78">Never include secrets</div>
              </div>
              <div className="mt-3 text-sm leading-7 text-white/58">
                No seed phrases, private keys, unencrypted keypair exports, or screenshots containing secret material belong in this packet.
              </div>
            </div>
            {authorityHardeningLinks.map((link) => (
              <Link key={link.href} href={link.href} className={cn(buttonVariants({ variant: "outline" }), "justify-between")}>
                {link.label}
              </Link>
            ))}
            <Link href="/documents/multisig-setup-intake" className={cn(buttonVariants({ variant: "secondary" }), "justify-between")}>
              Open multisig setup intake
            </Link>
            <Link href="/documents/canonical-custody-proof" className={cn(buttonVariants({ variant: "secondary" }), "justify-between")}>
              Open canonical custody proof
            </Link>
            <Link href="/documents/custody-proof-reviewer-packet" className={cn(buttonVariants({ variant: "secondary" }), "justify-between")}>
              Open reviewer packet
            </Link>
            <Link href="/documents/launch-trust-packet" className={cn(buttonVariants({ variant: "secondary" }), "justify-between")}>
              Open launch trust packet
            </Link>
            <Link href="/documents/authority-transfer-runbook" className={cn(buttonVariants({ variant: "secondary" }), "justify-between")}>
              Open authority transfer runbook
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
