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

  let files = readdirSync(dir)
    .filter(f => f.endsWith(".md"))
    .filter(f => !/^00-workflow-state$|^TRAVEL_MASTER$/.test(basename(f, ".md")));

  // When opt-* print sources exist, use them instead of numbered planning files.
  const optFiles = files.filter(f => f.startsWith("opt-"));
  if (optFiles.length > 0) {
    files = [...optFiles];
    // Manifest sidecars (e.g. flight-comparison.md) without a matching opt-* file.
    const optBases = new Set(optFiles.map(f => basename(f, ".md").slice(4)));
    for (const entry of manifest.aspects) {
      if (optBases.has(entry.id)) continue;
      const opt = `opt-${entry.id}.md`;
      const side = `${entry.id}.md`;
      if (existsSync(join(dir, opt))) files.push(opt);
      else if (existsSync(join(dir, side))) files.push(side);
    }
    files = [...new Set(files)];
  }

  const order = new Map(manifest.aspects.map((a, i) => [a.id, i]));

  const aspects = files.map(file => {
    const base = basename(file, ".md");
    const matchBase = base.startsWith("opt-") ? base.slice(4) : base;
    const entry = manifest.aspects.find(a => new RegExp(a.match).test(matchBase));
    return {
      basename: base,
      matchBase,
      sourceFile: join(dir, file),
      id: entry ? entry.id : matchBase,
      type: entry ? entry.type : "generic",
      templateName: entry ? entry.template : manifest.fallback.template,
      title: entry ? entry.title : titleize(matchBase),
      manifest: entry || null
    };
  });

  // Order: manifest order first, then numeric prefix, then name.
  aspects.sort((a, b) => {
    const oa = order.has(a.id) ? order.get(a.id) : 999;
    const ob = order.has(b.id) ? order.get(b.id) : 999;
    if (oa !== ob) return oa - ob;
    return a.matchBase.localeCompare(b.matchBase, undefined, { numeric: true });
  });

  return aspects;
}

function titleize(base) {
  return base.replace(/^\d+-/, "").replace(/-/g, " ")
    .replace(/\b\w/g, c => c.toUpperCase());
}
