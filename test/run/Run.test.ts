import Mitm, { MitmType } from 'mitm';
import { Socket, connect } from 'net';
import { join } from 'path';
import '../mitm';
import { Config } from '../../src/config';
import { Run } from '../../src/run/Run';

const config: Config = {
  attribute: '',
  rootDir: __dirname,
  testTimeout: 60000,
  useTypeScript: false,
};

describe('Run', () => {
  let mitm: MitmType;
  let serverSocket: Socket;

  beforeAll(() => {
    mitm = Mitm();
    mitm.on('connection', (socket: Socket) => (serverSocket = socket));
  });

  afterAll(() => mitm.disable());

  describe('start', () => {
    it('runs a script', async () => {
      const run = new Run({
        config,
        codePath: join(config.rootDir, 'empty.ts'),
      });
      run.start();

      const code = await new Promise((resolve) => {
        run._process.on('exit', (code) => resolve(code));
      });
      expect(code).toEqual(0);
    });

    it('runs a test', async () => {
      const run = new Run({
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
    it('receives and emits codeupdate', (done) => {
      const run = new Run({
        config,
        codePath: join(config.rootDir, 'empty.test.ts'),
      });

      run.on('codeupdate', (code) => {
        expect(code).toEqual('mycode');
        done();
      });

      run.setConnection(connect(22, 'example.org'));

      serverSocket.write(
        JSON.stringify({ name: 'codeupdate', code: 'mycode' }),
      );
    });
  });

  describe('close', () => {
    it('receives closed before resolving', async () => {
      const run = new Run({
        config,
        codePath: join(config.rootDir, 'empty.test.ts'),
      });

      run.setConnection(connect(22, 'example.org'));

      const spy = jest.fn();

      const closed = run.close().then(spy);
      expect(spy).not.toBeCalled();

      serverSocket.write(JSON.stringify({ name: 'closed' }));

      await closed;
      expect(spy).toBeCalled();
    });
  });
});
