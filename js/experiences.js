// ── experiences: a grid you can filter ─────────────────────────────────────
// The restaurants' card, laid out in a grid that scrolls down rather than across,
// with the zones as filters along the top.
//
// It was a concave-arc carousel before this: one experience readable at a time, nine
// turned away from you, and no way at all to answer "what is there in Egypt". Ten
// things you might book is a list — and a list is worth filtering.
//
// Nothing here is a new component. The card is .eat-card, the same one the
// restaurants and the zone pages use, and the chips are the shows page's, filtering
// rather than switching.
(function () {
  const grid = document.getElementById("xp-grid");
  const strip = document.getElementById("xp-filters");
  const empty = document.getElementById("xp-empty");
  if (!grid || !window.WBK) return;

  const ALL = WBK.experiences || [];
  if (!ALL.length) return;

  /* Zones in the order they first appear, not alphabetically: the data is ordered by
     someone who knows the park, and "All" belongs first because it is the state the
     page opens in. */
  const zones = [];
  for (const x of ALL) if (x.zone && !zones.includes(x.zone)) zones.push(x.zone);

  strip.innerHTML = [
    `<button class="xp-chip is-on" type="button" data-zone="" aria-pressed="true">
       All<em>${ALL.length}</em></button>`,
    ...zones.map((z) => {
      const n = ALL.filter((x) => x.zone === z).length;
      return `<button class="xp-chip" type="button" data-zone="${z}" aria-pressed="false">
                ${z}<em>${n}</em></button>`;
    }),
  ].join("");

  const card = (x, i) => `
    <article class="eat-card" style="--pop-d:${(i % 6) * 70}ms">
      <div class="eat-shot">
        <img src="img/${x.img}" alt="${x.title}" draggable="false" loading="lazy" />
      </div>
      <div class="eat-text">
        <p class="eat-meta">${x.zone || ""}</p>
        <h3>${x.title}</h3>
        ${x.blurb ? `<p class="xp-blurb">${x.blurb}</p>` : ""}
        <p class="eat-from">From <b>SAR ${x.price}</b></p>
      </div>
      <a class="pill ghost xp-book" href="https://webook.com" target="_blank"
         rel="noopener" aria-label="Book ${x.title}">Book</a>
    </article>`;

  function paint(zone) {
    const list = zone ? ALL.filter((x) => x.zone === zone) : ALL;
    grid.innerHTML = list.map(card).join("");
    if (empty) empty.hidden = list.length > 0;
    /* .eat-card ships at opacity 0 and waits for .pop — the component's contract.
       A frame's delay lets the new cards start from their own beginning rather than
       inheriting the outgoing ones' finished state. */
    const cards = [...grid.children];
    requestAnimationFrame(() => cards.forEach((c) => c.classList.add("pop")));
    /* and a fail-open, because a filter that leaves the grid invisible when a frame
       does not arrive is worse than one that does not animate */
    setTimeout(() => cards.forEach((c) => c.classList.add("pop")), 600);
  }

  strip.addEventListener("click", (e) => {
    const chip = e.target.closest(".xp-chip");
    if (!chip) return;
    for (const c of strip.children) {
      const on = c === chip;
      c.classList.toggle("is-on", on);
      c.setAttribute("aria-pressed", on ? "true" : "false");
    }
    paint(chip.dataset.zone);
  });

  paint("");
})();
