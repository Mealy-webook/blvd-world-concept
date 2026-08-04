// ── rides, as a poster board ───────────────────────────────────────────
// A different read from the fanned deck: every ride visible at once in a
// staggered grid, filterable by how hard it hits. Tiles reveal on scroll and
// lean towards the cursor.
(function () {
  const grid = document.getElementById("rb-grid");
  const filters = document.getElementById("rb-filters");
  if (!grid) return;
  const rides = (window.WBK && WBK.rides) || [];
  if (!rides.length) return;

  const HEAT = { THRILL: 3, AERIAL: 3, ADVENTURE: 2, "FAMILY SWING": 2, FAMILY: 1, SCENIC: 1 };
  const BAND = { 1: "gentle", 2: "lively", 3: "thrill" };
  const LABEL = { gentle: "Gentle", lively: "Lively", thrill: "Full throttle" };
  const heat = (r) => HEAT[r.kind] || 2;

  // every third tile runs tall, so the grid reads as a board rather than a table
  const TALL = new Set([0, 4, 7, 11]);

  grid.innerHTML = rides.map((r, i) => {
    const h = heat(r);
    const band = BAND[h];
    return `
      <article class="rb-tile ${TALL.has(i) ? "is-tall" : ""}" data-band="${band}">
        <img src="img/rides/${r.img}" alt="${r.name}" loading="lazy" draggable="false">
        <span class="rb-no">${String(i + 1).padStart(2, "0")}</span>
        <div class="rb-meta">
          <span class="rb-kind">${r.kind}</span>
          <h3>${r.name}</h3>
          <span class="rb-heat b${h}">
            <i></i><i></i><i></i>
            <em>${LABEL[band]}</em>
          </span>
        </div>
        <i class="rb-sheen" aria-hidden="true"></i>
      </article>`;
  }).join("");

  /* ── filters: all / gentle / lively / full throttle ── */
  const counts = rides.reduce((m, r) => { const b = BAND[heat(r)]; m[b] = (m[b] || 0) + 1; return m; }, {});
  const CHIPS = [["all", "All rides", rides.length], ["thrill", "Full throttle", counts.thrill || 0],
                 ["lively", "Lively", counts.lively || 0], ["gentle", "Gentle", counts.gentle || 0]];
  if (filters) {
    filters.innerHTML = CHIPS.map(([k, label, n], i) => `
      <button class="rb-chip${i === 0 ? " on" : ""}" type="button" data-band="${k}">
        ${label}<b>${n}</b>
      </button>`).join("");

    filters.addEventListener("click", (e) => {
      const chip = e.target.closest(".rb-chip");
      if (!chip) return;
      filters.querySelectorAll(".rb-chip").forEach((c) => c.classList.toggle("on", c === chip));
      const band = chip.dataset.band;
      grid.querySelectorAll(".rb-tile").forEach((t) => {
        const keep = band === "all" || t.dataset.band === band;
        t.classList.toggle("muted", !keep);
      });
    });
  }

  /* ── tiles rise in as the board scrolls in ── */
  const tiles = [...grid.querySelectorAll(".rb-tile")];
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (still) {
    tiles.forEach((t) => t.classList.add("in"));
  } else {
    tiles.forEach((t, i) => t.style.setProperty("--d", (i % 5) * 70 + "ms"));
    const io = new IntersectionObserver((es) => {
      for (const en of es) if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
    }, { threshold: 0.15 });
    tiles.forEach((t) => io.observe(t));
    // fail-open: never leave a tile stuck invisible
    setTimeout(() => tiles.forEach((t) => t.classList.add("in")), 4000);
  }

  /* ── lean towards the cursor, one listener for the whole board ── */
  if (!still) {
    grid.addEventListener("pointermove", (e) => {
      const t = e.target.closest(".rb-tile");
      if (!t) return;
      const b = t.getBoundingClientRect();
      const x = (e.clientX - b.left) / b.width, y = (e.clientY - b.top) / b.height;
      t.style.setProperty("--rx", ((0.5 - y) * 6).toFixed(2) + "deg");
      t.style.setProperty("--ry", ((x - 0.5) * 8).toFixed(2) + "deg");
      t.style.setProperty("--mx", (x * 100).toFixed(1) + "%");
      t.style.setProperty("--my", (y * 100).toFixed(1) + "%");
    });
    grid.addEventListener("pointerout", (e) => {
      const t = e.target.closest(".rb-tile");
      if (t) { t.style.removeProperty("--rx"); t.style.removeProperty("--ry"); }
    });
  }

  // the CTA jumps to the bundles, same as the hero's
  const jump = document.querySelector(".js-to-bundles2");
  const home = document.getElementById("view-home");
  if (jump && home) jump.addEventListener("click", (e) => {
    e.preventDefault();
    const sec = document.getElementById("bundles");
    if (sec) home.scrollTo({ top: sec.offsetTop, behavior: "smooth" });
  });
})();
