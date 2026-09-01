/**
 * Standalone HTML pages for Cursor canvases that GitHub Pages can host.
 * Writes pipeline/dist/<slug>/gantt.html and kennedy-saves.html.
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { PIPELINE_ROOT, tripSourceDir } from "../discover.js";
import { ACTIVITY_COLORS, ACTIVITY_LABEL, DAYS, PHASE_META } from "./gantt-days.js";
import { SITE_THEME_CSS } from "./theme-site.js";

function esc(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Extra sibling pages for a trip (nav + write list).
 * @param {string} slug
 * @returns {{ href: string, title: string }[]}
 */
export function listExtraPages(slug) {
  const pages = [];
  if (slug === "china-vietnam-2026") {
    pages.push({ href: "gantt.html", title: "Schedule" });
  }
  if (
    existsSync(join(tripSourceDir(slug), "Kennedy-Data", "geo-items.json")) ||
    existsSync(join(PIPELINE_ROOT, "dist", slug, "kennedy-saves.html"))
  ) {
    pages.push({ href: "kennedy-saves.html", title: "Saved places" });
  }
  return pages;
}

function pageShell({ title, subtitle, body, extraScript = "" }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(title)}</title>
  <style>${SITE_THEME_CSS}</style>
</head>
<body>
  <header class="site-hero">
    <div class="site-hero-inner">
      <a class="site-extra-back" href="index.html">← Itinerary</a>
      <div class="site-hero-title">${esc(title)}</div>
      <div class="site-hero-subtitle">${esc(subtitle)}</div>
    </div>
  </header>
  <div class="site-extra-page">
    ${body}
  </div>
  <footer class="site-footer">
    <div class="site-footer-inner">travel-genie · china-vietnam-2026</div>
  </footer>
  ${extraScript}
</body>
</html>`;
}

function renderGanttSvg() {
  const LABEL_W = 188;
  const CHART_W = 660;
  const ROW_H = 42;
  const PHASE_H = 28;
  const HEADER_H = 34;
  const TIME_START = 6;
  const TIME_END = 23;
  const PX_PER_HR = CHART_W / (TIME_END - TIME_START);
  const tX = h => LABEL_W + Math.max(0, h - TIME_START) * PX_PER_HR;
  const tW = (s, e) => Math.max(3, (Math.min(e, TIME_END) - Math.max(s, TIME_START)) * PX_PER_HR);

  const rows = [];
  let lastPhase = null;
  DAYS.forEach(d => {
    if (d.phase !== lastPhase) {
      rows.push({ kind: "phase", phase: d.phase });
      lastPhase = d.phase;
    }
    rows.push({ kind: "day", data: d });
  });

  let bodyH = 0;
  for (const r of rows) bodyH += r.kind === "phase" ? PHASE_H : ROW_H;
  const svgH = HEADER_H + bodyH + 8;
  const svgW = LABEL_W + CHART_W;
  const ticks = [
    [6, "6 AM"], [8, "8 AM"], [10, "10 AM"], [12, "NOON"],
    [14, "2 PM"], [16, "4 PM"], [18, "6 PM"], [20, "8 PM"], [22, "10 PM"]
  ];

  let parts = [`<svg class="site-gantt" viewBox="0 0 ${svgW} ${svgH}" xmlns="http://www.w3.org/2000/svg">`];
  for (const [h, label] of ticks) {
    const x = tX(h);
    parts.push(`<line x1="${x}" y1="${HEADER_H - 8}" x2="${x}" y2="${svgH - 4}" stroke="#dde3ea" stroke-width="${h === 12 ? 1 : 0.5}" ${h === 12 ? "" : 'stroke-dasharray="3 3"'} />`);
    parts.push(`<text x="${x}" y="18" text-anchor="middle" fill="${h === 12 ? "#444" : "#888"}" font-size="10" font-weight="${h === 12 ? 600 : 400}" font-family="system-ui,sans-serif">${label}</text>`);
  }

  let rowY = HEADER_H;
  let ri = 0;
  for (const row of rows) {
    const thisY = rowY;
    if (row.kind === "phase") {
      rowY += PHASE_H;
      const meta = PHASE_META[row.phase];
      parts.push(`<rect x="0" y="${thisY}" width="${svgW}" height="${PHASE_H}" fill="${meta.color}" opacity="0.11"/>`);
      parts.push(`<rect x="0" y="${thisY}" width="5" height="${PHASE_H}" fill="${meta.color}"/>`);
      parts.push(`<text x="14" y="${thisY + PHASE_H / 2 + 4}" fill="${meta.color}" font-size="11" font-weight="700" letter-spacing="0.6" font-family="system-ui,sans-serif">${esc(meta.banner)}</text>`);
      continue;
    }
    rowY += ROW_H;
    const d = row.data;
    const even = ri++ % 2 === 0;
    const phColor = PHASE_META[d.phase].color;
    if (even) {
      parts.push(`<rect x="0" y="${thisY}" width="${svgW}" height="${ROW_H}" fill="#f4f5f7"/>`);
    }
    parts.push(`<rect x="0" y="${thisY}" width="4" height="${ROW_H}" fill="${phColor}" opacity="0.35"/>`);
    parts.push(`<text x="10" y="${thisY + 15}" fill="${d.isTransit ? "#888" : "#1a1a1a"}" font-size="11" font-weight="700" font-family="system-ui,sans-serif">Day ${d.day}</text>`);
    parts.push(`<text x="10" y="${thisY + 30}" fill="#888" font-size="9" font-family="system-ui,sans-serif">${esc(d.date)}  ${esc(d.dow)}</text>`);
    parts.push(`<text x="${LABEL_W - 8}" y="${thisY + ROW_H / 2 + 4}" text-anchor="end" fill="#999" font-size="9" font-family="system-ui,sans-serif">${esc(d.location)}</text>`);
    for (const act of d.activities) {
      const barX = tX(act.start);
      const barW = tW(act.start, act.end);
      const barY = thisY + 9;
      const barH = ROW_H - 18;
      const col = ACTIVITY_COLORS[act.type];
      const showLabel = barW > 52;
      const maxChars = Math.floor(barW / 5.8);
      const label = showLabel
        ? (act.label.length > maxChars ? act.label.slice(0, maxChars - 1) + "…" : act.label)
        : "";
      parts.push(`<rect x="${barX}" y="${barY}" width="${barW}" height="${barH}" rx="3" fill="${col}"/>`);
      if (label) {
        parts.push(`<text x="${barX + 5}" y="${barY + barH / 2 + 4}" fill="#fff" font-size="8.5" font-weight="500" font-family="system-ui,sans-serif">${esc(label)}</text>`);
      }
    }
    parts.push(`<line x1="0" y1="${thisY + ROW_H - 0.5}" x2="${svgW}" y2="${thisY + ROW_H - 0.5}" stroke="#dde3ea" stroke-width="0.5"/>`);
  }
  parts.push("</svg>");
  return parts.join("\n");
}

function renderGanttPage() {
  const legend = Object.entries(ACTIVITY_LABEL)
    .map(([k, lab]) =>
      `<span class="site-legend-item"><span class="site-legend-swatch" style="background:${ACTIVITY_COLORS[k]}"></span>${esc(lab)}</span>`
    )
    .join("");

  const wowRows = DAYS.map(d =>
    `<tr><td>Day ${d.day}</td><td>${esc(d.date)}</td><td>${esc(d.location)}</td><td>${esc(d.wow)}</td></tr>`
  ).join("\n");

  const body = `
    <p class="site-extra-lede">14-day itinerary · 3 travelers · Hong Kong → Ho Chi Minh City → Da Nang / Hoi An · hour of day is local time.</p>
    <div class="site-extra-stats">
      <div class="site-extra-stat"><strong>14</strong><span>Total days</span></div>
      <div class="site-extra-stat"><strong>3</strong><span>Destination cities</span></div>
      <div class="site-extra-stat"><strong>2</strong><span>Countries</span></div>
      <div class="site-extra-stat"><strong>14%</strong><span>Transit share</span></div>
    </div>
    <div class="site-legend">${legend}</div>
    <h2 class="site-section-title">Daily schedule</h2>
    <div class="site-gantt-wrap">${renderGanttSvg()}</div>
    <h2 class="site-section-title">Wow moments</h2>
    <div class="site-table-wrap">
      <table class="site-table">
        <thead><tr><th>Day</th><th>Date</th><th>Location</th><th>Standout moment</th></tr></thead>
        <tbody>${wowRows}</tbody>
      </table>
    </div>`;

  return pageShell({
    title: "Hong Kong & Vietnam — September 2026",
    subtitle: "Daily schedule gantt · Hong Kong → Ho Chi Minh City → Da Nang / Hoi An",
    body
  });
}

function kennedyClientScript() {
  return `<script>
(function () {
  const ITEMS = window.__GEO_ITEMS__;
  const CITY_ORDER = ["Hong Kong","Shanghai","Guangzhou","Chongqing","Shenzhen","Nanjing","Beijing","China (unspecified)","Ho Chi Minh City","Da Nang","Hanoi","Hoi An","Ha Long","Vietnam (unspecified)"];
  const CATS = ["All","Food","Shopping","Spa / Beauty","Hotel / Stay","Attraction","Fashion","Other"];
  const REGIONS = [
    { id: "all", label: "All", test: function () { return true; } },
    { id: "hk", label: "Hong Kong", test: function (it) { return it.city === "Hong Kong"; } },
    { id: "cn", label: "Mainland China", test: function (it) { return it.country === "China"; } },
    { id: "hcmc", label: "Ho Chi Minh City", test: function (it) { return it.city === "Ho Chi Minh City"; } },
    { id: "danang", label: "Da Nang", test: function (it) { return it.city === "Da Nang"; } },
    { id: "vn-rest", label: "Rest of Vietnam", test: function (it) {
      return it.country === "Vietnam" && it.city !== "Ho Chi Minh City" && it.city !== "Da Nang";
    } }
  ];
  const MAP = { west: 103.2, east: 122.8, south: 9.2, north: 41.8, w: 640, h: 520, pad: 40 };
  const LABEL_OFF = {
    "Hong Kong": { dx: 16, dy: 5 }, Shenzhen: { dx: 16, dy: -12 }, Guangzhou: { dx: -16, dy: 4, anchor: "end" },
    Shanghai: { dx: 14, dy: 5 }, Nanjing: { dx: -12, dy: 4, anchor: "end" }, Beijing: { dx: 12, dy: 4 },
    Chongqing: { dx: -12, dy: 4, anchor: "end" }, "Ho Chi Minh City": { dx: 14, dy: 5 },
    "Da Nang": { dx: 14, dy: -8 }, "Hoi An": { dx: 14, dy: 14 }, Hanoi: { dx: -12, dy: -6, anchor: "end" },
    "Ha Long": { dx: 12, dy: 6 }
  };
  function mercatorY(lat) {
    const rad = lat * Math.PI / 180;
    return Math.log(Math.tan(Math.PI / 4 + rad / 2));
  }
  function project(lat, lng) {
    const x = MAP.pad + (lng - MAP.west) / (MAP.east - MAP.west) * (MAP.w - MAP.pad * 2);
    const y0 = mercatorY(MAP.north), y1 = mercatorY(MAP.south);
    const y = MAP.pad + (y0 - mercatorY(lat)) / (y0 - y1) * (MAP.h - MAP.pad * 2);
    return { x: x, y: y };
  }
  const state = { region: "all", category: "All", query: "", cityFocus: "" };

  function filtered() {
    const regionFn = (REGIONS.find(function (r) { return r.id === state.region; }) || REGIONS[0]).test;
    const q = state.query.trim().toLowerCase();
    return ITEMS.filter(function (it) {
      if (!regionFn(it)) return false;
      if (state.cityFocus && it.city !== state.cityFocus) return false;
      if (state.category !== "All" && it.category !== state.category) return false;
      if (!q) return true;
      return [it.item, it.city, it.category, it.collection, it.owner].join(" ").toLowerCase().indexOf(q) !== -1;
    });
  }

  function renderMap(rows) {
    const byCity = {};
    CITY_ORDER.filter(function (c) { return c.indexOf("unspecified") === -1; }).forEach(function (city) {
      const sample = ITEMS.find(function (it) { return it.city === city && it.geoPrecision === "city centroid"; });
      if (!sample) return;
      const count = ITEMS.filter(function (it) {
        return it.city === city && (state.category === "All" || it.category === state.category);
      }).length;
      if (count) byCity[city] = { city: city, lat: sample.lat, lng: sample.lng, count: count };
    });
    const cities = Object.keys(byCity).map(function (k) { return byCity[k]; });
    const max = Math.max.apply(null, cities.map(function (c) { return c.count; }).concat([1]));
    let svg = '<svg class="site-geo-map" viewBox="0 0 ' + MAP.w + ' ' + MAP.h + '" xmlns="http://www.w3.org/2000/svg">';
    [10, 20, 30, 40].forEach(function (lat) {
      const y = project(lat, MAP.west).y;
      svg += '<line x1="' + MAP.pad + '" y1="' + y + '" x2="' + (MAP.w - 8) + '" y2="' + y + '" stroke="#dde3ea"/>';
      svg += '<text x="8" y="' + (y + 4) + '" fill="#999" font-size="10">' + lat + "N</text>";
    });
    [105, 110, 115, 120].forEach(function (lng) {
      const x = project(MAP.south, lng).x;
      svg += '<line x1="' + x + '" y1="' + MAP.pad + '" x2="' + x + '" y2="' + (MAP.h - 16) + '" stroke="#dde3ea"/>';
      svg += '<text x="' + x + '" y="' + (MAP.h - 6) + '" text-anchor="middle" fill="#999" font-size="10">' + lng + "E</text>";
    });
    cities.forEach(function (c) {
      const p = project(c.lat, c.lng);
      const r = 7 + Math.sqrt(c.count / max) * 18;
      const on = !state.cityFocus || state.cityFocus === c.city;
      const off = LABEL_OFF[c.city] || { dx: 12, dy: 4 };
      svg += '<g class="site-geo-bubble" data-city="' + c.city.replace(/"/g, "") + '" opacity="' + (on ? 1 : 0.35) + '" style="cursor:pointer">';
      svg += '<circle cx="' + p.x + '" cy="' + p.y + '" r="' + r + '" fill="#1c2b3a"/>';
      svg += '<text x="' + p.x + '" y="' + (p.y + 4) + '" text-anchor="middle" fill="#fff" font-size="10" font-weight="600">' + c.count + "</text>";
      svg += '<text x="' + (p.x + off.dx) + '" y="' + (p.y + off.dy) + '" text-anchor="' + (off.anchor || "start") + '" fill="#1a1a1a" font-size="11" font-weight="500">' + c.city + "</text></g>";
    });
    svg += "</svg>";
    document.getElementById("geo-map").innerHTML = svg;
    document.querySelectorAll(".site-geo-bubble").forEach(function (g) {
      g.addEventListener("click", function (e) {
        e.stopPropagation();
        const city = g.getAttribute("data-city");
        state.cityFocus = state.cityFocus === city ? "" : city;
        if (state.cityFocus) state.region = "all";
        render();
      });
    });
    document.getElementById("geo-map").onclick = function () {
      if (state.cityFocus) { state.cityFocus = ""; render(); }
    };
  }

  function renderTable(rows) {
    const body = rows.map(function (it) {
      const city = it.otherCities && it.otherCities.length ? it.city + " (+" + it.otherCities.join(", ") + ")" : it.city;
      const href = it.url.replace(/"/g, "&quot;");
      const short = it.url.replace("https://www.instagram.com", "");
      return "<tr><td>" + escapeHtml(it.item) + "</td><td>" + escapeHtml(it.category) + "</td><td>" + escapeHtml(city) +
        "</td><td>" + it.lat.toFixed(4) + ", " + it.lng.toFixed(4) + "</td><td>" + escapeHtml(it.geoPrecision) +
        "</td><td>" + escapeHtml(it.collection) + "</td><td><a href=\\"" + href + "\\" target=\\"_blank\\" rel=\\"noopener\\">" +
        escapeHtml(short) + "</a></td></tr>";
    }).join("");
    document.getElementById("geo-count").textContent = rows.length + " of " + ITEMS.length + " items";
    document.querySelector("#geo-table tbody").innerHTML = body;
  }

  function escapeHtml(s) {
    return String(s || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  }

  function renderChips() {
    document.getElementById("geo-chips").innerHTML = REGIONS.map(function (r) {
      return '<button type="button" class="site-geo-chip' + (state.region === r.id ? " is-active" : "") + '" data-region="' + r.id + '">' + r.label + "</button>";
    }).join("");
    document.querySelectorAll("[data-region]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        state.region = btn.getAttribute("data-region");
        state.cityFocus = "";
        render();
      });
    });
  }

  function render() {
    const rows = filtered();
    renderChips();
    renderMap(rows);
    renderTable(rows);
    const focus = document.getElementById("geo-focus");
    focus.textContent = state.cityFocus ? "Focused: " + state.cityFocus + ". Click the map to clear." : "Click a city bubble to filter.";
  }

  document.getElementById("geo-cat").innerHTML = CATS.map(function (c) {
    return '<option value="' + c + '">' + (c === "All" ? "All categories" : c) + "</option>";
  }).join("");
  document.getElementById("geo-cat").addEventListener("change", function (e) {
    state.category = e.target.value;
    render();
  });
  document.getElementById("geo-q").addEventListener("input", function (e) {
    state.query = e.target.value;
    render();
  });
  render();
})();
</script>`;
}

function renderKennedyPage(slug) {
  const geoPath = join(tripSourceDir(slug), "Kennedy-Data", "geo-items.json");
  const payload = JSON.parse(readFileSync(geoPath, "utf8"));
  const itemsJson = JSON.stringify(payload.items);
  const body = `
    <p class="site-extra-lede">Kennedy Instagram saves mapped to city centroids — Instagram did not export venue geotags. 150 items sit on 12 cities; 101 country-only saves are omitted from the map.</p>
    <p class="site-extra-lede"><a href="maps/kennedy-saves-by-city.csv">Download Google My Maps CSV</a></p>
    <p id="geo-focus" class="site-extra-lede"></p>
    <div id="geo-chips" class="site-geo-filters"></div>
    <div class="site-geo-toolbar">
      <select id="geo-cat" aria-label="Category"></select>
      <input id="geo-q" type="search" placeholder="Search item, city, owner…" />
    </div>
    <div id="geo-map"></div>
    <p id="geo-count" class="site-extra-lede"></p>
    <div class="site-table-wrap">
      <table class="site-table" id="geo-table">
        <thead><tr><th>Item</th><th>Category</th><th>City</th><th>Lat, Lng</th><th>Geo precision</th><th>Collection</th><th>Instagram</th></tr></thead>
        <tbody></tbody>
      </table>
    </div>`;

  return pageShell({
    title: "Saved Instagram items by city",
    subtitle: "Kennedy export · China / Vietnam geography · " + payload.items.length + " items",
    body,
    extraScript: `<script>window.__GEO_ITEMS__ = ${itemsJson};</script>\n${kennedyClientScript()}`
  });
}

/**
 * Write extra HTML pages into pipeline/dist/<slug>/.
 * @param {string} slug
 * @returns {string[]} filenames written
 */
export function writeExtraPages(slug) {
  const outDir = join(PIPELINE_ROOT, "dist", slug);
  mkdirSync(outDir, { recursive: true });
  const written = [];
  const tripHtml = join(outDir, "trip.html");
  if (existsSync(tripHtml)) {
    copyFileSync(tripHtml, join(outDir, "index.html"));
  }

  for (const page of listExtraPages(slug)) {
    if (page.href === "gantt.html") {
      writeFileSync(join(outDir, "gantt.html"), renderGanttPage(), "utf8");
      written.push("gantt.html");
    }
    if (page.href === "kennedy-saves.html") {
      const geoPath = join(tripSourceDir(slug), "Kennedy-Data", "geo-items.json");
      if (existsSync(geoPath)) {
        writeFileSync(join(outDir, "kennedy-saves.html"), renderKennedyPage(slug), "utf8");
        written.push("kennedy-saves.html");
        const csvSrc = join(tripSourceDir(slug), "maps", "kennedy-saves-by-city.csv");
        if (existsSync(csvSrc)) {
          const mapsDir = join(outDir, "maps");
          mkdirSync(mapsDir, { recursive: true });
          copyFileSync(csvSrc, join(mapsDir, "kennedy-saves-by-city.csv"));
        }
      }
    }
  }
  return written;
}
