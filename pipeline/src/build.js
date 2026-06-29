#!/usr/bin/env node
// Orchestrator: discover aspects -> ensure canonical JSON (extract) -> render site/deck.
//
// Usage:
//   node src/build.js <trip>                        full pipeline, build trip.html (default)
//   node src/build.js <trip> --skip-extract         render only from existing data/<trip>/*.json
//   node src/build.js <trip> --only 02-route-optimization
//   node src/build.js <trip> --force                re-extract even if JSON exists
//   node src/build.js <trip> --target site          build trip.html (default)
//   node src/build.js <trip> --target deck          build deck.html
//   node src/build.js <trip> --target both          build trip.html + deck.html
//
// Default trip: china-vietnam-2026
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { discoverAspects, dataDir, PIPELINE_ROOT } from "./discover.js";
import { extractAspect, jsonPath } from "./extract/extract.js";
import { extractFromMarkdown, readTripFromFrontmatter } from "./extract/md-extract.js";
import { renderDeck } from "./render/index.js";
import { assembleTripSite } from "./site/assemble-trip-site.js";
import { renderTripSite } from "./site/render-trip-site.js";
import { exportGoogleMapsCsvForTrip } from "./export/google-maps-csv.js";

function parseArgs(argv) {
  const args = argv.slice(2);
  const flags = {
    skipExtract: args.includes("--skip-extract"),
    force: args.includes("--force"),
    only: null,
    target: "site"
  };
  const onlyIdx = args.indexOf("--only");
  if (onlyIdx !== -1) flags.only = args[onlyIdx + 1];
  const targetIdx = args.indexOf("--target");
  if (targetIdx !== -1) flags.target = args[targetIdx + 1];
  const trip = args.find(a => !a.startsWith("--") && a !== flags.only && a !== flags.target) || "china-vietnam-2026";
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

  if (slides.length === 0 && (flags.target === "deck" || flags.target === "both")) {
    console.error("\nNo canonical JSON available to render deck.");
    if (pending > 0) {
      console.error(`${pending} aspect(s) need extraction. Set ANTHROPIC_API_KEY or`);
      console.error("OPENAI_API_KEY and re-run, or fill the generated *.prompt.txt files.");
    }
    process.exit(1);
  }

  const outDir = join(PIPELINE_ROOT, "dist", trip);
  mkdirSync(outDir, { recursive: true });
  const written = [];

  try {
    const mapCsvs = exportGoogleMapsCsvForTrip(trip);
    for (const w of mapCsvs) {
      console.log(`  ✓ maps/${w.out.padEnd(16)} (${w.count} rows)`);
    }
  } catch (e) {
    console.warn(`  … maps CSV export skipped: ${e.message}`);
  }

  // Stage 2a: site render (default).
  if (flags.target === "site" || flags.target === "both") {
    const site = assembleTripSite(trip);
    const siteHtml = await renderTripSite(site);
    const siteFile = join(outDir, "trip.html");
    writeFileSync(siteFile, siteHtml, "utf8");
    written.push(siteFile);
  }

  // Stage 2b: deck render.
  if (flags.target === "deck" || flags.target === "both") {
    const deck = renderDeck(slides, {
      title: `${prettyTrip(trip)} — Travel Plan`,
      trip,
      subtitle: `${slides.length} slide${slides.length === 1 ? "" : "s"}`
    });
    const deckFile = join(outDir, "deck.html");
    writeFileSync(deckFile, deck, "utf8");
    written.push(deckFile);
  }

  console.log("─".repeat(48));
  for (const f of written) console.log(`Written → ${f}`);
  if (pending > 0) console.log(`(${pending} aspect(s) still pending extraction.)`);
  if (written.length > 0) console.log(`Open: file://${written[0]}\n`);
}

function prettyTrip(trip) {
  return trip.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

main().catch(e => {
  console.error("\nPipeline failed:", e.message);
  process.exit(1);
});
