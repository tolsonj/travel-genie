// Culture & Museums slide — philosophy sidebar, regional hub grid, audit footer.
import { esc, has } from "../util.js";

export const type = "culture-museums";
export const usesMap = false;

function intelBox(label, content) {
  if (!content) return "";
  return `
    <div class="culture-intel-box">
      <div class="culture-intel-head">${esc(label)}</div>
      <div class="culture-intel-body">${content}</div>
    </div>`;
}

function philosophyPanel(philosophy) {
  const items = (philosophy?.items || philosophy?.rows || []).map(item => {
    if (Array.isArray(item)) {
      return `<li><span class="culture-rule-ic" aria-hidden="true">${esc(item[2] || "•")}</span><span><strong>${esc(item[0])}</strong> — ${esc(item[1])}</span></li>`;
    }
    return `<li><span class="culture-rule-ic" aria-hidden="true">${esc(item.icon || "•")}</span><span><strong>${esc(item.rule)}</strong> — ${esc(item.why)}</span></li>`;
  }).join("");
  if (!items) return "";
  return intelBox(philosophy.label || philosophy.caption || "Culture Philosophy", `<ul class="culture-intel-list">${items}</ul>`);
}

function themesPanel(themes) {
  if (!has(themes?.items)) return "";
  const items = themes.items.map((t, i) => `<li><span class="culture-theme-n">${i + 1}.</span> ${esc(t)}</li>`).join("");
  return intelBox(themes.caption || "Cross-Hub Themes", `<ul class="culture-theme-list">${items}</ul>`);
}

function fatiguePanel(audit) {
  if (!audit?.rows?.length) return "";
  const cols = (audit.columns || []).map(c => `<th>${esc(c)}</th>`).join("");
  const rows = audit.rows.map(r =>
    `<tr>${r.map((cell, i) => {
      const tag = i === 0 ? "th" : "td";
      const scope = tag === "th" ? ' scope="row"' : "";
      return `<${tag}${scope}>${esc(cell)}</${tag}>`;
    }).join("")}</tr>`
  ).join("");
  const verdict = audit.verdict
    ? `<div class="culture-audit-verdict ${audit.verdict_status || "pass"}"><span class="culture-audit-ic" aria-hidden="true">${audit.verdict_status === "warn" ? "⚠" : "✓"}</span>${esc(audit.verdict)}</div>`
    : "";
  return intelBox(
    audit.caption || "Museum Fatigue Audit",
    `<table class="culture-audit-table"><thead><tr>${cols}</tr></thead><tbody>${rows}</tbody></table>${verdict}`
  );
}

function hubTable(hub) {
  const cols = (hub.columns || ["Day", "Primary", "Secondary"]).map(c => `<th>${esc(c)}</th>`).join("");
  const rows = (hub.rows || []).map((r, ri) => {
    const stripe = ri % 2 === 1 ? " class=\"culture-stripe\"" : "";
    return `<tr${stripe}>${r.map((cell, i) => {
      const tag = i === 0 ? "th" : "td";
      const scope = tag === "th" ? ' scope="row"' : "";
      return `<${tag}${scope}>${esc(cell)}</${tag}>`;
    }).join("")}</tr>`;
  }).join("");
  const note = hub.note ? `<div class="culture-hub-note">${esc(hub.note)}</div>` : "";
  const highlights = has(hub.highlights)
    ? `<ul class="culture-hub-highlights">${hub.highlights.map(h => `<li>${esc(h)}</li>`).join("")}</ul>`
    : "";
  return `
    <article class="culture-hub">
      <header class="culture-hub-head">
        <span class="culture-hub-name">${esc(hub.name)}</span>
        ${hub.days ? `<span class="culture-hub-days">${esc(hub.days)}</span>` : ""}
        ${hub.icon ? `<span class="culture-hub-icon" aria-hidden="true">${esc(hub.icon)}</span>` : ""}
      </header>
      <div class="culture-hub-body">
        <table class="culture-hub-table">${cols ? `<thead><tr>${cols}</tr></thead>` : ""}<tbody>${rows}</tbody></table>
        ${highlights}${note}
      </div>
    </article>`;
}

function spotlightStrip(spotlight) {
  if (!has(spotlight?.columns)) return "";
  const cols = spotlight.columns.map(col => `
    <div class="culture-spot-col">
      <div class="culture-spot-head">${esc(col.heading || col.caption || "")}</div>
      <ul class="culture-spot-list">${(col.items || []).map(
        item => `<li><strong>${esc(item.label || item[0])}</strong>${item.detail || item[1] ? ` — ${esc(item.detail || item[1])}` : ""}</li>`
      ).join("")}</ul>
    </div>`
  ).join("");
  return `
    <div class="culture-spotlight">
      <div class="culture-spotlight-title">${esc(spotlight.caption || "Site Notes & Rainy Backups")}</div>
      <div class="culture-spotlight-grid">${cols}</div>
    </div>`;
}

export function render(d) {
  const titleMain = d.slide_title || "CULTURE &";
  const titleAccent = d.slide_title_accent || "MUSEUMS";
  const sectionLabel = d.section_label || "Culture Philosophy";
  const sectionKicker = d.section_kicker || "Regional Anchors · Museum Picks · Fatigue Audit";

  const sidebar = [
    philosophyPanel(d.philosophy),
    themesPanel(d.themes),
    fatiguePanel(d.fatigue_audit)
  ].filter(Boolean).join("");

  const hubs = (d.hubs || []).map(hubTable).join("");
  const hubGrid = hubs ? `<div class="culture-hub-grid">${hubs}</div>` : "";

  return `
    <section class="slide culture-slide">
      <div class="culture-top-bar" aria-hidden="true"></div>
      <h1 class="culture-slide-title">
        <span class="culture-title-main">${esc(titleMain)}</span>
        <span class="culture-title-accent">${esc(titleAccent)}</span>
      </h1>
      <div class="culture-section-row">
        <span class="culture-section-pill">${esc(sectionLabel)}</span>
        <span class="culture-section-kicker">${esc(sectionKicker)}</span>
      </div>
      <div class="culture-body">
        <aside class="culture-sidebar">${sidebar || `<p class="intro">${esc(d.intro || "")}</p>`}</aside>
        <div class="culture-content">
          ${hubGrid}
          ${spotlightStrip(d.spotlight)}
        </div>
      </div>
      ${d.footer ? `<div class="culture-footer">${esc(d.footer)}</div>` : ""}
      <div class="watermark">travel-genie · ${esc(d.trip)}</div>
    </section>`;
}
