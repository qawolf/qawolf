const qawolf = require('qawolf');
const { TEST_URL } = require('./utils');

let browser;
let page;

beforeAll(async () => {
  browser = await qawolf.launch({ slowMo: 20 });
  const context = await browser.newContext();
  await qawolf.register(context);
  page = await context.newPage();
});

afterAll(() => browser.close());

test('selects', async () => {
  await page.goto(`${TEST_URL}infinite-scroll`);
  await page.evaluate(() => console.log('start scroll test'));
  await qawolf.scroll(page, 'html', { x: 0, y: 2205 });
});
