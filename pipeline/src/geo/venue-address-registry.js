// Known venue addresses for Google Maps CSV export (pattern → street address).
// Optional trip override: trips/<slug>/venue-addresses.json { "pattern": "address" }

/** @type {{ pattern: RegExp, address: string }[]} */
export const VENUE_ADDRESS_RULES = [
  // Hong Kong — shopping
  { pattern: /mong kok sin tat|sin centre|sin tat plaza/i, address: "75 Fa Yuen Street, Mong Kok, Hong Kong" },
  { pattern: /ladies market|tung choi/i, address: "Ladies Market, Tung Choi Street, Mong Kok, Hong Kong" },
  { pattern: /fa yuen|sneaker street/i, address: "Fa Yuen Street Market, Mong Kok, Hong Kong" },
  { pattern: /causeway bay|times square|sogo/i, address: "1 Matheson Street, Causeway Bay, Hong Kong" },
  { pattern: /temple street night/i, address: "Temple Street Night Market, Jordan, Hong Kong" },
  { pattern: /golden computer/i, address: "146 Fuk Wing Street, Sham Shui Po, Hong Kong" },
  { pattern: /harbour city/i, address: "3-27 Canton Road, Tsim Sha Tsui, Hong Kong" },

  // Hong Kong — hotels
  { pattern: /rosewood hong kong/i, address: "Victoria Dockside, 18 Salisbury Road, Tsim Sha Tsui, Kowloon, Hong Kong" },
  { pattern: /aki hotel|aki mgallery/i, address: "239 Jaffe Road, Wan Chai, Hong Kong" },
  { pattern: /silveri hong kong/i, address: "16 Tat Tung Road, Tung Chung, Hong Kong" },
  { pattern: /mondrian hong kong/i, address: "8A Hart Avenue, Tsim Sha Tsui, Hong Kong" },
  { pattern: /peninsula hong kong/i, address: "22 Salisbury Road, Tsim Sha Tsui, Hong Kong" },
  { pattern: /reverie saigon/i, address: "22-36 Nguyen Hue Boulevard, District 1, Ho Chi Minh City, Vietnam" },
  { pattern: /peninsula spa/i, address: "The Peninsula Spa, 22 Salisbury Road, Tsim Sha Tsui, Hong Kong" },

  // Hong Kong — restaurants
  { pattern: /tim ho wan/i, address: "Tim Ho Wan, Olympian City 2, 18 Hoi Ting Road, Hong Kong" },
  { pattern: /man mo dim sum/i, address: "7 Elgin Street, Central, Hong Kong" },
  { pattern: /dim sum square/i, address: "38 Shanghai Street, Yau Ma Tei, Hong Kong" },
  { pattern: /zuma/i, address: "Zuma Restaurant, 8 Finance Street, Central, Hong Kong" },
  { pattern: /lobby.*peninsula|peninsula.*lobby/i, address: "22 Salisbury Road, Tsim Sha Tsui, Hong Kong" },

  // Hong Kong — attractions
  { pattern: /peak tram|victoria peak/i, address: "33 Garden Road, Central, Hong Kong" },
  { pattern: /nan lian garden/i, address: "60 Fung Tak Road, Diamond Hill, Hong Kong" },
  { pattern: /chi lin nunnery/i, address: "5 Chi Lin Drive, Diamond Hill, Hong Kong" },

  // Hong Kong — spas
  { pattern: /espa.*ritz|ritz-carlton.*espa/i, address: "International Commerce Centre, 1 Austin Road West, Kowloon, Hong Kong" },
  { pattern: /happy foot massage/i, address: "16 Cameron Road, Tsim Sha Tsui, Hong Kong" },

  // Hanoi — spas
  { pattern: /la siesta spa/i, address: "94 Ma May Street, Hoan Kiem, Hanoi, Vietnam" },
  { pattern: /sofitel.*metropole.*spa|metropole spa/i, address: "15 Ngo Quyen Street, Hoan Kiem, Hanoi, Vietnam" },
  { pattern: /footmaster/i, address: "52 Hang Be Street, Hoan Kiem, Hanoi, Vietnam" },

  // Đà Nẵng / Hội An — spas
  { pattern: /naman retreat spa/i, address: "Giai Phong Street, Hoi An, Vietnam" },
  { pattern: /mikazuki.*spa/i, address: "Truong Sa Street, Ngu Hanh Son, Da Nang, Vietnam" },
  { pattern: /hoi an herbal spa/i, address: "11 Nguyen Thai Hoc Street, Hoi An, Vietnam" },
  { pattern: /bliss hoi an wellness/i, address: "Lac Long Quan Street, An Bang Beach, Hoi An, Vietnam" },
  { pattern: /le premier hotel/i, address: "41 Hang Be Street, Hoan Kiem, Hanoi, Vietnam" },
  { pattern: /landmark72|intercontinental hanoi landmark/i, address: "E6 Cau Giay, Hanoi, Vietnam" },
  { pattern: /may de ville crown/i, address: "61 Hang Be Street, Hoan Kiem, Hanoi, Vietnam" },
  { pattern: /meritel hanoi/i, address: "63 Hang Than Street, Ba Dinh, Hanoi, Vietnam" },

  // Hanoi — restaurants
  { pattern: /essence restaurant/i, address: "38 Tho Nhuom Street, Hoan Kiem, Hanoi, Vietnam" },
  { pattern: /hong hoai/i, address: "48 Hang Bac Street, Hoan Kiem, Hanoi, Vietnam" },
  { pattern: /duong's restaurant/i, address: "101 Ma May Street, Hoan Kiem, Hanoi, Vietnam" },
  { pattern: /hanoi food culture/i, address: "24 Ta Hien Street, Hoan Kiem, Hanoi, Vietnam" },

  // Hanoi — shopping / attractions
  { pattern: /dong xuan market/i, address: "Dong Xuan Street, Hoan Kiem, Hanoi, Vietnam" },
  { pattern: /hang gai|hang bac/i, address: "Hang Gai Street, Hoan Kiem, Hanoi, Vietnam" },
  { pattern: /hoa lo prison|hanoi hilton/i, address: "1 Hoa Lo Street, Hoan Kiem, Hanoi, Vietnam" },
  { pattern: /temple of literature/i, address: "58 Quoc Tu Giam Street, Dong Da, Hanoi, Vietnam" },
  { pattern: /hoan kiem lake|ngoc son/i, address: "Dinh Tien Hoang Street, Hoan Kiem, Hanoi, Vietnam" },

  // Đà Nẵng / Hội An — hotels
  { pattern: /naman retreat/i, address: "Giai Phong Street, Hoi An, Vietnam" },
  { pattern: /bliss hoi an/i, address: "Lac Long Quan Street, An Bang Beach, Hoi An, Vietnam" },
  { pattern: /mikazuki japanese/i, address: "Truong Sa Street, Ngu Hanh Son, Da Nang, Vietnam" },
  { pattern: /intercontinental danang|sun peninsula/i, address: "Bai Bac Beach, Son Tra Peninsula, Da Nang, Vietnam" },
  { pattern: /vinpearl.*nam hoi an/i, address: "Binh Minh Commune, Thang Binh, Quang Nam, Vietnam" },

  // Đà Nẵng / Hội An — shopping / restaurants / attractions
  { pattern: /be be tailor/i, address: "11 Hoang Dieu Street, Hoi An, Vietnam" },
  { pattern: /yaly couture|yaly tailor/i, address: "358 Nguyen Duy Hieu Street, Hoi An, Vietnam" },
  { pattern: /vincom plaza.*đà nẵng|vincom danang/i, address: "255-257 Hung Vuong Street, Da Nang, Vietnam" },
  { pattern: /morning glory.*hội an|morning glory.*hoi an/i, address: "106 Nguyen Thai Hoc Street, Hoi An, Vietnam" },
  { pattern: /thìa gỗ|thia go/i, address: "216 Vo Nguyen Giap Street, Son Tra, Da Nang, Vietnam" },
  { pattern: /nha go viet/i, address: "50 Phan Chu Trinh Street, Hai Chau, Da Nang, Vietnam" },
  { pattern: /bếp cuốn|bep cuon/i, address: "23 Chau Thi Vinh Te Street, Ngu Hanh Son, Da Nang, Vietnam" },
  { pattern: /marble mountains|ngũ hành sơn/i, address: "81 Huyen Tran Cong Chua Street, Ngu Hanh Son, Da Nang, Vietnam" },
  { pattern: /hoi an ancient town/i, address: "Tran Phu Street, Hoi An, Vietnam" },
  { pattern: /eco cooking class|hoi an eco cooking/i, address: "Cam Ha Commune, Hoi An, Vietnam" },
  { pattern: /lady buddha|son tra peninsula/i, address: "Son Tra Peninsula, Da Nang, Vietnam" },
  { pattern: /hoi an central market/i, address: "Tran Quy Cap Street, Hoi An, Vietnam" },
  { pattern: /an bang beach/i, address: "An Bang Beach, Cam An, Hoi An, Vietnam" }
];

const CITY_SUFFIX = {
  "hong kong": "Hong Kong",
  hanoi: "Hanoi, Vietnam",
  "đà nẵng": "Da Nang, Vietnam",
  "da nang": "Da Nang, Vietnam",
  "hội an": "Hoi An, Vietnam",
  "hoi an": "Hoi An, Vietnam",
  "hội an / đà nẵng": "Da Nang, Vietnam",
  guangzhou: "Guangzhou, China",
  beijing: "Beijing, China",
  bangkok: "Bangkok, Thailand",
  "chiang mai": "Chiang Mai, Thailand",
  "koh samui": "Koh Samui, Thailand",
  tokyo: "Tokyo, Japan",
  kyoto: "Kyoto, Japan",
  osaka: "Osaka, Japan"
};

function stripMd(s) {
  return String(s || "")
    .replace(/\*\*/g, "")
    .replace(/\[\[([^\]]+)\]\]/g, "$1")
    .trim();
}

function citySuffix(city) {
  const norm = stripMd(city).toLowerCase();
  for (const [key, suffix] of Object.entries(CITY_SUFFIX)) {
    if (norm.includes(key)) return suffix;
  }
  const base = stripMd(city).replace(/\s*\(.*$/, "").trim();
  return base || "Unknown";
}

function matchRegistry(name, extraRules = []) {
  const blob = stripMd(name);
  for (const rule of [...extraRules, ...VENUE_ADDRESS_RULES]) {
    if (rule.pattern.test(blob)) return rule.address;
  }
  return null;
}

function looksLikeCuisineOrCategory(s) {
  const t = stripMd(s);
  if (!t || /\d/.test(t)) return false;
  return /izakaya|dim sum|cantonese|vietnamese|japanese|seafood|afternoon tea|heritage walk|viewpoint|food\/culture|garden\/temple|nature\/temple|history\/museum|landmark\/temple|shopping only|market$/i.test(
    t
  );
}

/**
 * Resolve a street address for Google Maps import.
 * @param {{ name: string, city?: string, area?: string, extraRules?: { pattern: RegExp, address: string }[] }} opts
 */
export function resolveVenueAddress({ name, city = "", area = "", extraRules = [] }) {
  const fromRegistry = matchRegistry(name, extraRules);
  if (fromRegistry) return fromRegistry;

  const areaClean = stripMd(area);
  const suffix = citySuffix(city);
  if (areaClean && !/^\$|★/.test(areaClean) && !looksLikeCuisineOrCategory(areaClean)) {
    return `${areaClean}, ${suffix}`;
  }

  const nameClean = stripMd(name);
  if (nameClean) return `${nameClean}, ${suffix}`;
  return suffix;
}
