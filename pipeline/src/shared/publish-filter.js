// Strip MCP search logs, desk-research logs, and search-metadata intros from public HTML output.

function tableCols(table) {
  return (table?.columns || []).join(" ");
}

export function isSearchLogTable(table) {
  const cap = table?.caption || "";
  const cols = tableCols(table);
  if (/mcp search log|desk research log|search log/i.test(cap)) return true;
  if (/city/i.test(cols) && /tool|category|query|platform|source/i.test(cols)) return true;
  if (/city/i.test(cols) && /check-in|check-out/i.test(cols) && /tool/i.test(cols)) return true;
  return false;
}

export function isPublisherIntro(text) {
  if (!text?.trim()) return false;
  const t = String(text).replace(/^>\s*/, "").replace(/^\*+|\*+$/g, "").trim();
  if (/^search date:/i.test(t)) return true;
  if (/^(hotel|restaurant|attractions?|spa(?:\s*&\s*wellness)?|shopping|mcp flight)\s+(?:rate\s+)?check\b/i.test(t)) {
    return true;
  }
  if (
    /serpapi|tripadvisor verified|desk research|mcp /i.test(t) &&
    !/[.!?]\s+[A-Z]/.test(t) &&
    t.length < 220
  ) {
    return true;
  }
  return false;
}

export function publishIntro(intro) {
  return isPublisherIntro(intro) ? null : intro;
}

export function filterPublisherTables(tables) {
  return (tables || []).filter(t => !isSearchLogTable(t));
}

export function publishSection(section) {
  if (!section) return section;
  return {
    ...section,
    ...(section.intro != null && { intro: publishIntro(section.intro) }),
    ...(section.tables != null && { tables: filterPublisherTables(section.tables) })
  };
}

export function isPublisherSidebarBlock(block) {
  if (!block) return false;
  const cap = block.caption || "";
  if (/^(flight|hotel) search$/i.test(cap)) return true;
  if (block.type === "table" && isSearchLogTable(block)) return true;
  if (block.type === "list") {
    const items = block.items || [];
    if (!items.length) return false;
    if (items.every(i => /^search date:/i.test(String(i).trim()))) return true;
  }
  return false;
}

export function filterPublisherSidebar(sidebar) {
  return (sidebar || []).filter(b => !isPublisherSidebarBlock(b));
}

export function filterPublisherPanels(panels) {
  return (panels || []).filter(p => !isSearchLogTable(p));
}

export function publishKicker(kicker) {
  if (!kicker) return kicker;
  return String(kicker)
    .replace(/\bMCP\s+/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function publishBanner(banner) {
  if (!banner?.text) return banner;
  if (isPublisherIntro(banner.text)) return undefined;
  return banner;
}

export function sanitizeDashboardModel(d) {
  if (!d) return d;
  const intro = publishIntro(d.intro);
  return {
    ...d,
    intro,
    section_kicker: publishKicker(d.section_kicker),
    banner: publishBanner(d.banner ?? (intro ? { text: intro } : undefined)),
    tables: filterPublisherTables(d.tables),
    panels: filterPublisherPanels(d.panels),
    sidebar: filterPublisherSidebar(d.sidebar)
  };
}
