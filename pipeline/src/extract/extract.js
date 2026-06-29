// Stage-1 extraction: markdown aspect -> canonical JSON.
// This is the ONLY place AI is needed. It is pluggable:
//   - If ANTHROPIC_API_KEY or OPENAI_API_KEY is set, the aspect is extracted
//     automatically via that provider.
//   - Otherwise the generated prompt is written to <aspect>.prompt.txt so the
//     Cursor agent (or a human) can produce the JSON, keeping the pipeline
//     runnable without external keys.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { discoverAspects, dataDir } from "../discover.js";
import { buildExtractionPrompt } from "./prompt.js";

export function jsonPath(trip, aspectId) {
  return join(dataDir(trip), `${aspectId}.json`);
}
export function promptPath(trip, aspectId) {
  return join(dataDir(trip), `${aspectId}.prompt.txt`);
}

function stripFences(text) {
  const m = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  return (m ? m[1] : text).trim();
}

async function callAnthropic(prompt) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json"
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-latest",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }]
    })
  });
  if (!res.ok) throw new Error(`Anthropic ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.content.map(c => c.text || "").join("");
}

async function callOpenAI(prompt) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4o",
      response_format: { type: "json_object" },
      messages: [{ role: "user", content: prompt }]
    })
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.choices[0].message.content;
}

function provider() {
  if (process.env.ANTHROPIC_API_KEY) return { name: "anthropic", call: callAnthropic };
  if (process.env.OPENAI_API_KEY) return { name: "openai", call: callOpenAI };
  return null;
}

// Returns { status: "exists"|"extracted"|"prompt-written", path }.
export async function extractAspect({ trip, aspect, force = false }) {
  mkdirSync(dataDir(trip), { recursive: true });
  const out = jsonPath(trip, aspect.id);

  if (existsSync(out) && !force) {
    return { status: "exists", path: out };
  }

  const markdown = readFileSync(aspect.sourceFile, "utf8");
  const prompt = buildExtractionPrompt({ trip, aspect, markdown });

  const p = provider();
  if (!p) {
    const pp = promptPath(trip, aspect.id);
    writeFileSync(pp, prompt, "utf8");
    return { status: "prompt-written", path: pp };
  }

  const raw = await p.call(prompt);
  const parsed = JSON.parse(stripFences(raw));
  writeFileSync(out, JSON.stringify(parsed, null, 2), "utf8");
  return { status: "extracted", path: out, provider: p.name };
}

// CLI: node src/extract/extract.js <trip> [aspectId] [--force]
async function main() {
  const args = process.argv.slice(2);
  const force = args.includes("--force");
  const positional = args.filter(a => !a.startsWith("--"));
  const trip = positional[0];
  const onlyId = positional[1];
  if (!trip) {
    console.error("Usage: node src/extract/extract.js <trip> [aspectId] [--force]");
    process.exit(1);
  }
  let aspects = discoverAspects(trip);
  if (onlyId) aspects = aspects.filter(a => a.id === onlyId || a.basename === onlyId);

  for (const a of aspects) {
    try {
      const r = await extractAspect({ trip, aspect: a, force });
      console.log(`  [${r.status}] ${a.id} -> ${r.path}${r.provider ? ` (${r.provider})` : ""}`);
    } catch (e) {
      console.error(`  [error] ${a.id}: ${e.message}`);
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
