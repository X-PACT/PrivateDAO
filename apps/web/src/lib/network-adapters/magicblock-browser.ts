import { ConnectionMagicRouter } from "@magicblock-labs/ephemeral-rollups-sdk";

export type MagicBlockBrowserConnection = ConnectionMagicRouter;

export function createMagicBlockBrowserConnection(endpoint: string, wsEndpoint: string): MagicBlockBrowserConnection {
  return new ConnectionMagicRouter(endpoint, { wsEndpoint });
}

export function readMagicBlockSignatureStatuses(connection: MagicBlockBrowserConnection, signatures: string[]) {
  return connection.getSignatureStatuses(signatures);
}

export function readMagicBlockSlot(connection: MagicBlockBrowserConnection, commitment: "confirmed") {
  return connection.getSlot(commitment);
}
