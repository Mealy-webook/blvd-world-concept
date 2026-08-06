// ── the sphere, as a globe that turns ──────────────────────────────────────
// A real sphere: one full-screen triangle pair and a fragment shader that
// intersects a ray with a unit ball, so what you see is a surface being sampled
// rather than a picture of one. It turns, and the display's content is generated
// per pixel — an animated stand-in, drawn here, for the show the real sphere runs.
//
// No three.js. The library is ~600KB and this needs none of it: no scene graph, no
// meshes, no loaders. Sixty lines of GLSL do the whole thing, and the page stays
// dependency-free.
//
// WHAT IS AND IS NOT REAL. The ball's size, its 360-degree display and its
// 220-seat interior are the client's figures. The face on it is not: it is a
// generic smiling character drawn in the shader because we have no capture of the
// sphere's own show, and the panel says so on the page. Swap it for real footage by
// replacing surface() with a texture sample — see CREDITS.md.
(function () {
  const canvas = document.getElementById("sphere-globe");
  const still = document.getElementById("sphere-still");
  if (!canvas) return;

  const gl = canvas.getContext("webgl", {
    alpha: true, antialias: false, premultipliedAlpha: false,
    powerPreference: "low-power",
  });
  /* No WebGL, no globe: the photograph is in the markup already, hidden, and takes
     its place. A blank square would be worse than a still of the real thing. */
  if (!gl) {
    canvas.remove();
    if (still) still.hidden = false;
    return;
  }

  const VERT = `
    attribute vec2 p;
    void main() { gl_Position = vec4(p, 0.0, 1.0); }
  `;

  const FRAG = `
    precision highp float;
    uniform vec2 u_res;
    uniform float u_t;
    uniform float u_yaw;
    uniform float u_tilt;

    float h21(vec2 p) {
      return fract(sin(dot(p, vec2(41.317, 289.113))) * 43758.5453);
    }

    /* The display: a panel grid of lit cells in the real sphere's palette, drifting
       sideways and flickering cell by cell. Laid out in equirectangular coordinates
       because that is how a panel grid wraps a ball. */
    vec3 display(vec3 s, float t) {
      float u = atan(s.z, s.x) / 6.2831853 + 0.5;
      float v = acos(clamp(-s.y, -1.0, 1.0)) / 3.1415926;
      vec2 g = vec2(u * 74.0, v * 38.0);
      vec2 cell = floor(g + vec2(t * 0.7, 0.0));
      float k = h21(cell);
      /* the palette is taken off the photograph rather than invented: the real
         display runs red, white and teal, with orange in it */
      vec3 col = k < 0.34 ? vec3(1.00, 0.17, 0.19)
               : k < 0.62 ? vec3(0.94, 0.97, 1.00)
               : k < 0.86 ? vec3(0.14, 0.74, 0.95)
                          : vec3(1.00, 0.48, 0.14);
      float on = step(0.5, h21(cell + floor(t * 2.2)));
      col *= 0.22 + 0.78 * on;
      vec2 f = fract(g) - 0.5;
      float pixel = smoothstep(0.44, 0.30, length(f));      // the LED itself
      return mix(vec3(0.02, 0.03, 0.09), col, pixel * 0.95);
    }

    /* Mostly open, with a fast blink every few seconds. Phase-shifted so the eyes
       are open at t = 0: the first frame is the one a background tab, a
       reduced-motion visitor and every screenshot of this page will show, and it
       should not be the one where its eyes are shut. */
    float blink(float t) {
      float c = mod(t + 2.1, 4.3);
      float b = smoothstep(0.0, 0.06, c) * (1.0 - smoothstep(0.10, 0.20, c));
      return 1.0 - b * 0.94;
    }

    /* The character, painted on the ball as a spherical cap so it stays circular
       wherever it turns to — measured in direction space, not in the equirect
       texture, which would have stretched it towards the poles. */
    vec3 surface(vec3 s, float t) {
      vec3 bg = display(s, t);
      if (s.z <= 0.0) return bg;

      /* a slow bob, so the character is alive rather than printed */
      vec2 f = s.xy - vec2(0.0, sin(t * 1.1) * 0.022);
      float d = length(f);
      float face = smoothstep(0.47, 0.45, d) * smoothstep(0.0, 0.12, s.z);
      if (face <= 0.002) return bg;

      vec3 c = mix(bg, vec3(1.00, 0.82, 0.14), face);
      /* a soft edge on the disc, so it reads as lit rather than cut out */
      c = mix(c, vec3(1.0, 0.62, 0.10), smoothstep(0.40, 0.46, d) * face * 0.7);

      float bl = blink(t);
      vec2 e1 = f - vec2(-0.150, 0.090);
      vec2 e2 = f - vec2( 0.150, 0.090);
      e1.y /= max(bl, 0.06);
      e2.y /= max(bl, 0.06);
      float eyes = smoothstep(0.064, 0.050, min(length(e1), length(e2)));
      c = mix(c, vec3(0.05, 0.04, 0.10), eyes * face);

      /* the smile: the lower arc of a circle set above the middle of the face */
      vec2 mc = vec2(0.0, 0.16);
      float ring = abs(length(f - mc) - 0.34);
      float smile = smoothstep(0.050, 0.030, ring)
                  * smoothstep(0.03, -0.03, f.y - (mc.y - 0.13))
                  * smoothstep(0.30, 0.23, abs(f.x));
      c = mix(c, vec3(0.05, 0.04, 0.10), smile * face);

      float cheek = smoothstep(0.085, 0.0, length(f - vec2(-0.255, 0.175)))
                  + smoothstep(0.085, 0.0, length(f - vec2( 0.255, 0.175)));
      c = mix(c, vec3(1.0, 0.42, 0.42), cheek * 0.34 * face);
      return c;
    }

    void main() {
      vec2 uv = (gl_FragCoord.xy / u_res) * 2.0 - 1.0;
      float r2 = dot(uv, uv);
      if (r2 > 1.0) { gl_FragColor = vec4(0.0); return; }

      /* orthographic, because at this distance a 35 m ball very nearly is: the
         normal is the hit point on a unit sphere */
      vec3 n = vec3(uv, sqrt(max(1.0 - r2, 0.0)));

      /* into the ball's own frame — undo the tilt, then the turn */
      float ct = cos(u_tilt), st = sin(u_tilt);
      vec3 m = vec3(n.x, n.y * ct + n.z * st, -n.y * st + n.z * ct);
      float cy = cos(u_yaw), sy = sin(u_yaw);
      vec3 s = vec3(m.x * cy - m.z * sy, m.y, m.x * sy + m.z * cy);

      vec3 col = surface(s, u_t);

      /* the ball is a light source as much as a lit object, so the shading is
         gentle: enough to round it, not enough to put half of it in shadow */
      vec3 L = normalize(vec3(-0.35, 0.55, 0.80));
      float lam = max(dot(n, L), 0.0);
      float rim = pow(1.0 - n.z, 3.0);
      col = col * (0.62 + 0.52 * lam) + vec3(0.40, 0.60, 1.00) * rim * 0.30;

      float edge = smoothstep(1.0, 0.982, r2);          // antialias the silhouette
      gl_FragColor = vec4(col * edge, edge);
    }
  `;

  function compile(type, src) {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(sh) || "shader failed");
    }
    return sh;
  }

  let prog;
  try {
    prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(prog) || "link failed");
    }
  } catch (err) {
    /* a driver that cannot compile this should show the photograph, not a hole */
    canvas.remove();
    if (still) still.hidden = false;
    return;
  }

  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "p");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const U = {
    res: gl.getUniformLocation(prog, "u_res"),
    t: gl.getUniformLocation(prog, "u_t"),
    yaw: gl.getUniformLocation(prog, "u_yaw"),
    tilt: gl.getUniformLocation(prog, "u_tilt"),
  };

  const still16 = matchMedia("(prefers-reduced-motion: reduce)").matches;
  /* starts face-on, deliberately: the first frame is what a background tab, a
     reduced-motion visitor and a driver without WebGL all see, and the back of the
     ball is not the picture to leave them with */
  let yaw = 0, t = 0, last = 0, raf = null, live = false;

  function size() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const box = canvas.getBoundingClientRect();
    const w = Math.max(Math.round((box.width || 260) * dpr), 32);
    const h = Math.max(Math.round((box.height || 260) * dpr), 32);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w; canvas.height = h;
    }
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(U.res, canvas.width, canvas.height);
  }

  function draw() {
    size();
    gl.uniform1f(U.t, t);
    gl.uniform1f(U.yaw, yaw);
    gl.uniform1f(U.tilt, -0.22);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function frame(now) {
    raf = null;
    const dt = last ? Math.min((now - last) / 1000, 0.05) : 0.016;
    last = now;
    t += dt;
    yaw += dt * 0.19;                     // one turn every 33 seconds
    draw();
    if (live) raf = requestAnimationFrame(frame);
  }

  function start() {
    if (live || still16) return;
    live = true; last = 0;
    if (raf === null) raf = requestAnimationFrame(frame);
  }
  function stop() {
    live = false;
    if (raf !== null) { cancelAnimationFrame(raf); raf = null; }
  }

  /* The first frame is drawn now, synchronously, rather than waiting for one to be
     scheduled. A ball that is correct before it moves is also the whole of the
     reduced-motion case, and it means the section is never a blank square — in a
     background tab no frame is scheduled at all. */
  draw();

  /* It only runs while it is both the panel on show and on screen: a shader loop
     behind a hidden panel is heat for nothing. */
  const panel = canvas.closest(".rec-panel");
  let seen = false;
  const onPanel = () => panel && !panel.hidden;
  const sync = () => (seen && onPanel() ? start() : stop());

  if ("IntersectionObserver" in window) {
    new IntersectionObserver((es) => {
      for (const e of es) seen = e.isIntersecting;
      sync();
    }, { threshold: 0.15 }).observe(canvas);
  } else {
    seen = true;
    sync();
  }
  if (panel && "MutationObserver" in window) {
    new MutationObserver(sync).observe(panel, { attributes: true, attributeFilter: ["hidden"] });
  }
  addEventListener("resize", () => { if (!live) draw(); }, { passive: true });
})();
