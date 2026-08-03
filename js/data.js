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

  // park zones, pinned to their real countries on the globe
  zones: [
    { name: "Saudi Arabia",  lat: 24.7,  lon: 46.7,   blurb: "Local heritage, food and traditional performances." , imgs: ["saudi.jpg", "park2.jpg", "park5.jpg"], attractions: ["Najdi Heritage Village", "Falcon Show Arena", "Traditional Ardah Stage"], food: ["Najd Grill House", "Qahwa & Dates Lounge", "Kabsa Kitchen"], rides: ["Desert Rover Coaster", "Camel Carousel"] },
    { name: "Egypt",         lat: 26.8,  lon: 30.8,   blurb: "Iconic architecture and a PUBG experience zone." , imgs: ["egypt.jpg", "park4.jpg", "park7.jpg"], attractions: ["Pyramid Light Show", "PUBG Experience Zone", "Sphinx Plaza"], food: ["Nile Terrace", "Koshari Corner"], rides: ["Pharaoh's Drop Tower", "Scarab Spinner"] },
    { name: "France",        lat: 46.6,  lon: 2.2,    blurb: "An Eiffel Tower replica with Courchevel styling." , imgs: ["france.jpg", "park1.jpg", "park3.jpg"], attractions: ["Eiffel Tower Replica", "Courchevel Snow Deck", "Street Mime Quarter"], food: ["Le Petit Bistro", "Cr\u00eaperie du Parc", "Champs Caf\u00e9"], rides: ["Grand Carousel", "Balloon Ascent"] },
    { name: "United Kingdom",lat: 54.0,  lon: -2.0,   blurb: "A Big Ben replica and red telephone booths." , imgs: ["park6.jpg", "park2.jpg", "park3.jpg"], attractions: ["Big Ben Replica", "Red Phone Box Row", "Changing of the Guard"], food: ["The Crown Pub", "Fish & Chips Co."], rides: ["London Eye Wheel", "Double-Decker Dodgems"] },
    { name: "United States", lat: 39.8,  lon: -98.6,  blurb: "Classic American streets and pop culture." , imgs: ["usa.jpg", "park1.jpg", "park6.jpg"], attractions: ["Route 66 Main Street", "Hollywood Walk", "Comic Pop Gallery"], food: ["Route 66 Diner", "Smokehouse BBQ", "Shake Shack Bar"], rides: ["Cyclone Coaster", "Bumper Cars"] },
    { name: "Italy",         lat: 42.8,  lon: 12.6,   blurb: "European architecture, canals and plazas." , imgs: ["italy.jpg", "park7.jpg", "park5.jpg"], attractions: ["The Grand Canal", "Campanile Tower", "Piazza Fountain"], food: ["Trattoria Bella", "Gelateria Roma", "Pizza al Taglio"], rides: ["Gondola Ride", "Venetian Swing"] },
    { name: "Spain",         lat: 40.4,  lon: -3.7,   blurb: "Sun-warmed plazas and Andalusian arches." , imgs: ["park3.jpg", "park5.jpg", "park1.jpg"], attractions: ["Plaza de Toros Gate", "Flamenco Courtyard", "Andalusian Arches"], food: ["Tapas Barra", "Churros & Chocolate"], rides: ["Matador Spin", "Fiesta Twister"] },
    { name: "Greece",        lat: 39.0,  lon: 22.0,   blurb: "Whitewashed Mediterranean charm." , imgs: ["park7.jpg", "park6.jpg", "park2.jpg"], attractions: ["Santorini Steps", "Whitewashed Chapel", "Aegean Viewpoint"], food: ["Taverna Blue", "Gyros Grill"], rides: ["Olympus Freefall", "Aegean Wave Swing"] },
    { name: "Morocco",       lat: 31.8,  lon: -7.1,   blurb: "North African souks and lantern light." , imgs: ["park5.jpg", "park4.jpg", "park1.jpg"], attractions: ["Marrakech Souk", "Lantern Alley", "Riad Courtyard"], food: ["Tagine House", "Mint Tea Terrace"], rides: ["Magic Carpet Ride", "Souk Spinner"] },
    { name: "India",         lat: 21.0,  lon: 78.0,   blurb: "Palace façades and street food lanes." , imgs: ["park2.jpg", "park6.jpg", "park3.jpg"], attractions: ["Taj Mahal Replica", "Palace Gardens", "Bollywood Stage"], food: ["Spice Route Kitchen", "Chai & Chaat Bar"], rides: ["Elephant Carousel", "Maharaja Express"] },
    { name: "China",         lat: 35.0,  lon: 104.0,  blurb: "Red pagodas and lantern markets." , imgs: ["china.jpg", "park3.jpg", "park7.jpg"], attractions: ["Chinatown Gate", "Red Pagoda", "Lion Dance Square"], food: ["Dim Sum Palace", "Noodle Bar", "Bubble Tea House"], rides: ["Dragon Coaster", "Lantern Wheel"] },
    { name: "Japan",         lat: 36.2,  lon: 138.3,  blurb: "Neon arcades and Tokyo street food." , imgs: ["japan.jpg", "park1.jpg", "park6.jpg"], attractions: ["Tokyo Street", "Grendizer Statue", "Retro Arcade Hall"], food: ["Ramen Yokocho", "Sushi Counter", "Taiyaki Stand"], rides: ["Neon Drift Racers", "Robot Drop"] },
    { name: "Indonesia",     lat: -2.5,  lon: 118.0,  blurb: "Island colour and tropical craft." , imgs: ["park1.jpg", "park7.jpg", "park4.jpg"], attractions: ["Bali Water Garden", "Batik Craft House", "Island Dance Stage"], food: ["Warung Nasi", "Satay Grill"], rides: ["Volcano Splash", "Tiki Swing"] },
    { name: "South Korea",   lat: 36.5,  lon: 127.9,  blurb: "K-pop energy and Seoul night bites." , imgs: ["park6.jpg", "park3.jpg", "park2.jpg"], attractions: ["K-Pop Plaza", "Hanok Lane", "Seoul Neon Alley"], food: ["Korean BBQ House", "Bingsu Bar", "Street Toast Stand"], rides: ["Hallyu Spin", "Seoul Sky Tower"] },
    { name: "Mexico",        lat: 23.6,  lon: -102.5, blurb: "A Mayan temple lit crimson above the lagoon." , imgs: ["mexico.jpg", "park5.jpg", "park4.jpg"], attractions: ["The Red Pyramid", "Mayan Ruins Walk", "Mariachi Square"], food: ["Cantina Azteca", "Taqueria del Sol"], rides: ["Chichen Drop", "Aztec Rapids"] },
    { name: "Kuwait",        lat: 29.3,  lon: 47.5,   blurb: "Gulf towers and a coastal promenade." , imgs: ["park4.jpg", "park2.jpg", "park7.jpg"], attractions: ["Kuwait Towers Replica", "Gulf Promenade", "Pearl Diving Exhibit"], food: ["Machboos House", "Gulf Seafood Deck"], rides: ["Dhow Boat Ride", "Pearl Spinner"] },
    { name: "Thailand",      lat: 15.9,  lon: 101.0,  blurb: "Floating-market flavours and temple gold." , imgs: ["park7.jpg", "park1.jpg", "park5.jpg"], attractions: ["Floating Market", "Grand Temple Replica", "Muay Thai Ring"], food: ["Pad Thai Street", "Mango Sticky Rice Bar"], rides: ["Longtail Boat Ride", "Tuk-Tuk Dodgems"] },
    { name: "Türkiye",       lat: 39.0,  lon: 35.2,   blurb: "Uzungöl terraces, folk dance and shisha." , imgs: ["turkey.jpg", "park6.jpg", "park2.jpg"], attractions: ["Uzung\u00f6l Terraces", "Galata Tower Replica", "Whirling Dervish Stage"], food: ["Uzung\u00f6l Restaurant & Shisha", "Baklava House", "Turkish Coffee Nook"], rides: ["Bosphorus Flyer", "Ottoman Carousel"] },
    { name: "Iran",          lat: 32.4,  lon: 53.7,   blurb: "Tiled courtyards and a Pac-Man game experience." , imgs: ["park5.jpg", "park3.jpg", "park4.jpg"], attractions: ["Tiled Courtyard", "Pac-Man Game Experience", "Persian Carpet Hall"], food: ["Kebab Bazaar", "Saffron Tea Room"], rides: ["Persian Rug Glider", "Bazaar Spinner"] },
    { name: "Africa",        lat: 0.0,   lon: 20.0,   blurb: "An immersive safari-scale Africa zone." , imgs: ["park8.jpg", "park6.jpg", "park1.jpg"], attractions: ["Immersive Safari Trail", "Savanna Drum Circle", "Tribal Art Market"], food: ["Safari Grill", "Baobab Juice Bar"], rides: ["Safari Jeep Adventure", "Jungle Rapids"] },
  ],

  // premium experiences — every ticket includes park entry
  experiences: [
    { img: "skyflyer.jpg",  title: "Sky Flyer",          tag: "THRILL RIDE",  price: 150, rating: 4.8, blurb: "Swing forty metres above the boulevard." },
    { img: "snow.jpg",      title: "Snow World",         tag: "ARCTIC DOME",  price: 220, rating: 4.9, blurb: "A sub-zero village of ice and igloos." },
    { img: "gondola.jpg",   title: "Grand Canal Ride",   tag: "VENICE",       price: 180, rating: 4.7, blurb: "A gondola glide through lantern-lit canals." },
    { img: "chinatown.jpg", title: "Chinatown Feast",    tag: "DINING",       price: 260, rating: 4.6, blurb: "Seven courses beneath the red pagoda." },
    { img: "diner.jpg",     title: "Route 66 Diner",     tag: "AMERICANA",    price: 130, rating: 4.5, blurb: "Milkshakes, chrome booths, endless jukebox." },
    { img: "japan.jpg",     title: "Tokyo Arcade",       tag: "JAPAN STREET", price: 190, rating: 4.8, blurb: "Retro arcades and a five-storey robot." },
    { img: "pyramid.jpg",   title: "Pyramid Light Show", tag: "EGYPT",        price: 210, rating: 4.9, blurb: "A light spectacle across the great pyramid." },
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
