const mint = process.env.INPUT_MINT;
const endpoint = (process.env.INPUT_ENDPOINT || "https://agents.privatedao.org").replace(/\/$/, "");
if (!mint) throw new Error("mint input is required");
const response = await fetch(`${endpoint}/api/jobs`, {
  method: "POST",
  headers: { "content-type": "application/json", accept: "application/json" },
  body: JSON.stringify({ service_id: "verify.basic", input: { mint } }),
});
const data = await response.json();
if (!response.ok) throw new Error(data.message || `PrivateDAO returned HTTP ${response.status}`);
const result = data.result || data;
console.log(JSON.stringify({ mint, valid: result.valid, cluster: result.cluster, receipt_id: data.receipt?.receipt_id || null }, null, 2));
if (result.valid === false) process.exitCode = 1;
