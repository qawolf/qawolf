import { join, resolve } from 'path';
import { buildJestArguments, runTests } from '../../src/run/runTests';

const rootDir = join(__dirname, '../.qawolf');

describe('buildJestArguments', () => {
  describe('provided args', () => {
    it('passes them through', () => {
      const args = ['--sup=yo', '--hello=there'];
      const builtArgs = buildJestArguments({ args });
      expect(builtArgs.slice(builtArgs.length - 2)).toEqual(args);
    });
  });

  describe('config', () => {
    it('uses config when specified', () => {
      expect(buildJestArguments({ config: '{}' })).toContain('--config="{}"');
    });

    it('does not use config if not specified', () => {
      const builtArgs = buildJestArguments({});
      expect(builtArgs.filter((arg) => arg.includes('--config'))).toEqual([]);
    });
  });

  describe('reporters', () => {
    it('uses basic reporter for repl', () => {
      const args = buildJestArguments({ repl: true });
      expect(args).toContain('--reporters="@qawolf/jest-reporter"');
    });
  });

  describe('testTimeout', () => {
    it('not set when one is provided', () => {
      const args = buildJestArguments({ args: ['--testTimeout=1000'] });
      const timeoutArgs = args.filter((a) =>
        a.toLowerCase().includes('timeout'),
      );
      expect(timeoutArgs).toEqual(['--testTimeout=1000']);
    });

    it('use provided testTimeout', () => {
      expect(buildJestArguments({ testTimeout: 10 })).toContain(
        '--testTimeout=10',
      );
    });

    it('set to 60s by default', () => {
      expect(buildJestArguments({})).toContain('--testTimeout=60000');
    });

    it('set to 1 hour for repl', () => {
      expect(buildJestArguments({ repl: true })).toContain(
        '--testTimeout=3600000',
      );
    });
  });

  describe('test path', () => {
    it('replaces forward slashes for powershell to work', () => {
      const args = buildJestArguments({
        testPath: 'C:\\Users\\jon\\Desktop\\qawolf\\.qawolf\\test.test.js',
      });
      expect(args).toContain(
        '"C:/Users/jon/Desktop/qawolf/.qawolf/test.test.js"',
      );
    });
  });
});

describe('runTests', () => {
  it('runs successful test for a relative path', () => {
    expect(() =>
      runTests({ args: ['scroll'], browsers: ['chromium'], rootDir }),
    ).not.toThrow();
  });

  it('runs successful test for a test path', () => {
    expect(() =>
      runTests({
        browsers: ['chromium'],
        rootDir,
        testPath: resolve(join(rootDir, 'scroll.test.js')),
      }),
    ).not.toThrow();
  });

  it('throws error for failed test', () => {
    expect(() =>
      runTests({ args: ['notATest'], browsers: ['chromium'] }),
    ).toThrow();
  });
});
