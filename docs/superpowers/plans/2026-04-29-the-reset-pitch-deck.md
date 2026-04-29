# The Reset Pitch Deck Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-file animated HTML pitch deck (`the-reset.html`) for the 3-slide class presentation of The Reset, plus a one-shot Node script that bakes the Gemini hero photo into the file as base64 for full portability.

**Architecture:** Vanilla HTML + inline CSS + inline JS, no frameworks, no build pipeline. Three slides controlled by a tiny state machine. Background canvas for drizzle particles. SVG for the wireframe bottle, ghost dots, and countdown ring. Web Audio for the optional ambient hum and slide-change chime. A separate `tools/embed-hero.mjs` Node script base64-encodes `assets/hero.png` into the HTML at a marker comment, so the deployed `.html` file has zero external dependencies.

**Tech Stack:** HTML5, CSS custom properties + Grid + `@keyframes`, vanilla JS, `<canvas>`, SVG, Web Audio API, Node.js (one-shot script). Google Fonts: Inter, Noto Sans KR, JetBrains Mono.

**Spec:** [`/Users/max/Downloads/the-reset-pitch/docs/superpowers/specs/2026-04-29-the-reset-pitch-deck-design.md`](../specs/2026-04-29-the-reset-pitch-deck-design.md)

**Project root for all paths in this plan:** `/Users/max/Downloads/the-reset-pitch/`

---

## File Structure

| File | Purpose |
|---|---|
| `the-reset.html` | The deck. Contains all HTML, CSS, JS in one file. Contains a `<!--HERO_DATA_URL-->` marker that the embed script replaces. |
| `tools/embed-hero.mjs` | One-shot Node script. Reads `assets/hero.png`, base64-encodes it, and replaces the marker in `the-reset.html` with the data URL. |
| `assets/hero.png` | Already exists (Gemini render). The embed script reads from here. |

Single-file deck means no `style.css` / `app.js` split. The whole experience is in `the-reset.html` so the presenter only opens one thing.

---

## Verification Approach

This is a presentation artifact, not a service. The "tests" are visual + interactional, performed by opening `the-reset.html` in a browser and following a verify step. Where a step says "Verify in browser," open `file:///Users/max/Downloads/the-reset-pitch/the-reset.html` (or refresh it if already open) and confirm the described behavior.

---

## Task 1: HTML Skeleton with Palette, Typography, and Layout Grid

**Files:**
- Create: `the-reset.html`

- [ ] **Step 1: Create the HTML file with full skeleton**

Write this exact content to `the-reset.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>THE RESET — Pitch</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&family=Noto+Sans+KR:wght@400;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
  :root{
    --ink:#0a0d14; --haze:#1a1f2e; --panel:#12161f;
    --neon-cyan:#60e0ff; --neon-pink:#f472b6; --neon-amber:#fbbf24; --neon-violet:#a78bfa;
    --text:#e2e8f0; --text-dim:#94a3b8; --text-mute:#64748b;
    --slide-w:1280px; --slide-h:800px;
  }
  *{box-sizing:border-box;margin:0;padding:0}
  html,body{width:100%;height:100%;overflow:hidden;background:var(--ink);color:var(--text);font-family:'Inter',system-ui,sans-serif;-webkit-font-smoothing:antialiased}
  body{display:flex;align-items:center;justify-content:center;cursor:default;user-select:none}

  /* Stage that scales to fit while preserving 16:10 aspect */
  .stage{
    position:relative;width:var(--slide-w);height:var(--slide-h);
    transform-origin:center;background:var(--ink);overflow:hidden;
  }

  /* Brand lockup top-left */
  .brand{
    position:absolute;top:24px;left:32px;z-index:10;display:flex;align-items:baseline;gap:8px;
    font-weight:800;letter-spacing:2px;font-size:11px;color:var(--text);
  }
  .brand .han{font-family:'Noto Sans KR',sans-serif;font-weight:400;color:var(--neon-amber);font-size:11px;letter-spacing:0}

  /* Slide-number badge top-right (countdown ring filled in Task 3) */
  .badge{
    position:absolute;top:20px;right:28px;z-index:10;width:48px;height:48px;
    display:flex;align-items:center;justify-content:center;
  }
  .badge-num{
    position:absolute;font-family:'JetBrains Mono',monospace;font-size:14px;font-weight:500;
    color:var(--text);z-index:2;
  }

  /* Ghost dots bottom-center */
  .dots{
    position:absolute;bottom:22px;left:50%;transform:translateX(-50%);z-index:10;
    display:flex;gap:10px;
  }
  .dot{
    width:8px;height:8px;border-radius:50%;background:var(--text-mute);opacity:.4;
    transition:all .35s ease-out;
  }
  .dot.active{background:var(--neon-amber);opacity:1;box-shadow:0 0 10px var(--neon-amber);width:22px;border-radius:4px}

  /* Slides */
  .slide{
    position:absolute;inset:0;padding:80px 64px 80px;
    display:flex;flex-direction:column;
    opacity:0;pointer-events:none;transition:opacity .5s ease-out;
  }
  .slide.active{opacity:1;pointer-events:auto}

  /* Background canvas */
  .bg{position:absolute;inset:0;z-index:0;pointer-events:none}

  /* Audio toggle */
  .audio{
    position:absolute;top:24px;right:96px;z-index:10;
    width:24px;height:24px;display:flex;align-items:center;justify-content:center;
    cursor:pointer;color:var(--text-mute);font-family:'JetBrains Mono',monospace;font-size:11px;
  }
  .audio:hover{color:var(--text)}
</style>
</head>
<body>
  <div class="stage" id="stage">
    <canvas class="bg" id="bg"></canvas>

    <div class="brand">
      THE RESET <span class="han">「리셋」</span>
    </div>

    <div class="audio" id="audio" title="Toggle ambient (M)">♪</div>

    <div class="badge" id="badge">
      <!-- ring SVG goes here in Task 3 -->
      <span class="badge-num" id="badge-num">1</span>
    </div>

    <section class="slide active" id="slide-1" data-slide="0">
      <!-- Slide 1 content in Task 4 -->
    </section>

    <section class="slide" id="slide-2" data-slide="1">
      <!-- Slide 2 content in Task 8 -->
    </section>

    <section class="slide" id="slide-3" data-slide="2">
      <!-- Slide 3 content in Task 9 -->
    </section>

    <div class="dots">
      <div class="dot active" data-dot="0"></div>
      <div class="dot" data-dot="1"></div>
      <div class="dot" data-dot="2"></div>
    </div>
  </div>

  <script>
  // Auto-scale stage to fit viewport while preserving aspect ratio
  (function(){
    const stage = document.getElementById('stage');
    function fit(){
      const SW = 1280, SH = 800;
      const vw = window.innerWidth, vh = window.innerHeight;
      const scale = Math.min(vw / SW, vh / SH);
      stage.style.transform = `scale(${scale})`;
    }
    window.addEventListener('resize', fit);
    fit();
  })();
  </script>
</body>
</html>
```

- [ ] **Step 2: Verify the skeleton renders**

Open `file:///Users/max/Downloads/the-reset-pitch/the-reset.html` in your browser.
Expected: dark near-black background, top-left "THE RESET 「리셋」" lockup in white + amber, top-right "1" badge, bottom-center 3 dots (first one active/amber/elongated). Three (currently empty) slide containers exist; only the first is visible. Stage scales to fit window.

- [ ] **Step 3: Commit**

```bash
cd /Users/max/Downloads/the-reset-pitch
git add the-reset.html
git commit -m "task 1: scaffold the-reset.html with palette, typography, brand lockup, dots, badge"
```

---

## Task 2: Slide Navigation State Machine + Keyboard + Click Zones

**Files:**
- Modify: `the-reset.html` (append to `<script>` block)

- [ ] **Step 1: Add the navigation controller below the existing scale fit IIFE**

In `the-reset.html`, find the existing `<script>` block and add this code immediately *after* the `fit()` IIFE (still inside the same `<script>` tag):

```javascript
  // ──────────────────────────────────────────────
  //  NAVIGATION CONTROLLER
  // ──────────────────────────────────────────────
  const SLIDES = ['slide-1', 'slide-2', 'slide-3'];
  const state = { slide: 0 };

  function goTo(n){
    n = Math.max(0, Math.min(SLIDES.length - 1, n));
    if (n === state.slide) return;
    state.slide = n;
    SLIDES.forEach((id, i) => {
      document.getElementById(id).classList.toggle('active', i === n);
    });
    document.querySelectorAll('.dot').forEach((d, i) => {
      d.classList.toggle('active', i === n);
    });
    document.getElementById('badge-num').textContent = String(n + 1);
    // Hook for per-slide enter animations (filled in Tasks 4, 8, 9)
    if (typeof onSlideEnter === 'function') onSlideEnter(n);
  }
  function next(){ goTo(state.slide + 1); }
  function prev(){ goTo(state.slide - 1); }

  // Keyboard
  document.addEventListener('keydown', (e) => {
    if (['ArrowRight', ' ', 'PageDown'].includes(e.key)) { e.preventDefault(); next(); }
    else if (['ArrowLeft', 'Backspace', 'PageUp'].includes(e.key)) { e.preventDefault(); prev(); }
    else if (e.key === 'r' || e.key === 'R') { /* countdown reset — Task 3 */ }
    else if (e.key === 'm' || e.key === 'M') { /* audio toggle — Task 11 */ }
    else if (e.key === 'f' || e.key === 'F') {
      e.preventDefault();
      if (!document.fullscreenElement) document.documentElement.requestFullscreen();
      else document.exitFullscreen();
    }
  });

  // Click zones: left 20% = prev, right 60% = next, middle 20% = no-op
  document.addEventListener('click', (e) => {
    // Ignore clicks on interactive UI elements
    if (e.target.closest('.audio, .dot')) return;
    const x = e.clientX / window.innerWidth;
    if (x < 0.20) prev();
    else if (x > 0.40) next();
  });
```

- [ ] **Step 2: Verify slide navigation works**

Refresh the browser. Press `→` repeatedly: badge number changes 1 → 2 → 3, the active ghost dot moves with each press, slides cross-fade (you'll see the slide containers swap, even though they're empty). Press `←` to go back. Click on the right side of the screen to advance, click on the left to go back. Press `F` to toggle fullscreen.

- [ ] **Step 3: Commit**

```bash
cd /Users/max/Downloads/the-reset-pitch
git add the-reset.html
git commit -m "task 2: navigation state machine, keyboard, click zones, fullscreen"
```

---

## Task 3: Countdown Ring (per-slide 60s glance cue)

**Files:**
- Modify: `the-reset.html` (badge HTML + CSS + JS)

- [ ] **Step 1: Add the SVG ring inside the `.badge` element**

Find this in `the-reset.html`:

```html
    <div class="badge" id="badge">
      <!-- ring SVG goes here in Task 3 -->
      <span class="badge-num" id="badge-num">1</span>
    </div>
```

Replace the comment with the ring SVG, so the block becomes:

```html
    <div class="badge" id="badge">
      <svg class="ring" viewBox="0 0 48 48" width="48" height="48" aria-hidden="true">
        <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="2"/>
        <circle id="ring-progress" cx="24" cy="24" r="20" fill="none" stroke="var(--neon-cyan)" stroke-width="2"
                stroke-linecap="round" stroke-dasharray="125.6" stroke-dashoffset="125.6"
                transform="rotate(-90 24 24)"
                style="transition: stroke-dashoffset 0.1s linear, stroke 0.4s ease"/>
      </svg>
      <span class="badge-num" id="badge-num">1</span>
    </div>
```

- [ ] **Step 2: Add ring-related CSS**

Find the existing `<style>` block and add these rules at the bottom (just before `</style>`):

```css
  .ring{position:absolute;top:0;left:0}
  .ring circle{filter:drop-shadow(0 0 4px currentColor)}
```

- [ ] **Step 3: Add the countdown ticker to the JS**

Inside the same `<script>` tag, add this code below the navigation controller:

```javascript
  // ──────────────────────────────────────────────
  //  COUNTDOWN RING (60s glance cue, no auto-advance)
  // ──────────────────────────────────────────────
  const RING_LEN = 125.6; // 2 * PI * r where r=20
  const SLIDE_DURATION = 60; // seconds
  let elapsed = 0;
  let lastTick = performance.now();
  let timerPaused = false;

  function ringColor(secs){
    if (secs >= 60) return getComputedStyle(document.documentElement).getPropertyValue('--neon-pink').trim();
    if (secs >= 50) return getComputedStyle(document.documentElement).getPropertyValue('--neon-amber').trim();
    return getComputedStyle(document.documentElement).getPropertyValue('--neon-cyan').trim();
  }
  function updateRing(){
    const ring = document.getElementById('ring-progress');
    if (!ring) return;
    const pct = Math.min(elapsed / SLIDE_DURATION, 1);
    ring.setAttribute('stroke-dashoffset', String(RING_LEN * (1 - pct)));
    ring.style.stroke = ringColor(elapsed);
  }
  function tick(now){
    const dt = (now - lastTick) / 1000;
    lastTick = now;
    if (!timerPaused) elapsed += dt;
    updateRing();
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  function resetTimer(){ elapsed = 0; updateRing(); }

  // Pause when tab is hidden, resume when visible
  document.addEventListener('visibilitychange', () => {
    timerPaused = document.hidden;
    lastTick = performance.now();
  });

  // Reset timer on slide change (hook into goTo)
  const _origGoTo = goTo;
  goTo = function(n){
    const before = state.slide;
    _origGoTo(n);
    if (state.slide !== before) resetTimer();
  };

  // R key resets timer
  document.addEventListener('keydown', (e) => {
    if (e.key === 'r' || e.key === 'R') resetTimer();
  });
```

- [ ] **Step 4: Verify the ring fills**

Refresh. The cyan ring around the "1" should slowly fill clockwise over 60 seconds. At ~50s, the stroke turns amber. After 60s, it turns pink. The deck does NOT auto-advance. Press `R` — the ring resets to empty. Switch to another tab — the ring pauses; come back, it resumes. Navigate to slide 2 — the ring resets and starts filling from zero.

- [ ] **Step 5: Commit**

```bash
cd /Users/max/Downloads/the-reset-pitch
git add the-reset.html
git commit -m "task 3: 60s countdown ring with color shift, R reset, tab-blur pause"
```

---

## Task 4: Slide 1 Layout — Wordmark, Positioning Sentence, Ingredient Chips, Hero Slot

**Files:**
- Modify: `the-reset.html` (slide-1 contents + CSS + slide-enter JS hook)

- [ ] **Step 1: Replace the empty slide-1 with the layout**

Find this in `the-reset.html`:

```html
    <section class="slide active" id="slide-1" data-slide="0">
      <!-- Slide 1 content in Task 4 -->
    </section>
```

Replace with:

```html
    <section class="slide active" id="slide-1" data-slide="0">
      <div class="s1-grid">
        <div class="s1-hero">
          <img id="hero-img" alt="The Reset bottle on a Seoul convenience store counter at 2 AM"
               src="<!--HERO_DATA_URL-->">
          <!-- SVG wireframe overlay added in Task 5 -->
          <div class="ai-panel" id="ai-panel" aria-hidden="true">
            <pre id="ai-text"></pre><span class="ai-cursor">▮</span>
          </div>
        </div>
        <div class="s1-content">
          <h1 class="s1-wordmark">THE RESET<br><span class="s1-han">「리셋」</span></h1>
          <p class="s1-tag" id="s1-tag" data-text="Hydration + Hepatic Defense for the 2 AM walk home."></p>
          <div class="s1-chips">
            <span class="chip" style="--d:0ms">KOREAN PEAR</span>
            <span class="chip" style="--d:120ms">YUZU</span>
            <span class="chip" style="--d:240ms">DHM</span>
          </div>
        </div>
      </div>
    </section>
```

- [ ] **Step 2: Add slide-1 styles**

Append these rules to the `<style>` block (before `</style>`):

```css
  /* ── SLIDE 1 ── */
  .s1-grid{display:grid;grid-template-columns:1.05fr 1fr;gap:64px;height:100%;align-items:center}
  .s1-hero{position:relative;height:100%;display:flex;align-items:center;justify-content:center;overflow:hidden;border-radius:8px}
  .s1-hero img{
    max-height:100%;max-width:100%;object-fit:contain;display:block;
    filter:drop-shadow(0 30px 60px rgba(0,0,0,.6));
    opacity:0;transform:scale(1.02);transition:opacity 1.2s ease-out, transform 6s ease-out;
  }
  .slide.active .s1-hero img{opacity:1;transform:scale(1)}

  .ai-panel{
    position:absolute;left:16px;bottom:16px;
    background:rgba(10,13,20,.75);border:1px solid rgba(96,224,255,.25);
    backdrop-filter:blur(8px);
    padding:10px 14px;border-radius:6px;
    font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--neon-cyan);
    line-height:1.55;max-width:340px;min-height:90px;
    box-shadow:0 0 24px rgba(96,224,255,.08);
    opacity:0;transform:translateY(8px);transition:all .8s ease-out .6s;
  }
  .slide.active .ai-panel{opacity:1;transform:translateY(0)}
  .ai-panel pre{font-family:inherit;color:inherit;white-space:pre-wrap;display:inline}
  .ai-cursor{display:inline-block;color:var(--neon-cyan);animation:blink 1s steps(2) infinite;margin-left:2px}
  @keyframes blink{50%{opacity:0}}

  .s1-content{display:flex;flex-direction:column;justify-content:center;gap:32px}
  .s1-wordmark{
    font-size:88px;font-weight:900;line-height:.92;letter-spacing:-2px;
    color:var(--text);
    border-bottom:2px solid var(--neon-amber);padding-bottom:24px;
  }
  .s1-han{
    display:block;font-family:'Noto Sans KR',sans-serif;font-weight:400;font-size:36px;
    color:var(--neon-amber);letter-spacing:6px;margin-top:12px;
  }
  .s1-tag{font-size:24px;font-weight:600;line-height:1.4;color:var(--text);min-height:2.8em}
  .s1-tag .ch{opacity:0;transition:opacity .25s ease-out}
  .s1-tag .ch.show{opacity:1}

  .s1-chips{display:flex;gap:12px;flex-wrap:wrap}
  .chip{
    font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:1.5px;
    padding:8px 14px;border-radius:999px;
    background:rgba(167,139,250,.10);color:var(--neon-violet);border:1px solid rgba(167,139,250,.3);
    opacity:0;transform:translateY(8px);
    transition:all .5s ease-out;transition-delay:var(--d);
  }
  .slide.active .chip{opacity:1;transform:translateY(0)}
```

- [ ] **Step 3: Add the letter-by-letter reveal hook**

Add this code to the `<script>` block, below the countdown ring section:

```javascript
  // ──────────────────────────────────────────────
  //  PER-SLIDE ENTER ANIMATIONS
  // ──────────────────────────────────────────────
  function revealSentence(el){
    const text = el.dataset.text || '';
    el.innerHTML = '';
    const spans = [];
    for (const ch of text) {
      const s = document.createElement('span');
      s.className = 'ch';
      s.textContent = ch === ' ' ? ' ' : ch;
      el.appendChild(s);
      spans.push(s);
    }
    let i = 0;
    const iv = setInterval(() => {
      if (i >= spans.length) { clearInterval(iv); return; }
      spans[i].classList.add('show');
      i++;
    }, 33); // ~30 chars/sec
  }

  function onSlideEnter(n){
    if (n === 0) {
      const tag = document.getElementById('s1-tag');
      if (tag) revealSentence(tag);
    }
  }

  // Trigger initial slide's animation on load
  window.addEventListener('load', () => onSlideEnter(state.slide));
```

- [ ] **Step 4: Verify slide 1 renders**

Refresh. The hero image will appear broken (the `<!--HERO_DATA_URL-->` marker hasn't been replaced yet — that's Task 7). The right-side wordmark, positioning sentence (with letter-by-letter reveal on load), Korean Hangul, and three chips should all appear. Navigate away and back to slide 1; the sentence re-reveals; the chips re-stagger.

- [ ] **Step 5: Commit**

```bash
cd /Users/max/Downloads/the-reset-pitch
git add the-reset.html
git commit -m "task 4: slide 1 layout — wordmark, positioning reveal, ingredient chips, hero slot"
```

---

## Task 5: SVG Wireframe Bottle Overlay (slide 1)

**Files:**
- Modify: `the-reset.html` (add SVG inside `.s1-hero`, add CSS, add JS to trigger trace)

- [ ] **Step 1: Add the wireframe SVG inside `.s1-hero`**

Find the `<!-- SVG wireframe overlay added in Task 5 -->` comment in slide 1's HTML. Replace it with:

```html
          <svg class="wire-bottle" viewBox="0 0 200 380" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
            <g fill="none" stroke="var(--neon-cyan)" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
              <!-- cap -->
              <path class="wp" d="M 84 18 L 116 18 L 116 38 L 84 38 Z"/>
              <!-- neck -->
              <path class="wp" d="M 88 38 L 88 58 L 76 70 L 76 360 Q 76 372 88 372 L 112 372 Q 124 372 124 360 L 124 70 L 112 58 L 112 38"/>
              <!-- label rectangle -->
              <path class="wp" d="M 78 130 L 122 130 L 122 240 L 78 240 Z"/>
              <!-- label inner divider -->
              <path class="wp" d="M 84 175 L 116 175"/>
              <path class="wp" d="M 84 200 L 116 200"/>
              <!-- liquid surface -->
              <path class="wp" d="M 78 100 Q 100 92 122 100"/>
              <!-- bottom highlight -->
              <path class="wp" d="M 84 360 L 116 360"/>
            </g>
          </svg>
```

- [ ] **Step 2: Add wireframe styles**

Append to the `<style>` block:

```css
  .wire-bottle{
    position:absolute;inset:0;width:100%;height:100%;
    pointer-events:none;
    filter:drop-shadow(0 0 8px rgba(96,224,255,.4));
  }
  .wire-bottle .wp{
    stroke-dasharray:600;
    stroke-dashoffset:600;
    transition:stroke-dashoffset 1.6s ease-out;
  }
  .slide.active .wire-bottle .wp{stroke-dashoffset:0}
  /* Stagger each path */
  .wire-bottle .wp:nth-child(1){transition-delay:1.6s}
  .wire-bottle .wp:nth-child(2){transition-delay:1.7s}
  .wire-bottle .wp:nth-child(3){transition-delay:2.4s}
  .wire-bottle .wp:nth-child(4){transition-delay:2.7s}
  .wire-bottle .wp:nth-child(5){transition-delay:2.9s}
  .wire-bottle .wp:nth-child(6){transition-delay:3.1s}
  .wire-bottle .wp:nth-child(7){transition-delay:3.3s}
```

- [ ] **Step 3: Verify the wireframe traces over the hero**

Refresh. After ~1.6s on slide 1, you should see the cyan bottle wireframe trace itself in over the (still-broken) hero image — cap first, then body outline, then label panel, then dividers, then liquid surface. The wireframe glows softly with a cyan drop-shadow.

- [ ] **Step 4: Commit**

```bash
cd /Users/max/Downloads/the-reset-pitch
git add the-reset.html
git commit -m "task 5: SVG wireframe bottle traces over hero on slide 1"
```

---

## Task 6: AI Ingredient-Stream Typing Panel (slide 1)

**Files:**
- Modify: `the-reset.html` (extend `onSlideEnter` to type into the AI panel)

- [ ] **Step 1: Add the typing animation function and wire it into slide-1 enter**

Find the `onSlideEnter` function in the `<script>` block. Replace it with:

```javascript
  function onSlideEnter(n){
    if (n === 0) {
      const tag = document.getElementById('s1-tag');
      if (tag) revealSentence(tag);
      typeAIPanel();
    }
  }

  // Pre-scripted faux-AI ingredient stream
  const AI_LINES = [
    '> detecting frosted PET bottle... 16oz capacity confirmed',
    '> liquid: yuzu-pear blend',
    '> active stack: DHM 1.2g · L-cysteine 600mg · Korean pear ext.',
    '> target use: pre-bed, post-celebration',
    '> status: ready'
  ];
  let _aiTimer = null;
  function typeAIPanel(){
    const out = document.getElementById('ai-text');
    if (!out) return;
    if (_aiTimer) { clearInterval(_aiTimer); _aiTimer = null; }
    out.textContent = '';
    let li = 0, ci = 0;
    // Start typing after the panel finishes its entry transition (~1.4s in)
    setTimeout(() => {
      _aiTimer = setInterval(() => {
        if (li >= AI_LINES.length) { clearInterval(_aiTimer); _aiTimer = null; return; }
        const line = AI_LINES[li];
        if (ci < line.length) {
          out.textContent += line[ci];
          ci++;
        } else {
          out.textContent += '\n';
          li++;
          ci = 0;
        }
      }, 22);
    }, 1400);
  }
```

- [ ] **Step 2: Verify the AI panel types out**

Refresh on slide 1. After the panel fades in (~1.4s in), text begins typing line-by-line into the panel: bottle detection → liquid → active stack → target use → status: ready. The cursor `▮` blinks at the end. Navigating away and back retypes from the start.

- [ ] **Step 3: Commit**

```bash
cd /Users/max/Downloads/the-reset-pitch
git add the-reset.html
git commit -m "task 6: AI ingredient-stream typing panel on slide 1"
```

---

## Task 7: Hero Image Embed Script + Fallback

**Files:**
- Create: `tools/embed-hero.mjs`
- Modify: `the-reset.html` (add fallback JS that hides broken image)

- [ ] **Step 1: Create the embed script**

Create `tools/embed-hero.mjs` with this content:

```javascript
#!/usr/bin/env node
/**
 * Embeds assets/hero.png into the-reset.html as a base64 data URL.
 * Replaces the marker `<!--HERO_DATA_URL-->` (which is the value of the
 * src attribute on the hero <img>).
 *
 * Usage: node tools/embed-hero.mjs
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const HERO = resolve(ROOT, 'assets/hero.png');
const HTML = resolve(ROOT, 'the-reset.html');
const MARKER = '<!--HERO_DATA_URL-->';

if (!existsSync(HERO)) {
  console.error(`hero image not found at ${HERO}`);
  process.exit(1);
}
if (!existsSync(HTML)) {
  console.error(`html file not found at ${HTML}`);
  process.exit(1);
}

const png = readFileSync(HERO);
const dataUrl = `data:image/png;base64,${png.toString('base64')}`;

const html = readFileSync(HTML, 'utf8');
if (!html.includes(MARKER)) {
  console.error(`marker ${MARKER} not found in ${HTML}. Has the image already been embedded? If so, restore the marker before re-running.`);
  process.exit(1);
}
const updated = html.replace(MARKER, dataUrl);
writeFileSync(HTML, updated);
console.log(`embedded ${(png.length / 1024 / 1024).toFixed(2)} MB hero into the-reset.html`);
```

- [ ] **Step 2: Add the broken-image fallback to the HTML**

In `the-reset.html`'s `<script>` block, add this code just before the closing `</script>`:

```javascript
  // Hero image fallback: if it fails to load (or marker not replaced),
  // hide the img so the SVG wireframe is the slide-1 visual.
  (function(){
    const img = document.getElementById('hero-img');
    if (!img) return;
    function fail(){
      img.style.display = 'none';
      console.warn('[the-reset] hero image not loaded — falling back to SVG wireframe.');
    }
    if (img.getAttribute('src').includes('HERO_DATA_URL')) fail();
    else img.addEventListener('error', fail);
  })();
```

- [ ] **Step 3: Run the embed script**

```bash
cd /Users/max/Downloads/the-reset-pitch
node tools/embed-hero.mjs
```

Expected output: `embedded 7.74 MB hero into the-reset.html` (or similar size).

- [ ] **Step 4: Verify the hero appears**

Refresh the browser. Slide 1 now shows the photoreal frosted bottle with the Korean convenience-store neon backdrop. The cyan SVG wireframe traces over it ~1.6s in.

- [ ] **Step 5: Commit**

```bash
cd /Users/max/Downloads/the-reset-pitch
git add tools/embed-hero.mjs the-reset.html
git commit -m "task 7: embed-hero.mjs + broken-image fallback to wireframe"
```

> **Note:** The committed `the-reset.html` now contains the inlined base64 hero (file size ~10 MB). This is intentional for portability. If you regenerate the hero, restore the marker manually (replace the data URL with `<!--HERO_DATA_URL-->`) before re-running the script.

---

## Task 8: Slide 2 — D / F / V Columns with Confidence Dots

**Files:**
- Modify: `the-reset.html` (slide-2 HTML + CSS + onSlideEnter hook)

- [ ] **Step 1: Replace empty slide-2 with the layout**

Find:

```html
    <section class="slide" id="slide-2" data-slide="1">
      <!-- Slide 2 content in Task 8 -->
    </section>
```

Replace with:

```html
    <section class="slide" id="slide-2" data-slide="1">
      <header class="s2-head">
        <h2 class="s2-title">DOES IT WORK?</h2>
        <p class="s2-sub">An honest read across the three lenses.</p>
      </header>
      <div class="s2-cols">
        <article class="s2-col" style="--accent:var(--neon-pink);--d:0ms">
          <h3 class="s2-label">DESIRABILITY</h3>
          <div class="dots-conf"><span class="cdot"></span><span class="cdot"></span><span class="cdot empty"></span></div>
          <p class="s2-verdict">The 3 AM "uh-oh" is real, and productivity loss matters more than the headache.</p>
          <p class="s2-data">Self + 2 roommates — high signal, small n. <strong>Strangers untested.</strong></p>
        </article>
        <article class="s2-col" style="--accent:var(--neon-cyan);--d:200ms">
          <h3 class="s2-label">FEASIBILITY</h3>
          <div class="dots-conf"><span class="cdot"></span><span class="cdot"></span><span class="cdot empty"></span></div>
          <p class="s2-verdict">The Korean ingredient stack is sourceable; making it taste good in water is the open problem.</p>
          <p class="s2-data">DIY solubility test: cloudy + bitter. <strong>Pear-juice masking untested.</strong></p>
        </article>
        <article class="s2-col" style="--accent:var(--neon-amber);--d:400ms">
          <h3 class="s2-label">VIABILITY</h3>
          <div class="dots-conf"><span class="cdot"></span><span class="cdot"></span><span class="cdot empty"></span></div>
          <p class="s2-verdict">Strong gross margin (75%), but unit economics break if marketing reflects real CAC.</p>
          <p class="s2-data">LTV:CAC 2.5:1 (target 3:1+). Y1 model implies $0 CAC vs. $15–45 actual. <em class="s2-foreshadow">— Assumes US market.</em></p>
        </article>
      </div>
      <footer class="s2-foot">
        <p>●●○ across the board: real, but every layer needs a test.</p>
      </footer>
    </section>
```

- [ ] **Step 2: Add slide-2 styles**

Append to the `<style>` block:

```css
  /* ── SLIDE 2 ── */
  .s2-head{margin-bottom:36px}
  .s2-title{font-size:42px;font-weight:900;letter-spacing:-1px}
  .s2-sub{font-size:14px;color:var(--text-dim);margin-top:8px;letter-spacing:.5px}

  .s2-cols{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;flex:1;align-items:stretch}
  .s2-col{
    background:rgba(18,22,31,.6);border:1px solid rgba(255,255,255,.06);border-top:2px solid var(--accent);
    border-radius:6px;padding:28px 24px;display:flex;flex-direction:column;gap:18px;
    box-shadow:0 0 32px color-mix(in oklab, var(--accent) 14%, transparent);
    opacity:0;transform:translateY(20px);transition:all .6s ease-out;transition-delay:var(--d);
  }
  .slide.active .s2-col{opacity:1;transform:translateY(0)}
  .s2-label{font-size:13px;letter-spacing:3px;color:var(--accent);font-weight:800}
  .dots-conf{display:flex;gap:6px}
  .cdot{
    width:10px;height:10px;border-radius:50%;background:var(--accent);
    opacity:0;transform:scale(.4);transition:all .35s cubic-bezier(.34,1.56,.64,1);
    box-shadow:0 0 8px var(--accent);
  }
  .cdot.empty{background:transparent;border:1.5px solid var(--text-mute);box-shadow:none}
  .slide.active .cdot{opacity:1;transform:scale(1)}
  .slide.active .cdot:nth-child(1){transition-delay:calc(var(--d) + 480ms)}
  .slide.active .cdot:nth-child(2){transition-delay:calc(var(--d) + 640ms)}
  .slide.active .cdot:nth-child(3){transition-delay:calc(var(--d) + 800ms)}

  .s2-verdict{font-size:18px;line-height:1.45;color:var(--text);font-weight:600}
  .s2-data{font-size:13px;line-height:1.55;color:var(--text-dim)}
  .s2-data strong{color:var(--text)}
  .s2-foreshadow{
    color:var(--neon-amber);font-style:italic;font-weight:600;
    border-bottom:1px dashed var(--neon-amber);padding-bottom:1px;
  }

  .s2-foot{
    margin-top:32px;padding:18px 28px;border-radius:6px;text-align:center;
    background:rgba(251,191,36,.06);border:1px solid rgba(251,191,36,.20);
    font-size:15px;color:var(--text);letter-spacing:.3px;
  }
```

- [ ] **Step 3: Verify slide 2 renders and animates**

Press `→` to navigate to slide 2. Three columns slide up + fade in left-to-right with a 200ms stagger. Each column has a top accent border in its color (pink/cyan/amber). The ●●○ confidence dots pop in one by one. The "Assumes US market" italic at the bottom of the Viability column is amber with a dashed underline. Bottom strip shows the synthesis line.

- [ ] **Step 4: Commit**

```bash
cd /Users/max/Downloads/the-reset-pitch
git add the-reset.html
git commit -m "task 8: slide 2 — D/F/V columns with animated confidence dots and US market foreshadow"
```

---

## Task 9: Slide 3 — Headline + Three Timeline Cards + Callout + Wireframe Callback

**Files:**
- Modify: `the-reset.html` (slide-3 HTML + CSS)

- [ ] **Step 1: Replace empty slide-3 with the layout**

Find:

```html
    <section class="slide" id="slide-3" data-slide="2">
      <!-- Slide 3 content in Task 9 -->
    </section>
```

Replace with:

```html
    <section class="slide" id="slide-3" data-slide="2">
      <header class="s3-head">
        <h2 class="s3-title">Find the audience before you build the company.</h2>
        <p class="s3-sub">The product is the easy part. The audience is the bet.</p>
      </header>
      <div class="s3-cards">
        <article class="s3-card" style="--accent:var(--neon-violet);--d:0ms">
          <div class="s3-tags">
            <span class="s3-tag">2 WEEKS</span>
            <span class="s3-tag">~$0</span>
          </div>
          <h3 class="s3-cardtitle">VALIDATE THE PERSONA</h3>
          <p class="s3-body">5–8 structured interviews with strangers matching the High-Output Socialite profile. LinkedIn outreach, gym referrals — <strong>not roommates or friends</strong>. Confirm the productivity-loss frame resonates with people who don't already trust me.</p>
        </article>
        <article class="s3-card" style="--accent:var(--neon-cyan);--d:180ms">
          <div class="s3-tags">
            <span class="s3-tag">1 WEEK</span>
            <span class="s3-tag">$50–100</span>
          </div>
          <h3 class="s3-cardtitle">SURVEY MARKET INTEREST</h3>
          <p class="s3-body">Online screener (n=100+) via Reddit (r/decidingtobebetter, r/AskIreland, Korean expat subs, r/biohackers) + Prolific panel. Same six questions across geographies. <strong>Signal, not a launch decision.</strong></p>
        </article>
        <article class="s3-card" style="--accent:var(--neon-amber);--d:360ms">
          <div class="s3-tags">
            <span class="s3-tag">1 WEEK</span>
            <span class="s3-tag">$200</span>
          </div>
          <h3 class="s3-cardtitle">CONCEPT AD TEST</h3>
          <p class="s3-body">Identical Meta/TikTok creative running to two audiences (US 21–30 + the strongest alt market from Step 2). Measure CTR + landing-page email-capture. Real spend, real signal.</p>
        </article>
      </div>
      <footer class="s3-foot">
        <p><strong>$300 and a month gets you out of guessing.</strong></p>
      </footer>
      <svg class="s3-mini-bottle" viewBox="0 0 200 380" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <g fill="none" stroke="var(--neon-cyan)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <path d="M 84 18 L 116 18 L 116 38 L 84 38 Z"/>
          <path d="M 88 38 L 88 58 L 76 70 L 76 360 Q 76 372 88 372 L 112 372 Q 124 372 124 360 L 124 70 L 112 58 L 112 38"/>
          <path d="M 78 130 L 122 130 L 122 240 L 78 240 Z"/>
        </g>
      </svg>
    </section>
```

- [ ] **Step 2: Add slide-3 styles**

Append to the `<style>` block:

```css
  /* ── SLIDE 3 ── */
  .s3-head{margin-bottom:40px}
  .s3-title{font-size:40px;font-weight:900;line-height:1.15;letter-spacing:-1px;max-width:920px}
  .s3-sub{font-size:16px;color:var(--text-dim);margin-top:10px;letter-spacing:.3px}

  .s3-cards{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;flex:1}
  .s3-card{
    background:rgba(18,22,31,.6);border:1px solid rgba(255,255,255,.06);
    border-left:3px solid var(--accent);
    border-radius:6px;padding:24px 22px;display:flex;flex-direction:column;gap:14px;
    box-shadow:0 0 30px color-mix(in oklab, var(--accent) 12%, transparent);
    opacity:0;transform:translateX(-16px);transition:all .55s ease-out;transition-delay:var(--d);
    position:relative;
  }
  .slide.active .s3-card{opacity:1;transform:translateX(0)}
  .s3-tags{display:flex;gap:8px}
  .s3-tag{
    font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:1.5px;
    padding:4px 10px;border-radius:3px;
    background:color-mix(in oklab, var(--accent) 16%, transparent);color:var(--accent);
    border:1px solid color-mix(in oklab, var(--accent) 30%, transparent);
  }
  .s3-cardtitle{font-size:18px;font-weight:800;letter-spacing:1px;color:var(--text)}
  .s3-body{font-size:13.5px;line-height:1.55;color:var(--text-dim)}
  .s3-body strong{color:var(--text)}

  .s3-foot{
    margin-top:28px;padding:18px 28px;border-radius:6px;text-align:center;
    background:linear-gradient(90deg, rgba(251,191,36,.08), rgba(96,224,255,.08));
    border:1px solid rgba(251,191,36,.25);
    font-size:18px;color:var(--text);letter-spacing:.3px;
  }
  .s3-foot strong{color:var(--neon-amber);font-weight:800}

  .s3-mini-bottle{
    position:absolute;right:36px;bottom:36px;width:44px;height:84px;
    opacity:0;transform:translateY(8px);transition:all .8s ease-out 1.2s;
    filter:drop-shadow(0 0 6px rgba(96,224,255,.5));
  }
  .slide.active .s3-mini-bottle{opacity:.5;transform:translateY(0)}
```

- [ ] **Step 3: Verify slide 3**

Navigate to slide 3 (`→` from slide 2). Headline and subhead at top. Three cards slide in left-to-right with violet/cyan/amber accents on their left edge and matching mono tags ("2 WEEKS · ~$0", "1 WEEK · $50–100", "1 WEEK · $200"). Bottom callout strip with `$300 and a month gets you out of guessing.` In the lower-right, the small wireframe bottle fades in at ~1.2s — the callback to slide 1.

- [ ] **Step 4: Commit**

```bash
cd /Users/max/Downloads/the-reset-pitch
git add the-reset.html
git commit -m "task 9: slide 3 — headline, timeline cards, callout, wireframe-bottle callback"
```

---

## Task 10: Background Drizzle Canvas + Reduced-Motion Guard

**Files:**
- Modify: `the-reset.html` (canvas drawing JS + reduced-motion CSS)

- [ ] **Step 1: Add the canvas particle loop**

Add this code to the `<script>` block, below the per-slide-enter section:

```javascript
  // ──────────────────────────────────────────────
  //  BACKGROUND: subtle drizzle / light particles
  // ──────────────────────────────────────────────
  (function(){
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cv = document.getElementById('bg');
    if (!cv) return;
    if (reduced) { cv.style.display = 'none'; return; }
    const ctx = cv.getContext('2d');

    function resize(){
      cv.width = 1280;
      cv.height = 800;
    }
    resize();

    const drops = [];
    const N = 80;
    const COLORS = ['#60e0ff','#f472b6','#a78bfa','#fbbf24'];
    for (let i = 0; i < N; i++) {
      drops.push({
        x: Math.random() * cv.width,
        y: Math.random() * cv.height,
        vy: 0.4 + Math.random() * 1.2,
        len: 8 + Math.random() * 22,
        c: COLORS[Math.floor(Math.random() * COLORS.length)],
        a: 0.04 + Math.random() * 0.08,
      });
    }

    function frame(){
      ctx.clearRect(0, 0, cv.width, cv.height);
      for (const d of drops) {
        ctx.strokeStyle = d.c;
        ctx.globalAlpha = d.a;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x, d.y + d.len);
        ctx.stroke();
        d.y += d.vy;
        if (d.y > cv.height + 30) {
          d.y = -30;
          d.x = Math.random() * cv.width;
        }
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  })();
```

- [ ] **Step 2: Add reduced-motion CSS overrides**

Append to the `<style>` block:

```css
  /* ── REDUCED MOTION ── */
  @media (prefers-reduced-motion: reduce){
    .slide,.s1-hero img,.ai-panel,.chip,.s2-col,.cdot,.s3-card,.s3-mini-bottle{
      transition-duration:0.01ms !important;
      transition-delay:0ms !important;
      transform:none !important;
    }
    .wire-bottle .wp{stroke-dashoffset:0 !important;transition:none !important}
    .ai-cursor{animation:none}
  }
```

- [ ] **Step 3: Verify drizzle and reduced-motion fallback**

Refresh. You should see faint colored vertical drips falling slowly behind the slide content — very subtle, never competing with the type. To test the reduced-motion guard: enable "Reduce motion" in macOS System Settings → Accessibility → Display → Reduce Motion. Refresh the deck. The drizzle should be hidden, animations should be near-instant, the wireframe should appear immediately drawn rather than tracing in. Disable Reduce Motion when done testing.

- [ ] **Step 4: Commit**

```bash
cd /Users/max/Downloads/the-reset-pitch
git add the-reset.html
git commit -m "task 10: drizzle particles canvas + reduced-motion guard"
```

---

## Task 11: Audio Toggle (Ambient Hum + Slide-Change Chime)

**Files:**
- Modify: `the-reset.html` (Web Audio code + M-key wiring + click handler)

- [ ] **Step 1: Add the audio system to the JS**

Add this code to the `<script>` block, below the drizzle canvas section:

```javascript
  // ──────────────────────────────────────────────
  //  AUDIO: ambient hum + slide-change chime
  // ──────────────────────────────────────────────
  const audio = (function(){
    let ac = null, hum = null, gainHum = null;
    let on = localStorage.getItem('reset.audio') === '1';

    function ensureContext(){
      if (ac) return ac;
      try { ac = new (window.AudioContext || window.webkitAudioContext)(); }
      catch (e) { console.warn('audio context unavailable'); ac = null; }
      return ac;
    }

    function startHum(){
      if (!ensureContext()) return;
      if (hum) return;
      hum = ac.createOscillator();
      gainHum = ac.createGain();
      hum.type = 'sine';
      hum.frequency.value = 110; // low ambient drone
      gainHum.gain.value = 0.0;
      hum.connect(gainHum);
      gainHum.connect(ac.destination);
      hum.start();
      // fade in
      gainHum.gain.linearRampToValueAtTime(0.018, ac.currentTime + 1.2);
    }
    function stopHum(){
      if (!ac || !hum) return;
      gainHum.gain.cancelScheduledValues(ac.currentTime);
      gainHum.gain.linearRampToValueAtTime(0, ac.currentTime + 0.4);
      const h = hum, g = gainHum;
      setTimeout(() => { try { h.stop(); h.disconnect(); g.disconnect(); } catch {} }, 500);
      hum = null; gainHum = null;
    }

    function chime(){
      if (!on || !ensureContext()) return;
      const t0 = ac.currentTime;
      [880, 1318.51].forEach((freq, i) => {
        const o = ac.createOscillator();
        const g = ac.createGain();
        o.type = 'sine';
        o.frequency.value = freq;
        g.gain.setValueAtTime(0, t0 + i * 0.06);
        g.gain.linearRampToValueAtTime(0.06, t0 + i * 0.06 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + i * 0.06 + 0.4);
        o.connect(g); g.connect(ac.destination);
        o.start(t0 + i * 0.06); o.stop(t0 + i * 0.06 + 0.45);
      });
    }

    function syncUI(){
      const el = document.getElementById('audio');
      if (el) el.style.color = on ? 'var(--neon-amber)' : 'var(--text-mute)';
      if (el) el.title = on ? 'Mute (M)' : 'Unmute (M)';
    }

    function toggle(){
      on = !on;
      localStorage.setItem('reset.audio', on ? '1' : '0');
      if (on) startHum(); else stopHum();
      syncUI();
    }

    return { toggle, chime, syncUI, get on(){ return on; } };
  })();

  // M key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'm' || e.key === 'M') audio.toggle();
  });
  // Click on icon
  document.getElementById('audio').addEventListener('click', (e) => {
    e.stopPropagation();
    audio.toggle();
  });

  // Chime on slide change (re-wrap goTo once more)
  const _origGoTo2 = goTo;
  goTo = function(n){
    const before = state.slide;
    _origGoTo2(n);
    if (state.slide !== before) audio.chime();
  };

  // Initialize UI from persisted state (but don't auto-start the hum
  // until the user actually interacts — browser autoplay policy)
  audio.syncUI();
```

- [ ] **Step 2: Verify audio behavior**

Refresh the deck. Press `M` (or click the `♪` icon top-right):
- The icon turns amber.
- A faint low ambient hum fades in.
- Press `→` to advance: a short two-note chime plays.
- Press `M` again: hum fades out, icon goes grey.
- Reload the page: the toggle remembers your last choice (via localStorage).

- [ ] **Step 3: Commit**

```bash
cd /Users/max/Downloads/the-reset-pitch
git add the-reset.html
git commit -m "task 11: audio toggle — ambient hum + slide-change chime, M key, persisted"
```

---

## Task 12: Presenter Dry-Run

**Files:** none modified

- [ ] **Step 1: Run through the dry-run checklist**

Open `the-reset.html` from a clean browser window (or new private window). Walk through every item:

1. **Hero loads.** Slide 1 shows the photoreal frosted bottle (not a broken image). The cyan SVG wireframe traces over it ~1.6s in.
2. **Letter reveal.** The "Hydration + Hepatic Defense for the 2 AM walk home." sentence types in left to right.
3. **Chips.** "KOREAN PEAR · YUZU · DHM" chips stagger in.
4. **AI panel.** Faux-AI ingredient stream types out in the bottom-left of slide 1.
5. **→** Advance to slide 2. Three columns slide in left to right; ●●○ dots pop in; "Assumes US market" foreshadow is amber/italic.
6. **→** Advance to slide 3. Three timeline cards slide in left to right; mini wireframe bottle fades in lower-right.
7. **←** Backwards navigation works through all slides.
8. **R** Resets the countdown ring on the current slide.
9. **F** Toggles fullscreen.
10. **M** Toggles ambient hum + transition chimes; persists across reloads.
11. **60s on slide 1** without nav: ring fills cyan → amber at ~50s → pink at 60s. Deck does NOT auto-advance.
12. **Tab away + back:** countdown pauses while the tab is hidden, resumes on return.
13. **Click navigation:** click left 20% of viewport goes back; click right 60% advances.
14. **Reduce Motion:** with macOS reduced-motion enabled, drizzle is gone, animations are instant, deck still reads cleanly.
15. **External display test:** mirror to a 1920×1080 projector or external monitor. Stage scales to fit, no clipping, all text legible.

- [ ] **Step 2: If anything fails the checklist, file a fix and re-verify**

Common likely failures:
- Hero image not visible after `embed-hero.mjs` ran twice (the marker is gone after the first run). Fix: open the-reset.html, search for the long `data:image/png;base64,...` URL on the `#hero-img` `src` attribute, replace it back to `<!--HERO_DATA_URL-->`, then re-run the script.
- Audio context warning on first load: that's normal — browsers require a user gesture before allowing audio. Pressing M counts as the gesture and unlocks playback.
- Drizzle particles not visible: confirm Reduce Motion is OFF in system preferences.

- [ ] **Step 3: Final commit**

```bash
cd /Users/max/Downloads/the-reset-pitch
git add -A
git commit --allow-empty -m "task 12: presenter dry-run pass — deck ready for class"
```

---

## Done Criteria

- `the-reset.html` opens directly via `file://` with no external dependencies (after `embed-hero.mjs` has been run once).
- All 3 slides render with their content, animations, and transitions.
- Keyboard, click, and audio controls work as specified.
- Countdown ring works as a glance cue without auto-advancing.
- Reduced-motion is respected.
- Deck has been dry-run on the actual presentation machine.
