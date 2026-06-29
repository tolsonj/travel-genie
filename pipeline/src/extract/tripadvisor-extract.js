// Parse TripAdvisor venue comparison tables from opt/sidecar markdown.

function stripMd(s) {
  return String(s || "")
    .replace(/\*\*/g, "")
    .replace(/\[\[([^\]]+)\]\]/g, "$1")
    .trim();
}

function colMatch(columns, re) {
  return (columns || []).some(c => re.test(String(c).trim()));
}

export function looksLikeVenueTable(table) {
  const cols = table.columns || [];
  const hasName = colMatch(cols, /restaurant|attraction|venue|name|place/i);
  const hasSignal = colMatch(cols, /rating|review|price|cuisine|type/i);
  return hasName && hasSignal;
}

function isVenueCaption(caption) {
  const c = caption || "";
  return (
    /venue snapshot|restaurant comparison|attractions comparison|restaurant options|attraction options/i.test(c) ||
    /^city:\s*/i.test(c) ||
    /^hub:\s*/i.test(c)
  );
}

function isVenueTable(table) {
  return looksLikeVenueTable(table) || isVenueCaption(table.caption);
}

function isVenueSearchLog(table) {
  const cap = table.caption || "";
  const cols = (table.columns || []).join(" ");
  return /mcp search log|search log/i.test(cap) || (/city/i.test(cols) && /tool|category|query/i.test(cols));
}

function parseSearchDate(body) {
  const m =
    body.match(/\*?\*?Search date:\s*([^\n*]+)/i) ||
    body.match(/\*?\*?Venue Snapshot[\s\S]*?\*Search date:\s*([^\n*]+)/i) ||
    body.match(/(?:prices?|rates?|venues?)\s+(?:checked|searched)\s+(?:on\s+)?(\d{4}-\d{2}-\d{2})/i);
  return m ? stripMd(m[1]).trim() : null;
}

function parseVenueKind(body) {
  if (/venue snapshot\s*[—–-]\s*restaurants|restaurant comparison/i.test(body)) return "restaurants";
  if (/venue snapshot\s*[—–-]\s*attractions|attractions comparison/i.test(body)) return "attractions";
  return "venues";
}

function recommendedRow(rows) {
  return (
    rows.find(r => /recommended|best value|pick/i.test(r.join(" "))) ||
    rows.find(r => /\*\*/.test(r.join(""))) ||
    rows[0]
  );
}

function rowToPick(row, columns) {
  if (!row?.length) return null;
  const col = name => {
    const i = (columns || []).findIndex(c => new RegExp(name, "i").test(c));
    return i >= 0 ? stripMd(row[i]) : "";
  };
  return {
    name:
      col("restaurant|attraction|venue|place|name") || stripMd(row[0]),
    rating: col("rating|score|stars") || stripMd(row[1]),
    reviews: col("review") || "",
    price: col("price|cuisine|type") || stripMd(row[2]),
    category: col("cuisine|type|category") || "",
    notes: col("note|why|pros|comments") || stripMd(row[row.length - 1])
  };
}

export function extractVenues(body, tables) {
  const search_date = parseSearchDate(body);
  const kind = parseVenueKind(body);
  const venue_tables = [];
  const other_tables = [];
  let search_log = null;

  for (const t of tables) {
    if (isVenueSearchLog(t)) {
      search_log = t;
      continue;
    }
    if (isVenueTable(t)) venue_tables.push(t);
    else other_tables.push(t);
  }

  const picks = venue_tables.map(t => {
    const recommended = recommendedRow(t.rows || []);
    return {
      label: t.caption || "Venue options",
      recommended: rowToPick(recommended, t.columns),
      options: t.rows || []
    };
  });

  return {
    search_date,
    kind,
    picks,
    venue_tables,
    search_log,
    other_tables
  };
}
