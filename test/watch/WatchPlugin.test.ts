import chokidar from 'chokidar';
import { readFile, writeFile } from 'fs-extra';
import { WatchPlugin } from '../../src/watch/WatchPlugin';

jest.mock('../../src/watch/WatchServer');

jest.mock('chokidar', () => ({
  watch: jest.fn(() => ({
    close: jest.fn(),
    on: jest.fn(),
  })),
}));

jest.mock('fs-extra');

const mockedReadFile = readFile as jest.Mock;

describe('WatchPlugin', () => {
  describe('_beforeTest', () => {
    let plugin: WatchPlugin;

    beforeAll(() => {
      plugin = new WatchPlugin();
      plugin._watch = jest.fn();
      plugin._beforeTest('test.js');
    });

    it('stops the previous test', () => {
      expect(plugin._server.stopTest).toBeCalledTimes(1);
    });

    it('sets the environment for WatchClient', () => {
      expect(plugin._server.setEnv).toBeCalledTimes(1);
    });

    it('watches the test', () => {
      expect(plugin._watch).toBeCalledTimes(1);
      expect(plugin._watch).toBeCalledWith('test.js');
    });
  });

  describe('_onWatchChange', () => {
    it('stops and re-runs the test', async () => {
      mockedReadFile.mockResolvedValue('initial');

      const plugin = new WatchPlugin();
      plugin._code = 'initial';

      const triggerTest = jest.spyOn(plugin, '_triggerTest');

      // should ignore the call since no code has changed
      await plugin._onWatchChange('test.js');
      expect(plugin._server.stopTest).toHaveBeenCalledTimes(0);
      expect(triggerTest).toHaveBeenCalledTimes(0);

      // should ignore the call since 100ms has not passed from the code change
      mockedReadFile.mockResolvedValue('changed');
      await plugin._onWatchChange('test.js');
      expect(plugin._server.stopTest).toHaveBeenCalledTimes(0);
      expect(triggerTest).toHaveBeenCalledTimes(0);

      // should re-run the test since 100ms passed from the code change
      plugin._lastCodeUpdate -= 100;
      await plugin._onWatchChange('test.js');
      expect(plugin._server.stopTest).toHaveBeenCalledTimes(1);
      expect(triggerTest).toHaveBeenCalledTimes(1);
    });
  });

  describe('_stop', () => {
    it('stops the test, the watcher, and calls process.exit', async () => {
      const exit = jest.spyOn(process, 'exit').mockImplementation();

      const plugin = new WatchPlugin();
      plugin._watch('something.js');

      expect(plugin._server.stopTest).toHaveBeenCalledTimes(0);
      expect(plugin._watcher.close).toHaveBeenCalledTimes(0);

      await plugin._stop();

      expect(plugin._server.stopTest).toHaveBeenCalledTimes(1);
      expect(plugin._watcher.close).toHaveBeenCalledTimes(1);
      expect(exit).toBeCalledTimes(1);

      exit.mockRestore();
    });
  });

  describe('_triggerTest', () => {
    it('rewrites the existing code to trigger a re-run', async () => {
      const mockedWriteFile = writeFile as jest.Mock;
      mockedReadFile.mockResolvedValue('initial');
      mockedReadFile.mockClear();

      const plugin = new WatchPlugin();
      await plugin._triggerTest('test.js');

      expect(mockedReadFile).toHaveBeenCalledWith('test.js', 'utf8');
      expect(mockedWriteFile).toHaveBeenCalledWith(
        'test.js',
        'initial',
        'utf8',
      );
    });
  });

  describe('_watch', () => {
    let plugin: WatchPlugin;

    beforeEach(() => {
      plugin = new WatchPlugin();
      plugin._watch('test.js');
    });

    it('watches the test for changes', () => {
      expect(chokidar.watch).toBeCalledWith('test.js', { atomic: 0 });
      expect(plugin._code).toEqual('initial');
      expect(plugin._watcher.on).toHaveBeenCalledTimes(1);
    });
  });
});
