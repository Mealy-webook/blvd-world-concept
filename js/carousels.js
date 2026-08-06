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
    // The webook product-card structure: square image with a save control in
    // its corner, then meta line, name and price set bare underneath. The meta
    // line is the kitchen's cuisine and nothing else — "Restaurant" in front of
    // it was a word every card carried and none of them needed.
    rail.innerHTML = data.map((r) => `
      <article class="eat-card">
        <div class="eat-shot">
          <img src="img/food/${r.food}" alt="${r.name}" draggable="false" loading="lazy">
          <button class="eat-fav" type="button" aria-pressed="false" aria-label="Save ${r.name}">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5 4.7 13a4.6 4.6 0 0 1 6.5-6.5l.8.8.8-.8A4.6 4.6 0 0 1 19.3 13z"/></svg>
          </button>
        </div>
        <div class="eat-text">
          <p class="eat-meta">${r.cuisine}</p>
          <h3>${r.name}</h3>
          <p class="eat-from">${r.booking ? `<b>${r.booking}</b>` : `From <b>SAR ${r.from}</b>`}</p>
        </div>
      </article>`).join("");
    // the heart is a local toggle; there is no account to save against yet
    rail.addEventListener("click", (e) => {
      const fav = e.target.closest(".eat-fav");
      if (!fav) return;
      e.preventDefault();
      const on = fav.classList.toggle("on");
      fav.setAttribute("aria-pressed", on ? "true" : "false");
    });
    makeRail(rail, $("#eat-prev"), $("#eat-next"));
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
      // The night as a programme, read down the page: the time hangs in the left
      // margin, the act sits beside it, and the wait between acts is printed on
      // the rule that separates them. The horizontal timeline this replaces was
      // built for a band on the home page; this is a page, so the schedule can
      // simply be a schedule.
      rail.innerHTML = z.items.map((s, i) => {
        const prev = i ? z.items[i - 1] : null;
        return `
        <li class="sch-row${i === 0 ? " is-first" : ""}" style="--d:${Math.min(i, 9) * 45}ms">
          ${prev ? `<span class="sch-gap"><i></i>${gapText(prev, s)}<i></i></span>` : ""}
          <span class="sch-time">${s.t}<small>${s.ap}</small></span>
          <span class="sch-shot">
            <img src="img/${showShot(z.zone, s.ty, i)}" alt="" loading="lazy" draggable="false">
          </span>
          <span class="sch-body">
            <b class="sch-name" title="${s.n}">${s.n}</b>
            <span class="sch-meta">
              <em class="sm-kind t-${s.ty.split(" ")[0].toLowerCase()}">${s.ty}</em>
              <em class="sm-dur">${s.m} min</em>
              ${prev ? "" : '<em class="sm-open">Opens the night</em>'}
            </span>
          </span>
        </li>`;
      }).join("");
      rail.scrollTop = 0;

      // the rows arrive in sequence
      const rows = $$(".sch-row", rail);
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
        rows.forEach((r) => r.classList.add("in"));
      } else {
        const io = new IntersectionObserver((es) => {
          for (const e of es) if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
        }, { root: rail, threshold: 0.2 });
        rows.forEach((r) => io.observe(r));
        setTimeout(() => rows.forEach((r) => r.classList.add("in")), 3000);
      }

      $$("button", tabs).forEach((b, i) => {
        b.classList.toggle("on", i === zi);
        b.setAttribute("aria-selected", i === zi ? "true" : "false");
      });
    }

    // The chips themselves — one per zone, each flying its flag. This line was
    // lost when the timeline was replaced by the programme: the rewrite spliced
    // from paint() to the click wiring, and the markup builder sat between them,
    // so the row rendered as an empty 38px strip.
    tabs.innerHTML = zones.map((z, i) => `
      <button type="button" role="tab" aria-selected="${i === 0}" class="${i === 0 ? "on" : ""}">
        <span class="tab-flag" aria-hidden="true">${flag(z.zone)}</span>${z.zone}
      </button>`).join("");

    $$("button", tabs).forEach((b, i) => b.addEventListener("click", () => paint(i)));
    paint(0);
  })();
})();
