// Build trip-site Maps section from hotel proximity + My Maps CSV exports.
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { PIPELINE_ROOT, tripSourceDir } from "../discover.js";
import { buildTripProximityMaps } from "../geo/venue-proximity.js";
import { enrichProximityWithGoogle } from "../geo/enrich-proximity-google.js";
import { mapBrowseUrl, placeSearchUrl } from "../geo/google-maps-client.js";
import { cityFileSlug } from "../geo/venue-coords.js";
import { loadEnvFromRepo } from "../../../scripts/load-env.js";

function citySlug(city) {
  return cityFileSlug(city);
}

/** @param {{ lat: number, lng: number }} anchor */
function cityBrowseUrl(anchor, city, hotelName) {
  if (anchor?.lat != null) return mapBrowseUrl(anchor.lat, anchor.lng, 13);
  return placeSearchUrl(hotelName || city, city);
}

function cityMapBundleHref(slug, citySlug) {
  return `maps/${citySlug}-all.csv`;
}

function listMyMapCsvs(slug) {
  const categoryLabels = {
    "shopping.csv": "Shopping",
    "hotels.csv": "Hotels",
    "restaurants.csv": "Restaurants",
    "attractions.csv": "Attractions",
    "spas.csv": "Spas"
  };
  const distDir = join(PIPELINE_ROOT, "dist", slug, "maps");
  if (!existsSync(distDir)) return [];

  return readdirSync(distDir)
    .filter(f => f.endsWith(".csv"))
    .sort((a, b) => {
      const aLayer = !a.includes("-all.csv");
      const bLayer = !b.includes("-all.csv");
      if (aLayer !== bLayer) return aLayer ? -1 : 1;
      return a.localeCompare(b);
    })
    .map(file => {
      const isBundle = file.includes("-all.csv");
      const cityLabel = isBundle
        ? file.replace("-all.csv", "").replace(/-/g, " ")
        : null;
      return {
        href: `maps/${file}`,
        label: isBundle
          ? `${cityLabel} (all types)`
          : categoryLabels[file] || file.replace(".csv", ""),
        description: isBundle
          ? `${file} — one layer, all hotels + POIs for this city`
          : `${file} — import as its own layer (all cities in trip)`
      };
    });
}

/**
 * @param {string} slug
 * @param {Map<string, object>} aspects
 * @returns {object | null}
 */
export function buildMapsSection(slug, aspects) {
  const hotels = aspects.get("hotel-comparison");
  if (!hotels) return null;

  loadEnvFromRepo();
  const shopping = aspects.get("shopping-comparison");
  const restaurants = aspects.get("restaurant-comparison");
  let proximity = buildTripProximityMaps(slug, { hotels, shopping, restaurants });
  if (!proximity.length) proximity = hotels.proximity || [];
  if (!proximity.length) return null;

  proximity = enrichProximityWithGoogle(JSON.parse(JSON.stringify(proximity)), slug);

  const cities = proximity.map(block => {
    const anchor = block.map?.nodes?.[block.map.anchor_index ?? 0];
    const venueCoords = (block.map?.nodes || []).slice(1);
    const venues = (block.distances || []).map((d, i) => ({
      ...d,
      lat: venueCoords[i]?.lat,
      lng: venueCoords[i]?.lng
    }));

    return {
      city: block.city,
      city_slug: citySlug(block.city),
      hotel: block.hotel,
      alternate_hotels: block.alternate_hotels || [],
      static_map_url: block.google_static_map_url || null,
      distance_source: block.distance_source || "straight-line",
      browse_in_google_maps: cityBrowseUrl(anchor, block.city, block.hotel),
      city_map_csv: cityMapBundleHref(slug, citySlug(block.city)),
      venues
    };
  });

  const my_maps = listMyMapCsvs(slug);
  const tripMaps = join(tripSourceDir(slug), "maps");
  if (!my_maps.length && existsSync(tripMaps)) {
    for (const file of readdirSync(tripMaps).filter(f => f.endsWith(".csv"))) {
      my_maps.push({
        href: `maps/${file}`,
        label: file.replace(".csv", ""),
        description: `${file} (copy to dist/maps on build)`
      });
    }
  }

  return {
    id: "maps",
    title: "Maps",
    anchor: true,
    intro:
      "The preview images below are static snapshots. For interactive maps with toggleable layers (hotels, shopping, restaurants), import the CSVs into Google My Maps — see steps at the bottom of this section.",
    cities,
    my_maps
  };
}
