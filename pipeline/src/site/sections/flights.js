function esc(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderTable(table, maxRows = 20) {
  const caption = table.caption
    ? `<h3 class="site-table-caption">${esc(table.caption)}</h3>`
    : "";
  const thead = `<thead><tr>${(table.columns ?? []).map(c => `<th>${esc(c)}</th>`).join("")}</tr></thead>`;
  const rows = (table.rows ?? []).slice(0, maxRows);
  const tbody = `<tbody>${rows
    .map(row => `<tr>${row.map(cell => `<td>${esc(String(cell ?? ""))}</td>`).join("")}</tr>`)
    .join("")}</tbody>`;
  return `${caption}<div class="site-table-wrap"><table class="site-table">${thead}${tbody}</table></div>`;
}

/**
 * Render the Flights reference section HTML.
 * @param {object} section - section object from trip-site model
 * @returns {string} HTML string
 */
export function renderFlightsSection(section) {
  const intro = section.intro
    ? `<p class="site-ref-intro">${esc(section.intro)}</p>`
    : "";

  const tables = (section.tables ?? []).slice(0, 6);
  const tablesHtml = tables.map(table => renderTable(table)).join("\n");

  return `<section class="site-ref-section" id="${esc(section.id)}">
  <div class="site-section-inner">
    <h2 class="site-ref-title">✈ ${esc(section.title)}</h2>
    ${intro}
    ${tablesHtml}
    <p class="site-ref-note">Flight prices are estimates. Verify at time of booking.</p>
  </div>
</section>`;
}
