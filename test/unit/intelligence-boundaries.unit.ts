import { assert } from "chai";

import { getIntelligenceProvider } from "../../apps/web/src/lib/intelligence/provider-registry";
import { buildSafeProposalPrompt } from "../../apps/web/src/lib/intelligence/llm/prompt-builder";

describe("intelligence provider boundaries", () => {
  it("safe prompt builder excludes hidden voting data", () => {
    const prompt = buildSafeProposalPrompt({
      publicTitle: "Fund Project X",
      publicDescription: "Should we fund Project X with $10,000?",
      hiddenVoteIntent: "YES_SECRET_INTENT",
      encryptedVoteContents: "ENCRYPTED_BALLOT",
      privateVoterIdentities: ["WhaleWalletIdentity"],
      privacyMode: "public-metadata-only",
    });

    assert.equal(prompt.sensitiveDataExcluded, true);
    assert.notInclude(prompt.prompt, "YES_SECRET_INTENT");
    assert.notInclude(prompt.prompt, "ENCRYPTED_BALLOT");
    assert.notInclude(prompt.prompt, "WhaleWalletIdentity");
  });

  it("default intelligence works without external provider keys", async () => {
    const provider = getIntelligenceProvider("qvac-local");
    const result = await provider.analyzeProposal({
      publicTitle: "Fund Project X",
      publicDescription: "Public proposal text",
      includeTreasuryContext: false,
      includeCounterpartyContext: false,
    });

    assert.equal(result.providerStatus, "available");
    assert.deepEqual(result.dataSentToProviders, ["proposal public metadata"]);
  });

  it("optional provider failure does not break registry flow", async () => {
    const provider = getIntelligenceProvider("arkham");
    const result = await provider.analyzeProposal({
      publicTitle: "Fund Project X",
      publicDescription: "Public proposal text",
    });

    assert.include(["disabled", "unavailable", "available"], result.providerStatus);
  });
});
