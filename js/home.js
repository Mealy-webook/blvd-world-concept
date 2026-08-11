// ── the home page's own blocks ──────────────────────────────────────────────
// Two: last season's figure, and the rides rail. Four others were built alongside them
// when the page took on the running order of a working theme-park site — a standalone
// offer, tonight's events, a ticket rail and a repeat action grid — and all four were
// cut on review.
//
// Every figure is read from WBK. None of it is typed twice: the prices here and the
// prices on the booking page are the same numbers from the same place, which is the
// only way they stay the same after an edit.
(function () {
  if (!window.WBK) return;

  const $ = (s, r) => (r || document).querySelector(s);
  const esc = (t) =>
    String(t == null ? "" : t).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* Borrowed components ship switched off. .eat-card starts at opacity 0 and waits for
     .pop; .sch-row waits for .in. Their own pages add those from an observer, so
     anything reusing them here has to do the same — with a timer behind it, because a
     rail that never becomes visible is worse than one that does not animate.

     The observer is what makes the entrance happen on arrival rather than on load,
     five screens above. */
  function wake(nodes, cls) {
    if (!nodes.length) return;
    const on = () => nodes.forEach((n) => n.classList.add(cls));
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((es) => {
        for (const e of es) if (e.isIntersecting) { on(); io.disconnect(); }
      }, { threshold: 0.12 });
      io.observe(nodes[0].parentElement || nodes[0]);
      setTimeout(on, 4000);                     // fail open
    } else {
      on();
    }
  }

  // ── last season, counting up ──────────────────────────────────────────────
  // The two ends of the range climb when the section arrives.
  //
  // The final values are written into the page before anything is animated, and the
  // count runs over the top of them. Backwards from the obvious order, and on purpose:
  // requestAnimationFrame does not run in a background tab, so a page opened in one and
  // read later would have shown two zeroes. Decoration must never be the thing that
  // puts a number on the page — the same rule js/records.js follows.
  (function lastSeason() {
    const ends = [...document.querySelectorAll("#visits .vi-n[data-to]")];
    if (!ends.length) return;
    for (const el of ends) el.textContent = el.dataset.to;

    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let run = false;
    function count() {
      if (run) return;
      run = true;
      for (const el of ends) {
        const to = parseInt(el.dataset.to, 10);
        const DUR = 1200;
        let t0 = null;
        const step = (t) => {
          if (t0 === null) t0 = t;
          const k = Math.min((t - t0) / DUR, 1);
          const e = 1 - Math.pow(1 - k, 3);      // the easing the rail grows on
          el.textContent = Math.round(to * e);
          if (k < 1) requestAnimationFrame(step);
          else el.textContent = to;
        };
        requestAnimationFrame(step);
      }
    }

    const section = document.getElementById("visits");
    if (section && "IntersectionObserver" in window) {
      const io = new IntersectionObserver((es) => {
        for (const e of es) if (e.isIntersecting) { count(); io.disconnect(); }
      }, { threshold: 0.4 });
      io.observe(section);
    } else {
      count();
    }
  })();

  // ── rides, as tickets ─────────────────────────────────────────────────────
  // Cream ticket cards in a rail, with tabs over it and a progress bar under it.
  //
  // The reference card this is modelled on carries a height limit, an age restriction,
  // a maintenance status and a paragraph. We hold none of them. A height limit is a
  // safety figure and a maintenance status decides whether someone queues for a ride
  // that is shut — those are the two placeholders on a theme-park page that can
  // actually cost somebody their evening, so the rows here are the three the data can
  // answer: the class of ride, a turn, and the fast lane.
  (function rides() {
    const rail = document.getElementById("hr-rail");
    const strip = document.getElementById("hr-tabs");
    const list = WBK.rides || [];
    if (!rail || !list.length) return;

    /* the little marks down the left of the spec list, drawn rather than fetched */
    const ICON = {
      thrill: '<svg viewBox="0 0 20 20"><path d="M2 15.5c0-6 3.2-11 8-11s8 5 8 11" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><circle cx="10" cy="8.4" r="1.7" fill="currentColor"/></svg>',
      turn:   '<svg viewBox="0 0 20 20"><path d="M2.6 7.2a1.9 1.9 0 0 0 0 5.6v1.6c0 .6.5 1.1 1.1 1.1h12.6c.6 0 1.1-.5 1.1-1.1v-1.6a1.9 1.9 0 0 1 0-5.6V5.6c0-.6-.5-1.1-1.1-1.1H3.7c-.6 0-1.1.5-1.1 1.1z" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M9.3 6.4v7.2" stroke="currentColor" stroke-width="1.3" stroke-dasharray="1.6 1.6"/></svg>',
      fast:   '<svg viewBox="0 0 20 20"><path d="M11.2 1.8 4.6 11h4l-1 7.2 6.8-9.6h-4.2z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
    };

    const row = (kind, label, value) => `
      <li class="rt-row">
        <span class="rt-ic" aria-hidden="true">${ICON[kind]}</span>
        <span class="rt-lab">${label}</span>
        <span class="rt-val">${value}</span>
      </li>`;

    const card = (r, i) => `
      <article class="rt" style="--i:${i}" data-kind="${esc(r.kind)}">
        <div class="rt-shot">
          <img src="img/rides/${esc(r.img)}" alt="${esc(r.name)}" loading="lazy" draggable="false" />
          <!-- the class of ride, not the zone: see index.html -->
          <span class="rt-pill">${esc(r.kind)}</span>
        </div>
        <div class="rt-body">
          <h3 class="rt-name">${esc(r.name)}</h3>
          <ul class="rt-rows">
            ${row("thrill", "Class", esc(r.kind))}
            ${row("turn", "A turn", `SAR ${esc(r.reg)}`)}
            ${row("fast", "Fast lane", `SAR ${esc(r.fast)}`)}
          </ul>
        </div>
        <div class="rt-acts">
          <a href="#/rides">Explore</a>
          <a href="#/map">Park map</a>
          <a href="https://webook.com" target="_blank" rel="noopener">Book</a>
        </div>
      </article>`;

    /* ── the tabs ──
       Every one is a class that appears in the data, in the order they first appear, so
       a class added to WBK.rides gets a tab and one removed loses it. Nothing here is a
       list of categories typed by hand. */
    const kinds = [];
    for (const r of list) if (!kinds.includes(r.kind)) kinds.push(r.kind);
    if (strip) {
      strip.innerHTML = [
        `<button class="hr-tab is-on" type="button" role="tab" aria-selected="true" data-kind="">All<em>${list.length}</em></button>`,
        ...kinds.map((k) => {
          const n = list.filter((r) => r.kind === k).length;
          return `<button class="hr-tab" type="button" role="tab" aria-selected="false" data-kind="${esc(k)}">${esc(k)}<em>${n}</em></button>`;
        }),
      ].join("");
    }

    function paint(kind) {
      const rows = kind ? list.filter((r) => r.kind === kind) : list;
      rail.innerHTML = rows.map(card).join("");
      rail.scrollLeft = 0;
      /* the cards deal themselves in; a frame's delay lets a re-filtered rail start
         from its own beginning rather than inherit the outgoing set's finished state */
      const cards = [...rail.children];
      requestAnimationFrame(() => cards.forEach((c) => c.classList.add("in")));
      setTimeout(() => cards.forEach((c) => c.classList.add("in")), 600);   // fail open
      /* bar() reads scrollWidth and clientWidth, so it has to run after the cards have
         been laid out — called synchronously here it measures an empty rail and leaves
         the back arrow enabled at rest */
      requestAnimationFrame(bar);
    }

    if (strip) {
      strip.addEventListener("click", (e) => {
        const t = e.target.closest(".hr-tab");
        if (!t) return;
        for (const b of strip.children) {
          const on = b === t;
          b.classList.toggle("is-on", on);
          b.setAttribute("aria-selected", on ? "true" : "false");
        }
        paint(t.dataset.kind);
      });
    }

    /* ── the arrows and the bar ──
       One card's worth per press, measured off the first card rather than assumed, so
       the step stays right through every clamp() the card is sized with. */
    function step() {
      const first = rail.querySelector(".rt");
      if (!first) return rail.clientWidth;
      const gap = parseFloat(getComputedStyle(rail).columnGap) || 0;
      return first.getBoundingClientRect().width + gap;
    }
    const prev = document.getElementById("hr-prev");
    const next = document.getElementById("hr-next");
    if (prev) prev.addEventListener("click", () => rail.scrollBy({ left: -step(), behavior: "smooth" }));
    if (next) next.addEventListener("click", () => rail.scrollBy({ left: step(), behavior: "smooth" }));

    const barI = document.getElementById("hr-bar-i");
    function bar() {
      if (!barI) return;
      const max = rail.scrollWidth - rail.clientWidth;
      /* a rail that does not overflow gets a full bar, not a division by zero */
      const p = max > 1 ? rail.scrollLeft / max : 1;
      const seen = rail.clientWidth / Math.max(rail.scrollWidth, 1);
      barI.style.width = Math.max(seen, 0.12) * 100 + "%";
      barI.style.left = p * (100 - Math.max(seen, 0.12) * 100) + "%";
      if (prev) prev.disabled = rail.scrollLeft < 4;
      if (next) next.disabled = rail.scrollLeft > max - 4;
    }
    rail.addEventListener("scroll", bar, { passive: true });
    addEventListener("resize", bar, { passive: true });

    paint("");
  })();

})();
