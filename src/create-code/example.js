const { chromium } = require('playwright');
const { indexPages } = require('playwright-utils');
const { create } = require('../build');

const myMethod = async context => {
  const page = await context.newPage();
  await page.goto('http://localhost:5000');

  await create(context);
  // 🐺 CREATE CODE HERE
};

exports.myMethod = myMethod;

if (require.main === module) {
  (async () => {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    await indexPages(context);
    await myMethod(context);
    // await context.newPage();
    // await browser.close();
  })();
}
