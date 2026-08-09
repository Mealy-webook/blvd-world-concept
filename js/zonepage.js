// ── a zone, in full ─────────────────────────────────────────────────────────
// Built from the data the site already holds, not from a page written per zone:
//
//   WBK.zones           the blurb, the poster, the photographs, and the zone's own
//                       lists of attractions, kitchens and rides
//   WBK.parkExperiences the experiences filed under the zone
//   WBK.restaurants     the restaurants filed under it, with cuisine and prices
//   WBK.showsByZone     tonight's schedule for it
//   WBK.mapPins         where it is on the park map
//
// So a zone added to WBK.zones gets a page with no further work, and a page can
// never claim something the data does not have: every block below renders only if
// its source has something to say.
//
// SHOPS AND RETAIL IS THE ONE BLOCK THAT NEVER RENDERS, because nothing in this
// project carries retail. The booklet we were pointed at downloaded as an incomplete
// PDF — no page tree, no text — so there was nothing to take from it either. The
// block is written and waiting; give a zone a `shops` array and it appears. Naming
// twenty zones' shops out of nothing would have been the one thing on this page that
// could not be checked. See CREDITS.md.
(function () {
  const body = document.getElementById("zp-body");
  if (!body || !window.WBK) return;

  const esc = (v) => String(v == null ? "" : v)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  /* the map files zones under names the globe spells differently; the map page
     already carries this table, and getting it wrong here means an empty locator */
  const ALIAS = new Map([["Korea", "South Korea"], ["USA", "United States"], ["TURKEY", "Türkiye"]]);
  const canon = (z) => ALIAS.get(z) || z;

  function zoneFromHash() {
    const m = location.hash.match(/[?&]z=([^&]+)/);
    return m ? decodeURIComponent(m[1]) : "";
  }

  /* ── what the data can and cannot give a block ──
     The zones' ride lists are their own names — "Pharaoh's Drop Tower", "Scarab
     Spinner" — and the fourteen rides that have photographs are different rides.
     So the rides block is typographic on purpose: matching a name to a photograph
     would have put the wrong ride under half of them.

     The restaurants, by contrast, carry a designed palette each (brand.plate and
     brand.ink), so the kitchens are the most visual block on the page and are built
     out of the data's own colours rather than a colour I chose.

     Nine zones have a photograph of their own act; the rest draw on pools by the
     kind of show. That table lives in js/carousels.js and is repeated here rather
     than exported, because it is a fact about the photographs on disk. */
  const ZONE_SHOW = {
    "Saudi Arabia": ["saudi.webp"], "Türkiye": ["turkiye.webp"], Spain: ["spain.webp"],
    Morocco: ["morocco.webp"], China: ["china.webp"],
    "South Korea": ["korea.webp", "korea-2.webp"], Indonesia: ["indonesia.webp"],
    Mexico: ["mexico.webp"], Kuwait: ["kuwait.webp"], Levant: ["levant.webp"],
  };
  const BY_KIND = {
    STAGE:   ["stage-1.webp", "turkiye.webp", "stage-2.webp"],
    DANCE:   ["dance-1.webp", "dance-2.webp", "levant.webp"],
    ROAMING: ["roam-1.webp", "roam-2.webp", "saudi.webp"],
  };
  /* The rotation is the shows page's, not a simplification of it: a zone with an act
     of its own leads with it and comes back to it every other stop, and the rest
     comes from a pool sorted by the kind of show. Passing one photograph for the
     whole zone — which is what this page did first — put the same picture on all
     nine rows, which is the exact thing the shows page wrote that rule to avoid. */
  function showShot(zone, kind, i) {
    const own = ZONE_SHOW[zone];
    if (own && i % 2 === 0) return own[(i / 2) % own.length];
    const pool = BY_KIND[(kind || "ROAMING").split(" ")[0]] || BY_KIND.ROAMING;
    return pool[i % pool.length];
  }

  /* ── the hero ──
     The poster stands on a floor that recedes, which is the frame the records
     section uses and the one thing on this site that reliably reads as "here is the
     object". It replaces a band with a picture behind it: a band gives a zone the
     same shape as every other zone, and the whole point of twenty of these pages is
     that they are twenty places.

     The zone's own photograph is still back there, far out of focus, so the page has
     the colour of the place without competing with the poster standing in front of
     it. */
  function head(zone, tone, facts) {
    const shot = (zone.imgs || [])[0];
    const poster = zone.poster ? `img/zones/posters/${zone.poster}` : null;
    return `
      <header class="zp-hero" style="--tone:${esc(tone)}">
        ${shot ? `<img class="zp-back" src="img/zones/${esc(shot)}" alt="" aria-hidden="true" />` : ""}
        <span class="zp-veil" aria-hidden="true"></span>

        <div class="zp-hero-in">
          <div class="zp-title">
            <p class="zp-eyebrow"><i aria-hidden="true"></i>A zone of BLVD World</p>
            <h1 class="zp-name">${esc(zone.name.toUpperCase())}</h1>
            ${zone.blurb ? `<p class="zp-lede">${esc(zone.blurb)}</p>` : ""}
            <ul class="zp-facts">
              ${facts.map((f) => `
                <li><b data-to="${f.n}">${f.n}</b><span>${esc(f.label)}</span></li>`).join("")}
            </ul>
            <div class="zp-go">
              <a class="pill light big-pill" href="#/shows">Tonight&#8217;s schedule</a>
              <a class="pill ghost big-pill" href="#/map?zone=${encodeURIComponent(zone.name)}">See it on the map</a>
            </div>
          </div>

          ${poster ? `
            <div class="zp-stage">
              <div class="zp-floor" aria-hidden="true"></div>
              <img class="zp-poster" src="${esc(poster)}" alt="${esc(zone.name)}" draggable="false" />
            </div>` : ""}
        </div>

        <p class="zp-cue" aria-hidden="true"><span>Scroll</span><i></i></p>
      </header>`;
  }

  /* the page's own contents, as chips — a zone page runs long, and a reader who
     wants the schedule should not have to scroll past the kitchens to find it */
  function contents(blocks) {
    if (blocks.length < 3) return "";
    return `
      <div class="zp-jump" role="tablist" aria-label="On this page">
        ${blocks.map((b, i) => `
          <button class="zp-tab${i === 0 ? " on" : ""}" type="button" role="tab"
                  aria-selected="${i === 0 ? "true" : "false"}"
                  aria-controls="zp-${b.id}" data-block="${b.id}">
            <em>${String(i + 1).padStart(2, "0")}</em>${esc(b.label)}
          </button>`).join("")}
      </div>`;
  }

  function block(id, title, note, inner) {
    if (!inner) return "";
    return `
      <section class="zp-block reveal" id="zp-${id}">
        <div class="zp-bh">
          <h2 class="zp-h">${esc(title)}</h2>
          ${note ? `<p class="zp-note">${esc(note)}</p>` : ""}
        </div>
        ${inner}
      </section>`;
  }

  /* A thing we know the name of and nothing else — an attraction, a ride or a
     kitchen the park lists but the data carries no picture or price for.

     It uses the restaurants' card, so the blocks are one component throughout, with
     the zone's own photograph standing in for the missing one. That picture is of the
     zone and not of the thing named on it, which is exactly what the note above each
     block says: a card that looks like a photograph of an attraction, carrying a
     photograph of somewhere near it, has to say so. */
  function nameCards(names, zone) {
    if (!names || !names.length) return "";
    const shot = (zone && (zone.imgs || [])[0]) || null;
    return `<div class="zp-cards">${names.map((n, i) => `
      <article class="eat-card" style="--pop-d:${(i % 6) * 70}ms">
        <div class="eat-shot">
          ${shot ? `<img src="img/zones/${esc(shot)}" alt="" draggable="false" loading="lazy" />` : ""}
        </div>
        <div class="eat-text">
          <p class="eat-meta">${esc(zone ? zone.name : "")}</p>
          <h3>${esc(n)}</h3>
        </div>
      </article>`).join("")}</div>`;
  }

  /* ── experiences: the rail, holding the rail's own card ──
     .rail-wrap / .rail-btn / .rail is this site's horizontal list. The card in it is
     .eat-card, not .xp-card: both have a picture, a name and a price, but .xp-card is
     the experiences page's *coverflow* card — position: absolute, top and left at
     50%, its caption at opacity 0 until the carousel drives it — so in a flex rail
     every one stacked in the middle and showed nothing. .eat-card is the rail card:
     a fixed width, the image above, the type under it. One rail card for both rails.

     Two sources, and they are not the same thing. WBK.experiences are bookable and
     carry an image and a price, so they make cards. A zone's own attraction names
     have neither, so they stay chips — a card with an empty price line is a card
     pretending to be bookable. */
  function experiences(zone, exp, name) {
    const booked = (WBK.experiences || []).filter((x) => canon(x.zone) === name);
    const named = [...(zone.attractions || []), ...((exp && exp.items) || [])]
      .filter((n) => !booked.some((x) => x.title === n));
    if (!booked.length && !named.length) return "";

    return `
      ${booked.length ? `
        <div class="rail-wrap">
          <button class="rail-btn prev" type="button" data-rail="zp-xp-rail"
                  aria-label="Previous experiences">&#8249;</button>
          <div class="rail" id="zp-xp-rail">
            ${booked.map((x) => `
              <article class="eat-card">
                <div class="eat-shot">
                  <img src="img/${esc(x.img)}" alt="${esc(x.title)}" draggable="false" loading="lazy" />
                </div>
                <div class="eat-text">
                  <p class="eat-meta">${esc(zone.name)}</p>
                  <h3>${esc(x.title)}</h3>
                  <p class="eat-from">From <b>SAR ${esc(x.price)}</b></p>
                </div>
              </article>`).join("")}
          </div>
          <button class="rail-btn next" type="button" data-rail="zp-xp-rail"
                  aria-label="More experiences">&#8250;</button>
        </div>` : ""}
      ${named.length ? `
        ${nameCards(named, zone)}` : ""}`;
  }

  /* ── rides: the rail's card, with the prices the rides page publishes ──
     These were rows on the shows page's timeline, which was the right shape for a
     schedule and the wrong one for a menu: a ride has no time and no duration, so
     two of the timeline's three columns were carrying a number that meant nothing.
     As cards they show what a ride actually has — a picture, a name, what it costs
     to ride it and what the fast lane costs. Both figures are WBK's own, the same
     ones #/rides prints. */
  function rides(zone, name) {
    /* Matched by name, not by zone. WBK.rides is the park's ride list — name, kind,
       picture, SAR to ride and SAR for the fast lane — and it carries no zone at
       all; the zones carry ride names. Filtering it by r.zone therefore threw on
       every zone page and took the whole page down with it. */
    const priced = new Map((WBK.rides || []).map((r) => [r.name, r]));
    const list = (zone.rides || []).map((n) => priced.get(n)).filter(Boolean);
    const named = (zone.rides || []).filter((n) => !priced.has(n));
    /* Most zones will land entirely in `named`, with no price on the card, and that
       is the data telling the truth rather than a bug. WBK.rides is the park's
       fourteen priced rides — Wave Swinger, Sky Loop and so on. The zones carry
       their own ride names — Hallyu Spin, Seoul Sky Tower — and the two lists do not
       overlap. A price cannot be attached to a ride nobody has priced; it needs a
       mapping from the client, and until there is one a name is all we have. */
    if (!list.length && !named.length) return "";

    return `
      ${list.length ? `
        <div class="rail-wrap">
          <button class="rail-btn prev" type="button" data-rail="zp-ride-rail"
                  aria-label="Previous rides">&#8249;</button>
          <div class="rail" id="zp-ride-rail">
            ${list.map((r) => `
              <article class="eat-card">
                <div class="eat-shot">
                  <img src="img/rides/${esc(r.img)}" alt="${esc(r.name)}"
                       draggable="false" loading="lazy" />
                </div>
                <div class="eat-text">
                  <p class="eat-meta">${esc(r.kind || "Ride")}</p>
                  <h3>${esc(r.name)}</h3>
                  <p class="eat-from">
                    <b>SAR ${esc(r.reg)}</b>
                    ${r.fast ? `<span class="zp-fast">fast lane SAR ${esc(r.fast)}</span>` : ""}
                  </p>
                </div>
              </article>`).join("")}
          </div>
          <button class="rail-btn next" type="button" data-rail="zp-ride-rail"
                  aria-label="More rides">&#8250;</button>
        </div>` : ""}
      ${nameCards(named, zone)}`;
  }

  /* ── the kitchens: the restaurants page's own card, in the same rail ──
     .eat-card with .eat-shot / .eat-text / .eat-meta / .eat-from, and the branded
     plate the rail builds when a restaurant has one — class for class from
     js/carousels.js rather than restyled here. */
  const MARKS = {
    lotus: '<path d="M24 6c4 6 6 11 6 16s-2 10-6 14c-4-4-6-9-6-14s2-10 6-16z"/>',
    torii: '<path d="M8 16h32v4H8zM12 22h4v20h-4zM32 22h4v20h-4zM6 10h36v4H6z"/>',
    star:  '<path d="M24 6l5 12 13 1-10 8 3 13-11-7-11 7 3-13-10-8 13-1z"/>',
    route: '<path d="M10 38c8-4 8-12 14-16s10-2 14-6M8 20h8v8H8z"/>',
  };
  function plate(r) {
    const b = r.brand;
    if (!b) {
      return r.food
        ? `<img src="img/food/${esc(r.food)}" alt="${esc(r.name)}" draggable="false" loading="lazy" />`
        : "";
    }
    return `
      <div class="eat-logo" style="--plate:${esc(b.plate)};--ink:${esc(b.ink)}"
           role="img" aria-label="${esc(r.name)}">
        <svg class="el-mark" viewBox="0 0 48 48" aria-hidden="true">${MARKS[b.mark] || MARKS.star}</svg>
        <p class="el-word">${esc(b.word || r.name)}</p>
        <p class="el-tag">${esc(b.tag || "")}</p>
      </div>`;
  }

  /* ── the kitchens ──
     The rail carries every restaurant in the park, not only this zone's: there are
     four of them in the data, so on most zone pages the block was three name cards
     and nothing to look at.

     What keeps that honest is the meta line. A card's first line is the zone the
     restaurant is actually in — "EGYPT" on Tante, "JAPAN" on Sakura — so a card on
     the Korea page is plainly a restaurant elsewhere in the park rather than a claim
     about Korea. This zone's own come first, and they are the ones the block is
     about. */
  function kitchens(name, zone) {
    const all = WBK.restaurants || [];
    const own = all.filter((r) => canon(r.zone) === name);
    const away = all.filter((r) => canon(r.zone) !== name);
    const list = [...own, ...away];
    const named = (zone.food || []).filter((f) => !own.some((r) => r.name === f));
    if (!list.length && !named.length) return "";
    return `
      ${list.length ? `
        <div class="rail-wrap">
          <button class="rail-btn prev" type="button" data-rail="zp-eat-rail"
                  aria-label="Previous restaurants">&#8249;</button>
          <div class="rail eat-rail" id="zp-eat-rail">
            ${list.map((r) => `
              <article class="eat-card${canon(r.zone) === name ? " is-here" : ""}">
                <div class="eat-shot">${plate(r)}</div>
                <div class="eat-text">
                  <p class="eat-meta">${esc(r.zone || r.cuisine || "")}</p>
                  <h3>${esc(r.name)}</h3>
                  ${r.from ? `<p class="eat-from">From <b>SAR ${esc(r.from)}</b></p>` : ""}
                </div>
              </article>`).join("")}
          </div>
          <button class="rail-btn next" type="button" data-rail="zp-eat-rail"
                  aria-label="More restaurants">&#8250;</button>
        </div>` : ""}
      ${named.length ? `
        ${nameCards(named, zone)}` : ""}`;
  }

  /* ── tonight, on a rail, led by a photograph of the act ── */
  function schedule(name) {
    const row = (WBK.showsByZone || []).find((s) => canon(s.zone) === name);
    if (!row || !row.items || !row.items.length) return "";
    /* the lead figure this used to compute is gone — every row carries its own
       thumbnail through showShot() now, so nothing here needs a photograph */
    return `
      <div class="zp-tonight">
        <ol class="sch-list">
          ${row.items.map((it, i) => `
            <li class="sch-row${i === 0 ? " is-first" : ""}" style="--d:${Math.min(i, 9) * 45}ms">
              <span class="sch-time">${esc(it.t)}<small>${esc(it.ap || "")}</small></span>
              <span class="sch-shot">
                <img src="img/shows/${esc(showShot(name, it.ty, i))}"
                     alt="" loading="lazy" draggable="false" />
              </span>
              <span class="sch-body">
                <b class="sch-name" title="${esc(it.n)}">${esc(it.n)}</b>
                <span class="sch-meta">
                  <em class="sm-kind t-${esc((it.ty || "roaming").split(" ")[0].toLowerCase())}">${esc(it.ty || "")}</em>
                  ${it.m ? `<em class="sm-dur">${esc(it.m)} min</em>` : ""}
                  ${i ? "" : '<em class="sm-open">Opens the night</em>'}
                </span>
              </span>
            </li>`).join("")}
        </ol>
      </div>`;
  }

  /* ── where it is: the park laid down, the way the home module lays it ── */
  function locator(name, tone) {
    const pin = (WBK.mapPins || []).find((p) => canon(p.zone || p.label) === name);
    if (!pin) return "";
    return `
      <a class="zp-map" href="#/map?zone=${encodeURIComponent(name)}"
         aria-label="Open ${esc(name)} on the park map">
        <span class="zp-map-plane">
          <img src="img/records/lagoon.webp" alt="The park map from above" loading="lazy" />
          <i class="zp-pin" style="left:${pin.x}%; top:${pin.y}%; --tone:${esc(tone)}"></i>
        </span>
        <span class="zp-map-go">Open on the full map</span>
      </a>`;
  }

  /* ── in pictures: the animated gallery, ported ──
     Mechanics taken from 21st.dev's Animated Gallery (youcefbnm): a tall scroll
     container with a sticky stage inside it, three columns of pictures, and the
     whole grid standing up out of the floor — rotateX from 75 degrees to 0 as you
     scroll through it — then each column drifting at its own rate afterwards.

     The original is React with motion/react and Tailwind; this is that behaviour in
     the site's own markup, driven by the scroll position of #zp (the page is its own
     scroller, so window scroll would never move). Same numbers: 75 to 0 degrees over
     the first half, 1.2 to 1 scale over the second, per-column parallax after that.

     Three columns need photographs to fill them and a zone has two or three, so the
     set is repeated across the columns rather than left with holes — and the clip
     rides in the middle column where it lands. */
  function pictures(zone) {
    const imgs = (zone.imgs || []).filter(Boolean);
    if (!imgs.length) return "";

    const COLS = 3;
    const cell = (f) => `
      <img src="img/zones/${esc(f)}" alt="${esc(zone.name)}" loading="lazy"
           draggable="false" onerror="this.remove()" />`;
    const clip = `
      <figure class="zp-vid">
        <!-- a poster, because preload="none" means the box is empty until it plays and
             an empty box in the middle of a wall of photographs reads as a hole -->
        <video src="video/zones/sample-aerial.mp4" poster="img/zones/${esc(imgs[0])}"
               muted loop playsinline preload="none" aria-hidden="true"></video>
        <figcaption>Park footage &#183; not this zone</figcaption>
      </figure>`;

    /* four rows per column reads as a wall; with two photographs that is each one
       twice, which is what the original does with its four-per-column arrays */
    const cols = Array.from({ length: COLS }, (_, c) => {
      /* (c + r), not (c + r*COLS): with three photographs across three columns the
         second stride is a multiple of the count, so every row in a column resolved
         to the same picture and the wall was three columns of one image each. */
      const rows = Array.from({ length: 4 }, (_, r) => imgs[(c + r) % imgs.length]);
      const html = rows.map(cell).join("");
      return `<div class="ag-col" data-col="${c}">${c === 1 ? clip + html : html}</div>`;
    });

    return `
      <div class="ag-scroll">
        <div class="ag-sticky">
          <div class="ag-grid">${cols.join("")}</div>
        </div>
      </div>`;
  }

  function shops(zone) {
    /* waiting on data; see the note at the top of this file */
    if (!zone.shops || !zone.shops.length) return "";
    return nameCards(zone.shops, zone);
  }

  function render() {
    const name = zoneFromHash();
    const zone = (WBK.zones || []).find((z) => z.name === name);

    if (!zone) {
      body.innerHTML = `
        <div class="zp-lost">
          <h1 class="zp-name">ZONE NOT FOUND</h1>
          <p class="zp-lede">Pick one from the ring on the landing page.</p>
          <a class="pill light big-pill" href="#/">Back to the ring</a>
        </div>`;
      return;
    }

    const exp = (WBK.parkExperiences || []).find((e) => canon(e.zone) === name);
    const pin = (WBK.mapPins || []).find((p) => canon(p.zone || p.label) === name);
    /* the page takes its accent from the zone's own colour on the printed park map,
       so twenty zones are twenty pages rather than one page twenty times */
    const tone = (pin && pin.tone) || "#f58220";

    const eats = (WBK.restaurants || []).filter((r) => canon(r.zone) === name);
    const sched = (WBK.showsByZone || []).find((s) => canon(s.zone) === name);
    const expN = (zone.attractions || []).length + ((exp && exp.items) || []).length;
    const rideN = (zone.rides || []).length;
    const eatN = eats.length + (zone.food || []).length;
    const showN = sched && sched.items ? sched.items.length : 0;

    /* counted, never typed — and only the figures with something to count */
    const facts = [
      { n: expN, label: expN === 1 ? "experience" : "experiences" },
      { n: rideN, label: rideN === 1 ? "ride" : "rides" },
      { n: eatN, label: "places to eat" },
      { n: showN, label: "shows tonight" },
    ].filter((f) => f.n > 0);

    /* The note is on the blocks whose cards borrow the zone's own photograph for
       something the data has no picture of. It is short, and it is not optional: a
       card shaped like a photograph of a ride, carrying a photograph of the street
       outside it, has to say which it is. */
    const BORROWED = "Photographs are of the zone, not of the attraction.";
    const parts = [
      { id: "experiences", label: "Experiences", title: "Experiences", note: BORROWED, html: experiences(zone, exp, name) },
      { id: "rides", label: "Rides", title: "Rides", note: BORROWED, html: rides(zone) },
      { id: "eat", label: "Cuisine", title: "Cuisine", html: kitchens(name, zone) },
      { id: "tonight", label: "Tonight", title: "Live tonight", html: schedule(name) },
      { id: "shops", label: "Shops", title: "Shops and retail", note: BORROWED, html: shops(zone) },
      { id: "pictures", label: "Pictures", title: "In pictures", html: pictures(zone) },
    ].filter((b) => b.html);

    body.style.setProperty("--tone", tone);
    body.innerHTML =
      head(zone, tone, facts) +
      `<div class="zp-main">
         ${contents(parts)}
         <div class="zp-blocks">${parts.map((b) => block(b.id, b.title, b.note || "", b.html)).join("")}</div>
       </div>`;

    dress();
  }

  /* ── the delight, once the markup is in ── */
  function dress() {
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const page = document.getElementById("zp");

    /* The poster leans towards the pointer — on the stage rather than on the image,
       so the perspective belongs to the box and the lean to the thing inside it. */
    const stage = body.querySelector(".zp-poster-stage");
    const poster = body.querySelector(".zp-poster");
    if (stage && poster && !still && matchMedia("(hover: hover) and (pointer: fine)").matches) {
      let raf = null, rx = 0, ry = 0;
      const paint = () => {
        raf = null;
        poster.style.transform = `rotateX(${rx.toFixed(1)}deg) rotateY(${ry.toFixed(1)}deg)`;
      };
      stage.addEventListener("pointermove", (e) => {
        const b = stage.getBoundingClientRect();
        ry = ((e.clientX - (b.left + b.width / 2)) / Math.max(b.width, 1)) * 16;
        rx = -((e.clientY - (b.top + b.height / 2)) / Math.max(b.height, 1)) * 12;
        if (raf === null) raf = requestAnimationFrame(paint);
      });
      stage.addEventListener("pointerleave", () => {
        rx = 0; ry = 0;
        if (raf === null) raf = requestAnimationFrame(paint);
      });
    }

    /* the figures count up when the head is seen, and are already correct in the
       markup before they do */
    const nums = [...body.querySelectorAll(".zp-facts b[data-to]")];
    const factsEl = body.querySelector(".zp-facts");
    if (nums.length && factsEl && !still && "IntersectionObserver" in window) {
      const io = new IntersectionObserver((es) => {
        if (!es.some((e) => e.isIntersecting)) return;
        io.disconnect();
        for (const el of nums) {
          const to = +el.dataset.to;
          let t0 = null;
          const step = (t) => {
            if (t0 === null) t0 = t;
            const k = Math.min((t - t0) / 900, 1);
            el.textContent = String(Math.round(to * (1 - Math.pow(1 - k, 3))));
            if (k < 1) requestAnimationFrame(step);
            else el.textContent = String(to);
          };
          requestAnimationFrame(step);
        }
      }, { root: page, threshold: 0.4 });
      io.observe(factsEl);
    }

    /* Blocks arrive as they are reached. The page is its own scroller, so the
       observer takes it as the root — against the viewport it would report every
       block visible at once and they would all arrive together. */
    const blocks = [...body.querySelectorAll(".reveal")];
    if (blocks.length && "IntersectionObserver" in window) {
      const io = new IntersectionObserver((es) => {
        for (const e of es) {
          if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
        }
      }, { root: page, threshold: 0.1 });
      blocks.forEach((b) => io.observe(b));
    } else {
      blocks.forEach((b) => b.classList.add("in"));
    }

    /* ── the animated gallery's driver ──
       Ported from 21st.dev's Animated Gallery: the grid stands up from 75 degrees to
       0 across the first half of its own scroll, scales 1.2 to 1 across the second,
       and the columns drift at their own rates after that. The original reads a
       window scroll through motion/react's useScroll; this reads #zp, because on
       this page the window never scrolls. */
    const agScroll = body.querySelector(".ag-scroll");
    const agGrid = body.querySelector(".ag-grid");
    if (agScroll && agGrid && page) {
      const agCols = [...agGrid.querySelectorAll(".ag-col")];
      const RANGES = [[-10, 2], [15, 5], [-10, 2]];      // the original's yRange, in %
      let raf = null;
      const paint = () => {
        raf = null;
        const b = agScroll.getBoundingClientRect();
        const h = Math.max(agScroll.offsetHeight - page.clientHeight, 1);
        /* 0 when the block's top reaches the top of the page, 1 when its bottom does */
        const p = Math.min(1, Math.max(0, -b.top / h));
        if (still) {
          agGrid.style.transform = "none";
          return;
        }
        const rise = Math.min(1, p / 0.5);                       // the first half
        /* 55 rather than the original's 75: hinged at the bottom of a window this
           size, anything past about 60 degrees is edge-on and reads as nothing */
        const rot = 55 * (1 - rise);
        const scale = p < 0.5 ? 1.12 : 1.12 - 0.12 * Math.min(1, (p - 0.5) / 0.4);
        agGrid.style.transform = `rotateX(${rot.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
        const drift = Math.min(1, Math.max(0, (p - 0.5) / 0.5));
        agCols.forEach((c, i) => {
          const [from, to] = RANGES[i % RANGES.length];
          c.style.transform = `translateY(${(from + (to - from) * drift).toFixed(2)}%)`;
        });
      };
      paint();
      page.addEventListener("scroll", () => {
        if (raf === null) raf = requestAnimationFrame(paint);
      }, { passive: true });
      addEventListener("resize", () => { if (raf === null) raf = requestAnimationFrame(paint); }, { passive: true });
    }

    /* the clip plays only while it is on screen */
    const vid = body.querySelector(".zp-vid video");
    if (vid && !still && "IntersectionObserver" in window) {
      new IntersectionObserver((es) => {
        for (const e of es) {
          if (e.isIntersecting) { const pr = vid.play(); if (pr && pr.catch) pr.catch(() => {}); }
          else vid.pause();
        }
      }, { root: page, threshold: 0.3 }).observe(vid);
    }

    /* the contents chips scroll rather than jump, and light up where you are */
    const jump = body.querySelector(".zp-jump");
    if (jump && page) {
      jump.addEventListener("click", (e) => {
        const a = e.target.closest("a");
        if (!a) return;
        const el = body.querySelector(a.getAttribute("href"));
        if (!el) return;
        e.preventDefault();
        page.scrollTo({ top: el.offsetTop - 86, behavior: still ? "auto" : "smooth" });
      });
      const links = [...jump.querySelectorAll("a")];
      const spy = new IntersectionObserver((es) => {
        for (const e of es) {
          if (!e.isIntersecting) continue;
          links.forEach((a) => a.classList.toggle("on", a.getAttribute("href") === "#" + e.target.id));
        }
      }, { root: page, rootMargin: "-45% 0px -50% 0px" });
      links.forEach((a) => {
        const sc = body.querySelector(a.getAttribute("href"));
        if (sc) spy.observe(sc);
      });
    }

    /* ── the tabs ──
       One block at a time, the way the records section works. The index used to be
       jump links down a stack; as tabs the page is one screen deep instead of six,
       and the label you press is the thing you get rather than a place you are sent.

       hidden comes off before the class goes on, and offsetHeight forces the layout
       in between: a block cannot transition out of display: none, and reading the
       layout is what gives the transition a frame to start from. Waiting a
       requestAnimationFrame instead would fail in a background tab. */
    const tabs = [...body.querySelectorAll(".zp-tab")];
    const panels = [...body.querySelectorAll(".zp-block")];
    function showBlock(id) {
      for (const t of tabs) {
        const on = t.dataset.block === id;
        t.classList.toggle("on", on);
        t.setAttribute("aria-selected", on ? "true" : "false");
      }
      for (const b of panels) {
        const on = b.id === `zp-${id}`;
        if (on) {
          b.hidden = false;
          void b.offsetHeight;
          b.classList.add("in");
        } else {
          b.classList.remove("in");
          b.hidden = true;
        }
      }
    }
    if (tabs.length) {
      for (const t of tabs) t.addEventListener("click", () => showBlock(t.dataset.block));
      /* left and right move between them, which is what a tablist promises */
      body.querySelector(".zp-jump").addEventListener("keydown", (e) => {
        const at = tabs.indexOf(document.activeElement);
        const by = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        if (at < 0 || !by) return;
        e.preventDefault();
        const next = tabs[(at + by + tabs.length) % tabs.length];
        next.focus();
        showBlock(next.dataset.block);
      });
      showBlock(tabs[0].dataset.block);
    }

    /* ── the components' own entrances ──
       Both cards ship at opacity 0 and wait for a class: .eat-card wants .pop with a
       --pop-d stagger, .sch-row wants .in. Their own pages add them from an observer,
       so a page that borrows the markup and not the activation gets a rail of
       invisible cards and a schedule of invisible rows — which is exactly what this
       page had. Using a component means using its entrance too. */
    const cards = [...body.querySelectorAll(".eat-card")];
    cards.forEach((c, i) => c.style.setProperty("--pop-d", (i % 6) * 70 + "ms"));
    const rows = [...body.querySelectorAll(".sch-row")];
    if (still || !("IntersectionObserver" in window)) {
      cards.forEach((c) => c.classList.add("pop"));
      rows.forEach((rw) => rw.classList.add("in"));
    } else {
      const enter = new IntersectionObserver((es) => {
        for (const e of es) {
          if (!e.isIntersecting) continue;
          e.target.classList.add(e.target.classList.contains("eat-card") ? "pop" : "in");
          enter.unobserve(e.target);
        }
      }, { root: page, threshold: 0.15 });
      [...cards, ...rows].forEach((el) => enter.observe(el));
      /* a fail-open, the way both of those pages have one: nothing may be left
         invisible because an observer did not fire */
      setTimeout(() => {
        cards.forEach((c) => c.classList.add("pop"));
        rows.forEach((rw) => rw.classList.add("in"));
      }, 3500);
    }

    /* The rail arrows, the same nudge the other pages give theirs — and .spent when
       there is nothing to scroll to, which the component already styles (dimmed and
       inert). Two experience cards in a rail this wide leaves both arrows pointing at
       nothing, and an arrow that does nothing when pressed is worse than no arrow. */
    for (const rail of body.querySelectorAll(".rail")) {
      const btns = [...body.querySelectorAll(`.rail-btn[data-rail="${rail.id}"]`)];
      const mark = () => {
        const room = rail.scrollWidth - rail.clientWidth;
        const at = rail.scrollLeft;
        btns.forEach((b) => {
          const isPrev = b.classList.contains("prev");
          b.classList.toggle("spent", room < 4 || (isPrev ? at < 4 : at > room - 4));
        });
      };
      for (const b of btns) {
        b.addEventListener("click", () => {
          const card = rail.firstElementChild;
          const step = card ? card.getBoundingClientRect().width + 16 : 260;
          rail.scrollBy({ left: b.classList.contains("prev") ? -step : step,
                          behavior: still ? "auto" : "smooth" });
        });
      }
      rail.addEventListener("scroll", mark, { passive: true });
      mark();
      /* the cards are lazy, so the rail's width is not final on the first pass */
      setTimeout(mark, 800);
    }

    if (page) page.scrollTop = 0;
  }

  /* rendered on arrival and on every change of zone, so moving between two zones
     without going back to the ring is a re-render rather than a stale page */
  addEventListener("hashchange", () => {
    if (location.hash.startsWith("#/zone")) render();
  });
  if (location.hash.startsWith("#/zone")) render();
})();
