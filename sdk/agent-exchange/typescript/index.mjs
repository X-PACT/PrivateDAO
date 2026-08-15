export class PrivateDAOAgentExchange {
  constructor(baseUrl = "https://agents.privatedao.org") { this.baseUrl = baseUrl.replace(/\/$/, ""); }
  async request(path, init = {}) { const response = await fetch(`${this.baseUrl}${path}`, { ...init, headers: { "content-type": "application/json", ...(init.headers || {}) } }); const data = await response.json(); if (!response.ok) { const error = new Error(data.message || data.error || `HTTP ${response.status}`); error.status = response.status; error.data = data; throw error; } return data; }
  services() { return this.request("/api/services"); }
  quote(service_id, currency = "USDC") { return this.request("/api/payments/quote", { method: "POST", body: JSON.stringify({ service_id, currency }) }); }
  task(service_id, input, payment) { return this.request("/api/tasks", { method: "POST", body: JSON.stringify({ service_id, input, ...(payment || {}) }) }); }
  verifyBasic(record) { return this.task("verify.basic", { record }); }
}
