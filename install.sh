#!/usr/bin/env sh
set -eu

PACKAGE="@codex-infinity/pi-infinity"

if command -v npm >/dev/null 2>&1; then
	 exec npm install --global "$PACKAGE@latest"
fi

if command -v bun >/dev/null 2>&1; then
	 exec bun add --global "$PACKAGE@latest"
fi

echo "Install npm or bun before running this installer." >&2
exit 1
