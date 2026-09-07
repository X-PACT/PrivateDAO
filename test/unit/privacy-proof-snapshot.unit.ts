import { assert } from "chai";
import path from "node:path";

import { getPrivacyProofSnapshot } from "../../apps/web/src/lib/privacy-proof-snapshot";

describe("privacy proof snapshot unit coverage", () => {
  const originalCwd = process.cwd();

  before(() => {
    process.chdir(path.resolve(originalCwd, "apps/web"));
  });

  after(() => {
    process.chdir(originalCwd);
  });

  it("builds explorer links and mobile routes from repo evidence", () => {
    const snapshot = getPrivacyProofSnapshot();

    assert.match(snapshot.mobile.routeHref, /^\/documents\/real-device-runtime/);
    assert.match(snapshot.mobile.docHref, /^\/documents\/android-solflare-real-device-capture/);
    assert.equal(snapshot.governance.proposal.length > 0, true);
    assert.equal(snapshot.confidential.proposal.length > 0, true);

    if (snapshot.governance.revealTx) {
      assert.include(snapshot.explorer.governanceRevealHref ?? "", snapshot.governance.revealTx);
    }
    if (snapshot.confidential.settleTx) {
      assert.include(snapshot.explorer.confidentialSettleHref ?? "", snapshot.confidential.settleTx);
    }
  });
});
