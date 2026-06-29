// Packing strategy slide — essentials sidebar, wardrobe/gear grids, luggage flow.
import { esc, has } from "../util.js";

export const type = "packing";
export const usesMap = false;

const STATUS_ICONS = {
  bring: "✅",
  skip: "❌",
  optional: "◦",
  default: "•"
};

function intelBox(label, content) {
  if (!content) return "";
  return `
    <div class="pack-intel-box">
      <div class="pack-intel-head">${esc(label)}</div>
      <div class="pack-intel-body">${content}</div>
    </div>`;
}

function essentialsPanel(essentials) {
  if (!has(essentials?.items)) return "";
  const items = essentials.items.map((item, i) => {
    const n = item.n ?? i + 1;
    const icon = item.icon ? `<span class="pack-item-ic" aria-hidden="true">${esc(item.icon)}</span>` : "";
    const detail = item.detail ? ` — ${esc(item.detail)}` : "";
    return `<li>${icon}<span><strong>${n}.</strong> ${esc(item.label)}${detail}</span></li>`;
  }).join("");
  return intelBox(essentials.caption || "Core Do Not Forget", `<ol class="pack-essentials-list">${items}</ol>`);
}

function climateBanner(climate) {
  if (!climate?.text && !climate?.summary) return "";
  const note = climate.note ? `<div class="pack-climate-note">${esc(climate.note)}</div>` : "";
  return intelBox(climate.caption || "Summer Japan Climate", `<p class="pack-climate-text">${esc(climate.text || climate.summary)}</p>${note}`);
}

function documentsPanel(docs) {
  if (!has(docs?.sections)) return "";
  const sections = docs.sections.map(s => `
    <div class="pack-doc-section">
      <div class="pack-doc-head">${esc(s.heading)}</div>
      <ul class="pack-doc-list">${(s.items || []).map(i => `<li>${esc(i)}</li>`).join("")}</ul>
    </div>`
  ).join("");
  return intelBox(docs.caption || "Document Folder", `<div class="pack-doc-grid">${sections}</div>`);
}

function renderTable(t, cls = "pack-table") {
  if (!t?.rows?.length) return "";
  const cols = (t.columns || []).map(c => `<th>${esc(c)}</th>`).join("");
  const rows = t.rows.map((r, ri) => {
    const stripe = ri % 2 === 1 ? " pack-stripe" : "";
    return `<tr class="${stripe}">${r.map((cell, i) => {
      let content = esc(cell);
      if (t.status_column === i || (t.columns?.[i] === "Bring / Rent / Skip" && i === 1)) {
        const k = String(cell).toLowerCase();
        const icon = k.includes("skip") ? STATUS_ICONS.skip
          : k.includes("optional") ? STATUS_ICONS.optional
          : k.includes("bring") || k.startsWith("✅") ? STATUS_ICONS.bring
          : STATUS_ICONS.default;
        content = `<span class="pack-status">${icon} ${esc(cell.replace(/^✅\s*|❌\s*/u, ""))}</span>`;
      }
      const tag = i === 0 && r.length > 1 ? "th" : "td";
      const scope = tag === "th" ? ' scope="row"' : "";
      return `<${tag}${scope}>${content}</${tag}>`;
    }).join("")}</tr>`;
  }).join("");
  const cap = t.caption ? `<div class="pack-table-caption">${esc(t.caption)}</div>` : "";
  return `${cap}<table class="${cls}">${cols ? `<thead><tr>${cols}</tr></thead>` : ""}<tbody>${rows}</tbody></table>`;
}

function hubPanel(panel) {
  if (!panel?.rows?.length && !has(panel?.items)) return "";
  const body = panel.rows?.length
    ? renderTable(panel)
    : `<ul class="pack-mini-list">${(panel.items || []).map(
        i => `<li><strong>${esc(i.label || i[0])}</strong>${i.detail || i[1] ? ` — ${esc(i.detail || i[1])}` : ""}</li>`
      ).join("")}</ul>`;
  return `
    <div class="pack-panel">
      <div class="pack-panel-head">${esc(panel.caption || panel.title || "")}</div>
      <div class="pack-panel-body">${body}</div>
    </div>`;
}

function luggageFlow(luggage) {
  if (!has(luggage?.bags)) return "";
  const bags = luggage.bags.map(b => `
    <div class="pack-bag-card">
      <div class="pack-bag-icon" aria-hidden="true">${esc(b.icon || "🧳")}</div>
      <div class="pack-bag-name">${esc(b.name)}</div>
      <div class="pack-bag-role">${esc(b.role)}</div>
    </div>`
  ).join("");
  const note = luggage.note ? `<div class="pack-luggage-note">${esc(luggage.note)}</div>` : "";
  return `
    <div class="pack-luggage">
      <div class="pack-luggage-title">${esc(luggage.caption || "Takkyubin & Luggage Strategy")}</div>
      <div class="pack-bag-row">${bags}</div>
      ${note}
    </div>`;
}

function checklistStrip(checklist) {
  if (!has(checklist?.categories)) return "";
  const cols = checklist.categories.map(cat => `
    <div class="pack-check-col">
      <div class="pack-check-head">${esc(cat.heading)}</div>
      <ul class="pack-check-list">${(cat.items || []).map(i => `<li>${esc(i)}</li>`).join("")}</ul>
    </div>`
  ).join("");
  return `
    <div class="pack-checklist">
      <div class="pack-checklist-title">${esc(checklist.caption || "Printable Checklist Highlights")}</div>
      <div class="pack-checklist-grid">${cols}</div>
    </div>`;
}

export function render(d) {
  const titleMain = d.slide_title || "PACKING";
  const titleAccent = d.slide_title_accent || "STRATEGY";
  const sectionLabel = d.section_label || "Do Not Forget";
  const sectionKicker = d.section_kicker || "Summer Wardrobe · Gear · Luggage Flow";

  const sidebar = [
    climateBanner(d.climate),
    essentialsPanel(d.essentials),
    documentsPanel(d.documents)
  ].filter(Boolean).join("");

  const gridPanels = [
    d.wardrobe,
    d.adventure,
    d.tech,
    d.health
  ].filter(p => p?.rows?.length || has(p?.items)).map(hubPanel).join("");

  const extras = [
    d.transit_bag ? hubPanel(d.transit_bag) : "",
    d.flight_outfit ? hubPanel(d.flight_outfit) : ""
  ].filter(Boolean).join("");

  return `
    <section class="slide pack-slide">
      <div class="pack-top-bar" aria-hidden="true"></div>
      <h1 class="pack-slide-title">
        <span class="pack-title-main">${esc(titleMain)}</span>
        <span class="pack-title-accent">${esc(titleAccent)}</span>
      </h1>
      <div class="pack-section-row">
        <span class="pack-section-pill">${esc(sectionLabel)}</span>
        <span class="pack-section-kicker">${esc(sectionKicker)}</span>
      </div>
      <div class="pack-body">
        <aside class="pack-sidebar">${sidebar}</aside>
        <div class="pack-content">
          <div class="pack-grid">${gridPanels}</div>
          <div class="pack-extras">${extras}</div>
          ${luggageFlow(d.luggage)}
          ${checklistStrip(d.checklist)}
        </div>
      </div>
      ${d.footer ? `<div class="pack-footer">${esc(d.footer)}</div>` : ""}
      <div class="watermark">travel-genie · ${esc(d.trip)}</div>
    </section>`;
}
