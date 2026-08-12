// ═══════════════════════════════════════════════════════════════════════════
// BLVD World — the Figma version (file Dsuv9NdftLBG0mWrB8Mp7b, node 85:3909)
//
// Built from window.WBK, the same object index.html and v2.html read, so all three
// versions quote the same zones, rides, prices and questions.
//
// WHERE THE DESIGN ASKS FOR SOMETHING THE DATA HAS NOT GOT
//   · the ride cards in the file carry "Height: 130-195cm". No ride in WBK has a
//     height, and a height limit is a safety figure — the row is left out rather than
//     filled. Same for the age limit and the maintenance status.
//   · the file's ride copy ("Meet the beast that's changing the thrill game. King Claw
//     has arrived…") is another park's ride description, sitting in the mock as
//     placeholder. It is not reproduced; our rides have no blurb, so that line is the
//     class of ride and what it costs instead.
//   · the four hero prices in the file are 35 / 70 / 99 / 100 and the live site's are
//     50 / 89 / 150 / 100. The file's are used here, because this page is the file —
//     but the two disagree and only the client can say which is right.
// ═══════════════════════════════════════════════════════════════════════════
(function () {
  const W = window.WBK || {};
  const $ = (s, r) => (r || document).querySelector(s);
  const esc = (t) =>
    String(t == null ? "" : t).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const STILL = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const riyal = '<i class="riyal" aria-hidden="true"></i>';

  /* let the arch and the pricing card in once the fonts have settled, so the arched
     type is never measured against a fallback face */
  const go = () => document.body.classList.add("up");
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(go);
  setTimeout(go, 2200);

  /* ── the starfield ──
     Drawn once, seeded, so it does not reshuffle on resize. The file has ~200 ellipses
     on the canvas; this is the same effect without 200 nodes. */
  (function stars() {
    const c = $("#stars");
    if (!c) return;
    function draw() {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      const w = c.clientWidth, h = c.clientHeight;
      if (!w || !h) return;
      c.width = w * dpr; c.height = h * dpr;
      const g = c.getContext("2d");
      g.scale(dpr, dpr); g.clearRect(0, 0, w, h);
      let seed = 8531909;
      const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
      const n = Math.round((w * h) / 6400);
      for (let i = 0; i < n; i++) {
        const x = rnd() * w, y = rnd() * h * 0.78, r = rnd() * 1.5 + 0.3;
        g.beginPath();
        g.fillStyle = `rgba(255,255,255,${(0.2 + rnd() * 0.6) * (1 - y / h)})`;
        g.arc(x, y, r, 0, 6.2832); g.fill();
      }
    }
    draw();
    addEventListener("resize", draw, { passive: true });
  })();

  /* ── the pricing row ──
     The file's four columns, verbatim: name, chevron, description, "From ﷼ n". */
  (function pricing() {
    const box = $("#pricing");
    if (!box) return;
    const cards = [
      { n: "Entry ticket",  ic: "ic-ticket.svg", d: "Access to 20 spectacular country zones.",              p: 35,  href: "https://webook.com" },
      { n: "Rides Package", ic: "ic-rocket.svg", d: "Includes General Zone Entry + Rides access.",          p: 70,  href: "index.html#/packages" },
      { n: "Experiences",   ic: "ic-ticket.svg", d: "Includes General Zone Entry + Premium pavilion access", p: 99,  href: "index.html#/experiences" },
      { n: "Restaurants",   ic: "ic-dining.svg", d: "Includes General Zone Entry + Premium dining access",  p: 100, href: "index.html#/eats" },
    ];
    box.innerHTML = cards.map((c) => `
      <a class="pc" href="${c.href}" ${c.href.startsWith("http") ? 'target="_blank" rel="noopener"' : ""}>
        <span class="pc-ic"><img src="img/v3/${c.ic}" alt="" /></span>
        <span class="pc-h">
          <span class="pc-n">${esc(c.n)}</span>
          <img src="img/v3/chevron.svg" alt="" />
        </span>
        <span class="pc-d">${esc(c.d)}</span>
        <span class="pc-p">From <span class="amt">${riyal}<b>${c.p}</b></span></span>
      </a>`).join("");
  })();

  /* ── the zone stats ──
     The client's own spec table (WBK.mapSpec), which is what the file prints: 24 zones,
     14 rides, 4 restaurants, 151 showtimes. Read rather than typed. */
  (function stats() {
    const box = $("#stats");
    if (!box) return;
    const spec = W.mapSpec || [];
    const want = ["zones", "rides", "restaurants"];
    const rows = spec.filter((s) => want.includes(String(s.l).toLowerCase()));
    const shows = (W.showsByZone || []).reduce((n, z) => n + (z.items || []).length, 0);
    const all = rows.concat(shows ? [{ n: shows, l: "showtimes a night" }] : []);
    if (!all.length) return;
    box.innerHTML = all.map((s) => `<span class="stat"><b>${esc(s.n)}</b><span>${esc(s.l)}</span></span>`).join("");
  })();

  /* ── a rail: cards in, arrows and a bar ──
     One helper for the three rails the design uses. The step is measured off the first
     card rather than assumed, so it stays right through every clamp() the card is
     sized with. */
  function rail(railSel, navSel) {
    const r = $(railSel), nav = $(navSel);
    if (!r || !nav) return;
    const prev = nav.querySelector('[data-dir="-1"]');
    const next = nav.querySelector('[data-dir="1"]');
    const bar = nav.querySelector(".rbar i");
    function step() {
      const first = r.firstElementChild;
      if (!first) return r.clientWidth;
      const gap = parseFloat(getComputedStyle(r).columnGap) || 0;
      return first.getBoundingClientRect().width + gap;
    }
    function sync() {
      const max = r.scrollWidth - r.clientWidth;
      const seen = r.clientWidth / Math.max(r.scrollWidth, 1);
      const w = Math.max(seen, 0.1);
      if (bar) {
        bar.style.width = w * 100 + "%";
        bar.style.left = (max > 1 ? r.scrollLeft / max : 0) * (100 - w * 100) + "%";
      }
      if (prev) prev.disabled = r.scrollLeft < 4;
      if (next) next.disabled = r.scrollLeft > max - 4;
    }
    if (prev) prev.addEventListener("click", () => r.scrollBy({ left: -step(), behavior: "smooth" }));
    if (next) next.addEventListener("click", () => r.scrollBy({ left: step(), behavior: "smooth" }));
    r.addEventListener("scroll", sync, { passive: true });
    addEventListener("resize", sync, { passive: true });
    requestAnimationFrame(sync);
    return sync;
  }

  /* cards arrive when their rail does */
  function wake(nodes, parent) {
    if (!nodes.length) return;
    const on = () => nodes.forEach((n) => n.classList.add("in"));
    if (STILL || !("IntersectionObserver" in window)) return on();
    const io = new IntersectionObserver((es) => {
      for (const e of es) if (e.isIntersecting) { on(); io.disconnect(); }
    }, { threshold: 0.1 });
    io.observe(parent || nodes[0]);
    setTimeout(on, 4000);                     // fail open
  }

  /* ── the ride tickets ── */
  (function rides() {
    const r = $("#ride-rail");
    const list = W.rides || [];
    if (!r || !list.length) return;
    r.innerHTML = list.map((x, i) => `
      <article class="rt3" style="--i:${i % 8}">
        <div class="rt3-shot"><img src="img/rides/${esc(x.img)}" alt="${esc(x.name)}" loading="lazy" /></div>
        <div class="rt3-body">
          <h3 class="rt3-n">${esc(x.name)}</h3>
          <!-- the file's rows are Thrill and Height. There is no height for any ride
               in the data, so this is the class of ride and the two prices instead. -->
          <p class="rt3-row g"><i aria-hidden="true"></i>Thrill: <b>${esc(x.kind)}</b></p>
          <p class="rt3-row t"><i aria-hidden="true"></i>A turn: <b>${riyal}${esc(x.reg)}</b></p>
          <p class="rt3-note">Fast lane ${riyal}${esc(x.fast)} &middot; every ride is booked on webook.</p>
        </div>
      </article>`).join("");
    wake([...r.children], r);
    rail("#ride-rail", "#ride-nav");
  })();

  /* ── the ride packages ── */
  (function plans() {
    const box = $("#plans");
    const list = W.bundles || [];
    if (!box || !list.length) return;
    const PICK = "FAMILY PACKAGE";
    const nice = (s) => String(s).toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase());
    box.innerHTML = list.map((b, i) => `
      <article class="pl3${b.name === PICK ? " is-pick" : ""}" style="--i:${i}">
        <h3 class="pl3-n">${esc(nice(b.name))}</h3>
        <p class="pl3-p">${riyal}${esc(b.price)}</p>
        <div class="pl3-hr"></div>
        <ul class="pl3-l">
          ${(b.includes || []).filter(Boolean).map((l) => `<li><i aria-hidden="true"></i>${esc(l)}</li>`).join("")}
        </ul>
        <a class="pl3-cta" href="${esc(b.href || "https://webook.com")}" target="_blank"
           rel="noopener" aria-label="${esc(b.cta || "Book")}">Book</a>
      </article>`).join("");
    wake([...box.children], box);
    const sub = $("#pk-sub");
    if (sub) {
      const names = (W.rides || []).slice(0, 4).map((r) => r.name);
      sub.textContent = `Get ready for an exciting adventure with rides including `
        + names.join(", ") + ", and more.";
    }
  })();

  /* ── the experience posters ──
     The file uses the real campaign posters. We hold eight zone posters in
     img/zones/posters; each experience takes the poster of the zone it is in, and any
     experience whose zone has no poster falls back to its own photograph. */
  (function xps() {
    const r = $("#xp-rail");
    const list = W.experiences || [];
    if (!r || !list.length) return;
    const POSTERS = {
      "Egypt": "egypt.webp", "France": "france.webp", "Indonesia": "indonesia.webp",
      "Japan": "japan.webp", "South Korea": "korea.webp", "Kuwait": "kuwait.webp",
      "Saudi Arabia": "saudi-arabia.webp", "Türkiye": "turkiye.webp",
    };
    r.innerHTML = list.map((x, i) => {
      const poster = POSTERS[x.zone];
      const src = poster ? `img/zones/posters/${poster}` : `img/${x.img}`;
      return `
        <a class="xp3" style="--i:${i % 8}" href="index.html#/experiences">
          <span class="xp3-shot">
            <img src="${src}" alt="${esc(x.title)}" loading="lazy" />
            <button class="fav" type="button" aria-pressed="false"
                    aria-label="Save ${esc(x.title)}"><i aria-hidden="true"></i></button>
          </span>
          <h3 class="xp3-n">${esc(x.title)}</h3>
          <p class="xp3-p">${riyal}${esc(x.price)}</p>
        </a>`;
    }).join("");
    wake([...r.children], r);
    rail("#xp-rail", "#xp-nav");
    const sub = $("#xp-sub");
    if (sub) sub.textContent = `${list.length} things worth booking before you arrive — each one in its own zone, each with entry to that zone included.`;
  })();

  /* ── the restaurants ── */
  (function eats() {
    const r = $("#eat-rail");
    const list = W.restaurants || [];
    if (!r || !list.length) return;
    r.innerHTML = list.map((x, i) => `
      <a class="xp3" style="--i:${i % 8}" href="index.html#/eats">
        <span class="xp3-shot">
          <img src="img/zones/${esc(x.img)}" alt="${esc(x.name)}" loading="lazy" />
          <button class="fav" type="button" aria-pressed="false"
                  aria-label="Save ${esc(x.name)}"><i aria-hidden="true"></i></button>
        </span>
        <h3 class="xp3-n">${esc(x.name)}</h3>
        <p class="xp3-p">${riyal}${esc(x.from)}</p>
      </a>`).join("");
    wake([...r.children], r);
    rail("#eat-rail", "#eat-nav");
    const sub = $("#eat-sub");
    if (sub) sub.textContent = `${list.length} kitchens across the park, from ${Math.min(...list.map((x) => +x.from))} riyal a head.`;
  })();

  /* ── the save controls ──
     They toggle and they say so, and they do not pretend to persist: nothing here has
     an account to save against, so the state is the session's and no more. */
  document.addEventListener("click", (e) => {
    const f = e.target.closest(".fav");
    if (!f) return;
    e.preventDefault();                      // the card is a link; the heart is not
    const on = f.classList.toggle("on");
    f.setAttribute("aria-pressed", on ? "true" : "false");
  });

  /* ── reveals ── */
  (function reveals() {
    const items = [...document.querySelectorAll(".reveal")];
    if (!items.length) return;
    if (STILL || !("IntersectionObserver" in window)) {
      return items.forEach((n) => n.classList.add("in"));
    }
    const io = new IntersectionObserver((es) => {
      for (const e of es) if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    }, { threshold: 0.14, rootMargin: "0px 0px -6% 0px" });
    items.forEach((n) => io.observe(n));
    setTimeout(() => items.forEach((n) => n.classList.add("in")), 5000);
  })();

  /* ── the one scroll loop ──
     The hero's landmark drift and the map's lift, as custom properties. Nothing here
     reads or writes layout. */
  (function loop() {
    const hero = $("#hero"), mapw = $("#mapwrap");
    const doc = document.documentElement;
    let queued = false;
    function frame() {
      queued = false;
      const y = scrollY || doc.scrollTop || 0;
      if (hero) doc.style.setProperty("--sp", clamp(y / innerHeight, 0, 1.6).toFixed(4));
      if (mapw) {
        const b = mapw.getBoundingClientRect();
        const p = 1 - (b.top - innerHeight * 0.25) / (innerHeight * 0.75);
        mapw.style.setProperty("--mp", clamp(p, 0, 1).toFixed(4));
      }
    }
    frame();
    addEventListener("scroll", () => { if (!queued) { queued = true; requestAnimationFrame(frame); } }, { passive: true });
    addEventListener("resize", frame, { passive: true });
  })();
})();
