// ── this season's zones, as a rail of plates ────────────────────────────
// One plate per zone, carrying its photograph, what the sheets list inside it,
// and a way straight into that zone on the park map.
(function () {
  const rail = document.getElementById("zs-rail");
  if (!rail) return;
  const zones = (window.WBK && WBK.zones) || [];
  if (!zones.length) return;

  const pins = (WBK.mapPins || []);
  // the map's own colour for each zone, so a plate and its badge agree
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

  function counts(name) {
    const alt = ALIAS[name];
    const n = (o, k) => (o instanceof Map ? o.get(k) : o[k]) || 0;
    const exp = n(expOf, name) || n(expOf, alt);
    const eat = n(eatOf, name) || n(eatOf, alt);
    const show = n(showOf, name) || n(showOf, alt);
    const bits = [];
    if (exp) bits.push(`${exp} to do`);
    if (eat) bits.push(`${eat} to eat`);
    if (show) bits.push(`${show} show${show > 1 ? "s" : ""}`);
    return bits;
  }

  rail.innerHTML = zones.map((z, i) => {
    const bits = counts(z.name);
    const tone = toneOf.get(z.name) || "#ffc24d";
    return `
      <a class="zs-card" href="#/map?zone=${encodeURIComponent(z.name)}" style="--tone:${tone}">
        <span class="zs-shot">
          <img src="img/zones/${(z.imgs && z.imgs[0]) || "park1.jpg"}" alt="${z.name}"
               loading="lazy" draggable="false">
          <span class="zs-no">${String(i + 1).padStart(2, "0")}</span>
        </span>
        <span class="zs-text">
          <b>${z.name}</b>
          <span class="zs-blurb">${z.blurb || ""}</span>
          ${bits.length ? `<span class="zs-bits">${bits.map((b) => `<i>${b}</i>`).join("")}</span>` : ""}
        </span>
        <span class="zs-open">Open on the map</span>
      </a>`;
  }).join("");

  /* ── the rail: native snap, with drag and arrows for the mouse ── */
  const prev = document.getElementById("zs-prev");
  const next = document.getElementById("zs-next");
  const page = () => Math.max(240, rail.clientWidth * 0.8);
  prev && prev.addEventListener("click", () => rail.scrollBy({ left: -page(), behavior: "smooth" }));
  next && next.addEventListener("click", () => rail.scrollBy({ left: page(), behavior: "smooth" }));

  let down = false, startX = 0, startLeft = 0, moved = false;
  rail.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "touch") return;
    down = true; moved = false;
    startX = e.clientX; startLeft = rail.scrollLeft;
    rail.classList.add("grabbing");
  });
  rail.addEventListener("pointermove", (e) => {
    if (!down) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 4) { moved = true; rail.style.scrollSnapType = "none"; rail.scrollLeft = startLeft - dx; }
  });
  const release = () => {
    if (!down) return;
    down = false; rail.classList.remove("grabbing"); rail.style.scrollSnapType = "";
  };
  ["pointerup", "pointercancel", "pointerleave"].forEach((ev) => rail.addEventListener(ev, release));
  // a drag must not follow the link it finished on
  rail.addEventListener("click", (e) => { if (moved) e.preventDefault(); }, true);

  function edges() {
    const max = rail.scrollWidth - rail.clientWidth - 2;
    prev && prev.classList.toggle("spent", rail.scrollLeft <= 2);
    next && next.classList.toggle("spent", rail.scrollLeft >= max);
  }
  rail.addEventListener("scroll", edges, { passive: true });
  addEventListener("resize", edges);
  edges();

  /* ── the plates rise in as the rail arrives ── */
  const cards = [...rail.children];
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
    cards.forEach((c) => c.classList.add("in"));
  } else {
    cards.forEach((c, i) => c.style.setProperty("--d", (i % 6) * 70 + "ms"));
    const io = new IntersectionObserver((es) => {
      for (const en of es) if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
    }, { threshold: 0.2 });
    cards.forEach((c) => io.observe(c));
    setTimeout(() => cards.forEach((c) => c.classList.add("in")), 4000);
  }
})();
