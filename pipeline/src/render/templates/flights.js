// Flight comparison slide — dashboard layout tuned for per-leg fare tables.
import { normalizeDashboard, panelBox, sidebarBlock, slideChrome } from "../shared/deck-dashboard.js";

export const type = "flights";
export const usesMap = false;

export function render(raw) {
  const d = normalizeDashboard(raw);
  const sidebar = (d.sidebar || []).map(sidebarBlock).filter(Boolean).join("");
  const panels = (d.panels || []).map(panelBox).filter(Boolean).join("");

  const body =
    panels || sidebar
      ? `<div class="dash-body">
           ${sidebar ? `<aside class="dash-sidebar">${sidebar}</aside>` : ""}
           ${panels ? `<div class="dash-content"><div class="dash-grid dash-grid-flights">${panels}</div></div>` : ""}
         </div>`
      : `<p class="intro">No flight comparison data.</p>`;

  return slideChrome(d, body).replace(
    'class="slide dash-slide"',
    'class="slide dash-slide dash-slide-flights"'
  );
}
