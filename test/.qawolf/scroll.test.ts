import { Browser, Page } from 'playwright';
import qawolf from 'qawolf';
import { TEST_URL } from '../utils';

let browser: Browser;
let page: Page;

beforeAll(async () => {
  browser = await qawolf.launch();
  const context = await browser.newContext();
  await qawolf.register(context);
  page = await context.newPage();
});

afterAll(async () => {
  await qawolf.stopVideos();
  await browser.close();
});

test('scroll', async () => {
  await page.goto(`${TEST_URL}infinite-scroll`);
  await page.evaluate(() => console.log('start scroll test'));
  await qawolf.scroll(page, 'html', { x: 0, y: 500 });
});
