/**
 * Converts legacy 04-master-itinerary.json table shape into structured days[].
 *
 * Day table captions match: /^Day\s+(\d+)\s*[–—-]/
 * Non-day tables (Trip overview, Booking queue, Multi-country notes, etc.) are skipped.
 */

const DAY_CAPTION_RE = /^Day\s+(\d+)\s*[–—-]/;

/**
 * Extract location from a day caption string.
 * Takes text after the last " · " if it doesn't contain "→" or look like a transit phrase.
 * @param {string} caption
 * @returns {string}
 */
function extractLocation(caption) {
  const parts = caption.split(" · ");
  if (parts.length < 2) return "";
  const last = parts[parts.length - 1].trim();
  // Skip if it looks like a transit phrase or day label
  if (last.includes("→") || /^Day\s+\d+/i.test(last)) return "";
  // Skip if it looks like a date descriptor (contains month names)
  if (/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/i.test(last) && last.split(" ").length <= 4) {
    // e.g. "Sept 2" — skip
    return "";
  }
  return last;
}

/**
 * Parse day events from table rows. First column is event name, second is plan text.
 * Splits plan text on " · " to produce multiple lines.
 * @param {string[][]} rows
 * @returns {{ name: string, lines: string[] }[]}
 */
function parseEvents(rows) {
  return rows.map(([name, plan]) => {
    const lines = plan
      ? plan.split(" · ").map(s => s.trim()).filter(Boolean)
      : [];
    return { name: name ?? "", lines };
  });
}

/**
 * Returns days[] from the tables[] in a master-itinerary aspect data object.
 * Non-day tables (Trip overview, Booking queue, etc.) are skipped.
 * @param {{ tables: Array<{ caption: string, columns: string[], rows: string[][] }> }} data
 * @returns {Array<{ day: number, title: string, location: string, events: Array<{ name: string, lines: string[] }>, footnotes: object }>}
 */
export function parseItineraryTables(data) {
  const tables = data.tables ?? [];
  const days = [];

  for (const table of tables) {
    const match = DAY_CAPTION_RE.exec(table.caption ?? "");
    if (!match) continue;

    const day = parseInt(match[1], 10);
    const title = table.caption;
    const location = extractLocation(title);
    const events = parseEvents(table.rows ?? []);

    days.push({ day, title, location, events, footnotes: {} });
  }

  return days.sort((a, b) => a.day - b.day);
}

/**
 * Extract booking queue rows from tables where caption === "Booking queue".
 * @param {{ tables: Array<{ caption: string, columns: string[], rows: string[][] }> }} data
 * @returns {Array<{ book_now: string, book_later: string, deadline: string }>}
 */
export function parseBookingQueue(data) {
  const tables = data.tables ?? [];
  const table = tables.find(t => t.caption === "Booking queue");
  if (!table) return [];

  return (table.rows ?? []).map(row => ({
    book_now: row[0] ?? "",
    book_later: row[1] ?? "",
    deadline: row[2] ?? "",
  }));
}

/**
 * Extract the trip overview as a flat object from the "Trip overview" table.
 * @param {{ tables: Array<{ caption: string, columns: string[], rows: string[][] }> }} data
 * @returns {{ dates: string, countries: string, budget: string, hub_nights: string, duration: string, pace: string }}
 */
export function parseTripOverview(data) {
  const tables = data.tables ?? [];
  const table = tables.find(t => t.caption === "Trip overview");
  if (!table) return {};

  const result = {};
  for (const [field, value] of table.rows ?? []) {
    const key = (field ?? "").toLowerCase().replace(/\s+/g, "_");
    result[key] = value ?? "";
  }
  return result;
}
