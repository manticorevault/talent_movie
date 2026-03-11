import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('BROWSER_CONSOLE:', msg.text()));
  page.on('pageerror', error => console.error('BROWSER_ERROR:', error.message));
  await page.goto('http://localhost:5173/movies');
  await page.waitForTimeout(3000);
  const title = await page.title();
  const text = await page.content();
  console.log('TITLE:', title);
  if (text.includes('Something went wrong')) {
    console.log('ERROR_BOUNDARY_TRIGGERED');
  } else {
    console.log('OUTPUT_SNIPPET:', text.substring(0, 1000));
  }
  await browser.close();
})();
