/**
 * render.js — Exports each TikTok slide of index.html to a 1080x1920 JPEG.
 *
 * Usage:
 *   npm install
 *   npx playwright install chromium
 *   npm run export
 *
 * Output: ./export/slide-01.jpg ... slide-07.jpg
 */
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const ROOT = __dirname;
const OUT_DIR = path.join(ROOT, 'export');
const PAGE_URL = 'file://' + path.join(ROOT, 'index.html');

(async () => {
    fs.mkdirSync(OUT_DIR, { recursive: true });

    // --ignore-certificate-errors lets web fonts load behind TLS-intercepting
    // proxies; local images need no network at all.
    const browser = await chromium.launch({ args: ['--ignore-certificate-errors'] });
    const page = await browser.newPage({
        viewport: { width: 1080, height: 1920, deviceScaleFactor: 1 },
        ignoreHTTPSErrors: true,
    });

    console.log('Loading', PAGE_URL);
    await page.goto(PAGE_URL, { waitUntil: 'load', timeout: 60000 });

    // Switch the page into fixed-size render mode (full-bleed, no animations)
    await page.evaluate(() => document.body.classList.add('render-mode'));

    // Wait until every slide background image is decoded (capped so a slow/blocked
    // image can't hang the export — the Picsum fallback or a black panel is fine).
    console.log('Waiting for slide images...');
    await page.evaluate(async () => {
        const imgs = Array.from(document.querySelectorAll('img.slide__bg'));
        const settle = (img) =>
            img.complete && img.naturalWidth > 0
                ? Promise.resolve()
                : new Promise(res => { img.onload = img.onerror = res; });
        const cap = new Promise(res => setTimeout(res, 15000));
        await Promise.race([Promise.all(imgs.map(settle)), cap]);
    });

    const count = await page.evaluate(() => document.querySelectorAll('.slide').length);
    console.log(`Found ${count} slides. Rendering...`);

    for (let i = 0; i < count; i++) {
        // Scroll the i-th slide to the top of the viewport
        await page.evaluate((idx) => {
            const deck = document.getElementById('deck');
            deck.scrollTo({ top: idx * deck.clientHeight, behavior: 'instant' });
        }, i);
        await page.waitForTimeout(250); // let layout settle

        const file = path.join(OUT_DIR, `slide-${String(i + 1).padStart(2, '0')}.jpg`);
        await page.screenshot({
            path: file,
            type: 'jpeg',
            quality: 90,
            clip: { x: 0, y: 0, width: 1080, height: 1920 },
        });
        console.log('  ✓', path.relative(ROOT, file), '(1080x1920)');
    }

    await browser.close();
    console.log(`\nDone — ${count} JPEGs written to ${path.relative(ROOT, OUT_DIR)}/`);
})().catch(err => {
    console.error(err);
    process.exit(1);
});
