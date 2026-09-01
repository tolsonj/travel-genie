---
step: "02-route-optimization"
title: "Route Optimization"
trip: "los-cabos"
created: 2026-08-04
depends_on:
  - "[[profile]]"
  - "[[01-traveler-profile]]"
tags: [travel-planning, route]
---

# Route Optimization

## Reasoning

Single-country, single-hub trip — the simplest route geometry. **ATL ↔ SJD** round trip with **7 consecutive nights** in the Los Cabos corridor eliminates inter-city flights, baggage re-checks, and hub-change fatigue. The corridor itself spans ~20 mi (32 km) from San José del Cabo (history, Art District, quieter beaches) to Cabo San Lucas (Arch, marina, nightlife) — easily covered by Uber/shuttle without changing hotels.

**Day allocation:** Aug 7 soft arrival; Aug 8 San José historic/Art prep; Aug 9 nature/golf fork; Aug 10 Arch + desert hike; Aug 11 Audrey birthday; Aug 12 adult activities; Aug 13 departure. No internal relocation days.

**Transit ratio:** 7 calendar days on ground, ~0.5 day airport transit each end = **~14%** of trip time — well under 20% limit. Even adding a Todos Santos day trip adds only ~3 hr round-trip driving, not an overnight.

**Flights already booked:** Profile confirms tickets held — no live MCP search. Placeholder times in [[04-master-itinerary]] until user provides PNR/schedule.

**August seasonality:** Hot and dry; hurricane tail possible. Schedule outdoor early AM; pool midday. Cabo Pulmo (2 hr east) is best as a full-day Sun fork; golf courses prefer dawn tee times.

## Output

### Recommended Route

```
ATL → SJD → Los Cabos corridor (7 nights, single base) → SJD → ATL
```

**Base:** Inspirato property per [[profile]] — corridor location determines daily drive times (typically 15–40 min to either town).

### Day Allocation

| Day | Date | Focus | Anchor |
|-----|------|-------|--------|
| 1 | Fri Aug 7 | **Soft arrival** | Pool, late dinner, unpack |
| 2 | Sat Aug 8 | San José del Cabo | Historic district + gallery stroll |
| 3 | Sun Aug 9 | Nature OR golf | **Vote:** Cabo Pulmo snorkel vs desert hike vs golf |
| 4 | Mon Aug 10 | Cabo San Lucas | Arch boat tour + Mt Solmar hike |
| 5 | Tue Aug 11 | **Audrey birthday** | Spa + Flora's/Edith's + sunset sail |
| 6 | Wed Aug 12 | Adult activities | Tequila tasting / cooking class; kids beach |
| 7 | Thu Aug 13 | Departure | Checkout, SJD → ATL |
| **Total** | **7 nights** | Single base | 0 domestic flights |

### Flight Legs

| Leg | Route | Mode | Status |
|-----|-------|------|--------|
| 1 | ATL → SJD | Flight | **BOOKED** — Main cabin, 4 pax |
| 2 | SJD → ATL | Flight | **BOOKED** — Main cabin, 4 pax |

### Flights — ALREADY BOOKED

| Detail | Value |
|--------|-------|
| Status | **BOOKED** — user holds tickets (per [[profile]]) |
| Route | ATL ↔ SJD round trip |
| Passengers | 4 (John, Audrey, Denver, Kennedy) |
| Cabin | Main |
| Outbound | **ATL → SJD** dep **TBD** arr **TBD MDT** (Aug 7) |
| Return | **SJD → ATL** dep **TBD** arr **TBD EDT** (Aug 13) |
| MCP search | **Skipped** — tickets already purchased |
| Action | User to paste confirmed times/PNR into [[04-master-itinerary]] |

*Typical ATL→SJD nonstop ~4 hr 30 min; common carriers: Delta, Southwest. Verify actual flight numbers from confirmation email.*

### Transit Ratio

| Metric | Value |
|--------|-------|
| Total trip days | 7 (Aug 7–13) |
| Transit days | ~1 (partial arrival + partial departure) |
| Effective transit | **~14%** |
| Limit | ≤ 20% |
| Verdict | **Pass** |

### Route Alternatives

**Option B: Add Todos Santos Day Trip (Aug 9 or Aug 12)**
- Same base; ~1 hr drive each way to Todos Santos (bohemian town, Hotel California lore, art galleries, beach)
- Pro: History + food + cooler microclimate; breaks corridor routine
- Con: Full day in car; less pool time; daughters may prefer beach
- **Vote:** Swap for Sun nature day OR add as Wed adult/kids split (parents Todos Santos lunch, kids resort)

**Option C: Stay Corridor-Only (Max Pool / Min Driving)**
- Skip Todos Santos and Cabo Pulmo; double down on San José + Cabo San Lucas + resort amenities
- Pro: Lowest transit, best heat management, fits $8K budget
- Con: Miss Baja east-coast snorkeling and pueblo charm
- **Vote:** Recommended if Aug 9 golf wins over Cabo Pulmo

**Recommendation:** **Primary route (Option A)** — corridor base with **Aug 9 vote** between golf (Jack) and Cabo Pulmo (family nature). Todos Santos only if pool-fatigue vote wins on Aug 12.

### Seasonality Scores (August 2026)

| Location | Weather | Crowds | Price | Events | Overall |
|----------|---------|--------|-------|--------|---------|
| San José del Cabo | C (hot) | B (moderate) | B (summer rates) | Art Walk Thu evenings | B |
| Cabo San Lucas | C (hot) | B+ (cruise mornings) | B | — | B− |
| Corridor resorts | C (hot) | B | B | — | B |
| Cabo Pulmo (day trip) | C (hot + drive) | A (low) | A | — | B+ |
| Todos Santos (day trip) | B (slightly cooler) | B | A | — | B+ |

⚠️ **August advisory:** Book Arch boats for **7 AM departure**. Afternoon thunderstorms possible Aug 10–12 — flexible cancellation preferred.

### Booking Priority Queue

| Priority | Item | When | Notes |
|----------|------|------|-------|
| ~~1~~ | ~~ATL ↔ SJD flights~~ | — | **BOOKED** |
| ~~2~~ | ~~Inspirato lodging~~ | — | **BOOKED** — [[profile]] |
| 3 | Airport → resort shuttle | Now | Confirm with Inspirato or pre-book |
| 4 | Arch boat tour (Aug 10) | T-21d (Jul 17) | Cabo Adventures or Tropicat — 7 AM slot |
| 5 | Audrey birthday dinner (Aug 11) | T-14d (Jul 28) | Flora's Field Kitchen or Edith's |
| 6 | Spa appointments (Aug 11) | T-7d (Aug 4) | Resort spa or Spa Baja |
| 7 | Sunset sail (Aug 11 eve) | T-14d | Cabo Sails or similar — private-ish |
| 8 | Golf tee time OR Cabo Pulmo tour (Aug 9) | T-14d | Vote first |
| 9 | Tequila tasting / cooking class (Aug 12) | T-7d | Los Cabos Tequila Tasting or Mi Casa |
| 10 | Travel insurance (4 travelers) | Before Aug 7 | Hurricane tail coverage |

## Validation

| Check | Result |
|-------|--------|
| Transit ratio ≤ 20%? | **Pass** — ~14% |
| Single base, no unnecessary moves? | **Pass** |
| Flights marked BOOKED, no MCP? | **Pass** |
| Day allocation matches 7 nights? | **Pass** — Aug 7–13 |
| Alternatives documented with vote forks? | **Pass** |
| Booking queue ordered by urgency? | **Pass** |
| Downstream links to [[04-master-itinerary]]? | **Pass** |
