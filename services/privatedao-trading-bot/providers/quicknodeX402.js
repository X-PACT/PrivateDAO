const bs58 = require('bs58');
const { Keypair } = require('@solana/web3.js');

function getQuickNodeX402Status() {
  const endpoint = process.env.QUICKNODE_X402_ENDPOINT || '';
  const wallet = process.env.QUICKNODE_X402_WALLET || '';
  const privateKey = process.env.QUICKNODE_X402_WALLET_PRIVATE_KEY || '';
  const configured = process.env.QUICKNODE_X402_ENABLED === 'true' && Boolean(endpoint && wallet);
  let signerMatchesWallet = false;
  let signerPublicKey = null;
  let signerError = null;

  if (privateKey) {
    try {
      const decoded = bs58.decode(privateKey.trim());
      const signer = decoded.length === 64
        ? Keypair.fromSecretKey(decoded)
        : Keypair.fromSeed(decoded);
      signerPublicKey = signer.publicKey.toString();
      signerMatchesWallet = signerPublicKey === wallet;
    } catch (error) {
      signerError = error.message;
    }
  }

  return {
    configured,
    endpointSet: Boolean(endpoint),
    walletSet: Boolean(wallet),
    signerSet: Boolean(privateKey),
    signerMatchesWallet,
    signerPublicKey,
    signerError,
    codePathActive: configured && signerMatchesWallet,
  };
}

module.exports = { getQuickNodeX402Status };
