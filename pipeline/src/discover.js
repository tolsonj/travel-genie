// Discover trip source aspects and match them to manifest entries.
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, basename } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = join(__dirname, "../..");
export const PIPELINE_ROOT = join(__dirname, "..");

export function loadManifest() {
  const p = join(PIPELINE_ROOT, "schema/aspect-manifest.json");
  return JSON.parse(readFileSync(p, "utf8"));
}

export function tripSourceDir(trip) {
  return join(REPO_ROOT, "trips", trip);
}

export function dataDir(trip) {
  return join(PIPELINE_ROOT, "data", trip);
}

// Return [{ basename, sourceFile, type, templateName, title, manifest }] for a trip.
export function discoverAspects(trip) {
  const manifest = loadManifest();
  const dir = tripSourceDir(trip);
  if (!existsSync(dir)) {
    throw new Error(`Trip source dir not found: ${dir}`);
  }

  const files = readdirSync(dir)
    .filter(f => f.endsWith(".md"))
    .filter(f => !/^00-workflow-state$|^TRAVEL_MASTER$/.test(basename(f, ".md")));

  const order = new Map(manifest.aspects.map((a, i) => [a.id, i]));

  const aspects = files.map(file => {
    const base = basename(file, ".md");
    const entry = manifest.aspects.find(a => new RegExp(a.match).test(base));
    return {
      basename: base,
      sourceFile: join(dir, file),
      id: entry ? entry.id : base,
      type: entry ? entry.type : "generic",
      templateName: entry ? entry.template : manifest.fallback.template,
      title: entry ? entry.title : titleize(base),
      manifest: entry || null
    };
  });

  // Order: manifest order first, then numeric prefix, then name.
  aspects.sort((a, b) => {
    const oa = order.has(a.id) ? order.get(a.id) : 999;
    const ob = order.has(b.id) ? order.get(b.id) : 999;
    if (oa !== ob) return oa - ob;
    return a.basename.localeCompare(b.basename, undefined, { numeric: true });
  });

  return aspects;
}

function titleize(base) {
  return base.replace(/^\d+-/, "").replace(/-/g, " ")
    .replace(/\b\w/g, c => c.toUpperCase());
}
