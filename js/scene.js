// ── neon street scene: signs, windows, wheel, starfields, parallax ──
(function () {
  // starfield on any .stars canvas in the active view
  const fields = [];
  function initStars(canvas) {
    const ctx = canvas.getContext("2d");
    const state = { canvas, ctx, stars: [] };
    function size() {
      canvas.width = canvas.offsetWidth * devicePixelRatio;
      canvas.height = canvas.offsetHeight * devicePixelRatio;
      state.stars = Array.from({ length: 140 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: (Math.random() * 1.4 + 0.3) * devicePixelRatio,
        p: Math.random() * Math.PI * 2,
        s: 0.4 + Math.random() * 1.2,
      }));
    }
    size();
    window.addEventListener("resize", size);
    fields.push(state);
  }
  document.querySelectorAll("canvas.stars").forEach(initStars);

  let t = 0;
  function tick() {
    t += 0.016;
    for (const f of fields) {
      if (!f.canvas.closest(".view.active")) continue;
      const { ctx, canvas, stars } = f;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const st of stars) {
        const a = 0.25 + 0.75 * Math.abs(Math.sin(st.p + t * st.s));
        ctx.globalAlpha = a;
        ctx.fillStyle = "#cfe4ff";
        ctx.beginPath();
        ctx.arc(st.x, st.y, st.r, 0, 7);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  // hero landmark layers from Figma (positions as % of the 1512x982 frame)
  // clipped edges of the source art are anchored past the viewport so cuts never show
  // floating props (assets go in img/props/ — hidden until real PNGs exist)
  const PROPS = [
    { file: "prop-a.png", fb: "💜", x: 8,  y: 22, sz: 84,  depth: 1.6, glow: "rgba(196,168,255,.8)", dur: 5.4 },
    { file: "prop-b.png", fb: "🎡", x: 84, y: 16, sz: 110, depth: 2.2, glow: "rgba(255,143,220,.8)", dur: 6.4 },
    { file: "prop-c.png", fb: "🎟️", x: 6,  y: 62, sz: 96,  depth: 2.8, glow: "rgba(255,217,138,.8)", dur: 5.0 },
    { file: "prop-d.png", fb: "⭐", x: 88, y: 58, sz: 78,  depth: 1.3, glow: "rgba(143,243,255,.8)", dur: 7.2 },
    { file: "prop-e.png", fb: "🌙", x: 16, y: 84, sz: 70,  depth: 2.0, glow: "rgba(143,243,255,.7)", dur: 6.0 },
    { file: "prop-f.png", fb: "🎶", x: 78, y: 82, sz: 88,  depth: 3.2, glow: "rgba(255,62,200,.7)",  dur: 4.6 },
  ];
  const propEls = [];
  // no prop artwork is shipped yet — drop the files into img/props/ (see the
  // README there) and flip this on to avoid 404s in the meantime
  const PROPS_ENABLED = false;
  const propsHolder = PROPS_ENABLED ? document.getElementById("props") : null;
  if (propsHolder) {
    for (const p of PROPS) {
      const el = document.createElement("div");
      el.className = "prop";
      el.style.left = p.x + "%";
      el.style.top = p.y + "%";
      el.style.setProperty("--sz", p.sz + "px");
      el.style.setProperty("--glow", p.glow);
      el.style.setProperty("--dur", p.dur + "s");
      el.style.setProperty("--del", (-Math.random() * 6).toFixed(2) + "s");
      const bob = document.createElement("span");
      bob.className = "bob";
      const img = document.createElement("img");
      img.src = "img/props/" + p.file;
      img.alt = "";
      img.onerror = () => { el.remove(); };
      bob.appendChild(img);
      el.appendChild(bob);
      propsHolder.appendChild(el);
      propEls.push({ el, depth: p.depth });
    }
  }

  // The hero is a heading and three tiles on the page's own colour. There is no
  // scene left to tilt or fold — only the block itself, which lifts and fades as
  // the page scrolls past it. scrollP (0→1 over the first viewport) is written by
  // the scroll handler below.
  const heroUi = document.querySelector(".hero-ui");
  let scrollP = 0;
  if (heroUi) {
    (function fold() {
      heroUi.style.transform =
        `translate3d(0, ${(-scrollP * 90).toFixed(1)}px, 0) scale(${(1 - scrollP * 0.06).toFixed(4)})`;
      heroUi.style.opacity = String(1 - Math.min(scrollP * 1.5, 1));
      requestAnimationFrame(fold);
    })();
  }

  // ── scroll: hero hand-off + reveals + card parallax ────────
  const homeView = document.getElementById("view-home");
  const heroScene = document.getElementById("street");
  if (homeView) {
    const rail = document.querySelector("#scroll-rail i");
    const stickyBar = document.getElementById("sticky-cta");
    const tabs = [...document.querySelectorAll("#sticky-cta [data-sec]")];

    // tabs scroll the inner container (a plain anchor jump would not work,
    // because the page scrolls inside #view-home rather than the window)
    for (const t of tabs) {
      t.addEventListener("click", (e) => {
        e.preventDefault();
        const sec = document.getElementById(t.dataset.sec);
        if (sec) homeView.scrollTo({ top: sec.offsetTop, behavior: "smooth" });
      });
    }
    const globeHolder = document.getElementById("globe-holder");
    let ticking = false;

    function onScroll() {
      const y = homeView.scrollTop;
      const vh = homeView.clientHeight || 1;
      const p = Math.min(y / vh, 1); // 0 → 1 across the first viewport
      scrollP = p; // the parallax loop composes this into the hero transform

      // the hero holds its ground while the landmarks fold away, then clears
      if (heroScene) {
        heroScene.style.setProperty("--scenelift", `${-p * 40}px`);
        const fade = Math.min(1, Math.max(0, (p - 0.62) / 0.38));
        heroScene.style.opacity = String(1 - fade * fade);
      }

      // the planet swells up into frame as the fold completes
      if (globeHolder) {
        const g = Math.min(1, Math.max(0, (p - 0.24) / 0.76));
        const ge = g * g * (3 - 2 * g);
        globeHolder.style.setProperty("--globe-y", `${((1 - ge) * 26).toFixed(1)}vh`);
        globeHolder.style.setProperty("--globe-s", (0.62 + ge * 0.38).toFixed(3));
        globeHolder.style.setProperty("--globe-o", ge.toFixed(3));
      }

      // scroll-spy: highlight whichever section owns the upper third
      if (tabs.length) {
        const mark = y + vh * 0.34;
        let current = -1;
        tabs.forEach((t, i) => {
          const sec = document.getElementById(t.dataset.sec);
          if (sec && sec.offsetTop <= mark) current = i;
        });
        tabs.forEach((t, i) => t.classList.toggle("on", i === current));
      }

      // fail-open backstop: if the observer ever misses an element, scrolling
      // past it still reveals it, so content is never stuck invisible
      for (const el of document.querySelectorAll(".reveal:not(.in)")) {
        if (el.getBoundingClientRect().top < vh * 0.92) el.classList.add("in");
      }

      // booking bar arrives once the hero is mostly behind you
      if (stickyBar) stickyBar.classList.toggle("show", p > 0.72);

      // scroll progress rail
      if (rail) {
        const max = homeView.scrollHeight - vh;
        rail.style.width = (max > 0 ? Math.min(100, (y / max) * 100) : 0).toFixed(2) + "%";
      }

      ticking = false;
    }

    homeView.addEventListener("scroll", () => {
      if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
    }, { passive: true });
    onScroll();

    // magnetic pull on the primary CTAs — the button leans toward the cursor
    for (const pill of document.querySelectorAll(".book-cta .pill, .xp-cta")) {
      const host = pill.closest(".book-cta") || pill;
      host.addEventListener("pointermove", (e) => {
        const r = pill.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
        const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
        pill.style.transform = `translate(${dx * 9}px, ${dy * 6}px)`;
      });
      host.addEventListener("pointerleave", () => { pill.style.transform = ""; });
    }

    // reveal on enter. Sections injected later by app.js (restaurant cards,
    // show rows, FAQ items) must be handed to the observer too, so scan() is
    // exposed and a MutationObserver catches anything added after boot —
    // otherwise those elements sit at opacity 0 forever.
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      }
    }, { root: homeView, threshold: 0.12, rootMargin: "0px 0px -5% 0px" });

    const watched = new WeakSet();
    function scanReveals() {
      for (const el of document.querySelectorAll(".reveal:not(.in)")) {
        if (watched.has(el)) continue;
        watched.add(el);
        io.observe(el);
      }
    }
    scanReveals();
    window.WBK_REVEAL = { scan: scanReveals };

    new MutationObserver(scanReveals).observe(homeView, { childList: true, subtree: true });
  }
})();

// (the hero video is gone — the built scene plays the hero again)

