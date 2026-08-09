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
  const ticket = (b) => `
    <article class="pl${b.featured ? " is-pick" : ""} reveal">
      ${b.featured ? `<p class="pl-flag">${b.flag || "Most rides for the money"}</p>` : ""}
      <div class="pl-head">
        <h3 class="pl-name">${b.name}</h3>
        <p class="pl-tag">${b.tag}</p>
      </div>
      <p class="pl-price">
        <span class="pl-cur">SAR</span><b>${b.price}</b>
      </p>
      <p class="pl-rate">${perRide(b)} &#183; per person</p>
      <ul class="pl-list">
        ${b.includes.filter(Boolean).map((line) => `
          <li><i aria-hidden="true"></i>${line}</li>`).join("")}
      </ul>
      <a class="pill ${b.featured ? "solid" : "ghost"} pl-cta" href="${b.href}"
         target="_blank" rel="noopener">${b.cta}</a>
    </article>`;

  host.innerHTML = TIERS.map((t) => {
    const items = list.filter((b) => b.group === t.key);
    if (!items.length) return "";
    return `
      <section class="tk-tier">
        <p class="tk-tier-h reveal">
          <span>${t.label}</span><i aria-hidden="true"></i><small>${t.note}</small>
        </p>
        <div class="pl-row">${items.map(ticket).join("")}</div>
      </section>`;
  }).join("");

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
})();
