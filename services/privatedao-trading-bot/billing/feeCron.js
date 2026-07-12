const cron = require('node-cron');
const { supabase, getBotWallet } = require('../db/supabase');
const { getKeypairFromEncrypted } = require('../trading/wallet');
const { connection } = require('../trading/jupiter');
const { SystemProgram, Transaction, PublicKey, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const { CREATOR_WALLET, markFeesSettled, getUserTier, feePercentForTier } = require('../billing/fees');
const { generateSettlementProof } = require('../proof/privatedaoProof');
require('dotenv').config();

const MIN_SETTLEMENT_SOL = parseFloat(process.env.MIN_SETTLEMENT_SOL || '0.002'); // skip dust amounts
const CRON_SCHEDULE = process.env.FEE_SETTLEMENT_CRON || '*/1 * * * *';

// ─── Get all users with unsettled fees ────────────────────────────────────────
async function getUsersWithUnsettledFees() {
  const { data, error } = await supabase
    .from('pnl_records')
    .select('telegram_id, fee_owed_sol, fee_percent_applied')
    .eq('settled', false)
    .gt('fee_owed_sol', 0);

  if (error || !data) return [];

  // Group by telegram_id, sum fees and keep a weighted display fee.
  const grouped = {};
  for (const row of data) {
    const fee = parseFloat(row.fee_owed_sol || 0);
    if (!grouped[row.telegram_id]) grouped[row.telegram_id] = { totalFee: 0, weightedPercent: 0 };
    grouped[row.telegram_id].totalFee += fee;
    grouped[row.telegram_id].weightedPercent += fee * Number(row.fee_percent_applied || 0);
  }
  return Object.entries(grouped).map(([telegramId, value]) => ({
    telegramId: parseInt(telegramId),
    totalFee: value.totalFee,
    feePercent: value.totalFee > 0 ? value.weightedPercent / value.totalFee : null,
  }));
}

// ─── Settle one user's fee to creator wallet ─────────────────────────────────
async function settleUserFee(telegramId, feeAmountSol, notifyFn, feePercentOverride = null) {
  if (process.env.TRADING_BOT_EXECUTE_SWAPS !== 'true') {
    return { skipped: true, reason: 'dry_run_mode' };
  }

  if (feeAmountSol < MIN_SETTLEMENT_SOL) {
    return { skipped: true, reason: 'below_minimum' };
  }

  const botWallet = await getBotWallet(telegramId);
  if (!botWallet) {
    return { skipped: true, reason: 'no_wallet' };
  }

  const keypair = getKeypairFromEncrypted(botWallet.encrypted_private_key);
  const lamports = Math.floor(feeAmountSol * LAMPORTS_PER_SOL);

  // Verify enough balance covers the fee + tx cost
  const balance = await connection.getBalance(keypair.publicKey);
  if (balance < lamports + 5000) {
    return { skipped: true, reason: 'insufficient_balance', shortfall: (lamports + 5000 - balance) / LAMPORTS_PER_SOL };
  }

  try {
    const tx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: keypair.publicKey,
        toPubkey: new PublicKey(CREATOR_WALLET),
        lamports,
      })
    );

    const { blockhash } = await connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;
    tx.feePayer = keypair.publicKey;
    tx.sign(keypair);

    const txid = await connection.sendRawTransaction(tx.serialize());
    await connection.confirmTransaction(txid, 'confirmed');

    await markFeesSettled(telegramId, txid);

    // ZK/Merkle proof only for the encrypted tier — standard tier settles
    // without a proof attached, keeping it lighter/faster as expected.
    const userTier = await getUserTier(telegramId);
    const feePercent = feePercentOverride || feePercentForTier(userTier);
    let proof = null;
    if (userTier === 'encrypted') {
      proof = await generateSettlementProof({
        telegramId,
        txSignature: txid,
        amountSol: feeAmountSol,
        feePercent,
      });
      if (proof) {
        await supabase
          .from('pnl_records')
          .update({ proof_id: proof.proofId || null, proof_hash: proof.proofHash || null })
          .eq('telegram_id', telegramId)
          .eq('settlement_tx', txid);
      }
    }

    if (notifyFn) {
      await notifyFn(telegramId,
        `*Automatic PnL fee settlement*\n\n` +
        `${feeAmountSol.toFixed(4)} SOL was transferred to the creator wallet as ${feePercent}% of realized positive PnL.\n` +
        `[Tx](https://solscan.io/tx/${txid})` +
        (proof ? `\n[Proof](${proof.verifyUrl || '#'})` : '')
      );
    }

    return { success: true, txid, amount: feeAmountSol };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ─── Run full settlement cycle ────────────────────────────────────────────────
async function runSettlementCycle(notifyFn) {
  console.log('[Fee Cron] Starting settlement cycle...');
  const users = await getUsersWithUnsettledFees();

  let settled = 0, skipped = 0, failed = 0;

  for (const { telegramId, totalFee, feePercent } of users) {
    const result = await settleUserFee(telegramId, totalFee, notifyFn, feePercent);
    if (result.success) settled++;
    else if (result.skipped) skipped++;
    else failed++;

    // Small delay to avoid RPC rate limits
    await new Promise(r => setTimeout(r, 500));
  }

  console.log(`[Fee Cron] Done. Settled: ${settled}, Skipped: ${skipped}, Failed: ${failed}`);
  return { settled, skipped, failed, total: users.length };
}

// ─── Start the cron schedule ──────────────────────────────────────────────────
function startFeeCron(bot) {
  const notifyFn = async (telegramId, text) => {
    try {
      await bot.sendMessage(telegramId, text, { parse_mode: 'Markdown' });
    } catch (err) {
      console.error(`[Fee Cron] Could not notify ${telegramId}:`, err.message);
    }
  };

  cron.schedule(CRON_SCHEDULE, () => runSettlementCycle(notifyFn));
  console.log(`[Fee Cron] Scheduled: ${CRON_SCHEDULE}`);
}

module.exports = { startFeeCron, runSettlementCycle, settleUserFee, getUsersWithUnsettledFees };
