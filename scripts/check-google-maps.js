#!/usr/bin/env node
/**
 * Preflight: Geocoding API, Distance Matrix API, Maps Static API.
 * Exits 0 when all pass, 1 on failure. Skips gracefully when key is unset.
 */

import { loadEnvFromRepo } from "./load-env.js";

loadEnvFromRepo();

const API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const BASE = "https://maps.googleapis.com/maps/api";
const TIMEOUT = 15_000;

function fail(msg) {
  console.error(`\n✗ google-maps preflight failed: ${msg}\n`);
  process.exit(1);
}

async function getJson(path, params) {
  const qs = new URLSearchParams({ ...params, key: API_KEY });
  const res = await fetch(`${BASE}${path}?${qs}`, { signal: AbortSignal.timeout(TIMEOUT) });
  const json = await res.json();
  return { res, json };
}

async function checkGeocoding() {
  process.stdout.write("── Geocoding API… ");
  const { json } = await getJson("/geocode/json", { address: "Tsim Sha Tsui, Hong Kong" });
  if (json.status === "REQUEST_DENIED") {
    fail(json.error_message || "REQUEST_DENIED — enable Geocoding API or fix key restrictions");
  }
  if (json.status !== "OK" || !json.results?.length) {
    fail(json.error_message || json.status || "Geocoding returned no results");
  }
  const loc = json.results[0].geometry.location;
  console.log(`ok (${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)})`);
  return loc;
}

async function checkDistanceMatrix(origin) {
  process.stdout.write("── Distance Matrix API (walking)… ");
  const dest = `${(origin.lat + 0.01).toFixed(6)},${origin.lng.toFixed(6)}`;
  const { json } = await getJson("/distancematrix/json", {
    origins: `${origin.lat},${origin.lng}`,
    destinations: dest,
    mode: "walking"
  });
  if (json.status === "REQUEST_DENIED") {
    fail(json.error_message || "REQUEST_DENIED — enable Distance Matrix API or fix key restrictions");
  }
  if (json.status !== "OK") {
    fail(json.error_message || json.status || "Distance Matrix request failed");
  }
  const el = json.rows?.[0]?.elements?.[0];
  if (!el || el.status !== "OK") {
    fail(el?.status || "Distance Matrix returned no route element");
  }
  console.log(`ok (${el.distance?.text} · ${el.duration?.text})`);
}

async function checkStaticMaps(origin) {
  process.stdout.write("── Maps Static API… ");
  const qs = new URLSearchParams({
    size: "400x300",
    scale: "1",
    maptype: "roadmap",
    key: API_KEY
  });
  const markers = `markers=color:blue|label:H|${origin.lat},${origin.lng}`;
  const url = `${BASE}/staticmap?${qs}&${markers}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT) });
  const type = res.headers.get("content-type") || "";

  if (!res.ok) {
    const text = await res.text();
    let msg = `HTTP ${res.status}`;
    try {
      const err = JSON.parse(text);
      msg = err.error_message || err.status || msg;
    } catch {
      if (text.includes("REQUEST_DENIED")) msg = "REQUEST_DENIED — enable Maps Static API";
    }
    fail(msg);
  }

  if (!type.startsWith("image/")) {
    const text = await res.text();
    if (text.includes("REQUEST_DENIED")) {
      fail("REQUEST_DENIED — enable Maps Static API or fix key restrictions");
    }
    fail(`expected image/png, got ${type || "unknown"}`);
  }

  const bytes = (await res.arrayBuffer()).byteLength;
  console.log(`ok (${type}, ${bytes} bytes)`);
}

async function main() {
  if (!API_KEY) {
    console.log("○ GOOGLE_MAPS_API_KEY not set — proximity maps use straight-line + D3 fallback\n");
    process.exit(0);
  }

  console.log("\nGoogle Maps API preflight\n");
  const origin = await checkGeocoding();
  await checkDistanceMatrix(origin);
  await checkStaticMaps(origin);
  console.log("\n✓ Geocoding, Distance Matrix, and Maps Static API are configured correctly\n");
}

main().catch(err => fail(err.message));
