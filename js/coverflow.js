// ── coverflow: a raked ring of cards ───────────────────────────────────
// A port of the supplied React `CoverflowCarousel` to this project, which is
// vanilla HTML/CSS/JS with no React, Tailwind or TypeScript to receive a .tsx
// component. The mechanic is kept intact: one fractional index at the centre,
// distances folded into the shorter way round the ring so the loop needs no
// cloned nodes, a sub-linear ramp on both tilt and recession, drag with a capped
// throw, and an exponential settle. Same option names and defaults.
window.WBK_COVERFLOW = (function () {
  const STILL = matchMedia("(prefers-reduced-motion: reduce)").matches;

  function make(opts) {
    const {
      root,                       // element to build inside
      items,
      card,                       // (item, i) => html for the card's inside
      caption,                    // (item, i) => html for the caption, optional
      rotate = 44,                // degrees the first neighbour tilts
      depth = 0.6,                // how far it recedes, as a fraction of width
      perspective = 3,            // viewer distance, in card widths
      falloff = 0.56,             // exponent on distance; under 1 the rake eases
      fade = 0.1,                 // opacity lost per step out
      cardWidth = "clamp(148px, 22vw, 260px)",
      gap = 0.05,                 // space between cards, as a fraction of width
      loop = true,
      showCaption = true,
      showPagination = true,
      showNavigation = true,
      label = "Cover carousel",
      start = 0,                  // which index the ring opens on
      onSelect,
    } = opts;

    if (!root || !items || !items.length) return null;
    const count = items.length;

    root.classList.add("cf");
    root.style.setProperty("--cf-card", cardWidth);
    root.setAttribute("role", "region");
    root.setAttribute("aria-roledescription", "carousel");
    root.setAttribute("aria-label", label);

    root.innerHTML = `
      <div class="cf-rel">
        <div class="cf-frame" tabindex="0" style="perspective: calc(var(--cf-card) * ${perspective})">
          <div class="cf-track">
            ${items.map((it, i) => `
              <div class="cf-card" role="group" aria-roledescription="slide"
                   aria-label="${i + 1} of ${count}">${card(it, i)}</div>`).join("")}
          </div>
        </div>
        ${showNavigation ? `
          <button class="cf-nav prev" type="button" aria-label="Previous slide">&#8249;</button>
          <button class="cf-nav next" type="button" aria-label="Next slide">&#8250;</button>` : ""}
      </div>
      ${showCaption ? `<div class="cf-caption" aria-live="polite"></div>` : ""}
      ${showPagination ? `<div class="cf-dots" role="tablist"></div>` : ""}`;

    const frame = root.querySelector(".cf-frame");
    const cards = [...root.querySelectorAll(".cf-card")];
    const capEl = root.querySelector(".cf-caption");
    const dotsEl = root.querySelector(".cf-dots");

    // the fractional index at the centre — the single source of truth
    let pos = start;
    // where the current settle is headed; stepping off `pos` would swallow a
    // keypress that lands mid-flight, before the round-off moves
    let target = start;
    let width = 0, raf = null, drag = null, selected = -1;
    // how far the last press travelled, so a drag never follows a link
    let lastMoved = 0;

    const indexAt = (p) => ((Math.round(p) % count) + count) % count;
    const clamp = (p) => (loop ? p : Math.max(0, Math.min(count - 1, p)));

    if (showPagination) {
      dotsEl.innerHTML = items.map((_, i) =>
        `<button class="cf-dot" type="button" role="tab" aria-label="Go to slide ${i + 1}"></button>`).join("");
      [...dotsEl.children].forEach((d, i) => d.addEventListener("click", () => goTo(i)));
    }

    function select(i) {
      if (i === selected) return;
      selected = i;
      if (showPagination) [...dotsEl.children].forEach((d, n) => {
        d.classList.toggle("on", n === i);
        d.setAttribute("aria-selected", n === i ? "true" : "false");
      });
      if (capEl && caption) capEl.innerHTML = caption(items[i], i);
      cards.forEach((c, n) => c.classList.toggle("is-centre", n === i));
      onSelect && onSelect(items[i], i);
    }

    // Paint straight to the DOM — sixty passes a second is no place for
    // rebuilding markup.
    function paint() {
      if (!width) return;
      const pitch = width * (1 + gap);
      for (let i = 0; i < cards.length; i++) {
        let offset = i - pos;
        if (loop) {
          // fold into the shorter way round the ring: the whole looping
          // mechanism, with no cloned nodes and no shuffling the DOM
          offset = ((offset % count) + count) % count;
          if (offset > count / 2) offset -= count;
        }
        const distance = Math.abs(offset);
        // tilt and recession both ease off as cards travel out — a linear ramp
        // folds the second card shut, this keeps it readable
        const ramp = Math.pow(distance, falloff);
        // capped short of edge-on so a far card never turns its back
        const tilt = Math.min(rotate * ramp, 82) * Math.sign(offset);
        const c = cards[i];
        c.style.transform =
          `translateX(calc(-50% + ${offset * pitch}px)) ` +
          `translateZ(${-depth * width * ramp}px) rotateY(${-tilt}deg)`;
        // a card is teleported across the ring at exactly half a turn out, so it
        // has to be gone by then or the jump shows
        const edge = loop ? Math.min(1, Math.max(0, count / 2 - distance)) : 1;
        c.style.opacity = String(Math.max(0, 1 - fade * distance) * edge);
        c.style.zIndex = String(100 - Math.round(distance));
      }
    }

    /* ── which card is the pointer on? ──
       Not a question the browser can answer here. Every card off centre is yawed
       up to 82 degrees inside a preserve-3d context, and Chromium's hit test
       misses a card that steeply foreshortened: the pointer falls straight
       through to .cf-track. So `.cf-card:hover` only ever matched the one card
       square to the screen, and the per-card click listener — which is what makes
       a card selectable — never fired on any of the others either.

       getBoundingClientRect *does* project 3D transforms correctly, so the card
       whose projected centre is nearest the pointer is the card under it. That is
       also the intuitive answer where the rects overlap, as they heavily do. */
    function cardIndexAtPoint(x, y) {
      let best = -1, bestD = Infinity;
      for (let i = 0; i < cards.length; i++) {
        const c = cards[i];
        if (parseFloat(c.style.opacity || "1") < 0.06) continue;      // folded away
        const b = c.getBoundingClientRect();
        if (y < b.top || y > b.bottom) continue;
        const d = Math.abs(x - (b.left + b.width / 2));
        if (d < bestD) { bestD = d; best = i; }
      }
      return best;
    }

    // hover, via a class the CSS keys off instead of :hover
    if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
      let hoverRaf = null, lastX = 0, lastY = 0;
      const resolveHover = () => {
        hoverRaf = null;
        const at = cardIndexAtPoint(lastX, lastY);
        for (let i = 0; i < cards.length; i++) cards[i].classList.toggle("is-hovered", i === at);
      };
      frame.addEventListener("pointermove", (e) => {
        lastX = e.clientX; lastY = e.clientY;
        if (hoverRaf === null) hoverRaf = requestAnimationFrame(resolveHover);
      });
      frame.addEventListener("pointerleave", () => {
        if (hoverRaf !== null) { cancelAnimationFrame(hoverRaf); hoverRaf = null; }
        for (const c of cards) c.classList.remove("is-hovered");
      });
    }

    // and the click that selects. On the frame, not on the cards, for the same
    // reason — a click never reaches a steeply yawed card. A drag is not a click.
    frame.addEventListener("click", (e) => {
      if (lastMoved > 6) return;                       // the capture handler below stops it
      const at = cardIndexAtPoint(e.clientX, e.clientY);
      if (at < 0 || at === selected) return;           // the centre card keeps its own behaviour
      e.preventDefault();
      goTo(at);
    });

    function settle(to) {
      if (raf !== null) cancelAnimationFrame(raf);
      target = to;
      select(indexAt(to));
      // Nothing to animate if the document is hidden — requestAnimationFrame
      // does not run there, which would leave the ring parked mid-flight with
      // the caption already showing the card it never arrived at.
      if (STILL || document.hidden) { pos = to; paint(); return; }
      const step = () => {
        const left = target - pos;
        if (Math.abs(left) < 0.0004) { pos = target; paint(); raf = null; return; }
        // exponential ease-out, not a spring — no overshoot wanted
        pos += left * 0.16;
        paint();
        raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }

    function goTo(i) {
      // take the shorter way round rather than unwinding the whole ring
      const to = loop ? i + Math.round((target - i) / count) * count : i;
      settle(clamp(to));
    }
    const nudge = (by) => settle(clamp(Math.round(target) + by));

    /* ── drag, with a throw ── */
    frame.addEventListener("pointerdown", (e) => {
      if (raf !== null) { cancelAnimationFrame(raf); raf = null; }
      // capture keeps the drag alive past the frame's edge; it throws if the
      // pointer id isn't live, and losing the whole handler to that would leave
      // the ring undraggable
      try { frame.setPointerCapture(e.pointerId); } catch (err) { /* not capturable */ }
      target = pos;
      drag = { id: e.pointerId, x: e.clientX, pos, v: 0, t: performance.now(), moved: 0 };
      frame.classList.add("grabbing");
    });
    frame.addEventListener("pointermove", (e) => {
      if (!drag || drag.id !== e.pointerId) return;
      const pitch = width * (1 + gap);
      if (!pitch) return;
      const now = performance.now(), prev = pos;
      drag.moved = Math.max(drag.moved, Math.abs(e.clientX - drag.x));
      pos = clamp(drag.pos - (e.clientX - drag.x) / pitch);
      drag.v = ((pos - prev) / Math.max(now - drag.t, 1)) * 1000;   // cards a second
      drag.t = now;
      select(indexAt(pos));
      paint();
    });
    function endDrag(e) {
      if (!drag || drag.id !== e.pointerId) return;
      const d = drag;
      drag = null;
      lastMoved = d.moved;
      frame.classList.remove("grabbing");
      // let a flick carry, but never more than two cards
      settle(clamp(Math.round(pos + Math.max(-2, Math.min(2, d.v * 0.18)))));
    }
    frame.addEventListener("pointerup", endDrag);
    frame.addEventListener("pointercancel", endDrag);
    // a drag must not follow the link it finished on
    frame.addEventListener("click", (e) => {
      if (lastMoved > 6) { e.preventDefault(); e.stopPropagation(); }
    }, true);

    frame.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") { e.preventDefault(); nudge(-1); }
      else if (e.key === "ArrowRight") { e.preventDefault(); nudge(1); }
    });
    const prev = root.querySelector(".cf-nav.prev");
    const next = root.querySelector(".cf-nav.next");
    prev && prev.addEventListener("click", () => nudge(-1));
    next && next.addEventListener("click", () => nudge(1));

    // card width drives pitch, depth and perspective, so it is the only thing
    // worth measuring — and only when the box actually changes
    function measure() {
      const w = cards[0] && cards[0].offsetWidth;
      if (!w) return;
      width = w;
      paint();
    }
    measure();
    if (window.ResizeObserver) new ResizeObserver(measure).observe(frame);
    addEventListener("resize", measure);

    // a tab that was hidden mid-move lands on its target when it comes back
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) { pos = target; paint(); }
      else if (Math.abs(target - pos) > 0.0004) settle(target);
    });

    select(indexAt(start));
    paint();
    return { goTo, nudge, measure };
  }

  return { make };
})();
