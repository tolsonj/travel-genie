// Parse shopping comparison tables from sidecar markdown.

function stripMd(s) {
  return String(s || "")
    .replace(/\*\*/g, "")
    .replace(/\[\[([^\]]+)\]\]/g, "$1")
    .trim();
}

function colMatch(columns, re) {
  return (columns || []).some(c => re.test(String(c).trim()));
}

function isShoppingCityTable(table) {
  const cap = table.caption || "";
  return (
    /^city:\s*/i.test(cap) ||
    /^hub:\s*/i.test(cap) ||
    /shopping district|district\/market|district \/ market/i.test(cap)
  );
}

function looksLikeShoppingTable(table) {
  const cols = table.columns || [];
  return (
    colMatch(cols, /district|market|spot|anchor|store/i) &&
    colMatch(cols, /category|buy|price|notes/i)
  );
}

function isShoppingTable(table) {
  return isShoppingCityTable(table) || looksLikeShoppingTable(table);
}

function isShoppingSearchLog(table) {
  const cap = table.caption || "";
  const cols = (table.columns || []).join(" ");
  return (
    /search log|desk research log|mcp search log/i.test(cap) ||
    (/city/i.test(cols) && /tool|source|query|platform/i.test(cols))
  );
}

function parseSearchDate(body) {
  const m =
    body.match(/\*?\*?Search date:\s*([^\n*]+)/i) ||
    body.match(/\*?\*?Research date:\s*([^\n*]+)/i) ||
    body.match(/(?:researched|checked)\s+(?:on\s+)?(\d{4}-\d{2}-\d{2})/i);
  return m ? stripMd(m[1]).trim() : null;
}

function recommendedRow(rows) {
  return (
    rows.find(r => /recommended|scheduled|best stop/i.test(r.join(" "))) ||
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
    name: col("district|market|spot|anchor|store|name") || stripMd(row[0]),
    category: col("category|buy|type") || stripMd(row[1]),
    price: col("price|budget") || stripMd(row[2]),
    notes: col("note|fit|day|notes") || stripMd(row[row.length - 1])
  };
}

export function extractShopping(body, tables) {
  const search_date = parseSearchDate(body);
  const shopping_tables = [];
  const other_tables = [];

  for (const t of tables) {
    if (isShoppingSearchLog(t)) {
      other_tables.push(t);
      continue;
    }
    if (isShoppingTable(t)) shopping_tables.push(t);
    else other_tables.push(t);
  }

  const picks = shopping_tables.map(t => ({
    label: t.caption || "Shopping options",
    recommended: rowToPick(recommendedRow(t.rows || []), t.columns),
    options: t.rows || []
  }));

  const reordered = [...shopping_tables, ...other_tables];

  return {
    search_date,
    picks,
    shopping_tables,
    other_tables,
    search_log: other_tables.find(isShoppingSearchLog) || null
  };
}
