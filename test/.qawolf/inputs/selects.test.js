const qawolf = require('qawolf');
const selectors = require('./selectors/selects.json');
const { TEST_URL } = require('../utils');

let browser;
let page;

beforeAll(async () => {
  browser = await qawolf.launch({ slowMo: 20 });
  const context = await browser.newContext();
  await qawolf.register(context);
  page = await context.newPage();
});

afterAll(async () => {
  await qawolf.stopVideos();
  await browser.close();
});

test('selects', async () => {
  await page.goto(`${TEST_URL}selects`);
  await page.evaluate(() => console.log('start select test'));
  await page.selectOption("[data-qa='html-select']", 'cat');
  await page.click("[data-qa='material-select']");
  await page.click(selectors['2_li']);
  await page.selectOption("[data-qa='material-select-native'] select", 'red');
  await page.click("[data-qa='material-select-multiple']");
  await page.click(selectors['5_li']);
  await page.click(selectors['6_li']);
  await page.click(selectors['7_div']);
  await page.click("[data-qa='semantic-select'] input");
  await page.click("[data-qa='semantic-select']");
});
