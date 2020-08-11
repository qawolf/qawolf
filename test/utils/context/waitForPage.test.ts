import { Browser } from 'playwright';
import { IndexedPage } from '../../../src/utils/context/indexPages';
import { launch, waitForPage, register } from '../../../src/utils';
import { TEST_URL } from '../../utils';

describe('waitForPage', () => {
  let browser: Browser;

  beforeAll(async () => {
    browser = await launch();
  });

  afterAll(() => browser.close());

  it('waits for a page to be created', async () => {
    const context = await browser.newContext();
    await register(context);

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

  it('brings the page to the front', async () => {
    const context = await browser.newContext();
    await register(context);

    const page = await context.newPage();
    const bringToFrontSpy = jest.spyOn(page, 'bringToFront');
    await waitForPage(context, 0);

    expect(bringToFrontSpy).toBeCalled();
  });
});
