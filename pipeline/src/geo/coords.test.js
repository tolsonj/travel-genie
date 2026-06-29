import test from "node:test";
import assert from "node:assert/strict";
import { haversineKm, formatDistanceKm } from "./coords.js";

test("haversineKm: TST hotel to Causeway Bay ~3-4 km", () => {
  const hotel = { lng: 114.1727, lat: 22.2974 };
  const causeway = { lng: 114.182, lat: 22.28 };
  const km = haversineKm(hotel, causeway);
  assert.ok(km > 2 && km < 5, `expected 2-5 km, got ${km}`);
  assert.equal(formatDistanceKm(km), `${km.toFixed(1)} km`);
});

test("formatDistanceKm: sub-km uses meters", () => {
  assert.equal(formatDistanceKm(0.45), "450 m");
});
