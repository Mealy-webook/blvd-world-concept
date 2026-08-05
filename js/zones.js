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
  // the shows sheet names two zones its own way
  const ALIAS = { "South Korea": "Korea", "United States": "USA" };

  const expOf = new Map((WBK.parkExperiences || []).map((p) => [p.zone, p.items.length]));
  const eatOf = (WBK.restaurants || []).reduce((m, r) => (m[r.zone] = (m[r.zone] || 0) + 1, m), {});
  const showOf = (WBK.showsByZone || []).reduce((m, s) => (m[s.zone] = s.items.length, m), {});
  const num = (o, k) => (o instanceof Map ? o.get(k) : o[k]) || 0;

  function rows(name) {
    const alt = ALIAS[name];
    const out = [];
    const exp = num(expOf, name) || num(expOf, alt);
    const eat = num(eatOf, name) || num(eatOf, alt);
    const show = num(showOf, name) || num(showOf, alt);
    if (exp) out.push(["To do", exp]);
    if (eat) out.push(["To eat", eat]);
    if (show) out.push(["Shows tonight", show]);
    return out;
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
    caption: (z) => {
      const meta = rows(z.name);
      return `
        <p class="cf-tag">${NEW.has(z.name) ? "New this season" : "In the park"}</p>
        <h3 class="cf-title">${z.name}</h3>
        ${z.blurb ? `<p class="cf-sub">${z.blurb}</p>` : ""}
        ${meta.length ? `<dl class="cf-meta">${meta.map(([k, v]) =>
          `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl>` : ""}`;
    },
  });
})();
