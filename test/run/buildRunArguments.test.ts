import { Config } from '../../build/config';
import { buildRunArguments } from '../../src/run/buildRunArguments';

const config: Config = {
  attribute: '',
  rootDir: 'rootdir',
  testTimeout: 60000,
  useTypeScript: false,
};

describe('buildRunArguments builds correct arguments for', () => {
  test('node script', () => {
    expect(
      buildRunArguments({
        // make sure it detects a script in a test folder
        codePath: 'test/myscript.js',
        config,
      }),
    ).toEqual(['node', 'test/myscript.js']);
  });

  test('typescript script', () => {
    expect(
      buildRunArguments({
        codePath: 'myscript.ts',
        config: {
          ...config,
          useTypeScript: true,
        },
      }),
    ).toEqual(['ts-node', '-D', '6133', 'myscript.ts']);
  });

  test('test', () => {
    const expected = [
      'npx',
      'jest',
      '--reporters="@qawolf/jest-reporter"',
      '--rootDir=rootdir',
      '--testTimeout=3600000',
    ];

    expect(
      buildRunArguments({
        codePath: 'rootdir/my.spec.js',
        config,
      }),
    ).toEqual([...expected, 'rootdir/my.spec.js']);

    const args = buildRunArguments({
      codePath: 'rootdir/subfolder/my.test.js',
      config,
    });

    expect(args).toEqual([...expected, 'rootdir/subfolder/my.test.js']);
  });
});
