import { createServer, Server, Socket, AddressInfo } from 'net';
import split from 'split';
import '../../src/watch/split';
import { WatchClient } from '../../src/watch/WatchClient';
import { waitFor } from '../../src/utils';

describe('WatchClient', () => {
  const messages: string[] = [];
  let server: Server;
  let socket: Socket;
  let watchClient: WatchClient;

  beforeAll(async () => {
    const connected = new Promise((resolve) => {
      server = createServer((connection) => {
        socket = connection;
        socket.pipe(split()).on('data', (data: string) => messages.push(data));
        resolve();
      });
    });

    await new Promise((resolve) => {
      server.listen({ port: 0 }, resolve);
    });

    watchClient = new WatchClient((server.address() as AddressInfo).port);

    await connected;
  });

  afterAll(() => {
    watchClient.close();
    server.close();
  });

  it('emits stoptest', async () => {
    const promise = new Promise((resolve) =>
      watchClient.on('stoptest', resolve),
    );
    socket.write(JSON.stringify({ name: 'stoptest' }) + '\n');
    await expect(promise).resolves.toBeUndefined();
  });

  it('sends messages', async () => {
    watchClient.sendCodeUpdate('some code');
    watchClient.sendStopWatch();
    watchClient.sendTestStopped();

    await waitFor(() => messages.length >= 3);

    expect(messages.slice(0, 3)).toEqual([
      '{"name":"codeupdate","code":"some code"}',
      '{"name":"stopwatch"}',
      '{"name":"teststopped"}',
    ]);
  });
});
