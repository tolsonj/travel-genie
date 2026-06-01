# travel-genie pipeline

Turns standardized trip markdown (`trips/<trip>/*.md`) into a polished, reproducible
slide deck. Built on the decoupled two-stage architecture validated by the POC.

```
markdown ──▶ [Stage 1: EXTRACT]──▶ canonical JSON ──▶ [Stage 2: RENDER]──▶ deck.html
 (fuzzy)        (AI, pluggable)      (the contract)     (deterministic)     (self-contained)
```

- **Stage 1 (extract)** is the *only* place AI is used: it maps "similar but not
  identical" markdown onto one strict JSON schema. It is pluggable and optional.
- **Stage 2 (render)** is fully deterministic: the same JSON always produces the
  same deck. No AI, no network.

## Quick start

```bash
cd pipeline

# Render from existing canonical JSON (no AI needed):
node src/build.js china-vietnam-2026 --skip-extract

# Full pipeline (extracts missing aspects, then renders):
node src/build.js china-vietnam-2026

# One aspect only:
node src/build.js china-vietnam-2026 --only 02-route-optimization --skip-extract
```

Output: `dist/<trip>/deck.html` — a **single self-contained file** (D3, the world
map, and all data are inlined; it opens offline with no network).

## Layout

```
pipeline/
  schema/
    trip.schema.json         canonical data contract (every field optional)
    aspect-manifest.json     registry: aspect -> type, template, extraction hints
  data/<trip>/*.json         canonical extracted data (one file per aspect)
  dist/<trip>/deck.html      rendered deck
  vendor/                    inlined assets: d3, topojson-client, world map
  src/
    build.js                 orchestrator CLI
    discover.js              find + match source aspects
    extract/                 Stage 1 (prompt builder + LLM-pluggable extractor)
    render/                  Stage 2 (theme, deck assembly, templates, geomap)
```

## Stage 1: extraction (the AI part)

`extract.js` is pluggable:

- **With a key** (`ANTHROPIC_API_KEY` or `OPENAI_API_KEY`): aspects are extracted
  automatically into `data/<trip>/<aspect>.json`.
  - Override models with `ANTHROPIC_MODEL` / `OPENAI_MODEL`.
- **Without a key**: the generated, schema-guided prompt is written to
  `data/<trip>/<aspect>.prompt.txt` for the Cursor agent (or a human) to fill in
  as `data/<trip>/<aspect>.json`. The pipeline stays runnable either way.

Already-present JSON is reused (idempotent); use `--force` to re-extract.

## Stage 2: rendering (deterministic)

Each aspect's `type` selects a template in `src/render/templates/`:

- `route-optimization` — bespoke slide with a **real geographic map** (nodes plotted
  from actual lat/long via D3 Mercator over Natural Earth TopoJSON).
- `generic` — fallback layout (title + intro banner + tables + bullet groups +
  status callouts). Any aspect with no bespoke template renders here, on-brand,
  the first time.

## Adding a NEW aspect (e.g. export fees & tariffs)

No code changes for the common cases:

1. Drop `19-export-fees-tariffs.md` into `trips/<trip>/`.
2. (Optional) Add a manifest entry to give it a `type`, `title`, and extraction
   `hints`. If you skip this, it still renders via the `generic` fallback.
3. Run `node src/build.js <trip>`.

A *bespoke* custom visual (like the route map) is the only thing that needs a
one-time template file in `src/render/templates/` + a key in the `TEMPLATES` map
in `src/render/index.js`.

## PDF export

`deck.html` is print-ready (`@media print` gives one slide per page):

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new --disable-gpu --no-pdf-header-footer \
  --print-to-pdf="dist/china-vietnam-2026/deck.pdf" \
  "file://$PWD/dist/china-vietnam-2026/deck.html"
```

## Reproducibility notes

- Map assets are **vendored** in `vendor/` and inlined at build time — no CDN
  dependency, identical output every run, works fully offline.
- The renderer is pure: given the same `data/<trip>/*.json`, byte-stable HTML.
