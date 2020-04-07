import { join, resolve } from 'path';
import { config as configFixture } from '../fixtures/config';
import { runTests } from '../../src/run/runTests';
import { getLaunchOptions } from '../../src/utils/launch';

const options = {
  browsers: [getLaunchOptions().browserName],
  config: {
    ...configFixture,
    rootDir: join(__dirname, '../.qawolf'),
  },
};

describe('runTests', () => {
  it('runs successful test for a relative path', () => {
    expect(() => runTests({ args: ['scroll'], ...options })).not.toThrow();
  });

  it('runs successful test for a test path', () => {
    expect(() =>
      runTests({
        ...options,
        testPath: resolve(join(options.config.rootDir, 'scroll.test.js')),
      }),
    ).not.toThrow();
  });

  it('throws error for failed test', () => {
    expect(() => runTests({ args: ['notATest'], ...options })).toThrow();
  });
});
