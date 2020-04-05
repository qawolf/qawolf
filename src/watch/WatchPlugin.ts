import { FSWatcher, watch } from 'chokidar';
import Debug from 'debug';
import { readFile } from 'fs-extra';
import { JestHookSubscriber } from 'jest-watcher';
import { WatchServer } from './WatchServer';

const debug = Debug('qawolf:WatchPlugin');

export class WatchPlugin {
  private _code: string;
  private _server: WatchServer;
  private _watcher: FSWatcher;

  constructor() {
    this._server = new WatchServer();

    this._server.on('codeupdate', (code) => {
      this._code = code;
    });
  }

  private async _setupTest(testPath: string) {
    debug('setup test %s', testPath);

    // Stop the previous test.
    this._server.sendStop();

    // Set the environment so the WatchClient can connect.
    await this._server.setEnv();

    // Jest watch will not re-run a test in progress.
    // To workaround this, we manually watch the test.
    // When it changes we stop it, which triggers Jest to re-run it.
    await this._watch(testPath);
  }

  private async _watch(testPath: string): Promise<void> {
    if (this._watcher) return;

    debug('watch %s', testPath);

    this._code = await readFile(testPath, 'utf8');

    this._watcher = watch(testPath, { atomic: 0 });

    this._watcher.on('change', async () => {
      const newCode = await readFile(testPath, 'utf8');
      if (newCode === this._code) return;

      debug('code changed');
      this._code = newCode;
      this._server.sendStop();
    });
  }

  public apply(hooks: JestHookSubscriber) {
    hooks.shouldRunTestSuite(async (suite) => {
      await this._setupTest(suite.testPath);
      return true;
    });
  }
}
