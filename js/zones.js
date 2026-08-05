// ── every zone in the park, on the coverflow ────────────────────────────
// All twenty ride the ring; five carry a NEW tag. The carousel itself is the
// ported CoverflowCarousel in js/coverflow.js.
(function () {
  const root = document.getElementById("zone-flow");
  if (!root || !window.WBK || !window.WBK_COVERFLOW) return;
  const zones = WBK.zones || [];
  if (!zones.length) return;

  // Which zones are new this season is in none of the sheets we have. These
  // five stand in — swap the names when someone confirms the real ones.
  const NEW = new Set(["Egypt", "Saudi Arabia", "Türkiye", "Japan", "Africa"]);

  // the map's own colour for each zone, so a card and its badge agree
  const toneOf = new Map();
  for (const p of WBK.mapPins || []) {
    const key = p.zone || (p.label.charAt(0) + p.label.slice(1).toLowerCase());
    if (!toneOf.has(key)) toneOf.set(key, p.tone);
  }
  // new zones first, so the ring opens on one
  const items = [...zones].sort((a, b) => (NEW.has(b.name) ? 1 : 0) - (NEW.has(a.name) ? 1 : 0));

  WBK_COVERFLOW.make({
    root,
    items,
    label: "The park's zones",
    cardWidth: "clamp(176px, 24vw, 292px)",
    rotate: 46,
    depth: 0.62,
    fade: 0.12,
    card: (z) => `
      <span class="zc" style="--tone:${toneOf.get(z.name) || "#ffc24d"}">
        <img src="img/zones/${(z.imgs && z.imgs[0]) || "park1.jpg"}" alt="${z.name}"
             draggable="false" loading="lazy">
        ${NEW.has(z.name) ? '<b class="zc-new">New</b>' : ""}
        <span class="zc-veil"></span>
        <b class="zc-name">${z.name}</b>
      </span>`,
    // no caption under the ring: the zone's name is already on its own card,
    // and repeating it below only pushed the dots and the CTA down
    showCaption: false,
  });
})();
