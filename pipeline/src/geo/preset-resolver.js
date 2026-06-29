// Resolve route/geo presets: static registry → cached synthesis → build from opt markdown.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { ROUTE_PRESETS, PROFILE_SEASON_PRESETS } from "../extract/md-extract-presets.js";
import { REPO_ROOT, dataDir } from "../discover.js";

const MARKERS = "ABCDEFGHJKLMNPQRSTUVWXYZ".split("");
const COLORS = ["#c0392b", "#d4a017", "#27ae60", "#8e44ad", "#2980b9", "#e67e22"];

/** Common hub coordinates when opt-02 has no ### map_nodes table. */
const CITY_COORDS = {
  bangkok: { lng: 100.5018, lat: 13.7563 },
  "chiang mai": { lng: 98.9853, lat: 18.7883 },
  "koh samui": { lng: 100.0629, lat: 9.512 },
  samui: { lng: 100.0629, lat: 9.512 },
  krabi: { lng: 98.8259, lat: 8.0297 },
  "ao nang": { lng: 98.8259, lat: 8.0297 },
  tokyo: { lng: 139.6917, lat: 35.6895 },
  kyoto: { lng: 135.7681, lat: 35.0116 },
  osaka: { lng: 135.5023, lat: 34.6937 },
  beijing: { lng: 116.4074, lat: 39.9042 },
  hanoi: { lng: 105.8542, lat: 21.0285 },
  "da nang": { lng: 108.2022, lat: 16.0544 },
  "đà nẵng": { lng: 108.2022, lat: 16.0544 },
  "hội an": { lng: 108.329, lat: 15.877 },
  "hong kong": { lng: 114.1694, lat: 22.3193 },
  singapore: { lng: 103.8198, lat: 1.3521 },
  bali: { lng: 115.2191, lat: -8.6405 },
  seoul: { lng: 126.978, lat: 37.5665 },
  taipei: { lng: 121.5654, lat: 25.033 },
  paris: { lng: 2.3522, lat: 48.8566 },
  london: { lng: -0.1276, lat: 51.5074 },
  rome: { lng: 12.4964, lat: 41.9028 },
  lisbon: { lng: -9.1393, lat: 38.7223 },
  cairo: { lng: 31.2357, lat: 30.0444 },
  marrakech: { lng: -7.9811, lat: 31.6295 },
  sydney: { lng: 151.2093, lat: -33.8688 },
  lima: { lng: -77.0428, lat: -12.0464 },
  cusco: { lng: -71.9675, lat: -13.5319 },
  reykjavik: { lng: -21.9426, lat: 64.1466 }
};

const COUNTRY_GEO = {
  thailand: { highlight: "Thailand", label: "THAILAND", lng: 100.5, lat: 14.5 },
  japan: { highlight: "Japan", label: "JAPAN", lng: 137.5, lat: 36 },
  china: { highlight: "China", label: "CHINA", lng: 104.2, lat: 35.8 },
  vietnam: { highlight: "Vietnam", label: "VIETNAM", lng: 108.3, lat: 14.5 },
  "hong kong": { highlight: "Hong Kong", label: "HONG KONG", lng: 114.2, lat: 22.3 },
  singapore: { highlight: "Singapore", label: "SINGAPORE", lng: 103.8, lat: 1.35 },
  indonesia: { highlight: "Indonesia", label: "INDONESIA", lng: 118, lat: -2.5 },
  "south korea": { highlight: "South Korea", label: "SOUTH KOREA", lng: 127.5, lat: 36.5 },
  korea: { highlight: "South Korea", label: "SOUTH KOREA", lng: 127.5, lat: 36.5 },
  taiwan: { highlight: "Taiwan", label: "TAIWAN", lng: 121, lat: 23.7 },
  france: { highlight: "France", label: "FRANCE", lng: 2.5, lat: 46.5 },
  italy: { highlight: "Italy", label: "ITALY", lng: 12.5, lat: 42.5 },
  spain: { highlight: "Spain", label: "SPAIN", lng: -3.7, lat: 40.2 },
  portugal: { highlight: "Portugal", label: "PORTUGAL", lng: -8.5, lat: 39.5 },
  egypt: { highlight: "Egypt", label: "EGYPT", lng: 30.8, lat: 26.8 },
  morocco: { highlight: "Morocco", label: "MOROCCO", lng: -6, lat: 31.8 },
  australia: { highlight: "Australia", label: "AUSTRALIA", lng: 133.8, lat: -25.3 },
  peru: { highlight: "Peru", label: "PERU", lng: -75, lat: -9.2 },
  iceland: { highlight: "Iceland", label: "ICELAND", lng: -19, lat: 64.9 },
  greece: { highlight: "Greece", label: "GREECE", lng: 22.5, lat: 39.5 },
  turkey: { highlight: "Turkey", label: "TURKEY", lng: 35.2, lat: 39.1 },
  india: { highlight: "India", label: "INDIA", lng: 78.9, lat: 22.5 },
  mexico: { highlight: "Mexico", label: "MEXICO", lng: -102.5, lat: 23.6 },
  colombia: { highlight: "Colombia", label: "COLOMBIA", lng: -74.3, lat: 4.6 }
};

function stripMd(s) {
  return String(s || "")
    .replace(/\*\*/g, "")
    .replace(/\[\[([^\]]+)\]\]/g, "$1")
    .trim();
}

function parseTables(body) {
  const tables = [];
  const re = /(?:^|\n)((?:\|[^\n]+\|\n)+)/g;
  let m;
  while ((m = re.exec(body)) !== null) {
    const block = m[1].trim();
    const lines = block.split("\n").filter(l => l.includes("|"));
    if (lines.length < 2) continue;
    const split = line => line.split("|").slice(1, -1).map(c => stripMd(c.trim()));
    const header = split(lines[0]);
    const rows = lines.slice(2).map(split).filter(r => r.some(Boolean));
    if (!rows.length) continue;
    let caption = "";
    const before = body.slice(Math.max(0, m.index - 400), m.index);
    const capM = before.match(/(?:^|\n)#{1,4}\s+(.+)\s*$/);
    if (capM) caption = stripMd(capM[1]);
    tables.push({ caption, columns: header, rows });
  }
  return tables;
}

function colIdx(cols, re) {
  return cols.findIndex(c => re.test(c));
}

function readOptional(path) {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function lookupCity(hubName) {
  const norm = stripMd(hubName).toLowerCase();
  const head = norm.split(/[/,·]/)[0].trim();
  for (const [name, coords] of Object.entries(CITY_COORDS)) {
    if (head.includes(name) || name.includes(head)) return { ...coords };
  }
  return null;
}

function boundsFromNodes(nodes, pad = 2) {
  if (!nodes.length) return { west: -10, south: -10, east: 10, north: 10 };
  const lngs = nodes.map(n => n.lng);
  const lats = nodes.map(n => n.lat);
  const span = Math.max(Math.max(...lngs) - Math.min(...lngs), Math.max(...lats) - Math.min(...lats));
  const p = span < 5 ? 1.5 : span < 15 ? 3 : 8;
  return {
    west: Math.min(...lngs) - p,
    east: Math.max(...lngs) + p,
    south: Math.min(...lats) - p,
    north: Math.max(...lats) + p
  };
}

export function parseMapNodesFromMarkdown(body) {
  const idx = body.search(/###\s+map_nodes\b/i);
  if (idx === -1) return [];
  const section = body.slice(idx);
  const tbl = parseTables(section)[0];
  if (!tbl) return [];

  const li = colIdx(tbl.columns, /^label$/i);
  const mi = colIdx(tbl.columns, /marker/i);
  const lngi = colIdx(tbl.columns, /lng/i);
  const lati = colIdx(tbl.columns, /lat/i);
  const ci = colIdx(tbl.columns, /color/i);
  if (lngi < 0 || lati < 0) return [];

  return tbl.rows.map((row, i) => ({
    label: stripMd(row[li >= 0 ? li : 0]),
    marker: stripMd(row[mi >= 0 ? mi : 1]) || MARKERS[i % MARKERS.length],
    lng: parseFloat(row[lngi]),
    lat: parseFloat(row[lati]),
    color: stripMd(row[ci >= 0 ? ci : ""]) || COLORS[i % COLORS.length],
    labelDy: i % 2 ? 26 : -18
  })).filter(n => Number.isFinite(n.lng) && Number.isFinite(n.lat));
}

function parseHubsFromRoute(body) {
  const hubTable = parseTables(body).find(t =>
    t.columns.some(c => /days/i.test(c)) &&
    t.columns.some(c => /hub|region|segment/i.test(c))
  );
  if (!hubTable) return [];

  return hubTable.rows
    .map(row => {
      const cols = hubTable.columns;
      const get = re => {
        const i = cols.findIndex(c => re.test(c));
        return i >= 0 ? stripMd(row[i]) : "";
      };
      const hub = get(/hub|segment/i) || stripMd(row[0]);
      if (!hub || /^home$/i.test(hub) || /^total$/i.test(hub)) return null;
      return {
        hub,
        days: get(/days/i) || row[1] || "",
        region: get(/region/i) || row[2] || "",
        primary_draw: get(/primary|draw|notes/i) || row[3] || row[2] || ""
      };
    })
    .filter(Boolean);
}

function parseCountriesFromProfile(profileMd) {
  if (!profileMd) return [];
  const tables = parseTables(profileMd);
  const summary = tables.find(t =>
    t.columns.some(c => /attribute|field/i.test(c)) &&
    t.columns.some(c => /detail|value/i.test(c))
  );
  if (!summary) return [];

  const attrIdx = colIdx(summary.columns, /attribute|field/i);
  const valIdx = colIdx(summary.columns, /detail|value/i);
  const row = summary.rows.find(r => /countries/i.test(r[attrIdx]));
  if (!row) return [];

  const raw = stripMd(row[valIdx]).replace(/\(.*?\)/g, " ");
  return raw
    .split(/\s*(?:\+|→|&|,| and )\s*/i)
    .map(s => s.trim())
    .filter(Boolean)
    .map(s => s.replace(/\s+SAR$/i, "").trim());
}

function inferCountryGeo(countries, nodes) {
  const highlights = [];
  const labels = [];

  for (const c of countries) {
    const key = c.toLowerCase();
    const hit = Object.entries(COUNTRY_GEO).find(([k]) => key.includes(k) || k.includes(key));
    if (hit) {
      highlights.push(hit[1].highlight);
      labels.push({ name: hit[1].label, lng: hit[1].lng, lat: hit[1].lat });
    } else {
      const proper = c.replace(/\b\w/g, ch => ch.toUpperCase());
      highlights.push(proper);
      labels.push({ name: proper.toUpperCase(), lng: nodes[0]?.lng ?? 0, lat: nodes[0]?.lat ?? 0 });
    }
  }

  if (!highlights.length && nodes.length) {
    const b = boundsFromNodes(nodes, 0);
    const name = "DESTINATION";
    highlights.push(name);
    labels.push({ name, lng: (b.west + b.east) / 2, lat: (b.south + b.north) / 2 });
  }

  return { highlight_countries: highlights, country_labels: labels };
}

export function buildRouteName(hubs) {
  const names = hubs.filter(h => !/^home$/i.test(h.hub)).map(h => h.hub);
  if (!names.length) return "Multi-hub route";
  return `${names.join(" → ")} Open-Jaw`;
}

export function parseRouteLabel(profileMd, hubs = []) {
  const texts = profileMd ? [profileMd] : [];
  for (const text of texts) {
    const inline = text.match(/Travel days:\s*(\d+)/i);
    if (inline) return `Recommended Route (${inline[1]} Days)`;

    const tables = parseTables(text);
    const summary = tables.find(t => t.columns.some(c => /attribute|field/i.test(c)));
    if (summary) {
      const attrIdx = colIdx(summary.columns, /attribute|field/i);
      const valIdx = colIdx(summary.columns, /detail|value/i);
      const datesRow = summary.rows.find(r => /dates/i.test(r[attrIdx]));
      if (datesRow) {
        const val = stripMd(datesRow[valIdx]);
        const daysM =
          val.match(/(\d+)\s+calendar\s+days/i) ||
          val.match(/(\d+)\s+hub nights/i);
        if (daysM) return `Recommended Route (${daysM[1]} Days)`;
      }
    }
  }

  const home = hubs.find(h => /^home$/i.test(h.hub));
  const homeDays = String(home?.days || "").match(/\d+/g);
  if (homeDays?.length) {
    return `Recommended Route (${Math.max(...homeDays.map(Number))} Days)`;
  }
  const days = Math.max(hubs.filter(h => !/^home$/i.test(h.hub)).length + 2, 7);
  return `Recommended Route (${days} Days)`;
}

export function parseDepartNode(body, hubs) {
  const openJaw = body.match(/\*\*Open-jaw\*\*:\s*([^\n]+)/i);
  const flyOut = openJaw?.[1]?.match(/out\s+(?:of\s+)?\*\*([^*]+)\*\*/i);
  const iata = openJaw?.[1]?.match(/\(([A-Z]{3})\)/);
  const lastHub = [...hubs].reverse().find(h => !/^home$/i.test(h.hub));

  const from = flyOut?.[1]?.trim() || lastHub?.hub || "Final hub";
  const caption = iata ? `Depart (${iata[1]})` : `Depart (${from})`;
  return { from_label: from, caption };
}

function hubCoordsFromNodes(mapNodes) {
  const hubCoords = {};
  for (const n of mapNodes) {
    hubCoords[n.label] = {
      lng: n.lng,
      lat: n.lat,
      marker: n.marker,
      color: n.color,
      labelDy: n.labelDy ?? -18
    };
  }
  return hubCoords;
}

function nodesFromHubs(hubs) {
  const travelHubs = hubs.filter(h => !/^home$/i.test(h.hub));
  return travelHubs.map((h, i) => {
    const c = lookupCity(h.hub) || { lng: 0, lat: 0 };
    return {
      label: h.hub,
      marker: MARKERS[i % MARKERS.length],
      lng: c.lng,
      lat: c.lat,
      color: COLORS[i % COLORS.length],
      labelDy: i % 2 ? 26 : -18
    };
  }).filter(n => n.lng || n.lat);
}

export function synthesizeRoutePreset(trip, routeMarkdown, profileMarkdown = "") {
  const body = routeMarkdown.replace(/^---[\s\S]*?---\n?/, "");
  const profileMd =
    profileMarkdown || readOptional(join(REPO_ROOT, "trips", trip, "opt-01-traveler-profile.md"));

  const hubs = parseHubsFromRoute(body);
  let mapNodes = parseMapNodesFromMarkdown(body);
  if (!mapNodes.length) mapNodes = nodesFromHubs(hubs);

  const hubCoords = hubCoordsFromNodes(mapNodes);
  const countries = parseCountriesFromProfile(profileMd);
  const { highlight_countries, country_labels } = inferCountryGeo(countries, mapNodes);

  const openJawM = body.match(/\*\*Open-jaw\*\*:\s*([^\n]+)/i);
  const rationale = openJawM ? stripMd(openJawM[1]) : "Open-jaw route from trip planning.";

  return {
    route_label: parseRouteLabel(profileMd, hubs),
    name: buildRouteName(hubs),
    rationale,
    hubCoords,
    defaultHubs: hubs.length ? hubs : [],
    map_bounds: boundsFromNodes(mapNodes),
    highlight_countries,
    country_labels,
    depart_node: parseDepartNode(body, hubs),
    defaultTransit: []
  };
}

export function getCachedRoutePreset(trip) {
  if (ROUTE_PRESETS[trip]) return ROUTE_PRESETS[trip];
  const cachePath = join(dataDir(trip), "geo-preset.json");
  if (!existsSync(cachePath)) return null;
  try {
    const cached = JSON.parse(readFileSync(cachePath, "utf8"));
    return cached.trip === trip ? cached : null;
  } catch {
    return null;
  }
}

export function resolveRoutePreset(trip, routeMarkdown, { refresh = false } = {}) {
  if (ROUTE_PRESETS[trip]) return ROUTE_PRESETS[trip];

  const cachePath = join(dataDir(trip), "geo-preset.json");
  if (!refresh && existsSync(cachePath)) {
    try {
      const cached = JSON.parse(readFileSync(cachePath, "utf8"));
      if (cached.trip === trip && cached.hubCoords) return cached;
    } catch {
      /* regenerate */
    }
  }

  const preset = synthesizeRoutePreset(trip, routeMarkdown);
  mkdirSync(dataDir(trip), { recursive: true });
  writeFileSync(
    cachePath,
    JSON.stringify({ ...preset, trip, synthesized: true, synthesized_at: new Date().toISOString().slice(0, 10) }, null, 2),
    "utf8"
  );
  return preset;
}

export function parseSeasonScorecardFromProfile(body) {
  const tables = parseTables(body.replace(/^---[\s\S]*?---\n?/, ""));
  const tbl = tables.find(
    t =>
      /season fit scorecard/i.test(t.caption || "") ||
      (t.columns[0] && /factor/i.test(t.columns[0]) && t.columns.length >= 3)
  );
  if (!tbl) return null;

  const summaryM = body.match(/###\s+Season fit scorecard[^\n]*\n([\s\S]*?)(?=\n###|\n##|$)/i);
  let summary = "";
  if (summaryM) {
    const para = summaryM[1].split(/\n\n+/).find(p => p.trim() && !p.trim().startsWith("|"));
    if (para) summary = stripMd(para.replace(/\n/g, " "));
  }

  return {
    caption: tbl.caption || "Seasonality scorecard",
    columns: tbl.columns,
    rows: tbl.rows,
    chosen_column: Math.min(1, Math.max(0, tbl.columns.length - 2)),
    summary: summary || undefined
  };
}

export function resolveProfileSeason(trip, profileMarkdown) {
  const fromMd = parseSeasonScorecardFromProfile(profileMarkdown);
  if (fromMd) return fromMd;
  if (PROFILE_SEASON_PRESETS[trip]) return PROFILE_SEASON_PRESETS[trip];
  return {
    caption: "Seasonality scorecard",
    columns: ["", "Travel window", "Alternative"],
    rows: [["See trip profile", "—", "—"]],
    chosen_column: 1,
    summary: "Season data from traveler profile."
  };
}

export function parseCountriesLabel(profileMarkdown) {
  const countries = parseCountriesFromProfile(profileMarkdown);
  if (!countries.length) return null;
  if (countries.length === 1) return countries[0].toUpperCase();
  return countries.map(c => c.toUpperCase()).join(" · ");
}
