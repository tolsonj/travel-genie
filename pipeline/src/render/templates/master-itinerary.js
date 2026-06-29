// Master Itinerary slide — day cards with schedule, wow moment, and backup footers.
import { esc, has } from "../util.js";

export const type = "master-itinerary";
export const usesMap = false;

function scheduleTable(rows) {
  const body = (rows || []).map(
    r => `<tr><td>${esc(r.time)}</td><td>${esc(r.activity)}</td></tr>`
  ).join("");
  return `
    <table class="day-schedule">
      <thead><tr><th>Time</th><th>Activity</th></tr></thead>
      <tbody>${body}</tbody>
    </table>`;
}

function dayCard(day, featured = false) {
  const cls = featured ? "day-card day-card-featured" : "day-card";
  const foot = [
    day.low_energy ? `<span class="day-foot-item"><span class="day-foot-ic" aria-hidden="true">🔋</span><span><strong>Low Energy:</strong> ${esc(day.low_energy)}</span></span>` : "",
    day.rainy_day ? `<span class="day-foot-item"><span class="day-foot-ic" aria-hidden="true">☔</span><span><strong>Rainy Day:</strong> ${esc(day.rainy_day)}</span></span>` : "",
    day.transit ? `<span class="day-foot-item"><span class="day-foot-ic" aria-hidden="true">🚃</span><span><strong>Transit:</strong> ${esc(day.transit)}</span></span>` : ""
  ].filter(Boolean).join("");

  return `
    <article class="${cls}">
      <header class="day-card-head">${esc(day.title)}</header>
      ${day.location ? `<div class="day-card-loc"><strong>Location:</strong> ${esc(day.location)}</div>` : ""}
      ${scheduleTable(day.schedule)}
      ${day.wow_moment ? `
      <div class="day-wow">
        <span class="day-wow-icon" aria-hidden="true">✓</span>
        <span><strong>WOW MOMENT:</strong> ${esc(day.wow_moment)}</span>
      </div>` : ""}
      ${foot ? `<footer class="day-card-foot">${foot}</footer>` : ""}
    </article>`;
}

function nextSegmentCard(text) {
  if (!text) return "";
  return `<div class="day-card day-card-next"><p>${esc(text)}</p></div>`;
}

function renderPart(d, part) {
  const days = part.days || [];
  if (!days.length) return "";

  const featuredIdx = typeof part.featured_index === "number" ? part.featured_index : 0;
  const featured = days[featuredIdx] || days[0];
  const rest = days.filter((_, i) => i !== featuredIdx);
  const stack = rest.slice(0, 2);
  const overflow = rest.slice(2);

  const titleMain = d.slide_title || "MASTER";
  const titleAccent = d.slide_title_accent || "ITINERARY";
  const subtitle = part.subtitle || "";
  const footer = part.footer || "";

  const rightCol = [
    ...stack.map(day => dayCard(day)),
    nextSegmentCard(part.next_segment),
    ...overflow.map(day => dayCard(day))
  ].join("");

  return `
    <section class="slide itinerary-slide">
      <div class="itinerary-top-bar" aria-hidden="true"></div>
      <div class="itinerary-title-row">
        <h1 class="itinerary-slide-title">
          <span class="itinerary-title-main">${esc(titleMain)}</span>
          <span class="itinerary-title-accent">${esc(titleAccent)}</span>
        </h1>
        ${part.duration_banner ? `<div class="itinerary-duration-banner">${esc(part.duration_banner)}</div>` : ""}
        ${subtitle ? `<div class="itinerary-subtitle">${esc(subtitle)}</div>` : ""}
      </div>
      <div class="itinerary-grid">
        <div class="itinerary-featured">${dayCard(featured, true)}</div>
        <div class="itinerary-right">${rightCol}</div>
      </div>
      ${footer ? `<div class="itinerary-footer">${esc(footer)}</div>` : ""}
      <div class="watermark">travel-genie · ${esc(d.trip)}</div>
    </section>`;
}

export function render(d) {
  if (has(d.parts)) {
    return d.parts.map(part => renderPart(d, part)).join("\n");
  }

  // Fallback: single part from flat days array.
  if (has(d.days)) {
    return renderPart(d, {
      days: d.days,
      subtitle: d.subtitle,
      footer: d.footer,
      next_segment: d.next_segment
    });
  }

  return `
    <section class="slide">
      <h1 class="slide-title">${esc(d.slide_title || d.title || "Master Itinerary")}</h1>
      <p class="intro">${esc(d.intro || "No itinerary days extracted.")}</p>
      <div class="watermark">travel-genie · ${esc(d.trip)}</div>
    </section>`;
}
