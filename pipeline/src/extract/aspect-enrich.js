// Map generic md-extract output → template-specific JSON fields.
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { ROUTE_PRESETS } from "./md-extract-presets.js";
import { attachShoppingMaps, buildDayPlanCities, buildHubMap } from "../geo/shopping-geo.js";
import { buildTripProximityMaps } from "../geo/venue-proximity.js";
import { enrichProximityWithGoogle } from "../geo/enrich-proximity-google.js";
import { getCachedRoutePreset } from "../geo/preset-resolver.js";
import { REPO_ROOT } from "../discover.js";
import { extractFlights } from "./flight-extract.js";
import { extractHotels } from "./hotel-extract.js";
import { extractVenues } from "./tripadvisor-extract.js";
import { extractShopping } from "./shopping-extract.js";
import { migrateDashboard } from "./fill-dashboard.js";

function stripMd(s) {
  return String(s || "")
    .replace(/\*\*/g, "")
    .replace(/\[\[([^\]]+)\]\]/g, "$1")
    .trim();
}

export function cleanIntro(intro) {
  if (!intro || intro === "---" || /^-+$/.test(intro.trim())) return null;
  return intro.replace(/^>\s*/, "").trim();
}

const TRIP_INTEL = {
  "china-vietnam-2026":
    "Hong Kong → Vietnam · Sept 1–14, 2026 · 3 adults · $30K all-in · Splurge in Vietnam · Priorities: shopping, food, nature, history.",
  "thailand-2026":
    "Thailand · Jul 25–Aug 8, 2026 · Couple · $30K all-in · Splurge Koh Samui resort · Priorities: shopping, food, nature, history · Avoid crowds & heat.",
  "japan-2026":
    "Japan solo · Late Jul–Aug 2026 · $5K · Nature · Food · History · Moderate pace."
};

const TRIP_ITINERARY_FOOTERS = {
  "china-vietnam-2026": "HKG in/out · HCMC · Đà Nẵng",
  "thailand-2026": "Open-jaw: BKK arrive · USM depart",
  "japan-2026": "Open-jaw: HND arrive · KIX depart"
};

const TRIP_FOOD_FOOTERS = {
  "china-vietnam-2026":
    "Book Da Dong Peking Duck and White Rose Restaurant in advance; use Grab/DiDi — avoid street taxis.",
  "thailand-2026":
    "Book Soul Food Mahanakorn and Huen Phen ahead; use Grab — avoid curbside taxis."
};

const TRIP_CLIMATE = {
  "thailand-2026": {
    caption: "July–August Climate",
    text: "Monsoon season: hot-humid 30–35°C; afternoon downpours; Gulf side (Samui) drier than Andaman.",
    note: "Dawn outdoor activities; AC breaks 11 AM–3 PM."
  },
  "china-vietnam-2026": {
    caption: "September Climate",
    text: "Beijing shoulder (20–26°C); Vietnam warm-humid with typhoon tail risk in central coast.",
    note: "Schedule outdoor Vietnam time early AM / evening."
  }
};

const ACCOMM_CITY_RE =
  /Hong Kong|Ho Chi Minh|HCMC|Beijing|Hanoi|Đà Nẵng|Da Nang|Hội An|Bangkok|Chiang Mai|Koh Samui|Samui/i;

function loadVenueSidecar(trip, sidecarFile) {
  if (!trip) return null;
  const path = join(REPO_ROOT, "trips", trip, sidecarFile);
  if (!existsSync(path)) return null;
  const body = readFileSync(path, "utf8");
  return extractVenues(body, parseTables(body));
}

function venuePickItems(picks) {
  return (picks || [])
    .filter(p => p.recommended?.name)
    .map(p => ({
      label: p.label.replace(/^City:\s*/i, "").trim(),
      value: [
        p.recommended.name,
        p.recommended.rating,
        p.recommended.reviews ? `${p.recommended.reviews} reviews` : "",
        p.recommended.price,
        p.recommended.notes
      ]
        .filter(Boolean)
        .join(" · ")
    }));
}

function attractionPanels(picks) {
  return (picks || []).map(p => ({
    heading: p.label.replace(/^City:\s*/i, "").trim(),
    items: (p.options || []).slice(0, 5).map(row => ({
      label: stripMd(row[0]),
      detail: [row[1], row[2], row[3], row[4]].filter(Boolean).map(stripMd).join(" · ")
    }))
  }));
}

function splitSections(body, re = /\n(?=###\s+)/) {
  return body.split(re).filter(s => s.trim());
}

function parseNumberedList(sec) {
  return [...sec.matchAll(/^\d+\.\s+\*\*([^*]+)\*\*\s*[—–-]\s*(.+)$/gm)].map(m => [
    stripMd(m[1]),
    stripMd(m[2]),
    ""
  ]);
}

function parseDayMetadata(block) {
  const wow = block.match(/\*\*Wow moment\*\*:\s*(.+)/i);
  const low = block.match(/\*\*Low energy[^*]*\*\*:\s*(.+)/i);
  const rain = block.match(/\*\*Rainy[- ]day[^*]*\*\*:\s*(.+)/i);
  const transit = block.match(/\*\*Transit[^*]*\*\*:\s*(.+)/i);
  return {
    wow_moment: wow ? stripMd(wow[1]) : "",
    low_energy: low ? stripMd(low[1]) : "",
    rainy_day: rain ? stripMd(rain[1]) : "",
    transit: transit ? stripMd(transit[1]) : ""
  };
}

function scheduleFromBlock(block) {
  const schedule = [];
  for (const m of block.matchAll(
    /^-\s+\*\*([^*]+)\*\*(?:\s*\([^)]*\))?\s*:\s*(.+)$/gm
  )) {
    const label = stripMd(m[1]);
    if (/morning|afternoon|evening|midday|arrive|transfer|flight|anchor/i.test(label)) {
      schedule.push({ time: label, activity: stripMd(m[2]) });
    }
  }
  const slotTbl = parseTablesInText(block).find(
    t =>
      (t.columns || []).some(c => /slot/i.test(c)) &&
      (t.columns || []).some(c => /plan/i.test(c))
  );
  if (slotTbl) {
    const slotI = slotTbl.columns.findIndex(c => /slot/i.test(c));
    const planI = slotTbl.columns.findIndex(c => /plan/i.test(c));
    for (const row of slotTbl.rows) {
      schedule.push({ time: stripMd(row[slotI]), activity: stripMd(row[planI]) });
    }
  }
  return schedule.slice(0, 6);
}

function parseItineraryDays(body) {
  const days = [];
  const blocks = body.split(/\n(?=#{3,4}\s+Day\s+)/).filter(b => /^#{3,4}\s+Day/.test(b));
  for (const block of blocks) {
    const head = block.match(/^#{3,4}\s+Day\s+(\d+)\s+[—–-]\s*(.+)$/m);
    if (!head) continue;
    const dayNum = parseInt(head[1], 10);
    const title = `Day ${dayNum} — ${stripMd(head[2])}`;
    const locM = block.match(/\*\*Location:\*\*\s*([^\n]+)/i);
    const meta = parseDayMetadata(block);
    days.push({
      day: dayNum,
      title,
      location: locM ? stripMd(locM[1]) : "",
      schedule: scheduleFromBlock(block),
      ...meta
    });
  }
  return days;
}

function parseItineraryDaysFromTables(tables) {
  const days = [];
  for (const t of tables) {
    const capM = (t.caption || "").match(/^Day\s+(\d+)\s+[—–-]\s*(.+)$/i);
    if (!capM) continue;
    const slotI = (t.columns || []).findIndex(c => /slot/i.test(c));
    const planI = (t.columns || []).findIndex(c => /plan/i.test(c));
    if (slotI < 0 || planI < 0) continue;
    days.push({
      day: parseInt(capM[1], 10),
      title: `Day ${capM[1]} — ${stripMd(capM[2])}`,
      location: "",
      schedule: t.rows
        .map(r => ({ time: stripMd(r[slotI]), activity: stripMd(r[planI]) }))
        .slice(0, 6),
      wow_moment: "",
      low_energy: "",
      rainy_day: "",
      transit: ""
    });
  }
  return days.sort((a, b) => a.day - b.day);
}

function chunkDays(days, size = 5, trip) {
  const parts = [];
  const footer = TRIP_ITINERARY_FOOTERS[trip] || "";
  for (let i = 0; i < days.length; i += size) {
    const slice = days.slice(i, i + size);
    const first = slice[0]?.day;
    const last = slice[slice.length - 1]?.day;
    parts.push({
      subtitle: first && last ? `Days ${first}–${last}` : "",
      footer: i + size >= days.length ? footer : "",
      featured_index: 0,
      next_segment:
        i + size < days.length
          ? `Next: Days ${days[i + size].day}–${Math.min(days[i + size].day + size - 1, days.at(-1).day)}`
          : "",
      days: slice
    });
  }
  return parts;
}

export function enrichFoodDining(base, body, tables) {
  const preset = getCachedRoutePreset(base.trip) || {
    defaultHubs: [],
    hubCoords: {},
    map_bounds: {},
    highlight_countries: []
  };
  const regions = [];
  for (const part of body.split(/\n(?=####\s+)/)) {
    const head = part.match(/^####\s+(.+)/);
    if (!head) continue;
    const label = stripMd(head[1]);
    const dishTable = parseTablesInText(part).find(t =>
      (t.columns || []).some(c => /dish/i.test(c))
    );
    if (!dishTable) continue;
    const hub = label.replace(/\s*\(\d+.*\)\s*$/, "").trim();
    const key = dishTable?.rows?.[0]?.[0] || "Local specialties";
    regions.push({
      hub,
      key_dish: stripMd(key),
      detail: dishTable?.rows?.[0]?.[3] || dishTable?.rows?.[0]?.[1] || "",
      neighborhoods: dishTable?.rows?.[0]?.[2] || ""
    });
  }
  if (!regions.length) {
    for (const sec of splitSections(body)) {
      const head = sec.match(/^###\s+(.+)/);
      if (!head) continue;
      const label = stripMd(head[1]);
      const dishTable = parseTables(sec).find(
        t =>
          /must-try|dishes|signature/i.test(t.caption || "") ||
          (t.columns || []).some(c => /dish/i.test(c))
      );
      if (!dishTable) continue;
      const hub =
        label
          .replace(/^(signature dishes|must-try|food|dining)\s*[-–—:]\s*/i, "")
          .replace(/\s*\([^)]+\)\s*$/, "")
          .trim() || label;
      const key = dishTable?.rows?.[0]?.[0] || "Local specialties";
      regions.push({
        hub,
        key_dish: stripMd(key),
        detail: dishTable?.rows?.[0]?.[3] || dishTable?.rows?.[0]?.[1] || "",
        neighborhoods: dishTable?.rows?.[0]?.[2] || ""
      });
    }
  }

  const mealTable = tables.find(
    t =>
      (t.columns || []).some(c => /breakfast/i.test(c)) ||
      /meal map/i.test(t.caption || "")
  );
  const dinnerI = mealTable
    ? (mealTable.columns || []).findIndex(c => /dinner/i.test(c))
    : -1;
  const days = (mealTable?.rows || []).map((row, i) => {
    const dayCell = row[0] || "";
    const dayM = dayCell.match(/Day\s*(\d+)/i) || dayCell.match(/^(\d+)\b/);
    const ctxM = dayCell.match(/\(([^)]+)\)/);
    const dinner =
      dinnerI >= 0 ? row[dinnerI] : row[3] || row[2] || row[row.length - 1] || "";
    let icon = "default";
    if (/pho|bún|banh/i.test(dinner)) icon = "pho";
    else if (/duck|peking/i.test(dinner)) icon = "beef";
    else if (/hotpot|resort|brunch/i.test(dinner)) icon = "ramen";
    else if (/seafood|white rose/i.test(dinner)) icon = "sushi";
    return {
      day: dayM ? parseInt(dayM[1], 10) : i + 1,
      context: ctxM ? stripMd(ctxM[1]) : stripMd(dayCell),
      strategy: stripMd(dinner),
      icon
    };
  });

  const budgetTbl = tables.find(t => /food budget/i.test(t.caption || ""));
  const diningItems = (budgetTbl?.rows || []).map(r => ({
    label: stripMd(r[0]),
    value: [r[1], r[2]].filter(Boolean).join(" — ")
  }));

  const footer =
    TRIP_FOOD_FOOTERS[base.trip] ||
    base.bullets?.find(b => /Hội An|splurge/i.test(b.heading || ""))?.items?.[0] ||
    TRIP_FOOD_FOOTERS["china-vietnam-2026"];

  const restaurantSidecar = loadVenueSidecar(base.trip, "restaurant-comparison.md");
  const venueItems = venuePickItems(restaurantSidecar?.picks);
  const mergedDiningItems = venueItems.length
    ? [...venueItems, ...diningItems]
    : diningItems;

  return {
    ...base,
    slide_title_accent: "STRATEGY",
    intro: cleanIntro(base.intro),
    profile_intelligence: {
      label: "Profile Intelligence",
      text: TRIP_INTEL[base.trip] || cleanIntro(base.intro) || base.title
    },
    dining_intelligence: mergedDiningItems.length
      ? { label: "Food & Dining Intelligence", items: mergedDiningItems }
      : undefined,
    venue_snapshot: restaurantSidecar
      ? {
          search_date: restaurantSidecar.search_date,
          kind: restaurantSidecar.kind,
          picks: restaurantSidecar.picks,
          venue_tables: restaurantSidecar.venue_tables
        }
      : undefined,
    regional: {
      subtitle: "Regional highlights",
      caption: "Regional",
      regions: regions.length
        ? regions
        : (preset.defaultHubs || []).slice(0, 3).map(h => ({
            hub: h.hub,
            key_dish: h.primary_draw?.split(",")[0] || h.hub,
            detail: h.primary_draw || "",
            neighborhoods: h.region || ""
          })),
      map_nodes: (preset.defaultHubs || [])
        .filter(h => !/^home$/i.test(h.hub))
        .map(h => {
          const key = Object.keys(preset.hubCoords).find(k => h.hub.includes(k));
          const c = preset.hubCoords[key] || Object.values(preset.hubCoords)[0];
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
      highlight_countries: preset.highlight_countries
    },
    meal_mapping: days.length
      ? { caption: "Day-by-Day Meal Mapping", days }
      : undefined,
    footer: stripMd(footer)
  };
}

export function enrichAccommodation(base, body, tables) {
  const budget =
    tables.find(t => /accommodation budget|budget summary|lodging total/i.test(t.caption || ""));
  const booking = tables.find(t => /booking (strategy|urgency)/i.test(t.caption || ""));
  const cross = tables.find(t => /cross-border/i.test(t.caption || ""));

  const districts = [];
  const pickCols = [];
  const hoodTbl = tables.find(t => /neighborhood strategy/i.test(t.caption || ""));
  if (hoodTbl) {
    const cityI = hoodTbl.columns.findIndex(c => /city/i.test(c));
    const areaI = hoodTbl.columns.findIndex(c => /area|neighborhood|recommended/i.test(c));
    const whyI = hoodTbl.columns.findIndex(c => /why|rationale/i.test(c));
    for (const row of hoodTbl.rows) {
      const city = stripMd(row[cityI >= 0 ? cityI : 0]);
      districts.push({
        caption: `${city} — Neighborhood`,
        columns: ["Factor", "Choice", "Why"],
        rows: [
          [
            "Neighborhood",
            stripMd(row[areaI >= 0 ? areaI : 1]),
            stripMd(row[whyI >= 0 ? whyI : 2] || "")
          ]
        ]
      });
    }
  }

  for (const sec of splitSections(body)) {
    const head = sec.match(/^###\s+(.+)/);
    if (!head) continue;
    const label = stripMd(head[1]);
    if (!ACCOMM_CITY_RE.test(label)) continue;
    const hoodM = sec.match(/\*\*Recommended neighborhood\*\*:\s*([^\n]+)/);
    const ratM = sec.match(/\*\*Rationale\*\*:\s*([^\n]+)/);
    if (hoodM && !districts.some(d => d.caption.startsWith(label.split("—")[0].trim()))) {
      districts.push({
        caption: `${label.split("—")[0].trim()} — Neighborhood`,
        columns: ["Factor", "Choice", "Why"],
        rows: [["Neighborhood", stripMd(hoodM[1]), ratM ? stripMd(ratM[1]) : ""]]
      });
    }
    const hotelTbl = parseTables(sec).find(t => /hotel|resort/i.test(t.caption || ""));
    if (hotelTbl?.rows?.length) {
      pickCols.push({
        heading: label.split("—")[0].trim(),
        subheading: hotelTbl.caption || "Top picks",
        items: hotelTbl.rows.slice(0, 4).map(r => ({
          property: stripMd(r[0]),
          area: stripMd(r[1]),
          price: stripMd(r[2]),
          why: stripMd(r[3])
        }))
      });
    }
  }

  for (const part of body.split(/\n(?=####\s+)/)) {
    const head = part.match(/^####\s+City:\s*(.+)/i);
    if (!head) continue;
    const city = stripMd(head[1]).replace(/\s*\(.*$/, "").trim();
    const hotelTbl = parseTablesInText(part).find(t =>
      (t.columns || []).some(c => /hotel|property/i.test(c))
    );
    if (!hotelTbl?.rows?.length) continue;
    const priceI = hotelTbl.columns.findIndex(c => /price|night/i.test(c));
    const areaI = hotelTbl.columns.findIndex(c => /area|district/i.test(c));
    const notesI = hotelTbl.columns.findIndex(c => /note|rating/i.test(c));
    pickCols.push({
      heading: city,
      subheading: "Rate snapshot",
      items: hotelTbl.rows.slice(0, 4).map(r => ({
        property: stripMd(r[0]),
        area: stripMd(r[areaI >= 0 ? areaI : 1]),
        price: stripMd(r[priceI >= 0 ? priceI : 1]),
        why: stripMd(r[notesI >= 0 ? notesI : hotelTbl.columns.length - 1])
      }))
    });
  }

  const picksTbl = tables.find(t => /recommended picks/i.test(t.caption || ""));
  if (picksTbl && !pickCols.length) {
    const cityI = picksTbl.columns.findIndex(c => /city/i.test(c));
    for (const row of picksTbl.rows) {
      pickCols.push({
        heading: stripMd(row[cityI >= 0 ? cityI : 0]),
        subheading: "Recommended",
        items: [
          {
            property: stripMd(row[1]),
            area: "",
            price: "",
            why: stripMd(row[2] || "")
          }
        ]
      });
    }
  }

  const tactics = (booking?.rows || []).map(r => ({
    tactic: stripMd(r[0]),
    why: stripMd(r.slice(1).join(" · "))
  }));

  const notes = (cross?.rows || []).map(r => `${stripMd(r[0])}: ${stripMd(r[1] || "")}`);
  const strategyIntro =
    base.trip === "thailand-2026"
      ? "4–5★ on US booking platforms; splurge Koh Samui resort."
      : "4–5★ on US booking platforms; splurge in Vietnam.";
  const defaultTactics =
    base.trip === "thailand-2026"
      ? [{ tactic: "Book Koh Samui resort first", why: "Aug peak — villa inventory limited" }]
      : [{ tactic: "Book Đà Nẵng resort now", why: "Sept shoulder fills beach properties" }];
  const accFooter =
    base.trip === "thailand-2026"
      ? "Monsoon season: book flexible cancellation; request high floor away from club soi."
      : "Typhoon season: book flexible cancellation for Đà Nẵng resort.";

  return {
    ...base,
    slide_title_accent: "STRATEGY",
    section_label: "Accommodation Strategy",
    section_kicker: "Budget Breakdown & Neighborhoods",
    intro: cleanIntro(base.intro),
    strategy: {
      title: "Accommodation",
      intro: strategyIntro,
      label: "Booking Strategy",
      tactics: tactics.length ? tactics : defaultTactics,
      notes
    },
    budget: budget
      ? { ...budget, caption: budget.caption || "Budget Breakdown", footnote: "Lodging only — flights separate." }
      : undefined,
    districts,
    top_picks: pickCols.length
      ? { caption: "Top Picks & Recommendations", columns: pickCols }
      : undefined,
    footer: base.bullets?.[0]?.items?.[0] || accFooter
  };
}

function parseItineraryDurationBanner(tables) {
  const overview = tables.find(t => /trip overview/i.test(t.caption || ""));
  if (!overview) return "";
  const fieldIdx = overview.columns.findIndex(c => /field/i.test(c));
  const valIdx = overview.columns.findIndex(c => /value/i.test(c));
  if (fieldIdx < 0 || valIdx < 0) return "";
  const row = overview.rows.find(r => /duration/i.test(stripMd(r[fieldIdx] || "")));
  return row ? stripMd(row[valIdx] || "") : "";
}

export function enrichMasterItinerary(base, body) {
  const tables = parseTables(body);
  let days = parseItineraryDays(body);
  if (!days.length) days = parseItineraryDaysFromTables(tables);
  const parts = chunkDays(days, 5, base.trip);
  const durationBanner = parseItineraryDurationBanner(tables);
  if (durationBanner && parts.length) {
    parts[0].duration_banner = durationBanner;
  }
  return {
    ...base,
    slide_title: "MASTER",
    slide_title_accent: "ITINERARY",
    intro: cleanIntro(base.intro),
    parts: parts.length ? parts : undefined,
    days: !parts.length && days.length ? days : undefined
  };
}

function parseTablesInText(text) {
  const tables = [];
  const re = /(?:^|\n)((?:\|[^\n]+\|\n)+)/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const lines = m[1].trim().split("\n").filter(l => l.includes("|"));
    if (lines.length < 2) continue;
    const split = line =>
      line.split("|").slice(1, -1).map(c => stripMd(c.trim()));
    tables.push({ columns: split(lines[0]), rows: lines.slice(2).map(split).filter(r => r.some(Boolean)) });
  }
  return tables;
}

function hubFromDaySpotBuyTable(t, meta) {
  const cols = t.columns || [];
  const dayI = cols.findIndex(c => /day/i.test(c));
  const spotI = cols.findIndex(c => /spot|window/i.test(c));
  const buyI = cols.findIndex(c => /buy/i.test(c));
  if (dayI < 0 || buyI < 0) return null;
  const rows = (t.rows || [])
    .map(r => [
      stripMd(r[dayI]),
      stripMd(r[spotI >= 0 ? spotI : dayI + 1]),
      stripMd(r[buyI])
    ])
    .filter(r => r.some(Boolean));
  if (!rows.length) return null;
  return {
    name: meta.name,
    days: meta.days || "",
    icon: meta.icon || "🛍",
    columns: ["Day", "Spot", "Buy"],
    rows
  };
}

function shoppingHubIcon(label) {
  if (/hong kong|🇭🇰/i.test(label)) return "🇭🇰";
  if (/guangzhou|guang zhou|🇨🇳/i.test(label)) return "🏯";
  if (/beijing/i.test(label)) return "🏮";
  if (/bangkok/i.test(label)) return "🏙";
  if (/chiang mai/i.test(label)) return "⛩";
  if (/koh samui|samui/i.test(label)) return "🏖";
  if (/hanoi/i.test(label)) return "☕";
  if (/hội an|hoi an/i.test(label)) return "🧵";
  if (/đà nẵng|da nang/i.test(label)) return "🏖";
  if (/tokyo/i.test(label)) return "🗼";
  if (/kyoto/i.test(label)) return "⛩";
  if (/osaka/i.test(label)) return "🐧";
  if (/takayama|alps/i.test(label)) return "🎎";
  return "🛍";
}

const SHOPPING_SECTION_SKIP =
  /luggage logic|country shopping order|shipping from|vat refund|customs duty|counterfeit risk|identify fake|safe shopping zones|receipt.*authentication|fabric quality tier|red flag|beijing tailoring|^nike$|^adidas$|^new balance$|^other brands$/i;

function parseRegionSectionHubs(body) {
  const hubs = [];
  for (const part of body.split(/\n(?=####\s+)/)) {
    const head = part.match(/^####\s+(.+)/);
    if (!head) continue;
    const label = stripMd(head[1]);
    if (SHOPPING_SECTION_SKIP.test(label)) continue;
    const t = parseTablesInText(part).find(tbl =>
      (tbl.columns || []).some(c => /day/i.test(c)) &&
      (tbl.columns || []).some(c => /spot|buy|window/i.test(c))
    );
    if (!t) continue;
    const hub = hubFromDaySpotBuyTable(t, {
      name: label.replace(/\s*\(.*\)\s*$/, "").trim(),
      days: label.match(/Days?\s*[\d–—-]+(?:\s*[–—-]\s*\d+)?/i)?.[0] || "",
      icon: shoppingHubIcon(label)
    });
    if (hub) hubs.push(hub);
  }
  return hubs;
}

function parseShoppingDayBlocks(body) {
  const secM = body.match(
    /###\s+Recommended Shopping Days Per City([\s\S]*?)(?=\n##\s|\n###\s+\d+\.|\n##\s+Validation|$)/i
  );
  const sec = secM ? secM[1] : "";
  const blocks = [];
  for (const part of sec.split(/\n(?=\*\*)/)) {
    const head = part.match(
      /\*\*([^*]+?)\s*[—–-]\s*Day[s]?\s*([^*()]+?)(?:\s*\(([^)]+)\))?\*\*/
    );
    if (!head) continue;
    const city = stripMd(head[1]);
    const days = stripMd(head[2]);
    const note = head[3] ? stripMd(head[3]) : "";
    const lines = [];
    for (const b of part.matchAll(
      /^-\s+((?:AM|PM)(?:\s+only)?|Midday|Morning|Afternoon|Budget):\s*(.+)$/gim
    )) {
      const kind = b[1].replace(/\s+only$/i, "").trim();
      lines.push({ kind, text: stripMd(b[2]) });
    }
    const plan = lines
      .filter(l => !/^budget$/i.test(l.kind))
      .map(l => `${l.kind}: ${l.text}`)
      .join(" · ");
    const budget = lines.find(l => /^budget$/i.test(l.kind))?.text || "";
    const spot =
      lines.find(l => /^(AM|Morning)$/i.test(l.kind))?.text?.split(/[—–(,]/)[0]?.trim() ||
      city;
    blocks.push({ city, days, note, plan, budget, spot: spot.slice(0, 72) });
  }
  return blocks;
}

function normalizeShoppingCity(city) {
  if (/hội an|hoi an|đà nẵng|da nang/i.test(city)) return "Hội An / Đà Nẵng";
  if (/beijing/i.test(city)) return "Beijing";
  if (/bangkok/i.test(city)) return "Bangkok";
  if (/chiang mai/i.test(city)) return "Chiang Mai";
  if (/koh samui|samui/i.test(city)) return "Koh Samui";
  if (/ho chi minh|hcmc|saigon/i.test(city)) return "Ho Chi Minh City";
  if (/hanoi/i.test(city)) return "Hanoi";
  if (/hong kong/i.test(city)) return "Hong Kong";
  if (/guangzhou/i.test(city)) return "Guangzhou";
  return city.trim();
}

function itineraryDayNum(cell) {
  const text = stripMd(cell).replace(/\*\*/g, "");
  const m = text.match(/Day\s*(\d+)/i) || text.match(/^\s*(\d+)\b/);
  return m ? Number(m[1]) : null;
}

function hubsFromCityShoppingMap(tables) {
  const mapTbl = tables.find(
    t =>
      /city shopping map|shopping map/i.test(t.caption || "") ||
      ((t.columns || []).some(c => /district|anchor/i.test(c)) &&
        (t.columns || []).some(c => /day assignment|day/i.test(c)))
  );
  if (!mapTbl) return [];
  const cityI = mapTbl.columns.findIndex(c => /^city$/i.test(c));
  const spotI = mapTbl.columns.findIndex(c => /district|anchor|spot/i.test(c));
  const dayI = mapTbl.columns.findIndex(c => /day assignment|day/i.test(c));
  const buyI = mapTbl.columns.findIndex(c => /viral|social|fit/i.test(c));
  const buckets = new Map();
  for (const row of mapTbl.rows) {
    const city = normalizeShoppingCity(stripMd(row[cityI >= 0 ? cityI : 0]));
    const spot = stripMd(row[spotI >= 0 ? spotI : 1]);
    const dayCell = stripMd(row[dayI >= 0 ? dayI : 2]);
    const dayNum = itineraryDayNum(dayCell);
    const dayLabel = dayNum != null ? String(dayNum) : dayCell.slice(0, 24);
    const buy = stripMd(row[buyI >= 0 ? buyI : 3] || spot);
    if (!buckets.has(city)) {
      buckets.set(city, {
        name: city,
        days: "",
        dayNums: [],
        icon: shoppingHubIcon(city),
        columns: ["Day", "Spot", "Buy"],
        rows: []
      });
    }
    const hub = buckets.get(city);
    hub.rows.push([dayLabel, spot, buy.slice(0, 120)]);
    if (dayNum != null) hub.dayNums.push(dayNum);
  }
  return [...buckets.values()].map(h => {
    const nums = h.dayNums;
    delete h.dayNums;
    if (nums.length) {
      const lo = Math.min(...nums);
      const hi = Math.max(...nums);
      h.days = lo === hi ? `Day ${lo}` : `Days ${lo}–${hi}`;
    }
    return h;
  });
}

function hubsFromDayBlocks(blocks) {
  const map = new Map();
  for (const b of blocks) {
    const name = normalizeShoppingCity(b.city);
    if (!map.has(name)) {
      map.set(name, {
        name: /hội an/i.test(name) ? "Hội An / Đà Nẵng" : name,
        days: "",
        icon: shoppingHubIcon(name),
        columns: ["Day", "Spot", "Buy"],
        rows: []
      });
    }
    const hub = map.get(name);
    const day = b.days.replace(/^Days?\s*/i, "").trim();
    hub.rows.push([day, b.spot, b.plan.slice(0, 140)]);
    const nums = [...`${hub.days} ${day}`.matchAll(/\d+/g)].map(Number);
    if (nums.length) {
      const lo = Math.min(...nums);
      const hi = Math.max(...nums);
      hub.days = lo === hi ? `Day ${lo}` : `Days ${lo}–${hi}`;
    }
  }
  return [...map.values()];
}

function gatewayShoppingHubs() {
  return [
    {
      name: "Hong Kong",
      days: "Days 1–2",
      icon: "🇭🇰",
      columns: ["Day", "Spot", "Buy"],
      rows: [
        ["1", "IFC · Landmark · Central", "Luxury watches, handbags, design shops"],
        ["2", "Stanley · Causeway Bay", "Markets, boutiques; authorized luxury only"]
      ]
    },
    {
      name: "Guangzhou",
      days: "Day 3",
      icon: "🏯",
      columns: ["Day", "Spot", "Buy"],
      rows: [["3", "Taikoo Hui · Beijing Road", "Fabric, value goods, local brands"]]
    }
  ];
}

function hubsFromTimingTable(tables) {
  const timing = tables.find(t =>
    (t.columns || []).some(c => /location/i.test(c)) && (t.columns || []).some(c => /buy/i.test(c))
  );
  const buckets = new Map();
  for (const row of timing?.rows || []) {
    const loc = stripMd(row[1] || row[0]);
    const buy = stripMd(row[2] || row[1]);
    const day = stripMd(row[0]).replace(/Days?\s*/i, "").trim();
    const name = normalizeShoppingCity(loc);
    if (!buckets.has(name)) {
      buckets.set(name, {
        name: /hội an|đà nẵng/i.test(loc) ? "Hội An / Đà Nẵng" : name,
        days: stripMd(row[0]),
        icon: shoppingHubIcon(loc),
        columns: ["Day", "Spot", "Buy"],
        rows: []
      });
    }
    buckets.get(name).rows.push([day, loc, buy]);
  }
  return [...buckets.values()];
}

function mergeShoppingHubs(existing, incoming) {
  const byName = new Map(existing.map(h => [h.name, { ...h, rows: [...(h.rows || [])] }]));
  for (const h of incoming) {
    if (byName.has(h.name)) {
      const cur = byName.get(h.name);
      const seen = new Set(cur.rows.map(r => r.join("|")));
      for (const r of h.rows || []) {
        const k = r.join("|");
        if (!seen.has(k)) {
          cur.rows.push(r);
          seen.add(k);
        }
      }
      if (!cur.days && h.days) cur.days = h.days;
    } else {
      byName.set(h.name, h);
    }
  }
  return [...byName.values()];
}

function layoutRegionalHubs(hubs, kicker = "Regional Shopping Hubs") {
  const list = hubs.filter(
    h => h?.rows?.length && !SHOPPING_SECTION_SKIP.test(h.name || "")
  );
  if (!list.length) return { kicker, left: [], right: null };
  const score = h => {
    const n = h.rows?.length || 0;
    const boost = /hội an|hoi an/i.test(h.name || "") ? 0.5 : 0;
    return n + boost;
  };
  const sorted = [...list].sort((a, b) => score(b) - score(a));
  const right = sorted[0];
  const left = sorted.slice(1);
  return { kicker, left, right };
}

export function enrichShopping(base, body, tables) {
  const spendM = body.match(/\*\*Spend priority\*\*:\s*([^\n]+)/);
  const footer = spendM
    ? stripMd(spendM[1])
    : base.trip === "thailand-2026"
      ? "Buy luxury in Bangkok; crafts in Chiang Mai; Samui = beach not retail."
      : "Prioritize tailoring and silk in Hội An (last stop before home).";

  const dayBlocks = parseShoppingDayBlocks(body);
  const day_plan = dayBlocks.length
    ? {
        kicker: "Recommended Shopping Days",
        columns: ["Day", "City", "Plan", "Budget"],
        rows: dayBlocks.map(b => [b.days, b.city, b.plan, b.budget]),
        cities: buildDayPlanCities(dayBlocks, base.trip)
      }
    : null;

  let hubs = parseRegionSectionHubs(body);
  hubs = mergeShoppingHubs(hubs, hubsFromDayBlocks(dayBlocks));
  hubs = mergeShoppingHubs(hubs, hubsFromCityShoppingMap(tables));

  if (base.trip === "china-vietnam-2026") {
    hubs = mergeShoppingHubs(gatewayShoppingHubs(), hubs);
  }

  if (!hubs.length || !dayBlocks.length) {
    hubs = mergeShoppingHubs(hubs, hubsFromTimingTable(tables));
  }

  const regional = attachShoppingMaps(layoutRegionalHubs(hubs), dayBlocks, base.trip);

  const matrix = tables.find(
    t =>
      /strength matrix|shopping strength|priority matrix/i.test(t.caption || "")
  );
  const strength_matrix = matrix
    ? {
        caption: matrix.caption || "Category winners by hub",
        columns: matrix.columns.filter(c => !/winner|best stop/i.test(c)),
        rows: (matrix.rows || []).map(r => r.slice(0, matrix.columns.length - 1))
      }
    : null;

  const tailors = tables.find(t => /recommended tailors/i.test(t.caption || ""));
  const bangkokTailor = tables.find(t => /bangkok tailoring|tailoring protocol/i.test(t.caption || ""));
  const turnaround = tables.find(t => /turnaround/i.test(t.caption || ""));
  const redFlags = tables.find(t => /red flag|authenticity|scam/i.test(t.caption || ""));
  const fittingM = body.match(/\*\*Fitting protocol\*\*:\s*([^\n]+)/);
  const timelineM = body.match(
    /Day\s*10\s+consultation[^.\n]+(?:\.[^.\n]+)?(?:\.[^.\n]+)?/i
  );

  let tailoring = null;
  if (tailors) {
    tailoring = {
      kicker: "Hội An tailoring",
      map: buildHubMap(
        {
          name: "Hội An",
          rows: [
            ["10", "Ancient Town tailors", "Yaly · A Dong · Bebe"],
            ["11", "Fitting district", "Second fitting"],
            ["12", "Pickup", "Final alterations"]
          ]
        },
        base.trip
      ),
      timeline: timelineM
        ? stripMd(timelineM[0])
        : "Day 10 measure → Day 11 fitting → Day 12 pickup",
      protocol: fittingM ? stripMd(fittingM[1]) : "",
      tailors: {
        caption: tailors.caption || "Recommended tailors",
        columns: tailors.columns,
        rows: (tailors.rows || []).slice(0, 5)
      },
      turnaround: turnaround
        ? {
            caption: turnaround.caption || "Turnaround",
            columns: turnaround.columns,
            rows: (turnaround.rows || []).slice(0, 5)
          }
        : null,
      red_flags: (redFlags?.rows || []).slice(0, 4).map(r => [stripMd(r[0]), stripMd(r[1])])
    };
  } else if (bangkokTailor) {
    const steps = bangkokTailor.rows.map(r => `${stripMd(r[0])}: ${stripMd(r[1])}`);
    tailoring = {
      kicker: "Bangkok tailoring",
      timeline: steps.slice(0, 4).join(" → "),
      protocol: steps.find(s => /fitting/i.test(s)) || "",
      tailors: {
        caption: bangkokTailor.caption || "Bangkok tailoring protocol",
        columns: bangkokTailor.columns,
        rows: (bangkokTailor.rows || []).slice(0, 6)
      },
      turnaround: turnaround
        ? {
            caption: turnaround.caption || "Turnaround",
            columns: turnaround.columns,
            rows: (turnaround.rows || []).slice(0, 5)
          }
        : null,
      red_flags: (redFlags?.rows || []).slice(0, 4).map(r => [stripMd(r[0]), stripMd(r[1])])
    };
  }

  return {
    ...base,
    slide_title: "SHOPPING",
    slide_title_accent: "HUBS",
    section_kicker: "Regional Shopping Hubs",
    intro: cleanIntro(base.intro),
    regional,
    day_plan,
    strength_matrix,
    tailoring,
    footer
  };
}

function cultureHubIcon(label) {
  if (/bangkok/i.test(label)) return "🏙";
  if (/chiang mai/i.test(label)) return "⛩";
  if (/koh samui|samui/i.test(label)) return "🏖";
  if (/beijing/i.test(label)) return "🏯";
  if (/hanoi/i.test(label)) return "⛩";
  if (/hội an|hoi an|đà nẵng/i.test(label)) return "🏮";
  return "🏛";
}

export function enrichCulture(base, body, tables) {
  const hubs = [];
  const calTbl = tables.find(t =>
    /cultural calendar|one anchor per day/i.test(t.caption || "")
  );
  if (calTbl) {
    const dayI = calTbl.columns.findIndex(c => /^day$/i.test(c));
    const cityI = calTbl.columns.findIndex(c => /city/i.test(c));
    const siteI = calTbl.columns.findIndex(c => /anchor|site/i.test(c));
    const rainI = calTbl.columns.findIndex(c => /rain|backup/i.test(c));
    const hubMap = new Map();
    for (const row of calTbl.rows) {
      const city = stripMd(row[cityI >= 0 ? cityI : 2]);
      if (!city || city === "—") continue;
      if (!hubMap.has(city)) {
        hubMap.set(city, {
          name: city,
          days: "",
          icon: cultureHubIcon(city),
          columns: ["Day", "Site", "Note"],
          rows: []
        });
      }
      const dayNum = stripMd(row[dayI >= 0 ? dayI : 0]);
      hubMap.get(city).rows.push([
        `Day ${dayNum}`,
        stripMd(row[siteI >= 0 ? siteI : 3]),
        rainI >= 0 ? stripMd(row[rainI]) : ""
      ]);
    }
    for (const h of hubMap.values()) {
      const nums = h.rows.flatMap(r => [...r[0].matchAll(/\d+/g)].map(m => Number(m[0])));
      if (nums.length) {
        const lo = Math.min(...nums);
        const hi = Math.max(...nums);
        h.days = lo === hi ? `Day ${lo}` : `Days ${lo}–${hi}`;
      }
      hubs.push({ ...h, rows: h.rows.slice(0, 5) });
    }
  }

  for (const sec of splitSections(body)) {
    const head = sec.match(/^###\s+(.+)/);
    if (!head) continue;
    const label = stripMd(head[1]);
    if (/cross-trip|fatigue|social vs|distilled|deep history|cultural transition|language|diy|booking/i.test(label)) {
      continue;
    }
    if (!/CHINA|VIETNAM|BEIJING|HANOI|HỘI|Bangkok|Chiang Mai|Koh Samui/i.test(label)) {
      continue;
    }
    const rows = [];
    for (const m of sec.matchAll(/\*\*Day\s*(\d+)[^*]*\*\*:\s*([^\n]+)/g)) {
      rows.push([`Day ${m[1]}`, stripMd(m[2]), ""]);
    }
    if (!rows.length) {
      const bullets = [...sec.matchAll(/^-\s+\*\*([^*]+)\*\*:\s*(.+)$/gm)].slice(0, 4);
      bullets.forEach(b => rows.push([stripMd(b[1]), stripMd(b[2]), ""]));
    }
    if (!rows.length) continue;
    hubs.push({
      name: label.split("—")[0].trim(),
      days: label.match(/Day\s*\d+/i)?.[0] || "",
      icon: cultureHubIcon(label),
      columns: ["Day", "Site", "Note"],
      rows: rows.slice(0, 5),
      highlights: [],
      note: ""
    });
  }

  const fatigue = tables.find(t => /fatigue|museum/i.test(t.caption || ""));
  const facts = [...body.matchAll(/^(\d+)\.\s+(.+)$/gm)]
    .filter(m => /Bangkok|Chiang Mai|Maritime|Lanna|Krung/i.test(m[2]))
    .slice(0, 3)
    .map(m => stripMd(m[2]));

  const attractionsSidecar = loadVenueSidecar(base.trip, "attractions-comparison.md");
  const attractionPicks = attractionsSidecar?.picks || [];
  const spotlightItems = attractionPicks.slice(0, 3).map(p => ({
    label: p.recommended?.name || p.label,
    detail: [
      p.recommended?.rating,
      p.recommended?.reviews ? `${p.recommended.reviews} reviews` : "",
      p.recommended?.category,
      p.recommended?.notes
    ]
      .filter(Boolean)
      .join(" · ")
  }));

  const philosophyItems =
    base.trip === "thailand-2026"
      ? [
          { rule: "One anchor site per day", why: "Avoid temple fatigue; match relaxed pace", icon: "🎯" },
          { rule: "Dawn entry for outdoor sites", why: "Beat monsoon heat and tour groups", icon: "🌅" },
          { rule: "AC museum backup ready", why: "Afternoon downpours Jul–Aug", icon: "☔" }
        ]
      : [
          { rule: "One anchor site per day", why: "Avoid museum fatigue; match relaxed pace", icon: "🎯" },
          { rule: "Book timed entry online", why: "Forbidden City and major sites sell out", icon: "🎫" },
          { rule: "Early entry beats crowds", why: "Deal-breaker: large crowds", icon: "🌅" }
        ];

  const cultureFooter =
    base.trip === "thailand-2026"
      ? "Grand Palace: modest dress; Jim Thompson House book 1–3 days ahead; Ang Thong tour 2 weeks pre-trip."
      : "Forbidden City tickets at pm.com.cn; Mutianyu over Badaling for crowds.";

  return {
    ...base,
    slide_title: "CULTURE & MUSEUMS",
    slide_title_accent: "MUSEUMS",
    section_label: "Culture Strategy",
    section_kicker: "Sites · Crowd timing · Cross-hub transitions",
    intro: cleanIntro(base.intro),
    philosophy: {
      caption: "Culture Philosophy",
      items: philosophyItems
    },
    themes: {
      caption: "Cross-Hub Themes",
      items: facts.length ? facts : ["Imperial history → UNESCO towns → beach wind-down"]
    },
    fatigue_audit: fatigue || {
      caption: "Museum Fatigue Audit",
      columns: ["Hub", "Sites/day", "Verdict"],
      rows: hubs.map(h => [h.name, String(h.rows.length), "OK"]),
      verdict: "Pace is moderate — no marathon museum days",
      verdict_status: "pass"
    },
    hubs,
    spotlight: spotlightItems.length
      ? {
          caption: "TripAdvisor Attraction Picks",
          columns: [{ heading: "Recommended", items: spotlightItems }]
        }
      : undefined,
    venue_snapshot: attractionsSidecar
      ? {
          search_date: attractionsSidecar.search_date,
          kind: attractionsSidecar.kind,
          picks: attractionsSidecar.picks,
          venue_tables: attractionsSidecar.venue_tables
        }
      : undefined,
    footer: cultureFooter
  };
}

export function enrichHiddenGems(base, body, tables) {
  const attractionsSidecar = loadVenueSidecar(base.trip, "attractions-comparison.md");
  const panels = attractionPanels(attractionsSidecar?.picks);
  const sidebar = (base.sidebar || []).length
    ? base.sidebar
    : panels.length
      ? [{ heading: "TripAdvisor hidden picks", items: panels.map(p => p.heading) }]
      : [];

  return {
    ...base,
    intro: cleanIntro(base.intro),
    banner: base.banner || {
      text: attractionsSidecar?.search_date
        ? `Hidden gems · TripAdvisor search ${attractionsSidecar.search_date}`
        : "Hidden gems · local favorites filtered for itinerary fit"
    },
    sidebar,
    panels: panels.length ? panels : base.panels || [],
    venue_snapshot: attractionsSidecar
      ? {
          search_date: attractionsSidecar.search_date,
          kind: attractionsSidecar.kind,
          picks: attractionsSidecar.picks,
          venue_tables: attractionsSidecar.venue_tables
        }
      : undefined
  };
}

export function enrichPacking(base, body, tables) {
  const essentialsBold = [...body.matchAll(/^\d+\.\s+\*\*([^*]+)\*\*\s*[—–-]?\s*(.*)$/gm)]
    .slice(0, 15)
    .map((m, i) => ({
      n: i + 1,
      label: stripMd(m[1]),
      detail: stripMd(m[2]),
      icon: /passport|visa/i.test(m[1]) ? "📄" : /VPN|eSIM/i.test(m[1]) ? "📱" : "✓"
    }));
  const essentialsPlain = [...body.matchAll(/^\d+\.\s+([^*\n].+)$/gm)]
    .filter(m => !/^\d+\.\s+\*\*/.test(m[0]))
    .slice(0, 15)
    .map((m, i) => ({
      n: i + 1,
      label: stripMd(m[1]),
      detail: "",
      icon: /passport|visa/i.test(m[1]) ? "📄" : /eSIM|phone/i.test(m[1]) ? "📱" : "✓"
    }));
  const essentials = essentialsBold.length ? essentialsBold : essentialsPlain;

  const docTbl = tables.find(t => /document folder|section/i.test(t.caption || ""));
  const transitTbl = tables.find(t => /border-crossing day bag|flight day bag/i.test(t.caption || ""));
  const healthTbl = tables.find(t => /health kit/i.test(t.caption || ""));
  const luggageTbl = tables.find(t => /luggage recommendation/i.test(t.caption || ""));

  const checklistSecs = [...body.matchAll(/\*\*([^*]+)\*\*\n([\s\S]*?)(?=\n\*\*|\n---|\n###|$)/g)]
    .filter(m => /documents|electronics|clothing|health|misc/i.test(m[1]));

  const climate = TRIP_CLIMATE[base.trip] || TRIP_CLIMATE["china-vietnam-2026"];
  const luggageNote =
    base.trip === "thailand-2026"
      ? "Pack foldable duffel for Bangkok tailoring return."
      : "Pack foldable duffel for Hội An tailoring return.";
  const packingFooter =
    base.trip === "thailand-2026"
      ? "Temple modesty kit in daypack; reef shoes for Samui; hydrate in monsoon heat."
      : "VPN must be installed before China entry; never check prescriptions.";

  return {
    ...base,
    slide_title_accent: "STRATEGY",
    section_label: "Do Not Forget",
    section_kicker: "Climate · Gear · Border-day carry-on",
    intro: cleanIntro(base.intro),
    climate,
    essentials: essentials.length
      ? { caption: "Core Do Not Forget", items: essentials }
      : undefined,
    documents: docTbl
      ? {
          caption: docTbl.caption || "Document Folder",
          sections: docTbl.rows.map(r => ({
            heading: stripMd(r[0]),
            items: [stripMd(r[1] || "")]
          }))
        }
      : undefined,
    wardrobe: tables.find(t => /wardrobe|clothing|hub-specific gear|temple modesty|monsoon/i.test(t.caption || "")) || {
      caption: base.trip === "thailand-2026" ? "Thailand Wardrobe" : "China & Vietnam Wardrobe",
      columns: ["Item", "Why"],
      rows: (base.bullets?.find(b => /China|Thailand|clothing/i.test(b.heading))?.items || [])
        .slice(0, 6)
        .map(i => {
          const p = i.split(/:\s*/);
          return [stripMd(p[0]), stripMd(p.slice(1).join(": "))];
        })
    },
    tech: tables.find(t => /tech|battery/i.test(t.caption || "")),
    health: healthTbl,
    transit_bag: transitTbl
      ? { caption: transitTbl.caption || "Border-Crossing Day Bag", ...transitTbl }
      : undefined,
    flight_outfit: tables.find(t => /border-crossing outfit/i.test(t.caption || "")),
    luggage: luggageTbl
      ? {
          caption: "Luggage Strategy",
          bags: luggageTbl.rows.slice(0, 3).map(r => ({
            icon: "🧳",
            name: stripMd(r[0]),
            role: stripMd(r.slice(1).join(" — "))
          })),
          note: luggageNote
        }
      : undefined,
    checklist: checklistSecs.length
      ? {
          caption: "Printable Checklist Highlights",
          categories: checklistSecs.map(m => ({
            heading: stripMd(m[1]),
            items: [...m[2].matchAll(/^-\s+\[\s*\]\s+(.+)$/gm)].map(x => stripMd(x[1]))
          }))
        }
      : undefined,
    footer: packingFooter
  };
}

function parseEtiquetteNorms(sec) {
  const bold = parseNumberedList(sec);
  if (bold.length) return bold;
  return [...sec.matchAll(/^\d+\.\s+\*\*([^*]+)\*\*\s*[—–-]\s*(.+)$/gm)].map(m => [
    stripMd(m[1]),
    stripMd(m[2]),
    ""
  ]);
}

export function enrichEtiquette(base, body, tables) {
  const chinaSec = body.match(/###\s+CHINA[\s\S]*?(?=\n###\s+VIETNAM|$)/);
  const vietSec = body.match(/###\s+VIETNAM[\s\S]*/);
  const thaiSec = body.match(/###\s+Thailand[\s\S]*?(?=\n###\s+Hub|$)/i);
  const dailySec = thaiSec?.[0].match(/####\s+Daily etiquette[\s\S]*?(?=\n####|$)/i);

  const chinaNorms = chinaSec ? parseNumberedList(chinaSec[0]) : [];
  const vietNorms = vietSec ? parseNumberedList(vietSec[0]) : [];
  const thaiNorms = dailySec ? parseEtiquetteNorms(dailySec[0]) : [];
  const dailyRows = thaiNorms.length
    ? thaiNorms.slice(0, 10)
    : [...chinaNorms.slice(0, 6), ...vietNorms.slice(0, 4)].map(r => [r[0], r[1], ""]);

  const phraseTbls = tables.filter(t =>
    (t.columns || []).some(c => /phrase|english/i.test(c)) &&
    (t.columns || []).some(c => /pronunciation|romanized|thai|mandarin|vietnamese/i.test(c))
  );
  const phraseRows = phraseTbls.flatMap(t => {
    const whenI = t.columns.findIndex(c => /when/i.test(c));
    const pronI = t.columns.findIndex(c => /pronunciation|romanized|thai|mandarin|vietnamese/i.test(c));
    const meaningI = t.columns.findIndex(c => /meaning/i.test(c));
    return (t.rows || []).map(r => [
      stripMd(r[0]),
      stripMd(r[pronI >= 0 ? pronI : 1]),
      whenI >= 0 ? stripMd(r[whenI]) : "",
      meaningI >= 0 ? stripMd(r[meaningI]) : stripMd(r[pronI >= 0 ? pronI : 1])
    ]);
  });

  const transition = tables.find(
    t =>
      ((t.columns || []).some(c => /china|bangkok/i.test(c)) &&
        (t.columns || []).some(c => /vietnam|chiang|samui/i.test(c))) ||
      /cultural transition|hub-specific/i.test(t.caption || "")
  );

  const diningItems = (base.bullets || [])
    .filter(b => /custom|dining|gesture/i.test(b.heading || ""))
    .flatMap(b => (b.items || []).slice(0, 5).map(text => {
      const p = text.split(/:\s*/);
      return { label: stripMd(p[0]), detail: stripMd(p.slice(1).join(": ")), icon: "🍽" };
    }));

  const normsCaption =
    base.trip === "thailand-2026"
      ? "Daily Norms — Thailand"
      : "Daily Norms — China & Vietnam";
  const phrasesCaption =
    base.trip === "thailand-2026"
      ? "Survival Phrases (Thai)"
      : "Survival Phrases (Mandarin & Vietnamese)";
  const templeRows =
    base.trip === "thailand-2026"
      ? [
          ["Temples", "Shoulders/knees covered; remove shoes; women don't touch monks", "Point feet at Buddha; selfie on Buddha head"],
          ["Grand Palace", "Strict dress — rental at gate if needed", "Shorts above knee"],
          ["Photos", "Ask when unsure; no flash on sacred images", "Drone without permit"]
        ]
      : [
          ["China temples", "Shoulders/knees covered; no flash where signed", "Chopsticks upright in rice"],
          ["Vietnam pagodas", "Remove shoes; borrow sarong if offered", "Touching adults' heads"],
          ["Photos", "Ask when unsure; respect 禁止拍照 signs", "Drone without permit"]
        ];
  const transitRows =
    base.trip === "thailand-2026"
      ? [
          ["BTS/MRT", "Let passengers off first; stand right on escalators"],
          ["Grab", "Use official app — avoid curbside taxis"],
          ["Temple queues", "Early entry beats heat and tour groups"]
        ]
      : [
          ["Motorbike crossings", "Walk steady — bikes flow around you (Vietnam)"],
          ["Taxis", "Use DiDi (China) and Grab (Vietnam) — avoid airport street taxis"],
          ["Crowds", "Early entry + shoulder season timing"]
        ];
  const etiquetteFooter =
    base.trip === "thailand-2026"
      ? "Thailand: soft tip at upscale restaurants; wai with respect; never disparage monarchy."
      : "China: no tipping · Vietnam: soft tip 10–15% at sit-down restaurants.";

  return {
    ...base,
    slide_title: "ETIQUETTE",
    slide_title_accent: "GUIDE",
    intro: cleanIntro(base.intro),
    daily_norms: dailyRows.length
      ? {
          caption: normsCaption,
          footer: "Part 6: Culture & Etiquette",
          columns: ["Situation", "Do", "Don't"],
          rows: dailyRows
        }
      : undefined,
    phrases: phraseRows.length
      ? {
          caption: phrasesCaption,
          footer: "Part 6: Culture & Etiquette",
          columns: ["Phrase", "Pronunciation", "When to Use", "Meaning"],
          rows: phraseRows.slice(0, 10)
        }
      : undefined,
    train: transition
      ? {
          caption: transition.caption || "Hub Cultural Transitions",
          footer: "Part 6: Culture & Etiquette",
          columns: transition.columns,
          rows: transition.rows
        }
      : {
          caption: "Transit & Street Culture",
          footer: "Part 6: Culture & Etiquette",
          columns: ["Rule", "Detail"],
          rows: transitRows
        },
    temple: {
      caption: "Temple & Shrine Etiquette",
      footer: "Part 6: Culture & Etiquette",
      columns: ["Setting", "Do", "Avoid"],
      rows: templeRows
    },
    dining: diningItems.length
      ? {
          caption: "Dining Customs",
          footer: "Part 6: Culture & Etiquette",
          columns: [{ heading: "Custom", items: diningItems }]
        }
      : undefined,
    footer: etiquetteFooter
  };
}

function parseTables(block) {
  const tables = [];
  const re = /(?:^|\n)((?:\|[^\n]+\|\n)+)/g;
  let m;
  while ((m = re.exec(block)) !== null) {
    const lines = m[1].trim().split("\n").filter(l => l.includes("|"));
    if (lines.length < 2) continue;
    const split = line => line.split("|").slice(1, -1).map(c => stripMd(c.trim()));
    const header = split(lines[0]);
    const rows = lines.slice(2).map(split).filter(r => r.some(Boolean));
    if (!rows.length) continue;
    let caption = "";
    const before = block.slice(Math.max(0, m.index - 300), m.index);
    const capM = before.match(/(?:^|\n)#{1,4}\s+(.+)\s*$/);
    if (capM) caption = stripMd(capM[1]);
    tables.push({ caption, columns: header, rows });
  }
  return tables;
}

function enrichFlights(base, body, tables, { includeGround = true } = {}) {
  const flights = extractFlights(body, tables);
  const reordered = [
    ...flights.leg_tables,
    ...(flights.trip_total ? [flights.trip_total] : []),
    ...(includeGround ? flights.ground_tables : [])
  ];
  const intro =
    cleanIntro(base.intro) ||
    (flights.search_date ? `MCP flight search · ${flights.search_date}` : null);

  return {
    ...base,
    intro,
    flights: {
      search_date: flights.search_date,
      legs: flights.legs,
      trip_total: flights.trip_total,
      leg_tables: flights.leg_tables,
      budget_note: flights.budget_note
    },
    tables: reordered
  };
}

function enrichTransportMoney(base, body, tables) {
  return enrichFlights(base, body, tables, { includeGround: true });
}

function enrichFlightComparison(base, body, tables) {
  return enrichFlights(base, body, tables, { includeGround: true });
}

function enrichHotels(base, body, tables) {
  const hotels = extractHotels(body, tables);
  const reordered = [
    ...hotels.hotel_tables,
    ...(hotels.total ? [hotels.total] : []),
    ...hotels.other_tables
  ];
  const intro =
    cleanIntro(base.intro) ||
    (hotels.search_date ? `Hotel rate check · ${hotels.search_date}` : null);

  const trip = base.trip;
  let proximity = [];
  if (trip) {
    const shoppingPath = join(REPO_ROOT, "trips", trip, "shopping-comparison.md");
    const restaurantPath = join(REPO_ROOT, "trips", trip, "restaurant-comparison.md");
    const shopping = existsSync(shoppingPath)
      ? extractShopping(readFileSync(shoppingPath, "utf8"), parseTables(readFileSync(shoppingPath, "utf8")))
      : null;
    const restaurants = existsSync(restaurantPath)
      ? extractVenues(readFileSync(restaurantPath, "utf8"), parseTables(readFileSync(restaurantPath, "utf8")))
      : null;
    proximity = enrichProximityWithGoogle(
      buildTripProximityMaps(trip, { hotels, shopping, restaurants }),
      trip
    );
  }

  return {
    ...base,
    intro,
    hotels: {
      search_date: hotels.search_date,
      picks: hotels.picks,
      total: hotels.total,
      hotel_tables: hotels.hotel_tables,
      budget_note: hotels.budget_note
    },
    proximity,
    tables: reordered
  };
}

function enrichRestaurantComparison(base, body, tables) {
  const venues = extractVenues(body, tables);
  const reordered = [
    ...venues.venue_tables,
    ...(venues.search_log ? [venues.search_log] : []),
    ...venues.other_tables
  ];
  const intro =
    cleanIntro(base.intro) ||
    (venues.search_date ? `Restaurant venue check · ${venues.search_date}` : null);

  return {
    ...base,
    intro,
    venues: {
      search_date: venues.search_date,
      kind: venues.kind,
      picks: venues.picks,
      venue_tables: venues.venue_tables,
      search_log: venues.search_log
    },
    tables: reordered
  };
}

function enrichAttractionsComparison(base, body, tables) {
  const venues = extractVenues(body, tables);
  const reordered = [
    ...venues.venue_tables,
    ...(venues.search_log ? [venues.search_log] : []),
    ...venues.other_tables
  ];
  const intro =
    cleanIntro(base.intro) ||
    (venues.search_date ? `Attractions venue check · ${venues.search_date}` : null);

  return {
    ...base,
    intro,
    venues: {
      search_date: venues.search_date,
      kind: venues.kind,
      picks: venues.picks,
      venue_tables: venues.venue_tables,
      search_log: venues.search_log
    },
    tables: reordered
  };
}

function enrichSpaComparison(base, body, tables) {
  const venues = extractVenues(body, tables);
  const reordered = [
    ...venues.venue_tables,
    ...(venues.search_log ? [venues.search_log] : []),
    ...venues.other_tables
  ];
  const intro =
    cleanIntro(base.intro) ||
    (venues.search_date ? `Spa & wellness check · ${venues.search_date}` : null);

  return {
    ...base,
    intro,
    venues: {
      search_date: venues.search_date,
      kind: venues.kind,
      picks: venues.picks,
      venue_tables: venues.venue_tables,
      search_log: venues.search_log
    },
    tables: reordered
  };
}

function enrichShoppingComparison(base, body, tables) {
  const shopping = extractShopping(body, tables);
  const reordered = [
    ...shopping.shopping_tables,
    ...shopping.other_tables
  ];
  const intro =
    cleanIntro(base.intro) ||
    (shopping.search_date ? `Shopping research · ${shopping.search_date}` : null);

  return {
    ...base,
    intro,
    shopping: {
      search_date: shopping.search_date,
      picks: shopping.picks,
      shopping_tables: shopping.shopping_tables,
      search_log: shopping.search_log
    },
    tables: reordered
  };
}

export function enrichAspect(base, body) {
  // Parse all tables from source — base.tables is capped for generic slides only.
  const tables = parseTables(body);
  const full = { ...base, tables };
  const type = base.type;
  const aspect = base.aspect;

  switch (type) {
    case "food-dining":
      return enrichFoodDining(full, body, tables);
    case "accommodation":
      return enrichAccommodation(full, body, tables);
    case "master-itinerary":
      return enrichMasterItinerary(full, body);
    case "shopping":
      return enrichShopping(full, body, tables);
    case "culture-museums":
      return enrichCulture(full, body, tables);
    case "hidden-gems":
      return migrateDashboard(enrichHiddenGems(full, body, tables));
    case "packing":
      return enrichPacking(full, body, tables);
    case "etiquette":
      return enrichEtiquette(full, body, tables);
    case "flight-comparison":
      return migrateDashboard(enrichFlightComparison(full, body, tables));
    case "hotel-comparison":
      return migrateDashboard(enrichHotels(full, body, tables));
    case "restaurant-comparison":
      return enrichRestaurantComparison(full, body, tables);
    case "attractions-comparison":
      return enrichAttractionsComparison(full, body, tables);
    case "spa-comparison":
      return enrichSpaComparison(full, body, tables);
    case "shopping-comparison":
      return enrichShoppingComparison(full, body, tables);
    case "transport-money":
      if (aspect === "07-transport-money") {
        return migrateDashboard(enrichTransportMoney(full, body, tables));
      }
      return migrateDashboard({ ...full, intro: cleanIntro(base.intro) });
    case "dashboard":
    case "immigration-entry":
    case "customs-borders":
    case "tech-connectivity":
    case "adventure":
    case "health-safety":
    case "contingency":
    case "time-optimization":
      return migrateDashboard({ ...full, intro: cleanIntro(base.intro) });
    default:
      return { ...full, intro: cleanIntro(base.intro) };
  }
}
