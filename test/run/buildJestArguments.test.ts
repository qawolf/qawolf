import { config } from '../fixtures/config';
import { buildJestArguments } from '../../src/run/buildJestArguments';

describe('buildJestArguments', () => {
  describe('args', () => {
    it('passes through args', () => {
      const args = ['--sup=yo', '--hello=there'];
      const builtArgs = buildJestArguments({ args, config });
      expect(builtArgs.slice(builtArgs.length - 2)).toEqual(args);
    });
  });

  describe('config', () => {
    it('wraps config.config in quotes for powershell', () => {
      expect(
        buildJestArguments({
          config: { ...config, config: 'custom.config.js' },
        }),
      ).toContain('--config="custom.config.js"');
    });

    it('passes through rootDir', () => {
      expect(
        buildJestArguments({
          config: {
            ...config,
            rootDir: 'myRootDir',
          },
        }),
      ).toContain('--rootDir=myRootDir');
    });

    it('passes through testTimeout', () => {
      expect(
        buildJestArguments({
          config: {
            ...config,
            testTimeout: 0,
          },
        }),
      ).toContain('--testTimeout=0');
    });

    it('does not pass testTimeout when it is provided via an arg', () => {
      const args = buildJestArguments({ args: ['--testTimeout=0'], config });
      const timeoutArgs = args.filter((a) =>
        a.toLowerCase().includes('timeout'),
      );
      expect(timeoutArgs).toEqual(['--testTimeout=0']);
    });
  });

  describe('testPath', () => {
    it('replaces forward slashes for powershell to work', () => {
      const args = buildJestArguments({
        config,
        testPath: 'C:\\Users\\jon\\Desktop\\qawolf\\.qawolf\\test.test.js',
      });
      expect(args).toContain(
        '"C:/Users/jon/Desktop/qawolf/.qawolf/test.test.js"',
      );
    });
  });
});
