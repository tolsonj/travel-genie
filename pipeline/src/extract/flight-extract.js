// Parse MCP flight comparison tables from opt markdown.

function stripMd(s) {
  return String(s || "")
    .replace(/\*\*/g, "")
    .replace(/\[\[([^\]]+)\]\]/g, "$1")
    .trim();
}

function colMatch(columns, re) {
  return (columns || []).some(c => re.test(String(c).trim()));
}

export function isFlightPriceTable(table) {
  const cols = table.columns || [];
  return (
    colMatch(cols, /^price$/i) &&
    colMatch(cols, /^stops$/i) &&
    (colMatch(cols, /^airlines$/i) || colMatch(cols, /^duration$/i))
  );
}

export function isTripTotalTable(table) {
  const cap = table.caption || "";
  const cols = (table.columns || []).join(" ");
  return (
    /trip total|flight total|budget summary/i.test(cap) ||
    (/scenario|per person|total.*pax/i.test(cols) && /budget|recommended/i.test(cols))
  );
}

export function isDateFlexTable(table) {
  return /date.?flex|flex savings|shift.*day/i.test(table.caption || "");
}

export function isFlightLegCaption(caption) {
  const c = caption || "";
  return (
    /leg:\s*/i.test(c) ||
    /^flight:/i.test(c) ||
    /inbound|outbound|international flight/i.test(c) ||
    /flight price snapshot/i.test(c) ||
    (/→|->/.test(c) && /[A-Z]{3}/.test(c))
  );
}

export function isFlightTable(table) {
  return (
    isFlightPriceTable(table) ||
    isFlightLegCaption(table.caption) ||
    /flight price snapshot/i.test(table.caption || "")
  );
}

export function parseSearchDate(body) {
  const m =
    body.match(/\*?\*?Search date:\s*([^\n*]+)/i) ||
    body.match(/(?:prices?\s+)?searched?\s+(?:on\s+)?(\d{4}-\d{2}-\d{2})/i) ||
    body.match(/as of\s+(\d{4}-\d{2}-\d{2})/i);
  return m ? stripMd(m[1]).trim() : null;
}

function recommendedRow(rows) {
  return (
    rows.find(r => /recommended/i.test(r.join(" "))) ||
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
    price: col("price") || stripMd(row[0]),
    stops: col("stops") || stripMd(row[1]),
    duration: col("duration") || stripMd(row[2]),
    airlines: col("airlines") || stripMd(row[3]),
    notes: col("notes") || stripMd(row[4] || row[3])
  };
}

export function extractFlights(body, tables) {
  const search_date = parseSearchDate(body);
  const trip_total = tables.find(isTripTotalTable) || null;
  const leg_tables = [];
  const ground_tables = [];

  for (const t of tables) {
    if (isTripTotalTable(t)) continue;
    if (isFlightTable(t)) leg_tables.push(t);
    else ground_tables.push(t);
  }

  const legs = leg_tables.map(t => {
    const recommended = recommendedRow(t.rows || []);
    return {
      label: t.caption || "Flight leg",
      recommended: rowToPick(recommended, t.columns),
      options: t.rows || []
    };
  });

  const budget_note =
    body.match(/(?:flight total|trip total)[^\n]*(\d+%\s+of\s+[^\n.]+)/i)?.[1] ||
    body.match(/(\d+%\s+of\s+\$[\d,]+K?\s+budget)/i)?.[1] ||
    null;

  return {
    search_date,
    legs,
    trip_total,
    leg_tables,
    ground_tables,
    budget_note: budget_note ? stripMd(budget_note) : null
  };
}

export function flightSnapshotFromTables(body, tables) {
  const { search_date, legs, trip_total, budget_note } = extractFlights(body, tables);
  const picks = legs
    .filter(l => l.recommended?.price)
    .map(l => ({ leg: l.label, ...l.recommended }));
  if (!picks.length && !trip_total) return null;
  return {
    search_date,
    picks,
    trip_total: trip_total
      ? { caption: trip_total.caption, columns: trip_total.columns, rows: trip_total.rows }
      : null,
    budget_note
  };
}
