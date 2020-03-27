import { tmpdir } from 'os';
import { join } from 'path';
import { Browser } from 'playwright';
import { launch, saveState, setState } from '../../../src/utils';
import { randomString, TEST_URL } from '../../utils';

const COOKIE = {
  sameSite: 'None' as 'None',
  name: 'lang',
  value: 'en',
  domain: '.twitter.com',
  path: '/',
};

describe('setState', () => {
  let browser: Browser;
  let browser2: Browser;

  beforeAll(async () => {
    browser = await launch();
    browser2 = await launch();
  });

  afterAll(() => Promise.all([browser.close(), browser2.close()]));

  it('sets state from the specified file', async () => {
    const savePath = join(tmpdir(), randomString(), 'state.json');

    const page = await browser.newPage();
    await page.goto(TEST_URL);

    await page.context().addCookies([COOKIE]);
    await page.evaluate(() => {
      localStorage.setItem('hello', 'world');
      sessionStorage.setItem('in', 'sessionStorage');
    });

    await saveState(page, savePath);

    const page2 = await browser2.newPage();
    await page2.goto(TEST_URL);

    await setState(page2, savePath);

    const cookies = await page.context().cookies();
    expect(cookies).toMatchObject([COOKIE]);

    const storage = await page.evaluate(() => {
      return {
        localStorage: { ...localStorage },
        sessionStorage: { ...sessionStorage },
      };
    });
    expect(storage).toEqual({
      localStorage: { hello: 'world' },
      sessionStorage: { in: 'sessionStorage' },
    });
  });
});
