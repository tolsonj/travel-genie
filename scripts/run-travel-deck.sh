#!/usr/bin/env bash
# Extract JSON from opt-*.md → render deck.html → export deck.pdf
# Usage: ./scripts/run-travel-deck.sh <trip-slug> [--force-json]
set -euo pipefail

TRIP="${1:?Usage: $0 <trip-slug> [--force-json]}"
ROOT_PRE="$(cd "$(dirname "$0")/.." && pwd)"

# Load .env so SERPAPI_API_KEY is available when running outside Cursor.
# Do not `source` — values like SERPAPI_API_KEY=<key> break bash parsing.
if [[ -f "$ROOT_PRE/.env" ]]; then
  while IFS= read -r line || [[ -n "$line" ]]; do
    [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue
    line="${line%"${line##*[![:space:]]}"}" # trim trailing whitespace
    export "$line"
  done < "$ROOT_PRE/.env"
fi

echo "── preflight: serpapi-tripadvisor"
node "$ROOT_PRE/scripts/check-serpapi.js"
FORCE="${2:-}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PIPELINE="$ROOT/pipeline"
TRIP_DIR="$ROOT/trips/$TRIP"

if [[ ! -d "$ROOT/trips" ]]; then
  mkdir -p "$ROOT/trips"
  echo "created: $ROOT/trips"
fi

if [[ ! -d "$TRIP_DIR" ]]; then
  mkdir -p "$TRIP_DIR"
  echo "created: $TRIP_DIR"
fi

OPT_COUNT="$(find "$TRIP_DIR" -maxdepth 1 -name 'opt-*.md' | wc -l | tr -d ' ')"
if [[ "$OPT_COUNT" -eq 0 ]]; then
  echo "error: no opt-*.md files in $TRIP_DIR — run CoT steps first" >&2
  exit 1
fi

cd "$PIPELINE"

FORCE_FLAG=""
if [[ "$FORCE" == "--force-json" ]]; then
  FORCE_FLAG="--force"
fi

echo "── fill JSON from opt-*.md ($TRIP)"
node src/extract/fill-from-opt.js "$TRIP" $FORCE_FLAG

if [[ -f src/extract/fill-dashboard.js ]]; then
  echo "── normalize dashboard JSON"
  node src/extract/fill-dashboard.js "$TRIP" || true
fi

echo "── render deck.html"
node src/build.js "$TRIP" --skip-extract

echo "── export deck.pdf"
if [[ ! -d node_modules/playwright ]] || [[ ! -d node_modules/pdf-lib ]]; then
  echo "   installing playwright + pdf-lib (one-time)…"
  npm install --no-save playwright pdf-lib >/dev/null
fi
node src/export-pdf.js "$TRIP"

HTML="$PIPELINE/dist/$TRIP/deck.html"
PDF="$PIPELINE/dist/$TRIP/deck.pdf"
echo ""
echo "Done:"
echo "  $HTML"
echo "  $PDF"
