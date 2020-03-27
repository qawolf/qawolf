import { Browser } from 'playwright';
import { initEvaluateScript, launch } from '../../src';

let browser: Browser;

beforeAll(async () => {
  browser = await launch();
});

afterAll(() => browser.close());

it('ignores errors caused by navigation', async () => {
  const page = await browser.newPage();
  const navigation = page.goto('https://example.org');

  // this will throw an error if navigation errors not ignored
  const testFn = (): Promise<void> =>
    initEvaluateScript(page, () => console.log('noop'));
  await expect(testFn()).resolves.not.toThrowError();

  await navigation;
});

it('does not run when page is closed', async () => {
  const page = await browser.newPage();
  await page.close();

  const testFn = (): Promise<void> =>
    initEvaluateScript(page, () => console.log('noop'));
  await expect(testFn()).resolves.not.toThrowError();
});

it('runs now and on navigation', async () => {
  const page = await browser.newPage();

  let runTimes = 0;

  await page.exposeFunction('incrementRuns', () => {
    runTimes++;
  });

  await initEvaluateScript(page, () => (window as any).incrementRuns());
  expect(runTimes).toEqual(1);

  await page.goto('about:blank');
  expect(runTimes).toEqual(2);
});
