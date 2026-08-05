// ── the season's poster zones, on the coverflow ─────────────────────────
// Only zones with a campaign poster ride the ring. The rest of WBK.zones stays
// where it is — the park map reads it for POI thumbnails — it simply isn't shown
// here, because a ring that mixes finished poster artwork with darkened stock
// photographs reads as half-built.
//
// The carousel itself is the ported CoverflowCarousel in js/coverflow.js.
(function () {
  const root = document.getElementById("zone-flow");
  if (!root || !window.WBK || !window.WBK_COVERFLOW) return;

  const items = (WBK.zones || []).filter((z) => z.poster);
  if (!items.length) return;

  // The three that debuted this season, per the Saudi Press Agency's own
  // coverage: Indonesia, South Korea and Kuwait each got a "new destination"
  // announcement for 2025. Saudi Arabia, Africa, Türkiye and Iran were the
  // season before; Egypt, France and Japan are long-standing, which is why the
  // tag is not simply on the middle three cards in ring order.
  const NEW = new Set(["Indonesia", "South Korea", "Kuwait"]);

  WBK_COVERFLOW.make({
    root,
    items,
    label: "The season's zones",
    cardWidth: "clamp(148px, 18vw, 232px)",   // 3:4 cards, so narrower than the old squares
    rotate: 46,
    depth: 0.62,
    fade: 0.12,
    // The poster carries the country name, the Riyadh Season lockup and the
    // BLVD World mark, so there is no veil and no second name — only a New tag
    // on the three zones that opened this season.
    card: (z) => `
      <span class="zc is-poster">
        <img src="img/zones/posters/${z.poster}" alt="${z.name}"
             draggable="false" loading="lazy">
        ${NEW.has(z.name) ? '<b class="zc-new">New</b>' : ""}
      </span>`,
    // no caption under the ring: the poster is the caption
    showCaption: false,
  });
})();
