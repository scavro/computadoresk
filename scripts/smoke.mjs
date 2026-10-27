// Smoke test end-to-end: sirve dist/ con `vite preview` y comprueba rutas,
// tema claro/oscuro, búsqueda por deep-link y overflow en desktop/móvil.
// Uso: npm run smoke   (requiere `npm run build` previo)
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const BASE = 'http://localhost:4173';
const errors = [];

const preview = spawn('npm', ['run', 'preview'], { stdio: 'ignore', detached: true });
const stop = () => { try { process.kill(-preview.pid); } catch { /* ya terminado */ } };

async function waitForServer() {
  for (let i = 0; i < 40; i++) {
    try {
      const response = await fetch(BASE);
      if (response.ok) return;
    } catch { /* aún no levanta */ }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error('El servidor de preview no respondió.');
}

try {
  await waitForServer();
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push(`[console] ${msg.text()}`); });
  page.on('pageerror', (err) => errors.push(`[pageerror] ${err.message}`));

  async function check(label, url) {
    await page.goto(`${BASE}${url}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(300);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    if (overflow) errors.push(`[overflow] ${url}`);
    console.log(`OK ${label} ${url}`);
  }

  await check('landing', '/');
  const lightBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  console.log(`light body background: ${lightBg}`);
  if (lightBg === 'rgba(0, 0, 0, 0)' || lightBg === 'rgb(0, 0, 0)') errors.push(`[theme] fondo claro inválido: ${lightBg}`);

  await page.evaluate(() => localStorage.setItem('fc-theme', 'dark'));
  await page.reload({ waitUntil: 'networkidle' });
  const darkBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  console.log(`dark body background: ${darkBg}`);
  if (darkBg === lightBg) errors.push('[theme] el modo oscuro no cambió el fondo');
  await page.evaluate(() => localStorage.setItem('fc-theme', 'light'));

  await check('apuntes T1', '/#/temas/1');
  await check('apuntes T2', '/#/temas/2');
  await check('ejercicios', '/#/ejercicios/tema-1');
  await check('soluciones', '/#/ejercicios/tema-1/soluciones');
  await check('examen', '/#/examen');
  await check('ejercicios examen', '/#/examen/ejercicios');
  // Los enunciados de examen llevan fórmulas $...$ en data/exam.ts: KaTeX debe renderizarlas.
  const mathCount = await page.locator('.katex').count();
  console.log(`fórmulas KaTeX en ejercicios de examen: ${mathCount}`);
  if (mathCount === 0) errors.push('[katex] no se renderizó ninguna fórmula en los ejercicios de examen');
  await check('practicas', '/#/practicas');
  await check('practica bases', '/#/practicas/bases');
  await check('practica memoria 3D', '/#/practicas/memoria');
  await check('guia', '/#/guia');
  await check('fuentes', '/#/fuentes');
  await check('buscador', '/#/buscar?q=complemento');

  const results = await page.locator('main a').count();
  console.log(`search results for "complemento": ${results}`);
  if (results < 3) errors.push(`[search] pocos resultados: ${results}`);

  await page.setViewportSize({ width: 390, height: 844 });
  for (const url of ['/', '/#/temas/1', '/#/practicas', '/#/examen']) {
    await page.goto(`${BASE}${url}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(200);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    if (overflow) errors.push(`[overflow móvil] ${url}`);
  }
  console.log('OK móvil 390px');

  await browser.close();
} finally {
  stop();
}

if (errors.length) {
  console.log('\nFALLOS:');
  for (const e of errors) console.log(' - ' + e);
  process.exit(1);
}
console.log('\nSMOKE OK');
