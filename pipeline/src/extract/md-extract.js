// Deterministic markdown → canonical aspect JSON (Cursor/manual extraction path).
import { readFileSync } from "node:fs";
import { ROUTE_PRESETS, PROFILE_SEASON_PRESETS } from "./md-extract-presets.js";
import { enrichAspect } from "./aspect-enrich.js";
import { flightSnapshotFromTables } from "./flight-extract.js";

function stripFrontmatter(text) {
  if (!text.startsWith("---")) return text;
  const end = text.indexOf("\n---", 3);
  if (end === -1) return text;
  return text.slice(end + 4).trimStart();
}

function stripMd(s) {
  return s.replace(/\*\*/g, "").replace(/\[\[([^\]]+)\]\]/g, "$1").trim();
}

function parseTables(body) {
  const tables = [];
  const re = /(?:^|\n)((?:\|[^\n]+\|\n)+)/g;
  let m;
  while ((m = re.exec(body)) !== null) {
    const block = m[1].trim();
    const lines = block.split("\n").filter(l => l.includes("|"));
    if (lines.length < 2) continue;
    const split = line =>
      line.split("|").slice(1, -1).map(c => stripMd(c.trim()));
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

function parseBullets(body) {
  const bullets = [];
  const sections = body.split(/\n(?=###\s+)/);
  for (const sec of sections) {
    const headM = sec.match(/^###\s+(.+)/);
    if (!headM) continue;
    const items = [...sec.matchAll(/^[-*]\s+(.+)$/gm)].map(x => stripMd(x[1]));
    if (items.length) bullets.push({ heading: stripMd(headM[1]), items });
  }
  return bullets;
}

function firstParagraph(body) {
  const afterH1 = body.replace(/^#\s+.+\n+/, "");
  const para = afterH1.split(/\n\n+/).find(p => {
    const t = p.trim();
    return t && t !== "---" && !t.startsWith("#") && !t.startsWith("|");
  });
  return para ? stripMd(para.replace(/\n/g, " ")) : "";
}

function extractRouteOptimization(md, meta) {
  const body = stripFrontmatter(md);
  const preset = ROUTE_PRESETS[meta.trip] || ROUTE_PRESETS["japan-2026"];

  const rationaleM = body.match(/\*\*Rationale:\*\*\s*([\s\S]*?)(?=\n####|\n###|\n##|$)/);
  const openJawM = body.match(/\*\*Open-jaw\*\*:\s*([^\n]+)/i);
  const rationale = rationaleM
    ? stripMd(rationaleM[1].split("\n\n")[0])
    : openJawM
      ? stripMd(openJawM[1])
      : preset.rationale;

  const hubTable = parseTables(body).find(t =>
    t.columns.some(c => /days/i.test(c)) &&
    (t.columns.some(c => /hub|region|segment/i.test(c)) || t.rows.length > 0)
  );

  const hubs = (hubTable?.rows || []).map(row => {
    const cols = hubTable.columns;
    const get = name => {
      const i = cols.findIndex(c => new RegExp(name, "i").test(c));
      return i >= 0 ? row[i] : "";
    };
    let hub = get("segment|hub|region") || row[0];
    hub = stripMd(hub).replace(/Travel Day \d+\s*/i, "").trim();
    if (/^total$|^travel day/i.test(hub) || /departure$/i.test(hub) && !/đà nẵng|osaka|home/i.test(hub)) {
      if (/departure/i.test(hub)) {
        return { hub: "Home", days: get("days") || row[1] || "14", region: "Departure", primary_draw: preset.defaultHubs.at(-1)?.primary_draw || "" };
      }
      return null;
    }
    if (/beijing/i.test(hub)) hub = "Beijing";
    else if (/hanoi/i.test(hub)) hub = "Hanoi";
    else if (/đà nẵng|da nang|hội an|hoi an/i.test(hub)) hub = "Đà Nẵng / Hội An";
    else if (/tokyo/i.test(hub)) hub = "Tokyo";
    else if (/alps|takayama|kamikochi/i.test(hub)) hub = "Japanese Alps";
    else if (/kyoto/i.test(hub)) hub = "Kyoto";
    else if (/osaka/i.test(hub)) hub = "Osaka";

    const notes = get("notes|primary");
    return {
      hub,
      days: get("days") || row[1] || "",
      region: get("region|type") || row[2] || "",
      primary_draw: notes || row[3] || row[2] || ""
    };
  }).filter(Boolean);

  const uniqHubs = [];
  const seen = new Set();
  for (const h of hubs) {
    if (!h.hub?.trim()) continue;
    const key = h.hub.replace(/\s+/g, " ").toLowerCase();
    if (seen.has(key) || /travel day/i.test(h.hub)) continue;
    seen.add(key);
    uniqHubs.push(h);
  }

  const hubCoords = preset.hubCoords;
  const map_nodes = uniqHubs
    .filter(h => !/^home$/i.test(h.hub))
    .map(h => {
      const key = Object.keys(hubCoords).find(k => h.hub.includes(k) || k.includes(h.hub.split("/")[0].trim()));
      const c = hubCoords[key] || Object.values(hubCoords)[0];
      return {
        label: h.hub,
        mapLabel: c.mapLabel,
        marker: c.marker,
        lng: c.lng,
        lat: c.lat,
        color: c.color,
        labelDy: c.labelDy ?? -18,
        labelDx: c.labelDx
      };
    });

  const transitTable = parseTables(body).find(t =>
    t.columns.some(c => /leg|mode/i.test(c)) || (t.columns[0] && /home|beijing|hanoi/i.test(t.rows[0]?.[0] || ""))
  );
  let transit_legs = preset.defaultTransit;
  if (transitTable?.rows?.length) {
    const cols = transitTable.columns;
    const legIdx = cols.findIndex(c => /leg/i.test(c));
    const modeIdx = cols.findIndex(c => /mode/i.test(c));
    const timeIdx = cols.findIndex(c => /time|duration/i.test(c));
    if (legIdx >= 0 || modeIdx >= 0) {
      transit_legs = transitTable.rows.map(row => {
        const leg = legIdx >= 0 ? row[legIdx] : row[0];
        const parts = leg.split(/→|->/).map(s => stripMd(s));
        return {
          from: parts[0] || "Home",
          to: parts[1] || parts[0],
          mode: modeIdx >= 0 ? row[modeIdx] : "Transit",
          duration: timeIdx >= 0 ? row[timeIdx] : ""
        };
      });
    }
  }

  const summaryM = body.match(/Transit ratio[:\s]*([^\n]+)/i) ||
    body.match(/Transit vs Exploration Ratio[:\s]*([^\n]+)/i);
  const summaryMsg = summaryM ? stripMd(summaryM[1]) : "Transit ratio under 20% threshold";
  const flight_snapshot = flightSnapshotFromTables(body, parseTables(body));

  return {
    aspect: meta.id,
    type: "route-optimization",
    trip: meta.trip,
    title: meta.title,
    slide_title: "ROUTE OPTIMIZATION",
    recommended_route: {
      label: "Recommended Route (14 Days)",
      name: preset.name,
      rationale
    },
    hubs: uniqHubs.length ? uniqHubs : preset.defaultHubs,
    map_nodes: map_nodes.length ? map_nodes : preset.defaultHubs.filter(h => !/^home$/i.test(h.hub)).map(h => {
      const key = Object.keys(hubCoords).find(k => h.hub.includes(k));
      const c = hubCoords[key];
      return {
        label: h.hub,
        mapLabel: c.mapLabel,
        marker: c.marker,
        lng: c.lng,
        lat: c.lat,
        color: c.color,
        labelDy: c.labelDy ?? -18,
        labelDx: c.labelDx
      };
    }),
    map_bounds: preset.map_bounds,
    highlight_countries: preset.highlight_countries,
    country_labels: preset.country_labels,
    depart_node: preset.depart_node,
    transit_legs,
    flight_snapshot: flight_snapshot || undefined,
    summary: { message: summaryMsg }
  };
}

function findTable(tables, captionRe) {
  return tables.find(t => captionRe.test(t.caption || ""));
}

function fieldFromTable(table, fieldRe) {
  if (!table) return "";
  const row = table.rows.find(r => fieldRe.test(r[0] || ""));
  return row ? stripMd(row[1] || "") : "";
}

function parseValidations(body) {
  const valSec = body.match(/##\s+Validation\s+([\s\S]*?)(?=\n##|$)/);
  if (!valSec) return [];
  return [...valSec[1].matchAll(/^[-*]\s+\[[ xX]\]\s+(.+)$/gm)].map(m => {
    const text = stripMd(m[1])
      .replace(/\s*—?\s*\*\*PASS\*\*/gi, "")
      .replace(/\s*—?\s*PASS\s*$/i, "")
      .trim();
    const status = /fail|warn|unconfirmed|verify/i.test(text) ? "warn" : "pass";
    return { status, text };
  });
}

function profileValidations(body) {
  const fromChecks = parseValidations(body);
  if (fromChecks.length) return fromChecks;
  const constraints = body.match(/###\s+Key Planning Constraints\s+([\s\S]*?)(?=\n###|\n##|$)/i);
  if (!constraints) return [];
  return [...constraints[1].matchAll(/^\d+\.\s+(.+)$/gm)].map(m => ({
    status: /unconfirmed|verify/i.test(m[1]) ? "warn" : "pass",
    text: stripMd(m[1])
  }));
}

function rankedInterests(body) {
  const m = body.match(/###\s+Interests[\s\S]*?(?=\n###|\n##|$)/i);
  if (!m) return "";
  const items = [...m[0].matchAll(/^\d+\.\s+\*\*([^*]+)\*\*/gm)].map(x => stripMd(x[1]));
  return items.slice(0, 3).join(" · ");
}

function extractTravelerProfile(md, meta) {
  const body = stripFrontmatter(md);
  const h1 = body.match(/^#\s+(.+)/m);
  const title = meta.title || (h1 ? stripMd(h1[1]) : "Traveler Profile");
  const slideTitle = title.replace(/\s+/g, " ").toUpperCase();
  const preset = PROFILE_SEASON_PRESETS[meta.trip] || PROFILE_SEASON_PRESETS["japan-2026"];

  const tables = parseTables(body);
  const bullets = parseBullets(body);
  const core = findTable(tables, /core ident/i);
  const budgetTbl = findTable(tables, /^budget$/i);

  const countries = fieldFromTable(core, /countries/i);
  const window = fieldFromTable(core, /travel window|dates/i);
  const party = fieldFromTable(core, /party|companions/i);
  const totalBudget = fieldFromTable(budgetTbl, /^total$/i);
  const homeAirport =
    fieldFromTable(core, /home airport/i) ||
    (body.match(/home airport[:\s—-]+([A-Z]{3})\b/i)?.[1] || "");
  const passengers = fieldFromTable(core, /passengers/i);
  const cabin = fieldFromTable(core, /cabin/i);

  const physical = bullets.find(b => /physical/i.test(b.heading));
  const fitness = physical?.items?.[0] ? stripMd(physical.items[0]) : "See profile";

  const reasonSec = body.match(/##\s+Reasoning\s+([\s\S]*?)(?=\n##\s+Output|\n##\s|$)/);
  let intelText = "";
  if (reasonSec) {
    const paras = reasonSec[1]
      .split(/\n\n+/)
      .map(p => stripMd(p.replace(/\n/g, " ")))
      .filter(p => p && !p.startsWith("#") && !p.startsWith("-"));
    intelText = paras.slice(0, 2).join(" ");
  }
  if (!intelText) {
    const deal = findTable(tables, /deal-breaker/i);
    const dealRaw = deal?.rows?.[0] ? stripMd(deal.rows[0][1]) : "";
    const dealNote = dealRaw
      ? `Constraint: ${dealRaw.split(/[.;]/)[0].trim()}${dealRaw.length > 80 ? "…" : ""}.`
      : "";
    const dest = countries.replace(/\(.*\)/, "").trim();
    intelText = [
      `${party || "Traveler"} · ${dest || "Trip"} · ${(window || "").split(";")[0].trim()}.`,
      totalBudget ? `Budget ${totalBudget.split(";")[0]}.` : "",
      dealNote
    ]
      .filter(Boolean)
      .join(" ");
  }

  const countryLabel =
    preset.country_label ||
    (countries.includes("→")
      ? countries.replace(/\s*→\s*/g, " · ").toUpperCase()
      : countries.replace(/\(.*\)/, "").trim().toUpperCase() || "TRIP");

  const metrics = [
    { icon: "📍", label: "Destination", value: countries.replace(/\(.*\)/, "").trim() || "—" },
    { icon: "📅", label: "Dates", value: window || "—" },
    {
      icon: "👤",
      label: "Party",
      value: party
        ? `${party}${passengers ? ` · ${passengers} pax` : ""}`
        : passengers || "—"
    },
    { icon: "✈️", label: "Home airport", value: homeAirport || "—" },
    { icon: "💵", label: "Budget", value: totalBudget || "—" },
    { icon: "⭐", label: "Priorities", value: rankedInterests(body) || "—" },
    { icon: "💪", label: "Physical", value: fitness.split(";")[0] },
    ...(cabin ? [{ icon: "🎫", label: "Cabin", value: cabin }] : [])
  ];

  return {
    aspect: meta.id,
    type: "profile",
    trip: meta.trip || "japan-2026",
    title,
    slide_title: slideTitle,
    country_label: countryLabel,
    intelligence: { label: "Travel Intelligence", text: intelText },
    metrics,
    seasonality: {
      caption: "Seasonality scorecard",
      columns: preset.columns,
      rows: preset.rows,
      chosen_column: preset.chosen_column,
      summary: preset.summary
    },
    validations: profileValidations(body),
    intro: firstParagraph(body),
    tables: tables.slice(0, 6),
    bullets: bullets.slice(0, 8),
    callouts: []
  };
}

export function extractFromMarkdown(markdown, aspect) {
  const body = stripFrontmatter(markdown);
  const h1 = body.match(/^#\s+(.+)/m);
  const title = aspect.title || (h1 ? stripMd(h1[1]) : aspect.id);
  const slideTitle = title.replace(/\s+/g, " ").toUpperCase();

  if (aspect.type === "route-optimization") {
    return extractRouteOptimization(markdown, { id: aspect.id, trip: aspect.trip || "japan-2026", title });
  }

  if (aspect.type === "profile" || aspect.id === "traveler-profile") {
    return extractTravelerProfile(markdown, {
      id: aspect.id,
      trip: aspect.trip || "japan-2026",
      title
    });
  }

  const tables = parseTables(body);
  const bullets = parseBullets(body);
  let intro = firstParagraph(body);
  if (!intro && tables[0]?.caption) intro = `${title} — key planning details below.`;

  const callouts = [];
  const passM = body.match(/✅/g);
  if (passM?.length) {
    callouts.push({ status: "pass", text: `${passM.length} validation check(s) passed in source plan.` });
  }

  const base = {
    aspect: aspect.id,
    type: aspect.type || "generic",
    trip: aspect.trip || "japan-2026",
    title,
    slide_title: slideTitle,
    intro,
    tables: tables.slice(0, 6),
    bullets: bullets.slice(0, 8),
    callouts
  };

  return enrichAspect(base, body);
}

export function readTripFromFrontmatter(md, fallback) {
  const m = md.match(/^---[\s\S]*?^trip:\s*["']?([^"'\n]+)/m);
  return m ? m[1].trim() : fallback;
}
