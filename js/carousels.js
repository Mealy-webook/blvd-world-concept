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


    // Every show gets a photograph of a performance, not of the zone it stands
    // in — a drum troupe, a flamenco pair, a folk stage. Nine zones have a
    // picture of their own act; the rest draw on pools sorted by the kind of
    // show, so a schedule of nine never repeats one picture nine times.
    const ZONE_SHOW = {
      "Saudi Arabia": ["saudi.webp"],
      "Türkiye": ["turkiye.webp"],
      Spain: ["spain.webp"],
      Morocco: ["morocco.webp"],
      China: ["china.webp"],
      Korea: ["korea.webp", "korea-2.webp"],
      Indonesia: ["indonesia.webp"],
      Mexico: ["mexico.webp"],
      Kuwait: ["kuwait.webp"],
      Levant: ["levant.webp"],
    };
    const BY_KIND = {
      STAGE:   ["stage-1.webp", "turkiye.webp", "stage-2.webp"],
      DANCE:   ["dance-1.webp", "dance-2.webp", "levant.webp"],
      ROAMING: ["roam-1.webp", "roam-2.webp", "saudi.webp"],
    };
    function showShot(zone, kind, i) {
      const own = ZONE_SHOW[zone];
      // a zone with its own act leads with it, and comes back to it every
      // other stop rather than letting the generic pool take over
      if (own && i % 2 === 0) return "shows/" + own[(i / 2) % own.length];
      const pool = BY_KIND[kind.split(" ")[0]] || BY_KIND.ROAMING;
      return "shows/" + pool[i % pool.length];
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
      // the night as a ribbon: stops alternate above and below the spine, the
      // time reads on the empty side, and the wait between acts is printed on
      // the spine itself rather than repeated inside every card
      rail.innerHTML = z.items.map((s, i) => {
        const prev = i ? z.items[i - 1] : null;
        return `
        <article class="tl-item is-${i % 2 ? "down" : "up"}${i === 0 ? " is-first" : ""}"
                 style="--d:${Math.min(i, 6) * 60}ms">
          ${prev ? `<span class="tl-gap">${gapText(prev, s)}</span>` : ""}
          <div class="tl-card">
            <span class="show-shot">
              <img src="img/${showShot(z.zone, s.ty, i)}" alt="" loading="lazy" draggable="false">
            </span>
            <div class="show-body">
              <h3 title="${s.n}">${s.n}</h3>
              <p class="show-meta">
                <span class="sm-kind t-${s.ty.split(" ")[0].toLowerCase()}">${s.ty}</span>
                <span class="sm-dur">${s.m} min</span>
              </p>
            </div>
            ${prev ? "" : '<span class="tl-first">Opens the night</span>'}
          </div>
          <span class="tl-stem" aria-hidden="true"></span>
          <span class="tl-node" aria-hidden="true"><i></i></span>
          <p class="tl-time">${s.t}<small>${s.ap}</small></p>
        </article>`;
      }).join("");
      rail.scrollLeft = 0;                  // a new zone starts at dusk again
      ctl && ctl.edges();

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
    const ctl = makeRail(rail, $("#show-prev"), $("#show-next"));
    paint(0);
  })();
})();
