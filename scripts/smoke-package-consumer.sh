#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
WORKDIR=$(mktemp -d)
trap 'rm -rf "$WORKDIR"' EXIT

REACT_VERSION=$(node -p "require('${REPO_ROOT}/node_modules/react/package.json').version")
REACT_DOM_VERSION=$(node -p "require('${REPO_ROOT}/node_modules/react-dom/package.json').version")

mkdir -p "$WORKDIR/package" "$WORKDIR/consumer"
pnpm pack --pack-destination "$WORKDIR/package" >/dev/null
TARBALL=$(find "$WORKDIR/package" -maxdepth 1 -name '*.tgz' -print -quit)

if [[ -z "$TARBALL" ]]; then
  echo "pnpm pack did not produce a tarball." >&2
  exit 1
fi

if tar -tzf "$TARBALL" | grep -Eq '\.(woff2?|ttf|otf)$'; then
  echo "Packed @hubzz/ui artifact must not contain font binaries." >&2
  exit 1
fi

cd "$WORKDIR/consumer"
printf '%s\n' '{"name":"hubzz-package-consumer","private":true,"type":"module"}' > package.json
pnpm add \
  "$TARBALL" \
  "react@${REACT_VERSION}" \
  "react-dom@${REACT_DOM_VERSION}" \
  --save-exact \
  --silent

node --input-type=module <<'NODE'
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import * as ui from "@hubzz/ui"
import manifest from "@hubzz/ui/components.json" with { type: "json" }

for (const componentName of Object.keys(manifest.components)) {
  if (!(componentName in ui)) {
    throw new Error(`Missing ESM export: ${componentName}`)
  }
}

if (!("buttonVariants" in ui)) {
  throw new Error("Missing ESM export: buttonVariants")
}

const cssPath = fileURLToPath(import.meta.resolve("@hubzz/ui/styles.css"))
const css = readFileSync(cssPath, "utf8")
if (!css.includes("--primary:")) {
  throw new Error("Package stylesheet is missing Hubzz semantic tokens")
}
if (css.includes("@font-face") || /\.woff2?\b/.test(css)) {
  throw new Error("Package stylesheet must not bundle font sources")
}
NODE

node --input-type=commonjs <<'NODE'
const ui = require("@hubzz/ui")
const manifest = require("@hubzz/ui/components.json")

for (const componentName of Object.keys(manifest.components)) {
  if (!(componentName in ui)) {
    throw new Error(`Missing CommonJS export: ${componentName}`)
  }
}

if (!("buttonVariants" in ui)) {
  throw new Error("Missing CommonJS export: buttonVariants")
}

require.resolve("@hubzz/ui/styles.css")
NODE

echo "Verified packed @hubzz/ui ESM, CommonJS, stylesheet, and font-asset boundaries in a clean consumer."
