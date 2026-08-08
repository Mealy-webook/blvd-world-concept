// ── gallery: an infinite corridor of photographs ────────────────────────────
// Ported from the reference InfiniteGallery. The idea is the same — photographs at
// their own depths in a tunnel, the run advancing, each one recycled to the far end
// once it has passed — and the numbers that carried over carried over: 3 units
// between pictures, twelve on screen, a falloff of .8 near and 14 far, drifting at
// 1.2 units a second. What changed is the input model and the framework: this page
// is not React, and it does not own the wheel.
//
// THE WHEEL. The reference takes it, because it is the whole page. Here the page
// scrolls behind the section and snaps between sections, so a corridor that ate the
// wheel would be a trap: you could not scroll past the gallery without first moving
// the pointer off it. The wheel therefore *nudges* the corridor and is not
// swallowed — the page keeps scrolling, and the pictures move along with it, which
// is what the belts this replaces used to do. Drag scrubs it properly, the arrow
// keys step it, and it runs on its own after three seconds of quiet.
(function () {
  const scene = document.getElementById("gal-scene");
  const corridor = document.getElementById("gal-corridor");
  if (!scene || !corridor) return;

  const PLATES = [
    { img: "fireworks.jpg",     cap: "Fireworks over the lake" },
    { img: "rock-mapping.jpg",  cap: "Projections on the rock" },
    { img: "greek-zone.jpg",    cap: "Cable cars, Greek quarter" },
    { img: "lake-aerial.jpg",   cap: "The lake from above" },
    { img: "beast-gate.jpg",    cap: "Into Beast Land" },
    { img: "skyloop-night.jpg", cap: "Sky Loop after dark" },
    { img: "amazonia-sign.jpg", cap: "Amazonia Awakens" },
    { img: "night-aerial.jpg",  cap: "One night, many worlds" },
  ];

  /* the reference's numbers, in its units; UNIT turns them into pixels of depth */
  const SPEED = 1.2;                 // units a second
  const SPACING = 3;                 // units between one photograph and the next
  const VISIBLE = 12;                // how many are in the tunnel at once
  const NEAR = 0.8, FAR = 14;        // the falloff, in units from the camera
  /* how far past the camera a photograph travels before it is recycled. The
     reference's near falloff is where it starts to go; letting it carry on to 2.2
     is what makes it pass you rather than stop at the screen. */
  const PASS = 2.2;
  const UNIT = 150;                  // px per unit
  const IDLE = 3000;                 // ms of quiet before it runs itself again
  const RUN = VISIBLE * SPACING;     // the loop length, in units

  const STILL = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Twelve cards drawn from eight photographs: the tunnel is longer than the set,
     which is the whole point of an infinite one. Each card keeps its own lane so a
     picture does not appear to jump sideways when it is recycled. */
  scene.innerHTML = Array.from({ length: VISIBLE }, (_, n) => {
    const p = PLATES[n % PLATES.length];
    /* Lanes either side of the middle, but not so far out that the run reads as two
       columns: at .36 of the width the near photographs sat at the edges of the
       frame instead of coming down the middle at you. */
    const lane = (n % 2 ? 1 : -1) * (0.10 + ((n * 0.37) % 1) * 0.16);  // -.26 … .26
    const rise = ((n * 0.61) % 1 - 0.5) * 0.28;
    return `
      <figure class="gal-card" role="button" tabindex="0"
              data-i="${PLATES.indexOf(p)}" data-n="${n}"
              style="--lane:${lane.toFixed(3)}; --rise:${rise.toFixed(3)}"
              aria-label="Open ${p.cap}">
        <img src="img/gallery/${p.img}" alt="${p.cap}" loading="lazy" draggable="false">
        <figcaption>${p.cap}</figcaption>
      </figure>`;
  }).join("");

  const cards = [...scene.querySelectorAll(".gal-card")];
  const lanes = cards.map((c) => ({
    lane: parseFloat(c.style.getPropertyValue("--lane")),
    rise: parseFloat(c.style.getPropertyValue("--rise")),
  }));

  let travel = 0;          // units the camera has advanced
  let nudge = 0;           // units of extra momentum from wheel or drag
  let lastInput = 0;       // when the visitor last touched it
  let raf = null, seen = false, last = 0;

  function size() {
    const w = corridor.clientWidth;
    /* the card is a share of the corridor, so the tunnel keeps its proportions from
       a phone to a wide screen */
    const cw = Math.max(180, Math.min(w * 0.36, 380));
    corridor.style.setProperty("--card-w", `${Math.round(cw)}px`);
    return { w, cw };
  }

  /* layout, not paint: the lightbox further down this file already has a paint(),
     and two function declarations of the same name in one scope are one function —
     the second wins, hoisted, and the corridor's first call went into the lightbox
     with no arguments. */
  function layout() {
    const { w } = size();
    for (let n = 0; n < cards.length; n++) {
      /* Depth for this card: its slot, less how far we have travelled, wrapped into
         the run so it reappears at the far end instead of running out of tunnel. */
      let d = (n * SPACING - travel) % RUN;
      if (d < 0) d += RUN;
      d = d - PASS;                                  // negative once it is past us

      const z = -d * UNIT;
      const x = lanes[n].lane * w;
      const y = lanes[n].rise * corridor.clientHeight;

      /* in at the far end, out as it passes: nothing pops into existence */
      const fadeIn = Math.min(1, Math.max(0, (FAR - d) / 3));
      const fadeOut = Math.min(1, Math.max(0, (d + PASS) / (PASS - NEAR + 0.6)));
      const o = fadeIn * fadeOut;

      const c = cards[n];
      c.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${z.toFixed(1)}px)`;
      c.style.opacity = o.toFixed(3);
      /* a card behind the camera must not be clickable, or it swallows the pointer
         from the middle of the screen while invisible */
      c.style.pointerEvents = o > 0.06 ? "auto" : "none";
      c.style.zIndex = String(1000 - Math.round(d * 10));
    }
  }

  function frame(now) {
    raf = null;
    const dt = last ? Math.min((now - last) / 1000, 0.05) : 0.016;
    last = now;

    const idle = now - lastInput > IDLE;
    if (!STILL && idle) travel += SPEED * dt;        // it runs itself once left alone
    if (nudge) {                                     // and coasts to a stop after a push
      travel += nudge * dt;
      nudge *= Math.pow(0.0015, dt);
      if (Math.abs(nudge) < 0.01) nudge = 0;
    }
    layout();
    if (seen) raf = requestAnimationFrame(frame);
  }
  const wake = () => { if (seen && raf === null) { last = 0; raf = requestAnimationFrame(frame); } };

  /* ── the inputs ── */
  function touched() { lastInput = performance.now(); }

  corridor.addEventListener("wheel", (e) => {
    /* deliberately not prevented: the page scroll is the visitor's, not ours */
    nudge += Math.max(-3, Math.min(3, e.deltaY * 0.02));
    touched(); wake();
  }, { passive: true });

  let drag = null;
  /* How far the last drag went, kept after the drag itself is over: pointerup
     clears `drag`, and the click that opens a photograph arrives after that — so a
     guard that read `drag` was always reading null, and every journey down the
     tunnel ended by opening whatever was under the pointer. */
  let lastMoved = 0;
  corridor.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    lastMoved = 0;
    drag = { id: e.pointerId, y: e.clientY, x: e.clientX, moved: 0, t: performance.now() };
    corridor.classList.add("is-dragging");
    touched();
  });
  corridor.addEventListener("pointermove", (e) => {
    if (!drag || drag.id !== e.pointerId) return;
    const dy = e.clientY - drag.y, dx = e.clientX - drag.x;
    drag.moved = Math.max(drag.moved, Math.hypot(dx, dy));
    /* up the screen is forward, the way a scroll would carry you */
    travel += -(dy) / UNIT * 1.6;
    drag.y = e.clientY; drag.x = e.clientX;
    touched(); wake();
  });
  const endDrag = (e) => {
    if (!drag || (e && drag.id !== e.pointerId)) return;
    corridor.classList.remove("is-dragging");
    lastMoved = drag.moved;
    drag = null;
    touched();
  };
  corridor.addEventListener("pointerup", endDrag);
  corridor.addEventListener("pointercancel", endDrag);
  corridor.addEventListener("pointerleave", endDrag);

  corridor.addEventListener("keydown", (e) => {
    const by = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1
             : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!by) return;
    e.preventDefault();
    nudge += by * 6;
    touched(); wake();
  });

  addEventListener("resize", () => { layout(); }, { passive: true });
  /* and on the element itself, because the card width is a share of the corridor:
     a window resize is not the only way that changes, and until something re-ran
     layout() the tunnel kept a card width measured against the old width — 380px
     of card in a 375px phone. */
  if (window.ResizeObserver) new ResizeObserver(() => layout()).observe(corridor);

  /* It runs only while it is on screen: twelve transforms a frame behind a section
     nobody is looking at is work for nothing. */
  layout();
  if ("IntersectionObserver" in window) {
    new IntersectionObserver((es) => {
      for (const en of es) seen = en.isIntersecting;
      if (seen) wake();
      else if (raf !== null) { cancelAnimationFrame(raf); raf = null; }
    }, { threshold: 0.1 }).observe(corridor);
  } else {
    seen = true; wake();
  }

  /* ── the lightbox ──
     One frame, reused. It hangs off <body> rather than the section: .view carries
     a filter, and a filter makes an element the containing block for anything
     fixed inside it, so a fixed overlay in there would be trapped in the page. */
  const box = document.createElement("div");
  box.className = "lbx";
  box.hidden = true;
  box.innerHTML = `
    <div class="lbx-scrim" data-close></div>
    <div class="lbx-stage" role="dialog" aria-modal="true" aria-label="Gallery">
      <div class="lbx-frame">
        <figure class="lbx-shot">
          <img alt="">
        </figure>
      </div>
      <div class="lbx-bar">
        <p class="lbx-cap"></p>
        <p class="lbx-count"></p>
      </div>
      <button class="lbx-nav lbx-prev" type="button" aria-label="Previous photograph">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5 8 12l7 7" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <button class="lbx-nav lbx-next" type="button" aria-label="Next photograph">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <button class="lbx-x" type="button" aria-label="Close" data-close>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
      </button>
    </div>`;
  document.body.appendChild(box);

  const shot = box.querySelector(".lbx-shot img");
  const cap = box.querySelector(".lbx-cap");
  const count = box.querySelector(".lbx-count");
  const closeBtn = box.querySelector(".lbx-x");
  let at = 0, opener = null;

  function paint(i, dir) {
    at = (i + PLATES.length) % PLATES.length;
    const p = PLATES[at];
    // re-run the entry animation on each change, in the direction of travel
    box.classList.remove("slid-l", "slid-r");
    if (dir) { void box.offsetWidth; box.classList.add(dir > 0 ? "slid-r" : "slid-l"); }
    shot.src = "img/gallery/" + p.img;
    shot.alt = p.cap;
    cap.textContent = p.cap;
    count.textContent = String(at + 1).padStart(2, "0") + " / " + String(PLATES.length).padStart(2, "0");
  }

  function open(i) {
    opener = document.activeElement;
    paint(i);
    box.hidden = false;
    void box.offsetWidth;                       // let the transition catch
    box.classList.add("on");
    document.documentElement.classList.add("lbx-open");
    closeBtn.focus({ preventScroll: true });
  }
  function close() {
    box.classList.remove("on");
    document.documentElement.classList.remove("lbx-open");
    const done = () => { box.hidden = true; };
    setTimeout(done, 320);
    if (opener && opener.focus) opener.focus({ preventScroll: true });
  }

  /* A photograph opens by click, and by keyboard because it answers to a role. The
     drag guard matters here: travelling down the tunnel is a pointer drag, and
     without it every journey ended by opening whatever was under your finger. */
  corridor.addEventListener("click", (e) => {
    const f = e.target.closest(".gal-card");
    if (!f) return;
    if (lastMoved > 6) return;
    open(+f.dataset.i || 0);
  });
  corridor.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const f = e.target.closest(".gal-card");
    if (!f) return;
    e.preventDefault();
    open(+f.dataset.i || 0);
  });

  // the page scrolls inside #view-home, not the window, so rather than freezing
  // that container — and risking its scroll position — the overlay simply eats
  // the wheel and the drag while it is up
  const eat = (e) => e.preventDefault();
  box.addEventListener("wheel", eat, { passive: false });
  box.addEventListener("touchmove", eat, { passive: false });

  box.addEventListener("click", (e) => {
    if (e.target.closest("[data-close]")) return close();
    if (e.target.closest(".lbx-prev")) return paint(at - 1, -1);
    if (e.target.closest(".lbx-next")) return paint(at + 1, 1);
  });
  addEventListener("keydown", (e) => {
    if (box.hidden) return;
    if (e.key === "Escape") { e.preventDefault(); close(); }
    else if (e.key === "ArrowLeft") paint(at - 1, -1);
    else if (e.key === "ArrowRight") paint(at + 1, 1);
    else if (e.key === "Tab") {
      // three controls and nothing else: keep Tab inside them
      const stops = [closeBtn, box.querySelector(".lbx-prev"), box.querySelector(".lbx-next")];
      const i = stops.indexOf(document.activeElement);
      e.preventDefault();
      stops[(i + (e.shiftKey ? -1 : 1) + stops.length) % stops.length].focus();
    }
  });

  // scroll adds a little extra travel, in opposite directions per belt
  /* The belts used to be nudged along by the page's scroll position, which is how
     they kept moving with the page rather than looping in place. The corridor gets
     the same thing from the wheel handler above — it takes the delta and lets the
     page have it too — so the scroll listener that did it is gone with the belts. */

})();
