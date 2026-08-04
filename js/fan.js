// ── fanned decks of cards ─────────────────────────────────────────
// Ported from the React `card-fan-carousel` component. The geometry is
// carried over verbatim (slot table, responsive multipliers, hover push);
// GSAP is replaced by the small tween loop below so the page keeps its
// no-bundler, no-CDN-on-the-critical-path setup.
//
// One factory, two decks: the rides and the premium experiences. Each deck
// supplies its own items and card markup; everything else is shared.
(function () {
  const MAX_VISIBLE = 7;
  const HALF = 3;

  // rot (deg) · scale · x (rem) · y (rem) · stacking order, per visible slot
  const FAN_POSITIONS = [
    { rot: -21, scale: 0.7756, x: -30, y: 7.3, zIndex: 1 },
    { rot: -14, scale: 0.8498, x: -22, y: 4.0, zIndex: 2 },
    { rot: -7,  scale: 0.9346, x: -11, y: 1.3, zIndex: 3 },
    { rot: 0,   scale: 1.0,    x: 0,   y: 0.0, zIndex: 10 },
    { rot: 7,   scale: 0.9346, x: 11,  y: 1.3, zIndex: 3 },
    { rot: 14,  scale: 0.8498, x: 22,  y: 4.0, zIndex: 2 },
    { rot: 21,  scale: 0.7756, x: 30,  y: 7.3, zIndex: 1 },
  ];

  /* ── tweening: just the easings a fan needs ── */
  const easings = {
    // GSAP's elastic.out(amplitude, period)
    elastic: (a, p) => {
      const s = (p / (2 * Math.PI)) * Math.asin(1 / Math.max(a, 1));
      return (t) => (t === 0 || t === 1 ? t
        : a * Math.pow(2, -10 * t) * Math.sin(((t - s) * 2 * Math.PI) / p) + 1);
    },
    outCubic: (t) => 1 - Math.pow(1 - t, 3),   // power2.out
    inCubic: (t) => t * t * t,                 // power2.in
  };
  const EASE_ENTER = easings.elastic(1.05, 0.78);
  const EASE_SETTLE = easings.elastic(1, 0.75);

  const draw = (el) => {
    const f = el._fx;
    el.style.transform =
      `translate(-50%, -50%) translate(${f.x}rem, ${f.y}rem) rotate(${f.rot}deg) scale(${f.scale})`;
    el.style.opacity = f.opacity;
    el.style.zIndex = f.zIndex;
  };

  function set(el, v) {
    el._fx = Object.assign(el._fx || { x: 0, y: 0, rot: 0, scale: 1, opacity: 1, zIndex: 1 }, v);
    if (el._anim) { cancelAnimationFrame(el._anim); el._anim = null; }
    draw(el);
  }

  // a tween always overwrites whatever that card was already doing
  function to(el, v, { duration = 0.5, ease = easings.outCubic, delay = 0, onDone } = {}) {
    if (el._anim) cancelAnimationFrame(el._anim);
    const from = Object.assign({}, el._fx);
    if (v.zIndex !== undefined) { el._fx.zIndex = v.zIndex; el.style.zIndex = v.zIndex; }
    const keys = ["x", "y", "rot", "scale", "opacity"].filter((k) => v[k] !== undefined);
    const t0 = performance.now() + delay * 1000;
    (function step(now) {
      const p = (now - t0) / (duration * 1000);
      if (p < 0) { el._anim = requestAnimationFrame(step); return; }   // still in the delay
      const e = p >= 1 ? 1 : ease(p);
      for (const k of keys) el._fx[k] = from[k] + (v[k] - from[k]) * e;
      draw(el);
      if (p < 1) el._anim = requestAnimationFrame(step);
      else { el._anim = null; onDone && onDone(); }
    })(performance.now());
  }

  /* ── the fan's own maths, straight from the component ── */
  function responsiveMultiplier(w) {
    if (w < 480) return 0.28;
    if (w < 640) return 0.38;
    if (w < 768) return 0.5;
    if (w < 1024) return 0.75;
    return 1.0;
  }
  // shrinks the y-offsets when the viewport is too short for the ideal height
  function heightMultiplier(w) {
    let ideal;
    if (w < 480) ideal = 22 * 16;
    else if (w < 640) ideal = 26 * 16;
    else if (w < 768) ideal = 28 * 16;
    else if (w < 1024) ideal = 34 * 16;
    else ideal = 38 * 16;
    const available = window.innerHeight * 0.7;
    return available >= ideal ? 1 : available / ideal;
  }
  function slotConfig(total, slot) {
    if (total >= MAX_VISIBLE) return FAN_POSITIONS[slot];
    const center = total >> 1;
    const d = total > 1 ? (slot - center) / center : 0;
    const ad = Math.abs(d);
    return { rot: d * 21, scale: 1 - 0.2244 * ad * ad, x: d * 30, y: ad * ad * 7.3,
             zIndex: 10 - Math.abs(slot - center) };
  }

  const STILL = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── the deck ── */
  function makeFan({ deckId, prevId, nextId, dotsId, items, card }) {
    const deck = document.getElementById(deckId);
    if (!deck || !items || !items.length) return null;

    const total = items.length;
    const paginated = total > MAX_VISIBLE;
    const slotCount = paginated ? MAX_VISIBLE : total;
    let center = paginated ? HALF : total >> 1;
    let animating = false, entered = false, direction = null;
    let prevVisible = new Set();
    let hovered = null, leaveTimer = null, pendingRelayout = false;

    function visibleMap(c) {
      const map = new Map();
      if (!paginated) { items.forEach((_, i) => map.set(i, i)); return map; }
      for (let slot = 0; slot < MAX_VISIBLE; slot++) {
        map.set((((c + slot - HALF) % total) + total) % total, slot);
      }
      return map;
    }

    deck.innerHTML = items.map((it, i) => card(it, i)).join("");
    const cards = [...deck.querySelectorAll(".fan-card")];
    cards.forEach((c) => set(c, { opacity: 0, scale: 0.3, zIndex: 0 }));

    const dotsBox = dotsId ? document.getElementById(dotsId) : null;
    if (dotsBox && paginated) {
      dotsBox.innerHTML = items.map((_, i) => `<button type="button" aria-label="Card ${i + 1}"></button>`).join("");
    }
    const dots = dotsBox ? [...dotsBox.children] : [];

    function hoverLayout(hoveredSlot) {
      const mult = responsiveMultiplier(innerWidth);
      const hM = heightMultiplier(innerWidth);
      const map = visibleMap(center);
      const entries = [];
      cards.forEach((el, i) => {
        const slot = map.get(i);
        if (slot !== undefined) entries.push({ el, slot });
      });
      entries.sort((a, b) => a.slot - b.slot);
      const centerSlot = entries.length >> 1;

      for (const { el, slot } of entries) {
        const base = slotConfig(slotCount, slot);
        let x = base.x * mult, y = base.y * hM, rot = base.rot, scale = base.scale, delay = 0;

        if (hoveredSlot !== null) {
          const d = Math.abs(slot - hoveredSlot);
          delay = d * 0.02;
          if (slot === hoveredSlot) {
            y -= 2.5 * hM; scale *= 1.08;              // the hovered card rises
          } else {
            // neighbours part to make room, hardest right next to the cursor
            const norm = centerSlot > 0 ? (slot - centerSlot) / centerSlot : 0;
            const push = 8 * (1 - Math.abs(norm)) * (1 + 0.2 * Math.max(0, 3 - d));
            if (slot < hoveredSlot) { x -= push * mult; rot -= 3 / (d + 1); }
            else { x += push * mult; rot += 3 / (d + 1); }
            if (slot === entries.length - 1 && hoveredSlot < centerSlot) y -= 1 * hM;
            if (slot === 0 && hoveredSlot > centerSlot) y -= 1 * hM;
          }
        } else {
          delay = Math.abs(slot - centerSlot) * 0.02;
        }
        to(el, { x, y, rot, scale, opacity: 1, zIndex: base.zIndex },
           { duration: 0.5, delay, ease: EASE_SETTLE });
      }
    }

    function render() {
      const map = visibleMap(center);
      const first = !entered;
      const mult = responsiveMultiplier(innerWidth);
      const hM = heightMultiplier(innerWidth);
      if (first) animating = true;

      let done = 0;
      const settle = () => {
        if (++done < map.size) return;
        animating = false;
        if (first) entered = true;
        // the viewport may have changed while the cards were in flight
        if (pendingRelayout) { pendingRelayout = false; hoverLayout(hovered); }
      };

      cards.forEach((el, i) => {
        const slot = map.get(i);
        const wasVisible = prevVisible.has(i);

        if (slot !== undefined) {
          const c = slotConfig(slotCount, slot);
          const target = { x: c.x * mult, y: c.y * hM, rot: c.rot, scale: c.scale, opacity: 1, zIndex: c.zIndex };

          if (first && STILL) {
            set(el, target);                       // place it, don't perform it
            settle();
          } else if (first) {
            // the deck deals itself out from a single stack below
            set(el, { x: 0, y: 12 * hM, rot: 0, scale: 0.5, opacity: 0, zIndex: c.zIndex });
            to(el, target, { duration: 1.2, ease: EASE_ENTER, delay: 0.2 + slot * 0.06, onDone: settle });
          } else if (!wasVisible) {
            // arriving from whichever side we are paging towards
            const enterX = direction === "right" ? 40 : -40;
            set(el, { x: enterX, y: c.y * hM, rot: direction === "right" ? 30 : -30, scale: 0.5, opacity: 0, zIndex: c.zIndex });
            to(el, target, { duration: 0.6, ease: easings.outCubic, onDone: settle });
          } else {
            to(el, target, { duration: 0.5, ease: easings.outCubic, onDone: settle });
          }
        } else if (wasVisible) {
          to(el, { x: direction === "right" ? -40 : 40, rot: direction === "right" ? -30 : 30,
                   scale: 0.5, opacity: 0, zIndex: 0 },
             { duration: 0.4, ease: easings.inCubic });
        }
      });

      prevVisible = new Set(map.keys());
      dots.forEach((d, i) => d.classList.toggle("on", i === center));
    }

    function cycle(dir) {
      if (animating || !paginated) return;
      animating = true;
      direction = dir;
      center = dir === "right" ? (center + 1) % total : (center - 1 + total) % total;
      render();
    }

    function goTo(i) {
      if (animating || !paginated || i === center) return;
      const forward = (((i - center) % total) + total) % total;
      const dir = forward <= total / 2 ? "right" : "left";
      cycle(dir);
      const chase = setInterval(() => {
        if (animating) return;
        if (center === i) { clearInterval(chase); return; }
        cycle(dir);
      }, 60);
    }

    /* ── wiring ── */
    const prev = prevId && document.getElementById(prevId);
    const next = nextId && document.getElementById(nextId);
    prev && prev.addEventListener("click", () => cycle("left"));
    next && next.addEventListener("click", () => cycle("right"));
    dots.forEach((d, i) => d.addEventListener("click", () => goTo(i)));

    deck.addEventListener("mouseover", (e) => {
      const c = e.target.closest(".fan-card");
      if (!c || animating) return;
      const slot = visibleMap(center).get(cards.indexOf(c));
      if (slot === undefined || slot === hovered) return;
      if (leaveTimer) { clearTimeout(leaveTimer); leaveTimer = null; }
      hovered = slot;
      hoverLayout(slot);
    });
    deck.addEventListener("mouseleave", () => {
      if (animating) return;
      clearTimeout(leaveTimer);
      leaveTimer = setTimeout(() => { hovered = null; hoverLayout(null); }, 50);
    });

    // clicking a card off to the side brings it to the front
    deck.addEventListener("click", (e) => {
      const c = e.target.closest(".fan-card");
      if (!c) return;
      const i = cards.indexOf(c);
      if (i !== center) goTo(i);
    });

    // the multipliers are read from the viewport, so re-lay-out whenever it
    // changes — including the first time the deck is given a real size. A
    // change mid-flight is deferred to settle().
    let lastMetrics = "";
    function relayout() {
      if (!prevVisible.size) return;                 // nothing dealt yet
      const now = responsiveMultiplier(innerWidth) + "/" + heightMultiplier(innerWidth);
      if (now === lastMetrics) return;
      lastMetrics = now;
      if (animating) { pendingRelayout = true; return; }
      hoverLayout(hovered);
    }
    addEventListener("resize", relayout);
    if (window.ResizeObserver) new ResizeObserver(relayout).observe(deck);

    // swipe the deck on touch
    let sx = null;
    deck.addEventListener("touchstart", (e) => { sx = e.touches[0].clientX; }, { passive: true });
    deck.addEventListener("touchend", (e) => {
      if (sx === null) return;
      const dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 40) cycle(dx < 0 ? "right" : "left");
      sx = null;
    });

    // deal the deck when the section arrives, with a timer fail-open so the
    // cards can never be left sitting at opacity 0
    const io = new IntersectionObserver((es) => {
      for (const en of es) if (en.isIntersecting && innerHeight > 1) { render(); io.disconnect(); }
    }, { threshold: 0.15 });
    io.observe(deck);
    setTimeout(() => { if (!entered) { render(); io.disconnect(); } }, 4000);

    return { cycle, goTo };
  }

  /* ── deck 1: the rides ── */
  const HEAT = { THRILL: 3, AERIAL: 3, ADVENTURE: 2, "FAMILY SWING": 2, FAMILY: 1, SCENIC: 1 };
  const LABEL = ["GENTLE", "LIVELY", "FULL THROTTLE"];
  makeFan({
    deckId: "ride-fan", prevId: "ride-prev", nextId: "ride-next", dotsId: "ride-dots",
    items: (window.WBK && WBK.rides) || [],
    card: (r) => {
      const h = HEAT[r.kind] || 2;
      const bars = [1, 2, 3].map((n) => `<i class="${n <= h ? "on" : ""}"></i>`).join("");
      return `
      <article class="fan-card h${h}">
        <img src="img/rides/${r.img}" alt="${r.name}" draggable="false" loading="lazy">
        <div class="fan-meta">
          <span class="ride-kind">${r.kind}</span>
          <h3>${r.name}</h3>
          <div class="ride-heat">
            <span class="rh-bars">${bars}</span>
            <span class="rh-label">${LABEL[h - 1]}</span>
          </div>
        </div>
      </article>`;
    },
  });

  /* ── deck 2: the premium experiences, same deck, its own content ── */
  makeFan({
    deckId: "pex-fan", prevId: "pex-prev", nextId: "pex-next", dotsId: "pex-dots",
    items: (window.WBK && WBK.experiences) || [],
    card: (x) => `
      <article class="fan-card is-exp">
        <img src="img/${x.img}" alt="${x.title}" draggable="false" loading="lazy">
        <div class="fan-meta">
          <span class="ride-kind zone">${x.zone}</span>
          <h3>${x.title}</h3>
          <div class="fan-price">
            <b>SAR ${x.price}</b>
            <span>per person · entry included</span>
          </div>
        </div>
      </article>`,
  });
})();
