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

  // ── the rides rail ────────────────────────────────────────────────────────
  // Their card carries a height limit, an age restriction and a maintenance status.
  // We hold none of the three for any ride, so this card carries what we do hold: the
  // class of ride, a turn, and the fast lane. Printing "110cm" would be inventing a
  // safety figure, which is the one kind of placeholder that can actually hurt someone.
  (function rides() {
    const rail = document.getElementById("hr-rail");
    const list = WBK.rides || [];
    if (!rail || !list.length) return;
    rail.innerHTML = list.map((r, i) => `
      <article class="eat-card" style="--pop-d:${(i % 6) * 70}ms">
        <div class="eat-shot">
          <img src="img/rides/${esc(r.img)}" alt="${esc(r.name)}" loading="lazy" draggable="false" />
          <span class="hr-kind">${esc(r.kind)}</span>
        </div>
        <div class="eat-text">
          <h3>${esc(r.name)}</h3>
          <p class="eat-from">SAR <b>${esc(r.reg)}</b> a turn</p>
          <p class="hr-fast">Fast lane SAR ${esc(r.fast)}</p>
        </div>
      </article>`).join("");
    wake([...rail.children], "pop");
  })();

})();
