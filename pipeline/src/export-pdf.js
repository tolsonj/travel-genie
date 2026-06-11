#!/usr/bin/env node
// Print deck.html → PDF (one slide per page @ 1280×720, backgrounds on).
// Renders slides individually — full-document print fails due to inlined map scripts.
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";
import { PDFDocument } from "pdf-lib";
import { GEOMAP_CLIENT_SCRIPT } from "./render/maps/geomap.js";

const __dir = dirname(fileURLToPath(import.meta.url));
const pipelineRoot = join(__dir, "..");
const VENDOR = join(pipelineRoot, "vendor");

const SLIDE_W = 1280;
const SLIDE_H = 720;

const trip = process.argv[2] || "japan-2026";
const deckHtml = resolve(pipelineRoot, "dist", trip, "deck.html");
const outPdf = resolve(pipelineRoot, "dist", trip, "deck.pdf");

function mapScripts() {
  const d3js = readFileSync(join(VENDOR, "d3.min.js"), "utf8");
  const topojsonjs = readFileSync(join(VENDOR, "topojson-client.min.js"), "utf8");
  const worldTopo = readFileSync(join(VENDOR, "countries-110m.json"), "utf8");
  return `
    <script>${d3js}</script>
    <script>${topojsonjs}</script>
    <script>window.WORLD_TOPO = ${worldTopo};</script>
    <script>${GEOMAP_CLIENT_SCRIPT}</script>`;
}

const MAP_SCRIPTS = mapScripts();

// Screen layout for export — do NOT use @media print (it sets height:auto and splits slides).
const EXPORT_CSS = `
html, body {
  margin: 0;
  padding: 0;
  width: ${SLIDE_W}px;
  height: ${SLIDE_H}px;
  overflow: hidden;
  background: #fff;
}
.pdf-frame {
  width: ${SLIDE_W}px;
  height: ${SLIDE_H}px;
  overflow: hidden;
  position: relative;
}
.pdf-frame .slide {
  width: ${SLIDE_W}px !important;
  min-height: ${SLIDE_H}px !important;
  height: auto !important;
  box-shadow: none !important;
  border: none !important;
  margin: 0 !important;
  transform-origin: top left;
}
`;

if (!existsSync(deckHtml)) {
  console.error(`Missing ${deckHtml} — run: node src/build.js ${trip}`);
  process.exit(1);
}

const html = readFileSync(deckHtml, "utf8");
const style = html.match(/<style>([\s\S]*?)<\/style>/)?.[1] ?? "";
const sections = [...html.matchAll(/<section class="slide[\s\S]*?<\/section>/g)].map(m => m[0]);

if (!sections.length) {
  console.error("No .slide sections found in deck.html");
  process.exit(1);
}

const { chromium } = await import("playwright");
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: SLIDE_W, height: SLIDE_H });

const merged = await PDFDocument.create();

for (let i = 0; i < sections.length; i++) {
  const needsMap = sections[i].includes("data-geomap");
  const doc = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><style>${style}${EXPORT_CSS}</style></head><body><div class="pdf-frame">${sections[i]}</div>${needsMap ? MAP_SCRIPTS : ""}</body></html>`;
  await page.setContent(doc, { waitUntil: "load" });

  if (needsMap) {
    await page.waitForFunction(() => {
      const panels = document.querySelectorAll("[data-geomap]");
      return panels.length > 0
        && [...panels].every(p => p.querySelector("svg path"));
    }, { timeout: 15_000 });
  }

  const scale = await page.evaluate(({ w, h }) => {
    const slide = document.querySelector(".slide");
    if (!slide) return 1;
    slide.style.transform = "none";
    const sw = slide.scrollWidth;
    const sh = slide.scrollHeight;
    return Math.min(w / sw, h / sh, 1);
  }, { w: SLIDE_W, h: SLIDE_H });

  if (scale < 1) {
    await page.evaluate(s => {
      document.querySelector(".slide").style.transform = `scale(${s})`;
    }, scale);
  }

  const bytes = await page.pdf({
    width: `${SLIDE_W}px`,
    height: `${SLIDE_H}px`,
    printBackground: true,
    margin: { top: "0", right: "0", bottom: "0", left: "0" },
    preferCSSPageSize: false,
    scale: 1
  });

  const slide = await PDFDocument.load(bytes);
  // Safety: only ever take the first page per slide.
  const [first] = await merged.copyPages(slide, [0]);
  merged.addPage(first);

  const pages = slide.getPageCount();
  const note = pages > 1 ? ` (trimmed ${pages - 1} overflow page${pages > 2 ? "s" : ""})` : "";
  const scaleNote = scale < 1 ? ` scale ${(scale * 100).toFixed(0)}%` : "";
  process.stderr.write(`  slide ${String(i + 1).padStart(2)}/${sections.length}${scaleNote}${note}\n`);
}

await browser.close();

mkdirSync(dirname(outPdf), { recursive: true });
writeFileSync(outPdf, await merged.save());
console.log(`PDF → ${outPdf} (${sections.length} pages)`);
