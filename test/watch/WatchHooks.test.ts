import { WatchHooks } from '../../src/watch/WatchHooks';

describe('WatchHooks', () => {
  describe('_handleStopTest', () => {
    it('waits for onStop callbacks before sending teststopped', async () => {
      let resolve: () => void;

      WatchHooks.onStop(
        () =>
          new Promise((r) => {
            resolve = r;
          }),
      );

      // create the mock client
      const client = {
        close: jest.fn(),
        sendTestStopped: jest.fn(),
      } as any;
      WatchHooks._client = client;

      const stopPromise = WatchHooks._handleStopTest();

      expect(resolve).toBeDefined();
      expect(client.sendTestStopped).toBeCalledTimes(0);
      expect(client.close).toBeCalledTimes(0);

      resolve();

      await stopPromise;

      expect(client.sendTestStopped).toBeCalledTimes(1);
      expect(client.close).toBeCalledTimes(1);
    });
  });
});
