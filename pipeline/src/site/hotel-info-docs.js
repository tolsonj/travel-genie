/**
 * Discover and copy trips/<slug>/hotel-info confirmation PDFs for the trip site.
 */
import { existsSync, mkdirSync, readdirSync, copyFileSync, unlinkSync } from "node:fs";
import { join, basename } from "node:path";
import { tripSourceDir, PIPELINE_ROOT } from "../discover.js";

/** Canceled / superseded / unused-hub PDFs — keep on disk, do not list or copy to the site. */
const SKIP_RE =
  /hanoi|naman|le[-_. ]?premier|hkg.{0,20}han|to[- ]hanoi|vietjet-hanoi|langham/i;

const LABEL_RULES = [
  { re: /cathay-pacific-hkg-sgn-manage-bookings/i, label: "Cathay CX767 — both bookings (D58TTR + ESAQVN)" },
  { re: /cathay-pacific-hkg-sgn-kennedy/i, label: "Cathay CX767 — Kennedy (ESAQVN)" },
  { re: /cathay-pacific-hkg-sgn-john-audrey/i, label: "Cathay CX767 — Jack & Audrey (D58TTR)" },
  { re: /regal-airport.*confirmation/i, label: "Regal Airport Hotel confirmation" },
  { re: /vietjet-ho-chi-minh-to-da-nang.*mkjz3w/i, label: "VietJet VJ630 SGN→DAD (Jack, Audrey)" },
  { re: /vietjet-ho-chi-minh-to-da-nang.*zw2fbg/i, label: "VietJet VJ630 SGN→DAD (Kennedy)" }
];

const FLIGHT_RE =
  /cathay|vietjet|hk-express|delta|itinerary-mkjz|itinerary-zw2|e-ticket|eticket/i;
const HOTEL_RE = /rosewood|langham|le-premier|naman|regal|reverie|intercontinental/i;

function labelForPdf(filename) {
  for (const rule of LABEL_RULES) {
    if (rule.re.test(filename)) return rule.label;
  }
  return basename(filename, ".pdf").replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
}

function kindForPdf(filename) {
  if (FLIGHT_RE.test(filename)) return "flights";
  if (HOTEL_RE.test(filename)) return "hotels";
  return "other";
}

function hotelInfoDirs(slug) {
  return [
    join(tripSourceDir(slug), "hotel-info"),
    join(PIPELINE_ROOT, "dist", slug, "hotel-info")
  ].filter(dir => existsSync(dir));
}

/**
 * @param {string} slug
 * @param {"flights"|"hotels"|"all"} [kind="all"]
 * @returns {{ label: string, href: string, filename: string }[]}
 */
export function listHotelInfoDocuments(slug, kind = "all") {
  const seen = new Set();
  const docs = [];
  for (const dir of hotelInfoDirs(slug)) {
    for (const filename of readdirSync(dir)) {
      if (!filename.toLowerCase().endsWith(".pdf")) continue;
      if (SKIP_RE.test(filename) || seen.has(filename)) continue;
      if (kind !== "all" && kindForPdf(filename) !== kind) continue;
      seen.add(filename);
      docs.push({
        label: labelForPdf(filename),
        href: `hotel-info/${encodeURIComponent(filename)}`,
        filename
      });
    }
  }
  return docs.sort((a, b) => a.filename.localeCompare(b.filename));
}

/**
 * Copy hotel-info PDFs into pipeline/dist/<slug>/hotel-info/.
 * @param {string} slug
 * @returns {number} count copied
 */
export function copyHotelInfoToDist(slug) {
  const srcDir = join(tripSourceDir(slug), "hotel-info");
  const destDir = join(PIPELINE_ROOT, "dist", slug, "hotel-info");
  mkdirSync(destDir, { recursive: true });

  if (existsSync(srcDir)) {
    const pdfs = readdirSync(srcDir)
      .filter(f => f.toLowerCase().endsWith(".pdf"))
      .filter(f => !SKIP_RE.test(f));
    const keep = new Set(pdfs);
    for (const file of readdirSync(destDir)) {
      if (file.toLowerCase().endsWith(".pdf") && !keep.has(file)) {
        unlinkSync(join(destDir, file));
      }
    }
    for (const file of pdfs) {
      copyFileSync(join(srcDir, file), join(destDir, file));
    }
  }

  let kept = 0;
  for (const file of readdirSync(destDir)) {
    if (!file.toLowerCase().endsWith(".pdf")) continue;
    if (SKIP_RE.test(file)) unlinkSync(join(destDir, file));
    else kept++;
  }
  return kept;
}
