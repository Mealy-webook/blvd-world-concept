// ── the zones as a fan ─────────────────────────────────────────────────────
// The globe version lays the season's posters out like a hand of cards: they all
// pivot from one point below the deck, so the further a card sits from the chosen
// one the more it leans and the lower it rides. The chosen card stands upright and
// clear at the front.
//
// Nothing here runs per frame. A fan is still between interactions, so layout()
// writes each transform once and CSS transitions carry the movement — where the
// coverflow ring has to repaint sixty times a second because it is mid-flight.
//
// The interaction contract is deliberately the same as the ring's: a card that is
// not chosen becomes chosen, and the chosen one opens that zone on the map. Two
// versions of the same page should not answer a click differently.
(function () {
  const root = document.getElementById("zone-fan");
  if (!root || !window.WBK_ZONES) return;

  const { items, start, isNew } = WBK_ZONES;
  if (!items.length) return;

  const SPREAD = 7.5;        // degrees between neighbours
  const PITCH = 0.29;        // horizontal step, as a fraction of card width
  const DROP = 5;            // how far each step out rides down the arc, in px
  const LIFT = 26;           // how far the chosen card stands above the rest

  root.innerHTML = `
    <div class="fan" role="listbox" aria-label="The season's zones" tabindex="0">
      ${items.map((z, i) => `
        <a class="fan-card" role="option" aria-selected="false" data-i="${i}"
           href="#/map?zone=${encodeURIComponent(z.name)}"
           aria-label="${z.name} — open on the park map">
          <img src="img/zones/posters/${z.poster}" alt="${z.name}"
               draggable="false" loading="lazy">
          ${isNew(z.name) ? '<b class="zc-new">New</b>' : ""}
        </a>`).join("")}
    </div>
    <p class="fan-name" aria-live="polite"></p>`;

  const deck = root.querySelector(".fan");
  const cards = [...root.querySelectorAll(".fan-card")];
  const nameEl = root.querySelector(".fan-name");
  let at = Math.min(Math.max(start, 0), cards.length - 1);
  let hovered = -1;

  function layout() {
    for (let i = 0; i < cards.length; i++) {
      const c = cards[i];
      const d = i - at;                       // signed distance from the chosen card
      const away = Math.abs(d);
      const chosen = d === 0;
      const up = chosen ? LIFT : (i === hovered ? 14 : 0);
      c.style.transform =
        `translateX(calc(${d * PITCH} * var(--fan-card)))` +
        ` translateY(${(away ** 1.5 * DROP - up).toFixed(1)}px)` +
        ` rotate(${(d * SPREAD).toFixed(2)}deg)` +
        ` scale(${chosen ? 1.06 : 1})`;
      c.style.zIndex = String(100 - away);
      c.classList.toggle("is-chosen", chosen);
      c.setAttribute("aria-selected", chosen ? "true" : "false");
    }
    nameEl.textContent = items[at].name;
    // the cursor says what the card under it actually does — the same contract the
    // ring uses, read by js/cursor.js off data-cursor-word
    deck.dataset.cursorWord =
      hovered < 0 ? "Explore zones" : hovered === at ? "Explore zone" : "Select";
  }

  function choose(i) {
    const n = ((i % cards.length) + cards.length) % cards.length;
    if (n === at) return;
    at = n;
    layout();
  }

  deck.addEventListener("click", (e) => {
    const c = e.target.closest(".fan-card");
    if (!c) return;
    const i = +c.dataset.i;
    if (i !== at) { e.preventDefault(); choose(i); }
    // the chosen card follows its own href, which opens the map on that zone
  });

  deck.addEventListener("pointerover", (e) => {
    const c = e.target.closest(".fan-card");
    const i = c ? +c.dataset.i : -1;
    if (i === hovered) return;
    hovered = i;
    layout();
  });
  deck.addEventListener("pointerleave", () => {
    if (hovered === -1) return;
    hovered = -1;
    layout();
  });

  deck.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") { e.preventDefault(); choose(at - 1); }
    else if (e.key === "ArrowRight") { e.preventDefault(); choose(at + 1); }
    else if (e.key === "Home") { e.preventDefault(); choose(0); }
    else if (e.key === "End") { e.preventDefault(); choose(cards.length - 1); }
  });

  layout();
})();
