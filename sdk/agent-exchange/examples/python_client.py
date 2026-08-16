import json
import os

from privatedao_agent_exchange import PrivateDAOAgentExchange

client = PrivateDAOAgentExchange(os.getenv("PDAO_AGENT_EXCHANGE_URL", "https://agents.privatedao.org"))
card = client.discover()
services = client.services()
verification = client.verify_basic({"source": "external-agent"})

print(json.dumps({
    "agent": card["name"],
    "service_count": len(services["services"]),
    "verification_status": verification.get("result", {}).get("verification_status"),
    "receipt_id": verification.get("receipt", {}).get("receipt_id"),
}, indent=2))
