import json
from datetime import datetime, timezone
from urllib.error import HTTPError
from urllib.parse import quote, urlencode
from urllib.request import Request, urlopen

class PrivateDAOAgentExchange:
    def __init__(self, base_url="https://agents.privatedao.org"):
        self.base_url = base_url.rstrip("/")

    def request(self, path, payload=None):
        body = None if payload is None else json.dumps(payload).encode()
        request = Request(self.base_url + path, data=body, headers={"content-type": "application/json"}, method="POST" if body else "GET")
        try:
            with urlopen(request, timeout=20) as response:
                return json.loads(response.read())
        except HTTPError as error:
            data = json.loads(error.read())
            data["http_status"] = error.code
            if error.code == 402:
                return data
            raise

    def discover(self):
        return self.request("/.well-known/agent-card.json")

    def services(self):
        return self.request("/api/services")

    def pricing(self):
        return self.request("/api/pricing")

    def create_job(self, service_id, input_data=None):
        return self.request("/api/jobs", {"service_id": service_id, "input": input_data or {}})

    def job_status(self, job_id):
        return self.request("/api/jobs/" + quote(job_id))

    def submit_payment(self, job_id, signature):
        return self.request("/api/jobs/" + quote(job_id) + "/payment", {"signature": signature})

    def payment_intent(self, job_id):
        return self.request("/api/jobs/" + quote(job_id) + "/payment-intent")

    def payment_page(self, job_id):
        return self.base_url + "/pay/" + quote(job_id)

    def await_job(self, job_id, timeout_seconds=120, interval_seconds=3):
        import time
        deadline = time.time() + timeout_seconds
        while time.time() < deadline:
            job = self.job_status(job_id)
            if job.get("status") in ("completed", "failed"):
                return job
            time.sleep(interval_seconds)
        raise TimeoutError("job polling timed out")

    def receipt(self, receipt_id):
        return self.request("/api/receipts/" + quote(receipt_id))

    def register_agent(self, agent):
        return self.request("/api/registry/register", agent)

    def search_agents(self, query=""):
        suffix = "?" + urlencode({"q": query}) if query else ""
        return self.request("/api/registry/search" + suffix)

    def marketplace_listings(self, query=None):
        suffix = "?" + urlencode(query or {}) if query else ""
        return self.request("/api/marketplace/listings" + suffix)

    def request_logistics(self, request_data):
        return self.request("/api/logistics/request", request_data)

    def logistics(self, request_data):
        return self.request_logistics(request_data)

    def agent_match(self, requirements):
        return self.create_job("agent.match", requirements)

    def discovery(self):
        return self.request("/api/discovery")

    def network_stats(self):
        return self.request("/api/network/stats")

    def verify_basic(self, record):
        return self.create_job("verify.basic", {"record": record})

    @staticmethod
    def local_expiry(payment_intent):
        value = payment_intent.get("expiresAtEpochMs")
        if value:
            return datetime.fromtimestamp(value / 1000, tz=timezone.utc).astimezone()
        iso = payment_intent.get("expiresAtUtc") or payment_intent["expiresAt"]
        return datetime.fromisoformat(iso.replace("Z", "+00:00")).astimezone()
