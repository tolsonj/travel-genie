// Food & Dining Strategy slide — profile intel sidebar, regional map, day-by-day meal grid.
import { esc, attrJSON, has } from "../util.js";

export const type = "food-dining";
export const usesMap = true;

const MEAL_ICONS = {
  onigiri: "🍙",
  konbini: "🍙",
  ramen: "🍜",
  sushi: "🍣",
  yakitori: "🍢",
  skewers: "🍢",
  ekiben: "🍱",
  bento: "🍱",
  market: "🏪",
  kaiseki: "🍽",
  obanzai: "🍽",
  soba: "🍜",
  takoyaki: "🐙",
  okonomiyaki: "🥞",
  kushikatsu: "🍢",
  beef: "🥩",
  default: "🍴"
};

function mealIcon(key) {
  if (!key) return MEAL_ICONS.default;
  const k = String(key).toLowerCase();
  return MEAL_ICONS[k] || MEAL_ICONS.default;
}

function intelBox(label, content) {
  if (!content) return "";
  return `
    <div class="food-intel-box">
      <div class="food-intel-head">${esc(label)}</div>
      <div class="food-intel-body">${content}</div>
    </div>`;
}

function profileIntel(d) {
  const text = d.profile_intelligence?.text || d.intro;
  if (!text) return "";
  return intelBox(d.profile_intelligence?.label || "Profile Intelligence", `<p>${esc(text)}</p>`);
}

function diningIntel(d) {
  const intel = d.dining_intelligence || d.intelligence;
  if (!intel) return "";

  if (intel.text && !has(intel.items)) {
    return intelBox(intel.label || "Food & Dining Intelligence", `<p>${esc(intel.text)}</p>`);
  }

  const items = (intel.items || []).map(
    item => `<li><strong>${esc(item.label)}:</strong> ${esc(item.value)}</li>`
  ).join("");
  return intelBox(
    intel.label || "Food & Dining Intelligence",
    `<ul class="food-intel-list">${items}</ul>`
  );
}

function regionalCallouts(regions) {
  return (regions || []).map(r => `
    <div class="food-region-card">
      <div class="food-region-hub">${esc(r.hub)}</div>
      <div class="food-region-dish"><strong>Key:</strong> ${esc(r.key_dish)}</div>
      ${r.detail ? `<div class="food-region-detail">${esc(r.detail)}</div>` : ""}
      ${r.neighborhoods ? `<div class="food-region-hood"><strong>Best neighborhoods:</strong> ${esc(r.neighborhoods)}</div>` : ""}
    </div>`
  ).join("");
}

function regionalPanel(d) {
  const reg = d.regional || {};
  const mapCfg = {
    nodes: reg.map_nodes || d.map_nodes || [],
    bounds: reg.map_bounds || d.map_bounds || null,
    highlight_countries: reg.highlight_countries || d.highlight_countries || [],
    country_labels: reg.country_labels || d.country_labels || [],
    hide_route: true
  };

  const subtitle = reg.subtitle
    ? `<div class="food-regional-kicker">${esc(reg.subtitle)}</div>`
    : "";
  const caption = reg.caption || "Regional";

  return `
    <div class="food-regional">
      ${subtitle}
      <div class="food-regional-title">${esc(caption)}</div>
      <div class="food-regional-grid">
        <div class="food-regional-callouts">${regionalCallouts(reg.regions)}</div>
        <div class="food-regional-map map-panel" data-geomap="${attrJSON(mapCfg)}"></div>
      </div>
    </div>`;
}

function mealTableBlock(days) {
  const dayHeaders = days.map(d => `<th>${esc(String(d.day))}</th>`).join("");
  const contextRow = days.map(d => `<td>${esc(d.context || "")}</td>`).join("");
  const strategyRow = days.map(d => {
    const icon = mealIcon(d.icon);
    const label = d.strategy ? esc(d.strategy) : "";
    return `<td class="food-meal-cell"><span class="food-meal-icon" aria-hidden="true">${icon}</span><span>${label}</span></td>`;
  }).join("");

  return `
    <table class="food-meal-table">
      <thead>
        <tr><th class="food-meal-corner"></th>${dayHeaders}</tr>
      </thead>
      <tbody>
        <tr><th scope="row">Context</th>${contextRow}</tr>
        <tr><th scope="row">Meal Strategy</th>${strategyRow}</tr>
      </tbody>
    </table>`;
}

function mealMappingTable(mapping) {
  if (!mapping?.days?.length) return "";
  const days = mapping.days;
  const splitAt = days.length > 10 ? 7 : days.length;
  const blocks = [];
  for (let i = 0; i < days.length; i += splitAt) {
    blocks.push(days.slice(i, i + splitAt));
  }

  return `
    <div class="food-meal-panel">
      <div class="food-meal-title">${esc(mapping.caption || "Day-by-Day Meal Mapping")}</div>
      <div class="food-meal-tables${blocks.length > 1 ? " food-meal-tables-split" : ""}">
        ${blocks.map(mealTableBlock).join("")}
      </div>
    </div>`;
}

export function render(d) {
  const titleMain = d.slide_title || "FOOD & DINING";
  const titleAccent = d.slide_title_accent || "STRATEGY";
  const footer = d.footer || d.summary?.message || d.intro;

  return `
    <section class="slide food-slide">
      <div class="food-top-bar" aria-hidden="true"></div>
      <h1 class="food-slide-title">
        <span class="food-title-main">${esc(titleMain)}</span>
        <span class="food-title-accent">${esc(titleAccent)}</span>
      </h1>
      <div class="food-body">
        <aside class="food-sidebar">
          ${profileIntel(d)}
          ${diningIntel(d)}
        </aside>
        <div class="food-content">
          ${regionalPanel(d)}
        </div>
      </div>
      ${mealMappingTable(d.meal_mapping)}
      ${footer ? `<div class="food-footer">${esc(footer)}</div>` : ""}
      <div class="watermark">travel-genie · ${esc(d.trip)}</div>
    </section>`;
}
