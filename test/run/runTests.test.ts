import { join, resolve } from 'path';
import { loadConfig } from '../../src/config';
import { runTests } from '../../src/run/runTests';
import { getLaunchOptions } from '../../src/utils/launch';

const options = {
  browsers: [getLaunchOptions().browserName],
  config: loadConfig(join(__dirname, '../../qawolf.config.js')),
  headless: true,
};

describe('runTests', () => {
  it('runs successful test for a test path', () => {
    expect(() =>
      runTests({
        ...options,
        testPath: resolve(join(options.config.rootDir, 'scroll.test.ts')),
      }),
    ).not.toThrow();
  });

  it('throws error for failed test', () => {
    expect(() => runTests({ args: ['notATest'], ...options })).toThrow();
  });
});
