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

  /* ── the blocks ── */

  function list(title, items, kind) {
    if (!items || !items.length) return "";
    return `
      <section class="zp-block">
        <h3 class="zp-h">${esc(title)}</h3>
        <ul class="zp-list ${kind || ""}">
          ${items.map((i) => `<li>${esc(i)}</li>`).join("")}
        </ul>
      </section>`;
  }

  function kitchens(name) {
    const own = (WBK.restaurants || []).filter((r) => canon(r.zone) === name);
    const zone = (WBK.zones || []).find((z) => z.name === name);
    const named = (zone && zone.food) || [];
    if (!own.length && !named.length) return "";

    return `
      <section class="zp-block">
        <h3 class="zp-h">Cuisine</h3>
        ${own.length ? `
          <div class="zp-eats">
            ${own.map((r) => `
              <article class="zp-eat">
                <img src="img/food/${esc(r.food || "")}" alt="" loading="lazy"
                     onerror="this.remove()" />
                <div class="zp-eat-t">
                  <b>${esc(r.name)}</b>
                  <span>${esc(r.cuisine || "")}</span>
                  ${r.from ? `<em>from SAR ${esc(r.from)}</em>` : ""}
                </div>
                ${r.desc ? `<p>${esc(r.desc)}</p>` : ""}
              </article>`).join("")}
          </div>` : ""}
        ${named.length ? `
          <ul class="zp-list is-chips">
            ${named.map((f) => `<li>${esc(f)}</li>`).join("")}
          </ul>` : ""}
      </section>`;
  }

  function schedule(name) {
    const row = (WBK.showsByZone || []).find((s) => canon(s.zone) === name);
    if (!row || !row.items || !row.items.length) return "";
    return `
      <section class="zp-block">
        <h3 class="zp-h">Live tonight</h3>
        <ol class="zp-sched">
          ${row.items.map((it) => `
            <li>
              <span class="zp-t">${esc(it.t)}<small>${esc(it.ap || "")}</small></span>
              <b>${esc(it.n)}</b>
              <span class="zp-ty">${esc(it.ty || "")}</span>
              ${it.m ? `<span class="zp-m">${esc(it.m)} min</span>` : ""}
            </li>`).join("")}
        </ol>
      </section>`;
  }

  function locator(name) {
    const pin = (WBK.mapPins || []).find((p) => canon(p.zone || p.label) === name);
    if (!pin) return "";
    return `
      <section class="zp-block">
        <h3 class="zp-h">Where it is</h3>
        <a class="zp-map" href="#/map?zone=${encodeURIComponent(name)}"
           aria-label="Open ${esc(name)} on the park map">
          <img src="img/records/lagoon.webp" alt="The park map" loading="lazy" />
          <i class="zp-pin" style="left:${pin.x}%; top:${pin.y}%; --tone:${esc(pin.tone || "#f58220")}"></i>
          <span class="zp-map-go">Open on the full map</span>
        </a>
      </section>`;
  }

  function pictures(zone) {
    const imgs = (zone.imgs || []).filter(Boolean);
    if (!imgs.length) return "";
    return `
      <section class="zp-block">
        <h3 class="zp-h">In pictures</h3>
        <div class="zp-shots">
          ${imgs.map((f) => `
            <img src="img/zones/${esc(f)}" alt="${esc(zone.name)}" loading="lazy"
                 onerror="this.remove()" />`).join("")}
        </div>
        <!-- The clip is park footage, not this zone's: the only moving pictures in
             the project are cut from a 32-second park banner, and the label says so
             wherever one plays. Same rule as the zone cards. -->
        <figure class="zp-vid">
          <video src="video/zones/sample-aerial.mp4" muted loop playsinline
                 preload="none" aria-hidden="true"></video>
          <figcaption>Park footage &#183; not this zone</figcaption>
        </figure>
      </section>`;
  }

  function shops(zone) {
    /* waiting on data; see the note at the top of this file */
    if (!zone.shops || !zone.shops.length) return "";
    return list("Shops and retail", zone.shops, "is-chips");
  }

  function render() {
    const name = zoneFromHash();
    const zone = (WBK.zones || []).find((z) => z.name === name);

    if (!zone) {
      body.innerHTML = `
        <div class="zp-head">
          <h1 class="sec-title">ZONE NOT FOUND</h1>
          <p class="zp-lede">Pick one from the ring on the landing page.</p>
        </div>`;
      return;
    }

    const exp = (WBK.parkExperiences || []).find((e) => canon(e.zone) === name);
    const experiences = [...(zone.attractions || []), ...((exp && exp.items) || [])];
    const poster = zone.poster ? `img/zones/posters/${zone.poster}` : null;

    body.innerHTML = `
      <header class="zp-head">
        ${poster ? `<img class="zp-poster" src="${esc(poster)}" alt="${esc(zone.name)}" />` : ""}
        <div class="zp-title">
          <p class="zp-eyebrow">A zone of BLVD World</p>
          <h1 class="sec-title">${esc(zone.name.toUpperCase())}</h1>
          ${zone.blurb ? `<p class="zp-lede">${esc(zone.blurb)}</p>` : ""}
          <div class="zp-go">
            <a class="pill solid big-pill" href="https://webook.com" target="_blank" rel="noopener">Book entry ticket</a>
            <a class="pill ghost big-pill" href="#/map?zone=${encodeURIComponent(zone.name)}">See it on the map</a>
          </div>
        </div>
      </header>

      ${list("Experiences", experiences)}
      ${list("Rides", zone.rides)}
      ${kitchens(name)}
      ${schedule(name)}
      ${shops(zone)}
      ${locator(name)}
      ${pictures(zone)}`;

    /* the video only when it is looked at, and never in the background */
    const vid = body.querySelector(".zp-vid video");
    if (vid && !matchMedia("(prefers-reduced-motion: reduce)").matches && "IntersectionObserver" in window) {
      new IntersectionObserver((es) => {
        for (const e of es) {
          if (e.isIntersecting) { const p = vid.play(); if (p && p.catch) p.catch(() => {}); }
          else vid.pause();
        }
      }, { threshold: 0.3 }).observe(vid);
    }

    const page = document.getElementById("zp");
    if (page) page.scrollTop = 0;
  }

  /* rendered on arrival and on every change of zone, so moving between two zones
     without going back to the ring is a re-render rather than a stale page */
  addEventListener("hashchange", () => {
    if (location.hash.startsWith("#/zone")) render();
  });
  if (location.hash.startsWith("#/zone")) render();
})();
