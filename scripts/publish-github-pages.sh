#!/usr/bin/env bash
# Publish pipeline/dist/<slug>/ to the gh-pages branch.
# Usage: ./scripts/publish-github-pages.sh <trip-slug>
set -euo pipefail

TRIP="${1:?Usage: $0 <trip-slug>}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DIST="$ROOT/pipeline/dist/$TRIP"

if [[ ! -f "$DIST/trip.html" ]]; then
  echo "error: $DIST/trip.html not found — build the site first:" >&2
  echo "  ./scripts/run-travel-deck.sh $TRIP" >&2
  exit 1
fi

echo "── publishing $TRIP to gh-pages"

ORIG_BRANCH=$(git -C "$ROOT" rev-parse --abbrev-ref HEAD)

# Stash any uncommitted changes so we can switch branches safely
HAS_CHANGES=$(git -C "$ROOT" status --porcelain | wc -l | tr -d ' ')
if [[ "$HAS_CHANGES" -gt 0 ]]; then
  git -C "$ROOT" stash push -m "pre-gh-pages stash" --include-untracked
  STASHED=true
else
  STASHED=false
fi

# Create or switch to gh-pages branch
if git -C "$ROOT" show-ref --quiet refs/heads/gh-pages; then
  git -C "$ROOT" checkout gh-pages
else
  git -C "$ROOT" checkout --orphan gh-pages
  git -C "$ROOT" rm -rf . 2>/dev/null || true
fi

# Remove prior deploy for this trip (tracked + untracked source files)
git -C "$ROOT" rm -rf "trips/$TRIP" 2>/dev/null || true
rm -rf "$ROOT/trips/$TRIP"

# Copy built site only
mkdir -p "$ROOT/trips/$TRIP"
cp "$DIST/trip.html" "$ROOT/trips/$TRIP/index.html"
if [[ -f "$DIST/deck.html" ]]; then
  cp "$DIST/deck.html" "$ROOT/trips/$TRIP/deck.html"
fi
if [[ -d "$DIST/maps" ]]; then
  cp -R "$DIST/maps" "$ROOT/trips/$TRIP/maps"
fi

# Root index listing published trips
{
  echo '<!DOCTYPE html>'
  echo '<html lang="en"><head><meta charset="utf-8">'
  echo '<meta name="viewport" content="width=device-width,initial-scale=1">'
  echo '<title>travel-genie trips</title></head><body>'
  echo '<h1>travel-genie trips</h1><ul>'
  for trip_dir in "$ROOT"/trips/*/; do
    [[ -d "$trip_dir" ]] || continue
    slug=$(basename "$trip_dir")
    [[ -f "$trip_dir/index.html" ]] || continue
    echo "<li><a href=\"trips/$slug/\">$slug</a> — <a href=\"trips/$slug/deck.html\">deck</a></li>"
  done
  echo '</ul></body></html>'
} > "$ROOT/index.html"

# Commit and push
git -C "$ROOT" add index.html "trips/$TRIP/index.html"
[[ -f "$ROOT/trips/$TRIP/deck.html" ]] && git -C "$ROOT" add "trips/$TRIP/deck.html"
[[ -d "$ROOT/trips/$TRIP/maps" ]] && git -C "$ROOT" add -f "trips/$TRIP/maps"
git -C "$ROOT" commit -m "deploy: $TRIP site $(date -u +%Y-%m-%dT%H:%M:%SZ)"
git -C "$ROOT" push origin gh-pages

git -C "$ROOT" checkout "$ORIG_BRANCH"

if [[ "$STASHED" == "true" ]]; then
  git -C "$ROOT" stash pop
fi

REMOTE=$(git -C "$ROOT" remote get-url origin)
if [[ "$REMOTE" =~ github\.com[:/]([^/]+)/([^/.]+) ]]; then
  OWNER="${BASH_REMATCH[1]}"
  REPO="${BASH_REMATCH[2]%.git}"
  BASE="https://${OWNER}.github.io/${REPO}"
else
  BASE="https://<owner>.github.io/<repo>"
fi

echo ""
echo "Published → ${BASE}/trips/${TRIP}/"
echo "Deck      → ${BASE}/trips/${TRIP}/deck.html"
