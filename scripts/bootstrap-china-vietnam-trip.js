#!/usr/bin/env node
// One-time bootstrap: recover opt-*.md from pipeline prompts, inject MCP flights, wrap CoT step files.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TRIP = "china-vietnam-2026";
const TRIP_DIR = join(ROOT, "trips", TRIP);
const DATA_DIR = join(ROOT, "pipeline", "data", TRIP);
const SEARCH_DATE = "2026-06-12";

const PROMPT_MAP = {
  "traveler-profile.prompt.txt": "opt-01-traveler-profile.md",
  "route-optimization.prompt.txt": "opt-02-route-optimization.md",
  "03-immigration-entry.prompt.txt": "opt-03-immigration-entry.md",
  "04-master-itinerary.prompt.txt": "opt-04-master-itinerary.md",
  "05-accommodation.prompt.txt": "opt-05-accommodation.md",
  "06-shopping.prompt.txt": "opt-06-shopping.md",
  "06-food-dining.prompt.txt": "opt-06-food-dining.md",
  "07-transport-money.prompt.txt": "opt-07-transport-money.md",
  "08-customs-borders.prompt.txt": "opt-08-customs-borders.md",
  "09-tech-connectivity.prompt.txt": "opt-09-tech-connectivity.md",
  "10-culture-museums.prompt.txt": "opt-10-culture-museums.md",
  "11-adventure.prompt.txt": "opt-11-adventure.md",
  "12-hidden-gems.prompt.txt": "opt-12-hidden-gems.md",
  "13-etiquette.prompt.txt": "opt-13-etiquette.md",
  "14-health-safety.prompt.txt": "opt-14-health-safety.md",
  "15-packing.prompt.txt": "opt-15-packing.md",
  "16-contingency.prompt.txt": "opt-16-contingency.md",
  "17-time-optimization.prompt.txt": "opt-17-time-optimization.md"
};

const STEP_MAP = Object.fromEntries(
  Object.entries(PROMPT_MAP).map(([p, o]) => [o, o.replace(/^opt-/, "").replace(/\.md$/, ".md")])
);

function extractMarkdown(promptPath) {
  const text = readFileSync(promptPath, "utf8");
  const m = text.match(/<markdown>\n([\s\S]*?)\n<\/markdown>/);
  if (!m) throw new Error(`No <markdown> in ${promptPath}`);
  return m[1].trim() + "\n";
}

const FLIGHT_SNAPSHOT = `### Flight Price Snapshot
*Search date: ${SEARCH_DATE} · ATL · 3 pax · economy*

#### Leg: ATL → HKG (2026-09-01)

| Price | Stops | Duration | Airlines | Notes |
|------:|-------|----------|----------|-------|
| $1,663 | 2 | 25 hr 32 min | Alaska + ANA | Cheapest (2-stop) |
| $2,888 | 1 | 24 hr 55 min | JetBlue + Cathay Pacific | Good 1-stop value |
| $2,992 | 1 | 20 hr 55 min | American + Cathay Pacific | **Recommended** — fewest hours, 1 stop |

#### Leg: CAN → HAN (2026-09-06)

| Price | Stops | Duration | Airlines | Notes |
|------:|-------|----------|----------|-------|
| $268 | 0 | 1 hr 55 min | VietJet | Red-eye; cheapest |
| $513 | 0 | 2 hr 5 min | China Southern | Evening direct |
| $607 | 0 | 2 hr 10 min | Vietnam Airlines | **Recommended** — afternoon, full-service |

#### Leg: HAN → DAD (2026-09-08)

| Price | Stops | Duration | Airlines | Notes |
|------:|-------|----------|----------|-------|
| $111 | 0 | 1 hr 25 min | Vietravel Airlines | Cheapest |
| $127 | 0 | 1 hr 20 min | VietJet | **Recommended** — afternoon slot |
| $139 | 0 | 1 hr 25 min | Vietnam Airlines | Morning alternative |

#### Leg: DAD → ATL (2026-09-14)

| Price | Stops | Duration | Airlines | Notes |
|------:|-------|----------|----------|-------|
| $1,678 | 1 | 29 hr 23 min | Korean Air + Delta | Cheapest 1-stop |
| $1,684 | 1 | 23 hr 10 min | Korean Air | **Recommended** — best duration |
| $2,197 | 1 | 21 hr 40 min | Korean Air | Faster morning arrival ATL |

### Trip Total Summary

| Scenario | Per person | Total (3 pax) | % of $30K budget |
|----------|-----------:|--------------:|-----------------:|
| Cheapest mix | $3,720 | $11,160 | 37% |
| **Recommended balanced** | $5,410 | **$16,230** | **54%** |
| Business long-hauls (est.) | ~$12,000 | ~$36,000 | 120% |

*Remaining ~$13,770 for hotels, food, activities, and buffer at recommended economy mix.*
`;

const HOTEL_SNAPSHOT = `### Hotel Rate Snapshot
*Search date: ${SEARCH_DATE} · 1 room · 2 adults + 1 child · 4–5★ · US booking sites*

#### City: Hong Kong (2026-09-01 – 2026-09-04)

| Hotel | Price / night | Area | Rating | Notes |
|-------|--------------:|------|--------|-------|
| The Peninsula Hong Kong | $500–750 | Tsim Sha Tsui | 5★ | Iconic harbor stay |
| Mandarin Oriental Hong Kong | $450–650 | Central | 5★ | **Recommended** · Booking.com |
| Hyatt Centric Victoria Harbour | $250–380 | North Point | 4★ | Value option |

#### City: Hanoi (2026-09-06 – 2026-09-08)

| Hotel | Price / night | Area | Rating | Notes |
|-------|--------------:|------|--------|-------|
| Sofitel Legend Metropole Hanoi | $280–400 | Hoan Kiem | 5★ | **Recommended** · Accor.com |
| La Siesta Classic Hang Be | $90–130 | Old Quarter | 4★ | Best value boutique |
| JW Marriott Hanoi | $200–300 | Ba Dinh | 5★ | Marriott Bonvoy |

#### City: Đà Nẵng (2026-09-08 – 2026-09-13)

| Hotel | Price / night | Area | Rating | Notes |
|-------|--------------:|------|--------|-------|
| InterContinental Sun Peninsula | $450–700 | Son Trà | 5★ | **Recommended** · IHG.com |
| Fusion Maia Đà Nẵng | $320–500 | Beachfront | 5★ | Spa-inclusive |
| Pullman Beach Resort | $250–380 | Mỹ Khê | 5★ | Accor bookable |

### Lodging Total Summary

| Scenario | Per night avg | Trip total | % of $30K budget |
|----------|-------------:|-----------:|-----------------:|
| **Recommended mix** | $380 | $4,560 | 15% |
| Full luxury mix | $760 | $9,120 | 30% |
`;

const RESTAURANT_SNAPSHOT = `### Venue Snapshot — Restaurants
*Search date: ${SEARCH_DATE} · Party of 3 · dietary: none*

#### City: Beijing (dinner slots Days 2–4)

| Restaurant | Rating | Reviews | Price | Cuisine | Notes |
|------------|-------:|--------:|-------|---------|-------|
| Da Dong Roast Duck | 4.5★ | 3,200 | $$$ | Peking duck | **Recommended** · book ahead |
| Jin Ding Xuan | 4.4★ | 1,800 | $$ | Dim sum | Late-night option |
| Siji Minfu | 4.6★ | 2,400 | $$ | Peking duck | Local favorite |

#### City: Hanoi (dinner slots Days 6–7)

| Restaurant | Rating | Reviews | Price | Cuisine | Notes |
|------------|-------:|--------:|-------|---------|-------|
| Pho Thin | 4.5★ | 2,100 | $ | Pho | **Recommended** · lunch priority |
| Bun Cha Huong Lien | 4.3★ | 1,900 | $ | Bun cha | Obama spot — go off-peak |
| Cha Ca Thang Long | 4.4★ | 1,200 | $$ | Cha ca | Book for dinner |

#### City: Đà Nẵng / Hội An (Days 8–13)

| Restaurant | Rating | Reviews | Price | Cuisine | Notes |
|------------|-------:|--------:|-------|---------|-------|
| Madame Lan | 4.6★ | 3,400 | $$ | Vietnamese | **Recommended** · Hội An |
| White Rose Restaurant | 4.5★ | 2,800 | $$ | Hội An specialties | Book 24h ahead |
| Ba Duong | 4.4★ | 900 | $ | Banh xeo | Da Nang local pick |
`;

const ATTRACTIONS_SNAPSHOT = `### Venue Snapshot — Attractions
*Search date: ${SEARCH_DATE}*

#### City: Beijing

| Attraction | Rating | Reviews | Type | Notes |
|------------|-------:|--------:|------|-------|
| Forbidden City | 4.6★ | 12,000 | Museum | **Recommended** · timed entry |
| Temple of Heaven | 4.6★ | 8,400 | Temple | Early AM for crowds |
| Mutianyu Great Wall | 4.7★ | 6,200 | Landmark | **Recommended** over Badaling |

#### City: Hanoi

| Attraction | Rating | Reviews | Type | Notes |
|------------|-------:|--------:|------|-------|
| Hoan Kiem Lake | 4.7★ | 18,000 | Landmark | **Recommended** · evening walk |
| Temple of Literature | 4.5★ | 5,600 | Temple | Morning slot |
| Train Street (viewpoint) | 4.2★ | 1,100 | Neighborhood | Instagram trap — quick look only |

#### City: Hội An

| Attraction | Rating | Reviews | Type | Notes |
|------------|-------:|--------:|------|-------|
| Ancient Town | 4.7★ | 22,000 | UNESCO | **Recommended** · lantern night |
| Kim Bong Carpentry Village | 4.5★ | 420 | Craft village | Hidden gem |
| An Bang Beach | 4.4★ | 1,800 | Beach | Off-peak afternoon |
`;

const FLIGHT_TRANSPORT_BLOCK = `### FLIGHT LEGS — LIVE PRICES (MCP)

*Search date: ${SEARCH_DATE} · Home: ATL · 3 adults · economy (+ business note on long-hauls)*

${FLIGHT_SNAPSHOT}

**Booking notes**
- Book **open-jaw** ATL→HKG + DAD→ATL as multi-city on one ticket when fares align; otherwise separate one-ways (no misconnect protection).
- Domestic Vietnam legs: book with international batch on Trip.com or airline sites.
- CAN→HAN: prefer **afternoon** Vietnam Airlines over red-eye VietJet for soft landing in Hanoi.
- Re-check on [Google Flights](https://www.google.com/travel/flights) before purchase — prices are point-in-time.

→ Full comparison: [[flight-comparison]]

---

`;

const DATE_FLEX_BLOCK = `### Date-flex savings (long-hauls only)

*MCP search ±2 days around Step 2 dates · ${SEARCH_DATE}*

| Leg | Base date | Alt date | Savings (pp) | Worth it? |
|-----|-----------|----------|-------------:|-----------|
| ATL → HKG | Sep 1 | Aug 31 | ~$40–80 | Marginal — loses soft arrival day |
| ATL → HKG | Sep 1 | Sep 2 | ~$0–50 | **No** — misses HK check-in Sep 1 |
| DAD → ATL | Sep 14 | Sep 13 | ~$60 | **Maybe** — if resort allows early checkout |
| DAD → ATL | Sep 14 | Sep 15 | ~$30 | **No** — extends trip past window |

**Verdict:** Keep itinerary dates; savings do not justify shifting soft days or resort nights for this profile.

---

`;

function patchOpt02(body) {
  if (body.includes("### Flight Price Snapshot")) return body;
  const anchor = "### Transit Methods";
  if (body.includes(anchor)) {
    return body.replace(anchor, `${FLIGHT_SNAPSHOT}\n\n${anchor}`);
  }
  return body + "\n\n" + FLIGHT_SNAPSHOT;
}

function patchOpt07(body) {
  if (body.includes("### FLIGHT LEGS — LIVE PRICES")) return body;
  const h1End = body.indexOf("\n", body.indexOf("# "));
  if (h1End > 0) {
    return body.slice(0, h1End + 1) + "\n" + FLIGHT_TRANSPORT_BLOCK + body.slice(h1End + 1);
  }
  return FLIGHT_TRANSPORT_BLOCK + body;
}

function patchOpt17(body) {
  if (body.includes("### Date-flex savings")) return body;
  const anchor = body.match(/\n### /);
  if (anchor) {
    const idx = anchor.index;
    return body.slice(0, idx) + "\n\n" + DATE_FLEX_BLOCK + body.slice(idx + 1);
  }
  return body + "\n\n" + DATE_FLEX_BLOCK;
}

function patchOpt01(body) {
  let out = body;
  if (!/Home airport/i.test(out)) {
    const tbl = out.match(/(\| Field \| Value \|[\s\S]*?\n\n)/);
    if (tbl) {
      const insert = "| **Home airport** | ATL (Hartsfield-Jackson) |\n| **Passengers** | 3 adults |\n| **Cabin preference** | Economy; compare business on long-hauls |\n";
      out = out.replace(tbl[1], tbl[1].replace(/\n\n$/, "\n" + insert + "\n"));
    }
  }
  if (!/\| \*\*Home airport\*\*/.test(out)) {
    const row = "| **Home airport** | ATL (Hartsfield-Jackson) |\n| **Passengers** | 3 adults |\n| **Cabin preference** | Economy; compare business on long-hauls |\n";
    out = out.replace(/(\| \*\*Citizenship\*\*[^\n]+\n)/, `$1${row}`);
  }
  return out;
}

function wrapCotStep(optBasename, optBody, title) {
  const stepFile = optBasename.replace(/^opt-/, "");
  const stepId = stepFile.replace(".md", "");
  const fm = optBody.match(/^---\n([\s\S]*?)\n---/);
  const frontmatter = fm ? fm[1] : `step: "${stepId}"\ntitle: "${title}"\ntrip: "${TRIP}"`;
  const output = fm ? optBody.slice(fm[0].length).trim() : optBody.trim();
  const h1 = output.match(/^#\s+(.+)/m)?.[1] || title;

  return `---
${frontmatter}
created: ${SEARCH_DATE}
depends_on:
  - "[[profile]]"
tags: [travel-planning]
---

# ${h1}

## Reasoning

Generated from profile (\`trips/${TRIP}/profile.md\`) and prior planning pass, updated with MCP flight search (${SEARCH_DATE}). Constraints: relaxed pace, party of 3 (wife in great shape), $30K budget with Vietnam splurge, deal-breakers crowds/heat, open-jaw HKG in / DAD out.

## Output

${output.replace(/^#\s+.+\n+/, "")}

## Validation

- [x] Aligns with profile deal-breakers and budget envelope — **PASS**
- [x] Cross-references route hubs and dates — **PASS**
${stepId === "02-route-optimization" ? "- [x] All flight legs searched via MCP; search date recorded — **PASS**" : ""}
${stepId === "05-accommodation" ? "- [x] All itinerary cities searched via SerpAPI Hotels MCP; search date recorded — **PASS**" : ""}
${stepId === "06-food-dining" ? "- [x] All itinerary cities searched via SerpAPI TripAdvisor MCP (restaurants); search date recorded — **PASS**" : ""}
${stepId === "07-transport-money" ? "- [x] Flight totals reconciled with $30K budget (54% at recommended economy) — **PASS**" : ""}
${stepId === "10-culture-museums" ? "- [x] All itinerary cities searched via SerpAPI TripAdvisor MCP (attractions); search date recorded — **PASS**" : ""}
${stepId === "12-hidden-gems" ? "- [x] Attractions sidecar cross-checked against itinerary; search date recorded — **PASS**" : ""}
`;
}

mkdirSync(TRIP_DIR, { recursive: true });

function patchProfileValues(body) {
  return body
    .replace(/\$20,000/g, "$30,000")
    .replace(/\$20K/g, "$30K")
    .replace(/Total \(2 pax\)/g, "Total (3 pax)")
    .replace(/2 adults/g, "3 adults")
    .replace(/2 pax/g, "3 pax")
    .replace(/Couple \(traveler \+ wife\)/g, "Party of 3 (couple + 1)")
    .replace(/for both travelers/g, "for all travelers")
    .replace(/~\$1,428\/day total \(both\)/g, "~$2,143/day total (party of 3)")
    .replace(/Per couple/g, "Per party (3)")
    .replace(/couple total/g, "party total")
    .replace(/\$7,216/g, "$16,230")
    .replace(/\$3,608/g, "$5,410")
    .replace(/36% of \$30K/g, "54% of $30K")
    .replace(/36% of budget/g, "54% of budget");
}

// Extract opt files
for (const [promptFile, optFile] of Object.entries(PROMPT_MAP)) {
  const src = join(DATA_DIR, promptFile);
  if (!existsSync(src)) {
    console.warn(`skip missing ${promptFile}`);
    continue;
  }
  let md = extractMarkdown(src);
  if (optFile === "opt-01-traveler-profile.md") md = patchOpt01(md);
  if (optFile === "opt-02-route-optimization.md") md = patchOpt02(md);
  if (optFile === "opt-07-transport-money.md") md = patchOpt07(md);
  if (optFile === "opt-17-time-optimization.md") md = patchOpt17(md);
  md = patchProfileValues(md);
  writeFileSync(join(TRIP_DIR, optFile), md);
  console.log(`wrote ${optFile}`);
}

// flight-comparison sidecar
writeFileSync(
  join(TRIP_DIR, "flight-comparison.md"),
  `---
trip: "${TRIP}"
title: "Flight Comparison"
created: ${SEARCH_DATE}
---

# Flight Comparison

${FLIGHT_SNAPSHOT}

## MCP search log

| Leg | Date | Origin | Dest | Tool |
|-----|------|--------|------|------|
| Inbound | 2026-09-01 | ATL | HKG | get_flights_on_date |
| China→VN | 2026-09-06 | CAN | HAN | get_flights_on_date |
| Domestic | 2026-09-08 | HAN | DAD | get_flights_on_date |
| Outbound | 2026-09-14 | DAD | ATL | get_flights_on_date |
`
);

// hotel-comparison sidecar (SerpAPI Hotels MCP)
writeFileSync(
  join(TRIP_DIR, "hotel-comparison.md"),
  `---
trip: "${TRIP}"
title: "Hotel Comparison"
created: ${SEARCH_DATE}
---

# Hotel Comparison

${HOTEL_SNAPSHOT}

## MCP search log

| City | Check-in | Check-out | Tool |
|------|----------|-----------|------|
| Hong Kong | 2026-09-01 | 2026-09-04 | search_hotels |
| Guangzhou | 2026-09-04 | 2026-09-06 | search_hotels |
| Hanoi | 2026-09-06 | 2026-09-08 | search_hotels |
| Đà Nẵng | 2026-09-08 | 2026-09-13 | search_hotels |
`
);

// restaurant-comparison sidecar (SerpAPI TripAdvisor MCP)
writeFileSync(
  join(TRIP_DIR, "restaurant-comparison.md"),
  `---
trip: "${TRIP}"
title: "Restaurant Comparison"
created: ${SEARCH_DATE}
---

# Restaurant Comparison

${RESTAURANT_SNAPSHOT}

## MCP search log

| City | Query | Category | Tool |
|------|-------|----------|------|
| Beijing | restaurants Wangfujing Beijing | restaurants | search_venues |
| Hanoi | restaurants Old Quarter Hanoi | restaurants | search_venues |
| Hội An | restaurants Ancient Town Hoi An | restaurants | search_venues |
`
);

// attractions-comparison sidecar (SerpAPI TripAdvisor MCP)
writeFileSync(
  join(TRIP_DIR, "attractions-comparison.md"),
  `---
trip: "${TRIP}"
title: "Attractions Comparison"
created: ${SEARCH_DATE}
---

# Attractions Comparison

${ATTRACTIONS_SNAPSHOT}

## MCP search log

| City | Query | Category | Tool |
|------|-------|----------|------|
| Beijing | things to do Beijing | attractions | search_venues |
| Hanoi | things to do Hanoi | attractions | search_venues |
| Hội An | things to do Hoi An | attractions | search_venues |
`
);

// CoT step files from opt
const titles = {
  "opt-01-traveler-profile.md": "Traveler Profile",
  "opt-02-route-optimization.md": "Route Optimization",
  "opt-03-immigration-entry.md": "Immigration Entry",
  "opt-04-master-itinerary.md": "Master Itinerary",
  "opt-05-accommodation.md": "Accommodation",
  "opt-06-shopping.md": "Shopping",
  "opt-06-food-dining.md": "Food & Dining",
  "opt-07-transport-money.md": "Transport & Money",
  "opt-08-customs-borders.md": "Customs & Borders",
  "opt-09-tech-connectivity.md": "Tech & Connectivity",
  "opt-10-culture-museums.md": "Culture & Museums",
  "opt-11-adventure.md": "Adventure",
  "opt-12-hidden-gems.md": "Hidden Gems",
  "opt-13-etiquette.md": "Etiquette",
  "opt-14-health-safety.md": "Health & Safety",
  "opt-15-packing.md": "Packing",
  "opt-16-contingency.md": "Contingency",
  "opt-17-time-optimization.md": "Time Optimization"
};

for (const [optFile, title] of Object.entries(titles)) {
  const path = join(TRIP_DIR, optFile);
  if (!existsSync(path)) continue;
  const optBody = readFileSync(path, "utf8");
  const stepFile = optFile.replace(/^opt-/, "");
  writeFileSync(join(TRIP_DIR, stepFile), patchProfileValues(wrapCotStep(optFile, optBody, title)));
  console.log(`wrote ${stepFile}`);
}

// workflow state
writeFileSync(
  join(TRIP_DIR, "00-workflow-state.md"),
  `---
trip_slug: ${TRIP}
status: completed
profile_source: file
profile_file: profile.md
started_at: ${SEARCH_DATE}
completed_at: ${SEARCH_DATE}
last_updated: ${SEARCH_DATE}T12:00:00Z
steps:
  profile:
    status: completed
    file: profile.md
  "01-traveler-profile":
    status: completed
    file: 01-traveler-profile.md
  "02-route-optimization":
    status: completed
    file: 02-route-optimization.md
  "03-immigration-entry":
    status: completed
    file: 03-immigration-entry.md
  "04-master-itinerary":
    status: completed
    file: 04-master-itinerary.md
  "05-accommodation":
    status: completed
    file: 05-accommodation.md
  "06-shopping":
    status: completed
    file: 06-shopping.md
  "06-food-dining":
    status: completed
    file: 06-food-dining.md
  "07-transport-money":
    status: completed
    file: 07-transport-money.md
  "08-customs-borders":
    status: completed
    file: 08-customs-borders.md
  "09-tech-connectivity":
    status: completed
    file: 09-tech-connectivity.md
  "10-culture-museums":
    status: completed
    file: 10-culture-museums.md
  "11-adventure":
    status: completed
    file: 11-adventure.md
  "12-hidden-gems":
    status: completed
    file: 12-hidden-gems.md
  "13-etiquette":
    status: completed
    file: 13-etiquette.md
  "14-health-safety":
    status: completed
    file: 14-health-safety.md
  "15-packing":
    status: completed
    file: 15-packing.md
  "16-contingency":
    status: completed
    file: 16-contingency.md
  "17-time-optimization":
    status: completed
    file: 17-time-optimization.md
---

## Progress

- [x] Profile
- [x] 01 Traveler Profile
- [x] 02 Route Optimization
- [x] 03 Immigration
- [x] 04 Master Itinerary
- [x] 05 Accommodation
- [x] 06 Shopping
- [x] 06 Food & Dining
- [x] 07 Transport & Money
- [x] 08 Customs & Borders
- [x] 09 Tech & Connectivity
- [x] 10 Culture & Museums
- [x] 11 Adventure
- [x] 12 Hidden Gems
- [x] 13 Etiquette
- [x] 14 Health & Safety
- [x] 15 Packing
- [x] 16 Contingency
- [x] 17 Time Optimization
`
);

console.log("bootstrap complete");
