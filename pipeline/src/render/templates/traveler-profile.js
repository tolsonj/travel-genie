// Traveler Profile dashboard slide (intelligence bar, metrics, seasonality, validations).
import { esc, has } from "../util.js";

export const type = "profile";
export const usesMap = false;

function metricCards(metrics) {
  return (metrics || [])
    .map(
      m => `
      <div class="metric-card">
        <span class="metric-icon" aria-hidden="true">${esc(m.icon || "•")}</span>
        <div class="metric-body">
          <div class="metric-label">${esc(m.label)}</div>
          <div class="metric-value">${esc(m.value)}</div>
        </div>
      </div>`
    )
    .join("");
}

function seasonalityTable(s) {
  if (!s?.columns?.length) return "";
  const chosen = typeof s.chosen_column === "number" ? s.chosen_column : 1;
  const cols = s.columns;
  const head = cols
    .map((c, i) => `<th class="${i === chosen ? "chosen-col" : ""}">${esc(c)}</th>`)
    .join("");
  const body = (s.rows || [])
    .map(row => {
      const cells = row.map((cell, i) => {
        const tag = i === 0 ? "th" : "td";
        const cls = i === chosen ? "chosen-col" : "";
        return `<${tag} class="${cls}"${i === 0 ? ' scope="row"' : ""}>${esc(cell)}</${tag}>`;
      });
      return `<tr>${cells.join("")}</tr>`;
    })
    .join("");
  const cap = s.caption
    ? `<div class="season-caption">${esc(s.caption)}</div>`
    : "";
  const summary = s.summary
    ? `<p class="season-summary">${esc(s.summary)}</p>`
    : "";
  return `${cap}<table class="season-table"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>${summary}`;
}

function validationColumn(items) {
  return (items || [])
    .map(v => {
      const status = v.status === "warn" ? "warn" : "pass";
      const icon = status === "warn" ? "⚠" : "✓";
      return `<div class="val-item ${status}"><span class="val-ic" aria-hidden="true">${icon}</span><span>${esc(v.text)}</span></div>`;
    })
    .join("");
}

export function render(d) {
  const country = d.country_label ? `<span class="country-pill">${esc(d.country_label)}</span>` : "";
  const intel = d.intelligence?.text
    ? `<div class="intel-bar">
         <span class="intel-label">${esc(d.intelligence.label || "Travel Intelligence")}</span>
         <p class="intel-text">${esc(d.intelligence.text)}</p>
       </div>`
    : "";

  const metrics = has(d.metrics)
    ? `<div class="metrics-grid">${metricCards(d.metrics)}</div>`
    : "";

  const season = d.seasonality ? `<div class="season-panel">${seasonalityTable(d.seasonality)}</div>` : "";

  const vals = d.validations || [];
  const mid = Math.ceil(vals.length / 2) || 0;
  const valBlock = has(vals)
    ? `<div class="profile-validations">
         <div class="val-col">${validationColumn(vals.slice(0, mid))}</div>
         <div class="val-col">${validationColumn(vals.slice(mid))}</div>
       </div>`
    : has(d.callouts)
      ? `<div class="profile-validations single">${validationColumn(
          d.callouts.map(c => ({ status: c.status, text: c.text }))
        )}</div>`
      : "";

  const main =
    metrics || season
      ? `<div class="profile-main">${metrics}${season}</div>`
      : `<div class="profile-fallback"><p class="intro">${esc(d.intro || "")}</p></div>`;

  return `
    <section class="slide profile-slide">
      <div class="slide-title-row">
        <h1 class="slide-title">${esc(d.slide_title || d.title || "Traveler Profile")}</h1>
        ${country}
      </div>
      ${intel}
      ${main}
      ${valBlock}
      <div class="watermark">travel-genie · ${esc(d.trip)}</div>
    </section>`;
}
