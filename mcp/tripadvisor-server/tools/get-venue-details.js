import { z } from "zod";

export const GetVenueDetailsSchema = z.object({
  place_id: z
    .string()
    .min(1)
    .describe("place_id from search_venues results"),
  tripadvisor_domain: z
    .string()
    .optional()
    .describe("TripAdvisor domain (default tripadvisor.com)")
});

export function getVenueDetailsTool(clientFactory) {
  return {
    name: "get_venue_details",
    description: `Get detailed TripAdvisor venue information via SerpAPI.

Use after search_venues for recommended picks only. Returns ranking, subratings, amenities, and description.`,
    inputSchema: {
      type: "object",
      properties: {
        place_id: { type: "string", description: "place_id from search_venues" },
        tripadvisor_domain: { type: "string", description: "TripAdvisor domain" }
      },
      required: ["place_id"]
    },
    handler: async args => {
      try {
        const parsed = GetVenueDetailsSchema.parse(args);
        const client = clientFactory();
        const result = await client.getVenueDetails(parsed);
        return { content: [{ type: "text", text: JSON.stringify(result) }] };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          content: [{ type: "text", text: `Error getting venue details: ${message}` }],
          isError: true
        };
      }
    }
  };
}
