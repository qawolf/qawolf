import { config } from '../fixtures/config';
import { buildEditOptions } from '../../src/run/buildEditOptions';

const options = buildEditOptions({
  args: ['--sup=yo', '--hello=there'],
  env: { MYVAR: 'custom-value' },
  config,
  testPath: '',
});

describe('buildEditOptions', () => {
  describe('args', () => {
    it('passes through args', () => {
      const args = options.args;
      expect(args.slice(args.length - 2)).toEqual([
        '--sup=yo',
        '--hello=there',
      ]);
    });

    it('prevents force exit', () => {
      expect(options.args).toContain('--detectOpenHandles');
    });

    it('times out after an hour', () => {
      expect(options.args).toContain('--testTimeout=3600000');
    });

    it('uses basic reporter for repl', () => {
      expect(options.args).toContain('--reporters="@qawolf/jest-reporter"');
    });
  });

  describe('env', () => {
    it('passes through env', () => {
      expect(options.env.MYVAR).toEqual('custom-value');
    });

    it('sets CI=true', () => {
      expect(options.env.CI).toEqual('true');
    });
  });

  it('is not headless', () => {
    expect(options.headless).toEqual(false);
  });

  it('uses chromium', () => {
    expect(options.browsers).toEqual(['chromium']);
  });
});
