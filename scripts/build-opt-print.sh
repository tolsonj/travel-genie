#!/usr/bin/env bash
# Build 8x10 HTML + PDF from opt-*.md travel notes.
#
# Usage:
#   ./scripts/build-opt-print.sh                    # all eligible files in trips/japan-2026
#   ./scripts/build-opt-print.sh opt-06-food-dining # one file (with or without .md)
#   ./scripts/build-opt-print.sh --html-only        # skip PDF step
#   ./scripts/build-opt-print.sh --pdf-only         # only PDF from existing HTML
#
# Requirements: pandoc, Google Chrome (for PDF)

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TRIP_DIR="${TRIP_DIR:-$ROOT/trips/japan-2026}"
CSS="$ROOT/scripts/opt-print.css"
HTML_ONLY=0
PDF_ONLY=0
TARGETS=()

CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"

skip_file() {
  local base="$1"
  case "$base" in
    opt-00-workflow-state|*.marp) return 0 ;;
    opt-13-etiquette-formatted) return 0 ;; # duplicate of opt-13-etiquette
  esac
  return 1
}

usage() {
  sed -n '2,12p' "$0" | sed 's/^# \{0,1\}//'
  exit "${1:-0}"
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    -h|--help) usage 0 ;;
    --html-only) HTML_ONLY=1; shift ;;
    --pdf-only) PDF_ONLY=1; shift ;;
    --dir) TRIP_DIR="$2"; shift 2 ;;
    --*) echo "Unknown option: $1" >&2; usage 1 ;;
    *) TARGETS+=("$1"); shift ;;
  esac
done

if [[ ! -f "$CSS" ]]; then
  echo "Missing stylesheet: $CSS" >&2
  exit 1
fi

if [[ ${#TARGETS[@]} -eq 0 ]]; then
  while IFS= read -r -d '' file; do
    base="$(basename "$file" .md)"
    skip_file "$base" && continue
    TARGETS+=("$file")
  done < <(find "$TRIP_DIR" -maxdepth 1 -name 'opt-*.md' -print0 | sort -z)
fi

if [[ ${#TARGETS[@]} -eq 0 ]]; then
  echo "No opt-*.md files found in $TRIP_DIR" >&2
  exit 1
fi

read_frontmatter() {
  local md="$1"
  local key="$2"
  awk -v key="$key" '
    /^---$/ { fm=1; next }
    fm && /^---$/ { exit }
    fm && $0 ~ "^" key ": *" {
      sub("^" key ": *", "")
      gsub(/^["'\''"]|["'\''"]$/, "")
      print
      exit
    }
  ' "$md"
}

build_html() {
  local md="$1"
  local html="$2"
  local title hero
  title="$(grep -m1 '^# ' "$md" | sed 's/^# //')"
  hero="$(read_frontmatter "$md" hero-image)"

  pandoc "$md" \
    --from markdown+raw_html+yaml_metadata_block \
    --to html5 \
    --standalone \
    --resource-path="$TRIP_DIR" \
    --metadata title="Japan 2026 — ${title}" \
    --css "$CSS" \
    --variable lang=en \
    -o "$html"

  if [[ -n "$hero" ]]; then
    python3 - "$html" "$title" "$hero" <<'PY'
import pathlib, sys
html_path, title, hero = sys.argv[1:4]
hero_block = f"""<div class="hero-banner" style="background-image:url('{hero}')">
  <h1>{title}</h1>
  <p>Japan 2026</p>
</div>
"""
text = pathlib.Path(html_path).read_text()
text = text.replace("<body>", "<body>\n" + hero_block, 1)
pathlib.Path(html_path).write_text(text)
PY
  fi

  # Append footer before </body>
  if [[ "$(uname)" == "Darwin" ]]; then
    sed -i '' 's|</body>|<p class="doc-footer">Japan 2026 · '"${title}"'</p></body>|' "$html"
  else
    sed -i 's|</body>|<p class="doc-footer">Japan 2026 · '"${title}"'</p></body>|' "$html"
  fi
}

build_pdf() {
  local html="$1"
  local pdf="$2"

  if [[ ! -x "$CHROME" ]]; then
    echo "Chrome not found at $CHROME — set CHROME=... or open HTML and print manually." >&2
    return 1
  fi

  "$CHROME" \
    --headless=new \
    --disable-gpu \
    --no-pdf-header-footer \
    --print-to-pdf="$pdf" \
    "file://${html}" \
    >/dev/null 2>&1
}

for target in "${TARGETS[@]}"; do
  if [[ -f "$target" ]]; then
    md="$target"
  elif [[ -f "$TRIP_DIR/${target}.md" ]]; then
    md="$TRIP_DIR/${target}.md"
  elif [[ -f "$TRIP_DIR/opt-${target}.md" ]]; then
    md="$TRIP_DIR/opt-${target}.md"
  else
    echo "Skip (not found): $target" >&2
    continue
  fi

  base="$(basename "$md" .md)"
  skip_file "$base" && { echo "Skip (excluded): $base"; continue; }

  html="$TRIP_DIR/${base}-print.html"
  pdf="$TRIP_DIR/${base}-print.pdf"

  echo "→ $base"

  if [[ "$PDF_ONLY" -eq 0 ]]; then
    build_html "$md" "$html"
    echo "  HTML  $html"
  elif [[ ! -f "$html" ]]; then
    echo "  Missing HTML for PDF-only: $html" >&2
    continue
  fi

  if [[ "$HTML_ONLY" -eq 0 ]]; then
    build_pdf "$html" "$pdf"
    echo "  PDF   $pdf"
  fi
done

echo "Done."
