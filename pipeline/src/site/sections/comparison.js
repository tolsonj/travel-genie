import { filterPublisherTables, publishIntro } from "../../shared/publish-filter.js";

function esc(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderTable(table) {
  const caption = table.caption
    ? `<h3 class="site-table-caption">${esc(table.caption)}</h3>`
    : "";
  const thead = `<thead><tr>${(table.columns ?? []).map(c => `<th>${esc(c)}</th>`).join("")}</tr></thead>`;
  const rows = table.rows ?? [];
  const tbody = `<tbody>${rows
    .map(row => `<tr>${row.map(cell => `<td>${esc(String(cell ?? ""))}</td>`).join("")}</tr>`)
    .join("")}</tbody>`;
  return `${caption}<div class="site-table-wrap"><table class="site-table">${thead}${tbody}</table></div>`;
}

const SECTION_ICONS = {
  restaurants: "🍽",
  attractions: "🏛",
  spas: "💆",
  "shopping-comparison": "🛍",
  hotels: "🏨",
  flights: "✈"
};

/**
 * Render a comparison / sidecar reference section with all tables (no cap).
 * @param {object} section
 * @returns {string}
 */
export function renderComparisonSection(section) {
  const icon = SECTION_ICONS[section.id] ?? "📋";
  const introText = publishIntro(section.intro);
  const intro = introText
    ? `<p class="site-ref-intro">${esc(introText)}</p>`
    : "";

  const bulletsHtml = Array.isArray(section.bullets)
    ? section.bullets
        .map(
          group => `<div class="site-bullet-group">
      <h3 class="site-bullet-heading">${esc(group.heading ?? "")}</h3>
      <ul class="site-bullet-list">
        ${(group.items ?? []).map(item => `<li>${esc(item)}</li>`).join("\n        ")}
      </ul>
    </div>`
        )
        .join("\n")
    : "";

  const tablesHtml = filterPublisherTables(section.tables ?? []).map(table => renderTable(table)).join("\n");

  return `<section class="site-ref-section" id="${esc(section.id)}">
  <div class="site-section-inner">
    <h2 class="site-ref-title">${icon} ${esc(section.title)}</h2>
    ${intro}
    ${bulletsHtml}
    ${tablesHtml}
  </div>
</section>`;
}
