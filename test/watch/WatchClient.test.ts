import Mitm, { MitmType } from 'mitm';
import { Socket } from 'net';
import split from 'split';
import '../mitm';
import '../../src/watch/split';
import { WatchClient } from '../../src/watch/WatchClient';
import { waitFor } from '../../src/utils';

describe('WatchClient', () => {
  const messages: string[] = [];
  let mitm: MitmType;
  let socket: Socket;
  let watchClient: WatchClient;

  beforeAll(() => {
    mitm = Mitm();
    mitm.on('connection', (connection: Socket) => {
      socket = connection;
      socket.pipe(split()).on('data', (data: string) => messages.push(data));
      return connection;
    });
    watchClient = new WatchClient(22);
  });

  afterAll(() => mitm.disable());

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
    expect(messages).toEqual([
      '{"name":"codeupdate","code":"some code"}',
      '{"name":"stopwatch"}',
      '{"name":"teststopped"}',
    ]);
  });
});
