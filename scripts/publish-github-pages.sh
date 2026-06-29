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

# Stash any uncommitted changes so we can switch branches safely
HAS_CHANGES=$(git -C "$ROOT" status --porcelain | wc -l | tr -d ' ')
if [[ "$HAS_CHANGES" -gt 0 ]]; then
  git -C "$ROOT" stash push -m "pre-gh-pages stash" --include-untracked
  STASHED=true
else
  STASHED=false
fi

# Create or reset the gh-pages branch (orphan if first time)
if git -C "$ROOT" show-ref --quiet refs/heads/gh-pages; then
  git -C "$ROOT" checkout gh-pages
  git -C "$ROOT" rm -rf "trips/$TRIP" 2>/dev/null || true
else
  git -C "$ROOT" checkout --orphan gh-pages
  git -C "$ROOT" rm -rf . 2>/dev/null || true
fi

# Copy built site
mkdir -p "$ROOT/trips/$TRIP"
cp "$DIST/trip.html" "$ROOT/trips/$TRIP/index.html"
[[ -f "$DIST/deck.html" ]] && cp "$DIST/deck.html" "$ROOT/trips/$TRIP/deck.html" || true

# Commit and push
git -C "$ROOT" add "trips/$TRIP"
git -C "$ROOT" commit -m "deploy: $TRIP site $(date -u +%Y-%m-%dT%H:%M:%SZ)"
git -C "$ROOT" push origin gh-pages

# Return to previous branch
git -C "$ROOT" checkout -

# Restore stash if we created one
if [[ "$STASHED" == "true" ]]; then
  git -C "$ROOT" stash pop
fi

echo ""
echo "Published → https://<owner>.github.io/<repo>/trips/$TRIP/"
echo "(Replace <owner>/<repo> with your GitHub repository slug)"
