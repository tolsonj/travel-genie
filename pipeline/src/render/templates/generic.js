// Generic fallback slide template. Renders any aspect that has no bespoke
// template using a standard layout: title + intro banner + tables + bullet
// groups + status callouts. Ensures a NEW aspect produces an on-brand slide
// the first time, with zero design work.
import { esc, has } from "../util.js";

export const type = "generic";
export const usesMap = false;

function renderTable(t) {
  const cols = (t.columns || []).map(c => `<th>${esc(c)}</th>`).join("");
  const rows = (t.rows || []).map(r =>
    `<tr>${(r || []).map(cell => `<td>${esc(cell)}</td>`).join("")}</tr>`
  ).join("");
  const cap = t.caption ? `<div class="block-caption">${esc(t.caption)}</div>` : "";
  return `<div>${cap}<table>${cols ? `<thead><tr>${cols}</tr></thead>` : ""}<tbody>${rows}</tbody></table></div>`;
}

function renderBulletGroup(g) {
  const head = g.heading ? `<div class="block-caption">${esc(g.heading)}</div>` : "";
  const items = (g.items || []).map(i => `<li>${esc(i)}</li>`).join("");
  return `<div class="bullet-group">${head}<ul>${items}</ul></div>`;
}

function renderCallout(c) {
  const status = ["pass", "warn", "info"].includes(c.status) ? c.status : "info";
  const icon = status === "pass" ? "✓" : status === "warn" ? "⚠" : "ℹ";
  return `<div class="callout ${status}"><span class="ic">${icon}</span><span>${esc(c.text)}</span></div>`;
}

export function render(d) {
  const intro = d.intro ? `<div class="banner"><strong>${esc(d.title || "")}</strong>${esc(d.intro)}</div>` : "";

  // Distribute content across two columns: tables/bullets left, the rest right.
  const tables = (d.tables || []).map(renderTable).join("");
  const bullets = (d.bullets || []).map(renderBulletGroup).join("");
  const callouts = has(d.callouts)
    ? `<div><div class="block-caption">Validation</div><div class="callouts">${d.callouts.map(renderCallout).join("")}</div></div>`
    : "";

  const left = tables || `<div class="intro">${esc(d.intro || "No structured content extracted for this aspect.")}</div>`;
  const right = [bullets, callouts].filter(Boolean).join("");

  return `
    <section class="slide">
      <h1 class="slide-title">${esc(d.slide_title || d.title || d.aspect || "Aspect")}</h1>
      ${intro}
      <div class="generic-body">
        <div class="generic-col">${left}</div>
        <div class="generic-col">${right}</div>
      </div>
      <div class="footer">
        <div class="transit-path">Generated from <em>${esc(d.aspect)}</em> · generic layout</div>
      </div>
      <div class="watermark">travel-genie · ${esc(d.trip)}</div>
    </section>`;
}
