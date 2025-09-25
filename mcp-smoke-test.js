const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch(); // launches bundled Chromium
  const page = await browser.newPage();

  // Start your local server in a separate terminal before running this test
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });

  // Check initial text
  await page.waitForSelector('#headline');
  const before = await page.$eval('#headline', el => el.textContent);

  // Click the button and wait for change
  await page.click('#btn');
  await page.waitForFunction(
    () => document.querySelector('#headline').textContent === 'Clicked!'
  );
  const after = await page.$eval('#headline', el => el.textContent);

  console.log('Headline before:', before, '| after:', after);
  await browser.close();

  // Basic assertion
  if (before === 'Hello, world' && after === 'Clicked!') {
    console.log('✅ Smoke test passed');
    process.exit(0);
  } else {
    console.error('❌ Smoke test failed');
    process.exit(1);
  }
})();
