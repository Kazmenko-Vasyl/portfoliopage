import { useEffect, useRef, type RefObject } from "react";

/**
 * Hero effect: a field of falling code, visible only through a noise mask that
 * opens up around the pointer. The mask is a WebGL2 fragment shader over a
 * full-screen triangle; the code rain itself is drawn to an offscreen 2D canvas
 * each frame and uploaded as the shader's source texture.
 *
 * Without WebGL2 (or if the shaders fail to build) the canvas hides itself and
 * the hero degrades to its backdrop image — everything else still works.
 */

// Pointer influence on the mask.
const CURSOR_SCALE = 3.0;
const CURSOR_INTENSITY = 0.15;
// Noise field shape and drift.
const SCALE = 2.4;
const SPEED = 0.092;
const DISTORT_SCALE = 1.0;
const DISTORT_INTENSITY = 0.5;
const DETAIL_SCALE = 2.9;
// How much of the outline comes from the fine octave — the raggedness dial.
// Lower is calmer: the coarse octave decides the shape and this only roughens
// its edge. Below ~0.15 the edge goes smooth and small openings turn oval.
const DETAIL_AMOUNT = 0.25;
const NOISE_GAIN = 1 / Math.hypot(1 - DETAIL_AMOUNT, DETAIL_AMOUNT);
// How fast the opening follows the pointer, and how it behaves when idle.
const PACE_MIN = 0.35;
const SPEED_FULL = 1.6;
const SPEED_ATTACK = 0.3;
const SPEED_DECAY = 0.92;
const PACE_EASE = 0.12;
const MOUSE_EASE = 0.18;
const IDLE_DELAY_MS = 2500;
const DRIFT_REACH = 0.34;
const DRIFT_SPEED = 1.0;
/** Faster where the wander is the whole effect and no hand is driving it. */
const AMBIENT_DRIFT_SPEED = 1.35;
const DRIFT_SETTLE = 0.985;
const MAX_DPR = 1.5;

/** The rain is painted to a 2D canvas before the shader masks it, so its
 *  colours are chosen here rather than in CSS. Light is for the hero, dark for
 *  anything laid over the page. */
interface Palette {
  /** Fills the panel the glyphs fall through. */
  panel: string;
  /** Painted over the panel each frame, which is what leaves the trails. */
  trail: string;
  glyph: (alpha: number) => string;
  head: string;
}

const PALETTES: Record<"light" | "dark", Palette> = {
  light: {
    panel: "#FFFFFF",
    trail: "rgba(255,255,255,0.22)",
    glyph: (a) => `rgba(10,10,10,${a.toFixed(2)})`,
    head: "#0A0A0A",
  },
  dark: {
    panel: "#0A0A0A",
    trail: "rgba(10,10,10,0.2)",
    glyph: (a) => `rgba(200,255,61,${a.toFixed(2)})`,
    head: "#DFFF7A",
  },
};

const VERT = `#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() { vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }`;

const FRAG = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uSrc;
uniform vec2 uPanel;
uniform float uTime;
uniform vec2 uMouse;
uniform float uPace;
const float CURSOR_SCALE = ${CURSOR_SCALE.toFixed(3)};
const float CURSOR_INTENSITY = ${CURSOR_INTENSITY.toFixed(3)};
const float SCALE = ${SCALE.toFixed(3)};
const float SPEED = ${SPEED.toFixed(3)};
const float DISTORT_SCALE = ${DISTORT_SCALE.toFixed(3)};
const float DISTORT_INTENSITY = ${DISTORT_INTENSITY.toFixed(3)};

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

void main() {
  float aspect = uPanel.x / uPanel.y;
  vec2 nuv = vec2(vUv.x * aspect, 1.0 - vUv.y);
  vec2 m = vec2((uMouse.x / uPanel.x) * aspect, uMouse.y / uPanel.y);

  float infl = 1.0 - distance(m, nuv) * CURSOR_SCALE;
  infl *= uPace;
  infl = clamp(infl, 0.0, 1.0);

  float distort = 0.5 + snoise(vec3(nuv * DISTORT_SCALE, uTime * SPEED * 0.1)) * 0.5;
  float warp = infl * CURSOR_INTENSITY + distort * DISTORT_INTENSITY;

  vec3 q = vec3((nuv + warp) * SCALE, uTime * SPEED);
  float fv = snoise(q) * ${(1 - DETAIL_AMOUNT).toFixed(3)}
           + snoise(q * vec3(${DETAIL_SCALE.toFixed(2)}, ${DETAIL_SCALE.toFixed(2)}, 1.6)) * ${DETAIL_AMOUNT.toFixed(3)};
  float n = clamp(0.5 + fv * 0.5 * ${NOISE_GAIN.toFixed(4)}, 0.0, 1.0);

  float w = max(fwidth(n), 0.0015) * 1.2;
  float edge = mix(1.0 + w * 2.0, -w * 2.0, infl);
  float mask = smoothstep(edge - w, edge + w, n);
  if (mask <= 0.0) { fragColor = vec4(0.0); return; }

  vec3 col = texture(uSrc, vec2(vUv.x, 1.0 - vUv.y)).rgb;
  fragColor = vec4(col, mask);
}`;

const GLYPHS =
  "{}()[]<>/*+=;:$&|!?_-.#0123456789abcdefgimnoprstvxyzABCDEFGIKLMNOPRSTUVXYZ";
const WORDS = [
  "const", "=>", "return", "async", "await", "props", "state", "useMemo",
  "render(", "export", "type", "null", "true", "try {", "catch", "map(",
  "reduce(", "</div>", "fetch(", "commit", "build", "deploy", "ok",
];

const pick = <T,>(a: T[]): T => a[(Math.random() * a.length) | 0];

interface Column {
  y: number;
  v: number;
  len: number;
  chars: string[];
  word: string | null;
}

interface Options {
  palette?: "light" | "dark";
  /** Force running without a pointer: the opening drifts from the first frame
   *  and stays open. Any surface on a device with no hover does this anyway. */
  ambient?: boolean;
}

/** How far open the mask sits in ambient mode. */
const AMBIENT_PACE = 0.92;

export function useCodeRainReveal(
  containerRef: RefObject<HTMLElement | null>,
  { palette = "light", ambient = false }: Options = {},
) {
  const tone = PALETTES[palette];
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // No hover means no pointer to follow, so the wander is the whole effect —
    // and waiting IDLE_DELAY_MS before it starts leaves a phone looking at a
    // still hero for the first two and a half seconds.
    const drifts = ambient || window.matchMedia?.("(hover: none)").matches === true;

    const cv = canvasRef.current;
    const hero = containerRef.current;
    if (!cv || !hero) return;

    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      cv.style.display = "none";
      return;
    }

    const gl = cv.getContext("webgl2", {
      alpha: true,
      premultipliedAlpha: false,
      antialias: false,
      depth: false,
      stencil: false,
    });
    if (!gl) {
      cv.style.display = "none";
      return;
    }

    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(sh));
        gl.deleteShader(sh);
        return null;
      }
      return sh;
    };

    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) {
      cv.style.display = "none";
      return;
    }

    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(prog));
      cv.style.display = "none";
      return;
    }
    gl.useProgram(prog);

    const quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const u = {
      src: gl.getUniformLocation(prog, "uSrc"),
      panel: gl.getUniformLocation(prog, "uPanel"),
      time: gl.getUniformLocation(prog, "uTime"),
      mouse: gl.getUniformLocation(prog, "uMouse"),
      pace: gl.getUniformLocation(prog, "uPace"),
    };

    const tex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(
      gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
      new Uint8Array([255, 255, 255, 255]),
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.uniform1i(u.src, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // --- the content revealed through the field: falling code on white
    const rain = document.createElement("canvas");
    const rctx = rain.getContext("2d")!;
    let cols: Column[] = [];
    let cellW = 0;
    let cellH = 0;
    let fontPx = 0;
    let W = 0;
    let H = 0;
    let dpr = 1;

    const layoutRain = () => {
      rain.width = Math.max(1, Math.round(W * dpr));
      rain.height = Math.max(1, Math.round(H * dpr));
      fontPx = Math.max(12, Math.min(W, H) * 0.021);
      cellW = fontPx * 1.05;
      cellH = fontPx * 1.32;
      const n = Math.ceil(W / cellW) + 1;
      cols = [];
      for (let i = 0; i < n; i++) {
        cols.push({
          // Seeded across the panel, and a little past the bottom, so the rain
          // is already mid-fall on the first frame. Starting every column
          // above the top — which is right when one RECYCLES — means the mask
          // opens onto an empty panel and the code only arrives a second or so
          // later, once the first columns have fallen far enough to show.
          y: Math.random() * H * 1.35,
          v: (0.9 + Math.random() * 2.1) * (fontPx * 0.14),
          len: 8 + Math.floor(Math.random() * 22),
          chars: [],
          word: Math.random() < 0.22 ? pick(WORDS) : null,
        });
      }
      rctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      rctx.fillStyle = tone.panel;
      rctx.fillRect(0, 0, W, H);
    };

    const drawRain = () => {
      if (rain.width !== Math.round(W * dpr) || !cols.length) layoutRain();
      rctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      rctx.fillStyle = tone.trail;
      rctx.fillRect(0, 0, W, H);
      rctx.font = `500 ${fontPx.toFixed(1)}px 'JetBrains Mono', monospace`;
      rctx.textBaseline = "top";
      for (let i = 0; i < cols.length; i++) {
        const c = cols[i];
        c.y += c.v;
        if (c.y - c.len * cellH > H) {
          c.y = -Math.random() * H * 0.5;
          c.len = 8 + Math.floor(Math.random() * 22);
          c.v = (0.9 + Math.random() * 2.1) * (fontPx * 0.14);
          c.word = Math.random() < 0.22 ? pick(WORDS) : null;
        }
        const head = Math.floor(c.y / cellH);
        const x = i * cellW;
        for (let k = 0; k < c.len; k++) {
          const row = head - k;
          const y = row * cellH;
          if (y < -cellH || y > H) continue;
          if (c.chars[row] === undefined || Math.random() < 0.02) {
            c.chars[row] =
              c.word && k < c.word.length ? c.word[c.word.length - 1 - k] : pick(GLYPHS.split(""));
          }
          const fade = 1 - k / c.len;
          if (k === 0) rctx.fillStyle = tone.head;
          else if (k < 3) rctx.fillStyle = tone.glyph(0.85 * fade);
          else rctx.fillStyle = tone.glyph(0.55 * fade * fade + 0.04);
          rctx.fillText(c.chars[row], x, y);
        }
        if (head * cellH > -cellH && head * cellH < H) {
          rctx.fillStyle = tone.glyph(0.55);
          rctx.fillRect(x, head * cellH + cellH * 0.92, cellW * 0.66, Math.max(1, fontPx * 0.07));
        }
      }
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      W = cv.clientWidth;
      H = cv.clientHeight;
      if (!(W > 0 && H > 0)) return;
      cv.width = Math.max(1, Math.round(W * dpr));
      cv.height = Math.max(1, Math.round(H * dpr));
      gl.viewport(0, 0, cv.width, cv.height);
      gl.uniform2f(u.panel, W, H);
      layoutRain();
    };
    resize();
    window.addEventListener("resize", resize);

    // --- pointer: pace from speed, idle wander, eased follow
    let mx = 0, my = 0, tx = 0, ty = 0;
    let spd = 0, pace = 0;
    let hovering = false;
    let last: { x: number; y: number; t: number } | null = null;
    let lastActivity = drifts ? -Infinity : performance.now();
    let drifting = false;
    let driftStart = 0;
    let dox = 0, doy = 0;
    let lastFrame: number | null = null;
    let startedAt: number | null = null;

    const driftAt = (s: number) => ({
      x: 0.5 + DRIFT_REACH * (Math.sin(s * 0.31) * 0.68 + Math.sin(s * 0.73 + 1.7) * 0.32),
      y: 0.5 + DRIFT_REACH * (Math.cos(s * 0.27) * 0.68 + Math.sin(s * 0.61 + 0.4) * 0.32),
    });

    const onMove = (ev: PointerEvent) => {
      const b = hero.getBoundingClientRect();
      const inside =
        ev.clientX >= b.left && ev.clientX <= b.right &&
        ev.clientY >= b.top && ev.clientY <= b.bottom;
      if (!inside) {
        hovering = false;
        last = null;
        return;
      }
      if (!hovering) {
        mx = ev.clientX - b.left;
        my = ev.clientY - b.top;
      }
      hovering = true;
      const now = ev.timeStamp || performance.now();
      lastActivity = now;
      tx = ev.clientX - b.left;
      ty = ev.clientY - b.top;
      if (last) {
        const dt = now - last.t;
        if (dt > 0) {
          spd += (Math.hypot(ev.clientX - last.x, ev.clientY - last.y) / dt - spd) * SPEED_ATTACK;
        }
      }
      last = { x: ev.clientX, y: ev.clientY, t: now };
    };
    if (!drifts) window.addEventListener("pointermove", onMove, { passive: true });

    let raf = 0;
    let painted = false;

    const tick = (now: number) => {
      if (startedAt === null) startedAt = now;
      if (cv.clientWidth !== W || cv.clientHeight !== H) resize();
      if (!(W > 0 && H > 0)) return;
      const frameMs = lastFrame === null ? 16 : now - lastFrame;
      lastFrame = now;
      spd *= SPEED_DECAY;

      if (now - lastActivity > IDLE_DELAY_MS) {
        if (!drifting) {
          drifting = true;
          driftStart = now;
          const p0 = driftAt(0);
          dox = mx - p0.x * W;
          doy = my - p0.y * H;
        }
        const p = driftAt(((now - driftStart) / 1000) * (drifts ? AMBIENT_DRIFT_SPEED : DRIFT_SPEED));
        dox *= DRIFT_SETTLE;
        doy *= DRIFT_SETTLE;
        const nx2 = p.x * W + dox;
        const ny2 = p.y * H + doy;
        if (frameMs > 0) {
          spd += (Math.hypot(nx2 - tx, ny2 - ty) / frameMs - spd) * SPEED_ATTACK;
        }
        tx = nx2;
        ty = ny2;
      } else {
        drifting = false;
      }

      const norm = Math.min(spd / SPEED_FULL, 1);
      const paceTarget = drifts
        ? Math.max(AMBIENT_PACE, PACE_MIN + (1 - PACE_MIN) * norm)
        : hovering || drifting
          ? PACE_MIN + (1 - PACE_MIN) * norm
          : 0;
      pace += (paceTarget - pace) * PACE_EASE;
      mx += (tx - mx) * MOUSE_EASE;
      my += (ty - my) * MOUSE_EASE;

      drawRain();
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, rain);

      gl.uniform1f(u.time, (now - startedAt) / 1000);
      gl.uniform1f(u.pace, pace);
      gl.uniform2f(u.mouse, mx, my);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      const ring = ringRef.current;
      if (ring) {
        ring.style.transform = `translate(${mx.toFixed(1)}px,${my.toFixed(1)}px)`;
        ring.style.opacity = pace > 0.05 ? "1" : "0";
      }
    };

    let onScreen = true;

    const frame = (now: number) => {
      raf = 0;
      try {
        tick(now);
      } catch (err) {
        if (!painted) {
          console.error("code-rain reveal", err);
          painted = true;
        }
      } finally {
        if (onScreen) raf = requestAnimationFrame(frame);
      }
    };

    // Every frame costs a rain repaint, a texture upload and three simplex
    // lookups per pixel. Left running, that carries on for the whole page —
    // the hero is thousands of pixels above the fold by the time anyone reaches
    // the footer, and none of it can be seen.
    const watcher = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        if (!onScreen) {
          if (raf) cancelAnimationFrame(raf);
          raf = 0;
          return;
        }
        // Resuming after a gap would otherwise report it as one enormous frame
        // and spike the speed the pace is derived from.
        lastFrame = null;
        if (!raf) raf = requestAnimationFrame(frame);
      },
      { threshold: 0 },
    );
    watcher.observe(hero);

    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      watcher.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      gl.deleteTexture(tex);
      gl.deleteBuffer(quad);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, [containerRef, tone, ambient]);

  return { canvasRef, ringRef };
}
