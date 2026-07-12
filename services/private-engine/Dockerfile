FROM node:22-bookworm-slim

WORKDIR /workspace
COPY services/private-engine/package.json services/private-engine/package-lock.json* /workspace/services/private-engine/
RUN cd /workspace/services/private-engine && npm install --omit=dev

COPY zk /workspace/zk
COPY services/private-engine/src /workspace/services/private-engine/src
RUN mkdir -p /data/receipts

ENV NODE_ENV=production
ENV PRIVATEDAO_ARTIFACT_ROOT=/workspace
ENV PRIVATEDAO_DATA_DIR=/data
ENV PRIVATEDAO_LICENSE_FILE=/data/license.json
EXPOSE 8787
CMD ["node", "/workspace/services/private-engine/src/server.mjs"]
