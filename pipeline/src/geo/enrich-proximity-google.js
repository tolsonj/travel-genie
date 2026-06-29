// Merge Google geocode cache + distance matrix into proximity map slides.
import { staticMapUrl, directionsUrl, hasGoogleMapsKey } from "./google-maps-client.js";
import { loadGoogleGeoCache, venueCacheKey, distanceCacheKey } from "./google-geo-cache.js";
import { formatDistanceKm, haversineKm } from "./coords.js";

function pickGoogleDistance(cache, city, hotel, venue) {
  const key = distanceCacheKey(city, hotel, venue);
  const hit = cache.distances?.[key];
  if (!hit) return null;
  return hit.walking || hit.driving || null;
}

/** Apply cached coords to map nodes when present. */
function applyVenueCoords(proximity, cache) {
  for (const block of proximity) {
    const seen = new Set();
    for (const list of [block.map?.nodes, block.map?.overview_nodes]) {
      for (const node of list || []) {
        if (!node?.label || seen.has(node.label)) continue;
        seen.add(node.label);
        const key = venueCacheKey(block.city, node.label);
        const hit = cache.venues?.[key];
        if (hit?.lat != null && hit?.lng != null) {
          node.lat = hit.lat;
          node.lng = hit.lng;
          node.google_geocoded = true;
        }
      }
    }
  }
}

function recomputeEdges(block) {
  const nodes = block.map?.nodes || [];
  const anchor = nodes[block.map.anchor_index ?? 0];
  if (!anchor) return;

  const venueNodes = nodes.slice(1);
  const edges = venueNodes.map((_, i) => {
    const toIdx = i + 1;
    const km = haversineKm(anchor, nodes[toIdx]);
    return { to: toIdx, label: formatDistanceKm(km), km };
  });
  edges.sort((a, b) => a.km - b.km);
  block.map.distance_edges = edges;
}

/**
 * @param {object[]} proximity — from buildTripProximityMaps
 * @param {string} trip
 */
export function enrichProximityWithGoogle(proximity, trip) {
  if (!proximity?.length) return proximity;

  const cache = loadGoogleGeoCache(trip);
  applyVenueCoords(proximity, cache);

  for (const block of proximity) {
    recomputeEdges(block);

    const anchor = block.map.nodes[block.map.anchor_index ?? 0];
    const useGoogle = hasGoogleMapsKey() || Object.keys(cache.distances || {}).length > 0;

    block.distances = (block.map.nodes.slice(1) || []).map(node => {
      const g = pickGoogleDistance(cache, block.city, block.hotel, node.label);
      const straight = formatDistanceKm(haversineKm(anchor, node));
      return {
        venue: node.label,
        kind: node.kind || "venue",
        distance: g?.distance || straight,
        duration: g?.duration || null,
        mode: g ? "walking" : "straight-line",
        km: haversineKm(anchor, node),
        directions_url: anchor
          ? directionsUrl(anchor, node, g ? "walking" : "walking")
          : null
      };
    });

    block.distances.sort((a, b) => a.km - b.km);

    if (useGoogle && hasGoogleMapsKey()) {
      const mapNodes = block.map.overview_nodes || block.map.nodes;
      block.google_static_map_url = staticMapUrl(mapNodes, {
        anchorIndex: block.map.anchor_index ?? 0
      });
    }

    block.distance_source = block.distances.some(d => d.duration)
      ? "google-maps"
      : "straight-line";
  }

  return proximity;
}
