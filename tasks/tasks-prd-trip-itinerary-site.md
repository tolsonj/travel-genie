# Tasks: Trip Itinerary Web Site

**PRD:** [`prd-trip-itinerary-site.md`](./prd-trip-itinerary-site.md)  
**Goal:** Replace PDF slide deck as the primary deliverable with an Inspirato-style scrollable `trip.html` built from existing canonical JSON.

---

## Relevant Files

| Path | Action |
|------|--------|
| `pipeline/schema/trip-site.schema.json` | Create — assembled site contract |
| `pipeline/src/site/assemble-trip-site.js` | Create — merge aspect JSON → trip-site model |
| `pipeline/src/site/parse-itinerary-tables.js` | Create — table[] → days[] for legacy master itinerary |
| `pipeline/src/site/enrich-days.js` | Create — join food, hotels, transport by day number |
| `pipeline/src/site/render-trip-site.js` | Create — HTML emitter |
| `pipeline/src/site/theme-site.js` | Create — mobile-first CSS |
| `pipeline/src/site/sections/*.js` | Create — simplified reference section renderers |
| `pipeline/src/build.js` | Modify — `--target site\|deck\|both` |
| `scripts/run-travel-deck.sh` | Modify or rename — default site, `--deck`/`--pdf` opt-in |
| `pipeline/src/site/assemble-trip-site.test.js` | Create — snapshot / unit tests |
| `scripts/publish-github-pages.sh` | Create — gh-pages branch deploy of `pipeline/dist/<slug>/` |
| `README.md` | Modify — site-first docs |
| `pipeline/README.md` | Modify — build commands |
| `.cursor/skills/travel-cot-deck/SKILL.md` | Modify — Phase 4 output |

---

## Dependency Graph (tasks)

```
1.1 schema ──► 1.2 assemble skeleton ──► 1.3 table parser ──► 1.4 enrichment
                                                      │
2.1 theme CSS ──► 2.2 render template ◄─────────────┘
                         │
3.1 build.js flags ◄─────┘
         │
3.2 shell script
         │
4.1 tests + 4.2 docs (parallel)
```

---

## Tasks

### Batch 1 — Data contract & assembly (parallel where noted)

- [ ] **1.1** [data] Create `pipeline/schema/trip-site.schema.json` with `meta`, `days[]`, `events[]`, `sections[]`, `booking_queue` (PRD §7.2)
- [ ] **1.2** [data] Create `assemble-trip-site.js` — load all `pipeline/data/<slug>/*.json`, return trip-site object; write cache to `trip-site.json` (D1, D2, D5)
- [ ] **1.3** [data] Create `parse-itinerary-tables.js` — convert `04-master-itinerary.json` `tables[]` captions matching `Day N — …` into `days[]` with Slot/Plan → events (D3)
- [ ] **1.4** [data] Create `enrich-days.js` — merge `meal_mapping.days`, accommodation check-in/out, flight legs by day index (D4)

**Batch 1 verification:** `node -e "import … assembleTripSite('china-vietnam-2026')"` logs ≥ 10 days with events.

---

### Batch 2 — Site render (depends on 1.2)

- [ ] **2.1** [frontend] Create `theme-site.js` — mobile-first CSS, day dividers, sticky nav, `@media print` stylesheet as primary PDF path (F1, F7, F6)
- [ ] **2.2** [frontend] Create `render-trip-site.js` — hero header, day loop (H2/H3/lines), footnotes block (F2, F3)
- [ ] **2.3** [frontend] Add sticky nav + anchor scroll (minimal inline JS) (F4)
- [ ] **2.4** [frontend] Create `sections/flights.js`, `sections/hotels.js`, `sections/generic-dashboard.js` for reference blocks (F5)

**Batch 2 verification:** Manual render to `/tmp/trip.html`; open at 375px — readable, no body overflow (V5).

---

### Batch 3 — Pipeline integration (depends on 2.2)

- [ ] **3.1** [backend] Extend `build.js` with `--target site|deck|both` (default `site`); call assemble + render-trip-site (B1, B2)
- [ ] **3.2** [backend] Update `scripts/run-travel-deck.sh` — default site only; `--deck` for slide deck; `--pdf` for Playwright slide PDF (opt-in, dev-only); consider rename to `run-travel-build.sh` (B3)
- [ ] **3.3** [backend] Wire `--only` for single-aspect site section rebuild where applicable (B4, P2)

**Batch 3 verification:** `./scripts/run-travel-build.sh china-vietnam-2026` → `pipeline/dist/china-vietnam-2026/trip.html` (V1).

---

### Batch 4 — Quality & docs (parallel after Batch 3)

- [ ] **4.1** [testing] Add `assemble-trip-site.test.js` — snapshot `trip-site.json` for china-vietnam-2026 (T1)
- [ ] **4.2** [testing] Smoke test: day heading count ≥ 10 in output HTML (T2, V3)
- [ ] **4.3** [docs] Update root `README.md` — diagram, quick start, site as primary output (DOC1)
- [ ] **4.4** [docs] Update `pipeline/README.md` and `travel-cot-deck` skill Phase 4 (DOC2, DOC3)
- [ ] **4.5** [docs] Add offline (`file://`) and `npx serve` instructions (I1)
- [ ] **4.6b** [infra] Create `scripts/publish-github-pages.sh` — push `pipeline/dist/<slug>/` to `gh-pages` branch (I2)
- [ ] **4.6** [data] P2: Improve `md-extract.js` to emit `parts[].days[]` for master itinerary when parsing opt markdown (D6)

**Batch 4 verification:** Full checklist V1–V8 passes for china-vietnam-2026.

---

## Parallel Execution Summary

| Can run in parallel | Must wait for |
|---------------------|---------------|
| 1.1, 1.3, 1.4, 2.1 | — |
| 1.2 | 1.1 |
| 2.2, 2.4 | 1.2 |
| 2.3 | 2.2 |
| 3.1 | 2.2 |
| 3.2 | 3.1 |
| 4.1–4.5 | 3.1 |
| 4.6 | 4.1 (optional follow-up) |

---

## Recommended First Execution Batch

1. **1.1** schema  
2. **1.3** table parser (unblocks real china-vietnam data immediately)  
3. **1.2** assemble skeleton  
4. **2.1 + 2.2** minimal render (hero + days only)  
5. **3.1** wire into build.js → first end-to-end `trip.html`

Defer enrichment (1.4), reference sections (2.4), PDF flag rework (3.2), and docs until first `trip.html` renders all days.

---

## Live Test Checklist (from PRD §11)

- [ ] V1 Build succeeds, `trip.html` exists  
- [ ] V2 Offline render  
- [ ] V3 Day heading count matches itinerary  
- [ ] V4 Events with detail lines per day  
- [ ] V5 Mobile 375px layout  
- [ ] V6 Section nav anchors work  
- [ ] V7 Deterministic rebuild  
- [ ] V8 Print — `Ctrl+P` on trip.html renders clean printable pages
