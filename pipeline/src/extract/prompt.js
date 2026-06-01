// Build the Stage-1 extraction prompt for a single aspect.
// The prompt is generated from the manifest hints + JSON schema, so adding a
// new aspect type requires only a manifest entry (no code change here).
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PIPELINE_ROOT } from "../discover.js";

export function buildExtractionPrompt({ trip, aspect, markdown }) {
  const schema = readFileSync(join(PIPELINE_ROOT, "schema/trip.schema.json"), "utf8");
  const hints = aspect.manifest && aspect.manifest.hints ? aspect.manifest.hints : null;

  const hintBlock = hints
    ? `Target type: "${aspect.type}"
Summary of what to capture: ${hints.summary || ""}
Fields to populate (use null/omit when absent — every field is optional):
${(hints.fields || []).map(f => `  - ${f}`).join("\n")}
${hints.notes ? `Notes: ${hints.notes}` : ""}
${hints.image_categories ? `Image categories to tag: ${hints.image_categories.join(", ")}` : ""}`
    : `Target type: "generic" (no bespoke template).
Use the generic fields: intro (string), tables[] {caption, columns[], rows[][]},
bullets[] {heading, items[]}, callouts[] {status: pass|warn|info, text}.`;

  return `You convert one travel-plan markdown aspect into STRICT canonical JSON.

Output ONLY a single JSON object. No prose, no markdown fences. It MUST validate
against this JSON Schema (every field except aspect/type/trip is optional; omit
what is not present rather than inventing it):

<schema>
${schema}
</schema>

Required top-level values for THIS aspect:
  "aspect": "${aspect.id}"
  "type": "${aspect.type}"
  "trip": "${trip}"
  "title": "${aspect.title}"

${hintBlock}

CRITICAL for any map_nodes: use REAL geographic latitude/longitude for each city.
Do not approximate with screen coordinates.

Here is the source markdown to extract from:

<markdown>
${markdown}
</markdown>`;
}
