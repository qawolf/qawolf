import chokidar from 'chokidar';
import { readFile } from 'fs-extra';
import { WatchPlugin } from '../../src/watch/WatchPlugin';

jest.mock('../../src/watch/WatchServer');

jest.mock('chokidar', () => ({
  watch: jest.fn(() => ({
    on: jest.fn(),
  })),
}));

jest.mock('fs-extra');

describe('WatchPlugin', () => {
  describe('prepare test', () => {
    let plugin: WatchPlugin;

    beforeAll(() => {
      plugin = new WatchPlugin();
      plugin._watch = jest.fn();
      plugin._prepareTest('test.js');
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

  it('stops when stopwatch is emitted', () => {
    const plugin = new WatchPlugin();

    const stop = jest.fn();
    plugin._stop = stop;

    plugin._server.emit('codeupdate', () => {
      expect(stop).toBeCalledTimes(1);
    });
  });

  describe('watch', () => {
    let plugin: WatchPlugin;

    const mockedReadFile = readFile as jest.Mock;

    beforeEach(() => {
      mockedReadFile.mockResolvedValue('initial');
      plugin = new WatchPlugin();
      plugin._watch('test.js');
    });

    it('stops the test when it changes', async () => {
      await plugin._onTestChange('test.js');
      expect(plugin._server.stopTest).toHaveBeenCalledTimes(0);

      mockedReadFile.mockResolvedValue('changed');
      await plugin._onTestChange('test.js');
      expect(plugin._server.stopTest).toHaveBeenCalledTimes(1);
    });

    it('watches the test for changes', () => {
      expect(chokidar.watch).toBeCalledWith('test.js', { atomic: 0 });
      expect(plugin._code).toEqual('initial');
      expect(plugin._watcher.on).toHaveBeenCalledTimes(1);
    });
  });
});
