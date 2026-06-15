const SERPAPI_URL = "https://serpapi.com/search";
const TIMEOUT_MS = 30000;

const SSRC_BY_CATEGORY = {
  restaurants: "r",
  attractions: "A",
  all: "a"
};

async function serpApiGet(params) {
  const url = `${SERPAPI_URL}?${params.toString()}`;
  const response = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!response.ok) {
    throw new Error(`SerpAPI HTTP ${response.status}: ${response.statusText}`);
  }
  const data = await response.json();
  if (data.error) {
    throw new Error(data.error);
  }
  return data;
}

function normalizePlace(item) {
  return {
    place_id: item.place_id || item.location_id || null,
    title: item.title || item.name || null,
    rating: item.rating ?? null,
    reviews: item.reviews ?? item.num_reviews ?? null,
    price_level: item.price_level ?? item.price ?? null,
    type: item.place_type || item.location_type || item.type || null,
    link: item.link || null,
    thumbnail: item.thumbnail || null
  };
}

export async function searchVenues(apiKey, options) {
  const params = new URLSearchParams({
    engine: "tripadvisor",
    api_key: apiKey,
    q: options.query,
    output: "json"
  });

  const ssrc = SSRC_BY_CATEGORY[options.category] || SSRC_BY_CATEGORY.all;
  params.set("ssrc", ssrc);

  if (options.lat != null) params.set("lat", String(options.lat));
  if (options.lon != null) params.set("lon", String(options.lon));
  if (options.limit != null) params.set("limit", String(options.limit));
  if (options.tripadvisor_domain) params.set("tripadvisor_domain", options.tripadvisor_domain);

  const data = await serpApiGet(params);
  const raw = [...(data.places || []), ...(data.locations || [])];

  return {
    query: options.query,
    category: options.category,
    places: raw.map(normalizePlace),
    search_information: data.search_information || null,
    serpapi_pagination: data.serpapi_pagination || null
  };
}

export async function getVenueDetails(apiKey, options) {
  const params = new URLSearchParams({
    engine: "tripadvisor_place",
    api_key: apiKey,
    place_id: options.place_id,
    output: "json"
  });

  if (options.tripadvisor_domain) {
    params.set("tripadvisor_domain", options.tripadvisor_domain);
  }

  const data = await serpApiGet(params);
  const place = data.place_result || {};

  return {
    place_id: options.place_id,
    name: place.name || null,
    rating: place.rating ?? null,
    reviews: place.reviews ?? place.num_reviews ?? null,
    ranking: place.ranking || null,
    type: place.type || null,
    description: place.description || null,
    subratings: place.subratings || [],
    amenities: place.amenities || [],
    address: place.address || null,
    link: place.link || null
  };
}
