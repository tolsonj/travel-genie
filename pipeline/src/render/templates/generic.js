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

function isComparisonAspect(d) {
  return /-comparison$/i.test(d.aspect || "");
}

function isCityTable(t) {
  return /^city:/i.test(t.caption || "");
}

function slideFooter(d) {
  return `
      <div class="footer">
        <div class="transit-path">Generated from <em>${esc(d.aspect)}</em> · generic layout</div>
      </div>
      <div class="watermark">travel-genie · ${esc(d.trip)}</div>`;
}

function renderComparisonSlide(d, cityTable, rightHtml, multiCity) {
  const intro = d.intro
    ? `<div class="banner"><strong>${esc(d.title || "")}</strong>${esc(d.intro)}</div>`
    : "";
  const cityLabel = (cityTable.caption || "").replace(/^City:\s*/i, "");
  const baseTitle = d.slide_title || d.title || d.aspect || "Aspect";
  const title = multiCity ? `${baseTitle} — ${cityLabel}` : baseTitle;
  const bodyClass = rightHtml ? "generic-body comparison-body" : "generic-body comparison-body comparison-single";

  return `
    <section class="slide slide-comparison">
      <h1 class="slide-title">${esc(title)}</h1>
      ${intro}
      <div class="${bodyClass}">
        <div class="generic-col comparison-main">${renderTable(cityTable)}</div>
        ${rightHtml ? `<div class="generic-col">${rightHtml}</div>` : ""}
      </div>
      ${slideFooter(d)}
    </section>`;
}

function renderStandardSlide(d) {
  const intro = d.intro ? `<div class="banner"><strong>${esc(d.title || "")}</strong>${esc(d.intro)}</div>` : "";

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
      ${slideFooter(d)}
    </section>`;
}

export function render(d) {
  if (isComparisonAspect(d)) {
    const cityTables = (d.tables || []).filter(isCityTable);
    const other = (d.tables || []).filter(t => !isCityTable(t));
    if (cityTables.length >= 3) {
      const meta = [
        other.map(renderTable).join(""),
        (d.bullets || []).map(renderBulletGroup).join(""),
        has(d.callouts)
          ? `<div><div class="block-caption">Validation</div><div class="callouts">${d.callouts.map(renderCallout).join("")}</div></div>`
          : ""
      ].filter(Boolean).join("");
      return cityTables
        .map((city, i) => renderComparisonSlide(
          d,
          city,
          i === cityTables.length - 1 ? meta : "",
          cityTables.length > 1
        ))
        .join("\n");
    }
  }

  return renderStandardSlide(d);
}
