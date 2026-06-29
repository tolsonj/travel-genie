// Shared deck-dashboard chrome helpers (used by dashboard + bespoke templates).
import { esc, has } from "../util.js";

export function intelBox(content, label, cls = "dash-intel-box") {
  if (!content) return "";
  return `
    <div class="${cls}">
      <div class="dash-intel-head">${esc(label)}</div>
      <div class="dash-intel-body">${content}</div>
    </div>`;
}

export function renderTable(t, cls = "dash-table") {
  if (!t?.rows?.length) return "";
  const cols = (t.columns || []).map(c => `<th>${esc(c)}</th>`).join("");
  const rows = t.rows.map((r, ri) => {
    const stripe = ri % 2 === 1 ? " dash-stripe" : "";
    return `<tr class="${stripe}">${r.map((cell, i) => {
      const tag = i === 0 && r.length > 1 ? "th" : "td";
      const scope = tag === "th" ? ' scope="row"' : "";
      return `<${tag}${scope}>${esc(cell)}</${tag}>`;
    }).join("")}</tr>`;
  }).join("");
  return `<table class="${cls}">${cols ? `<thead><tr>${cols}</tr></thead>` : ""}<tbody>${rows}</tbody></table>`;
}

export function listBox(box) {
  if (!has(box?.items)) return "";
  const tag = box.ordered ? "ol" : "ul";
  const items = box.items.map(i => `<li>${esc(i)}</li>`).join("");
  return intelBox(`<${tag} class="dash-list">${items}</${tag}>`, box.caption || box.heading || "");
}

export function tableBox(box) {
  if (!box?.rows?.length) return "";
  return intelBox(renderTable(box), box.caption || "");
}

export function textBox(box) {
  const text = box.text || box.summary;
  if (!text) return "";
  const note = box.note ? `<div class="dash-note">${esc(box.note)}</div>` : "";
  return intelBox(`<p class="dash-text">${esc(text)}</p>${note}`, box.caption || "Overview");
}

export function validationsBox(items) {
  if (!has(items)) return "";
  const rows = items.map(v => {
    const status = v.status === "warn" ? "warn" : "pass";
    const icon = status === "warn" ? "⚠" : "✓";
    return `<div class="dash-val ${status}"><span class="dash-val-ic" aria-hidden="true">${icon}</span><span>${esc(v.text)}</span></div>`;
  }).join("");
  return intelBox(`<div class="dash-val-grid">${rows}</div>`, "Validations");
}

export function panelBox(panel) {
  if (!panel?.rows?.length && !has(panel?.items)) return "";
  const body = panel.rows?.length
    ? renderTable(panel)
    : `<ul class="dash-mini-list">${(panel.items || []).map(i => `<li>${esc(i)}</li>`).join("")}</ul>`;
  return `
    <div class="dash-panel">
      <div class="dash-panel-head">${esc(panel.caption || panel.title || "")}</div>
      <div class="dash-panel-body">${body}</div>
    </div>`;
}

export function slideChrome(d, bodyHtml, extra = "") {
  const titleMain = d.slide_title || esc(d.title || "Aspect").toUpperCase();
  const titleAccent = d.slide_title_accent || "";
  const sectionLabel = d.section_label || d.title || "";
  const sectionKicker = d.section_kicker || "";

  const bannerText = d.banner?.text || (d.intro && d.intro !== "---" && !d.sidebar?.length ? d.intro : "");
  const banner = bannerText
    ? `<div class="dash-banner">${d.banner?.label ? `<strong>${esc(d.banner.label)}</strong>` : ""}${esc(bannerText.replace(/^>\s*/, ""))}</div>`
    : "";

  return `
    <section class="slide dash-slide">
      <div class="dash-top-bar" aria-hidden="true"></div>
      <h1 class="dash-slide-title">
        <span class="dash-title-main">${esc(titleMain)}</span>
        ${titleAccent ? `<span class="dash-title-accent">${esc(titleAccent)}</span>` : ""}
      </h1>
      ${sectionLabel || sectionKicker ? `
      <div class="dash-section-row">
        ${sectionLabel ? `<span class="dash-section-pill">${esc(sectionLabel)}</span>` : ""}
        ${sectionKicker ? `<span class="dash-section-kicker">${esc(sectionKicker)}</span>` : ""}
      </div>` : ""}
      ${banner}
      ${bodyHtml}
      ${d.footer ? `<div class="dash-footer">${esc(d.footer)}</div>` : ""}
      ${extra}
      <div class="watermark">travel-genie · ${esc(d.trip)}</div>
    </section>`;
}

export function splitTitle(title) {
  const parts = String(title || "").trim().split(/\s+/);
  if (parts.length <= 1) return { main: parts[0]?.toUpperCase() || "ASPECT", accent: "" };
  const accent = parts.pop();
  return { main: parts.join(" ").toUpperCase(), accent: accent.toUpperCase() };
}

export function sidebarBlock(block) {
  if (!block) return "";
  const type = block.type || (block.rows ? "table" : block.items ? "list" : "text");
  if (type === "table") return tableBox(block);
  if (type === "list") return listBox(block);
  if (type === "validations") return validationsBox(block.items);
  return textBox(block);
}

export function isImmigrationSlide(d) {
  return d.aspect === "03-immigration-entry";
}

export function isImmigrationCountryPanel(panel) {
  return /arrival|transit only/i.test(panel?.caption || "");
}

function partKicker(kicker, suffix) {
  const base = (kicker || "")
    .replace(/\s*\(\d+\/\d+\)\s*$/i, "")
    .replace(/\s*· risks & health\s*$/i, "")
    .trim();
  return base ? `${base} ${suffix}`.trim() : suffix.trim();
}

function panelRows(p) {
  return Math.max(p.rows?.length || 0, p.items?.length || 0, 0);
}

function chunkPanelsByDensity(panels, maxPanels, maxRows) {
  const chunks = [];
  let cur = [];
  let rows = 0;

  for (const p of panels) {
    const pr = Math.max(panelRows(p), 1);
    if (pr > maxRows) {
      if (cur.length) {
        chunks.push(cur);
        cur = [];
        rows = 0;
      }
      chunks.push([p]);
      continue;
    }
    const overflow = cur.length >= maxPanels || (cur.length > 0 && rows + pr > maxRows);
    if (overflow) {
      chunks.push(cur);
      cur = [];
      rows = 0;
    }
    cur.push(p);
    rows += pr;
  }
  if (cur.length) chunks.push(cur);
  return chunks.length ? chunks : [panels];
}

function maxPanelsFor(d) {
  if (isImmigrationSlide(d)) return 3;
  if (d.sidebar?.length) return 2;
  return 2;
}

function maxRowsFor(d) {
  if (isImmigrationSlide(d)) return 10;
  return d.sidebar?.length ? 7 : 8;
}

/** Split overcrowded dashboard slides (immigration: countries | risks/health). */
export function splitDashboardSlides(d) {
  const panels = d.panels || [];
  const maxPanels = maxPanelsFor(d);
  const maxRows = maxRowsFor(d);
  const totalRows = panels.reduce((s, p) => s + panelRows(p), 0);

  if (panels.length <= maxPanels && totalRows <= maxRows) return [d];

  if (isImmigrationSlide(d)) {
    const countries = panels.filter(isImmigrationCountryPanel);
    const rest = panels.filter(p => !isImmigrationCountryPanel(p));
    if (countries.length && rest.length && countries.length <= maxPanels) {
      return [
        { ...d, panels: countries },
        {
          ...d,
          panels: rest,
          sidebar: [],
          banner: undefined,
          section_kicker: partKicker(d.section_kicker, "· risks & health")
        }
      ];
    }
  }

  const chunks = chunkPanelsByDensity(panels, maxPanels, maxRows);
  if (chunks.length === 1 && chunks[0] === panels) return [d];

  const total = chunks.length;
  return chunks.map((chunk, i) => ({
    ...d,
    panels: chunk,
    sidebar: i === 0 ? d.sidebar : [],
    banner: i === 0 ? d.banner : undefined,
    scorecard: i === chunks.length - 1 ? d.scorecard : undefined,
    section_kicker: total > 1
      ? partKicker(d.section_kicker, `(${i + 1}/${total})`)
      : d.section_kicker
  }));
}

export function normalizeDashboard(d) {
  if (d.sidebar?.length || d.panels?.length) return d;

  const split = splitTitle(d.title);
  const out = {
    ...d,
    slide_title: d.slide_title || split.main,
    slide_title_accent: d.slide_title_accent || split.accent,
    sidebar: [],
    panels: []
  };

  const tables = [...(d.tables || [])];
  const bullets = d.bullets || [];
  const callouts = d.callouts || [];

  if (d.intro && d.intro !== "---") {
    out.sidebar.push({ type: "text", caption: "Overview", text: d.intro });
  }

  bullets.slice(0, 2).forEach(b => {
    out.sidebar.push({ type: "list", caption: b.heading, items: b.items });
  });

  if (callouts.length) {
    out.sidebar.push({ type: "validations", items: callouts });
  } else if (tables.length > 4) {
    const shifted = tables.shift();
    out.sidebar.push({
      type: "table",
      ...shifted,
      caption: shifted.caption || "Quick Reference"
    });
  }

  if (d.flights?.leg_tables?.length) {
    const tripTotal = d.flights.trip_total;
    const other = tables.filter(t => t !== tripTotal && !/trip total/i.test(t.caption || ""));
    out.panels = [
      ...d.flights.leg_tables.map(t => ({ ...t, caption: t.caption || "Flight leg" })),
      ...(tripTotal ? [{ ...tripTotal, caption: tripTotal.caption || "Trip Total" }] : []),
      ...other.map(t => ({ ...t, caption: t.caption || "Details" }))
    ];
    if (d.flights.search_date) {
      out.sidebar.unshift({
        type: "list",
        caption: "Flight search",
        items: [`Search date: ${d.flights.search_date}`]
      });
    }
    if (tripTotal?.rows?.length) {
      out.sidebar.push({
        type: "table",
        ...tripTotal,
        caption: tripTotal.caption || "Trip Total"
      });
    }
    const picks = (d.flights.legs || [])
      .filter(l => l.recommended?.price)
      .map(l => {
        const leg = l.label.replace(/^leg:\s*/i, "").trim();
        const r = l.recommended;
        return `${leg}: ${r.price} · ${r.stops} stop · ${r.duration}`;
      });
    if (picks.length) {
      out.sidebar.push({ type: "list", caption: "Recommended picks", items: picks });
    }
  } else {
    out.panels = tables.map(t => ({ ...t, caption: t.caption || "Details" }));
  }
  return out;
}
