#!/usr/bin/env node
// Orchestrator: discover aspects -> ensure canonical JSON (extract) -> render deck.
//
// Usage:
//   node src/build.js <trip>                 full pipeline for a trip
//   node src/build.js <trip> --skip-extract  render only from existing data/<trip>/*.json
//   node src/build.js <trip> --only 02-route-optimization
//   node src/build.js <trip> --force         re-extract even if JSON exists
//
// Default trip: china-vietnam-2026
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { discoverAspects, dataDir, PIPELINE_ROOT } from "./discover.js";
import { extractAspect, jsonPath } from "./extract/extract.js";
import { extractFromMarkdown, readTripFromFrontmatter } from "./extract/md-extract.js";
import { renderDeck } from "./render/index.js";

function parseArgs(argv) {
  const args = argv.slice(2);
  const flags = {
    skipExtract: args.includes("--skip-extract"),
    force: args.includes("--force"),
    only: null
  };
  const onlyIdx = args.indexOf("--only");
  if (onlyIdx !== -1) flags.only = args[onlyIdx + 1];
  const trip = args.find(a => !a.startsWith("--") && a !== flags.only) || "china-vietnam-2026";
  return { trip, flags };
}

async function main() {
  const { trip, flags } = parseArgs(process.argv);
  console.log(`\ntravel-genie pipeline · trip: ${trip}`);
  console.log("─".repeat(48));

  let aspects = discoverAspects(trip);
  if (flags.only) {
    aspects = aspects.filter(a => a.id === flags.only || a.basename === flags.only);
  }
  console.log(`Discovered ${aspects.length} aspect(s).`);

  // Stage 1: ensure canonical JSON for each aspect.
  const slides = [];
  let pending = 0;
  for (const a of aspects) {
    let status = "skip-extract";
    if (!flags.skipExtract) {
      const r = await extractAspect({ trip, aspect: a, force: flags.force });
      status = r.status;
    }

    const p = jsonPath(trip, a.id);
    if (existsSync(p)) {
      let data = JSON.parse(readFileSync(p, "utf8"));
      // --skip-extract: keep fill-dashboard sidebar/panels; do not re-parse opt markdown.
      if (!flags.skipExtract && existsSync(a.sourceFile)) {
        const md = readFileSync(a.sourceFile, "utf8");
        const tripSlug = readTripFromFrontmatter(md, data.trip || trip);
        data = extractFromMarkdown(md, { ...a, trip: tripSlug });
      }
      slides.push({ templateName: a.templateName, data, aspect: a });
      console.log(`  ✓ ${a.id.padEnd(24)} [${a.templateName}] (${status})`);
    } else {
      pending++;
      console.log(`  … ${a.id.padEnd(24)} [needs extraction] (${status})`);
    }
  }

  if (slides.length === 0) {
    console.error("\nNo canonical JSON available to render.");
    if (pending > 0) {
      console.error(`${pending} aspect(s) need extraction. Set ANTHROPIC_API_KEY or`);
      console.error("OPENAI_API_KEY and re-run, or fill the generated *.prompt.txt files.");
    }
    process.exit(1);
  }

  // Stage 2: deterministic render.
  const deck = renderDeck(slides, {
    title: `${prettyTrip(trip)} — Travel Plan`,
    trip,
    subtitle: `${slides.length} slide${slides.length === 1 ? "" : "s"}`
  });

  const outDir = join(PIPELINE_ROOT, "dist", trip);
  mkdirSync(outDir, { recursive: true });
  const outFile = join(outDir, "deck.html");
  writeFileSync(outFile, deck, "utf8");

  console.log("─".repeat(48));
  console.log(`Rendered ${slides.length} slide(s) → ${outFile}`);
  if (pending > 0) console.log(`(${pending} aspect(s) still pending extraction.)`);
  console.log(`Open: file://${outFile}\n`);
}

function prettyTrip(trip) {
  return trip.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

main().catch(e => {
  console.error("\nPipeline failed:", e.message);
  process.exit(1);
});
