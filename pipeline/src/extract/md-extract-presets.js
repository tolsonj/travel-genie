export const ROUTE_PRESETS = {
  "thailand-2026": {
    route_label: "Recommended Route (7 Days)",
    name: "Bangkok → Chiang Mai → Krabi Open-Jaw",
    rationale: "Bangkok culture and food; Chiang Mai temples and highland relief; Krabi Andaman finale; depart KBV.",
    hubCoords: {
      Bangkok: { lng: 100.5018, lat: 13.7563, marker: "B", color: "#c0392b", labelDy: -18 },
      "Chiang Mai": { lng: 98.9853, lat: 18.7883, marker: "C", color: "#d4a017", labelDy: -18 },
      Krabi: { lng: 98.8259, lat: 8.0297, marker: "K", color: "#27ae60", labelDy: 26 },
      "Ao Nang": { lng: 98.8259, lat: 8.0297, marker: "K", color: "#27ae60", labelDy: 26 }
    },
    defaultHubs: [
      { hub: "Bangkok", days: "1–4", region: "Central", primary_draw: "Grand Palace, street food, Chatuchak, river" },
      { hub: "Chiang Mai", days: "4–6", region: "North", primary_draw: "Temples, Doi Suthep, night bazaar, khao soi" },
      { hub: "Krabi", days: "6–8", region: "Andaman", primary_draw: "Railay beach, karst views, seafood" },
      { hub: "Home", days: "1, 8", region: "—", primary_draw: "ATL open-jaw bookends" }
    ],
    map_bounds: { west: 98, south: 7.5, east: 101, north: 19.5 },
    highlight_countries: ["Thailand"],
    country_labels: [{ name: "THAILAND", lng: 100.5, lat: 14.5 }],
    depart_node: { from_label: "Krabi", caption: "Depart (KBV)" },
    defaultTransit: [
      { from: "Home", to: "Bangkok", mode: "International flight", duration: "~22h" },
      { from: "Bangkok", to: "Chiang Mai", mode: "Flight", duration: "~1h15" },
      { from: "Chiang Mai", to: "Krabi", mode: "Flight (via BKK)", duration: "~2h" },
      { from: "Krabi", to: "Home", mode: "International flight", duration: "~24h" }
    ]
  },
  "china-vietnam-2026": {
    name: "China-then-Vietnam Open-Jaw Circuit",
    rationale: "Beijing → Hanoi → Đà Nẵng/Hội An — open-jaw (PEK in / DAD out) eliminates backtracking.",
    hubCoords: {
      Beijing: { lng: 116.4074, lat: 39.9042, marker: "B", color: "#c0392b", labelDy: -20 },
      Hanoi: { lng: 105.8542, lat: 21.0285, marker: "H", color: "#d4a017", labelDy: -22, labelDx: -34 },
      "Đà Nẵng": {
        lng: 108.2022, lat: 16.0544, marker: "D", color: "#27ae60",
        labelDy: 30, labelDx: 34, mapLabel: "Da Nang / Hoi An"
      },
      "Da Nang": {
        lng: 108.2022, lat: 16.0544, marker: "D", color: "#27ae60",
        labelDy: 30, labelDx: 34, mapLabel: "Da Nang / Hoi An"
      },
      "Hội An": {
        lng: 108.2022, lat: 16.0544, marker: "D", color: "#27ae60",
        labelDy: 30, labelDx: 34, mapLabel: "Da Nang / Hoi An"
      }
    },
    defaultHubs: [
      { hub: "Beijing", days: "1–5", region: "North China", primary_draw: "Forbidden City, Great Wall, hutongs" },
      { hub: "Hanoi", days: "6–8", region: "Northern Vietnam", primary_draw: "Old Quarter food, Hoan Kiem Lake" },
      { hub: "Đà Nẵng / Hội An", days: "9–13", region: "Central Vietnam", primary_draw: "Beach resort, Ancient Town, My Son" },
      { hub: "Home", days: "14", region: "Departure", primary_draw: "Open-jaw exit via Đà Nẵng (DAD)" }
    ],
    map_bounds: { west: 95, south: 6, east: 128, north: 46 },
    highlight_countries: ["China", "Vietnam"],
    country_labels: [
      { name: "CHINA", lng: 103.5, lat: 34.5 },
      { name: "VIETNAM", lng: 106.8, lat: 12.5 }
    ],
    depart_node: { from_label: "Đà Nẵng", caption: "Depart (DAD)" },
    defaultTransit: [
      { from: "Home", to: "Beijing", mode: "International flight", duration: "~13–14h" },
      { from: "Beijing", to: "Hanoi", mode: "Flight", duration: "~4h" },
      { from: "Hanoi", to: "Đà Nẵng", mode: "Flight", duration: "~1.25h" },
      { from: "Đà Nẵng", to: "Home", mode: "Flight (connection)", duration: "~15–20h" }
    ]
  },
  "japan-2026": {
    name: "Tokyo → Japanese Alps → Kyoto → Osaka Open-Jaw",
    rationale: "Tokyo first for arrival ease; Alps for nature; Kansai for culture and food; depart Osaka (KIX).",
    hubCoords: {
      Tokyo: { lng: 139.6917, lat: 35.6895, marker: "T", color: "#c0392b" },
      "Japanese Alps": { lng: 137.252, lat: 36.146, marker: "A", color: "#27ae60" },
      Kyoto: { lng: 135.7681, lat: 35.0116, marker: "K", color: "#d4a017" },
      Osaka: { lng: 135.5023, lat: 34.6937, marker: "O", color: "#8e44ad", labelDy: 26 }
    },
    defaultHubs: [
      { hub: "Tokyo", days: "1–4", region: "Kanto", primary_draw: "Arrival, neighborhoods, food" },
      { hub: "Japanese Alps", days: "5–8", region: "Nagano/Takayama", primary_draw: "Nature, hiking, onsen" },
      { hub: "Kyoto", days: "9–12", region: "Kansai", primary_draw: "Temples, history, cuisine" },
      { hub: "Osaka", days: "13–14", region: "Departure", primary_draw: "Food, buffer, KIX exit" }
    ],
    map_bounds: { west: 132, south: 33, east: 142, north: 38 },
    highlight_countries: ["Japan"],
    country_labels: [{ name: "JAPAN", lng: 137.5, lat: 36 }],
    depart_node: { from_label: "Osaka", caption: "Depart (KIX)" },
    defaultTransit: [
      { from: "Home", to: "Tokyo", mode: "International flight", duration: "~11–13h" },
      { from: "Tokyo", to: "Japanese Alps", mode: "Shinkansen + Limited Express", duration: "~3.5h" },
      { from: "Japanese Alps", to: "Kyoto", mode: "Limited Express + Shinkansen", duration: "~4.5h" },
      { from: "Kyoto", to: "Osaka", mode: "Local train", duration: "~45min" },
      { from: "Osaka", to: "Home", mode: "International flight", duration: "~12–14h" }
    ]
  }
};

export const PROFILE_SEASON_PRESETS = {
  "japan-2026": {
    country_label: "JAPAN",
    chosen_column: 1,
    columns: ["", "Late Jul–Aug", "October", "April"],
    rows: [
      ["Heat / comfort", "High humidity", "Mild autumn", "Pleasant spring"],
      ["Crowds", "Pre-Obon rise", "Moderate", "Cherry peak risk"],
      ["Rain risk", "Afternoon storms", "Lower", "Variable"],
      ["Alps / nature", "Prime hiking", "Foliage season", "Snow melt / open"],
      ["Food season", "Summer festivals", "Harvest kaiseki", "Spring produce"],
      ["Fit score", "26/40 — mitigated", "32/40", "28/40"]
    ],
    summary:
      "Chosen window honors fixed dates; Alps nature priority with dawn/AC protocols offset Kansai heat and crowd risk."
  },
  "china-vietnam-2026": {
    country_label: "CHINA · VIETNAM",
    chosen_column: 1,
    columns: ["", "September", "October", "June"],
    rows: [
      ["Heat", "Shoulder — manageable", "Cooler", "Peak monsoon heat"],
      ["Crowds", "Moderate", "Lower", "Domestic peak"],
      ["Rain", "Late monsoon tail", "Drier north", "Heavy south"],
      ["Beach (Đà Nẵng)", "Warm water OK", "Ideal", "Storm risk"],
      ["Value / splurge", "Vietnam splurge window", "Strong", "Off-season deals"],
      ["Fit score", "34/40", "36/40", "22/40"]
    ],
    summary:
      "September balances heat constraints with beach time in Vietnam and shoulder pricing in China."
  },
  "thailand-2026": {
    country_label: "THAILAND",
    chosen_column: 1,
    columns: ["", "Late Jul–Aug", "November", "December"],
    rows: [
      ["Heat", "Hot-humid; AC + dawn starts", "Cooler north", "Peak dry season"],
      ["Crowds", "Moderate (monsoon shoulder)", "Lower", "High season rise"],
      ["Rain", "SW monsoon; Gulf drier than Andaman", "Dry north", "Minimal south"],
      ["Beach (Krabi)", "Monsoon — Railay backups", "Dry season ideal", "Peak pricing"],
      ["Value / splurge", "Shoulder resort rates", "Lantern season north", "Peak rates"],
      ["Fit score", "30/40", "36/40", "28/40"]
    ],
    summary:
      "Late Jul–Aug honors fixed dates; Chiang Mai highlands offset Bangkok heat; Krabi delivers nature/beach with monsoon backups."
  }
};
