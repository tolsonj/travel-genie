#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createRegisterTools } from "./tools.js";
import { searchVenues, getVenueDetails } from "./serpapi-client.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageJson = JSON.parse(readFileSync(join(__dirname, "package.json"), "utf8"));

class SerpApiTripAdvisorClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  searchVenues(options) {
    return searchVenues(this.apiKey, options);
  }

  getVenueDetails(options) {
    return getVenueDetails(this.apiKey, options);
  }
}

function validateEnvironment() {
  if (!process.env.SERPAPI_API_KEY) {
    console.error("Error: SERPAPI_API_KEY environment variable is required.");
    console.error("Get your API key from: https://serpapi.com/manage-api-key");
    process.exit(1);
  }
}

async function main() {
  validateEnvironment();

  const apiKey = process.env.SERPAPI_API_KEY;
  const clientFactory = () => new SerpApiTripAdvisorClient(apiKey);

  const server = new Server(
    {
      name: "serpapi-tripadvisor-mcp-server",
      version: packageJson.version
    },
    {
      capabilities: {
        tools: {}
      }
    }
  );

  createRegisterTools(clientFactory)(server);

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(error => {
  console.error("serpapi-tripadvisor-mcp-server failed:", error);
  process.exit(1);
});
