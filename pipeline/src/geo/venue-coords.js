// Resolve venue lat/lng from name + city (registry patterns, trip geo spots, city center).
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { SHOPPING_GEO } from "./shopping-geo.js";
import { ROUTE_PRESETS } from "../extract/md-extract-presets.js";
import { dataDir } from "../discover.js";

/** @type {{ pattern: RegExp, lng: number, lat: number, city?: RegExp }[]} */
export const VENUE_COORD_RULES = [
  // Hong Kong — hotels
  { pattern: /rosewood hong kong/i, lng: 114.1765, lat: 22.2946, city: /hong kong/i },
  { pattern: /aki hotel|aki mgallery/i, lng: 114.1727, lat: 22.2974, city: /hong kong/i },
  { pattern: /silveri hong kong/i, lng: 114.137, lat: 22.286, city: /hong kong/i },
  { pattern: /mondrian hong kong/i, lng: 114.171, lat: 22.294, city: /hong kong/i },
  { pattern: /peninsula hong kong/i, lng: 114.165, lat: 22.294, city: /hong kong/i },
  { pattern: /reverie saigon/i, lng: 106.7038, lat: 10.774, city: /ho chi minh|hcmc|saigon|sài gòn/i },

  // Hanoi — hotels
  { pattern: /le premier hotel/i, lng: 105.852, lat: 21.035, city: /hanoi/i },
  { pattern: /landmark72|intercontinental hanoi landmark/i, lng: 105.796, lat: 21.015, city: /hanoi/i },
  { pattern: /may de ville crown/i, lng: 105.852, lat: 21.034, city: /hanoi/i },
  { pattern: /meritel hanoi/i, lng: 105.848, lat: 21.032, city: /hanoi/i },

  // Đà Nẵng / Hội An — hotels
  { pattern: /naman retreat/i, lng: 108.35, lat: 15.88, city: /đà nẵng|da nang|hội an|hoi an/i },
  { pattern: /bliss hoi an/i, lng: 108.345, lat: 15.91, city: /đà nẵng|da nang|hội an|hoi an/i },
  { pattern: /mikazuki japanese/i, lng: 108.247, lat: 16.047, city: /đà nẵng|da nang/i },
  {
    pattern: /intercontinental danang|sun peninsula/i,
    lng: 108.278,
    lat: 16.12,
    city: /đà nẵng|da nang/i
  },
  { pattern: /vinpearl.*nam hoi an/i, lng: 108.42, lat: 15.62, city: /đà nẵng|da nang|hội an|hoi an/i }
];

function stripMd(s) {
  return String(s || "")
    .replace(/\*\*/g, "")
    .replace(/\[\[([^\]]+)\]\]/g, "$1")
    .trim();
}

function routePresetForTrip(trip) {
  if (ROUTE_PRESETS[trip]) return ROUTE_PRESETS[trip];
  const cachePath = join(dataDir(trip), "geo-preset.json");
  if (!existsSync(cachePath)) return null;
  try {
    return JSON.parse(readFileSync(cachePath, "utf8"));
  } catch {
    return null;
  }
}

function tripGeo(trip) {
  if (SHOPPING_GEO[trip]) return SHOPPING_GEO[trip];
  const preset = routePresetForTrip(trip);
  if (preset?.hubCoords) {
    return { cities: preset.hubCoords, spots: [] };
  }
  return null;
}

function resolveCityCenter(cityHint, trip) {
  const geo = tripGeo(trip);
  if (!geo?.cities) return null;
  const name = stripMd(cityHint);
  if (geo.cities[name]) return { lng: geo.cities[name].lng, lat: geo.cities[name].lat };
  for (const [key, val] of Object.entries(geo.cities)) {
    if (name.includes(key) || key.includes(name)) return { lng: val.lng, lat: val.lat };
  }
  return null;
}

function matchSpot(text, cityHint, trip) {
  const geo = tripGeo(trip);
  if (!geo?.spots) return null;
  const blob = `${text || ""} ${cityHint || ""}`;
  for (const s of geo.spots) {
    if (s.re.test(blob) && (!s.city || s.city.test(cityHint || blob))) {
      return { lng: s.lng, lat: s.lat };
    }
  }
  return null;
}

function matchCoordRule(name, cityHint) {
  const blob = stripMd(name);
  const city = stripMd(cityHint);
  for (const rule of VENUE_COORD_RULES) {
    if (!rule.pattern.test(blob)) continue;
    if (rule.city && !rule.city.test(city)) continue;
    return { lng: rule.lng, lat: rule.lat };
  }
  return null;
}

/** @returns {{ lng: number, lat: number, source: string } | null} */
export function resolveVenueCoord(name, cityHint, trip) {
  const fromRule = matchCoordRule(name, cityHint);
  if (fromRule) return { ...fromRule, source: "registry" };

  const fromSpot = matchSpot(name, cityHint, trip);
  if (fromSpot) return { ...fromSpot, source: "spot" };

  const center = resolveCityCenter(cityHint, trip);
  if (center) return { ...center, source: "city-center" };

  return null;
}

export function normalizeCityKey(label) {
  return stripMd(label)
    .replace(/^city:\s*/i, "")
    .replace(/\s*\(.*$/, "")
    .replace(/\s*\/\s*.+$/, "")
    .trim()
    .toLowerCase();
}

/** ASCII slug for map CSV filenames (e.g. "Đà Nẵng" → "da-nang"). */
export function cityFileSlug(label) {
  return normalizeCityKey(label)
    .replace(/\u0111/g, "d")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function citiesMatch(a, b) {
  const ka = normalizeCityKey(a);
  const kb = normalizeCityKey(b);
  if (!ka || !kb) return false;
  if (ka === kb || ka.includes(kb) || kb.includes(ka)) return true;
  const aliases = [
    ["hong kong", "hk"],
    ["hanoi", "hn"],
    ["ho chi minh", "hcmc", "saigon", "sài gòn"],
    ["đà nẵng", "da nang", "danang", "hội an", "hoi an"],
    ["beijing", "bj"],
    ["bangkok", "bkk"],
    ["chiang mai", "cm"],
    ["koh samui", "samui"],
    ["tokyo", "tyo"],
    ["kyoto", "kix"],
    ["osaka", "osa"]
  ];
  return aliases.some(group => group.some(x => ka.includes(x)) && group.some(x => kb.includes(x)));
}
