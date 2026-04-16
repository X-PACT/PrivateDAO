import Link from "next/link";
import { ArrowUpRight, KeyRound, ShieldCheck, WalletCards } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { getCanonicalCustodyProofSnapshot } from "@/lib/canonical-custody-proof";
import { cn } from "@/lib/utils";

type CanonicalCustodyProofSurfaceProps = {
  mode?: "operations" | "documents";
};

function renderValue(value: string | null | undefined, fallback = "Awaiting external record") {
  return value && value.trim().length > 0 ? value : fallback;
}

export function CanonicalCustodyProofSurface({
  mode = "operations",
}: CanonicalCustodyProofSurfaceProps) {
  const snapshot = getCanonicalCustodyProofSnapshot();
  const badgeVariant =
    snapshot.completedItems === 0
      ? "warning"
      : snapshot.completedItems < snapshot.totalItems
        ? "cyan"
        : "success";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-[0.3em] text-cyan-300/80">
              Canonical custody proof
            </div>
            <CardTitle className="mt-2">
              Repo-backed multisig and authority proof, with active evidence targets and explorer-linked readiness points
            </CardTitle>
          </div>
          <Badge variant={badgeVariant}>
            {snapshot.status} · {snapshot.completedItems}/{snapshot.totalItems}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-5">
        <div className="rounded-3xl border border-white/8 bg-white/4 p-5 text-sm leading-7 text-white/60">
          {snapshot.summary}
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          <div className="rounded-3xl border border-white/8 bg-black/20 p-5">
            <div className="flex items-center gap-3">
              <KeyRound className="h-4 w-4 text-cyan-200" />
              <div className="text-sm font-medium text-white">Multisig and timelock</div>
            </div>
            <div className="mt-4 space-y-3 text-sm leading-7 text-white/58">
              <div><span className="text-white/76">Implementation:</span> {renderValue(snapshot.multisig.implementation)}</div>
              <div><span className="text-white/76">Multisig address:</span> {renderValue(snapshot.multisig.address)}</div>
              <div><span className="text-white/76">Threshold:</span> {snapshot.multisig.threshold}</div>
              <div><span className="text-white/76">Creation signature:</span> {renderValue(snapshot.multisig.creationSignature)}</div>
              <div><span className="text-white/76">Rehearsal signature:</span> {renderValue(snapshot.multisig.rehearsalSignature)}</div>
              <div><span className="text-white/76">Configured timelock:</span> {snapshot.timelock.configuredHours ?? "Awaiting external record"}{snapshot.timelock.configuredHours ? "h" : ""}</div>
              <div><span className="text-white/76">Timelock config proof:</span> {renderValue(snapshot.timelock.configurationSignature)}</div>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              {snapshot.multisig.addressExplorerUrl ? (
                <a className={cn(buttonVariants({ size: "sm", variant: "outline" }))} href={snapshot.multisig.addressExplorerUrl} target="_blank" rel="noreferrer">
                  Multisig explorer
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              ) : null}
              {snapshot.timelock.configurationExplorerUrl ? (
                <a className={cn(buttonVariants({ size: "sm", variant: "outline" }))} href={snapshot.timelock.configurationExplorerUrl} target="_blank" rel="noreferrer">
                  Timelock proof
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              ) : null}
              {snapshot.timelock.configurationReferenceUrl ? (
                <a className={cn(buttonVariants({ size: "sm", variant: "outline" }))} href={snapshot.timelock.configurationReferenceUrl} target="_blank" rel="noreferrer">
                  Timelock reference
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              ) : null}
            </div>
          </div>

          <div className="rounded-3xl border border-white/8 bg-black/20 p-5">
            <div className="flex items-center gap-3">
              <WalletCards className="h-4 w-4 text-emerald-200" />
              <div className="text-sm font-medium text-white">Signer roster</div>
            </div>
            <div className="mt-4 space-y-3">
              {snapshot.signers.map((signer) => (
                <div key={signer.slot} className="rounded-2xl border border-white/8 bg-white/4 p-3 text-sm leading-7 text-white/58">
                  <div className="font-medium text-white">
                    Slot {signer.slot} · {signer.role}
                  </div>
                  <div className="mt-1">Public key: {renderValue(signer.publicKey)}</div>
                  <div>Storage class: {signer.storageClass}</div>
                  <div>Backup documented: {signer.backupProcedureDocumented ? "yes" : "no"}</div>
                  {signer.publicKeyExplorerUrl ? (
                    <a className="mt-2 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-cyan-200" href={signer.publicKeyExplorerUrl} target="_blank" rel="noreferrer">
                      explorer
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/8 bg-black/20 p-5">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-4 w-4 text-amber-200" />
              <div className="text-sm font-medium text-white">Authority transfer proof</div>
            </div>
            <div className="mt-4 space-y-3">
              {snapshot.authorityTransfers.map((transfer) => (
                <div key={transfer.surface} className="rounded-2xl border border-white/8 bg-white/4 p-3 text-sm leading-7 text-white/58">
                  <div className="font-medium capitalize text-white">
                    {transfer.surface.split("-").join(" ")}
                  </div>
                  <div className="mt-1">Program ID: {transfer.programId}</div>
                  <div>Destination authority: {renderValue(transfer.destinationAuthority)}</div>
                  <div>Transfer signature: {renderValue(transfer.transferSignature)}</div>
                  <div>Post-transfer readout: {renderValue(transfer.postTransferReadout)}</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <a className={cn(buttonVariants({ size: "sm", variant: "outline" }))} href={transfer.programExplorerUrl} target="_blank" rel="noreferrer">
                      Program
                    </a>
                    {transfer.destinationExplorerUrl ? (
                      <a className={cn(buttonVariants({ size: "sm", variant: "outline" }))} href={transfer.destinationExplorerUrl} target="_blank" rel="noreferrer">
                        Destination
                      </a>
                    ) : null}
                    {transfer.transferExplorerUrl ? (
                      <a className={cn(buttonVariants({ size: "sm", variant: "outline" }))} href={transfer.transferExplorerUrl} target="_blank" rel="noreferrer">
                        Transfer tx
                      </a>
                    ) : null}
                    {transfer.postTransferReadoutReferenceUrl ? (
                      <a className={cn(buttonVariants({ size: "sm", variant: "outline" }))} href={transfer.postTransferReadoutReferenceUrl} target="_blank" rel="noreferrer">
                        Readout reference
                      </a>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-3xl border border-amber-300/14 bg-amber-300/[0.06] p-5">
            <div className="text-[11px] uppercase tracking-[0.28em] text-amber-200/78">
              Active evidence targets
            </div>
            <div className="mt-4 grid gap-2">
              {snapshot.pendingItems.map((item) => (
                <div key={item} className="text-sm leading-7 text-white/62">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/8 bg-white/4 p-5">
            <div className="text-[11px] uppercase tracking-[0.28em] text-cyan-200/76">
              Next readiness gate and sources
            </div>
            <div className="mt-4 text-sm leading-7 text-white/62">
              <div><span className="text-white/78">Gate:</span> {snapshot.blocker.id}</div>
              <div><span className="text-white/78">Severity:</span> {snapshot.blocker.severity}</div>
              <div><span className="text-white/78">Status:</span> {snapshot.blocker.status}</div>
              <div className="mt-2">{snapshot.blocker.nextAction}</div>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link className={cn(buttonVariants({ size: "sm", variant: "secondary" }))} href="/documents/custody-proof-reviewer-packet">
                Reviewer packet
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
              <Link className={cn(buttonVariants({ size: "sm", variant: "outline" }))} href="/documents/multisig-setup-intake">
                Intake shape
              </Link>
              {snapshot.rawSources.map((source) => (
                <a
                  key={source.href}
                  className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
                  href={source.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  {source.label}
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
            {mode === "documents" ? (
              <div className="mt-4 rounded-2xl border border-white/8 bg-black/20 p-4 text-sm leading-7 text-white/58">
                This is the canonical proof surface. It reflects the repo-backed custody record directly and keeps operator draft capture separate from official readiness evidence.
              </div>
            ) : null}
          </div>
        </div>

        <div className="rounded-3xl border border-white/8 bg-white/4 p-5">
          <div className="text-[11px] uppercase tracking-[0.28em] text-cyan-200/76">
            Observed chain readouts
          </div>
          <div className="mt-4 grid gap-4 xl:grid-cols-2">
            {snapshot.observedReadouts.map((readout) => (
              <div key={readout.id} className="rounded-2xl border border-white/8 bg-black/20 p-4 text-sm leading-7 text-white/58">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium text-white">{readout.label}</div>
                  <Badge variant={readout.status === "observed" ? "success" : "warning"}>
                    {readout.cluster} · {readout.status}
                  </Badge>
                </div>
                <div className="mt-3 break-words">
                  <span className="text-white/76">Address:</span> {readout.address}
                </div>
                {readout.authority ? (
                  <div><span className="text-white/76">Authority:</span> {readout.authority}</div>
                ) : null}
                {readout.programDataAddress ? (
                  <div><span className="text-white/76">ProgramData:</span> {readout.programDataAddress}</div>
                ) : null}
                {readout.owner ? (
                  <div><span className="text-white/76">Owner:</span> {readout.owner}</div>
                ) : null}
                {readout.lastDeploySlot ? (
                  <div><span className="text-white/76">Last deploy slot:</span> {readout.lastDeploySlot}</div>
                ) : null}
                {readout.balanceSol ? (
                  <div><span className="text-white/76">Balance:</span> {readout.balanceSol} SOL</div>
                ) : null}
                {typeof readout.executable === "boolean" ? (
                  <div><span className="text-white/76">Executable:</span> {readout.executable ? "yes" : "no"}</div>
                ) : null}
                {readout.error ? (
                  <div className="mt-2 text-amber-100/88">
                    <span className="text-white/76">Observed error:</span> {readout.error}
                  </div>
                ) : null}
                {readout.note ? <div className="mt-2">{readout.note}</div> : null}
                <div className="mt-3 text-xs uppercase tracking-[0.22em] text-white/36">
                  observed at {readout.observedAt}
                </div>
                <div className="mt-2 break-words text-xs text-white/40">{readout.command}</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {readout.explorerUrl ? (
                    <a className={cn(buttonVariants({ size: "sm", variant: "outline" }))} href={readout.explorerUrl} target="_blank" rel="noreferrer">
                      Explorer
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
