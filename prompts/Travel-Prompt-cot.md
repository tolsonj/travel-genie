# Travel Prompt CoT — Flight search (MCP)

When a **Google Flights MCP server** is available in the agent environment, use it for **live fare data** during planning. Do **not** guess international flight prices when MCP is connected.

## MCP tools (typical names)

| Tool | Use for |
|------|---------|
| `get_flights_on_date` / `search_flights` | One-way leg on a specific date (open-jaw and multi-city trips) |
| `get_round_trip_flights` | Simple round-trip home ↔ single destination |
| `find_all_flights_in_range` / `search_dates` | ±2–3 day date flex on long-haul legs (Step 17) |

**Server names in Cursor:** `fli` (Fli / `fli-mcp`), `google-flights` (npm), or `MCP_DOCKER` gateway — tool names may differ; read the MCP tool schema before calling.

## Required profile fields (for MCP)

Collect in Step 1 / `profile.md` if missing:

- **Home airport** — IATA code (e.g. `ATL`, `SFO`, `JFK`)
- **Passengers** — adult count (default 1)
- **Cabin preference** — `economy` (always search); optionally compare `business` when budget allows splurge

## When to query MCP

| Step | What to search |
|------|----------------|
| **02 Route Optimization** | Snapshot: international inbound + outbound open-jaw legs; validate airport choices |
| **07 Transport & Money** | Full leg-by-leg economy (+ business if comparing); trip total vs budget |
| **17 Time Optimization** | Date-flex on long-hauls only (`find_all_flights_in_range` or shift ±2 days) |

## Per-leg search workflow

1. Derive legs from route Output: `Home (IATA) → first hub`, each inter-country flight, `last hub → Home`.
2. For each leg, call MCP with: `origin`, `destination`, `date` (YYYY-MM-DD), `adults`, `seat_type`.
3. Record **search date** (today) — prices are point-in-time snapshots.
4. Present top 3–5 options per leg: price, stops, duration, airlines, departure window notes.
5. Mark one **recommended balanced** pick per leg (not always cheapest — avoid 2-stop red-eyes unless profile tolerates).
6. Add **Google Flights deep links** for manual re-check before booking.
7. Note: separate one-way tickets = no connection protection; mention multi-city fare as alternative on long-hauls.

## Optional sidecar

Write `trips/{slug}/flight-comparison.md` with full tables; reference from Steps 02 and 07 via wikilinks. Copy distilled tables into `opt-02-route-optimization.md` and `opt-07-transport-money.md` Output sections.

## Output table format (per leg)

| Price | Stops | Duration | Airlines | Notes |
|------:|-------|----------|----------|-------|
| $873 | 1 | ~21 hr | JetBlue + Cathay Pacific | Recommended balance |

Include a **trip total** row (sum of one-way legs × passengers) and compare to profile budget.

## Fallback

If MCP is unavailable or a search fails: use estimate ranges, flag as **unverified**, and list legs the user should check manually.

---

```
STEP 1 — Traveler profile

I want to plan a multi-country trip. Ask me 8-10 targeted questions about:
- How many countries I want to visit and which ones I'm considering
- My travel style (adventurous vs relaxed, planner vs spontaneous)
- Who I'm traveling with and their needs
- My total budget and whether I prefer to splurge in one country or spread evenly
- My top interests (nature, food, history, nightlife, water sports, museums, etc.)
- My physical limitations or accessibility needs
- My past multi-country experiences (what worked vs what didn't)
- My ideal "perfect day" while traveling
- Deal-breakers (crowds, heat, long drives, frequent border crossings, etc.)
- If traveling with others: who decides when we disagree?

Also confirm (required for flight search):
- **Home airport** — nearest major airport IATA code (e.g. ATL, LAX, ORD)
- **Passengers** — how many adults flying
- **Cabin preference** — economy only, or compare business on long-hauls

After I answer, summarize my traveler profile and recommend whether my country count is realistic for my timeframe. Record home airport, passengers, and cabin preference in the profile summary.
```

```
STEP 2 — Route optimization

ROLE: Multi-country route strategist.
PERSONA: [Paste your traveler profile from Step 1]
SITUATION: I want to visit [list countries] over [total days].

TASK:
1. ROUTE OPTIMIZATION:
   - Recommend the optimal country order (minimize backtracking and transit time)
   - Flag "logistical traps" — connections that look close on a map but take hours
   - Identify which countries should be combined in one continuous loop vs which need a flight gap

2. DAY ALLOCATION:
   - Recommended days per country based on interest density and transit time
   - Minimum viable stay per country (don't visit if you have less than X days)
   - Transit days vs exploration days — show me the ratio

3. TIMING & SEASONALITY:
   - Score each country for my travel window across: weather, crowd level, price, events
   - Flag countries where my dates hit monsoon, peak season, or national holidays
   - Identify "shoulder season windows" where I can save money by shifting dates

4. ENTRY/EXIT LOGISTICS:
   - Best airports to fly into and out of
   - Whether open-jaw (fly into A, out of B) saves time vs round-trip
   - Overland border crossings vs flights between countries

5. LIVE FLIGHT PRICES (MCP — if available):
   - Query Google Flights MCP for **inbound** (home airport → recommended entry airport) and **outbound** (recommended exit airport → home) on itinerary dates
   - Query each **inter-country flight leg** in the recommended route (skip ground/rail segments)
   - Use profile: home airport IATA, passenger count, `economy` (add `business` if profile requests comparison)
   - Include a **Flight Price Snapshot** subsection: per-leg table (price, stops, duration, airlines, recommended pick)
   - Sum one-way legs × passengers; note whether total fits remaining budget after hotels/activities
   - Flag date-line effects (e.g. US→Asia departure may arrive next calendar day)
   - If MCP unavailable: label estimates **unverified** and list legs to check manually

OUTPUT:
- Visual route summary (country order with transit methods)
- Day allocation table
- Flight price snapshot (MCP) or unverified estimate table
- 2 alternative routes with trade-offs
- Booking priority queue (what to book first to lock the route)

VALIDATION: Check for "country hopping fatigue" — warn me if transit exceeds 20% of total trip time. If MCP was used, confirm every flight leg in the route was searched and search date is recorded.
```

```
STEP 3 — Immigration and entry

ROLE: Immigration and entry specialist.
SITUATION: I am a citizen of [your country] traveling to [list countries] from [dates].
PASSPORTS HELD: [list all passports if dual/multiple citizenship]

TASK — FOR EACH COUNTRY:
1. VISA REQUIREMENTS:
   - Do I need a visa, visa-on-arrival, or e-visa?
   - Processing time and cost
   - Required documents (passport validity, blank pages, photos, bank statements, invitation letters)
   - Application portal or embassy contact
   - Whether I can apply in advance or must wait until arrival

2. TRAVEL AUTHORIZATIONS (2026-specific):
   - ETIAS needed for Europe? (€20, apply in advance) 
   - UK ETA needed? (mandatory for visa-exempt travelers from Feb 2026) 
   - Any other digital entry systems (EES biometric scanning in EU)
   - Transit visa requirements even if I don't leave the airport

3. PASSPORT VALIDITY RULES:
   - Minimum validity required (6 months beyond travel is common)
   - Blank pages needed per country
   - Whether dual citizenship helps or complicates entry

4. VACCINATION & HEALTH:
   - Required vaccinations for entry (yellow fever certificate, etc.)
   - COVID or other health declarations still in effect

5. RECIPROCAL RESTRICTIONS:
   - Are any of my destination countries on travel ban lists affecting my citizenship? 
   - If yes: alternative routing or entry strategies

OUTPUT:
- Country-by-country entry checklist
- Application timeline (what to apply for first, deadlines)
- "Red flag" warnings for complex entries
- Backup plan if a visa is denied

VALIDATION: Confirm all information is current as of 2026 and flag any policies that may change before my travel dates.
```

```
STEP 4 — Master itinerary

Plan a [number]-day multi-country trip visiting [countries in order].

Travel dates: [dates]. Budget: [total or daily per country].
Interests (ranked): [e.g., 40% food, 30% nature, 20% history, 10% relaxation]
Pace: [packed / moderate / relaxed]
Must-do per country: [specific experiences]
Hard no: [what to avoid]
Already booked: [flights, hotels, etc.]

Build my itinerary:
1. Day-by-day schedule with morning, afternoon, and evening anchors
2. For each day: one "wow moment," one "low energy" option, one rainy-day backup
3. Travel time between activities (walking, transit, driving)
4. One "skip the tourist trap" local recommendation per day
5. A free/cheap activity balanced with a splurge activity each day
6. A booking queue: what to book NOW vs later, with deadlines
7. "SOFT DAYS": Schedule lighter days after border crossings and long transit
8. DEPARTURE/ARRIVAL DAYS: Buffer days for international flights and border formalities

MULTI-COUNTRY SPECIFIC:
- Border crossing days: What time to cross, what documents to carry, estimated crossing duration
- Currency transition days: When to exchange money, ATM strategy per country
- Time zone changes: How jet lag affects each leg
- "First day in country" protocol: Always lighter to account for orientation fatigue

VALIDATION: Check for transit overload — warn if I'm spending more than 2 hours daily in transit or more than 20% of total trip in transit between countries.
```

```
STEP 5 — Accommodation

ROLE: Multi-country accommodation strategist.
PERSONA: [Paste traveler profile]
ITINERARY: [Paste from Step 4]
SITUATION: I need accommodation across [number] countries.

TASK:
1. NEIGHBORHOOD ANALYSIS PER COUNTRY:
   - Map my daily activities and recommend neighborhoods that minimize transit
   - Proximity to border crossings or transit hubs for arrival/departure days

2. ACCOMMODATION TYPE MATCH PER COUNTRY:
   - Hostel, boutique hotel, chain, Airbnb — which fits each country's infrastructure and my needs?
   - Countries where Airbnb is restricted or regulated differently

3. BOOKING STRATEGY:
   - Which countries need advance booking (high demand, limited supply)?
   - Which allow flexible/walk-in booking?
   - Cancellation policies that work with multi-country uncertainty

4. CROSS-BORDER LOGISTICS:
   - Early check-in options for morning arrivals
   - Late checkout for evening departures to next country
   - Luggage storage between checkout and border crossing

5. SAFETY PER COUNTRY:
   - Solo traveler considerations by neighborhood
   - Countries where hotel registration with police is required

VALIDATION: Confirm each accommodation is within 30 minutes of 60% of planned activities AND within reasonable distance of my exit point to the next country.
```

```
STEP 6 — Shopping

ROLE: Multi-country shopping strategist.
PERSONA: [Paste traveler profile]
ITINERARY: [Paste from Step 4 — full day-by-day schedule]
CITIES ON ITINERARY: [Extract from Step 4 — each city with dates/nights and country. Shopping is scoped to these cities unless I explicitly change routing.]
SITUATION: I want to shop across [number] countries for: clothing, tailored/bespoke clothes, designer watches, designer handbags, designer shoes, and athletic/sneaker brands. Budget per category: [e.g. tailoring $X, watches $X, handbags $X, shoes $X].

TASK:
0. ITINERARY + SOCIAL MEDIA ANCHOR (do this first):
   - Parse Step 4 for every city I will stay in (not just countries)
   - For EACH itinerary city AND each country on the route, synthesize what is trending on **YouTube** (travel vlogs, shopping hauls), **TikTok** (hashtags, short-form hauls), and **Instagram** (location tags, Reels, creator districts)
   - Desk research only (search summaries, creator roundups, travel press) — not a live API scrape; verify hours, addresses, tax-refund rules, and authenticity before visiting
   - Per city: 3–5 districts/malls/markets repeatedly featured in creator content — why they trend, content type (luxury haul, bargain, tech, wholesale, night aesthetic)
   - Per city: sample YouTube search queries, TikTok hashtags, and Instagram location tags I can use to dig deeper
   - Per country: national shopping narratives/memes (e.g. country-wide TikTok trends)
   - **Itinerary fit:** tag each viral spot as **on-route + day match** | **on-route, needs schedule slot** | **viral but off-itinerary** (city not in Step 4 — only recommend if worth rerouting)
   - Note platform access (e.g. YouTube/Instagram may require VPN in some countries)

1. COUNTRY-BY-COUNTRY SHOPPING STRENGTH (prioritize cities on my itinerary):
   - Rank each country on my itinerary for each category (clothing, tailoring, watches, handbags, designer shoes, athletic shoes)
   - Identify which country is the best single stop for each category — where to prioritize spend
   - Flag categories where a country offers exceptional value vs home-country pricing

2. TAILORED & BESPOKE CLOTHING:
   - Cities with established tailoring districts or street-level tailors known for quality
   - Turnaround time requirements — which cities require multi-day lead time, which can do 24–48 hours
   - Fabric quality tiers by price point (linen, wool, silk) and what to expect per country
   - Red flags: shops that cut corners on fittings, tourist-trap tailors to avoid by neighborhood
   - Measurement and fitting protocol: how many fittings to insist on per garment

3. DESIGNER WATCHES:
   - Countries with authorized dealers for major brands (Rolex, AP, Patek, Omega, etc.)
   - Duty-free and VAT refund eligibility per country — how much back, refund process at border/airport
   - Gray market watch dealers: which countries have reputable gray markets vs counterfeit risk
   - Import duty implications when returning home — declared value thresholds to know
   - Authentication tips when buying pre-owned across countries

4. DESIGNER HANDBAGS:
   - Countries where luxury houses (LV, Chanel, Hermès, Gucci, Prada) offer lower retail prices vs home
   - VAT refund process per country: minimum purchase, refund rate, airport vs in-store refund
   - Waitlist and allocation strategy: countries where stock access is more favorable
   - Second-hand/consignment luxury market by city (reputable shops, authentication services)
   - Customs declaration rules for carrying bags across borders mid-trip

5. DESIGNER & LUXURY SHOES:
   - Countries with flagship boutiques or factory-adjacent outlets for Italian/French houses
   - Outlet villages near my itinerary cities: distance, brands represented, discount ranges
   - Sizing conversion reference per country/brand (EU, UK, US, JP)
   - Best cities for made-to-order leather shoes and lead time requirements

6. ATHLETIC & SNEAKER SHOPPING:
   - Countries with exclusive regional colorways or limited releases not available at home
   - Flagship and concept stores by city (Nike, Adidas, New Balance, ASICS, ON, Salomon, etc.)
   - Sneaker resale and collector markets by city: marketplaces, districts, authenticity safeguards
   - Price differential vs home country for major athletic brands
   - Best timing: release drops, sample sales, end-of-season clearance windows

7. LOGISTICS & CUSTOMS STRATEGY:
   - Order of countries: when to buy heavy/bulky items vs lightweight items given luggage constraints
   - Shipping options: which countries offer reliable international shipping from retail stores
   - VAT refund consolidation: global refund services (Global Blue, Planet) availability per country
   - Customs declaration thresholds for returning home — duty-free allowances per category
   - Packing strategy: how to carry purchases safely across multiple border crossings

8. AUTHENTICITY & SCAM PROTECTION:
   - Country-by-country counterfeit risk level per category
   - How to identify fake luxury goods (watches, handbags, shoes) in each market
   - Safe shopping zones vs known counterfeit districts per city
   - Receipt and certificate of authenticity standards to demand per category

OUTPUT:
- Shopping priority matrix: country × category ranked by value, availability, and price advantage
- **Itinerary city shopping map:** city → viral social picks → assigned day or "add slot" or "off-route"
- **Social vs plan matrix:** already scheduled | add to day X | viral but skip (off-route / poor fit)
- Recommended shopping days per **itinerary city** with neighborhood map (cluster near that day's anchors)
- DIY search strings table: YouTube queries + TikTok/Instagram tags per itinerary city
- VAT refund summary table: rates and process per country
- Customs/duty cheat sheet for returning home with purchases

VALIDATION: Confirm shopping days are scheduled on non-transit days in **itinerary cities only** (unless I approved a routing change for a viral off-route spot). Flag any city where primary shopping districts are closed on days I'm present (e.g. Sunday closures, national holidays). Ensure total declared purchase value is modeled against my home-country duty-free allowance. Distinguish creator hype from fit for my profile and budget.
```

```
STEP 6b — Food & dining

ROLE: Multi-country food anthropologist.
PERSONA: [Paste traveler profile]
ITINERARY: [Paste from Step 4 — full day-by-day schedule]
CITIES ON ITINERARY: [Extract from Step 4 — each city with dates/nights and country]
SITUATION: I want to eat like a local across [list countries]. Dietary needs: [none/vegetarian/allergies]. Food budget: [range per country].

TASK:
0. ITINERARY + SOCIAL MEDIA ANCHOR (do this first):
   - Scope food research to **cities on my Step 4 itinerary** (and border/transit stops where I have meal time)
   - For EACH itinerary city AND each country, synthesize trending food from **YouTube** (food vlogs, street-food tours), **TikTok** (viral dishes, night-market clips), and **Instagram** (restaurant Reels, café districts, location tags)
   - Desk research only — verify hours, reservations, hygiene, and dietary fit before visiting
   - Per city: 3–5 venues or districts repeatedly featured (night markets, viral cafés, "must film" stalls, chef-driven spots)
   - Per city: what creators tend to order/film vs what locals actually eat there
   - Per country: national food trends on social (e.g. regional dish waves, festival food)
   - **Itinerary fit:** map each viral food spot to a specific day/meal or flag **off-itinerary city** / **needs detour**
   - Note platform access where Western social apps are restricted

1. SIGNATURE DISHES PER COUNTRY: 5 must-try dishes per country with:
   - Pronunciation guide
   - What to order with it
   - Where to get the best version (neighborhoods)
   - Price range

2. FOOD EXPERIENCES PER COUNTRY:
   - One hands-on experience per country (cooking class, market tour, street food crawl)
   - Prefer experiences in **itinerary cities**; include 1–2 creator-famous experiences only if they match my pace and budget
   - Cross-reference with my itinerary to avoid scheduling conflicts

3. MEAL MAPPING: Map meals to **specific itinerary days and cities**, accounting for:
   - Border crossing days (pack food or know what's available at the crossing)
   - Early departure days (breakfast options before 6 AM)
   - Late arrival days (24-hour food options)

4. FOOD SAFETY BY COUNTRY:
   - Tap water safety per country
   - Street food hygiene rules
   - Countries where certain foods should be avoided

5. DINING CUSTOMS PER COUNTRY:
   - Tipping norms (varies wildly — don't assume)
   - Meal timing (siesta countries, late dinner countries)
   - Table manners that differ from home

OUTPUT:
- Country-by-country food itinerary with border-crossing meal contingencies
- **Per itinerary city:** signature dishes + social-media-highlight venues mapped to days/meals
- **Social vs plan matrix** for food (scheduled | add slot | off-route / skip)
- DIY search strings: YouTube food vlogs + TikTok/Instagram tags per itinerary city

VALIDATION: No meal requires >30 minutes extra transit from that day's anchor unless flagged. Viral spots must fit dietary needs and food budget. Flag overhyped creator traps vs high-quality local picks.
```

```
STEP 7 — Transport & money

I'm traveling through [countries in order] from [home city].
ROUTE: [Paste from Step 2 — legs, airports, dates]
PROFILE: [Home airport IATA, passengers, cabin preference, total budget]

For EACH LEG (between countries AND within countries):
1. Compare transport options: flight, train, bus, rental car, ferry
   - Cost, time, convenience, scenic value
   - Border crossing procedures for each mode

2. Recommend best option and explain WHY for my profile

3. Exact booking platforms/apps per country

4. Scams and mistakes specific to that route

FLIGHT LEGS — LIVE PRICES (MCP — if available):
- For every **flight** leg in Step 2 route (international + inter-country), query Google Flights MCP
- Search **economy** for all legs; search **business** on long-haul legs if profile compares cabins
- Per leg: top 3–5 options table (price, stops, duration, airlines, notes) + one **recommended balanced** pick
- **Trip total summary**: cheapest possible vs recommended balanced (economy and business if compared)
- Compare flight total × passengers against profile budget; show % of $20K (or stated budget) for flights vs ground spend
- Note one-way vs multi-city booking trade-off (connection protection)
- Google Flights deep links per leg for re-check before purchase
- Write or update `flight-comparison.md` sidecar; distill key tables into Output
- If MCP unavailable: keep estimate ranges but mark **unverified**

MULTI-COUNTRY MONEY MANAGEMENT:
- Currencies needed and exchange strategy (ATM vs exchange booth vs card)
- Countries that are cash-heavy vs card-friendly
- ATM fees by country and best networks to use
- Dynamic currency conversion — when to decline
- Tipping culture per country (can vary dramatically)
- Budget tracking across currencies — recommended multi-currency app

DUTY-FREE & CUSTOMS:
- Duty-free allowances per country I'm entering 
- What I CANNOT bring across borders (meat, dairy, alcohol limits, medications)
- Security tamper-evident bag (STEB) rules for duty-free liquids on connections 
- Countries with strict medication import rules

OUTPUT: Transport and money strategy document per country transition, including MCP flight comparison tables (or unverified estimates).

VALIDATION: Every flight leg from Step 2 was searched via MCP or explicitly marked unverified. Trip flight total is reconciled with budget.
```

```
STEP 8 — Customs & borders

ROLE: Customs and border crossing specialist.
SITUATION: I am crossing borders between [list countries in order] via [modes: flight/train/bus/car].

TASK — FOR EACH BORDER CROSSING:
1. CUSTOMS PROCEDURES:
   - Do I clear customs at this border or at final destination? 
   - Schengen rules if applicable (first entry = immigration, final = customs)
   - US/Canada rules (clear at first stop even if connecting)
   - Self-transfer vs single ticket implications for baggage

2. DUTY-FREE ALLOWANCES:
   - Alcohol limits per country (liters of spirits/wine/beer)
   - Tobacco limits
   - Value limits for goods before duties apply
   - What happens if I exceed limits

3. RESTRICTED ITEMS:
   - Food restrictions (EU bans meat/dairy from non-EU countries) 
   - Medication rules (prescription requirements, banned substances)
   - Electronics declaration requirements
   - Cultural artifacts or souvenirs that may need export permits

4. PURCHASING STRATEGY:
   - Best country to buy souvenirs (lowest prices, best quality)
   - VAT refund eligibility per country (minimum spend thresholds)
   - How to claim VAT refunds at departure
   - Items that are cheaper in specific countries

5. BORDER CROSSING LOGISTICS:
   - Operating hours of the crossing
   - Peak times to avoid
   - Documents needed at this specific border
   - Estimated crossing duration
   - Whether I need to pre-register or pay fees online

OUTPUT: Border-by-border crossing guide with packing restrictions and purchasing strategy.
```

```
STEP 9 — Tech & connectivity

ROLE: Multi-country tech survival guide.
SITUATION: I'm visiting [list countries] for [total days].

TASK:
1. CONNECTIVITY STRATEGY:
   - One eSIM that covers multiple countries vs separate SIMs per country
   - Recommended multi-country eSIM providers
   - Data roaming agreements between my destination countries

2. OFFLINE SURVIVAL (download before departure):
   - Offline maps for ALL countries and border regions
   - Translation packs for each language
   - Key addresses, booking confirmations, border crossing docs
   - Emergency contacts per country

3. POWER & PLUGS:
   - Plug types across all countries (do I need multiple adapters?)
   - Voltage compatibility for my devices
   - Portable charger strategy for long transit days

4. DIGITAL SECURITY:
   - VPN need per country (some block certain sites)
   - Public Wi-Fi risks at border crossings and airports
   - Document backup across all countries

5. PAYMENT APPS:
   - Which payment apps work in which countries
   - Countries where cash is essential
   - Multi-currency card recommendations

OUTPUT: Tech setup checklist and offline survival kit for the entire multi-country route.
```

```
STEP 10 — Culture & museums

ROLE: Multi-country cultural curator.
PERSONA: [Paste traveler profile]
ITINERARY: [Paste from Step 4 — full day-by-day schedule]
CITIES ON ITINERARY: [Extract from Step 4 — each city with dates/nights and country]
SITUATION: I'm visiting [list countries] for [number] days each.
Cultural interests: [art/history/science/music/architecture/local traditions]

TASK:
0. ITINERARY + SOCIAL MEDIA ANCHOR (do this first):
   - For EACH **itinerary city** and country, research cultural activities trending on **YouTube** (museum vlogs, walking tours), **TikTok**, and **Instagram** (photo spots, exhibitions, neighborhood aesthetics)
   - Per city: museums, galleries, temples, architecture walks, and timed exhibitions creators repeatedly feature
   - Tag each as **on-route + day match** | **on-route, needs slot** | **viral but off-itinerary**
   - Filter creator-famous spots for crowd level, booking lead time, and authenticity vs photo-backdrop traps

TASK PER COUNTRY (prioritize itinerary cities):
1. MUSEUM STRATEGY:
   - One museum/site per day with hidden corners
   - Best time to visit for crowd avoidance
   - Booking requirements and deadlines

2. ALTERNATIVE CULTURE:
   - Live performance, neighborhood walk, spiritual site
   - How to book or attend as a foreigner

3. DEEP HISTORY:
   - 3 surprising facts per country that most tourists don't know

4. CULTURAL TRANSITIONS:
   - How customs differ between Country A and Country B (greetings, dining, dress)
   - "Culture shock" buffer — what to expect when crossing from one to the next

5. LANGUAGE REALITY:
   - English penetration per country
   - Survival phrases in each language
   - Translation app recommendations per language family

OUTPUT: Per-itinerary-city cultural calendar + social-vs-plan matrix + DIY YouTube/TikTok/Instagram search strings per city.

VALIDATION: Check for museum fatigue across the entire trip, not just per country. Activities must land in cities on Step 4 unless I approve a routing change.
```

```
STEP 11 — Adventure

ROLE: Multi-country adventure specialist.
PERSONA: [Paste traveler profile — include fitness level]
ITINERARY: [Paste from Step 4 — full day-by-day schedule]
CITIES ON ITINERARY: [Extract from Step 4 — each city with dates/nights and country]
SITUATION: Active experiences across [list countries].

TASK:
0. ITINERARY + SOCIAL MEDIA ANCHOR (do this first):
   - For EACH **itinerary city** and country, synthesize trending **activities** on **YouTube** (hike vlogs, dive/snorkel tours, bike routes), **TikTok**, and **Instagram** (viewpoints, adventure parks, seasonal experiences)
   - Per city: 3–5 activities creators repeatedly film — difficulty, seasonality, operator signals, typical duration
   - Map each to itinerary days; flag viral activities in **cities not on Step 4**
   - Separate influencer "hero shots" from experiences worth my fitness level and insurance coverage

1. WATER SPORTS PER COUNTRY (itinerary cities and coastal stops only):
   - Available activities based on geography
   - Seasonal viability (water temperature, conditions)
   - Equipment rental vs bring-your-own
   - Medical clearance and insurance coverage

2. LAND ADVENTURES PER COUNTRY (prioritize itinerary cities):
   - Hiking, biking, climbing options near cities I am actually staying in
   - Difficulty ratings and time requirements
   - Include creator-trending trails or districts only when they fit season and recovery days

3. CROSS-BORDER GEAR:
   - What adventure gear can I carry across borders (hiking poles, dive knives, etc.)
   - Countries where certain gear is restricted
   - Rental availability vs packing burden

4. ACTIVITY-TO-ROUTE FIT:
   - Schedule high-energy activities early in each country
   - Recovery days after intense adventures
   - Border crossing days should NEVER follow hard adventure days

5. OPERATOR VETTING PER COUNTRY:
   - Safety standards vary — what to check
   - Questions to ask before booking

OUTPUT: Adventure calendar integrated with border crossing and recovery days + per-city social trending activities + social-vs-plan matrix + DIY search strings per itinerary city.

VALIDATION: High-intensity activities only on non-transit days in itinerary cities. No viral off-route day trips unless explicitly worth the detour.
```

```
STEP 12 — Hidden gems

ROLE: Multi-country local insider.
PERSONA: [Paste traveler profile]
ITINERARY: [Paste from Step 4 — full day-by-day schedule]
CITIES ON ITINERARY: [Extract from Step 4 — each city with dates/nights and country]
SITUATION: Main sights covered. Now I want the secret layer across [list countries] — including what creators surface on social, filtered for substance.

TASK:
0. SOCIAL DISCOVERY LAYER (itinerary cities first):
   - Mine **YouTube**, **TikTok**, and **Instagram** for each **itinerary city** for places locals and thoughtful creators love (not only mega-viral landmarks)
   - Cross-check against Step 4: skip duplicates already scheduled; elevate under-the-radar spots that fit open slots
   - Flag "Instagram trap" locations (long queues, low payoff) vs genuine hidden gems

1. HIDDEN GEMS PER COUNTRY: 5 places/experiences locals love — **at least 3 per itinerary city**
2. "ONLY HERE" PER COUNTRY: 2 things I can only do there
3. NEIGHBORHOOD DEEP-DIVES: 1 non-touristy neighborhood per country
4. CROSS-BORDER CONNECTIONS:
   - Cultural similarities between neighboring countries
   - How history connects them (makes border crossings more meaningful)
   - Regional foods or traditions that span borders

5. NIGHTTIME SECRETS PER COUNTRY

VALIDATION: Note reservations, limited hours, or seasonality for each gem.
```

```
STEP 13 — Etiquette

ROLE: Multi-country cultural bridge guide.
SITUATION: Visiting [list countries] from [home country].

TASK PER COUNTRY:
1. DAILY ETIQUETTE: 10 behavioral norms
2. SURVIVAL LANGUAGE: 10 essential phrases
3. CONVERSATION STARTERS: 5 questions locals enjoy
4. GESTURES & TABOOS: What not to do
5. SUPPORTING LOCALS: How to spend money that benefits residents

CROSS-CULTURAL NAVIGATION:
- How etiquette changes between Country A and B (e.g., tipping in Japan vs Thailand)
- Countries where behavior at home is offensive there
- "Cultural whiplash" — rapid shifts between cultures and how to adapt

OUTPUT: Country-by-country cultural cheat sheet + cross-cultural transition guide.

```

```
STEP 14 — Health & safety

ROLE: Multi-country health and safety officer.
SITUATION: Traveling through [list countries] for [total days].
ACTIVITIES: [Paste from Steps 10, 11]

TASK:
1. PRE-TRIP HEALTH:
   - Vaccinations needed for ALL countries (some require proof for entry)
   - Travel insurance that covers multi-country trips AND adventure activities
   - Prescription medications: enough supply for entire trip + doctor's note
   - First aid kit for multi-country variability

2. HEALTH PER COUNTRY:
   - Nearest hospital to each accommodation
   - Tap water safety
   - Food safety rules
   - Common travel illnesses in region

3. EMERGENCY PROTOCOL PER COUNTRY:
   - Emergency numbers (police, ambulance, fire) — they differ!
   - Embassy locations and contacts
   - Insurance hotline with country-specific access numbers

4. SAFETY PER COUNTRY:
   - Common scams targeting tourists
   - Neighborhoods to avoid
   - Solo traveler protocols
   - Border crossing safety (which borders are safe vs risky)

5. DOCUMENT BACKUP:
   - Passport, insurance, bookings — cloud + physical copies
   - Visa/entry proof copies for each country

OUTPUT: Printable emergency card per country + pre-departure health checklist.
```

```
STEP 15 — Packing

Packing for [list countries] in [months]. Total trip: [days].
Activities: [paste from all previous steps]
Tech needs: [paste from Step 9]

Format:
1. "Do not forget" core list (15 items max, multi-country essentials)
2. Country-specific gear (rain gear for X, warm layers for Y)
3. Border-crossing day bag (documents, snacks, entertainment, charger)
4. Tech/battery survival for long transit days
5. Health kit covering all countries
6. Document folder with country dividers
7. Duty-free/purchasing bag strategy
8. Printable checklist

MULTI-COUNTRY PACKING RULES:
- Pack for the most restrictive country's customs first
- Layering system for multiple climates
- One "border crossing outfit" that's comfortable and presentable
- Luggage that works for planes, trains, buses, and cobblestones
```

```
STEP 16 — Contingency

Itinerary: [paste from Step 4]
Countries: [list]
Travel dates: [dates]

Create contingency plans for:
1. Weather ruins outdoor day per country
2. Missed flight/train between countries: rebooking protocol
3. I get sick in Country B but need to cross to Country C
4. Visa/entry denied at border: backup routing
5. Lost passport in a foreign country: step-by-step recovery
6. Political unrest or sudden travel ban affecting one country
7. Someone in group wants to split from itinerary
8. Budget overrun in Country A: how to cut costs in Countries B and C
9. Luggage lost on international connection: survival kit
10. Natural disaster or strike closes a border

For each: exact phone numbers, apps, websites, and embassy contacts.
```

```
STEP 17 — Time optimization

ROLE: Time optimization specialist.
SITUATION: I have [total days] to visit [list countries]. I want to maximize experience per day.
ROUTE & FLIGHTS: [Paste from Step 2 and Step 7 flight legs]

TASK:
1. PTO HACKING:
   - How to combine my trip with [my country's] holidays to extend without using more PTO 
   - Best departure/return days to capture weekends

2. TRANSIT TIME MINIMIZATION:
   - Red-eye flights vs day flights (sleep on plane = save a day)
   - Overnight trains/buses as "moving hotels" (save accommodation cost + wake up in new city)
   - Which border crossings are fastest vs most scenic

2b. DATE-FLEX FLIGHT SAVINGS (MCP — if available):
   - On **long-haul legs only** (home ↔ Asia/Europe/etc.), use `find_all_flights_in_range` or search ±2 days around Step 2 dates
   - Compare cheapest date shift vs itinerary impact (hotel nights, visa windows, booked activities)
   - Report savings in $ and whether shift is worth it for this profile
   - Do not flex short domestic/regional legs unless user requests

3. THE "70% RULE" FOR MULTI-COUNTRY:
   - Plan only 70% of each day, 30% for spontaneity and rest 
   - But schedule 100% of border crossing days (no spontaneity at borders)

4. JET LAG MANAGEMENT:
   - Time zone change strategy per leg
   - "Arrival day" should always be light regardless of enthusiasm

5. ACTIVITY CLUSTERING:
   - Group geographically close activities per city
   - One "anchor activity" per day, everything else is bonus

6. EARLY/LATE ACCESS:
   - Which attractions open early or stay late?
   - How to beat crowds and gain extra hours

7. THE "POWER PLAY":
   - If I can add 2-3 PTO days, which extension gives maximum return?

OUTPUT: Efficiency scorecard showing how many "pure experience hours" vs "transit hours" my plan contains, with optimization suggestions. Include date-flex flight savings table if MCP was used.

VALIDATION: Any recommended date shift must not break Step 4 anchors or Step 3 visa/entry windows.
```

```
STEP 18 — Final assembly

ROLE: Expert multi-country travel agent.
SITUATION: [number]-day multi-country trip to [countries] from [dates].
CITIZENSHIP: [your country]. PASSPORTS: [list].
BUDGET: [total]. INTERESTS: [ranked]. PACE: [style].

Generate a complete multi-country travel brief:

1. ROUTE: Optimal country order with transit methods and times
2. VISA & ENTRY: Per-country requirements, deadlines, red flags
3. ITINERARY: Day-by-day across all countries with anchors, wow moments, backups
4. ACCOMMODATION: Neighborhoods and booking strategy per country
5. FOOD: Signature dishes and experiences per **itinerary city**, social-media food highlights mapped to days, border-crossing meal plans
5b. SHOPPING: Category strategy per country scoped to **itinerary cities**, social-media shopping districts, VAT/customs
6. TRANSPORT: Between and within countries, with booking platforms; **flight totals from Step 7 MCP data** (economy + business if compared)
6b. FLIGHTS: Per-leg recommended picks, trip total, budget %, link to `flight-comparison.md` if present
7. CUSTOMS: Duty-free allowances, restricted items, purchasing strategy per country
8. TECH: Multi-country connectivity, offline kits, power adapters
9. CULTURE: Museums and activities per **itinerary city**, social-media cultural picks, etiquette + cross-cultural transitions
10. ADVENTURE: Water/land activities per **itinerary city** with seasonal viability and creator-trending options filtered for fitness
11. HIDDEN GEMS: Locals + creator-surfaced secrets per itinerary city (social-vs-plan matrix)
12. HEALTH: Vaccinations, insurance, emergency protocols per country
13. MONEY: Currency strategy, ATM networks, tipping, VAT refunds
14. PACKING: Multi-climate, border-crossing day bag, document organization
15. CONTINGENCY: 10 scenarios with step-by-step recovery per country
16. EFFICIENCY: PTO hacking, transit minimization, jet lag strategy, activity clustering
17. BOOKING QUEUE: Everything to reserve now with deadlines (flights first if MCP shows limited inventory or rising fares)

VALIDATION:
- Transit under 20% of total time
- No more than 2 hours daily in-city transit
- Border crossing days are never followed by intense activities
- Museum fatigue check across entire trip
- "Soft day" after every border crossing
- Flight costs sourced from MCP (with search date) or flagged unverified
```

