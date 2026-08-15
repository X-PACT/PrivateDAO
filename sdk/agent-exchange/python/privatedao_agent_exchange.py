import json
from urllib.request import Request, urlopen

class PrivateDAOAgentExchange:
    def __init__(self, base_url="https://agents.privatedao.org"):
        self.base_url = base_url.rstrip("/")

    def request(self, path, payload=None):
        body = None if payload is None else json.dumps(payload).encode()
        request = Request(self.base_url + path, data=body, headers={"content-type": "application/json"}, method="POST" if body else "GET")
        with urlopen(request, timeout=20) as response:
            return json.loads(response.read())

    def services(self):
        return self.request("/api/services")

    def quote(self, service_id, currency="USDC"):
        return self.request("/api/payments/quote", {"service_id": service_id, "currency": currency})

    def verify_basic(self, record):
        return self.request("/api/tasks", {"service_id": "verify.basic", "input": {"record": record}})
