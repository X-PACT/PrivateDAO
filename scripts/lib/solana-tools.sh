#!/usr/bin/env bash
# Copyright (c) 2026 X-PACT. MIT License.
# shellcheck shell=bash

append_path_once() {
  local dir="$1"
  if [[ -d "$dir" && ":$PATH:" != *":$dir:"* ]]; then
    PATH="$dir:$PATH"
  fi
}

append_path_once "$HOME/.local/share/solana/install/active_release/bin"
append_path_once "$HOME/.local/share/solana/install/releases/stable/bin"
append_path_once "$HOME/.local/share/solana/releases/stable/bin"
append_path_once "$HOME/.local/bin"
append_path_once "/usr/local/lib/solana/active_release/bin"
append_path_once "$HOME/.cargo/bin"
export PATH

resolve_tool() {
  local tool="$1"
  shift || true
  if command -v "$tool" >/dev/null 2>&1; then
    command -v "$tool"
    return 0
  fi

  local candidate
  for candidate in "$@"; do
    if [[ -x "$candidate" ]]; then
      printf '%s\n' "$candidate"
      return 0
    fi
  done
  return 1
}

resolve_tool_prefer_candidates() {
  local tool="$1"
  shift || true

  local candidate
  for candidate in "$@"; do
    if [[ -x "$candidate" ]]; then
      printf '%s\n' "$candidate"
      return 0
    fi
  done

  if command -v "$tool" >/dev/null 2>&1; then
    command -v "$tool"
    return 0
  fi

  return 1
}

is_supported_yarn() {
  local yarn_bin="$1"
  local version

  [[ -x "$yarn_bin" ]] || return 1
  if ! version="$("$yarn_bin" --version 2>/dev/null)"; then
    return 1
  fi

  # Debian's cmdtest package ships a non-Yarn binary named "yarn" (0.32+git).
  if [[ "$version" == "0.32+git" ]]; then
    return 1
  fi

  [[ "$version" =~ ^v?[0-9]+(\.[0-9]+){1,2}([-.].*)?$ ]] || return 1
  return 0
}

SOLANA_BIN="${SOLANA_BIN:-$(resolve_tool solana \
  "$HOME/.local/share/solana/install/active_release/bin/solana" \
  "$HOME/.local/share/solana/install/releases/stable/bin/solana" \
  "$HOME/.local/share/solana/releases/stable/bin/solana" \
  "/usr/local/lib/solana/active_release/bin/solana" \
  "/usr/local/bin/solana" 2>/dev/null || true)}"

SOLANA_KEYGEN_BIN="${SOLANA_KEYGEN_BIN:-$(resolve_tool solana-keygen \
  "$HOME/.local/share/solana/install/active_release/bin/solana-keygen" \
  "$HOME/.local/share/solana/install/releases/stable/bin/solana-keygen" \
  "$HOME/.local/share/solana/releases/stable/bin/solana-keygen" \
  "/usr/local/lib/solana/active_release/bin/solana-keygen" \
  "/usr/local/bin/solana-keygen" 2>/dev/null || true)}"

ANCHOR_BIN="${ANCHOR_BIN:-$(resolve_tool_prefer_candidates anchor \
  "$HOME/.local/bin/anchor" \
  "$HOME/.avm/bin/anchor" \
  "$HOME/.cargo/bin/anchor" \
  "/usr/local/bin/anchor" 2>/dev/null || true)}"

CARGO_BIN="${CARGO_BIN:-$(resolve_tool cargo \
  "$HOME/.cargo/bin/cargo" \
  "/usr/bin/cargo" \
  "/usr/local/bin/cargo" 2>/dev/null || true)}"

NODE_BIN="${NODE_BIN:-$(resolve_tool node \
  "/usr/bin/node" \
  "/usr/local/bin/node" 2>/dev/null || true)}"

YARN_BIN="${YARN_BIN:-$(resolve_tool yarn \
  "$HOME/.yarn/bin/yarn" \
  "/usr/bin/yarn" \
  "/usr/local/bin/yarn" 2>/dev/null || true)}"

if [[ -n "${YARN_BIN:-}" ]] && ! is_supported_yarn "$YARN_BIN"; then
  YARN_BIN=""
fi

DEVNET_POW_BIN="${DEVNET_POW_BIN:-$(resolve_tool devnet-pow \
  "$HOME/.cargo/bin/devnet-pow" \
  "/usr/local/bin/devnet-pow" 2>/dev/null || true)}"

ensure_required_tools() {
  local missing=()
  local spec var label

  for spec in "$@"; do
    var="${spec%%:*}"
    label="${spec##*:}"
    if [[ -z "${!var:-}" ]]; then
      missing+=("$label")
    fi
  done

  if (( ${#missing[@]} > 0 )); then
    echo "Missing required tool(s): ${missing[*]}" >&2
    echo "Ensure Solana/Anchor/Node binaries are installed and available in PATH." >&2
    return 1
  fi
  return 0
}
