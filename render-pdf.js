/**
 * render-pdf.js — Exports Veeva_Direct_Assignment_QuickStep.html to a
 * multi-page A4 PDF (page 1 = compact quick-step card, pages 2–6 = one
 * step per page with a large screenshot).
 *
 * Screenshots are read from images/veeva/step-1.png … step-5.png. Any that
 * are missing render as a labeled placeholder, so the PDF is always complete.
 *
 * Usage:
 *   npm install
 *   npx playwright install chromium
 *   npm run export:pdf
 *
 * Output: ./export/Veeva_Direct_Assignment_QuickStep.pdf
 */
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const ROOT = __dirname;
const OUT_DIR = path.join(ROOT, 'export');
const HTML = 'Veeva_Direct_Assignment_QuickStep.html';
const PAGE_URL = 'file://' + path.join(ROOT, HTML);
const OUT_FILE = path.join(OUT_DIR, 'Veeva_Direct_Assignment_QuickStep.pdf');

// Some managed environments ship a pre-installed Chromium whose build differs
// from the npm-installed Playwright (so `playwright install` is unavailable).
// Honour CHROME_PATH, else fall back to any /opt/pw-browsers/chromium-*/chrome.
function findChromium() {
    if (process.env.CHROME_PATH && fs.existsSync(process.env.CHROME_PATH)) {
        return process.env.CHROME_PATH;
    }
    const base = process.env.PLAYWRIGHT_BROWSERS_PATH || '/opt/pw-browsers';
    try {
        for (const dir of fs.readdirSync(base)) {
            if (!dir.startsWith('chromium-')) continue;
            const exe = path.join(base, dir, 'chrome-linux', 'chrome');
            if (fs.existsSync(exe)) return exe;
        }
    } catch { /* base dir absent — let Playwright use its own download */ }
    return undefined;
}

(async () => {
    fs.mkdirSync(OUT_DIR, { recursive: true });

    // --ignore-certificate-errors lets the Google Fonts load behind a
    // TLS-intercepting proxy; the screenshots themselves are local files.
    const executablePath = findChromium();
    if (executablePath) console.log('Using Chromium at', executablePath);
    const browser = await chromium.launch({
        executablePath,
        args: ['--ignore-certificate-errors'],
    });
    const page = await browser.newPage({ ignoreHTTPSErrors: true });

    console.log('Loading', PAGE_URL);
    await page.goto(PAGE_URL, { waitUntil: 'load', timeout: 60000 });

    // Wait for web fonts so the PDF uses Fraunces/Spectral/IBM Plex Mono.
    // Capped so a blocked font CDN can't hang the export (system serif is fine).
    await Promise.race([
        page.evaluate(() => document.fonts.ready),
        page.waitForTimeout(8000),
    ]);

    // Let any present local screenshots decode (missing ones fire onerror and
    // swap to the placeholder synchronously).
    await page.waitForTimeout(300);

    await page.pdf({
        path: OUT_FILE,
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: true,
        margin: { top: '0', right: '0', bottom: '0', left: '0' },
    });

    await browser.close();
    console.log('Done —', path.relative(ROOT, OUT_FILE));
})().catch(err => {
    console.error(err);
    process.exit(1);
});
