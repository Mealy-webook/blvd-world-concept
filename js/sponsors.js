// ── sponsors: the partner tiers, rendered from the official map's panel ──
// Logos are cropped from the printed panel, so they arrive on white — each one
// sits on its own light plate to stay legible against the night sky.
(function () {
  const host = document.getElementById("sp-tiers");
  if (!host) return;
  const tiers = (window.WBK && WBK.partners) || [];
  if (!tiers.length) return;

  // the last two tiers are single-logo, and sit side by side as printed
  const singles = tiers.filter((t) => t.logos.length === 1);
  const rows = tiers.filter((t) => t.logos.length > 1);

  const plate = (l) => `
    <div class="sp-plate"${l.name ? "" : ' title="Partner — name to confirm"'}>
      <img src="img/partners/${l.img}" alt="${l.name || "Partner logo"}" loading="lazy" draggable="false">
    </div>`;

  const tierBlock = (t, cls) => `
    <div class="sp-tier ${cls || ""} reveal">
      <p class="sp-label">${t.tier}</p>
      <div class="sp-logos">${t.logos.map(plate).join("")}</div>
    </div>`;

  host.innerHTML =
    rows.map((t) => tierBlock(t)).join("") +
    (singles.length ? `<div class="sp-pair">${singles.map((t) => tierBlock(t, "narrow")).join("")}</div>` : "");

  // the reveal system only watches what existed at boot
  window.WBK_REVEAL && WBK_REVEAL.scan && WBK_REVEAL.scan();
})();
