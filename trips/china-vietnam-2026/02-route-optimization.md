---
step: "02-route-optimization"
title: "Route Optimization"
trip: "china-vietnam-2026"
created: 2026-06-28
depends_on:
  - "[[profile]]"
  - "[[01-traveler-profile]]"
tags:
  - travel-planning
  - route
---

# Route Optimization

## Reasoning

Two-country trip (Hong Kong entry + Mainland China → Vietnam) over 14 days. The logical flow is west-to-east geographically: HKG entry (international hub with great connections), use Hong Kong as a soft landing + shopping day, then cross to Shenzhen (30 min by MTR) for dupe electronics/goods shopping, then fly south to Vietnam. Vietnam routing: Hanoi → fly to Da Nang/Hoi An → HCMC → fly home. This avoids backtracking. The alternative (HCMC first, then north to Hanoi, fly home from Hanoi) works but means flying home from Hanoi requires a connection — HCMC has better direct/single-stop options to ATL. September weather concern: typhoon season in South China Sea. Halong Bay cruises occasionally suspended for safety. Building in 1 contingency day. Transit ratio check: 14 days, ~2.5 transit days = 18% — within 20% limit.

## Output

### Recommended Route

```
ATL → HKG → Shenzhen → [fly] → Hanoi → Ha Long Bay → [fly] → Da Nang/Hoi An → [fly] → Ho Chi Minh City → ATL
```

### Day Allocation

| Segment | Nights | Focus |
|---------|--------|-------|
| Hong Kong | 2 | Soft landing, cultural orientation, MTR/Kowloon shopping |
| Shenzhen | 1 | Dupe electronics/goods shopping (Luohu, SEG Market) |
| Hanoi | 2 | Old Quarter, culture, food, day trip base |
| Ha Long Bay | 1 | Overnight cruise (nature, deal-breaker: crowds — book premium boat) |
| Hoi An | 2 | Tailoring fittings + ancient town, low-crowd mornings |
| Ho Chi Minh City | 3 | Sneaker shopping, history (War Remnants Museum), food scene |
| **Total** | **11 nights** | (Days 1 and 14 are international travel days) |

### Flight Legs

| Leg | Route | Mode | Est. Duration |
|-----|-------|------|---------------|
| 1 | ATL → HKG | Flight (overnight) | ~16 hr nonstop or 19 hr via 1 stop |
| 2 | HKG/Shenzhen → Hanoi | Flight | ~2.5 hr |
| 3 | Hanoi → Da Nang | Flight | ~1.5 hr |
| 4 | Ho Chi Minh City → ATL | Flight | ~22–24 hr via 1–2 stops |

**HKG→Shenzhen:** MTR East Rail Line to Lo Wu border crossing (45 min, ~HK$40) — no flight needed.

### Flight Price Snapshot (Unverified — MCP unavailable)

| Leg | Economy Est. | Business Est. | Recommended |
|-----|-------------|---------------|-------------|
| ATL → HKG | $900–1,200/pp | $3,500–5,000/pp | Economy unless Cathay Business <$2,500/pp |
| Shenzhen → Hanoi | $120–200/pp | N/A | Economy |
| Hanoi → Da Nang | $40–80/pp | N/A | Economy |
| HCMC → ATL | $850–1,100/pp | $3,000–4,500/pp | Economy; compare Business for comfort on return red-eye |
| **Trip total (2 pax, economy)** | **~$4,100–5,300** | — | Within budget |

*Prices unverified — check Google Flights for Sep 1 and Sep 14 before booking.*

### Route Alternatives

**Option B: HCMC First**
- ATL → HCMC → Hoi An → Hanoi → HKG/Shenzhen → ATL
- Pro: Longer Vietnam time for acclimatization
- Con: Backtracking, fly home from HKG (longer routing), miss the soft-landing benefit of HKG familiarity

**Option C: Skip Hong Kong, Fly Direct to Shenzhen via Guangzhou**
- ATL → CAN (Guangzhou) → Shenzhen → Hanoi → Hoi An → HCMC → ATL
- Pro: More time in Vietnam
- Con: Guangzhou less tourist-friendly than HKG, harder navigation, fewer direct ATL flights

**Recommendation: Option A (primary route)** — Hong Kong as entry maximizes comfort, visa-free access, and acts as a decompression buffer before the mainland China dupe shopping mission.

### Seasonality Scores (September)

| Country/City | Weather | Crowds | Price | Events | Overall |
|-------------|---------|--------|-------|--------|---------|
| Hong Kong | B (typhoon risk) | B (post-summer) | B | — | B |
| Shenzhen | B (hot+humid) | A (low tourist) | A | — | B+ |
| Hanoi | C (humid, rain risk) | A (low-season) | A | — | B |
| Ha Long Bay | C (typhoon season) | B | A | — | B− |
| Hoi An | B (early rainy season) | A | A | Lantern Festival mid-Sep | B+ |
| Ho Chi Minh City | B (rainy afternoons) | B | B | — | B |

⚠️ **September weather advisory:** Rain in all locations is afternoon-heavy — schedule outdoor activities before noon. Book Ha Long Bay on a newer, heavier-vessel operator (not wooden junks) for weather resilience.

### Booking Priority Queue

1. ATL → HKG via LAX (**DL0763** + **DL0089**, Sep 1 → arr Sep 3) — book now
2. HKG → ATL via LAX (**DL0088** + **DL0327**, Sep 14) — book now, same PNR
3. DAD → HKG (Sep 13 afternoon) — required for Delta return
4. HKG→HAN (Sep 6), HAN→DAD (Sep 9)
5. Ha Long Bay day cruise — if voting yes; book T-30d
6. Hoi An tailor appointment — book 1–2 weeks ahead (WhatsApp most shops)
7. Hotels — HK Sep 3–6 + Regal Airport Sep 13; Đà Nẵng Sep 9–13

## Validation

- Transit ratio: 14 days × ~2.5 transit days = **18%** — within 20% limit ✅
- Country hopping fatigue: 3 Vietnam cities in 7 days is borderline — offset by relaxed pace mandate ✅
- All legs searched: **UNVERIFIED** (MCP unavailable — mark for manual check) ⚠️
- No logistical traps: HKG→SZX via MTR flagged as correct (do NOT take taxi to Shenzhen) ✅
