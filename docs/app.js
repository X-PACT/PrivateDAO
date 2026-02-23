import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  SystemProgram,
  clusterApiUrl,
} from "https://esm.sh/@solana/web3.js@1.98.4?bundle";

const TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
const statusEl = document.getElementById("status");

const ui = {
  clusterPill: document.getElementById("clusterPill"),
  programPill: document.getElementById("programPill"),
  deployPill: document.getElementById("deployPill"),
  connectBtn: document.getElementById("connectBtn"),
  walletLabel: document.getElementById("walletLabel"),
  networkLabel: document.getElementById("networkLabel"),
  refreshDaos: document.getElementById("refreshDaos"),
  daoList: document.getElementById("daoList"),
  daoForProposal: document.getElementById("daoForProposal"),
  proposalManual: document.getElementById("proposalManual"),
  refreshProposals: document.getElementById("refreshProposals"),
  proposalList: document.getElementById("proposalList"),
  createDao: document.getElementById("createDao"),
  createTitle: document.getElementById("createTitle"),
  createDescription: document.getElementById("createDescription"),
  createDuration: document.getElementById("createDuration"),
  createProposalBtn: document.getElementById("createProposalBtn"),
  proposalPda: document.getElementById("proposalPda"),
  daoPda: document.getElementById("daoPda"),
  tokenAccount: document.getElementById("tokenAccount"),
  voteChoice: document.getElementById("voteChoice"),
  commitBtn: document.getElementById("commitBtn"),
  revealBtn: document.getElementById("revealBtn"),
  finalizeBtn: document.getElementById("finalizeBtn"),
  executeBtn: document.getElementById("executeBtn"),
};

import bs58 from "https://esm.sh/bs58@6.0.0";

const DISC = {
  dao: Uint8Array.from([163, 9, 47, 31, 52, 85, 197, 49]),
  proposal: Uint8Array.from([26, 94, 189, 187, 116, 136, 53, 33]),
  voterRecord: Uint8Array.from([178, 96, 138, 116, 143, 202, 115, 33]),
};

const PROGRAM_INS = {
  createProposal: Uint8Array.from([132, 116, 68, 174, 216, 160, 198, 22]),
  commitVote: Uint8Array.from([134, 97, 90, 126, 91, 66, 16, 26]),
  revealVote: Uint8Array.from([100, 157, 139, 17, 186, 75, 185, 149]),
  finalizeProposal: Uint8Array.from([23, 68, 51, 167, 109, 173, 187, 164]),
  executeProposal: Uint8Array.from([186, 60, 116, 133, 108, 128, 111, 28]),
};

let config;
let conn;
let programId;
let wallet;

function setStatus(msg) {
  statusEl.textContent = `${new Date().toLocaleTimeString()} | ${msg}\n` + statusEl.textContent;
}

async function init() {
  config = await fetch("./config.json", { cache: "no-store" }).then(r => r.json());
  const rpc = config.rpcUrl || clusterApiUrl("devnet");
  conn = new Connection(rpc, "confirmed");
  programId = new PublicKey(config.programId);

  ui.clusterPill.textContent = `cluster: ${config.cluster}`;
  ui.programPill.textContent = `program: ${programId.toBase58()}`;
  ui.networkLabel.textContent = `Network: ${config.cluster} (${rpc})`;

  const deployed = await isProgramDeployed(programId);
  if (deployed) {
    ui.deployPill.textContent = "status: deployed";
    ui.deployPill.classList.add("ok");
  } else {
    ui.deployPill.textContent = "status: not deployed";
    ui.deployPill.classList.add("bad");
    setStatus("Program is not deployed on this cluster. Deploy first using the Devnet Deploy workflow, then refresh.");
  }

  if (!window.solana?.isPhantom) {
    ui.connectBtn.disabled = true;
    setStatus("Phantom not detected. Install Phantom wallet browser extension.");
  }

  bindActions();
  await refreshDaos();
}

function bindActions() {
  ui.connectBtn.onclick = connectWallet;
  ui.refreshDaos.onclick = refreshDaos;
  ui.refreshProposals.onclick = refreshProposals;
  ui.createProposalBtn.onclick = createProposal;
  ui.commitBtn.onclick = commitVote;
  ui.revealBtn.onclick = revealVote;
  ui.finalizeBtn.onclick = finalizeProposal;
  ui.executeBtn.onclick = executeProposal;
}

async function connectWallet() {
  try {
    const res = await window.solana.connect();
    wallet = res.publicKey;
    ui.walletLabel.textContent = wallet.toBase58();
    setStatus(`Wallet connected: ${wallet.toBase58()}`);
  } catch (e) {
    setStatus(`Connect failed: ${e.message}`);
  }
}

async function isProgramDeployed(pk) {
  const ai = await conn.getAccountInfo(pk);
  return !!ai?.executable;
}

function borshString(buf, offset) {
  const len = Number(readU32(buf, offset));
  const start = offset + 4;
  const end = start + len;
  return [new TextDecoder().decode(buf.slice(start, end)), end];
}
function readU32(buf, o) { return (buf[o] | (buf[o+1]<<8) | (buf[o+2]<<16) | (buf[o+3]<<24)) >>> 0; }
function readU64(buf, o) { return Number(new DataView(buf.buffer, buf.byteOffset + o, 8).getBigUint64(0, true)); }
function readI64(buf, o) { return Number(new DataView(buf.buffer, buf.byteOffset + o, 8).getBigInt64(0, true)); }
function readPubkey(buf, o) { return new PublicKey(buf.slice(o, o + 32)); }

function decodeDao(data) {
  let o = 8;
  const authority = readPubkey(data, o); o += 32;
  const [daoName, o2] = borshString(data, o); o = o2;
  const governanceToken = readPubkey(data, o); o += 32;
  const quorum = data[o]; o += 1;
  const tokenRequired = readU64(data, o); o += 8;
  const revealWindow = readI64(data, o); o += 8;
  const executionDelay = readI64(data, o); o += 8;
  const votingConfigTag = data[o]; o += 1;
  let votingConfig = votingConfigTag === 0 ? "TokenWeighted" : votingConfigTag === 1 ? "Quadratic" : "DualChamber";
  if (votingConfigTag === 2) o += 2;
  const proposalCount = readU64(data, o); o += 8;
  o += 1;
  const migratedTag = data[o]; o += 1;
  const migratedFrom = migratedTag ? readPubkey(data, o).toBase58() : null;
  return { authority: authority.toBase58(), daoName, governanceToken: governanceToken.toBase58(), quorum, tokenRequired, revealWindow, executionDelay, votingConfig, proposalCount, migratedFrom };
}

function decodeProposal(data) {
  let o = 8;
  const dao = readPubkey(data, o).toBase58(); o += 32;
  const proposer = readPubkey(data, o).toBase58(); o += 32;
  const proposalId = readU64(data, o); o += 8;
  const [title, t2] = borshString(data, o); o = t2;
  const [description, d2] = borshString(data, o); o = d2;
  const statusTag = data[o]; o += 1;
  const votingEnd = readI64(data, o); o += 8;
  const revealEnd = readI64(data, o); o += 8;
  const yesCapital = readU64(data, o); o += 8;
  const noCapital = readU64(data, o); o += 8;
  const yesCommunity = readU64(data, o); o += 8;
  const noCommunity = readU64(data, o); o += 8;
  const commitCount = readU64(data, o); o += 8;
  const revealCount = readU64(data, o); o += 8;
  const actionTag = data[o]; o += 1;
  let action = null;
  if (actionTag) {
    const actionType = data[o]; o += 1;
    const amount = readU64(data, o); o += 8;
    const recipient = readPubkey(data, o).toBase58(); o += 32;
    const mintTag = data[o]; o += 1;
    let tokenMint = null;
    if (mintTag) { tokenMint = readPubkey(data, o).toBase58(); o += 32; }
    action = { actionType, amount, recipient, tokenMint };
  }
  const executionUnlocksAt = readI64(data, o); o += 8;
  const isExecuted = !!data[o];
  const statuses = ["Voting", "Passed", "Failed", "Cancelled", "Vetoed"];
  return { dao, proposer, proposalId, title, description, status: statuses[statusTag] ?? `Unknown(${statusTag})`, votingEnd, revealEnd, yesCapital, noCapital, yesCommunity, noCommunity, commitCount, revealCount, action, executionUnlocksAt, isExecuted };
}

async function refreshDaos() {
  const accounts = await conn.getProgramAccounts(programId, {
    filters: [{ memcmp: { offset: 0, bytes: bs58.encode(DISC.dao) } }],
  });
  ui.daoList.innerHTML = "";
  if (!accounts.length) {
    ui.daoList.innerHTML = `<div class='item'>No DAO accounts found for this Program ID on ${config.cluster}.</div>`;
    return;
  }
  for (const a of accounts.slice(0, 50)) {
    const d = decodeDao(a.account.data);
    const node = document.createElement("div");
    node.className = "item";
    node.innerHTML = `<b>${escapeHtml(d.daoName)}</b><div class='mono'>${a.pubkey.toBase58()}</div><div>mode=${d.votingConfig} | quorum=${d.quorum}% | proposals=${d.proposalCount}</div><div class='mono'>mint=${d.governanceToken}</div>`;
    node.onclick = () => { ui.daoForProposal.value = a.pubkey.toBase58(); ui.createDao.value = a.pubkey.toBase58(); ui.daoPda.value = a.pubkey.toBase58(); };
    ui.daoList.appendChild(node);
  }
  setStatus(`Loaded ${accounts.length} DAO accounts.`);
}

async function refreshProposals() {
  let daoFilter = ui.daoForProposal.value.trim();
  const filters = [{ memcmp: { offset: 0, bytes: bs58.encode(DISC.proposal) } }];
  if (daoFilter) filters.push({ memcmp: { offset: 8, bytes: daoFilter } });

  const accounts = await conn.getProgramAccounts(programId, { filters });
  ui.proposalList.innerHTML = "";
  if (!accounts.length) {
    ui.proposalList.innerHTML = `<div class='item'>No proposals found.</div>`;
    return;
  }
  for (const a of accounts.slice(0, 100)) {
    const p = decodeProposal(a.account.data);
    const phase = phaseText(p);
    const node = document.createElement("div");
    node.className = "item";
    node.innerHTML = `<b>#${p.proposalId} ${escapeHtml(p.title)}</b>
      <div class='mono'>${a.pubkey.toBase58()}</div>
      <div>${p.status} | ${phase}</div>
      <div>commits=${p.commitCount} reveals=${p.revealCount} | yes=${p.yesCapital} no=${p.noCapital}</div>`;
    node.onclick = async () => {
      ui.proposalPda.value = a.pubkey.toBase58();
      ui.daoPda.value = p.dao;
      await prefillTokenAccount(p.dao);
    };
    ui.proposalList.appendChild(node);
  }
  setStatus(`Loaded ${accounts.length} proposal accounts.`);
}

function phaseText(p) {
  const now = Math.floor(Date.now() / 1000);
  if (p.status !== "Voting") return p.status;
  if (now < p.votingEnd) return `commit (${p.votingEnd - now}s left)`;
  if (now < p.revealEnd) return `reveal (${p.revealEnd - now}s left)`;
  if (p.executionUnlocksAt > now) return `timelock (${p.executionUnlocksAt - now}s left)`;
  return "ready for finalize/execute";
}

async function prefillTokenAccount(daoAddress) {
  if (!wallet || !daoAddress) return;
  try {
    const daoAcc = await conn.getAccountInfo(new PublicKey(daoAddress));
    if (!daoAcc) return;
    const dao = decodeDao(daoAcc.data);
    const parsed = await conn.getParsedTokenAccountsByOwner(wallet, { mint: new PublicKey(dao.governanceToken) });
    if (parsed.value.length) {
      ui.tokenAccount.value = parsed.value[0].pubkey.toBase58();
      setStatus(`Detected token account ${ui.tokenAccount.value} for governance mint.`);
    }
  } catch (e) {
    setStatus(`Token account auto-detect failed: ${e.message}`);
  }
}

function assertWallet() {
  if (!wallet) throw new Error("Connect Phantom first.");
}

async function sendInstruction(ix) {
  const tx = new Transaction().add(ix);
  tx.feePayer = wallet;
  const { blockhash } = await conn.getLatestBlockhash("confirmed");
  tx.recentBlockhash = blockhash;
  const signed = await window.solana.signTransaction(tx);
  const sig = await conn.sendRawTransaction(signed.serialize());
  await conn.confirmTransaction(sig, "confirmed");
  const link = `https://explorer.solana.com/tx/${sig}?cluster=devnet`;
  setStatus(`TX confirmed: ${sig}\n${link}`);
  return sig;
}

function writeString(s) {
  const b = new TextEncoder().encode(s);
  const len = new Uint8Array(4);
  new DataView(len.buffer).setUint32(0, b.length, true);
  return concat(len, b);
}
function writeI64(n) {
  const b = new Uint8Array(8);
  new DataView(b.buffer).setBigInt64(0, BigInt(n), true);
  return b;
}
function writeU64(n) {
  const b = new Uint8Array(8);
  new DataView(b.buffer).setBigUint64(0, BigInt(n), true);
  return b;
}
function concat(...arrs) {
  const l = arrs.reduce((a, b) => a + b.length, 0);
  const out = new Uint8Array(l);
  let o = 0;
  for (const a of arrs) { out.set(a, o); o += a.length; }
  return out;
}
function toBase58(bytes) { return new PublicKey(concat(bytes, new Uint8Array(24))).toBase58().slice(0, 11); }
function escapeHtml(s) { return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

async function createProposal() {
  try {
    assertWallet();
    const dao = new PublicKey(ui.createDao.value.trim());
    const daoAccount = await conn.getAccountInfo(dao);
    if (!daoAccount) throw new Error("DAO account not found.");
    const daoData = decodeDao(daoAccount.data);

    if (daoData.authority !== wallet.toBase58()) {
      throw new Error("Connected wallet is not DAO authority. create_proposal requires DAO authority signer.");
    }

    const proposalId = daoData.proposalCount;
    const [proposalPda] = PublicKey.findProgramAddressSync([
      new TextEncoder().encode("proposal"),
      dao.toBuffer(),
      writeU64(proposalId),
    ], programId);

    const title = ui.createTitle.value.trim();
    const desc = ui.createDescription.value.trim();
    const duration = Number(ui.createDuration.value || 3600);

    const data = concat(
      PROGRAM_INS.createProposal,
      writeString(title),
      writeString(desc),
      writeI64(duration),
      new Uint8Array([0])
    );

    const ix = new TransactionInstruction({
      programId,
      keys: [
        { pubkey: dao, isSigner: false, isWritable: true },
        { pubkey: proposalPda, isSigner: false, isWritable: true },
        { pubkey: wallet, isSigner: true, isWritable: false },
        { pubkey: wallet, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data,
    });

    await sendInstruction(ix);
    ui.proposalPda.value = proposalPda.toBase58();
    ui.daoPda.value = dao.toBase58();
    setStatus(`Created proposal PDA: ${proposalPda.toBase58()}`);
    await refreshProposals();
  } catch (e) {
    setStatus(`create_proposal failed: ${e.message}`);
  }
}

function saltKey(proposal, voter) { return `privatedao:salt:${proposal}:${voter}`; }

async function commitVote() {
  try {
    assertWallet();
    const proposal = new PublicKey(ui.proposalPda.value.trim());
    const dao = new PublicKey(ui.daoPda.value.trim());
    const voterTokenAccount = new PublicKey(ui.tokenAccount.value.trim());
    const [voterRecord] = PublicKey.findProgramAddressSync([
      new TextEncoder().encode("vote"),
      proposal.toBuffer(),
      wallet.toBuffer(),
    ], programId);

    const vote = ui.voteChoice.value === "yes";
    const salt = crypto.getRandomValues(new Uint8Array(32));
    const preimage = concat(new Uint8Array([vote ? 1 : 0]), salt, wallet.toBuffer());
    const commitment = await sha256Async(preimage);

    const data = concat(PROGRAM_INS.commitVote, commitment, new Uint8Array([0]));
    const ix = new TransactionInstruction({
      programId,
      keys: [
        { pubkey: dao, isSigner: false, isWritable: false },
        { pubkey: proposal, isSigner: false, isWritable: true },
        { pubkey: voterRecord, isSigner: false, isWritable: true },
        { pubkey: voterTokenAccount, isSigner: false, isWritable: false },
        { pubkey: wallet, isSigner: true, isWritable: true },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data,
    });
    await sendInstruction(ix);
    localStorage.setItem(saltKey(proposal.toBase58(), wallet.toBase58()), JSON.stringify({ vote, salt: Array.from(salt) }));
    setStatus("Commit stored. Salt saved in browser localStorage for reveal.");
    await refreshProposals();
  } catch (e) {
    setStatus(`commit_vote failed: ${e.message}`);
  }
}

async function revealVote() {
  try {
    assertWallet();
    const proposal = new PublicKey(ui.proposalPda.value.trim());
    const [voterRecord] = PublicKey.findProgramAddressSync([
      new TextEncoder().encode("vote"),
      proposal.toBuffer(),
      wallet.toBuffer(),
    ], programId);
    const savedRaw = localStorage.getItem(saltKey(proposal.toBase58(), wallet.toBase58()));
    if (!savedRaw) throw new Error("No saved commit salt found for this proposal+wallet in browser storage.");
    const saved = JSON.parse(savedRaw);
    const data = concat(PROGRAM_INS.revealVote, new Uint8Array([saved.vote ? 1 : 0]), Uint8Array.from(saved.salt));
    const ix = new TransactionInstruction({
      programId,
      keys: [
        { pubkey: proposal, isSigner: false, isWritable: true },
        { pubkey: voterRecord, isSigner: false, isWritable: true },
        { pubkey: wallet, isSigner: true, isWritable: true },
      ],
      data,
    });
    await sendInstruction(ix);
    await refreshProposals();
  } catch (e) {
    setStatus(`reveal_vote failed: ${e.message}`);
  }
}

async function finalizeProposal() {
  try {
    assertWallet();
    const proposal = new PublicKey(ui.proposalPda.value.trim());
    const dao = new PublicKey(ui.daoPda.value.trim());
    const data = PROGRAM_INS.finalizeProposal;
    const ix = new TransactionInstruction({
      programId,
      keys: [
        { pubkey: dao, isSigner: false, isWritable: false },
        { pubkey: proposal, isSigner: false, isWritable: true },
        { pubkey: wallet, isSigner: true, isWritable: false },
      ],
      data,
    });
    await sendInstruction(ix);
    await refreshProposals();
  } catch (e) {
    setStatus(`finalize_proposal failed: ${e.message}`);
  }
}

async function executeProposal() {
  try {
    assertWallet();
    const proposal = new PublicKey(ui.proposalPda.value.trim());
    const dao = new PublicKey(ui.daoPda.value.trim());
    const pAcc = await conn.getAccountInfo(proposal);
    if (!pAcc) throw new Error("Proposal not found.");
    const p = decodeProposal(pAcc.data);
    const treasuryRecipient = p.action ? new PublicKey(p.action.recipient) : wallet;

    const [treasury] = PublicKey.findProgramAddressSync([
      new TextEncoder().encode("treasury"),
      dao.toBuffer(),
    ], programId);

    const data = PROGRAM_INS.executeProposal;
    const ix = new TransactionInstruction({
      programId,
      keys: [
        { pubkey: dao, isSigner: false, isWritable: false },
        { pubkey: proposal, isSigner: false, isWritable: true },
        { pubkey: treasury, isSigner: false, isWritable: true },
        { pubkey: treasuryRecipient, isSigner: false, isWritable: true },
        { pubkey: treasury, isSigner: false, isWritable: true },
        { pubkey: treasuryRecipient, isSigner: false, isWritable: true },
        { pubkey: wallet, isSigner: true, isWritable: false },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data,
    });
    await sendInstruction(ix);
    await refreshProposals();
  } catch (e) {
    setStatus(`execute_proposal failed: ${e.message}`);
  }
}

init().catch((e) => {
  setStatus(`Initialization error: ${e.message}`);
});
