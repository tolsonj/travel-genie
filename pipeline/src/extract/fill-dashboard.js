#!/usr/bin/env node
// Migrate generic aspect JSON → dashboard layout fields (sidebar + panels).
import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { splitTitle } from "../render/shared/deck-dashboard.js";

const __dir = dirname(fileURLToPath(import.meta.url));
const dataRoot = join(__dir, "../../data");

const KICKERS = {
  "03-immigration-entry": "VJW · visa-free · passport · timeline",
  "07-transport-money": "JR Pass verdict · legs · airport transfers · yen",
  "08-customs-borders": "Arrival · duty-free · tax-free · US re-entry",
  "09-tech-connectivity": "eSIM · apps · Suica · offline maps · power",
  "11-adventure": "Day hikes · Kamikochi option · gear · safety",
  "12-hidden-gems": "Local favorites · tourist traps · solo swaps",
  "14-health-safety": "Vaccines · heat · clinics · first-aid kit",
  "16-contingency": "Scenario playbooks · emergency numbers",
  "17-time-optimization": "PTO · clustering · crowd timing · scorecard"
};

const ACCENTS = {
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

function buildSidebar(d, aspect) {
  const sidebar = [];
  const bullets = d.bullets || [];

  if (aspect === "16-contingency") {
    const emergency = (d.tables || []).find(t =>
      /emergency|quick-reference/i.test(t.caption || "")
    );
    if (emergency) sidebar.push({ type: "table", ...emergency });
  }

  if (aspect === "17-time-optimization") {
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
  let tables = [...(d.tables || [])].filter(t => t.rows?.length);

  if (aspect === "16-contingency") {
    tables = tables.filter(t => !/emergency|quick-reference/i.test(t.caption || ""));
  }
  if (aspect === "17-time-optimization") {
    tables = tables.filter(t => {
      const cap = t.caption || "";
      const firstCell = (t.rows?.[0] || [])[0] || "";
      return !(/Depart US|PTO/i.test(firstCell) && !cap);
    });
  }

  return tables.map(t => ({
    ...t,
    caption: t.caption || "Details"
  }));
}

function migrate(d) {
  const aspect = d.aspect;
  const { main, accent } = splitTitle(d.title);
  const intro = cleanIntro(d.intro);

  return {
    ...d,
    type: "dashboard",
    slide_title: main,
    slide_title_accent: ACCENTS[aspect] || accent,
    section_label: d.title,
    section_kicker: KICKERS[aspect] || "",
    banner: intro ? { text: intro } : undefined,
    sidebar: buildSidebar(d, aspect),
    panels: buildPanels(d, aspect),
    footer: d.footer
  };
}

const trip = process.argv[2] || "japan-2026";
const dir = join(dataRoot, trip);
const targets = Object.keys(KICKERS);

for (const aspect of targets) {
  const path = join(dir, `${aspect}.json`);
  const raw = JSON.parse(readFileSync(path, "utf8"));
  const out = migrate(raw);
  writeFileSync(path, JSON.stringify(out, null, 2) + "\n");
  console.log(`dashboard: ${aspect}`);
}
