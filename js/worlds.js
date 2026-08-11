// ── the worlds ─────────────────────────────────────────────────────────────
// The zones as a list of tiles you can open, built from the same WBK.zones the map
// and the zone pages read.
//
// It replaced a coverflow. A coverflow shows one zone and turns the other
// twenty-three away from you, which is the wrong shape for the question people
// arrive with — "what is in there" — and the answer was two clicks away on a page of
// its own. Here it is one.
//
// Only one tile is open at a time. Twenty-four open tiles is the list without the
// tiles, and the point of the row is that you can still see the others.
(function () {
  const list = document.getElementById("wr-list");
  if (!list || !window.WBK || !Array.isArray(WBK.zones)) return;

  const esc = (t) =>
    String(t == null ? "" : t).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* the three zones the season is announcing. It is the same set js/zones.js used to
     badge, kept here rather than re-derived, because "new" is an editorial fact about
     this season and not something the data can be asked. */
  const NEW = new Set(["Indonesia", "South Korea", "Kuwait"]);

  const zones = WBK.zones;

  function tile(z, i) {
    const img = z.poster || (z.imgs || [])[0];
    const rides = (z.rides || []).slice(0, 4);
    const food = (z.food || []).slice(0, 3);
    const seen = (z.attractions || []).slice(0, 3);
    return `
      <article class="wr" style="--i:${i}">
        <button class="wr-bar" type="button" aria-expanded="false"
                aria-controls="wr-p-${i}" data-i="${i}">
          <span class="wr-shot">
            ${img ? `<img src="img/zones/${esc(img)}" alt="" loading="lazy" draggable="false" />` : ""}
          </span>
          <span class="wr-text">
            <span class="wr-name">
              ${esc(z.name)}${NEW.has(z.name) ? '<em class="wr-new">New</em>' : ""}
            </span>
            <span class="wr-blurb">${esc(z.blurb || "")}</span>
          </span>
          <span class="wr-more"><i aria-hidden="true"></i></span>
        </button>
        <div class="wr-panel" id="wr-p-${i}" hidden>
          <div class="wr-panel-in">
            ${cols([
              ["Rides", rides],
              ["Worth seeing", seen],
              ["Eat here", food],
            ])}
            <div class="wr-go">
              <a class="pill light" href="#/zone?z=${encodeURIComponent(z.name)}">Explore ${esc(z.name)}</a>
              <a class="pill ghost" href="#/map?zone=${encodeURIComponent(z.name)}">On the map</a>
            </div>
          </div>
        </div>
      </article>`;
  }

  /* a column is dropped rather than printed empty: a heading over nothing reads as
     missing content, and some zones genuinely have no rides */
  function cols(groups) {
    return groups
      .filter(([, items]) => items && items.length)
      .map(([label, items]) => `
        <div class="wr-col">
          <p class="wr-lab">${label}</p>
          <ul>${items.map((n) => `<li>${esc(n)}</li>`).join("")}</ul>
        </div>`)
      .join("");
  }

  list.innerHTML = zones.map(tile).join("");

  const bars = [...list.querySelectorAll(".wr-bar")];
  const panels = [...list.querySelectorAll(".wr-panel")];

  function open(i) {
    for (let k = 0; k < bars.length; k++) {
      const on = k === i;
      bars[k].setAttribute("aria-expanded", on ? "true" : "false");
      bars[k].closest(".wr").classList.toggle("is-open", on);
      const p = panels[k];
      /* hidden comes off before the height is animated, because an element cannot
         transition out of display: none — the frame it would start from never happens.
         Reading scrollHeight in between is what gives it a number to grow to. */
      if (on) {
        p.hidden = false;
        p.style.height = "0px";
        void p.scrollHeight;
        p.style.height = p.scrollHeight + "px";
      } else if (!p.hidden) {
        p.style.height = p.scrollHeight + "px";
        void p.scrollHeight;
        p.style.height = "0px";
      }
    }
  }

  /* once it has finished growing the height goes back to auto, or a panel whose
     contents reflow — a font arriving, a rotation — stays clipped at the height it
     happened to be measured at */
  for (const p of panels) {
    p.addEventListener("transitionend", (e) => {
      if (e.propertyName !== "height") return;
      if (p.closest(".wr").classList.contains("is-open")) p.style.height = "auto";
      else { p.hidden = true; p.style.height = ""; }
    });
  }

  list.addEventListener("click", (e) => {
    const bar = e.target.closest(".wr-bar");
    if (!bar) return;
    const i = +bar.dataset.i;
    const already = bar.getAttribute("aria-expanded") === "true";
    open(already ? -1 : i);      // pressing the open one closes it
  });

  /* the first tile opens itself, so the row shows what opening does rather than
     leaving the reader to guess that the bars are pressable */
  open(0);
})();
