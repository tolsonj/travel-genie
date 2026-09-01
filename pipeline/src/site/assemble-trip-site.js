/**
 * Assembles the complete trip-site model from all pipeline/data/<slug>/*.json aspects.
 *
 * Usage:
 *   node pipeline/src/site/assemble-trip-site.js china-vietnam-2026 [--write]
 *   import { assembleTripSite } from './assemble-trip-site.js';
 */

import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, basename } from "node:path";
import { parseItineraryTables, parseBookingQueue } from "./parse-itinerary-tables.js";
import { buildMapsSection } from "./build-maps-section.js";
import { listHotelInfoDocuments } from "./hotel-info-docs.js";
import { dataDir } from "../discover.js";
import { publishSection } from "../shared/publish-filter.js";
import { listExtraPages } from "./render-extra-pages.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Ordered list of reference sections to include in the trip-site model. */
const SECTION_ASPECTS = [
  { id: "flights",               title: "Flights",              aspect: "flight-comparison" },
  { id: "transport",             title: "Getting around",       aspect: "07-transport-money" },
  { id: "hotels",                title: "Hotels",               aspect: "hotel-comparison" },
  { id: "restaurants",           title: "Restaurants",          aspect: "restaurant-comparison" },
  { id: "attractions",           title: "Attractions",          aspect: "attractions-comparison" },
  { id: "spas",                  title: "Spas & Wellness",      aspect: "spa-comparison" },
  { id: "shopping-comparison",   title: "Shopping",             aspect: "shopping-comparison" },
  { id: "food",                  title: "Food & Dining",        aspect: "06-food-dining" },
  { id: "immigration",           title: "Immigration",          aspect: "03-immigration-entry" },
  { id: "health",                title: "Health & Safety",      aspect: "14-health-safety" },
  { id: "contingency",           title: "Contingency",          aspect: "16-contingency" },
];

/**
 * Humanize a trip slug into a display title.
 * "china-vietnam-2026" → "China · Vietnam 2026"
 * @param {string} slug
 * @returns {string}
 */
function humanizeSlug(slug) {
  const parts = slug.split("-");
  // Detect trailing year (4 digits)
  const yearMatch = parts[parts.length - 1].match(/^\d{4}$/);
  const year = yearMatch ? parts.pop() : null;
  const countries = parts.map(p => p.charAt(0).toUpperCase() + p.slice(1));
  const base = countries.join(" · ");
  return year ? `${base} ${year}` : base;
}

/**
 * Parse ISO dates from a dates value string like "2026-09-01 → 2026-09-14 (...)".
 * @param {string} value
 * @returns {{ start: string, end: string }}
 */
function parseDateRange(value) {
  const isoRe = /(\d{4}-\d{2}-\d{2})/g;
  const matches = [...(value ?? "").matchAll(isoRe)].map(m => m[1]);
  return { start: matches[0] ?? "", end: matches[1] ?? "" };
}

/**
 * Extract party count from metrics "Party" value string.
 * "2 (couple; wife in great shape) · 2 pax" → "2"
 * @param {string} value
 * @returns {string}
 */
function extractPartyCount(value) {
  const m = (value ?? "").match(/^(\d+)/);
  return m ? m[1] : value ?? "";
}

const GETTING_AROUND_CAPTION =
  /ground transport|airport transfer|activity transit|how to ride|octopus|getting around/i;

function isGettingAroundTable(table) {
  return GETTING_AROUND_CAPTION.test(table?.caption || "");
}

const TRANSPORT_INTRO =
  "Airport Express, MTR, Grab, and hotel cars — how to get to and from each airport and to the day’s activities.";

/**
 * Build per-day transit footnotes from airport-transfer + activity-transit tables.
 * @param {object[]} days
 * @param {object} transport
 * @returns {object[]}
 */
function attachTransitToDays(days, transport) {
  const tables = (transport?.tables ?? []).filter(t =>
    /airport transfer|activity transit/i.test(t.caption || "")
  );
  if (!tables.length) return days;

  const byDay = new Map();
  for (const table of tables) {
    const cols = table.columns ?? [];
    const dayIdx = cols.findIndex(c => /^day$/i.test(c));
    const routeIdx = cols.findIndex(c => /from|route|leg/i.test(c));
    const modeIdx = cols.findIndex(c => /mode|how/i.test(c));
    const timeIdx = cols.findIndex(c => /time|duration/i.test(c));
    const activityIdx = cols.findIndex(c => /^activity$/i.test(c));
    const isAirport = /airport transfer/i.test(table.caption || "");

    for (const row of table.rows ?? []) {
      const dayCell = String(row[dayIdx >= 0 ? dayIdx : 0] ?? "");
      const dayNums = [...dayCell.matchAll(/\d+/g)].map(m => parseInt(m[0], 10));
      const route = routeIdx >= 0 ? row[routeIdx] : "";
      const mode = modeIdx >= 0 ? row[modeIdx] : "";
      const time = timeIdx >= 0 ? row[timeIdx] : "";
      const activity = activityIdx >= 0 ? row[activityIdx] : "";
      const label = isAirport
        ? [route, mode, time].filter(Boolean).join(" · ")
        : [activity, route, mode, time].filter(Boolean).join(" · ");
      if (!label) continue;
      for (const n of dayNums) {
        if (!byDay.has(n)) byDay.set(n, []);
        byDay.get(n).push(label);
      }
    }
  }

  return days.map(day => {
    const lines = byDay.get(day.day);
    if (!lines?.length) return day;
    const existing = day.footnotes?.transit;
    return {
      ...day,
      footnotes: {
        ...day.footnotes,
        transit: existing || lines.join(" · ")
      }
    };
  });
}

/**
 * Build meta object from traveler-profile aspect data.
 * @param {string} slug
 * @param {object} profile
 * @returns {object}
 */
function buildMeta(slug, profile) {
  const metrics = profile?.metrics ?? [];
  const find = label => (metrics.find(m => m.label === label) ?? {}).value ?? "";

  const datesValue = find("Dates");
  const partyValue = find("Party");
  const budgetValue = find("Budget");

  const dates = parseDateRange(datesValue);
  const partyCount = extractPartyCount(partyValue);
  const title = humanizeSlug(slug);

  // Build subtitle from dates value and party count
  const subtitle = datesValue
    ? `${datesValue.split("(")[0].trim()} · ${partyCount} traveler${partyCount !== "1" ? "s" : ""}`
    : "";

  return {
    title,
    subtitle,
    dates,
    party: partyValue,
    budget: budgetValue,
    hero_image: profile?.meta?.hero_image ?? null,
  };
}

/**
 * Convert a structured parts[].days[] (with schedule[]) to normalized days[].
 * @param {object[]} parts
 * @returns {object[]}
 */
function daysFromParts(parts) {
  return parts.flatMap(part =>
    (part.days ?? []).map(day => ({
      day: day.day,
      title: day.title,
      location: day.location ?? "",
      events: (day.schedule ?? []).map(s => ({
        name: s.time ?? s.slot ?? "",
        lines: [s.activity ?? s.plan ?? ""].filter(Boolean),
      })),
      footnotes: {
        wow_moment: day.wow_moment ?? "",
        low_energy: day.low_energy ?? "",
        rainy_day: day.rainy_day ?? "",
        transit: day.transit ?? "",
      },
    }))
  );
}

/**
 * Load all *.json aspect files from pipeline/data/<slug>/ as a map keyed by aspect id.
 * @param {string} slug
 * @returns {Map<string, object>}
 */
function loadAspects(slug) {
  const dir = dataDir(slug);
  if (!existsSync(dir)) throw new Error(`Data dir not found: ${dir}`);

  const aspects = new Map();
  for (const file of readdirSync(dir)) {
    if (!file.endsWith(".json")) continue;
    const name = basename(file, ".json");
    if (name === "trip-site") continue;
    try {
      const data = JSON.parse(readFileSync(join(dir, file), "utf8"));
      // Index by both filename stem and data.aspect field (prefer aspect field)
      aspects.set(name, data);
      if (data.aspect && data.aspect !== name) {
        aspects.set(data.aspect, data);
      }
    } catch {
      // Skip unparseable files
    }
  }
  return aspects;
}

/**
 * Assemble the complete trip-site model for a given slug.
 * @param {string} slug
 * @returns {object} Trip-site model conforming to trip-site.schema.json
 */
export function assembleTripSite(slug) {
  const aspects = loadAspects(slug);

  // --- meta ---
  const profile = aspects.get("traveler-profile");
  const meta = buildMeta(slug, profile);

  // --- days ---
  const itinerary = aspects.get("04-master-itinerary");
  let days = [];
  if (itinerary) {
    if (Array.isArray(itinerary.parts) && itinerary.parts.length > 0 && Array.isArray(itinerary.parts[0].days)) {
      days = daysFromParts(itinerary.parts);
    } else {
      days = parseItineraryTables(itinerary);
    }
    days.sort((a, b) => a.day - b.day);
    days = attachTransitToDays(days, aspects.get("07-transport-money"));
  }

  // --- booking_queue ---
  const booking_queue = itinerary ? parseBookingQueue(itinerary) : [];

  // --- sections ---
  const mapsSection = buildMapsSection(slug, aspects);
  const sections = [
    ...(mapsSection ? [mapsSection] : []),
    ...SECTION_ASPECTS.filter(spec => aspects.has(spec.aspect)).map(spec => {
      const data = aspects.get(spec.aspect);
      const section = publishSection({
        id: spec.id,
        title: spec.title,
        aspect: spec.aspect,
        anchor: true,
        ...(data.intro != null && { intro: data.intro }),
        ...(data.tables != null && { tables: data.tables }),
        ...(data.bullets != null && { bullets: data.bullets }),
        ...(data.links != null && { links: data.links })
      });
      if (spec.id === "hotels") {
        const documents = listHotelInfoDocuments(slug, "hotels");
        if (documents.length) section.documents = documents;
      }
      if (spec.id === "flights") {
        const documents = listHotelInfoDocuments(slug, "flights");
        if (documents.length) section.documents = documents;
      }
      if (spec.id === "transport") {
        section.tables = (section.tables ?? []).filter(isGettingAroundTable);
        section.intro = TRANSPORT_INTRO;
      }
      return section;
    })
  ];

  return {
    trip: slug,
    generated_at: new Date().toISOString(),
    meta,
    booking_queue,
    days,
    sections,
    extra_pages: listExtraPages(slug)
  };
}

// --- CLI entry point ---
const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  const slug = process.argv[2];
  const doWrite = process.argv.includes("--write");

  if (!slug) {
    console.error("Usage: node assemble-trip-site.js <slug> [--write]");
    process.exit(1);
  }

  const site = assembleTripSite(slug);

  if (doWrite) {
    const outPath = join(dataDir(slug), "trip-site.json");
    writeFileSync(outPath, JSON.stringify(site, null, 2), "utf8");
    console.log(`Written → ${outPath}`);
  }

  console.log(`trip:     ${site.trip}`);
  console.log(`title:    ${site.meta.title}`);
  console.log(`subtitle: ${site.meta.subtitle}`);
  console.log(`days:     ${site.days.length}`);
  console.log(`sections: ${site.sections.length}`);
  console.log(`booking_queue: ${site.booking_queue.length} entries`);
  console.log(`generated_at: ${site.generated_at}`);
}
