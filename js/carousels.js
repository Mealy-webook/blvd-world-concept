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

  // ── delight: cards lean towards the cursor and catch the light ──
  // one listener per rail, not per card, and everything the browser animates
  // is a custom property the compositor can cheaply resolve
  function liven(rail, sel) {
    rail.addEventListener("pointermove", (e) => {
      const card = e.target.closest(sel);
      if (!card) return;
      const b = card.getBoundingClientRect();
      const x = (e.clientX - b.left) / b.width;      // 0 → 1 across the card
      const y = (e.clientY - b.top) / b.height;
      card.style.setProperty("--rx", ((0.5 - y) * 7).toFixed(2) + "deg");
      card.style.setProperty("--ry", ((x - 0.5) * 9).toFixed(2) + "deg");
      card.style.setProperty("--mx", (x * 100).toFixed(1) + "%");
      card.style.setProperty("--my", (y * 100).toFixed(1) + "%");
    });
    rail.addEventListener("pointerout", (e) => {
      const card = e.target.closest(sel);
      if (card) card.style.cssText = "";             // settle back to flat
    });
  }

  // cards flip up in sequence the first time their rail comes into view
  function stagger(rail) {
    const cards = [...rail.children];
    cards.forEach((c, i) => c.style.setProperty("--pop-d", (i % 6) * 70 + "ms"));
    const pop = () => cards.forEach((c) => c.classList.add("pop"));
    const io = new IntersectionObserver((es) => {
      for (const en of es) if (en.isIntersecting) { pop(); io.disconnect(); }
    }, { threshold: 0.12 });
    io.observe(rail);
    // the cards start invisible, so never let a missed observer hide them:
    // after a few seconds they show themselves regardless
    setTimeout(() => { pop(); io.disconnect(); }, 4000);
  }

  /* ── DINING ── */
  (function dining() {
    const rail = $("#eat-rail");
    if (!rail) return;
    const data = (window.WBK && WBK.restaurants) || [];
    rail.innerHTML = data.map((r) => `
      <article class="eat-card">
        <div class="eat-shot">
          <img src="img/zones/${r.img}" alt="${r.name}" draggable="false" loading="lazy">
          <span class="eat-price">from <b>SAR ${r.from}</b><small>per person</small></span>
        </div>
        <div class="eat-text">
          <span class="eat-cuisine">${r.cuisine}</span>
          <h3>${r.name}</h3>
          <p>${r.desc}</p>
          <span class="eat-zone">${r.zone} zone</span>
        </div>
        <i class="sheen" aria-hidden="true"></i>
      </article>`).join("");
    makeRail(rail, $("#eat-prev"), $("#eat-next"));
    liven(rail, ".eat-card");
    stagger(rail);
  })();

  /* ── RIDES live in js/fan.js as a fanned deck ── */

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
