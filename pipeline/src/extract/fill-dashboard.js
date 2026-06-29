#!/usr/bin/env node
// Migrate generic aspect JSON → dashboard layout fields (sidebar + panels).
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { splitTitle } from "../render/shared/deck-dashboard.js";
import { isFlightTable, isDateFlexTable, isTripTotalTable } from "./flight-extract.js";
import { extractHotels } from "./hotel-extract.js";
import {
  filterPublisherPanels,
  filterPublisherSidebar,
  filterPublisherTables,
  isSearchLogTable,
  publishBanner,
  publishIntro,
  publishKicker
} from "../shared/publish-filter.js";

const __dir = dirname(fileURLToPath(import.meta.url));
const dataRoot = join(__dir, "../../data");

const KICKERS = {
  "flight-comparison": "Live fares · per-leg options · trip total vs budget",
  "hotel-comparison": "Rate checks · city options · lodging total vs budget",
  "03-immigration-entry": "VJW · visa-free · passport · timeline",
  "07-transport-money": "Flights · trip total · ground legs · money",
  "08-customs-borders": "Arrival · duty-free · tax-free · US re-entry",
  "09-tech-connectivity": "eSIM · apps · Suica · offline maps · power",
  "11-adventure": "Day hikes · Kamikochi option · gear · safety",
  "12-hidden-gems": "Local favorites · tourist traps · solo swaps",
  "14-health-safety": "Vaccines · heat · clinics · first-aid kit",
  "16-contingency": "Scenario playbooks · emergency numbers",
  "17-time-optimization": "PTO · date-flex flights · crowd timing · scorecard"
};

const ACCENTS = {
  "flight-comparison": "FLIGHTS",
  "hotel-comparison": "HOTELS",
  "07-transport-money": "MONEY",
  "08-customs-borders": "BORDERS",
  "09-tech-connectivity": "CONNECTIVITY",
  "14-health-safety": "SAFETY",
  "17-time-optimization": "OPTIMIZATION"
};

function cleanIntro(intro) {
  if (!intro || intro === "---") return null;
  return intro
    .replace(/^>\s*/, "")
    .replace(/^[-*]\s+/gm, "")
    .trim();
}

function trimItems(items, max = 12) {
  return (items || []).slice(0, max);
}

const IMM_AUTH = /travel authorization/i;
const IMM_TIMELINE = /application timeline/i;
const IMM_COUNTRY = /arrival|transit only/i;
const IMM_RED = /red flag/i;
const IMM_VAX = /vaccination|health declaration/i;

function findImmigrationTable(tables, pattern) {
  return (tables || []).find(t => pattern.test(t.caption || ""));
}

function buildImmigrationSidebar(d) {
  const sidebar = [];
  const tables = d.tables || [];
  const auth = findImmigrationTable(tables, IMM_AUTH);
  const timeline = findImmigrationTable(tables, IMM_TIMELINE);
  if (auth) {
    sidebar.push({ type: "table", ...auth, caption: auth.caption || "Travel authorizations" });
  }
  if (timeline) {
    sidebar.push({ type: "table", ...timeline, caption: timeline.caption || "Application timeline" });
  }
  return sidebar;
}

function filterImmigrationPanels(tables) {
  return tables.filter(t => {
    const cap = t.caption || "";
    if (IMM_AUTH.test(cap) || IMM_TIMELINE.test(cap)) return false;
    return IMM_COUNTRY.test(cap) || IMM_RED.test(cap) || IMM_VAX.test(cap);
  });
}

function buildSidebar(d, aspect) {
  const sidebar = [];
  const bullets = d.bullets || [];

  if (aspect === "03-immigration-entry") {
    sidebar.push(...buildImmigrationSidebar(d));
  }

  if ((aspect === "07-transport-money" || aspect === "flight-comparison") && d.flights) {
    if (d.flights.budget_note) {
      sidebar.push({ type: "list", caption: "Budget", items: [d.flights.budget_note] });
    }
    if (d.flights.trip_total?.rows?.length) {
      sidebar.push({
        type: "table",
        ...d.flights.trip_total,
        caption: d.flights.trip_total.caption || "Trip Total"
      });
    }
    const picks = (d.flights.legs || [])
      .filter(l => l.recommended?.price)
      .map(l => {
        const r = l.recommended;
        const leg = l.label.replace(/^leg:\s*/i, "").trim();
        return `${leg}: ${r.price} · ${r.stops} stop · ${r.duration}`;
      });
    if (picks.length && aspect !== "07-transport-money") {
      sidebar.push({ type: "list", caption: "Recommended picks", items: trimItems(picks, 8) });
    }
  }

  if (aspect === "hotel-comparison" && d.hotels) {
    if (d.hotels.budget_note) {
      sidebar.push({ type: "list", caption: "Budget", items: [d.hotels.budget_note] });
    }
    if (d.hotels.total?.rows?.length) {
      sidebar.push({
        type: "table",
        ...d.hotels.total,
        caption: d.hotels.total.caption || "Lodging Total"
      });
    }
    const picks = (d.hotels.picks || [])
      .filter(p => p.recommended?.property || p.recommended?.price)
      .map(p => {
        const r = p.recommended || {};
        const label = p.label.replace(/^city:\s*/i, "").trim();
        const core = [r.property, r.price].filter(Boolean).join(" · ");
        const extra = [r.location, r.rating].filter(Boolean).join(" · ");
        return [label, core, extra].filter(Boolean).join(": ");
      });
    if (picks.length) {
      sidebar.push({ type: "list", caption: "Recommended hotels", items: trimItems(picks, 8) });
    }
  }

  if (aspect === "16-contingency") {
    const emergency = (d.tables || []).find(t =>
      /emergency|quick-reference/i.test(t.caption || "")
    );
    if (emergency) sidebar.push({ type: "table", ...emergency });
  }

  if (aspect === "17-time-optimization") {
    const flex = (d.tables || []).find(isDateFlexTable);
    if (flex) {
      sidebar.push({ type: "table", ...flex, caption: flex.caption || "Date-flex savings" });
    }
    const pto = (d.tables || []).find(t =>
      /PTO|Strategy/i.test((t.rows?.[0] || [])[0] || "") || /jet.?lag|Depart US/i.test(t.caption || "")
    );
    if (pto) sidebar.push({ type: "table", ...pto, caption: pto.caption || "PTO & Jet Lag" });
  }

  bullets.slice(0, 2).forEach(b => {
    const max = /checklist/i.test(b.heading) ? 10 : 8;
    sidebar.push({
      type: "list",
      caption: b.heading,
      items: trimItems(b.items, max),
      ordered: /checklist/i.test(b.heading)
    });
  });

  if (d.callouts?.length) {
    sidebar.push({ type: "validations", items: d.callouts });
  }

  return sidebar;
}

function buildPanels(d, aspect) {
  let tables = filterPublisherTables([...(d.tables || [])].filter(t => t.rows?.length));

  if (aspect === "07-transport-money" || aspect === "flight-comparison") {
    if (d.flights?.trip_total) {
      const cap = d.flights.trip_total.caption;
      tables = tables.filter(t => t !== d.flights.trip_total && t.caption !== cap && !isTripTotalTable(t));
    }
    const flightTables = tables.filter(isFlightTable);
    const other = tables.filter(t => !isFlightTable(t) && !isTripTotalTable(t));
    tables = [...flightTables, ...other];
  }

  if (aspect === "hotel-comparison") {
    if (d.hotels?.total) {
      const cap = d.hotels.total.caption;
      tables = tables.filter(t => t !== d.hotels.total && t.caption !== cap && !isTripTotalTable(t));
    }
    const hotelLike = table =>
      !isSearchLogTable(table) &&
      (/hotel|property|lodging|accommodation|city:/i.test(table.caption || "") ||
      (table.columns || []).some(c => /hotel|property|night|rate|district|area/i.test(c)));
    const hotelTables = tables.filter(hotelLike);
    const other = tables.filter(t => !hotelLike(t));
    tables = [...hotelTables, ...other];
  }

  if (aspect === "16-contingency") {
    tables = tables.filter(t => !/emergency|quick-reference/i.test(t.caption || ""));
  }
  if (aspect === "17-time-optimization") {
    tables = tables.filter(t => {
      if (isDateFlexTable(t)) return false;
      const cap = t.caption || "";
      if (/efficiency scorecard/i.test(cap)) return false;
      if (/jet lag/i.test(cap)) return false;
      const firstCell = (t.rows?.[0] || [])[0] || "";
      return !(/Depart US|PTO/i.test(firstCell) && !cap);
    });
  }

  if (aspect === "03-immigration-entry") {
    tables = filterImmigrationPanels(tables);
  }

  return tables.map(t => ({
    ...t,
    caption: t.caption || "Details"
  }));
}

/** Move compact reference tables off the main grid (adventure-style readability). */
const DENSE_SIDEBAR = {
  "08-customs-borders": [/trip customs overview|purchasing strategy/i],
  "09-tech-connectivity": [/tech setup checklist|connectivity strategy/i],
  "12-hidden-gems": [/neighborhood deep|nighttime secrets/i],
  "14-health-safety": [/emergency number|document backup|pre-trip health/i],
  "16-contingency": [/key contact/i]
};

function rebalanceDenseDashboard(d, aspect) {
  const patterns = DENSE_SIDEBAR[aspect];
  if (!patterns?.length) return d;

  let sidebar = [...(d.sidebar || [])];
  const panels = [];

  for (const p of d.panels || []) {
    if (patterns.some(rx => rx.test(p.caption || ""))) {
      sidebar.push({ type: "table", ...p, caption: p.caption || "Details" });
    } else {
      panels.push(p);
    }
  }

  let banner = d.banner;
  if (aspect === "16-contingency" && banner?.text?.length > 100) {
    sidebar.unshift({ type: "text", caption: "Quick actions", text: banner.text });
    banner = undefined;
  }

  if (panels.length === (d.panels || []).length) return d;
  return { ...d, sidebar, panels, banner };
}

export function migrateDashboard(d) {
  const aspect = d.aspect;
  const { main, accent } = splitTitle(d.title);
  const intro = publishIntro(cleanIntro(d.intro));

  const scorecard =
    aspect === "17-time-optimization"
      ? (d.tables || []).find(t => /efficiency scorecard/i.test(t.caption || ""))
      : undefined;

  return rebalanceDenseDashboard({
    ...d,
    type: d.type === "flight-comparison" ? "flights" : d.type === "hotel-comparison" ? "hotels" : "dashboard",
    slide_title: (aspect === "flight-comparison" || aspect === "hotel-comparison")
      ? String(d.title || main).toUpperCase()
      : main,
    slide_title_accent: ACCENTS[aspect] || accent,
    section_label: d.title,
    section_kicker: publishKicker(KICKERS[aspect] || ""),
    banner: intro ? publishBanner({ text: intro }) : undefined,
    sidebar: filterPublisherSidebar(buildSidebar(d, aspect)),
    panels: filterPublisherPanels(buildPanels(d, aspect)),
    scorecard: scorecard || d.scorecard,
    footer: d.footer
  }, aspect);
}

function migrate(d) {
  return migrateDashboard(d);
}

const isMain = process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, "/"));
if (isMain) {
const trip = process.argv[2] || "japan-2026";
const dir = join(dataRoot, trip);
const targets = Object.keys(KICKERS);

for (const aspect of targets) {
  const path = join(dir, `${aspect}.json`);
  if (!existsSync(path)) {
    console.log(`skip: ${aspect} (missing)`);
    continue;
  }
  const raw = JSON.parse(readFileSync(path, "utf8"));
  if (aspect === "hotel-comparison" && !raw.hotels && raw.tables?.length) {
    const body = "";
    const derived = extractHotels(body, raw.tables);
    raw.hotels = {
      search_date: derived.search_date,
      picks: derived.picks,
      total: derived.total,
      hotel_tables: derived.hotel_tables,
      budget_note: derived.budget_note
    };
  }
  const out = migrate(raw);
  writeFileSync(path, JSON.stringify(out, null, 2) + "\n");
  console.log(`dashboard: ${aspect}`);
}
}
