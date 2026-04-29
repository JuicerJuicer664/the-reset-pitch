# The Reset — Animated HTML Pitch Deck

**Date:** 2026-04-29
**Author:** Max May
**Course:** Intro to Design Thinking — Concept Pitch (3 slides, 1 minute each)

## Summary

A self-contained, single-file animated HTML "deck" that replaces traditional slides for a 3-minute classroom pitch of **The Reset** — a premium Korean-inspired hydration + hepatic-defense beverage. The deck is keyboard- and click-driven, runs offline, and uses a 2 AM Seoul convenience-store aesthetic to reinforce the product's positioning.

## Goals

- Cover the three required slides (concept illustration · desirability/feasibility/viability · what's next) with content that is readable at presenter pace.
- "Wow" cue for the AI-leaning professor: animations and a live ingredient-stream typing effect that reads as crafted, not templated.
- Pacing aid for the presenter: a per-slide ~60s countdown ring and 3 ghost dots for slide-position awareness.
- Portable: opens directly from a USB drive or `file://` with no server, no build, no internet dependency.

## Non-goals

- Not a real product mockup or marketing site — this is a class pitch artifact.
- Not auto-advancing — the presenter controls pacing.
- Not interactive beyond navigation — no forms, no analytics, no backend.
- Not responsive to all viewports — designed for laptop / projector at ~16:10. Mobile is an afterthought.

## Architecture

A single file: `the-reset.html`. Vanilla CSS + JS, no frameworks, no build step. One companion image asset embedded as base64 (so the file is fully portable; no broken hero if WiFi flakes).

```
the-reset-pitch/
├── docs/superpowers/specs/2026-04-29-the-reset-pitch-deck-design.md   ← this file
├── assets/
│   └── hero.png                  ← Gemini-generated bottle photo (user provides)
├── tools/
│   └── embed-hero.mjs            ← one-shot script: reads hero.png → writes data URL into the-reset.html
└── the-reset.html                ← the deck (the only file the presenter opens)
```

The build flow is intentionally trivial:
1. User runs Gemini with the prompt (provided separately) and saves the image to `assets/hero.png`.
2. `node tools/embed-hero.mjs` rewrites a marker comment inside `the-reset.html` with a base64 data URL of the hero image.
3. Presenter opens `the-reset.html` directly. Done.

## Visual System

**Aesthetic:** 2 AM Seoul convenience-store neon. Wet pavement, signage glow, calm late-night vibe.

**Palette (CSS custom properties):**
- `--ink: #0a0d14` — near-black background
- `--haze: #1a1f2e` — secondary background, panels
- `--neon-cyan: #60e0ff`
- `--neon-pink: #f472b6`
- `--neon-amber: #fbbf24`
- `--neon-violet: #a78bfa`
- `--text: #e2e8f0`
- `--text-dim: #94a3b8`

**Typography:**
- Headlines: a clean geometric sans (Inter or system equivalent) at heavy weight, sometimes outlined in neon.
- Hangul accents: Noto Sans KR.
- A single decorative monospace for the AI typing effect (JetBrains Mono or system mono).

**Motion language:**
- Slow, premium, with weight (300–600ms ease-out for entry; 800ms+ for hero transitions).
- Neon elements use a subtle pulse (CSS `@keyframes`, ~2s loop).
- A canvas-backed light-particle / drizzle effect runs continuously in the slide background but is muted in opacity so it doesn't compete with content.

## Navigation & Pacing

**Controls:**
- `→` / `Space` / `PageDown` / click on right 60% of viewport: next
- `←` / `Backspace` / `PageUp` / click on left 20% of viewport: previous
- `R`: reset the current slide's countdown
- `M`: toggle ambient audio (off by default)
- `F`: fullscreen

**Indicators:**
- 3 ghost dots bottom-center; the current slide's dot is filled with neon-amber. Smooth horizontal motion when navigating.
- Countdown ring around the slide-number badge in the top-right corner. Fills clockwise over 60s. Stroke color shifts cyan → amber at 50s → pink at 60s. Does **not** auto-advance — purely a glance cue. Pauses on tab-blur.
- Top-left: small `THE RESET / 리셋` lockup, always visible. Reinforces brand without occupying slide content space.

## Slide 1 — THE CONCEPT

**Layout (16:10):** two-column with the hero on the left, content on the right.

- **Left column:** the Gemini hero photo enters with a soft fade + subtle parallax. After ~2 seconds, an SVG "wireframe" version of the bottle traces itself over the photo (animated `stroke-dashoffset`), suggesting "this is the structure underneath the marketing." The wireframe persists as a recurring motif on later slides.
- **Right column (top):** wordmark `THE RESET` in heavy white sans, with `「리셋」` below in a smaller Hangul weight. Subtle neon-amber underline.
- **Right column (middle):** one positioning sentence — *"Hydration + Hepatic Defense for the 2 AM walk home."* Letter-by-letter reveal at ~30 chars/sec.
- **Right column (lower):** three flavor / ingredient chips that fade in sequentially with a slight bounce: `한국 배 · KOREAN PEAR`, `YUZU`, `DHM`.
- **AI flourish (the "wow" element):** a small monospace panel anchored in the lower-left of the slide. Faux-AI text types out an "ingredient stream" describing the bottle as it appears:
  ```
  > detecting frosted PET bottle... 16oz capacity confirmed
  > liquid: yuzu-pear blend
  > active stack: DHM 1.2g · L-cysteine 600mg · Korean pear ext.
  > target use: pre-bed, post-celebration
  > status: ready
  ```
  Cursor blinks at the end. Loops only once per slide-entry. Pre-scripted text — no actual model call. The illusion of AI without the brittleness of a real one.

## Slide 2 — DOES IT WORK?

**Layout:** three vertical columns, equal width, with neon borders. Each column = one ENDURE assessment dimension.

| Column | Verdict (single sentence) | Confidence | Sharpest data point |
|---|---|---|---|
| **DESIRABILITY** | The 3 AM "uh-oh" is real, and productivity loss matters more than the headache. | ●●○ | Self + 2 roommates — high signal, small n. Strangers untested. |
| **FEASIBILITY** | The Korean ingredient stack is sourceable; making it taste good in water is the open problem. | ●●○ | DIY solubility test: cloudy + bitter. Pear-juice masking untested. |
| **VIABILITY** | Strong gross margin (75%), but unit economics break if marketing budget reflects real CAC. | ●●○ | LTV:CAC = 2.5:1 (target: 3:1+). Y1 model implies $0 CAC vs. $15–45 actual. *Assumes US market.* |

The italicized *"Assumes US market"* in the Viability cell is intentional foreshadowing — it gets called back on Slide 3.

**Motion:** columns slide up + fade in left-to-right with a 200ms stagger. The ●●○ dots animate one by one — first dot pops at 80ms, second at 240ms, third (empty) at 400ms — reading as "computed, not asserted."

**Bottom strip:** a single line — *"●●○ across the board: real, but every layer needs a test."*

## Slide 3 — WHAT'S NEXT

**Headline:** *"Find the audience before you build the company."*

**Subhead** (smaller, dimmer, calling back the foreshadow): *"The product is the easy part. The audience is the bet."*

**Three timeline cards, left-to-right, each with a duration tag and budget:**

1. **VALIDATE THE PERSONA** · 2 weeks · ~$0
   5–8 structured interviews with strangers matching the High-Output Socialite profile — LinkedIn outreach, gym referrals, *not roommates or friends*. Goal: confirm the *productivity-loss frame* resonates with people who don't already trust me.

2. **SURVEY MARKET INTEREST** · 1 week · ~$50–100
   Online screener (n=100+) via Reddit communities (`r/decidingtobebetter`, `r/AskIreland`, Korean expat subs, `r/biohackers`) plus a Prolific panel. Same six questions across geographies — *would you buy this, when, at what price*. Goal: see whether the productivity-loss frame indexes higher in some cultures than others. **Signal, not a launch decision.**

3. **CONCEPT AD TEST** · 1 week · $200
   Identical Meta/TikTok creative running to two audiences (US 21–30 + the strongest alt market from #2). Measure CTR + landing-page email-capture. Goal: real spend, real signal — does the message actually pull people in?

**Bottom callout:** *"$300 and a month gets you out of guessing."*

**Motion:** cards animate in sequentially with a brief check-mark sketch on each timeline tag. The wireframe bottle (from Slide 1) reappears small in the corner, "watching."

## State Model

```
slide: 0 | 1 | 2          (zero-indexed)
elapsed: 0..60+ seconds   (per-slide; resets on slide change or 'R')
audioOn: bool             (persisted to localStorage)
```

That's the entire state. No dependencies between slides; navigating freely is safe and idempotent.

## Error Handling

- **Hero image missing.** If `embed-hero.mjs` hasn't been run, the data URL marker remains as a placeholder. The page detects the missing image at load and falls back to the SVG wireframe bottle in full color, with a small console message — never a broken-image icon visible to the audience.
- **Audio context unavailable.** Some browsers require a user gesture before allowing audio. The mute toggle is wired to a click/keypress handler so the audio context is always created in response to user input. If creation fails, the toggle silently disables itself.
- **Reduced motion.** Respects `prefers-reduced-motion`: keeps fades and color shifts but cuts the canvas particles and the bottle wireframe trace animation.
- **Mistyped key during the live pitch.** No destructive shortcuts. Worst case: a wrong arrow advances or rewinds a slide; navigation is reversible. `Esc` does nothing (avoids exiting fullscreen unintentionally).

## Testing & Validation

This is a presentation artifact, not a long-lived product. The "test plan" is a presenter dry-run checklist:

1. **Open in target browser.** Open `the-reset.html` in the browser the user will present from. Verify: hero photo loads, all three slides render, fonts apply (system fallback acceptable).
2. **Keyboard navigation.** Tap through `1 → 2 → 3 → 1` using arrows; same with spacebar.
3. **Click navigation.** Click left-zone and right-zone; verify they go back/forward.
4. **Countdown ring.** Sit on slide 1 for ~70s; verify ring fills, color shifts cyan → amber → pink, does not auto-advance.
5. **Reduced motion.** Enable system "reduce motion" preference; verify the deck still reads but isn't visually jarring.
6. **Projector test.** Mirror to an external display at 1920×1080; verify text remains legible (no tiny type) and neon contrast survives projector gamma.

## Out of Scope (deliberate)

- A "presenter notes" view.
- Speaker timer with audible cues.
- Slide-builder UI (the slides are hand-coded — that's the point).
- Real-time AI integration (the typing animation is pre-scripted; no API call needed).
- Mobile-portrait layout.
- Print/PDF export.

## Open Questions

None at this point — design is locked. If the hero image comes back from Gemini and reads weird (wrong angle, off-brand label), the wireframe-only fallback is already designed and acceptable.

## Implementation Order (for the writing-plans skill)

1. Scaffold `the-reset.html` with palette, typography, layout grid, and slide 1/2/3 empty containers.
2. Build the navigation controller (keyboard, click zones, slide state, ghost dots, countdown ring).
3. Build slide 1 — wordmark, positioning sentence, ingredient chips, hero image slot, SVG wireframe bottle, AI typing panel.
4. Build the `embed-hero.mjs` build helper.
5. Build slide 2 — three columns, ●●○ confidence dots, bottom strip, animations.
6. Build slide 3 — three timeline cards, headline + subhead, callout, wireframe-bottle callback.
7. Background canvas (drizzle / light particles), reduced-motion guard, audio toggle.
8. Polish pass: timing, easing, font weights, neon glow tuning.
9. Presenter dry-run on the actual machine + projector.
