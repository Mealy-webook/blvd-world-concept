// ── bundles: three bookable tickets, rendered from WBK.bundles ──
(function () {
  const host = document.getElementById("bd-grid");
  if (!host) return;
  const list = (window.WBK && WBK.bundles) || [];
  if (!list.length) return;

  host.innerHTML = list.map((b) => `
    <article class="bd-card${b.featured ? " is-featured" : ""} reveal">
      ${b.featured ? '<span class="bd-flag">MOST BOOKED</span>' : ""}
      <p class="bd-tag">${b.tag}</p>
      <h3>${b.name}</h3>
      <p class="bd-blurb">${b.blurb}</p>
      <div class="bd-price">
        <span class="bd-from">from</span>
        <b>SAR ${b.price}</b>
        <span class="bd-per">per person</span>
      </div>
      <ul class="bd-list">
        ${b.includes.map((line) => `<li><i aria-hidden="true">✓</i>${line}</li>`).join("")}
      </ul>
      <a class="pill ${b.featured ? "solid" : "ghost"} bd-cta" href="${b.href}"
         target="_blank" rel="noopener">${b.cta}</a>
    </article>`).join("");

  // the reveal system only watches what existed at boot
  window.WBK_REVEAL && WBK_REVEAL.scan && WBK_REVEAL.scan();
})();
