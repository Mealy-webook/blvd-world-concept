// ── section headings: they set themselves as they arrive ────────────────
// Each heading is split into words, each word wrapped in a clipping box, so the
// line rises out of its own mask a word at a time. The eyebrow above it draws a
// short rule as it goes.
//
// The page scrolls inside #view-home rather than the window, so intersection
// against the default (viewport) root reports everything as visible at once —
// the same reason the .reveal system in scene.js does its own scroll maths. This
// observes each element against its own scrolling container.
(function () {
  const STILL = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const heads = [...document.querySelectorAll(".sec-title")];
  if (!heads.length) return;

  /* ── split into words, keeping any <br> the copy relies on ── */
  function split(el) {
    if (el.dataset.split) return;
    const out = [];
    for (const node of [...el.childNodes]) {
      if (node.nodeType === 3) {
        for (const w of node.textContent.split(/(\s+)/)) {
          if (!w.trim()) { out.push(document.createTextNode(w)); continue; }
          const box = document.createElement("span");
          box.className = "sw";
          const inner = document.createElement("span");
          inner.className = "sw-i";
          inner.textContent = w;
          box.appendChild(inner);
          out.push(box);
        }
      } else {
        out.push(node);
      }
    }
    el.textContent = "";
    out.forEach((n) => el.appendChild(n));
    // stagger by word, capped so a long heading doesn't crawl
    [...el.querySelectorAll(".sw-i")].forEach((w, i) => {
      w.style.setProperty("--wd", Math.min(i, 8) * 55 + "ms");
    });
    el.dataset.split = "1";
  }
  heads.forEach(split);

  const watch = [...heads, ...document.querySelectorAll(".eyebrow")];

  if (STILL) {
    watch.forEach((el) => el.classList.add("set"));
    return;
  }

  // the scrolling ancestor an element actually lives in
  const scrollerOf = (el) => el.closest("#view-home, #view-rides, #view-packages, .pp-list") || null;

  // group by scroller, and give each group an observer rooted there
  const groups = new Map();
  for (const el of watch) {
    const root = scrollerOf(el);
    if (!groups.has(root)) groups.set(root, []);
    groups.get(root).push(el);
  }
  for (const [root, els] of groups) {
    const io = new IntersectionObserver((entries) => {
      for (const en of entries) {
        if (!en.isIntersecting) continue;
        en.target.classList.add("set");
        io.unobserve(en.target);
      }
    }, { root, threshold: 0.3, rootMargin: "0px 0px -6% 0px" });
    els.forEach((el) => io.observe(el));
  }

  // Backstop, matching the .reveal system: scrolling past a heading sets it even
  // if its observer missed, so a heading is never stuck behind its own mask.
  for (const root of groups.keys()) {
    if (!root) continue;
    root.addEventListener("scroll", () => {
      const vh = root.clientHeight || 1;
      for (const el of groups.get(root)) {
        if (!el.classList.contains("set") &&
            el.getBoundingClientRect().top - root.getBoundingClientRect().top < vh * 0.9) {
          el.classList.add("set");
        }
      }
    }, { passive: true });
  }

  // a route that opens mid-page has its headings already past the fold, so set
  // whatever is on screen when the view arrives
  addEventListener("hashchange", () => {
    requestAnimationFrame(() => {
      const view = document.querySelector(".view.active");
      if (!view) return;
      const vh = view.clientHeight || innerHeight;
      view.querySelectorAll(".sec-title:not(.set), .eyebrow:not(.set)").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < vh * 0.95) el.classList.add("set");
      });
    });
  });
})();
