#!/usr/bin/env node
/** Regenerate trips/<slug>/opt-*.md from step files (## Output only). */
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join, basename } from "node:path";

const trip = process.argv[2] || "china-vietnam-2026";
import { fileURLToPath } from "node:url";
const root = join(fileURLToPath(new URL(".", import.meta.url)), "..", "..");
const dir = join(root, "trips", trip);

const HERO = {
  "01-traveler-profile": "https://images.unsplash.com/photo-1528164344705-47542687000d?w=1200&q=80",
  "02-route-optimization": "https://images.unsplash.com/photo-1548013146-7249fcee9944?w=1200&q=80",
  "03-immigration-entry": "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&q=80",
  "04-master-itinerary": "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=1200&q=80",
  "05-accommodation": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
  "06-shopping": "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80",
  "06-food-dining": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=1200&q=80",
  "07-transport-money": "https://images.unsplash.com/photo-1476514525535-07fb3b4e5f1b?w=1200&q=80",
  "08-customs-borders": "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80",
  "09-tech-connectivity": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80",
  "10-culture-museums": "https://images.unsplash.com/photo-1548013146-7249fcee9944?w=1200&q=80",
  "11-adventure": "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&q=80",
  "12-hidden-gems": "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&q=80",
  "13-etiquette": "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=1200&q=80",
  "14-health-safety": "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&q=80",
  "15-packing": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1200&q=80",
  "16-contingency": "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&q=80",
  "17-time-optimization": "https://images.unsplash.com/photo-1506784365847-bbad939e9335?w=1200&q=80",
};

for (const f of readdirSync(dir).sort()) {
  if (!/^\d{2}-.+\.md$/.test(f) || f.startsWith("opt-")) continue;
  const id = f.replace(/\.md$/, "");
  const raw = readFileSync(join(dir, f), "utf8");
  const fm = raw.match(/^---\n([\s\S]*?)\n---/);
  const title = (fm?.[1].match(/title:\s*"?([^"\n]+)"?/) || [])[1] || id;
  const step = (fm?.[1].match(/step:\s*"?([^"\n]+)"?/) || [])[1] || id;
  const tripSlug = (fm?.[1].match(/trip:\s*"?([^"\n]+)"?/) || [])[1] || trip;
  const outM = raw.match(/## Output\n([\s\S]*?)\n## Validation/);
  if (!outM) {
    console.warn(`skip ${f}: no Output section`);
    continue;
  }
  const body = outM[1].trim();
  const h1 = raw.match(/^# .+$/m);
  const heading = h1 ? h1[0] : `# ${title}`;
  const hero = HERO[id] || HERO[step.replace(/"/g, "")] || HERO["04-master-itinerary"];
  const opt = `---\nstep: ${step}\ntitle: ${title}\ntrip: ${tripSlug}\ncreated: 2026-06-03\nhero-image: ${hero}\n---\n\n${heading}\n\n${body}\n`;
  const optPath = join(dir, `opt-${f}`);
  writeFileSync(optPath, opt, "utf8");
  console.log(`wrote opt-${f}`);
}
