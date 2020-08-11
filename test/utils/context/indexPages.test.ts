import { Browser } from 'playwright';
import { indexPages, IndexedPage } from '../../../src/utils/context/indexPages';
import { launch, waitForPage } from '../../../src/utils';

describe('indexPages', () => {
  let browser: Browser;

  beforeAll(async () => {
    browser = await launch();
  });

  afterAll(() => browser.close());

  it('indexes the first existing page', async () => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await indexPages(context);
    expect((page as IndexedPage).createdIndex).toEqual(0);
    await context.close();
  });

  it('indexes newly created pages', async () => {
    const context = await browser.newContext();
    await indexPages(context);
    await context.newPage();
    await context.newPage();

    const pageOne = await waitForPage(context, 0);
    expect((pageOne as IndexedPage).createdIndex).toEqual(0);

    const pageTwo = await waitForPage(context, 1);
    expect((pageTwo as IndexedPage).createdIndex).toEqual(1);
    await context.close();
  });

  it('throws an error if more than one page already exists', async () => {
    const context = await browser.newContext();
    expect.assertions(1);
    await context.newPage();
    await context.newPage();

    return indexPages(context).catch((e) => {
      expect(e.message).toEqual(
        'Cannot index pages when more than 1 exist (2)',
      );
    });

    await context.close();
  });
});
