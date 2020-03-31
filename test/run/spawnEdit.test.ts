import { buildEditArguments } from '../../src/run/spawnEdit';
import { Config } from '../../build/config';

const config: Config = {
  attribute: '',
  rootDir: 'rootdir',
  testTimeout: 60000,
  useTypeScript: false,
};

describe('buildEditArguments', () => {
  test('node script', () => {
    expect(
      buildEditArguments({
        codePath: 'myscript.js',
        config,
      }),
    ).toEqual(['node', 'myscript.js']);
  });

  test('typescript script', () => {
    expect(
      buildEditArguments({
        codePath: 'myscript.ts',
        config: {
          ...config,
          useTypeScript: true,
        },
      }),
    ).toEqual(['ts-node', '-D=6133', 'myscript.ts']);
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
      buildEditArguments({
        codePath: 'my.spec.js',
        config,
      }),
    ).toEqual([...expected, 'my.spec.js']);

    expect(
      buildEditArguments({
        codePath: 'my.test.js',
        config,
      }),
    ).toEqual([...expected, 'my.test.js']);
  });
});
