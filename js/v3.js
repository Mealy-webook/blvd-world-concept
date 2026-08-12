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

  /* ── the opening: loader, then intro, then the page ───────────────────────
     The loader waits on the things the hero cannot be seen without — the fonts, and the
     six landmark cut-outs — and counts them honestly rather than running a fake bar. A
     hard stop behind it, because a slow image must never leave someone looking at a
     loading screen.

     The intro then sets two lines a character at a time. It is shown once a session: a
     title card is a welcome the first time and an obstacle the third.

     The hero's own entrance (body.up) is held until whichever of the two finishes last,
     so the arch is never animating behind a cover. */
  const boot = $("#boot"), bootBar = $("#boot-bar-i");
  const intro = $("#intro"), skip = $("#intro-skip");
  const SEEN = "blvd-v3-intro";
  const go = () => document.body.classList.add("up");

  let seenIntro = false;
  try { seenIntro = sessionStorage.getItem(SEEN) === "1"; } catch (e) { /* private mode */ }

  (function opening() {
    document.body.classList.add("booting");

    /* what we are waiting for: the font set, and every landmark */
    const shots = [...document.querySelectorAll(".lm")];
    const total = shots.length + 1;
    let done = 0;
    const tick = () => {
      done++;
      if (bootBar) bootBar.style.width = Math.min(done / total, 1) * 100 + "%";
      if (done >= total) finishBoot();
    };
    for (const im of shots) {
      if (im.complete) tick();
      else { im.addEventListener("load", tick, { once: true }); im.addEventListener("error", tick, { once: true }); }
    }
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(tick);

    let bootDone = false;
    function finishBoot() {
      if (bootDone) return; bootDone = true;
      if (bootBar) bootBar.style.width = "100%";
      setTimeout(() => {
        if (boot) boot.classList.add("gone");
        if (seenIntro || STILL) { endOpening(); } else { runIntro(); }
      }, 260);
    }
    setTimeout(finishBoot, 4200);            // the hard stop

    function endOpening() {
      document.body.classList.remove("booting");
      if (intro) { intro.classList.add("gone"); setTimeout(() => { intro.hidden = true; }, 800); }
      go();
      try { sessionStorage.setItem(SEEN, "1"); } catch (e) { /* nothing to do */ }
    }

    function runIntro() {
      if (!intro) return endOpening();
      intro.hidden = false;
      const lines = [...intro.querySelectorAll(".intro-line")];
      let li = 0, ci = 0, timer = null, ended = false;

      function stop() {
        if (ended) return; ended = true;
        clearTimeout(timer);
        /* whatever was half-typed is completed rather than left mid-word */
        for (const l of lines) { l.textContent = l.dataset.line; l.classList.remove("typing"); }
        endOpening();
      }
      if (skip) skip.addEventListener("click", stop);
      /* a key or a click anywhere skips it too — nobody should have to find the button */
      intro.addEventListener("click", (e) => { if (e.target !== skip) stop(); });
      addEventListener("keydown", function once(e) {
        if (ended) return removeEventListener("keydown", once);
        if (e.key === "Escape" || e.key === " " || e.key === "Enter") { stop(); removeEventListener("keydown", once); }
      });

      function step() {
        if (ended) return;
        const line = lines[li];
        if (!line) { setTimeout(stop, 900); return; }
        line.classList.add("typing");
        const full = line.dataset.line || "";
        if (ci <= full.length) {
          line.textContent = full.slice(0, ci++);
          /* a shade slower after a space, which is what makes typing read as speech
             rather than as a machine */
          const ch = full[ci - 2];
          timer = setTimeout(step, ch === " " ? 46 : 26);
        } else {
          line.classList.remove("typing");
          li++; ci = 0;
          timer = setTimeout(step, 420);
        }
      }
      step();
    }
  })();

  /* ── the sky ──────────────────────────────────────────────────────────────
     A living starfield: the field itself is seeded and fixed, so it never reshuffles,
     but each star breathes on its own phase and every so often one crosses the sky.

     One rAF, and only while the hero is on screen — a shader loop running behind four
     sections of scrolled-past page is heat for nothing. */
  (function sky() {
    const c = $("#stars");
    const hero = $("#hero");
    if (!c) return;
    const g = c.getContext("2d");
    let stars = [], w = 0, h = 0, dpr = 1, live = false, raf = null, t0 = 0;
    let shoot = null, nextShot = 2200;

    function build() {
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = c.clientWidth; h = c.clientHeight;
      if (!w || !h) return;
      c.width = w * dpr; c.height = h * dpr;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      let seed = 8531909;
      const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
      const n = Math.round((w * h) / 6400);
      stars = [];
      for (let i = 0; i < n; i++) {
        stars.push({
          x: rnd() * w, y: rnd() * h * 0.78, r: rnd() * 1.5 + 0.3,
          a: 0.2 + rnd() * 0.6,
          /* every star gets its own period and phase, so the sky shimmers rather
             than pulsing in unison */
          per: 2200 + rnd() * 4200, ph: rnd() * 6.2832,
        });
      }
    }

    function draw(t) {
      raf = null;
      if (!t0) t0 = t;
      const el = t - t0;
      g.clearRect(0, 0, w, h);
      for (const s of stars) {
        const tw = 0.62 + 0.38 * Math.sin(el / s.per * 6.2832 + s.ph);
        g.beginPath();
        g.fillStyle = `rgba(255,255,255,${(s.a * tw * (1 - s.y / h)).toFixed(3)})`;
        g.arc(s.x, s.y, s.r, 0, 6.2832);
        g.fill();
      }
      /* a star crosses now and then. It is drawn as a fading trail rather than a
         moving dot, which is what makes it read as speed. */
      if (!shoot && el > nextShot) {
        shoot = { x: w * (0.12 + Math.random() * 0.6), y: h * (0.05 + Math.random() * 0.3),
                  len: 90 + Math.random() * 120, p: 0, sp: 0.016 + Math.random() * 0.012 };
      }
      if (shoot) {
        shoot.p += shoot.sp;
        const e = shoot.p, fade = e < 0.5 ? e * 2 : (1 - e) * 2;
        const dx = shoot.len * 1.6, dy = shoot.len * 0.62;
        const x = shoot.x + dx * e, y = shoot.y + dy * e;
        const grad = g.createLinearGradient(x, y, x - dx * 0.22, y - dy * 0.22);
        grad.addColorStop(0, `rgba(255,255,255,${(0.9 * fade).toFixed(3)})`);
        grad.addColorStop(1, "rgba(255,255,255,0)");
        g.strokeStyle = grad; g.lineWidth = 1.6; g.lineCap = "round";
        g.beginPath(); g.moveTo(x, y); g.lineTo(x - dx * 0.22, y - dy * 0.22); g.stroke();
        if (shoot.p >= 1) { shoot = null; nextShot = el + 3400 + Math.random() * 5200; }
      }
      if (live) raf = requestAnimationFrame(draw);
    }

    function start() { if (live || STILL) return; live = true; raf = requestAnimationFrame(draw); }
    function stop() { live = false; if (raf) { cancelAnimationFrame(raf); raf = null; } }

    build();
    /* one frame drawn now, so a background tab and a reduced-motion visitor both get
       a real sky rather than an empty canvas */
    g.clearRect(0, 0, w, h);
    for (const s of stars) {
      g.beginPath();
      g.fillStyle = `rgba(255,255,255,${(s.a * (1 - s.y / h)).toFixed(3)})`;
      g.arc(s.x, s.y, s.r, 0, 6.2832); g.fill();
    }
    addEventListener("resize", () => { build(); }, { passive: true });
    if (hero && "IntersectionObserver" in window) {
      new IntersectionObserver((es) => {
        for (const e of es) (e.isIntersecting ? start : stop)();
      }, { threshold: 0.02 }).observe(hero);
    } else { start(); }
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

  /* ═══════════════ THE MOTION LAYER ═══════════════
     Everything below is interaction rather than content: it can all fail and the page
     still reads. Each piece bails out under prefers-reduced-motion. */

  /* ── pointer parallax on the hero ──
     The landmarks already drift on scroll; this leans them with the pointer as well, so
     the horizon has depth standing still. Written as two custom properties and read by
     the CSS, which keeps it to one composited transform per layer. */
  (function lean() {
    const hero = $("#hero");
    if (!hero || STILL) return;
    let qx = 0, qy = 0, queued = false;
    function write() {
      queued = false;
      hero.style.setProperty("--mx", qx.toFixed(4));
      hero.style.setProperty("--my", qy.toFixed(4));
    }
    hero.addEventListener("pointermove", (e) => {
      const b = hero.getBoundingClientRect();
      qx = (e.clientX - b.left) / b.width - 0.5;      // -0.5 … 0.5
      qy = (e.clientY - b.top) / b.height - 0.5;
      if (!queued) { queued = true; requestAnimationFrame(write); }
    }, { passive: true });
    /* it settles back when the pointer leaves, rather than staying where it was left */
    hero.addEventListener("pointerleave", () => { qx = 0; qy = 0; write(); });
  })();

  /* ── the stats, counting up ──
     The final figures are written into the page first and the count runs over the top
     of them, so a tab opened in the background and read later shows the numbers.
     Anything that is not a plain integer — the spec's "24–27" ranges — is left alone. */
  (function countUp() {
    const box = $("#stats");
    if (!box || STILL) return;
    const nums = [...box.querySelectorAll("b")].filter((b) => /^\d+$/.test(b.textContent.trim()));
    if (!nums.length) return;
    let run = false;
    const go2 = () => {
      if (run) return; run = true;
      for (const b of nums) {
        const to = parseInt(b.textContent, 10);
        const DUR = 1100; let t0 = null;
        const step = (t) => {
          if (t0 === null) t0 = t;
          const k = Math.min((t - t0) / DUR, 1);
          b.textContent = Math.round(to * (1 - Math.pow(1 - k, 3)));
          if (k < 1) requestAnimationFrame(step); else b.textContent = to;
        };
        requestAnimationFrame(step);
      }
    };
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((es) => {
        for (const e of es) if (e.isIntersecting) { go2(); io.disconnect(); }
      }, { threshold: 0.5 });
      io.observe(box);
      setTimeout(go2, 6000);                 // fail open
    } else { go2(); }
  })();

  /* ── tilt ──
     A card leans towards the pointer. Two properties, --tx and --ty, and the CSS turns
     them into one rotate3d — so the whole effect is a single composited transform and
     the handler never reads layout after the first measure.

     Delegated from the rail rather than bound per card, because the rails re-render. */
  (function tilt() {
    if (STILL) return;
    const SEL = ".rt3, .xp3, .pl3";
    let box = null, node = null, queued = false, px = 0, py = 0;
    function write() {
      queued = false;
      if (!node || !box) return;
      node.style.setProperty("--tx", (((px - box.left) / box.width - 0.5) * 2).toFixed(3));
      node.style.setProperty("--ty", (((py - box.top) / box.height - 0.5) * 2).toFixed(3));
    }
    document.addEventListener("pointermove", (e) => {
      const hit = e.target.closest(SEL);
      if (hit !== node) {
        if (node) { node.classList.remove("tilt"); node.style.removeProperty("--tx"); node.style.removeProperty("--ty"); }
        node = hit;
        if (node) { node.classList.add("tilt"); box = node.getBoundingClientRect(); }
      }
      if (!node) return;
      px = e.clientX; py = e.clientY;
      if (!queued) { queued = true; requestAnimationFrame(write); }
    }, { passive: true });
    /* a scroll moves the card out from under the pointer, so the measured box is stale
       — drop the tilt rather than lean the wrong way */
    addEventListener("scroll", () => {
      if (!node) return;
      node.classList.remove("tilt");
      node.style.removeProperty("--tx"); node.style.removeProperty("--ty");
      node = null;
    }, { passive: true });
  })();

  /* ── the rails: drag, wheel and keys ──
     A rail you can throw. Pointer drag with a little inertia, shift-wheel and plain
     wheel mapped to horizontal, and arrow keys once it has focus. */
  (function grab() {
    for (const r of document.querySelectorAll(".rail")) {
      let down = false, sx = 0, sl = 0, moved = 0, last = 0, vel = 0, glide = null;

      r.addEventListener("pointerdown", (e) => {
        if (e.pointerType === "touch") return;        // native touch scrolling is better
        down = true; moved = 0; vel = 0;
        sx = e.clientX; sl = r.scrollLeft; last = e.clientX;
        r.classList.add("grabbing");
        if (glide) { cancelAnimationFrame(glide); glide = null; }
      });
      r.addEventListener("pointermove", (e) => {
        if (!down) return;
        const dx = e.clientX - sx;
        moved = Math.max(moved, Math.abs(dx));
        vel = e.clientX - last; last = e.clientX;
        r.scrollLeft = sl - dx;
      });
      function release() {
        if (!down) return;
        down = false; r.classList.remove("grabbing");
        /* let it run on a little, decaying — a rail that stops dead feels like a table,
           not a belt */
        if (STILL || Math.abs(vel) < 2) return;
        let v = vel * 12;
        const step = () => {
          v *= 0.92;
          r.scrollLeft -= v * 0.06;
          if (Math.abs(v) > 1) glide = requestAnimationFrame(step); else glide = null;
        };
        glide = requestAnimationFrame(step);
      }
      r.addEventListener("pointerup", release);
      r.addEventListener("pointercancel", release);
      r.addEventListener("pointerleave", release);
      /* a drag that moved is not a click: swallow the click so a thrown rail does not
         also open the card it started on */
      r.addEventListener("click", (e) => { if (moved > 6) { e.preventDefault(); e.stopPropagation(); } }, true);

      /* the wheel drives it sideways while the pointer is over it, but only when the
         gesture is mostly horizontal or shifted — otherwise the page must still scroll */
      r.addEventListener("wheel", (e) => {
        const horiz = Math.abs(e.deltaX) > Math.abs(e.deltaY);
        if (!horiz && !e.shiftKey) return;
        e.preventDefault();
        r.scrollLeft += (horiz ? e.deltaX : e.deltaY);
      }, { passive: false });

      r.tabIndex = 0;
      r.addEventListener("keydown", (e) => {
        const first = r.firstElementChild;
        if (!first) return;
        const gap = parseFloat(getComputedStyle(r).columnGap) || 0;
        const stepW = first.getBoundingClientRect().width + gap;
        if (e.key === "ArrowRight") { e.preventDefault(); r.scrollBy({ left: stepW, behavior: "smooth" }); }
        if (e.key === "ArrowLeft")  { e.preventDefault(); r.scrollBy({ left: -stepW, behavior: "smooth" }); }
      });
    }
  })();

  /* ── the heart ──
     A burst of six sparks on the way in. They are spans added and removed, not a
     library: six nodes for 600ms is cheaper than any of the alternatives.
     The toggle itself is handled above and works with this switched off. */
  document.addEventListener("click", (e) => {
    const f = e.target.closest(".fav");
    if (!f || STILL || !f.classList.contains("on")) return;
    for (let i = 0; i < 6; i++) {
      const s = document.createElement("span");
      s.className = "spark";
      s.style.setProperty("--a", (i * 60) + "deg");
      s.style.setProperty("--d", (i % 2 ? 15 : 21) + "px");
      f.appendChild(s);
      setTimeout(() => s.remove(), 700);
    }
  });

  /* ── the top progress line ── */
  (function progress() {
    const bar = document.createElement("i");
    bar.className = "pageline";
    document.body.appendChild(bar);
    const doc = document.documentElement;
    let queued = false;
    const write = () => {
      queued = false;
      const max = doc.scrollHeight - innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? clamp(scrollY / max, 0, 1) : 0})`;
    };
    write();
    addEventListener("scroll", () => { if (!queued) { queued = true; requestAnimationFrame(write); } }, { passive: true });
    addEventListener("resize", write, { passive: true });
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
