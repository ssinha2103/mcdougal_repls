#!/usr/bin/env bash
set -euo pipefail

# Install Docker Engine + Docker Compose plugin and host prerequisites for this repo
# on Debian/Ubuntu GCP VMs.

if [[ "${EUID}" -eq 0 ]]; then
  SUDO=""
else
  if ! command -v sudo >/dev/null 2>&1; then
    echo "This script requires root privileges. Install sudo or run as root." >&2
    exit 1
  fi
  SUDO="sudo"
fi

have() { command -v "$1" >/dev/null 2>&1; }

if [[ ! -f /etc/os-release ]]; then
  echo "Unsupported OS: /etc/os-release not found." >&2
  exit 1
fi

# shellcheck disable=SC1091
source /etc/os-release

OS_ID="${ID:-}"
CODENAME="${VERSION_CODENAME:-}"
ARCH="$(dpkg --print-architecture)"

if [[ -z "$CODENAME" ]]; then
  if have lsb_release; then
    CODENAME="$(lsb_release -cs)"
  fi
fi

if [[ -z "$CODENAME" ]]; then
  echo "Unable to detect distribution codename." >&2
  exit 1
fi

case "$OS_ID" in
  debian)
    DOCKER_REPO_BASE="https://download.docker.com/linux/debian"
    ;;
  ubuntu)
    DOCKER_REPO_BASE="https://download.docker.com/linux/ubuntu"
    ;;
  *)
    echo "Unsupported distro: $OS_ID. This script supports Debian and Ubuntu." >&2
    exit 1
    ;;
esac

echo "==> Installing base packages"
export DEBIAN_FRONTEND=noninteractive
$SUDO apt-get update
$SUDO apt-get install -y \
  ca-certificates \
  curl \
  gnupg \
  lsb-release \
  locales \
  git \
  make \
  unzip \
  rsync \
  jq \
  ripgrep

if ! locale -a | grep -qi '^en_US\.utf8$'; then
  echo "==> Generating locale en_US.UTF-8"
  $SUDO sed -i 's/^# *en_US.UTF-8 UTF-8/en_US.UTF-8 UTF-8/' /etc/locale.gen
  $SUDO locale-gen en_US.UTF-8
fi
$SUDO update-locale LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 || true

echo "==> Removing conflicting Docker distro packages (if present)"
for pkg in docker.io docker-doc docker-compose podman-docker containerd runc; do
  $SUDO apt-get remove -y "$pkg" >/dev/null 2>&1 || true
done

echo "==> Configuring Docker apt repository for $OS_ID/$CODENAME"
$SUDO install -m 0755 -d /etc/apt/keyrings
$SUDO curl -fsSL "${DOCKER_REPO_BASE}/gpg" -o /etc/apt/keyrings/docker.asc
$SUDO chmod a+r /etc/apt/keyrings/docker.asc

echo "deb [arch=${ARCH} signed-by=/etc/apt/keyrings/docker.asc] ${DOCKER_REPO_BASE} ${CODENAME} stable" \
  | $SUDO tee /etc/apt/sources.list.d/docker.list >/dev/null

echo "==> Installing Docker Engine + plugins"
$SUDO apt-get update
$SUDO apt-get install -y \
  containerd.io \
  docker-ce \
  docker-ce-cli \
  docker-buildx-plugin \
  docker-compose-plugin

echo "==> Enabling Docker service"
$SUDO systemctl enable --now docker

TARGET_USER="${SUDO_USER:-${USER:-}}"
if [[ -n "$TARGET_USER" ]] && id -nG "$TARGET_USER" | grep -qvw docker; then
  echo "==> Adding user '$TARGET_USER' to docker group"
  $SUDO usermod -aG docker "$TARGET_USER"
  echo "NOTE: Re-login (or run 'newgrp docker') for group change to take effect."
fi

echo "==> Verifying installation"
docker --version
if docker compose version >/dev/null 2>&1; then
  docker compose version
else
  echo "docker compose command not found after install" >&2
  exit 1
fi

git --version
if have rg; then
  rg --version | head -n1
fi

echo
echo "Setup complete. Next steps:"
echo "  1) git clone <repo> && cd mcdougal_repls"
echo "  2) ./run.sh up-d"
