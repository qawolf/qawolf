import { BrowserContext } from 'playwright';
import { REPLServer } from 'repl';
import { waitForPage } from '../context/waitForPage';
import { openScreenshot } from '../page/openScreenshot';

export const addScreenshotCommand = (replServer: REPLServer): void => {
  replServer.defineCommand('screenshot', {
    help: 'Take a screenshot and open it',
    action: async (pageVariable) => {
      let pageIndex = Number(pageVariable);
      if (isNaN(pageIndex)) pageIndex = 0;

      // register(context) will set the context.context
      const context = replServer.context.context as BrowserContext;
      if (!context || !context.pages) {
        throw new Error(
          `No browser context found. Provide it to the repl "await repl({ context })"`,
        );
      }

      const page = await waitForPage(context, pageIndex, { waitUntil: null });
      await openScreenshot(page);
    },
  });
};
