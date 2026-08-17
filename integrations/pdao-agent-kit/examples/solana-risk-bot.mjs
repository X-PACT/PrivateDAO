import { PrivateDAOAgentExchange } from "../index.mjs";

const mint = process.argv[2];
if (!mint) throw new Error("usage: node solana-risk-bot.mjs <mint>");
const pdao = new PrivateDAOAgentExchange();
const result = await pdao.verifyBasic({ mint });
console.log(JSON.stringify({
  mint,
  source: "PrivateDAO Agent Exchange",
  result,
  next: "Use verify.deep only when deeper evidence is required",
}, null, 2));
