import { ChildProcess } from 'child_process';
import { Browser, BrowserContext } from 'playwright';
import { start } from 'repl';
import { addScreenshotCommand } from '../../../src/utils/repl/addScreenshotCommand';
import { IndexedPage } from '../../../src/utils/context/indexPages';
import * as openScreenshot from '../../../src/utils/page/openScreenshot';
import { launch, register, waitFor } from '../../../src/utils';

describe('addScreenshotCommand', () => {
  let browser: Browser;
  let context: BrowserContext;

  beforeAll(async () => {
    browser = await launch();
    context = await browser.newContext();
    await register(context);
    await context.newPage();
  });

  afterAll(() => browser.close());

  describe('.screenshot', () => {
    it('calls openScreenshot with the correct page', async () => {
      let pageArgument: IndexedPage;

      const openScreenshotSpy = jest
        .spyOn(openScreenshot, 'openScreenshot')
        .mockImplementation(async (arg) => {
          pageArgument = arg as IndexedPage;
          return {} as ChildProcess;
        });

      const replServer = start({ terminal: true });
      addScreenshotCommand(replServer);
      replServer.context.context = context;

      process.stdin.push('.screenshot 0');
      process.stdin.push('\n');
      // let repl process stdin
      await waitFor(() => !!pageArgument);

      expect(pageArgument.createdIndex).toEqual(0);
      replServer.close();

      openScreenshotSpy.mockRestore();
    });
  });
});
