import { launch } from '../../src/utils';
import { watchBrowser } from '../../src/watch/watchBrowser';
import { WatchHooks } from '../../src/watch/WatchHooks';

describe('watchBrowser', () => {
  describe('WatchHooks', () => {
    it('browser.close calls WatchHooks.close', async () => {
      WatchHooks.close = jest.fn();
      const browser = await launch();
      watchBrowser(browser);
      await browser.close();
      expect(WatchHooks.close).toBeCalledTimes(1);
    });

    it('WatchHooks.onStop calls browser.close', async () => {
      WatchHooks._onStop = [];
      const browser = await launch();
      watchBrowser(browser);

      expect(browser.isConnected()).toEqual(true);
      expect(WatchHooks._onStop).toHaveLength(1);
      await WatchHooks._onStop[0]();

      expect(browser.isConnected()).toEqual(false);
    });
  });

  it('stubs browser.close to only run once', async () => {
    const browser = await launch();

    const spy = jest.spyOn(browser, 'close');
    watchBrowser(browser);

    await browser.close();
    await browser.close();

    expect(spy).toBeCalledTimes(1);
  });
});
