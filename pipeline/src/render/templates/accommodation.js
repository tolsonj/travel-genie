// Accommodation Strategy slide — strategy sidebar, budget/district tables, top picks.
import { esc, has } from "../util.js";

export const type = "accommodation";
export const usesMap = false;

function renderTable(t, cls = "acc-table") {
  if (!t?.rows?.length) return "";
  const cols = (t.columns || []).map(c => `<th>${esc(c)}</th>`).join("");
  const rows = t.rows.map(r =>
    `<tr>${r.map((cell, i) => {
      const tag = i === 0 && r.length > 1 ? "th" : "td";
      const scope = tag === "th" ? ' scope="row"' : "";
      return `<${tag}${scope}>${esc(cell)}</${tag}>`;
    }).join("")}</tr>`
  ).join("");
  const cap = t.caption
    ? `<div class="acc-table-caption">${esc(t.caption)}</div>`
    : "";
  const foot = t.footnote ? `<div class="acc-table-foot">${esc(t.footnote)}</div>` : "";
  return `${cap}<table class="${cls}">${cols ? `<thead><tr>${cols}</tr></thead>` : ""}<tbody>${rows}</tbody></table>${foot}`;
}

function strategyPanel(strategy) {
  if (!strategy) return "";
  const intro = strategy.intro ? `<li><strong>${esc(strategy.intro)}</strong></li>` : "";
  const header = strategy.label
    ? `<li><strong>${esc(strategy.label)}</strong></li>`
    : `<li><strong>Booking Strategy (Solo)</strong></li>`;
  const tactics = (strategy.tactics || []).map(
    t => `<li><strong>${esc(t.tactic)}</strong> — ${esc(t.why)}</li>`
  ).join("");
  const notes = (strategy.notes || []).map(n => `<li>${esc(n)}</li>`).join("");
  return `
    <div class="acc-strategy-box">
      <div class="acc-strategy-head">${esc(strategy.title || "Accommodation")}</div>
      <ul class="acc-strategy-list">${intro}${header}${tactics}${notes}</ul>
    </div>`;
}

function topPicksColumn(col) {
  const items = (col.items || col.rows || []).map(item => {
    if (Array.isArray(item)) {
      return `<li><strong>${esc(item[0])}</strong> — ${esc(item.slice(1).join(" · "))}</li>`;
    }
    const parts = [item.property, item.area || item.type, item.price || item.est, item.why]
      .filter(Boolean);
    return `<li><strong>${esc(item.property)}</strong> — ${esc(parts.slice(1).join(" · "))}</li>`;
  }).join("");
  return `
    <div class="acc-picks-col">
      <div class="acc-picks-col-head">${esc(col.heading || col.caption || "Top Picks")}</div>
      ${col.subheading ? `<div class="acc-picks-sub">${esc(col.subheading)}</div>` : ""}
      <ul class="acc-picks-list">${items}</ul>
    </div>`;
}

export function render(d) {
  const titleMain = d.slide_title || "ACCOMMODATION";
  const titleAccent = d.slide_title_accent || "STRATEGY";
  const sectionLabel = d.section_label || "Accommodation Strategy";
  const sectionKicker = d.section_kicker || "Budget Breakdown & Neighborhoods";

  const budget = renderTable(d.budget, "acc-table acc-budget-table");
  const districts = (d.districts || []).map(t => renderTable(t)).join("");
  const tablesRight = `
    <div class="acc-tables-grid">
      <div class="acc-budget-col">${budget}</div>
      <div class="acc-districts-col">${districts}</div>
    </div>`;

  const picks = has(d.top_picks?.columns)
    ? d.top_picks.columns.map(topPicksColumn).join("")
    : has(d.top_picks)
      ? topPicksColumn(d.top_picks)
      : "";

  const picksBlock = picks
    ? `<div class="acc-picks-panel">
         <div class="acc-picks-title">${esc(d.top_picks?.caption || "Top Picks & Recommendations")}</div>
         <div class="acc-picks-grid">${picks}</div>
       </div>`
    : "";

  const footer = d.footer
    ? `<div class="acc-footer-bar">${esc(d.footer)}</div>`
    : "";

  return `
    <section class="slide acc-slide">
      <div class="acc-top-bar" aria-hidden="true"></div>
      <h1 class="acc-slide-title">
        <span class="acc-title-main">${esc(titleMain)}</span>
        <span class="acc-title-accent">${esc(titleAccent)}</span>
      </h1>
      <div class="acc-section-row">
        <span class="acc-section-pill">${esc(sectionLabel)}</span>
        <span class="acc-section-kicker">${esc(sectionKicker)}</span>
      </div>
      <div class="acc-main">
        ${strategyPanel(d.strategy)}
        ${tablesRight}
      </div>
      ${picksBlock}
      ${footer}
      <div class="watermark">travel-genie · ${esc(d.trip)}</div>
    </section>`;
}
