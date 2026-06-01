// Route Optimization slide template (the approved v1 design + real geo map).
import { esc, attrJSON, has } from "../util.js";

export const type = "route-optimization";
export const usesMap = true;

function table(hubs) {
  const rows = (hubs || []).map(h => `
        <tr>
          <td>${esc(h.hub)}</td>
          <td>${esc(h.days)}</td>
          <td>${esc(h.region)}</td>
          <td>${esc(h.primary_draw)}</td>
        </tr>`).join("");
  return `
    <table>
      <thead><tr><th>Hub</th><th>Days</th><th>Region</th><th>Primary Draw</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function transitPath(legs) {
  return (legs || []).map((leg, i) => {
    const route = leg.from === "Home" ? leg.to : `${esc(leg.from)} → ${esc(leg.to)}`;
    const bracket = `[${route}: ${esc(leg.mode)} ${esc(leg.duration)}]`;
    const prefix = i === 0 ? `<span class="leg">${esc(leg.from)} (arrive)</span>` : "";
    return `${prefix}<span class="arrow"> → </span><span class="bracket">${bracket}</span>`;
  }).join("");
}

export function render(d) {
  const mapCfg = {
    nodes: d.map_nodes || [],
    bounds: d.map_bounds || null,
    highlight_countries: d.highlight_countries || [],
    country_labels: d.country_labels || [],
    depart: d.depart_node || null
  };

  const rr = d.recommended_route || {};
  const banner = (rr.label || rr.name || rr.rationale)
    ? `<div class="banner">
         <strong>${esc(rr.label)}${rr.label && rr.name ? ": " : ""}${esc(rr.name)}</strong>
         ${esc(rr.rationale)}
       </div>`
    : "";

  const summary = d.summary && d.summary.message
    ? `<div class="summary-box">
         <span class="check" aria-hidden="true">✓</span>
         <span>${esc(d.summary.message)}</span>
       </div>`
    : "";

  return `
    <section class="slide">
      <h1 class="slide-title">${esc(d.slide_title || d.title || "Route Optimization")}</h1>
      ${banner}
      <div class="main">
        <div class="map-panel" data-geomap="${attrJSON(mapCfg)}">
          <span class="map-caption">Open-Jaw Route</span>
        </div>
        <div class="table-panel">${table(d.hubs)}</div>
      </div>
      <div class="footer">
        <div class="transit-path">${transitPath(d.transit_legs)}</div>
        ${summary}
      </div>
      <div class="watermark">travel-genie · ${esc(d.trip)}</div>
    </section>`;
}
