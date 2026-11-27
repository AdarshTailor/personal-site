// Easter egg: a three-hole putting game.
// Open it by typing "fore" anywhere on the page, asking the ask box "fore",
// or clicking the little flag after the headline at the top. Drag back from the ball to aim
// (like a slingshot), release to putt. Esc closes.
(function () {
  "use strict";

  const W = 640, H = 400;           // course size in game units (canvas scales to fit)
  const BALL_R = 6, CUP_R = 10;
  const MAX_SPEED = 13, MAX_PULL = 140;

  // Each hole: ball start, cup, par, walls (rects), sand (circles: slows the ball),
  // water (rects: one-stroke penalty, ball goes back to where it was hit from).
  const HOLES = [
    { par: 2, ball: [90, 200], cup: [550, 200], walls: [], sand: [], water: [] },
    {
      par: 3, ball: [90, 320], cup: [550, 80],
      walls: [[300, 0, 26, 250]],
      sand: [], water: [],
    },
    {
      par: 3, ball: [80, 200], cup: [560, 200],
      walls: [[240, 140, 20, 120], [400, 0, 20, 120], [400, 280, 20, 120]],
      sand: [[330, 200, 46]],
      water: [[460, 150, 50, 100]],
    },
  ];

  const TERMS = { "-3": "Albatross!", "-2": "Eagle!", "-1": "Birdie!", 0: "Par.", 1: "Bogey.", 2: "Double bogey." };
  const term = (strokes, par) =>
    strokes === 1 ? "Hole in one!" : TERMS[strokes - par] || `+${strokes - par}. We don't talk about this one.`;

  let overlay, canvas, ctx, hud, msg, closeBtn, lastFocus;
  let hole = 0, strokes = 0, total = 0, scores = [];
  let ball, vel, lastSpot, aiming = null, sunk = false, raf = 0, sinkT = 0;

  const css = `
.golf-overlay { position: fixed; inset: 0; z-index: 100; display: grid; place-items: center;
  background: rgb(8 10 28 / .5); backdrop-filter: blur(3px); padding: 16px; }
.golf-overlay[hidden] { display: none; }
.golf-card { width: min(720px, 100%); background: var(--surface, #fffdf9); color: var(--text, #1f1b16);
  border: 1px solid var(--border, #e8e0d4); border-radius: 16px; box-shadow: 0 20px 60px var(--shadow, rgb(0 0 0 / .2));
  padding: 16px; font-family: var(--font-body, system-ui); }
.golf-top { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 12px; }
.golf-top h2 { font-size: 1.05rem; letter-spacing: -.01em; }
.golf-hud { font-variant-numeric: tabular-nums; color: var(--muted, #5a5248); font-size: .9rem; }
.golf-close { border: 1px solid var(--border, #e8e0d4); background: transparent; color: var(--text, #1f1b16);
  border-radius: 8px; width: 32px; height: 32px; font-size: 1.1rem; cursor: pointer; }
.golf-canvas { display: block; width: 100%; height: auto; aspect-ratio: ${W} / ${H}; border-radius: 12px;
  touch-action: none; cursor: crosshair; background: #5aa469; }
.golf-msg { min-height: 1.6em; margin-top: 10px; font-size: .95rem; color: var(--muted, #5a5248);
  display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.golf-msg button { border: 0; background: var(--accent, #0f766e); color: var(--accent-ink, #fff);
  border-radius: 8px; padding: 8px 14px; font: inherit; font-weight: 600; cursor: pointer; }
.golf-flag { background: none; border: 0; cursor: pointer; font-size: .95rem; margin-left: 6px;
  opacity: .55; transition: opacity .2s, transform .2s; }
.golf-flag:hover, .golf-flag:focus-visible { opacity: 1; transform: rotate(-8deg); }
`;

  /* ---------------- setup ---------------- */
  function build() {
    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);

    overlay = document.createElement("div");
    overlay.className = "golf-overlay";
    overlay.hidden = true;
    overlay.innerHTML = `
      <div class="golf-card" role="dialog" aria-modal="true" aria-labelledby="golf-title">
        <div class="golf-top">
          <div><h2 id="golf-title">Mini golf</h2><div class="golf-hud" aria-live="polite"></div></div>
          <button class="golf-close" type="button" aria-label="Close mini golf">×</button>
        </div>
        <canvas class="golf-canvas" aria-label="Putting green. Drag back from the ball to aim, release to putt."></canvas>
        <div class="golf-msg" aria-live="polite"></div>
      </div>`;
    document.body.appendChild(overlay);
    canvas = overlay.querySelector("canvas");
    hud = overlay.querySelector(".golf-hud");
    msg = overlay.querySelector(".golf-msg");
    closeBtn = overlay.querySelector(".golf-close");
    ctx = canvas.getContext("2d");

    closeBtn.addEventListener("click", close);
    overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
    overlay.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
      if (e.key === "Tab") { // keep focus inside the dialog
        const f = [...overlay.querySelectorAll("button")];
        if (!f.length) return;
        const i = f.indexOf(document.activeElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
      }
    });
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", () => { aiming = null; draw(); });
    addEventListener("resize", () => { if (!overlay.hidden) sizeCanvas(); });
  }

  function sizeCanvas() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }

  function open() {
    if (!overlay) build();
    if (!overlay.hidden) return;
    lastFocus = document.activeElement;
    overlay.hidden = false;
    document.documentElement.style.overflow = "hidden";
    hole = 0; total = 0; scores = [];
    startHole();
    sizeCanvas();
    closeBtn.focus();
  }

  function close() {
    if (!overlay || overlay.hidden) return;
    overlay.hidden = true;
    document.documentElement.style.overflow = "";
    cancelAnimationFrame(raf); raf = 0;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function startHole() {
    const h = HOLES[hole];
    ball = { x: h.ball[0], y: h.ball[1] };
    vel = { x: 0, y: 0 };
    lastSpot = { ...ball };
    strokes = 0; sunk = false; aiming = null; sinkT = 0;
    setHud();
    setMsg(hole === 0 ? "Drag back from the ball to aim, then let go." : "");
    draw();
  }

  const setHud = () => {
    const h = HOLES[hole];
    hud.textContent = `Hole ${hole + 1} of ${HOLES.length} · Par ${h.par} · Strokes ${strokes}`;
  };

  function setMsg(text, button, onClick) {
    msg.textContent = "";
    const span = document.createElement("span");
    span.textContent = text;
    msg.appendChild(span);
    if (button) {
      const b = document.createElement("button");
      b.type = "button"; b.textContent = button;
      b.addEventListener("click", onClick);
      msg.appendChild(b);
      b.focus();
    }
  }

  /* ---------------- input ---------------- */
  const toGame = (e) => {
    const r = canvas.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
  };
  const moving = () => Math.hypot(vel.x, vel.y) > 0.05;

  function onDown(e) {
    if (sunk || moving()) return;
    const p = toGame(e);
    if (Math.hypot(p.x - ball.x, p.y - ball.y) > 60) return;
    canvas.setPointerCapture(e.pointerId);
    aiming = p;
    draw();
  }
  function onMove(e) {
    if (!aiming) return;
    aiming = toGame(e);
    draw();
  }
  function onUp(e) {
    if (!aiming) return;
    const p = toGame(e);
    aiming = null;
    const dx = ball.x - p.x, dy = ball.y - p.y, pull = Math.min(Math.hypot(dx, dy), MAX_PULL);
    if (pull < 6) { draw(); return; }
    const a = Math.atan2(dy, dx), speed = (pull / MAX_PULL) * MAX_SPEED;
    vel = { x: Math.cos(a) * speed, y: Math.sin(a) * speed };
    lastSpot = { ...ball };
    strokes++; setHud(); setMsg("");
    if (!raf) raf = requestAnimationFrame(step);
  }

  /* ---------------- physics ---------------- */
  function step() {
    raf = 0;
    const h = HOLES[hole];

    if (sunk) { // little drop-into-the-cup animation
      sinkT = Math.min(1, sinkT + 0.08);
      draw();
      if (sinkT < 1) raf = requestAnimationFrame(step);
      else holeDone();
      return;
    }

    // a few substeps so fast putts don't skip through walls
    const n = Math.ceil(Math.hypot(vel.x, vel.y) / 3) || 1;
    for (let i = 0; i < n; i++) {
      ball.x += vel.x / n; ball.y += vel.y / n;
      collide(h);
    }

    const inSand = h.sand.some(([cx, cy, r]) => Math.hypot(ball.x - cx, ball.y - cy) < r);
    const f = inSand ? 0.9 : 0.982;
    vel.x *= f; vel.y *= f;

    // water: penalty stroke, back to where you hit from
    if (h.water.some(([x, y, w, hh]) => ball.x > x && ball.x < x + w && ball.y > y && ball.y < y + hh)) {
      strokes++; setHud();
      ball = { ...lastSpot }; vel = { x: 0, y: 0 };
      setMsg("Splash. One-stroke penalty.");
    }

    // cup: drops in if it's not moving too fast, lips out otherwise
    const dc = Math.hypot(ball.x - h.cup[0], ball.y - h.cup[1]), sp = Math.hypot(vel.x, vel.y);
    if (dc < CUP_R && sp < 6.5) {
      sunk = true; vel = { x: 0, y: 0 };
    } else if (dc < CUP_R + 2 && sp >= 6.5) {
      vel.x *= 0.85; vel.y *= 0.85; // rattled the edge
    }

    if (!moving()) vel = { x: 0, y: 0 };
    draw();
    if (sunk || moving()) raf = requestAnimationFrame(step);
  }

  function collide(h) {
    const e = 0.7; // bounciness
    if (ball.x < BALL_R) { ball.x = BALL_R; vel.x = Math.abs(vel.x) * e; }
    if (ball.x > W - BALL_R) { ball.x = W - BALL_R; vel.x = -Math.abs(vel.x) * e; }
    if (ball.y < BALL_R) { ball.y = BALL_R; vel.y = Math.abs(vel.y) * e; }
    if (ball.y > H - BALL_R) { ball.y = H - BALL_R; vel.y = -Math.abs(vel.y) * e; }
    for (const [x, y, w, hh] of h.walls) {
      const cx = Math.max(x, Math.min(ball.x, x + w)), cy = Math.max(y, Math.min(ball.y, y + hh));
      const dx = ball.x - cx, dy = ball.y - cy, d = Math.hypot(dx, dy);
      if (d >= BALL_R) continue;
      let nx, ny;
      if (d === 0) { // center is inside the wall: push out the shortest way
        const opts = [[ball.x - x, -1, 0], [x + w - ball.x, 1, 0], [ball.y - y, 0, -1], [y + hh - ball.y, 0, 1]];
        const [, ox, oy] = opts.sort((a, b) => a[0] - b[0])[0];
        nx = ox; ny = oy;
      } else { nx = dx / d; ny = dy / d; }
      ball.x = cx + nx * BALL_R; ball.y = cy + ny * BALL_R;
      const dot = vel.x * nx + vel.y * ny;
      if (dot < 0) { vel.x -= (1 + e) * dot * nx; vel.y -= (1 + e) * dot * ny; }
    }
  }

  function holeDone() {
    const h = HOLES[hole];
    scores.push(strokes); total += strokes;
    const last = hole === HOLES.length - 1;
    if (!last) {
      setMsg(`${term(strokes, h.par)} ${strokes} stroke${strokes > 1 ? "s" : ""} on a par ${h.par}.`, "Next hole", () => { hole++; startHole(); });
      return;
    }
    const par = HOLES.reduce((s, x) => s + x.par, 0), diff = total - par;
    const vs = diff === 0 ? "even par" : diff < 0 ? `${-diff} under par` : `${diff} over par`;
    const line = diff <= -2 ? "Okay, you're better at this than I am."
      : diff <= 0 ? "Nice round."
      : "Honestly, about where my game is too.";
    hud.textContent = `Final · ${total} strokes · ${vs}`;
    setMsg(`${term(strokes, h.par)} You shot ${total} (${vs}). ${line}`, "Play again", () => { hole = 0; total = 0; scores = []; startHole(); });
  }

  /* ---------------- drawing ---------------- */
  function draw() {
    if (!ball) return;
    const h = HOLES[hole];
    // green with mowing stripes
    ctx.fillStyle = "#5aa469";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "rgba(255,255,255,0.05)";
    for (let x = 0; x < W; x += 64) ctx.fillRect(x, 0, 32, H);
    // fringe
    ctx.strokeStyle = "#3f7d4c"; ctx.lineWidth = 8;
    ctx.strokeRect(4, 4, W - 8, H - 8);

    for (const [cx, cy, r] of h.sand) {
      ctx.fillStyle = "#e9d8a6";
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "rgba(160,130,70,0.25)";
      for (let i = 0; i < 18; i++) {
        const a = i * 2.4, rr = (r - 8) * ((i * 37) % 10) / 10;
        ctx.fillRect(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, 2, 2);
      }
    }
    for (const [x, y, w, hh] of h.water) {
      ctx.fillStyle = "#4f9bd1";
      roundRect(x, y, w, hh, 10); ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.35)"; ctx.lineWidth = 2;
      for (let yy = y + 18; yy < y + hh - 8; yy += 18) {
        ctx.beginPath(); ctx.moveTo(x + 10, yy); ctx.quadraticCurveTo(x + w / 2, yy - 5, x + w - 10, yy); ctx.stroke();
      }
    }
    for (const [x, y, w, hh] of h.walls) {
      ctx.fillStyle = "#8a6a46";
      roundRect(x, y, w, hh, 4); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.12)";
      ctx.fillRect(x + 3, y, 3, hh);
    }

    // cup and flag
    const [cx, cy] = h.cup;
    ctx.fillStyle = "#1d2a1f";
    ctx.beginPath(); ctx.arc(cx, cy, CUP_R, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#f4f1ea"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, cy - 46); ctx.stroke();
    ctx.fillStyle = "#e4572e";
    ctx.beginPath(); ctx.moveTo(cx, cy - 46); ctx.lineTo(cx + 22, cy - 39); ctx.lineTo(cx, cy - 32); ctx.fill();

    // aim guide: dotted line in the putt direction, length = power
    if (aiming) {
      const dx = ball.x - aiming.x, dy = ball.y - aiming.y;
      const pull = Math.min(Math.hypot(dx, dy), MAX_PULL), a = Math.atan2(dy, dx);
      const power = pull / MAX_PULL;
      ctx.fillStyle = `rgba(255,255,255,${0.5 + power * 0.5})`;
      for (let d = 14; d < 14 + pull * 1.3; d += 9) {
        ctx.beginPath(); ctx.arc(ball.x + Math.cos(a) * d, ball.y + Math.sin(a) * d, 2, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      roundRect(ball.x - 22, ball.y + 14, 44, 6, 3); ctx.fill();
      ctx.fillStyle = power > 0.8 ? "#e4572e" : "#ffffff";
      roundRect(ball.x - 22, ball.y + 14, 44 * power, 6, 3); ctx.fill();
    }

    // ball (shrinks and fades while dropping in)
    const s = 1 - sinkT * 0.7;
    const bx = sunk ? cx + (ball.x - cx) * (1 - sinkT) : ball.x;
    const by = sunk ? cy + (ball.y - cy) * (1 - sinkT) : ball.y;
    ctx.globalAlpha = 1 - sinkT * 0.6;
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.beginPath(); ctx.arc(bx + 1.5, by + 2, BALL_R * s, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath(); ctx.arc(bx, by, BALL_R * s, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  /* ---------------- triggers ---------------- */
  // 1. Type "fore" anywhere (not while typing in a field).
  let typed = "";
  addEventListener("keydown", (e) => {
    const t = e.target;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    if (e.key.length !== 1 || e.metaKey || e.ctrlKey || e.altKey) return;
    typed = (typed + e.key.toLowerCase()).slice(-4);
    if (typed === "fore") { typed = ""; open(); }
  });

  // 2. Ask the ask box "fore" (or "mini golf" / "play golf"). The normal answer still runs.
  const form = document.getElementById("ask-form"), input = document.getElementById("ask-input");
  if (form && input) {
    form.addEventListener("submit", () => {
      if (/^\s*fore!?\s*$|\b(mini ?golf|play golf|putting green)\b/i.test(input.value)) setTimeout(open, 250);
    });
  }

  // 3. A small flag right after the headline at the top of the page ("...and golf. ⛳").
  const headline = document.getElementById("headline");
  if (headline) {
    const flag = document.createElement("button");
    flag.type = "button";
    flag.className = "golf-flag";
    flag.textContent = "⛳";
    flag.title = "Fore!";
    flag.setAttribute("aria-label", "Play a mini golf game");
    flag.addEventListener("click", open);
    headline.appendChild(flag);
  }

  window.openGolf = open;
})();
