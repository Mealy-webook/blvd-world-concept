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

  WBK_COVERFLOW.make({
    root,
    items,
    label: "The season's zones",
    cardWidth: "clamp(148px, 18vw, 232px)",   // 3:4 cards, so narrower than the old squares
    rotate: 46,
    depth: 0.62,
    fade: 0.12,
    // The poster and nothing else: it already carries the country name, the
    // Riyadh Season lockup and the BLVD World mark, so a veil, a NEW badge and a
    // second name on top would only fight it.
    card: (z) => `
      <span class="zc is-poster">
        <img src="img/zones/posters/${z.poster}" alt="${z.name}"
             draggable="false" loading="lazy">
      </span>`,
    // no caption under the ring: the poster is the caption
    showCaption: false,
  });
})();
