#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REGION="${AWS_REGION:-eu-north-1}"
STACK="${AGENT_EXCHANGE_STACK:-PrivateDAOAgentExchange}"
BUCKET="${AGENT_EXCHANGE_ARTIFACT_BUCKET:-privatedao-agent-exchange-deploy-535182441609-eun1}"
cd "$ROOT"
npm --prefix services/agent-exchange test
aws cloudformation package --region "$REGION" --template-file infra/agent-exchange/template.yaml --s3-bucket "$BUCKET" --output-template-file /tmp/privatedao-agent-exchange-packaged.yaml
aws cloudformation deploy --region "$REGION" --template-file /tmp/privatedao-agent-exchange-packaged.yaml --stack-name "$STACK" --capabilities CAPABILITY_IAM --no-fail-on-empty-changeset
aws cloudformation describe-stacks --region "$REGION" --stack-name "$STACK" --query 'Stacks[0].Outputs' --output table
