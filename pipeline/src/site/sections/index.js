export { renderMapsSection } from "./maps.js";
export { renderFlightsSection } from "./flights.js";
export { renderHotelsSection } from "./hotels.js";
export { renderGenericSection } from "./generic-dashboard.js";
export { renderComparisonSection } from "./comparison.js";

import { renderMapsSection } from "./maps.js";
import { renderFlightsSection } from "./flights.js";
import { renderHotelsSection } from "./hotels.js";
import { renderGenericSection } from "./generic-dashboard.js";
import { renderComparisonSection } from "./comparison.js";

const COMPARISON_SECTION_IDS = new Set([
  "restaurants",
  "attractions",
  "spas",
  "shopping-comparison",
  "hotels",
  "flights"
]);

/**
 * Dispatch to the right renderer based on section.id.
 * @param {object} section
 * @returns {string}
 */
export function renderSection(section) {
  if (section.id === "maps") {
    return renderMapsSection(section);
  }
  if (COMPARISON_SECTION_IDS.has(section.id)) {
    return renderComparisonSection(section);
  }
  return renderGenericSection(section);
}
