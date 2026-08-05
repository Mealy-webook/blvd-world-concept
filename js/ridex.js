// ── rides, as an index with a stage ────────────────────────────────────
// Fourteen rides read as a typeset list: number, name, intensity. Whatever the
// pointer or keyboard lands on is held large on the stage beside it, so the
// whole set is scannable at once and still gets a full-size photograph.
(function () {
  const index = document.getElementById("rx-index");
  const filters = document.getElementById("rx-filters");
  if (!index) return;
  const rides = (window.WBK && WBK.rides) || [];
  if (!rides.length) return;

  const HEAT = { THRILL: 3, AERIAL: 3, ADVENTURE: 2, "FAMILY SWING": 2, FAMILY: 1, SCENIC: 1 };
  const BAND = { 1: "gentle", 2: "lively", 3: "thrill" };
  const LABEL = { gentle: "Gentle", lively: "Lively", thrill: "Full throttle" };
  const heat = (r) => HEAT[r.kind] || 2;
  const no = (i) => String(i + 1).padStart(2, "0");
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const bars = (h) => `<span class="rx-heat b${h}"><i></i><i></i><i></i></span>`;

  /* the stage is gone; each row carries its own thumbnail */

  /* ── the index ── */
  index.innerHTML = rides.map((r, i) => {
    const h = heat(r);
    return `
      <li class="rx-row" data-i="${i}" data-band="${BAND[h]}" style="--d:${Math.min(i, 9) * 45}ms">
        <button class="rx-hit" type="button">
          <span class="rx-no">${no(i)}</span>
          <span class="rx-thumb"><img src="img/rides/${r.img}" alt="" loading="lazy" draggable="false"></span>
          <span class="rx-name">${r.name}</span>
          <span class="rx-kind">${r.kind}</span>
          ${bars(h)}
          <span class="rx-reg"><b>SAR ${r.reg}</b></span>
          <span class="rx-fast"><b>SAR ${r.fast}</b></span>
        </button>
      </li>`;
  }).join("");
  const rows = [...index.children];

  let active = -1;
  function select(i) {
    if (i === active || !rides[i]) return;
    active = i;
    rows.forEach((r, n) => r.classList.toggle("on", n === i));
  }

  // pointer and keyboard land on the same handler
  index.addEventListener("pointerover", (e) => {
    const row = e.target.closest(".rx-row");
    if (row) select(+row.dataset.i);
  });
  index.addEventListener("focusin", (e) => {
    const row = e.target.closest(".rx-row");
    if (row) select(+row.dataset.i);
  });
  // a tap on a row picks it; a second tap on the same row books
  index.addEventListener("click", (e) => {
    const row = e.target.closest(".rx-row");
    if (!row) return;
    const i = +row.dataset.i;
    if (i !== active) { select(i); return; }
    location.hash = "#/packages";     // a second tap goes to what includes it
  });

  /* ── filters: the list shortens rather than dimming ── */
  const counts = rides.reduce((m, r) => { const b = BAND[heat(r)]; m[b] = (m[b] || 0) + 1; return m; }, {});
  const CHIPS = [["all", "All rides", rides.length], ["thrill", "Full throttle", counts.thrill || 0],
                 ["lively", "Lively", counts.lively || 0], ["gentle", "Gentle", counts.gentle || 0]];
  if (filters) {
    filters.innerHTML = CHIPS.map(([k, label, n], i) => `
      <button class="rx-chip${i === 0 ? " on" : ""}" type="button" data-band="${k}">
        ${label}<b>${n}</b>
      </button>`).join("");

    filters.addEventListener("click", (e) => {
      const chip = e.target.closest(".rx-chip");
      if (!chip) return;
      filters.querySelectorAll(".rx-chip").forEach((c) => c.classList.toggle("on", c === chip));
      const band = chip.dataset.band;
      let first = -1;
      rows.forEach((r, i) => {
        const keep = band === "all" || r.dataset.band === band;
        r.classList.toggle("gone", !keep);
        if (keep && first < 0) first = i;
      });
      if (first >= 0) select(first);        // the stage follows the filter
    });
  }

  /* ── rows type themselves in as the section arrives ── */
  if (still) {
    rows.forEach((r) => r.classList.add("in"));
  } else {
    const io = new IntersectionObserver((es) => {
      for (const en of es) if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
    }, { threshold: 0.4 });
    rows.forEach((r) => io.observe(r));
    // fail-open: never leave a row stuck invisible
    setTimeout(() => rows.forEach((r) => r.classList.add("in")), 4000);
  }

  select(0);

  // the page's CTA is a plain link to #/packages — no handler needed
})();

