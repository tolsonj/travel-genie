---
step: "02-route-optimization"
title: "Route Optimization"
trip: "china-vietnam-2026"
created: 2026-06-03
depends_on:
  - "[[profile]]"
  - "[[01-traveler-profile]]"
tags:
  - travel-planning
  - route
---

# Route Optimization

## Reasoning

**Profile anchor**: Fly into **Hong Kong (HKG)** — not Beijing. Route must honor open-jaw logic: **HKG in → Đà Nẵng (DAD) out**.

**Country order**: Hong Kong + short **mainland China** (Guangzhou) first, then **Vietnam** as wind-down with resort splurge. Rationale: (1) tackle dual immigration (HK visa-free + mainland L visa) while fresh; (2) Guangzhou is 47 min from West Kowloon by high-speed rail — no extra flight within China; (3) Vietnam beach/resort matches “late brunch + beach walk + city nature views” perfect-day template.

**Why Guangzhou over Beijing**: 14 days relaxed — Beijing alone needs 5+ nights and fights the HKG entry. Guangzhou delivers Cantonese food, Pearl River views, Shamian history, and **world-class tailoring/shopping** (White Swan, Taikoo Hui) with minimal transit.

**Vietnam**: Unchanged strong fit — **Hanoi (2 nights)** + **Đà Nẵng/Hội An resort base (5 nights)**. Splurge budget concentrates on 4–5★ beach resort (Marriott/Pullman/InterContinental on Mỹ Khê).

**September**: HK/GZ humid but manageable; Vietnam central coast typhoon risk — flexible resort bookings + insurance.

**Transit**: Prefer **MTR + high-speed rail + Grab**; avoid unmetered taxis per profile.

## Output

### Recommended Route

```
Home → Hong Kong (HKG) [3 nights]
→ High-speed rail: West Kowloon → Guangzhou South [2 nights mainland]
→ Flight: Guangzhou (CAN) → Hanoi (HAN) [~2.5 hrs]
→ [2 nights Hanoi]
→ Flight: Hanoi → Đà Nẵng (DAD) [~1.25 hrs]
→ [5 nights Đà Nẵng beach resort — day trips to Hội An]
→ Flight: Đà Nẵng → Home (open-jaw)
```

**Open-jaw**: Fly **into HKG**, fly **out of DAD**. Eliminates backtracking through China.

### Day Allocation Table

| Segment | Dates | Nights | Type | Notes |
|---------|-------|--------|------|-------|
| **Arrival** | Sept 1 | — | Soft | HKG; jet lag; evening harbour walk |
| **Hong Kong** | Sept 1–3 | 3 | Explore | Peak, Stanley, Central/TST shopping, dim sum |
| **Guangzhou** | Sept 4–5 | 2 | Explore | Shamian, Chen Clan Academy, Pearl River evening |
| **Transit** | Sept 6 | — | Soft | CAN → HAN; evening Hanoi check-in |
| **Hanoi** | Sept 6–7 | 2 | Culture/food | Old Quarter, Temple of Literature |
| **Transit** | Sept 8 AM | 0.5 | Soft | HAN → DAD; resort by afternoon |
| **Đà Nẵng / Hội An** | Sept 8–13 | 5 | Resort | Beach, tailors, My Son, Marble Mountains |
| **Departure** | Sept 14 | — | Buffer | DAD international |

**Transit ratio**: ~2.5 transit-equivalent days / 14 = **18%** — under 20% ✓

### Transit Methods

| Leg | Mode | Time | Notes |
|-----|------|------|-------|
| Home → HKG | Flight | 15–18 hrs (US) | Book 2–3 months ahead |
| HK → Guangzhou | High-speed rail | ~47 min | West Kowloon Station; book via Trip.com / MTR |
| Guangzhou → Hanoi | Flight | ~2.5 hrs | China Southern, Vietnam Airlines |
| Hanoi → Đà Nẵng | Flight | ~1.25 hrs | VietJet, Vietnam Airlines |
| Đà Nẵng → Home | Flight | 15–20 hrs | Via ICN, TPE, or SIN |

### Logistical Traps

1. **HK ≠ mainland**: Separate immigration; carry printed mainland visa; clear HK exit + China entry at West Kowloon joint checkpoint.
2. **VPN before China segment**: Google/Grab/WhatsApp blocked on mainland — download **Baidu Maps**, **DiDi**, VPN before Guangzhou.
3. **Hội An from resort**: Stay **Mỹ Khê beach resort** in Đà Nẵng; day-trip Hội An (30 min Grab) — Hội An inland hotels have no beach.
4. **Heat + crowds**: Schedule outdoor HK/GZ before 10:30 AM; Vietnam resort midday = AC/pool.
5. **Typhoon corridor**: Đà Nẵng Sept — watch forecasts; flexible domestic flights.

### Alternative Routes

#### Option B: HK only (no mainland)
- **Trade-off**: Simpler visas; less “mainland China” depth
- **Best for**: If mainland visa delayed; still strong shopping/food in HK

#### Option C: HK + Shenzhen day trip (no overnight mainland)
- **Trade-off**: Same-day rail to Shenzhen for shopping; lighter than Guangzhou stay
- **Downside**: Less history/food depth than 2-night Guangzhou

### Booking Priority Queue

1. **Open-jaw flights** — Home → HKG, return from DAD (book first)
2. **Guangzhou → Hanoi** + **Hanoi → Đà Nẵng** (same booking session)
3. **West Kowloon → Guangzhou South** rail (Sept 4)
4. **Đà Nẵng 5★ resort** (splurge — Marriott/Pullman/Fusion)
5. **Hong Kong hotels** — TST or Central (Peninsula, Mandarin Oriental, Hyatt Centric)
6. **Hội An tailor** — WhatsApp ahead for fittings Days 10–12

## Validation

- [x] Transit 18% < 20% — **PASS**
- [x] Honors **HKG entry** from profile — **PASS**
- [x] Crowds: avoid peak Victoria Peak 2–5 PM; Hội An before 10 AM — **PASS**
- [x] Heat: morning outdoor blocks; resort midday Vietnam — **PASS**
- [x] Relaxed pace: max 2 China hubs + 2 Vietnam hubs — **PASS**
