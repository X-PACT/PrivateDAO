FROM ubuntu:24.04

SHELL ["/bin/bash", "-o", "pipefail", "-c"]

ARG NODE_MAJOR=20
ARG ANCHOR_VERSION=0.31.1
ARG SOLANA_CHANNEL=stable
ARG YARN_VERSION=1.22.22

ENV DEBIAN_FRONTEND=noninteractive
ENV CARGO_HOME=/usr/local/cargo
ENV RUSTUP_HOME=/usr/local/rustup
ENV SOLANA_HOME=/root/.local/share/solana
ENV PATH=${SOLANA_HOME}/install/active_release/bin:/root/.avm/bin:${CARGO_HOME}/bin:${PATH}

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    bash \
    build-essential \
    ca-certificates \
    clang \
    cmake \
    curl \
    git \
    jq \
    libclang-dev \
    libssl-dev \
    libudev-dev \
    llvm \
    make \
    openssh-client \
    pkg-config \
    protobuf-compiler \
    python3 \
    unzip \
    xz-utils \
  && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | bash - \
  && apt-get update \
  && apt-get install -y --no-install-recommends nodejs \
  && npm install -g npm@10 \
  && corepack enable \
  && corepack prepare "yarn@${YARN_VERSION}" --activate \
  && rm -rf /var/lib/apt/lists/*

RUN curl -sSf https://sh.rustup.rs | sh -s -- -y --profile minimal --default-toolchain stable \
  && rustup component add rustfmt clippy

RUN sh -c "$(curl -sSfL https://release.anza.xyz/${SOLANA_CHANNEL}/install)"

RUN cargo install --git https://github.com/coral-xyz/anchor avm --locked --force \
  && avm install "${ANCHOR_VERSION}" \
  && avm use "${ANCHOR_VERSION}" \
  && anchor --version \
  && solana --version \
  && node --version \
  && rustc --version

WORKDIR /workspace

CMD ["bash"]
