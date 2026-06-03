"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Copy, KeyRound, QrCode, ShieldCheck } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";

import { WalletConnectButton } from "@/components/wallet-connect-button";
import { useI18n } from "@/components/i18n-provider";
import { Button, buttonVariants } from "@/components/ui/button";
import { entryFlowCopy } from "@/lib/entry-flow-copy";
import {
  createPrivateRoomInvite,
  getPrivateRoomInviteId,
  openPrivateRoomInvite,
  PRIVATE_ROOM_SESSION_KEY,
  type PrivateRoomAccessMode,
  type PrivateRoomInvitePayload,
} from "@/lib/room-invite";
import { cn } from "@/lib/utils";

const ROOM_COUNT_KEY = "privatedao.private-room-count";
type OpenedPrivateRoom = Required<PrivateRoomInvitePayload> & { roomId: string };

function incrementPrivateRoomCount() {
  const current = Number(window.localStorage.getItem(ROOM_COUNT_KEY) || "0");
  const next = Number.isFinite(current) ? current + 1 : 1;
  window.localStorage.setItem(ROOM_COUNT_KEY, String(next));
  return next;
}

export function PrivateRoomEntry({ mode }: { mode: "create" | "join" }) {
  const { locale } = useI18n();
  const copy = entryFlowCopy[locale];
  const searchParams = useSearchParams();
  const { connected, publicKey } = useWallet();
  const [roomName, setRoomName] = useState("");
  const [accessMode, setAccessMode] = useState<PrivateRoomAccessMode>("invite-only");
  const [inviteCode, setInviteCode] = useState(() => searchParams.get("invite") ?? "");
  const [inviteLink, setInviteLink] = useState("");
  const [openedRoom, setOpenedRoom] = useState<OpenedPrivateRoom | null>(null);
  const [feedback, setFeedback] = useState("");
  const [knownRoomCount, setKnownRoomCount] = useState(0);

  useEffect(() => {
    setKnownRoomCount(Number(window.localStorage.getItem(ROOM_COUNT_KEY) || "0"));
    const hashInvite = new URLSearchParams(window.location.hash.replace(/^#/, "")).get("invite");
    if (hashInvite) setInviteCode(hashInvite);
  }, []);

  const canCreate = connected && Boolean(publicKey) && roomName.trim().length >= 3;
  const qrUrl = useMemo(
    () => inviteLink ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(inviteLink)}` : "",
    [inviteLink],
  );

  async function handleCreate() {
    if (!publicKey || !canCreate) return;
    const invite = await createPrivateRoomInvite({
      roomName: roomName.trim(),
      accessMode,
      createdBy: publicKey.toBase58(),
    });
    const link = `${window.location.origin}/rooms/join#invite=${encodeURIComponent(invite.code)}`;
    setInviteCode(invite.code);
    setInviteLink(link);
    setOpenedRoom({ ...invite.payload, roomId: invite.roomId });
    setKnownRoomCount(incrementPrivateRoomCount());
    setFeedback("Private room created. Share the bearer invite only with approved members.");
  }

  async function handleJoin() {
    try {
      const [payload, roomId] = await Promise.all([
        openPrivateRoomInvite(inviteCode),
        getPrivateRoomInviteId(inviteCode),
      ]);
      setOpenedRoom({ ...payload, roomId });
      setFeedback("Invite accepted. Room details are visible only after the invite code is opened.");
    } catch (error) {
      setOpenedRoom(null);
      setFeedback(error instanceof Error ? error.message : "Invite could not be opened.");
    }
  }

  function storeRoomSession() {
    if (!openedRoom) return;
    window.sessionStorage.setItem(PRIVATE_ROOM_SESSION_KEY, JSON.stringify(openedRoom));
  }

  return (
    <section className="rounded-[30px] border border-emerald-300/18 bg-emerald-300/[0.07] p-5 md:p-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-black/22 p-4">
          <div className="text-[11px] uppercase tracking-[0.2em] text-white/42">{copy.privateRooms}</div>
          <div className="mt-2 text-3xl font-semibold text-white">{knownRoomCount}</div>
          <p className="mt-2 text-sm leading-6 text-white/58">{copy.privateRoomHelper}</p>
        </div>
        {[
          [copy.bearerInvite, copy.bearerInviteHelper],
          [copy.noInfluence, copy.noInfluenceHelper],
        ].map(([title, body]) => (
          <div key={title} className="rounded-2xl border border-white/10 bg-black/22 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <ShieldCheck className="h-4 w-4 text-emerald-100" />
              {title}
            </div>
            <p className="mt-2 text-sm leading-6 text-white/58">{body}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-[24px] border border-white/10 bg-black/24 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-[0.22em] text-emerald-100/72">
              {mode === "create" ? copy.createRoom : copy.enterRoom}
            </div>
            <div className="mt-2 text-sm leading-6 text-white/62">
              {mode === "create"
                ? copy.createRoomHelper
                : copy.enterRoomHelper}
            </div>
          </div>
          <WalletConnectButton connectLabel="Connect Testnet wallet" />
        </div>

        {mode === "create" ? (
          <>
            <input
              value={roomName}
              onChange={(event) => setRoomName(event.target.value)}
              className="mt-4 h-11 w-full rounded-2xl border border-white/10 bg-black/24 px-4 text-sm text-white outline-none placeholder:text-white/28"
              placeholder={copy.roomName}
            />
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {(["invite-only", "token-gated", "allowlist"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setAccessMode(option)}
                  className={cn(
                    "rounded-2xl border p-3 text-left text-sm transition",
                    accessMode === option ? "border-emerald-300/30 bg-emerald-300/[0.10] text-white" : "border-white/10 bg-black/20 text-white/58",
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
            <Button className="mt-4 w-full" disabled={!canCreate} onClick={() => void handleCreate()}>
              {copy.createInvite}
            </Button>
          </>
        ) : (
          <>
            <textarea
              value={inviteCode}
              onChange={(event) => setInviteCode(event.target.value)}
              className="mt-4 min-h-28 w-full rounded-2xl border border-white/10 bg-black/24 px-4 py-3 text-sm text-white outline-none placeholder:text-white/28"
              placeholder={copy.invitePlaceholder}
            />
            <Button className="mt-4 w-full" disabled={!connected || inviteCode.trim().length < 20} onClick={() => void handleJoin()}>
              {copy.openRoom}
            </Button>
          </>
        )}

        {feedback ? <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-3 text-sm text-white/66">{feedback}</div> : null}
      </div>

      {inviteLink ? (
        <div className="mt-5 grid gap-4 rounded-[24px] border border-cyan-300/16 bg-cyan-300/[0.06] p-4 lg:grid-cols-[180px_1fr]">
          <Image src={qrUrl} alt="Private room invitation QR code" width={180} height={180} unoptimized className="h-[180px] w-[180px] rounded-xl border border-white/12 bg-white p-2" />
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm font-semibold text-white"><QrCode className="h-4 w-4 text-cyan-100" />{copy.shareInvite}</div>
            <div className="mt-3 break-all rounded-2xl border border-white/10 bg-black/24 p-3 text-xs text-white/58">{inviteLink}</div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => void navigator.clipboard.writeText(inviteLink)}><Copy className="h-4 w-4" />{copy.copyLink}</Button>
              <Button size="sm" variant="outline" onClick={() => void navigator.clipboard.writeText(inviteCode)}><KeyRound className="h-4 w-4" />{copy.copyCode}</Button>
              <Link href={`/rooms/join#invite=${encodeURIComponent(inviteCode)}`} className={cn(buttonVariants({ size: "sm" }))}>{copy.openInvitation}</Link>
            </div>
          </div>
        </div>
      ) : null}

      {openedRoom ? (
        <div className="mt-5 rounded-[24px] border border-violet-300/18 bg-violet-300/[0.07] p-4">
          <div className="text-[11px] uppercase tracking-[0.22em] text-violet-100/72">{copy.invitedRoomUnlocked}</div>
          <div className="mt-2 text-xl font-semibold text-white">{openedRoom.roomName}</div>
          <p className="mt-2 text-sm leading-6 text-white/62">
            {copy.discussionLocked}
          </p>
          <Link
            href="/govern?flow=private-room#proposal-review-action"
            onClick={storeRoomSession}
            className={cn(buttonVariants({ size: "sm" }), "mt-4")}
          >
            {copy.continuePrivateVote}
          </Link>
        </div>
      ) : null}
    </section>
  );
}
