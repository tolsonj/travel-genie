// Google Maps Platform REST helpers (Geocoding, Distance Matrix, Static Maps, embed URLs).
// Requires GOOGLE_MAPS_API_KEY with Geocoding, Distance Matrix, and Maps Static API enabled.

const BASE = "https://maps.googleapis.com/maps/api";
const TIMEOUT = 15_000;

function apiKey() {
  return process.env.GOOGLE_MAPS_API_KEY || "";
}

export function hasGoogleMapsKey() {
  return Boolean(apiKey());
}

async function getJson(path, params) {
  const key = apiKey();
  if (!key) throw new Error("GOOGLE_MAPS_API_KEY is not set");
  const qs = new URLSearchParams({ ...params, key });
  const url = `${BASE}${path}?${qs}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error_message || `HTTP ${res.status}`);
  if (json.status && json.status !== "OK" && json.status !== "ZERO_RESULTS") {
    throw new Error(json.error_message || json.status);
  }
  return json;
}

/** @returns {{ lat: number, lng: number, formatted_address?: string } | null} */
export async function geocodeAddress(address) {
  if (!address?.trim()) return null;
  const json = await getJson("/geocode/json", { address: address.trim() });
  const loc = json.results?.[0]?.geometry?.location;
  if (!loc) return null;
  return {
    lat: loc.lat,
    lng: loc.lng,
    formatted_address: json.results[0].formatted_address
  };
}

/**
 * @param {{ lat: number, lng: number }} origin
 * @param {{ lat: number, lng: number }[]} destinations
 * @param {"walking"|"driving"|"transit"} mode
 */
export async function distanceMatrix(origin, destinations, mode = "walking") {
  if (!destinations.length) return [];
  const origins = `${origin.lat},${origin.lng}`;
  const dest = destinations.map(d => `${d.lat},${d.lng}`).join("|");
  const json = await getJson("/distancematrix/json", {
    origins,
    destinations: dest,
    mode
  });
  const row = json.rows?.[0]?.elements || [];
  return row.map(el => {
    if (el.status !== "OK") return null;
    return {
      distance: el.distance?.text || "",
      duration: el.duration?.text || "",
      meters: el.distance?.value,
      seconds: el.duration?.value
    };
  });
}

/**
 * Build a Static Maps URL (baked into deck HTML at build time — restrict key by HTTP referrer).
 * @param {{ lat: number, lng: number, marker?: string, kind?: string, role?: string }[]} nodes
 */
export function staticMapUrl(nodes, { width = 640, height = 480, anchorIndex = 0 } = {}) {
  const key = apiKey();
  if (!key || !nodes?.length) return null;

  const markerParams = nodes.map((n, i) => {
    const color =
      i === anchorIndex || n.role === "anchor"
        ? "blue"
        : n.role === "hotel-alt"
          ? "purple"
          : n.kind === "restaurant"
            ? "green"
            : n.kind === "attraction"
              ? "purple"
              : "orange";
    const labelChar =
      n.role === "anchor"
        ? "H"
        : n.role === "hotel-alt"
          ? (n.marker || "2").slice(0, 1)
          : (n.marker || "•").slice(0, 1);
    const label = encodeURIComponent(labelChar);
    return `markers=color:${color}|label:${label}|${n.lat},${n.lng}`;
  });

  const qs = new URLSearchParams({
    size: `${width}x${height}`,
    scale: "2",
    maptype: "roadmap",
    key
  });

  return `${BASE}/staticmap?${qs}&${markerParams.join("&")}`;
}

/** Google Maps directions deep link (hotel → venue). */
export function directionsUrl(origin, destination, mode = "walking") {
  const qs = new URLSearchParams({
    api: "1",
    origin: `${origin.lat},${origin.lng}`,
    destination: `${destination.lat},${destination.lng}`,
    travelmode: mode
  });
  return `https://www.google.com/maps/dir/?${qs}`;
}

/** Centered map browse URL (pins view — not a walking route). */
export function mapBrowseUrl(lat, lng, zoom = 14) {
  if (lat == null || lng == null) return null;
  return `https://www.google.com/maps/@${lat},${lng},${zoom}z`;
}

/** Place search link from name + city. */
export function placeSearchUrl(name, city) {
  const q = encodeURIComponent(`${name}, ${city}`.trim());
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}
