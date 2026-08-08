// ── the world records ──────────────────────────────────────────────────────
// Three records in one frame, chips to move between them. The CSS draws the frame;
// this file does the parts it cannot:
//
//   · the chips, and which panel is on
//   · counting each record's figure up when its panel arrives
(function () {
  /* ── the chips ── */
  const tabs = [...document.querySelectorAll(".rec-tab")];
  const panels = [...document.querySelectorAll(".rec-panel")];

  /* Every figure is written into the page before anything is animated, and the
     count-up runs over the top of it. Backwards from the obvious order, and
     deliberately: requestAnimationFrame does not run in a background tab, so a
     page opened in one and read later would have shown 0 metres. Decoration must
     never be what puts a number on the page. */
  const FIGURES = new Map();
  for (const num of document.querySelectorAll(".rec-num[data-to]")) {
    const to = parseFloat(num.dataset.to);
    const dp = (num.dataset.to.split(".")[1] || "").length;
    FIGURES.set(num, { to, dp });
    num.textContent = to.toFixed(dp);
  }

  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const counted = new WeakSet();

  function count(panel) {
    if (still) return;
    for (const num of panel.querySelectorAll(".rec-num[data-to]")) {
      const fig = FIGURES.get(num);
      if (!fig || counted.has(num)) continue;
      counted.add(num);
      const DUR = 1400;
      let t0 = null;
      const step = (t) => {
        if (t0 === null) t0 = t;
        const k = Math.min((t - t0) / DUR, 1);
        const e = 1 - Math.pow(1 - k, 3);        // the easing the rule grows on
        num.textContent = (fig.to * e).toFixed(fig.dp);
        if (k < 1) requestAnimationFrame(step);
        else num.textContent = fig.to.toFixed(fig.dp);
      };
      requestAnimationFrame(step);
    }
  }

  function show(key) {
    for (const t of tabs) {
      const on = t.dataset.rec === key;
      t.classList.toggle("is-on", on);
      t.setAttribute("aria-selected", on ? "true" : "false");
    }
    for (const p of panels) {
      const on = p.dataset.rec === key;
      /* hidden comes off before the class goes on, because a panel cannot
         transition out of display: none — the frame it would start from never
         happens. Reading offsetHeight in between forces the layout that gives the
         transition its start state.

         This used to wait a requestAnimationFrame instead, which is a bug rather
         than a style: rAF does not run in a background tab, so a chip pressed
         there left the panel visible in the DOM and stuck at opacity 0. */
      if (on) {
        p.hidden = false;
        void p.offsetHeight;
        p.classList.add("is-on");
        count(p);
      } else {
        p.classList.remove("is-on");
        p.hidden = true;
      }
    }
  }

  for (const t of tabs) {
    t.addEventListener("click", () => show(t.dataset.rec));
  }
  /* left and right move between the chips, which is what a tablist is expected to
     do once it says it is one */
  const strip = document.querySelector(".rec-tabs");
  if (strip) {
    strip.addEventListener("keydown", (e) => {
      const at = tabs.indexOf(document.activeElement);
      if (at < 0) return;
      const by = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (!by) return;
      e.preventDefault();
      const next = tabs[(at + by + tabs.length) % tabs.length];
      next.focus();
      show(next.dataset.rec);
    });
  }

  /* the first panel is on in the markup, so its figure counts when the section is
     seen rather than on load, five screens above it */
  const section = document.getElementById("records");
  const first = panels.find((p) => p.classList.contains("is-on"));
  if (section && first) {
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((entries) => {
        for (const en of entries) {
          if (en.isIntersecting) { count(first); io.disconnect(); }
        }
      }, { threshold: 0.35 });
      io.observe(section);
    } else {
      count(first);
    }
  }

})();
