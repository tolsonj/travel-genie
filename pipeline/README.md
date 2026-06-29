# travel-genie pipeline

Turns standardized trip markdown (`trips/<trip>/*.md`) into a polished, reproducible
slide deck. Built on the decoupled two-stage architecture validated by the POC.

```
markdown ──▶ [Stage 1: EXTRACT]──▶ canonical JSON ──▶ [Stage 2: RENDER]──▶ trip.html   (primary)
 (fuzzy)        (AI, pluggable)      (the contract)     (deterministic)     (site)
                                                                           ──▶ deck.html  (optional --deck)
                                                                           ──▶ deck.pdf   (optional --pdf)
```

- **Stage 1 (extract)** is the *only* place AI is used: it maps "similar but not
identical" markdown onto one strict JSON schema. It is pluggable and optional.
- **Stage 2 (render)** is fully deterministic: the same JSON always produces the
same deck. No AI, no network.

## Quick start

```bash
cd pipeline

# Default target is now "site" (trip.html):
node src/build.js china-vietnam-2026 --skip-extract

# Deck only (old behavior):
node src/build.js china-vietnam-2026 --skip-extract --target deck

# Both:
node src/build.js china-vietnam-2026 --skip-extract --target both

# Full pipeline (extracts missing aspects, then renders):
node src/build.js china-vietnam-2026

# One aspect only:
node src/build.js china-vietnam-2026 --only 02-route-optimization --skip-extract
```

Output: `dist/<trip>/trip.html` — a **single self-contained file** (all styles and
data inlined; opens offline with no network). Use `--target deck` for the slide deck.

## Driving the pipeline with Cursor skills

You normally don't run these scripts by hand — you prompt the Cursor agent, which
loads a project skill from `.cursor/skills/` and runs the right commands for you.

| Skill | Use it for | Trigger phrases |
|-------|-----------|-----------------|
| **`travel-cot-deck`** | Full flow: profile → CoT planning → `opt-*.md` → `deck.html` + `deck.pdf` | "run the travel deck", "build the deck/PDF", "generate opt files" |
| **`travel-planning-cot`** | Planning only (no deck): the 17 CoT steps + `TRAVEL_MASTER.md` | "start/resume travel planning", "assemble travel master" |

A skill loads automatically when your prompt matches its description; you can also
name it explicitly ("use the travel-cot-deck skill"). The agent then reads/writes
files under `trips/<trip>/` and runs the pipeline commands below.

### Example prompts

**Build everything from a profile (Phases 0–4):**

```
Run the travel-cot-deck workflow for china-vietnam-2026 using
trips/china-vietnam-2026/profile.md. Execute CoT steps 01–17, write all
opt-*.md files, then build deck.html and deck.pdf.
```

**Build the deck only (planning already done):**

```
Build the HTML and PDF deck for china-vietnam-2026. The opt-*.md files
already exist — just run the pipeline (fill JSON, render, export PDF).
```

**Run one CoT step:**

```
Execute Step 04 (Master Itinerary) for china-vietnam-2026 using the Step 4
prompt in prompts/Travel-Prompt-cot.md. Write 04-master-itinerary.md
(Reasoning → Output → Validation), then opt-04-master-itinerary.md.
```

**Render one aspect / regenerate the PDF:**

```
Re-render only 02-route-optimization for china-vietnam-2026 and regenerate the PDF.
```

**Resume a paused trip:**

```
Resume travel-cot-deck for china-vietnam-2026 — read 00-workflow-state.md,
continue from the first pending step, then rebuild the deck.
```

See the [repo README](../README.md#example-agent-prompts) for the full prompt
catalog and the skill files in `.cursor/skills/travel-cot-deck/` for the workflow
phases and step registry.

## Trip itinerary site

The primary build output is now `dist/<trip>/trip.html` — a scrollable, mobile-first
day-by-day itinerary page. It is self-contained (no network needed) and print-ready
via `Ctrl+P` / `Cmd+P`.

New modules in `pipeline/src/site/`:

| Module | Purpose |
|--------|---------|
| `assemble-trip-site.js` | Merges all aspect JSON → trip-site model |
| `parse-itinerary-tables.js` | Converts legacy table[] master itinerary → days[] |
| `render-trip-site.js` | Emits `trip.html` from the trip-site model |
| `theme-site.js` | Inline CSS (mobile-first + `@media print`) |
| `sections/index.js` | Reference section renderers (Flights, Hotels, Food, …) |

Schema: `pipeline/schema/trip-site.schema.json`

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

`deck.html` is print-ready (`@media print` gives one slide per page). Use the export script (renders each slide separately, then merges — required because inlined map scripts break whole-page Chrome print):

```bash
cd pipeline
npm install --no-save playwright pdf-lib   # one-time
node src/export-pdf.js japan-2026
# → dist/japan-2026/deck.pdf (1280×720 px per page, backgrounds on)
```

## Reproducibility notes

- Map assets are **vendored** in `vendor/` and inlined at build time — no CDN
dependency, identical output every run, works fully offline.
- The renderer is pure: given the same `data/<trip>/*.json`, byte-stable HTML.

