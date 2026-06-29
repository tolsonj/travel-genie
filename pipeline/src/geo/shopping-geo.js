// City + shopping-district coordinates for hub/day maps (deterministic).
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { ROUTE_PRESETS } from "../extract/md-extract-presets.js";
import { dataDir } from "../discover.js";

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

export const SHOPPING_GEO = {
  "thailand-2026": {
    highlight_countries: ["Thailand"],
    cities: {
      Bangkok: { lng: 100.5018, lat: 13.7563, marker: "B", color: "#c0392b", labelDy: -18 },
      "Chiang Mai": { lng: 98.9853, lat: 18.7883, marker: "C", color: "#d4a017", labelDy: -18 },
      "Koh Samui": { lng: 100.0629, lat: 9.512, marker: "S", color: "#27ae60", labelDy: 26 }
    },
    spots: [
      { re: /iconsiam|siam paragon|centralworld/i, city: /bangkok/i, lng: 100.501, lat: 13.746 },
      { re: /chatuchak|jj market/i, city: /bangkok/i, lng: 100.551, lat: 13.8 },
      { re: /asiatique|river/i, city: /bangkok/i, lng: 100.501, lat: 13.704 },
      { re: /talad noi|yaowarat|chinatown/i, city: /bangkok/i, lng: 100.513, lat: 13.739 },
      { re: /night bazaar|warorot/i, city: /chiang mai/i, lng: 98.999, lat: 18.788 },
      { re: /doi suthep/i, city: /chiang mai/i, lng: 98.921, lat: 18.805 },
      { re: /nimman|baan kang wat/i, city: /chiang mai/i, lng: 98.967, lat: 18.799 },
      { re: /fisherman|bophut|chaweng/i, city: /samui/i, lng: 100.033, lat: 9.554 },
      { re: /ang thong/i, city: /samui/i, lng: 99.676, lat: 9.642 }
    ]
  },
  "china-vietnam-2026": {
    highlight_countries: ["China", "Vietnam", "Hong Kong"],
    cities: {
      "Hong Kong": { lng: 114.1694, lat: 22.3193, marker: "HK", color: "#c0392b", labelDy: -18 },
      Guangzhou: { lng: 113.2644, lat: 23.1291, marker: "GZ", color: "#8e44ad", labelDy: -18 },
      Beijing: { lng: 116.4074, lat: 39.9042, marker: "BJ", color: "#c0392b", labelDy: -18 },
      Hanoi: { lng: 105.8542, lat: 21.0285, marker: "HN", color: "#d4a017", labelDy: -18 },
      "Hội An / Đà Nẵng": { lng: 108.329, lat: 15.877, marker: "HA", color: "#27ae60", labelDy: 26 },
      "Hội An": { lng: 108.329, lat: 15.877, marker: "HA", color: "#27ae60", labelDy: 26 },
      "Đà Nẵng": { lng: 108.2022, lat: 16.0544, marker: "DN", color: "#27ae60", labelDy: 26 }
    },
    spots: [
      { re: /ifc|landmark|central|pmq/i, city: /hong kong/i, lng: 114.158, lat: 22.285 },
      { re: /mong kok sin tat|sin centre|sin tat/i, city: /hong kong/i, lng: 114.172, lat: 22.317 },
      { re: /ladies market|tung choi/i, city: /hong kong/i, lng: 114.17, lat: 22.318 },
      { re: /fa yuen|sneaker street/i, city: /hong kong/i, lng: 114.172, lat: 22.319 },
      { re: /causeway bay|times square|sogo/i, city: /hong kong/i, lng: 114.182, lat: 22.28 },
      { re: /temple street/i, city: /hong kong/i, lng: 114.17, lat: 22.305 },
      { re: /golden computer/i, city: /hong kong/i, lng: 114.161, lat: 22.334 },
      { re: /harbour city/i, city: /hong kong/i, lng: 114.166, lat: 22.295 },
      { re: /stanley|causeway/i, city: /hong kong/i, lng: 114.213, lat: 22.22 },
      { re: /taikoo|beijing road/i, city: /guangzhou/i, lng: 113.33, lat: 23.1 },
      { re: /wangfujing|qianmen/i, city: /beijing/i, lng: 116.417, lat: 39.914 },
      { re: /sanlitun|taikoo li north|li-ning|nike flagship/i, city: /beijing/i, lng: 116.455, lat: 39.937 },
      { re: /nanluoguxiang|hutong/i, city: /beijing/i, lng: 116.403, lat: 39.94 },
      { re: /hang gai|hang bac|silk street/i, city: /hanoi/i, lng: 105.848, lat: 21.032 },
      { re: /dong xuan/i, city: /hanoi/i, lng: 105.854, lat: 21.038 },
      { re: /old quarter/i, city: /hanoi/i, lng: 105.852, lat: 21.035 },
      { re: /be be tailor|yaly couture|yaly tailor/i, city: /hội an|hoi an/i, lng: 108.326, lat: 15.877 },
      { re: /ancient town|lantern|tailor/i, city: /hội an|hoi an/i, lng: 108.326, lat: 15.877 },
      { re: /hoi an central market|hội an central market/i, city: /hội an|hoi an/i, lng: 108.325, lat: 15.876 },
      { re: /an bang beach/i, city: /hội an|hoi an/i, lng: 108.345, lat: 15.91 },
      { re: /my son/i, city: /hội an|hoi an/i, lng: 108.12, lat: 15.99 },
      { re: /vincom|indochina|non nước|marble/i, city: /đà nẵng|da nang/i, lng: 108.247, lat: 16.047 }
    ]
  },
  "japan-2026": {
    highlight_countries: ["Japan"],
    cities: {
      Tokyo: { lng: 139.6917, lat: 35.6895, marker: "T", color: "#c0392b", labelDy: -18 },
      "Takayama / Alps": { lng: 137.252, lat: 36.146, marker: "A", color: "#27ae60", labelDy: -18 },
      Takayama: { lng: 137.252, lat: 36.146, marker: "A", color: "#27ae60", labelDy: -18 },
      Kyoto: { lng: 135.7681, lat: 35.0116, marker: "K", color: "#d4a017", labelDy: -18 },
      Osaka: { lng: 135.5023, lat: 34.6937, marker: "O", color: "#8e44ad", labelDy: 26 }
    },
    spots: [
      { re: /kappabashi/i, city: /tokyo/i, lng: 139.785, lat: 35.71 },
      { re: /nakamise|asakusa/i, city: /tokyo/i, lng: 139.796, lat: 35.712 },
      { re: /takeshita|harajuku/i, city: /tokyo/i, lng: 139.703, lat: 35.67 },
      { re: /tokyo station|depachika/i, city: /tokyo/i, lng: 139.767, lat: 35.681 },
      { re: /itoya|ginza/i, city: /tokyo/i, lng: 139.768, lat: 35.672 },
      { re: /akihabara/i, city: /tokyo/i, lng: 139.771, lat: 35.698 },
      { re: /sanmachi/i, city: /takayama|alps/i, lng: 137.252, lat: 36.146 },
      { re: /shirakawa/i, city: /takayama|alps/i, lng: 136.908, lat: 36.256 },
      { re: /nishiki/i, city: /kyoto/i, lng: 135.768, lat: 35.005 },
      { re: /fushimi/i, city: /kyoto/i, lng: 135.768, lat: 34.94 },
      { re: /kiyomizu/i, city: /kyoto/i, lng: 135.785, lat: 34.995 },
      { re: /kuromon/i, city: /osaka/i, lng: 135.507, lat: 34.665 },
      { re: /don quijote|namba/i, city: /osaka/i, lng: 135.502, lat: 34.663 },
      { re: /nipponbashi/i, city: /osaka/i, lng: 135.506, lat: 34.66 }
    ]
  }
};

function tripGeo(trip) {
  if (SHOPPING_GEO[trip]) return SHOPPING_GEO[trip];
  const preset = routePresetForTrip(trip);
  if (preset?.hubCoords) {
    return {
      highlight_countries: preset.highlight_countries || [],
      cities: preset.hubCoords,
      spots: []
    };
  }
  return null;
}

function resolveCityCenter(hubName, trip) {
  const geo = tripGeo(trip);
  if (!geo) return null;
  const name = hubName || "";
  if (geo.cities[name]) return geo.cities[name];
  for (const [key, val] of Object.entries(geo.cities)) {
    if (name.includes(key) || key.includes(name)) return val;
  }
  const preset = ROUTE_PRESETS[trip] || routePresetForTrip(trip);
  if (preset?.hubCoords) {
    for (const [key, val] of Object.entries(preset.hubCoords)) {
      if (name.includes(key) || key.includes(name)) return val;
    }
  }
  return null;
}

function matchSpotCoord(text, cityHint, trip) {
  const geo = tripGeo(trip);
  if (!geo) return null;
  const blob = `${text || ""} ${cityHint || ""}`;
  for (const s of geo.spots) {
    if (s.re.test(blob) && (!s.city || s.city.test(cityHint || blob))) {
      return { lng: s.lng, lat: s.lat };
    }
  }
  return null;
}

function boundsFromNodes(nodes, pad = 0.28) {
  if (!nodes.length) return null;
  const lngs = nodes.map(n => n.lng);
  const lats = nodes.map(n => n.lat);
  return {
    west: Math.min(...lngs) - pad,
    east: Math.max(...lngs) + pad,
    south: Math.min(...lats) - pad,
    north: Math.max(...lats) + pad
  };
}

function dayMarker(dayLabel, index) {
  const n = String(dayLabel || "").replace(/[^\d]/g, "");
  if (n) return n.length > 2 ? n.slice(0, 2) : n;
  return String(index + 1);
}

export function buildHubMap(hub, trip) {
  const center = resolveCityCenter(hub.name, trip);
  if (!center) return null;

  const rows = hub.rows || [];
  const nodes = rows.map((row, i) => {
    const day = row[0];
    const spot = row[1] || "";
    const plan = row[2] || "";
    const hit = matchSpotCoord(`${spot} ${plan}`, hub.name, trip);
    const lng = hit?.lng ?? center.lng;
    const lat = hit?.lat ?? center.lat;
    return {
      label: `Day ${dayMarker(day, i)}`,
      marker: dayMarker(day, i),
      lng,
      lat,
      color: center.color,
      labelDy: i % 2 ? 22 : -18
    };
  });

  if (!nodes.length) {
    nodes.push({
      label: hub.name,
      marker: center.marker,
      lng: center.lng,
      lat: center.lat,
      color: center.color,
      labelDy: center.labelDy ?? -18
    });
  }

  const geo = tripGeo(trip);
  return {
    bounds: boundsFromNodes(nodes, nodes.length > 1 ? 0.12 : 0.35),
    nodes,
    highlight_countries: geo?.highlight_countries || [],
    hide_route: nodes.length < 2
  };
}

export function buildDayPlanCities(dayBlocks, trip) {
  const groups = new Map();
  for (const b of dayBlocks) {
    const city = b.city.trim();
    if (!groups.has(city)) groups.set(city, []);
    groups.get(city).push(b);
  }

  return [...groups.entries()].map(([city, blocks]) => {
    const hub = {
      name: city,
      rows: blocks.map(bl => [bl.days, bl.spot, bl.plan])
    };
    return {
      name: city,
      map: buildHubMap(hub, trip),
      rows: blocks.map(bl => [bl.days, bl.city, bl.plan, bl.budget])
    };
  });
}

export function attachShoppingMaps(regional, dayBlocks, trip) {
  if (!regional) return regional;
  for (const hub of [...(regional.left || []), regional.right].filter(Boolean)) {
    hub.map = buildHubMap(hub, trip);
  }
  return regional;
}
