import { ListToolsRequestSchema, CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { searchVenuesTool } from "./tools/search-venues.js";
import { getVenueDetailsTool } from "./tools/get-venue-details.js";

const ALL_TOOLS = [searchVenuesTool, getVenueDetailsTool];

export function getAllToolNames() {
  return ["search_venues", "get_venue_details"];
}

export function createRegisterTools(clientFactory) {
  return server => {
    const tools = ALL_TOOLS.map(factory => factory(clientFactory));

    server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: tools.map(tool => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema
      }))
    }));

    server.setRequestHandler(CallToolRequestSchema, async request => {
      const { name, arguments: args } = request.params;
      const tool = tools.find(t => t.name === name);
      if (!tool) {
        throw new Error(`Unknown tool: ${name}`);
      }
      return tool.handler(args);
    });
  };
}
