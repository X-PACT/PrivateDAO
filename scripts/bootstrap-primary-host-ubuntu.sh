#!/usr/bin/env bash
set -euo pipefail

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run this script with sudo on the Ubuntu host." >&2
  exit 1
fi

TARGET_USER="${SUDO_USER:-${TARGET_USER:-ubuntu}}"
INSTALL_DIR="${INSTALL_DIR:-/opt/privatedao}"
NODE_MAJOR="${NODE_MAJOR:-20}"

apt-get update
apt-get install -y ca-certificates curl git gnupg

install -m 0755 -d /etc/apt/keyrings
if [[ ! -f /etc/apt/keyrings/docker.asc ]]; then
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
  chmod a+r /etc/apt/keyrings/docker.asc
fi

UBUNTU_CODENAME="$(. /etc/os-release && echo "$VERSION_CODENAME")"
cat >/etc/apt/sources.list.d/docker.list <<EOF
deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu ${UBUNTU_CODENAME} stable
EOF

curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | bash -

apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin nodejs

systemctl enable docker
systemctl start docker

id -u "$TARGET_USER" >/dev/null 2>&1 || {
  echo "Target user '$TARGET_USER' does not exist." >&2
  exit 1
}

usermod -aG docker "$TARGET_USER"
mkdir -p "$INSTALL_DIR"
chown -R "$TARGET_USER:$TARGET_USER" "$INSTALL_DIR"

echo "Primary host bootstrap complete."
echo "  Target user:  $TARGET_USER"
echo "  Install dir:  $INSTALL_DIR"
echo "  Next: log in as $TARGET_USER, clone/update the repo there, then run deploy/primary-host setup."
