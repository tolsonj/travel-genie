// Generic deck-dashboard slide — sidebar intel + panel grid; matches bespoke deck chrome.
import {
  normalizeDashboard, panelBox, sidebarBlock, slideChrome,
  splitDashboardSlides, isImmigrationSlide
} from "../shared/deck-dashboard.js";

export const type = "dashboard";
export const usesMap = false;

function renderSlide(d) {
  const immigration = isImmigrationSlide(d);
  const panelCount = (d.panels || []).length;
  const sidebar = (d.sidebar || []).map(sidebarBlock).filter(Boolean).join("");
  const panels = (d.panels || []).map(panelBox).filter(Boolean).join("");
  const gridClass = immigration
    ? "dash-grid dash-grid-immigration"
    : panelCount === 1
      ? "dash-grid dash-grid-single"
      : "dash-grid dash-grid-dense";

  const body = panels || sidebar
    ? `<div class="dash-body">
         ${sidebar ? `<aside class="dash-sidebar">${sidebar}</aside>` : ""}
         ${panels ? `<div class="dash-content"><div class="${gridClass}">${panels}</div></div>` : ""}
       </div>`
    : `<p class="intro">No structured content for this aspect.</p>`;

  const scorecard = d.scorecard?.rows?.length
    ? `<div class="dash-scorecard">${panelBox({ caption: d.scorecard.caption || "Scorecard", ...d.scorecard })}</div>`
    : "";

  let html = slideChrome(d, body + scorecard);
  if (immigration) {
    const solo = !(d.sidebar?.length);
    const cls = solo
      ? "slide dash-slide dash-slide-immigration dash-slide-immigration-solo"
      : "slide dash-slide dash-slide-immigration";
    html = html.replace('class="slide dash-slide"', `class="${cls}"`);
  } else {
    html = html.replace('class="slide dash-slide"', 'class="slide dash-slide dash-slide-dense"');
  }
  return html;
}

export function render(raw) {
  const d = normalizeDashboard(raw);
  return splitDashboardSlides(d).map(renderSlide).join("\n");
}
