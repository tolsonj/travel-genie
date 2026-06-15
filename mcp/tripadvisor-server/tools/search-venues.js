import { z } from "zod";

export const SearchVenuesSchema = z.object({
  query: z
    .string()
    .min(1)
    .describe('Search query (e.g. "restaurants Old Quarter Hanoi", "things to do Beijing")'),
  category: z
    .enum(["restaurants", "attractions", "all"])
    .describe("Venue category filter: restaurants, attractions, or all"),
  lat: z.number().optional().describe("GPS latitude for location-biased search"),
  lon: z.number().optional().describe("GPS longitude for location-biased search"),
  limit: z
    .number()
    .int()
    .min(1)
    .max(100)
    .default(10)
    .describe("Max results (default 10, max 100)"),
  tripadvisor_domain: z
    .string()
    .optional()
    .describe("TripAdvisor domain (default tripadvisor.com)")
});

export function searchVenuesTool(clientFactory) {
  return {
    name: "search_venues",
    description: `Search TripAdvisor venues via SerpAPI.

Returns restaurants or attractions with ratings, review counts, price level, and place_id for follow-up detail calls.

**Categories:** restaurants (ssrc=r), attractions/things to do (ssrc=A), all (ssrc=a).

**Use get_venue_details** with place_id from results for ranking, subratings, and description on recommended picks only.`,
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query with city and venue type" },
        category: {
          type: "string",
          enum: ["restaurants", "attractions", "all"],
          description: "restaurants | attractions | all"
        },
        lat: { type: "number", description: "GPS latitude" },
        lon: { type: "number", description: "GPS longitude" },
        limit: { type: "number", description: "Max results (default 10)" },
        tripadvisor_domain: { type: "string", description: "TripAdvisor domain" }
      },
      required: ["query", "category"]
    },
    handler: async args => {
      try {
        const parsed = SearchVenuesSchema.parse(args);
        const client = clientFactory();
        const result = await client.searchVenues(parsed);
        return { content: [{ type: "text", text: JSON.stringify(result) }] };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          content: [{ type: "text", text: `Error searching venues: ${message}` }],
          isError: true
        };
      }
    }
  };
}
