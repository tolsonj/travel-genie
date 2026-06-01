---
step: "02-route-optimization"
title: "Route Optimization"
trip: "china-vietnam-2026"
created: 2026-05-25
depends_on:
  - "[[profile]]"
  - "[[01-traveler-profile]]"
tags:
  - travel-planning
  - route
---

# Route Optimization

## Reasoning

**Country order decision**: China first, then Vietnam. Rationale: (1) More complex visa logistics for China (advance visa required for US citizens) — tackle bureaucratically harder country first while energy is fresh; (2) Vietnam has the resort/beach character that suits a trip wind-down; (3) Direct flights connect well from major Chinese hubs to Ho Chi Minh City or Hanoi.

**China city selection**: With 5–6 days, only one city cluster is viable without violating the relaxed pace. Beijing (history, culture, The Great Wall, hutongs, Wangfujing shopping) is the strongest single-city anchor given the interests profile. Shanghai is an alternative — more shopping and modern culture — but Beijing's history depth scores higher. **Recommendation: Beijing + optional day trip to Xi'an or Great Wall only.** Xi'an (terra cotta warriors) adds complexity; better to maximize Beijing.

**Vietnam city selection**: With 8 days, a two-city structure works: **Hanoi (2–3 nights) + Hội An or Đà Nẵng (5–6 nights resort)**. Hanoi provides cultural/food depth; Đà Nẵng/Hội An gives beach resort, nature, ancient town, and shopping. Hội An scores highest on all four interests: shopping (lanterns, tailors, silk), food (White Rose dumplings, Cao Lầu), nature (rice paddies, beach 5km away), history (Ancient Town UNESCO).

**September context**: Late monsoon/typhoon season for both countries. Beijing is actually excellent in September (post-summer heat, pre-winter cold — ideal shoulder season). Vietnam September is warm and humid with possible afternoon rain showers, but rarely disrupts full days. Typhoon risk is real in central Vietnam coast (Đà Nẵng/Hội An) — rainy-day contingencies are essential in Step 16.

**Transit**: International flight China→Vietnam. Beijing Capital/Daxing to Da Nang or Phu Bai (Hue) direct or via Hanoi. 3–4 hour flights available. No overland crossing needed or advisable.

## Output

### Recommended Route

```
Home → Beijing (PEK/PKX) → [5 nights Beijing]
→ Flight: Beijing → Hanoi (HAN) [~4 hrs]
→ [2 nights Hanoi]
→ Flight/train: Hanoi → Đà Nẵng (DAD) [1 hr flight or 14 hr train — fly]
→ [5 nights Hội An / Đà Nẵng]
→ Flight: Đà Nẵng → Home (via connection)
```

**Open-jaw**: Fly INTO Beijing, fly OUT of Đà Nẵng. Saves backtracking. Strongly recommended.

### Day Allocation Table

| Segment | Days | Type | Notes |
|---------|------|------|-------|
| **Travel Day 1** | Sept 1 | Arrival Beijing | Light — orientation, jet lag recovery |
| **Beijing** | Sept 1–5 | 5 nights | Culture, history, shopping, Forbidden City, Great Wall day trip |
| **Travel Day 6** | Sept 6 | Beijing → Hanoi | Transit day; arrive evening |
| **Hanoi** | Sept 6–8 | 2 nights | Old Quarter food/culture, Hoan Kiem Lake, Temple of Literature |
| **Travel Day 9** | Sept 8 | Hanoi → Đà Nẵng | Short flight; check-in resort by midday |
| **Đà Nẵng / Hội An** | Sept 8–13 | 5 nights | Resort base; day trips to Hội An Ancient Town, Marble Mountains, My Son |
| **Travel Day 14** | Sept 14 | Departure | Buffer/check-out; evening or morning flight home |

**Transit ratio**: 2.5 transit days out of 14 = **18%** — under 20% threshold ✓

### Transit Methods Between Countries/Cities

| Leg | Mode | Time | Notes |
|-----|------|------|-------|
| Home → Beijing | Flight | ~13–14 hrs (from US East/West) | Book 2–3 months out |
| Beijing → Hanoi | Flight | ~4 hrs | Vietnam Airlines, Air China; multiple daily |
| Hanoi → Đà Nẵng | Flight | ~1.25 hrs | VietJet, Vietnam Airlines; multiple daily |
| Đà Nẵng → Home | Flight | 15–20 hrs (connection) | Via Tokyo, Seoul, or Hong Kong |

### Logistical Traps to Avoid

1. **Beijing subway card**: Get a transit IC card at the airport — don't rely on single-use tickets at peak hours
2. **Hanoi taxi scams**: Use only Grab app or hotel-arranged cars — street taxis at Noi Bai airport are notorious
3. **Hội An distance from Đà Nẵng**: 30 min by taxi/Grab; stay in Đà Nẵng beach resort, day-trip to Hội An (avoid Hội An hotels — they're inland, and no beach)
4. **September typhoon**: Đà Nẵng/Hội An sits in typhoon corridor. Flights can cancel 24–36 hrs in advance. Build flexible booking and buy trip insurance with typhoon coverage.
5. **China VPN**: Social media, Google Maps, and WhatsApp are blocked. Download Baidu Maps and a VPN before departure; activate VPN before landing in China.

### Alternative Routes

#### Option B: Shanghai instead of Beijing
- **Trade-off**: More modern, superior shopping (Nanjing Road, The Bund); less historical depth
- **Best for**: If shopping > history priority; or if direct flights from home are better to PVG
- **Downside**: Missing Great Wall, hutongs, imperial history — biggest China-unique experiences

#### Option C: Beijing + Halong Bay (Cruise)
- **Route**: Beijing (4 nights) → Hanoi (1 night) → Halong Bay cruise (2 nights) → Đà Nẵng (4 nights)
- **Trade-off**: Adds an extraordinary nature experience; reduces Hanoi/Hội An time
- **Best for**: If nature score is elevated over history/shopping
- **Complexity**: Requires advance Halong Bay cruise booking (sell out months ahead for quality cruises)

### Booking Priority Queue

1. **Flights** (book now — Sept is shoulder/busy for Asia routes from US)
   - Home → Beijing PEK/PKX (open-jaw return from DAD)
   - Beijing → Hanoi HAN
   - Hanoi → Đà Nẵng DAD
2. **Great Wall tour** (Mutianyu section — less crowded, requires advance booking for early access)
3. **Hội An tailors** (WhatsApp in advance for multi-garment orders; need minimum 2 days for fitting)
4. **Đà Nẵng beach resort** (Intercontinental, Pullman, Vinpearl, Fusion Suites — book 3–4 months out)
5. **Beijing hotel** (CBD/Wangfujing area: Rosewood, The Peninsula, Waldorf — book early)

## Validation

- [x] Transit ratio: 18% < 20% threshold — **PASS**
- [x] No "country hopping fatigue" — only 2 countries, clean linear route
- [x] Deal-breaker (crowds): Great Wall → Mutianyu section recommended over Badaling (much less crowded); Hội An → early morning entry or evening visits for Ancient Town
- [x] Deal-breaker (heat): Beijing in September is ideal (avg 20–26°C). Đà Nẵng September avg 28–32°C with humidity — outdoor scheduling must be early morning or evening; midday resort/AC time built in
- [x] Open-jaw routing eliminates backtracking — PASS
- [x] Relaxed pace confirmed: no city requires >1 transit within it; resort base for Vietnam avoids daily packing
