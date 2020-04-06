import { AddressInfo, connect, Socket } from 'net';
import { waitFor } from '../../src/utils';
import { WatchServer } from '../../src/watch/WatchServer';

describe('WatchServer', () => {
  let client: Socket;
  let server: WatchServer;

  beforeAll(async () => {
    server = new WatchServer();

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
    it('emits received events', async () => {
      const events = [];

      server.on('codeupdate', (code) => events.push(['codeupdate', code]));
      server.on('stopwatch', () => events.push('stopwatch'));
      server.on('teststopped', () => events.push('teststopped'));

      client.write(
        JSON.stringify({ name: 'codeupdate', code: 'mycode' }) + '\n',
      );
      client.write(JSON.stringify({ name: 'stopwatch' }) + '\n');
      client.write(JSON.stringify({ name: 'teststopped' }) + '\n');

      // force flush
      client.write('\n');

      await waitFor(() => events.length === 3);

      expect(events).toEqual([
        ['codeupdate', 'mycode'],
        'stopwatch',
        'teststopped',
      ]);
    });
  });
});
