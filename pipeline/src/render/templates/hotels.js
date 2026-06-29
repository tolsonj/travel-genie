// Hotel comparison slide + per-city proximity maps (Google Static Maps when configured).
import { esc, attrJSON } from "../util.js";
import { normalizeDashboard, panelBox, sidebarBlock, slideChrome } from "../shared/deck-dashboard.js";

export const type = "hotels";
export const usesMap = true;

function distanceLabel(d) {
  if (d.duration && d.distance) return `${d.distance} · ${d.duration} walk`;
  return d.distance || "";
}

function proximitySlide(cityBlock, trip) {
  const sourceNote =
    cityBlock.distance_source === "google-maps"
      ? "Google Maps walking distances"
      : "straight-line km (run sync-google-geo for walk times)";

  const rows = (cityBlock.distances || [])
    .map(d => {
      const kind = d.kind === "restaurant" ? "Restaurant" : d.kind === "shopping" ? "Shopping" : "Venue";
      const distCell = d.directions_url
        ? `<a class="proximity-gmap-link" href="${esc(d.directions_url)}" target="_blank" rel="noopener">${esc(distanceLabel(d))}</a>`
        : esc(distanceLabel(d));
      return `<tr><th scope="row">${esc(d.venue)}</th><td>${esc(kind)}</td><td>${distCell}</td></tr>`;
    })
    .join("");

  const gmapImg = cityBlock.google_static_map_url
    ? `<img class="proximity-gmap-img" src="${esc(cityBlock.google_static_map_url)}" alt="Google Map — ${esc(cityBlock.city)}" loading="lazy" />`
    : "";

  const d3Map = cityBlock.map?.nodes?.length
    ? `<div class="proximity-map map-panel${gmapImg ? " proximity-map-fallback" : ""}" data-geomap="${attrJSON(cityBlock.map)}">
        <span class="map-caption">H = hotel · S = shopping · R = restaurant</span>
      </div>`
    : "";

  return `
    <section class="slide proximity-slide">
      <div class="dash-top-bar" aria-hidden="true"></div>
      <h1 class="dash-slide-title">
        <span class="dash-title-main">DISTANCE FROM</span>
        <span class="dash-title-accent">HOTEL</span>
      </h1>
      <div class="dash-section-row">
        <span class="dash-section-pill">${esc(cityBlock.city)}</span>
        <span class="dash-section-kicker">${esc(cityBlock.hotel)} · ${esc(sourceNote)}</span>
      </div>
      <div class="proximity-body">
        <div class="proximity-map-stack">
          ${gmapImg}
          ${d3Map}
        </div>
        <div class="proximity-table-wrap">
          <table class="proximity-table">
            <thead><tr><th>Venue</th><th>Type</th><th>Distance</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>
      <div class="watermark">travel-genie · ${esc(trip)}</div>
    </section>`;
}

export function render(raw) {
  const d = normalizeDashboard(raw);
  const sidebar = (d.sidebar || []).map(sidebarBlock).filter(Boolean).join("");
  const panels = (d.panels || []).map(panelBox).filter(Boolean).join("");

  const body =
    panels || sidebar
      ? `<div class="dash-body">
           ${sidebar ? `<aside class="dash-sidebar">${sidebar}</aside>` : ""}
           ${panels ? `<div class="dash-content"><div class="dash-grid dash-grid-hotels">${panels}</div></div>` : ""}
         </div>`
      : `<p class="intro">No hotel comparison data.</p>`;

  const mainSlide = slideChrome(d, body).replace(
    'class="slide dash-slide"',
    'class="slide dash-slide dash-slide-hotels"'
  );

  const proximityHtml = (d.proximity || [])
    .filter(c => c.map?.nodes?.length > 1 || c.google_static_map_url)
    .map(c => proximitySlide(c, d.trip))
    .join("\n");

  return mainSlide + proximityHtml;
}
