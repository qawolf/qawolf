import { buildArguments, runJest } from '../../src/cli/runJest';
import { join } from 'path';

const rootDir = join(__dirname, '../.qawolf');

describe('buildArguments', () => {
  describe('provided args', () => {
    it('passes them through', () => {
      const args = ['--sup=yo', '--hello=there'];
      const builtArgs = buildArguments({ args });
      expect(builtArgs.slice(builtArgs.length - 2)).toEqual(args);
    });
  });

  describe('config', () => {
    it('clears config when one is not provided', () => {
      const args = buildArguments({});
      expect(args).toContain('--config="{}"');
    });

    it('uses provided config', () => {
      const args = ['--config=something'];
      const builtArgs = buildArguments({ args });
      expect(builtArgs.filter(arg => arg.includes('--config'))).toEqual(args);
    });
  });

  describe('reporters', () => {
    it('uses basic reporter for repl', () => {
      const args = buildArguments({ repl: true });
      expect(args).toContain('--reporters="@qawolf/jest-reporter"');
    });
  });

  describe('testTimeout', () => {
    it('not set when one is provided', () => {
      const args = buildArguments({ args: ['--testTimeout=1000'] });
      const timeoutArgs = args.filter(a => a.toLowerCase().includes('timeout'));
      expect(timeoutArgs).toEqual(['--testTimeout=1000']);
    });

    it('set to 60s by default', () => {
      const args = buildArguments({});
      expect(args).toContain('--testTimeout=60000');
    });

    it('set to 1 hour for repl', () => {
      const args = buildArguments({ repl: true });
      expect(args).toContain('--testTimeout=3600000');
    });
  });

  describe('test path', () => {
    it('replaces forward slashes for powershell to work', () => {
      const args = buildArguments({
        testPath:
          'C:\\Users\\jon\\Desktop\\qawolf\\.qawolf\\tests\\test.test.js',
      });
      expect(args).toContain(
        '"C:/Users/jon/Desktop/qawolf/.qawolf/tests/test.test.js"',
      );
    });
  });
});

describe('runJest', () => {
  it('runs successful test', () => {
    expect(() =>
      runJest({ args: ['scroll'], browsers: ['chromium'], rootDir }),
    ).not.toThrow();
  });

  it('throws error for failed test', () => {
    expect(() =>
      runJest({ args: ['notATest'], browsers: ['chromium'] }),
    ).toThrow();
  });
});
