import { chromium } from 'playwright';
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
await page.addInitScript(()=>localStorage.setItem('fc-theme','dark'));
const errors=[]; page.on('console',m=>m.type()==='error'&&errors.push(m.text())); page.on('pageerror',e=>errors.push(e.message));
for (const route of ['/','/temas/1','/practicas/ampliacion','/examen']) {
  await page.goto(`http://127.0.0.1:5173/#${route}`,{waitUntil:'networkidle'});
  await page.waitForTimeout(400);
  const overflow = await page.evaluate(()=>document.documentElement.scrollWidth > window.innerWidth + 2);
  const theme = await page.evaluate(()=>document.documentElement.dataset.theme);
  console.log(route,'theme=',theme,'overflow=',overflow,'errors=',errors.length);
}
console.log('errors',errors);
await browser.close();
