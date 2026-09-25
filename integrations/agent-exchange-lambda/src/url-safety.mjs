import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import https from "node:https";

function privateIpv4(address) {
  const parts = address.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return false;
  const [a, b] = parts;
  return a === 0 || a === 10 || a === 127 || (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) || (a === 198 && (b === 18 || b === 19)) || a >= 224;
}

function privateIp(address) {
  if (isIP(address) === 4) return privateIpv4(address);
  const normalized = address.toLowerCase();
  if (normalized.startsWith("::ffff:")) return privateIpv4(normalized.slice(7));
  return normalized === "::" || normalized === "::1" || normalized.startsWith("fc") || normalized.startsWith("fd") ||
    normalized.startsWith("fe8") || normalized.startsWith("fe9") || normalized.startsWith("fea") || normalized.startsWith("feb") ||
    normalized.startsWith("::ffff:10.") || normalized.startsWith("::ffff:192.168.") || normalized.startsWith("::ffff:172.16.");
}

export async function assertPublicHttps(urlText) {
  let url;
  try { url = new URL(urlText); }
  catch { throw Object.assign(new Error("valid public HTTPS MCP endpoint required"), { statusCode: 400 }); }
  if (url.protocol !== "https:" || url.username || url.password)
    throw Object.assign(new Error("external MCP endpoint must be public HTTPS without embedded credentials"), { statusCode: 400 });
  const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") || privateIp(host))
    throw Object.assign(new Error("private or loopback MCP endpoint is not allowed"), { statusCode: 400 });
  if (!isIP(host)) {
    let addresses;
    try { addresses = await lookup(host, { all: true, verbatim: true }); }
    catch { throw Object.assign(new Error("MCP endpoint hostname could not be resolved"), { statusCode: 400 }); }
    if (!addresses.length || addresses.some(({ address }) => privateIp(address)))
      throw Object.assign(new Error("private or loopback MCP endpoint is not allowed"), { statusCode: 400 });
  }
  return url;
}

// Resolve once and use that exact public address for the TLS connection. A
// second resolver lookup by fetch would leave a DNS-rebinding window between
// validation and the request to an external seller endpoint.
export async function fetchPublicHttps(url, options = {}) {
  url = url instanceof URL ? url : new URL(url);
  // Tests use deterministic local MCP fixtures. Keep this bypass explicit so
  // NODE_ENV alone can never disable DNS-rebinding protection.
  if (process.env.AGENT_EXCHANGE_MCP_FETCH_FIXTURE === "true")
    return fetch(url, options);
  const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  const addresses = isIP(host)
    ? [{ address: host, family: isIP(host) }]
    : await lookup(host, { all: true, verbatim: true });
  if (!addresses.length || addresses.some(({ address }) => privateIp(address)))
    throw Object.assign(new Error("private or loopback MCP endpoint is not allowed"), { statusCode: 400 });
  const address = addresses[0];
  const headers = options.headers || {};
  const requestOptions = {
    method: options.method || "GET",
    hostname: host,
    port: url.port || 443,
    path: `${url.pathname || "/"}${url.search || ""}`,
    headers,
    servername: isIP(host) ? undefined : host,
    lookup: (_hostname, lookupOptions, callback) => {
      if (lookupOptions?.all) return callback(null, addresses.map(({ address: value, family }) => ({ address: value, family })));
      return callback(null, address.address, address.family);
    },
    signal: options.signal,
  };
  return new Promise((resolve, reject) => {
    const request = https.request(requestOptions, (response) => {
      const chunks = [];
      response.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
      response.on("end", () => resolve(new Response(Buffer.concat(chunks), {
        status: response.statusCode || 502,
        statusText: response.statusMessage || "",
        headers: response.headers,
      })));
      response.on("error", reject);
    });
    request.on("error", reject);
    if (options.body !== undefined && options.body !== null) request.write(options.body);
    request.end();
  });
}
