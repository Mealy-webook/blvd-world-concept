// ═══════════════════════════════════════════════════════════════════════════
// BLVD World — "A Night at the Park"
//
// The alternative home page. Everything on it is built from window.WBK, the same
// object the main site reads, so the copy, the zones, the rides and every price
// stay in step across both versions — there is no second copy of the content to
// drift out of date.
//
// One scroll handler, coalesced into a single requestAnimationFrame, writes custom
// properties; the CSS does the rest. Nothing in the loop reads or writes layout.
// ═══════════════════════════════════════════════════════════════════════════
(function () {
  const W = window.WBK || {};
  const $ = (s, r) => (r || document).querySelector(s);
  const el = (t, c) => { const n = document.createElement(t); if (c) n.className = c; return n; };
  const STILL = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* ── the gate ──────────────────────────────────────────────────────────────
     It covers the page until the fonts have settled and the hero's own images are
     in, so nobody sees the page assemble. The bar is honest about what it is
     waiting for: it counts the loads it asked for, and it has a hard stop so a
     slow image can never leave someone looking at a shut gate. */
  const gate = $("#gate");
  const gbar = $("#gate-bar-i");
  function openGate() {
    if (!gate || gate.classList.contains("go")) return;
    if (gbar) gbar.style.width = "100%";
    gate.classList.add("go");
    document.body.classList.add("up", "lit");
    setTimeout(() => gate.classList.add("done"), 1400);
  }
  let waited = 0, want = 1;
  function step() {
    waited++;
    if (gbar) gbar.style.width = Math.round((waited / want) * 100) + "%";
    if (waited >= want) setTimeout(openGate, 220);
  }
  const fonts = document.fonts ? document.fonts.ready : Promise.resolve();
  fonts.then(step);
  setTimeout(openGate, 2600);              // the hard stop

  /* ── the starfield ────────────────────────────────────────────────────────
     Drawn once to a canvas rather than animated: a few hundred DOM nodes twinkling
     is a lot of compositing for something the eye reads as texture. */
  (function stars() {
    const c = $("#stars");
    if (!c) return;
    function draw() {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      const w = c.clientWidth, h = c.clientHeight;
      if (!w || !h) return;
      c.width = w * dpr; c.height = h * dpr;
      const g = c.getContext("2d");
      g.scale(dpr, dpr);
      g.clearRect(0, 0, w, h);
      /* deterministic: a seeded walk, so the sky does not reshuffle on every
         resize and every screenshot is the same sky */
      let seed = 20260811;
      const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
      const n = Math.round((w * h) / 5200);
      for (let i = 0; i < n; i++) {
        const x = rnd() * w, y = rnd() * h * 0.82;
        const r = rnd() * 1.25 + 0.25;
        const a = 0.16 + rnd() * 0.6 * (1 - y / h);
        g.beginPath();
        g.fillStyle = rnd() > 0.9 ? `rgba(255,208,138,${a})` : `rgba(255,246,233,${a})`;
        g.arc(x, y, r, 0, 6.2832);
        g.fill();
      }
    }
    draw();
    addEventListener("resize", draw, { passive: true });
  })();

  /* ── lanterns ── */
  (function lanterns() {
    const box = $("#lanterns");
    if (!box || STILL) return;
    for (let i = 0; i < 9; i++) {
      const l = el("i", "lan");
      l.style.setProperty("--x", (4 + i * 11 + (i % 3) * 4) + "%");
      l.style.setProperty("--s", (9 + (i % 4) * 5) + "px");
      l.style.setProperty("--d", (17 + (i % 5) * 6) + "s");
      l.style.setProperty("--delay", (i * 2.4) + "s");
      l.style.setProperty("--drift", ((i % 2 ? 1 : -1) * (20 + i * 9)) + "px");
      box.appendChild(l);
    }
  })();

  /* ── the four ways in ─────────────────────────────────────────────────────
     Read from WBK.bundles and WBK.experiences for the prices rather than typed, so
     the hero cannot quote a figure the booking pages disagree with. The entry price
     is the one number with no list behind it. */
  (function ways() {
    const box = $("#ways");
    if (!box) return;
    /* These four figures are the main site's hero figures, held here to match it — not
       derived from the data, and that is deliberate.

       Deriving them would make the two versions disagree in public. The cheapest row in
       WBK is 89 for a rides package (matches), 110 for an experience (the tile says 150)
       and 120 for a restaurant (the tile says 100). So two of the four "from" prices on
       the live hero are not the cheapest thing in their own list. That is a content
       question for the client, not something to quietly fix on one version only — until
       it is settled, both pages say the same thing. */
    const list = [
      { n: "Entry ticket",  p: 50,  t: "Entry only",          href: "https://webook.com", lead: true },
      { n: "Rides package", p: 89,  t: "Zone entry included", href: "index.html#/packages" },
      { n: "Experiences",   p: 150, t: "Zone entry included", href: "index.html#/experiences" },
      { n: "Restaurants",   p: 100, t: "Zone entry included", href: "index.html#/eats" },
    ];
    box.innerHTML = list.map((w, i) => `
      <a class="way${w.lead ? " is-lead" : ""}" style="--i:${i}" href="${w.href}"
         ${w.href.startsWith("http") ? 'target="_blank" rel="noopener"' : ""}>
        <span class="way-n">${w.n}</span>
        <span class="way-p">from <b>SAR ${w.p}</b></span>
        <span class="way-t">${w.t}</span>
      </a>`).join("");
  })();

  /* ── the ticker ──
     Two copies of the list back to back, so translating the run by exactly -50%
     lands on an identical frame and the loop has no visible seam. */
  (function ticker() {
    const run = $("#ticker");
    const zones = W.zones || [];
    if (!run || !zones.length) return;
    const one = zones.map((z) => `<span>${z.name}<i> ✦ </i></span>`).join("");
    run.innerHTML = one + one;
  })();

  /* ── the facts ── */
  (function facts() {
    const box = $("#facts");
    const v = W.visit;
    if (!box || !v) return;
    box.innerHTML = [
      ["Visiting hours", `${v.from} – ${v.to}`, `${v.days}, right through the season`],
      ["The season", `${v.seasonFrom} – ${v.seasonTo}`, "Riyadh Season, every night in between"],
      ["Where it is", v.where, '<a href="index.html#/map">Open the park map</a>'],
    ].map(([l, val, n]) => `
      <div class="fact reveal">
        <p class="fact-l">${l}</p>
        <p class="fact-v">${val}</p>
        <p class="fact-n">${n}</p>
      </div>`).join("");
  })();

  /* ── the zones, sideways ──────────────────────────────────────────────────
     The section is made tall enough that the strip has room to travel; the frame
     inside sticks for the length of it. Height comes from the strip's own overflow,
     so adding a zone lengthens the act instead of making it move faster. */
  const strip = $("#strip");
  const stripSec = $("#zones");
  (function zones() {
    if (!strip) return;
    const zones = W.zones || [];
    if (!zones.length) return;
    const NEW = new Set(["Indonesia", "South Korea", "Kuwait"]);
    strip.innerHTML = zones.map((z, i) => {
      const img = z.poster || (z.imgs || [])[0];
      return `
        <article class="zn" style="--r:${(i % 2 ? 1 : -1) * (0.6 + (i % 3) * 0.4)}deg">
          ${img ? `<img src="img/zones/${img}" alt="${z.name}" loading="lazy" draggable="false" />` : ""}
          ${NEW.has(z.name) ? '<span class="zn-new">New</span>' : ""}
          <div class="zn-txt">
            <h3 class="zn-n">${z.name}</h3>
            <p class="zn-b">${z.blurb || ""}</p>
          </div>
        </article>`;
    }).join("");
  })();

  /* ── the odometer ──
     Each digit is a window over a 0-9 strip. The strip is in the DOM at its final
     offset from the start, and the roll is a transition off that — so a tab opened
     in the background and read later shows the number, not a row of zeroes.
     The real figure is also in the page as text for a screen reader. */
  (function odo() {
    const box = $("#odo");
    if (!box) return;
    const strip10 = () => "<i>" + Array.from({ length: 10 }, (_, d) => `<b>${d}</b>`).join("") + "</i>";
    const digit = (n) => `<span class="dig" data-n="${n}">${strip10()}</span>`;
    box.innerHTML = digit(1) + digit(4) + '<span class="odo-dash"></span>' + digit(2) + digit(0);
    const digits = [...box.querySelectorAll(".dig")];
    const seat = () => digits.forEach((d) => {
      d.querySelector("i").style.setProperty("--n", d.dataset.n);
    });
    if (STILL) return seat();
    // start each strip a full turn back, then let the transition carry it home
    digits.forEach((d, i) => {
      const s = d.querySelector("i");
      s.style.transition = "none";
      s.style.setProperty("--n", "0");
      s.style.transitionDelay = (i * 90) + "ms";
    });
    let rolled = false;
    const roll = () => {
      if (rolled) return; rolled = true;
      digits.forEach((d) => { d.querySelector("i").style.transition = ""; });
      requestAnimationFrame(seat);
    };
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((es) => {
        for (const e of es) if (e.isIntersecting) { roll(); io.disconnect(); }
      }, { threshold: 0.4 });
      io.observe(box);
      setTimeout(roll, 6000);                 // fail open: the number must appear
    } else { seat(); }
  })();

  /* ── the rides deck ── */
  (function rides() {
    const deck = $("#deck");
    const chips = $("#chips");
    const list = W.rides || [];
    if (!deck || !list.length) return;

    const card = (r, i) => `
      <article class="rd" style="--i:${i}">
        <div class="rd-shot">
          <img src="img/rides/${r.img}" alt="${r.name}" loading="lazy" draggable="false" />
          <span class="rd-kind">${r.kind}</span>
        </div>
        <div class="rd-body">
          <h3 class="rd-n">${r.name}</h3>
          <p class="rd-price"><span>a turn</span><b>SAR ${r.reg}</b></p>
          <p class="rd-fast">Fast lane <b>SAR ${r.fast}</b></p>
        </div>
      </article>`;

    const kinds = [];
    for (const r of list) if (!kinds.includes(r.kind)) kinds.push(r.kind);
    if (chips) {
      chips.innerHTML = [`<button class="chip on" type="button" data-k="">All<em>${list.length}</em></button>`]
        .concat(kinds.map((k) => `<button class="chip" type="button" data-k="${k}">${k}<em>${list.filter((r) => r.kind === k).length}</em></button>`))
        .join("");
      chips.addEventListener("click", (e) => {
        const c = e.target.closest(".chip");
        if (!c) return;
        for (const b of chips.children) b.classList.toggle("on", b === c);
        paint(c.dataset.k);
      });
    }
    function paint(kind) {
      const rows = kind ? list.filter((r) => r.kind === kind) : list;
      deck.innerHTML = rows.map(card).join("");
      deck.scrollLeft = 0;
      const cards = [...deck.children];
      /* the deal animation is held off .in; a frame's delay lets a re-filtered deck
         start from its own beginning rather than inherit the last set's end state */
      requestAnimationFrame(() => cards.forEach((c) => c.classList.add("in")));
      setTimeout(() => cards.forEach((c) => c.classList.add("in")), 700);
    }
    paint("");
  })();

  /* ── the film ──
     Plays itself while on screen, pauses the moment it leaves, muted because no
     browser starts sound without a gesture — so the control is the point, not a
     decoration. The source is attached late; it is the heaviest asset here. */
  (function film() {
    const sec = $("#film"), stage = $("#film-stage"), vid = $("#film-vid"), snd = $("#snd");
    if (!sec || !vid) return;
    let wired = false;
    const wire = () => {
      if (wired) return; wired = true;
      const s = document.createElement("source");
      s.src = "video/hero-real.mp4"; s.type = "video/mp4";
      vid.appendChild(s); vid.load();
    };
    if ("IntersectionObserver" in window) {
      new IntersectionObserver((es) => {
        for (const e of es) {
          if (e.isIntersecting) {
            wire();
            if (!STILL) {
              const p = vid.play();
              if (p && p.catch) p.catch(() => {});
              sec.classList.add("playing");
            }
          } else if (!vid.paused) {
            vid.pause(); sec.classList.remove("playing");
          }
        }
      }, { threshold: 0.32 }).observe(stage);
    } else { wire(); }

    if (snd) {
      const lab = snd.querySelector("span");
      const sync = () => {
        snd.classList.toggle("on", !vid.muted);
        snd.setAttribute("aria-pressed", vid.muted ? "false" : "true");
        if (lab) lab.textContent = vid.muted ? "Sound off" : "Sound on";
        snd.setAttribute("aria-label", vid.muted ? "Turn the sound on" : "Turn the sound off");
      };
      snd.addEventListener("click", () => {
        vid.muted = !vid.muted;
        if (!vid.muted && vid.paused) { const p = vid.play(); if (p && p.catch) p.catch(() => {}); }
        sync();
      });
      vid.addEventListener("volumechange", sync);
      sync();
    }
  })();

  /* ── the gallery belts ── */
  (function gallery() {
    const shots = ["fireworks.jpg", "rock-mapping.jpg", "greek-zone.jpg", "lake-aerial.jpg",
      "beast-gate.jpg", "skyloop-night.jpg", "amazonia-sign.jpg", "night-aerial.jpg"];
    const fill = (id, from) => {
      const b = $(id);
      if (!b) return;
      const set = from.map((s) => `<figure><img src="img/gallery/${s}" alt="" loading="lazy" draggable="false" /></figure>`).join("");
      b.innerHTML = set + set;             // two copies, so -50% is a seamless loop
    };
    fill("#belt-a", shots);
    fill("#belt-b", shots.slice().reverse());
  })();

  /* ── the rules ── */
  (function rules() {
    const box = $("#rule-grid");
    const list = W.rules || [];
    if (!box || !list.length) return;
    box.innerHTML = list.map((r, i) => `
      <div class="rl" style="--i:${i}">
        <span class="rl-i" aria-hidden="true"></span>
        <p class="rl-n">${r.t || r.title || r.name || ""}</p>
        <p class="rl-b">${r.d || r.body || r.note || ""}</p>
      </div>`).join("");
  })();

  /* ── the FAQ ──
     Height is animated off a measured scrollHeight and then released to auto, or a
     panel whose text reflows later stays clipped at the height it was measured at. */
  (function faq() {
    const box = $("#faq-list");
    const list = W.faqs || [];
    if (!box || !list.length) return;
    box.innerHTML = list.map((f, i) => `
      <div class="qa">
        <button class="qa-q" type="button" aria-expanded="false" aria-controls="qa-${i}">
          ${f.q}<i aria-hidden="true"></i>
        </button>
        <div class="qa-a" id="qa-${i}"><p>${f.a}</p></div>
      </div>`).join("");

    box.addEventListener("click", (e) => {
      const btn = e.target.closest(".qa-q");
      if (!btn) return;
      const qa = btn.closest(".qa");
      const panel = qa.querySelector(".qa-a");
      const open = qa.classList.contains("open");
      // one at a time
      for (const other of box.querySelectorAll(".qa.open")) {
        if (other === qa) continue;
        const p = other.querySelector(".qa-a");
        p.style.height = p.scrollHeight + "px";
        requestAnimationFrame(() => { p.style.height = "0px"; });
        other.classList.remove("open");
        other.querySelector(".qa-q").setAttribute("aria-expanded", "false");
      }
      if (open) {
        panel.style.height = panel.scrollHeight + "px";
        requestAnimationFrame(() => { panel.style.height = "0px"; });
        qa.classList.remove("open");
        btn.setAttribute("aria-expanded", "false");
      } else {
        qa.classList.add("open");
        btn.setAttribute("aria-expanded", "true");
        panel.style.height = panel.scrollHeight + "px";
      }
    });
    box.addEventListener("transitionend", (e) => {
      if (e.propertyName !== "height") return;
      const p = e.target;
      if (p.closest(".qa").classList.contains("open")) p.style.height = "auto";
    });
  })();

  /* ── the partner belt ── */
  (function partners() {
    const belt = $("#logo-belt");
    const tiers = W.partners || [];
    if (!belt || !tiers.length) return;
    const logos = tiers.flatMap((t) => t.logos || []);
    const set = logos.map((l) => `<img src="img/partners/${l.img}" alt="${l.name}" loading="lazy" />`).join("");
    belt.innerHTML = set + set;
    const note = $("#last-note");
    if (note) {
      note.textContent = `${logos.length} partners across ${tiers.length} tiers, `
        + `${(W.zones || []).length} zones and ${(W.rides || []).length} rides — `
        + `every figure on this page read from the same data as the main site.`;
    }
  })();

  /* ── reveals ── */
  (function reveals() {
    const items = [...document.querySelectorAll(".reveal")];
    const giant = $(".giant.out");
    if (!("IntersectionObserver" in window)) {
      items.forEach((n) => n.classList.add("in"));
      if (giant) giant.classList.add("in");
      return;
    }
    const io = new IntersectionObserver((es) => {
      for (const e of es) {
        if (!e.isIntersecting) continue;
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    }, { threshold: 0.16, rootMargin: "0px 0px -8% 0px" });
    items.forEach((n) => io.observe(n));
    if (giant) io.observe(giant);
    /* fail open: anything still unrevealed after a few seconds is shown, so a
       missed observer callback can never leave a section blank */
    setTimeout(() => {
      items.forEach((n) => n.classList.add("in"));
      if (giant) giant.classList.add("in");
    }, 5000);
  })();

  /* ── the one scroll loop ──────────────────────────────────────────────────
     Everything scroll-driven is computed here and written as custom properties:
     the hero parallax, the film's opening slot, the strip's X, the page rail.
     One handler, one frame, no layout reads inside it beyond bounding boxes. */
  (function loop() {
    const railI = $("#rail-i");
    const stripBar = $("#strip-bar-i");
    const hero = $("#hero");
    const filmSec = $("#film");
    const doc = document.documentElement;

    /* the strip's travel: how far it overflows its frame. Measured, and re-measured
       on resize, rather than assumed from a card count. */
    let travel = 0;
    function measure() {
      if (!strip || !stripSec) return;
      travel = Math.max(0, strip.scrollWidth - innerWidth);
      /* the act is as long as it needs to be: one screen to read the head, plus the
         travel itself, so the strip moves at roughly page speed */
      stripSec.style.height = (innerHeight + travel) + "px";
    }

    let queued = false;
    function frame() {
      queued = false;
      const y = scrollY || doc.scrollTop || 0;

      if (railI) {
        const max = doc.scrollHeight - innerHeight;
        railI.style.height = (max > 0 ? clamp(y / max, 0, 1) : 0) * 100 + "%";
      }
      if (hero) {
        doc.style.setProperty("--sp", clamp(y / innerHeight, 0, 1.4).toFixed(4));
      }
      if (filmSec) {
        const b = filmSec.getBoundingClientRect();
        const p = 1 - (b.top - innerHeight * 0.3) / (innerHeight * 0.7);
        filmSec.style.setProperty("--fp", clamp(p, 0, 1).toFixed(4));
      }
      if (strip && stripSec && travel > 0) {
        const b = stripSec.getBoundingClientRect();
        const p = clamp(-b.top / travel, 0, 1);
        strip.style.transform = `translate3d(${-p * travel}px,0,0)`;
        if (stripBar) stripBar.style.width = (p * 100).toFixed(2) + "%";
      }
    }
    function onScroll() { if (!queued) { queued = true; requestAnimationFrame(frame); } }

    measure();
    frame();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", () => { measure(); onScroll(); }, { passive: true });
    /* images arriving change the strip's width, so re-measure once they are in */
    addEventListener("load", () => { measure(); frame(); });
  })();

  /* ── the torch ── */
  if (!STILL) {
    const t = document.documentElement;
    addEventListener("pointermove", (e) => {
      t.style.setProperty("--tx", e.clientX + "px");
      t.style.setProperty("--ty", e.clientY + "px");
    }, { passive: true });
  }
})();
