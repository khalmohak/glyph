#!/usr/bin/env bash
# Runs the docs e2e suite inside the official Playwright Linux image, so visual baselines
# match CI pixel for pixel. It runs as linux/amd64 like GitHub's runners: on Apple Silicon an
# arm64 container antialiases text slightly differently, enough to fail a few screenshots. The repo is copied into the container (host node_modules hold
# macOS binaries), installed and built there; only screenshots and the report come back.
#
#   e2e/docker.sh                  run every project, visual included
#   e2e/docker.sh --update         regenerate visual baselines
#   e2e/docker.sh -- <args>        pass extra arguments to `playwright test`
set -euo pipefail

DOCS="$(cd "$(dirname "$0")/.." && pwd)"
ROOT="$(cd "$DOCS/../.." && pwd)"
VERSION="$(node -p "require('$DOCS/node_modules/@playwright/test/package.json').version")"
PNPM="$(node -p "require('$ROOT/package.json').packageManager.split('@')[1]")"
IMAGE="mcr.microsoft.com/playwright:v${VERSION}-noble"

ARGS=()
if [[ "${1:-}" == "--update" ]]; then
  ARGS=(--project=visual --update-snapshots)
  shift
fi
[[ "${1:-}" == "--" ]] && shift
ARGS+=("$@")

mkdir -p "$DOCS/e2e/__screenshots__" "$DOCS/e2e/.report"

docker run --rm --ipc=host --platform linux/amd64 \
  -v "$ROOT":/repo:ro \
  -v "$DOCS/e2e/__screenshots__":/out/screenshots \
  -v "$DOCS/e2e/.report":/out/report \
  -v glyph-pnpm-store:/pnpm-store \
  -e CI=1 \
  -w /work \
  "$IMAGE" bash -euo pipefail -c "
    tar -C /repo --exclude=node_modules --exclude=dist --exclude=.turbo --exclude=.git \
      --exclude='apps/docs/e2e/.results' --exclude='apps/docs/e2e/.report' -cf - . | tar -xf -
    npm install -g pnpm@${PNPM} --silent
    pnpm config set store-dir /pnpm-store >/dev/null
    pnpm install --frozen-lockfile --reporter=silent
    pnpm turbo run build --filter=docs >/dev/null
    status=0
    pnpm -C apps/docs exec playwright test ${ARGS[*]:-} || status=\$?
    cp -R apps/docs/e2e/__screenshots__/. /out/screenshots/ 2>/dev/null || true
    cp -R apps/docs/e2e/.report/. /out/report/ 2>/dev/null || true
    exit \$status
  "
