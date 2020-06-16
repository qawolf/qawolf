import { Browser, BrowserContext } from 'playwright';
import { launch, waitForPage, IndexedPage } from '../../../src/utils';
import { TEST_URL } from '../../utils';

describe('waitForPage', () => {
  let browser: Browser;
  let context: BrowserContext;

  beforeAll(async () => {
    browser = await launch();
    context = await browser.newContext();
  });

  afterAll(() => browser.close());

  it('waits for a page to be created', async () => {
    const promises = [];

    let waitForPromise = waitForPage(context, 0);
    let page = await context.newPage();
    promises.push(page.goto(TEST_URL));
    let waitedForPage = await waitForPromise;
    expect((page as IndexedPage).createdIndex).toEqual(0);
    expect(waitedForPage.createdIndex).toEqual(0);

    waitForPromise = waitForPage(context, 1);
    page = await context.newPage();
    promises.push(page.goto(TEST_URL));
    waitedForPage = await waitForPromise;
    expect((page as IndexedPage).createdIndex).toEqual(1);
    expect(waitedForPage.createdIndex).toEqual(1);

    await Promise.all(promises);
  });
});
