// Build per-city proximity maps: hotel anchor → shopping/restaurant venues with distances.
import { haversineKm, formatDistanceKm } from "./coords.js";
import { resolveVenueCoord, citiesMatch, normalizeCityKey } from "./venue-coords.js";
import { SHOPPING_GEO } from "./shopping-geo.js";

const HOTEL_COLOR = "#2980b9";
const SHOP_COLOR = "#d4a017";
const FOOD_COLOR = "#27ae60";
const OTHER_COLOR = "#8e44ad";

function stripMd(s) {
  return String(s || "")
    .replace(/\*\*/g, "")
    .replace(/\[\[([^\]]+)\]\]/g, "$1")
    .trim();
}

function boundsFromNodes(nodes, pad = 0.08) {
  if (!nodes.length) return null;
  const lngs = nodes.map(n => n.lng);
  const lats = nodes.map(n => n.lat);
  const spanLng = Math.max(...lngs) - Math.min(...lngs);
  const spanLat = Math.max(...lats) - Math.min(...lats);
  const padLng = Math.max(pad, spanLng * 0.35 + 0.02);
  const padLat = Math.max(pad, spanLat * 0.35 + 0.02);
  return {
    west: Math.min(...lngs) - padLng,
    east: Math.max(...lngs) + padLng,
    south: Math.min(...lats) - padLat,
    north: Math.max(...lats) + padLat
  };
}

function cityFromPickLabel(label) {
  return stripMd(label).replace(/^city:\s*/i, "").replace(/\s*\(.*$/, "").trim();
}

function venueNameFromRow(row, columns) {
  const cols = columns || [];
  const idx = cols.findIndex(c => /district|market|spot|anchor|store|name|restaurant|hotel|property|venue|place/i.test(c));
  return stripMd(row[idx >= 0 ? idx : 0]);
}

function pickVenuesForCity(picks, city) {
  return (picks || []).filter(p => citiesMatch(p.label, city));
}

function flattenVenueRows(venueData, kind) {
  const tables = venueData?.venue_tables || venueData?.shopping_tables || [];
  const out = [];
  for (const t of tables) {
    const city = cityFromPickLabel(t.caption || "");
    for (const row of t.rows || []) {
      const name = venueNameFromRow(row, t.columns);
      if (!name) continue;
      out.push({ name, city, kind });
    }
  }
  return out;
}

function tableForPick(tables, pick) {
  if (!tables?.length) return null;
  const label = pick?.label || "";
  return (
    tables.find(t => (t.caption || "") === label) ||
    tables.find(t => citiesMatch(t.caption || "", label))
  );
}

function allHotelsFromPick(hp, hotelTable) {
  const columns = hotelTable?.columns || [];
  return (hp.options || [])
    .map(row => {
      const name = venueNameFromRow(row, columns);
      if (!name) return null;
      return {
        name,
        recommended: /recommended/i.test(row.join(" "))
      };
    })
    .filter(Boolean);
}

function flattenAllRestaurantsForCity(restaurants, city) {
  const out = [];
  const seen = new Set();
  for (const pick of pickVenuesForCity(restaurants?.picks, city)) {
    const table = tableForPick(restaurants?.venue_tables, pick);
    const columns = table?.columns || [];
    for (const row of pick.options || []) {
      const name = venueNameFromRow(row, columns);
      if (!name || seen.has(name.toLowerCase())) continue;
      seen.add(name.toLowerCase());
      out.push({ name, city, kind: "restaurant" });
    }
  }
  return out;
}

function buildCityMap({ city, hotel, alternateHotels, venues, trip }) {
  if (!hotel?.name) return null;

  const hotelCoord = resolveVenueCoord(hotel.name, city, trip);
  if (!hotelCoord) return null;

  const anchor = {
    label: hotel.name,
    mapLabel: hotel.name.split(/\s+/).slice(0, 2).join(" "),
    marker: "H",
    lng: hotelCoord.lng,
    lat: hotelCoord.lat,
    color: HOTEL_COLOR,
    role: "anchor",
    kind: "hotel",
    labelDy: -22
  };

  const altNodes = [];
  let altIdx = 2;
  for (const alt of alternateHotels || []) {
    if (alt.name === hotel.name || alt.recommended) continue;
    const coord = resolveVenueCoord(alt.name, city, trip);
    if (!coord || coord.source === "city-center") continue;
    altNodes.push({
      label: alt.name,
      mapLabel: alt.name.length > 24 ? `${alt.name.slice(0, 22)}…` : alt.name,
      marker: String(altIdx),
      lng: coord.lng,
      lat: coord.lat,
      color: "#7f8c8d",
      role: "hotel-alt",
      kind: "hotel",
      labelDy: altIdx % 2 ? 18 : -16
    });
    altIdx += 1;
  }

  const seen = new Set();
  const venueNodes = [];
  for (const v of venues) {
    const key = v.name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    const coord = resolveVenueCoord(v.name, v.city || city, trip);
    if (!coord || coord.source === "city-center") continue;

    const color = v.kind === "restaurant" ? FOOD_COLOR : v.kind === "shopping" ? SHOP_COLOR : OTHER_COLOR;
    const marker = v.kind === "restaurant" ? "R" : v.kind === "shopping" ? "S" : "•";
    venueNodes.push({
      label: v.name,
      mapLabel: v.name.length > 28 ? `${v.name.slice(0, 26)}…` : v.name,
      marker,
      lng: coord.lng,
      lat: coord.lat,
      color,
      kind: v.kind,
      labelDy: venueNodes.length % 2 ? 22 : -18
    });
  }

  if (!venueNodes.length) return null;

  const nodes = [anchor, ...venueNodes];
  const overview_nodes = [anchor, ...altNodes, ...venueNodes];
  const distance_edges = venueNodes.map((_, i) => {
    const toIdx = i + 1;
    const km = haversineKm(anchor, nodes[toIdx]);
    return { to: toIdx, label: formatDistanceKm(km), km };
  });

  distance_edges.sort((a, b) => a.km - b.km);

  const distances = distance_edges.map(e => {
    const node = nodes[e.to];
    return {
      venue: node.label,
      kind: node.kind || "venue",
      distance: e.label,
      km: e.km
    };
  });

  const geo = SHOPPING_GEO[trip];
  return {
    city,
    hotel: hotel.name,
    alternate_hotels: altNodes.map(n => ({ name: n.label })),
    map: {
      bounds: boundsFromNodes(overview_nodes),
      nodes,
      overview_nodes,
      anchor_index: 0,
      distance_edges,
      hide_route: true,
      highlight_countries: geo?.highlight_countries || []
    },
    distances
  };
}

/**
 * @param {string} trip
 * @param {{ picks: { label: string, recommended?: { property?: string }, options?: string[][] }[] }} hotels
 * @param {{ picks: object[] }} [shopping]
 * @param {{ picks: object[] }} [restaurants]
 */
export function buildTripProximityMaps(trip, { hotels, shopping, restaurants } = {}) {
  const hotelPicks = hotels?.picks || [];
  const shoppingFlat = flattenVenueRows(shopping, "shopping");
  const maps = [];

  for (const hp of hotelPicks) {
    const city = cityFromPickLabel(hp.label);
    const rec = hp.recommended;
    if (!rec?.property) continue;

    const hotelTable = hotels?.hotel_tables?.find(
      t => (t.caption || "") === (hp.label || "") || citiesMatch(t.caption || "", hp.label)
    );
    const allHotels = allHotelsFromPick(hp, hotelTable);

    const venues = shoppingFlat.filter(v => citiesMatch(v.city, city));
    venues.push(...flattenAllRestaurantsForCity(restaurants, city));

    const cityMap = buildCityMap({
      city,
      hotel: { name: stripMd(rec.property) },
      alternateHotels: allHotels,
      venues,
      trip
    });
    if (cityMap) maps.push(cityMap);
  }

  return maps.sort((a, b) => normalizeCityKey(a.city).localeCompare(normalizeCityKey(b.city)));
}
