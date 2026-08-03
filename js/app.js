// ── app: router, intro, letter flow, gallery grid, music, chrome ──
(function () {
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];

  const views = {
    home: $("#view-home"),
    letter: $("#view-letter"),
    prizes: $("#view-prizes"),
    experiences: $("#view-experiences"),
  };

  let booted = false;

  function show(name) {
    $$(".view").forEach((v) => v.classList.remove("active"));
    (views[name] || views.home).classList.add("active");
    document.body.className = "typo-body chrome-on route-" + name;
  }

  function route() {
    if (!booted) return;
    const h = location.hash.replace("#/", "");
    show(h === "" ? "home" : h.split("?")[0] || "home");
  }
  window.addEventListener("hashchange", route);

  // ── boot: loader → intro → home ─────────────────────────────
  const loaderBar = $(".loader-bar i");
  let p = 0;
  const loadTimer = setInterval(() => {
    p = Math.min(100, p + 12 + Math.random() * 18);
    loaderBar.style.width = p + "%";
    if (p >= 100) {
      clearInterval(loadTimer);
      setTimeout(startIntro, 350);
    }
  }, 180);

  let introDone = false;
  function startIntro() {
    $("#view-loader").classList.remove("active");
    $("#view-intro").classList.add("active");
    typeLines();
  }

  async function typeLines() {
    const lines = $$(".type-line");
    for (const el of lines) {
      if (introDone) return;
      el.classList.add("on");
      const text = el.dataset.line;
      const span = document.createElement("span");
      const caret = document.createElement("span");
      caret.className = "caret";
      caret.innerHTML = "&nbsp;";
      el.append(span, caret);
      for (let i = 0; i <= text.length; i++) {
        if (introDone) return;
        span.textContent = text.slice(0, i);
        await sleep(26);
      }
      caret.remove();
      await sleep(420);
    }
    $(".intro-logo").classList.remove("hidden-soft");
    await sleep(3000);
    endIntro();
  }

  function endIntro() {
    if (introDone) return;
    introDone = true;
    $("#view-intro").classList.remove("active");
    // arch gate: settle on the mountain, zoom into the hole, reveal the page through it
    const stage = $("#arch-stage");
    stage.classList.add("on");
    setTimeout(() => stage.classList.add("zoom"), 1100);
    setTimeout(() => { booted = true; route(); }, 1750); // page starts animating behind the rock
    setTimeout(() => stage.classList.add("thru"), 1850); // sky fades, page visible through the hole
    setTimeout(() => stage.classList.add("off"), 3150);
    setTimeout(() => stage.remove(), 3650);
  }
  $("#skip-intro").addEventListener("click", endIntro);

  // ── music: generative WebAudio soundtrack ──────────────────
  const sndBtn = $("#snd-btn");
  let music = null, musicOn = false;

  function buildMusic() {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const master = ctx.createGain();
    master.gain.value = 0;
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp).connect(ctx.destination);

    // space: feedback delay as a cheap reverb
    const delay = ctx.createDelay(2);
    delay.delayTime.value = 0.375;
    const fb = ctx.createGain(); fb.gain.value = 0.42;
    const damp = ctx.createBiquadFilter(); damp.type = "lowpass"; damp.frequency.value = 2400;
    delay.connect(fb).connect(damp).connect(delay);
    const wet = ctx.createGain(); wet.gain.value = 0.35;
    delay.connect(wet).connect(master);

    const CHORDS = [ // Am, F, C, G — dreamy festival loop
      [110.0, 220.0, 261.63, 329.63],
      [87.31, 174.61, 220.0, 261.63],
      [130.81, 196.0, 261.63, 329.63],
      [98.0, 196.0, 246.94, 293.66],
    ];
    const ARPS = [
      [440, 523.25, 587.33, 659.25, 783.99, 659.25, 587.33, 523.25],
      [349.23, 440, 523.25, 587.33, 698.46, 587.33, 523.25, 440],
      [523.25, 659.25, 783.99, 880, 1046.5, 880, 783.99, 659.25],
      [392, 493.88, 587.33, 659.25, 783.99, 659.25, 587.33, 493.88],
    ];
    const BAR = 2.4; // seconds per chord
    const STEP = BAR / 8;

    function pad(freq, t, dur) {
      for (const det of [-4, 3]) {
        const o = ctx.createOscillator();
        o.type = "triangle";
        o.frequency.value = freq;
        o.detune.value = det;
        const f = ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 900;
        const gn = ctx.createGain();
        gn.gain.setValueAtTime(0.0001, t);
        gn.gain.exponentialRampToValueAtTime(0.045, t + 0.6);
        gn.gain.setValueAtTime(0.045, t + dur - 0.7);
        gn.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(f).connect(gn); gn.connect(master); gn.connect(delay);
        o.start(t); o.stop(t + dur + 0.1);
      }
    }
    function pluck(freq, t, vol) {
      const o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.value = freq;
      const gn = ctx.createGain();
      gn.gain.setValueAtTime(0.0001, t);
      gn.gain.exponentialRampToValueAtTime(vol, t + 0.015);
      gn.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
      o.connect(gn); gn.connect(master); gn.connect(delay);
      o.start(t); o.stop(t + 0.6);
    }
    function sub(freq, t) {
      const o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.value = freq / 2;
      const gn = ctx.createGain();
      gn.gain.setValueAtTime(0.0001, t);
      gn.gain.exponentialRampToValueAtTime(0.08, t + 0.03);
      gn.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
      o.connect(gn); gn.connect(master);
      o.start(t); o.stop(t + 0.6);
    }

    let bar = 0, nextBar = ctx.currentTime + 0.1;
    const timer = setInterval(() => {
      while (nextBar < ctx.currentTime + 0.8) {
        const c = bar % 4;
        CHORDS[c].forEach((f) => pad(f, nextBar, BAR));
        sub(CHORDS[c][0], nextBar);
        sub(CHORDS[c][0], nextBar + BAR / 2);
        for (let s = 0; s < 8; s++) {
          if (s % 2 === 0 || Math.random() < 0.6)
            pluck(ARPS[c][s], nextBar + s * STEP, 0.05 + Math.random() * 0.03);
        }
        if (Math.random() < 0.5) pluck([1318.5, 1567.98, 2093][(Math.random() * 3) | 0], nextBar + Math.random() * BAR, 0.02);
        bar++; nextBar += BAR;
      }
    }, 200);
    return { ctx, master, timer };
  }

  function setMusic(on) {
    if (!music) music = buildMusic();
    musicOn = on;
    music.ctx.resume();
    const t = music.ctx.currentTime;
    music.master.gain.cancelScheduledValues(t);
    music.master.gain.setValueAtTime(Math.max(music.master.gain.value, 0.0001), t);
    if (on) music.master.gain.exponentialRampToValueAtTime(1, t + 1.2);
    else music.master.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
    sndBtn.classList.toggle("playing", on);
  }

  sndBtn.addEventListener("click", () => setMusic(!musicOn));

  // music is on by default; browsers need a gesture, so start at the first one
  sndBtn.classList.add("playing");
  let musicArmed = false;
  function armMusic() {
    if (musicArmed) return;
    musicArmed = true;
    setMusic(true);
  }
  ["pointerdown", "keydown"].forEach((ev) =>
    window.addEventListener(ev, armMusic, { once: true })
  );
  // try immediately too — works when the browser already allows audio
  try {
    const probe = new (window.AudioContext || window.webkitAudioContext)();
    if (probe.state === "running") { probe.close(); armMusic(); } else { probe.close(); }
  } catch (e) { /* no audio support */ }

  // ── letter flow ─────────────────────────────────────────────
  const track = $("#postcard-track");
  let focusIdx = 0;
  const chosenStickers = [];

  function renderCarousel() {
    const msgs = WBK.messages;
    const prev = (focusIdx - 1 + msgs.length) % msgs.length;
    const next = (focusIdx + 1) % msgs.length;
    track.innerHTML = "";
    [[prev, "side"], [focusIdx, "focus"], [next, "side rgt"]].forEach(([idx, cls]) => {
      const d = document.createElement("div");
      d.className = "postcard " + cls;
      d.innerHTML = `<div class="pc-stamp">📮</div>
        <div class="pc-logo"><span class="wb">BLVD</span><span class="rs">W</span></div>
        <p class="pc-msg">${msgs[idx]}</p>`;
      if (cls !== "focus") d.addEventListener("click", () => { focusIdx = idx; renderCarousel(); });
      track.appendChild(d);
    });
  }
  $("#card-prev").addEventListener("click", () => { focusIdx = (focusIdx - 1 + WBK.messages.length) % WBK.messages.length; renderCarousel(); });
  $("#card-next").addEventListener("click", () => { focusIdx = (focusIdx + 1) % WBK.messages.length; renderCarousel(); });
  renderCarousel();

  const steps = ["#step-pick", "#step-custom", "#step-sign", "#step-done"];
  function gotoStep(sel) {
    steps.forEach((s) => $(s).classList.toggle("hidden", s !== sel));
  }
  $("#pick-continue").addEventListener("click", () => {
    $("#custom-msg").textContent = WBK.messages[focusIdx];
    gotoStep("#step-custom");
  });
  $("#back-pick").addEventListener("click", () => gotoStep("#step-pick"));
  $("#custom-continue").addEventListener("click", () => gotoStep("#step-sign"));
  $("#back-custom").addEventListener("click", () => gotoStep("#step-custom"));

  // sticker tray
  const tray = $("#tray");
  WBK.stickers.forEach((s) => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = s;
    b.addEventListener("click", () => addSticker(s));
    tray.appendChild(b);
  });
  function addSticker(s, x, y) {
    const layer = $("#sticker-layer");
    const el = document.createElement("span");
    el.className = "stk";
    el.textContent = s;
    el.style.left = (x ?? 15 + Math.random() * 70) + "%";
    el.style.top = (y ?? 15 + Math.random() * 70) + "%";
    el.style.setProperty("--rot", (Math.random() * 40 - 20).toFixed(0) + "deg");
    layer.appendChild(el);
    chosenStickers.push(s);
  }
  $("#custom-card").addEventListener("click", (e) => {
    if (e.target.closest(".stk")) { e.target.remove(); return; }
    const r = $("#custom-card").getBoundingClientRect();
    const s = WBK.stickers[Math.floor(Math.random() * WBK.stickers.length)];
    addSticker(s, ((e.clientX - r.left) / r.width) * 100, ((e.clientY - r.top) / r.height) * 100);
  });
  $("#clear-stickers").addEventListener("click", () => { $("#sticker-layer").innerHTML = ""; chosenStickers.length = 0; });

  $("#sign-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = $("#f-name").value.trim() || "A fan";
    const country = $("#f-country").value;
    WBK.letters.unshift({ msg: WBK.messages[focusIdx], who: name, country, mine: true });
    gotoStep("#step-done");
    confettiBurst();
  });

  // reset flow when entering letter view
  window.addEventListener("hashchange", () => {
    if (location.hash === "#/letter") { gotoStep("#step-pick"); $("#sticker-layer").innerHTML = ""; }
  });

  // ── confetti ────────────────────────────────────────────────
  function confettiBurst() {
    const c = $("#confetti");
    c.width = c.offsetWidth; c.height = c.offsetHeight;
    const ctx = c.getContext("2d");
    const cols = ["#4da6ff", "#ff3ec8", "#35e0ff", "#ffc24d", "#8b5cf6", "#ffffff"];
    const parts = Array.from({ length: 160 }, () => ({
      x: c.width / 2 + (Math.random() - 0.5) * 120,
      y: c.height * 0.45,
      vx: (Math.random() - 0.5) * 11,
      vy: -4 - Math.random() * 8,
      r: 3 + Math.random() * 5,
      col: cols[(Math.random() * cols.length) | 0],
      rot: Math.random() * 7,
      vr: (Math.random() - 0.5) * 0.3,
    }));
    let frames = 0;
    (function anim() {
      ctx.clearRect(0, 0, c.width, c.height);
      for (const pt of parts) {
        pt.x += pt.vx; pt.y += pt.vy; pt.vy += 0.22; pt.rot += pt.vr;
        ctx.save();
        ctx.translate(pt.x, pt.y);
        ctx.rotate(pt.rot);
        ctx.fillStyle = pt.col;
        ctx.fillRect(-pt.r, -pt.r / 2, pt.r * 2, pt.r);
        ctx.restore();
      }
      if (++frames < 160) requestAnimationFrame(anim);
      else ctx.clearRect(0, 0, c.width, c.height);
    })();
  }


  function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }
})();
