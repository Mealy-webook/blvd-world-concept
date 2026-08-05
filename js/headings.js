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
     Scroll maths, not IntersectionObserver. These views are fixed, filtered,
     internally scrolling boxes; an observer rooted on one reports every heading
     as visible at once in some conditions, which sets the whole page before the
     reader has scrolled a pixel and kills the animation outright. The .reveal
     system in scene.js does its own maths for the same reason. */
  const scrollerOf = (el) => el.closest("#view-home, #view-rides, #view-packages") || null;

  const groups = new Map();
  for (const el of watch) {
    const root = scrollerOf(el);
    if (!groups.has(root)) groups.set(root, []);
    groups.get(root).push(el);
  }

  const done = (el) => el.classList.add("set");

  function update(root) {
    const els = groups.get(root);
    if (!els) return;
    const top = root ? root.getBoundingClientRect().top : 0;
    const vh = (root ? root.clientHeight : innerHeight) || 1;
    for (const el of els) {
      if (el.classList.contains("set")) continue;
      if (!el.offsetParent) continue;          // a hidden section has no fold
      const y = el.getBoundingClientRect().top - top;
      // on screen, or already gone past — never everything at once
      if (y < vh * 0.86) done(el);
    }
  }
  const updateAll = () => groups.forEach((_, root) => update(root));

  for (const root of groups.keys()) {
    if (root) root.addEventListener("scroll", () => update(root), { passive: true });
  }
  addEventListener("resize", updateAll);
  // a route that opens mid-page has its headings already past the fold
  addEventListener("hashchange", () => requestAnimationFrame(updateAll));

  /* ── the first pass waits for the page ──
     The loader and intro run for several seconds. A pass fired at load would
     resolve against a page nobody is looking at yet; worse, an unconditional
     fail-open on a timer fired during the intro and set every heading before
     the first scroll. Both wait for the home view to actually come up. */
  const home = document.getElementById("view-home");
  function begin() {
    requestAnimationFrame(updateAll);
    // and a long backstop, so a heading can never stay behind its mask
    setTimeout(() => watch.forEach(done), 20000);
  }
  if (!home || home.classList.contains("active")) begin();
  else {
    const mo = new MutationObserver(() => {
      if (!home.classList.contains("active")) return;
      mo.disconnect();
      begin();
    });
    mo.observe(home, { attributes: true, attributeFilter: ["class"] });
  }
})();
