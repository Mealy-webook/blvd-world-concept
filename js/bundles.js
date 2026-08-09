// ── ride packages, as a stack of ticket stubs ──────────────────────────
// Five packages read down the page rather than across it: one stub per row, so
// the price, the allowance and what it costs per ride line up in columns and
// nothing has to be compared across a wall of cards. The counted packages and
// the unlimited bracelets are kept apart, because they aren't the same offer.
(function () {
  const host = document.getElementById("bd-grid");
  if (!host) return;
  const list = (window.WBK && WBK.bundles) || [];
  if (!list.length) return;

  const TIERS = [
    { key: "credit", label: "RIDE PACKAGES", note: "Loaded onto a card · pay for the rides you want" },
    { key: "unlimited", label: "UNLIMITED", note: "Worn as an NFC bracelet · ride until close" },
  ];

  // what a single ride works out at — the whole point of buying by the handful
  const perRide = (b) => {
    const n = parseInt(b.count, 10);
    if (!n) return "Unlimited rides";
    const each = b.price / n;
    // never round a price up — 89 for five rides is 17.80, not 18
    return `SAR ${each % 1 ? each.toFixed(2) : each} a ride`;
  };

  /* ── a plan, not a ticket stub ──
     These were shaped like a torn ticket: a perforated stub with the ride count on
     it, then the copy, then the price at the end. That is a nice object and the wrong
     one for choosing between five things — a stub puts the count where the eye lands
     first, and the count is not what anybody is comparing. A price plan puts the
     price there, and everything else in the same place on every card, so five cards
     can be read down a column instead of one at a time.

     One card is marked as the pick. It is the one already flagged `featured` in the
     data, so nothing here decides it. */
  /* One card is the pick, and it is named here rather than read from the data's
     `featured` flags: two of the five carry that flag, and two highlighted cards in a
     row of five is no highlight at all. Which one is a merchandising decision, so it
     is one line to change. */
  const PICK = "FAMILY PACKAGE";

  /* ── what the pass arrives as ──
     Every plan already carried a `media` line in the data — "One card", "NFC
     bracelet", "3 cards · 10 games each" — and nothing on the page drew it. A card
     and a bracelet are different objects that you wear or carry differently, and the
     difference between the SAR 135 plan and the SAR 199 one is largely that: one is
     a card in your pocket, the other is on your wrist all night.

     The card is the real BLVD card artwork the cashless section uses, not a new
     drawing of one. The bracelet has no artwork anywhere on the site, so it is drawn
     here — a strap and a tap disc, in the same two strokes the rest of the UI uses. */
  const CARD_ART = "img/blvd-card.png";
  const bracelet = `
    <svg class="pl-glyph" viewBox="0 0 44 30" aria-hidden="true" focusable="false">
      <rect x="2.4" y="9.6" width="39.2" height="10.8" rx="5.4"
            fill="none" stroke="currentColor" stroke-width="2.2" />
      <circle cx="22" cy="15" r="5.4" fill="currentColor" opacity=".18" />
      <circle cx="22" cy="15" r="5.4" fill="none" stroke="currentColor" stroke-width="2.2" />
      <path d="M25.4 11.6a4.8 4.8 0 0 1 0 6.8M27.9 9.1a8.3 8.3 0 0 1 0 11.8"
            fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
    </svg>`;

  /* three overlapping cards for the family plan, one for the rest — the count is in
     the copy, so the picture may as well agree with it */
  function media(b) {
    const isBand = /bracelet/i.test(b.media || "");
    const many = /^3 /.test(b.media || "");
    const art = many
      ? `<span class="pl-deck">${[0, 1, 2].map((n) => `<img src="${CARD_ART}" alt="" style="--n:${n}" />`).join("")}</span>`
      : `<span class="pl-deck"><img src="${CARD_ART}" alt="" style="--n:0" /></span>`;
    return `
      <p class="pl-media${isBand ? " is-band" : ""}">
        ${isBand ? bracelet : art}<span>${b.media || ""}</span>
      </p>`;
  }

  const ticket = (b, i) => `
    <article class="pl${b.name === PICK ? " is-pick" : ""} reveal" style="--i:${i}">
      ${b.name === PICK ? `<p class="pl-flag">${b.flag || "Best value"}</p>` : ""}
      <div class="pl-head">
        <h3 class="pl-name">${b.name}</h3>
        <p class="pl-tag">${b.tag}</p>
      </div>
      <p class="pl-price">
        <span class="pl-cur">SAR</span><b>${b.price}</b>
      </p>
      <p class="pl-rate">${perRide(b)} &#183; per person</p>
      ${media(b)}
      <ul class="pl-list">
        ${b.includes.filter(Boolean).map((line) => `
          <li><i aria-hidden="true"></i>${line}</li>`).join("")}
      </ul>
      <!-- every button says Book. Five buttons each naming their own plan is five
           different-length labels in a row of cards that are otherwise identical, and
           the plan is named twice above it already. The full name stays on the
           accessible name, where it is the only place it is needed. -->
      <a class="pill ${b.name === PICK ? "solid" : "ghost"} pl-cta" href="${b.href}"
         target="_blank" rel="noopener" aria-label="${b.cta}">Book</a>
    </article>`;

  /* ── one group, five plans ──
     They used to be split into two tiers with a heading over each: ride credit, then
     unlimited. Two headings is two decisions, and there is only one — which of these
     five do I want. In a single row the reader compares all five prices in one pass,
     which is the point of a price table.

     Nothing is lost with the tier headings. What they carried — "loaded onto a card",
     "worn as an NFC bracelet" — each plan already lists among its inclusions, on the
     card it applies to. TIERS still gives the order, so credit comes before unlimited
     and the row reads cheapest to dearest. */
  const ordered = TIERS.flatMap((t) => list.filter((b) => b.group === t.key));
  host.innerHTML = ordered.length
    ? `<div class="pl-row is-one">${ordered.map((b, i) => ticket(b, i)).join("")}</div>`
    : "";

  // the reveal system only watches what existed at boot
  window.WBK_REVEAL && WBK_REVEAL.scan && WBK_REVEAL.scan();
})();

// ── the home page's way in: the five prices as a row of stubs ───────────
(function packagesCall() {
  const row = document.getElementById("pk-row");
  if (!row) return;
  const list = (window.WBK && WBK.bundles) || [];
  if (!list.length) return;
  row.innerHTML = list.map((b) => `
    <a class="pk-stub${b.featured ? " is-featured" : ""}" href="#/packages">
      <b class="pk-count">${b.count}</b>
      <span class="pk-unit">${parseInt(b.count, 10) ? "rides" : "all night"}</span>
      <span class="pk-rule" aria-hidden="true"></span>
      <span class="pk-name">${b.name}</span>
      <span class="pk-price">SAR ${b.price}</span>
    </a>`).join("");

  /* ── the rides the passes buy ──
     The same rail the restaurants and the zone pages use, with the park's rides in
     it. Every figure is WBK's own — `reg` is what a ride costs and `fast` is the fast
     lane, the two figures #/rides already prints — so nothing here invents a price
     for anything.

     The cards need .pop to be visible: .eat-card ships at opacity 0 and waits for it,
     which is the component's contract, not a quirk of this page. */
  const rideRail = document.getElementById("bd-ride-rail");
  if (rideRail) {
    const rides = WBK.rides || [];
    rideRail.innerHTML = rides.map((r) => `
      <article class="eat-card">
        <div class="eat-shot">
          <img src="img/rides/${r.img}" alt="${r.name}" draggable="false" loading="lazy" />
        </div>
        <div class="eat-text">
          <p class="eat-meta">${r.kind || "Ride"}</p>
          <h3>${r.name}</h3>
          <p class="eat-from"><b>SAR ${r.reg}</b>${r.fast ? `
            <span class="pl-fast">fast lane SAR ${r.fast}</span>` : ""}</p>
        </div>
      </article>`).join("");

    const cards = [...rideRail.querySelectorAll(".eat-card")];
    cards.forEach((c, i) => c.style.setProperty("--pop-d", (i % 6) * 70 + "ms"));
    const pop = () => cards.forEach((c) => c.classList.add("pop"));
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((es) => {
        for (const e of es) if (e.isIntersecting) { pop(); io.disconnect(); }
      }, { threshold: 0.1 });
      io.observe(rideRail);
      setTimeout(() => { pop(); io.disconnect(); }, 4000);   // fail open, as the others do
    } else {
      pop();
    }

    /* the arrows, and .spent when there is nothing left to scroll to */
    const btns = [...document.querySelectorAll('.rail-btn[data-rail="bd-ride-rail"]')];
    const mark = () => {
      const room = rideRail.scrollWidth - rideRail.clientWidth;
      btns.forEach((b) => {
        const isPrev = b.classList.contains("prev");
        b.classList.toggle("spent",
          room < 4 || (isPrev ? rideRail.scrollLeft < 4 : rideRail.scrollLeft > room - 4));
      });
    };
    for (const b of btns) {
      b.addEventListener("click", () => {
        const card = rideRail.firstElementChild;
        const step = card ? card.getBoundingClientRect().width + 16 : 260;
        rideRail.scrollBy({ left: b.classList.contains("prev") ? -step : step, behavior: "smooth" });
      });
    }
    rideRail.addEventListener("scroll", mark, { passive: true });
    mark();
    setTimeout(mark, 800);
  }

})();
