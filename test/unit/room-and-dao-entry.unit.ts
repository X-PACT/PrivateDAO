import { assert } from "chai";

import { buildPublicDaoDirectory } from "../../apps/web/src/lib/public-dao-directory";
import { entryFlowCopy } from "../../apps/web/src/lib/entry-flow-copy";
import { supportedLocales } from "../../apps/web/src/lib/i18n";
import { createPrivateRoomInvite, getPrivateRoomInviteId, openPrivateRoomInvite } from "../../apps/web/src/lib/room-invite";

describe("room and DAO entry flows", () => {
  it("builds a deduplicated public DAO directory without private room records", () => {
    const directory = buildPublicDaoDirectory([
      {
        pubkey: "proposal-one",
        title: "Older proposal",
        phase: "Voting",
        daoDetails: {
          pubkey: "dao-public",
          daoName: "Public Council",
          governanceToken: "mint-public",
          authority: "authority-public",
        },
      },
      {
        pubkey: "proposal-two",
        title: "Active proposal",
        phase: "Finalized",
        daoDetails: {
          pubkey: "dao-public",
          daoName: "Public Council",
          governanceToken: "mint-public",
          authority: "authority-public",
        },
      },
      {
        pubkey: "proposal-private",
        phase: "Voting",
        daoDetails: {
          pubkey: "dao-private",
          daoName: "Secret Review Room",
          governanceToken: "mint-private",
          authority: "authority-private",
        },
        privacyMode: "private-room",
      },
    ]);

    assert.lengthOf(directory, 1);
    assert.equal(directory[0]?.daoName, "Public Council");
    assert.equal(directory[0]?.proposalCount, 2);
    assert.equal(directory[0]?.activeProposalCount, 1);
    assert.equal(directory[0]?.latestProposalAddress, "proposal-one");
  });

  it("encrypts private room names inside bearer invite codes", async () => {
    const invite = await createPrivateRoomInvite({
      roomName: "Secret Review Room",
      accessMode: "invite-only",
      createdBy: "wallet-public-key",
    });

    assert.notInclude(invite.code, "Secret");
    assert.notInclude(invite.code, "Review");
    assert.notInclude(invite.code, "wallet-public-key");

    const opened = await openPrivateRoomInvite(invite.code);
    assert.equal(opened.roomName, "Secret Review Room");
    assert.equal(opened.accessMode, "invite-only");
    assert.equal(opened.createdBy, "wallet-public-key");
    assert.equal(await getPrivateRoomInviteId(invite.code), invite.roomId);
  });

  it("rejects tampered private room invite codes", async () => {
    const invite = await createPrivateRoomInvite({
      roomName: "Incident Room",
      accessMode: "invite-only",
      createdBy: "wallet-public-key",
    });

    const parts = invite.code.split(".");
    const ciphertext = parts[3]!;
    const index = Math.floor(ciphertext.length / 2);
    parts[3] = `${ciphertext.slice(0, index)}${ciphertext[index] === "A" ? "B" : "A"}${ciphertext.slice(index + 1)}`;
    const tampered = parts.join(".");
    let error: Error | null = null;
    try {
      await openPrivateRoomInvite(tampered);
    } catch (caught) {
      error = caught as Error;
    }

    assert.instanceOf(error, Error);
    assert.match(error?.message ?? "", /invalid|decrypt|invite/i);
  });

  it("keeps the new entry flow available in all nine site languages", () => {
    assert.lengthOf(supportedLocales, 9);
    for (const locale of supportedLocales) {
      const copy = entryFlowCopy[locale.code];
      for (const value of Object.values(copy)) {
        assert.isNotEmpty(value, `${locale.code} entry flow copy contains an empty value`);
      }
    }
  });
});
