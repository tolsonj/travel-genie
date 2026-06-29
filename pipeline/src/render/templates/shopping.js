// Shopping strategy — regional hubs with per-city maps, day plan, tailoring.
import { esc, has, attrJSON } from "../util.js";

export const type = "shopping";
export const usesMap = true;

function watermark(trip) {
  return `<div class="watermark">travel-genie · ${esc(trip)}</div>`;
}

function shopTitle(main, accent) {
  return `
    <h1 class="shop-slide-title">
      <span class="shop-title-main">${esc(main)}</span>
      <span class="shop-title-accent">${esc(accent)}</span>
    </h1>`;
}

function hubMapPanel(hub) {
  if (!hub?.map?.nodes?.length) return "";
  return `
    <div class="shop-hub-map map-panel" data-geomap="${attrJSON(hub.map)}">
      <span class="map-caption">${esc(hub.name)} · shopping days</span>
    </div>`;
}

function dataTable(table, cls, rowLimit) {
  if (!table?.rows?.length) return "";
  const cols = (table.columns || []).map(c => `<th>${esc(c)}</th>`).join("");
  const rows = (rowLimit ? table.rows.slice(0, rowLimit) : table.rows)
    .map((r, ri) => {
      const stripe = ri % 2 === 1 ? ` class="${cls}-stripe"` : "";
      return `<tr${stripe}>${r
        .map((cell, i) => {
          const tag = i === 0 ? "th" : "td";
          const scope = tag === "th" ? ' scope="row"' : "";
          return `<${tag}${scope}>${esc(cell)}</${tag}>`;
        })
        .join("")}</tr>`;
    })
    .join("");
  return `<table class="${cls}"><thead><tr>${cols}</tr></thead><tbody>${rows}</tbody></table>`;
}

function hubTable(hub) {
  return dataTable(
    { columns: hub.columns || ["Day", "Spot", "Buy"], rows: hub.rows },
    "shop-table"
  );
}

function hubPanel(hub, tall = false) {
  const icon = hub.icon ? `<span class="shop-hub-icon" aria-hidden="true">${esc(hub.icon)}</span>` : "";
  const days = hub.days ? `<span class="shop-hub-days">${esc(hub.days)}</span>` : "";
  const cls = tall ? "shop-hub shop-hub-tall" : "shop-hub";
  const mapHtml = hubMapPanel(hub);
  const bodyCls = mapHtml ? "shop-hub-body shop-hub-body-split" : "shop-hub-body";
  return `
    <div class="${cls}">
      <div class="shop-hub-head">
        <span class="shop-hub-title">${esc(hub.name || hub.caption)}</span>
        ${days}
        ${icon}
      </div>
      <div class="${bodyCls}">
        ${mapHtml}
        <div class="shop-hub-table-wrap">${hubTable(hub)}</div>
      </div>
    </div>`;
}

function renderHubsSlide(d) {
  const titleMain = d.slide_title || "SHOPPING";
  const titleAccent = d.slide_title_accent || "HUBS";
  const kicker = d.section_kicker || d.regional?.kicker || "Regional Shopping Hubs";

  const regional = d.regional || {};
  let left = regional.left || [];
  let right = regional.right || null;

  if (!left.length && !right && has(d.hubs)) {
    const hubs = d.hubs;
    right = hubs.find(h => h.placement === "right") || hubs[hubs.length - 1];
    left = hubs.filter(h => h !== right);
  }

  if (!left.length && !right) {
    return `
      <section class="slide">
        <h1 class="slide-title">${esc(titleMain)}</h1>
        <p class="intro">${esc(d.intro || "No shopping hubs extracted.")}</p>
        ${watermark(d.trip)}
      </section>`;
  }

  const matrixHtml = d.strength_matrix?.rows?.length
    ? `<div class="shop-matrix-wrap">
        <div class="shop-matrix-caption">${esc(d.strength_matrix.caption)}</div>
        ${dataTable(d.strength_matrix, "shop-matrix-table", 4)}
      </div>`
    : "";

  return `
    <section class="slide shop-slide">
      <div class="shop-top-bar" aria-hidden="true"></div>
      ${shopTitle(titleMain, titleAccent)}
      <div class="shop-kicker">${esc(kicker)}</div>
      <div class="shop-grid">
        <div class="shop-left">${left.map(h => hubPanel(h)).join("")}</div>
        <div class="shop-right">${right ? hubPanel(right, true) : ""}</div>
      </div>
      ${matrixHtml}
      ${d.footer ? `<div class="shop-footer-bar">${esc(d.footer)}</div>` : ""}
      ${watermark(d.trip)}
    </section>`;
}

function dayCityCard(city) {
  const mapHtml = city.map?.nodes?.length
    ? `<div class="shop-day-city-map map-panel" data-geomap="${attrJSON(city.map)}">
        <span class="map-caption">${esc(city.name)}</span>
      </div>`
    : "";
  const table = dataTable(
    { columns: ["Day", "City", "Plan", "Budget"], rows: city.rows },
    "shop-day-table"
  );
  return `
    <article class="shop-day-city">
      <header class="shop-day-city-head">${esc(city.name)}</header>
      <div class="shop-day-city-body">
        ${mapHtml}
        <div class="shop-day-city-table">${table}</div>
      </div>
    </article>`;
}

function renderDayPlanSlide(d) {
  const plan = d.day_plan;
  if (!plan?.rows?.length) return "";

  const citiesHtml = has(plan.cities)
    ? `<div class="shop-day-cities">${plan.cities.map(dayCityCard).join("")}</div>`
    : `<div class="shop-day-body">${dataTable(plan, "shop-day-table")}</div>`;

  return `
    <section class="slide shop-day-slide">
      <div class="shop-top-bar" aria-hidden="true"></div>
      ${shopTitle("SHOPPING", "BY DAY")}
      <div class="shop-kicker">${esc(plan.kicker || "Recommended Shopping Days")}</div>
      ${citiesHtml}
      ${d.footer ? `<div class="shop-footer-bar">${esc(d.footer)}</div>` : ""}
      ${watermark(d.trip)}
    </section>`;
}

function renderTailorSlide(d) {
  const t = d.tailoring;
  if (!t?.tailors?.rows?.length) return "";

  const flags = has(t.red_flags)
    ? `<ul class="shop-red-flags">${t.red_flags
        .map(([flag, mean]) => `<li><strong>${esc(flag)}</strong> — ${esc(mean)}</li>`)
        .join("")}</ul>`
    : "";

  const tailorMap = t.map?.nodes?.length
    ? `<div class="shop-tailor-map map-panel" data-geomap="${attrJSON(t.map)}">
        <span class="map-caption">Hội An Ancient Town</span>
      </div>`
    : "";

  return `
    <section class="slide shop-tailor-slide">
      <div class="shop-top-bar" aria-hidden="true"></div>
      ${shopTitle("TAILORING", "HỘI AN")}
      <div class="shop-kicker">${esc(t.kicker || "Custom clothing")}</div>
      <div class="shop-tailor-banner">${esc(t.timeline || "")}</div>
      ${tailorMap}
      <div class="shop-tailor-grid">
        <div class="shop-tailor-col">
          <div class="shop-panel-caption">${esc(t.tailors.caption || "Recommended tailors")}</div>
          ${dataTable(t.tailors, "shop-table", 5)}
        </div>
        <div class="shop-tailor-col">
          ${
            t.turnaround
              ? `<div class="shop-panel-caption">${esc(t.turnaround.caption)}</div>${dataTable(t.turnaround, "shop-table", 5)}`
              : ""
          }
          ${t.protocol ? `<div class="shop-callout"><strong>Fitting protocol:</strong> ${esc(t.protocol)}</div>` : ""}
          ${flags ? `<div class="shop-panel-caption">Red flags</div>${flags}` : ""}
        </div>
      </div>
      ${watermark(d.trip)}
    </section>`;
}

export function render(d) {
  return [renderHubsSlide(d), renderDayPlanSlide(d), renderTailorSlide(d)].filter(Boolean).join("\n");
}
