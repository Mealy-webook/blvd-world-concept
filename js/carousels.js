// ── peek rails: several cards readable at once, snapping as they slide ──
// Native scroll-snap does the heavy lifting (real momentum on trackpad and
// touch, keyboard support, no transform maths), with drag-to-pan and arrows
// layered on for the mouse.
(function () {
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];

  function makeRail(rail, prev, next) {
    if (!rail) return null;

    const page = () => Math.max(220, rail.clientWidth * 0.8);
    prev && prev.addEventListener("click", () => rail.scrollBy({ left: -page(), behavior: "smooth" }));
    next && next.addEventListener("click", () => rail.scrollBy({ left: page(), behavior: "smooth" }));

    // click-drag to pan, without stealing clicks from anything inside a card
    let down = false, startX = 0, startLeft = 0, moved = false;
    rail.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "touch") return;        // native touch scrolling is better
      down = true; moved = false;
      startX = e.clientX; startLeft = rail.scrollLeft;
      rail.classList.add("grabbing");
    });
    rail.addEventListener("pointermove", (e) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) {
        moved = true;
        rail.style.scrollSnapType = "none";         // glide freely while dragging
        rail.scrollLeft = startLeft - dx;
      }
    });
    function release() {
      if (!down) return;
      down = false;
      rail.classList.remove("grabbing");
      rail.style.scrollSnapType = "";               // then settle on the nearest card
    }
    rail.addEventListener("pointerup", release);
    rail.addEventListener("pointercancel", release);
    rail.addEventListener("pointerleave", release);
    rail.addEventListener("click", (e) => { if (moved) e.preventDefault(); }, true);

    // dim the arrows at the ends
    function edges() {
      const max = rail.scrollWidth - rail.clientWidth - 2;
      prev && prev.classList.toggle("spent", rail.scrollLeft <= 2);
      next && next.classList.toggle("spent", rail.scrollLeft >= max);
    }
    rail.addEventListener("scroll", edges, { passive: true });
    addEventListener("resize", edges);
    edges();
    return { edges };
  }

  /* ── DINING ── */
  (function dining() {
    const rail = $("#eat-rail");
    if (!rail) return;
    const data = (window.WBK && WBK.restaurants) || [];
    rail.innerHTML = data.map((r) => `
      <article class="eat-card">
        <div class="eat-shot"><img src="img/zones/${r.img}" alt="${r.name}" draggable="false" loading="lazy"></div>
        <div class="eat-text">
          <span class="eat-cuisine">${r.cuisine}</span>
          <h3>${r.name}</h3>
          <p>${r.desc}</p>
          <span class="eat-zone">${r.zone} zone</span>
        </div>
      </article>`).join("");
    makeRail(rail, $("#eat-prev"), $("#eat-next"));
  })();

  /* ── RIDES ── */
  (function rides() {
    const rail = $("#ride-rail");
    if (!rail) return;
    const data = (window.WBK && WBK.rides) || [];
    rail.innerHTML = data.map((r) => `
      <article class="ride-card">
        <div class="ride-shot"><img src="img/rides/${r.img}" alt="${r.name}" draggable="false" loading="lazy"></div>
        <div class="ride-text">
          <span class="ride-kind">${r.kind}</span>
          <h3>${r.name}</h3>
        </div>
      </article>`).join("");
    makeRail(rail, $("#ride-prev"), $("#ride-next"));
  })();

  /* ── SHOWS: zone chips + the night's schedule as a vertical list ── */
  (function shows() {
    const rail = $("#show-rail");
    const tabs = $("#show-tabs");
    if (!rail || !tabs) return;
    const zones = (window.WBK && WBK.showsByZone) || [];
    if (!zones.length) return;

    // a flag per zone; zones that aren't a single country get a globe
    const FLAGS = {
      "Saudi Arabia": "🇸🇦", Egypt: "🇪🇬", "Türkiye": "🇹🇷", Turkey: "🇹🇷",
      France: "🇫🇷", Courchevel: "🇫🇷", Italy: "🇮🇹", Spain: "🇪🇸", Greece: "🇬🇷",
      Morocco: "🇲🇦", India: "🇮🇳", China: "🇨🇳", Japan: "🇯🇵", Korea: "🇰🇷",
      "South Korea": "🇰🇷", Indonesia: "🇮🇩", Thailand: "🇹🇭", USA: "🇺🇸",
      "United States": "🇺🇸", Mexico: "🇲🇽", Kuwait: "🇰🇼", Iran: "🇮🇷",
      "United Kingdom": "🇬🇧", Levant: "🌍", Africa: "🌍", Asia: "🌏",
    };
    const flag = (z) => FLAGS[z] || "🌍";

    function paint(zi) {
      const z = zones[zi];
      if (!z) return;
      rail.innerHTML = z.items.map((s) => `
        <article class="show-row">
          <p class="show-time">${s.t}<small>${s.ap}</small></p>
          <div class="show-body"><h3>${s.n}</h3><p>${s.m} minutes</p></div>
          <span class="show-type t-${s.ty.split(" ")[0].toLowerCase()}">${s.ty}</span>
        </article>`).join("");
      $$("button", tabs).forEach((b, i) => {
        b.classList.toggle("on", i === zi);
        b.setAttribute("aria-selected", i === zi ? "true" : "false");
      });
    }

    tabs.innerHTML = zones.map((z, i) => `
      <button type="button" role="tab" aria-selected="${i === 0}" class="${i === 0 ? "on" : ""}">
        <span class="tab-flag" aria-hidden="true">${flag(z.zone)}</span>${z.zone}
      </button>`).join("");
    $$("button", tabs).forEach((b, i) => b.addEventListener("click", () => paint(i)));
    paint(0);
  })();
})();
