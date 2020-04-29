import { FSWatcher, watch } from 'chokidar';
import Debug from 'debug';
import { readFile, writeFile } from 'fs-extra';
import { JestHookSubscriber } from 'jest-watcher';
import { WatchServer } from './WatchServer';

const debug = Debug('qawolf:WatchPlugin');

export class WatchPlugin {
  _code: string;
  _lastCodeUpdate: number = Date.now();
  _server: WatchServer;
  _watcher: FSWatcher;
  _watchPath: string;

  constructor() {
    this._server = new WatchServer();

    this._server.on('codeupdate', (code) => {
      this._lastCodeUpdate = Date.now();
      this._code = code;
    });

    this._server.on('stopwatch', () => this._stop());
  }

  async _beforeTest(testPath: string): Promise<void> {
    debug('before test %s', testPath);

    // Stop the previous test
    this._server.stopTest();

    // Set the environment so the WatchClient can connect.
    await this._server.setEnv(process.env);

    // Jest watch will not re-run a test in progress.
    // To workaround this, we watch the test for changes.
    // When it changes: stop the previous test and trigger the test.
    await this._watch(testPath);
  }

  async _onWatchChange(testPath: string): Promise<void> {
    const newCode = await readFile(testPath, 'utf8');
    if (newCode === this._code || Date.now() - this._lastCodeUpdate < 100) {
      debug('watch change: code did not change');
      return;
    }

    debug('watch change: code changed');
    this._code = newCode;
    await this._server.stopTest();

    // after the previous test is stopped, trigger jest to re-run the test
    this._triggerTest(testPath);
  }

  async _stop(): Promise<void> {
    debug('stop');
    await Promise.all([this._watcher.close(), this._server.stopTest()]);
    process.exit();
  }

  async _triggerTest(testPath: string): Promise<void> {
    debug('trigger test');
    this._code = await readFile(testPath, 'utf8');
    await writeFile(testPath, this._code, 'utf8');
  }

  async _watch(testPath: string): Promise<void> {
    if (this._watchPath === testPath) return;
    if (this._watcher) this._watcher.close();

    debug('watch %s', testPath);
    this._watchPath = testPath;

    this._watcher = watch(testPath, { atomic: 0 });

    this._code = await readFile(testPath, 'utf8');

    this._watcher.on('change', () => this._onWatchChange(testPath));
  }

  public apply(hooks: JestHookSubscriber): void {
    hooks.shouldRunTestSuite(async (suite) => {
      await this._beforeTest(suite.testPath);
      return true;
    });
  }
}
