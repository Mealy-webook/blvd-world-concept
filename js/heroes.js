// ── the hero versions ──────────────────────────────────────────────────────
// One page, four openings, so they can be compared side by side rather than
// described:
//
//   cartoon     the generated landmark panorama — Grendizer, the Taj, the lake
//   real video  the park's own banner footage, from blvdworld.sa
//   globe       no footage at all: the planet swells up out of the fold as the
//               hero scrolls away (js/globe.js, driven by scene.js), and the
//               zones lay out as a fan instead of a ring
//   original    the site as it stood before any of the above: no footage, the
//               heading and tiles on the page's own navy, outlined tiles rather
//               than glass, and the pale-blue button the site used before magenta
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
    { key: "original", name: "Original", note: "Before the footage" },
  ];
  const KEYS = VERSIONS.map((v) => v.key);
  const SRC = { cartoon: "video/hero.mp4", real: "video/hero-real.mp4" };

  /* ?hero= may sit in the query string or inside the hash — the router puts its
     own routes in the hash, so a shared link can carry either shape.

     It is also remembered for the session, and that is not a nicety. Every other
     link on the site writes its own hash — a zone poster goes to #/map?zone=…, a
     nav tab to #/shows — and none of them carry the version. Without the memory,
     picking the globe hero and then clicking a zone dropped you back to the
     cartoon one, because the new hash had no hero= in it to read. A URL that
     names a version still wins, so a shared link always shows what was sent. */
  const REMEMBER = "wbk-hero";
  function wanted() {
    const fromSearch = new URLSearchParams(location.search).get("hero");
    const m = location.hash.match(/[?&]hero=([^&]+)/);
    const fromUrl = (fromSearch || (m && decodeURIComponent(m[1])) || "").toLowerCase();
    if (KEYS.includes(fromUrl)) {
      try { sessionStorage.setItem(REMEMBER, fromUrl); } catch (err) { /* private mode */ }
      return fromUrl;
    }
    let kept = null;
    try { kept = sessionStorage.getItem(REMEMBER); } catch (err) { /* private mode */ }
    return KEYS.includes(kept) ? kept : "cartoon";
  }

  const video = document.getElementById("hero-vid");
  let globeLoaded = false;
  let current = null;

  function apply(v) {
    if (v === current) return;
    current = v;
    document.documentElement.dataset.hero = v;

    if (video) {
      if (v === "globe" || v === "original") {
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

    // The globe is a module and three.js is a real download, so it is only fetched
    // if someone actually asks for that version — and while the globe section is
    // held back in the CSS there is nothing on screen for it to draw into, so it
    // is not fetched at all. Restore the section's display: block and drop the
    // getComputedStyle guard together.
    const holder = document.getElementById("globe-holder");
    const holderShown =
      holder && getComputedStyle(holder.parentElement).display !== "none";
    if (v === "globe" && holderShown && !globeLoaded) {
      globeLoaded = true;
      import("./globe.js").catch(() => {
        if (holder) holder.innerHTML =
          '<p class="globe-fail">The globe needs three.js, which could not be loaded.</p>';
      });
    }

    /* ── the tile labels ──
       The globe version's design (Figma 53:8929) names the tiles "Entry ticket",
       "Rides", "Experiences", "Restaurants" — no verb. Every other version keeps "Book
       …", which is what makes the row read as the call to action.

       Both forms are on the element as data attributes rather than in here, so the copy
       stays in the markup where it can be read and edited, and this only chooses. */
    for (const n of document.querySelectorAll(".bt-name[data-full]")) {
      const want = v === "globe" ? n.dataset.short : n.dataset.full;
      if (want && n.textContent !== want) n.textContent = want;
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
