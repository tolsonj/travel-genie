/**
 * pipeline/src/site/render-trip-site.js
 *
 * Renders a complete self-contained trip.html from an assembled trip-site model.
 *
 * Usage (CLI):
 *   node pipeline/src/site/render-trip-site.js <slug> [--out <path>]
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { SITE_THEME_CSS } from "./theme-site.js";
import { assembleTripSite } from "./assemble-trip-site.js";
import { renderSection } from "./sections/index.js";
import { PIPELINE_ROOT } from "../discover.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Helpers ────────────────────────────────────────────────────────────────

/** HTML-escape a string. Never output user text without this. */
function esc(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Short label for sidebar day links, e.g. "Sept 1" + "Tuesday".
 * @param {string} title - full day title from itinerary
 * @returns {{ date: string, weekday: string }}
 */
function dayNavLabel(title) {
  const parsed = (title ?? "").match(/Day \d+ — (\w+day),?\s+([^·]+)/i);
  if (parsed) {
    return { date: parsed[2].trim(), weekday: parsed[1] };
  }
  const dayNum = (title ?? "").match(/Day (\d+)/);
  return { date: dayNum ? `Day ${dayNum[1]}` : (title ?? ""), weekday: "" };
}

/**
 * Renders day footnotes block; returns "" if all values are empty.
 * @param {{ wow_moment: string, low_energy: string, rainy_day: string, transit: string }} footnotes
 */
function footnotes_block(footnotes) {
  const items = [
    { key: "wow_moment", cls: "site-footnote--wow",        prefix: "✓ " },
    { key: "low_energy", cls: "site-footnote--low-energy", prefix: "🔋 " },
    { key: "rainy_day",  cls: "site-footnote--rainy",      prefix: "☔ " },
    { key: "transit",    cls: "site-footnote--transit",    prefix: "🚃 " },
  ];

  const rendered = items
    .filter(({ key }) => footnotes?.[key])
    .map(({ key, cls, prefix }) =>
      `<span class="site-footnote ${esc(cls)}">${esc(prefix + footnotes[key])}</span>`
    );

  if (rendered.length === 0) return "";
  return `<div class="site-day-footnotes">${rendered.join("\n          ")}</div>`;
}

/**
 * Renders an array of table objects.
 * Each table: { caption?, columns: string[], rows: string[][] }
 * Limits to first 3 tables per section.
 */
function renderTables(tables) {
  if (!Array.isArray(tables) || tables.length === 0) return "";

  return tables.slice(0, 3).map(table => {
    const caption = table.caption
      ? `<h3 class="site-table-caption">${esc(table.caption)}</h3>`
      : "";

    const columns = Array.isArray(table.columns) ? table.columns : [];
    const rows    = Array.isArray(table.rows)    ? table.rows    : [];

    const thead = columns.length > 0
      ? `<thead><tr>${columns.map(c => `<th>${esc(c)}</th>`).join("")}</tr></thead>`
      : "";

    const tbody = rows.length > 0
      ? `<tbody>${rows.map(row =>
          `<tr>${(Array.isArray(row) ? row : []).map(cell => `<td>${esc(cell)}</td>`).join("")}</tr>`
        ).join("\n            ")}</tbody>`
      : "";

    return `${caption}
        <div class="site-table-wrap">
          <table class="site-table">
            ${thead}
            ${tbody}
          </table>
        </div>`;
  }).join("\n");
}

// ── Main renderer ──────────────────────────────────────────────────────────

/**
 * Render the complete trip.html from an assembled trip-site model.
 * @param {object} site - result of assembleTripSite(slug)
 * @param {object} [opts]
 * @param {string[]} [opts.sectionModulePaths] - paths to section renderer modules (optional)
 * @returns {Promise<string>} complete HTML string
 */
export async function renderTripSite(site, opts = {}) {
  const { meta, booking_queue = [], days = [], sections = [], extra_pages = [] } = site;

  // party_short: leading number from party string, e.g. "2 (couple...)" → "2"
  const partyShort = meta.party ? (meta.party.match(/^(\d+)/) ?? [, meta.party])[1] : "";

  // ── Hero ────────────────────────────────────────────────────────────────
  const heroMeta = [
    meta.budget ? `<span class="site-meta-item">💵 ${esc(meta.budget)}</span>` : "",
    partyShort  ? `<span class="site-meta-item">👥 ${esc(partyShort)}</span>`  : "",
  ].filter(Boolean).join("\n        ");

  const heroHtml = `
  <header class="site-hero">
    <div class="site-hero-inner">
      <div class="site-hero-title">${esc(meta.title)}</div>
      <div class="site-hero-subtitle">${esc(meta.subtitle)}</div>
      <div class="site-hero-meta">
        ${heroMeta}
      </div>
    </div>
  </header>`;

  // ── Sidebar: one entry per day + reference sections ─────────────────────
  const dayLinks = days.map(day => {
    const { date, weekday } = dayNavLabel(day.title);
    const weekdayHtml = weekday
      ? `<span class="site-sidebar-link-weekday">${esc(weekday)}</span>`
      : "";
    return `<a class="site-sidebar-link site-sidebar-link--day" href="#day-${esc(String(day.day))}">
        <span class="site-sidebar-link-date">${esc(date)}</span>
        ${weekdayHtml}
      </a>`;
  }).join("\n      ");

  const sectionLinks = [
    ...extra_pages.map(p =>
      `<a class="site-sidebar-link site-sidebar-link--section site-sidebar-link--page" href="${esc(p.href)}">${esc(p.title)}</a>`
    ),
    ...sections.map(s =>
      `<a class="site-sidebar-link site-sidebar-link--section" href="#${esc(s.id)}">${esc(s.title)}</a>`
    )
  ].join("\n      ");

  const sidebarHtml = `
  <aside class="site-sidebar" aria-label="Trip days">
    <div class="site-sidebar-header">
      <a class="site-sidebar-trip" href="#itinerary">${esc(meta.title)}</a>
    </div>
    <nav class="site-sidebar-days">
      ${dayLinks}
    </nav>
    ${(sections.length > 0 || extra_pages.length > 0) ? `<nav class="site-sidebar-sections" aria-label="Reference sections">
      ${sectionLinks}
    </nav>` : ""}
  </aside>`;

  // ── Booking queue ──────────────────────────────────────────────────────
  let bookingQueueHtml = "";
  if (booking_queue.length > 0) {
    const rows = booking_queue
      .map(r => `<tr>
              <td>${esc(r.book_now ?? "")}</td>
              <td>${esc(r.book_later ?? "")}</td>
              <td>${esc(r.deadline ?? "")}</td>
            </tr>`)
      .join("\n            ");

    bookingQueueHtml = `
  <section class="site-booking-queue" id="booking-queue">
    <div class="site-section-inner">
      <h2 class="site-section-title">Booking Queue</h2>
      <div class="site-table-wrap">
        <table class="site-table">
          <thead><tr><th>Book Now</th><th>Book Later</th><th>Deadline</th></tr></thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
    </div>
  </section>`;
  }

  // ── Itinerary days ─────────────────────────────────────────────────────
  const daysHtml = days.map((day, i) => {
    const eventsHtml = (day.events ?? []).map(ev => {
      const linesHtml = (ev.lines ?? [])
        .map(l => `<li>${esc(l)}</li>`)
        .join("\n              ");
      return `
            <div class="site-event">
              <h3 class="site-event-name">${esc(ev.name)}</h3>
              <ul class="site-event-lines">
              ${linesHtml}
              </ul>
            </div>`;
    }).join("");

    const footnotesHtml = footnotes_block(day.footnotes);
    const divider = i < days.length - 1 ? '\n        <hr class="site-day-divider" />' : "";

    return `
        <article class="site-day" id="day-${esc(String(day.day))}">
          <h2 class="site-day-title">${esc(day.title)}</h2>
          <div class="site-day-events">
            ${eventsHtml}
          </div>
          ${footnotesHtml}
        </article>${divider}`;
  }).join("\n");

  const itineraryHtml = `
  <main class="site-itinerary" id="itinerary">
    <div class="site-section-inner">
      ${daysHtml}
    </div>
  </main>`;

  // ── Reference sections ─────────────────────────────────────────────────
  const sectionsHtml = sections.map(renderSection).join("\n");

  const referenceHtml = `
  <div class="site-reference-sections">
    ${sectionsHtml}
  </div>`;

  // ── Footer ─────────────────────────────────────────────────────────────
  const footerHtml = `
  <footer class="site-footer">
    <div class="site-footer-inner">
      travel-genie · ${esc(site.trip)}
    </div>
  </footer>`;

  // ── Scroll-spy script ──────────────────────────────────────────────────
  const dayIds = JSON.stringify(days.map(d => `day-${d.day}`));
  const sectionIds = JSON.stringify(sections.map(s => s.id));
  const scriptHtml = `
  <script>
    (function() {
      const links = document.querySelectorAll('.site-sidebar-link');
      const dayIds = ${dayIds};
      const sectionIds = ${sectionIds};
      const anchors = [...dayIds, ...sectionIds]
        .map(id => document.getElementById(id))
        .filter(Boolean);
      function onScroll() {
        let active = anchors[0];
        for (const el of anchors) {
          if (el.getBoundingClientRect().top <= 96) active = el;
        }
        links.forEach(l => {
          l.classList.toggle('site-sidebar-link--active',
            l.getAttribute('href') === '#' + active.id);
        });
      }
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    })();
  </script>`;

  const mainHtml = `
  <div class="site-main">
${bookingQueueHtml}
${itineraryHtml}
${referenceHtml}
${footerHtml}
  </div>`;

  const layoutHtml = `
  <div class="site-layout">
${sidebarHtml}
${mainHtml}
  </div>`;

  // ── Assemble document ──────────────────────────────────────────────────
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(meta.title)} — Itinerary</title>
  <style>${SITE_THEME_CSS}</style>
</head>
<body>
${heroHtml}
${layoutHtml}
${scriptHtml}
</body>
</html>`;
}

// ── CLI entry point ────────────────────────────────────────────────────────

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  const args = process.argv.slice(2);
  const slug = args.find(a => !a.startsWith("--") && args[args.indexOf(a) - 1] !== "--out");
  const outIdx = args.indexOf("--out");
  const outArg = outIdx !== -1 ? args[outIdx + 1] : null;

  if (!slug) {
    console.error("Usage: node render-trip-site.js <slug> [--out <path>]");
    process.exit(1);
  }

  const site = assembleTripSite(slug);
  const html = await renderTripSite(site);

  const outPath = outArg ?? join(PIPELINE_ROOT, "dist", slug, "trip.html");
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, html, "utf8");

  console.log(`Written → ${outPath} (${html.length} bytes)`);
}
