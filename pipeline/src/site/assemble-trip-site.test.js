#!/usr/bin/env node
// Smoke tests for assemble-trip-site + rendered trip.html
// Run: node pipeline/src/site/assemble-trip-site.test.js

import { assembleTripSite } from "./assemble-trip-site.js";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PIPELINE_ROOT = join(__dirname, "../..");
const SLUG = "china-vietnam-2026";

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

console.log(`\nSmoke tests — ${SLUG}\n`);

// T1: assembleTripSite returns correct shape
const site = assembleTripSite(SLUG);
assert(site.trip === SLUG, `site.trip === "${SLUG}"`);
assert(typeof site.meta.title === "string" && site.meta.title.length > 0, "meta.title is non-empty string");
assert(site.meta.title.includes("2026"), `meta.title includes year (got: "${site.meta.title}")`);
assert(Array.isArray(site.days), "site.days is array");
assert(site.days.length >= 10, `site.days.length >= 10 (got ${site.days.length})`);
assert(Array.isArray(site.sections), "site.sections is array");
assert(site.sections.length >= 8, `site.sections.length >= 8 (got ${site.sections.length})`);
assert(Array.isArray(site.extra_pages), "site.extra_pages is array");
assert(site.extra_pages.some(p => p.href === "gantt.html"), "extra_pages includes gantt.html");

// T2: each day has required fields
const day1 = site.days[0];
assert(typeof day1.day === "number", "day1.day is number");
assert(typeof day1.title === "string" && day1.title.length > 0, "day1.title is non-empty");
assert(Array.isArray(day1.events), "day1.events is array");
assert(day1.events.length > 0, "day1 has at least one event");
assert(Array.isArray(day1.events[0].lines), "event has lines array");

// T3: section ids match expected set
const sectionIds = site.sections.map(s => s.id);
for (const id of [
  "maps",
  "flights",
  "transport",
  "hotels",
  "restaurants",
  "attractions",
  "spas",
  "shopping-comparison",
  "food",
  "immigration"
]) {
  assert(sectionIds.includes(id), `sections includes "${id}"`);
}

// T4: rendered trip.html exists and has correct structure
const htmlPath = join(PIPELINE_ROOT, "dist", SLUG, "trip.html");
assert(existsSync(htmlPath), `trip.html exists at ${htmlPath}`);

if (existsSync(htmlPath)) {
  const html = readFileSync(htmlPath, "utf8");
  const dayHeadings = (html.match(/<h2 class="site-day-title">/g) || []).length;
  assert(dayHeadings >= 10, `trip.html has >= 10 day headings (got ${dayHeadings})`);
  assert(html.includes('class="site-sidebar"'), "trip.html has sidebar nav");
  assert(html.includes('id="itinerary"'), 'trip.html has id="itinerary" anchor');
  assert(html.includes('id="hotels"'), 'trip.html has id="hotels" section');
  assert(html.includes('id="flights"'), 'trip.html has id="flights" section');
  assert(html.includes('id="transport"'), 'trip.html has id="transport" section');
  assert(html.includes("Airport Express"), "trip.html includes Airport Express transit");
  assert(/site-footnote--transit/.test(html), "trip.html has transit footnotes on days");
  assert(html.includes('id="maps"'), 'trip.html has id="maps" section');
  assert(html.includes("site-map-img") || html.includes("site-map-fallback"), "trip.html has map visuals");
  assert(html.includes('id="restaurants"'), 'trip.html has id="restaurants" section');
  assert(html.includes('id="attractions"'), 'trip.html has id="attractions" section');
  assert(html.includes('id="spas"'), 'trip.html has id="spas" section');
  assert(html.includes('id="shopping-comparison"'), 'trip.html has id="shopping-comparison" section');
  assert(html.includes("gantt.html"), "trip.html links to gantt.html");
  assert(html.includes("kennedy-saves.html"), "trip.html links to kennedy-saves.html");
  assert(html.includes(">Schedule<"), "trip.html nav includes Schedule");
  assert(html.includes(">Saved places<"), "trip.html nav includes Saved places");
}

const ganttPath = join(PIPELINE_ROOT, "dist", SLUG, "gantt.html");
const kennedyPath = join(PIPELINE_ROOT, "dist", SLUG, "kennedy-saves.html");
if (existsSync(ganttPath)) {
  const gantt = readFileSync(ganttPath, "utf8");
  assert(gantt.includes("Daily schedule"), "gantt.html has schedule heading");
  assert(gantt.includes("Peking Duck"), "gantt.html includes day activities");
}
if (existsSync(kennedyPath)) {
  const ken = readFileSync(kennedyPath, "utf8");
  assert(ken.includes("__GEO_ITEMS__"), "kennedy-saves.html embeds geo items");
  assert(ken.includes("Hong Kong"), "kennedy-saves.html mentions Hong Kong");
}

// T5: days are sorted by day number
const dayNums = site.days.map(d => d.day);
const sorted = [...dayNums].sort((a, b) => a - b);
assert(JSON.stringify(dayNums) === JSON.stringify(sorted), "days are sorted by day number");

console.log(`\nResults: ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
