export class PrivateDAOAgentExchange {
  constructor(baseUrl = "https://agents.privatedao.org") { this.baseUrl = baseUrl.replace(/\/$/, ""); }
  async request(path, init = {}) { const response = await fetch(`${this.baseUrl}${path}`, { ...init, headers: { accept: "application/json", "content-type": "application/json", ...(init.headers || {}) } }); const text = await response.text(); const data = text ? JSON.parse(text) : {}; if (!response.ok) { const error = new Error(data.message || data.error || `HTTP ${response.status}`); error.status = response.status; error.data = data; throw error; } return data; }
  discover() { return this.request("/.well-known/agent-card.json"); }
  services() { return this.request("/api/services"); }
  pricing() { return this.request("/api/pricing"); }
  async createJob(service_id, input = {}) { try { return await this.request("/api/jobs", { method: "POST", body: JSON.stringify({ service_id, input }) }); } catch (error) { if (error.status === 402) return error.data; throw error; } }
  jobStatus(jobId) { return this.request(`/api/jobs/${encodeURIComponent(jobId)}`); }
  submitPayment(jobId, signature) { return this.request(`/api/jobs/${encodeURIComponent(jobId)}/payment`, { method: "POST", body: JSON.stringify({ signature }) }); }
  paymentIntent(jobId) { return this.request(`/api/jobs/${encodeURIComponent(jobId)}/payment-intent`); }
  paymentPage(jobId) { return `${this.baseUrl}/pay/${encodeURIComponent(jobId)}`; }
  async awaitJob(jobId, { timeoutMs = 120000, intervalMs = 3000 } = {}) { const end = Date.now() + timeoutMs; while (Date.now() < end) { const job = await this.jobStatus(jobId); if (["completed", "failed"].includes(job.status)) return job; await new Promise((resolve) => setTimeout(resolve, intervalMs)); } throw new Error("job polling timed out"); }
  agentMatch(requirements) { return this.createJob("agent.match", requirements); }
  discovery() { return this.request("/api/discovery"); }
  networkStats() { return this.request("/api/network/stats"); }
  logistics(request) { return this.requestLogistics(request); }
  receipt(receiptId) { return this.request(`/api/receipts/${encodeURIComponent(receiptId)}`); }
  registerAgent(agent) { return this.request("/api/registry/register", { method: "POST", body: JSON.stringify(agent) }); }
  searchAgents(q = "") { return this.request(`/api/registry/search${q ? `?q=${encodeURIComponent(q)}` : ""}`); }
  marketplaceListings(query = {}) { const params = new URLSearchParams(query); return this.request(`/api/marketplace/listings${params.size ? `?${params}` : ""}`); }
  requestLogistics(request) { return this.request("/api/logistics/request", { method: "POST", body: JSON.stringify(request) }); }
  verifyBasic(record) { return this.createJob("verify.basic", { record }); }
  task(service_id, input) { return this.createJob(service_id, input); }
  run(service_id, input = {}) { return this.createJob(service_id, input); }
  static localExpiry(paymentIntent) { return new Date(paymentIntent.expiresAtEpochMs || paymentIntent.expiresAtUtc || paymentIntent.expiresAt); }
}
