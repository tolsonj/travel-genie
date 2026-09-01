/** 14-day Hong Kong → HCMC → Da Nang gantt (booked itinerary). */
export const PHASE_META = {
  enroute: { banner: "EN ROUTE  ·  ATL → HKG  ·  Sept 1 – 3", color: "#6b7280" },
  hk: { banner: "HONG KONG  ·  Sept 3 – 6  ·  3 nights", color: "#2E79B5" },
  hcmc: { banner: "VIETNAM  ·  HO CHI MINH CITY  ·  Sept 6 – 9  ·  3 nights", color: "#C06028" },
  danang: { banner: "VIETNAM  ·  DA NANG / HOI AN  ·  Sept 9 – 13  ·  4 nights", color: "#1F8A65" },
  home: { banner: "HOMEBOUND  ·  HKG → ATL  ·  Sept 13 – 14", color: "#6b7280" }
};

export const ACTIVITY_COLORS = {
  transit: "#6b7280",
  cultural: "#2E79B5",
  landmark: "#7B64B8",
  shopping: "#C85898",
  food: "#C06028",
  beach: "#1F8A65",
  rest: "#c9a227"
};

export const ACTIVITY_LABEL = {
  transit: "Transit / Flight",
  cultural: "Cultural",
  landmark: "Landmark",
  shopping: "Shopping",
  food: "Dining",
  beach: "Beach / Resort",
  rest: "Rest"
};

export const DAYS = [
  {
    day: 1,
    date: "Sept 1",
    dow: "Tue",
    location: "ATL → LAX",
    phase: "enroute",
    isTransit: true,
    activities: [
      { label: "Pack + ATL", start: 14, end: 19.3, type: "transit" },
      { label: "DL763 ATL→LAX", start: 19.3, end: 23, type: "transit" }
    ],
    wow: "Wheels up from Atlanta — trip officially starts"
  },
  {
    day: 2,
    date: "Sept 2",
    dow: "Wed",
    location: "Over Pacific",
    phase: "enroute",
    isTransit: true,
    activities: [
      { label: "DL89 LAX→HKG (in flight)", start: 6, end: 23, type: "transit" }
    ],
    wow: "Overnight over the Pacific — sleep as much as possible"
  },
  {
    day: 3,
    date: "Sept 3",
    dow: "Thu",
    location: "Hong Kong",
    phase: "hk",
    activities: [
      { label: "Land 05:00 + Rosewood", start: 6, end: 10, type: "transit" },
      { label: "Brunch + rest", start: 10, end: 16, type: "rest" },
      { label: "TST Promenade + Symphony", start: 18, end: 21, type: "landmark" }
    ],
    wow: "First look at Victoria Harbour from the Tsim Sha Tsui promenade"
  },
  {
    day: 4,
    date: "Sept 4",
    dow: "Fri",
    location: "Hong Kong",
    phase: "hk",
    activities: [
      { label: "Peak Tram 7:30 AM", start: 7.5, end: 11, type: "landmark" },
      { label: "Causeway Bay (SOGO)", start: 12, end: 17, type: "shopping" },
      { label: "Temple Street + dim sum", start: 18, end: 21.5, type: "food" }
    ],
    wow: "Victoria Peak before the crowds — harbor from above"
  },
  {
    day: 5,
    date: "Sept 5",
    dow: "Sat",
    location: "Hong Kong",
    phase: "hk",
    activities: [
      { label: "Sin Tat / electronics", start: 10, end: 13, type: "shopping" },
      { label: "Ladies Market + sneakers", start: 13, end: 17, type: "shopping" },
      { label: "Star Ferry + dim sum", start: 18, end: 21, type: "food" }
    ],
    wow: "Star Ferry across the harbor at dusk"
  },
  {
    day: 6,
    date: "Sept 6",
    dow: "Sun",
    location: "HKG → SGN",
    phase: "hcmc",
    isTransit: true,
    activities: [
      { label: "CX767 08:20→10:05", start: 7, end: 10.1, type: "transit" },
      { label: "Reverie check-in + rest", start: 10.5, end: 16, type: "rest" },
      { label: "Dong Khoi dinner", start: 18, end: 21, type: "food" }
    ],
    wow: "First walk down Nguyen Hue — Saigon after the Hong Kong hop"
  },
  {
    day: 7,
    date: "Sept 7",
    dow: "Mon",
    location: "Ho Chi Minh City",
    phase: "hcmc",
    activities: [
      { label: "Notre-Dame + Post Office", start: 9, end: 11.5, type: "landmark" },
      { label: "War Remnants / Palace", start: 12, end: 16, type: "cultural" },
      { label: "District 1 dinner", start: 18.5, end: 21, type: "food" }
    ],
    wow: "Notre-Dame and the Central Post Office a few minutes from the hotel"
  },
  {
    day: 8,
    date: "Sept 8",
    dow: "Tue",
    location: "Ho Chi Minh City",
    phase: "hcmc",
    activities: [
      { label: "Cu Chi or Mekong (vote)", start: 8, end: 15, type: "cultural" },
      { label: "Ben Thanh / District 1", start: 15.5, end: 18, type: "shopping" },
      { label: "Cooking class or dinner", start: 18.5, end: 21.5, type: "food" }
    ],
    wow: "Vote day — tunnels or the Mekong, then back to District 1"
  },
  {
    day: 9,
    date: "Sept 9",
    dow: "Wed",
    location: "SGN → DAD",
    phase: "danang",
    isTransit: true,
    activities: [
      { label: "VJ630 09:00→10:20", start: 7, end: 10.3, type: "transit" },
      { label: "InterContinental + pool", start: 11, end: 16, type: "beach" },
      { label: "Sunset beach walk", start: 17.5, end: 19.5, type: "beach" }
    ],
    wow: "Sơn Trà private beach — Vietnam splurge starts"
  },
  {
    day: 10,
    date: "Sept 10",
    dow: "Thu",
    location: "Hội An",
    phase: "danang",
    activities: [
      { label: "Tailor fitting #1", start: 9.5, end: 11.5, type: "shopping" },
      { label: "Ancient Town + brunch", start: 11.5, end: 16, type: "cultural" },
      { label: "Lantern old town", start: 18, end: 21, type: "landmark" }
    ],
    wow: "Hội An lanterns after dark — Japanese Covered Bridge at night"
  },
  {
    day: 11,
    date: "Sept 11",
    dow: "Fri",
    location: "Đà Nẵng",
    phase: "danang",
    activities: [
      { label: "Beach club brunch", start: 9.5, end: 12.5, type: "beach" },
      { label: "Marble Mountains", start: 14, end: 17, type: "landmark" },
      { label: "Mỹ Khê + seafood", start: 17.5, end: 21, type: "food" }
    ],
    wow: "Marble Mountains caves, then seafood on the Mỹ Khê strip"
  },
  {
    day: 12,
    date: "Sept 12",
    dow: "Sat",
    location: "Hội An",
    phase: "danang",
    activities: [
      { label: "An Bang Beach", start: 8.5, end: 11.5, type: "beach" },
      { label: "Tailor #2 + Vincom", start: 12, end: 17, type: "shopping" },
      { label: "Resort dinner + pack", start: 18.5, end: 21, type: "food" }
    ],
    wow: "Final fitting pickup — suits ready for the flight home"
  },
  {
    day: 13,
    date: "Sept 13",
    dow: "Sun",
    location: "DAD → HKG",
    phase: "home",
    isTransit: true,
    activities: [
      { label: "Lady Buddha or beach", start: 7.5, end: 11, type: "landmark" },
      { label: "Checkout + buffer", start: 12, end: 16, type: "rest" },
      { label: "UO559 18:10→21:10", start: 16.5, end: 22, type: "transit" }
    ],
    wow: "Last Sơn Trà view before the hop back to Hong Kong"
  },
  {
    day: 14,
    date: "Sept 14",
    dow: "Mon",
    location: "HKG → ATL",
    phase: "home",
    isTransit: true,
    activities: [
      { label: "DL88 09:25 HKG→LAX", start: 7, end: 12, type: "transit" },
      { label: "DL327 LAX→ATL", start: 12.5, end: 16.5, type: "transit" }
    ],
    wow: "Home the same calendar day — land ATL 4:30pm"
  }
];
