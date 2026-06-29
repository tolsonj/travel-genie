#!/usr/bin/env node
// Geocode trip venues + fetch walking distances from recommended hotel (Google Maps APIs).
//
// Usage: node src/geo/sync-google-geo.js <trip>
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { loadEnv } from "../../../scripts/load-env.js";
import { REPO_ROOT, dataDir } from "../discover.js";
import { extractHotels } from "../extract/hotel-extract.js";
import { extractShopping } from "../extract/shopping-extract.js";
import { extractVenues } from "../extract/tripadvisor-extract.js";
import { buildTripProximityMaps } from "./venue-proximity.js";
import { resolveVenueAddress } from "./venue-address-registry.js";
import { resolveVenueCoord } from "./venue-coords.js";
import {
  geocodeAddress,
  distanceMatrix,
  hasGoogleMapsKey
} from "./google-maps-client.js";
import {
  loadGoogleGeoCache,
  saveGoogleGeoCache,
  venueCacheKey,
  distanceCacheKey
} from "./google-geo-cache.js";

loadEnv({ root: REPO_ROOT });

function parseTables(body) {
  const tables = [];
  const re = /(?:^|\n)((?:\|[^\n]+\|\n)+)/g;
  let m;
  while ((m = re.exec(body)) !== null) {
    const lines = m[1].trim().split("\n").filter(l => l.includes("|"));
    if (lines.length < 2) continue;
    const split = line => line.split("|").slice(1, -1).map(c => c.trim());
    let caption = "";
    const before = body.slice(Math.max(0, m.index - 400), m.index);
    const capM = before.match(/(?:^|\n)#{1,4}\s+(.+)\s*$/);
    if (capM) caption = capM[1];
    tables.push({ caption, columns: split(lines[0]), rows: lines.slice(2).map(split) });
  }
  return tables;
}

function loadSidecar(trip, file, extract) {
  const path = join(REPO_ROOT, "trips", trip, file);
  if (!existsSync(path)) return null;
  const body = readFileSync(path, "utf8");
  return extract(body, parseTables(body));
}

async function ensureGeocoded(cache, city, name, trip) {
  const key = venueCacheKey(city, name);
  if (cache.venues[key]?.lat != null) return cache.venues[key];

  const local = resolveVenueCoord(name, city, trip);
  if (local && local.source !== "city-center") {
    cache.venues[key] = { lat: local.lat, lng: local.lng, source: "local" };
    return cache.venues[key];
  }

  const address = resolveVenueAddress({ name, city });
  process.stdout.write(`  geocode: ${name.slice(0, 40)}… `);
  const hit = await geocodeAddress(address);
  if (!hit) {
    console.log("miss");
    return null;
  }
  console.log("ok");
  cache.venues[key] = { ...hit, source: "google", address };
  return cache.venues[key];
}

async function main() {
  const trip = process.argv[2] || "china-vietnam-2026";
  if (!hasGoogleMapsKey()) {
    console.error("GOOGLE_MAPS_API_KEY is not set");
    process.exit(1);
  }

  const hotels = loadSidecar(trip, "hotel-comparison.md", extractHotels);
  const shopping = loadSidecar(trip, "shopping-comparison.md", extractShopping);
  const restaurants = loadSidecar(trip, "restaurant-comparison.md", extractVenues);

  if (!hotels) {
    console.error(`Missing trips/${trip}/hotel-comparison.md`);
    process.exit(1);
  }

  const proximity = buildTripProximityMaps(trip, { hotels, shopping, restaurants });
  const cache = loadGoogleGeoCache(trip);

  console.log(`\nGoogle geo sync · ${trip} · ${proximity.length} hub(s)\n`);

  for (const block of proximity) {
    console.log(`── ${block.city} (${block.hotel})`);
    const anchorKey = venueCacheKey(block.city, block.hotel);
    await ensureGeocoded(cache, block.city, block.hotel, trip);

    const anchor = cache.venues[anchorKey];
    if (!anchor) {
      console.log("  skip: hotel not geocoded");
      continue;
    }

    for (const node of block.map.overview_nodes || block.map.nodes) {
      await ensureGeocoded(cache, block.city, node.label, trip);
    }

    const destNodes = [];
    for (const node of block.map.nodes.slice(1)) {
      const hit = cache.venues[venueCacheKey(block.city, node.label)];
      if (hit) destNodes.push({ label: node.label, lat: hit.lat, lng: hit.lng });
    }

    if (!destNodes.length) continue;

    process.stdout.write(`  distance matrix (walking, ${destNodes.length} venues)… `);
    const rows = await distanceMatrix(anchor, destNodes, "walking");
    console.log("ok");

    destNodes.forEach((dest, i) => {
      const row = rows[i];
      if (!row) return;
      const key = distanceCacheKey(block.city, block.hotel, dest.label);
      cache.distances[key] = { walking: row };
    });
  }

  saveGoogleGeoCache(trip, cache);
  console.log(`\n✓ saved ${join(dataDir(trip), "google-geo-cache.json")}\n`);
}

main().catch(err => {
  console.error(err.message || err);
  process.exit(1);
});
