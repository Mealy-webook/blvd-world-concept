// ── campaign data ──────────────────────────────────────────────
window.WBK = {
  messages: [
    "Every night at BLVD World feels like magic!",
    "Home is wherever the Boulevard lights are.",
    "Bigger and closer to imagination. Always.",
    "One ticket. A thousand memories.",
    "We don't visit BLVD World. We live it.",
    "See you under the ferris wheel. 💜",
  ],

  stickers: ["💜", "⭐", "🎟️", "🎆", "🌙", "🎶"],

  // ── the fourteen rides ──────────────────────────────────────────
  // Photography is representative BLVD World imagery, not a shot of each ride.
  // `reg` and `fast` are the single-ride prices, regular queue and fast track.
  // THESE ARE PLACEHOLDERS. The only rate card we have covers the five ride
  // packages, so these are scaled from it: Value Deal is SAR 89 for 5 rides
  // (17.80 each) and Unlimited Regular 199 against Unlimited Fast 349 puts fast
  // track at 1.75x. Replace the two numbers on each line with the real ones.
  rides: [
    { name: "Wave Swinger",     kind: "FAMILY SWING", img: "wave-swinger.jpg", reg: 20, fast: 35 },
    { name: "Turbo 360",        kind: "THRILL",       img: "turbo-360.jpg", reg: 30, fast: 50 },
    { name: "Drop and Twist",   kind: "THRILL",       img: "drop-and-twist.jpg", reg: 30, fast: 50 },
    { name: "Carousel",         kind: "FAMILY",       img: "carousel.jpg", reg: 15, fast: 25 },
    { name: "Sky Loop",         kind: "THRILL",       img: "sky-loop.jpg", reg: 30, fast: 50 },
    { name: "Enjoy The Flight", kind: "AERIAL",       img: "enjoy-the-flight.jpg", reg: 30, fast: 50 },
    { name: "Cable Cars",       kind: "SCENIC",       img: "cable-cars.jpg", reg: 15, fast: 25 },
    { name: "Taxi Mania",       kind: "FAMILY",       img: "taxi-mania.jpg", reg: 15, fast: 25 },
    { name: "Convoy Figure 8",  kind: "FAMILY",       img: "convoy-figure-8.jpg", reg: 15, fast: 25 },
    { name: "View Tower",       kind: "SCENIC",       img: "view-tower.jpg", reg: 15, fast: 25 },
    { name: "Super Fly",        kind: "THRILL",       img: "super-fly.jpg", reg: 30, fast: 50 },
    { name: "Amazonia Awakens", kind: "ADVENTURE",    img: "amazonia-awakens.jpg", reg: 20, fast: 35 },
    { name: "Dragons Fury",     kind: "THRILL",       img: "dragons-fury.jpg", reg: 30, fast: 50 },
    { name: "Air Max",          kind: "THRILL",       img: "air-max.jpg", reg: 30, fast: 50 },
  ],


  // park experiences grouped by zone, from the same sheet
  parkExperiences: [
    { zone: "Africa",     items: ["Lion Exp", "Giraffe Exp", "Bird Nest Exp", "Lemur Catta Exp", "Forest Exp", "Tours Exp"] , img: "park1.jpg" },
    { zone: "Warzone",    items: ["Battle Dome", "Line of Fire", "Shotgun Range", "Topshot", "Battle Cart", "War Castle"] , img: "park4.jpg" },
    { zone: "The Planet", items: ["The Dome Cinema", "Meta World", "Dolphinarium", "Swimming with Dolphins"] , img: "park3.jpg" },
    { zone: "Egypt",      items: ["Escape Room: Secret of the Pharaoh", "The Lost Museum", "PUBG"] , img: "egypt.jpg" },
    { zone: "Italy",      items: ["Midnight Manor"] , img: "italy.jpg" },
    { zone: "Mexico",     items: ["Doll Maker"] , img: "mexico.jpg" },
    { zone: "Courchevel", items: ["Skiing School"] , img: "park8.jpg" },
    { zone: "Pier",       items: ["Coco Melon Exp"] , img: "park7.jpg" },
    { zone: "T\u00fcrkiye",  items: ["Oasis"] , img: "turkey.jpg" },
    { zone: "Iran",       items: ["Pac-Man"] , img: "park5.jpg" },
  ],

  // dining highlights, one per zone
  restaurants: [
    { name: "Najd Grill House",      zone: "Saudi Arabia", cuisine: "SAUDI",     img: "saudi.jpg", food: "najd-grill.webp",  from: 85, desc: "Kabsa, mandi and mixed grills in a Najdi mud-brick courtyard." },
    { name: "Nile Terrace",          zone: "Egypt",        cuisine: "EGYPTIAN",  img: "egypt.jpg", food: "nile.webp",  from: 70, desc: "Koshari and grilled kofta with the pyramid lit behind you." },
    { name: "Uzung\u00f6l Restaurant", zone: "T\u00fcrkiye", cuisine: "TURKISH",   img: "turkey.jpg", food: "uzungol.webp", from: 90, desc: "Mezze, kebabs and shisha on a lantern-lit terrace." },
    { name: "Le Petit Bistro",       zone: "France",       cuisine: "FRENCH",    img: "france.jpg", food: "petit-bistro.webp", from: 95, desc: "Cr\u00eapes, steak frites and coffee under the tower." },
    { name: "Trattoria Bella",       zone: "Italy",        cuisine: "ITALIAN",   img: "italy.jpg", food: "trattoria.webp",  from: 80, desc: "Wood-fired pizza and gelato beside the Grand Canal." },
    { name: "Dim Sum Palace",        zone: "China",        cuisine: "CHINESE",   img: "china.jpg", food: "dimsum.webp",  from: 75, desc: "Steamer baskets and noodle bowls under the red pagoda." },
    { name: "Ramen Yokocho",         zone: "Japan",        cuisine: "JAPANESE",  img: "japan.jpg", food: "ramen.webp",  from: 65, desc: "A narrow alley of ramen counters and taiyaki stands." },
    { name: "Route 66 Diner",        zone: "United States",cuisine: "AMERICAN",  img: "usa.jpg", food: "route66.webp",    from: 60, desc: "Chrome booths, burgers and milkshakes till late." },
    { name: "Cantina Azteca",        zone: "Mexico",       cuisine: "MEXICAN",   img: "mexico.jpg", food: "azteca.webp", from: 70, desc: "Tacos and horchata below the crimson pyramid." },
    { name: "Tagine House",          zone: "Morocco",      cuisine: "MOROCCAN",  img: "park5.jpg", food: "tagine.webp",  from: 80, desc: "Slow-cooked tagines and mint tea in a riad courtyard." },
    { name: "Korean BBQ House",      zone: "South Korea",  cuisine: "KOREAN",    img: "park6.jpg", food: "koreanbbq.webp",  from: 110, desc: "Tabletop grills, banchan and bingsu for dessert." },
    { name: "Taverna Blue",          zone: "Greece",       cuisine: "GREEK",      img: "park7.jpg", food: "taverna.webp",  from: 85, desc: "Gyros, grilled halloumi and Aegean-blue shutters." },
  ],

  showsByZone: [
    { zone: "Saudi Arabia", items: [{ n: "Welcoming Roamers", t: "8:30", ap: "PM", m: 10, ty: "ROAMING" }, { n: "Majas / Traditional Learning / Storyteller", t: "9:00", ap: "PM", m: 15, ty: "ROAMING / STAGE" }, { n: "Welcoming Roamers", t: "9:40", ap: "PM", m: 10, ty: "ROAMING" }, { n: "Majas / Traditional Learning / Storyteller", t: "10:20", ap: "PM", m: 15, ty: "ROAMING / STAGE" }, { n: "Mesaharati", t: "10:45", ap: "PM", m: 15, ty: "ROAMING" }, { n: "Welcoming Roamers", t: "11:10", ap: "PM", m: 10, ty: "ROAMING" }, { n: "Majas / Traditional Learning / Storyteller", t: "12:10", ap: "AM", m: 15, ty: "ROAMING / STAGE" }, { n: "Mesaharati", t: "12:40", ap: "AM", m: 15, ty: "ROAMING" }] },
    { zone: "Egypt", items: [{ n: "Full Parade", t: "8:30", ap: "PM", m: 15, ty: "ROAMING" }, { n: "Egyptian Servants", t: "9:05", ap: "PM", m: 15, ty: "ROAMING" }, { n: "Greeting Parade", t: "9:25", ap: "PM", m: 15, ty: "ROAMING" }, { n: "Cleopatra", t: "9:45", ap: "PM", m: 15, ty: "ROAMING" }, { n: "Greeting Parade", t: "10:05", ap: "PM", m: 15, ty: "ROAMING" }, { n: "Egyptian Servants", t: "10:25", ap: "PM", m: 15, ty: "ROAMING" }, { n: "Cleopatra", t: "11:00", ap: "PM", m: 15, ty: "ROAMING" }, { n: "Mesaharati", t: "11:20", ap: "PM", m: 15, ty: "ROAMING" }, { n: "Full Parade", t: "11:45", ap: "PM", m: 15, ty: "ROAMING" }] },
    { zone: "Türkiye", items: [{ n: "Turkish Rovers", t: "8:30", ap: "PM", m: 15, ty: "ROAMING" }, { n: "Turkish Folkloric Dance", t: "8:45", ap: "PM", m: 15, ty: "ROAMING" }, { n: "Turkish Folkloric Dance", t: "9:00", ap: "PM", m: 15, ty: "ROAMING" }, { n: "Turkish Folkloric Dance", t: "9:25", ap: "PM", m: 15, ty: "ROAMING" }, { n: "Turkish Rovers", t: "10:30", ap: "PM", m: 15, ty: "ROAMING" }, { n: "Turkish Folkloric Dance", t: "11:00", ap: "PM", m: 15, ty: "ROAMING" }, { n: "Turkish Rovers", t: "11:15", ap: "PM", m: 15, ty: "DANCE" }, { n: "Turkish Folkloric Dance", t: "11:30", ap: "PM", m: 15, ty: "ROAMING" }, { n: "Turkish Folkloric Dance", t: "12:30", ap: "AM", m: 15, ty: "ROAMING" }, { n: "Turkish Folkloric Dance", t: "12:45", ap: "AM", m: 15, ty: "ROAMING" }] },
    { zone: "France", items: [{ n: "Eiffel Gentalmens", t: "8:30", ap: "PM", m: 15, ty: "ROAMING" }, { n: "Parisian Tourists", t: "9:45", ap: "PM", m: 15, ty: "ROAMING" }, { n: "French Mime", t: "10:15", ap: "PM", m: 15, ty: "ROAMING" }, { n: "Eiffel Gentalmens", t: "11:00", ap: "PM", m: 15, ty: "ROAMING" }, { n: "French Mime", t: "11:35", ap: "PM", m: 15, ty: "ROAMING" }, { n: "Parisian Tourists", t: "12:00", ap: "AM", m: 15, ty: "ROAMING" }, { n: "Eiffel Gentalmens", t: "12:30", ap: "AM", m: 15, ty: "ROAMING" }] },
    { zone: "Italy", items: [{ n: "Venetian Masquerade", t: "8:30", ap: "PM", m: 15, ty: "ROAMING" }, { n: "Italian Rhythms Of Tradition", t: "9:00", ap: "PM", m: 15, ty: "ROAMING" }, { n: "Venetian Masquerade", t: "9:30", ap: "PM", m: 15, ty: "ROAMING" }, { n: "Italian Rhythms Of Tradition", t: "10:00", ap: "PM", m: 15, ty: "ROAMING" }, { n: "Venetian Masquerade", t: "10:30", ap: "PM", m: 15, ty: "ROAMING" }, { n: "Italian Rhythms Of Tradition", t: "11:00", ap: "PM", m: 15, ty: "ROAMING" }, { n: "Venetian Masquerade", t: "11:30", ap: "PM", m: 15, ty: "ROAMING" }, { n: "Italian Rhythms Of Tradition", t: "12:00", ap: "AM", m: 15, ty: "ROAMING" }, { n: "Venetian Masquerade", t: "12:30", ap: "AM", m: 15, ty: "ROAMING" }] },
    { zone: "Spain", items: [{ n: "Traditional Spain Roaming", t: "8:30", ap: "PM", m: 15, ty: "ROAMING" }, { n: "Traditional Spain Roaming", t: "9:30", ap: "PM", m: 15, ty: "ROAMING" }, { n: "Spain Roaming", t: "10:10", ap: "PM", m: 15, ty: "ROAMING" }, { n: "Spain Roaming & Couple", t: "10:45", ap: "PM", m: 15, ty: "ROAMING" }, { n: "Traditional Spain Roaming", t: "11:45", ap: "PM", m: 15, ty: "ROAMING" }, { n: "Spain Roaming & Couple", t: "12:15", ap: "AM", m: 15, ty: "ROAMING" }] },
    { zone: "Greece", items: [{ n: "Empire Warriors", t: "8:30", ap: "PM", m: 15, ty: "ROAMING" }, { n: "Mainland Greek", t: "9:00", ap: "PM", m: 15, ty: "ROAMING" }, { n: "Empire Warriors", t: "9:30", ap: "PM", m: 15, ty: "ROAMING" }, { n: "Mainland Greek", t: "10:00", ap: "PM", m: 15, ty: "ROAMING" }, { n: "Empire Warriors", t: "10:30", ap: "PM", m: 15, ty: "ROAMING" }, { n: "Mainland Greek", t: "11:00", ap: "PM", m: 15, ty: "ROAMING" }, { n: "Empire Warriors", t: "11:30", ap: "PM", m: 15, ty: "ROAMING" }, { n: "Mainland Greek", t: "12:00", ap: "AM", m: 15, ty: "ROAMING" }, { n: "Empire Warriors", t: "12:30", ap: "AM", m: 15, ty: "ROAMING" }] },
    { zone: "Morocco", items: [{ n: "Ramadan Melodies", t: "9:00", ap: "PM", m: 15, ty: "ROAMING" }, { n: "Dakar Esawi", t: "10:00", ap: "PM", m: 15, ty: "ROAMING" }, { n: "Ramadan Melodies", t: "10:50", ap: "PM", m: 15, ty: "ROAMING" }, { n: "Dakar Esawi", t: "11:25", ap: "PM", m: 15, ty: "ROAMING" }, { n: "Ramadan Melodies", t: "12:30", ap: "AM", m: 15, ty: "ROAMING" }] },
    { zone: "Levant", items: [{ n: "Mesaharati", t: "8:30", ap: "PM", m: 15, ty: "ROAMING" }, { n: "Ramadan Nights", t: "9:20", ap: "PM", m: 15, ty: "STAGE" }, { n: "Storyteller", t: "9:35", ap: "PM", m: 15, ty: "ROAMING" }, { n: "Ramadan Nights", t: "10:25", ap: "PM", m: 15, ty: "STAGE" }, { n: "Mesaharati", t: "10:40", ap: "PM", m: 15, ty: "ROAMING" }, { n: "Ramadan Nights", t: "11:30", ap: "PM", m: 15, ty: "STAGE" }, { n: "Storyteller", t: "12:00", ap: "AM", m: 15, ty: "ROAMING" }, { n: "Ramadan Nights", t: "12:30", ap: "AM", m: 15, ty: "STAGE" }] },
    { zone: "India", items: [{ n: "Bollywood Parade", t: "8:30", ap: "PM", m: 15, ty: "ROAMING" }, { n: "Global Village Greeting", t: "8:50", ap: "PM", m: 10, ty: "ROAMING" }, { n: "Bollywood Parade", t: "9:30", ap: "PM", m: 15, ty: "ROAMING" }, { n: "Global Village Greeting", t: "9:50", ap: "PM", m: 10, ty: "ROAMING" }, { n: "Bollywood Parade", t: "10:30", ap: "PM", m: 15, ty: "ROAMING" }, { n: "Global Village Greeting", t: "10:50", ap: "PM", m: 10, ty: "ROAMING" }, { n: "Bollywood Parade", t: "11:15", ap: "PM", m: 15, ty: "ROAMING" }, { n: "Global Village Greeting", t: "11:40", ap: "PM", m: 10, ty: "ROAMING" }, { n: "Bollywood Parade", t: "12:00", ap: "AM", m: 15, ty: "ROAMING" }] },
    { zone: "China", items: [{ n: "Dragon / Mini-Circus", t: "8:30", ap: "PM", m: 15, ty: "ROAMING" }, { n: "Lion Dance", t: "8:50", ap: "PM", m: 10, ty: "ROAMING" }, { n: "China Masks Inspiration", t: "9:00", ap: "PM", m: 15, ty: "STAGE" }, { n: "Dragon / Mini-Circus", t: "9:25", ap: "PM", m: 15, ty: "ROAMING" }, { n: "Lion Dance", t: "9:45", ap: "PM", m: 10, ty: "ROAMING" }, { n: "China Masks Inspiration", t: "10:00", ap: "PM", m: 15, ty: "ROAMING" }, { n: "Dragon / Mini-Circus", t: "10:25", ap: "PM", m: 15, ty: "ROAMING" }, { n: "Lion Dance", t: "10:45", ap: "PM", m: 10, ty: "ROAMING" }, { n: "China Masks Inspiration", t: "11:05", ap: "PM", m: 15, ty: "STAGE" }, { n: "Dragon / Mini-Circus", t: "11:45", ap: "PM", m: 15, ty: "ROAMING" }, { n: "China Masks Inspiration", t: "12:15", ap: "AM", m: 15, ty: "STAGE" }, { n: "Lion Dance", t: "12:30", ap: "AM", m: 10, ty: "ROAMING" }, { n: "Dragon / Mini-Circus", t: "12:45", ap: "AM", m: 15, ty: "STAGE" }] },
    { zone: "Japan", items: [{ n: "Full Parade", t: "8:30", ap: "PM", m: 15, ty: "ROAMING" }, { n: "Samurai & Geisha", t: "9:30", ap: "PM", m: 15, ty: "ROAMING" }, { n: "Japanese Cat / Tails", t: "10:30", ap: "PM", m: 15, ty: "ROAMING" }, { n: "Samurai & Geisha", t: "11:00", ap: "PM", m: 15, ty: "ROAMING" }, { n: "Japanese Cat / Tails", t: "11:45", ap: "PM", m: 15, ty: "ROAMING" }, { n: "Full Parade", t: "12:45", ap: "AM", m: 15, ty: "ROAMING" }] },
    { zone: "Korea", items: [{ n: "Korea Roaming", t: "8:30", ap: "PM", m: 15, ty: "ROAMING" }, { n: "Korea Roaming", t: "9:45", ap: "PM", m: 15, ty: "ROAMING" }, { n: "Korea Roaming", t: "10:30", ap: "PM", m: 15, ty: "ROAMING" }, { n: "Korea Roaming", t: "11:30", ap: "PM", m: 15, ty: "ROAMING" }, { n: "Korea Roaming", t: "12:45", ap: "AM", m: 15, ty: "ROAMING" }] },
    { zone: "Indonesia", items: [{ n: "Indonesia Roaming", t: "8:30", ap: "PM", m: 15, ty: "ROAMING" }, { n: "Indonesia Greeting", t: "9:00", ap: "PM", m: 10, ty: "ROAMING" }, { n: "Indonesia Roaming", t: "9:25", ap: "PM", m: 15, ty: "ROAMING" }, { n: "Indonesia Greeting", t: "9:50", ap: "PM", m: 10, ty: "ROAMING" }, { n: "Indonesia Roaming", t: "10:30", ap: "PM", m: 15, ty: "ROAMING" }, { n: "Indonesia Greeting", t: "10:50", ap: "PM", m: 10, ty: "ROAMING" }, { n: "Indonesia Roaming", t: "11:25", ap: "PM", m: 15, ty: "ROAMING" }, { n: "Indonesia Greeting", t: "11:45", ap: "PM", m: 10, ty: "ROAMING" }, { n: "Indonesia Roaming", t: "12:45", ap: "AM", m: 15, ty: "ROAMING" }] },
    { zone: "Asia", items: [{ n: "Greeting", t: "8:30", ap: "PM", m: 10, ty: "ROAMING" }, { n: "Greeting", t: "9:00", ap: "PM", m: 10, ty: "ROAMING" }, { n: "Greeting", t: "9:30", ap: "PM", m: 15, ty: "ROAMING" }, { n: "Greeting", t: "9:50", ap: "PM", m: 10, ty: "ROAMING" }, { n: "Greeting", t: "10:30", ap: "PM", m: 10, ty: "ROAMING" }, { n: "Greeting", t: "11:00", ap: "PM", m: 10, ty: "ROAMING" }, { n: "Greeting", t: "11:30", ap: "PM", m: 15, ty: "STAGE" }, { n: "Greeting", t: "12:00", ap: "AM", m: 10, ty: "ROAMING" }, { n: "Greeting", t: "12:30", ap: "AM", m: 15, ty: "STAGE" }] },
    { zone: "USA", items: [{ n: "Western Rhythms", t: "8:30", ap: "PM", m: 15, ty: "ROAMING" }, { n: "Cowboy Mascots", t: "9:00", ap: "PM", m: 15, ty: "ROAMING" }, { n: "Swinging Polka Nights", t: "9:30", ap: "PM", m: 15, ty: "ROAMING" }, { n: "Western Rhythms", t: "10:00", ap: "PM", m: 15, ty: "ROAMING" }, { n: "Cowboy Mascots", t: "10:30", ap: "PM", m: 15, ty: "ROAMING" }, { n: "Western Rhythms", t: "11:00", ap: "PM", m: 15, ty: "ROAMING" }, { n: "Cowboy Mascots", t: "11:30", ap: "PM", m: 15, ty: "ROAMING" }, { n: "Swinging Polka Nightsr", t: "12:00", ap: "AM", m: 15, ty: "ROAMING" }, { n: "Cowboy Mascots", t: "12:30", ap: "AM", m: 15, ty: "ROAMING" }] },
    { zone: "Mexico", items: [{ n: "Achi Band / Traditional Mexico Roaming", t: "8:45", ap: "PM", m: 15, ty: "ROAMING" }, { n: "Mexican Mariachi Band", t: "9:45", ap: "PM", m: 15, ty: "ROAMING" }, { n: "Roaming Show", t: "10:20", ap: "PM", m: 15, ty: "ROAMING" }, { n: "Mexican Mariachi Band", t: "10:55", ap: "PM", m: 15, ty: "ROAMING" }, { n: "Mexican Mariachi Band", t: "12:00", ap: "AM", m: 15, ty: "ROAMING" }, { n: "Roaming Show", t: "12:30", ap: "AM", m: 15, ty: "ROAMING" }] },
    { zone: "Iran", items: [{ n: "Iran Roaming", t: "8:30", ap: "PM", m: 15, ty: "ROAMING" }, { n: "Iran Roaming", t: "9:30", ap: "PM", m: 15, ty: "ROAMING" }, { n: "Iran Roaming", t: "10:45", ap: "PM", m: 15, ty: "ROAMING" }, { n: "Iran Roaming", t: "11:45", ap: "PM", m: 15, ty: "ROAMING" }] },
    { zone: "Africa", items: [{ n: "Roaming Africans", t: "8:30", ap: "PM", m: 15, ty: "ROAMING" }, { n: "Roaming Africans/ Drums", t: "8:50", ap: "PM", m: 15, ty: "ROAMING" }, { n: "Roaming Africans", t: "9:10", ap: "PM", m: 15, ty: "ROAMING" }, { n: "Roaming Africans", t: "10:00", ap: "PM", m: 15, ty: "ROAMING" }, { n: "Roaming Africans/ Drums", t: "10:20", ap: "PM", m: 15, ty: "ROAMING" }, { n: "Roaming Africans", t: "10:50", ap: "PM", m: 15, ty: "ROAMING" }, { n: "Roaming Africans", t: "11:35", ap: "PM", m: 15, ty: "ROAMING" }, { n: "Roaming Africans/ Drums", t: "12:00", ap: "AM", m: 15, ty: "ROAMING" }, { n: "Roaming Show", t: "12:25", ap: "AM", m: 15, ty: "ROAMING" }, { n: "Roaming Africans/ Drums", t: "12:45", ap: "AM", m: 15, ty: "ROAMING" }] },
  ],

  // ── ride packages, as printed on the park's rate card ─────────
  // Two tiers: ride allowances loaded onto a card, and unlimited nights worn
  // as an NFC bracelet. Every package is a ride allowance — the rate card says
  // nothing about park entry, so nothing here claims entry is included.
  // Each one expires at the end of the day it's used.
  bundles: [
    {
      group: "credit",
      name: "VALUE DEAL",
      tag: "ANY 5 RIDES",
      count: "5",
      price: 89,
      media: "One card",
      blurb: "Five rides, used however you like.",
      includes: [
        "Any 5 rides in the park",
        "Ride the same attraction five times, or",
        "Ride two a few times and spend the rest on three others",
      ],
      cta: "BOOK VALUE DEAL",
      href: "https://webook.com",
    },
    {
      group: "credit",
      name: "VALUE DEAL PLUS",
      tag: "ANY 10 RIDES",
      count: "10",
      price: 135,
      media: "One card",
      blurb: "Ten rides, on one attraction or mixed.",
      includes: [
        "Any 10 rides in the park",
        "All ten on the same attraction, if you choose",
        "Or ride two several times and spend the rest elsewhere",
      ],
      cta: "BOOK VALUE DEAL PLUS",
      href: "https://webook.com",
    },
    {
      group: "credit",
      name: "FAMILY PACKAGE",
      tag: "ANY 30 RIDES",
      count: "30",
      price: 299,
      media: "3 cards · 10 games each",
      featured: true,
      flag: "BEST FOR GROUPS",
      blurb: "Thirty rides, three cards, one night out.",
      includes: [
        "Any 30 rides, in any combination",
        "Three cards — ten games on each",
        "Ride one attraction repeatedly, or split them any way you prefer",
      ],
      cta: "BOOK FAMILY PACKAGE",
      href: "https://webook.com",
    },
    {
      group: "unlimited",
      name: "UNLIMITED REGULAR",
      tag: "RIDE ALL NIGHT",
      count: "∞",
      price: 199,
      media: "NFC bracelet",
      blurb: "Any attraction, an unlimited number of times.",
      includes: [
        "Every attraction, as many times as you like",
        "Regular queue line",
        "Worn all night as an NFC bracelet",
      ],
      cta: "BOOK UNLIMITED",
      href: "https://webook.com",
    },
    {
      group: "unlimited",
      name: "UNLIMITED FAST",
      tag: "SKIP THE LINE",
      count: "∞",
      price: 349,
      media: "NFC bracelet",
      featured: true,
      flag: "NO QUEUING",
      blurb: "The same night, on the fast queue.",
      includes: [
        "Every attraction, as many times as you like",
        "Fast queue line at every gate",
        "Worn all night as an NFC bracelet",
      ],
      cta: "BOOK UNLIMITED FAST",
      href: "https://webook.com",
    },
  ],

  // ── partners, as printed on the official park map ──
  // Seven logos are official SVGs (Wikimedia Commons, hmg.com, shawarmer.com);
  // the rest stay as crops from the map PDF, because no SVG could be confirmed
  // as the same mark and a near-miss would be worse than a soft raster.
  // The red mark printed beside Dr Sulaiman Al Habib is part of that lockup —
  // an earlier crop had split it out as a separate partner by mistake.
  // the red premium mark could not be read at the PDF's resolution — its name
  // is left blank until someone confirms it
  partners: [
    { tier: "OFFICIAL PREMIUM PARTNERS", logos: [
      { name: "SNB",                  img: "SNB.svg" },
      { name: "stc",                  img: "stc.svg" },
      { name: "Dr Sulaiman Al Habib", img: "Dr-Sulaiman-Al-Habib.svg" },
      { name: "aramco",               img: "aramco.png" },
    ] },
    { tier: "OFFICIAL STRATEGIC PARTNERS", logos: [
      { name: "MUC \u00b7 Mayyar United", img: "MUC-Mayyar-United.png" },
      { name: "AROYA Cruises",            img: "AROYA-Cruises.png" },
      { name: "Sadia",                    img: "Sadia.svg" },
      { name: "SHG",                      img: "SHG.png" },
    ] },
    { tier: "OFFICIAL MAIN PARTNERS", logos: [
      { name: "Checkapp",  img: "Checkapp.png" },
      { name: "Dunkin'",   img: "Dunkin.svg" },
      { name: "shawarmer", img: "shawarmer.svg" },
      { name: "Coca-Cola", img: "Coca-Cola.svg" },
      { name: "Saudia",    img: "Saudia.png" },
    ] },
    { tier: "OFFICIAL CO SPONSOR", logos: [
      { name: "Domino's", img: "Dominos.png" },
    ] },
    { tier: "COMMERCIAL PARTNER", logos: [
      { name: "PRIME", img: "PRIME.png" },
    ] },
  ],

  faqs: [
    { q: "Where is BLVD World?",
      a: "BLVD World sits in Riyadh's Boulevard City district, part of Riyadh Season. Parking and ride-hailing drop-offs are signposted from the main gates." },
    { q: "What does the entry ticket include?",
      a: "Entry gives you access to the park and every walkable zone \u2014 the streets, plazas, souks and light shows. Individual rides, dining and ticketed experiences are booked separately." },
    { q: "What are the opening hours?",
      a: "The park opens in the late afternoon and runs past midnight through the Season. Exact times shift by day, so check your ticket for the night you're visiting." },
    { q: "Is it suitable for children?",
      a: "Yes \u2014 most zones are family areas, with carousels, arcades and dining alongside the bigger rides. Individual thrill rides carry their own height and age limits." },
    { q: "Can I change or refund a booking?",
      a: "Changes and refunds follow the policy shown at checkout on webook.com, which varies by ticket type. Check the terms on your confirmation email." },
  ],

  // park zones, pinned to their real countries on the globe
  zones: [
    { name: "Saudi Arabia",  lat: 24.7,  lon: 46.7,   blurb: "Najdi streets, kabsa on the grill, ardah at volume." , imgs: ["saudi-arabia.webp", "saudi.jpg", "park2.jpg"], poster: "saudi-arabia.webp", attractions: ["Najdi Heritage Village", "Falcon Show Arena", "Traditional Ardah Stage"], food: ["Najd Grill House", "Qahwa & Dates Lounge", "Kabsa Kitchen"], rides: ["Desert Rover Coaster", "Camel Carousel"] },
    { name: "Egypt",         lat: 26.8,  lon: 30.8,   blurb: "The Sphinx by night, then a live PUBG arena." , imgs: ["egypt.webp", "egypt.jpg", "park4.jpg"], poster: "egypt.webp", attractions: ["Pyramid Light Show", "PUBG Experience Zone", "Sphinx Plaza"], food: ["Nile Terrace", "Koshari Corner"], rides: ["Pharaoh's Drop Tower", "Scarab Spinner"] },
    { name: "France",        lat: 46.6,  lon: 2.2,    blurb: "The Eiffel Tower over an alpine high street." , imgs: ["france.webp", "france.jpg", "park1.jpg"], poster: "france.webp", attractions: ["Eiffel Tower Replica", "Courchevel Snow Deck", "Street Mime Quarter"], food: ["Le Petit Bistro", "Cr\u00eaperie du Parc", "Champs Caf\u00e9"], rides: ["Grand Carousel", "Balloon Ascent"] },
    { name: "United Kingdom",lat: 54.0,  lon: -2.0,   blurb: "Big Ben, red phone boxes, the big wheel behind." , imgs: ["uk.webp", "park6.jpg", "park2.jpg"], attractions: ["Big Ben Replica", "Red Phone Box Row", "Changing of the Guard"], food: ["The Crown Pub", "Fish & Chips Co."], rides: ["London Eye Wheel", "Double-Decker Dodgems"] },
    { name: "United States", lat: 39.8,  lon: -98.6,  blurb: "Route 66 diners and a midnight milkshake." , imgs: ["usa.jpg", "park1.jpg", "park6.jpg"], attractions: ["Route 66 Main Street", "Hollywood Walk", "Comic Pop Gallery"], food: ["Route 66 Diner", "Smokehouse BBQ", "Shake Shack Bar"], rides: ["Cyclone Coaster", "Bumper Cars"] },
    { name: "Italy",         lat: 42.8,  lon: 12.6,   blurb: "A Venetian bridge, gelato, the canal drifting by." , imgs: ["italy.webp", "italy.jpg", "park7.jpg"], attractions: ["The Grand Canal", "Campanile Tower", "Piazza Fountain"], food: ["Trattoria Bella", "Gelateria Roma", "Pizza al Taglio"], rides: ["Gondola Ride", "Venetian Swing"] },
    { name: "Spain",         lat: 40.4,  lon: -3.7,   blurb: "Andalusian arches, flamenco heels, late tapas." , imgs: ["spain.webp", "park3.jpg", "park5.jpg"], attractions: ["Plaza de Toros Gate", "Flamenco Courtyard", "Andalusian Arches"], food: ["Tapas Barra", "Churros & Chocolate"], rides: ["Matador Spin", "Fiesta Twister"] },
    { name: "Greece",        lat: 39.0,  lon: 22.0,   blurb: "Whitewashed walls, a windmill, cable cars above." , imgs: ["greece.webp", "park7.jpg", "park6.jpg"], attractions: ["Santorini Steps", "Whitewashed Chapel", "Aegean Viewpoint"], food: ["Taverna Blue", "Gyros Grill"], rides: ["Olympus Freefall", "Aegean Wave Swing"] },
    { name: "Morocco",       lat: 31.8,  lon: -7.1,   blurb: "A lantern-lit souk, a tiled fountain, mint tea." , imgs: ["morocco.webp", "park5.jpg", "park4.jpg"], attractions: ["Marrakech Souk", "Lantern Alley", "Riad Courtyard"], food: ["Tagine House", "Mint Tea Terrace"], rides: ["Magic Carpet Ride", "Souk Spinner"] },
    { name: "India",         lat: 21.0,  lon: 78.0,   blurb: "The Taj Mahal floodlit, street food beside it." , imgs: ["india.webp", "park2.jpg", "park6.jpg"], attractions: ["Taj Mahal Replica", "Palace Gardens", "Bollywood Stage"], food: ["Spice Route Kitchen", "Chai & Chaat Bar"], rides: ["Elephant Carousel", "Maharaja Express"] },
    { name: "China",         lat: 35.0,  lon: 104.0,  blurb: "Red pagodas, dragon gates, a lantern market." , imgs: ["china.webp", "china.jpg", "park3.jpg"], attractions: ["Chinatown Gate", "Red Pagoda", "Lion Dance Square"], food: ["Dim Sum Palace", "Noodle Bar", "Bubble Tea House"], rides: ["Dragon Coaster", "Lantern Wheel"] },
    { name: "Japan",         lat: 36.2,  lon: 138.3,  blurb: "Under the torii: neon arcades and warm taiyaki." , imgs: ["japan.webp", "japan.jpg", "park1.jpg"], poster: "japan.webp", attractions: ["Tokyo Street", "Grendizer Statue", "Retro Arcade Hall"], food: ["Ramen Yokocho", "Sushi Counter", "Taiyaki Stand"], rides: ["Neon Drift Racers", "Robot Drop"] },
    { name: "Indonesia",     lat: -2.5,  lon: 118.0,  blurb: "Palms lit in neon, island craft, a thatched stage." , imgs: ["indonesia.webp", "park1.jpg", "park7.jpg"], poster: "indonesia.webp", attractions: ["Bali Water Garden", "Batik Craft House", "Island Dance Stage"], food: ["Warung Nasi", "Satay Grill"], rides: ["Volcano Splash", "Tiki Swing"] },
    { name: "South Korea",   lat: 36.5,  lon: 127.9,  blurb: "K-pop on stage, Korean BBQ, Seoul Tower above." , imgs: ["korea.webp", "park6.jpg", "park3.jpg"], poster: "korea.webp", attractions: ["K-Pop Plaza", "Hanok Lane", "Seoul Neon Alley"], food: ["Korean BBQ House", "Bingsu Bar", "Street Toast Stand"], rides: ["Hallyu Spin", "Seoul Sky Tower"] },
    { name: "Mexico",        lat: 23.6,  lon: -102.5, blurb: "A Mayan temple lit crimson, tacos at its feet." , imgs: ["mexico.jpg", "park5.jpg", "park4.jpg"], attractions: ["The Red Pyramid", "Mayan Ruins Walk", "Mariachi Square"], food: ["Cantina Azteca", "Taqueria del Sol"], rides: ["Chichen Drop", "Aztec Rapids"] },
    { name: "Kuwait",        lat: 29.3,  lon: 47.5,   blurb: "The Kuwait Towers glowing over a fortress gate." , imgs: ["kuwait.webp", "park4.jpg", "park2.jpg"], poster: "kuwait.webp", attractions: ["Kuwait Towers Replica", "Gulf Promenade", "Pearl Diving Exhibit"], food: ["Machboos House", "Gulf Seafood Deck"], rides: ["Dhow Boat Ride", "Pearl Spinner"] },
    { name: "Thailand",      lat: 15.9,  lon: 101.0,  blurb: "Floating-market flavours and temple gold." , imgs: ["park7.jpg", "park1.jpg", "park5.jpg"], attractions: ["Floating Market", "Grand Temple Replica", "Muay Thai Ring"], food: ["Pad Thai Street", "Mango Sticky Rice Bar"], rides: ["Longtail Boat Ride", "Tuk-Tuk Dodgems"] },
    { name: "Türkiye",       lat: 39.0,  lon: 35.2,   blurb: "Uzungöl terraces, folk dance, shisha as it cools." , imgs: ["turkey.jpg", "park6.jpg", "park2.jpg"], poster: "turkiye.webp", attractions: ["Uzung\u00f6l Terraces", "Galata Tower Replica", "Whirling Dervish Stage"], food: ["Uzung\u00f6l Restaurant & Shisha", "Baklava House", "Turkish Coffee Nook"], rides: ["Bosphorus Flyer", "Ottoman Carousel"] },
    { name: "Iran",          lat: 32.4,  lon: 53.7,   blurb: "Blue-tiled courtyards and a life-size Pac-Man maze." , imgs: ["iran.webp", "park5.jpg", "park3.jpg"], attractions: ["Tiled Courtyard", "Pac-Man Game Experience", "Persian Carpet Hall"], food: ["Kebab Bazaar", "Saffron Tea Room"], rides: ["Persian Rug Glider", "Bazaar Spinner"] },
    { name: "Africa",        lat: 0.0,   lon: 20.0,   blurb: "Safari scale: drums, colour, a baobab you can ride." , imgs: ["africa.webp", "park8.jpg", "park6.jpg"], attractions: ["Immersive Safari Trail", "Savanna Drum Circle", "Tribal Art Market"], food: ["Safari Grill", "Baobab Juice Bar"], rides: ["Safari Jeep Adventure", "Jungle Rapids"] },
  ],

  // ── park map pins ──────────────────────────────────────────────
  // x / y are percentages of img/map/park-map.jpg, measured off the label
  // pills on the official park map. `zone` links a pin to the matching
  // WBK.zones entry so the map and the globe share one detail drawer;
  // pins without one carry their own `extra` (the map has zones the globe
  // doesn't, plus the two gates). `tone` mirrors the printed label colour.
  mapPins: [
    { label: "USA",          x: 14.3, y: 31.1, tone: "#f58220", zone: "United States" },
    { label: "ASIA",         x: 25.0, y: 24.6, tone: "#e02b2b",
      extra: { blurb: "A pan-Asian plaza wrapped around a sunken amphitheatre stage.",
               imgs: ["park6.jpg", "japan.jpg", "china.jpg"] } },
    { label: "JAPAN",        x: 29.2, y: 21.3, tone: "#f58220", zone: "Japan" },
    { label: "MEXICO",       x: 33.7, y: 17.6, tone: "#ef5da8", zone: "Mexico" },
    { label: "IRAN",         x: 40.5, y: 19.9, tone: "#8e1f1f", zone: "Iran" },
    { label: "PIER",         x: 44.9, y: 16.4, tone: "#e5177c",
      extra: { blurb: "The thrill waterfront — big rides lined up along the lagoon.",
               imgs: ["park7.jpg", "park1.jpg", "park4.jpg"] } },
    { label: "INDIA",        x: 55.1, y: 16.9, tone: "#c81e6e", zone: "India" },
    { label: "KSA 2",        x: 60.2, y: 18.5, tone: "#5a6472", gate: true,
      extra: { blurb: "North gate on Al Imam Saud Ibn Faysal Rd — ticketing, info desk and prayer rooms.",
               imgs: ["park2.jpg"] } },
    { label: "THE PLANET",   x: 70.5, y: 20.4, tone: "#f58220",
      extra: { blurb: "A dome district: wraparound cinema, Meta World and the dolphinarium.",
               imgs: ["park3.jpg", "park4.jpg", "park7.jpg"] } },
    { label: "AFRICA",       x: 65.6, y: 29.0, tone: "#7d8a5a", zone: "Africa" },
    { label: "EGYPT",        x: 79.4, y: 31.5, tone: "#f58220", zone: "Egypt" },
    { label: "SPAIN",        x: 36.7, y: 30.7, tone: "#e02b2b", zone: "Spain" },
    { label: "TURKEY",       x: 10.9, y: 40.4, tone: "#f58220", zone: "Türkiye" },
    { label: "ITALY",        x: 55.6, y: 39.6, tone: "#c81e6e", zone: "Italy" },
    { label: "FRANCE",       x: 33.7, y: 43.1, tone: "#8e4fd0", zone: "France" },
    { label: "KUWAIT",       x: 85.4, y: 43.1, tone: "#7fa653", zone: "Kuwait" },
    { label: "GREECE",       x: 75.7, y: 46.5, tone: "#e02b2b", zone: "Greece" },
    { label: "INDONESIA",    x: 48.2, y: 46.0, tone: "#e02b2b", zone: "Indonesia" },
    { label: "KOREA",        x: 39.4, y: 50.3, tone: "#1f3f7a", zone: "South Korea" },
    { label: "AMAZONIA",     x: 32.4, y: 56.6, tone: "#2fa84f",
      extra: { blurb: "The jungle mountain that carries the BLVD WORLD sign — home of Amazonia Awakens.",
               imgs: ["park8.jpg", "park1.jpg", "park6.jpg"] } },
    { label: "MOROCCO",      x: 60.5, y: 57.7, tone: "#e5177c", zone: "Morocco" },
    { label: "WARZONE",      x: 84.0, y: 60.6, tone: "#e5177c",
      extra: { blurb: "A fenced combat arena of bunkers, watchtowers and battle games.",
               imgs: ["park2.jpg", "park4.jpg", "park5.jpg"] } },
    { label: "SAUDI ARABIA", x: 20.5, y: 64.6, tone: "#2e8b46", zone: "Saudi Arabia" },
    { label: "CHINA",        x: 37.9, y: 63.7, tone: "#f58220", zone: "China" },
    { label: "KSA 1",        x: 10.6, y: 65.2, tone: "#5a6472", gate: true,
      extra: { blurb: "West gate beside BLVD City — ticketing, ATMs and guest services.",
               imgs: ["park2.jpg"] } },
    { label: "LEVANT",       x: 57.1, y: 74.9, tone: "#8e4fd0",
      extra: { blurb: "Old-city stone arches, courtyards and Levantine kitchens.",
               imgs: ["park5.jpg", "park3.jpg", "park2.jpg"] } },
  ],

  // premium experiences — every ticket includes park entry
  experiences: [
    { img: "exp/snow.jpg",      title: "Skiing School",     zone: "Courchevel", price: 260, blurb: "Real snow, real instructors — learn to ski inside the dome." },
    { img: "exp/pyramid.jpg",   title: "Escape Room",        zone: "Egypt",      price: 180, blurb: "Secret of the Pharaoh: sixty minutes to break out of the tomb." },
    { img: "zones/park4.jpg",     title: "Dolphinarium",       zone: "The Planet", price: 220, blurb: "A full dolphin show under the dome, twice nightly." },
    { img: "zones/park7.jpg",     title: "Swimming with Dolphins", zone: "The Planet", price: 480, blurb: "Get in the water and meet them up close." },
    { img: "zones/park2.jpg",     title: "Battle Dome",        zone: "Warzone",    price: 150, blurb: "Team laser combat in a floodlit arena." },
    { img: "exp/gondola.jpg",   title: "Midnight Manor",     zone: "Italy",      price: 140, blurb: "A haunted walk-through where the house pushes back." },
    { img: "zones/park3.jpg",     title: "The Dome Cinema",    zone: "The Planet", price: 120, blurb: "Films projected across a full wraparound dome." },
    { img: "zones/park1.jpg",     title: "Lion Experience",    zone: "Africa",     price: 200, blurb: "Come face to face with the pride on the safari trail." },
    { img: "zones/park5.jpg",     title: "Pac-Man",            zone: "Iran",       price: 110, blurb: "Step inside the maze — you are the yellow one." },
    { img: "zones/egypt.jpg",     title: "PUBG",               zone: "Egypt",      price: 160, blurb: "The battle royale, staged for real among the ruins." },
  ],

  letters: [
    { msg: "Every night at BLVD World feels like magic!", who: "Noura", country: "Saudi Arabia", lat: 24.7, lon: 46.7 },
    { msg: "Flew in just for BLVD World. Zero regrets!", who: "Jimin S.", country: "South Korea", lat: 37.5, lon: 127.0 },
    { msg: "One ticket. A thousand memories.", who: "Omar", country: "Egypt", lat: 30.0, lon: 31.2 },
    { msg: "The lights, the music, the people. Unreal.", who: "Sarah", country: "UAE", lat: 25.2, lon: 55.3 },
    { msg: "We don't visit BLVD World. We live it.", who: "Faisal", country: "Saudi Arabia", lat: 21.5, lon: 39.2 },
    { msg: "See you under the ferris wheel. 💜", who: "Yuki", country: "Japan", lat: 35.7, lon: 139.7 },
    { msg: "Best night of my entire year. Thank you!", who: "Lucas", country: "Brazil", lat: -23.5, lon: -46.6 },
    { msg: "Home is wherever the Boulevard lights are.", who: "Amira", country: "Kuwait", lat: 29.4, lon: 48.0 },
    { msg: "Counting days until the next Season!", who: "Priya", country: "India", lat: 19.1, lon: 72.9 },
    { msg: "You turned our city into a love letter.", who: "Dana", country: "Bahrain", lat: 26.2, lon: 50.6 },
    { msg: "Ten rides. One night. Still not enough.", who: "Mike", country: "USA", lat: 34.05, lon: -118.24 },
    { msg: "The fireworks live in my head rent-free.", who: "Ella", country: "UK", lat: 51.5, lon: -0.13 },
  ],
};
