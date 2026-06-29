#!/usr/bin/env node
// Generate Google Maps import CSVs from trip sidecar markdown.
// Usage: node src/export/generate-maps-csv.js <trip-slug> [--no-dist]
import { exportGoogleMapsCsv } from "./google-maps-csv.js";
import { join } from "node:path";
import { REPO_ROOT } from "../discover.js";

const args = process.argv.slice(2);
const trip = args.find(a => !a.startsWith("--")) || "china-vietnam-2026";
const skipDist = args.includes("--no-dist");

const distDir = skipDist ? null : join(REPO_ROOT, "pipeline", "dist", trip);

console.log(`\n── Google Maps CSV export (${trip})`);
const written = exportGoogleMapsCsv(trip, { distDir });

if (!written.length) {
  console.log("  No CSV files written — ensure sidecar markdown exists in trips/<slug>/");
  process.exit(0);
}

for (const w of written) {
  console.log(`  [write] ${w.out} (${w.count} rows) → ${w.path}`);
  if (w.distPath) console.log(`          mirrored → ${w.distPath}`);
}
console.log("");
