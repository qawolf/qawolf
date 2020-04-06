import { AddressInfo, connect as connectSocket, Socket } from 'net';
import { waitFor } from '../../src/utils';
import { WatchServer } from '../../src/watch/WatchServer';

describe('WatchServer', () => {
  let server: WatchServer;

  const connect = async () => {
    let client: Socket;

    const port = await server.port();

    await new Promise((resolve) => {
      client = connectSocket({ port }, resolve);
    });

    return client;
  };

  beforeAll(() => {
    server = new WatchServer();
  });

  afterAll(() => server.close());

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

      const client = await connect();
      client.write(JSON.stringify({ name: 'teststopped' }) + '\n');

      await closed;
      expect(spy).toBeCalled();

      client.end();
    });
  });

  describe('events', () => {
    it('emits received events', async () => {
      const events = [];

      const client = await connect();

      server.on('codeupdate', (code) => events.push(['codeupdate', code]));
      server.on('stopwatch', () => events.push('stopwatch'));
      server.on('teststopped', () => events.push('teststopped'));

      client.write(
        JSON.stringify({ name: 'codeupdate', code: 'mycode' }) + '\n',
      );
      client.write(JSON.stringify({ name: 'stopwatch' }) + '\n');
      client.write(JSON.stringify({ name: 'teststopped' }) + '\n');

      await waitFor(() => events.length >= 3);

      expect(events).toEqual([
        ['codeupdate', 'mycode'],
        'stopwatch',
        'teststopped',
      ]);

      client.end();
    });
  });
});
