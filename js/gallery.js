// ── gallery: the night's photographs, as a deck ────────────────────────────
// A hand of cards you flick through rather than a tunnel you fly down. The deck is
// js/fan.js — the same component the zones use in the globe version, which deals
// itself out when the section arrives, pages with the arrows and the dots, takes a
// swipe, and pushes its neighbours aside as the pointer crosses it. Nothing here
// re-implements any of that; this file supplies the cards and the lightbox.
//
// The front card opens full size. A card off the front comes forward first, which is
// the contract both the fan and the ring already use everywhere else on this site.
(function () {
  const deck = document.getElementById("gal-deck");

  const PLATES = [
    { img: "fireworks.jpg",     cap: "Fireworks over the lake" },
    { img: "rock-mapping.jpg",  cap: "Projections on the rock" },
    { img: "greek-zone.jpg",    cap: "Cable cars, Greek quarter" },
    { img: "lake-aerial.jpg",   cap: "The lake from above" },
    { img: "beast-gate.jpg",    cap: "Into Beast Land" },
    { img: "skyloop-night.jpg", cap: "Sky Loop after dark" },
    { img: "amazonia-sign.jpg", cap: "Amazonia Awakens" },
    { img: "night-aerial.jpg",  cap: "One night, many worlds" },
  ];

  if (deck && window.WBK_FAN) {
    WBK_FAN.make({
      deckId: "gal-deck", prevId: "gal-prev", nextId: "gal-next", dotsId: "gal-dots",
      items: PLATES,
      /* a button rather than a link: there is nowhere to navigate to, the lightbox
         opens in place, and a link with no href is a control pretending to be one */
      card: (p, i) => `
        <button class="fan-card is-shot" type="button" data-i="${i}"
                aria-label="Open ${p.cap}">
          <img src="img/gallery/${p.img}" alt="${p.cap}" draggable="false" loading="lazy">
          <figcaption class="fs-cap">${p.cap}</figcaption>
        </button>`,
    });

    /* Only the front card opens. fan.js brings a card to the front when it is
       clicked and marks it .is-front, so this checks rather than duplicates that. */
    deck.addEventListener("click", (e) => {
      const card = e.target.closest(".fan-card");
      if (card && card.classList.contains("is-front")) open(+card.dataset.i || 0);
    });
  }

  /* ── the lightbox ──
     One frame, reused. It hangs off <body> rather than the section: .view carries
     a filter, and a filter makes an element the containing block for anything
     fixed inside it, so a fixed overlay in there would be trapped in the page. */
  const box = document.createElement("div");
  box.className = "lbx";
  box.hidden = true;
  box.innerHTML = `
    <div class="lbx-scrim" data-close></div>
    <div class="lbx-stage" role="dialog" aria-modal="true" aria-label="Gallery">
      <div class="lbx-frame">
        <figure class="lbx-shot">
          <img alt="">
        </figure>
      </div>
      <div class="lbx-bar">
        <p class="lbx-cap"></p>
        <p class="lbx-count"></p>
      </div>
      <button class="lbx-nav lbx-prev" type="button" aria-label="Previous photograph">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5 8 12l7 7" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <button class="lbx-nav lbx-next" type="button" aria-label="Next photograph">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <button class="lbx-x" type="button" aria-label="Close" data-close>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
      </button>
    </div>`;
  document.body.appendChild(box);

  const shot = box.querySelector(".lbx-shot img");
  const cap = box.querySelector(".lbx-cap");
  const count = box.querySelector(".lbx-count");
  const closeBtn = box.querySelector(".lbx-x");
  let at = 0, opener = null;

  function paint(i, dir) {
    at = (i + PLATES.length) % PLATES.length;
    const p = PLATES[at];
    // re-run the entry animation on each change, in the direction of travel
    box.classList.remove("slid-l", "slid-r");
    if (dir) { void box.offsetWidth; box.classList.add(dir > 0 ? "slid-r" : "slid-l"); }
    shot.src = "img/gallery/" + p.img;
    shot.alt = p.cap;
    cap.textContent = p.cap;
    count.textContent = String(at + 1).padStart(2, "0") + " / " + String(PLATES.length).padStart(2, "0");
  }

  function open(i) {
    opener = document.activeElement;
    paint(i);
    box.hidden = false;
    void box.offsetWidth;                       // let the transition catch
    box.classList.add("on");
    document.documentElement.classList.add("lbx-open");
    closeBtn.focus({ preventScroll: true });
  }
  function close() {
    box.classList.remove("on");
    document.documentElement.classList.remove("lbx-open");
    const done = () => { box.hidden = true; };
    setTimeout(done, 320);
    if (opener && opener.focus) opener.focus({ preventScroll: true });
  }

  /* The keyboard route. The click route lives up with the deck, where it can ask
     fan.js which card is at the front; a card off the front comes forward instead of
     opening, which is the contract the rest of this site uses. */
  if (deck) {
    deck.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      const card = e.target.closest(".fan-card");
      if (!card || !card.classList.contains("is-front")) return;
      e.preventDefault();
      open(+card.dataset.i || 0);
    });
  }

  // the page scrolls inside #view-home, not the window, so rather than freezing
  // that container — and risking its scroll position — the overlay simply eats
  // the wheel and the drag while it is up
  const eat = (e) => e.preventDefault();
  box.addEventListener("wheel", eat, { passive: false });
  box.addEventListener("touchmove", eat, { passive: false });

  box.addEventListener("click", (e) => {
    if (e.target.closest("[data-close]")) return close();
    if (e.target.closest(".lbx-prev")) return paint(at - 1, -1);
    if (e.target.closest(".lbx-next")) return paint(at + 1, 1);
  });
  addEventListener("keydown", (e) => {
    if (box.hidden) return;
    if (e.key === "Escape") { e.preventDefault(); close(); }
    else if (e.key === "ArrowLeft") paint(at - 1, -1);
    else if (e.key === "ArrowRight") paint(at + 1, 1);
    else if (e.key === "Tab") {
      // three controls and nothing else: keep Tab inside them
      const stops = [closeBtn, box.querySelector(".lbx-prev"), box.querySelector(".lbx-next")];
      const i = stops.indexOf(document.activeElement);
      e.preventDefault();
      stops[(i + (e.shiftKey ? -1 : 1) + stops.length) % stops.length].focus();
    }
  });

  // scroll adds a little extra travel, in opposite directions per belt
})();
