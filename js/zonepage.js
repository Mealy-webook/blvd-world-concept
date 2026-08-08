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
    "Saudi Arabia": "saudi.webp", "Türkiye": "turkiye.webp", Spain: "spain.webp",
    Morocco: "morocco.webp", China: "china.webp", "South Korea": "korea.webp",
    Indonesia: "indonesia.webp", Mexico: "mexico.webp", Kuwait: "kuwait.webp",
    Levant: "levant.webp",
  };
  const KIND_SHOW = { STAGE: "stage-1.webp", DANCE: "dance-1.webp", ROAMING: "roam-1.webp" };

  function head(zone, tone, facts) {
    const shot = (zone.imgs || [])[0];
    const poster = zone.poster ? `img/zones/posters/${zone.poster}` : null;
    return `
      <header class="zp-hero" style="--tone:${esc(tone)}">
        ${shot ? `<img class="zp-back" src="img/zones/${esc(shot)}" alt="" aria-hidden="true" />` : ""}
        <span class="zp-veil" aria-hidden="true"></span>
        <div class="zp-hero-in">
          ${poster ? `
            <div class="zp-poster-stage">
              <img class="zp-poster" src="${esc(poster)}" alt="${esc(zone.name)}" draggable="false" />
            </div>` : ""}
          <div class="zp-title">
            <p class="zp-eyebrow"><i aria-hidden="true"></i>A zone of BLVD World</p>
            <h1 class="zp-name">${esc(zone.name.toUpperCase())}</h1>
            ${zone.blurb ? `<p class="zp-lede">${esc(zone.blurb)}</p>` : ""}
            <ul class="zp-facts">
              ${facts.map((f) => `
                <li><b data-to="${f.n}">${f.n}</b><span>${esc(f.label)}</span></li>`).join("")}
            </ul>
            <div class="zp-go">
              <a class="pill solid big-pill" href="https://webook.com" target="_blank" rel="noopener">Book entry ticket</a>
              <a class="pill ghost big-pill" href="#/map?zone=${encodeURIComponent(zone.name)}">See it on the map</a>
            </div>
          </div>
        </div>
      </header>`;
  }

  /* the page's own contents, as chips — a zone page runs long, and a reader who
     wants the schedule should not have to scroll past the kitchens to find it */
  function contents(blocks) {
    if (blocks.length < 3) return "";
    return `
      <nav class="zp-jump" aria-label="On this page">
        ${blocks.map((b) => `<a href="#zp-${b.id}">${esc(b.label)}</a>`).join("")}
      </nav>`;
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

  /* ── experiences: an editorial column beside one real photograph ── */
  function experiences(zone, exp) {
    const items = [...(zone.attractions || []), ...((exp && exp.items) || [])];
    if (!items.length) return "";
    const fig = exp && exp.img ? `img/zones/${exp.img}` : null;
    return `
      <div class="zp-exp">
        ${fig ? `<figure class="zp-exp-shot"><img src="${esc(fig)}" alt="" loading="lazy" onerror="this.closest('figure').remove()" /></figure>` : ""}
        <ol class="zp-exp-list">
          ${items.map((it, n) => `
            <li>
              <span class="zp-n">${String(n + 1).padStart(2, "0")}</span>
              <b>${esc(it)}</b>
            </li>`).join("")}
        </ol>
      </div>`;
  }

  /* ── rides: tickets, not photographs. See the note above. ── */
  function rides(zone) {
    const items = zone.rides || [];
    if (!items.length) return "";
    return `
      <ul class="zp-rides">
        ${items.map((r, n) => `
          <li><span class="zp-n">${String(n + 1).padStart(2, "0")}</span><b>${esc(r)}</b>
              <i aria-hidden="true"></i></li>`).join("")}
      </ul>`;
  }

  /* ── the kitchens, in their own colours ── */
  function kitchens(name, zone) {
    const own = (WBK.restaurants || []).filter((r) => canon(r.zone) === name);
    const named = (zone.food || []).filter((f) => !own.some((r) => r.name === f));
    if (!own.length && !named.length) return "";
    return `
      ${own.length ? `
        <div class="zp-eats">
          ${own.map((r) => {
            const b = r.brand || {};
            return `
              <article class="zp-eat" style="--plate:${esc(b.plate || "#12172f")}; --ink:${esc(b.ink || "#eaf2ff")}">
                ${r.food ? `<img src="img/food/${esc(r.food)}" alt="" loading="lazy" onerror="this.remove()" />` : ""}
                <div class="zp-eat-in">
                  <p class="zp-eat-word">${esc(b.word || r.name)}</p>
                  ${b.tag ? `<p class="zp-eat-tag">${esc(b.tag)}</p>` : ""}
                  <div class="zp-eat-meta">
                    <span>${esc(r.cuisine || "")}</span>
                    ${r.from ? `<em>from SAR ${esc(r.from)}</em>` : ""}
                  </div>
                  ${r.desc ? `<p class="zp-eat-desc">${esc(r.desc)}</p>` : ""}
                </div>
              </article>`;
          }).join("")}
        </div>` : ""}
      ${named.length ? `
        <ul class="zp-chips">${named.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>` : ""}`;
  }

  /* ── tonight, on a rail, led by a photograph of the act ── */
  function schedule(name) {
    const row = (WBK.showsByZone || []).find((s) => canon(s.zone) === name);
    if (!row || !row.items || !row.items.length) return "";
    const first = row.items[0];
    const shot = ZONE_SHOW[name] || KIND_SHOW[(first.ty || "ROAMING").split(" ")[0]] || "roam-1.webp";
    return `
      <div class="zp-tonight">
        <figure class="zp-show-shot">
          <img src="img/shows/${esc(shot)}" alt="" loading="lazy" onerror="this.closest('figure').remove()" />
          <figcaption>${esc(name)} &#183; tonight</figcaption>
        </figure>
        <ol class="zp-sched">
          ${row.items.map((it) => `
            <li>
              <span class="zp-t">${esc(it.t)}<small>${esc(it.ap || "")}</small></span>
              <b>${esc(it.n)}</b>
              <span class="zp-ty">${esc(it.ty || "")}</span>
              ${it.m ? `<span class="zp-m">${esc(it.m)}&#8202;min</span>` : ""}
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

  /* ── in pictures: a mosaic, and the clip labelled for what it is ── */
  function pictures(zone) {
    const imgs = (zone.imgs || []).filter(Boolean);
    if (!imgs.length) return "";
    return `
      <div class="zp-mosaic">
        ${imgs.map((f, n) => `
          <img class="${n === 0 ? "is-lead" : ""}" src="img/zones/${esc(f)}"
               alt="${esc(zone.name)}" loading="lazy" onerror="this.remove()" />`).join("")}
        <figure class="zp-vid">
          <video src="video/zones/sample-aerial.mp4" muted loop playsinline preload="none"
                 aria-hidden="true"></video>
          <figcaption>Park footage &#183; not this zone</figcaption>
        </figure>
      </div>`;
  }

  function shops(zone) {
    /* waiting on data; see the note at the top of this file */
    if (!zone.shops || !zone.shops.length) return "";
    return `<ul class="zp-chips">${zone.shops.map((sh) => `<li>${esc(sh)}</li>`).join("")}</ul>`;
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

    const parts = [
      { id: "experiences", label: "Experiences", title: "Experiences", html: experiences(zone, exp) },
      { id: "rides", label: "Rides", title: "Rides", html: rides(zone) },
      { id: "eat", label: "Cuisine", title: "Cuisine", html: kitchens(name, zone) },
      { id: "tonight", label: "Tonight", title: "Live tonight", html: schedule(name) },
      { id: "shops", label: "Shops", title: "Shops and retail", html: shops(zone) },
      { id: "where", label: "Where", title: "Where it is", html: locator(name, tone) },
      { id: "pictures", label: "Pictures", title: "In pictures", html: pictures(zone) },
    ].filter((b) => b.html);

    body.style.setProperty("--tone", tone);
    body.innerHTML =
      head(zone, tone, facts) +
      contents(parts) +
      `<div class="zp-blocks">${parts.map((b) => block(b.id, b.title, "", b.html)).join("")}</div>`;

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

    if (page) page.scrollTop = 0;
  }

  /* rendered on arrival and on every change of zone, so moving between two zones
     without going back to the ring is a re-render rather than a stale page */
  addEventListener("hashchange", () => {
    if (location.hash.startsWith("#/zone")) render();
  });
  if (location.hash.startsWith("#/zone")) render();
})();
