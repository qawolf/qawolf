const qawolf = require('qawolf');
const selectors = require('../selectors/keys.json');

let browser;
let page;

beforeAll(async () => {
  browser = await qawolf.launch({ slowMo: 20 });
  const context = await browser.newContext();
  await qawolf.register(context);
  page = await context.newPage();
});

afterAll(() => browser.close());

test('fill', async () => {
  await page.goto('http://localhost:5000/text-inputs');
  await page.click("[data-qa='html-text-input-filled']");
  await page.click('html');
  await page.fill("[data-qa='html-text-input-filled']", 'replaced');
  await page.click("[data-qa='material-text-input-filled'] input");
  await page.click(selectors['4_div']);
  await page.fill("[data-qa='material-text-input-filled'] input", 'replaced');
  await page.goto('http://localhost:5000/date-pickers');
  await page.click("[data-qa='html-date-picker']");
  await page.type("[data-qa='html-date-picker']", '01012020');
  await page.press("[data-qa='html-date-picker']", 'Tab');
  await page.press(selectors['9_a'], 'Tab');
  // TODO report issue to playwright
  await page.type("[data-qa='material-date-picker-native'] input", '02022020');
  await page.press("[data-qa='material-date-picker-native'] input", 'Tab');
  await page.fill("[data-qa='material-date-picker'] input", '02032020');
  await page.press("[data-qa='material-date-picker'] input", 'Tab');
  await page.press("[data-qa='material-date-picker'] button", 'Tab');
  await page.fill("[data-qa='material-date-picker-dialog'] input", '03032020');
});
