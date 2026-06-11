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
    out.sidebar.push({ type: "table", ...tables.shift(), caption: tables[0]?.caption || "Quick Reference" });
  }

  out.panels = tables.map(t => ({ ...t, caption: t.caption || "Details" }));
  return out;
}
