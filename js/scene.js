// ── neon street scene: signs, windows, wheel, starfields, parallax ──
(function () {
  const SIGNS_LEFT = [
    { t: "BLVD", c: "n-blue", f: "framed", top: 6, left: 12, size: 36, rot: 0 },
    { t: "webook", c: "n-cyan", f: "pillf", top: 74, left: 14, size: 15, rot: -1, cls: "slow" },
    { t: "بوليفارد", c: "n-pink", f: "framed", top: 17, left: 48, size: 26, rot: -2 },
    { t: "LIVE", c: "n-cyan", f: "pillf", top: 14, left: 8, size: 18, rot: 2, cls: "fast" },
    { t: "🎟 TICKETS", c: "n-gold", f: "framed", top: 27, left: 20, size: 17, rot: 0 },
    { t: "موسم الرياض", c: "n-purple", f: "framed", top: 36, left: 44, size: 22, rot: -1.5 },
    { t: "♥", c: "n-pink", f: "pillf", top: 33, left: 10, size: 24, rot: -6, cls: "slow" },
    { t: "STAGE 4", c: "n-green", f: "framed", top: 47, left: 26, size: 15, rot: 1 },
    { t: "الليل لنا", c: "n-cyan", f: "noframe", top: 56, left: 46, size: 20, rot: -2 },
    { t: "✦ JOIN US ✦", c: "n-blue", f: "framed", top: 58, left: 12, size: 16, rot: 0, cls: "fast" },
    { t: "NEON ALLEY", c: "n-pink", f: "pillf", top: 68, left: 30, size: 14, rot: 2 },
  ];
  const SIGNS_RIGHT = [
    { t: "RIYADH SEASON", c: "n-purple", f: "framed", top: 7, left: 18, size: 26, rot: 0 },
    { t: "SEASON FM", c: "n-cyan", f: "pillf", top: 19, left: 44, size: 17, rot: 2, cls: "slow" },
    { t: "웹북", c: "n-pink", f: "framed", top: 18, left: 10, size: 24, rot: -2 },
    { t: "🎆 TONIGHT", c: "n-gold", f: "framed", top: 30, left: 30, size: 18, rot: 1 },
    { t: "حياك", c: "n-green", f: "pillf", top: 28, left: 8, size: 20, rot: -4 },
    { t: "BLVD WORLD", c: "n-blue", f: "framed", top: 40, left: 40, size: 20, rot: -1 },
    { t: "☆", c: "n-gold", f: "pillf", top: 42, left: 14, size: 24, rot: 8, cls: "fast" },
    { t: "FAN ZONE", c: "n-pink", f: "framed", top: 52, left: 26, size: 17, rot: 0 },
    { t: "وناسة", c: "n-cyan", f: "framed", top: 62, left: 44, size: 20, rot: 2 },
    { t: "OPEN LATE", c: "n-green", f: "noframe", top: 66, left: 12, size: 14, rot: -1, cls: "slow" },
  ];

  function buildWall(el, signs) {
    if (!el) return;
    let html = "";
    // dim windows
    for (let i = 0; i < 40; i++) {
      const top = 4 + Math.random() * 78;
      const left = 2 + Math.random() * 90;
      const on = Math.random() > 0.5 ? "opacity:.9" : "opacity:.35";
      html += `<i class="win" style="top:${top}%;left:${left}%;${on}"></i>`;
    }
    for (const s of signs) {
      const cls = `sign ${s.c} ${s.f} ${s.cls || ""}`;
      const delay = (Math.random() * 6).toFixed(2);
      html += `<span class="${cls}" style="top:${s.top}%;left:${s.left}%;font-size:${s.size}px;transform:rotate(${s.rot}deg);animation-delay:-${delay}s">${s.t}</span>`;
    }
    el.innerHTML = html;
  }

  function buildWheel() {
    const spokes = document.querySelector(".wheel .spokes");
    const pods = document.querySelector(".wheel .pods");
    if (!spokes) return;
    let sp = "", pd = "";
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const x = 100 + Math.cos(a) * 78, y = 100 + Math.sin(a) * 78;
      sp += `<line x1="100" y1="100" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}"/>`;
      pd += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4"/>`;
    }
    spokes.innerHTML = sp;
    pods.innerHTML = pd;
  }

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
  const LANDMARKS = [
    { file: "layer-4733.png", left: -3.5, bottom: -2.5, w: 24.7, depth: 0.7, z: 1 }, // Taj Mahal
    { file: "layer-4734.png", left: 2.4,  bottom: -2.5, w: 39.2, depth: 1.1, z: 2 }, // Eiffel
    { file: "layer-4735.png", left: -4,   bottom: -2.5, w: 27.3, depth: 1.7, z: 3 }, // pink pyramid
    { file: "layer-4741.png", left: 55.9, bottom: -2.5, w: 34.5, depth: 0.9, z: 1 }, // Grendizer
    { file: "layer-4731.png", left: 75.8, bottom: 13,   w: 27.4, depth: 0.6, z: 2 }, // Galata tower
    { file: "layer-4737.png", left: 64.4, bottom: -2.5, w: 27.1, depth: 1.5, z: 3 }, // Plaza de Toros
    { file: "layer-4736.png", left: 76,   bottom: -2.5, w: 28.2, depth: 2.1, z: 4 }, // golden pyramid
  ];
  const lmEls = [];
  const lmHolder = document.getElementById("landmarks");
  if (lmHolder) {
    LANDMARKS.forEach((l, i) => {
      const el = document.createElement("div");
      el.className = "lm";
      el.style.left = l.left + "%";
      el.style.bottom = l.bottom + "%";
      el.style.width = l.w + "%";
      el.style.zIndex = l.z;
      el.style.animationDelay = 0.12 * i + "s";
      const img = document.createElement("img");
      img.src = "img/hero-layers/" + l.file + "?v=2";
      img.alt = "";
      el.appendChild(img);
      lmHolder.appendChild(el);
      // centre as a fraction of the viewport, used to aim the fold
      lmEls.push({ el, depth: l.depth, cx: (l.left + l.w / 2) / 100 });
    });
  }

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

  // mouse parallax: scene tilt + title counter-tilt + props drift
  // scrollP (0→1 over the first viewport) is written by the scroll handler below
  // and composed here so both effects share one transform.
  const scene = document.getElementById("scene");
  const heroUi = document.querySelector(".hero-ui");
  let scrollP = 0;
  if (scene) {
    let tx = 0, ty = 0, cx = 0, cy = 0;
    window.addEventListener("mousemove", (e) => {
      tx = (e.clientX / innerWidth - 0.5) * 2;
      ty = (e.clientY / innerHeight - 0.5) * 2;
    });
    (function par() {
      cx += (tx - cx) * 0.05;
      cy += (ty - cy) * 0.05;
      scene.style.transform = `rotateY(${cx * 3.2}deg) rotateX(${-cy * 2.2}deg)`;
      const wrap = document.querySelector(".wheel-wrap");
      if (wrap) wrap.style.transform = `translateX(calc(-50% + ${cx * -14}px)) translateY(${cy * -8}px)`;
      if (heroUi) {
        heroUi.style.transform =
          `perspective(900px) rotateY(${cx * 2.4}deg) rotateX(${-cy * 1.8}deg)` +
          ` translate3d(${cx * -6}px, ${cy * -4 - scrollP * 90}px, 0) scale(${1 - scrollP * 0.06})`;
        heroUi.style.opacity = String(1 - Math.min(scrollP * 1.5, 1));
      }
      for (const p of propEls) {
        p.el.style.transform = `translate3d(${cx * -10 * p.depth}px, ${cy * -7 * p.depth}px, 0)`;
      }
      for (const l of lmEls) {
        // mouse drift, plus the fold: each landmark is drawn down and inward
        // toward the planet rising from below, nearer layers going first
        const f = Math.min(1, Math.max(0, (scrollP - 0.06 * l.depth) / 0.7));
        const e = f * f * (3 - 2 * f);                    // smoothstep
        const px = cx * -12 * l.depth + (0.5 - l.cx) * innerWidth * e * 0.72;
        const py = cy * -6 * l.depth + innerHeight * e * 0.42;
        const sc = 1.04 - e * 0.78;
        const rot = (0.5 - l.cx) * -26 * e;
        l.el.style.transform =
          `translate3d(${px.toFixed(1)}px, ${py.toFixed(1)}px, 0) rotate(${rot.toFixed(2)}deg) scale(${sc.toFixed(3)})`;
        l.el.style.opacity = (1 - Math.pow(e, 1.7)).toFixed(3);
      }
      requestAnimationFrame(par);
    })();
  }

  buildWall(document.getElementById("wall-left"), SIGNS_LEFT);
  buildWall(document.getElementById("wall-right"), SIGNS_RIGHT);
  buildWheel();

  // ── scroll: hero hand-off + reveals + card parallax ────────
  const homeView = document.getElementById("view-home");
  const heroScene = document.getElementById("street");
  if (homeView) {
    const cue = document.querySelector(".scroll-cue");
    const rail = document.querySelector("#scroll-rail i");
    const stickyBar = document.getElementById("sticky-cta");
    const bloom = document.getElementById("fold-bloom");
    const tabs = [...document.querySelectorAll("#sticky-cta [data-sec]")];
    // the hero's bundles CTA scrolls the same way the tabs do
    const heroJump = document.querySelector(".js-to-bundles");
    if (heroJump) heroJump.addEventListener("click", (e) => {
      e.preventDefault();
      const sec = document.getElementById("bundles");
      if (sec) homeView.scrollTo({ top: sec.offsetTop, behavior: "smooth" });
    });

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

      // light swells from below as the world is drawn in, peaking just before
      // the planet takes over, then falling away
      if (bloom) {
        const b = Math.min(1, Math.max(0, (p - 0.1) / 0.62));
        const peak = Math.sin(b * Math.PI);              // 0 → 1 → 0
        bloom.style.setProperty("--bloom-o", (peak * 0.85).toFixed(3));
        bloom.style.setProperty("--bloom-s", (0.55 + b * 0.85).toFixed(3));
      }

      // the planet swells up into frame as the fold completes
      if (globeHolder) {
        const g = Math.min(1, Math.max(0, (p - 0.24) / 0.76));
        const ge = g * g * (3 - 2 * g);
        globeHolder.style.setProperty("--globe-y", `${((1 - ge) * 26).toFixed(1)}vh`);
        globeHolder.style.setProperty("--globe-s", (0.62 + ge * 0.38).toFixed(3));
        globeHolder.style.setProperty("--globe-o", ge.toFixed(3));
      }
      if (cue) cue.style.opacity = String(1 - Math.min(p * 3, 1));

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

// ── hero video: a seamless loop ─────────────────────────────────────────
// The take is cut to loop, so it just runs. All this does is make sure it
// isn't decoding frames behind the intro or in a hidden tab.
(function heroVideo() {
  const vid = document.getElementById("hero-video");
  if (!vid) return;

  // motion-sensitive visitors get the first frame, held still
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
    vid.autoplay = false;
    vid.removeAttribute("autoplay");
    vid.loop = false;
    vid.pause();
    return;
  }

  let started = false;

  const play = () => {
    const p = vid.play();
    if (p && p.catch) p.catch(() => {});
  };

  // The loader and intro run before the hero is on screen; start the loop from
  // the top the first time the hero is actually shown, then let it run.
  const begin = () => {
    if (started) { play(); return; }
    started = true;
    try { vid.currentTime = 0; } catch (e) { /* not seekable yet */ }
    play();
  };

  vid.pause();                    // wait for the hero, don't run behind the intro
  ["pointerdown", "keydown"].forEach((ev) =>
    window.addEventListener(ev, () => started && play(), { once: true }));

  // don't decode frames for a hero nobody is looking at
  const home = document.getElementById("view-home");
  if (home) {
    const sync = () => (home.classList.contains("active") ? begin() : vid.pause());
    new MutationObserver(sync).observe(home, { attributes: true, attributeFilter: ["class"] });
    sync();                       // in case the hero is already up
  }
  document.addEventListener("visibilitychange", () => {
    document.hidden ? vid.pause() : (home && home.classList.contains("active") && begin());
  });
})();
