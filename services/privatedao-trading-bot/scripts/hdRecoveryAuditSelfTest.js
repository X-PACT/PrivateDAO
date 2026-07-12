const crypto = require('crypto');

const {
  deriveKeypairFromPath,
  derivePathFamilies,
  scanSeedCandidate,
} = require('./hdWalletRecoveryAudit');

async function main() {
  const seed = crypto.createHash('sha512').update('privatedao-hd-audit-selftest').digest();
  const path = "m/44'/501'/7'/0'";
  const target = deriveKeypairFromPath(seed, path).publicKey.toString();
  const paths = derivePathFamilies(10).flat();
  const result = scanSeedCandidate({
    label: 'synthetic-selftest',
    type: 'raw-seed',
    seed,
    targetPublicKey: target,
    paths,
  });

  if (!result.matched || result.matchPath !== path) {
    throw new Error('HD recovery audit self-test failed to find synthetic path');
  }

  if (JSON.stringify(result).includes(seed.toString('hex'))) {
    throw new Error('HD recovery audit leaked raw seed material');
  }

  console.log(JSON.stringify({
    ok: true,
    matched: result.matched,
    matchPath: result.matchPath,
    pathsTested: result.pathsTested,
  }, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
