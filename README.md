# travel-genie

Turn a single **traveler profile** into a polished, print-ready **travel deck** (HTML + PDF) using a 17-step chain-of-thought (CoT) planning workflow and a deterministic rendering pipeline.

```
profile.md ──▶ CoT steps 01–17 ──▶ opt-*.md ──▶ canonical JSON ──▶ trip.html   (primary)
 (you write)     (AI planning)      (print src)   (extract)        (site)
                                                                  ──▶ deck.html  (optional --deck)
                                                                  ──▶ deck.pdf   (optional --pdf)
```

---

## Table of contents

1. [Development stack](#development-stack)
2. [Concepts & layout](#concepts--layout)
3. [First-time setup](#first-time-setup)
4. [The complete process](#the-complete-process)
5. [Quick start (fully automated)](#quick-start-fully-automated)
6. [Running every step individually](#running-every-step-individually)
7. [Regenerating pipeline data](#regenerating-pipeline-data)
8. [Example agent prompts](#example-agent-prompts)
9. [Troubleshooting](#troubleshooting)
10. [Workspace rules](#workspace-rules)
11. [Cursor extensions](#cursor-extensions)

---

## Development stack

No web framework and no build step — plain **Node.js ES modules** that read markdown and emit a single self-contained HTML file, plus a headless-browser pass for PDF.

| Tool | Version / source | Role in the pipeline |
|------|------------------|----------------------|
| **Node.js** | `>= 18` (tested on v20) | Runtime for every `pipeline/src/*.js` script. ESM (`"type": "module"`). |
| **Plain JS templates** | `pipeline/src/render/templates/*.js` | Stage 2 rendering. Each aspect `type` maps to a template that returns an HTML string. No React/Vue/templating engine. |
| **D3** (`d3.min.js`) | vendored in `pipeline/vendor/` (v7) | Draws the geographic route map — Mercator projection, country paths, hub markers. Inlined into the deck and re-run during PDF export. |
| **topojson-client** (`topojson-client.min.js`) | vendored (v3) | Decodes the world TopoJSON into GeoJSON features for D3. |
| **Natural Earth world map** (`countries-110m.json`) | vendored (~108 KB) | Base country geometry for the maps. Vendored so the deck builds **offline** and is byte-stable. |
| **Playwright** | `npm install --no-save playwright` (Chrome channel) | Headless Chrome used by `export-pdf.js` to render each slide and print it to PDF. |
| **pdf-lib** | `npm install --no-save pdf-lib` | Merges the per-slide PDFs into one `deck.pdf` (and trims any overflow pages). |
| **Anthropic / OpenAI API** | optional, via `fetch` (no SDK) | **Stage 1 only.** If `ANTHROPIC_API_KEY` or `OPENAI_API_KEY` is set, `extract.js` auto-extracts JSON. Override with `ANTHROPIC_MODEL` / `OPENAI_MODEL`. Not needed when building from `opt-*.md`. |
| **Bash** | `scripts/run-travel-deck.sh` | One-command orchestration of the build (Phase 4). |
| **Cursor agent skill** | `.cursor/skills/travel-cot-deck/` | Drives Phases 0–4: profile intake, CoT planning, opt files, build. |

**Runtime dependencies are zero** for rendering (`package.json` lists none — D3/topojson are vendored). Playwright + pdf-lib are installed on demand, only for the PDF step, and with `--no-save` so they never enter `package.json`.

Why this shape:

- **Vendored map assets** → identical output every run, works fully offline, no CDN.
- **Deterministic Stage 2** → the same `data/<trip>/*.json` always yields byte-identical `deck.html`.
- **AI isolated to Stage 1** → the only nondeterministic, network-dependent, optional part.

---

## Concepts & layout

| Path | Purpose |
|------|---------|
| `prompts/Travel-Prompt-cot.md` | The 17 chain-of-thought planning prompts (source of truth). |
| `prompts/start-prompt.md` | Original kickoff prompt describing the task-list approach. |
| `trips/<slug>/profile.md` | **Your input.** Predefined traveler profile. |
| `trips/<slug>/NN-*.md` | CoT step outputs (`## Reasoning` → `## Output` → `## Validation`). |
| `trips/<slug>/opt-NN-*.md` | Print sources — the **`## Output` only** copy of each step. The pipeline reads these. |
| `trips/<slug>/00-workflow-state.md` | Progress tracker (enables stop / resume / redo). |
| `trips/<slug>/TRAVEL_MASTER.md` | Optional assembled brief (step 18). |
| `trips/<slug>/flight-comparison.md` | Optional MCP flight sidecar (full leg tables + search log). |
| `trips/<slug>/hotel-comparison.md` | Optional SerpAPI Hotels sidecar → dedicated HOTELS deck slide. |
| `trips/<slug>/restaurant-comparison.md` | Optional SerpAPI TripAdvisor sidecar (restaurants per city). |
| `trips/<slug>/attractions-comparison.md` | Optional SerpAPI TripAdvisor sidecar (attractions / hidden gems). |
| `trips/<slug>/shopping-comparison.md` | Optional SerpAPI TripAdvisor sidecar (shopping venues per city). |
| `pipeline/` | **Local-only (gitignored).** Contains `src/`, `schema/`, `vendor/`, `data/`, `dist/`. Generated on first build. |
| `pipeline/data/<slug>/*.json` | Canonical extracted data (one file per aspect). **Regeneratable** — see [Regenerating pipeline data](#regenerating-pipeline-data). |
| `pipeline/dist/<slug>/trip.html` | Mobile-first scrollable itinerary site. **Primary deliverable.** |
| `pipeline/dist/<slug>/deck.html` | Slide deck (1280×720). Optional; use --deck flag. |
| `pipeline/dist/<slug>/deck.pdf` | Slide PDF (Playwright). Optional; use --pdf flag. |
| `pipeline/schema/aspect-manifest.json` | Registry: aspect → type, slide template, extraction hints. |
| `scripts/run-travel-deck.sh` | One-command build: opt files → JSON → HTML → PDF. |
| `scripts/build-opt-print.sh` | Standalone 8×10 print builder: `opt-*.md` → HTML (pandoc) → PDF (headless Chrome). |
| `scripts/check-serpapi.js` | SerpAPI preflight: validates API key, account status, and TripAdvisor engine access. |
| `scripts/opt-print.css` | Stylesheet for print output — 8×10 page, hero banners, tables, Caveat/Inter fonts. |
| `mcp/tripadvisor-server/` | Local SerpAPI TripAdvisor MCP server (`search_venues`, `get_venue_details`). |
| `poc/` | Proof-of-concept route-optimization slide prototypes (HTML + screenshots). |
| `.env.example` | Template for local `.env` (API keys). |
| `.cursor/mcp.json.example` | MCP config template (hotels + TripAdvisor). Copy locally — **do not commit** `.cursor/mcp.json`. |
| `.cursor/rules/ironbee-devtools-use.mdc` | Workspace rule: enforce IronBee DevTools for all browser verification. |
| `.cursor/skills/travel-cot-deck/` | Agent skill that drives the full workflow (profile → CoT → opt → deck). |
| `.cursor/skills/travel-planning-cot/` | Agent skill for planning only (no deck build). |

**Trip slug** = lowercase `{countries}-{year}` (e.g. `japan-2026`, `china-vietnam-2026`).

The architecture is **two-stage and decoupled**:

- **Stage 1 — extract** (the only AI step in the pipeline): maps "similar but not identical" markdown onto one strict JSON schema. With no API key, it writes a schema-guided prompt or extracts deterministically from `opt-*.md`.
- **Stage 2 — render** (fully deterministic): same JSON always produces the same deck. No AI, no network.

---

## First-time setup

After cloning the repo you will notice that `pipeline/` and `trips/` are **gitignored** — they are generated/populated locally and never committed. The repo ships only source code, prompts, MCP server source, build scripts, and configuration examples.

The workspace doubles as an **Obsidian vault** (`.obsidian/` is present). Step outputs use `[[wikilinks]]` for cross-references; open the repo root in Obsidian for linked navigation.

### 1. Environment variables

Copy the example and fill in your keys:

```bash
cp .env.example .env
```

| Variable | Required | Purpose |
|----------|----------|---------|
| `ANTHROPIC_API_KEY` | optional | Stage 1 extraction (`extract.js`) via Anthropic. Override model with `ANTHROPIC_MODEL`. |
| `OPENAI_API_KEY` | optional | Stage 1 extraction via OpenAI. Override model with `OPENAI_MODEL`. |
| `OPENCLAW_GATEWAY_TOKEN` | optional | Discord / OpenClaw gateway integration (see `Discord Setup.md`). |

At least one AI key is needed only if you run Stage 1 extraction with `extract.js`. Building from `opt-*.md` requires **no API key**.

### 2. SerpAPI key

Get a free key at [serpapi.com/manage-api-key](https://serpapi.com/manage-api-key) (~100 searches/mo on the free tier). One key powers both hotel and TripAdvisor MCP servers.

### 3. Cursor MCP config

Copy the example config and add your key:

```bash
cp .cursor/mcp.json.example .cursor/mcp.json
```

Edit `.cursor/mcp.json` — replace `<your_key>` with your SerpAPI key in **both** `env` blocks. The example registers two servers:

| Server | Source | Tools |
|--------|--------|-------|
| `serpapi-hotels` | `npx serpapi-hotels-mcp-server` | `search_hotels`, `get_hotel_details`, `get_hotel_reviews` |
| `serpapi-tripadvisor` | `mcp/tripadvisor-server/index.js` (this repo) | `search_venues`, `get_venue_details` |

**Security:** `.cursor/mcp.json` is gitignored (global + project). Never commit it. Only [`.cursor/mcp.json.example`](.cursor/mcp.json.example) is tracked.

Alternatively, merge the same JSON blocks into **Cursor → Settings → MCP** instead of using a project-level file.

### 4. Install TripAdvisor MCP dependencies

Hotels MCP needs no local install (`npx` fetches it). TripAdvisor MCP is local:

```bash
cd mcp/tripadvisor-server && npm install
```

Run from the **repo root** when starting the server (Cursor resolves `mcp/tripadvisor-server/index.js` relative to the workspace).

### 5. Restart Cursor

MCP servers load at startup. After editing `mcp.json` or installing dependencies, restart Cursor (or reload MCP from Settings).

### 6. Verify MCP is connected

In a Cursor chat, ask the agent to list MCP tools or run a test query:

- Hotels: `search_hotels` for one itinerary city (Step 05)
- TripAdvisor: `search_venues` with `category=restaurants` for one city (Step 06b)

If MCP is unavailable, planning still works — rates and venue ratings are flagged **unverified** in output.

### What to commit vs keep local

| Commit | Keep local (gitignored) |
|--------|------------------------|
| `prompts/`, `scripts/`, `mcp/tripadvisor-server/` source | `mcp/tripadvisor-server/node_modules/` |
| `.cursor/mcp.json.example`, `.env.example` | `.cursor/mcp.json`, `.env` (API keys) |
| `.cursor/rules/`, `.cursor/skills/` | `.cursor/*` (other Cursor state) |
| `poc/` (prototypes) | `pipeline/` (entire directory — regenerate with build) |
| — | `trips/` (all trip content — local planning data) |

---

## The complete process

### Phase 0 — Profile

Write a predefined profile at `trips/<slug>/profile.md`. Required fields: countries, dates/duration, budget, citizenship/passports, interests, pace/style, deal-breakers. For live flight search (Google Flights MCP in Steps 02, 07, 17), also include **home airport IATA**, **passenger count**, and **cabin preference**. For live hotel search (SerpAPI Hotels MCP in Step 05), also include **star preference**, **rooms**, **guest counts**, and **booking-platform requirements**. For live restaurant and attraction search (SerpAPI TripAdvisor MCP in Steps 06b, 10, 12), also include **dietary needs**, **cuisine preferences**, **price tier**, and **reservation tolerance**.

### MCP setup (Cursor)

See [First-time setup](#first-time-setup) for the full install flow. Summary:

**Flights** — Google Flights tools via `MCP_DOCKER`, `fli`, or `google-flights` (see flight preamble in `Travel-Prompt-cot.md`).

**Hotels + TripAdvisor** — both use the same `SERPAPI_API_KEY`. Full config in [`.cursor/mcp.json.example`](.cursor/mcp.json.example):

```bash
cp .cursor/mcp.json.example .cursor/mcp.json   # add your key
cd mcp/tripadvisor-server && npm install        # TripAdvisor only
# restart Cursor
```

**API budget (hotels):** ~1 `search_hotels` call per itinerary city + 1 `get_hotel_details` for the recommended pick only ≈ 8 calls for a 4-city trip.

**API budget (TripAdvisor):** ~1 `search_venues` call per itinerary city for restaurants (Step 06b) + ~1 per city for attractions (Steps 10/12) + 1 `get_venue_details` for recommended picks only ≈ 12–16 calls for a 4-city trip. Skip `get_hotel_reviews` / venue reviews unless explicitly requested — extra API credits.

**Which CoT steps use MCP:**

| Step | MCP server | When |
|------|------------|------|
| 02, 07, 17 | Google Flights | Live flight prices per leg |
| 05 | `serpapi-hotels` | Hotel rates per hub city |
| 06b | `serpapi-tripadvisor` | Restaurant ratings per city |
| 10, 12 | `serpapi-tripadvisor` | Attraction / hidden-gem ratings per city |
| 18 | — | Reference sidecar totals only; do not re-search |

```markdown
What countries: China and Vietnam
Home airport: ATL
Passengers: 2
Cabin preference: economy (compare business on long-hauls)
Travel Date: Sept 1, 2026 - Sept 14, 2026
Travel style: Relaxed and cultural experience
Hotel: 4 or 5 stars, resorts OK, on US booking sites
How many rooms needed: One room with king bed or two queen
Travel Partner: Traveling with wife (great shape)
Total budget: $20,000, splurge in Vietnam
Top interests: shopping, nature, food, history
Physical limitations: none
Deal-breakers: large crowds, heat
```

### Phase 1 — CoT planning (steps 01–17)

For each step the agent: loads the matching prompt block from `prompts/Travel-Prompt-cot.md`, injects context from the profile + dependency files, then writes `NN-step-name.md` with:

```markdown
# Route Optimization

## Reasoning
[assumptions, constraints, tradeoffs]

## Output
[the deliverable — tables, lists]

## Validation
[results of the prompt's VALIDATION checks]
```

Steps and dependencies are listed in `.cursor/skills/travel-cot-deck/prompts.md`. Independent steps with the same dependencies run in **parallel waves**; `03` runs before `04`, `07` before `08`.

### Phase 2 — Print sources (`opt-*.md`)

For each step, write `opt-NN-step-name.md` containing **only the `## Output` section** plus frontmatter:

```yaml
---
step: "06-food-dining"
title: "Food & Dining"
trip: "china-vietnam-2026"
hero-image: https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=1200&q=80
---
```

These are what the rendering pipeline consumes.

**Flight tables** (from MCP during Steps 02, 07, 17) go into `opt-02-route-optimization.md`, `opt-07-transport-money.md`, and `opt-17-time-optimization.md` using the table contract in `prompts/Travel-Prompt-cot.md` (preamble). The pipeline extracts them into:

- Route slide — `flight_snapshot` (recommended picks in footer)
- Transport slide — sidebar trip total + recommended picks; per-leg price panels first
- Time optimization slide — date-flex savings in sidebar

Optional full comparison tables: `trips/<slug>/flight-comparison.md` (Obsidian sidecar; not a deck slide by default).

**Hotel tables** (from SerpAPI Hotels MCP during Step 05) go into `opt-05-accommodation.md` using the table contract in `prompts/Travel-Prompt-cot.md` (hotel preamble). The pipeline extracts them into:

- Accommodation slide — neighborhood strategy + distilled recommended picks per city
- Hotel comparison slide — lodging total sidebar, per-city rate panels, MCP search log

Optional full comparison tables: `trips/<slug>/hotel-comparison.md` (manifest sidecar → dedicated HOTELS deck slide).

**Restaurant & attraction tables** (from SerpAPI TripAdvisor MCP during Steps 06b, 10, 12) go into sidecars using the table contract in `prompts/Travel-Prompt-cot.md` (TripAdvisor preamble). The pipeline enriches existing slides from these files:

| Sidecar | Written during | Enriches |
|---------|----------------|----------|
| `restaurant-comparison.md` | Step 06b | Food & dining slide (`dining_intelligence`, `venue_snapshot`) |
| `attractions-comparison.md` | Steps 10, 12 | Culture & museums slide (`spotlight`) and hidden gems slide (`panels`) |
| `shopping-comparison.md` | Step 06 (shopping) | Shopping slide (venue ratings per city) |

Per-city table format:

```markdown
### Venue Snapshot — Restaurants
*Search date: YYYY-MM-DD · Party of N · dietary: none*

#### City: Hanoi (dinner slots Days 6–7)

| Restaurant | Rating | Reviews | Price | Cuisine | Notes |
|------------|-------:|--------:|-------|---------|-------|
| Example    | 4.5★   | 2,400   | $     | Vietnamese | **Recommended** |
```

Include an **MCP search log** at the bottom of each sidecar (`City | Query | Category | Tool`).

Distill top picks into `opt-06-food-dining.md`, `opt-10-culture-museums.md`, and `opt-12-hidden-gems.md` Output sections. Reference sidecars with wikilinks: `[[restaurant-comparison]]`, `[[attractions-comparison]]`.

### Phase 3 — Final assembly (optional)

Step 18 produces `TRAVEL_MASTER.md`: a wikilink table of contents + 2–4 sentence executive summaries + efficiency scorecard. Not required for the deck.

### Phase 4 — Build deck (HTML + PDF)

```
opt-*.md ─▶ fill-from-opt.js ─▶ JSON ─▶ fill-dashboard.js ─▶ build.js ─▶ deck.html ─▶ export-pdf.js ─▶ deck.pdf
```

- `fill-from-opt.js` — extracts canonical JSON from each `opt-*.md` (no API key needed); flight tables → `flights` / `flight_snapshot` fields via `flight-extract.js`.
- `fill-dashboard.js` — normalizes generic aspects into the dashboard layout (sidebar + panels); prioritizes flight content on the transport slide.
- `build.js --skip-extract` — deterministic render to `deck.html`.
- `export-pdf.js` — renders each slide on a fixed 1280×720 canvas, auto-scales to fit one page, re-runs the inlined D3 map scripts, and merges to `deck.pdf`.

---

## Regenerating pipeline data

`pipeline/data/<slug>/` is a **cache** produced by `fill-from-opt.js` from `trips/<slug>/opt-*.md` and manifest sidecars. It is safe to delete entirely — the folder can stay empty until you extract again.

```bash
# Delete all cached JSON (optional)
rm -rf pipeline/data/china-vietnam-2026 pipeline/data/japan-2026

# Regenerate from opt files + sidecars
cd pipeline
node src/extract/fill-from-opt.js china-vietnam-2026 --force
```

Requirements for extract to succeed:

- `trips/<slug>/opt-*.md` must exist (CoT Phase 2 output)
- Sidecars are optional but needed for MCP-enriched slides: `flight-comparison.md`, `hotel-comparison.md`, `restaurant-comparison.md`, `attractions-comparison.md`

`pipeline/dist/` is also fully regeneratable:

```bash
./scripts/run-travel-deck.sh china-vietnam-2026
```

---

## Quick start (fully automated)

**Option A — one shell command** (planning already done, `opt-*.md` exist):

```bash
chmod +x scripts/run-travel-deck.sh        # one-time
./scripts/run-travel-deck.sh china-vietnam-2026

# Output: pipeline/dist/china-vietnam-2026/trip.html  ← open in browser or phone
# Optional: also build slide deck and PDF
./scripts/run-travel-deck.sh china-vietnam-2026 --deck --pdf
```

Force a JSON refresh after editing `opt-*.md`:

```bash
./scripts/run-travel-deck.sh china-vietnam-2026 --force-json
```

Outputs:

```
pipeline/dist/china-vietnam-2026/deck.html
pipeline/dist/china-vietnam-2026/deck.pdf
```

**Option B — full pipeline from a profile via the agent skill.** See [example prompts](#example-agent-prompts) below.

---

## Running every step individually

All pipeline commands run from `pipeline/` (or prefix paths from repo root).

### 1. Generate planning files (per CoT step)

Driven by the agent — one step at a time. See the [per-step prompt](#run-one-cot-step) below. Each writes `trips/<slug>/NN-step-name.md`.

### 2. Generate one `opt-*.md`

Copy the `## Output` section of a single step into its `opt-` file (agent task), or regenerate all of them.

### 3. Extract JSON from opt files

```bash
cd pipeline
node src/extract/fill-from-opt.js china-vietnam-2026          # only missing
node src/extract/fill-from-opt.js china-vietnam-2026 --force  # rebuild all
```

### 4. Normalize dashboard aspects

```bash
node src/extract/fill-dashboard.js china-vietnam-2026
```

### 5. Render the HTML deck

```bash
node src/build.js china-vietnam-2026 --skip-extract           # all slides
node src/build.js china-vietnam-2026 --skip-extract --only 02-route-optimization
```

### 6. Export the PDF

```bash
npm install --no-save playwright pdf-lib    # one-time
node src/export-pdf.js china-vietnam-2026
```

### 7. Build standalone 8×10 print PDFs (alternative)

A separate workflow builds individual 8×10-inch pages from `opt-*.md` using **pandoc** and **headless Chrome** (no pipeline needed):

```bash
./scripts/build-opt-print.sh                                    # all opt-*.md in default trip
TRIP_DIR=trips/china-vietnam-2026 ./scripts/build-opt-print.sh  # specific trip
./scripts/build-opt-print.sh opt-06-food-dining                 # single file
./scripts/build-opt-print.sh --html-only                        # skip PDF step
```

Requires `pandoc` and Google Chrome installed locally. Outputs `opt-NN-*-print.html` and `opt-NN-*-print.pdf` beside each source file. Stylesheet: `scripts/opt-print.css`.

### 8. Verify

- `deck.html` opens offline (everything is inlined).
- PDF page count equals the number of slides.
- Route/food slides show the map (not an empty blue box).

---

## Example agent prompts

Use these with the **`travel-cot-deck`** skill.

### Run the entire process automatically

```
Run the travel-cot-deck workflow for china-vietnam-2026 using
trips/china-vietnam-2026/profile.md. Execute CoT steps 01–17, write all
opt-*.md files, then build deck.html and deck.pdf.
```

### Build the deck only (planning already complete)

```
Build the HTML and PDF deck for china-vietnam-2026. The opt-*.md files
already exist — just run the pipeline (fill JSON, render, export PDF).
```

### <a name="run-one-cot-step"></a>Run one CoT step

```
Execute Step 04 (Master Itinerary) for china-vietnam-2026. Read the profile,
01-traveler-profile.md, 02-route-optimization.md, and 03-immigration-entry.md
for context. Use the Step 4 prompt from prompts/Travel-Prompt-cot.md. Write
04-master-itinerary.md with Reasoning → Output → Validation, then write
opt-04-master-itinerary.md (Output section only).
```

### Run a parallel wave

```
Run Wave B for china-vietnam-2026 in parallel: steps 05, 06-shopping,
06-food-dining, 09, 10, 11, 12, 13. All depend on the profile, 01, and 04.
Write each NN-*.md and its matching opt-*.md.
```

### Regenerate all opt files

```
Regenerate every opt-*.md for china-vietnam-2026 from the current
NN-*.md step files (Output section only, with hero-image frontmatter).
```

### Redo one step and rebuild

```
Redo Step 06-food-dining for china-vietnam-2026, update its opt file, then
rebuild deck.html and deck.pdf.
```

### Resume a paused trip

```
Resume the travel-cot-deck workflow for china-vietnam-2026. Read
00-workflow-state.md, continue from the first pending step through 17,
generate any missing opt files, then build the deck.
```

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `no opt-*.md files in trips/<slug>` | Run CoT Phase 1–2 first (or via the skill). |
| Slide shows empty blue box instead of map | Use `node src/export-pdf.js` (it re-runs map scripts); don't print the whole HTML in Chrome. |
| PDF splits a slide across pages | `export-pdf.js` auto-scales to one page; rebuild with it rather than `Chrome --print-to-pdf`. |
| Aspect renders with "generic layout" footer | Add/adjust its entry in `pipeline/schema/aspect-manifest.json`, then rebuild. |
| JSON didn't update after editing opt file | Re-run with `--force` / `--force-json`. |
| `playwright` missing | `cd pipeline && npm install --no-save playwright pdf-lib`. |
| SerpAPI preflight fails | Run `node scripts/check-serpapi.js` with `SERPAPI_API_KEY` in env. Checks account status and TripAdvisor engine access without consuming search credits. |
| SerpAPI MCP not connected | Copy `.cursor/mcp.json.example` → `.cursor/mcp.json`, add key, restart Cursor. Step 05 falls back to **unverified** rate estimates. |
| SerpAPI TripAdvisor MCP not connected | Run `cd mcp/tripadvisor-server && npm install`; ensure `serpapi-tripadvisor` is in `.cursor/mcp.json`; restart Cursor. Steps 06b/10/12 fall back to **unverified** venue ratings. |
| `Error: SERPAPI_API_KEY environment variable is required` | Key missing from `.cursor/mcp.json` `env` block for the failing server. |
| TripAdvisor MCP starts then errors on tool call | Run `npm install` inside `mcp/tripadvisor-server/`; confirm workspace root is the repo (path `mcp/tripadvisor-server/index.js` is relative to it). |
| SerpAPI quota exceeded | Reduce `get_hotel_details` / `get_venue_details` calls (recommended pick only); upgrade SerpAPI plan or re-run cities on next billing cycle. |
| No HOTEL COMPARISON slide in deck | Ensure `trips/<slug>/hotel-comparison.md` exists; rebuild with `--force-json`. |
| Restaurant/attraction sidecars missing | Ensure `trips/<slug>/restaurant-comparison.md` and `attractions-comparison.md` exist; rebuild with `--force-json`. |
| Shopping sidecar missing | Ensure `trips/<slug>/shopping-comparison.md` exists; rebuild with `--force-json`. |
| `pandoc` missing (print build) | Install pandoc: `brew install pandoc` (macOS). Required only for `build-opt-print.sh`, not for the deck pipeline. |
| `trip.html` not built | Run `./scripts/run-travel-deck.sh <slug>` (default now builds site, not deck). |
| Site missing sections | Ensure aspect JSON exists in `pipeline/data/<slug>/`; rebuild. |
| Print layout broken | Open `trip.html` in Chrome → Ctrl+P → select "Save as PDF". |

---

## Workspace rules

| Rule file | Scope | Purpose |
|-----------|-------|---------|
| `.cursor/rules/ironbee-devtools-use.mdc` | always applied | Requires all browser-based verification to use **IronBee DevTools** (Playwright MCP). Forbids Cursor's built-in browser agent for this workspace. Defines the verify-before-finish workflow: navigate → exercise change → screenshot/ARIA snapshot → check console errors. |

---

## Cursor extensions

Extensions installed in Cursor on the author's machine (Jun 2026). List locally with:

```bash
cursor --list-extensions
```

### Cursor / remote

| Extension | Purpose |
|-----------|---------|
| `anysphere.cursorpyright` | Python language support (Cursor) |
| `anysphere.remote-containers` | Dev Containers |
| `anysphere.remote-ssh` | Remote SSH |

### Python

| Extension | Purpose |
|-----------|---------|
| `ms-python.python` | Python |
| `ms-python.debugpy` | Python debugger |
| `kevinrose.vsc-python-indent` | Python indentation |

### Java

| Extension | Purpose |
|-----------|---------|
| `vscjava.vscode-java-pack` | Java extension pack |
| `redhat.java` | Language Support for Java |
| `vscjava.vscode-java-debug` | Debugger for Java |
| `vscjava.vscode-java-test` | Test Runner for Java |
| `vscjava.vscode-java-dependency` | Dependency Viewer |
| `vscjava.vscode-gradle` | Gradle for Java |
| `vscjava.vscode-maven` | Maven for Java |
| `visualstudioexptteam.vscodeintellicode` | IntelliCode |
| `visualstudioexptteam.intellicode-api-usage-examples` | IntelliCode API examples |

### Dart / Flutter / Vue

| Extension | Purpose |
|-----------|---------|
| `dart-code.dart-code` | Dart |
| `dart-code.flutter` | Flutter |
| `vue.volar` | Vue language support |

### Docker & containers

| Extension | Purpose |
|-----------|---------|
| `ms-azuretools.vscode-docker` | Docker |
| `ms-azuretools.vscode-containers` | Dev Containers (Microsoft) |

### Git

| Extension | Purpose |
|-----------|---------|
| `eamodio.gitlens` | GitLens |
| `donjayamanne.githistory` | Git History |

### Markdown & docs

| Extension | Purpose |
|-----------|---------|
| `shd101wyy.markdown-preview-enhanced` | Markdown Preview Enhanced |
| `bierner.markdown-mermaid` | Markdown Mermaid |
| `bpruitt-goddard.mermaid-markdown-syntax-highlighting` | Mermaid syntax highlighting |
| `marp-team.marp-vscode` | Marp slide decks |
| `canadaduane.notes` | Notes |
| `mafut.vsnotes-todo` | VSNotes todo |

### Data & SQL

| Extension | Purpose |
|-----------|---------|
| `mechatroner.rainbow-csv` | Rainbow CSV |
| `mtxr.sqltools` | SQLTools |
| `mtxr.sqltools-driver-pg` | SQLTools PostgreSQL driver |

### Formatting & quality

| Extension | Purpose |
|-----------|---------|
| `esbenp.prettier-vscode` | Prettier |
| `redhat.vscode-yaml` | YAML |
| `streetsidesoftware.code-spell-checker` | Code Spell Checker |

### MCP, browser & AI tooling

| Extension | Purpose |
|-----------|---------|
| `ironbee-ai.ironbee-devtools-vscode-extension` | IronBee DevTools — Playwright browser MCP (primary browser tool for this workspace) |
| `serkan-ozal.browser-devtools-mcp-vscode` | Browser DevTools MCP (Playwright) |
| `google.gemini-cli-vscode-ide-companion` | Gemini CLI IDE companion |
| `specstory.specstory-vscode` | SpecStory |

### Other

| Extension | Purpose |
|-----------|---------|
| `christian-kohler.npm-intellisense` | npm IntelliSense |
| `github.vscode-github-actions` | GitHub Actions |
| `firefox-devtools.vscode-firefox-debug` | Firefox debugger |
| `tomoki1207.pdf` | PDF viewer |
| `emilast.logfilehighlighter` | Log File Highlighter |
| `k--kato.intellij-idea-keybindings` | IntelliJ IDEA keybindings |

---

## Reference

- Pipeline internals: [`pipeline/README.md`](pipeline/README.md) (local only — generated on first build)
- CoT prompts: [`prompts/Travel-Prompt-cot.md`](prompts/Travel-Prompt-cot.md)
- Kickoff prompt: [`prompts/start-prompt.md`](prompts/start-prompt.md)
- Skill (full workflow): [`.cursor/skills/travel-cot-deck/SKILL.md`](.cursor/skills/travel-cot-deck/SKILL.md)
- Step registry: [`.cursor/skills/travel-cot-deck/prompts.md`](.cursor/skills/travel-cot-deck/prompts.md)
- Planning-only (no deck): [`.cursor/skills/travel-planning-cot/SKILL.md`](.cursor/skills/travel-planning-cot/SKILL.md)
- Workspace rule (IronBee): [`.cursor/rules/ironbee-devtools-use.mdc`](.cursor/rules/ironbee-devtools-use.mdc)
- Discord / OpenClaw notes: [`Discord Setup.md`](Discord%20Setup.md)
- Environment template: [`.env.example`](.env.example)
- MCP config template: [`.cursor/mcp.json.example`](.cursor/mcp.json.example)
