// Generic deck-dashboard slide — sidebar intel + panel grid; matches bespoke deck chrome.
import { has } from "../util.js";
import {
  normalizeDashboard, panelBox, sidebarBlock, slideChrome
} from "../shared/deck-dashboard.js";

export const type = "dashboard";
export const usesMap = false;

export function render(raw) {
  const d = normalizeDashboard(raw);

  const sidebar = (d.sidebar || []).map(sidebarBlock).filter(Boolean).join("");
  const panels = (d.panels || []).map(panelBox).filter(Boolean).join("");

  const body = panels || sidebar
    ? `<div class="dash-body">
         ${sidebar ? `<aside class="dash-sidebar">${sidebar}</aside>` : ""}
         ${panels ? `<div class="dash-content"><div class="dash-grid">${panels}</div></div>` : ""}
       </div>`
    : `<p class="intro">No structured content for this aspect.</p>`;

  const scorecard = d.scorecard?.rows?.length
    ? `<div class="dash-scorecard">${panelBox({ caption: d.scorecard.caption || "Scorecard", ...d.scorecard })}</div>`
    : "";

  return slideChrome(d, body + scorecard);
}
