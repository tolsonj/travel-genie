// Parse hotel comparison tables from opt markdown.

function stripMd(s) {
  return String(s || "")
    .replace(/\*\*/g, "")
    .replace(/\[\[([^\]]+)\]\]/g, "$1")
    .trim();
}

function colMatch(columns, re) {
  return (columns || []).some(c => re.test(String(c).trim()));
}

function looksLikeHotelTable(table) {
  const cols = table.columns || [];
  return (
    colMatch(cols, /hotel|property|name/i) &&
    (colMatch(cols, /price|night|rate/i) || colMatch(cols, /location|area|district/i))
  );
}

function isHotelSummaryTable(table) {
  const cap = table.caption || "";
  const cols = (table.columns || []).join(" ");
  return (
    /hotel total|lodging total|accommodation total|hotel budget|budget summary/i.test(cap) ||
    (/scenario|per night|nights|total/i.test(cols) && /hotel|lodging|accommodation|budget/i.test(cols))
  );
}

function isHotelCaption(caption) {
  const c = caption || "";
  return (
    /hotel options|hotel comparison|recommended hotels|best picks/i.test(c) ||
    /^city:\s*/i.test(c) ||
    /^hub:\s*/i.test(c) ||
    /beijing|hanoi|da nang|đà nẵng|hoi an|hội an|tokyo|kyoto|osaka/i.test(c)
  );
}

function isHotelTable(table) {
  return looksLikeHotelTable(table) || isHotelCaption(table.caption);
}

function parseSearchDate(body) {
  const m =
    body.match(/\*?\*?Search date:\s*([^\n*]+)/i) ||
    body.match(/\*?\*?Rate check(?:ed)?(?: on)?:\s*([^\n*]+)/i) ||
    body.match(/(?:prices?|rates?)\s+(?:checked|searched)\s+(?:on\s+)?(\d{4}-\d{2}-\d{2})/i);
  return m ? stripMd(m[1]).trim() : null;
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
    property: col("hotel|property|name") || stripMd(row[0]),
    price: col("price|night|rate") || stripMd(row[1]),
    location: col("location|area|district") || stripMd(row[2]),
    rating: col("rating|score|stars") || stripMd(row[3]),
    notes: col("note|why|pros|comments") || stripMd(row[4] || row[3])
  };
}

export function extractHotels(body, tables) {
  const search_date = parseSearchDate(body);
  const total = tables.find(isHotelSummaryTable) || null;
  const hotel_tables = [];
  const other_tables = [];

  for (const t of tables) {
    if (isHotelSummaryTable(t)) continue;
    if (isHotelTable(t)) hotel_tables.push(t);
    else other_tables.push(t);
  }

  const picks = hotel_tables.map(t => {
    const recommended = recommendedRow(t.rows || []);
    return {
      label: t.caption || "Hotel options",
      recommended: rowToPick(recommended, t.columns),
      options: t.rows || []
    };
  });

  const budget_note =
    body.match(/(?:hotel|lodging|accommodation)\s+total[^\n]*(\d+%\s+of\s+[^\n.]+)/i)?.[1] ||
    body.match(/(\d+%\s+of\s+\$[\d,]+K?\s+budget)/i)?.[1] ||
    null;

  return {
    search_date,
    picks,
    total,
    hotel_tables,
    other_tables,
    budget_note: budget_note ? stripMd(budget_note) : null
  };
}
