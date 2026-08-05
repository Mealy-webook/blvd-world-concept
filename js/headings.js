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

  /* ── when a heading is "in" ──
     Two mechanisms, on purpose. The observer is the primary and is rooted on the
     box the element actually scrolls in — the views are fixed, internally
     scrolling containers, so the default viewport root reports the whole page as
     visible at once. The scroll pass is the backstop, matching what the .reveal
     system does, for the case where a rooted observer delivers nothing. Neither
     can leave a heading behind its own mask. */
  const scrollerOf = (el) => el.closest("#view-home, #view-rides, #view-packages") || null;

  const groups = new Map();
  for (const el of watch) {
    const root = scrollerOf(el);
    if (!groups.has(root)) groups.set(root, []);
    groups.get(root).push(el);
  }

  const done = (el) => el.classList.add("set");

  for (const [root, els] of groups) {
    const io = new IntersectionObserver((entries) => {
      for (const en of entries) {
        if (!en.isIntersecting) continue;
        done(en.target);
        io.unobserve(en.target);
      }
    }, { root, threshold: 0.3, rootMargin: "0px 0px -6% 0px" });
    els.forEach((el) => io.observe(el));
  }

  function update(root) {
    const els = groups.get(root);
    if (!els) return;
    const top = root ? root.getBoundingClientRect().top : 0;
    const vh = (root ? root.clientHeight : innerHeight) || 1;
    for (const el of els) {
      if (el.classList.contains("set")) continue;
      const y = el.getBoundingClientRect().top - top;
      if (y < vh * 0.88 && y > -el.offsetHeight - vh) done(el);
    }
  }
  const updateAll = () => groups.forEach((_, root) => update(root));

  for (const root of groups.keys()) {
    if (root) root.addEventListener("scroll", () => update(root), { passive: true });
  }
  addEventListener("resize", updateAll);
  // a route that opens mid-page has its headings already past the fold
  addEventListener("hashchange", () => requestAnimationFrame(updateAll));

  // fail-open: a heading must never be left behind its own mask
  setTimeout(() => watch.forEach(done), 5000);
})();
