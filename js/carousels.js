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


    // Every show gets a thumbnail. The zone's own photograph leads; where a
    // zone runs several shows we rotate through park imagery that suits the
    // kind of show, so a schedule of nine doesn't repeat one picture nine times.
    const ZONE_SHOT = {
      "Saudi Arabia": "zones/saudi.jpg", Egypt: "zones/egypt.jpg", "Türkiye": "zones/turkey.jpg",
      France: "zones/france.jpg", Italy: "zones/italy.jpg", Spain: "zones/park5.jpg",
      Greece: "zones/park7.jpg", Morocco: "zones/park5.jpg", Levant: "zones/park3.jpg",
      India: "zones/park6.jpg", China: "zones/china.jpg", Japan: "zones/japan.jpg",
      Korea: "zones/park6.jpg", Indonesia: "zones/park8.jpg", Asia: "zones/park2.jpg",
      USA: "zones/usa.jpg", Mexico: "zones/mexico.jpg", Iran: "zones/park4.jpg",
      Africa: "zones/park1.jpg",
    };
    const BY_KIND = {
      STAGE:   ["gallery/fireworks.jpg", "gallery/rock-mapping.jpg", "zones/park4.jpg"],
      DANCE:   ["gallery/rock-mapping.jpg", "zones/park2.jpg", "gallery/fireworks.jpg"],
      ROAMING: ["gallery/night-aerial.jpg", "zones/park3.jpg", "gallery/greek-zone.jpg"],
    };
    function showShot(zone, kind, i) {
      const zoneShot = ZONE_SHOT[zone] || "zones/park1.jpg";
      if (i % 2 === 0) return zoneShot;                       // the zone leads
      const pool = BY_KIND[kind.split(" ")[0]] || BY_KIND.ROAMING;
      return pool[Math.floor(i / 2) % pool.length];
    }


    // showtimes are 12-hour with no meridiem crossing marked, so read them as
    // minutes from 8 PM: anything before 8 belongs to the small hours
    function toMinutes(t, ap) {
      const [h, m] = t.split(":").map(Number);
      let hh = h % 12;
      if (ap === "PM") hh += 12;
      if (hh < 20) hh += 24;                 // 12:10 AM and later run past midnight
      return hh * 60 + m;
    }
    function gapText(a, b) {
      const d = toMinutes(b.t, b.ap) - toMinutes(a.t, a.ap);
      if (d <= 0) return "moments";
      if (d < 60) return d + " min";
      const h = Math.floor(d / 60), r = d % 60;
      return r ? `${h}h ${r}m` : `${h}h`;
    }

    function paint(zi) {
      const z = zones[zi];
      if (!z) return;
      // the night as a timeline: time on the outside, a node on the spine,
      // the show itself on the card side
      rail.innerHTML = z.items.map((s, i) => {
        const prev = i ? z.items[i - 1] : null;
        return `
        <article class="tl-item${i === 0 ? " is-first" : ""}" style="--d:${Math.min(i, 6) * 60}ms">
          <p class="tl-time">${s.t}<small>${s.ap}</small></p>
          <span class="tl-node" aria-hidden="true"><i></i></span>
          <div class="tl-card">
            <span class="show-shot">
              <img src="img/${showShot(z.zone, s.ty, i)}" alt="" loading="lazy" draggable="false">
              <i class="show-dur">${s.m}'</i>
            </span>
            <div class="show-body">
              <h3>${s.n}</h3>
              <p>${s.m} minutes${prev ? ` &#183; ${gapText(prev, s)} after the last` : " &#183; opens the night"}</p>
            </div>
            <span class="show-type t-${s.ty.split(" ")[0].toLowerCase()}">${s.ty}</span>
          </div>
        </article>`;
      }).join("");
      // reveal the stops in sequence as the timeline arrives
      const items = $$(".tl-item", rail);
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
        items.forEach((it) => it.classList.add("in"));
      } else {
        const io = new IntersectionObserver((es) => {
          for (const en of es) if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
        }, { threshold: 0.2 });
        items.forEach((it) => io.observe(it));
        setTimeout(() => items.forEach((it) => it.classList.add("in")), 3500);
      }

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
