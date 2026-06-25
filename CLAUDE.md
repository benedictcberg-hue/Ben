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
  - `forecast/` — standalone heatwave forecast module (independent of the
    presentation; see "Forecast module" below).
  - `data/` — generated forecast dataset. Only `forecast_summary.csv` is
    committed; the `.duckdb` file and `forecast_daily.csv` are gitignored
    (regeneratable).
- **Images**: thematic placeholders from Unsplash with a Picsum fallback
  (`onerror`). Swap `src` URLs in `index.html` to change them.
- **Slides**: each `<section class="slide" data-index="N">` is one TikTok card;
  `render.js` and the progress bar count slides dynamically.

### Forecast module (`forecast/` + `data/`)

A self-contained Monte-Carlo forecast of Berlin daily max temperature for
Jul–Sep 2026, separate from the presentation.

- `forecast/simulate.js` — modified mean-reverting **jump-diffusion** model.
  Mean reversion to the seasonal Tmax cycle + a decaying heat-dome / structural
  climate offset; **Generalized-Pareto (Pareto) up-jumps** (capped) for heat
  ridges; exponential down-jumps for cold fronts. Two coupled state drivers: a
  **jet-stream Markov regime** (`zonal`/`blocked` omega-block) and a
  **drought / soil-moisture deficit** state — the jet→drought→heat feedback.
  Writes the full per-path daily dataset to `data/forecast_daily.csv` and prints
  the monthly summary.
- `forecast/load_duckdb.py` — loads the CSV into `data/heatwave.duckdb`
  (appends per `run_id` so the dataset grows across runs), runs
  `forecast/queries.sql`, and exports `data/forecast_summary.csv`.
- `forecast/queries.sql` — aggregation queries that reproduce the monthly report
  from the raw rows (consistency check) plus jet/drought diagnostics.
- **DuckDB**: used via the **Python** binding (`pip install duckdb`). The native
  `duckdb` npm package is intentionally NOT a dependency — its native build is
  very slow in this environment. Model stays in JS; persistence/queries in Python.

### Commands

- `npm install` — install dev dependencies (Playwright).
- `npx playwright install chromium` — one-time browser download.
- `npm run export` — render all slides to `export/*.jpg`.
- `pip install duckdb` — one-time, for the forecast module.
- `npm run forecast` — run the simulation and load/query the DuckDB dataset.

### Notes for AI Assistants

- Read this file at the start of every session for up-to-date project context
- Keep this file updated as the project evolves (new dependencies, scripts, conventions)
- Prefer editing existing files over creating new ones
- Do not over-engineer — match the complexity of the solution to the task
