import { readdir } from 'fs-extra';
import { tmpdir } from 'os';
import { join } from 'path';
import { Browser, Page } from 'playwright';
import * as playwrightVideoSave from 'playwright-video/build/saveVideo';
import * as playwrightVideoUtils from 'playwright-video/build/utils';
import { indexPages } from '../../../src/utils/context/indexPages';
import { addInitScript } from '../../../src/utils/context/register';
import {
  getLaunchOptions,
  launch,
  saveArtifacts,
  stopVideos,
  waitFor,
} from '../../../src/utils';
import * as saveArtifactsUtils from '../../../src/utils/context/saveArtifacts';
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

  let saveDir: string;
  let page: Page;
  let page2: Page;

  beforeAll(async () => {
    saveDir = join(tmpdir(), randomString());

    browser = await launch();
    const context = await browser.newContext();
    await addInitScript(context);
    await indexPages(context);
    await saveArtifacts(context, saveDir);

    page = await context.newPage();
    page2 = await context.newPage();

    // make sure there are frames
    await page.goto(TEST_URL);
    await page2.goto(TEST_URL);
    await page.goto(`${TEST_URL}test-inputs`);
    await page2.goto(`${TEST_URL}test-inputs`);
  });

  afterAll(() => browser.close());

  it('saves console logs', async () => {
    await page.evaluate(() => console.log('hello'));
    await page2.evaluate(() => console.info('world'));
    await expect(waitForPath(saveDir, 'logs_0')).resolves.toBeTruthy();
    await expect(waitForPath(saveDir, 'logs_1')).resolves.toBeTruthy();
  });

  it('saves videos when ffmpeg is installed', async () => {
    // videos are chromium only for now
    if (getLaunchOptions().browserName !== 'chromium') return;
    await stopVideos();
    await expect(waitForPath(saveDir, 'video_0')).resolves.toBeTruthy();
    await expect(waitForPath(saveDir, 'video_1')).resolves.toBeTruthy();
  });

  it('skips video when ffmpeg is not installed', async () => {
    jest.spyOn(playwrightVideoUtils, 'getFfmpegPath').mockReturnValue(null);

    const saveLogsSpy = jest
      .spyOn(saveArtifactsUtils, 'saveConsoleLogs')
      .mockResolvedValue();

    const saveVideoSpy = jest.spyOn(playwrightVideoSave, 'saveVideo');

    const saveDir = join(tmpdir(), randomString());

    const newContext = await browser.newContext();
    await newContext.newPage();
    await saveArtifacts(newContext, saveDir);

    expect(saveLogsSpy).toBeCalled();
    expect(saveVideoSpy).not.toBeCalled();
    await newContext.close();

    jest.resetAllMocks();
  });
});
