import Mitm, { MitmType } from 'mitm';
import { Socket, connect } from 'net';
import { join } from 'path';
import '../mitm';
import { Config } from '../../src/config';
import { RunProcess } from '../../src/run/RunProcess';

const config: Config = {
  attribute: '',
  rootDir: __dirname,
  testTimeout: 60000,
  useTypeScript: true,
};

describe('Run', () => {
  let mitm: MitmType;
  let serverSocket: Socket;

  beforeAll(() => {
    mitm = Mitm();
    mitm.on('connection', (socket: Socket) => (serverSocket = socket));
  });

  afterAll(() => mitm.disable());

  describe('_stop', () => {
    it('receives stopped before resolving', async () => {
      const run = new RunProcess({
        config,
        codePath: join(config.rootDir, 'empty.test.ts'),
      });

      run.setConnection(connect(22, 'example.org'));

      const spy = jest.fn();

      const closed = run._stop().then(spy);
      expect(spy).not.toBeCalled();

      serverSocket.write(JSON.stringify({ name: 'stopped' }) + '\n');

      await closed;
      expect(spy).toBeCalled();
    });
  });

  describe('start', () => {
    it('runs a script', async () => {
      const run = new RunProcess({
        config,
        codePath: join(config.rootDir, 'empty.script.ts'),
      });
      run.start();

      const code = await new Promise((resolve) => {
        run._process.on('exit', (code) => resolve(code));
      });
      expect(code).toEqual(0);
    });

    it('runs a test', async () => {
      const run = new RunProcess({
        config,
        codePath: join(config.rootDir, 'empty.test.ts'),
      });
      run.start();

      const code = await new Promise((resolve) => {
        run._process.on('exit', (code) => resolve(code));
      });
      expect(code).toEqual(0);
    });
  });

  describe('setConnection', () => {
    // eslint-disable-next-line jest/no-test-callback
    it('emits close when the socket closes', (done) => {
      const run = new RunProcess({
        config,
        codePath: join(config.rootDir, 'empty.test.ts'),
      });

      run.on('close', () => {
        expect(run._socket).toBeNull();
        done();
      });

      run.setConnection(connect(22, 'example.org'));

      serverSocket.end();
    });

    // eslint-disable-next-line jest/no-test-callback
    it('emits received events', (done) => {
      const run = new RunProcess({
        config,
        codePath: join(config.rootDir, 'empty.test.ts'),
      });

      run.setConnection(connect(22, 'example.org'));

      const events = [];

      run.on('codeupdate', (code) => events.push(['codeupdated', code]));
      run.on('stopped', () => events.push('stopped'));
      run.on('stoprunner', () => events.push('stoprunner'));

      serverSocket.write(
        JSON.stringify({ name: 'codeupdate', code: 'mycode' }) + '\n',
      );
      serverSocket.write(JSON.stringify({ name: 'stopped' }) + '\n');
      serverSocket.write(JSON.stringify({ name: 'stoprunner' }) + '\n');

      setTimeout(() => {
        expect(events).toEqual([
          ['codeupdated', 'mycode'],
          'stopped',
          'stoprunner',
        ]);

        done();
      }, 0);
    });
  });
});
