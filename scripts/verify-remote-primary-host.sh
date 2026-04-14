#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-https://privatedao.org}"

fetch_json() {
  local path="$1"
  curl -fsS "${BASE_URL}${path}"
}

fetch_headers() {
  local path="$1"
  curl -fsSI "${BASE_URL}${path}"
}

root_headers="$(fetch_headers /)"
health_json="$(fetch_json /healthz)"
config_json="$(fetch_json /api/v1/config)"
metrics_json="$(fetch_json /api/v1/metrics)"
snapshot_json="$(fetch_json /api/v1/ops/snapshot)"

python3 - <<'PY' "$root_headers" "$health_json" "$config_json" "$metrics_json" "$snapshot_json"
import json, sys

headers, health_json, config_json, metrics_json, snapshot_json = sys.argv[1:]
health = json.loads(health_json)
config = json.loads(config_json)
metrics = json.loads(metrics_json)
snapshot = json.loads(snapshot_json)

assert health["ok"] is True and health["health"] == "healthy", "remote /healthz failed"
assert config["ok"] is True and config["config"]["readPath"] == "backend-indexer", "remote /api/v1/config is not backend-indexer"
assert metrics["ok"] is True and "requestsTotal" in metrics["metrics"], "remote /api/v1/metrics missing requestsTotal"
assert snapshot["ok"] is True and snapshot["snapshot"]["deployment"]["readApiPath"] == "/api/v1", "remote /api/v1/ops/snapshot readApiPath mismatch"
print("Remote primary host verification: PASS")
PY

echo "Root headers:"
printf '%s\n' "$root_headers"
