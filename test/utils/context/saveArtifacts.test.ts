import { readdir, readFileSync } from 'fs-extra';
import { tmpdir } from 'os';
import { join } from 'path';
import { Browser, Page } from 'playwright-core';
import * as playwrightVideo from 'playwright-video';
import {
  launch,
  getLaunchOptions,
  saveArtifacts,
  stopVideos,
  waitFor,
} from '../../../src/utils';
import { randomString, TEST_URL } from '../../utils';

const waitForPath = (dir: string, search: string): Promise<string | null> =>
  waitFor(
    async () => {
      const files = await readdir(dir);
      const file = files.find((f) => f.includes(search));
      if (file) return join(dir, file);
      return null;
    },
    { timeout: 60000 },
  );

describe('saveArtifacts', () => {
  let browser: Browser;

  beforeAll(async () => {
    browser = await launch();
  });

  afterAll(() => browser.close());

  describe('ffmpeg installed', () => {
    let saveDir: string;
    let page: Page;
    let page2: Page;

    beforeAll(async () => {
      saveDir = join(tmpdir(), randomString());

      const context = await browser.newContext();
      page = await context.newPage();
      page2 = await context.newPage();

      await saveArtifacts(context, saveDir);
    });

    it('saves console logs', async () => {
      await page.evaluate(() => console.log('hello'));
      await page2.evaluate(() => console.info('world'));

      await expect(waitForPath(saveDir, 'logs_0')).resolves.toBeTruthy();
      await expect(waitForPath(saveDir, 'logs_1')).resolves.toBeTruthy();
    });

    it('saves videos', async () => {
      // videos are chromium only for now
      if (getLaunchOptions().browserName !== 'chromium') return;

      // make sure there are frames
      await page.goto(TEST_URL);
      await page2.goto(TEST_URL);
      await page.goto(`${TEST_URL}test-inputs`);
      await page2.goto(`${TEST_URL}test-inputs`);

      await page.close();
      await page2.close();

      await stopVideos();

      await expect(waitForPath(saveDir, 'video_0')).resolves.toBeTruthy();
      await expect(waitForPath(saveDir, 'video_1')).resolves.toBeTruthy();
    });
  });

  it('only saves console logs if ffmpeg not installed', async () => {
    jest.spyOn(playwrightVideo, 'getFfmpegPath').mockReturnValue(null);

    const saveDir = join(tmpdir(), randomString());

    const context = await browser.newContext();
    const page = await context.newPage();
    const page2 = await context.newPage();

    await saveArtifacts(context, saveDir);

    await page.evaluate(() => console.log('hello'));
    await page2.evaluate(() => console.info('world'));

    const logPath0 = await waitForPath(saveDir, 'logs_0');
    const lines = readFileSync(logPath0, 'utf8').split('\n');
    expect(lines).toEqual(['log: hello', '']);

    const logPath1 = await waitForPath(saveDir, 'logs_1');
    const lines2 = readFileSync(logPath1, 'utf8').split('\n');
    expect(lines2).toEqual(['info: world', '']);

    expect(
      (await readdir(saveDir)).find((f) => f.includes('video_0')),
    ).toBeFalsy();

    await context.close();
    jest.resetAllMocks();
  });
});
