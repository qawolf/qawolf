import { Browser } from 'playwright';
import { WatchHooks } from './WatchHooks';

const closeOnce = (browser: Browser): void => {
  let closedPromise: Promise<void>;

  const closeFn = browser.close.bind(browser);

  (browser as any).close = (): Promise<void> => {
    if (closedPromise) return closedPromise;
    closedPromise = closeFn();
    return closedPromise;
  };
};

export const watchBrowser = (browser: Browser): void => {
  if ((browser as any)._qawWatch) return;
  (browser as any)._qawWatch = true;

  // We close the browser when the test is stopped.
  // The test might close the browser too.
  // To prevent an error, we stub browser.close to only run once.
  closeOnce(browser);

  // After the browser is disconnected, close the watch hooks.
  browser.on('disconnected', () => WatchHooks.close());

  WatchHooks.onStop(() => browser.close());
};
