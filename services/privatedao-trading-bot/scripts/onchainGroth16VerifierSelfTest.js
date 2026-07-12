const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const {
  buildInstructionData,
  getOnchainVerifierStatus,
  verifyGroth16ProofOnchain,
} = require('../onchain/zkGroth16Verifier');

async function main() {
  const data = buildInstructionData();
  const status = await getOnchainVerifierStatus();
  if (!status.executable) {
    console.log(JSON.stringify({
      ok: false,
      CONFIG_PRESENT: status.configPresent ? 'YES' : 'NO',
      CODE_PATH_ACTIVE: 'YES',
      LOCAL_INSTRUCTION_DATA: data.length === 512 ? 'YES' : 'NO',
      ONCHAIN_VERIFIER_ACTIVE: 'NO',
      LIVE_TX_VERIFIED: 'NO',
      programId: status.programId,
      builtProgramId: status.builtProgramId,
      artifactBytes: status.artifactBytes,
      missing: status.missing,
    }, null, 2));
    process.exitCode = 2;
    return;
  }

  const verified = await verifyGroth16ProofOnchain({ instructionData: data });
  console.log(JSON.stringify({
    ok: true,
    CONFIG_PRESENT: 'YES',
    CODE_PATH_ACTIVE: 'YES',
    LOCAL_INSTRUCTION_DATA: 'YES',
    ONCHAIN_VERIFIER_ACTIVE: 'YES',
    LIVE_TX_VERIFIED: 'YES',
    programId: verified.programId,
    verifierSignature: verified.verifierSignature,
    verifierExplorerUrl: verified.verifierExplorerUrl,
  }, null, 2));
}

main().catch((err) => {
  console.error(JSON.stringify({ ok: false, error: err.message }, null, 2));
  process.exit(1);
});
