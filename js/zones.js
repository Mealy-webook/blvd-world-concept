// ── this season's new zones, on the same fanned deck the experiences use ──
// The deck itself lives in js/fan.js; this only supplies the five cards and
// where each one goes.
(function () {
  const deck = document.getElementById("zone-fan");
  if (!deck || !window.WBK || !window.WBK_FAN) return;
  const zones = WBK.zones || [];
  if (!zones.length) return;

  // Which zones are new this season is not in any sheet we have. These five
  // stand in — they are the ones with the most listed inside them, so the cards
  // have something to say. Swap the names when someone confirms the real five.
  const NEW = ["Egypt", "Saudi Arabia", "Türkiye", "Japan", "Africa"];

  const pins = WBK.mapPins || [];
  const toneOf = new Map();
  for (const p of pins) {
    const key = p.zone || (p.label.charAt(0) + p.label.slice(1).toLowerCase());
    if (!toneOf.has(key)) toneOf.set(key, p.tone);
  }
  // the shows sheet names two zones its own way
  const ALIAS = { "South Korea": "Korea", "United States": "USA" };

  const expOf = new Map((WBK.parkExperiences || []).map((p) => [p.zone, p.items.length]));
  const eatOf = (WBK.restaurants || []).reduce((m, r) => (m[r.zone] = (m[r.zone] || 0) + 1, m), {});
  const showOf = (WBK.showsByZone || []).reduce((m, s) => (m[s.zone] = s.items.length, m), {});
  const num = (o, k) => (o instanceof Map ? o.get(k) : o[k]) || 0;

  function bitsFor(name) {
    const alt = ALIAS[name];
    const exp = num(expOf, name) || num(expOf, alt);
    const eat = num(eatOf, name) || num(eatOf, alt);
    const show = num(showOf, name) || num(showOf, alt);
    const out = [];
    if (exp) out.push(`${exp} to do`);
    if (eat) out.push(`${eat} to eat`);
    if (show) out.push(`${show} show${show > 1 ? "s" : ""}`);
    return out;
  }

  const items = NEW.map((n) => zones.find((z) => z.name === n)).filter(Boolean);

  WBK_FAN.make({
    deckId: "zone-fan", prevId: "zone-prev", nextId: "zone-next", dotsId: "zone-dots",
    items,
    card: (z) => {
      const bits = bitsFor(z.name);
      return `
      <article class="fan-card is-zone" style="--tone:${toneOf.get(z.name) || "#ffc24d"}">
        <img src="img/zones/${(z.imgs && z.imgs[0]) || "park1.jpg"}" alt="${z.name}"
             draggable="false" loading="lazy">
        <div class="fan-meta">
          <span class="ride-kind zone">NEW THIS SEASON</span>
          <h3>${z.name}</h3>
          <p class="zf-blurb">${z.blurb || ""}</p>
          ${bits.length ? `<span class="zf-bits">${bits.map((b) => `<i>${b}</i>`).join("")}</span>` : ""}
          <a class="zf-open" href="#/map?zone=${encodeURIComponent(z.name)}">Open on the map</a>
        </div>
      </article>`;
    },
  });
})();
