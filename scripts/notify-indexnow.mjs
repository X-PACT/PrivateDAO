const endpoint = process.env.INDEXNOW_ENDPOINT || "https://api.indexnow.org/indexnow";
const host = process.env.INDEXNOW_HOST || "privatedao.org";
const key = process.env.INDEXNOW_KEY;
const keyLocation = process.env.INDEXNOW_KEY_LOCATION || `https://${host}/${key || "indexnow-key.txt"}`;
const urls = (process.env.INDEXNOW_URLS || "")
  .split(/\s+/)
  .map((value) => value.trim())
  .filter(Boolean);

if (!key) throw new Error("INDEXNOW_KEY is required; keep it in the deployment secret store, not Git.");
if (!urls.length) throw new Error("INDEXNOW_URLS must contain one or more canonical URLs.");
for (const url of urls) {
  const parsed = new URL(url);
  if (parsed.protocol !== "https:" || parsed.hostname !== host) {
    throw new Error(`IndexNow URL must be an HTTPS URL on ${host}: ${url}`);
  }
}

const response = await fetch(endpoint, {
  method: "POST",
  headers: { "content-type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host, key, keyLocation, urlList: urls }),
});

console.log(`IndexNow notification: HTTP ${response.status} for ${urls.length} URL(s)`);
if (!response.ok) process.exit(1);
