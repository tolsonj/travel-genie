#!/usr/bin/env bash
# Extract JSON from opt-*.md → render trip.html (default) | deck.html | deck.pdf
# Usage: ./scripts/run-travel-deck.sh <trip-slug> [--force-json] [--deck] [--pdf]
set -euo pipefail

TRIP="${1:?Usage: $0 <trip-slug> [--force-json] [--deck] [--pdf]}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# Load .env so SERPAPI_API_KEY is available when running outside Cursor.
# Do not `source` — values like SERPAPI_API_KEY=<key> break bash parsing.
if [[ -f "$ROOT/.env" ]]; then
  while IFS= read -r line || [[ -n "$line" ]]; do
    [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue
    line="${line%"${line##*[![:space:]]}"}" # trim trailing whitespace
    export "$line"
  done < "$ROOT/.env"
fi

echo "── preflight: serpapi-tripadvisor"
node "$ROOT/scripts/check-serpapi.js"

FORCE_JSON=false
BUILD_DECK=false
BUILD_PDF=false
for arg in "${@:2}"; do
  case "$arg" in
    --force-json) FORCE_JSON=true ;;
    --deck)       BUILD_DECK=true ;;
    --pdf)        BUILD_PDF=true ;;
  esac
done

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
if [[ "$FORCE_JSON" == "true" ]]; then
  FORCE_FLAG="--force"
fi

echo "── fill JSON from opt-*.md ($TRIP)"
node src/extract/fill-from-opt.js "$TRIP" $FORCE_FLAG

if [[ -f src/extract/fill-dashboard.js ]]; then
  echo "── normalize dashboard JSON"
  node src/extract/fill-dashboard.js "$TRIP" || true
fi

# Always build site (primary deliverable)
echo "── render trip.html (site)"
node src/build.js "$TRIP" --skip-extract --target site

# Optional: slide deck
if [[ "$BUILD_DECK" == "true" ]]; then
  echo "── render deck.html (slide deck)"
  node src/build.js "$TRIP" --skip-extract --target deck
fi

# Optional: slide PDF (requires Playwright)
if [[ "$BUILD_PDF" == "true" ]]; then
  echo "── export deck.pdf (Playwright)"
  if [[ ! -d node_modules/playwright ]] || [[ ! -d node_modules/pdf-lib ]]; then
    echo "   installing playwright + pdf-lib (one-time)…"
    npm install --no-save playwright pdf-lib >/dev/null
  fi
  node src/export-pdf.js "$TRIP"
fi

SITE_HTML="$PIPELINE/dist/$TRIP/trip.html"
echo ""
echo "Done:"
echo "  $SITE_HTML"
if [[ "$BUILD_DECK" == "true" ]]; then
  echo "  $PIPELINE/dist/$TRIP/deck.html"
fi
if [[ "$BUILD_PDF" == "true" ]]; then
  echo "  $PIPELINE/dist/$TRIP/deck.pdf"
fi
echo ""
echo "Open: file://$SITE_HTML"
echo "Print: open in browser → Ctrl+P / Cmd+P"
