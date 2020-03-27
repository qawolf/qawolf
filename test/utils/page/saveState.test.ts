import { pathExists, readJSON } from 'fs-extra';
import { tmpdir } from 'os';
import { join } from 'path';
import { Browser } from 'playwright';
import { launch, saveState } from '../../../src/utils';
import { randomString, TEST_URL } from '../../utils';

const COOKIE = {
  sameSite: 'None' as 'None',
  name: 'lang',
  value: 'en',
  domain: '.twitter.com',
  path: '/',
};

describe('saveState', () => {
  let browser: Browser;

  beforeAll(async () => {
    browser = await launch();
  });

  afterAll(() => browser.close());

  it('saves state to the specified file', async () => {
    const savePath = join(tmpdir(), randomString(), 'state.json');

    const page = await browser.newPage();
    await page.goto(TEST_URL);

    await page.context().addCookies([COOKIE]);
    await page.evaluate(() => {
      localStorage.setItem('hello', 'world');
      sessionStorage.setItem('in', 'sessionStorage');
    });

    await saveState(page, savePath);

    const isStateSaved = await pathExists(savePath);
    expect(isStateSaved).toBe(true);

    const state = await readJSON(savePath);

    expect(state.localStorage).toEqual({ hello: 'world' });
    expect(state.sessionStorage).toEqual({ in: 'sessionStorage' });

    expect(state.cookies).toMatchObject([COOKIE]);
  });
});
