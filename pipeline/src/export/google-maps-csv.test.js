#!/usr/bin/env node
// Tests for Google Maps CSV export.
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  rowsFromSidecar,
  toGoogleMapsCsv,
  exportGoogleMapsCsv
} from "./google-maps-csv.js";
import { REPO_ROOT } from "../discover.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SLUG = "china-vietnam-2026";
const TRIP_DIR = join(REPO_ROOT, "trips", SLUG);

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

console.log(`\nGoogle Maps CSV tests — ${SLUG}\n`);

const shoppingMd = readFileSync(join(TRIP_DIR, "shopping-comparison.md"), "utf8");
const hotelMd = readFileSync(join(TRIP_DIR, "hotel-comparison.md"), "utf8");
const restaurantMd = readFileSync(join(TRIP_DIR, "restaurant-comparison.md"), "utf8");
const attractionsMd = readFileSync(join(TRIP_DIR, "attractions-comparison.md"), "utf8");
const spaMd = readFileSync(join(TRIP_DIR, "spa-comparison.md"), "utf8");

const shoppingRows = rowsFromSidecar(shoppingMd, "shopping");
const hotelRows = rowsFromSidecar(hotelMd, "hotels");
const restaurantRows = rowsFromSidecar(restaurantMd, "restaurants");
const attractionRows = rowsFromSidecar(attractionsMd, "attractions");
const spaRows = rowsFromSidecar(spaMd, "spas");

assert(shoppingRows.length >= 7, `shopping rows >= 7 (got ${shoppingRows.length})`);
assert(hotelRows.length >= 4, `hotel rows >= 4 (got ${hotelRows.length})`);
assert(restaurantRows.length >= 10, `restaurant rows >= 10 (got ${restaurantRows.length})`);
assert(attractionRows.length >= 8, `attraction rows >= 8 (got ${attractionRows.length})`);
assert(spaRows.length >= 8, `spa rows >= 8 (got ${spaRows.length})`);

const sinTat = shoppingRows.find(r => /sin tat/i.test(r.name));
assert(Boolean(sinTat), "shopping includes Sin Tat Plaza");
assert(/Fa Yuen Street/i.test(sinTat?.address || ""), "Sin Tat has Fa Yuen Street address");

const peninsula = hotelRows.find(r => /peninsula/i.test(r.name));
assert(Boolean(peninsula), "hotels include Peninsula");
assert(/Salisbury Road/i.test(peninsula?.address || ""), "Peninsula has Salisbury Road address");

const csv = toGoogleMapsCsv(shoppingRows.slice(0, 2));
assert(csv.startsWith("Name,Description,Address\n"), "CSV has header row");
assert(csv.includes('"'), "CSV quotes fields with special chars");

const written = exportGoogleMapsCsv(SLUG, { distDir: null });
assert(written.length === 5, `export writes 5 category files (got ${written.length})`);

for (const { out } of written) {
  const path = join(TRIP_DIR, "maps", out);
  assert(existsSync(path), `${out} exists in trips/${SLUG}/maps/`);
  const content = readFileSync(path, "utf8");
  assert(content.includes("Name,Description,Address"), `${out} has Google Maps header`);
}

console.log(`\n${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
