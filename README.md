# The Velvet Razor // Forensic Voice Lab — TikTok Presentation

A vertical, swipeable **TikTok-style** presentation about the *Neurophysiology of
Singing*. Seven full-screen portrait slides ("Feelings & Singing") with the classic
TikTok UI — story progress bar, right-hand action rail (like / comment / save /
share), bottom caption with handle, hashtags and a music ticker.

The content (Levels 01–05 + Lab Note N°02) is adapted from the original
"Forensic Voice Lab" notes.

## View it

Open `index.html` in any modern browser.

- **Swipe / scroll** vertically (CSS scroll-snap) to move between slides.
- **Tap** the top/bottom third of a slide, or use **↑ / ↓** keys.
- On desktop it renders inside a phone frame; on mobile it goes full-screen.

Example images are thematic placeholders served from **Unsplash** (with a
**Picsum** fallback). Swap the `src` URLs in `index.html` to use your own.

## Export each slide as a JPEG (1080×1920)

For posting the slides directly to TikTok / Reels / Stories:

```bash
npm install
npx playwright install chromium   # one-time: downloads the headless browser
npm run export
```

This renders `index.html` at 1080×1920 and writes:

```
export/slide-01.jpg   …   export/slide-07.jpg
```

## Project structure

| File          | Purpose                                              |
|---------------|------------------------------------------------------|
| `index.html`  | The TikTok presentation (HTML + CSS + JS, no deps).  |
| `render.js`   | Playwright script — renders each slide to a JPEG.    |
| `package.json`| `npm run export` script + Playwright dependency.     |
| `export/`     | Generated 1080×1920 JPEGs.                            |
