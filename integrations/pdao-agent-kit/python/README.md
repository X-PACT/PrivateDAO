# Python Agent Kit

```python
from pathlib import Path
import sys
sys.path.append(str(Path(__file__).parents[3] / "sdk" / "agent-exchange" / "python"))
from privatedao_agent_exchange import PrivateDAOAgentExchange

pdao = PrivateDAOAgentExchange()
print(pdao.verify_basic({"mint": "YOUR_SOLANA_MINT"}))
```
