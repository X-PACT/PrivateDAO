export type PrivateRoomAccessMode = "invite-only" | "token-gated" | "allowlist";

export type PrivateRoomInvitePayload = {
  roomName: string;
  accessMode: PrivateRoomAccessMode;
  createdBy: string;
  createdAt?: string;
};

export type PrivateRoomInvite = {
  code: string;
  roomId: string;
  payload: Required<PrivateRoomInvitePayload>;
};

export const PRIVATE_ROOM_SESSION_KEY = "privatedao.private-room-session";

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

async function deriveRoomId(ciphertext: Uint8Array) {
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", toArrayBuffer(ciphertext)));
  return bytesToBase64Url(digest).slice(0, 18);
}

export async function getPrivateRoomInviteId(code: string) {
  const [version, , , ciphertextValue] = code.trim().split(".");
  if (version !== "pdao-room-v1" || !ciphertextValue) {
    throw new Error("Invalid private room invite.");
  }
  return deriveRoomId(base64UrlToBytes(ciphertextValue));
}

export async function createPrivateRoomInvite(input: PrivateRoomInvitePayload): Promise<PrivateRoomInvite> {
  const payload: Required<PrivateRoomInvitePayload> = {
    ...input,
    createdAt: input.createdAt ?? new Date().toISOString(),
  };
  const keyBytes = crypto.getRandomValues(new Uint8Array(32));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await crypto.subtle.importKey("raw", toArrayBuffer(keyBytes), "AES-GCM", false, ["encrypt"]);
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: toArrayBuffer(iv) },
      key,
      toArrayBuffer(textEncoder.encode(JSON.stringify(payload))),
    ),
  );
  const roomId = await deriveRoomId(ciphertext);

  return {
    code: ["pdao-room-v1", bytesToBase64Url(keyBytes), bytesToBase64Url(iv), bytesToBase64Url(ciphertext)].join("."),
    roomId,
    payload,
  };
}

export async function openPrivateRoomInvite(code: string): Promise<Required<PrivateRoomInvitePayload>> {
  try {
    const [version, keyValue, ivValue, ciphertextValue] = code.trim().split(".");
    if (version !== "pdao-room-v1" || !keyValue || !ivValue || !ciphertextValue) {
      throw new Error("Invalid private room invite.");
    }

    const key = await crypto.subtle.importKey("raw", toArrayBuffer(base64UrlToBytes(keyValue)), "AES-GCM", false, ["decrypt"]);
    const plaintext = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: toArrayBuffer(base64UrlToBytes(ivValue)) },
      key,
      toArrayBuffer(base64UrlToBytes(ciphertextValue)),
    );
    const payload = JSON.parse(textDecoder.decode(plaintext)) as Required<PrivateRoomInvitePayload>;

    if (!payload.roomName || !payload.createdBy || !payload.accessMode || !payload.createdAt) {
      throw new Error("Invalid private room invite payload.");
    }

    return payload;
  } catch {
    throw new Error("Invalid or unreadable private room invite.");
  }
}
