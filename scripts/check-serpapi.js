#!/usr/bin/env node
/**
 * Preflight check for serpapi-tripadvisor MCP dependency.
 * Validates: env var present, API key active, TripAdvisor engine reachable.
 * Exits 0 on success, 1 on any failure.
 * No search credits consumed — uses /account endpoint only, then one
 * zero-result tripadvisor ping to confirm engine access.
 */

import { loadEnvFromRepo } from "./load-env.js";

loadEnvFromRepo();

const API_KEY = process.env.SERPAPI_API_KEY;
const BASE = "https://serpapi.com";
const TIMEOUT = 10_000;

function fail(msg) {
  console.error(`\n✗ serpapi-tripadvisor preflight failed: ${msg}\n`);
  process.exit(1);
}

async function get(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT) });
  const json = await res.json();
  if (!res.ok) fail(`HTTP ${res.status} from ${url}`);
  if (json.error) fail(json.error);
  return json;
}

async function main() {
  if (!API_KEY) {
    fail("SERPAPI_API_KEY is not set — add it to .cursor/mcp.json or your environment");
  }

  process.stdout.write("── checking SerpAPI account… ");
  const account = await get(`${BASE}/account?api_key=${API_KEY}`);
  if (account.account_status !== "Active") {
    fail(`account status is '${account.account_status}' (expected Active)`);
  }
  console.log(`ok (${account.plan_name}, ${account.total_searches_left} searches left)`);

  process.stdout.write("── checking TripAdvisor engine access… ");
  const params = new URLSearchParams({
    engine: "tripadvisor",
    api_key: API_KEY,
    q: "preflight-check",
    ssrc: "a",
    output: "json"
  });
  const data = await get(`${BASE}/search?${params}`);
  // A valid response with no results is still a success
  if (!("places" in data) && !("locations" in data) && !("search_information" in data)) {
    fail("unexpected response shape from TripAdvisor engine — check SerpAPI plan includes tripadvisor");
  }
  console.log("ok");

  console.log("\n✓ serpapi-tripadvisor is active and reachable\n");
}

main().catch(err => fail(err.message));
