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

  /* The card books. There is no pill under it any more: a card whose whole face is
     one destination should be one control, and a button inside it only invited the
     question of what the rest of the card did.

     It stays a link rather than becoming a click handler on the <article>, so it
     keeps everything a link is: the keyboard reaches it, the status bar shows where
     it goes, and middle-click still opens a tab. The trick is the stretched anchor —
     it sits at inset 0 over a position: relative card, so the whole face is the hit
     area while the text underneath stays selectable text rather than link text. */
  const card = (x, i) => `
    <article class="eat-card is-book" style="--pop-d:${(i % 6) * 70}ms">
      <div class="eat-shot">
        <img src="img/${x.img}" alt="${x.title}" draggable="false" loading="lazy" />
      </div>
      <div class="eat-text">
        <p class="eat-meta">${x.zone || ""}</p>
        <h3>${x.title}</h3>
        ${x.blurb ? `<p class="xp-blurb">${x.blurb}</p>` : ""}
        <p class="eat-from">From <b>SAR ${x.price}</b></p>
      </div>
      <a class="xp-hit" href="https://webook.com" target="_blank" rel="noopener"
         aria-label="Book ${x.title}"><span>Book</span></a>
    </article>`;

  /* Two filters over one list rather than two lists: the chip narrows by zone, the
     field narrows by words, and paint() always applies both. Keeping the state in two
     variables up here is what makes typing and then pressing a chip do the obvious
     thing instead of throwing the other one away. */
  let pickedZone = "";
  let query = "";

  const norm = (t) => (t || "").toLowerCase();
  function hits(x) {
    if (!query) return true;
    /* every word has to appear somewhere — "egypt escape" finds the escape room in
       Egypt, and does not find everything in Egypt plus every escape room */
    const hay = norm(`${x.title} ${x.zone} ${x.blurb || ""}`);
    return query.split(/\s+/).every((w) => hay.includes(w));
  }

  function paint() {
    const zone = pickedZone;
    const list = ALL.filter((x) => (!zone || x.zone === zone) && hits(x));
    grid.innerHTML = list.map(card).join("");
    if (empty) {
      empty.hidden = list.length > 0;
      empty.textContent = query
        ? `Nothing matches \u201c${query}\u201d${zone ? ` in ${zone}` : ""}.`
        : "Nothing in that zone yet.";
    }
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
    pickedZone = chip.dataset.zone;
    paint();
  });

  /* the field, and the clear button that only exists while there is something to
     clear — a permanently dimmed x is furniture */
  const field = document.getElementById("xp-q");
  const clear = document.getElementById("xp-clear");
  if (field) {
    field.addEventListener("input", () => {
      query = norm(field.value).trim();
      if (clear) clear.hidden = !query;
      paint();
    });
    /* Escape empties the field, which is what Escape does in a search box */
    field.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && field.value) {
        e.stopPropagation();
        field.value = ""; query = "";
        if (clear) clear.hidden = true;
        paint();
      }
    });
  }
  if (clear) {
    clear.addEventListener("click", () => {
      field.value = ""; query = "";
      clear.hidden = true;
      field.focus();
      paint();
    });
  }

  paint();
})();
