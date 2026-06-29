function esc(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function distanceLabel(v) {
  if (v.duration && v.distance) return `${v.distance} · ${v.duration} walk`;
  return v.distance || "";
}

function renderCityCard(city) {
  const mapBlock = city.static_map_url
    ? `<figure class="site-map-figure">
        <img class="site-map-img" src="${esc(city.static_map_url)}" alt="Map preview — ${esc(city.city)} — hotels and POIs" loading="lazy" />
        <figcaption class="site-map-caption">Build-time preview only — not interactive. Pins can overlap when hotels and POIs are far apart (e.g. Hội An vs Đà Nẵng).</figcaption>
      </figure>`
    : `<p class="site-map-fallback">
        <span class="site-map-hint">Run <code>sync-google-geo.js</code> with <code>GOOGLE_MAPS_API_KEY</code> for a static preview image.</span>
      </p>`;

  const altHotels = (city.alternate_hotels || [])
    .map(h => `<li class="site-map-hotel-alt">${esc(h.name)}</li>`)
    .join("\n          ");

  const hotelCompare = altHotels
    ? `<div class="site-map-hotels">
        <p class="site-map-hotels-title">Also comparing</p>
        <ul class="site-map-hotels-list">${altHotels}</ul>
      </div>`
    : "";

  const venues = (city.venues || [])
    .map(v => {
      const dist = distanceLabel(v);
      const distCell = v.directions_url
        ? `<a href="${esc(v.directions_url)}" target="_blank" rel="noopener">${esc(dist)}</a>`
        : esc(dist);
      const kind =
        v.kind === "restaurant" ? "Restaurant" : v.kind === "shopping" ? "Shopping" : "Venue";
      return `<li class="site-map-venue">
        <span class="site-map-venue-name">${esc(v.venue)}</span>
        <span class="site-map-venue-kind">${esc(kind)}</span>
        <span class="site-map-venue-dist">${distCell}</span>
      </li>`;
    })
    .join("\n        ");

  const source =
    city.distance_source === "google-maps"
      ? "Google Maps walking distances from your hotel"
      : "Straight-line distances — run geo sync for walk times";

  return `<article class="site-map-city" id="map-${esc(city.city_slug)}">
      <header class="site-map-city-head">
        <h3 class="site-map-city-title">${esc(city.city)}</h3>
        <p class="site-map-city-sub">${esc(city.hotel)} · ${esc(source)}</p>
        <div class="site-map-actions">
          <a class="site-map-import" href="${esc(city.city_map_csv)}" download>Download ${esc(city.city)} CSV</a>
          <a class="site-map-open-all" href="https://www.google.com/maps/d/" target="_blank" rel="noopener">Open Google My Maps</a>
        </div>
      </header>
      ${mapBlock}
      ${hotelCompare}
      <ul class="site-map-venue-list" aria-label="POIs near recommended hotel">
        ${venues}
      </ul>
    </article>`;
}

/**
 * Maps section: per-city Google static maps + venue distances from hotel.
 * @param {object} section
 * @returns {string}
 */
export function renderMapsSection(section) {
  const intro = section.intro
    ? `<p class="site-ref-intro">${esc(section.intro)}</p>`
    : "";

  const citiesHtml = (section.cities || []).map(renderCityCard).join("\n    ");

  const layerCsvs = (section.my_maps || []).filter(f => !f.href.includes("-all.csv"));
  const cityCsvs = (section.my_maps || []).filter(f => f.href.includes("-all.csv"));

  const layerCsvHtml = layerCsvs.length
    ? `<div class="site-map-layer-downloads">
        <h3 class="site-map-csv-title">Download layer CSVs</h3>
        <p class="site-map-csv-note">Import each file as a <strong>separate layer</strong> in Google My Maps (hotels · shopping · restaurants · attractions).</p>
        <ul class="site-map-layer-grid">
          ${layerCsvs
            .map(
              f =>
                `<li><a class="site-map-layer-btn" href="${esc(f.href)}" download>${esc(f.label)}</a><span class="site-map-csv-meta">${esc(f.href)}</span></li>`
            )
            .join("\n          ")}
        </ul>
      </div>`
    : "";

  const csvHtml = (section.my_maps || []).length
    ? `${layerCsvHtml}<div class="site-map-csv">
        <h3 class="site-map-csv-title">Import into Google My Maps</h3>
        <p class="site-map-csv-note"><strong>Regular Google Maps</strong> (maps.google.com) does <em>not</em> read CSV files from this site. You need <a href="https://www.google.com/maps/d/" target="_blank" rel="noopener">Google My Maps</a> — a separate product — and a one-time import.</p>
        <ol class="site-map-steps">
          <li>Open <a href="https://www.google.com/maps/d/" target="_blank" rel="noopener">Google My Maps</a> → <strong>Create new map</strong> (or open your existing trip map, e.g. “HK Shopping”).</li>
          <li><strong>Add layer</strong> → <strong>Import</strong> → pick a CSV from above (repeat for each layer).</li>
          <li>Or use a city bundle below for one layer with everything in that hub.</li>
          <li>On your phone: Google Maps app → <strong>Saved</strong> → <strong>Maps</strong> → open your map.</li>
        </ol>
        ${
          cityCsvs.length
            ? `<h4 class="site-map-csv-subtitle">City bundles (optional)</h4>
        <ul class="site-map-csv-list">
          ${cityCsvs
            .map(
              f =>
                `<li><a href="${esc(f.href)}" download>${esc(f.label)}</a> <span class="site-map-csv-meta">${esc(f.description)}</span></li>`
            )
            .join("\n          ")}
        </ul>`
            : ""
        }
      </div>`
    : layerCsvHtml;

  return `<section class="site-ref-section site-maps-section" id="${esc(section.id)}">
  <div class="site-section-inner">
    <h2 class="site-ref-title">🗺 ${esc(section.title)}</h2>
    ${intro}
    ${csvHtml}
    <p class="site-map-legend"><span class="site-map-legend-h">H</span> recommended hotel · <span class="site-map-legend-alt">2·3·4</span> other hotels · <span class="site-map-legend-s">S</span> shopping · <span class="site-map-legend-r">R</span> restaurant</p>
    <div class="site-map-cities">
    ${citiesHtml}
    </div>
    ${csvHtml}
  </div>
</section>`;
}
