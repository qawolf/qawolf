import { AddressInfo, connect, Socket } from 'net';
import { WatchServer } from '../../src/watch/WatchServer';

describe('WatchServer', () => {
  const server = new WatchServer();
  let client: Socket;

  beforeAll(async () => {
    const port = await server.port();

    await new Promise((resolve) => {
      client = connect({ port }, resolve);
    });
  });

  afterAll(() => {
    client.end();
    server.close();
  });

  describe('setEnv', () => {
    it('sets the server port', async () => {
      const env: NodeJS.ProcessEnv = {};
      await server.setEnv(env);

      expect(env.QAW_WATCH_SERVER_PORT).toEqual(
        (server._server.address() as AddressInfo).port.toString(),
      );
    });
  });

  describe('stopTest', () => {
    it('receives stopped before resolving', async () => {
      const spy = jest.fn();

      const closed = server.stopTest().then(spy);
      expect(spy).not.toBeCalled();

      client.write(JSON.stringify({ name: 'teststopped' }) + '\n');

      await closed;
      expect(spy).toBeCalled();
    });
  });

  describe('events', () => {
    // eslint-disable-next-line jest/no-test-callback
    it('emits received events', (done) => {
      const events = [];

      server.on('codeupdate', (code) => events.push(['codeupdated', code]));
      server.on('stopwatch', () => events.push('stopwatch'));
      server.on('teststopped', () => events.push('teststopped'));

      // write everything in one message
      // so it is processed in the next tick
      client.write(
        [
          { name: 'codeupdate', code: 'mycode' },
          { name: 'stopwatch' },
          { name: 'teststopped' },
        ]
          .map((data) => JSON.stringify(data))
          .join('\n') + '\n',
      );

      setTimeout(() => {
        expect(events).toEqual([
          ['codeupdated', 'mycode'],
          'stopwatch',
          'teststopped',
        ]);

        done();
      }, 0);
    });
  });
});
