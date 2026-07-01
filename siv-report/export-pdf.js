import { chromium } from 'playwright'
import { createServer } from 'http'
import { readFile } from 'fs/promises'
import { extname, resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { mkdirSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const distDir   = resolve(__dirname, 'dist')
const outDir    = resolve(__dirname, '../export')
mkdirSync(outDir, { recursive: true })

const MIME = {
  '.html': 'text/html',
  '.js':   'application/javascript',
  '.css':  'text/css',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
}

function serve(port) {
  return new Promise((resolveServer) => {
    const server = createServer(async (req, res) => {
      let filePath = req.url === '/' ? '/index.html' : req.url
      filePath = resolve(distDir, filePath.slice(1))
      try {
        const data = await readFile(filePath)
        res.writeHead(200, { 'Content-Type': MIME[extname(filePath)] || 'text/plain' })
        res.end(data)
      } catch {
        res.writeHead(404)
        res.end('Not found')
      }
    })
    server.listen(port, '127.0.0.1', () => resolveServer(server))
  })
}

;(async () => {
  const port   = 4444
  const server = await serve(port)

  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium',
  })

  const page = await browser.newPage({ viewport: { width: 1200, height: 900 } })
  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle', timeout: 30000 })

  // Remove the export button bar before rendering
  await page.evaluate(() => {
    const bar = document.querySelector('.export-btn-bar')
    if (bar) bar.remove()
  })

  const pdfPath = resolve(outDir, 'SIV_Report.pdf')
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '12mm', bottom: '12mm', left: '12mm', right: '12mm' },
  })

  await browser.close()
  server.close()
  console.log(`PDF exported → ${pdfPath}`)
})()
