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
assert(Array.isArray(site.booking_queue), "site.booking_queue is array");

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
  "hotels",
  "restaurants",
  "attractions",
  "shopping-comparison",
  "food",
  "immigration",
  "health",
  "contingency"
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
  assert(html.includes('id="restaurants"'), 'trip.html has id="restaurants" section');
  assert(html.includes('id="attractions"'), 'trip.html has id="attractions" section');
  assert(html.includes('id="shopping-comparison"'), 'trip.html has id="shopping-comparison" section');
  assert(html.includes('@media print'), "trip.html CSS includes @media print");
  assert(html.length > 30000, `trip.html size > 30 KB (got ${html.length} bytes)`);
}

// T5: days are sorted by day number
const dayNums = site.days.map(d => d.day);
const sorted = [...dayNums].sort((a, b) => a - b);
assert(JSON.stringify(dayNums) === JSON.stringify(sorted), "days are sorted by day number");

console.log(`\nResults: ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
