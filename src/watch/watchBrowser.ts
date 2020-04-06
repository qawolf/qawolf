import { Browser } from 'playwright';
import { WatchHooks } from './WatchHooks';

const closeOnce = (browser: Browser) => {
  let closed: boolean = false;

  const originalClose = browser.close.bind(browser);

  (browser as any).close = () => {
    if (closed) return;
    closed = true;
    return originalClose();
  };
};

export const watchBrowser = (browser: Browser) => {
  if (!WatchHooks.enabled() || (browser as any)._qawWatch) return;
  (browser as any)._qawWatch = true;

  // We close the browser when the test is stopped.
  // The test might close the browser too.
  // To prevent an error, we stub browser.close to only run once.
  closeOnce(browser);

  // After the browser is disconnected, close the watch hooks.
  browser.on('disconnected', () => WatchHooks.close());

  WatchHooks.onStop(async () => {
    try {
      await browser.close();
    } catch (e) {
      // the browser might already be closed
    }
  });
};
