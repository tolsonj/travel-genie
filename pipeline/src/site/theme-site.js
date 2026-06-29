// pipeline/src/site/theme-site.js
// Mobile-first CSS for trip.html. Exported as a string for inline injection.
export const SITE_THEME_CSS = `
/* ── Reset & base ─────────────────────────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; }

html {
  font-size: 16px;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 1rem;
  line-height: 1.6;
  background: #fafaf8;
  color: #1a1a1a;
}

a { color: inherit; }

/* ── Hero ─────────────────────────────────────────────────────────── */
.site-hero {
  background: #1c2b3a;
  color: white;
  padding: 3rem 1rem 2rem;
}

.site-hero-inner {
  max-width: 800px;
  margin: 0 auto;
}

.site-hero-title {
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.5px;
  margin: 0;
}

.site-hero-subtitle {
  font-size: 1.1rem;
  opacity: 0.8;
  margin-top: 0.25rem;
}

.site-hero-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-top: 1rem;
  font-size: 0.9rem;
  opacity: 0.75;
}

/* ── Layout: sidebar + main ───────────────────────────────────────── */
.site-layout {
  display: flex;
  flex-direction: column;
}

.site-main {
  flex: 1;
  min-width: 0;
}

/* ── Sidebar day menu ─────────────────────────────────────────────── */
.site-sidebar {
  background: white;
  border-bottom: 1px solid #e5e5e5;
}

.site-sidebar-header {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #efefef;
}

.site-sidebar-trip {
  display: block;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #1c2b3a;
  text-decoration: none;
  line-height: 1.35;
}

.site-sidebar-trip:hover {
  color: #3d5a73;
}

.site-sidebar-days {
  display: flex;
  overflow-x: auto;
  gap: 0;
  padding: 0;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.site-sidebar-days::-webkit-scrollbar { display: none; }

.site-sidebar-sections {
  display: none;
}

.site-sidebar-link {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  padding: 0.65rem 1rem;
  font-size: 0.8rem;
  color: #555;
  text-decoration: none;
  border-bottom: 2px solid transparent;
  border-right: 1px solid #f0f0f0;
  transition: color 0.15s, background 0.15s, border-color 0.15s;
}

.site-sidebar-link:last-child {
  border-right: none;
}

.site-sidebar-link-date {
  font-size: 0.85rem;
  font-weight: 600;
  color: #1c2b3a;
  white-space: nowrap;
}

.site-sidebar-link-weekday {
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #888;
  margin-top: 0.1rem;
  white-space: nowrap;
}

.site-sidebar-link--active,
.site-sidebar-link:hover {
  background: #f5f7f9;
}

.site-sidebar-link--active .site-sidebar-link-date,
.site-sidebar-link:hover .site-sidebar-link-date {
  color: #1c2b3a;
}

.site-sidebar-link--active {
  border-bottom-color: #1c2b3a;
}

.site-sidebar-link--section {
  flex-direction: row;
  align-items: center;
  font-size: 0.8rem;
  font-weight: 500;
  border-right: none;
  border-left: 3px solid transparent;
}

.site-sidebar-link--section.site-sidebar-link--active {
  border-bottom-color: transparent;
  border-left-color: #1c2b3a;
  background: #f5f7f9;
}

/* ── Section wrapper ──────────────────────────────────────────────── */
.site-section-inner {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* ── Booking queue ────────────────────────────────────────────────── */
.site-booking-queue {
  background: #f5f4f1;
  padding: 1.5rem 0;
  margin-bottom: 0.5rem;
}

.site-section-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1c2b3a;
  margin-top: 0;
  margin-bottom: 0.75rem;
}

/* ── Tables ───────────────────────────────────────────────────────── */
.site-table-wrap {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.site-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.site-table th {
  background: #1c2b3a;
  color: white;
  padding: 0.5rem 0.75rem;
  text-align: left;
  font-weight: 600;
}

.site-table td {
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid #e5e5e5;
  vertical-align: top;
}

.site-table tr:last-child td { border-bottom: none; }

.site-table tr:nth-child(even) td { background: #fafaf8; }

/* ── Itinerary ────────────────────────────────────────────────────── */
.site-itinerary {
  padding: 2rem 0;
}

.site-day {
  margin-bottom: 2.5rem;
}

.site-day-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1c2b3a;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #1c2b3a;
  margin-top: 0;
  margin-bottom: 1.25rem;
}

.site-day-events {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.site-event {
  background: white;
  border-radius: 8px;
  padding: 1rem 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  border: 1px solid #efefef;
}

.site-event-name {
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #888;
  margin-top: 0;
  margin-bottom: 0.4rem;
}

.site-event-lines {
  list-style: none;
  padding: 0;
  margin: 0;
}

.site-event-lines li {
  font-size: 0.95rem;
  line-height: 1.55;
  color: #2a2a2a;
}

.site-event-lines li + li {
  margin-top: 0.3rem;
  padding-top: 0.3rem;
  border-top: 1px solid #f0f0f0;
}

.site-day-divider {
  border: none;
  border-top: 1px solid #e5e5e5;
  margin: 2rem 0;
}

.site-day-footnotes {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 0.75rem;
}

.site-footnote {
  font-size: 0.8rem;
  color: #666;
  background: #f5f5f3;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
}

.site-footnote--wow {
  background: #f0f7f0;
  color: #2d6a2d;
}

.site-footnote--transit {
  background: #f0f4ff;
  color: #1a3a8f;
}

/* ── Reference sections ───────────────────────────────────────────── */
.site-reference-sections {
  padding: 2rem 0;
  background: #f5f4f1;
}

.site-ref-section {
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #e0e0de;
}

.site-ref-section:last-child {
  margin-bottom: 0;
  border-bottom: none;
}

.site-ref-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1c2b3a;
  margin-top: 0;
  margin-bottom: 0.5rem;
}

.site-ref-intro {
  font-size: 0.875rem;
  color: #555;
  margin-bottom: 1rem;
  font-style: italic;
}

/* ── Footer ───────────────────────────────────────────────────────── */
.site-footer {
  background: #1c2b3a;
  color: rgba(255, 255, 255, 0.6);
  padding: 1.5rem 1rem;
  font-size: 0.8rem;
  text-align: center;
}

.site-footer-inner {
  max-width: 800px;
  margin: 0 auto;
}

/* ── Responsive: 768px+ — left sidebar ──────────────────────────── */
@media (min-width: 768px) {
  .site-layout {
    flex-direction: row;
    align-items: flex-start;
  }

  .site-sidebar {
    position: sticky;
    top: 0;
    align-self: flex-start;
    width: 220px;
    flex-shrink: 0;
    max-height: 100vh;
    overflow-y: auto;
    border-bottom: none;
    border-right: 1px solid #e5e5e5;
    box-shadow: 1px 0 4px rgba(0, 0, 0, 0.04);
  }

  .site-sidebar-days {
    flex-direction: column;
    overflow-x: visible;
  }

  .site-sidebar-link {
    border-right: none;
    border-bottom: 1px solid #f5f5f5;
    border-left: 3px solid transparent;
  }

  .site-sidebar-link--day.site-sidebar-link--active {
    border-bottom-color: #f5f5f5;
    border-left-color: #1c2b3a;
  }

  .site-sidebar-sections {
    display: block;
    border-top: 1px solid #e5e5e5;
    padding-top: 0.25rem;
  }

  .site-main .site-section-inner {
    max-width: none;
    padding: 0 2rem;
  }
}

/* ── Responsive: 640px+ ───────────────────────────────────────────── */
@media (min-width: 640px) {
  .site-hero-title {
    font-size: 2.5rem;
  }

  .site-event {
    padding: 1rem 1.5rem;
  }

  .site-day-title {
    font-size: 1.4rem;
  }
}

/* ── Print / PDF ──────────────────────────────────────────────────── */
@media print {
  @page {
    margin: 1.5cm;
    size: A4 portrait;
  }

  .site-nav,
  .site-sidebar,
  .site-footer,
  .site-booking-queue {
    display: none !important;
  }

  body {
    background: white;
    color: black;
    font-size: 11pt;
  }

  .site-hero {
    background: #1c2b3a !important;
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }

  .site-day {
    page-break-inside: avoid;
    break-inside: avoid;
  }

  .site-day-title {
    page-break-before: auto;
  }

  .site-event {
    box-shadow: none;
    border: 1px solid #ccc;
  }

  .site-table th {
    background: #1c2b3a !important;
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }
}

/* Bullet groups (reference sections) */
.site-bullet-group { margin: 1rem 0; }
.site-bullet-heading { font-size: 1rem; font-weight: 600; color: #1c2b3a; margin-bottom: 0.4rem; }
.site-bullet-list { padding-left: 1.5rem; margin: 0; }
.site-bullet-list li { font-size: 0.9rem; line-height: 1.55; color: #2a2a2a; margin-bottom: 0.2rem; }
.site-ref-note { font-size: 0.8rem; color: #777; font-style: italic; margin-top: 0.75rem; }
.site-table-caption { font-size: 0.9rem; font-weight: 600; color: #1c2b3a; margin: 1rem 0 0.25rem; }
`;
