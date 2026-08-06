// ── the three hero versions ────────────────────────────────────────────────
// One page, three openings, so they can be compared side by side rather than
// described:
//
//   cartoon     the generated landmark panorama — Grendizer, the Taj, the lake
//   real video  the park's own banner footage, from blvdworld.sa
//   globe       no footage at all: the planet swells up out of the fold as the
//               hero scrolls away (js/globe.js, driven by scene.js)
//
// The choice lives in the URL so a version can be sent to someone as a link:
// ?hero=real, or #/?hero=real once you are past the landing route. The switcher
// in the corner writes the same parameter, so what you are looking at and what
// you would share never disagree.
(function () {
  const VERSIONS = [
    { key: "cartoon", name: "Cartoon hero", note: "Generated panorama" },
    { key: "real",    name: "Real video hero", note: "blvdworld.sa footage" },
    { key: "globe",   name: "Globe hero", note: "The planet, no footage" },
  ];
  const KEYS = VERSIONS.map((v) => v.key);
  const SRC = { cartoon: "video/hero.mp4", real: "video/hero-real.mp4" };

  // ?hero= may sit in the query string or inside the hash — the router puts its
  // own routes in the hash, so a shared link can carry either shape
  function wanted() {
    const fromSearch = new URLSearchParams(location.search).get("hero");
    const m = location.hash.match(/[?&]hero=([^&]+)/);
    const v = (fromSearch || (m && decodeURIComponent(m[1])) || "").toLowerCase();
    return KEYS.includes(v) ? v : "cartoon";
  }

  const video = document.getElementById("hero-vid");
  let globeLoaded = false;
  let current = null;

  function apply(v) {
    if (v === current) return;
    current = v;
    document.documentElement.dataset.hero = v;

    if (video) {
      if (v === "globe") {
        video.pause();
        video.removeAttribute("src");
        video.load();                       // stop it fetching what we won't show
      } else if (video.getAttribute("src") !== SRC[v]) {
        video.setAttribute("src", SRC[v]);
        video.load();
        const p = video.play();
        if (p && p.catch) p.catch(() => {});
      }
    }

    // the globe is a module and three.js is a real download, so it is only
    // fetched if someone actually asks for that version
    if (v === "globe" && !globeLoaded) {
      globeLoaded = true;
      import("./globe.js").catch(() => {
        const holder = document.getElementById("globe-holder");
        if (holder) holder.innerHTML =
          '<p class="globe-fail">The globe needs three.js, which could not be loaded.</p>';
      });
    }

    for (const b of document.querySelectorAll(".hv-opt")) {
      const on = b.dataset.hero === v;
      b.classList.toggle("on", on);
      b.setAttribute("aria-checked", on ? "true" : "false");
    }
  }

  /* ── the switcher ── */
  const box = document.createElement("div");
  box.className = "hv";
  box.innerHTML =
    '<p class="hv-label">Hero version</p>' +
    '<div class="hv-opts" role="radiogroup" aria-label="Hero version">' +
    VERSIONS.map((v) => `
      <button class="hv-opt" type="button" role="radio" aria-checked="false"
              data-hero="${v.key}">
        <b>${v.name}</b><span>${v.note}</span>
      </button>`).join("") +
    "</div>";
  document.body.appendChild(box);

  box.addEventListener("click", (e) => {
    const b = e.target.closest(".hv-opt");
    if (!b) return;
    const v = b.dataset.hero;
    // write it where it can be shared, without disturbing the current route
    const hash = location.hash || "#/";
    const base = hash.split("?")[0] || "#/";
    const rest = (hash.split("?")[1] || "")
      .split("&").filter((s) => s && !s.startsWith("hero="));
    rest.push("hero=" + v);
    location.hash = base + "?" + rest.join("&");
    apply(v);                               // hashchange also fires; apply() is idempotent
  });

  addEventListener("hashchange", () => apply(wanted()));
  apply(wanted());
})();
