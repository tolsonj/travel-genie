#!/usr/bin/env node
// Fill missing pipeline/data/<trip>/*.json from opt-*.md (no API key).
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { discoverAspects, dataDir } from "../discover.js";
import { buildExtractionPrompt } from "./prompt.js";
import { extractFromMarkdown, readTripFromFrontmatter } from "./md-extract.js";
import { jsonPath, promptPath } from "./extract.js";

const args = process.argv.slice(2);
const force = args.includes("--force");
const trip = args.find(a => !a.startsWith("--")) || "japan-2026";
mkdirSync(dataDir(trip), { recursive: true });

const aspects = discoverAspects(trip);
let written = 0;
let skipped = 0;

for (const a of aspects) {
  const jp = jsonPath(trip, a.id);
  const md = readFileSync(a.sourceFile, "utf8");
  const tripSlug = readTripFromFrontmatter(md, trip);

  const pp = promptPath(trip, a.id);
  writeFileSync(pp, buildExtractionPrompt({
    trip: tripSlug,
    aspect: { ...a, trip: tripSlug },
    markdown: md
  }), "utf8");

  if (existsSync(jp) && !force) {
    skipped++;
    console.log(`  [skip] ${a.id} (json exists)`);
    continue;
  }

  const data = extractFromMarkdown(md, { ...a, trip: tripSlug, refreshGeo: force });
  writeFileSync(jp, JSON.stringify(data, null, 2), "utf8");
  written++;
  console.log(`  [write] ${a.id} → ${jp}`);
}

console.log(`\n${written} JSON written, ${skipped} skipped (${aspects.length} opt aspects).`);
