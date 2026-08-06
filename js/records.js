// ── three world records ────────────────────────────────────────────────────
// The CSS does the drawing; this file does the three things CSS cannot:
//
//   · writes the sphere's meridians, because twenty near-identical divs belong in
//     a loop rather than in the markup
//   · lets the pointer turn the sphere, on a layer of its own so the tilt and the
//     idle spin never fight each other
//   · counts the statue's height up to the figure we were given, once, when the
//     section is actually on screen
(function () {
  /* ── 1. the sphere ── */
  const rings = document.getElementById("orb-rings");
  const orb = document.getElementById("orb");

  if (rings) {
    /* Rings of latitude. Each one is a circle the width of the sphere at that
       height — 2R·cos(lat) — lifted to R·sin(lat) and laid flat, so the stack is
       the sphere in section. 15 rings between 78 degrees south and north: enough
       for the surface to read, few enough that the dotted borders stay dots.

       The poles are left open on purpose. A ring at 90 degrees is a point, and
       the last few before it are tiny circles of dots that only read as noise. */
    const N = 15, TOP = 78;
    /* the rings go inside a spinner of their own: the tilt is on .orb-rings and the
       turn is on .orb-spin, so the two compose as tilt-then-turn rather than
       fighting for one element's transform */
    const spin = document.createElement("span");
    spin.className = "orb-spin";
    spin.innerHTML = Array.from({ length: N }, (_, i) => {
      const lat = (-TOP + (2 * TOP * i) / (N - 1)) * (Math.PI / 180);
      const d = (Math.cos(lat) * 100).toFixed(2);          // % of the sphere's width
      /* The lift is R·sin(lat), but a percentage in translateY resolves against
         the element's OWN height — which here is the ring's diameter, not the
         sphere's. Dividing through gives 50·tan(lat), and the ring lands where the
         geometry says it should instead of somewhere short of it. */
      const y = (-50 * Math.tan(lat)).toFixed(2);          // % of the ring's own size
      return `<span class="orb-ring" style="--d:${d}%; --y:${y}%"></span>`;
    }).join("");
    rings.appendChild(spin);
  }

  if (orb && matchMedia("(hover: hover) and (pointer: fine)").matches) {
    /* The pointer tilts the ball towards itself: the further from the middle, the
       further it leans. The spin lives on .orb as an animation of `rotate`, and
       this writes `transform` — two different properties on the same element, so
       they compose instead of overwriting one another. */
    const stage = orb.parentElement;
    const box = orb.querySelector(".orb-rings") || orb;
    /* -20 rather than -12: at a shallower angle the rings are almost edge-on and
       the whole ball flattens into a lens. This is the elevation at which the
       ellipses open enough to read as latitude. */
    const REST = -20;
    let raf = null, tx = REST, ty = 0;

    const paint = () => {
      raf = null;
      box.style.setProperty("--tx", `${tx.toFixed(1)}deg`);
      box.style.setProperty("--ty", `${ty.toFixed(1)}deg`);
    };
    stage.addEventListener("pointermove", (e) => {
      const b = orb.getBoundingClientRect();
      const dx = (e.clientX - (b.left + b.width / 2)) / b.width;    // -1 … 1
      const dy = (e.clientY - (b.top + b.height / 2)) / b.height;
      tx = REST - Math.max(-1, Math.min(1, dy)) * 14;
      ty = Math.max(-1, Math.min(1, dx)) * 22;
      if (raf === null) raf = requestAnimationFrame(paint);
    });
    stage.addEventListener("pointerleave", () => {
      tx = REST; ty = 0;
      if (raf === null) raf = requestAnimationFrame(paint);
    });
  }

  /* ── 2. the statue's height ──
     33.7 m is the only figure claimed on the page, and it is the one we were
     given. The count is decoration on it; it always lands exactly there. */
  const num = document.getElementById("giant-num");
  const stage = document.getElementById("giant-stage");
  if (num && stage) {
    const TO = 33.7;
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let ran = false;

    /* The figure is written now, before anything is observed or animated. The
       count-up is decoration on top of it, and decoration must not be what puts
       the number on the page: neither requestAnimationFrame nor an
       IntersectionObserver callback runs while a tab is in the background, so a
       page opened in a background tab and read later would have shown 0.0 metres.
       Nobody sees this first value — the section is six screens down. */
    num.textContent = TO.toFixed(1);

    const run = () => {
      if (ran || still) return;
      ran = true;
      const DUR = 1500;
      let t0 = null;
      const step = (t) => {
        if (t0 === null) t0 = t;
        const k = Math.min((t - t0) / DUR, 1);
        // the same easing the rule beside it grows on, so they arrive together
        const e = 1 - Math.pow(1 - k, 3);
        num.textContent = (TO * e).toFixed(1);
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    /* The section is inside #view-home, which is the scroller — an observer with
       the default root watches the viewport, which is the right thing here since
       the scroller fills it. */
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((entries) => {
        for (const en of entries) {
          if (en.isIntersecting) { run(); io.disconnect(); }
        }
      }, { threshold: 0.4 });
      io.observe(stage);
    } else {
      run();
    }
  }
})();
