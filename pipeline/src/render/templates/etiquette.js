// Etiquette guide slide — five-panel grid: norms, phrases, train, temple, dining/onsen.
import { esc, has } from "../util.js";

export const type = "etiquette";
export const usesMap = false;

const SITUATION_ICONS = {
  greeting: "👋",
  shoes: "👟",
  trash: "🗑",
  volume: "🔇",
  tipping: "💴",
  queues: "📋",
  photos: "📷",
  smoking: "🚭",
  cash: "💴",
  "hot weather": "☀",
  default: "•"
};

function situationIcon(label) {
  if (!label) return SITUATION_ICONS.default;
  const k = String(label).toLowerCase();
  for (const [key, icon] of Object.entries(SITUATION_ICONS)) {
    if (k.includes(key)) return icon;
  }
  return SITUATION_ICONS.default;
}

function renderTable(t, opts = {}) {
  if (!t?.rows?.length && !has(t?.items)) return "";
  const cols = (t.columns || []).map(c => `<th>${esc(c)}</th>`).join("");
  const rows = (t.rows || []).map((r, ri) => {
    const cells = r.map((cell, i) => {
      let content = esc(cell);
      if (opts.doDont && i === 1) {
        content = `<span class="etiq-do"><span class="etiq-cell-ic" aria-hidden="true">✓</span>${esc(cell)}</span>`;
      }
      if (opts.doDont && i === 2) {
        content = `<span class="etiq-dont"><span class="etiq-cell-ic" aria-hidden="true">✗</span>${esc(cell)}</span>`;
      }
      if (opts.ruleDetail && i === 0) {
        content = `<span class="etiq-rule"><span class="etiq-cell-ic" aria-hidden="true">•</span>${esc(cell)}</span>`;
      }
      if (opts.situationIcon && i === 0) {
        content = `<span class="etiq-situation"><span class="etiq-cell-ic" aria-hidden="true">${situationIcon(cell)}</span>${esc(cell)}</span>`;
      }
      const tag = i === 0 && r.length > 1 && !opts.allTd ? "th" : "td";
      const scope = tag === "th" ? ' scope="row"' : "";
      return `<${tag}${scope}>${content}</${tag}>`;
    });
    const stripe = ri % 2 === 1 ? " class=\"etiq-stripe\"" : "";
    return `<tr${stripe}>${cells.join("")}</tr>`;
  }).join("");
  return `<table class="etiq-table">${cols ? `<thead><tr>${cols}</tr></thead>` : ""}<tbody>${rows}</tbody></table>`;
}

function renderListCol(col) {
  const items = (col.items || []).map(item => {
    const label = item.label || item.custom || item.rule || item[0];
    const detail = item.detail || item.note || item[1] || "";
    const icon = item.icon || "•";
    return `
      <li>
        <span class="etiq-list-item">
          <span class="etiq-cell-ic" aria-hidden="true">${esc(icon)}</span>
          <span><strong>${esc(label)}</strong>${detail ? ` — ${esc(detail)}` : ""}</span>
        </span>
      </li>`;
  }).join("");
  return `
    <div class="etiq-list-col">
      <div class="etiq-list-head">${esc(col.heading || col.caption || "")}</div>
      <ul class="etiq-list">${items}</ul>
    </div>`;
}

function renderPanel(panel, bodyHtml) {
  if (!panel && !bodyHtml) return "";
  const foot = panel?.footer
    ? `<div class="etiq-panel-foot">${esc(panel.footer)}</div>`
    : "";
  return `
    <div class="etiq-panel">
      ${panel?.caption ? `<div class="etiq-panel-head">${esc(panel.caption)}</div>` : ""}
      <div class="etiq-panel-body">${bodyHtml}</div>
      ${foot}
    </div>`;
}

function panelFromTable(panel, opts = {}) {
  return renderPanel(panel, renderTable(panel, opts));
}

function panelFromLists(panel) {
  const cols = (panel.columns || []).map(renderListCol).join("");
  return renderPanel(panel, `<div class="etiq-split">${cols}</div>`);
}

export function render(d) {
  const titleMain = d.slide_title || "ETIQUETTE";
  const titleAccent = d.slide_title_accent || "GUIDE";

  const daily = d.daily_norms || d.panels?.daily_norms;
  const phrases = d.phrases || d.panels?.phrases;
  const train = d.train || d.panels?.train;
  const temple = d.temple || d.panels?.temple;
  const dining = d.dining || d.panels?.dining;

  const topRow = [
    daily ? panelFromTable(daily, { situationIcon: true, doDont: true }) : "",
    phrases ? panelFromTable(phrases) : ""
  ].join("");

  const bottomRow = [
    train ? panelFromTable(train, { ruleDetail: true, allTd: false }) : "",
    temple ? panelFromTable(temple) : "",
    dining ? panelFromLists(dining) : ""
  ].join("");

  if (!topRow && !bottomRow) {
    return `
      <section class="slide">
        <h1 class="slide-title">${esc(titleMain)}</h1>
        <p class="intro">${esc(d.intro || "No etiquette content extracted.")}</p>
        <div class="watermark">travel-genie · ${esc(d.trip)}</div>
      </section>`;
  }

  return `
    <section class="slide etiq-slide">
      <div class="etiq-top-bar" aria-hidden="true"></div>
      <h1 class="etiq-slide-title">
        <span class="etiq-title-main">${esc(titleMain)}</span>
        <span class="etiq-title-accent">${esc(titleAccent)}</span>
      </h1>
      <div class="etiq-grid">
        <div class="etiq-top">${topRow}</div>
        <div class="etiq-bottom">${bottomRow}</div>
      </div>
      ${d.footer ? `<div class="etiq-footer-bar">${esc(d.footer)}</div>` : ""}
      <div class="watermark">travel-genie · ${esc(d.trip)}</div>
    </section>`;
}
