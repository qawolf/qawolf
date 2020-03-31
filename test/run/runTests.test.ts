import { join, resolve } from 'path';
import { runTests } from '../../src/run/runTests';

const rootDir = join(__dirname, '../.qawolf');

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
