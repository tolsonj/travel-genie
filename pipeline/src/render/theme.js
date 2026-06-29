// Shared visual theme (the approved v1 design tokens + slide chrome).
// Exported as a CSS string that is inlined once into the deck <head>.

export const THEME_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

:root {
  --slide-w: 1280px;
  --slide-h: 720px;
  --gold: #c9920d;
  --gold-dark: #9a6f0a;
  --gold-light: #f5d98a;
  --banner-bg: #2e3f52;
  --banner-text: #f0f4f8;
  --table-head: #1e2f40;
  --table-stripe: #f3f6f9;
  --border: #cdd4dc;
  --text: #161f2a;
  --muted: #56636f;
  --pass-green: #1fa35a;
  --warn-amber: #c98a00;
  --route-line: #c9920d;
  --sea: #d6e8f4;
  --land: #dde3da;
  --land-line: #b4bfaa;
  --land-hi: #c8dcc0;
  --land-hi-line: #94b888;
  --page-bg: #1a2232;
  --slide-radius: 10px;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: "Inter", "Segoe UI", system-ui, -apple-system, sans-serif;
  background: var(--page-bg);
  background-image: radial-gradient(ellipse at 20% 0%, #243348 0%, transparent 60%),
                    radial-gradient(ellipse at 80% 100%, #1c2b1a 0%, transparent 60%);
  color: var(--text);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 36px 28px;
  gap: 28px;
  min-height: 100vh;
}

.deck-head {
  max-width: var(--slide-w);
  width: 100%;
  text-align: center;
  color: rgba(255,255,255,0.45);
  font-size: 12px;
  letter-spacing: 0.02em;
}
.deck-head h1 {
  color: rgba(255,255,255,0.9);
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 0.01em;
  margin-bottom: 4px;
}
.deck-head h1 span.deck-accent { color: var(--gold); }
.deck-head::after {
  content: '';
  display: block;
  width: 48px;
  height: 2px;
  background: linear-gradient(90deg, var(--gold), transparent);
  margin: 8px auto 0;
  border-radius: 2px;
}

.slide {
  width: var(--slide-w);
  min-height: var(--slide-h);
  background: #fff;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: var(--slide-radius);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2), 0 16px 48px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,0,0,0.1);
  padding: 36px 44px 28px;
  display: grid;
  grid-template-rows: auto auto minmax(0, 1fr) auto;
  gap: 14px;
  position: relative;
  overflow: hidden;
}

.slide-title {
  font-size: 28px;
  font-weight: 800;
  letter-spacing: 0.05em;
  color: var(--gold-dark);
  text-transform: uppercase;
}

.banner {
  background: linear-gradient(135deg, var(--banner-bg) 0%, #3a5068 100%);
  color: var(--banner-text);
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 13px;
  line-height: 1.45;
  border-left: 3px solid var(--gold);
}
.banner strong { display: block; font-size: 14px; margin-bottom: 4px; color: #fff; }

.main {
  display: grid;
  grid-template-columns: 1fr 1.05fr;
  gap: 20px;
  min-height: 420px;
}

.map-panel {
  background: var(--sea);
  border: 1px solid var(--border);
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  min-height: 420px;
}
.map-panel svg { width: 100%; height: 100%; display: block; }
.map-caption {
  position: absolute;
  left: 10px; top: 9px;
  font-size: 10px; font-weight: 700;
  letter-spacing: 0.05em; text-transform: uppercase;
  color: var(--table-head);
  background: rgba(255, 255, 255, 0.8);
  padding: 3px 8px; border-radius: 5px; z-index: 2;
}
.country-label {
  font-size: 11px; font-weight: 700; letter-spacing: 0.08em;
  fill: #8a94a0; text-transform: uppercase;
}
.city-label {
  font-size: 11px; font-weight: 700; fill: #26303b;
}
.city-label-bg {
  fill: rgba(255, 255, 255, 0.94);
  stroke: rgba(38, 48, 59, 0.12);
  stroke-width: 0.5;
}
.node-letter { font-size: 12px; font-weight: 700; fill: #fff; }

table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
thead th {
  background: linear-gradient(135deg, var(--table-head) 0%, #2e4a62 100%);
  color: #fff; text-align: left;
  padding: 8px 10px; font-weight: 700; font-size: 12px;
  letter-spacing: 0.02em;
}
tbody td {
  padding: 8px 10px; border-bottom: 1px solid var(--border);
  vertical-align: top; line-height: 1.35;
}
tbody tr:nth-child(even) td { background: var(--table-stripe); }
tbody td:first-child { font-weight: 600; }

.footer { display: grid; grid-template-columns: 1fr auto; gap: 16px; align-items: end; }

.transit-path {
  background: #fafbfc; border: 1px solid var(--border); border-radius: 8px;
  padding: 10px 14px; font-size: 11.5px; line-height: 1.6;
}
.transit-path .arrow { color: var(--gold); font-weight: 700; margin: 0 2px; }
.transit-path .bracket { color: var(--muted); font-style: italic; }

.flight-snapshot {
  margin-top: 6px; font-size: 12px; color: var(--text-secondary); line-height: 1.45;
}
.flight-snapshot strong { color: var(--gold); font-weight: 600; }
.flight-snapshot .muted { color: var(--muted); font-weight: 400; }
.flight-snapshot .flight-pick { white-space: nowrap; }

.summary-box {
  background: linear-gradient(135deg, var(--banner-bg) 0%, #3a5068 100%);
  color: var(--banner-text); border-radius: 8px;
  padding: 12px 16px; min-width: 280px; font-size: 12px; line-height: 1.45;
  display: flex; gap: 10px; align-items: flex-start;
  border: 1px solid rgba(255,255,255,0.08);
}
.summary-box .check { color: var(--pass-green); font-size: 18px; line-height: 1; flex-shrink: 0; }

/* generic fallback layout */
.generic-body { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; align-items: start; }
.generic-col { display: flex; flex-direction: column; gap: 14px; }
.slide-comparison .comparison-body { align-items: stretch; min-height: 0; }
.slide-comparison .comparison-single { grid-template-columns: 1fr; }
.slide-comparison .comparison-main table { font-size: 11.5px; }
.slide-comparison .comparison-main th,
.slide-comparison .comparison-main td { padding: 5px 8px; }
.intro { font-size: 13px; line-height: 1.5; color: var(--text); }
.block-caption {
  font-size: 11px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase;
  color: var(--table-head); margin-bottom: 6px;
}
.bullet-group { font-size: 12.5px; line-height: 1.5; }
.bullet-group ul { margin: 4px 0 0 18px; }
.callouts { display: flex; flex-direction: column; gap: 6px; }
.callout {
  font-size: 12px; padding: 7px 12px; border-radius: 6px; display: flex; gap: 8px; align-items: flex-start;
}
.callout.pass { background: #eaf7ef; border-left: 4px solid var(--pass-green); }
.callout.warn { background: #fdf6e3; border-left: 4px solid var(--warn-amber); }
.callout.info { background: #eef2f6; border-left: 4px solid var(--banner-bg); }
.callout .ic { flex-shrink: 0; }

/* traveler-profile dashboard */
.profile-slide { grid-template-rows: auto auto minmax(0, 1fr) auto; }
.slide-title-row {
  display: flex; align-items: baseline; justify-content: space-between; gap: 16px;
}
.slide-title-row .slide-title { margin: 0; border-bottom: 3px solid var(--gold); padding-bottom: 6px; flex: 1; background: linear-gradient(90deg, var(--gold-dark), var(--table-head)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.country-pill {
  font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
  color: var(--banner-bg); background: #eef2f6; border: 1px solid var(--border);
  padding: 6px 12px; border-radius: 999px; white-space: nowrap;
}
.intel-bar {
  background: linear-gradient(135deg, var(--banner-bg) 0%, #3a5068 100%);
  color: var(--banner-text); border-radius: 8px;
  padding: 12px 18px; display: grid; grid-template-columns: auto 1fr; gap: 14px; align-items: start;
  border-left: 3px solid var(--gold);
}
.intel-label {
  font-size: 10px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
  color: var(--gold); white-space: nowrap; padding-top: 2px;
}
.intel-text { font-size: 12.5px; line-height: 1.5; margin: 0; }

.profile-main { display: grid; grid-template-rows: auto auto; gap: 12px; min-height: 0; align-content: start; }
.metrics-grid {
  display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px;
}
.metric-card {
  background: #f9fafb; border: 1px solid var(--border); border-radius: 8px;
  padding: 10px 10px 8px; display: flex; flex-direction: column; gap: 6px; min-height: 72px;
  border-top: 2px solid var(--gold);
}
.metric-icon { font-size: 18px; line-height: 1; }
.metric-label {
  font-size: 9px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;
  color: var(--muted);
}
.metric-value { font-size: 11.5px; font-weight: 600; line-height: 1.35; color: var(--text); }

.season-panel { min-height: 0; }
.season-caption {
  font-size: 11px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase;
  color: var(--table-head); margin-bottom: 6px;
}
.season-table { font-size: 11.5px; }
.season-table thead th.chosen-col,
.season-table tbody td.chosen-col,
.season-table tbody th.chosen-col {
  background: #fdf8e8; border-left: 2px solid var(--gold); border-right: 2px solid var(--gold);
}
.season-table thead th.chosen-col { background: var(--gold-dark); color: #fff; border-color: var(--gold-dark); }
.season-summary {
  margin-top: 8px; font-size: 11.5px; color: var(--muted); line-height: 1.45;
}

.profile-validations {
  display: grid; grid-template-columns: 1fr 1fr; gap: 12px 20px;
  background: #f4f8f6; border: 1px solid var(--border); border-radius: 8px;
  padding: 12px 16px;
  border-left: 3px solid var(--pass-green);
}
.profile-validations.single { grid-template-columns: 1fr; }
.val-item {
  display: flex; gap: 8px; align-items: flex-start; font-size: 11px; line-height: 1.4;
}
.val-item.pass .val-ic { color: var(--pass-green); font-weight: 700; }
.val-item.warn .val-ic { color: var(--warn-amber); font-weight: 700; }
.val-ic { flex-shrink: 0; font-size: 13px; line-height: 1.2; }

/* food & dining strategy slide */
.food-slide {
  padding-top: 0;
  height: var(--slide-h);
  max-height: var(--slide-h);
  grid-template-rows: auto auto minmax(0, 1fr) auto auto;
  gap: 6px;
  overflow: hidden;
}
.food-top-bar {
  height: 4px;
  background: linear-gradient(90deg, var(--gold) 0%, var(--table-head) 50%, transparent 100%);
  margin: 0 -44px 8px;
  border-radius: 0;
}
.food-slide-title {
  font-size: 26px;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  line-height: 1.1;
  margin-bottom: 2px;
}
.food-title-main { color: var(--table-head); }
.food-title-accent { color: var(--gold); margin-left: 0.35em; }

.food-body {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 12px;
  min-height: 0;
  align-items: stretch;
  overflow: hidden;
}
.food-sidebar { display: flex; flex-direction: column; gap: 8px; min-width: 0; }
.food-intel-box {
  background: linear-gradient(160deg, #2e3f52 0%, #3d5168 100%);
  color: #fff;
  border-radius: 10px;
  overflow: hidden;
  font-size: 10.5px;
  line-height: 1.35;
  border: 1px solid rgba(255,255,255,0.08);
}
.food-intel-head {
  background: rgba(255,255,255,0.08);
  border-bottom: 1px solid rgba(255,255,255,0.1);
  padding: 7px 12px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.food-intel-body { padding: 10px 12px 12px; }
.food-intel-body p { margin: 0; }
.food-intel-list {
  margin: 0;
  padding-left: 16px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.food-intel-list li { padding-left: 2px; }

.food-content { display: flex; flex-direction: column; gap: 8px; min-height: 0; min-width: 0; overflow: hidden; }
.food-regional-kicker {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
  margin-bottom: 2px;
}
.food-regional-title {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text);
  margin-bottom: 8px;
}
.food-regional-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  min-height: 0;
  height: 150px;
}
.food-regional-callouts {
  display: flex;
  flex-direction: column;
  gap: 5px;
  justify-content: center;
  min-height: 0;
  overflow: hidden;
}
.food-region-card {
  background: #fafbfc;
  border: 1px solid var(--border);
  border-left: 3px solid var(--gold);
  border-radius: 6px;
  padding: 5px 8px;
  font-size: 10px;
  line-height: 1.3;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}
.food-region-hub {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--table-head);
  margin-bottom: 3px;
}
.food-region-dish { font-weight: 600; }
.food-region-detail, .food-region-hood { color: var(--muted); margin-top: 2px; }

.food-regional-map { min-height: 0; height: 100%; }

.food-meal-panel { min-height: 0; min-width: 0; display: flex; flex-direction: column; flex-shrink: 0; }
.food-meal-title {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-bottom: 4px;
  flex-shrink: 0;
}
.food-meal-tables {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-height: 0;
}
.food-meal-tables-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.food-meal-table {
  width: 100%;
  table-layout: fixed;
  font-size: 9.5px;
  border: 1px solid var(--text);
  border-collapse: collapse;
}
.food-meal-table th,
.food-meal-table td {
  border: 1px solid var(--text);
  padding: 3px 4px;
  text-align: center;
  vertical-align: middle;
  word-break: break-word;
  overflow-wrap: anywhere;
  hyphens: auto;
}
.food-meal-table thead th {
  background: #fff;
  color: var(--text);
  font-weight: 700;
  font-size: 9px;
}
.food-meal-table tbody th {
  background: #fff;
  color: var(--text);
  font-weight: 700;
  text-align: left;
  white-space: normal;
  font-size: 8.5px;
  line-height: 1.2;
}
.food-meal-table tbody td { background: #fff; }
.food-meal-corner { width: 52px; }
.food-meal-cell { line-height: 1.2; }
.food-meal-icon {
  display: block;
  font-size: 12px;
  line-height: 1;
  margin-bottom: 1px;
}

.food-footer {
  font-size: 10px;
  line-height: 1.35;
  color: var(--text);
  border-top: 1px solid var(--border);
  padding-top: 6px;
  flex-shrink: 0;
}

/* master itinerary day-card slides */
.itinerary-slide {
  padding-top: 0;
  grid-template-rows: auto auto minmax(0, 1fr) auto;
  gap: 10px;
}
.itinerary-top-bar {
  height: 4px;
  background: linear-gradient(90deg, var(--gold) 0%, var(--table-head) 50%, transparent 100%);
  margin: 0 -44px 8px;
}
.itinerary-title-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 4px;
}
.itinerary-slide-title {
  font-size: 30px;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  line-height: 1.1;
}
.itinerary-title-main { color: var(--table-head); }
.itinerary-title-accent { color: var(--gold); margin-left: 0.35em; }
.itinerary-duration-banner {
  font-size: 15px;
  font-weight: 600;
  color: var(--muted);
  text-align: right;
  margin-top: 4px;
  line-height: 1.3;
}
.itinerary-subtitle {
  font-size: 18px;
  font-weight: 700;
  color: var(--table-head);
  text-align: right;
  white-space: nowrap;
}

.itinerary-grid {
  display: grid;
  grid-template-columns: 1.08fr 1fr;
  gap: 12px;
  min-height: 0;
  align-items: stretch;
}
.itinerary-featured { min-height: 0; }
.itinerary-featured .day-card { height: 100%; }
.itinerary-right {
  display: grid;
  grid-template-rows: 1fr 1fr auto;
  gap: 12px;
  min-height: 0;
}

.day-card {
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: #fff;
  min-height: 0;
}
.day-card-head {
  background: linear-gradient(90deg, var(--table-head) 0%, #2e4a62 100%);
  color: #fff;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.02em;
}
.day-card-loc {
  padding: 8px 12px 4px;
  font-size: 11px;
  line-height: 1.35;
}
.day-schedule {
  font-size: 10.5px;
  margin: 0 10px;
  border: 1px solid var(--border);
}
.day-schedule thead th {
  background: #eef2f6;
  color: var(--table-head);
  padding: 5px 8px;
  font-size: 10px;
  border-bottom: 1px solid var(--border);
}
.day-schedule tbody td {
  padding: 5px 8px;
  border-bottom: 1px solid var(--border);
  vertical-align: top;
}
.day-schedule tbody tr:nth-child(even) td { background: #fafbfc; }
.day-schedule tbody td:first-child {
  font-weight: 600;
  white-space: nowrap;
  width: 72px;
}

.day-wow {
  margin: 8px 10px 6px;
  padding: 7px 10px;
  background: linear-gradient(135deg, #fdf8e8 0%, #fffbf0 100%);
  border: 1px solid #e8d07a;
  border-left: 3px solid var(--gold);
  border-radius: 6px;
  font-size: 10.5px;
  line-height: 1.35;
  display: flex;
  gap: 8px;
  align-items: flex-start;
}
.day-wow-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  background: var(--pass-green);
  color: #fff;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
}

.day-card-foot {
  margin-top: auto;
  padding: 6px 10px 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 9.5px;
  line-height: 1.3;
  color: var(--muted);
  border-top: 1px solid var(--border);
  background: #fafbfc;
}
.day-foot-item { display: flex; gap: 5px; align-items: flex-start; }
.day-foot-ic { flex-shrink: 0; }

.day-card-next {
  background: #f3f4f6;
  border-style: dashed;
  justify-content: center;
  align-items: center;
  min-height: 72px;
}
.day-card-next p {
  font-size: 11px;
  font-weight: 600;
  color: var(--muted);
  text-align: center;
  padding: 12px;
}

.itinerary-footer {
  text-align: right;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--table-head);
  border-top: 1px solid var(--border);
  padding-top: 8px;
}

/* accommodation strategy slide */
.acc-slide {
  padding-top: 0;
  grid-template-rows: auto auto auto minmax(0, 1fr) auto auto;
  gap: 8px;
}
.acc-top-bar {
  height: 4px;
  background: linear-gradient(90deg, var(--gold) 0%, var(--table-head) 50%, transparent 100%);
  margin: 0 -44px 8px;
}
.acc-slide-title {
  font-size: 30px;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  line-height: 1.1;
}
.acc-title-main { color: var(--table-head); }
.acc-title-accent { color: var(--gold); margin-left: 0.35em; }

.acc-section-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 4px;
}
.acc-section-pill {
  background: var(--table-head);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 6px 14px;
  border-radius: 999px;
}
.acc-section-kicker {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text);
}

.acc-main {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 14px;
  min-height: 0;
  align-items: start;
}
.acc-strategy-box {
  background: linear-gradient(160deg, #1e2f40 0%, #2e4a62 100%);
  color: #fff;
  border-radius: 10px;
  overflow: hidden;
  font-size: 10.5px;
  line-height: 1.45;
  border: 1px solid rgba(255,255,255,0.08);
}
.acc-strategy-head {
  padding: 10px 14px 6px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.acc-strategy-list {
  margin: 0;
  padding: 0 14px 12px 28px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.acc-strategy-list li { padding-left: 2px; }

.acc-tables-grid {
  display: grid;
  grid-template-columns: 1fr 1.05fr;
  gap: 10px;
  min-height: 0;
}
.acc-districts-col { display: flex; flex-direction: column; gap: 10px; }

.acc-table-caption {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--table-head);
  margin-bottom: 4px;
}
.acc-table {
  font-size: 10px;
  border: 1px solid var(--border);
}
.acc-table thead th {
  background: #eef2f6;
  color: var(--table-head);
  padding: 5px 7px;
  font-size: 9.5px;
  border-bottom: 1px solid var(--border);
}
.acc-table tbody th {
  font-weight: 600;
  background: #fafbfc;
  padding: 5px 7px;
  border-bottom: 1px solid var(--border);
  vertical-align: top;
}
.acc-table tbody td {
  padding: 5px 7px;
  border-bottom: 1px solid var(--border);
  vertical-align: top;
  line-height: 1.3;
}
.acc-table tbody tr:last-child td,
.acc-table tbody tr:last-child th { border-bottom: none; }
.acc-budget-table tbody tr:last-child td,
.acc-budget-table tbody tr:last-child th {
  font-weight: 700;
  background: #fdf8e8;
}
.acc-table-foot {
  margin-top: 4px;
  font-size: 9px;
  color: var(--muted);
  font-style: italic;
}

.acc-picks-panel { min-height: 0; }
.acc-picks-title {
  background: var(--table-head);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 7px 12px;
  border-radius: 6px 6px 0 0;
}
.acc-picks-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  border: 1px solid var(--border);
  border-top: none;
  border-radius: 0 0 8px 8px;
  overflow: hidden;
}
.acc-picks-col {
  padding: 10px 12px;
  font-size: 10px;
  line-height: 1.35;
}
.acc-picks-col + .acc-picks-col { border-left: 1px solid var(--border); }
.acc-picks-col-head {
  font-size: 10px;
  font-weight: 700;
  color: var(--table-head);
  margin-bottom: 4px;
}
.acc-picks-sub {
  font-size: 9px;
  color: var(--muted);
  margin-bottom: 6px;
}
.acc-picks-list {
  margin: 0;
  padding-left: 14px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.acc-footer-bar {
  background: linear-gradient(90deg, var(--table-head) 0%, #2e4a62 100%);
  color: #fff;
  text-align: center;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 7px 12px;
  border-radius: 6px;
  margin-top: 4px;
}

/* etiquette guide slide */
.etiq-slide {
  padding-top: 0;
  grid-template-rows: auto auto minmax(0, 1fr) auto;
  gap: 8px;
}
.etiq-top-bar {
  height: 4px;
  background: linear-gradient(90deg, var(--gold) 0%, var(--table-head) 50%, transparent 100%);
  margin: 0 -44px 8px;
}
.etiq-slide-title {
  font-size: 30px;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  line-height: 1.1;
  margin-bottom: 6px;
}
.etiq-title-main { color: var(--table-head); }
.etiq-title-accent { color: var(--gold); margin-left: 0.35em; }

.etiq-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 0;
}
.etiq-top {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  min-height: 0;
}
.etiq-bottom {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
  min-height: 0;
}

.etiq-panel {
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: #fff;
}
.etiq-panel-head {
  background: var(--table-head);
  color: #fff;
  padding: 7px 10px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
.etiq-panel-body {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  padding: 6px 8px 4px;
}
.etiq-panel-foot {
  text-align: right;
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--muted);
  padding: 4px 8px 6px;
  border-top: 1px solid var(--border);
  background: #fafbfc;
}

.etiq-table {
  width: 100%;
  font-size: 9px;
  border-collapse: collapse;
  line-height: 1.3;
}
.etiq-table thead th {
  background: #4a6278;
  color: #fff;
  padding: 4px 6px;
  font-size: 8.5px;
  font-weight: 700;
  text-align: left;
  border: 1px solid #3d5266;
}
.etiq-table tbody th {
  font-weight: 600;
  padding: 4px 6px;
  border-bottom: 1px solid var(--border);
  vertical-align: top;
  white-space: nowrap;
}
.etiq-table tbody td {
  padding: 4px 6px;
  border-bottom: 1px solid var(--border);
  vertical-align: top;
}
.etiq-table tbody tr.etiq-stripe td,
.etiq-table tbody tr.etiq-stripe th { background: #f0f7ff; }

.etiq-situation,
.etiq-do,
.etiq-dont,
.etiq-rule,
.etiq-list-item {
  display: flex;
  gap: 5px;
  align-items: flex-start;
}
.etiq-cell-ic { flex-shrink: 0; line-height: 1.2; }
.etiq-do .etiq-cell-ic { color: var(--pass-green); font-weight: 700; }
.etiq-dont .etiq-cell-ic { color: #c0392b; font-weight: 700; }

.etiq-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  height: 100%;
}
.etiq-list-col { min-width: 0; }
.etiq-list-head {
  font-size: 9px;
  font-weight: 700;
  color: var(--table-head);
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.etiq-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 9px;
  line-height: 1.3;
}

.etiq-footer-bar {
  background: linear-gradient(90deg, var(--table-head) 0%, #2e4a62 100%);
  color: #fff;
  text-align: center;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 6px 12px;
  border-radius: 6px;
}

/* shopping hubs slide */
.shop-slide {
  padding-top: 0;
  grid-template-rows: auto auto auto minmax(0, 1fr) auto;
  gap: 8px;
}
.shop-top-bar {
  height: 4px;
  background: linear-gradient(90deg, var(--gold) 0%, var(--table-head) 50%, transparent 100%);
  margin: 0 -44px 8px;
}
.shop-slide-title {
  font-size: 30px;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  line-height: 1.1;
}
.shop-title-main { color: var(--table-head); }
.shop-title-accent { color: var(--gold); margin-left: 0.35em; }
.shop-kicker {
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--table-head);
  font-family: Georgia, "Times New Roman", serif;
  margin-bottom: 4px;
}

.shop-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  min-height: 480px;
  align-items: stretch;
}
.shop-left {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
}
.shop-right { min-height: 0; }
.shop-hub {
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: #fff;
  flex: 1;
  min-height: 0;
}
.shop-hub-tall { height: 100%; }

.shop-hub-head {
  background: var(--table-head);
  color: #fff;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.shop-hub-title { flex: 1; }
.shop-hub-days {
  font-size: 10px;
  font-weight: 600;
  opacity: 0.9;
  white-space: nowrap;
}
.shop-hub-icon { font-size: 18px; line-height: 1; }

.shop-hub-body {
  flex: 1;
  padding: 8px 10px 10px;
  min-height: 0;
}
.shop-hub-body-split {
  display: grid;
  grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr);
  gap: 8px;
  align-items: stretch;
}
.shop-hub-map {
  min-height: 108px;
  height: 108px;
  border-radius: 6px;
  overflow: hidden;
}
.shop-hub-tall .shop-hub-map {
  min-height: 168px;
  height: 168px;
}
.shop-hub-table-wrap {
  min-height: 0;
  overflow: visible;
}
.shop-table {
  width: 100%;
  font-size: 10px;
  border-collapse: collapse;
  line-height: 1.35;
}
.shop-table thead th {
  background: #4a6278;
  color: #fff;
  padding: 5px 8px;
  font-size: 9.5px;
  font-weight: 700;
  text-align: left;
  border: 1px solid #3d5266;
}
.shop-table tbody th {
  font-weight: 600;
  padding: 6px 8px;
  border-bottom: 1px solid var(--border);
  vertical-align: top;
  white-space: nowrap;
  width: 52px;
}
.shop-table tbody td {
  padding: 6px 8px;
  border-bottom: 1px solid var(--border);
  vertical-align: top;
}
.shop-table tbody tr.shop-stripe td,
.shop-table tbody tr.shop-stripe th { background: #f0f7ff; }

.shop-footer-bar {
  text-align: right;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--muted);
  border-top: 1px solid var(--border);
  padding-top: 8px;
}

.shop-matrix-wrap {
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px solid var(--border);
}
.shop-matrix-caption {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--muted);
  margin-bottom: 4px;
}
.shop-matrix-table {
  width: 100%;
  font-size: 8.5px;
  border-collapse: collapse;
}
.shop-matrix-table th,
.shop-matrix-table td {
  padding: 4px 6px;
  border: 1px solid var(--border);
  vertical-align: top;
}
.shop-matrix-table thead th {
  background: #4a6278;
  color: #fff;
  font-size: 8px;
}

.shop-day-slide {
  padding-top: 0;
  grid-template-rows: auto auto auto minmax(0, 1fr) auto;
  gap: 8px;
}
.shop-day-body {
  min-height: 0;
  overflow: hidden;
}
.shop-day-cities {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  min-height: 0;
  align-content: start;
}
.shop-day-city {
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.shop-day-city-head {
  background: var(--table-head);
  color: #fff;
  padding: 6px 10px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.shop-day-city-body {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
  gap: 6px;
  padding: 6px 8px 8px;
  min-height: 0;
}
.shop-day-city-map {
  min-height: 120px;
  height: 120px;
  border-radius: 6px;
  overflow: hidden;
}
.shop-day-city-table {
  min-height: 0;
  overflow: auto;
}
.shop-day-city-table .shop-day-table {
  font-size: 9px;
}
.shop-day-table {
  width: 100%;
  font-size: 10px;
  border-collapse: collapse;
  line-height: 1.35;
}
.shop-day-table thead th {
  background: var(--table-head);
  color: #fff;
  padding: 6px 8px;
  font-size: 9.5px;
  text-align: left;
}
.shop-day-table tbody th {
  font-weight: 600;
  padding: 6px 8px;
  border-bottom: 1px solid var(--border);
  vertical-align: top;
  white-space: nowrap;
  width: 56px;
}
.shop-day-table tbody td {
  padding: 6px 8px;
  border-bottom: 1px solid var(--border);
  vertical-align: top;
}
.shop-day-table tbody tr.shop-day-table-stripe td,
.shop-day-table tbody tr.shop-day-table-stripe th {
  background: #f0f7ff;
}

.shop-tailor-slide {
  padding-top: 0;
  grid-template-rows: auto auto auto auto minmax(0, 1fr);
  gap: 8px;
}
.shop-tailor-banner {
  font-size: 10px;
  font-weight: 600;
  color: var(--table-head);
  background: #f0f7ff;
  border-left: 4px solid var(--gold);
  padding: 8px 12px;
  border-radius: 4px;
}
.shop-tailor-map {
  min-height: 100px;
  height: 100px;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 4px;
}
.shop-tailor-grid {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 14px;
  min-height: 0;
}
.shop-tailor-col { min-height: 0; }
.shop-panel-caption {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--table-head);
  margin-bottom: 6px;
}
.shop-callout {
  font-size: 9.5px;
  line-height: 1.4;
  margin-top: 10px;
  padding: 8px 10px;
  background: #fffbeb;
  border: 1px solid #f0e6c8;
  border-radius: 6px;
}
.shop-red-flags {
  margin: 0;
  padding-left: 16px;
  font-size: 9px;
  line-height: 1.35;
}
.shop-red-flags li { margin-bottom: 4px; }

/* culture & museums slide */
.culture-slide {
  padding-top: 0;
  grid-template-rows: auto auto auto minmax(0, 1fr) auto;
  gap: 8px;
}
.culture-top-bar {
  height: 4px;
  background: linear-gradient(90deg, var(--gold) 0%, var(--table-head) 50%, transparent 100%);
  margin: 0 -44px 8px;
}
.culture-slide-title {
  font-size: 30px;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  line-height: 1.1;
}
.culture-title-main { color: var(--table-head); }
.culture-title-accent { color: var(--gold); margin-left: 0.35em; }

.culture-section-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 4px;
}
.culture-section-pill {
  background: var(--table-head);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 6px 14px;
  border-radius: 999px;
}
.culture-section-kicker {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text);
}

.culture-body {
  display: grid;
  grid-template-columns: 270px 1fr;
  gap: 14px;
  min-height: 0;
  align-items: stretch;
}
.culture-sidebar { display: flex; flex-direction: column; gap: 10px; min-height: 0; }
.culture-content { display: flex; flex-direction: column; gap: 10px; min-height: 0; }

.culture-intel-box {
  background: linear-gradient(160deg, #2e3f52 0%, #3d5168 100%);
  color: #fff;
  border-radius: 10px;
  overflow: hidden;
  font-size: 10.5px;
  line-height: 1.4;
  border: 1px solid rgba(255,255,255,0.08);
}
.culture-intel-head {
  background: rgba(255,255,255,0.08);
  border-bottom: 1px solid rgba(255,255,255,0.1);
  padding: 7px 12px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.culture-intel-body { padding: 8px 12px 10px; }
.culture-intel-list,
.culture-theme-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.culture-intel-list li,
.culture-theme-list li { display: flex; gap: 6px; align-items: flex-start; }
.culture-rule-ic { flex-shrink: 0; font-size: 14px; line-height: 1.2; }
.culture-theme-n { font-weight: 700; color: var(--gold); flex-shrink: 0; }

.culture-audit-table {
  width: 100%;
  font-size: 9px;
  border-collapse: collapse;
  margin-bottom: 6px;
}
.culture-audit-table th,
.culture-audit-table td {
  padding: 3px 5px;
  border-bottom: 1px solid rgba(255,255,255,0.15);
  text-align: left;
  vertical-align: top;
}
.culture-audit-table thead th {
  font-size: 8.5px;
  font-weight: 700;
  color: rgba(255,255,255,0.85);
  border-bottom: 1px solid rgba(255,255,255,0.25);
}
.culture-audit-verdict {
  display: flex;
  gap: 6px;
  align-items: center;
  font-size: 10px;
  font-weight: 700;
  padding: 5px 8px;
  border-radius: 6px;
  background: rgba(39,174,96,0.2);
  color: #b8f0c8;
}
.culture-audit-verdict.warn { background: rgba(211,158,0,0.2); color: #fdeaa8; }
.culture-audit-ic { font-size: 13px; }

.culture-hub-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 10px;
  flex: 1;
  min-height: 0;
}
.culture-hub {
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: #fff;
}
.culture-hub-head {
  background: var(--table-head);
  color: #fff;
  padding: 6px 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.culture-hub-name { flex: 1; }
.culture-hub-days { font-size: 9px; opacity: 0.9; white-space: nowrap; }
.culture-hub-icon { font-size: 16px; line-height: 1; }
.culture-hub-body {
  flex: 1;
  padding: 6px 8px 8px;
  min-height: 0;
  overflow: hidden;
}
.culture-hub-table {
  width: 100%;
  font-size: 9px;
  border-collapse: collapse;
  line-height: 1.3;
}
.culture-hub-table thead th {
  background: #eef2f6;
  color: var(--table-head);
  padding: 4px 6px;
  font-size: 8.5px;
  font-weight: 700;
  text-align: left;
  border-bottom: 1px solid var(--border);
}
.culture-hub-table tbody th {
  font-weight: 600;
  padding: 4px 6px;
  border-bottom: 1px solid var(--border);
  vertical-align: top;
  white-space: nowrap;
  width: 28px;
}
.culture-hub-table tbody td {
  padding: 4px 6px;
  border-bottom: 1px solid var(--border);
  vertical-align: top;
}
.culture-hub-table tbody tr.culture-stripe td,
.culture-hub-table tbody tr.culture-stripe th { background: #fafbfc; }
.culture-hub-highlights {
  margin: 5px 0 0;
  padding-left: 14px;
  font-size: 8.5px;
  color: var(--muted);
  line-height: 1.35;
}
.culture-hub-note {
  margin-top: 5px;
  font-size: 8.5px;
  color: var(--muted);
  font-style: italic;
  line-height: 1.35;
}

.culture-spotlight {
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
}
.culture-spotlight-title {
  background: var(--table-head);
  color: #fff;
  padding: 6px 12px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.culture-spotlight-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0;
}
.culture-spot-col {
  padding: 8px 10px;
  font-size: 9px;
  line-height: 1.35;
  border-right: 1px solid var(--border);
}
.culture-spot-col:last-child { border-right: none; }
.culture-spot-head {
  font-size: 9px;
  font-weight: 700;
  color: var(--table-head);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 4px;
}
.culture-spot-list {
  margin: 0;
  padding-left: 12px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.culture-footer {
  font-size: 11px;
  line-height: 1.45;
  color: var(--text);
  border-top: 1px solid var(--border);
  padding-top: 8px;
}

/* packing strategy slide */
.pack-slide {
  padding-top: 0;
  grid-template-rows: auto auto auto minmax(0, 1fr) auto;
  gap: 8px;
}
.pack-top-bar {
  height: 4px;
  background: linear-gradient(90deg, var(--gold) 0%, var(--table-head) 50%, transparent 100%);
  margin: 0 -44px 8px;
}
.pack-slide-title {
  font-size: 30px;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  line-height: 1.1;
}
.pack-title-main { color: var(--table-head); }
.pack-title-accent { color: var(--gold); margin-left: 0.35em; }
.pack-section-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 4px;
}
.pack-section-pill {
  background: var(--table-head);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 6px 14px;
  border-radius: 999px;
}
.pack-section-kicker {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text);
}

.pack-body {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 14px;
  min-height: 0;
  align-items: stretch;
}
.pack-sidebar { display: flex; flex-direction: column; gap: 10px; min-height: 0; }
.pack-content { display: flex; flex-direction: column; gap: 10px; min-height: 0; }

.pack-intel-box {
  background: linear-gradient(160deg, #2e3f52 0%, #3d5168 100%);
  color: #fff;
  border-radius: 10px;
  overflow: hidden;
  font-size: 10px;
  line-height: 1.4;
  border: 1px solid rgba(255,255,255,0.08);
}
.pack-intel-head {
  background: rgba(255,255,255,0.08);
  border-bottom: 1px solid rgba(255,255,255,0.1);
  padding: 7px 12px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.pack-intel-body { padding: 8px 12px 10px; max-height: 220px; overflow: hidden; }
.pack-climate-text { margin: 0; font-size: 10.5px; line-height: 1.45; }
.pack-climate-note { margin-top: 6px; font-size: 9px; opacity: 0.85; font-style: italic; }

.pack-essentials-list {
  margin: 0;
  padding-left: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 200px;
  overflow: hidden;
}
.pack-essentials-list li {
  display: flex;
  gap: 5px;
  align-items: flex-start;
}
.pack-item-ic { flex-shrink: 0; font-size: 12px; line-height: 1.2; }

.pack-doc-grid { display: flex; flex-direction: column; gap: 6px; }
.pack-doc-head {
  font-size: 9px;
  font-weight: 700;
  color: var(--gold);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.pack-doc-list {
  margin: 0 0 2px;
  padding-left: 14px;
  font-size: 9px;
  line-height: 1.35;
}

.pack-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  min-height: 0;
}
.pack-extras {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.pack-panel {
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
  min-height: 0;
}
.pack-panel-head {
  background: var(--table-head);
  color: #fff;
  padding: 6px 10px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
.pack-panel-body { padding: 6px 8px 8px; }

.pack-table {
  width: 100%;
  font-size: 9px;
  border-collapse: collapse;
  line-height: 1.3;
}
.pack-table-caption {
  font-size: 9px;
  font-weight: 700;
  color: var(--table-head);
  margin-bottom: 4px;
  text-transform: uppercase;
}
.pack-table thead th {
  background: #eef2f6;
  color: var(--table-head);
  padding: 4px 6px;
  font-size: 8.5px;
  font-weight: 700;
  text-align: left;
  border-bottom: 1px solid var(--border);
}
.pack-table tbody th {
  font-weight: 600;
  padding: 4px 6px;
  border-bottom: 1px solid var(--border);
  vertical-align: top;
  white-space: nowrap;
}
.pack-table tbody td {
  padding: 4px 6px;
  border-bottom: 1px solid var(--border);
  vertical-align: top;
}
.pack-table tbody tr.pack-stripe td,
.pack-table tbody tr.pack-stripe th { background: #fafbfc; }
.pack-status { white-space: nowrap; }
.pack-mini-list {
  margin: 0;
  padding-left: 14px;
  font-size: 9px;
  line-height: 1.35;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.pack-luggage {
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
  background: #fafbfc;
}
.pack-luggage-title {
  background: var(--table-head);
  color: #fff;
  padding: 6px 12px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.pack-bag-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  padding: 10px 12px;
}
.pack-bag-card {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 10px;
  text-align: center;
  border-top: 3px solid var(--gold);
}
.pack-bag-icon { font-size: 24px; line-height: 1; margin-bottom: 4px; }
.pack-bag-name {
  font-size: 10px;
  font-weight: 700;
  color: var(--table-head);
  margin-bottom: 3px;
}
.pack-bag-role { font-size: 9px; color: var(--muted); line-height: 1.35; }
.pack-luggage-note {
  padding: 0 12px 10px;
  font-size: 9px;
  color: var(--muted);
  font-style: italic;
  line-height: 1.35;
}

.pack-checklist {
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
}
.pack-checklist-title {
  background: #4a6278;
  color: #fff;
  padding: 6px 12px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.pack-checklist-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0;
}
.pack-check-col {
  padding: 8px 10px;
  font-size: 8.5px;
  line-height: 1.35;
  border-right: 1px solid var(--border);
}
.pack-check-col:last-child { border-right: none; }
.pack-check-head {
  font-size: 9px;
  font-weight: 700;
  color: var(--table-head);
  text-transform: uppercase;
  margin-bottom: 4px;
}
.pack-check-list {
  margin: 0;
  padding-left: 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.pack-footer {
  font-size: 11px;
  line-height: 1.45;
  color: var(--text);
  border-top: 1px solid var(--border);
  padding-top: 8px;
}

/* ── Shared dashboard template (dash-*) ── */
.dash-slide {
  padding-top: 0;
  grid-template-rows: auto auto auto auto minmax(0, 1fr) auto;
  gap: 8px;
}
.dash-top-bar {
  height: 4px;
  background: linear-gradient(90deg, var(--gold) 0%, var(--table-head) 50%, transparent 100%);
  margin: 0 -44px 8px;
}
.dash-slide-title {
  font-size: 30px;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  line-height: 1.1;
}
.dash-title-main { color: var(--table-head); }
.dash-title-accent { color: var(--gold); margin-left: 0.35em; }
.dash-section-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 4px;
}
.dash-section-pill {
  background: var(--table-head);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 6px 14px;
  border-radius: 999px;
}
.dash-section-kicker {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text);
}
.dash-banner {
  background: linear-gradient(90deg, var(--table-head) 0%, #5a6a7a 100%);
  color: #fff;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 10.5px;
  line-height: 1.45;
  margin-bottom: 4px;
}
.dash-banner strong {
  display: block;
  font-size: 9px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.85;
  margin-bottom: 3px;
}
.dash-body {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 14px;
  min-height: 0;
  align-items: stretch;
}
.dash-sidebar { display: flex; flex-direction: column; gap: 10px; min-height: 0; }
.dash-content { display: flex; flex-direction: column; gap: 10px; min-height: 0; }
.dash-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  min-height: 0;
}
.dash-slide-flights .dash-body {
  grid-template-columns: 248px 1fr;
  gap: 10px;
}
.dash-slide-flights .dash-grid-flights {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 7px;
}
.dash-slide-flights .dash-panel-body {
  max-height: 118px;
}
.dash-slide-flights .dash-panel-head {
  font-size: 8.5px;
  padding: 5px 8px;
}
.dash-slide-flights .dash-table {
  font-size: 7.5px;
}
.dash-slide-flights .dash-table th,
.dash-slide-flights .dash-table td {
  padding: 3px 5px;
}
.dash-slide-flights .dash-sidebar .dash-intel-body {
  max-height: 160px;
}
.dash-slide-flights .dash-banner {
  font-size: 9.5px;
  padding: 6px 12px;
  margin-bottom: 2px;
}
.dash-slide-hotels .dash-body {
  grid-template-columns: 260px 1fr;
  gap: 10px;
}
.dash-slide-hotels .dash-grid-hotels {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}
.dash-slide-hotels .dash-panel-body {
  max-height: 132px;
}
.dash-slide-hotels .dash-panel-head {
  font-size: 8.8px;
  padding: 5px 8px;
}
.dash-slide-hotels .dash-table {
  font-size: 7.8px;
}
.dash-slide-hotels .dash-table th,
.dash-slide-hotels .dash-table td {
  padding: 3px 5px;
}
.dash-slide-hotels .dash-sidebar .dash-intel-body {
  max-height: 170px;
}
.dash-slide-immigration .dash-body {
  grid-template-columns: 268px 1fr;
  gap: 10px;
}
.dash-slide-immigration .dash-grid-immigration {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  align-content: start;
}
.dash-slide-immigration .dash-panel-body {
  max-height: none;
  overflow: visible;
}
.dash-slide-immigration .dash-panel-head {
  font-size: 8.8px;
  padding: 5px 8px;
}
.dash-slide-immigration .dash-table {
  font-size: 8px;
}
.dash-slide-immigration .dash-table th,
.dash-slide-immigration .dash-table td {
  padding: 3px 6px;
}
.dash-slide-immigration .dash-sidebar .dash-intel-body {
  max-height: none;
  overflow: visible;
}
.dash-slide-immigration .dash-sidebar .dash-table {
  font-size: 8px;
}
.dash-slide-immigration-solo .dash-body {
  grid-template-columns: 1fr;
}
.dash-slide-immigration-solo .dash-grid-immigration {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.dash-slide-dense .dash-body {
  gap: 10px;
}
.dash-slide-dense .dash-grid-dense {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  align-content: start;
}
.dash-slide-dense .dash-grid-single {
  grid-template-columns: 1fr;
  align-content: start;
}
.dash-slide-dense .dash-panel-body {
  max-height: none;
  overflow: visible;
}
.dash-slide-dense .dash-panel-head {
  font-size: 8.8px;
  padding: 5px 8px;
}
.dash-slide-dense .dash-table {
  font-size: 8px;
}
.dash-slide-dense .dash-table th,
.dash-slide-dense .dash-table td {
  padding: 3px 6px;
}
.dash-slide-dense .dash-sidebar .dash-intel-body {
  max-height: none;
  overflow: visible;
}
.dash-slide-dense .dash-sidebar .dash-table {
  font-size: 8px;
}
.dash-slide-dense .dash-banner {
  font-size: 9.5px;
  padding: 6px 12px;
  line-height: 1.35;
}
.dash-intel-box {
  background: linear-gradient(160deg, #2e3f52 0%, #3d5168 100%);
  color: #fff;
  border-radius: 10px;
  overflow: hidden;
  font-size: 10px;
  line-height: 1.4;
  border: 1px solid rgba(255,255,255,0.08);
}
.dash-intel-head {
  background: rgba(255,255,255,0.08);
  border-bottom: 1px solid rgba(255,255,255,0.1);
  padding: 7px 12px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.dash-intel-body { padding: 8px 12px 10px; max-height: 240px; overflow: hidden; }
.dash-text { margin: 0; font-size: 10.5px; line-height: 1.45; }
.dash-note { margin-top: 6px; font-size: 9px; opacity: 0.85; font-style: italic; }
.dash-list, .dash-mini-list {
  margin: 0;
  padding-left: 14px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  font-size: 9px;
  line-height: 1.35;
}
.dash-list { max-height: 200px; overflow: hidden; }
.dash-val-grid { display: flex; flex-direction: column; gap: 5px; }
.dash-val {
  display: flex;
  gap: 6px;
  align-items: flex-start;
  font-size: 9.5px;
  line-height: 1.35;
}
.dash-val-ic { flex-shrink: 0; font-weight: 700; }
.dash-val.pass .dash-val-ic { color: #68d391; }
.dash-val.warn .dash-val-ic { color: #f6ad55; }
.dash-panel {
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
  min-height: 0;
}
.dash-panel-head {
  background: linear-gradient(90deg, var(--table-head) 0%, #2e4a62 100%);
  color: #fff;
  padding: 6px 10px;
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  line-height: 1.25;
}
.dash-panel-body { padding: 0; max-height: none; overflow: visible; }
.dash-slide:has(.dash-sidebar) .dash-sidebar .dash-intel-body {
  max-height: none;
  overflow: visible;
}
.dash-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 8.5px;
  line-height: 1.3;
}
.dash-table th, .dash-table td {
  padding: 4px 6px;
  border-bottom: 1px solid var(--border);
  text-align: left;
  vertical-align: top;
}
.dash-table thead th {
  background: #eef1f4;
  font-weight: 700;
  font-size: 8px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.dash-table tr.dash-stripe td, .dash-table tr.dash-stripe th { background: #f8f9fa; }
.dash-intel-box .dash-table { color: #fff; font-size: 9px; }
.dash-intel-box .dash-table th, .dash-intel-box .dash-table td { border-color: rgba(255,255,255,0.15); }
.dash-intel-box .dash-table thead th { background: rgba(0,0,0,0.15); color: #fff; }
.dash-scorecard { margin-top: 8px; }
.dash-scorecard .dash-panel { max-width: 100%; }
.dash-footer {
  font-size: 10px;
  line-height: 1.45;
  color: var(--muted);
  border-top: 1px solid var(--border);
  padding-top: 6px;
}

.watermark {
  position: absolute; bottom: 10px; right: 14px;
  font-size: 9px; color: rgba(44,62,80,0.3); letter-spacing: 0.06em;
  text-transform: uppercase; font-weight: 600;
}

@media print {
  body { background: #fff; padding: 0; gap: 0; }
  .deck-head { display: none; }
  .slide {
    box-shadow: none; border: none; page-break-after: always;
    width: 100%; height: auto; min-height: auto;
  }
}
`;
