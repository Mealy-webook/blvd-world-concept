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
      dealIn = true,              // gathered at the centre until the section arrives
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
      // the ring can settle under a pointer that has not moved, so the cursor's
      // word has to be recomputed here as well as on pointermove
      refreshHover();
      onSelect && onSelect(items[i], i);
    }
    // replaced below once the hover resolver exists; a no-op until then, because
    // select() runs during the first paint
    let refreshHover = () => {};

    /* ── the deal ──
       The ring starts gathered: every card stacked on the centre one, a little
       small, a little turned. When the section arrives they fly out to their places
       one after another from the middle of the deck outwards, overshooting a touch
       before they settle.

       It is a factor on the layout rather than a separate animation, so a drag that
       begins mid-deal is not fighting a transition — paint() reads it like any other
       term and the two simply compose. Once dealt it is 1 and costs a comparison. */
    const STILL = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let deal = dealIn && !STILL ? 0 : 1;      // 0 gathered · 1 spread
    let dealAnchor = start;
    /* One card's own flight takes SPAN of the run, and each card out from the centre
       starts STEP later. STEP is derived rather than picked so that the last card to
       leave lands exactly as the run ends: with a fixed step the whole spread was
       over by 45% of the duration and the rest of it animated nothing. */
    const DEAL_SPAN = 0.5;
    const DEAL_FAR = loop ? Math.floor(count / 2) : Math.max(count - 1, 1);
    const DEAL_STEP = DEAL_FAR ? (1 - DEAL_SPAN) / DEAL_FAR : 0;

    /* eased back: the card passes its mark and comes back to it, which is what
       makes a spread read as thrown rather than slid */
    function back(t) {
      const c1 = 1.9, c3 = c1 + 1;
      return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    }
    function spreadOf(i) {
      if (deal >= 1) return 1;
      let d = Math.abs(i - dealAnchor);
      if (loop) d = Math.min(d, count - d);          // the ring's shorter way round
      const p = (deal - d * DEAL_STEP) / DEAL_SPAN;
      return back(Math.max(0, Math.min(1, p)));
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
        /* every term the layout produces is scaled by how far this card has been
           dealt: at 0 it sits on the centre card, at 1 it is exactly where the ring
           wants it */
        const sp = spreadOf(i);
        c.style.transform =
          `translateX(calc(-50% + ${offset * pitch * sp}px)) ` +
          `translateZ(${-depth * width * ramp * sp}px) ` +
          `rotateY(${-tilt * sp}deg) scale(${(0.9 + 0.1 * sp).toFixed(3)})`;
        // a card is teleported across the ring at exactly half a turn out, so it
        // has to be gone by then or the jump shows
        const edge = loop ? Math.min(1, Math.max(0, count / 2 - distance)) : 1;
        c.style.opacity = String(Math.max(0, 1 - fade * distance) * edge * Math.min(1, sp * 1.6));
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
      let hoverRaf = null, lastX = -1, lastY = -1;
      const resolveHover = () => {
        hoverRaf = null;
        if (lastX < 0) return;
        const at = cardIndexAtPoint(lastX, lastY);
        for (let i = 0; i < cards.length; i++) cards[i].classList.toggle("is-hovered", i === at);
        /* What the cursor calls this card, which is not the same for all of them:
           the centred one is a way into the park, the rest are a way to change
           which card is centred. js/cursor.js reads this attribute if it finds
           one, so the wording lives with the behaviour rather than in a table on
           the other side of the codebase. */
        frame.dataset.cursorWord =
          at < 0 ? "Drag" : at === selected ? "Explore zone" : "Select";
      };
      refreshHover = () => {
        if (lastX >= 0 && hoverRaf === null) hoverRaf = requestAnimationFrame(resolveHover);
      };
      frame.addEventListener("pointermove", (e) => {
        lastX = e.clientX; lastY = e.clientY;
        if (hoverRaf === null) hoverRaf = requestAnimationFrame(resolveHover);
      });
      frame.addEventListener("pointerleave", () => {
        if (hoverRaf !== null) { cancelAnimationFrame(hoverRaf); hoverRaf = null; }
        lastX = lastY = -1;
        for (const c of cards) c.classList.remove("is-hovered");
        delete frame.dataset.cursorWord;
      });
    }

    // and the click that selects. On the frame, not on the cards, for the same
    // reason — a click never reaches a steeply yawed card. A drag is not a click.
    frame.addEventListener("click", (e) => {
      if (lastMoved > 6) return;                       // the capture handler below stops it
      const at = cardIndexAtPoint(e.clientX, e.clientY);
      if (at < 0) return;
      e.preventDefault();
      // a card off centre comes in; the one already centred follows its own link
      if (at !== selected) { goTo(at); return; }
      const link = cards[at].querySelector("a[href]");
      if (link) location.hash = link.getAttribute("href").replace(/^#/, "");
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
      // The capture has to go before the click is dispatched. While the frame
      // holds it, the browser retargets the click to the frame, so a link inside
      // a card never sees it — which is why the centred poster's href did nothing.
      // The click handler navigates explicitly too, but a captured pointer should
      // not be left holding events either way.
      try { frame.releasePointerCapture(d.id); } catch (err) { /* already gone */ }
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

    /* Dealt when the ring is actually looked at, not on load — it is the second
       section down, and a spread nobody sees is a spread that did not happen. The
       timer is a fail-open: whatever happens to the observer, the cards cannot be
       left stacked. */
    function runDeal() {
      if (deal >= 1) return;
      dealAnchor = selected;
      const DUR = 1500;
      let t0 = null;
      const step = (now) => {
        if (t0 === null) t0 = now;
        deal = Math.min((now - t0) / DUR, 1);
        paint();
        if (deal < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }
    if (deal < 1) {
      /* Two triggers and a backstop, and the scroll one is not belt-and-braces:
         this page scrolls inside #view-home rather than the document, and an
         observer is the wrong single point of failure for something that leaves the
         deck invisible if it never fires. Whichever comes first wins; all three then
         stand down. */
      let armed = true;
      const scroller = root.closest(".view");
      const check = () => {
        if (!armed) return;
        const b = root.getBoundingClientRect();
        if (b.top < innerHeight * 0.85 && b.bottom > 0) fire();
      };
      const fire = () => {
        if (!armed) return;
        armed = false;
        scroller && scroller.removeEventListener("scroll", check);
        removeEventListener("scroll", check);
        io && io.disconnect();
        runDeal();
      };

      let io = null;
      if ("IntersectionObserver" in window) {
        io = new IntersectionObserver((es) => {
          for (const en of es) if (en.isIntersecting) fire();
        }, { threshold: 0.2 });
        io.observe(root);
      }
      scroller && scroller.addEventListener("scroll", check, { passive: true });
      addEventListener("scroll", check, { passive: true });
      check();                                  // in case it is already on screen

      /* A backstop, not a schedule. Six seconds beat a real visitor to the section —
         the intro alone runs about five — and the ring spread itself while nobody
         was looking at it. Twenty is past any first scroll, and short enough that a
         deck somehow left gathered heals itself. */
      setTimeout(fire, 20000);
    }

    return { goTo, nudge, measure };
  }

  return { make };
})();
