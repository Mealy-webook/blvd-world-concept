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

  const ticket = (b) => `
    <article class="tk${b.featured ? " is-featured" : ""} reveal">
      <div class="tk-stub">
        <b class="tk-count">${b.count}</b>
        <span class="tk-unit">${parseInt(b.count, 10) ? "rides" : "all night"}</span>
      </div>
      <i class="tk-perf" aria-hidden="true"></i>
      <div class="tk-body">
        <p class="tk-tag">${b.tag}${b.flag ? ` <em>${b.flag}</em>` : ""}</p>
        <h3>${b.name}</h3>
        <p class="tk-blurb">${b.blurb}</p>
        <ul class="tk-list">
          ${b.includes.map((line) => `<li>${line}</li>`).join("")}
        </ul>
      </div>
      <div class="tk-end">
        <p class="tk-price"><span>SAR</span><b>${b.price}</b></p>
        <p class="tk-rate">${perRide(b)} &#183; per person</p>
        <a class="pill ${b.featured ? "solid" : "ghost"} tk-cta" href="${b.href}"
           target="_blank" rel="noopener">${b.cta}</a>
        <p class="tk-fine"><span class="tk-media">${b.media}</span>Expires end of day</p>
      </div>
    </article>`;

  host.innerHTML = TIERS.map((t) => {
    const items = list.filter((b) => b.group === t.key);
    if (!items.length) return "";
    return `
      <section class="tk-tier">
        <p class="tk-tier-h reveal">
          <span>${t.label}</span><i aria-hidden="true"></i><small>${t.note}</small>
        </p>
        <div class="tk-stack">${items.map(ticket).join("")}</div>
      </section>`;
  }).join("");

  // the reveal system only watches what existed at boot
  window.WBK_REVEAL && WBK_REVEAL.scan && WBK_REVEAL.scan();
})();
