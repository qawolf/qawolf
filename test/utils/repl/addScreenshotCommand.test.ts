import { ChildProcess } from 'child_process';
import { Browser, BrowserContext } from 'playwright-core';
import { start } from 'repl';
import { IndexedPage, launch } from '../../../src/utils';
import * as openScreenshot from '../../../src/utils/page/openScreenshot';
import { addScreenshotCommand } from '../../../src/utils/repl/addScreenshotCommand';

describe('addScreenshotCommand', () => {
  let browser: Browser;
  let context: BrowserContext;

  beforeAll(async () => {
    browser = await launch();
    context = await browser.newContext();
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
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(pageArgument.createdIndex).toEqual(0);
      replServer.close();

      openScreenshotSpy.mockRestore();
    });
  });
});
