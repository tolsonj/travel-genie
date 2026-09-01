/** 14-day China → Vietnam gantt data (from china-vietnam-gantt canvas). */
export const PHASE_META = {
  china: { banner: "CHINA  ·  BEIJING  ·  Sept 1 – 6  ·  5 nights", color: "#2E79B5" },
  hanoi: { banner: "VIETNAM  ·  HANOI  ·  Sept 6 – 8  ·  2 nights", color: "#1F8A65" },
  danang: { banner: "VIETNAM  ·  DA NANG / HOI AN  ·  Sept 8 – 14  ·  5 nights", color: "#C06028" }
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
    "day": 1,
    "date": "Sept 1",
    "dow": "Tue",
    "location": "Beijing",
    "phase": "china",
    "activities": [
      {
        "label": "PEK Arrival + Transfer",
        "start": 11,
        "end": 15.5,
        "type": "transit"
      },
      {
        "label": "Check-in + Rest",
        "start": 15.5,
        "end": 17.5,
        "type": "rest"
      },
      {
        "label": "Wangfujing Stroll",
        "start": 17.5,
        "end": 19.5,
        "type": "cultural"
      },
      {
        "label": "Peking Duck Dinner",
        "start": 20,
        "end": 22,
        "type": "food"
      }
    ],
    "wow": "Forbidden City gates lit at dusk — first glimpse of Beijing"
  },
  {
    "day": 2,
    "date": "Sept 2",
    "dow": "Wed",
    "location": "Beijing",
    "phase": "china",
    "activities": [
      {
        "label": "Forbidden City",
        "start": 8.5,
        "end": 12,
        "type": "landmark"
      },
      {
        "label": "Jingshan Park",
        "start": 12,
        "end": 13,
        "type": "cultural"
      },
      {
        "label": "Nanluoguxiang Hutong",
        "start": 13,
        "end": 17,
        "type": "cultural"
      },
      {
        "label": "Hutong Dinner",
        "start": 19,
        "end": 21,
        "type": "food"
      }
    ],
    "wow": "Golden rooftops of Forbidden City from Jingshan Hill"
  },
  {
    "day": 3,
    "date": "Sept 3",
    "dow": "Thu",
    "location": "Beijing",
    "phase": "china",
    "activities": [
      {
        "label": "Drive to Mutianyu",
        "start": 6.5,
        "end": 8.5,
        "type": "transit"
      },
      {
        "label": "Great Wall — Mutianyu",
        "start": 9,
        "end": 14,
        "type": "landmark"
      },
      {
        "label": "Return + Rest",
        "start": 14,
        "end": 17,
        "type": "transit"
      },
      {
        "label": "Da Dong Peking Duck",
        "start": 19,
        "end": 21,
        "type": "food"
      }
    ],
    "wow": "Unreconstructed Wall beyond Tower 14 — nearly empty, dramatic views"
  },
  {
    "day": 4,
    "date": "Sept 4",
    "dow": "Fri",
    "location": "Beijing",
    "phase": "china",
    "activities": [
      {
        "label": "Temple of Heaven",
        "start": 9,
        "end": 11,
        "type": "landmark"
      },
      {
        "label": "Qianmen Street",
        "start": 11,
        "end": 13,
        "type": "shopping"
      },
      {
        "label": "Sanlitun Shopping",
        "start": 14,
        "end": 18,
        "type": "shopping"
      },
      {
        "label": "Jing A + Rooftop Bar",
        "start": 19,
        "end": 22,
        "type": "food"
      }
    ],
    "wow": "Echoing Wall whisper — physics at 1420 AD scale"
  },
  {
    "day": 5,
    "date": "Sept 5",
    "dow": "Sat",
    "location": "Beijing",
    "phase": "china",
    "activities": [
      {
        "label": "Summer Palace",
        "start": 9,
        "end": 12,
        "type": "landmark"
      },
      {
        "label": "Pack + Hotel",
        "start": 12,
        "end": 14.5,
        "type": "rest"
      },
      {
        "label": "Last Beijing Shopping",
        "start": 14.5,
        "end": 16.5,
        "type": "shopping"
      },
      {
        "label": "Airport Transfer",
        "start": 18,
        "end": 20,
        "type": "transit"
      }
    ],
    "wow": "Rowboat on Kunming Lake — pagodas perfectly reflected in still water"
  },
  {
    "day": 6,
    "date": "Sept 6",
    "dow": "Sun",
    "location": "BJS → HAN",
    "phase": "china",
    "isTransit": true,
    "activities": [
      {
        "label": "Beijing Morning",
        "start": 9,
        "end": 12,
        "type": "cultural"
      },
      {
        "label": "PEK → HAN  (~4 hrs)",
        "start": 13,
        "end": 17,
        "type": "transit"
      },
      {
        "label": "Hoan Kiem + Pho",
        "start": 19,
        "end": 21.5,
        "type": "cultural"
      }
    ],
    "wow": "Hoan Kiem Lake glowing at night — first moments in Vietnam"
  },
  {
    "day": 7,
    "date": "Sept 7",
    "dow": "Mon",
    "location": "Hanoi",
    "phase": "hanoi",
    "activities": [
      {
        "label": "Hoan Kiem + Ngoc Son",
        "start": 8.5,
        "end": 10.5,
        "type": "cultural"
      },
      {
        "label": "Old Quarter Walk",
        "start": 10.5,
        "end": 13,
        "type": "cultural"
      },
      {
        "label": "Temple of Literature",
        "start": 13,
        "end": 16,
        "type": "landmark"
      },
      {
        "label": "Night Market / Beer St",
        "start": 19,
        "end": 22,
        "type": "cultural"
      }
    ],
    "wow": "Temple of Literature at golden hour — 1000-year-old courtyards"
  },
  {
    "day": 8,
    "date": "Sept 8",
    "dow": "Tue",
    "location": "HAN → DAD",
    "phase": "hanoi",
    "isTransit": true,
    "activities": [
      {
        "label": "Ho Chi Minh Mausoleum",
        "start": 8,
        "end": 10,
        "type": "cultural"
      },
      {
        "label": "HAN → DAD  (~1.25 hrs)",
        "start": 11,
        "end": 13,
        "type": "transit"
      },
      {
        "label": "Resort Check-in",
        "start": 14,
        "end": 16,
        "type": "rest"
      },
      {
        "label": "Beach Walk + Dinner",
        "start": 18,
        "end": 20.5,
        "type": "beach"
      }
    ],
    "wow": "First My Khe Beach sunset — 20 km of white sand, virtually empty"
  },
  {
    "day": 9,
    "date": "Sept 9",
    "dow": "Wed",
    "location": "Da Nang",
    "phase": "danang",
    "activities": [
      {
        "label": "Marble Mountains",
        "start": 9,
        "end": 11,
        "type": "landmark"
      },
      {
        "label": "Resort Pool + Beach",
        "start": 12,
        "end": 15,
        "type": "beach"
      },
      {
        "label": "My Khe Beach Walk",
        "start": 16,
        "end": 18,
        "type": "beach"
      },
      {
        "label": "Seafood Dinner",
        "start": 19,
        "end": 21,
        "type": "food"
      }
    ],
    "wow": "Buddhist shrines inside limestone caves, lit by natural sky-holes"
  },
  {
    "day": 10,
    "date": "Sept 10",
    "dow": "Thu",
    "location": "Hoi An",
    "phase": "danang",
    "activities": [
      {
        "label": "Ancient Town",
        "start": 8,
        "end": 10,
        "type": "cultural"
      },
      {
        "label": "Tailor Consultation",
        "start": 10,
        "end": 12,
        "type": "shopping"
      },
      {
        "label": "Cao Lau Lunch",
        "start": 12,
        "end": 13,
        "type": "food"
      },
      {
        "label": "Old Town + Market",
        "start": 14,
        "end": 17,
        "type": "cultural"
      },
      {
        "label": "Lantern-lit Old Town",
        "start": 17,
        "end": 21,
        "type": "cultural"
      }
    ],
    "wow": "Hoi An under silk lanterns at night — unlike anywhere in Asia"
  },
  {
    "day": 11,
    "date": "Sept 11",
    "dow": "Fri",
    "location": "Da Nang",
    "phase": "danang",
    "activities": [
      {
        "label": "Tailor Fitting",
        "start": 9,
        "end": 11,
        "type": "shopping"
      },
      {
        "label": "Son Tra Peninsula",
        "start": 11,
        "end": 13,
        "type": "landmark"
      },
      {
        "label": "Resort + Pool",
        "start": 13,
        "end": 17,
        "type": "beach"
      },
      {
        "label": "Sky 36 Rooftop Bar",
        "start": 20,
        "end": 22,
        "type": "food"
      }
    ],
    "wow": "Wild douc langurs spotted at Son Tra — Asia's most beautiful primates"
  },
  {
    "day": 12,
    "date": "Sept 12",
    "dow": "Sat",
    "location": "My Son",
    "phase": "danang",
    "activities": [
      {
        "label": "My Son Sanctuary",
        "start": 7.5,
        "end": 10.5,
        "type": "landmark"
      },
      {
        "label": "Tailor Pickup",
        "start": 10.5,
        "end": 12,
        "type": "shopping"
      },
      {
        "label": "White Rose Lunch",
        "start": 12,
        "end": 13,
        "type": "food"
      },
      {
        "label": "Resort Beach",
        "start": 13,
        "end": 17,
        "type": "beach"
      }
    ],
    "wow": "My Son at dawn in morning mist — Angkor vibes without the crowds"
  },
  {
    "day": 13,
    "date": "Sept 13",
    "dow": "Sun",
    "location": "Da Nang",
    "phase": "danang",
    "activities": [
      {
        "label": "Sunrise Beach Walk",
        "start": 7,
        "end": 9,
        "type": "beach"
      },
      {
        "label": "My Khe Final Beach",
        "start": 9,
        "end": 13,
        "type": "beach"
      },
      {
        "label": "Mall Shopping",
        "start": 14,
        "end": 17,
        "type": "shopping"
      },
      {
        "label": "NON La Farewell Dinner",
        "start": 19,
        "end": 21,
        "type": "food"
      }
    ],
    "wow": "Final sunset on My Khe Beach — the perfect last day"
  },
  {
    "day": 14,
    "date": "Sept 14",
    "dow": "Mon",
    "location": "Departure",
    "phase": "danang",
    "isTransit": true,
    "activities": [
      {
        "label": "Checkout + Buffer",
        "start": 9,
        "end": 11.5,
        "type": "rest"
      },
      {
        "label": "DAD Airport",
        "start": 11.5,
        "end": 14,
        "type": "transit"
      },
      {
        "label": "Flight Home",
        "start": 14,
        "end": 23,
        "type": "transit"
      }
    ],
    "wow": "Adventure complete — homeward bound with stories and custom suits"
  }
];
