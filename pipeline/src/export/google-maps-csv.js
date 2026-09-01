// Generate Google Maps import CSVs from trip sidecar markdown tables.
import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync, unlinkSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { REPO_ROOT, tripSourceDir } from "../discover.js";
import { resolveVenueAddress } from "../geo/venue-address-registry.js";
import { normalizeCityKey, cityFileSlug } from "../geo/venue-coords.js";

const SIDECARS = [
  { file: "shopping-comparison.md", category: "shopping", out: "shopping.csv" },
  { file: "hotel-comparison.md", category: "hotels", out: "hotels.csv" },
  { file: "restaurant-comparison.md", category: "restaurants", out: "restaurants.csv" },
  { file: "attractions-comparison.md", category: "attractions", out: "attractions.csv" },
  { file: "spa-comparison.md", category: "spas", out: "spas.csv" }
];

function stripMd(s) {
  return String(s || "")
    .replace(/\*\*/g, "")
    .replace(/\[\[([^\]]+)\]\]/g, "$1")
    .trim();
}

function colIdx(columns, re) {
  return (columns || []).findIndex(c => re.test(String(c).trim()));
}

function parseTables(body) {
  const tables = [];
  const re = /(?:^|\n)((?:\|[^\n]+\|\n)+)/g;
  let m;
  while ((m = re.exec(body)) !== null) {
    const lines = m[1].trim().split("\n").filter(l => l.includes("|"));
    if (lines.length < 2) continue;
    const split = line => line.split("|").slice(1, -1).map(c => stripMd(c.trim()));
    const rows = lines.slice(2).map(split).filter(r => r.some(Boolean));
    if (!rows.length) continue;
    let caption = "";
    const before = body.slice(Math.max(0, m.index - 400), m.index);
    const capM = before.match(/(?:^|\n)#{1,4}\s+(.+)\s*$/);
    if (capM) caption = stripMd(capM[1]);
    tables.push({ caption, columns: split(lines[0]), rows });
  }
  return tables;
}

function parseCitySections(body) {
  const sections = [];
  const parts = body.split(/\n(?=#{3,4}\s+)/);
  for (const part of parts) {
    const head = part.match(/^#{3,4}\s+(.+)/);
    if (!head) continue;
    const raw = stripMd(head[1]);
    const cityM =
      raw.match(/^City:\s*(.+)$/i) ||
      raw.match(/^(.+?)\s*\(\d{4}-\d{2}-\d{2}/) ||
      raw.match(/^(Hong Kong|Ho Chi Minh|HCMC|Hanoi|Đà Nẵng|Da Nang|Hội An|Beijing|Bangkok|Tokyo|Kyoto|Osaka|Chiang Mai|Koh Samui)/i);
    if (!cityM) continue;
    const city = stripMd(cityM[1]).replace(/\s*\(.*$/, "").trim();
    const tables = parseTables(part);
    if (tables.length) sections.push({ city, tables });
  }
  return sections;
}

function isDataTable(table) {
  const cap = table.caption || "";
  const cols = (table.columns || []).join(" ");
  if (/search log|desk research|total summary|lodging total|budget|scenario|mcp search/i.test(cap)) {
    return false;
  }
  if (/city\s*\|/i.test(cols) && /tool|query|status/i.test(cols)) return false;
  return true;
}

function csvEscape(value) {
  const s = String(value ?? "");
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function csvRow(fields) {
  return fields.map(csvEscape).join(",");
}

function loadTripAddressOverrides(trip) {
  const path = join(tripSourceDir(trip), "venue-addresses.json");
  if (!existsSync(path)) return [];
  try {
    const raw = JSON.parse(readFileSync(path, "utf8"));
    return Object.entries(raw).map(([pattern, address]) => ({
      pattern: new RegExp(pattern, "i"),
      address: String(address)
    }));
  } catch {
    return [];
  }
}

function rowValue(row, columns, re, fallbackIdx) {
  const i = colIdx(columns, re);
  if (i >= 0) return stripMd(row[i]);
  if (fallbackIdx !== undefined) return stripMd(row[fallbackIdx]);
  return "";
}

function shoppingRow(row, columns, city, extraRules) {
  const name =
    rowValue(row, columns, /district|market|spot|anchor|store|name/i, 0) || stripMd(row[0]);
  const category = rowValue(row, columns, /category|buy|type/i);
  const price = rowValue(row, columns, /price|budget/i);
  const notes = rowValue(row, columns, /note|fit|day|notes/i, row.length - 1);
  const description = [category, price, notes].filter(Boolean).join(" · ");
  const address =
    rowValue(row, columns, /address/i) ||
    resolveVenueAddress({ name, city, area: notes, extraRules });
  return { name, description, address };
}

function hotelRow(row, columns, city, extraRules) {
  const name = rowValue(row, columns, /hotel|property|name/i, 0) || stripMd(row[0]);
  const price = rowValue(row, columns, /price|night|rate/i);
  const area = rowValue(row, columns, /location|area|district/i);
  const rating = rowValue(row, columns, /rating|score|stars/i);
  const notes = rowValue(row, columns, /note|why|pros|comments/i, row.length - 1);
  const description = [price, area, rating, notes].filter(Boolean).join(" · ");
  const address =
    rowValue(row, columns, /address/i) ||
    resolveVenueAddress({ name, city, area, extraRules });
  return { name, description, address };
}

function restaurantRow(row, columns, city, extraRules) {
  const name = rowValue(row, columns, /restaurant|venue|name/i, 0) || stripMd(row[0]);
  const rating = rowValue(row, columns, /rating|score|stars/i);
  const reviews = rowValue(row, columns, /review/i);
  const price = rowValue(row, columns, /price/i);
  const cuisine = rowValue(row, columns, /cuisine|type|category/i);
  const notes = rowValue(row, columns, /note|why|pros|comments/i, row.length - 1);
  const description = [
    rating,
    reviews ? `${reviews} reviews` : "",
    price,
    cuisine,
    notes
  ]
    .filter(Boolean)
    .join(" · ");
  const address =
    rowValue(row, columns, /address/i) ||
    resolveVenueAddress({ name, city, area: cuisine, extraRules });
  return { name, description, address };
}

function attractionRow(row, columns, city, extraRules) {
  const name = rowValue(row, columns, /attraction|venue|place|name/i, 0) || stripMd(row[0]);
  const rating = rowValue(row, columns, /rating|score|stars/i);
  const reviews = rowValue(row, columns, /review/i);
  const type = rowValue(row, columns, /type|category/i);
  const notes = rowValue(row, columns, /note|why|pros|comments/i, row.length - 1);
  const description = [
    rating,
    reviews ? `${reviews} reviews` : "",
    type,
    notes
  ]
    .filter(Boolean)
    .join(" · ");
  const address =
    rowValue(row, columns, /address/i) ||
    resolveVenueAddress({ name, city, area: type, extraRules });
  return { name, description, address };
}

function spaRow(row, columns, city, extraRules) {
  const name = rowValue(row, columns, /spa|venue|name/i, 0) || stripMd(row[0]);
  const rating = rowValue(row, columns, /rating|score|stars/i);
  const price = rowValue(row, columns, /price|rate/i);
  const type = rowValue(row, columns, /type|treatment|category/i);
  const duration = rowValue(row, columns, /duration|length|time/i);
  const notes = rowValue(row, columns, /note|why|book|comments/i, row.length - 1);
  const description = [rating, price, type, duration, notes].filter(Boolean).join(" · ");
  const address =
    rowValue(row, columns, /address/i) ||
    resolveVenueAddress({ name, city, area: type, extraRules });
  return { name, description, address };
}

const ROW_BUILDERS = {
  shopping: shoppingRow,
  hotels: hotelRow,
  restaurants: restaurantRow,
  attractions: attractionRow,
  spas: spaRow
};

function looksLikeCategoryTable(table, category) {
  const cols = (table.columns || []).join(" ");
  switch (category) {
    case "shopping":
      return /district|market/i.test(cols) && /category|price|note/i.test(cols);
    case "hotels":
      return /hotel/i.test(cols) && /price|area|rating/i.test(cols);
    case "restaurants":
      return /restaurant/i.test(cols) && /rating|cuisine|price/i.test(cols);
    case "attractions":
      return /attraction/i.test(cols) && /rating|type|note/i.test(cols);
    case "spas":
      return /spa/i.test(cols) && /rating|price|type|duration|note/i.test(cols);
    default:
      return false;
  }
}

export function rowsFromSidecar(body, category, extraRules = []) {
  const build = ROW_BUILDERS[category];
  if (!build) return [];

  const rows = [];
  const seen = new Set();
  const sections = parseCitySections(body);

  for (const { city, tables } of sections) {
    for (const table of tables) {
      if (!isDataTable(table) || !looksLikeCategoryTable(table, category)) continue;
      for (const row of table.rows) {
        const item = build(row, table.columns, city, extraRules);
        if (!item.name) continue;
        const key = `${item.name}|${item.address}`.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        rows.push(item);
      }
    }
  }
  return rows;
}

export function toGoogleMapsCsv(rows) {
  const lines = ["Name,Description,Address"];
  for (const row of rows) {
    lines.push(csvRow([row.name, row.description, row.address]));
  }
  return `${lines.join("\n")}\n`;
}

export function exportGoogleMapsCsv(trip, { distDir } = {}) {
  const extraRules = loadTripAddressOverrides(trip);
  const tripDir = tripSourceDir(trip);
  const mapsDir = join(tripDir, "maps");
  mkdirSync(mapsDir, { recursive: true });

  const written = [];
  const cityBuckets = new Map();

  for (const { file, category, out } of SIDECARS) {
    const sidecarPath = join(tripDir, file);
    if (!existsSync(sidecarPath)) {
      console.log(`  [skip] ${out} — ${file} missing`);
      continue;
    }
    const body = readFileSync(sidecarPath, "utf8");
    const rows = rowsFromSidecar(body, category, extraRules);
    if (!rows.length) {
      console.log(`  [skip] ${out} — no rows parsed from ${file}`);
      continue;
    }

    const sections = parseCitySections(body);
    for (const { city, tables } of sections) {
      const build = ROW_BUILDERS[category];
      if (!build) continue;
      const bucketKey = normalizeCityKey(city);
      const bucket = cityBuckets.get(bucketKey) || [];
      const seen = new Set(bucket.map(r => `${r.name}|${r.address}`.toLowerCase()));
      const seenAddresses = new Set(bucket.map(r => r.address.toLowerCase()));
      for (const table of tables) {
        if (!isDataTable(table) || !looksLikeCategoryTable(table, category)) continue;
        for (const row of table.rows) {
          const item = build(row, table.columns, city, extraRules);
          if (!item.name) continue;
          const key = `${item.name}|${item.address}`.toLowerCase();
          const addrKey = item.address.toLowerCase();
          if (seen.has(key) || seenAddresses.has(addrKey)) continue;
          seen.add(key);
          seenAddresses.add(addrKey);
          const typeLabel =
            category === "hotels"
              ? /recommended/i.test(item.description)
                ? "Hotel · Recommended"
                : "Hotel"
              : category === "spas"
                ? "Spa"
                : category.charAt(0).toUpperCase() + category.slice(1, -1);
          bucket.push({
            name: item.name,
            description: `${typeLabel} · ${item.description}`,
            address: item.address
          });
        }
      }
      cityBuckets.set(bucketKey, bucket);
    }

    const csv = toGoogleMapsCsv(rows);
    const outPath = join(mapsDir, out);
    writeFileSync(outPath, csv, "utf8");
    written.push({ category, out, path: outPath, count: rows.length });

    if (distDir) {
      const distMaps = join(distDir, "maps");
      mkdirSync(distMaps, { recursive: true });
      const distPath = join(distMaps, out);
      copyFileSync(outPath, distPath);
      written[written.length - 1].distPath = distPath;
    }
  }

  for (const [cityKey, rows] of cityBuckets) {
    if (!rows.length) continue;
    const out = `${cityFileSlug(cityKey)}-all.csv`;
    const csv = toGoogleMapsCsv(rows);
    const outPath = join(mapsDir, out);
    writeFileSync(outPath, csv, "utf8");
    const entry = { category: "city-bundle", out, path: outPath, count: rows.length, city: cityKey };
    written.push(entry);
    if (distDir) {
      const distMaps = join(distDir, "maps");
      mkdirSync(distMaps, { recursive: true });
      const distPath = join(distMaps, out);
      copyFileSync(outPath, distPath);
      entry.distPath = distPath;
    }
  }

  // Remove stale city-bundle CSVs from prior slug logic (only when this run wrote bundles).
  if (cityBuckets.size) {
    const validBundles = new Set(
      [...cityBuckets.keys()].map(k => `${cityFileSlug(k)}-all.csv`)
    );
    for (const dir of [mapsDir, distDir ? join(distDir, "maps") : null].filter(Boolean)) {
      if (!existsSync(dir)) continue;
      for (const file of readdirSync(dir)) {
        if (file.endsWith("-all.csv") && !validBundles.has(file)) {
          unlinkSync(join(dir, file));
        }
      }
    }
  }

  return written;
}

export function exportGoogleMapsCsvForTrip(trip) {
  const distDir = join(REPO_ROOT, "pipeline", "dist", trip);
  return exportGoogleMapsCsv(trip, { distDir });
}
