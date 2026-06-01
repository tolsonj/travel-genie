// Shared visual theme (the approved v1 design tokens + slide chrome).
// Exported as a CSS string that is inlined once into the deck <head>.

export const THEME_CSS = `
:root {
  --slide-w: 1280px;
  --slide-h: 720px;
  --gold: #b8860b;
  --gold-dark: #8b6914;
  --banner-bg: #3d4f5f;
  --banner-text: #f5f5f0;
  --table-head: #2c3e50;
  --table-stripe: #f4f6f8;
  --border: #d0d7de;
  --text: #1a1a1a;
  --muted: #5a6570;
  --pass-green: #27ae60;
  --warn-amber: #d39e00;
  --route-line: #d4a017;
  --sea: #dbe7f0;
  --land: #e2e6df;
  --land-line: #b9c2b0;
  --land-hi: #cfe0c6;
  --land-hi-line: #9bbf8e;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: "Segoe UI", system-ui, -apple-system, sans-serif;
  background: #e8eaed;
  color: var(--text);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 28px;
  gap: 22px;
}

.deck-head {
  max-width: var(--slide-w);
  width: 100%;
  text-align: center;
  color: var(--muted);
  font-size: 13px;
}
.deck-head h1 { color: var(--table-head); font-size: 20px; margin-bottom: 2px; }

.slide {
  width: var(--slide-w);
  height: var(--slide-h);
  background: #fff;
  border: 1px solid var(--border);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  padding: 36px 44px 28px;
  display: grid;
  grid-template-rows: auto auto 1fr auto;
  gap: 14px;
  position: relative;
  overflow: hidden;
}

.slide-title {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: var(--gold-dark);
  text-transform: uppercase;
}

.banner {
  background: var(--banner-bg);
  color: var(--banner-text);
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 13px;
  line-height: 1.45;
}
.banner strong { display: block; font-size: 14px; margin-bottom: 4px; color: #fff; }

.main {
  display: grid;
  grid-template-columns: 1fr 1.05fr;
  gap: 20px;
  min-height: 0;
}

.map-panel {
  background: var(--sea);
  border: 1px solid var(--border);
  border-radius: 8px;
  position: relative;
  overflow: hidden;
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
  font-size: 12px; font-weight: 700; fill: #26303b;
  paint-order: stroke; stroke: #fff; stroke-width: 3px; stroke-linejoin: round;
}
.node-letter { font-size: 12px; font-weight: 700; fill: #fff; }

table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
thead th {
  background: var(--table-head); color: #fff; text-align: left;
  padding: 8px 10px; font-weight: 600; font-size: 12px;
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

.summary-box {
  background: var(--banner-bg); color: var(--banner-text); border-radius: 8px;
  padding: 12px 16px; min-width: 280px; font-size: 12px; line-height: 1.45;
  display: flex; gap: 10px; align-items: flex-start;
}
.summary-box .check { color: var(--pass-green); font-size: 18px; line-height: 1; flex-shrink: 0; }

/* generic fallback layout */
.generic-body { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; min-height: 0; overflow: hidden; }
.generic-col { display: flex; flex-direction: column; gap: 14px; min-height: 0; overflow: hidden; }
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

.watermark {
  position: absolute; bottom: 8px; right: 12px;
  font-size: 10px; color: #bbb; letter-spacing: 0.02em;
}

@media print {
  body { background: #fff; padding: 0; gap: 0; }
  .deck-head { display: none; }
  .slide {
    box-shadow: none; border: none; page-break-after: always;
    width: 100%; height: 100vh;
  }
}
`;
