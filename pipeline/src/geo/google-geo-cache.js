// Persist Google geocode + distance matrix results per trip.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { dataDir } from "../discover.js";

function cachePath(trip) {
  return join(dataDir(trip), "google-geo-cache.json");
}

export function loadGoogleGeoCache(trip) {
  const path = cachePath(trip);
  if (!existsSync(path)) return { version: 1, trip, venues: {}, distances: {} };
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return { version: 1, trip, venues: {}, distances: {} };
  }
}

export function saveGoogleGeoCache(trip, cache) {
  mkdirSync(dataDir(trip), { recursive: true });
  writeFileSync(cachePath(trip), `${JSON.stringify({ ...cache, trip, updated: new Date().toISOString() }, null, 2)}\n`);
}

export function venueCacheKey(city, name) {
  return `${city}|${name}`.toLowerCase();
}

export function distanceCacheKey(city, hotel, venue) {
  return `${city}|${hotel}|${venue}`.toLowerCase();
}
