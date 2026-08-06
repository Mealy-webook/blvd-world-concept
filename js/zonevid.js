// ── hold a zone card to watch it ───────────────────────────────────────────
// Press and hold the card at the front and a short clip plays inside it, in the
// poster's own frame. Let go and it fades back to the poster.
//
// Only the front card, and that is the point rather than a shortcut: it is the
// one you can see whole, and the cards either side of it already mean something
// else on press — the ring and the fan both bring an off-centre card forward when
// you click it, and both read a drag across the deck as paging. A hold that fired
// anywhere would be competing with all of that.
//
// Which is also why this listens for a hold rather than a hover: the deck is
// draggable, so the pointer is often down on a card with no intention of watching
// anything. The rules are the ones a native long-press uses — 420ms, and any real
// movement cancels it.
(function () {
  const HOLD = 420;                    // ms before it fires
  const SLOP = 9;                      // px of movement that cancels the hold

  /* Every clip here is BLVD World's own park footage, and none of it is footage of
     the zone whose card it plays in — the material we have is a 32-second park
     banner, not twenty zone films. So a clip is labelled as what it is while it
     plays, and the label goes away by itself the moment real footage exists:
     a zone with `clip` in WBK.zones plays that instead, unlabelled.

     See CREDITS.md. Do not ship the samples as if they were zone footage. */
  const SAMPLES = [
    "video/zones/sample-aerial.mp4",     // the lit park from the air
    "video/zones/sample-lanterns.mp4",   // the lantern walk
    "video/zones/sample-lake.mp4",       // the lake, the Eiffel replica behind
    "video/zones/sample-amazonia.mp4",   // the Amazonia canyon at dusk
  ];
  const zoneOf = new Map((window.WBK?.zones || []).map((z) => [z.name, z]));

  /* the deck the pointer is over, and the card at its front */
  const DECKS = [
    { root: "#zone-flow", grab: ".cf-frame", front: ".cf-card.is-centre" },
    { root: "#zone-deck", grab: null,        front: ".fan-card.is-front" },
  ];

  for (const d of DECKS) {
    const root = document.querySelector(d.root);
    if (!root) continue;
    const surface = d.grab ? root.querySelector(d.grab) || root : root;
    wire(surface, root, d.front);
  }

  function wire(surface, root, frontSel) {
    let timer = null, from = null, held = null, id = -1;

    const frontCard = () => root.querySelector(frontSel);
    const inside = (el, x, y) => {
      const b = el.getBoundingClientRect();
      return x >= b.left && x <= b.right && y >= b.top && y <= b.bottom;
    };

    surface.addEventListener("pointerdown", (e) => {
      const card = frontCard();
      if (!card || !inside(card, e.clientX, e.clientY)) return;
      id = e.pointerId;
      from = { x: e.clientX, y: e.clientY };
      card.classList.add("is-holding");                 // fills the hold ring
      timer = setTimeout(() => { timer = null; start(card); }, HOLD);
    });

    surface.addEventListener("pointermove", (e) => {
      if (!from || e.pointerId !== id) return;
      if (Math.hypot(e.clientX - from.x, e.clientY - from.y) > SLOP) cancel();
    });

    for (const ev of ["pointerup", "pointercancel", "pointerleave"]) {
      surface.addEventListener(ev, cancel);
    }
    /* A hold that played something must not also follow the card's link. The ring
       navigates from its own click handler, so stopping the click is not enough —
       it has to be stopped in the capture phase, before that handler sees it. */
    surface.addEventListener("click", (e) => {
      if (!held) return;
      e.preventDefault(); e.stopPropagation();
      stop();
    }, true);

    function cancel() {
      if (timer) { clearTimeout(timer); timer = null; }
      const card = frontCard();
      if (card) card.classList.remove("is-holding");
      from = null; id = -1;
      /* the click arrives after pointerup, so a playing preview is left standing
         for the capture handler above to swallow the click and then close */
      if (!held) return;
      setTimeout(() => { if (held) stop(); }, 0);
    }

    function start(card) {
      card.classList.remove("is-holding");
      const link = card.matches("a") ? card : card.querySelector("a[href]");
      const name = decodeURIComponent((link?.getAttribute("href") || "").split("zone=")[1] || "");
      const z = zoneOf.get(name);
      const real = z && z.clip;
      const src = real || SAMPLES[hash(name) % SAMPLES.length];

      let vid = card.querySelector("video.zc-vid");
      if (!vid) {
        vid = document.createElement("video");
        vid.className = "zc-vid";
        vid.muted = true; vid.loop = true; vid.playsInline = true;
        vid.setAttribute("muted", "");
        vid.setAttribute("playsinline", "");
        vid.preload = "none";
        vid.tabIndex = -1;
        vid.setAttribute("aria-hidden", "true");
        card.appendChild(vid);
      }
      if (vid.getAttribute("src") !== src) vid.setAttribute("src", src);

      if (!real && !card.querySelector(".zc-sample")) {
        const tag = document.createElement("b");
        tag.className = "zc-sample";
        tag.textContent = "Park footage";
        card.appendChild(tag);
      }

      const p = vid.play();
      if (p && p.catch) p.catch(() => {});             // a blocked play just shows the poster
      card.classList.add("is-previewing");
      held = card;
    }

    function stop() {
      const card = held;
      held = null;
      if (!card) return;
      card.classList.remove("is-previewing");
      const vid = card.querySelector("video.zc-vid");
      if (!vid) return;
      // let the fade finish before the frame underneath it changes
      setTimeout(() => {
        if (card.classList.contains("is-previewing")) return;   // held again
        vid.pause();
        try { vid.currentTime = 0; } catch (err) { /* not seekable yet */ }
      }, 320);
    }
  }

  /* a stable pick per zone, so the same card always shows the same clip — an
     index would have moved with the ring's ordering */
  function hash(s) {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return h;
  }
})();
