# CLAUDE.md

## Repository: Ben

### Overview

"The Velvet Razor // Forensic Voice Lab" — a static, TikTok-style presentation
(vertical full-screen slides) about the neurophysiology of singing, plus a
Playwright-based exporter that renders each slide to a 1080×1920 JPEG.

### Current State

- **Status**: Static single-page site + Node export script
- **Branch**: Development occurs on feature branches prefixed with `claude/`
- **Remote**: `origin` points to `benedictcberg-hue/Ben`

### Development Workflow

- Create feature branches off the main branch
- Commit with clear, descriptive messages
- Push to the remote using `git push -u origin <branch-name>`

### Conventions

- **Languages/runtime**: Plain HTML/CSS/JS (no framework, no build step). Export
  script is Node.js (tested on v22).
- **Dependencies**: `playwright` (dev only), installed via npm. The Chromium
  browser is fetched once with `npx playwright install chromium`.
- **Structure**:
  - `index.html` — the presentation (CSS + JS inlined, zero runtime deps).
  - `render.js` — exports each `.slide` to `export/slide-NN.jpg` at 1080×1920.
  - `export/` — generated JPEGs (committed).
- **Images**: thematic placeholders from Unsplash with a Picsum fallback
  (`onerror`). Swap `src` URLs in `index.html` to change them.
- **Slides**: each `<section class="slide" data-index="N">` is one TikTok card;
  `render.js` and the progress bar count slides dynamically.

### Commands

- `npm install` — install dev dependencies (Playwright).
- `npx playwright install chromium` — one-time browser download.
- `npm run export` — render all slides to `export/*.jpg`.

### Notes for AI Assistants

- Read this file at the start of every session for up-to-date project context
- Keep this file updated as the project evolves (new dependencies, scripts, conventions)
- Prefer editing existing files over creating new ones
- Do not over-engineer — match the complexity of the solution to the task
